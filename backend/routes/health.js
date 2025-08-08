const express = require('express');

const router = express.Router();

// =============================================================================
// HEALTH CHECK
// =============================================================================

// GET /api/health - Health check endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = router;
