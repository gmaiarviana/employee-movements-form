const { dbClient } = require('../config/database');

// =============================================================================
// ROLES CONTROLLER - MANAGE HP PORTFOLIO ROLES
// =============================================================================

// Get all roles from hp_portfolio.roles_hp table
const getRoles = async (req, res) => {
    try {
        console.log('[ROLES] Fetching roles data...');
        
        const query = `
            SELECT name, category, sort_order 
            FROM hp_portfolio.roles_hp 
            ORDER BY sort_order, name
        `;
        
        const result = await dbClient.query(query);
        
        console.log(`[ROLES] Retrieved ${result.rows.length} roles successfully`);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        // Sanitized logging - different messages for dev vs production
        if (process.env.NODE_ENV === 'development') {
            console.error(`[ROLES ERROR] Failed to fetch roles: ${error.message}`);
            console.error('Error fetching roles:', error);
        } else {
            console.error('Database error occurred');
        }
        
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Error fetching roles data'
        });
    }
};

module.exports = {
    getRoles
};
