const mongoose = require('mongoose');

const boardingTicketSchema = new mongoose.Schema({
  ticketId: {
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
    required: true
  },
  passId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPass',
    required: true
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  pickupJunctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Junction',
    required: true
  },
  dropoffJunctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Junction',
    required: true
  },
  seatCount: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: [
      'ticket_generated', // Customer generated ticket, waiting at pickup
      'boarded',          // Customer scanned QR and boarded
      'completed',        // Customer alighted at dropoff
      'cancelled'         // Ticket cancelled before boarding
    ],
    default: 'ticket_generated'
  },
  // QR code string to scan for boarding
  qrCodeData: {
    type: String,
    required: true
  },
  // Timestamps
  generatedAt: { type: Date, default: Date.now },
  boardedAt: Date,
  completedAt: Date,
  cancelledAt: Date
}, {
  timestamps: true
});

// Indexes for fast lookup
boardingTicketSchema.index({ customer: 1, status: 1 });
boardingTicketSchema.index({ driver: 1, status: 1 });
boardingTicketSchema.index({ routeId: 1, pickupJunctionId: 1 });

// Generate ticket ID and QR before save
boardingTicketSchema.pre('validate', function(next) {
  if (!this.ticketId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ticketId = `TKT-${timestamp}-${random}`;
    this.qrCodeData = `QR-${this.ticketId}-${this.customer}`;
  }
  next();
});

module.exports = mongoose.model('Booking', boardingTicketSchema);
