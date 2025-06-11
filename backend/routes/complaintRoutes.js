const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaintController');

router.post('/complaints', ComplaintController.submitComplaint);
router.get('/complaints/:ticketId', ComplaintController.getComplaint);
router.get('/complaints', ComplaintController.getAllComplaints);

module.exports = router;