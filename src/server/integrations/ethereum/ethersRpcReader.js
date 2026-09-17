const { USDC_ABI, CONTRACT_READ_ERROR_CODES } = require('../../constants/usdc');
const { ContractReadError } = require('../../services/usdcContractService');

function createEthersRpcReader(provider, Contract = require('ethers').Contract) {
  if (!provider || typeof provider.send !== 'function' || typeof provider.getBlockNumber !== 'function') {
    throw new TypeError('An Ethereum JSON-RPC provider is required');
  }

  return {
    async readTokenSnapshot({ chainId, contractAddress }) {
      try {
        // Check the node itself rather than trusting a configured network label.
        const actualChainId = Number(await provider.send('eth_chainId', []));
        if (!Number.isSafeInteger(actualChainId) || actualChainId !== chainId) {
          throw new ContractReadError(CONTRACT_READ_ERROR_CODES.INVALID_CHAIN_RESPONSE);
        }

        const blockNumber = await provider.getBlockNumber();
        const contract = new Contract(contractAddress, USDC_ABI, provider);
        const atBlock = { blockTag: blockNumber };
        const [name, symbol, decimals, totalSupply] = await Promise.all([
          contract.name(atBlock),
          contract.symbol(atBlock),
          contract.decimals(atBlock),
          contract.totalSupply(atBlock)
        ]);

        return { chainId: actualChainId, blockNumber, name, symbol, decimals, totalSupply };
      } catch (error) {
        if (error instanceof ContractReadError) throw error;
        const code = error && error.code;
        const responseCode = ['CALL_EXCEPTION', 'BAD_DATA', 'BUFFER_OVERRUN'].includes(code)
          ? CONTRACT_READ_ERROR_CODES.INVALID_CHAIN_RESPONSE
          : CONTRACT_READ_ERROR_CODES.RPC_UNAVAILABLE;
        throw new ContractReadError(responseCode, error);
      }
    }
  };
}

module.exports = { createEthersRpcReader };
