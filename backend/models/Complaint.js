const db = require('../config/db');

class Complaint {
  static async create(complaintData) {
  const { rows } = await db.query(
    `INSERT INTO complaints (
      ticket_id, citizen_name, contact_number, email,
      complaint_text, location, category, assigned_department, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      complaintData.ticket_id,
      complaintData.citizen_name,
      complaintData.contact_number,
      complaintData.email,
      complaintData.complaint_text,
      complaintData.location,
      complaintData.category, // Can be null
      complaintData.assigned_department,
      complaintData.status
    ]
  );
  return rows[0];
}
}

// Make sure this export exists
module.exports = Complaint;