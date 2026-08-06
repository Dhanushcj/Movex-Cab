require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');
const { initializeSocket } = require('./src/config/socket');
const { errorHandler } = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const driverRoutes = require('./src/routes/driverRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const { startCron } = require('./src/jobs/expiryNotifications');
const { startPromoCron } = require('./src/jobs/promoNotifications');
const { initScheduleWorker } = require('./src/services/scheduleWorker');

const uploadRoutes = require('./src/routes/uploadRoutes');
const publicRoutes = require('./src/routes/publicRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const fareRoutes = require('./src/routes/fareRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const scheduledRideRoutes = require('./src/routes/scheduledRideRoutes');

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Render) to fix rate-limiter IP resolution
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible in routes
app.set('io', io);

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');

// Middleware
// Security Headers
app.use(helmet());

// Cross-Site Scripting (XSS) Protection
app.use(xss());

// Strict CORS Policy
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8081', 'http://localhost:5173', 'https://movex-cab.vercel.app']; // default dev ports and vercel app

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());

// Payload size limit reduced to 1mb for DoS protection
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

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
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/scheduled-rides', scheduledRideRoutes);
app.use('/api/route-manager', require('./src/routes/routeManagerRoutes'));

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
startPromoCron();
initScheduleWorker();


// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Connect to Redis
    await connectRedis();

    server.listen(PORT, '0.0.0.0', () => {
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
