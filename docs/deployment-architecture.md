# PerkyFi Deployment Architecture

## 🏗️ Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                            VPS (Hetzner)                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                         NGINX                                 │  │
│  │                    (Reverse Proxy + SSL)                      │  │
│  │                       Port 443 (HTTPS)                        │  │
│  │                       Port 80 (redirect only)                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Next.js App (Frontend + API)                     │  │
│  │                       Port 3000                               │  │
│  │                                                               │  │
│  │   app.perkyfi.xyz                                            │  │
│  │   ├── /                    (Landing page)                    │  │
│  │   ├── /trade/[id]          (Trade signal - x402 gated)       │  │
│  │   ├── /dashboard           (Agent status)                    │  │
│  │   └── /api/                                                  │  │
│  │       ├── /api/trade/[id]  (x402 protected - USDC)          │  │
│  │       ├── /api/portfolio   (Public)                         │  │
│  │       ├── /api/health      (Health check)                   │  │
│  │       └── /.well-known/agent-card.json (A2A)                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   OpenClaw Agent                              │  │
│  │                    Port 3001 (internal only)                  │  │
│  │                                                               │  │
│  │   • Polymarket analysis (via Bankr)                          │  │
│  │   • Morpho operations (Base mainnet)                         │  │
│  │   • Social posting (X + Farcaster)                           │  │
│  │   • Cron: hourly cycle                                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                       Base Mainnet                            │  │
│  │              (Morpho yields, USDC payments)                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     Certbot (Let's Encrypt)                   │  │
│  │                   Cron: Auto-renew certificates               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

External:
• stack.perkos.xyz (x402 facilitator - USDC on Base)
• Ethereum mainnet (ERC-8004 registry)
```

---

## 🔒 Security: Ports & Firewall

### UFW Rules (only essential ports)

```bash
# Default deny all incoming
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (from specific IP if possible)
sudo ufw allow 22/tcp

# Allow HTTPS only
sudo ufw allow 443/tcp

# Allow HTTP (for certbot challenge, redirects to HTTPS)
sudo ufw allow 80/tcp

# Enable firewall
sudo ufw enable
```

### Internal Services (NOT exposed)

| Service | Port | Access |
|---------|------|--------|
| Next.js App (+ API) | 3000 | Nginx proxy only |
| OpenClaw Gateway | 3001 | Internal only |

---

## 🌐 NGINX Configuration

### Main Config: `/etc/nginx/nginx.conf`

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

### Site Config: `/etc/nginx/sites-available/perkyfi`

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name app.perkyfi.xyz;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# App + API: app.perkyfi.xyz
server {
    listen 443 ssl http2;
    server_name app.perkyfi.xyz;

    ssl_certificate /etc/letsencrypt/live/app.perkyfi.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.perkyfi.xyz/privkey.pem;
    
    # SSL security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    # Rate limiting for API endpoints
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Pass x402 headers (USDC payments on Base)
        proxy_set_header Payment-Signature $http_payment_signature;
        proxy_pass_header Payment-Required;
        proxy_pass_header Payment-Response;
    }

    # A2A Agent Card (public)
    location /.well-known/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # All other routes (frontend)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔐 SSL Certificates (Let's Encrypt + Certbot)

### Initial Setup

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate (first time)
sudo certbot --nginx -d app.perkyfi.xyz -d api.perkyfi.xyz

# Or for wildcard (requires DNS challenge)
sudo certbot certonly --manual --preferred-challenges dns \
  -d perkyfi.xyz -d "*.perkyfi.xyz"
```

### Auto-Renewal Cron Job

```bash
# Edit crontab
sudo crontab -e

# Add renewal job (runs twice daily, renews only if needed)
0 0,12 * * * /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
```

### Verify Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Check certificate expiry
sudo certbot certificates
```

---

## 📦 Project Structure

```
/root/perkyfi/
├── app/                              # Next.js (Frontend + API)
│   ├── src/
│   │   ├── app/                      # App Router
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── trade/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Trade signal page (x402 gated)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Agent status
│   │   │   ├── api/                  # API Routes (x402 endpoints)
│   │   │   │   ├── trade/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts  # GET /api/trade/[id] (x402 + USDC)
│   │   │   │   ├── portfolio/
│   │   │   │   │   └── route.ts      # GET /api/portfolio (public)
│   │   │   │   ├── health/
│   │   │   │   │   └── route.ts      # GET /api/health
│   │   │   │   └── signals/
│   │   │   │       └── route.ts      # GET /api/signals (latest)
│   │   │   └── .well-known/
│   │   │       └── agent-card.json/
│   │   │           └── route.ts      # A2A discovery
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn components
│   │   │   ├── trade-card.tsx
│   │   │   ├── x402-gate.tsx
│   │   │   ├── wallet-connect.tsx
│   │   │   └── portfolio-display.tsx
│   │   ├── lib/
│   │   │   ├── x402.ts               # x402 middleware (USDC)
│   │   │   ├── morpho.ts             # Morpho contract interactions
│   │   │   ├── wagmi.ts              # Wallet config
│   │   │   └── constants.ts          # Contract addresses
│   │   └── types/
│   │       └── index.ts              # TypeScript types
│   ├── public/
│   │   └── images/
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── package.json
│   └── .env.local                    # Environment variables
│
├── agent/                            # OpenClaw Agent
│   ├── config/
│   │   └── openclaw.json             # Gateway config
│   ├── skills/
│   │   ├── morpho-base/              # Yield operations
│   │   ├── erc-8004/                 # Identity registration
│   │   ├── x402-client/              # x402 payments
│   │   ├── neynar/                   # Farcaster
│   │   └── polymarket/               # Market analysis
│   ├── workspace/
│   │   ├── SOUL.md                   # Agent personality
│   │   ├── AGENTS.md                 # Agent instructions
│   │   └── memory/                   # Agent memory
│   └── cron/
│       └── hourly-cycle.md           # Cron job instructions
│
├── scripts/                          # VPS Configuration Scripts
│   ├── setup-vps.sh                  # Initial VPS setup
│   ├── setup-nginx.sh                # Nginx + SSL setup
│   ├── setup-node.sh                 # Node.js + PM2 setup
│   ├── setup-agent.sh                # OpenClaw setup
│   ├── deploy.sh                     # Deploy updates
│   ├── backup.sh                     # Backup wallet/config
│   └── renew-cert.sh                 # Manual cert renewal
│
├── nginx/
│   └── perkyfi.conf                  # Nginx site config
│
├── ecosystem.config.js               # PM2 process config
└── README.md                         # Project documentation
```

---

## 🧠 Memory Management (Production-First)

### The Problem

VPS has limited resources → short context → silent compaction → lost state.

### Multi-Layer Protection

```
Layer 1: memory-log skill      → Real-time logging
Layer 2: memoryFlush config    → Pre-compaction save
Layer 3: Operation checkpoints → Recovery from interruption
Layer 4: Vector memory search  → Semantic retrieval
Layer 5: Heartbeat verification → Health monitoring
```

### Critical Config

```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "memoryFlush": {
          "enabled": true,
          "softThresholdTokens": 8000
        }
      }
    }
  }
}
```

### Rules (Non-Negotiable)

1. **Write IMMEDIATELY** — Never batch memory writes
2. **Checkpoint operations** — Use `memory-log -op` for blockchain txs
3. **Check health** — Every heartbeat starts with `memory-log --check`
4. **Recover gracefully** — Check `.current-op` on startup

**Full docs:** `docs/memory-management.md`

---

## 🖥️ Tech Stack Details

### Next.js App (Frontend + API)

```bash
# Create Next.js app with App Router
npx create-next-app@latest app --typescript --tailwind --app --src-dir

