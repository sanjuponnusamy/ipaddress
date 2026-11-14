const express = require('express');
const router = express.Router();
const ipController = require('../controllers/ipController');

// POST /api/validate-ip - Validate & inspect IPv4 Address
router.post('/', ipController.validateIp);

module.exports = router;
