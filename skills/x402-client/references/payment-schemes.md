# x402 Payment Schemes

## exact

The `exact` scheme transfers a specific amount to the resource server.

### Use Cases
- Pay $1 to read an article
- Pay $0.01 per API call
- Fixed-price resources

### Payload Structure

```json
{
  "scheme": "exact",
  "network": "base",
  "payload": {
    "signature": "0x...",
    "authorization": {
      "from": "0xClientWallet",
      "to": "0xServerWallet",
      "value": "1000000",  // Amount in smallest unit (1 USDC)
      "validAfter": 0,
      "validBefore": 1234567890,
      "nonce": "0xRandomNonce"
    }
  }
}
```

## upto (theoretical)

Would transfer up to an amount based on resource consumption.

### Use Cases
- LLM token generation (pay per token)
- Streaming content (pay per minute)
- Variable-cost operations

## Networks

| Network | Chain ID | USDC Address |
|---------|----------|--------------|
| Base | 8453 | 0x833589fCD6eDb6E08f4c7c32D4f71b54bdA02913 |
| Ethereum | 1 | 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 |
| Polygon | 137 | 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 |
