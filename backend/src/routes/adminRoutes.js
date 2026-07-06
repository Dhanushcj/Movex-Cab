const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  getFares,
  createFare,
  deleteFare,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
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

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.get('/fares', getFares);
router.post('/fares', createFare);
router.delete('/fares/:id', deleteFare);

router.get('/banners', getBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

router.get('/notifications', getNotifications);
router.post('/notifications', createNotification);
router.put('/notifications/:id', updateNotification);
router.delete('/notifications/:id', deleteNotification);

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
