const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt');
const db = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;
    
    // Check if user exists
    const userExists = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.query(
      `INSERT INTO users (name, email, password, role, department_id)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, role, department_id, created_at`,
      [name, email, passwordHash, role, department_id]
    );

    res.status(201).json({ 
      success: true, 
      user: newUser.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userQuery = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = userQuery.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Create token payload (excluding password)
    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department_id
    };

    // Create token
    const token = jwt.sign(
      userPayload,
      jwtConfig.secret,
      { expiresIn: jwtConfig.jwtExpiration }
    );

    res.status(200).json({
      success: true,
      token,
      user: userPayload
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    // Verify the user object exists in request
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    const userQuery = await db.query(
      `SELECT id, name, email, role, department_id, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]  // Use the ID from the verified token
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      user: userQuery.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};