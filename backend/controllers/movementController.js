const { dbClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// =============================================================================
// MOVEMENT CONTROLLER
// =============================================================================

// Get consolidated movements data
const getMovements = async (req, res) => {
    try {
        // Query allocation history with JOINs to employees and projects
        const query = `
            SELECT ah.*, e.name as employee_name, p.name as project_name 
            FROM allocations.allocation_history ah 
            LEFT JOIN core.employees e ON ah.employee_id = e.id 
            LEFT JOIN projects.projects p ON ah.project_id = p.id
            ORDER BY ah.movement_date ASC
        `;
        const result = await dbClient.query(query);
        
        const movements = [];
        
        // Process allocation history records
        result.rows.forEach(record => {
            let details = '';
            let type = '';
            
            if (record.movement_type === 'entry') {
                type = 'entrada';
                if (record.project_id && record.project_name) {
                    details = `Entrada como ${record.role || 'Funcionário'} no Projeto ${record.project_name}`;
                } else {
                    details = `Entrada como ${record.role || 'Funcionário'} - Não atribuído`;
                }
            } else if (record.movement_type === 'exit') {
                type = 'saida';
                if (record.project_id && record.project_name) {
                    details = `Saída por ${record.reason || 'Motivo não especificado'} do Projeto ${record.project_name}`;
                } else {
                    details = `Saída por ${record.reason || 'Motivo não especificado'} - Não atribuído`;
                }
            }
            
            movements.push({
                type: type,
                date: record.date || record.start_date || record.exit_date,
                employeeName: record.employee_name || 'Funcionário não encontrado',
                details: details
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
        
        // Generate UUIDs for the new records
        const allocationId = uuidv4();
        const historyId = uuidv4();
        
        // Start a transaction
        await dbClient.query('BEGIN');
        
        try {
            // Insert into current_allocations
            const currentAllocationQuery = `
                INSERT INTO allocations.current_allocations (
                    id, employee_id, project_id, role, start_date, is_active
                )
                VALUES ($1, $2, $3, $4, $5, true)
                RETURNING *
            `;
            
            await dbClient.query(currentAllocationQuery, [
                allocationId,
                employeeId,
                projectId,
                role,
                startDate
            ]);
            
            // Insert into allocation_history
            const historyQuery = `
                INSERT INTO allocations.allocation_history (
                    id, employee_id, project_id, movement_type, date, role, start_date
                )
                VALUES ($1, $2, $3, 'entry', $4, $5, $6)
                RETURNING *
            `;
            
            const historyResult = await dbClient.query(historyQuery, [
                historyId,
                employeeId,
                projectId,
                date,
                role,
                startDate
            ]);
            
            // Commit the transaction
            await dbClient.query('COMMIT');
            
            res.status(201).json({
                success: true,
                message: 'Entry created successfully',
                data: historyResult.rows[0]
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
            // Update current_allocations to set is_active = false
            const updateCurrentQuery = `
                UPDATE allocations.current_allocations 
                SET is_active = false, end_date = $1
                WHERE employee_id = $2 AND project_id = $3 AND is_active = true
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
                INSERT INTO allocations.allocation_history (
                    id, employee_id, project_id, movement_type, date, reason, exit_date
                )
                VALUES ($1, $2, $3, 'exit', $4, $5, $6)
                RETURNING *
            `;
            
            const historyResult = await dbClient.query(historyQuery, [
                historyId,
                employeeId,
                projectId,
                date,
                reason,
                exitDate
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
