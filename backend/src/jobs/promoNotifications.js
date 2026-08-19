const cron = require('node-cron');
const User = require('../models/User');
const NotificationMessage = require('../models/NotificationMessage');
const { sendMulticastNotification } = require('../services/notificationService');

const PROMO_TEMPLATES = [
  {
    title: "Hey! 🚗 Need a ride?",
    message: "We're missing you! Tap to book a cab now and travel comfortably."
  },
  {
    title: "Traffic getting you down? 🚦",
    message: "Sit back and let our drivers navigate. Book a MoveX cab today!"
  },
  {
    title: "Don't let the heat get to you! ☀️",
    message: "Beat the heat with our AC cabs available right now. Tap here to book."
  },
  {
    title: "Late for a meeting? 🕒",
    message: "We've got drivers nearby ready to zip you there safely and on time!"
  },
  {
    title: "It's a beautiful day! 🌤️",
    message: "Where are we heading today? Open the app to start your journey."
  },
  {
    title: "Going somewhere special? ✨",
    message: "Arrive in style with our premium rides. Check the app for availability."
  },
  {
    title: "Your next adventure awaits! 🌍",
    message: "No matter the destination, we are here to take you there. Book now!"
  },
  {
    title: "Tired of walking? 🚶‍♂️",
    message: "Give your feet a rest. Our drivers are just a tap away!"
  }
];

const sendPromoNotifications = async () => {
  try {
    console.log('[CRON] Starting promotional notifications job...');

    // Pick a random template
    const templateIndex = Math.floor(Math.random() * PROMO_TEMPLATES.length);
    const promo = PROMO_TEMPLATES[templateIndex];

    // Find active customers with FCM tokens
    const customers = await User.find({
      role: 'customer',
      isActive: true,
      fcmToken: { $ne: null }
    }).select('fcmToken _id');

    if (!customers || customers.length === 0) {
      console.log('[CRON] No active customers with FCM tokens found for promos.');
      return;
    }

    const tokens = customers.map(c => c.fcmToken).filter(Boolean);

    if (tokens.length > 0) {
      // 1. Send the push notification
      const result = await sendMulticastNotification(tokens, {
        title: promo.title,
        body: promo.message,
        data: { type: 'promo_notification' }
      });

      if (result && result.failedTokens && result.failedTokens.length > 0) {
        // Remove invalid tokens from DB
        await User.updateMany(
          { fcmToken: { $in: result.failedTokens } },
          { $set: { fcmToken: null } }
        );
        console.log(`[CRON] Removed ${result.failedTokens.length} invalid FCM tokens from database.`);
      }

      console.log(`[CRON] Sent promo notification to ${tokens.length} users: "${promo.title}"`);

      // 2. Save it to NotificationMessage so it appears in the app's notification center
      await NotificationMessage.create({
        title: promo.title,
        message: promo.message,
        targetAudience: 'customer',
        isActive: true
      });
      
      console.log(`[CRON] Saved promo notification to database.`);
    }

  } catch (error) {
    console.error('[CRON] Failed to send promotional notifications:', error);
  }
};

const startPromoCron = () => {
  // Run every 4 hours (adjust as needed for production)
  // For testing, you could use '*/2 * * * *' (every 2 minutes)
  cron.schedule('0 */4 * * *', sendPromoNotifications);
  console.log('Promotional notifications cron job initialized (Every 4 hours).');
};

module.exports = { startPromoCron, sendPromoNotifications };