cd app

# Add shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input dialog badge skeleton

# Add Web3 (wallet connection)
npm install wagmi viem @tanstack/react-query
npm install @rainbow-me/rainbowkit

# Add x402 (USDC payments)
npm install @x402/next @x402/evm
```

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // Required for PM2 deployment
  images: {
    remotePatterns: [
      { hostname: 'ipfs.io' },
      { hostname: 'gateway.pinata.cloud' },
    ],
  },
  // x402 headers need to pass through
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Expose-Headers', value: 'Payment-Required, Payment-Response' },
        ],
      },
    ];
  },
}
module.exports = nextConfig
```

### x402 API Route Example

```typescript
// src/app/api/trade/[id]/route.ts
import { paymentRequired, verifyPayment } from '@x402/next';
import { NextRequest, NextResponse } from 'next/server';

const PRICE_USDC = '0.10';  // $0.10 per signal

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check for x402 payment (USDC on Base)
  const paymentResult = await verifyPayment(request, {
    price: PRICE_USDC,
    token: 'USDC',
    network: 'base',
    recipient: process.env.X402_RECIPIENT_ADDRESS!,
    facilitator: process.env.X402_FACILITATOR_URL!,
  });

  if (!paymentResult.valid) {
    return paymentRequired({
      price: PRICE_USDC,
      token: 'USDC',
      network: 'base',
      recipient: process.env.X402_RECIPIENT_ADDRESS!,
      description: 'Access to PerkyFi trade signal',
    });
  }

  // Payment verified - return trade signal
  const signal = await getTradeSignal(params.id);
  return NextResponse.json(signal);
}
```

### Agent (OpenClaw)

```bash
# Install OpenClaw globally
npm install -g openclaw

# Or via npx (no global install)
npx openclaw gateway start
```

---

## 🚀 Deployment Scripts

### Initial Setup: `scripts/setup.sh`

