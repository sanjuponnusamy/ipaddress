const mongoose = require('mongoose');

const monitoringLogSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    ipv4Address: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Online', 'Offline', 'Unknown'],
      default: 'Unknown',
    },
    responseTime: {
      type: Number, // Latency in milliseconds (null if host timed out / unreachable)
      default: null,
    },
    checkMethod: {
      type: String,
      default: 'TCP_SOCKET',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'monitoringlogs',
  }
);

monitoringLogSchema.index({ timestamp: -1 });
monitoringLogSchema.index({ ipv4Address: 1 });

module.exports = mongoose.model('MonitoringLog', monitoringLogSchema);
