const cron = require('node-cron');
const Driver = require('../models/Driver');
const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');
const admin = require('firebase-admin');

// Helper to calculate days between now and target date
const getDaysDifference = (targetDate) => {
  if (!targetDate) return null;
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const sendNotification = async (driver, docName, daysLeft) => {
  try {
    let title = `Document Expiring Soon`;
    let message = `Your ${docName} expires in ${daysLeft} days. Please renew it and submit via Help Center.`;

    if (daysLeft < 0) {
      title = `Document Expired`;
      message = `Your ${docName} has expired. You may not receive rides. Please update it immediately.`;
    } else if (daysLeft === 0) {
      title = `Document Expires Today`;
      message = `Your ${docName} expires today. Please renew it and submit via Help Center.`;
    }

    // Save to DB
    const notification = await Notification.create({
      title,
      message,
      type: 'system',
      targetAudience: 'specific',
      specificUsers: [driver._id]
    });

    // Send via socket if driver is online
    const io = getIO();
    if (io) {
      io.to(driver._id.toString()).emit('new_notification', notification);
    }

    // Send push notification via Firebase FCM
    if (driver.fcmToken) {
      try {
        await admin.messaging().send({
          token: driver.fcmToken,
          notification: {
            title,
            body: message,
          },
          data: {
            type: 'document_expiry',
            docName
          }
        });
      } catch (fcmError) {
        console.error('FCM Error for document expiry:', fcmError);
      }
    }
  } catch (err) {
    console.error('Error sending expiry notification:', err);
  }
};

const checkExpiries = async () => {
  try {
    console.log('Running daily check for document expiries...');
    const drivers = await Driver.find({ approvalStatus: 'approved' });

    for (const driver of drivers) {
      const docsToCheck = {
        'Driving License': driver.documents?.drivingLicense?.expiryDate,
        'Vehicle RC': driver.documents?.vehicleRC?.expiryDate,
        'Insurance': driver.documents?.insurance?.expiryDate,
        'Permit': driver.documents?.permit?.expiryDate,
        'Fitness Certificate': driver.documents?.fitnessCertificate?.expiryDate
      };

      for (const [docName, expiryDate] of Object.entries(docsToCheck)) {
        if (!expiryDate) continue;

        const daysLeft = getDaysDifference(expiryDate);
        if (daysLeft === null) continue;

        // 30 days, 15 days, or last 7 days daily, and expired
        if (daysLeft === 30 || daysLeft === 15 || (daysLeft <= 7 && daysLeft >= -30)) {
           await sendNotification(driver, docName, daysLeft);
        }
      }
    }
  } catch (error) {
    console.error('Failed to run document expiry cron job:', error);
  }
};

// Run every day at 10:00 AM
const startCron = () => {
  cron.schedule('0 10 * * *', checkExpiries);
  console.log('Document expiry cron job initialized.');
};

module.exports = { startCron, checkExpiries };