```bash
#!/bin/bash
set -euo pipefail

echo "🚀 PerkyFi VPS Setup"

# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y nginx certbot python3-certbot-nginx ufw fail2ban

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install OpenClaw
npm install -g openclaw

# Setup firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Setup fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Create app directory
mkdir -p /root/perkyfi/{app,api,agent}

echo "✅ Setup complete. Now:"
echo "1. Clone repos to /root/perkyfi/"
echo "2. Setup SSL: certbot --nginx -d app.perkyfi.xyz -d api.perkyfi.xyz"
echo "3. Configure nginx: cp nginx/perkyfi.conf /etc/nginx/sites-available/"
echo "4. Start services with PM2"
```

### Deploy Script: `scripts/deploy.sh`

```bash
#!/bin/bash
set -euo pipefail

echo "📦 Deploying PerkyFi..."

cd /root/perkyfi

# Pull latest code
git pull origin main

# Build frontend
cd app
npm ci
npm run build
pm2 restart perkyfi-app || pm2 start npm --name "perkyfi-app" -- start

# Restart API
cd ../api
npm ci
npm run build
pm2 restart perkyfi-api || pm2 start npm --name "perkyfi-api" -- start

# Restart agent (if needed)
# pm2 restart perkyfi-agent

echo "✅ Deploy complete"
pm2 status
```

### PM2 Ecosystem: `ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'perkyfi-app',
      cwd: '/root/perkyfi/app',
      script: 'node',
      args: '.next/standalone/server.js',  // Next.js standalone
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        // x402 config (USDC on Base)
        X402_FACILITATOR_URL: 'https://stack.perkos.xyz/x402',
        X402_RECIPIENT_ADDRESS: '0xPerkyFiWallet',
        X402_PRICE_USDC: '0.10',
      },
    },
    {
      name: 'perkyfi-agent',
      cwd: '/root/perkyfi/agent',
      script: 'openclaw',
      args: 'gateway start',
      env: {
        OPENCLAW_CONFIG_PATH: '/root/perkyfi/agent/config/openclaw.json',
        OPENCLAW_STATE_DIR: '/root/perkyfi/agent',
      },
    },
  ],
};
```

---

## 📋 Environment Variables

### Next.js App (.env.local)

```bash
# App
NEXT_PUBLIC_APP_URL=https://app.perkyfi.xyz
NEXT_PUBLIC_CHAIN_ID=8453  # Base mainnet

# WalletConnect
NEXT_PUBLIC_WC_PROJECT_ID=your-project-id

# x402 (USDC payments on Base)
NEXT_PUBLIC_X402_FACILITATOR=https://stack.perkos.xyz/x402
X402_FACILITATOR_URL=https://stack.perkos.xyz/x402
X402_RECIPIENT_ADDRESS=0xPerkyFiWallet  # Agent wallet receives USDC
X402_PRICE_USDC=0.10  # Price per trade signal in USDC

# USDC on Base
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7c32D4f71b54bdA02913

# Morpho (Base)
NEXT_PUBLIC_MORPHO_VAULT=0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB
```

### Agent (config/openclaw.json)

```json
{
  "gateway": {
    "port": 3001,
    "host": "127.0.0.1"
  },
  "workspace": "/root/perkyfi/agent/workspace",
  "model": "anthropic/claude-sonnet-4-5",
  "channels": {
    "telegram": {
      "enabled": false
    }
  }
}
```

### Agent Wallet (.env - NEVER commit!)

```bash
# Agent wallet private key (for Morpho operations)
AGENT_PRIVATE_KEY=0x...

# Bankr API (for Polymarket)
BANKR_API_KEY=...

# Pinata (for IPFS uploads)
PINATA_JWT=...
```

---

## 🔄 Cron Jobs Summary

```bash
# /etc/cron.d/perkyfi

# SSL certificate renewal (twice daily)
0 0,12 * * * root /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"

# Agent hourly cycle (Polymarket → Morpho → Post)
0 * * * * root cd /root/perkyfi/agent && /usr/local/bin/openclaw run hourly-cycle >> /var/log/perkyfi-agent.log 2>&1

# Daily backup (wallet + config)
0 3 * * * root /root/perkyfi/scripts/backup.sh >> /var/log/perkyfi-backup.log 2>&1

# Health check (every 5 min)
*/5 * * * * root curl -sf https://app.perkyfi.xyz/api/health || pm2 restart perkyfi-app
```

### Setup Scripts Workflow

```bash
# 1. Initial VPS setup
./scripts/setup-vps.sh

# 2. Install Node.js + PM2
./scripts/setup-node.sh

# 3. Setup Nginx + SSL
./scripts/setup-nginx.sh

# 4. Setup OpenClaw agent
./scripts/setup-agent.sh

# 5. Deploy application
./scripts/deploy.sh
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# View all processes
pm2 status

# View logs
pm2 logs perkyfi-app
pm2 logs perkyfi-api

# Monitor resources
pm2 monit
```

### Health Endpoints

- `https://app.perkyfi.xyz` - Frontend health
- `https://api.perkyfi.xyz/health` - API health
- `https://api.perkyfi.xyz/.well-known/agent-card.json` - A2A discovery

---

*Last updated: 2026-02-02*
