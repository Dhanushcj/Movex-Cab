const express = require('express');
const router = express.Router();
const {
  createJunction,
  getJunctions,
  createRoute,
  getRoutes,
  assignDriverToRoute
} = require('../controllers/routeManagerController');
const { protect, authorize } = require('../middleware/auth');

// Public endpoints (for customer app to fetch active routes/junctions)
router.get('/junctions', getJunctions);
router.get('/routes', getRoutes);

// Admin only endpoints
router.post('/junctions', protect, authorize('admin'), createJunction);
router.post('/routes', protect, authorize('admin'), createRoute);
router.put('/drivers/:id/assign', protect, authorize('admin'), assignDriverToRoute);

module.exports = router;
