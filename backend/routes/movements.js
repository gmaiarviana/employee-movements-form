const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getMovements, createEntry, createExit } = require('../controllers/movementController');
const rolesController = require('../controllers/rolesController');

const router = express.Router();

// =============================================================================
// MOVEMENTS ROUTES
// =============================================================================

// GET /api/movements - Get consolidated movements data
router.get('/', authenticateToken, getMovements);

// GET /api/movements/roles - Get all available roles
router.get('/roles', rolesController.getRoles);

// POST /api/entries - Create new entry
router.post('/entries', authenticateToken, createEntry);

// POST /api/exits - Create new exit
router.post('/exits', authenticateToken, createExit);

module.exports = router;
