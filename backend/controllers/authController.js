const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { dbClient } = require('../config/database');

// =============================================================================
// AUTH CONTROLLER
// =============================================================================

// Register a new user
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

        // Hash password with 12 rounds
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const insertUserQuery = `
            INSERT INTO core.users (email, password_hash, created_at)
            VALUES ($1, $2, NOW())
            RETURNING id, email, created_at
        `;
        
        const result = await dbClient.query(insertUserQuery, [
            email.toLowerCase(),
            hashedPassword
        ]);

        const newUser = result.rows[0];

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: newUser.id,
                email: newUser.email,
                createdAt: newUser.created_at
            }
        });

    } catch (error) {
        console.error('Error during registration:', error);

        // Handle specific PostgreSQL errors
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                error: 'Email already exists',
                message: 'A user with this email address already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to register user'
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
        console.error('Error during login:', error);

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
