const Complaint = require('../models/Complaint'); 
const TicketService = require('../services/ticketService');
const MLRoutingService = require('../services/mlRoutingService');

class ComplaintController {
  static async submitComplaint(req, res) {
    try {
        console.log('Received complaint data:', req.body);  // Log incoming data
        
        const { citizenName, contactNumber, email, complaintText, location, category } = req.body;
        
        console.log('Predicting department...');
        const assignedDepartment = await MLRoutingService.predictDepartment(complaintText);
        console.log('Assigned department:', assignedDepartment);
        
        const complaintData = {
            citizenName,
            contactNumber,
            email,
            complaintText,
            location,
            category,
            assignedDepartment
        };
        console.log('Complaint data before creation:', complaintData);
        
        const complaint = await TicketService.createComplaint(complaintData);
        console.log('Created complaint:', complaint);

        res.json({
            success: true,
            ticketId: complaint.ticket_id,
            departmentId: complaint.assigned_department,
            message: 'Complaint submitted successfully'
        });
    } catch (error) {
        console.error('FULL ERROR DETAILS:', {
            message: error.message,
            stack: error.stack,
            raw: error
        });
        res.status(500).json({
            success: false,
            message: 'Error submitting complaint',
            error: error.message
        });
    }
}

  static async getComplaint(req, res) {
    try {
      const { ticketId } = req.params;
      const complaint = await Complaint.findByTicketId(ticketId);
      
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      res.json({
        success: true,
        complaint
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching complaint',
        error: error.message
      });
    }
  }

  static async getAllComplaints(req, res) {
    try {
      const complaints = await Complaint.getAll();
      res.json({
        success: true,
        complaints
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching complaints',
        error: error.message
      });
    }
  }
}

module.exports = ComplaintController;