require('dotenv').config();
const mongoose = require('mongoose');
const Pass = require('./src/models/Pass');

const seedPasses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await Pass.deleteMany({});

    const passes = [
      {
        name: 'Silver',
        price: 199,
        discountPercentage: 5,
        validityDays: 30,
        benefits: {
          priorityBooking: false,
          freeCancellations: 0,
          freeWaitTimeMinutes: 0
        },
        isActive: true
      },
      {
        name: 'Gold',
        price: 399,
        discountPercentage: 10,
        validityDays: 30,
        benefits: {
          priorityBooking: true,
          freeCancellations: 3,
          freeWaitTimeMinutes: 0
        },
        isActive: true
      },
      {
        name: 'Diamond',
        price: 799,
        discountPercentage: 15,
        validityDays: 30,
        benefits: {
          priorityBooking: true,
          freeCancellations: -1,
          freeWaitTimeMinutes: 5
        },
        isActive: true
      }
    ];

    await Pass.insertMany(passes);
    console.log('Successfully seeded passes!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding passes:', error);
    process.exit(1);
  }
};

seedPasses();
