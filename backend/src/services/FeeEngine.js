const FeeTier = require('../models/FeeTier');
const DriverWallet = require('../models/DriverWallet');
const FeeTransaction = require('../models/FeeTransaction');

class DriverFeeEngine {
  /**
   * Call this on driver login / going online.
   * Returns { status, message } describing whether the driver can accept rides.
   */
  static async evaluateOnLogin(driverId, vehicleType, city) {
    const tier = await FeeTier.findOne({ vehicleType, city, active: true });
    if (!tier) throw new Error(`No active fee tier configured for ${vehicleType} in ${city}`);

    let wallet = await DriverWallet.findOne({ driverId });
    if (!wallet) wallet = await DriverWallet.create({ driverId });

    switch (tier.feeModel) {
      case 'commission':
        // No login-time fee — commission is deducted per completed ride instead.
        wallet.feeStatus = 'ACTIVE';
        await wallet.save();
        return { status: 'ACTIVE', message: 'Commission model — no login fee required.' };

      case 'daily_fixed':
        return this._handleDailyFixed(wallet, tier);

      case 'monthly_threshold':
        return this._handleMonthlyThreshold(wallet, tier);

      default:
        throw new Error(`Unknown fee model: ${tier.feeModel}`);
    }
  }

  static async _handleDailyFixed(wallet, tier) {
    const now = new Date();
    const alreadyChargedToday =
      wallet.lastFeeChargedAt &&
      wallet.lastFeeChargedAt.toDateString() === now.toDateString();

    if (alreadyChargedToday && wallet.feeStatus === 'ACTIVE') {
      return { status: 'ACTIVE', message: 'Daily fee already settled.' };
    }

    // Dynamic fee within the tier's configured range (e.g. surge/city-based)
    const fee = this._computeDynamicFee(tier.dailyFeeMin, tier.dailyFeeMax);

    if (wallet.balance >= fee) {
      wallet.balance -= fee;
      wallet.feeStatus = 'ACTIVE';
      wallet.lastFeeChargedAt = now;
      wallet.graceStartedAt = null;
      wallet.pendingFeeAmount = 0;
      await wallet.save();

      await FeeTransaction.create({
        driverId: wallet.driverId,
        vehicleType: tier.vehicleType,
        feeModel: 'daily_fixed',
        amount: fee,
        periodStart: now,
        periodEnd: now,
        status: 'CHARGED',
      });

      return { status: 'ACTIVE', message: `Daily fee of ₹${fee} charged. Unlimited rides today.` };
    }

    return this._enterOrContinueGrace(wallet, tier, fee);
  }

  static async _handleMonthlyThreshold(wallet, tier) {
    const now = new Date();

    if (wallet.currentPeriodEarnings < tier.monthlyEarningsThreshold) {
      wallet.feeStatus = 'ACTIVE';
      await wallet.save();
      return { status: 'ACTIVE', message: 'Below monthly earnings threshold — no fee due yet.' };
    }

    const alreadyChargedThisMonth =
      wallet.lastFeeChargedAt &&
      wallet.lastFeeChargedAt.getMonth() === now.getMonth() &&
      wallet.lastFeeChargedAt.getFullYear() === now.getFullYear();

    if (alreadyChargedThisMonth) {
      wallet.feeStatus = 'ACTIVE';
      await wallet.save();
      return { status: 'ACTIVE', message: 'Monthly fee already settled.' };
    }

    const fee = tier.monthlyFeeAmount;
    if (wallet.balance >= fee) {
      wallet.balance -= fee;
      wallet.feeStatus = 'ACTIVE';
      wallet.lastFeeChargedAt = now;
      wallet.graceStartedAt = null;
      wallet.pendingFeeAmount = 0;
      await wallet.save();

      await FeeTransaction.create({
        driverId: wallet.driverId,
        vehicleType: tier.vehicleType,
        feeModel: 'monthly_threshold',
        amount: fee,
        periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
        periodEnd: now,
        status: 'CHARGED',
      });

      return { status: 'ACTIVE', message: `Monthly fee of ₹${fee} charged.` };
    }

    return this._enterOrContinueGrace(wallet, tier, fee);
  }

  static async _enterOrContinueGrace(wallet, tier, feeOwed) {
    const now = new Date();

    if (wallet.feeStatus === 'ACTIVE' || !wallet.graceStartedAt) {
      wallet.feeStatus = 'GRACE_PERIOD';
      wallet.graceStartedAt = now;
      wallet.pendingFeeAmount = feeOwed;
      await wallet.save();
      return {
        status: 'GRACE_PERIOD',
        message: `Insufficient balance for fee of ₹${feeOwed}. Grace period started — settle within ${tier.graceHours}h.`,
      };
    }

    const hoursInGrace = (now - wallet.graceStartedAt) / (1000 * 60 * 60);
    if (hoursInGrace >= tier.graceHours) {
      wallet.feeStatus = 'BLOCKED';
      await wallet.save();
      return { status: 'BLOCKED', message: 'Grace period expired. Top up wallet to resume.' };
    }

    return {
      status: 'GRACE_PERIOD',
      message: `Grace period active — ${(tier.graceHours - hoursInGrace).toFixed(1)}h remaining to settle ₹${wallet.pendingFeeAmount}.`,
    };
  }

  /** Simple dynamic fee: random within range, biased toward lower end. Replace with real surge logic. */
  static _computeDynamicFee(min, max) {
    return Math.round(min + Math.random() * (max - min));
  }

  /**
   * Call this whenever a ride completes, to update earnings totals
   * and (for commission-tier drivers only) deduct the platform's cut.
   */
  static async onRideCompleted(driverId, vehicleType, city, fareAmount) {
    const tier = await FeeTier.findOne({ vehicleType, city, active: true });
    const wallet = await DriverWallet.findOne({ driverId });

    if (!tier || !wallet) {
      // Fallback
      return { driverPayout: fareAmount, feeModel: 'commission' };
    }

    wallet.currentPeriodEarnings += fareAmount;

    let driverPayout = fareAmount;
    if (tier.feeModel === 'commission') {
      const commission = (fareAmount * tier.commissionPercent) / 100;
      driverPayout = fareAmount - commission;
    }
    // daily_fixed / monthly_threshold: driver keeps 100% of fare, platform already collected via fee

    await wallet.save();
    return { driverPayout, feeModel: tier.feeModel };
  }

  /** Call this at the start of each billing month to reset cab-tier earnings counters. */
  static async resetMonthlyEarnings() {
    await DriverWallet.updateMany({}, { $set: { currentPeriodEarnings: 0 } });
  }

  /** Manual wallet top-up — call from your payment gateway webhook. */
  static async topUpWallet(driverId, amount) {
    const wallet = await DriverWallet.findOneAndUpdate(
      { driverId },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );
    return wallet;
  }
}

module.exports = DriverFeeEngine;
