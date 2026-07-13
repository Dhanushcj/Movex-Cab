require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./src/config/database');
const admin = require('./src/config/firebase');
const User = require('./src/models/User');

const sendTestPush = async () => {
  try {
    await connectDB();
    const user = await User.findOne({ fcmToken: { $exists: true, $ne: "" } });
    if (!user) {
      console.log('No user with FCM token found in DB.');
      process.exit(1);
    }
    
    console.log(`Sending test notification to user ${user.phone} (${user.name})`);
    
    const message = {
      notification: {
        title: "Test Notification! 🎉",
        body: "If you see this, push notifications are working perfectly!",
      },
      data: {
        type: "TEST_NOTIFICATION",
        url: "movex://home"
      },
      token: user.fcmToken
    };

    const response = await admin.messaging().send(message);
    console.log('🚀 Successfully sent message:', response);
  } catch (error) {
    console.error('❌ Error sending message:', error);
  } finally {
    process.exit(0);
  }
};

sendTestPush();
