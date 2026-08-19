const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeeTierSchema = new Schema({
  vehicleType: { type: String, enum: ['bike', 'auto', 'mini', 'sedan', 'suv', 'cab'], required: true },
  city: { type: String, required: true },
  feeModel: { type: String, enum: ['commission', 'daily_fixed', 'monthly_threshold'], required: true },

  // commission model
  commissionPercent: { type: Number, default: 0 }, // e.g. 15 for 15%

  // daily_fixed model (auto)
  dailyFeeMin: { type: Number, default: 0 },
  dailyFeeMax: { type: Number, default: 0 },

  // monthly_threshold model (cab)
  monthlyFeeAmount: { type: Number, default: 0 },
  monthlyEarningsThreshold: { type: Number, default: 0 },

  graceHours: { type: Number, default: 24 }, // how long a driver can stay in GRACE_PERIOD
  active: { type: Boolean, default: true },
}, { timestamps: true });

const FeeTier = mongoose.model('FeeTier', FeeTierSchema);
module.exports = FeeTier;
