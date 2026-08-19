const admin = require('./src/config/firebase');

// Replace this with a real FCM token from your database after you log in with your device
const testFcmToken = "REPLACE_WITH_YOUR_DEVICE_FCM_TOKEN";

const sendTestPush = async () => {
  if (testFcmToken === "REPLACE_WITH_YOUR_DEVICE_FCM_TOKEN") {
    console.log('⚠️ Please replace the testFcmToken variable with your actual device FCM token.');
    process.exit(1);
  }

  try {
    const message = {
      notification: {
        title: "Test Notification! 🎉",
        body: "If you see this, push notifications are working perfectly!",
      },
      data: {
        type: "TEST_NOTIFICATION",
        url: "movex://home"
      },
      token: testFcmToken
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
