const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const { getRedisClient } = require('../config/redis');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    // Check if token is blacklisted in Redis
    const redisClient = getRedisClient();
    if (redisClient) {
      const isBlacklisted = await redisClient.get(`bl_${token}`);
      if (isBlacklisted) {
        return res.status(401).json({ success: false, message: 'Token has been revoked. Please login again.' });
      }
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user/driver from database
    let user;
    if (decoded.role === 'customer' || decoded.role === 'admin') {
      user = await User.findById(decoded.id);
    } else if (decoded.role === 'driver') {
      user = await Driver.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked/suspended' });
    }

    // Add user to request
    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.userRole}' is not authorized to access this action`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
