const mongoose = require('mongoose');
const Device = require('../models/Device');
const ActivityLog = require('../models/ActivityLog');
const { validateIPv4 } = require('../services/ipValidatorService');

// In-memory fallback dataset for offline/preview testing
let inMemoryDevices = [
  {
    _id: 'dev-001',
    deviceName: 'Core-Edge-Router-01',
    ipv4Address: '192.168.1.1',
    subnetMask: '255.255.255.0',
    defaultGateway: '192.168.1.254',
    macAddress: '00:1A:2B:3C:4D:01',
    deviceType: 'Router',
    location: 'Server Room Rack A1',
    status: 'Online',
    description: 'Primary Edge Gateway Router for campus subnet.',
    lastPing: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'dev-002',
    deviceName: 'Distribution-Switch-L3',
    ipv4Address: '192.168.1.2',
    subnetMask: '255.255.255.0',
    defaultGateway: '192.168.1.1',
    macAddress: '00:1A:2B:3C:4D:02',
    deviceType: 'Switch',
    location: 'Building B - Switch Closet',
    status: 'Online',
    description: 'Cisco 24-port Managed Layer-3 Switch.',
    lastPing: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'dev-003',
    deviceName: 'Database-Host-Atlas',
    ipv4Address: '10.0.0.10',
    subnetMask: '255.0.0.0',
    defaultGateway: '10.0.0.1',
    macAddress: '00:50:56:C0:00:10',
    deviceType: 'Server',
    location: 'Cloud Data Center',
    status: 'Online',
    description: 'Production MongoDB Atlas App Server.',
    lastPing: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let inMemoryLogs = [];

const isDbReady = () => mongoose.connection.readyState === 1;

// GET /api/devices
exports.getAllDevices = async (req, res, next) => {
  try {
    const { search, status, type } = req.query;

    if (isDbReady()) {
      const query = {};
      if (status && status !== 'ALL') {
        query.status = status;
      }
      if (type && type !== 'ALL') {
        query.deviceType = type;
      }
      if (search) {
        query.$or = [
          { deviceName: { $regex: search, $options: 'i' } },
          { ipv4Address: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }

      const devices = await Device.find(query).sort({ createdAt: -1 });
      return res.status(200).json(devices);
    }

    // In-memory fallback
    let result = [...inMemoryDevices];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.deviceName.toLowerCase().includes(s) ||
          d.ipv4Address.toLowerCase().includes(s) ||
          (d.location && d.location.toLowerCase().includes(s))
      );
    }

    if (status && status !== 'ALL') {
      result = result.filter((d) => (d.status || '').toUpperCase() === status.toUpperCase());
    }

    if (type && type !== 'ALL') {
      result = result.filter((d) => (d.deviceType || '').toUpperCase() === type.toUpperCase());
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/devices/:id
exports.getDeviceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbReady()) {
      const device = await Device.findById(id);
      if (!device) {
        return res.status(404).json({ success: false, error: `Device with ID ${id} not found.` });
      }
      return res.status(200).json(device);
    }

    const device = inMemoryDevices.find((d) => d._id === id || d.id === id);
    if (!device) {
      return res.status(404).json({ success: false, error: `Device with ID ${id} not found.` });
    }
    res.status(200).json(device);
  } catch (err) {
    next(err);
  }
};

// POST /api/devices
exports.createDevice = async (req, res, next) => {
  try {
    const {
      deviceName,
      ipv4Address,
      subnetMask,
      defaultGateway,
      macAddress,
      deviceType,
      location,
      status,
      description,
    } = req.body;

    if (isDbReady()) {
      // Check duplicate IP in MongoDB
      const existing = await Device.findOne({ ipv4Address: ipv4Address.trim() });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Duplicate IPv4 Address: Node "${existing.deviceName}" is already assigned to ${ipv4Address}.`,
        });
      }

      const newDevice = new Device({
        deviceName: deviceName.trim(),
        ipv4Address: ipv4Address.trim(),
        subnetMask: subnetMask ? subnetMask.trim() : '255.255.255.0',
        defaultGateway: defaultGateway ? defaultGateway.trim() : '',
        macAddress: macAddress ? macAddress.trim() : '',
        deviceType: deviceType || 'Router',
        location: location ? location.trim() : '',
        status: status || 'Online',
        description: description ? description.trim() : '',
      });

      const saved = await newDevice.save();

      // Save activity log to MongoDB Atlas activitylogs collection
      await ActivityLog.create({
        actionType: 'CREATE',
        deviceId: String(saved._id),
        deviceName: saved.deviceName,
        ipv4Address: saved.ipv4Address,
        updatedData: saved.toObject(),
        changedFields: ['All fields created'],
        status: 'Saved successfully',
        timestamp: new Date(),
      });

      return res.status(201).json(saved);
    }

    // In-memory fallback
    const duplicate = inMemoryDevices.find((d) => d.ipv4Address.trim() === ipv4Address.trim());
    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: `Duplicate IPv4 Address: Node "${duplicate.deviceName}" is already assigned to ${ipv4Address}.`,
      });
    }

    const created = {
      _id: 'dev-' + Date.now(),
      deviceName: deviceName.trim(),
      ipv4Address: ipv4Address.trim(),
      subnetMask: subnetMask ? subnetMask.trim() : '255.255.255.0',
      defaultGateway: defaultGateway ? defaultGateway.trim() : '',
      macAddress: macAddress ? macAddress.trim() : '',
      deviceType: deviceType || 'Router',
      location: location ? location.trim() : '',
      status: status || 'Online',
      description: description ? description.trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryDevices.unshift(created);

    inMemoryLogs.unshift({
      _id: 'log-' + Date.now(),
      actionType: 'CREATE',
      deviceId: created._id,
      deviceName: created.deviceName,
      ipv4Address: created.ipv4Address,
      updatedData: created,
      changedFields: ['All fields created'],
      status: 'Saved successfully',
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// PUT /api/devices/:id
exports.updateDevice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isDbReady()) {
      const oldDevice = await Device.findById(id);
      if (!oldDevice) {
        return res.status(404).json({ success: false, error: `Device with ID ${id} not found.` });
      }

      // If IP was changed, check for conflict
      if (updates.ipv4Address && updates.ipv4Address !== oldDevice.ipv4Address) {
        const duplicate = await Device.findOne({
          ipv4Address: updates.ipv4Address.trim(),
          _id: { $ne: id },
        });
        if (duplicate) {
          return res.status(409).json({
            success: false,
            error: `Duplicate IPv4: Node "${duplicate.deviceName}" already has IP ${updates.ipv4Address}.`,
          });
        }
      }

      const previousSnapshot = oldDevice.toObject();
      Object.assign(oldDevice, updates);
      const updated = await oldDevice.save();

      const changedFields = Object.keys(updates).filter(
        (key) => String(previousSnapshot[key]) !== String(updates[key])
      );

      // Save activity log to MongoDB Atlas
      await ActivityLog.create({
        actionType: 'UPDATE',
        deviceId: String(updated._id),
        deviceName: updated.deviceName,
        ipv4Address: updated.ipv4Address,
        previousData: previousSnapshot,
        updatedData: updated.toObject(),
        changedFields,
        status: 'Updated successfully',
        timestamp: new Date(),
      });

      return res.status(200).json(updated);
    }

    // In-memory fallback
    const index = inMemoryDevices.findIndex((d) => d._id === id || d.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: `Device with ID ${id} not found.` });
    }

    const previousSnapshot = { ...inMemoryDevices[index] };
    inMemoryDevices[index] = {
      ...inMemoryDevices[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const updated = inMemoryDevices[index];

    inMemoryLogs.unshift({
      _id: 'log-' + Date.now(),
      actionType: 'UPDATE',
      deviceId: id,
      deviceName: updated.deviceName,
      ipv4Address: updated.ipv4Address,
      previousData: previousSnapshot,
      updatedData: updated,
      changedFields: Object.keys(updates),
      status: 'Updated successfully',
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/devices/:id
exports.deleteDevice = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbReady()) {
      const deleted = await Device.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: `Device with ID ${id} not found.` });
      }

      // Save activity log to MongoDB Atlas
      await ActivityLog.create({
        actionType: 'DELETE',
        deviceId: String(deleted._id),
        deviceName: deleted.deviceName,
        ipv4Address: deleted.ipv4Address,
        previousData: deleted.toObject(),
        changedFields: ['Device removed from inventory'],
        status: 'Deleted successfully',
        timestamp: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: `Device "${deleted.deviceName}" (${deleted.ipv4Address}) deleted successfully.`,
      });
    }

    // In-memory fallback
    const index = inMemoryDevices.findIndex((d) => d._id === id || d.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: `Device with ID ${id} not found.` });
    }

    const deleted = inMemoryDevices.splice(index, 1)[0];

    inMemoryLogs.unshift({
      _id: 'log-' + Date.now(),
      actionType: 'DELETE',
      deviceId: id,
      deviceName: deleted.deviceName,
      ipv4Address: deleted.ipv4Address,
      previousData: deleted,
      changedFields: ['Device removed from inventory'],
      status: 'Deleted successfully',
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: `Device "${deleted.deviceName}" (${deleted.ipv4Address}) deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

exports.getInMemoryLogs = () => inMemoryLogs;
