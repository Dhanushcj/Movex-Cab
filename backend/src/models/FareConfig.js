const mongoose = require('mongoose');

const fareConfigSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    enum: ['bike', 'auto', 'mini', 'sedan', 'suv'],
    required: true,
    unique: true
  },
  baseFare: {
    type: Number,
    required: true,
    min: 0
  },
  perKmCharge: {
    type: Number,
    required: true,
    min: 0
  },
  perMinCharge: {
    type: Number,
    required: true,
    min: 0
  },
  waitingChargePerMin: {
    type: Number,
    default: 2,
    min: 0
  },
  minFare: {
    type: Number,
    required: true,
    min: 0
  },
  surgeMultiplier: {
    type: Number,
    default: 1.0,
    min: 1.0,
    max: 5.0
  },
  surgeActive: {
    type: Boolean,
    default: false
  },
  cancellationFee: {
    type: Number,
    default: 25
  },
  capacity: {
    type: Number,
    default: 4
  },
  description: String,
  icon: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FareConfig', fareConfigSchema);
