const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// Helper function to read JSON files
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}

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
app.get('/api/employees/:id/details', (req, res) => {
    const employeeId = req.params.id;
    
    // Load JSON data files
    const employees = readJSONFile(path.join(__dirname, 'data/employees.json'));
    const projects = readJSONFile(path.join(__dirname, 'data/projects.json'));
    const assignments = readJSONFile(path.join(__dirname, 'data/employee_projects.json'));
    
    if (!employees || !projects || !assignments) {
        return res.status(500).json({ error: 'Error loading data files' });
    }
    
    // Find the employee
    const employee = employees.employees.find(emp => emp.id === employeeId);
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Find the employee's active project assignment
    const assignment = assignments.assignments.find(
        assignment => assignment.employeeId === employeeId && assignment.isActive
    );
    
    let project = null;
    if (assignment) {
        project = projects.projects.find(proj => proj.id === assignment.projectId);
    }
    
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
    
    if (project) {
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
});

// API route to get consolidated movements data
app.get('/api/movements', (req, res) => {
    // Load JSON data files
    const employees = readJSONFile(path.join(__dirname, 'data/employees.json'));
    const projects = readJSONFile(path.join(__dirname, 'data/projects.json'));
    const entries = readJSONFile(path.join(__dirname, 'data/entries.json'));
    const exits = readJSONFile(path.join(__dirname, 'data/exits.json'));
    
    if (!employees || !projects || !entries || !exits) {
        return res.status(500).json({ error: 'Error loading data files' });
    }
    
    const movements = [];
    
    // Process entries
    if (entries.length > 0) {
        entries.forEach(entry => {
            const employee = employees.employees.find(emp => emp.id === entry.employeeId);
            let project = null;
            let details = 'Entrada';
            
            if (entry.projectId) {
                project = projects.projects.find(proj => proj.id === entry.projectId);
                details = project 
                    ? `Entrada como ${entry.role || employee?.role || 'Funcionário'} no Projeto ${project.name}`
                    : `Entrada como ${entry.role || employee?.role || 'Funcionário'} - Projeto Não Encontrado`;
            } else {
                details = `Entrada como ${entry.role || employee?.role || 'Funcionário'} - Não atribuído`;
            }
            
            movements.push({
                type: 'entrada',
                date: entry.date || entry.startDate,
                employeeName: employee ? employee.name : 'Funcionário não encontrado',
                details: details
            });
        });
    }
    
    // Process exits
    if (exits.length > 0) {
        exits.forEach(exit => {
            const employee = employees.employees.find(emp => emp.id === exit.employeeId);
            let project = null;
            let details = 'Saída';
            
            if (exit.projectId) {
                project = projects.projects.find(proj => proj.id === exit.projectId);
                details = project 
                    ? `Saída por ${exit.reason || 'Motivo não especificado'} do Projeto ${project.name}`
                    : `Saída por ${exit.reason || 'Motivo não especificado'} - Projeto Não Encontrado`;
            } else {
                details = `Saída por ${exit.reason || 'Motivo não especificado'} - Não atribuído`;
            }
            
            movements.push({
                type: 'saida',
                date: exit.date || exit.exitDate,
                employeeName: employee ? employee.name : 'Funcionário não encontrado',
                details: details
            });
        });
    }
    
    // Sort movements chronologically (oldest to newest)
    movements.sort((a, b) => {
        const dateA = new Date(a.date || '1970-01-01');
        const dateB = new Date(b.date || '1970-01-01');
        return dateA - dateB;
    });
    
    res.json(movements);
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
