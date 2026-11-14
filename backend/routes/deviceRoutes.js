const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { validateDeviceInput } = require('../middleware/validatorMiddleware');

// GET /api/devices - List devices with search, filter, and sort
router.get('/', deviceController.getAllDevices);

// GET /api/devices/:id - Retrieve single device details
router.get('/:id', deviceController.getDeviceById);

// POST /api/devices - Register new network device (with IPv4 validation)
router.post('/', validateDeviceInput, deviceController.createDevice);

// PUT /api/devices/:id - Update existing device
router.put('/:id', validateDeviceInput, deviceController.updateDevice);

// DELETE /api/devices/:id - Remove device from inventory
router.delete('/:id', deviceController.deleteDevice);

module.exports = router;
