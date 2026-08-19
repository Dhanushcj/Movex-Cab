const mongoose = require('mongoose');

const userPassSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pass',
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  usageStats: {
    cancellationsUsed: { type: Number, default: 0 },
    totalSavedAmount: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('UserPass', userPassSchema);
