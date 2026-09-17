const {
  USDC_CONTRACT,
  CONTRACT_READ_ERROR_CODES
} = require('../constants/usdc');

class ContractReadError extends Error {
  constructor(code, cause) {
    super(code, { cause });
    this.name = 'ContractReadError';
    this.code = code;
  }
}

function formatTokenAmount(rawAmount, decimals) {
  // JavaScript numbers can already have lost precision before formatting.
  if (typeof rawAmount === 'number') {
    throw new ContractReadError(CONTRACT_READ_ERROR_CODES.INVALID_CHAIN_RESPONSE);
  }
  const amount = rawAmount?.toString();
  if (!/^\d+$/.test(amount)) {
    throw new ContractReadError(CONTRACT_READ_ERROR_CODES.INVALID_CHAIN_RESPONSE);
  }

  const scale = 10n ** BigInt(decimals);
  const whole = BigInt(amount) / scale;
  const remainder = BigInt(amount) % scale;
  if (remainder === 0n) return whole.toString();

  const fraction = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole}.${fraction}`;
}

function createUsdcContractService(reader) {
  if (!reader || typeof reader.readTokenSnapshot !== 'function') {
    throw new TypeError('A contract reader with readTokenSnapshot is required');
  }

  return {
    async getMetadata() {
      let snapshot;
      try {
        // The reader owns the RPC calls and must read all values at one block.
        snapshot = await reader.readTokenSnapshot({
          chainId: USDC_CONTRACT.chainId,
          contractAddress: USDC_CONTRACT.address
        });
      } catch (error) {
        if (error instanceof ContractReadError) throw error;
        throw new ContractReadError(CONTRACT_READ_ERROR_CODES.RPC_UNAVAILABLE, error);
      }

      const { chainId, blockNumber, name, symbol, decimals, totalSupply } = snapshot || {};
      if (
        chainId !== USDC_CONTRACT.chainId ||
        !Number.isSafeInteger(blockNumber) || blockNumber < 0 ||
        typeof name !== 'string' || !name.trim() ||
        typeof symbol !== 'string' || !symbol.trim() ||
        !Number.isInteger(decimals) || decimals < 0 || decimals > USDC_CONTRACT.maxDecimals
      ) {
        throw new ContractReadError(CONTRACT_READ_ERROR_CODES.INVALID_CHAIN_RESPONSE);
      }

      return {
        chainId: USDC_CONTRACT.chainId,
        network: USDC_CONTRACT.network,
        contractAddress: USDC_CONTRACT.address,
        name,
        symbol,
        decimals,
        totalSupply: formatTokenAmount(totalSupply, decimals),
        blockNumber
      };
    }
  };
}

module.exports = { createUsdcContractService, ContractReadError };
