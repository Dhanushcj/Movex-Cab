const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
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
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  // Locations
  pickup: {
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat]
    }
  },
  drop: {
    address: { type: String, required: false },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: false } // [lng, lat]
    }
  },
  // Vehicle
  vehicleType: {
    type: String,
    enum: ['bike', 'auto', 'mini', 'sedan', 'suv'],
    required: true
  },
  // Advanced Ride Options
  preferences: [{
    type: String,
    enum: ['quiet', 'ac_off', 'pet_friendly']
  }],
  isWomenOnly: {
    type: Boolean,
    default: false
  },
  // Status
  status: {
    type: String,
    enum: [
      'requested',     // Customer placed request
      'searching',     // Looking for drivers
      'negotiating',   // Waiting for customer to respond to a counter
      'accepted',      // Driver accepted (or customer accepted counter)
      'arriving',      // Driver en route to pickup
      'arrived',       // Driver at pickup
      'in_progress',   // Trip started
      'payment_pending', // Waiting for customer QR payment
      'completed',     // Trip ended
      'cancelled'      // Cancelled by customer or system
    ],
    default: 'requested'
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'driver', 'system', null],
    default: null
  },
  cancellationReason: String,
  // Route info
  route: {
    distance: { type: Number, default: 0 },     // in km
    duration: { type: Number, default: 0 },      // in minutes
    polyline: { type: String, default: '' },     // encoded polyline
    actualDistance: { type: Number, default: 0 }, // actual distance after trip
    actualDuration: { type: Number, default: 0 }  // actual duration after trip
  },
  // Fare breakdown
  fare: {
    offeredFare: { type: Number, default: 0 },
    baseFare: { type: Number, default: 0 },
    distanceCharge: { type: Number, default: 0 },
    timeCharge: { type: Number, default: 0 },
    waitingCharge: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    surgeMultiplier: { type: Number, default: 1.0 },
    surgeAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    promoCode: { type: String, default: null },
    tax: { type: Number, default: 0 },
    totalFare: { type: Number, default: 0 },
    estimatedFare: { type: Number, default: 0 },
    finalFare: { type: Number, default: 0 }
  },
  // Bidding state
  currentNegotiation: {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null
    },
    fare: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['pending', 'countered', 'rejected', 'accepted'],
      default: 'pending'
    }
  },
  // Payment
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'qr', 'card', 'wallet'],
    default: 'cash'
  },
  tipAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  // OTP for ride verification
  rideOTP: {
    type: String,
    default: null
  },
  // Timestamps
  requestedAt: { type: Date, default: Date.now },
  acceptedAt: Date,
  arrivedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  // Waiting time in minutes
  waitingTime: { type: Number, default: 0 },
  // Rating
  customerRating: { type: Number, min: 1, max: 5 },
  driverRating: { type: Number, min: 1, max: 5 },
  customerReview: String,
  driverReview: String,
  // Tracking path (array of coordinates during trip)
  trackingPath: [{
    coordinates: [Number],
    timestamp: Date
  }]
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ driver: 1, status: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ 'pickup.location': '2dsphere' });
bookingSchema.index({ 'drop.location': '2dsphere' });

// Generate booking ID before save
bookingSchema.pre('validate', function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingId = `MX-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
