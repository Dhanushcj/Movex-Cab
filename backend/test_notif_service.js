require('dotenv').config();
const { connectDB } = require('./src/config/database');
const User = require('./src/models/User');
const { sendNotification } = require('./src/services/notificationService');
const admin = require('./src/config/firebase');

(async () => {
  await connectDB();
  const user = await User.findOne({ fcmToken: { $exists: true, $ne: '' } });
  if(user) {
    console.log('Testing sendNotification...');
    await sendNotification(user.fcmToken, { title: 'Service test', body: 'Testing service', data: { type: 'test' } });
    
    // Also test raw sendEachForMulticast to get the full response
    console.log('Testing raw sendEachForMulticast...');
    const message = {
        notification: { title: 'Raw multicast', body: 'Testing raw multicast' },
        tokens: [user.fcmToken]
    };
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log('Raw response:', JSON.stringify(response, null, 2));
  } else {
    console.log('No user');
  }
  process.exit(0);
})();
