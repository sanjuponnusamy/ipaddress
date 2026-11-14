const net = require('net');
const mongoose = require('mongoose');
const MonitoringLog = require('../models/MonitoringLog');
const Device = require('../models/Device');

let inMemoryMonitoringLogs = [
  {
    _id: 'mon-001',
    deviceId: 'dev-001',
    ipv4Address: '192.168.1.1',
    status: 'Online',
    responseTime: 3,
    checkMethod: 'TCP_SYN_PROBE',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    _id: 'mon-002',
    deviceId: 'dev-003',
    ipv4Address: '10.0.0.10',
    status: 'Online',
    responseTime: 14,
    checkMethod: 'TCP_SYN_PROBE',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
];

const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * Real Network Probe using TCP Socket Handshake
 * Tests reachability of the target IPv4 address on common management ports.
 * Demonstrates Layer 4 Transport & Layer 3 Network diagnostic principles.
 */
function probeHost(ip, port = 80, timeout = 1200) {
  return new Promise((resolve) => {
    const start = performance.now();
    const socket = new net.Socket();
    let isSettled = false;

    socket.setTimeout(timeout);

    const finish = (status, latency, method = 'TCP_SOCKET') => {
      if (isSettled) return;
      isSettled = true;
      socket.destroy();
      resolve({ status, latency, method });
    };

    socket.connect(port, ip, () => {
      const elapsed = Math.round(performance.now() - start);
      finish('Online', elapsed, 'TCP_HANDSHAKE_ESTABLISHED');
    });

    socket.on('error', (err) => {
      const elapsed = Math.round(performance.now() - start);
      // In networking, ECONNREFUSED means the host IP reached our packet and responded with RST!
      // This technically PROVES the host is ONLINE!
      if (err.code === 'ECONNREFUSED') {
        finish('Online', elapsed, 'TCP_RST_HOST_RESPONDED');
      } else {
        finish('Offline', null, `SOCKET_${err.code || 'UNREACHABLE'}`);
      }
    });

    socket.on('timeout', () => {
      finish('Offline', null, 'SOCKET_TIMEOUT');
    });
  });
}

// GET /api/monitoring/status
exports.getMonitoringStatus = async (req, res, next) => {
  try {
    let total = 0;
    let online = 0;
    let offline = 0;
    let unknown = 0;

    if (isDbReady()) {
      total = await Device.countDocuments();
      online = await Device.countDocuments({ status: 'Online' });
      offline = await Device.countDocuments({ status: 'Offline' });
      unknown = await Device.countDocuments({ status: 'Unknown' });
    } else {
      total = 3;
      online = 3;
      offline = 0;
      unknown = 0;
    }

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalDevices: total,
        onlineDevices: online,
        offlineDevices: offline,
        unknownDevices: unknown,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/monitoring/ping/:id
exports.pingDevice = async (req, res, next) => {
  try {
    const { id } = req.params;
    let targetDevice = null;

    if (isDbReady()) {
      targetDevice = await Device.findById(id);
    }

    if (!targetDevice) {
      targetDevice = {
        _id: id,
        deviceName: 'Device-' + id,
        ipv4Address: '127.0.0.1',
        status: 'Online',
      };
    }

    // Execute real probe or fallback for loopback/simulation
    const probe = await probeHost(targetDevice.ipv4Address);
    const now = new Date();

    const logEntry = {
      deviceId: String(targetDevice._id),
      ipv4Address: targetDevice.ipv4Address,
      status: probe.status,
      responseTime: probe.latency,
      checkMethod: probe.method,
      timestamp: now,
    };

    if (isDbReady()) {
      await MonitoringLog.create(logEntry);
      targetDevice.status = probe.status;
      targetDevice.lastPing = now;
      await targetDevice.save();
    } else {
      inMemoryMonitoringLogs.unshift({
        _id: 'mon-' + Date.now(),
        ...logEntry,
        timestamp: now.toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      device: targetDevice.deviceName,
      ipv4Address: targetDevice.ipv4Address,
      status: probe.status,
      responseTime: probe.latency,
      method: probe.method,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/monitoring/ping-all
exports.pingAllDevices = async (req, res, next) => {
  try {
    let devices = [];
    if (isDbReady()) {
      devices = await Device.find();
    } else {
      devices = [
        { _id: 'dev-001', ipv4Address: '127.0.0.1', deviceName: 'Local-Gateway', status: 'Online' },
        { _id: 'dev-002', ipv4Address: '1.1.1.1', deviceName: 'Cloudflare-DNS', status: 'Online' },
        { _id: 'dev-003', ipv4Address: '192.168.254.254', deviceName: 'Offline-Node', status: 'Unknown' },
      ];
    }

    const now = new Date();
    const results = [];

    for (const dev of devices) {
      const probe = await probeHost(dev.ipv4Address);

      const log = {
        deviceId: String(dev._id),
        ipv4Address: dev.ipv4Address,
        status: probe.status,
        responseTime: probe.latency,
        checkMethod: probe.method,
        timestamp: now,
      };

      if (isDbReady()) {
        await MonitoringLog.create(log);
        dev.status = probe.status;
        dev.lastPing = now;
        await dev.save();
      } else {
        inMemoryMonitoringLogs.unshift({
          _id: 'mon-' + Math.random().toString(36).substring(2, 9),
          ...log,
          timestamp: now.toISOString(),
        });
      }

      results.push(log);
    }

    res.status(200).json({
      success: true,
      message: `Probed ${devices.length} network devices via TCP socket probe.`,
      timestamp: now.toISOString(),
      results,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/monitoring-logs
exports.getMonitoringLogs = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    if (isDbReady()) {
      const logs = await MonitoringLog.find()
        .sort({ timestamp: -1 })
        .limit(Number(limit));
      return res.status(200).json(logs);
    }

    res.status(200).json(inMemoryMonitoringLogs);
  } catch (err) {
    next(err);
  }
};
