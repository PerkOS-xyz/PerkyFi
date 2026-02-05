# PerkyFi Agent Setup Guide

Quick guide to set up the PerkyFi autonomous agent.

## Prerequisites

### System Requirements
- Linux VPS (Ubuntu 22.04+ recommended)
- 2GB RAM minimum
- Node.js 20+
- OpenClaw installed

### API Keys Required
- **BANKR_API_KEY** - From https://bankr.bot/api (enable Agent API)
- **BASE_RPC_URL** - Public (https://mainnet.base.org) or private RPC

### Tools
```bash
# Install Foundry (for cast CLI)
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup

# Verify installation
cast --version
```

## Agent Installation

### 1. Clone Repository
```bash
git clone https://github.com/PerkOS-xyz/PerkyFi.git
cd PerkyFi
```

### 2. Set Up Environment
```bash
# Create agent environment file
cat > agent/.env << 'EOF'
# Required
BANKR_API_KEY=your-bankr-api-key
PRIVATE_KEY=your-agent-wallet-private-key

# Optional (have defaults)
BASE_RPC_URL=https://mainnet.base.org
CONFIDENCE_THRESHOLD=70
DRY_RUN=false
EOF

chmod 600 agent/.env
```

### 3. Configure OpenClaw
```bash
# Copy the OpenClaw config
cp agent/config/openclaw.json ~/.openclaw/config.json

# Edit with your settings
nano ~/.openclaw/config.json
```

### 4. Set Up Bird CLI (X Posting)
```bash
# Install Bird CLI globally
npm install -g @anthropic/bird-cli

# Authenticate with X cookies
bird auth
# Follow prompts to enter cookies from x.com
```

### 5. Create Agent Wallet
```bash
# Generate a new wallet (or use existing)
cast wallet new

# Fund with small amount of ETH (for gas) + USDC (for Morpho)
# Transfer to the wallet address shown
```

## Running the Agent

### Manual Test Run
```bash
# Dry run (no actual posts or transactions)
cd PerkyFi
DRY_RUN=true ./agent/scripts/hourly-cycle.sh
```

### Production (Cron)
```bash
# Add to crontab for every 6 hours
crontab -e

# Add this line:
0 */6 * * * cd /path/to/PerkyFi && ./agent/scripts/hourly-cycle.sh >> /var/log/perkyfi.log 2>&1
```

### Systemd Service (Alternative)
```bash
# Create service file
sudo cat > /etc/systemd/system/perkyfi-agent.timer << 'EOF'
[Unit]
Description=PerkyFi Agent Timer

[Timer]
OnBootSec=5min
OnUnitActiveSec=6h
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo cat > /etc/systemd/system/perkyfi-agent.service << 'EOF'
[Unit]
Description=PerkyFi Agent Cycle
After=network.target

[Service]
Type=oneshot
User=perkyfi
WorkingDirectory=/opt/perkyfi
ExecStart=/opt/perkyfi/agent/scripts/hourly-cycle.sh
EnvironmentFile=/opt/perkyfi/agent/.env
EOF

sudo systemctl enable perkyfi-agent.timer
sudo systemctl start perkyfi-agent.timer
```

## Directory Structure

```
agent/
├── config/
│   └── openclaw.json      # OpenClaw gateway config
├── workspace/
│   ├── SOUL.md            # Agent personality
│   ├── AGENTS.md          # Operations guide
│   ├── memory/            # Daily logs
│   └── signals/           # Generated signals (JSON)
├── scripts/
│   ├── hourly-cycle.sh    # Main workflow
│   ├── get-latest-signal.sh
│   └── list-signals.sh
├── cron/
│   └── hourly-cycle.md    # Cron job definition
└── .env                   # Environment variables
```

## Skills Overview

| Skill | Path | Purpose |
|-------|------|---------|
| bankr | `skills/bankr/` | Polymarket data via Bankr API |
| morpho-base | `skills/morpho-base/` | Morpho vault interactions |
| x-bot | `skills/x-bot/` | X posting with rate limits |

## Troubleshooting

### Bankr API Errors
```bash
# Test Bankr connection
source agent/.env
curl -s -X POST "https://api.bankr.bot/agent/prompt" \
  -H "X-API-Key: $BANKR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is the price of ETH?"}'
```

### Cast/Foundry Issues
```bash
# Check cast is working
cast call 0x833589fCD6eDb6E08f4c7c32D4f71b54bdA02913 "symbol()(string)" --rpc-url https://mainnet.base.org
# Should return: USDC
```

### Bird CLI Issues
```bash
# Re-authenticate
bird auth --clear
bird auth

# Test post (dry run)
bird post "Test post" --dry-run
```

### Rate Limiting
```bash
# Check post rate limit status
./skills/x-bot/scripts/check-rate-limit.sh
```

## Monitoring

### Check Agent Status
```bash
# View recent signals
ls -la agent/workspace/signals/

# View logs
tail -f /var/log/perkyfi.log

# Check post history
cat ~/.perkyfi/post-history.json | jq '.'
```

### Memory/Logs
```bash
# Today's memory
cat agent/workspace/memory/$(date +%Y-%m-%d).md
```

## Security Notes

1. **Never expose PRIVATE_KEY** - Use environment variables only
2. **Secure .env file** - `chmod 600 agent/.env`
3. **Use dedicated wallet** - Don't use personal wallet for agent
4. **Start with small amounts** - Test with minimal USDC first
5. **Monitor logs** - Check for errors regularly

---

## Quick Reference

```bash
# Dry run
DRY_RUN=true ./agent/scripts/hourly-cycle.sh

# Production run
./agent/scripts/hourly-cycle.sh

# Check rate limits
./skills/x-bot/scripts/check-rate-limit.sh

# Get latest signal
./agent/scripts/get-latest-signal.sh

# Check Morpho vault APY
./skills/morpho-base/scripts/get-vault-apy.sh
```

---

*Part of PerkyFi - PerkOS ecosystem*
