const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// Middleware
app.use(cors({
  origin: '*', // Allows local Vite dev server and future Vercel deployment
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Import route modules
const healthRoutes = require('./routes/healthRoutes');
const ipRoutes = require('./routes/ipRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const monitoringController = require('./controllers/monitoringController');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Root API Welcome
app.get('/', (req, res) => {
  res.json({
    project: 'Network Device Inventory Management System',
    version: '1.0.0',
    description: 'REST API with IPv4 validation, MongoDB Atlas integration & real-time monitoring',
    endpoints: {
      health: 'GET /api/health',
      devices: 'GET|POST /api/devices',
      deviceById: 'GET|PUT|DELETE /api/devices/:id',
      validateIp: 'POST /api/validate-ip',
      monitoringStatus: 'GET /api/monitoring/status',
      pingDevice: 'POST /api/monitoring/ping/:id',
      pingAll: 'POST /api/monitoring/ping-all',
      activityLogs: 'GET /api/activity-logs',
      monitoringLogs: 'GET /api/monitoring-logs',
    },
  });
});

// Mount Routes
app.use('/api/health', healthRoutes);
app.use('/api/validate-ip', ipRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/monitoring-logs', monitoringController.getMonitoringLogs);
app.use('/api/activity-logs', activityLogRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  NETINVENTORY BACKEND SERVER STARTED`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
