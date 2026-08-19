const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const {
  firebaseLogin,
  sendOTP,
  verifyOTP,
  login,
  registerDriver,
  resubmitDriverApplication,
  register,
  getMe,
  refreshToken,
  logout,
  logoutAll
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  sendOtpSchema,
  verifyOtpSchema,
  loginUserSchema,
  registerDriverSchema,
  resubmitDriverSchema,
  registerUserSchema
} = require('../utils/validators');

router.post('/firebase-login', authLimiter, firebaseLogin);
router.post('/send-otp', authLimiter, validate(sendOtpSchema), sendOTP);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), verifyOTP);
router.post('/login', authLimiter, validate(loginUserSchema), login);
router.post('/driver/register', validate(registerDriverSchema), registerDriver);
router.post('/driver/resubmit', validate(resubmitDriverSchema), resubmitDriverApplication);
router.post('/register', validate(registerUserSchema), register);

router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/logout-all', protect, logoutAll);

router.get('/me', protect, getMe);

module.exports = router;
