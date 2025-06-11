require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/db');
const complaintRoutes = require('./routes/complaintRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes'); // Add this line

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', complaintRoutes);
app.use('/api', departmentRoutes);
app.use('/api/chatbot', chatbotRoutes); // Add this line

// Test endpoint
app.get('/', (req, res) => {
  res.send('Rohtak Grievance System API is running');
});

// Database and server startup
db.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection error', err.stack);
    process.exit(1);
  } else {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API endpoints available at http://localhost:${PORT}/api`);
      console.log(`Chatbot endpoint: http://localhost:${PORT}/api/chatbot/chat`);
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});