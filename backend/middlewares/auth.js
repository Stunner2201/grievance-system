const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const db = require('../config/db');

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ 
      success: false, 
      message: "No token provided" 
    });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Verify user exists in database (optional but recommended)
    const user = await db.query(
      'SELECT id, name, email, role, department_id FROM users WHERE id = $1',
      [decoded.id]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Attach user data to request
    req.user = user.rows[0];
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

// For super_admin and department_admin
const isAdmin = (req, res, next) => {
  if (!['super_admin', 'department_admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: "Admin access required" 
    });
  }
  next();
};

// For department_admin only
const isDepartmentAdmin = (req, res, next) => {
  if (req.user.role !== 'department_admin') {
    return res.status(403).json({ 
      success: false, 
      message: "Department admin access required" 
    });
  }
  next();
};

// For officers only
const isOfficer = (req, res, next) => {
  if (req.user.role !== 'officer') {
    return res.status(403).json({ 
      success: false, 
      message: "Officer access required" 
    });
  }
  
  // Additional check for department assignment
  if (!req.user.department_id) {
    return res.status(403).json({
      success: false,
      message: "Officer not assigned to any department"
    });
  }
  
  next();
};

// For any authenticated user (admin, department_admin, or officer)
const isAuthenticated = (req, res, next) => {
  // Just passes through if token was verified
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isDepartmentAdmin,
  isOfficer,
  isAuthenticated
};