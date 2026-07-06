const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMe, updateMe, getMyRides, saveAddress } = require('../controllers/userController');

// All routes are protected user routes
router.use(protect);

router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/me/rides', getMyRides);
router.put('/me/saved-addresses', saveAddress);

module.exports = router;
