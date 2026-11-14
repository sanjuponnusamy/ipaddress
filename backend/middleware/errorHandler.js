// 404 Route Not Found Handler
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}. Route not found on this API.`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/devices',
      'POST /api/devices',
      'POST /api/validate-ip',
      'GET /api/monitoring/status',
      'GET /api/monitoring/devices',
      'GET /api/activity-logs',
      'GET /api/monitoring-logs',
    ],
  });
}

// Global Exception & Error Handler
function errorHandler(err, req, res, next) {
  console.error('[API ERROR]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
