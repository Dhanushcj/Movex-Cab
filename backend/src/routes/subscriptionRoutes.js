const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAvailablePasses,
  purchasePass,
  getMyPass,
  cancelPass
} = require('../controllers/subscriptionController');

router.use(protect);

router.get('/available', getAvailablePasses);
router.post('/purchase', purchasePass);
router.get('/my-pass', getMyPass);
router.post('/cancel', cancelPass);

module.exports = router;
