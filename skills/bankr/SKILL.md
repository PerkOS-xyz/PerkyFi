---
name: perkyfi-bankr
description: Bankr API integration for Polymarket predictions. Fetches market odds and sentiment for crypto predictions.
metadata:
  {
    "clawdbot": {
      "emoji": "🔮",
      "homepage": "https://bankr.bot",
      "requires": { "bins": ["curl", "jq"], "env": ["BANKR_API_KEY"] }
    }
  }
---

# Bankr Polymarket Skill

Fetch prediction market data from Polymarket via Bankr API.

## Overview

This skill enables PerkyFi to:
- Search Polymarket for crypto-related predictions
- Get confidence percentages (odds) for specific markets
- Track market sentiment on ETH, BTC, and Base ecosystem

## Prerequisites

- Bankr API key with Agent API access enabled
- `BANKR_API_KEY` environment variable set

## Scripts

### get-market-odds.sh

Get odds for a specific prediction market:
```bash
./scripts/get-market-odds.sh "ETH above $4000 by March"
```

### search-crypto-markets.sh

Search for active crypto prediction markets:
```bash
./scripts/search-crypto-markets.sh
```

### analyze-for-signal.sh

Full analysis pipeline for signal generation:
```bash
./scripts/analyze-for-signal.sh
# Returns: JSON with markets, confidence scores, recommended action
```

## API Pattern

Bankr uses async job pattern:
1. Submit prompt → get job ID
2. Poll job status every 2s
3. Process results when completed

See `bankr-references/api-workflow.md` for details.

## Environment

```bash
export BANKR_API_KEY="your-api-key"
```

## Output Format

Signals are returned as JSON:
```json
{
  "market": "ETH > $4000 by March",
  "confidence": 78,
  "source": "polymarket",
  "timestamp": "2026-02-05T10:45:00Z",
  "recommendation": {
    "action": "deposit",
    "vault": "Steakhouse USDC",
    "reasoning": "High confidence bullish signal"
  }
}
```
