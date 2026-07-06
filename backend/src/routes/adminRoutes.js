const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getDrivers,
  updateDriverStatus,
  getCustomers,
  getCustomerHistory,
  updateCustomerStatus,
  getBookings,
  getVehicles,
  updateFareConfig,
  createOffer,
  getOffers,
  getComplaints,
  updateComplaint,
  getPayouts,
  getPayments,
  getMapData
} = require('../controllers/adminController');

// All endpoints in admin router are protected and limited to the admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);

router.get('/drivers', getDrivers);
router.put('/drivers/:id', updateDriverStatus);

router.get('/customers', getCustomers);
router.get('/customers/:id/history', getCustomerHistory);
router.put('/customers/:id', updateCustomerStatus);

router.get('/vehicles', getVehicles);

router.get('/bookings', getBookings);

router.put('/fares/:id', updateFareConfig);

router.post('/offers', createOffer);
router.get('/offers', getOffers);

router.get('/complaints', getComplaints);
router.put('/complaints/:id', updateComplaint);

router.get('/payouts', getPayouts);
router.get('/payments', getPayments);
router.get('/map', getMapData);

module.exports = router;
