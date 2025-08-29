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
        // Sanitized logging - different messages for dev vs production
        if (process.env.NODE_ENV === 'development') {
            console.error(`[MOVEMENTS ERROR] Failed to fetch movements: ${error.message}`);
            console.error('Error fetching movements:', error);
        } else {
            console.error('Database error occurred');
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
            selectedProjectId,
            employeeIdHP, 
            complianceTraining, 
            billable, 
            role, 
            startDate,
            machineType,
            bundleAws,
            // HP Experience fields
            has_previous_hp_experience,
            previous_hp_account_id,
            previous_hp_period_start,
            previous_hp_period_end
        } = req.body;
        
        // Log simples do início da operação
        console.log(`[ENTRY] Starting entry creation for employee ${selectedEmployeeId}, HP ID: ${employeeIdHP || 'Not applicable (no previous HP experience)'}`);
        
        // Validate required fields for HP structure
        if (!selectedEmployeeId || !selectedProjectId || !complianceTraining || !billable || !role || !startDate) {
            if (process.env.NODE_ENV === 'development') {
                console.error(`[ENTRY ERROR] Missing required fields for employee ${selectedEmployeeId}`);
            } else {
                console.error('Validation failed - missing required fields');
            }
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'selectedEmployeeId, selectedProjectId, complianceTraining, billable, role, and startDate are required'
            });
        }
        
        // employeeIdHP is only required if has_previous_hp_experience is 'sim'
        if (has_previous_hp_experience === 'sim' && (!employeeIdHP || employeeIdHP.trim() === '')) {
            if (process.env.NODE_ENV === 'development') {
                console.error(`[ENTRY ERROR] Missing employeeIdHP for employee ${selectedEmployeeId} with previous HP experience`);
            } else {
                console.error('Validation failed - missing HP employee ID');
            }
            return res.status(400).json({
                success: false,
                error: 'Missing Employee ID HP',
                message: 'Employee ID HP is required when the professional has previous HP experience'
            });
        }
        
        // Use provided employeeIdHP only if has previous experience, otherwise null
        const finalEmployeeIdHP = has_previous_hp_experience === 'sim' ? (employeeIdHP || null) : null;

        // Validate HP experience fields
        if (has_previous_hp_experience === true && !previous_hp_account_id) {
            if (process.env.NODE_ENV === 'development') {
                console.error(`[ENTRY ERROR] Missing previous_hp_account_id for employee ${selectedEmployeeId} with HP experience`);
            } else {
                console.error('Validation failed - missing HP account ID');
            }
            return res.status(400).json({
                success: false,
                error: 'Missing required HP experience field',
                message: 'previous_hp_account_id is required when has_previous_hp_experience is true'
            });
        }
        
        // Validate specific field values
        if (!['sim', 'nao'].includes(complianceTraining)) {
            if (process.env.NODE_ENV === 'development') {
                console.error(`[ENTRY ERROR] Invalid complianceTraining: ${complianceTraining} for employee ${selectedEmployeeId}`);
            } else {
                console.error('Validation failed - invalid compliance training value');
            }
            return res.status(400).json({
                success: false,
                error: 'Invalid complianceTraining value',
                message: 'complianceTraining must be "sim" or "nao"'
            });
        }
        
        if (!['sim', 'nao'].includes(billable)) {
            if (process.env.NODE_ENV === 'development') {
                console.error(`[ENTRY ERROR] Invalid billable: ${billable} for employee ${selectedEmployeeId}`);
            } else {
                console.error('Validation failed - invalid billable value');
            }
            return res.status(400).json({
                success: false,
                error: 'Invalid billable value',
                message: 'billable must be "sim" or "nao"'
            });
        }
        
        // Use the selected project from frontend
        const projectId = selectedProjectId;
        
        // Convert boolean values for database storage
        const isBillable = billable === 'sim';

        // First, create/update HP employee profile with experience fields
        const hpProfileQuery = `
            INSERT INTO hp_portfolio.hp_employee_profiles (
                employee_id, 
                hp_employee_id, 
                has_previous_hp_experience,
                previous_hp_account_id,
                previous_hp_period_start,
                previous_hp_period_end,
                created_at, 
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            ON CONFLICT (employee_id) 
            DO UPDATE SET 
                hp_employee_id = EXCLUDED.hp_employee_id,
                has_previous_hp_experience = EXCLUDED.has_previous_hp_experience,
                previous_hp_account_id = EXCLUDED.previous_hp_account_id,
                previous_hp_period_start = EXCLUDED.previous_hp_period_start,
                previous_hp_period_end = EXCLUDED.previous_hp_period_end,
                updated_at = NOW()
            RETURNING *
        `;
        
        console.log(`[ENTRY] Creating/updating HP profile for employee ${selectedEmployeeId}`);
        await dbClient.query(hpProfileQuery, [
            selectedEmployeeId, 
            finalEmployeeIdHP,
            has_previous_hp_experience === 'sim',  // Convert string to boolean
            previous_hp_account_id || null,
            previous_hp_period_start || null,
            previous_hp_period_end || null
        ]);

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
                compliance_training,
                billable,
                machine_type,
                bundle_aws
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const result = await dbClient.query(movementQuery, [
            selectedEmployeeId,
            selectedProjectId,
            'ENTRY',
            role,
            startDate,
            100, // Default allocation percentage
            isBillable,        // boolean para is_billable
            complianceTraining, // string 'sim'/'nao' para compliance_training
            billable,          // string 'sim'/'nao' para billable
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
                    complianceTraining,
                    billable,
                    machineType,
                    bundleAws
                }
            }
        });
        
    } catch (error) {
        // Sanitized logging - different messages for dev vs production
        if (process.env.NODE_ENV === 'development') {
            console.error(`[ENTRY ERROR] Failed to create entry for employee ${req.body.selectedEmployeeId}: ${error.message}`);
            console.error('Error creating entry:', error);
        } else {
            console.error('Entry creation failed');
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
        const { 
            employeeId, 
            projectId, 
            date, 
            reason, 
            exitDate, 
            hasReplacement, 
            machineType, 
            machineReuse
        } = req.body;
        
        // Log simples do início da operação de saída
        console.log(`[EXIT] Starting exit creation for employee ${employeeId}, project ${projectId}`);
        
        // Validate required fields
        if (!employeeId || !projectId || !date || !reason || !exitDate) {
            if (process.env.NODE_ENV === 'development') {
                console.error(`[EXIT ERROR] Missing required fields for employee ${employeeId}`);
            } else {
                console.error('Validation failed - missing required fields for exit');
            }
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'employeeId, projectId, date, reason, and exitDate are required'
            });
        }
        
        // Buscar start_date do movimento ENTRY ativo do funcionário no projeto
        // Including JOIN with hp_employee_profiles to maintain consistency
        const entryMovementQuery = `
            SELECT m.start_date, m.role, m.machine_type as entry_machine_type, hp.hp_employee_id
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
            if (process.env.NODE_ENV === 'development') {
                console.error(`[EXIT ERROR] No active entry found for employee ${employeeId} in project ${projectId}`);
            } else {
                console.error('Active entry not found for exit operation');
            }
            return res.status(404).json({
                success: false,
                error: 'Active entry not found',
                message: 'No active entry movement found for this employee in this project'
            });
        }

        const { 
            start_date: realStartDate, 
            role: currentRole, 
            entry_machine_type,
            hp_employee_id 
        } = entryResult.rows[0];
        
        // Log da entrada ativa encontrada
        console.log(`[EXIT] Found active entry for employee ${employeeId}, role: ${currentRole}, HP ID: ${hp_employee_id || 'N/A'}`);

        // Processar machine_type e machine_reuse
        let finalMachineType = null;
        let finalMachineReuse = null;

        // Mapear os valores do frontend para o formato do banco
        if (machineType === 'Máquina da empresa') {
            finalMachineType = 'empresa';
            // machine_reuse só é relevante para máquina da empresa
            finalMachineReuse = machineReuse === 'sim' ? true : (machineReuse === 'nao' ? false : null);
        } else if (machineType === 'Ambiente AWS') {
            finalMachineType = 'aws';
            finalMachineReuse = null; // AWS não tem conceito de reutilização
        }

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
                allocation_percentage,
                has_replacement,
                machine_type,
                machine_reuse
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
            100,              // allocation_percentage
            hasReplacement === 'sim' ? true : false, // has_replacement
            finalMachineType, // machine_type
            finalMachineReuse // machine_reuse
        ]);
        
        console.log(`[EXIT SUCCESS] Created exit ID ${result.rows[0].id} for employee ${employeeId}, reason: ${reason}`);
        
        res.status(201).json({
            success: true,
            message: 'Exit created successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
        // Sanitized logging - different messages for dev vs production
        if (process.env.NODE_ENV === 'development') {
            console.error(`[EXIT ERROR] Failed to create exit for employee ${req.body.employeeId}: ${error.message}`);
            console.error('Error creating exit:', error);
        } else {
            console.error('Exit creation failed');
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
