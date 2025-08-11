const { dbClient } = require('../config/database');

// =============================================================================
// DATA VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates foreign key constraints across schemas
 * Checks if all referenced IDs exist in their respective tables
 */
async function validateForeignKeys() {
    const results = {
        isValid: true,
        errors: [],
        details: {
            invalidEmployeeIds: [],
            invalidProjectIds: [],
            invalidManagerIds: []
        }
    };

    try {
        // 1. Check if all employee_id in allocations.* exist in core.employees
        console.log('🔍 Validating employee IDs in allocations...');
        
        // Check current_allocations
        const currentAllocationsQuery = `
            SELECT DISTINCT ca.employee_id
            FROM allocations.current_allocations ca
            LEFT JOIN core.employees e ON ca.employee_id = e.id
            WHERE e.id IS NULL
        `;
        
        const currentAllocationsResult = await dbClient.query(currentAllocationsQuery);
        
        // Check allocation_history
        const allocationHistoryQuery = `
            SELECT DISTINCT ah.employee_id
            FROM allocations.allocation_history ah
            LEFT JOIN core.employees e ON ah.employee_id = e.id
            WHERE e.id IS NULL
        `;
        
        const allocationHistoryResult = await dbClient.query(allocationHistoryQuery);
        
        // Combine invalid employee IDs
        const invalidEmployeeIds = [
            ...currentAllocationsResult.rows.map(row => row.employee_id),
            ...allocationHistoryResult.rows.map(row => row.employee_id)
        ];
        
        if (invalidEmployeeIds.length > 0) {
            results.isValid = false;
            results.details.invalidEmployeeIds = [...new Set(invalidEmployeeIds)];
            results.errors.push(`Found ${invalidEmployeeIds.length} invalid employee_id references in allocations tables`);
        }

        // 2. Check if all project_id in allocations.* exist in projects.projects
        console.log('🔍 Validating project IDs in allocations...');
        
        // Check current_allocations
        const currentProjectQuery = `
            SELECT DISTINCT ca.project_id
            FROM allocations.current_allocations ca
            LEFT JOIN projects.projects p ON ca.project_id = p.id
            WHERE p.id IS NULL
        `;
        
        const currentProjectResult = await dbClient.query(currentProjectQuery);
        
        // Check allocation_history
        const historyProjectQuery = `
            SELECT DISTINCT ah.project_id
            FROM allocations.allocation_history ah
            LEFT JOIN projects.projects p ON ah.project_id = p.id
            WHERE p.id IS NULL
        `;
        
        const historyProjectResult = await dbClient.query(historyProjectQuery);
        
        // Combine invalid project IDs
        const invalidProjectIds = [
            ...currentProjectResult.rows.map(row => row.project_id),
            ...historyProjectResult.rows.map(row => row.project_id)
        ];
        
        if (invalidProjectIds.length > 0) {
            results.isValid = false;
            results.details.invalidProjectIds = [...new Set(invalidProjectIds)];
            results.errors.push(`Found ${invalidProjectIds.length} invalid project_id references in allocations tables`);
        }

        // 3. Check if all employee_id in projects.project_managers exist in core.employees
        console.log('🔍 Validating employee IDs in project_managers...');
        
        const managerQuery = `
            SELECT DISTINCT pm.employee_id
            FROM projects.project_managers pm
            LEFT JOIN core.employees e ON pm.employee_id = e.id
            WHERE e.id IS NULL
        `;
        
        const managerResult = await dbClient.query(managerQuery);
        const invalidManagerIds = managerResult.rows.map(row => row.employee_id);
        
        if (invalidManagerIds.length > 0) {
            results.isValid = false;
            results.details.invalidManagerIds = invalidManagerIds;
            results.errors.push(`Found ${invalidManagerIds.length} invalid employee_id references in project_managers table`);
        }

        if (results.isValid) {
            console.log('✅ All foreign key constraints are valid');
        } else {
            console.log('❌ Foreign key validation failed');
            results.errors.forEach(error => console.log(`   ${error}`));
        }

        return results;

    } catch (error) {
        console.error('❌ Error validating foreign keys:', error);
        return {
            isValid: false,
            errors: [`Database error during foreign key validation: ${error.message}`],
            details: {
                invalidEmployeeIds: [],
                invalidProjectIds: [],
                invalidManagerIds: []
            }
        };
    }
}

/**
 * Gets record counts from all main tables
 * Returns detailed statistics about data distribution
 */
