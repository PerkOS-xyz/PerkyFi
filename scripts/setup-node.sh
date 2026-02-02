#!/bin/bash
# PerkyFi VPS Setup - Step 2: Node.js + PM2
# Run as root

set -euo pipefail

echo "🚀 PerkyFi VPS Setup - Node.js + PM2"
echo "====================================="

# Install Node.js 20 LTS
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Setup PM2 startup
echo "⚙️ Configuring PM2 startup..."
pm2 startup systemd -u root --hp /root
pm2 save

# Install OpenClaw globally
echo "📦 Installing OpenClaw..."
npm install -g openclaw

# Verify
echo "✅ PM2 version: $(pm2 --version)"
echo "✅ OpenClaw version: $(openclaw --version 2>/dev/null || echo 'installed')"

echo ""
echo "✅ Node.js setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run: ./setup-nginx.sh"
echo "  2. Run: ./setup-agent.sh"
echo ""
