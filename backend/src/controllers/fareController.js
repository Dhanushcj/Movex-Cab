const FareConfig = require('../models/FareConfig');

/**
 * Get fare settings for all vehicle types
 * GET /api/fares
 */
const getFares = async (req, res, next) => {
  try {
    const fares = await FareConfig.find({ isActive: true });
    
    // Seed initial config if database is empty
    if (fares.length === 0) {
      const initialFares = [
        { vehicleType: 'bike', baseFare: 15, perKmCharge: 7, perMinCharge: 1, minFare: 25, description: 'Quick and economical single rides', icon: 'motorbike' },
        { vehicleType: 'auto', baseFare: 25, perKmCharge: 10, perMinCharge: 1.5, minFare: 35, description: 'Traditional local three-wheeler', icon: 'rickshaw' },
        { vehicleType: 'mini', baseFare: 30, perKmCharge: 12, perMinCharge: 2, minFare: 50, description: 'Affordable compact hatchbacks', icon: 'car-side' },
        { vehicleType: 'sedan', baseFare: 50, perKmCharge: 15, perMinCharge: 2.5, minFare: 80, description: 'Spacious high-comfort sedans', icon: 'car' },
        { vehicleType: 'suv', baseFare: 80, perKmCharge: 18, perMinCharge: 3, minFare: 120, description: 'Heavy utility 6-seater SUVs', icon: 'car-sport' }
      ];
      const createdFares = await FareConfig.create(initialFares);
      return res.json({ success: true, count: createdFares.length, data: createdFares });
    }

    res.json({ success: true, count: fares.length, data: fares });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFares };
