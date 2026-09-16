const USDC_CONTRACT = Object.freeze({
  chainId: 1,
  network: 'ethereum-mainnet',
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  maxDecimals: 255 // ERC-20 decimals() returns uint8.
});

const USDC_API_PATHS = Object.freeze({
  canonical: '/api/v1/blockchain/ethereum/usdc/metadata',
  assessment: '/api/SuhailApiTest'
});

const CONTRACT_READ_ERROR_CODES = Object.freeze({
  RPC_UNAVAILABLE: 'RPC_UNAVAILABLE',
  INVALID_CHAIN_RESPONSE: 'INVALID_CHAIN_RESPONSE',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
});

const HTTP_STATUS = Object.freeze({
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_SERVER_ERROR: 500
});

const ERROR_RESPONSES = Object.freeze({
  [CONTRACT_READ_ERROR_CODES.RPC_UNAVAILABLE]: Object.freeze({
    status: HTTP_STATUS.SERVICE_UNAVAILABLE,
    message: 'Ethereum contract data is temporarily unavailable.'
  }),
  [CONTRACT_READ_ERROR_CODES.INVALID_CHAIN_RESPONSE]: Object.freeze({
    status: HTTP_STATUS.BAD_GATEWAY,
    message: 'Ethereum contract data could not be validated.'
  }),
  [CONTRACT_READ_ERROR_CODES.INTERNAL_ERROR]: Object.freeze({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: 'An unexpected server error occurred.'
  })
});

const LOG_MESSAGES = Object.freeze({
  success: 'USDC contract data:',
  failure: 'USDC contract read failed:'
});

module.exports = {
  USDC_CONTRACT,
  USDC_API_PATHS,
  CONTRACT_READ_ERROR_CODES,
  ERROR_RESPONSES,
  LOG_MESSAGES
};
