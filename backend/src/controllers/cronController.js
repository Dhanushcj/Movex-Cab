const { sendPromoNotifications } = require('../jobs/promoNotifications');

const triggerPromos = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.warn('[CRON] CRON_SECRET is not set in environment variables');
      return res.status(500).send();
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[CRON] Unauthorized attempt to trigger promos');
      return res.status(401).send();
    }

    // Call the job function asynchronously so we can respond immediately
    sendPromoNotifications();

    // Send a minimal 200 OK text response (0 bytes body) to satisfy cron-job.org limits
    return res.status(200).send();
  } catch (error) {
    console.error('[CRON] Error in triggerPromos:', error);
    return res.status(500).send();
  }
};

module.exports = {
  triggerPromos
};
