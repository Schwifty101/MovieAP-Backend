// Import required dependencies
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Authentication routes
// POST /auth/register - Register a new user
router.post('/register', authController.register);
// POST /auth/login - Authenticate and login an existing user
router.post('/login', authController.login);

// Export the router
module.exports = router;