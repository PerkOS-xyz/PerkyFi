#!/bin/bash
# PerkyFi VPS Setup - Step 4: OpenClaw Agent (Hardened)
# Run as root
# Based on VittoStack's security guide

set -euo pipefail

echo "🚀 PerkyFi VPS Setup - OpenClaw Agent (Hardened)"
echo "================================================="

PERKYFI_USER="perkyfi"
PERKYFI_HOME="/home/$PERKYFI_USER"
PERKYFI_DIR="$PERKYFI_HOME/perkyfi"

# Verify user exists
if ! id "$PERKYFI_USER" &>/dev/null; then
    echo "❌ User '$PERKYFI_USER' not found. Run setup-vps.sh first."
    exit 1
fi

# Create agent directory structure (as perkyfi user)
echo "📁 Creating agent directory structure..."
sudo -u $PERKYFI_USER mkdir -p "$PERKYFI_DIR/agent"/{config,workspace/memory,cron,skills}

# Create initial config with security settings
echo "⚙️ Creating secure agent config..."
sudo -u $PERKYFI_USER tee "$PERKYFI_DIR/agent/config/openclaw.json" > /dev/null << 'CONFIG'
{
  "gateway": {
    "port": 3001,
    "host": "127.0.0.1"
  },
  "workspace": "/home/perkyfi/perkyfi/agent/workspace",
  "model": "anthropic/claude-sonnet-4-5",
  
  "dm": {
    "policy": "pairing",
    "allowFrom": []
  },
  
  "agents": {
    "defaults": {
      "compaction": {
        "mode": "safeguard",
        "reserveTokensFloor": 20000,
        "memoryFlush": {
          "enabled": true,
          "softThresholdTokens": 8000,
          "systemPrompt": "🚨 CRITICAL: Session nearing compaction. Save all context to memory NOW.",
          "prompt": "Write everything important to memory using memory-log. Reply NO_REPLY when done."
        }
      },
      "memorySearch": {
        "enabled": true,
        "provider": "openai",
        "model": "text-embedding-3-small"
      }
    }
  }
}
CONFIG

# Lock down config permissions
chmod 700 "$PERKYFI_DIR/agent/config"
chmod 600 "$PERKYFI_DIR/agent/config/openclaw.json"
chown -R $PERKYFI_USER:$PERKYFI_USER "$PERKYFI_DIR"

# Create environment file template
echo "⚙️ Creating environment template..."
sudo -u $PERKYFI_USER tee "$PERKYFI_DIR/agent/.env.example" > /dev/null << 'ENV'
# PerkyFi Agent Environment Variables
# Copy to .env and fill in values
# NEVER commit .env to git!

# Agent Wallet (CRITICAL - NEVER SHARE!)
AGENT_PRIVATE_KEY=0x...

# Bankr API (for Polymarket)
BANKR_API_KEY=...

# Pinata (for IPFS uploads)
PINATA_JWT=...

# OpenAI (for memory search embeddings)
OPENAI_API_KEY=...

# Neynar (for Farcaster)
NEYNAR_API_KEY=...

# ERC-8004 (Ethereum mainnet)
ETH_RPC_URL=https://eth.llamarpc.com
BASE_RPC_URL=https://mainnet.base.org
ENV

# =============================================================================
# SYSTEMD SERVICE (Hardened)
# =============================================================================
echo "⚙️ Creating hardened systemd service..."

cat > /etc/systemd/system/perkyfi-agent.service << 'SYSTEMD'
[Unit]
Description=PerkyFi AI Agent (OpenClaw)
After=network-online.target
Wants=network-online.target
StartLimitIntervalSec=300
StartLimitBurst=5

[Service]
Type=simple
User=perkyfi
Group=perkyfi
WorkingDirectory=/home/perkyfi/perkyfi/agent

# Load environment
EnvironmentFile=-/home/perkyfi/perkyfi/agent/.env

# OpenClaw paths
Environment=OPENCLAW_CONFIG_PATH=/home/perkyfi/perkyfi/agent/config/openclaw.json
Environment=OPENCLAW_STATE_DIR=/home/perkyfi/perkyfi/agent
Environment=OPENCLAW_WORKSPACE=/home/perkyfi/perkyfi/agent/workspace
Environment=OPENCLAW_DISABLE_BONJOUR=1

# Start command
ExecStart=/home/perkyfi/.nvm/versions/node/v24/bin/node /home/perkyfi/.nvm/versions/node/v24/bin/openclaw gateway start

# Restart policy
Restart=on-failure
RestartSec=10

# =============================================================================
# SECURITY HARDENING
# =============================================================================

