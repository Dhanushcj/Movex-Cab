const mongoose = require('mongoose');

const scheduledRideSchema = new mongoose.Schema({
  rideId: {
    type: String,
    unique: true,
    required: true
  },
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonthlySchedule',
    default: null
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
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
  pickupDateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: [
      'scheduled',
      'searching',
      'driver_assigned',
      'cancelled',
      'assignment_failed',
      'completed'
    ],
    default: 'scheduled'
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  driverAssigned: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  estimatedFare: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for fast querying by cron jobs and user fetch
scheduledRideSchema.index({ pickupDateTime: 1, notificationSent: 1, status: 1 });
scheduledRideSchema.index({ customer: 1, status: 1 });
scheduledRideSchema.index({ scheduleId: 1 });

scheduledRideSchema.pre('validate', function(next) {
  if (!this.rideId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.rideId = `SR-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('ScheduledRide', scheduledRideSchema);
