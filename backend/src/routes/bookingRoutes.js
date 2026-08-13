const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { bookingRequestSchema } = require('../utils/validators');
const {
  estimateFare,
  createBooking,
  acceptBooking,
  driverArrived,
  customerReached,
  startTrip,
  completeTrip,
  payTrip,
  cancelBooking,
  getBooking,
  updatePaymentPreferences,
  verifyOTP,
  rateBooking
} = require('../controllers/bookingController');

router.use(protect);

router.post('/estimate', validate(bookingRequestSchema), estimateFare);
router.post('/', validate(bookingRequestSchema), createBooking);
router.get('/:id', getBooking);
router.put('/:id/accept', acceptBooking);
router.put('/:id/arrived', driverArrived);
router.put('/:id/customer-reached', customerReached);
router.post('/:id/verify-otp', verifyOTP);
router.put('/:id/start', startTrip);
router.put('/:id/complete', completeTrip);
router.put('/:id/pay', payTrip);
router.post('/:id/rate', rateBooking);
router.put('/:id/rate', rateBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/payment-method', updatePaymentPreferences);

module.exports = router;
