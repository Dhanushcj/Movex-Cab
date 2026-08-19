const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { topUpWallet, getPaymentHistory } = require('../controllers/paymentController');

router.use(protect);

router.post('/wallet/add', topUpWallet);
router.get('/history', getPaymentHistory);

module.exports = router;
