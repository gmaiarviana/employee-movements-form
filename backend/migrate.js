const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if exists
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('💡 Please check your .env file or environment configuration');
    process.exit(1);
}

// Database configuration (same as server.js)
const dbClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Helper function to read JSON files
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`❌ Error reading file ${filePath}:`, error);
        return null;
    }
}

// Function to create database tables
async function createTables() {
    console.log('📋 Creating database tables...');
    
    try {
        // Create employees table
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id VARCHAR PRIMARY KEY,
                name VARCHAR NOT NULL,
                email VARCHAR,
                role VARCHAR,
                is_leader BOOLEAN DEFAULT FALSE,
                company VARCHAR
            )
        `);
        console.log('✅ Employees table created successfully');

        // Create projects table
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id VARCHAR PRIMARY KEY,
                name VARCHAR NOT NULL,
                type VARCHAR,
                sow VARCHAR,
                leader_id VARCHAR
            )
        `);
        console.log('✅ Projects table created successfully');

        // Create employee_projects junction table
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS employee_projects (
                employee_id VARCHAR NOT NULL,
                project_id VARCHAR NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                PRIMARY KEY(employee_id, project_id)
            )
        `);
        console.log('✅ Employee_projects table created successfully');

        // Create entries table
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS entries (
                id VARCHAR PRIMARY KEY,
                employee_id VARCHAR NOT NULL,
                project_id VARCHAR,
                date DATE,
                role VARCHAR,
                start_date DATE
            )
        `);
        console.log('✅ Entries table created successfully');

        // Create exits table
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS exits (
                id VARCHAR PRIMARY KEY,
                employee_id VARCHAR NOT NULL,
                project_id VARCHAR,
                date DATE,
                reason VARCHAR,
                exit_date DATE
            )
        `);
        console.log('✅ Exits table created successfully');

        console.log('🎉 All tables created successfully!');
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    }
}

// Function to migrate data from JSON files to database
async function migrateData() {
    console.log('🔄 Starting data migration...');
    
    try {
        // Clear existing data (optional - remove if you want to preserve existing data)
        console.log('🧹 Clearing existing data...');
        await dbClient.query('DELETE FROM exits');
        await dbClient.query('DELETE FROM entries');
        await dbClient.query('DELETE FROM employee_projects');
        await dbClient.query('DELETE FROM projects');
        await dbClient.query('DELETE FROM employees');
        console.log('✅ Existing data cleared');

        // 1. Migrate employees data
        console.log('👥 Migrating employees data...');
        const employeesData = readJSONFile(path.join(__dirname, 'data/employees.json'));
        if (employeesData && employeesData.employees) {
            for (const employee of employeesData.employees) {
                await dbClient.query(
                    'INSERT INTO employees (id, name, email, role, is_leader, company) VALUES ($1, $2, $3, $4, $5, $6)',
                    [
                        employee.id,
                        employee.name,
                        employee.email || null,
                        employee.role || null,
                        employee.isLeader || false,
                        employee.company || null
                    ]
                );
            }
            console.log(`✅ Migrated ${employeesData.employees.length} employees`);
        } else {
            console.log('⚠️ No employees data found or invalid format');
        }

        // 2. Migrate projects data
        console.log('📊 Migrating projects data...');
        const projectsData = readJSONFile(path.join(__dirname, 'data/projects.json'));
        if (projectsData && projectsData.projects) {
            for (const project of projectsData.projects) {
                await dbClient.query(
                    'INSERT INTO projects (id, name, type, sow, leader_id) VALUES ($1, $2, $3, $4, $5)',
                    [
                        project.id,
                        project.name,
                        project.type || null,
                        project.sow || null,
                        project.leaderId || null
                    ]
                );
            }
            console.log(`✅ Migrated ${projectsData.projects.length} projects`);
        } else {
            console.log('⚠️ No projects data found or invalid format');
        }

        // 3. Migrate employee_projects assignments
        console.log('🔗 Migrating employee-project assignments...');
        const assignmentsData = readJSONFile(path.join(__dirname, 'data/employee_projects.json'));
        if (assignmentsData && assignmentsData.assignments) {
            for (const assignment of assignmentsData.assignments) {
                await dbClient.query(
                    'INSERT INTO employee_projects (employee_id, project_id, is_active) VALUES ($1, $2, $3)',
                    [
                        assignment.employeeId,
                        assignment.projectId,
                        assignment.isActive !== undefined ? assignment.isActive : true
                    ]
                );
            }
            console.log(`✅ Migrated ${assignmentsData.assignments.length} employee-project assignments`);
        } else {
            console.log('⚠️ No employee-project assignments data found or invalid format');
        }

        // 4. Migrate entries data
        console.log('📥 Migrating entries data...');
        const entriesData = readJSONFile(path.join(__dirname, 'data/entries.json'));
        if (entriesData && Array.isArray(entriesData) && entriesData.length > 0) {
            for (const entry of entriesData) {
                // Generate ID if not present
                const entryId = entry.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                await dbClient.query(
                    'INSERT INTO entries (id, employee_id, project_id, date, role, start_date) VALUES ($1, $2, $3, $4, $5, $6)',
                    [
                        entryId,
                        entry.employeeId,
                        entry.projectId || null,
                        entry.date || null,
                        entry.role || null,
                        entry.startDate || null
                    ]
                );
            }
            console.log(`✅ Migrated ${entriesData.length} entries`);
        } else {
            console.log('⚠️ No entries data found or invalid format');
        }

        // 5. Migrate exits data
        console.log('📤 Migrating exits data...');
        const exitsData = readJSONFile(path.join(__dirname, 'data/exits.json'));
        if (exitsData && Array.isArray(exitsData) && exitsData.length > 0) {
            for (const exit of exitsData) {
                // Generate ID if not present
                const exitId = exit.id || `exit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                await dbClient.query(
                    'INSERT INTO exits (id, employee_id, project_id, date, reason, exit_date) VALUES ($1, $2, $3, $4, $5, $6)',
                    [
                        exitId,
                        exit.employeeId,
                        exit.projectId || null,
                        exit.date || null,
                        exit.reason || null,
                        exit.exitDate || null
                    ]
                );
            }
            console.log(`✅ Migrated ${exitsData.length} exits`);
        } else {
            console.log('⚠️ No exits data found or invalid format');
        }

        console.log('🎉 Data migration completed successfully!');
    } catch (error) {
        console.error('❌ Error during data migration:', error);
        throw error;
    }
}

