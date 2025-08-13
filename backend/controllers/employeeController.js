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
        
        // Get project assignments for each employee using movements table
        for (let employee of employees) {
            const projectResult = await dbClient.query(`
                SELECT p.name FROM hp_portfolio.movements m 
                JOIN hp_portfolio.projects p ON m.project_id = p.id 
                WHERE m.employee_id = $1 
                  AND m.movement_type = 'ENTRY' 
                  AND NOT EXISTS (
                    SELECT 1 FROM hp_portfolio.movements m2 
                    WHERE m2.employee_id = m.employee_id 
                    AND m2.project_id = m.project_id 
                    AND m2.movement_type = 'EXIT' 
                    AND m2.created_at > m.created_at
                  ) 
                LIMIT 1
            `, [employee.id]);
            
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
    try {
        // Get user ID from JWT token
        const userId = req.user.userId;
        
        // 1. Find employee_id of the logged in user
        const managerResult = await dbClient.query(
            'SELECT id FROM core.employees WHERE user_id = $1',
            [userId]
        );
        
        if (managerResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Manager not found',
                message: 'No employee record found for the logged in user'
            });
        }
        
        const managerId = managerResult.rows[0].id;
        
        // 2. Find projects managed by this employee
        const projectsResult = await dbClient.query(
            'SELECT project_id FROM hp_portfolio.project_managers WHERE employee_id = $1',
            [managerId]
        );
        
        if (projectsResult.rows.length === 0) {
            return res.json({
                success: true,
                data: { teamMembers: [] }
            });
        }
        
        const projectIds = projectsResult.rows.map(row => row.project_id);
        
        // 3. Find active employees in these projects (ENTRY without EXIT)
        const teamMembersQuery = `
            SELECT DISTINCT 
                e.id, 
                e.name, 
                e.role, 
                e.company,
                p.name as project_name,
                m.role as current_role,
                m.start_date
            FROM core.employees e
            JOIN hp_portfolio.movements m ON e.id = m.employee_id
            JOIN hp_portfolio.projects p ON m.project_id = p.id
            WHERE m.project_id = ANY($1)
            AND m.movement_type = 'ENTRY'
            AND e.id NOT IN (
                -- Excluir gestores (que estão em project_managers)
                SELECT employee_id FROM hp_portfolio.project_managers
            )
            AND NOT EXISTS (
                SELECT 1 FROM hp_portfolio.movements m2 
                WHERE m2.employee_id = m.employee_id 
                AND m2.project_id = m.project_id 
                AND m2.movement_type = 'EXIT' 
                AND m2.created_at > m.created_at
            )
            ORDER BY e.name
        `;
        
        const teamMembersResult = await dbClient.query(teamMembersQuery, [projectIds]);
        
        const teamMembers = teamMembersResult.rows.map(member => ({
            id: member.id,
            name: member.name,
            role: member.role,
            company: member.company,
            project: member.project_name,
            currentRole: member.current_role,
            startDate: member.start_date
        }));
        
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
        
        // Find the employee's active project using movements table
        const projectResult = await dbClient.query(`
            SELECT p.* FROM hp_portfolio.movements m 
            JOIN hp_portfolio.projects p ON m.project_id = p.id 
            WHERE m.employee_id = $1 
              AND m.movement_type = 'ENTRY' 
              AND NOT EXISTS (
                SELECT 1 FROM hp_portfolio.movements m2 
                WHERE m2.employee_id = m.employee_id 
                AND m2.project_id = m.project_id 
                AND m2.movement_type = 'EXIT' 
                AND m2.created_at > m.created_at
              ) 
            LIMIT 1
        `, [employeeId]);
        
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
