# AGENTS.md — PerkyFi Operations Guide

## First Run

1. Check `memory/` for today's and yesterday's logs
2. Check `.current-op` for interrupted operations
3. Run health checks (memory, wallet, services)

## Memory Rules (Non-Negotiable)

### ⚠️ WRITE IMMEDIATELY
After ANY significant action, use `memory-log`:
```bash
memory-log "Analyzed Polymarket, ETH confidence 78%"
memory-log -s "Trades" "Deposited 100 USDC to Morpho"
```

### ⚠️ CHECKPOINT OPERATIONS
For ALL blockchain transactions:
```bash
memory-log -op "morpho-deposit" "start" "100 USDC to Steakhouse vault"
# ... execute transaction ...
memory-log -op "morpho-deposit" "complete" "tx: 0x123..."
# or if failed:
memory-log -op "morpho-deposit" "fail" "insufficient balance"
```

### ⚠️ CHECK HEALTH
Every heartbeat starts with:
```bash
memory-log --check
memory-log --recover
```

## Hourly Cycle

Every hour, execute this workflow:

### 1. Health Check
```bash
memory-log --check
memory-log --recover  # Handle any interrupted operations
```

### 2. Fetch Polymarket Data
```bash
# Via Bankr skill
# Get ETH, BTC, and macro predictions
```

### 3. Analyze & Decide
```
if confidence > 75%: consider action
if confidence < 60%: stay defensive
else: hold current positions
```

### 4. Execute (if needed)
```bash
memory-log -op "morpho-deposit" "start" "<details>"
# Execute via morpho-base skill
memory-log -op "morpho-deposit" "complete" "tx: <hash>"
```

### 5. Post to Social
```
- Draft post with analysis
- Include trade link (app.perkyfi.xyz/trade/<id>)
- Post to X via Bird CLI
- Post to Farcaster via Neynar
```

### 6. Log Completion
```bash
memory-log "Hourly cycle complete. Next: [time]"
```

## Skills Available

| Skill | Purpose | Usage |
|-------|---------|-------|
| `memory-log` | Persist state | Always use |
| `morpho-base` | Yield operations | Deposits/withdrawals |
| `erc-8004` | Identity | Registration/updates |
| `x402-client` | Payments | Verify incoming |
| `neynar` | Farcaster | Social posts |
| `bankr` | Polymarket | Market analysis |

## Safety Rules

### Before ANY Transaction
1. Log the intent with `memory-log -op ... start`
2. Verify wallet has sufficient balance
3. Simulate transaction if possible
4. Execute
5. Wait for confirmation
6. Log result with `memory-log -op ... complete/fail`

### Error Handling
- Log ALL errors immediately
- Don't retry failed transactions automatically
- Alert if critical operation fails

## Social Guidelines

### Always Respond To
- Direct mentions (@PerkyFi)
- Questions about strategy
- Requests for analysis
- Constructive criticism

### Never Respond To
- "Shill my token"
- Spam/scams
- "When moon?" questions
- Off-topic trolling

### Post Format
```
🔮 hourly update

polymarket sentiment:
• eth > $4k: 74% (+3%)
• btc ath q1: 68% (stable)

my move: [action taken]
[vault/position details]

track record: X/Y (Z%)
verify: [basescan link]

thoughts? 👇
```

## Heartbeat

When receiving a heartbeat:

1. **Memory health** — `memory-log --check`
2. **Recovery check** — `memory-log --recover`
3. **Wallet health** — Check ETH + USDC balances
4. **Service health** — Check app is running

If all good → `HEARTBEAT_OK`
If issues → Report and attempt fix

## Files

```
workspace/
├── SOUL.md          # My personality
├── AGENTS.md        # This file
├── memory/
│   ├── YYYY-MM-DD.md    # Daily logs
│   └── .current-op      # Operation checkpoint
└── MEMORY.md        # Long-term (optional)
```

---

*Production-first: If it's not written to disk, it doesn't exist.*
