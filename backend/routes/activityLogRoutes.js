const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');

// GET /api/activity-logs - Retrieve MongoDB change history
router.get('/', activityLogController.getActivityLogs);

module.exports = router;
