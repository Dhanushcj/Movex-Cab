const Payment = require('../models/Payment');
const User = require('../models/User');

/**
 * Top up user wallet
 * POST /api/payments/wallet/add
 */
const topUpWallet = async (req, res, next) => {
  const { amount } = req.body;
  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid top up amount' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.wallet.balance = Number((user.wallet.balance + parseFloat(amount)).toFixed(2));
    await user.save();

    // Create pseudo payment log
    await Payment.create({
      booking: null,
      bookingId: 'WALLET-TOPUP',
      customer: req.user.id,
      amount,
      method: 'upi',
      status: 'completed',
      transactionId: `TXN-TOPUP-${Date.now()}`
    });

    res.json({ success: true, message: 'Wallet topped up successfully', balance: user.wallet.balance });
  } catch (error) {
    next(error);
  }
};

/**
 * Get billing transaction list
 * GET /api/payments/history
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const history = await Payment.find({ customer: req.user.id })
      .populate('booking')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = { topUpWallet, getPaymentHistory };
