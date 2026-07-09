const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  estimatePass,
  purchasePass,
  getUserPasses,
  customizePass
} = require('../controllers/subscriptionController');

router.use(protect);

router.post('/estimate', estimatePass);
router.post('/purchase', purchasePass);
router.get('/', getUserPasses);
router.post('/:id/customize', customizePass);

module.exports = router;
