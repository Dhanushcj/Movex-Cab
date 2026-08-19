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
  getMapData,
  seedFeeTiers,
  getPasses,
  updatePass,
  getAlerts
} = require('../controllers/adminController');
const {
  createJunction,
  getJunctions,
  createRoute,
  getRoutes
} = require('../controllers/routeManagerController');

// All endpoints in admin router are protected and limited to the admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.get('/fares', getFares);
router.post('/fares', createFare);
router.delete('/fares/:id', deleteFare);

router.get('/alerts', getAlerts);

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

router.get('/passes', getPasses);
router.put('/passes/:id', updatePass);

router.post('/fee-tiers/seed', seedFeeTiers);

// Route & Junction management
router.get('/routes', async (req, res, next) => {
  try {
    const Route = require('../models/Route');
    const routes = await Route.find({}).populate('junctions').sort({ createdAt: -1 });
    res.json({ success: true, count: routes.length, data: routes });
  } catch (e) { next(e); }
});
router.post('/routes', createRoute);
router.delete('/routes/:id', async (req, res, next) => {
  try {
    const Route = require('../models/Route');
    const route = await Route.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!route) return res.status(404).json({ success: false, error: 'Route not found' });
    res.json({ success: true, data: route });
  } catch (e) { next(e); }
});

router.get('/junctions', getJunctions);
router.post('/junctions', createJunction);
router.delete('/junctions/:id', async (req, res, next) => {
  try {
    const Junction = require('../models/Junction');
    const j = await Junction.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!j) return res.status(404).json({ success: false, error: 'Junction not found' });
    res.json({ success: true, data: j });
  } catch (e) { next(e); }
});

module.exports = router;
