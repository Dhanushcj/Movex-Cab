const mongoose = require('mongoose');

const notificationMessageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['customer', 'driver', 'both'],
    default: 'both'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NotificationMessage', notificationMessageSchema);
