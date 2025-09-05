const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { dbClient } = require('../config/database');

// =============================================================================
// AUTH CONTROLLER - VERSÃO SIMPLIFICADA
// =============================================================================

// Register: Criar credenciais de login para funcionário existente
const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Email and password are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
                message: 'Please provide a valid email address'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Weak password',
                message: 'Password must be at least 6 characters long'
            });
        }

        // Verificar se funcionário existe em hp_portfolio.employees
        const employeeQuery = 'SELECT matricula_ia, nome, email_ia FROM hp_portfolio.employees WHERE email_ia = $1';
        const employeeResult = await dbClient.query(employeeQuery, [email.toLowerCase()]);
        
        if (employeeResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Employee not found',
                message: 'Funcionário não encontrado. Apenas funcionários cadastrados podem criar credenciais.'
            });
        }

        // Verificar se já tem credenciais
        const existingUserQuery = 'SELECT id FROM core.users WHERE email = $1';
        const existingUser = await dbClient.query(existingUserQuery, [email.toLowerCase()]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Email already exists',
                message: 'Já existem credenciais para este email'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user credentials
        const insertUserQuery = `
            INSERT INTO core.users (email, password_hash, created_at)
            VALUES ($1, $2, NOW())
            RETURNING id, email, created_at
        `;
        
        const userResult = await dbClient.query(insertUserQuery, [
            email.toLowerCase(),
            hashedPassword
        ]);

        const newUser = userResult.rows[0];

        res.status(201).json({
            success: true,
            message: 'Credenciais criadas com sucesso',
            user: {
                id: newUser.id,
                email: newUser.email,
                created_at: newUser.created_at
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred during registration'
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Email and password are required'
            });
        }

        // Find user credentials
        const userQuery = 'SELECT id, email, password_hash FROM core.users WHERE email = $1';
        const userResult = await dbClient.query(userQuery, [email.toLowerCase()]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                message: 'Email ou senha incorretos'
            });
        }

        const user = userResult.rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                message: 'Email ou senha incorretos'
            });
        }

        // Get employee data from hp_portfolio
        const employeeQuery = `
            SELECT matricula_ia, nome, email_ia, perfil, is_manager, projeto, gerente 
            FROM hp_portfolio.employees 
            WHERE email_ia = $1
        `;
        const employeeResult = await dbClient.query(employeeQuery, [email.toLowerCase()]);

        if (employeeResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Employee not found',
                message: 'Dados do funcionário não encontrados'
            });
        }

        const employee = employeeResult.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                employeeId: employee.matricula_ia,
                isManager: employee.is_manager || false
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                email: user.email,
                employee: {
                    id: employee.matricula_ia,
                    name: employee.nome,
                    perfil: employee.perfil,
                    projeto: employee.projeto,
                    gerente: employee.gerente,
                    isManager: employee.is_manager || false
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred during login'
        });
    }
};

// Verify token middleware (opcional, para validação de rotas protegidas)
const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied',
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token',
            message: 'Token is not valid'
        });
    }
};

module.exports = {
    register,
    login,
    verifyToken
};
