# Ethereum USDC Contract Read API

- **Method:** `GET`
- **Authentication:** None; the API reads public on-chain data
- **Content type:** `application/json`

## Purpose

This API gives clients a consistent way to read public data from Circle's USDC
contract on Ethereum mainnet. The backend makes the blockchain call; clients do
not need an RPC connection or an ethers.js dependency. Each successful request
also prints the returned data in the backend console for the delivery demo.

This delivery covers a read-only endpoint. It does not send transactions, manage
wallets, store data, or add a user interface.

## Routes


| Route                                           | Use                                        |
| ----------------------------------------------- | ------------------------------------------ |
| `GET /api/v1/blockchain/ethereum/usdc/metadata` | Primary route for client integrations      |
| `GET /api/SuhailApiTest`                        | Task-specific alias for the same operation |


Both routes have identical success and error responses. The alias is included
for this delivery; new integrations should use the primary route. Neither route
accepts request parameters or a request body.

## Data source


| Item              | Value                                               |
| ----------------- | --------------------------------------------------- |
| Network           | Ethereum mainnet, chain ID `1`                      |
| Contract          | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`        |
| Contract calls    | `name()`, `symbol()`, `decimals()`, `totalSupply()` |
| RPC configuration | Backend environment variable `ETHEREUM_RPC_URL`     |


The contract address is listed in
[Circle's USDC contract documentation](https://developers.circle.com/stablecoins/usdc-contract-addresses).
The backend must verify the RPC network's chain ID before accepting its data.
All contract values in one response must be read against the same block.

## Successful response

**HTTP 200**

```json
{
  "chainId": 1,
  "network": "ethereum-mainnet",
  "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "name": "USD Coin",
  "symbol": "USDC",
  "decimals": 6,
  "totalSupply": "<live decimal value>",
  "blockNumber": 12345678
}
```

The example block number is illustrative. `totalSupply` is a decimal **string**
formatted using the contract's `decimals` value; clients must not treat it as a
JavaScript number. `blockNumber` identifies the block used for all contract
reads in this response. `totalSupply` and `blockNumber` change as the chain
advances. The API does not cache responses for this delivery.

## Error responses

Errors use this JSON shape:

```json
{
  "error": "RPC_UNAVAILABLE",
  "message": "Ethereum contract data is temporarily unavailable."
}
```


| HTTP status | `error` value                | Meaning                                                     | Client action                     |
| ----------- | ---------------------------- | ----------------------------------------------------------- | --------------------------------- |
| `503`       | `RPC_UNAVAILABLE`            | Configured RPC providers timed out or could not be reached  | Retry later                       |
| `502`       | `INVALID_CHAIN_RESPONSE`     | Provider returned the wrong chain or unusable contract data | Report the failure                |
| `429`       | Existing rate-limit response | Too many API requests                                       | Retry after the rate-limit window |


Provider URLs, credentials, and raw provider errors must not appear in client
responses. Unexpected internal failures follow the server's existing `500`
error handler.