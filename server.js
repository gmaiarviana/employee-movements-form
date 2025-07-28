const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

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

// Serve static files from src/public
app.use(express.static(path.join(__dirname, 'src/public')));

// Route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/public/index.html'));
});

// API route to get team members for a leader
app.get('/api/employees/:leaderId/team-members', (req, res) => {
    const leaderId = req.params.leaderId;
    
    // Load JSON data files
    const employees = readJSONFile(path.join(__dirname, 'src/data/employees.json'));
    const projects = readJSONFile(path.join(__dirname, 'src/data/projects.json'));
    const assignments = readJSONFile(path.join(__dirname, 'src/data/employee_projects.json'));
    
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
