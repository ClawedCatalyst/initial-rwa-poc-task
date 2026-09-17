const { ContractReadError } = require('../services/usdcContractService');
const {
  CONTRACT_READ_ERROR_CODES,
  ERROR_RESPONSES,
  LOG_MESSAGES
} = require('../constants/usdc');

function createUsdcController(service, logger = console) {
  if (!service || typeof service.getMetadata !== 'function') {
    throw new TypeError('A USDC contract service with getMetadata is required');
  }

  return async function getUsdcMetadata(req, res) {
    try {
      const data = await service.getMetadata();
      logger.log(LOG_MESSAGES.success, data);
      res.json(data);
    } catch (error) {
      const code = error instanceof ContractReadError && ERROR_RESPONSES[error.code]
        ? error.code
        : CONTRACT_READ_ERROR_CODES.INTERNAL_ERROR;
      logger.error(LOG_MESSAGES.failure, code);
      const { status, message } = ERROR_RESPONSES[code];
      return res.status(status).json({
        error: code,
        message
      });
    }
  };
}

module.exports = { createUsdcController };
