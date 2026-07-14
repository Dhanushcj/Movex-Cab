// Push Notification Service using central Firebase Admin instance
const admin = require('../config/firebase');


/**
 * Send push notification to a specific FCM token
 * @param {string} token - FCM device token
 * @param {Object} payload - { title, body, data }
 */
const sendNotification = async (token, { title, body, data = {} }) => {
  if (!token) return;

  console.log(`🔔 [NOTIFICATION] To: ${token.substring(0, 10)}... | Title: "${title}" | Body: "${body}"`);

  if (admin) {
    try {
      const message = {
        notification: { title, body },
        android: {
          notification: {
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        },
        data: typeof data === 'object' ? Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}) : {},
        tokens: [token]
      };
      await admin.messaging().sendEachForMulticast(message);
      console.log('🚀 FCM push notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send FCM notification:', error.message);
    }
  }
};

/**
 * Send notification to multiple device tokens
 */
const sendMulticastNotification = async (tokens = [], { title, body, data = {} }) => {
  const validTokens = tokens.filter(Boolean);
  if (validTokens.length === 0) return;

  console.log(`🔔 [NOTIFICATION] Multicast to ${validTokens.length} devices | Title: "${title}"`);

  if (admin) {
    try {
      const message = {
        notification: { title, body },
        android: {
          notification: {
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        },
        data: typeof data === 'object' ? Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}) : {},
        tokens: validTokens
      };
      const response = await admin.messaging().sendEachForMulticast(message);
      if (response.failureCount > 0) {
        console.warn(`⚠️ FCM Multicast had ${response.failureCount} failures.`);
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Token ${idx} failed:`, resp.error);
          }
        });
      } else {
        console.log(`🚀 FCM push notification sent successfully to ${response.successCount} devices`);
      }
    } catch (error) {
      console.error('❌ Failed to send multicast notification:', error.message);
    }
  }
};

module.exports = { sendNotification, sendMulticastNotification };
