const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'MoveX Admin'
  },
  supportEmail: {
    type: String,
    default: 'support@movex.com'
  },
  defaultCancellationFee: {
    type: Number,
    default: 50
  },
  commissionPercentage: {
    type: Number,
    default: 20 // 20%
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
