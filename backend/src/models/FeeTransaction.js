const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeeTransactionSchema = new Schema({
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  vehicleType: { type: String, required: true },
  feeModel: { type: String, required: true },
  amount: { type: Number, required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  status: { type: String, enum: ['CHARGED', 'FAILED_INSUFFICIENT_BALANCE', 'WAIVED'], required: true },
}, { timestamps: true });

const FeeTransaction = mongoose.model('FeeTransaction', FeeTransactionSchema);
module.exports = FeeTransaction;
