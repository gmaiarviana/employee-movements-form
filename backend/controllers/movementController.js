const { dbClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// =============================================================================
// MOVEMENT CONTROLLER
// =============================================================================

// Get consolidated movements data
const getMovements = async (req, res) => {
    try {
        // Query the consolidated view with all HP portfolio fields
        const query = `
            SELECT 
                employee_name,
                project_name,
                movement_date,
                allocation_role,
                change_reason,
                hp_employee_id,
                project_type,
                compliance_training,
                billable
            FROM hp_portfolio.employee_movements_consolidated
            ORDER BY movement_date DESC
        `;
        const result = await dbClient.query(query);
        
        const movements = [];
        
        // Process consolidated view records - simplified logic
        result.rows.forEach(record => {
            let type = 'entrada'; // Default type
            let details = '';
            
            // Simple determination based on change_reason
            if (record.change_reason && 
                (record.change_reason.toLowerCase().includes('saída') || 
                 record.change_reason.toLowerCase().includes('desligamento') ||
                 record.change_reason.toLowerCase().includes('transferência'))) {
                type = 'saida';
                details = `${record.change_reason} - Projeto: ${record.project_name}`;
            } else {
                details = `${record.allocation_role || 'Funcionário'} - Projeto: ${record.project_name}`;
            }
            
            movements.push({
                type: type,
                movementDate: record.movement_date,
                registrationDate: record.movement_date, // Using movement_date for compatibility
                employeeName: record.employee_name || 'Funcionário não encontrado',
                details: details,
                // New HP portfolio fields
                hpEmployeeId: record.hp_employee_id,
                projectType: record.project_type,
                complianceTraining: record.compliance_training,
                billable: record.billable,
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
        const { employeeId, projectId, date, role, startDate } = req.body;
        
        // Validate required fields
        if (!employeeId || !projectId || !date || !role || !startDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'employeeId, projectId, date, role, and startDate are required'
            });
        }
        
        // Generate UUID for the history record (if needed)
        const historyId = uuidv4();
        
        // Start a transaction
        await dbClient.query('BEGIN');
        
        try {
            // Insert into current_allocations
            const currentAllocationQuery = `
                INSERT INTO hp_portfolio.current_allocations (
                    employee_id, project_id, role, start_date, allocation_percentage, is_billable
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            
            const currentResult = await dbClient.query(currentAllocationQuery, [
                employeeId,
                projectId,
                role,
                startDate,
                100, // Default allocation percentage
                true  // Default is_billable
            ]);
            
            // Insert into allocation_history
            const historyQuery = `
                INSERT INTO hp_portfolio.allocation_history (
                    employee_id, project_id, start_date, change_reason, role, allocation_percentage
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            
            const historyResult = await dbClient.query(historyQuery, [
                employeeId,
                projectId,
                startDate,
                'Entrada no projeto',
                role,
                100 // Default allocation percentage
            ]);
            
            // Commit the transaction
            await dbClient.query('COMMIT');
            
            res.status(201).json({
                success: true,
                message: 'Entry created successfully',
                data: currentResult.rows[0]
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
