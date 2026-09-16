const { RPC_SETTINGS } = require('../../constants/usdc');

function validateRpcUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError('Ethereum RPC URL must be a valid URL');
  }

  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocal)) {
    throw new TypeError('Ethereum RPC URL must use HTTPS or local HTTP');
  }
  return value;
}

function createRpcProviders(env = process.env, ethers = require('ethers')) {
  const urls = [env.ETHEREUM_RPC_URL || RPC_SETTINGS.defaultUrl];
  if (env.ETHEREUM_FALLBACK_RPC_URL) urls.push(env.ETHEREUM_FALLBACK_RPC_URL);

  return urls.map((url) => new ethers.providers.JsonRpcProvider({
    url: validateRpcUrl(url),
    timeout: RPC_SETTINGS.timeoutMs
  }));
}

module.exports = { createRpcProviders };
