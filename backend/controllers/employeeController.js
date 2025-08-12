const { dbClient } = require('../config/database');

// =============================================================================
// EMPLOYEE CONTROLLER
// =============================================================================

// Get all employees for admin/manager
const getAllEmployees = async (req, res) => {
    try {
        // Get all active employees
        const employeesResult = await dbClient.query(
            'SELECT id, name, role, company FROM core.employees ORDER BY name'
        );
        
        const employees = employeesResult.rows.map(emp => ({
            id: emp.id,
            name: emp.name,
            role: emp.role,
            company: emp.company,
            project: 'N/A' // Default, will be updated if they have active allocation
        }));
        
        // Get project assignments for each employee
        for (let employee of employees) {
            const projectResult = await dbClient.query(
                'SELECT p.name FROM hp_portfolio.current_allocations ca JOIN hp_portfolio.projects p ON ca.project_id = p.id WHERE ca.employee_id = $1 AND ca.end_date IS NULL LIMIT 1',
                [employee.id]
            );
            
            if (projectResult.rows.length > 0) {
                employee.project = projectResult.rows[0].name;
            }
        }
        
        res.json({
            success: true,
            data: { teamMembers: employees }
        });
    } catch (error) {
        console.error('Error fetching all employees:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Error loading employees data'
        });
    }
};

// Get team members for a leader
const getTeamMembers = async (req, res) => {
    const leaderId = req.params.leaderId;
    
    try {
        // Find projects led by the specified leader
        const projectsResult = await dbClient.query(
            'SELECT p.* FROM hp_portfolio.projects p JOIN hp_portfolio.project_managers pm ON p.id = pm.project_id WHERE pm.employee_id = $1',
            [leaderId]
        );
        
        const teamMembers = [];
        
        // For each project, find active assignments
        for (const project of projectsResult.rows) {
            const assignmentsResult = await dbClient.query(
                'SELECT ca.*, e.name, e.role FROM hp_portfolio.current_allocations ca JOIN core.employees e ON ca.employee_id = e.id WHERE ca.project_id = $1 AND ca.end_date IS NULL',
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
};

// Get employee details with project information
const getEmployeeDetails = async (req, res) => {
    const employeeId = req.params.id;
    
    try {
        // Find the employee
        const employeeResult = await dbClient.query(
            'SELECT * FROM core.employees WHERE id = $1',
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
            'SELECT p.* FROM hp_portfolio.current_allocations ca JOIN hp_portfolio.projects p ON ca.project_id = p.id WHERE ca.employee_id = $1 AND ca.end_date IS NULL LIMIT 1',
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
                type: project.description || "N/A", // Using description instead of type
                sow: project.status || "N/A" // Using status instead of sow
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
};

// Create new employee
const createEmployee = async (req, res) => {
    try {
        const { id, name, email, role, company } = req.body;
        
        // Validate required fields
        if (!id || !name || !email || !role || !company) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'id, name, email, role, and company are required'
            });
        }
        
        // Check if employee ID already exists
        const existingEmployee = await dbClient.query(
            'SELECT id FROM core.employees WHERE id = $1',
            [id]
        );
        
        if (existingEmployee.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Employee already exists',
                message: 'Employee with this ID already exists'
            });
        }
        
        // Check if email already exists
        const existingEmail = await dbClient.query(
            'SELECT id FROM core.employees WHERE email = $1',
            [email]
        );
        
        if (existingEmail.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Email already exists',
                message: 'Employee with this email already exists'
            });
        }
        
        // Insert new employee
        const insertQuery = `
            INSERT INTO core.employees (id, name, email, role, company)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const result = await dbClient.query(insertQuery, [
            id,
            name,
            email,
            role,
            company
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error creating employee:', error);
        
        // Handle specific PostgreSQL errors
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                error: 'Duplicate value',
                message: 'Employee ID or email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to create employee'
        });
    }
};

module.exports = {
    getAllEmployees,
    getTeamMembers,
    getEmployeeDetails,
    createEmployee
};
