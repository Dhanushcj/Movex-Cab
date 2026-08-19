const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  bookingId: {
    type: String,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    enum: ['cash', 'upi', 'qr', 'card', 'wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  // Revenue split
  driverEarnings: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0
  },
  commissionRate: {
    type: Number,
    default: 0.20
  },
  tax: {
    type: Number,
    default: 0
  },
  // Transaction reference
  transactionId: String,
  gatewayResponse: mongoose.Schema.Types.Mixed,
  // Refund info
  refundAmount: { type: Number, default: 0 },
  refundReason: String,
  refundedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

paymentSchema.index({ booking: 1 });
paymentSchema.index({ customer: 1 });
paymentSchema.index({ driver: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
