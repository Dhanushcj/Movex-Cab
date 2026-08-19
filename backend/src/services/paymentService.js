const Payment = require('../models/Payment');
const User = require('../models/User');
const Driver = require('../models/Driver');

/**
 * Process a transaction payment split
 * @param {Object} params
 * @param {string} params.bookingId - MongoDB ObjectId
 * @param {string} params.customBookingId - e.g. MX-xxx-xxx
 * @param {string} params.customerId - User ObjectId
 * @param {string} params.driverId - Driver ObjectId
 * @param {number} params.amount - Total fare to charge
 * @param {string} params.method - cash, upi, card, wallet
 */
const processPayment = async ({ bookingId, customBookingId, customerId, driverId, amount, method }) => {
  try {
    const commissionRate = parseFloat(process.env.COMMISSION_RATE || '0.20');
    const taxRate = parseFloat(process.env.TAX_RATE || '0.05');

    // Calculations
    const commission = Number((amount * commissionRate).toFixed(2));
    const tax = Number((amount * taxRate).toFixed(2));
    const driverEarnings = Number((amount - commission - tax).toFixed(2));

    let status = 'pending';
    let transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Wallet payment deduction
    if (method === 'wallet') {
      const user = await User.findById(customerId);
      if (!user || user.wallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }
      user.wallet.balance = Number((user.wallet.balance - amount).toFixed(2));
      await user.save();
      status = 'completed';
    } else if (method === 'cash') {
      // Cash payment is settled in cash directly to the driver
      // Driver's balance will be deducted in platform commission balance (implemented in earnings updates)
      status = 'completed';
    } else {
      // UPI / Card - Mock successful API gateways
      status = 'completed';
    }

    // Record the payment
    const payment = await Payment.create({
      booking: bookingId,
      bookingId: customBookingId,
      customer: customerId,
      driver: driverId || null,
      amount,
      method,
      status,
      driverEarnings,
      commission,
      commissionRate,
      tax,
      transactionId,
      completedAt: status === 'completed' ? new Date() : null
    });

    // Update driver earnings if payment is completed
    if (status === 'completed' && driverId) {
      const driver = await Driver.findById(driverId);
      if (driver) {
        // Adjust driver earnings accumulator
        driver.earnings.total = Number((driver.earnings.total + driverEarnings).toFixed(2));
        driver.earnings.today = Number((driver.earnings.today + driverEarnings).toFixed(2));
        driver.earnings.thisWeek = Number((driver.earnings.thisWeek + driverEarnings).toFixed(2));
        driver.earnings.thisMonth = Number((driver.earnings.thisMonth + driverEarnings).toFixed(2));
        await driver.save();
      }
    }

    return payment;
  } catch (error) {
    console.error('❌ Payment processing error:', error.message);
    throw error;
  }
};

/**
 * Refund a processed payment
 */
const refundPayment = async (paymentId, reason) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error('Payment record not found');
    if (payment.status !== 'completed') throw new Error('Cannot refund a non-completed payment');

    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    await payment.save();

    // If wallet method, return money to user
    if (payment.method === 'wallet') {
      const user = await User.findById(payment.customer);
      if (user) {
        user.wallet.balance = Number((user.wallet.balance + payment.amount).toFixed(2));
        await user.save();
      }
    }

    // Deduct from driver earnings
    if (payment.driver) {
      const driver = await Driver.findById(payment.driver);
      if (driver) {
        driver.earnings.total = Math.max(0, Number((driver.earnings.total - payment.driverEarnings).toFixed(2)));
        driver.earnings.today = Math.max(0, Number((driver.earnings.today - payment.driverEarnings).toFixed(2)));
        await driver.save();
      }
    }

    return payment;
  } catch (error) {
    console.error('❌ Payment refund error:', error.message);
    throw error;
  }
};

module.exports = { processPayment, refundPayment };
