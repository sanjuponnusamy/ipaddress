const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');

// GET /api/monitoring/status - High-level network summary
router.get('/status', monitoringController.getMonitoringStatus);

// POST /api/monitoring/ping/:id - Probe single device
router.post('/ping/:id', monitoringController.pingDevice);

// POST /api/monitoring/ping-all - Ping sweep all devices
router.post('/ping-all', monitoringController.pingAllDevices);

module.exports = router;
