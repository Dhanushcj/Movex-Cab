require('dotenv').config();
const { connectDB } = require('./src/config/database');
const { sendPromoNotifications } = require('./src/jobs/promoNotifications');

const testPromo = async () => {
  await connectDB();
  console.log('Connected to DB. Triggering promo notifications...');
  await sendPromoNotifications();
  console.log('Done.');
  process.exit(0);
};

testPromo();
