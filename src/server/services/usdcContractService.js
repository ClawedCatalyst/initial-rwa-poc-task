const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const ETHEREUM_MAINNET_CHAIN_ID = 1;

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
    throw new ContractReadError('INVALID_CHAIN_RESPONSE');
  }
  const amount = rawAmount?.toString();
  if (!/^\d+$/.test(amount)) {
    throw new ContractReadError('INVALID_CHAIN_RESPONSE');
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
          chainId: ETHEREUM_MAINNET_CHAIN_ID,
          contractAddress: USDC_ADDRESS
        });
      } catch (error) {
        if (error instanceof ContractReadError) throw error;
        throw new ContractReadError('RPC_UNAVAILABLE', error);
      }

      const { chainId, blockNumber, name, symbol, decimals, totalSupply } = snapshot || {};
      if (
        chainId !== ETHEREUM_MAINNET_CHAIN_ID ||
        !Number.isSafeInteger(blockNumber) || blockNumber < 0 ||
        typeof name !== 'string' || !name.trim() ||
        typeof symbol !== 'string' || !symbol.trim() ||
        !Number.isInteger(decimals) || decimals < 0 || decimals > 255
      ) {
        throw new ContractReadError('INVALID_CHAIN_RESPONSE');
      }

      return {
        chainId: ETHEREUM_MAINNET_CHAIN_ID,
        network: 'ethereum-mainnet',
        contractAddress: USDC_ADDRESS,
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
