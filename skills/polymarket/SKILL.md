---
name: polymarket
description: Get real-time prediction market data from Polymarket. Use when you need actual market odds, event data, or prices for prediction markets. Supports politics, crypto, sports, and other categories.
---

# Polymarket Data

Get real prediction market data from Polymarket's public APIs.

## Quick Start

```bash
# Get active events with odds
./scripts/polymarket.mjs events --limit 10

# Get specific market by slug
./scripts/polymarket.mjs market --slug "presidential-election-winner-2028"

# Get markets by category
./scripts/polymarket.mjs events --category politics --limit 5
```

## Script Usage

The `scripts/polymarket.mjs` script provides these commands:

### events
List active events with their markets and current odds.
```bash
./scripts/polymarket.mjs events [--limit N] [--category CATEGORY]
```
Categories: `politics`, `crypto`, `sports`, `entertainment`, `science`, `business`

### market
Get detailed info for a specific market.
```bash
./scripts/polymarket.mjs market --slug SLUG
# or
./scripts/polymarket.mjs market --id MARKET_ID
```

### price
Get current price for a specific token.
```bash
./scripts/polymarket.mjs price --token TOKEN_ID
```

## API Endpoints (Direct Access)

If you prefer direct API calls:

### Gamma API (Markets & Events)
```bash
# List active events
curl -s "https://gamma-api.polymarket.com/events?limit=10&active=true&closed=false"

# List active markets
curl -s "https://gamma-api.polymarket.com/markets?limit=10&active=true&closed=false"

# Search events
curl -s "https://gamma-api.polymarket.com/events?limit=10&active=true&slug_contains=trump"
```

### CLOB API (Prices)
```bash
# Get price for a token
curl -s "https://clob.polymarket.com/price?token_id=TOKEN_ID"

# Get orderbook
curl -s "https://clob.polymarket.com/book?token_id=TOKEN_ID"
```

## Response Format

Events contain markets with these key fields:
- `question` - The prediction question
- `outcomePrices` - Array of [YES_price, NO_price] (0-1 scale, multiply by 100 for %)
- `volume` - Total trading volume
- `liquidity` - Current liquidity
- `clobTokenIds` - Token IDs for price queries

## Example Response

```json
{
  "question": "Will Trump win the 2028 election?",
  "outcomePrices": ["0.62", "0.38"],
  "volume": "5000000",
  "slug": "presidential-election-winner-2028"
}
```
This means: YES has 62% odds, NO has 38% odds.

## Integration with Trading Signals

When creating PerkyFi signals, use real Polymarket data:

1. Fetch relevant markets: `./scripts/polymarket.mjs events --category politics`
2. Extract odds from `outcomePrices`
3. Use in `market_analysis.current_odds` field
4. Reference the actual Polymarket URL in analysis
