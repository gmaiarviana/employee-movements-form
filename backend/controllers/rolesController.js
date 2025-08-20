const { dbClient } = require('../config/database');

// =============================================================================
// ROLES CONTROLLER - MANAGE HP PORTFOLIO ROLES
// =============================================================================

// Get all roles from hp_portfolio.roles table
const getRoles = async (req, res) => {
    try {
        console.log('[ROLES] Fetching roles data...');
        
        const query = `
            SELECT name, category, sort_order 
            FROM hp_portfolio.roles 
            ORDER BY sort_order, name
        `;
        
        const result = await dbClient.query(query);
        
        console.log(`[ROLES] Retrieved ${result.rows.length} roles successfully`);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error(`[ROLES ERROR] Failed to fetch roles: ${error.message}`);
        
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching roles:', error);
        } else {
            console.error('Error fetching roles - check logs for details');
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
