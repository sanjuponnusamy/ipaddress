const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// GET /api/health - Service Health & Heartbeat Check
router.get('/', healthController.getHealth);

module.exports = router;