# Prevent privilege escalation
NoNewPrivileges=true

# Filesystem protection
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/home/perkyfi/perkyfi/agent/workspace
ReadWritePaths=/home/perkyfi/.openclaw
PrivateTmp=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true

# Network restrictions (allow outbound only)
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
IPAddressDeny=any
IPAddressAllow=localhost
IPAddressAllow=100.64.0.0/10
IPAddressAllow=0.0.0.0/0

# Limit capabilities
CapabilityBoundingSet=
AmbientCapabilities=

# Restrict system calls
SystemCallFilter=@system-service
SystemCallFilter=~@privileged @resources
SystemCallErrorNumber=EPERM

# Memory protections
MemoryDenyWriteExecute=true

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=perkyfi-agent

[Install]
WantedBy=multi-user.target
SYSTEMD

# =============================================================================
# CRON JOBS (as perkyfi user)
# =============================================================================
echo "⚙️ Setting up cron jobs..."

cat > /etc/cron.d/perkyfi << 'CRON'
# PerkyFi Cron Jobs
# All jobs run as perkyfi user for security

SHELL=/bin/bash
PATH=/home/perkyfi/.nvm/versions/node/v24/bin:/usr/local/bin:/usr/bin:/bin
OPENCLAW_CONFIG_PATH=/home/perkyfi/perkyfi/agent/config/openclaw.json

# Hourly cycle (Polymarket → Morpho → Post)
0 * * * * perkyfi cd /home/perkyfi/perkyfi/agent && openclaw run hourly-cycle >> /var/log/perkyfi-agent.log 2>&1

# Memory health check (every 5 min)
*/5 * * * * perkyfi /home/perkyfi/perkyfi/agent/skills/memory-log/scripts/memory-log --check >> /var/log/perkyfi-memory.log 2>&1

# Security audit (daily at 3am)
0 3 * * * perkyfi /home/perkyfi/perkyfi/agent/skills/skillguard/scripts/skillguard audit-all >> /var/log/perkyfi-security.log 2>&1
CRON

chmod 644 /etc/cron.d/perkyfi

# =============================================================================
# LOG FILES
# =============================================================================
echo "📝 Setting up log files..."

mkdir -p /var/log
touch /var/log/perkyfi-agent.log
touch /var/log/perkyfi-memory.log
touch /var/log/perkyfi-security.log
chown $PERKYFI_USER:$PERKYFI_USER /var/log/perkyfi-*.log

# Logrotate
cat > /etc/logrotate.d/perkyfi << 'LOGROTATE'
/var/log/perkyfi-*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 644 perkyfi perkyfi
}

/home/perkyfi/perkyfi/agent/workspace/memory/*.md {
    monthly
    rotate 12
    compress
    missingok
    notifempty
    create 600 perkyfi perkyfi
}
LOGROTATE

# =============================================================================
# NODE.JS CHECK
# =============================================================================
echo "🔍 Checking Node.js installation..."

if [ -f "$PERKYFI_HOME/.nvm/versions/node/v24/bin/node" ]; then
    echo "   ✓ Node.js found"
else
    echo "   ⚠️ Node.js not found at expected path"
    echo "   Run setup-node.sh first, or update systemd ExecStart path"
fi

# =============================================================================
# ENABLE SERVICE
# =============================================================================
echo "⚙️ Enabling systemd service..."
systemctl daemon-reload
systemctl enable perkyfi-agent

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "✅ Agent setup complete!"
echo ""
echo "🔒 Security measures:"
echo "   ✓ Running as non-root user (perkyfi)"
echo "   ✓ Systemd hardening (NoNewPrivileges, ProtectSystem, etc.)"
echo "   ✓ Config file permissions locked (600)"
echo "   ✓ Read-only filesystem except workspace"
echo "   ✓ Restricted system calls"
echo "   ✓ Daily security audit cron"
echo ""
echo "⚠️  BEFORE STARTING:"
echo "   1. Copy .env.example to .env and fill in values:"
echo "      sudo -u perkyfi cp $PERKYFI_DIR/agent/.env.example $PERKYFI_DIR/agent/.env"
echo "      sudo -u perkyfi nano $PERKYFI_DIR/agent/.env"
echo ""
echo "   2. Set correct permissions on .env:"
echo "      chmod 600 $PERKYFI_DIR/agent/.env"
echo ""
echo "   3. Fund the agent wallet with ETH + USDC on Base"
echo ""
echo "   4. Run security setup:"
echo "      ./setup-security.sh"
echo ""
echo "   5. Start the agent:"
echo "      systemctl start perkyfi-agent"
echo "      journalctl -u perkyfi-agent -f"
echo ""
