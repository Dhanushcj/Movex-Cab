const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  bookingId: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userType',
    required: true
  },
  userType: {
    type: String,
    enum: ['User', 'Driver'],
    required: true
  },
  type: {
    type: String,
    enum: [
      'safety',
      'payment',
      'driver_behavior',
      'vehicle_condition',
      'route_issue',
      'fare_dispute',
      'app_issue',
      'other'
    ],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  attachments: [String],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'escalated'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: String,
  resolution: String,
  resolvedAt: Date
}, {
  timestamps: true
});

complaintSchema.index({ status: 1 });
complaintSchema.index({ user: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
