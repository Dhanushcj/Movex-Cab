const mongoose = require('mongoose');
const { Schema } = mongoose;

const DriverWalletSchema = new Schema({
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true, unique: true },
  balance: { type: Number, default: 0 },              // driver's own top-up balance for auto-deducting fees
  feeStatus: { type: String, enum: ['ACTIVE', 'GRACE_PERIOD', 'BLOCKED'], default: 'ACTIVE' },
  currentPeriodEarnings: { type: Number, default: 0 }, // resets monthly for cab tier
  lastFeeChargedAt: { type: Date, default: null },
  graceStartedAt: { type: Date, default: null },
  pendingFeeAmount: { type: Number, default: 0 },
}, { timestamps: true });

const DriverWallet = mongoose.model('DriverWallet', DriverWalletSchema);
module.exports = DriverWallet;
