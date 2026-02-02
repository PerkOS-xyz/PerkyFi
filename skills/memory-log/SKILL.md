---
name: memory-log
description: Real-time memory logging for production agents. Ensures persistence before compaction. Use for ALL operations.
metadata:
  clawdbot:
    emoji: "📝"
    requires:
      bins: [bash, date]
---

# Memory Log Skill

**Production-first:** Write to memory IMMEDIATELY. Never batch. Compaction can happen anytime.

## Why This Exists

OpenClaw compacts context silently when it reaches limits. Without real-time logging:
- Agent loses context
- Operations can be interrupted
- No recovery possible

This skill ensures every significant action is persisted BEFORE compaction.

## Usage

### Simple Log
```bash
memory-log "Analyzed Polymarket, ETH confidence 78%"
```

### Section Log
```bash
memory-log -s "Trades" "Deposited 100 USDC to Morpho"
memory-log -s "Analysis" "BTC sentiment declining"
```

### Operation Tracking (REQUIRED for blockchain operations)
```bash
# Start operation (creates checkpoint)
memory-log -op "morpho-deposit" "start" "100 USDC to Steakhouse vault"

# ... execute operation ...

# Mark complete (removes checkpoint)
memory-log -op "morpho-deposit" "complete" "tx: 0x123..."

# Or if failed
memory-log -op "morpho-deposit" "fail" "insufficient balance"
```

### Health Check
```bash
memory-log --check
# Returns: ✅ OK or ⚠️ MISSING/SPARSE
```

### Recovery Check
```bash
memory-log --recover
# Returns incomplete operations if any
```

## Rules (Non-Negotiable)

1. **Log IMMEDIATELY** after any significant action
2. **Use -op** for all blockchain operations
3. **Never batch** — write one entry at a time
4. **Check health** at every heartbeat
5. **Check recovery** at startup

## What to Log

- ✅ Any blockchain transaction (start, send, confirm)
- ✅ Any decision made
- ✅ Any error encountered
- ✅ Any configuration change
- ✅ Any analysis completed
- ✅ Any social post drafted/sent

## Example Workflow

```bash
memory-log "Starting hourly cycle"
memory-log "Fetched Polymarket: ETH 78%, BTC 65%"
memory-log -op "morpho-deposit" "start" "Moving 50 USDC to ETH vault"
# ... execute tx ...
memory-log -op "morpho-deposit" "complete" "tx: 0x123..."
memory-log -s "Social" "Posted update to X and Farcaster"
memory-log "Hourly cycle complete"
```

## Files Created

- `memory/YYYY-MM-DD.md` — Daily log
- `memory/.current-op` — Current operation checkpoint (for recovery)
