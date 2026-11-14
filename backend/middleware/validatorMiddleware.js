const { validateIPv4 } = require('../services/ipValidatorService');

const ALLOWED_DEVICE_TYPES = ['Router', 'Switch', 'Server', 'Computer', 'Printer', 'Other'];
const ALLOWED_STATUSES = ['Online', 'Offline', 'Unknown'];

function validateDeviceInput(req, res, next) {
  const isPost = req.method === 'POST';
  const {
    deviceName,
    ipv4Address,
    subnetMask,
    defaultGateway,
    macAddress,
    deviceType,
    status,
  } = req.body;

  // 1. Device Name Validation
  if (isPost || deviceName !== undefined) {
    if (!deviceName || typeof deviceName !== 'string' || !deviceName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Device Name is mandatory and must be a non-empty string.',
      });
    }
  }

  // 2. IPv4 Address Validation
  if (isPost || ipv4Address !== undefined) {
    if (!ipv4Address) {
      return res.status(400).json({
        success: false,
        error: 'IPv4 Address is mandatory.',
      });
    }

    const ipValidation = validateIPv4(ipv4Address);
    if (!ipValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: `Invalid IPv4 Address: ${ipValidation.reason}`,
        field: 'ipv4Address',
      });
    }
  }

  // 3. Subnet Mask Validation
  if (subnetMask !== undefined && subnetMask !== '') {
    const maskValidation = validateIPv4(subnetMask);
    if (!maskValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: `Invalid Subnet Mask: ${maskValidation.reason}`,
        field: 'subnetMask',
      });
    }
  }

  // 4. Default Gateway Validation (Optional)
  if (defaultGateway && defaultGateway.trim()) {
    const gwValidation = validateIPv4(defaultGateway);
    if (!gwValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: `Invalid Default Gateway IPv4: ${gwValidation.reason}`,
        field: 'defaultGateway',
      });
    }
  }

  // 5. MAC Address Validation (Optional)
  if (macAddress && macAddress.trim()) {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(macAddress.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid MAC address format. Example: 00:1A:2B:3C:4D:5E or 00-1A-2B-3C-4D-5E.',
        field: 'macAddress',
      });
    }
  }

  // 6. Device Type Validation
  if (deviceType !== undefined && !ALLOWED_DEVICE_TYPES.includes(deviceType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid Device Type "${deviceType}". Allowed types: ${ALLOWED_DEVICE_TYPES.join(', ')}.`,
      field: 'deviceType',
    });
  }

  // 7. Status Validation
  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid Status "${status}". Allowed values: ${ALLOWED_STATUSES.join(', ')}.`,
      field: 'status',
    });
  }

  next();
}

module.exports = {
  validateDeviceInput,
  ALLOWED_DEVICE_TYPES,
  ALLOWED_STATUSES,
};
