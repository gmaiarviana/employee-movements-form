const { dbClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// =============================================================================
// MOVEMENT CONTROLLER
// =============================================================================

// Get consolidated movements data
const getMovements = async (req, res) => {
    try {
        // UNION query to show both entries (current_allocations) and exits (allocation_history)
        const query = `
            (SELECT 
                ca.employee_id, 
                e.name as employee_name, 
                p.name as project_name, 
                ca.start_date as movement_date, 
                ca.created_at as registration_date,
                'entrada' as type, 
                ca.role
             FROM hp_portfolio.current_allocations ca 
             JOIN core.employees e ON ca.employee_id = e.id
             JOIN hp_portfolio.projects p ON ca.project_id = p.id)
            UNION
            (SELECT 
                ah.employee_id, 
                e.name as employee_name, 
                p.name as project_name,
                ah.end_date as movement_date, 
                ah.created_at as registration_date,
                'saida' as type, 
                ah.role  
             FROM hp_portfolio.allocation_history ah
             JOIN core.employees e ON ah.employee_id = e.id
             JOIN hp_portfolio.projects p ON ah.project_id = p.id
             WHERE ah.end_date IS NOT NULL)
            ORDER BY movement_date DESC
        `;
        const result = await dbClient.query(query);
        
        const movements = [];
        
        // Process UNION query results
        result.rows.forEach(record => {
            const type = record.type; // Already defined in query as 'entrada' or 'saida'
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
                registrationDate: record.registration_date, // Using registration_date from created_at
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

// Create new entry
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

        // Start a transaction
        await dbClient.query('BEGIN');

        try {
            // Insert into current_allocations only (entries are active allocations)
            const currentAllocationQuery = `
                INSERT INTO hp_portfolio.current_allocations (
                    employee_id, project_id, role, start_date, allocation_percentage, is_billable
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;

            const currentResult = await dbClient.query(currentAllocationQuery, [
                selectedEmployeeId,
                projectId,
                role,
                startDate,
                100, // Default allocation percentage
                isBillable
            ]);

            // Commit the transaction
            await dbClient.query('COMMIT');
            
            res.status(201).json({
                success: true,
                message: 'Entry created successfully',
                data: {
                    currentAllocation: currentResult.rows[0],
                    hpFields: {
                        employeeIdHP,
                        projectType,
                        complianceTraining,
                        billable
                    }
                }
            });
            
        } catch (error) {
            // Rollback the transaction on error
            await dbClient.query('ROLLBACK');
            throw error;
        }
        
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

// Create new exit
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
        
        // Generate UUID for the history record
        const historyId = uuidv4();
        
        // Start a transaction
        await dbClient.query('BEGIN');
        
        try {
            // Update current_allocations to set end_date
            const updateCurrentQuery = `
                UPDATE hp_portfolio.current_allocations 
                SET end_date = $1
                WHERE employee_id = $2 AND project_id = $3 AND end_date IS NULL
                RETURNING *
            `;
            
            const updateResult = await dbClient.query(updateCurrentQuery, [
                exitDate,
                employeeId,
                projectId
            ]);
            
            // Check if any allocation was updated
            if (updateResult.rows.length === 0) {
                await dbClient.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    error: 'No active allocation found',
                    message: 'No active allocation found for this employee and project'
                });
            }
            
            // Insert into allocation_history
            const historyQuery = `
                INSERT INTO hp_portfolio.allocation_history (
                    employee_id, project_id, end_date, change_reason, role, allocation_percentage
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            
            const historyResult = await dbClient.query(historyQuery, [
                employeeId,
                projectId,
                exitDate,
                reason,
                updateResult.rows[0].role, // Use role from current allocation
                updateResult.rows[0].allocation_percentage || 100 // Use existing percentage
            ]);
            
            // Commit the transaction
            await dbClient.query('COMMIT');
            
            res.status(201).json({
                success: true,
                message: 'Exit created successfully',
                data: historyResult.rows[0]
            });
            
        } catch (error) {
            // Rollback the transaction on error
            await dbClient.query('ROLLBACK');
            throw error;
        }
        
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
