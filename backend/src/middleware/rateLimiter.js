const rateLimit = require('express-rate-limit');

// Rate limiter for general authentication routes (login, register, otp)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
  }
});

module.exports = { authLimiter };
