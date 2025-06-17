const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin,isDepartmentAdmin } = require('../middlewares/auth');
const adminController = require('../controllers/admin.controller');

// Add this route for creating users
router.post('/users', verifyToken, isAdmin, adminController.createUser);

// Your existing dashboard route
router.get('/dashboard', verifyToken, isAdmin, adminController.getDashboardStats);
router.get('/department/dashboard', 
  verifyToken,
  isDepartmentAdmin, 
  adminController.getDepartmentDashboard
);

module.exports = router;