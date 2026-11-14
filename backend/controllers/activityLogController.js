const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const { getInMemoryLogs } = require('./deviceController');

const isDbReady = () => mongoose.connection.readyState === 1;

// GET /api/activity-logs
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { action, limit = 50 } = req.query;

    if (isDbReady()) {
      const query = {};
      if (action && action !== 'ALL') {
        query.actionType = action.toUpperCase();
      }

      const logs = await ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .limit(Number(limit));

      return res.status(200).json(logs);
    }

    // In-memory fallback
    let logs = getInMemoryLogs ? getInMemoryLogs() : [];
    if (action && action !== 'ALL') {
      logs = logs.filter((l) => (l.actionType || '').toUpperCase() === action.toUpperCase());
    }

    res.status(200).json(logs);
  } catch (err) {
    next(err);
  }
};
