const express = require('express');
const router = express.Router();
const ChatbotController = require('../controllers/ChatbotController');

router.post('/chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    const { reply, nextStep } = await ChatbotController.handleMessage(sessionId, message);
    res.json({ reply, nextStep });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/debug/:sessionId', (req, res) => {
  res.json(SessionService.getSession(req.params.sessionId) || {});
});

module.exports = router;