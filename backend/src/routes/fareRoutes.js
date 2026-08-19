const express = require('express');
const router = express.Router();
const { getFares } = require('../controllers/fareController');

router.get('/', getFares);

module.exports = router;
