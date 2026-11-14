const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      uppercase: true,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    deviceName: {
      type: String,
      required: true,
      trim: true,
    },
    ipv4Address: {
      type: String,
      default: '',
      trim: true,
    },
    previousData: {
      type: mongoose.Schema.Types.Mixed,
      default: null, // Holds old document snapshot on UPDATE or DELETE
    },
    updatedData: {
      type: mongoose.Schema.Types.Mixed,
      default: null, // Holds new document snapshot on CREATE or UPDATE
    },
    changedFields: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      default: 'Saved successfully',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'activitylogs',
  }
);

activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ actionType: 1 });
activityLogSchema.index({ deviceId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
