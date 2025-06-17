const db=require('../config/db')
const bcrypt = require('bcryptjs');
exports.getDashboardStats = async (req, res) => {
  try {
    const { department_id, role } = req.user;
    
    // Base query conditions
    let complaintCondition = '';
    let userCondition = '';
    const params = [];

    if (role === 'officer') {
      complaintCondition = 'WHERE assigned_department = $1';
      userCondition = 'WHERE department_id = $1';
      params.push(department_id);
    } else if (role === 'department_admin') {
      complaintCondition = 'WHERE assigned_department = $1';
      params.push(department_id);
    }

    // Main dashboard stats
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM complaints ${complaintCondition}) as total_complaints,
        (SELECT COUNT(*) FROM complaints ${complaintCondition ? complaintCondition + ' AND ' : 'WHERE '}(status = 'Pending' OR status = '0')) as open_complaints,
        (SELECT COUNT(*) FROM complaints ${complaintCondition ? complaintCondition + ' AND ' : 'WHERE '}status = 'In Progress') as in_progress_complaints,
        (SELECT COUNT(*) FROM complaints ${complaintCondition ? complaintCondition + ' AND ' : 'WHERE '}status = 'Resolved') as resolved_complaints,
        (SELECT COUNT(*) FROM users ${userCondition}) as department_users
    `;

    // Recent complaints (only show assigned department)
    const recentComplaintsQuery = `
      SELECT 
        id, ticket_id, citizen_name, status, 
        created_at, category
      FROM complaints
      ${complaintCondition}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const [stats, recentComplaints] = await Promise.all([
      db.query(statsQuery, params),
      db.query(recentComplaintsQuery, params)
    ]);

    res.status(200).json({
      success: true,
      stats: stats.rows[0],
      recentComplaints: recentComplaints.rows,
      // Department stats removed for officers
      departmentStats: role === 'super_admin' ? await getDepartmentStats() : []
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Only for super admin
async function getDepartmentStats() {
  const { rows } = await db.query(`
    SELECT 
      d.id, d.name,
      COUNT(c.id) as total_complaints,
      SUM(CASE WHEN c.status IN ('Pending', '0') THEN 1 ELSE 0 END) as open_complaints
    FROM departments d
    LEFT JOIN complaints c ON d.id = c.assigned_department
    GROUP BY d.id, d.name
  `);
  return rows;
}

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Check if user exists
    const userExists = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.query(
      `INSERT INTO users (name, email, password, role, department_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, department_id`,
      [name, email, passwordHash, role, department_id]
    );

    res.status(201).json({
      success: true,
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getDepartmentDashboard = async (req, res) => {
  try {
    const { department_id } = req.user;

    // Validate department assignment
    if (!department_id) {
      return res.status(403).json({
        success: false,
        message: "User not assigned to any department"
      });
    }

    // Get department stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status IN ('Pending', '0') THEN 1 ELSE 0 END) as open_complaints,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_complaints,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_complaints,
        (SELECT COUNT(*) FROM users WHERE department_id = $1) as department_users
      FROM complaints
      WHERE assigned_department = $1
    `;

    // Get recent complaints
    const recentQuery = `
      SELECT 
        id, ticket_id, citizen_name, status, 
        created_at, category, location
      FROM complaints
      WHERE assigned_department = $1
      ORDER BY created_at DESC
      LIMIT 5
    `;

    const [stats, recent] = await Promise.all([
      db.query(statsQuery, [department_id]),
      db.query(recentQuery, [department_id])
    ]);

    res.status(200).json({
      success: true,
      stats: stats.rows[0],
      recentComplaints: recent.rows
    });

  } catch (error) {
    console.error('Department dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};