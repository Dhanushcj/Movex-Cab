const express = require('express');
const router = express.Router();
const scheduledRideController = require('../controllers/scheduledRideController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.post('/one-time', scheduledRideController.createOneTimeRide);
router.post('/monthly', scheduledRideController.createMonthlySchedule);
router.get('/', scheduledRideController.getUserScheduledRides);
router.post('/:id/cancel', scheduledRideController.cancelScheduledRide);

module.exports = router;
