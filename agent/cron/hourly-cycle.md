# Hourly Cycle — PerkyFi

This file defines what to do every hour.

## Trigger
- Cron: `0 * * * *` (every hour at :00)

## Steps

### 1. Health Check (FIRST - Non-negotiable)
```bash
memory-log --check
memory-log --recover
```
If health check fails, alert and investigate before proceeding.

### 2. Fetch Market Data
Query Polymarket via Bankr for:
- ETH price predictions
- BTC price predictions
- Macro events (Fed, regulations)

Log the data:
```bash
memory-log "Polymarket: ETH=$X (Y%), BTC=$A (B%)"
```

### 3. Analyze Sentiment
Apply conservative thresholds:
```
confidence > 85% → Strong signal
confidence > 75% → Moderate signal
confidence 60-75% → Hold
confidence < 60% → Defensive
```

Log decision:
```bash
memory-log "Analysis: [BULLISH/BEARISH/NEUTRAL] on [asset]"
```

### 4. Execute Trade (if applicable)
Only if confidence threshold met:

```bash
memory-log -op "morpho-deposit" "start" "Moving $X to [vault]"
# Execute via morpho-base skill
memory-log -op "morpho-deposit" "complete" "tx: 0x..."
```

If no trade needed:
```bash
memory-log "No action: confidence below threshold"
```

### 5. Generate Trade Signal
Create signal for the app:
- Signal ID (unique)
- Timestamp
- Polymarket data
- Action taken
- Vault/position details

### 6. Post to Social

**X (Twitter):**
```
🔮 hourly update

polymarket sentiment:
• eth > $4k: X% (+Y%)
• btc ath: A% (stable)

my move: [action]
[details]

copy this trade → app.perkyfi.xyz/trade/[id]

track record: X/Y (Z%)
#DeFi #Base
```

**Farcaster:**
Similar content, posted to /defi and /base channels.

### 7. Log Completion
```bash
memory-log "Hourly cycle complete"
```

## Error Handling

If ANY step fails:
1. Log the error immediately
2. Do NOT proceed to social posting
3. Alert for manual review
4. Next cycle should check for incomplete operations

## Skip Conditions

Skip the cycle if:
- Previous operation still in progress (`.current-op` exists)
- Wallet balance critically low
- API/service outage detected

Log the skip:
```bash
memory-log "Cycle skipped: [reason]"
```
