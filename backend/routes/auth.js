const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

// POST /api/register - User registration
router.post('/register', authController.register);

// POST /api/login - User authentication
router.post('/login', authController.login);

module.exports = router;
