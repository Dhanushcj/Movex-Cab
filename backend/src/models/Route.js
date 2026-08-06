const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  junctions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Junction'
  }],
  polyline: {
    type: String, // Encoded polyline representing the road path connecting junctions
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);
