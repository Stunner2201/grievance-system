const db = require('../config/db');

class Department {
  static async create({ name, description, keywords, contactEmail }) {
    const { rows } = await db.query(
      `INSERT INTO departments (name, description, keywords, contact_email)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, keywords, contactEmail]
    );
    return rows[0];
  }

  static async findMatchingDepartment(complaintText) {
    const { rows } = await db.query(
      `SELECT * FROM departments`
    );
    
    // Convert complaint text to lowercase for case-insensitive matching
    const text = complaintText.toLowerCase();
    
    // Find department with the most keyword matches
    const matchedDept = rows.reduce((bestMatch, dept) => {
      const matches = dept.keywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      ).length;
      
      return matches > (bestMatch.matches || 0) 
        ? { department: dept, matches } 
        : bestMatch;
    }, {});

    return matchedDept.department || null;
  }

  static async getAll() {
    const { rows } = await db.query('SELECT * FROM departments');
    return rows;
  }
}

module.exports = Department;