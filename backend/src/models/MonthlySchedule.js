const mongoose = require('mongoose');

const monthlyScheduleSchema = new mongoose.Schema({
  scheduleId: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickup: {
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat]
    }
  },
  drop: {
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat]
    }
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'auto', 'mini', 'sedan', 'suv'],
    required: true
  },
  repeatDay: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  scheduledTime: {
    type: String, // HH:mm format
    required: true
  },
  startMonth: {
    type: Date, // Date object representing the start month
    required: true
  },
  numberOfMonths: {
    type: Number,
    required: true,
    default: 1
  },
  totalEstimatedFare: {
    type: Number,
    required: true,
    default: 0
  },
  discountAmount: {
    type: Number,
    required: true,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

monthlyScheduleSchema.pre('validate', function(next) {
  if (!this.scheduleId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.scheduleId = `MS-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('MonthlySchedule', monthlyScheduleSchema);
