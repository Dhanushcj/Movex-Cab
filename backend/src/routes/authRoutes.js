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
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  sendOtpSchema,
  verifyOtpSchema,
  loginUserSchema,
  registerDriverSchema,
  resubmitDriverSchema,
  registerUserSchema
} = require('../utils/validators');

router.post('/firebase-login', firebaseLogin);
router.post('/send-otp', validate(sendOtpSchema), sendOTP);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOTP);
router.post('/login', validate(loginUserSchema), login);
router.post('/driver/register', validate(registerDriverSchema), registerDriver);
router.post('/driver/resubmit', validate(resubmitDriverSchema), resubmitDriverApplication);
router.post('/register', validate(registerUserSchema), register);
router.get('/me', protect, getMe);

module.exports = router;
