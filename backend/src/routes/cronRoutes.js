const express = require('express');
const router = express.Router();
const { triggerPromos } = require('../controllers/cronController');

router.post('/trigger-promos', triggerPromos);
router.get('/trigger-promos', triggerPromos);

module.exports = router;
