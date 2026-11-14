const mongoose = require('mongoose');

// Helper to translate mongoose readyState number into human readable string
function getDatabaseState(readyState) {
  switch (readyState) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'uninitialized';
  }
}

exports.getHealth = (req, res) => {
  const dbStateNumber = mongoose.connection.readyState;
  const isDbConnected = dbStateNumber === 1;

  res.status(200).json({
    success: true,
    status: 'healthy',
    server: 'online',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    database: {
      connected: isDbConnected,
      state: getDatabaseState(dbStateNumber),
      // Never expose connection string or credentials to client
    },
    environment: process.env.NODE_ENV || 'development',
  });
};
