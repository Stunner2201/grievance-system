const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Get profile route
router.get('/profile', authController.getUserProfile);

module.exports = router;