const express = require('express');
const { dbClient } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// =============================================================================
// EMPLOYEE ROUTES
// =============================================================================

// GET /api/employees/:leaderId/team-members - Get team members for a leader
router.get('/:leaderId/team-members', authenticateToken, async (req, res) => {
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
        
        res.json({
            success: true,
            data: { teamMembers }
        });
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Error loading team members data'
        });
    }
});

// GET /api/employees/:id/details - Get employee details with project information
router.get('/:id/details', authenticateToken, async (req, res) => {
    const employeeId = req.params.id;
    
    try {
        // Find the employee
        const employeeResult = await dbClient.query(
            'SELECT * FROM employees WHERE id = $1',
            [employeeId]
        );
        
        if (employeeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found',
                message: 'Employee with the specified ID does not exist'
            });
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
        
        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error fetching employee details:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Error loading employee details'
        });
    }
});

module.exports = router;
