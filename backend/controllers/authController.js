const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { dbClient } = require('../config/database');

// =============================================================================
// AUTH CONTROLLER
// =============================================================================

// Register a new user (GP - Gerente de Projetos)
const register = async (req, res) => {
    try {
        const { name, email, password, projectId } = req.body;

        // Validate required fields
        if (!name || !email || !password || !projectId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Name, email, password and projectId are required'
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

        // Validate project exists
        const projectExistsQuery = 'SELECT id FROM hp_portfolio.projects WHERE id = $1';
        const projectExists = await dbClient.query(projectExistsQuery, [projectId]);
        
        if (projectExists.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid project',
                message: 'The specified project does not exist'
            });
        }

        // Check if user already exists
        const existingUserQuery = 'SELECT id FROM core.users WHERE email = $1';
        const existingUser = await dbClient.query(existingUserQuery, [email.toLowerCase()]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Email already exists',
                message: 'A user with this email address already exists'
            });
        }

        // Check if email already exists in employees table
        const existingEmployeeQuery = 'SELECT id FROM core.employees WHERE email = $1';
        const existingEmployee = await dbClient.query(existingEmployeeQuery, [email.toLowerCase()]);

        if (existingEmployee.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Email already exists',
                message: 'An employee with this email address already exists'
            });
        }

        // Start transaction
        await dbClient.query('BEGIN');

        try {
            // Hash password with 12 rounds
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert new user
            const insertUserQuery = `
                INSERT INTO core.users (email, password_hash, name, role, created_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING id, email, name, created_at
            `;
            
            const userResult = await dbClient.query(insertUserQuery, [
                email.toLowerCase(),
                hashedPassword,
                name,
                'user'
            ]);

            const newUser = userResult.rows[0];

            // Generate next employee ID
            const maxEmployeeIdQuery = `
                SELECT id FROM core.employees 
                WHERE id ~ '^EMP[0-9]+$' 
                ORDER BY CAST(SUBSTRING(id FROM 4) AS INTEGER) DESC 
                LIMIT 1
            `;
            const maxIdResult = await dbClient.query(maxEmployeeIdQuery);
            
            let nextEmployeeNumber = 1;
            if (maxIdResult.rows.length > 0) {
                const currentMaxId = maxIdResult.rows[0].id;
                const currentNumber = parseInt(currentMaxId.substring(3));
                nextEmployeeNumber = currentNumber + 1;
            }
            
            const employeeId = `EMP${nextEmployeeNumber.toString().padStart(3, '0')}`;

            // Insert new employee
            const insertEmployeeQuery = `
                INSERT INTO core.employees (id, name, email, role, company, user_id, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                RETURNING id, name, email, role, company, created_at
            `;
            
            const employeeResult = await dbClient.query(insertEmployeeQuery, [
                employeeId,
                name,
                email.toLowerCase(),
                'GP', // Gerente de Projetos
                'Atlantico', // Default company for GPs
                newUser.id
            ]);

            const newEmployee = employeeResult.rows[0];

            // Add as project manager
            const insertProjectManagerQuery = `
                INSERT INTO hp_portfolio.project_managers (project_id, employee_id, role, assigned_date, is_primary, created_at, updated_at)
                VALUES ($1, $2, $3, CURRENT_DATE, $4, NOW(), NOW())
                RETURNING id, project_id, employee_id, role, assigned_date
            `;
            
            const projectManagerResult = await dbClient.query(insertProjectManagerQuery, [
                projectId,
                employeeId,
                'Project Manager',
                false // is_primary - secondary manager
            ]);

            const projectManager = projectManagerResult.rows[0];

            // Commit transaction
            await dbClient.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'GP registered successfully',
                data: {
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        name: newUser.name,
                        createdAt: newUser.created_at
                    },
                    employee: {
                        id: newEmployee.id,
                        name: newEmployee.name,
                        email: newEmployee.email,
                        role: newEmployee.role,
                        company: newEmployee.company,
                        createdAt: newEmployee.created_at
                    },
                    projectManager: {
                        id: projectManager.id,
                        projectId: projectManager.project_id,
                        employeeId: projectManager.employee_id,
                        role: projectManager.role,
                        assignedDate: projectManager.assigned_date
                    }
                }
            });

        } catch (transactionError) {
            // Rollback transaction
            await dbClient.query('ROLLBACK');
            throw transactionError;
        }

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error during GP registration:', error);
        } else {
            console.error('Error during GP registration - check logs for details');
        }

        // Handle specific PostgreSQL errors
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                error: 'Duplicate data',
                message: 'A user or employee with this information already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to register GP'
        });
    }
};

// Authenticate user login
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

        // Find user by email
        const userQuery = 'SELECT id, email, password_hash FROM core.users WHERE email = $1';
        const userResult = await dbClient.query(userQuery, [email.toLowerCase()]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        const user = userResult.rows[0];

        // Compare password with hash
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Generate JWT token
        const tokenPayload = {
            userId: user.id,
            email: user.email
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email
                }
            }
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error during login:', error);
        } else {
            console.error('Authentication error occurred');
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to authenticate user'
        });
    }
};

module.exports = {
    register,
    login
};
