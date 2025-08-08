const express = require('express');
const { dbClient } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// =============================================================================
// MOVEMENTS ROUTES
// =============================================================================

// GET /api/movements - Get consolidated movements data
router.get('/', authenticateToken, async (req, res) => {
    try {
        const movements = [];
        
        // Query entries with JOINs
        const entriesQuery = `
            SELECT e.*, emp.name as employee_name, p.name as project_name 
            FROM entries e 
            LEFT JOIN employees emp ON e.employee_id = emp.id 
            LEFT JOIN projects p ON e.project_id = p.id
        `;
        const entriesResult = await dbClient.query(entriesQuery);
        
        // Query exits with JOINs
        const exitsQuery = `
            SELECT ex.*, emp.name as employee_name, p.name as project_name 
            FROM exits ex 
            LEFT JOIN employees emp ON ex.employee_id = emp.id 
            LEFT JOIN projects p ON ex.project_id = p.id
        `;
        const exitsResult = await dbClient.query(exitsQuery);
        
        // Process entries
        entriesResult.rows.forEach(entry => {
            let details = 'Entrada';
            
            if (entry.project_id && entry.project_name) {
                details = `Entrada como ${entry.role || 'Funcionário'} no Projeto ${entry.project_name}`;
            } else {
                details = `Entrada como ${entry.role || 'Funcionário'} - Não atribuído`;
            }
            
            movements.push({
                type: 'entrada',
                date: entry.date || entry.start_date,
                employeeName: entry.employee_name || 'Funcionário não encontrado',
                details: details
            });
        });
        
        // Process exits
        exitsResult.rows.forEach(exit => {
            let details = 'Saída';
            
            if (exit.project_id && exit.project_name) {
                details = `Saída por ${exit.reason || 'Motivo não especificado'} do Projeto ${exit.project_name}`;
            } else {
                details = `Saída por ${exit.reason || 'Motivo não especificado'} - Não atribuído`;
            }
            
            movements.push({
                type: 'saida',
                date: exit.date || exit.exit_date,
                employeeName: exit.employee_name || 'Funcionário não encontrado',
                details: details
            });
        });
        
        // Sort movements chronologically (oldest to newest)
        movements.sort((a, b) => {
            const dateA = new Date(a.date || '1970-01-01');
            const dateB = new Date(b.date || '1970-01-01');
            return dateA - dateB;
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
});

// POST /api/entries - Create new entry
router.post('/entries', authenticateToken, async (req, res) => {
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
        
        // Generate unique ID in format ENTRY{timestamp}
        const entryId = `ENTRY${Date.now()}`;
        
        // Insert into entries table
        const insertQuery = `
            INSERT INTO entries (id, employee_id, project_id, date, role, start_date)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await dbClient.query(insertQuery, [
            entryId,
            employeeId,
            projectId,
            date,
            role,
            startDate
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Entry created successfully',
            data: result.rows[0]
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
});

// POST /api/exits - Create new exit
router.post('/exits', authenticateToken, async (req, res) => {
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
        
        // Generate unique ID in format EXIT{timestamp}
        const exitId = `EXIT${Date.now()}`;
        
        // Insert into exits table
        const insertQuery = `
            INSERT INTO exits (id, employee_id, project_id, date, reason, exit_date)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await dbClient.query(insertQuery, [
            exitId,
            employeeId,
            projectId,
            date,
            reason,
            exitDate
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
});

module.exports = router;
