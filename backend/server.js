const express = require('express');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

// Import configurations and modules
const { connectDatabase } = require('./config/database');
const { corsOptions } = require('./config/cors');

// Import route modules
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const movementRoutes = require('./routes/movements');
const healthRoutes = require('./routes/health');

// =============================================================================
// ENVIRONMENT VARIABLES VALIDATION
// =============================================================================

const requiredEnvVars = ['PORT', 'NODE_ENV', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('💡 Please check your .env file or environment configuration');
    process.exit(1);
}

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

// Connect to database
connectDatabase();

// =============================================================================
// EXPRESS APP INITIALIZATION
// =============================================================================

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// MIDDLEWARES
// =============================================================================

app.use(cors(corsOptions));
app.use(express.json());

// =============================================================================
// ROUTES
// =============================================================================

// Mount route modules
app.use('/api', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/health', healthRoutes);

// =============================================================================
// FALLBACK MIDDLEWARE
// =============================================================================

// Handle unmatched routes
app.use('*', (req, res) => {
    if (!req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: 'This backend server only provides API endpoints. All API routes start with /api/',
            availableEndpoints: [
                'GET /api/health',
                'POST /api/register',
                'POST /api/login',
                'GET /api/employees/:leaderId/team-members',
                'GET /api/employees/:id/details',
                'POST /api/entries',
                'POST /api/exits',
                'GET /api/movements'
            ]
        });
    }
    
    // If we reach here, it's an API route that wasn't matched above
    res.status(404).json({
        success: false,
        error: 'API Endpoint Not Found',
        message: `API endpoint ${req.originalUrl} not found`
    });
});

// =============================================================================
// SERVER LISTEN
// =============================================================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔒 Backend serves ONLY API endpoints starting with /api/`);
    console.log(`🌐 CORS configured for: ${process.env.CORS_ORIGIN || 'http://localhost:3001'}`);
    
    // Log loaded configuration (without sensitive values)
    console.log('\n📋 Configuration loaded:');
    console.log(`   • Environment: ${process.env.NODE_ENV}`);
    console.log(`   • Port: ${PORT}`);
    console.log(`   • JWT Secret: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   • Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
});
