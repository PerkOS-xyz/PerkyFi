---
name: perkyfi-x-bot
description: X/Twitter posting module for PerkyFi signals. Uses Bird CLI for automated posts.
metadata:
  {
    "clawdbot": {
      "emoji": "🐦",
      "homepage": "https://x.com/PerkyFi",
      "requires": { "bins": ["bird", "jq"] }
    }
  }
---

# X Bot Skill

Automated posting to X/Twitter for PerkyFi trade signals.

## Overview

This skill handles:
- Posting trade signals to @PerkyFi account
- Rate limiting (max 4 posts/day)
- Post tracking to avoid duplicates
- Error handling and retries

## Prerequisites

- Bird CLI installed and configured with @PerkyFi cookies
- `~/.bird/` directory with authentication

## Scripts

### post-signal.sh

Post a signal to X:
```bash
./scripts/post-signal.sh <signal_json_file>
# or
echo '{"post_template": {...}}' | ./scripts/post-signal.sh -
```

### check-rate-limit.sh

Check if we can post (respects 4 posts/day limit):
```bash
./scripts/check-rate-limit.sh
# Returns: {"can_post": true, "posts_today": 2, "next_window": "..."}
```

### get-recent-posts.sh

Get recent posts from @PerkyFi:
```bash
./scripts/get-recent-posts.sh [--limit 10]
```

## Post Format

Standard signal post:
```
🔮 PerkyFi Signal #042

📊 ETH Bull Market: 78% confidence
💰 Action: Deposit to Steakhouse USDC (4.2% APY)

🔗 Copy trade: perkyfi-app.netlify.app/trade/042

#DeFi #Base #AI #YieldFarming
```

## Rate Limiting

- Maximum: 4 posts per 24 hours
- Minimum interval: 6 hours between posts
- Posts tracked in `~/.perkyfi/post-history.json`

## Error Handling

| Error | Action |
|-------|--------|
| Rate limited | Wait and retry |
| Auth expired | Alert for re-auth |
| Network error | Retry 3x with backoff |
| Duplicate | Skip (already posted) |

## Integration

Called by `agent/scripts/hourly-cycle.sh` after signal generation:
```bash
# In hourly-cycle.sh
./skills/x-bot/scripts/post-signal.sh "$SIGNAL_FILE"
```

## Account

- **Handle:** @PerkyFi
- **URL:** https://x.com/PerkyFi
- **Type:** Bot/AI Agent
