const { CONTRACT_READ_ERROR_CODES } = require('../../constants/usdc');
const { ContractReadError } = require('../../services/usdcContractService');

function createSingleProviderStrategy(reader) {
  return { readTokenSnapshot: (request) => reader.readTokenSnapshot(request) };
}

function createFailoverStrategy(readers) {
  return {
    async readTokenSnapshot(request) {
      for (const reader of readers) {
        try {
          return await reader.readTokenSnapshot(request);
        } catch (error) {
          if (!(error instanceof ContractReadError) ||
              error.code !== CONTRACT_READ_ERROR_CODES.RPC_UNAVAILABLE) {
            throw error;
          }
        }
      }
      throw new ContractReadError(CONTRACT_READ_ERROR_CODES.RPC_UNAVAILABLE);
    }
  };
}

function createReadStrategy(readers) {
  if (!Array.isArray(readers) || readers.length === 0 ||
      readers.some((reader) => typeof reader?.readTokenSnapshot !== 'function')) {
    throw new TypeError('At least one contract reader is required');
  }
  return readers.length === 1
    ? createSingleProviderStrategy(readers[0])
    : createFailoverStrategy(readers);
}

module.exports = { createReadStrategy };
