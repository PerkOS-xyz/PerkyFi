---
name: perkyfi-x402-client
description: Make x402 payments to access paid APIs and resources. HTTP-native payment protocol by Coinbase.
metadata:
  {
    "clawdbot": {
      "emoji": "💳",
      "homepage": "https://x402.org",
      "requires": { "bins": ["curl", "jq", "node"] }
    }
  }
---

# x402 Client Skill

Make payments to x402-enabled APIs and services using HTTP-native payments.

## Overview

x402 is an open payment standard for the internet. When a resource requires payment, it returns:
- HTTP 402 (Payment Required) status
- `PAYMENT-REQUIRED` header with payment details

The client signs a payment and includes it in the `PAYMENT-SIGNATURE` header.

## Flow

```
1. Client → Request resource
2. Server → 402 + PAYMENT-REQUIRED header (JSON base64)
3. Client → Signs payment payload
4. Client → Request with PAYMENT-SIGNATURE header
5. Server → Verifies with facilitator
6. Server → Returns resource + PAYMENT-RESPONSE header
```

## Supported Networks

| Network | Chain ID | Tokens |
|---------|----------|--------|
| Base | 8453 | USDC |
| Ethereum | 1 | USDC, ETH |
| Polygon | 137 | USDC |
| Arbitrum | 42161 | USDC |

## Usage

### Make x402 Request

```bash
# Request a paid resource
./scripts/x402-request.sh "https://api.example.com/premium-data"
```

### Check if Resource Requires Payment

```bash
./scripts/x402-check.sh "https://api.example.com/premium-data"
```

### Manual Payment Flow

```bash
# 1. Get payment requirements
REQUIREMENTS=$(./scripts/get-requirements.sh "https://api.example.com/data")

# 2. Create and sign payment
PAYLOAD=$(./scripts/create-payment.sh "$REQUIREMENTS")

# 3. Send request with payment
./scripts/send-with-payment.sh "https://api.example.com/data" "$PAYLOAD"
```

## Payment Payload Structure

```json
{
  "x402Version": 1,
  "scheme": "exact",
  "network": "base",
  "payload": {
    "signature": "0x...",
    "authorization": {
      "from": "0x...",
      "to": "0x...",
      "value": "1000000",
      "validAfter": 0,
      "validBefore": 1234567890,
      "nonce": "0x..."
    }
  }
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PRIVATE_KEY` | Wallet private key for signing | Yes |
| `X402_NETWORK` | Default network (base, ethereum) | No |
| `X402_FACILITATOR` | Facilitator URL | No |

## Facilitators

Facilitators verify and settle payments:

| Provider | URL | Networks |
|----------|-----|----------|
| Coinbase | `https://x402.org/facilitator` | All |
| Custom | Your own | Configurable |

## Integration with PerkyFi

PerkyFi uses x402 for:
- Premium market data APIs
- Enhanced Polymarket analytics
- AI model inference endpoints
- Rate-limited API access

## Example: Paid Weather API

```bash
# Request weather data (auto-handles payment)
RESULT=$(./scripts/x402-request.sh "https://weather.x402.example/current?city=NYC")
echo "$RESULT" | jq '.temperature'
```

## TypeScript SDK

For programmatic use:

```typescript
import { createX402Client } from '@x402/fetch';
import { createEVMSigner } from '@x402/evm';

const signer = createEVMSigner(privateKey);
const client = createX402Client({ signer });

const response = await client.fetch('https://api.example.com/data');
const data = await response.json();
```

## Error Handling

| Error | Meaning | Solution |
|-------|---------|----------|
| 402 Payment Required | Resource needs payment | Sign and send payment |
| 400 Invalid Payment | Malformed payload | Check signature format |
| 402 Insufficient Funds | Not enough balance | Add funds to wallet |
| 403 Payment Rejected | Payment validation failed | Check amount/recipient |

## Resources

- [x402 Spec](https://github.com/coinbase/x402)
- [x402.org](https://x402.org)
- [TypeScript SDK](https://www.npmjs.com/package/@x402/core)
- [Python SDK](https://pypi.org/project/x402/)

---

*Part of the PerkyFi project - PerkOS ecosystem*
