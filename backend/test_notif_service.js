require('dotenv').config();
const { connectDB } = require('./src/config/database');
const User = require('./src/models/User');
const { sendNotification } = require('./src/services/notificationService');
const admin = require('./src/config/firebase');

(async () => {
  await connectDB();
  const users = await User.find({ fcmToken: { $exists: true, $ne: '' } });
  if (users.length > 0) {
    console.log(`Found ${users.length} users with tokens. Sending to all...`);
    for (const user of users) {
      console.log(`Sending to ${user.name} (${user.phone})...`);
      await sendNotification(user.fcmToken, { title: 'Service test', body: `Hello ${user.name}, this is a test!`, data: { type: 'test' } });
    }
  } else {
    console.log('No users with tokens found.');
  }
  process.exit(0);
})();
