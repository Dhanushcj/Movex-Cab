require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./src/config/database');
const { initializeSocket } = require('./src/config/socket');
const { errorHandler } = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const driverRoutes = require('./src/routes/driverRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const ratingRoutes = require('./src/routes/ratingRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const { startCron } = require('./src/jobs/expiryNotifications');
const uploadRoutes = require('./src/routes/uploadRoutes');
const publicRoutes = require('./src/routes/publicRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/fares', fareRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MoveX API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Start Cron Jobs
startCron();

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    server.listen(PORT, () => {
      console.log(`\n🚀 MoveX Backend Server running on port ${PORT}`);
      console.log(`📡 Socket.IO ready for real-time connections`);
      console.log(`🌐 API: http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
