const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  minRideAmount: {
    type: Number,
    default: 0
  },
  vehicleTypes: [{
    type: String,
    enum: ['bike', 'auto', 'mini', 'sedan', 'suv']
  }],
  usageLimit: {
    type: Number,
    default: null
  },
  perUserLimit: {
    type: Number,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now }
  }],
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

offerSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });

module.exports = mongoose.model('Offer', offerSchema);
