# PerkyFi Memory Management (Production-First)

## 🚨 El Problema

En VPS con recursos limitados, el contexto del agente es corto y puede perderse:

1. **Compaction silenciosa** — OpenClaw compacta cuando el contexto llega al límite
2. **Sin warning** — El agente pierde contexto sin aviso
3. **Operaciones críticas** — Un trade a mitad de proceso puede fallar
4. **Recursos limitados** — VPS tiene menos RAM/CPU que desktop

**Caso real (GitHub #5429):** Usuario perdió 45 horas de contexto porque el agente no escribió a disco antes de compaction.

---

## 🛡️ Estrategia de Protección Multi-Capa

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION MEMORY STACK                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: REAL-TIME LOGGING                                │
│  └── memory-log skill: escribe INMEDIATAMENTE              │
│                                                             │
│  Layer 2: PRE-COMPACTION FLUSH                             │
│  └── memoryFlush.enabled = true                            │
│  └── Aggressive threshold (8000 tokens)                    │
│                                                             │
│  Layer 3: OPERATION CHECKPOINTS                            │
│  └── Guardar estado antes de operaciones críticas          │
│  └── Resume si falla                                       │
│                                                             │
│  Layer 4: VECTOR MEMORY SEARCH                             │
│  └── Semantic search para recuperar contexto               │
│                                                             │
│  Layer 5: HEARTBEAT VERIFICATION                           │
│  └── Verificar salud de memoria cada heartbeat             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Layer 1: Real-Time Logging Skill

### Skill: `memory-log`

```bash
# /root/perkyfi/agent/skills/memory-log/memory-log
#!/bin/bash
# Real-time memory logging for PerkyFi
# Usage: memory-log "entry" or memory-log -s "Section" "entry"

set -euo pipefail

WORKSPACE="${OPENCLAW_WORKSPACE:-/root/perkyfi/agent/workspace}"
MEMORY_DIR="$WORKSPACE/memory"
TODAY=$(date +%Y-%m-%d)
FILE="$MEMORY_DIR/$TODAY.md"
TIME=$(date +%H:%M:%S)

mkdir -p "$MEMORY_DIR"

# Health check mode
if [[ "${1:-}" == "--check" ]]; then
    if [[ ! -f "$FILE" ]]; then
        echo "⚠️ MISSING: $FILE"
        exit 1
    fi
    SIZE=$(wc -c < "$FILE" | tr -d ' ')
    if [[ $SIZE -lt 100 ]]; then
        echo "⚠️ SPARSE: $FILE ($SIZE bytes)"
        exit 1
    fi
    echo "✅ OK: $FILE ($SIZE bytes)"
    exit 0
fi

# Initialize file if missing
if [[ ! -f "$FILE" ]]; then
    cat > "$FILE" << EOF
# PerkyFi Agent Log — $TODAY

## Operations
EOF
fi

# Section mode: memory-log -s "Section" "entry"
if [[ "${1:-}" == "-s" ]]; then
    SECTION="${2:-General}"
    ENTRY="${3:-}"
    if ! grep -q "^## $SECTION" "$FILE"; then
        echo -e "\n## $SECTION" >> "$FILE"
    fi
    echo "- [$TIME] $ENTRY" >> "$FILE"
    exit 0
fi

# Operation mode: memory-log -op "trade" "start|complete|fail" "details"
if [[ "${1:-}" == "-op" ]]; then
    OP_NAME="${2:-operation}"
    OP_STATUS="${3:-}"
    OP_DETAILS="${4:-}"
    
    case "$OP_STATUS" in
        start)
            echo -e "\n### 🔄 $OP_NAME (started $TIME)" >> "$FILE"
            echo "- Details: $OP_DETAILS" >> "$FILE"
            # Save checkpoint
            echo "$OP_NAME|$TIME|$OP_DETAILS" > "$MEMORY_DIR/.current-op"
            ;;
        complete)
            echo "- ✅ Completed at $TIME" >> "$FILE"
            echo "- Result: $OP_DETAILS" >> "$FILE"
            rm -f "$MEMORY_DIR/.current-op"
            ;;
        fail)
            echo "- ❌ Failed at $TIME" >> "$FILE"
            echo "- Error: $OP_DETAILS" >> "$FILE"
            rm -f "$MEMORY_DIR/.current-op"
            ;;
    esac
    exit 0
fi

# Default: append timestamped entry
echo "- [$TIME] ${1:-}" >> "$FILE"
```

### SKILL.md

```markdown
---
name: memory-log
description: Real-time memory logging for PerkyFi agent. Use for ALL operations to ensure persistence before compaction.
metadata:
  clawdbot:
    emoji: "📝"
    requires:
      bins: [bash, date]
---

# Memory Log Skill

Write to memory IMMEDIATELY. Never batch. Compaction can happen anytime.

## Usage

\`\`\`bash
# Simple log
memory-log "Analyzed Polymarket, ETH confidence 78%"

# Section log
memory-log -s "Trades" "Deposited 100 USDC to Morpho"

# Operation tracking (REQUIRED for critical operations)
memory-log -op "morpho-deposit" "start" "100 USDC to Steakhouse vault"
# ... do operation ...
memory-log -op "morpho-deposit" "complete" "tx: 0x123..."
# or if failed:
memory-log -op "morpho-deposit" "fail" "insufficient balance"

# Health check
memory-log --check
\`\`\`

## Rules (Non-Negotiable)

1. **Log IMMEDIATELY** after any significant action
2. **Use -op** for all blockchain operations
3. **Never batch** — write one entry at a time
4. **Check health** at every heartbeat
```

---

## ⚙️ Layer 2: Pre-Compaction Flush Config

### OpenClaw Config: `config/openclaw.json`

```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "mode": "safeguard",
        "reserveTokensFloor": 20000,
        "memoryFlush": {
          "enabled": true,
          "softThresholdTokens": 8000,
          "systemPrompt": "🚨 CRITICAL: Session nearing compaction. You MUST save all important context to memory/YYYY-MM-DD.md NOW. Use memory-log skill. Include: current operation state, pending actions, important decisions. This is NOT optional.",
          "prompt": "COMPACTION WARNING: Write everything important from this session to memory immediately using memory-log. Include:\n1. Current operation state (if any)\n2. Pending actions\n3. Recent decisions and their reasoning\n4. Any context needed for continuity\n\nAfter writing, reply with NO_REPLY."
        }
      }
    }
  }
}
```

### Why These Values?

| Setting | Value | Reason |
|---------|-------|--------|
| `reserveTokensFloor` | 20000 | Keep buffer for flush operation |
| `softThresholdTokens` | 8000 | Trigger early (VPS has less headroom) |
| `mode` | "safeguard" | Extra protection |

---

## 🔄 Layer 3: Operation Checkpoints

### Critical Operations That Need Checkpointing

| Operation | Risk | Checkpoint Strategy |
|-----------|------|---------------------|
| **Morpho Deposit** | HIGH | Start → TX Sent → Confirmed |
| **Morpho Withdraw** | HIGH | Start → TX Sent → Confirmed |
| **Social Post** | MEDIUM | Draft → Posted → Confirmed |
| **ERC-8004 Register** | HIGH | Start → TX Sent → Confirmed |
| **x402 Payment** | MEDIUM | Received → Verified → Processed |

### Checkpoint File Structure

```
/root/perkyfi/agent/workspace/memory/
├── 2026-02-02.md           # Daily log
├── .current-op             # Current operation checkpoint
└── .operation-history      # Completed operations log
```

### `.current-op` Format

```
operation_name|start_time|details|tx_hash(if any)
```

### Recovery on Restart

```bash
# In agent startup script
if [[ -f "$MEMORY_DIR/.current-op" ]]; then
    echo "⚠️ Found incomplete operation. Recovery needed."
    cat "$MEMORY_DIR/.current-op"
    # Agent should check and resume/rollback
fi
```

---

## 🔍 Layer 4: Vector Memory Search Config

```json
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "enabled": true,
        "provider": "openai",
        "model": "text-embedding-3-small",
        "fallback": "none",
        "remote": {
          "batch": {
            "enabled": true,
            "concurrency": 2
          }
        },
        "sync": {
          "watch": true
        },
        "query": {
          "hybrid": {
            "enabled": true,
            "vectorWeight": 0.7,
            "textWeight": 0.3
          }
        },
        "cache": {
          "enabled": true,
          "maxEntries": 10000
        }
      }
    }
  }
}
```

---

## 💓 Layer 5: Heartbeat Verification

### HEARTBEAT.md

```markdown
# PerkyFi Heartbeat Check

## 1. Memory Health (FIRST - Non-negotiable)

\`\`\`bash
memory-log --check
\`\`\`

If MISSING or SPARSE:
1. ALERT immediately
2. Write current state to memory
3. Check for incomplete operations (.current-op)

## 2. Operation Recovery

Check for `.current-op` file:
- If exists → operation was interrupted
- Log the interruption
- Attempt recovery or alert for manual intervention

## 3. Agent Wallet Health

Check Base mainnet:
- ETH balance for gas
- USDC balance for operations
- Morpho positions

## 4. Service Health

- Is Next.js app running? (curl localhost:3000/api/health)
- Are social accounts connected?

If all checks pass → HEARTBEAT_OK
If any issue → Report and attempt fix
```

---

## 📋 AGENTS.md Rules (Non-Negotiable)

```markdown
### ⚠️ MEMORY RULES (Production - Non-Negotiable)

1. **WRITE IMMEDIATELY** — After ANY significant action, use `memory-log`
2. **CHECKPOINT OPERATIONS** — Use `memory-log -op` for ALL blockchain transactions
3. **NEVER BATCH** — One entry per action, immediately
4. **CHECK HEALTH** — Every heartbeat starts with `memory-log --check`
5. **RECOVER GRACEFULLY** — If `.current-op` exists, handle it first

### What Counts as "Significant"?

- Any blockchain transaction (start, send, confirm)
- Any decision made
- Any error encountered
- Any configuration change
- Any analysis completed
- Any social post drafted/sent

### Example Workflow

\`\`\`
1. memory-log "Starting hourly cycle"
2. memory-log "Fetched Polymarket: ETH 78%, BTC 65%"
3. memory-log -op "morpho-deposit" "start" "Moving 50 USDC to ETH vault"
4. [execute transaction]
5. memory-log -op "morpho-deposit" "complete" "tx: 0x123..."
6. memory-log -s "Social" "Posted update to X and Farcaster"
7. memory-log "Hourly cycle complete"
\`\`\`
```

---

## 🚀 VPS-Specific Optimizations

### 1. Reduce Context Window Pressure

```json
{
  "model": "anthropic/claude-sonnet-4-5",
  "modelOptions": {
    "max_tokens": 4096
  },
  "agents": {
    "defaults": {
      "compaction": {
        "reserveTokensFloor": 20000
      }
    }
  }
}
```

### 2. Aggressive Memory Sync

```json
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "sync": {
          "watch": true,
          "debounceMs": 500,
          "intervalMs": 30000
        }
      }
    }
  }
}
```

### 3. Limit Session History

```json
{
  "sessions": {
    "maxHistorySize": 50,
    "compactAfterMessages": 30
  }
}
```

---

## 📊 Monitoring

### Log Rotation

```bash
# /etc/logrotate.d/perkyfi-memory
/root/perkyfi/agent/workspace/memory/*.md {
    monthly
    rotate 12
    compress
    missingok
    notifempty
    create 644 root root
}
```

### Health Check Cron

```bash
# Check memory health every 5 minutes
*/5 * * * * root /root/perkyfi/agent/skills/memory-log/memory-log --check >> /var/log/perkyfi-memory-health.log 2>&1
```

### Alert on Issues

```bash
# In cron job
if ! memory-log --check > /dev/null 2>&1; then
    echo "Memory health check failed at $(date)" | \
    curl -X POST "https://api.telegram.org/bot$TG_BOT_TOKEN/sendMessage" \
        -d "chat_id=$TG_CHAT_ID" \
        -d "text=⚠️ PerkyFi memory health check failed!"
fi
```

---

## ✅ Checklist: Production Memory Setup

- [ ] Install `memory-log` skill
- [ ] Configure `memoryFlush` in openclaw.json
- [ ] Configure `memorySearch` for vector retrieval
- [ ] Add memory rules to AGENTS.md
- [ ] Create HEARTBEAT.md with health checks
- [ ] Setup log rotation
- [ ] Setup health check cron
- [ ] Setup alerting (Telegram/Discord)
- [ ] Test recovery from interrupted operation
- [ ] Test compaction behavior

---

*Production-first: If it's not written to disk, it doesn't exist.*
