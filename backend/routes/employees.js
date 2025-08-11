const express = require('express');
const { auth } = require('../middleware/auth');
const { getAllEmployees, getTeamMembers, getEmployeeDetails, createEmployee } = require('../controllers/employeeController');

const router = express.Router();

// =============================================================================
// EMPLOYEE ROUTES
// =============================================================================

// GET /api/employees - Get all employees for admin/manager
router.get('/', auth, getAllEmployees);

// GET /api/employees/:leaderId/team-members - Get team members for a leader
router.get('/:leaderId/team-members', auth, getTeamMembers);

// GET /api/employees/:id/details - Get employee details with project information
router.get('/:id/details', auth, getEmployeeDetails);

// POST /api/employees - Create new employee
router.post('/', auth, createEmployee);

module.exports = router;
