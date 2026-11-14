const mongoose = require('mongoose');

/**
 * MongoDB Atlas Connection Manager
 * Manages connection lifecycle with event listeners and graceful fallback.
 * Uses environment variable MONGODB_URI for credentials.
 */

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.warn('\n[MONGODB WARNING] No valid MONGODB_URI configured in .env file.');
    console.warn('[MONGODB WARNING] Backend will run in standalone mode with in-memory stores.');
    console.warn('[MONGODB WARNING] Please configure your MongoDB Atlas connection string in backend/.env to persist data.\n');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      family: 4, // Force IPv4 to prevent Windows IPv6 NAT64 connection drops
    });

    console.log(`[MONGODB ATLAS] Connected Successfully: ${conn.connection.host}`);
    console.log(`[MONGODB ATLAS] Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MONGODB ERROR] Connection failed: ${error.message}`);
    console.warn('[MONGODB] Running with in-memory fallback. Server will remain responsive.');
    return null;
  }
}

// Connection event telemetry
mongoose.connection.on('connected', () => {
  console.log('[MONGODB EVENT] Connection state: Connected (ReadyState: 1)');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MONGODB EVENT] Connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('[MONGODB EVENT] Connection state: Disconnected (ReadyState: 0)');
});

module.exports = connectDB;
