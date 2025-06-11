const SessionService = require('../services/SessionService');
const TicketService = require('../services/ticketService');
const Department = require('../models/Department'); 
class ChatbotController {
  static async handleMessage(sessionId, message) {
    try {
      if (!sessionId || !message) {
        throw new Error('Session ID and message are required');
      }

      let session = SessionService.getSession(sessionId);
      if (!session) {
        session = SessionService.createSession(sessionId);
        return this._formatResponse(
          'Welcome to Rohtak Grievance System!\n\nPlease enter your full name:',
          'GET_NAME'
        );
      }

      switch (session.step) {
        case 'GET_NAME': return this._handleName(sessionId, message);
        case 'GET_PHONE': return this._handlePhone(sessionId, message);
        case 'GET_EMAIL': return this._handleEmail(sessionId, message);
        case 'GET_COMPLAINT': return this._handleComplaint(sessionId, message);
        case 'GET_LOCATION': return this._handleLocation(sessionId, message);
        case 'GET_CATEGORY': return this._handleCategory(sessionId, message);
        case 'CONFIRM_SUBMIT': return this._handleConfirmation(sessionId, message);
        default: return this._formatResponse('Session expired. Please start again.', 'GET_NAME');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      return this._formatResponse('An error occurred. Please start again.', 'GET_NAME');
    }
  }

  static _formatResponse(reply, nextStep) {
    return { reply, nextStep };
  }

  static _validateName(name) {
    return name && name.trim().length >= 3;
  }

  static _validatePhone(phone) {
    return /^\d{10}$/.test(phone);
  }

  static _validateEmail(email) {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static _validateComplaint(text) {
    return text && text.trim().length >= 10;
  }

  static _validateLocation(location) {
    return location && location.trim().length >= 5;
  }

  static _handleName(sessionId, name) {
    if (!this._validateName(name)) {
      return this._formatResponse('Please enter a valid full name (min 3 characters):', 'GET_NAME');
    }
    SessionService.updateSession(sessionId, {
      step: 'GET_PHONE',
      data: { citizen_name: name.trim() }
    });
    return this._formatResponse('Please enter your 10-digit contact number:', 'GET_PHONE');
  }

  static _handlePhone(sessionId, phone) {
    if (!this._validatePhone(phone)) {
      return this._formatResponse(
        'Please enter a valid 10-digit phone number:',
        'GET_PHONE'
      );
    }
    SessionService.updateSession(sessionId, {
      step: 'GET_EMAIL',
      data: { contact_number: phone.trim() }
    });
    return this._formatResponse(
      'Please enter your email address (or type "skip" if you don\'t want to provide one):',
      'GET_EMAIL'
    );
  }

  static _handleEmail(sessionId, email) {
    if (email.toLowerCase() === 'skip') {
      SessionService.updateSession(sessionId, {
        step: 'GET_COMPLAINT',
        data: { email: null }
      });
      return this._formatResponse(
        'Please describe your complaint in detail:',
        'GET_COMPLAINT'
      );
    }

    if (!this._validateEmail(email)) {
      return this._formatResponse(
        'Please enter a valid email address or type "skip":',
        'GET_EMAIL'
      );
    }

    SessionService.updateSession(sessionId, {
      step: 'GET_COMPLAINT',
      data: { email: email.trim() }
    });
    return this._formatResponse(
      'Please describe your complaint in detail:',
      'GET_COMPLAINT'
    );
  }

  static _handleComplaint(sessionId, complaintText) {
    if (!this._validateComplaint(complaintText)) {
      return this._formatResponse(
        'Please provide a more detailed description (at least 10 characters):',
        'GET_COMPLAINT'
      );
    }

    SessionService.updateSession(sessionId, {
      step: 'GET_LOCATION',
      data: { complaint_text: complaintText.trim() }
    });
    return this._formatResponse(
      'Please enter the location of the issue:',
      'GET_LOCATION'
    );
  }

 static _handleLocation(sessionId, location) {
    if (!this._validateLocation(location)) {
      return this._formatResponse(
        'Please provide a more specific location (at least 5 characters):',
        'GET_LOCATION'
      );
    }

   SessionService.updateSession(sessionId, {
      step: 'CONFIRM_SUBMIT', // Skip category selection entirely
      data: { location: location.trim() }
    });

    const session = SessionService.getSession(sessionId);
    const summary = `COMPLAINT SUMMARY:\n\n` +
      `Name: ${session.data.citizen_name}\n` +
      `Phone: ${session.data.contact_number}\n` +
      `Email: ${session.data.email || 'Not provided'}\n` +
      `Issue: ${session.data.complaint_text}\n` +
      `Location: ${session.data.location}\n\n` +
      `Please confirm to submit (reply YES/NO):`;

    return this._formatResponse(summary, 'CONFIRM_SUBMIT');
  }
 // Remove the category handling and modify confirmation:
static async _handleConfirmation(sessionId, message) {
  if (message.toLowerCase() !== 'yes') {
    SessionService.clearSession(sessionId);
    return this._formatResponse('Complaint discarded. Please start again.', 'GET_NAME');
  }

  const session = SessionService.getSession(sessionId);
  const complaintData = {
    citizen_name: session.data.citizen_name,
    contact_number: session.data.contact_number,
    email: session.data.email || null,
    complaint_text: session.data.complaint_text,
    location: session.data.location
    // No category needed anymore
  };

  try {
    const complaint = await TicketService.createComplaint(complaintData);
    SessionService.clearSession(sessionId);
    
    return this._formatResponse(
      `✅ Complaint Registered!\n\nTicket ID: ${complaint.ticket_id}\n` +
      `Department: ${complaint.assigned_department || 'General'}\n` +
      `Status: Pending\n\n` +
      `You'll receive updates on ${session.data.contact_number}`,
      'COMPLETE'
    );
  } catch (error) {
    console.error('Submission error:', error);
    return this._formatResponse('❌ Failed to submit complaint. Please try again.', 'GET_NAME');
  }
}
}

module.exports = ChatbotController;