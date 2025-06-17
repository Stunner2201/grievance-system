require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/db');
const complaintRoutes = require('./routes/complaintRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', complaintRoutes);
app.use('/api', departmentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/auth', authRoutes);       // New auth routes
app.use('/api/admin', adminRoutes);     // New admin routes

// Test endpoint
app.get('/', (req, res) => {
  res.send('Rohtak Grievance System API is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    services: {
      database: 'connected',
      api: 'running',
      authentication: 'enabled'
    }
  });
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
      console.log(`Auth endpoints: http://localhost:${PORT}/api/auth/login | register`);
      console.log(`Admin endpoints: http://localhost:${PORT}/api/admin/dashboard`);
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});