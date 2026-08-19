require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Driver = require('./src/models/Driver');
const FareConfig = require('./src/models/FareConfig');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for seeding...');

    // Clear existing data (optional, but good for starting fresh)
    await User.deleteMany({});
    await Driver.deleteMany({});
    await FareConfig.deleteMany({});

    console.log('🧹 Existing users, drivers, and fares cleared.');

    // 1. Create admin user
    const admin = await User.create({
      name: 'System Admin',
      phone: '9999999999',
      countryCode: '+91',
      email: 'admin@movex.com',
      password: 'adminpassword123', // will be hashed by pre-save hook
      role: 'admin',
      isActive: true
    });
    console.log('👤 Admin user created: phone: 9999999999, password: adminpassword123');

    // 2. Create sample customer
    const customer = await User.create({
      name: 'John Doe',
      phone: '8888888888',
      countryCode: '+91',
      email: 'john@gmail.com',
      password: 'customerpassword123',
      role: 'customer',
      wallet: { balance: 500 },
      isActive: true
    });
    console.log('👤 Customer created: phone: 8888888888, password: customerpassword123');

    // 3. Create sample online, approved drivers for ride matching
    // Coordinates around Chennai, India: 13.0827, 80.2707 (lng: 80.2707, lat: 13.0827)
    const baseLng = 80.2707;
    const baseLat = 13.0827;

    const driver1 = await Driver.create({
      name: 'Speedy Driver (Bike)',
      phone: '7777777777',
      countryCode: '+91',
      email: 'driver1@movex.com',
      password: 'driverpassword123',
      vehicle: {
        type: 'bike',
        make: 'Honda',
        model: 'Activa',
        year: 2022,
        plateNumber: 'TN01AB1234',
        color: 'Black',
        capacity: 1
      },
      approvalStatus: 'approved',
      isOnline: true,
      isAvailable: true,
      currentLocation: {
        type: 'Point',
        coordinates: [baseLng + 0.005, baseLat + 0.005] // within ~1km
      }
    });

    const driver2 = await Driver.create({
      name: 'Auto Raja',
      phone: '7777777776',
      countryCode: '+91',
      email: 'driver2@movex.com',
      password: 'driverpassword123',
      vehicle: {
        type: 'auto',
        make: 'Bajaj',
        model: 'RE',
        year: 2021,
        plateNumber: 'TN01CD5678',
        color: 'Yellow',
        capacity: 3
      },
      approvalStatus: 'approved',
      isOnline: true,
      isAvailable: true,
      currentLocation: {
        type: 'Point',
        coordinates: [baseLng - 0.003, baseLat - 0.002] // within ~1km
      }
    });

    const driver3 = await Driver.create({
      name: 'Comfort Sedan Driver',
      phone: '7777777775',
      countryCode: '+91',
      email: 'driver3@movex.com',
      password: 'driverpassword123',
      vehicle: {
        type: 'sedan',
        make: 'Maruti Suzuki',
        model: 'Dzire',
        year: 2023,
        plateNumber: 'TN01EF9012',
        color: 'White',
        capacity: 4
      },
      approvalStatus: 'approved',
      isOnline: true,
      isAvailable: true,
      currentLocation: {
        type: 'Point',
        coordinates: [baseLng + 0.008, baseLat - 0.006] // within ~2km
      }
    });

    console.log('🚗 3 Approved, online, and close drivers seeded successfully.');

    // 4. Seed Fares
    const fares = [
      { vehicleType: 'bike', baseFare: 15, perKmCharge: 7, perMinCharge: 1, minFare: 25, description: 'Quick and economical single rides', icon: 'motorbike' },
      { vehicleType: 'auto', baseFare: 25, perKmCharge: 10, perMinCharge: 1.5, minFare: 35, description: 'Traditional local three-wheeler', icon: 'rickshaw' },
      { vehicleType: 'mini', baseFare: 30, perKmCharge: 12, perMinCharge: 2, minFare: 50, description: 'Affordable compact hatchbacks', icon: 'car-side' },
      { vehicleType: 'sedan', baseFare: 50, perKmCharge: 15, perMinCharge: 2.5, minFare: 80, description: 'Spacious high-comfort sedans', icon: 'car' },
      { vehicleType: 'suv', baseFare: 80, perKmCharge: 18, perMinCharge: 3, minFare: 120, description: 'Heavy utility 6-seater SUVs', icon: 'car-sport' }
    ];
    await FareConfig.create(fares);
    console.log('💵 Fare configurations seeded successfully.');

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
