const { Client } = require('pg');

// Load environment variables
require('dotenv').config();

// =============================================================================
// DATABASE CONFIGURATION
// =============================================================================

const dbClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Database connection function
async function connectDatabase() {
    try {
        await dbClient.connect();
        console.log('🐘 Database connected successfully');
        
        // Validate schemas after connection
        await validateSchemas();
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

// Schema validation function
async function validateSchemas() {
    try {
        const schemaQuery = `
            SELECT schemaname 
            FROM pg_tables 
            WHERE schemaname IN ('core', 'hp_portfolio') 
            GROUP BY schemaname 
            ORDER BY schemaname
        `;
        
        const result = await dbClient.query(schemaQuery);
        const foundSchemas = result.rows.map(row => row.schemaname);
        
        console.log('📋 Schema validation completed');
        if (foundSchemas.length > 0) {
            console.log('✅ Available schemas:', foundSchemas.join(', '));
        } else {
            console.log('⚠️  No target schemas found (core, hp_portfolio)');
        }
    } catch (error) {
        console.error('❌ Schema validation failed:', error);
        // Note: Not exiting process here to maintain compatibility
    }
}

module.exports = {
    dbClient,
    connectDatabase,
    validateSchemas
};