// Main function to orchestrate the migration process
async function main() {
    console.log('🚀 Starting database migration process...');
    console.log('📅 Migration started at:', new Date().toISOString());
    
    try {
        // Connect to database
        console.log('🔌 Connecting to database...');
        await dbClient.connect();
        console.log('🐘 Database connected successfully');

        // Create tables
        await createTables();

        // Migrate data
        await migrateData();

        console.log('✨ Migration process completed successfully!');
        console.log('📅 Migration finished at:', new Date().toISOString());
        
        // Verify migration by showing counts
        console.log('\n📊 Migration Summary:');
        const employeeCount = await dbClient.query('SELECT COUNT(*) FROM employees');
        const projectCount = await dbClient.query('SELECT COUNT(*) FROM projects');
        const assignmentCount = await dbClient.query('SELECT COUNT(*) FROM employee_projects');
        const entryCount = await dbClient.query('SELECT COUNT(*) FROM entries');
        const exitCount = await dbClient.query('SELECT COUNT(*) FROM exits');
        
        console.log(`   • Employees: ${employeeCount.rows[0].count}`);
        console.log(`   • Projects: ${projectCount.rows[0].count}`);
        console.log(`   • Assignments: ${assignmentCount.rows[0].count}`);
        console.log(`   • Entries: ${entryCount.rows[0].count}`);
        console.log(`   • Exits: ${exitCount.rows[0].count}`);

    } catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    } finally {
        // Close database connection
        await dbClient.end();
        console.log('🔚 Database connection closed');
    }
}

// Execute the migration
main().catch(error => {
    console.error('💥 Unhandled error during migration:', error);
    process.exit(1);
});
