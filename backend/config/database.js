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
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

module.exports = {
    dbClient,
    connectDatabase
};
