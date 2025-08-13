const { dbClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// =============================================================================
// MOVEMENT CONTROLLER - USING CONSOLIDATED MOVEMENTS TABLE
// =============================================================================

// Get consolidated movements data from the new movements table
const getMovements = async (req, res) => {
    try {
        // Simple query using only the movements table
        const query = `
            SELECT 
                m.id,
                m.employee_id, 
                e.name as employee_name, 
                p.name as project_name, 
                CASE 
                    WHEN m.movement_type = 'ENTRY' THEN m.start_date
                    WHEN m.movement_type = 'EXIT' THEN m.end_date
                END as movement_date,
                m.created_at as registration_date,
                CASE 
                    WHEN m.movement_type = 'ENTRY' THEN 'entrada'
                    WHEN m.movement_type = 'EXIT' THEN 'saida'
                END as type,
                m.role,
                m.movement_type
            FROM hp_portfolio.movements m 
            JOIN core.employees e ON m.employee_id = e.id
            JOIN hp_portfolio.projects p ON m.project_id = p.id
            ORDER BY 
                CASE 
                    WHEN m.movement_type = 'ENTRY' THEN m.start_date
                    WHEN m.movement_type = 'EXIT' THEN m.end_date
                END DESC
        `;
        const result = await dbClient.query(query);
        
        const movements = [];
        
        // Process query results
        result.rows.forEach(record => {
            const type = record.type; // 'entrada' or 'saida'
            let details = '';
            
            // Create details based on type
            if (type === 'saida') {
                details = `Saída - Projeto: ${record.project_name}`;
            } else {
                details = `${record.role || 'Funcionário'} - Projeto: ${record.project_name}`;
            }
            
            movements.push({
                type: type,
                movementDate: record.movement_date,
                registrationDate: record.registration_date,
                employeeName: record.employee_name || 'Funcionário não encontrado',
                details: details,
                // Manter compatibilidade com frontend atual
                date: record.movement_date
            });
        });
        
        res.json({
            success: true,
            data: movements
        });
    } catch (error) {
        console.error('Error fetching movements:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Error fetching movements data'
        });
    }
};

// Create new entry - Insert into movements table with type 'ENTRY'
const createEntry = async (req, res) => {
    try {
        const { 
            selectedEmployeeId, 
            employeeIdHP, 
            projectType, 
            complianceTraining, 
            billable, 
            role, 
            startDate 
        } = req.body;
        
        // Validate required fields for HP structure
        if (!selectedEmployeeId || !employeeIdHP || !projectType || !complianceTraining || !billable || !role || !startDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'selectedEmployeeId, employeeIdHP, projectType, complianceTraining, billable, role, and startDate are required'
            });
        }
        
        // Validate specific field values
        if (!['sim', 'nao'].includes(complianceTraining)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid complianceTraining value',
                message: 'complianceTraining must be "sim" or "nao"'
            });
        }
        
        if (!['sim', 'nao'].includes(billable)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid billable value',
                message: 'billable must be "sim" or "nao"'
            });
        }
        
        // Use existing project: Sistema ERP
        const projectId = '433debec-a09c-4de3-abfd-8eb1b9e50a70';
        
        // Convert boolean values for database storage
        const isBillable = billable === 'sim';

        // Insert into movements table with movement_type 'ENTRY'
        const movementQuery = `
            INSERT INTO hp_portfolio.movements (
                employee_id, 
                project_id, 
                movement_type, 
                role, 
                start_date, 
                allocation_percentage, 
                is_billable,
                hp_employee_id,
                project_type,
                compliance_training,
                billable
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const result = await dbClient.query(movementQuery, [
            selectedEmployeeId,
            projectId,
            'ENTRY',
            role,
            startDate,
            100, // Default allocation percentage
            isBillable,
            employeeIdHP,
            projectType,
            complianceTraining,
            billable
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Entry created successfully',
            data: {
                movement: result.rows[0],
                hpFields: {
                    employeeIdHP,
                    projectType,
                    complianceTraining,
                    billable
                }
            }
        });
        
    } catch (error) {
        console.error('Error creating entry:', error);
        
        // Handle specific PostgreSQL errors
        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({
                success: false,
                error: 'Invalid reference',
                message: 'Employee ID or Project ID does not exist'
            });
        }
        
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                error: 'Duplicate entry',
                message: 'Entry with this ID already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to create entry'
        });
    }
};

// Create new exit - Insert into movements table with type 'EXIT'
const createExit = async (req, res) => {
    try {
        const { employeeId, projectId, date, reason, exitDate } = req.body;
        
        // Validate required fields
        if (!employeeId || !projectId || !date || !reason || !exitDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'employeeId, projectId, date, reason, and exitDate are required'
            });
        }
        
        // Insert into movements table with movement_type 'EXIT'
        const movementQuery = `
            INSERT INTO hp_portfolio.movements (
                employee_id, 
                project_id, 
                movement_type, 
                end_date, 
                change_reason,
                allocation_percentage
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await dbClient.query(movementQuery, [
            employeeId,
            projectId,
            'EXIT',
            exitDate,
            reason,
            100 // Default allocation percentage
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
                success: false,
                error: 'Invalid reference',
                message: 'Employee ID or Project ID does not exist'
            });
        }
        
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                error: 'Duplicate exit',
                message: 'Exit with this ID already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to create exit'
        });
    }
};

module.exports = {
    getMovements,
    createEntry,
    createExit
};
