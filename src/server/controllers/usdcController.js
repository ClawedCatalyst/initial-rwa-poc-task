const { ContractReadError } = require('../services/usdcContractService');

function createUsdcController(service, logger = console) {
  if (!service || typeof service.getMetadata !== 'function') {
    throw new TypeError('A USDC contract service with getMetadata is required');
  }

  return async function getUsdcMetadata(req, res) {
    try {
      const data = await service.getMetadata();
      logger.log('USDC contract data:', data);
      res.json(data);
    } catch (error) {
      const code = error instanceof ContractReadError ? error.code : 'INTERNAL_ERROR';
      logger.error('USDC contract read failed:', code);

      if (code === 'RPC_UNAVAILABLE') {
        return res.status(503).json({
          error: code,
          message: 'Ethereum contract data is temporarily unavailable.'
        });
      }
      if (code === 'INVALID_CHAIN_RESPONSE') {
        return res.status(502).json({
          error: code,
          message: 'Ethereum contract data could not be validated.'
        });
      }
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected server error occurred.'
      });
    }
  };
}

module.exports = { createUsdcController };
