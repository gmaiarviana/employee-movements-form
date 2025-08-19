const { dbClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// =============================================================================
// MOVEMENT CONTROLLER - USING CONSOLIDATED MOVEMENTS TABLE
// =============================================================================

// Get consolidated movements data from the new movements table
const getMovements = async (req, res) => {
    try {
        console.log('[MOVEMENTS] Fetching movements data...');
        
        // Query with JOIN to hp_employee_profiles to include hp_employee_id when available
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
                m.movement_type,
                hp.hp_employee_id
            FROM hp_portfolio.movements m 
            JOIN core.employees e ON m.employee_id = e.id
            JOIN hp_portfolio.projects p ON m.project_id = p.id
            LEFT JOIN hp_portfolio.hp_employee_profiles hp ON e.id = hp.employee_id
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
        
        console.log(`[MOVEMENTS] Retrieved ${movements.length} movements successfully`);
        
        res.json({
            success: true,
            data: movements
        });
    } catch (error) {
        console.error(`[MOVEMENTS ERROR] Failed to fetch movements: ${error.message}`);
        
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching movements:', error);
        } else {
            console.error('Error fetching movements - check logs for details');
        }
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
            startDate,
            machineType,
            bundleAws
        } = req.body;
        
        // Log simples do início da operação
        console.log(`[ENTRY] Starting entry creation for employee ${selectedEmployeeId}, HP ID: ${employeeIdHP}`);
        
        // Validate required fields for HP structure
        if (!selectedEmployeeId || !employeeIdHP || !projectType || !complianceTraining || !billable || !role || !startDate) {
            console.error(`[ENTRY ERROR] Missing required fields for employee ${selectedEmployeeId}`);
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'selectedEmployeeId, employeeIdHP, projectType, complianceTraining, billable, role, and startDate are required'
            });
        }
        
        // Validate specific field values
        if (!['sim', 'nao'].includes(complianceTraining)) {
            console.error(`[ENTRY ERROR] Invalid complianceTraining: ${complianceTraining} for employee ${selectedEmployeeId}`);
            return res.status(400).json({
                success: false,
                error: 'Invalid complianceTraining value',
                message: 'complianceTraining must be "sim" or "nao"'
            });
        }
        
        if (!['sim', 'nao'].includes(billable)) {
            console.error(`[ENTRY ERROR] Invalid billable: ${billable} for employee ${selectedEmployeeId}`);
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

        // First, ensure the HP employee profile exists
        const hpProfileQuery = `
            INSERT INTO hp_portfolio.hp_employee_profiles (employee_id, hp_employee_id, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
            ON CONFLICT (employee_id) 
            DO UPDATE SET 
                hp_employee_id = EXCLUDED.hp_employee_id,
                updated_at = NOW()
            RETURNING *
        `;
        
        console.log(`[ENTRY] Creating/updating HP profile for employee ${selectedEmployeeId}`);
        await dbClient.query(hpProfileQuery, [selectedEmployeeId, employeeIdHP]);

        // Insert into movements table with movement_type 'ENTRY' (without hp_employee_id)
        const movementQuery = `
            INSERT INTO hp_portfolio.movements (
                employee_id, 
                project_id, 
                movement_type, 
                role, 
                start_date, 
                allocation_percentage, 
                is_billable,
                project_type,
                compliance_training,
                billable,
                machine_type,
                bundle_aws
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
            projectType,
            complianceTraining,
            billable,
            machineType || null,
            bundleAws || null
        ]);
        
        console.log(`[ENTRY SUCCESS] Created entry ID ${result.rows[0].id} for employee ${selectedEmployeeId}, role: ${role}`);
        
        res.status(201).json({
            success: true,
            message: 'Entry created successfully',
            data: {
                movement: result.rows[0],
                hpFields: {
                    employeeIdHP,
                    projectType,
                    complianceTraining,
                    billable,
                    machineType,
                    bundleAws
                }
            }
        });
        
    } catch (error) {
        console.error(`[ENTRY ERROR] Failed to create entry for employee ${req.body.selectedEmployeeId}: ${error.message}`);
        
        if (process.env.NODE_ENV === 'development') {
            console.error('Error creating entry:', error);
        } else {
            console.error('Error creating entry - check logs for details');
        }
        
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
        
        // Log simples do início da operação de saída
        console.log(`[EXIT] Starting exit creation for employee ${employeeId}, project ${projectId}`);
        
        // Validate required fields
        if (!employeeId || !projectId || !date || !reason || !exitDate) {
            console.error(`[EXIT ERROR] Missing required fields for employee ${employeeId}`);
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'employeeId, projectId, date, reason, and exitDate are required'
            });
        }
        
        // Buscar start_date do movimento ENTRY ativo do funcionário no projeto
        // Including JOIN with hp_employee_profiles to maintain consistency
        const entryMovementQuery = `
            SELECT m.start_date, m.role, hp.hp_employee_id
            FROM hp_portfolio.movements m
            LEFT JOIN hp_portfolio.hp_employee_profiles hp ON m.employee_id = hp.employee_id
            WHERE m.employee_id = $1 
              AND m.project_id = $2 
              AND m.movement_type = 'ENTRY'
              AND NOT EXISTS (
                SELECT 1 FROM hp_portfolio.movements m2 
                WHERE m2.employee_id = $1 
                AND m2.project_id = $2 
                AND m2.movement_type = 'EXIT' 
                AND m2.created_at > m.created_at
              )
            ORDER BY m.created_at DESC 
            LIMIT 1
        `;

        const entryResult = await dbClient.query(entryMovementQuery, [employeeId, projectId]);

        if (entryResult.rows.length === 0) {
            console.error(`[EXIT ERROR] No active entry found for employee ${employeeId} in project ${projectId}`);
            return res.status(404).json({
                success: false,
                error: 'Active entry not found',
                message: 'No active entry movement found for this employee in this project'
            });
        }

        const { start_date: realStartDate, role: currentRole, hp_employee_id } = entryResult.rows[0];
        
        // Log da entrada ativa encontrada
        console.log(`[EXIT] Found active entry for employee ${employeeId}, role: ${currentRole}, HP ID: ${hp_employee_id || 'N/A'}`);

        // Insert into movements table with movement_type 'EXIT'
        const movementQuery = `
            INSERT INTO hp_portfolio.movements (
                employee_id, 
                project_id, 
                movement_type,
                start_date,
                end_date, 
                role,
                change_reason,
                allocation_percentage
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        
        const result = await dbClient.query(movementQuery, [
            employeeId,
            projectId,
            'EXIT',
            realStartDate,    // start_date real do ENTRY
            exitDate,         // end_date
            currentRole,      // role do ENTRY
            reason,
            100
        ]);
        
        console.log(`[EXIT SUCCESS] Created exit ID ${result.rows[0].id} for employee ${employeeId}, reason: ${reason}`);
        
        res.status(201).json({
            success: true,
            message: 'Exit created successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error(`[EXIT ERROR] Failed to create exit for employee ${req.body.employeeId}: ${error.message}`);
        
        if (process.env.NODE_ENV === 'development') {
            console.error('Error creating exit:', error);
        } else {
            console.error('Error creating exit - check logs for details');
        }
        
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
