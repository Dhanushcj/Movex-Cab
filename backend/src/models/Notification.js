const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'system'
  },
  targetAudience: {
    type: String,
    enum: ['customer', 'driver', 'both', 'specific'],
    default: 'specific'
  },
  specificUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // or Driver
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