async function getDataCounts() {
    const counts = {
        success: true,
        error: null,
        data: {
            core: {
                users: 0,
                employees: 0
            },
            projects: {
                projects: 0,
                project_managers: 0
            },
            allocations: {
                current_allocations: 0,
                allocation_history: 0
            }
        }
    };

    try {
        console.log('📊 Collecting data counts...');

        // Core schema counts
        const coreQueries = [
            { table: 'core.users', key: 'users' },
            { table: 'core.employees', key: 'employees' }
        ];

        for (const { table, key } of coreQueries) {
            try {
                const result = await dbClient.query(`SELECT COUNT(*) as count FROM ${table}`);
                counts.data.core[key] = parseInt(result.rows[0].count);
            } catch (error) {
                console.warn(`⚠️  Could not count ${table}: ${error.message}`);
                counts.data.core[key] = -1; // Indicates error
            }
        }

        // Projects schema counts
        const projectQueries = [
            { table: 'projects.projects', key: 'projects' },
            { table: 'projects.project_managers', key: 'project_managers' }
        ];

        for (const { table, key } of projectQueries) {
            try {
                const result = await dbClient.query(`SELECT COUNT(*) as count FROM ${table}`);
                counts.data.projects[key] = parseInt(result.rows[0].count);
            } catch (error) {
                console.warn(`⚠️  Could not count ${table}: ${error.message}`);
                counts.data.projects[key] = -1; // Indicates error
            }
        }

        // Allocations schema counts
        const allocationQueries = [
            { table: 'allocations.current_allocations', key: 'current_allocations' },
            { table: 'allocations.allocation_history', key: 'allocation_history' }
        ];

        for (const { table, key } of allocationQueries) {
            try {
                const result = await dbClient.query(`SELECT COUNT(*) as count FROM ${table}`);
                counts.data.allocations[key] = parseInt(result.rows[0].count);
            } catch (error) {
                console.warn(`⚠️  Could not count ${table}: ${error.message}`);
                counts.data.allocations[key] = -1; // Indicates error
            }
        }

        // Calculate totals
        const totalRecords = Object.values(counts.data.core).reduce((sum, count) => sum + (count > 0 ? count : 0), 0) +
                           Object.values(counts.data.projects).reduce((sum, count) => sum + (count > 0 ? count : 0), 0) +
                           Object.values(counts.data.allocations).reduce((sum, count) => sum + (count > 0 ? count : 0), 0);

        console.log('✅ Data count collection completed');
        console.log(`📈 Total records across all tables: ${totalRecords}`);

        return counts;

    } catch (error) {
        console.error('❌ Error getting data counts:', error);
        return {
            success: false,
            error: error.message,
            data: {
                core: { users: -1, employees: -1 },
                projects: { projects: -1, project_managers: -1 },
                allocations: { current_allocations: -1, allocation_history: -1 }
            }
        };
    }
}

/**
 * Comprehensive data integrity validation
 * Combines foreign key validation and data counts
 */
async function validateDataIntegrity() {
    console.log('🔧 Starting comprehensive data integrity validation...');
    
    const results = {
        timestamp: new Date().toISOString(),
        success: true,
        summary: {
            foreignKeysValid: false,
            dataCountsRetrieved: false,
            totalErrors: 0,
            totalWarnings: 0
        },
        foreignKeys: null,
        dataCounts: null,
        recommendations: []
    };

    try {
        // 1. Validate foreign keys
        console.log('🔍 Phase 1: Foreign key validation');
        results.foreignKeys = await validateForeignKeys();
        results.summary.foreignKeysValid = results.foreignKeys.isValid;
        
        if (!results.foreignKeys.isValid) {
            results.success = false;
            results.summary.totalErrors += results.foreignKeys.errors.length;
        }

        // 2. Get data counts
        console.log('📊 Phase 2: Data count analysis');
        results.dataCounts = await getDataCounts();
        results.summary.dataCountsRetrieved = results.dataCounts.success;
        
        if (!results.dataCounts.success) {
            results.summary.totalWarnings++;
        }

        // 3. Generate recommendations
        console.log('💡 Phase 3: Generating recommendations');
        
        // Foreign key recommendations
        if (!results.summary.foreignKeysValid) {
            if (results.foreignKeys.details.invalidEmployeeIds.length > 0) {
                results.recommendations.push('Fix invalid employee_id references in allocations tables');
            }
            if (results.foreignKeys.details.invalidProjectIds.length > 0) {
                results.recommendations.push('Fix invalid project_id references in allocations tables');
            }
            if (results.foreignKeys.details.invalidManagerIds.length > 0) {
                results.recommendations.push('Fix invalid employee_id references in project_managers table');
            }
        }

        // Data count recommendations
        if (results.dataCounts.success) {
            const { core, projects, allocations } = results.dataCounts.data;
            
            if (core.employees === 0) {
                results.recommendations.push('No employees found - consider adding employee data');
            }
            
            if (projects.projects === 0) {
                results.recommendations.push('No projects found - consider adding project data');
            }
            
            if (allocations.current_allocations === 0 && allocations.allocation_history === 0) {
                results.recommendations.push('No allocations found - consider adding allocation data');
            }
            
            if (projects.project_managers === 0 && projects.projects > 0) {
                results.recommendations.push('Projects exist but no managers assigned - consider assigning project managers');
            }
        }

        // Final status
        if (results.success && results.summary.foreignKeysValid && results.summary.dataCountsRetrieved) {
            console.log('✅ Data integrity validation completed successfully');
        } else {
            console.log('⚠️  Data integrity validation completed with issues');
        }

        console.log(`📋 Summary: ${results.summary.totalErrors} errors, ${results.summary.totalWarnings} warnings`);
        
        return results;

    } catch (error) {
        console.error('❌ Error during data integrity validation:', error);
        return {
            timestamp: new Date().toISOString(),
            success: false,
            summary: {
                foreignKeysValid: false,
                dataCountsRetrieved: false,
                totalErrors: 1,
                totalWarnings: 0
            },
            foreignKeys: null,
            dataCounts: null,
            recommendations: ['Fix database connection or query issues'],
            error: error.message
        };
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    validateForeignKeys,
    getDataCounts,
    validateDataIntegrity
};
