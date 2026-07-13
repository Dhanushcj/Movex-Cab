const { sendPromoNotifications } = require('../jobs/promoNotifications');

const triggerPromos = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.warn('[CRON] CRON_SECRET is not set in environment variables');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[CRON] Unauthorized attempt to trigger promos');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Call the job function asynchronously so we can respond immediately
    sendPromoNotifications();

    return res.status(200).json({ success: true, message: 'Promo notifications triggered successfully' });
  } catch (error) {
    console.error('[CRON] Error in triggerPromos:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  triggerPromos
};
