const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

// Load environment variables from .env file if exists
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['PORT', 'NODE_ENV', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('💡 Please check your .env file or environment configuration');
    process.exit(1);
}

// Database configuration
const dbClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Database connection function
async function connectDatabase() {
    try {
        await dbClient.connect();
        console.log('🐘 Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

// Connect to database
connectDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS with environment variables for production readiness
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = process.env.CORS_ORIGIN 
            ? process.env.CORS_ORIGIN.split(',') 
            : ['http://localhost:3001'];
            
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// =============================================================================
// API ROUTES
// =============================================================================

// API route to get team members for a leader
app.get('/api/employees/:leaderId/team-members', async (req, res) => {
    const leaderId = req.params.leaderId;
    
    try {
        // Find projects led by the specified leader
        const projectsResult = await dbClient.query(
            'SELECT * FROM projects WHERE leader_id = $1',
            [leaderId]
        );
        
        const teamMembers = [];
        
        // For each project, find active assignments
        for (const project of projectsResult.rows) {
            const assignmentsResult = await dbClient.query(
                'SELECT ep.*, e.name, e.role FROM employee_projects ep JOIN employees e ON ep.employee_id = e.id WHERE ep.project_id = $1 AND ep.is_active = true',
                [project.id]
            );
            
            // Add team members to the result array
            assignmentsResult.rows.forEach(assignment => {
                teamMembers.push({
                    id: assignment.employee_id,
                    name: assignment.name,
                    project: project.name,
                    role: assignment.role
                });
            });
        }
        
        res.json({ teamMembers });
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: 'Error loading data' });
    }
});

// API route to get employee details with project information
app.get('/api/employees/:id/details', async (req, res) => {
    const employeeId = req.params.id;
    
    try {
        // Find the employee
        const employeeResult = await dbClient.query(
            'SELECT * FROM employees WHERE id = $1',
            [employeeId]
        );
        
        if (employeeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        const employee = employeeResult.rows[0];
        
        // Find the employee's active project
        const projectResult = await dbClient.query(
            'SELECT p.* FROM employee_projects ep JOIN projects p ON ep.project_id = p.id WHERE ep.employee_id = $1 AND ep.is_active = true LIMIT 1',
            [employeeId]
        );
        
        // Prepare response
        const response = {
            employee: {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                company: employee.company
            }
        };
        
        if (projectResult.rows.length > 0) {
            const project = projectResult.rows[0];
            response.project = {
                name: project.name,
                type: project.type,
                sow: project.sow
            };
        } else {
            response.project = {
                name: "Não atribuído",
                type: "N/A",
                sow: "N/A"
            };
        }
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching employee details:', error);
        res.status(500).json({ error: 'Error loading data' });
    }
});

// API route to get consolidated movements data
app.get('/api/movements', async (req, res) => {
    try {
        const movements = [];
        
        // Query entries with JOINs
        const entriesQuery = `
            SELECT e.*, emp.name as employee_name, p.name as project_name 
            FROM entries e 
            LEFT JOIN employees emp ON e.employee_id = emp.id 
            LEFT JOIN projects p ON e.project_id = p.id
        `;
        const entriesResult = await dbClient.query(entriesQuery);
        
        // Query exits with JOINs
        const exitsQuery = `
            SELECT ex.*, emp.name as employee_name, p.name as project_name 
            FROM exits ex 
            LEFT JOIN employees emp ON ex.employee_id = emp.id 
            LEFT JOIN projects p ON ex.project_id = p.id
        `;
        const exitsResult = await dbClient.query(exitsQuery);
        
        // Process entries
        entriesResult.rows.forEach(entry => {
            let details = 'Entrada';
            
            if (entry.project_id && entry.project_name) {
                details = `Entrada como ${entry.role || 'Funcionário'} no Projeto ${entry.project_name}`;
            } else {
                details = `Entrada como ${entry.role || 'Funcionário'} - Não atribuído`;
            }
            
            movements.push({
                type: 'entrada',
                date: entry.date || entry.start_date,
                employeeName: entry.employee_name || 'Funcionário não encontrado',
                details: details
            });
        });
        
        // Process exits
        exitsResult.rows.forEach(exit => {
            let details = 'Saída';
            
            if (exit.project_id && exit.project_name) {
                details = `Saída por ${exit.reason || 'Motivo não especificado'} do Projeto ${exit.project_name}`;
            } else {
                details = `Saída por ${exit.reason || 'Motivo não especificado'} - Não atribuído`;
            }
            
            movements.push({
                type: 'saida',
                date: exit.date || exit.exit_date,
                employeeName: exit.employee_name || 'Funcionário não encontrado',
                details: details
            });
        });
        
        // Sort movements chronologically (oldest to newest)
        movements.sort((a, b) => {
            const dateA = new Date(a.date || '1970-01-01');
            const dateB = new Date(b.date || '1970-01-01');
            return dateA - dateB;
        });
        
        res.json(movements);
    } catch (error) {
        console.error('Error fetching movements:', error);
        res.status(500).json({ error: 'Error fetching movements data' });
    }
});

// POST /api/entries - Create new entry
app.post('/api/entries', async (req, res) => {
    try {
        const { employeeId, projectId, date, role, startDate } = req.body;
        
        // Validate required fields
        if (!employeeId || !projectId || !date || !role || !startDate) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                message: 'employeeId, projectId, date, role, and startDate are required'
            });
        }
        
        // Generate unique ID in format ENTRY{timestamp}
        const entryId = `ENTRY${Date.now()}`;
        
        // Insert into entries table
        const insertQuery = `
            INSERT INTO entries (id, employee_id, project_id, date, role, start_date)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await dbClient.query(insertQuery, [
            entryId,
            employeeId,
            projectId,
            date,
            role,
            startDate
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Entry created successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error creating entry:', error);
        
        // Handle specific PostgreSQL errors
        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({ 
                error: 'Invalid reference',
                message: 'Employee ID or Project ID does not exist'
            });
        }
        
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ 
                error: 'Duplicate entry',
                message: 'Entry with this ID already exists'
            });
        }
        
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to create entry'
        });
    }
});

// POST /api/exits - Create new exit
app.post('/api/exits', async (req, res) => {
    try {
        const { employeeId, projectId, date, reason, exitDate } = req.body;
        
        // Validate required fields
        if (!employeeId || !projectId || !date || !reason || !exitDate) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                message: 'employeeId, projectId, date, reason, and exitDate are required'
            });
        }
        
        // Generate unique ID in format EXIT{timestamp}
        const exitId = `EXIT${Date.now()}`;
        
        // Insert into exits table
        const insertQuery = `
            INSERT INTO exits (id, employee_id, project_id, date, reason, exit_date)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await dbClient.query(insertQuery, [
            exitId,
            employeeId,
            projectId,
            date,
            reason,
            exitDate
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Exit created successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error creating exit:', error);
        
        // Handle specific PostgreSQL errors
        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({ 
                error: 'Invalid reference',
                message: 'Employee ID or Project ID does not exist'
            });
        }
        
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ 
                error: 'Duplicate exit',
                message: 'Exit with this ID already exists'
            });
        }
        
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to create exit'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// =============================================================================
// MIDDLEWARE FOR NON-API ROUTES
// =============================================================================
// Reject any request that is not an API route
// This ensures backend serves ONLY APIs and no static files
app.use('*', (req, res) => {
    if (!req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ 
            error: 'Not Found',
            message: 'This backend server only provides API endpoints. All API routes start with /api/',
            availableEndpoints: [
                'GET /api/health',
                'GET /api/employees/:leaderId/team-members',
                'POST /api/entries',
                'POST /api/exits',
                'GET /api/movements'
            ]
        });
    }
    
    // If we reach here, it's an API route that wasn't matched above
    res.status(404).json({
        error: 'API Endpoint Not Found',
        message: `API endpoint ${req.originalUrl} not found`
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔒 Backend serves ONLY API endpoints starting with /api/`);
    console.log(`🌐 CORS configured for: ${process.env.CORS_ORIGIN || 'http://localhost:3001'}`);
    
    // Log loaded configuration (without sensitive values)
    console.log('\n📋 Configuration loaded:');
    console.log(`   • Environment: ${process.env.NODE_ENV}`);
    console.log(`   • Port: ${PORT}`);
    console.log(`   • Data Path: ${process.env.DATA_PATH || './data'}`);
    console.log(`   • Debug Mode: ${process.env.DEBUG === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   • Health Check: ${process.env.HEALTH_CHECK_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   • Log Level: ${process.env.LOG_LEVEL || 'info'}`);
});
