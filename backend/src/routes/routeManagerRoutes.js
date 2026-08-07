const express = require('express');
const router = express.Router();
const {
  createJunction,
  getJunctions,
  createRoute,
  getRoutes,
  deleteRoute,
  assignDriverToRoute,
  updateJunction
} = require('../controllers/routeManagerController');
const { protect, authorize } = require('../middleware/auth');

// Public endpoints (for customer app to fetch active routes/junctions)
router.get('/junctions', getJunctions);
router.get('/routes', getRoutes);

// Admin only endpoints
router.post('/junctions', protect, authorize('admin'), createJunction);
router.post('/routes', protect, authorize('admin'), createRoute);
router.delete('/routes/:id', protect, authorize('admin'), deleteRoute);
router.put('/drivers/:id/assign', protect, authorize('admin'), assignDriverToRoute);
router.put('/junctions/:id', protect, authorize('admin'), updateJunction);

module.exports = router;
