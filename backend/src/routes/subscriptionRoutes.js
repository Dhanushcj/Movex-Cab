const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  estimatePass,
  purchasePass,
  getUserPasses
} = require('../controllers/subscriptionController');

router.use(protect);

router.post('/estimate', estimatePass);
router.post('/purchase', purchasePass);
router.get('/', getUserPasses);

module.exports = router;
