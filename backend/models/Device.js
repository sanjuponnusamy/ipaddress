const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    deviceName: {
      type: String,
      required: [true, 'Device Name is mandatory'],
      trim: true,
      maxlength: [100, 'Device name cannot exceed 100 characters'],
    },
    ipv4Address: {
      type: String,
      required: [true, 'IPv4 Address is mandatory'],
      unique: true,
      trim: true,
      // Note: Full octet validation is performed by our IPv4 engine
    },
    subnetMask: {
      type: String,
      default: '255.255.255.0',
      trim: true,
    },
    defaultGateway: {
      type: String,
      default: '',
      trim: true,
    },
    macAddress: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    deviceType: {
      type: String,
      enum: ['Router', 'Switch', 'Server', 'Computer', 'Printer', 'Other'],
      default: 'Other',
    },
    location: {
      type: String,
      default: 'Server Room',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Online', 'Offline', 'Unknown'],
      default: 'Online',
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    lastPing: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    collection: 'devices',
  }
);

// Indexes for fast lookups
deviceSchema.index({ deviceType: 1 });
deviceSchema.index({ status: 1 });

module.exports = mongoose.model('Device', deviceSchema);
