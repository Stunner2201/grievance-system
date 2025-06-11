const Complaint = require('../models/Complaint');
const Department = require('../models/Department');

class TicketService {
  static generateTicketId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RTK-${timestamp}-${random}`;
  }

  static async createComplaint(complaintData) {
    try {
      const ticketId = this.generateTicketId();
      const department = await Department.findMatchingDepartment(complaintData.complaint_text);
      
      const completeData = {
        ...complaintData,
        ticket_id: ticketId,
        assigned_department: department?.id || null,
        category: null, // Explicitly setting as null
        status: 'Pending'
      };

      return await Complaint.create(completeData);
    } catch (error) {
      console.error('Error in createComplaint:', error);
      throw error;
    }
  }
}

module.exports = TicketService;