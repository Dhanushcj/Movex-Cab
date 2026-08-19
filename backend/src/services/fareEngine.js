const FareConfig = require('../models/FareConfig');
const Offer = require('../models/Offer');
const UserPass = require('../models/UserPass');

/**
 * Calculates estimated fare for a ride
 * @param {Object} params
 * @param {string} params.vehicleType
 * @param {number} params.distance - in km
 * @param {number} params.duration - in minutes
 * @param {string} [params.promoCode]
 * @param {string} [params.userId]
 * @returns {Promise<Object>} - detailed fare breakdown
 */
const calculateFare = async ({ vehicleType, distance, duration, promoCode, userId }) => {
  // 1. Get fare configuration for the vehicle type
  let config = await FareConfig.findOne({ vehicleType, isActive: true });
  
  // If not found, use default hardcoded rates
  if (!config) {
    const defaults = {
      bike: { baseFare: 15, perKmCharge: 7, perMinCharge: 1, minFare: 25, waitingChargePerMin: 1.5, capacity: 1 },
      auto: { baseFare: 25, perKmCharge: 10, perMinCharge: 1.5, minFare: 35, waitingChargePerMin: 2, capacity: 3 },
      mini: { baseFare: 30, perKmCharge: 12, perMinCharge: 2, minFare: 50, waitingChargePerMin: 2.5, capacity: 4 },
      sedan: { baseFare: 50, perKmCharge: 15, perMinCharge: 2.5, minFare: 80, waitingChargePerMin: 3, capacity: 4 },
      suv: { baseFare: 80, perKmCharge: 18, perMinCharge: 3, minFare: 120, waitingChargePerMin: 4, capacity: 6 }
    };
    config = defaults[vehicleType] || defaults.mini;
  }

  // 2. Base calculations
  const baseFare = Math.round(config.baseFare);
  const distanceCharge = Math.round(distance * config.perKmCharge);
  const timeCharge = Math.round(duration * config.perMinCharge);
  const subtotal = Math.round(baseFare + distanceCharge + timeCharge);

  // 3. Surge multiplier (if active)
  const surgeMultiplier = config.surgeMultiplier || 1.0;
  const surgeAmount = Math.round(subtotal * (surgeMultiplier - 1));

  // 4. Base total
  let discountableTotal = subtotal + surgeAmount;

  // 5. Apply promo code discount if provided
  let discount = 0;
  let promoApplied = null;
  if (promoCode) {
    const offer = await Offer.findOne({
      code: promoCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() }
    });

    if (offer && discountableTotal >= (offer.minRideAmount || 0)) {
      const userUsageCount = offer.usedBy.filter(usage => usage.user.toString() === userId).length;
      if (!offer.usageLimit || offer.usedCount < offer.usageLimit) {
        if (userUsageCount < offer.perUserLimit) {
          if (offer.discountType === 'flat') {
            discount = Math.round(offer.discountValue);
          } else if (offer.discountType === 'percentage') {
            discount = Math.round(discountableTotal * (offer.discountValue / 100));
            if (offer.maxDiscount && discount > offer.maxDiscount) {
              discount = offer.maxDiscount;
            }
          }
          promoApplied = offer.code;
        }
      }
    }
  }

  let taxableAmount = Math.max(0, discountableTotal - discount);

  // 5.5 Apply Tiered Pass Discount if user has an active pass
  let passDiscount = 0;
  let passApplied = null;
  if (userId) {
    const activePass = await UserPass.findOne({
      user: userId,
      status: 'active',
      validUntil: { $gt: new Date() }
    }).populate('pass');
    
    if (activePass && activePass.pass && activePass.pass.discountPercentage > 0) {
      passApplied = activePass.pass.name;
      const discountPercentage = activePass.pass.discountPercentage;
      passDiscount = Math.round(taxableAmount * (discountPercentage / 100));
      
      // Keep track of total saved amount asynchronously
      activePass.usageStats.totalSavedAmount += passDiscount;
      activePass.save().catch(err => console.error('Failed to update pass stats', err));
    }
  }

  // 6. Tax calculations (GST / VAT)
  const taxRate = parseFloat(process.env.TAX_RATE || '0.05'); // default 5%
  const finalTaxableAmount = Math.max(0, taxableAmount - passDiscount);
  const tax = Math.round(finalTaxableAmount * taxRate);

  // 7. Total final fare
  let totalFare = Math.round(finalTaxableAmount + tax);

  // Original fare without pass discount
  const originalTax = Math.round(taxableAmount * taxRate);
  let originalFare = Math.round(taxableAmount + originalTax);

  // Enforce minimum fare
  if (totalFare < config.minFare) {
    totalFare = config.minFare;
  }
  if (originalFare < config.minFare) {
    originalFare = config.minFare;
  }

  return {
    baseFare,
    distanceCharge,
    timeCharge,
    subtotal,
    surgeMultiplier,
    surgeAmount,
    discount, // promo discount
    promoCode: promoApplied,
    passDiscount, // subscription pass discount
    passApplied,
    tax,
    totalFare,
    originalFare,
    estimatedFare: totalFare
  };
};

module.exports = { calculateFare };
