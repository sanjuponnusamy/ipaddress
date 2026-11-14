const { analyzeIPv4, validateIPv4 } = require('../services/ipValidatorService');

exports.validateIp = (req, res) => {
  const { ip } = req.body;

  if (ip === undefined || ip === null) {
    return res.status(400).json({
      success: false,
      error: 'Missing "ip" parameter in request body.',
    });
  }

  const analysis = analyzeIPv4(ip);

  res.status(200).json({
    success: true,
    data: analysis,
  });
};
