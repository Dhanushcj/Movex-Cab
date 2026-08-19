const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  totalEarnings: {
    type: Number,
    required: true,
    default: 0
  },
  cashCollected: {
    type: Number,
    required: true,
    default: 0
  },
  commission: {
    type: Number,
    required: true,
    default: 0
  },
  incentives: {
    type: Number,
    default: 0
  },
  adjustments: {
    type: Number,
    default: 0
  },
  netPayable: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'hold', 'cancelled'],
    default: 'pending'
  },
  bankAccountDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  referenceNumber: {
    type: String
  },
  payoutDate: {
    type: Date
  },
  periodStart: {
    type: Date
  },
  periodEnd: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
