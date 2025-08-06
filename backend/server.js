const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow requests from frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
}));

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
app.get('/api/employees/:leaderId/team-members', (req, res) => {
    const leaderId = req.params.leaderId;
    
    // Load JSON data files
    const employees = readJSONFile(path.join(__dirname, 'data/employees.json'));
    const projects = readJSONFile(path.join(__dirname, 'data/projects.json'));
    const assignments = readJSONFile(path.join(__dirname, 'data/employee_projects.json'));
    
    if (!employees || !projects || !assignments) {
        return res.status(500).json({ error: 'Error loading data files' });
    }
    
    // Find projects led by the specified leader
    const leaderProjects = projects.projects.filter(project => project.leaderId === leaderId);
    
    // Find active assignments for those projects
    const teamMembers = [];
    
    leaderProjects.forEach(project => {
        const projectAssignments = assignments.assignments.filter(
            assignment => assignment.projectId === project.id && assignment.isActive
        );
        
        projectAssignments.forEach(assignment => {
            const employee = employees.employees.find(emp => emp.id === assignment.employeeId);
            if (employee) {
                teamMembers.push({
                    id: employee.id,
                    name: employee.name,
                    project: project.name,
                    role: employee.role
                });
            }
        });
    });
    
    res.json({ teamMembers });
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
