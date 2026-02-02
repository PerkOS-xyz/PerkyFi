#!/bin/bash
# PerkyFi Deploy Script
# Pulls latest code, builds, and restarts services

set -euo pipefail

echo "🚀 PerkyFi Deploy"
echo "================="

PERKYFI_DIR="/root/perkyfi"
REPO_URL="${REPO_URL:-https://github.com/PerkOS-xyz/perkyfi.git}"
BRANCH="${BRANCH:-main}"

cd "$PERKYFI_DIR"

# Check if repo exists
if [[ ! -d ".git" ]]; then
    echo "📥 Cloning repository..."
    cd /root
    rm -rf perkyfi
    git clone "$REPO_URL" perkyfi
    cd perkyfi
else
    echo "📥 Pulling latest changes..."
    git fetch origin
    git reset --hard "origin/$BRANCH"
fi

# Copy skills to agent directory
echo "📦 Syncing skills..."
cp -r skills/* agent/skills/ 2>/dev/null || true

# Build Next.js app
echo "🔨 Building Next.js app..."
cd "$PERKYFI_DIR/app"

# Check if package.json exists
if [[ -f "package.json" ]]; then
    npm ci
    npm run build
    
    # Restart app with PM2
    echo "🔄 Restarting Next.js app..."
    pm2 delete perkyfi-app 2>/dev/null || true
    pm2 start ecosystem.config.js --only perkyfi-app
else
    echo "⚠️ No package.json found in app/. Skipping app build."
fi

# Restart agent with PM2
echo "🔄 Restarting OpenClaw agent..."
cd "$PERKYFI_DIR"
pm2 delete perkyfi-agent 2>/dev/null || true

# Only start agent if .env exists
if [[ -f "agent/.env" ]]; then
    pm2 start ecosystem.config.js --only perkyfi-agent
else
    echo "⚠️ No .env file found. Agent not started."
    echo "   Create agent/.env from agent/.env.example"
fi

# Save PM2 config
pm2 save

# Show status
echo ""
echo "✅ Deploy complete!"
echo ""
pm2 status
echo ""
echo "Logs:"
echo "  pm2 logs perkyfi-app"
echo "  pm2 logs perkyfi-agent"
echo ""
