# PerkyFi - Base Builder Quest 2026 Submission

## 🏆 Competition Details

- **Hackathon:** Base Builder Quest 2026
- **Deadline:** February 8, 2026 @ 11:59pm EST
- **Prize Pool:** 5 ETH
- **Requirement:** Autonomous agent transacting on Base

---

## 🎯 Project Summary

**PerkyFi** is a **Predictive Yield Agent** that analyzes Polymarket predictions to optimize yield allocation on Morpho, built entirely on **Base** using the **Coinbase Developer Platform**.

### The Problem

DeFi users face two challenges:
1. **Information Overload:** Too much data, too little time
2. **Action Paralysis:** Knowing what might happen ≠ knowing what to do

Prediction markets like Polymarket offer valuable signals about future events, but most users don't know how to translate predictions into actionable yield strategies.

### Our Solution

PerkyFi bridges the gap between **prediction** and **action**:

1. 📊 **Analyzes** Polymarket for crypto market sentiment
2. 🤖 **Recommends** yield positions on Morpho (Base)
3. 🐦 **Shares** signals publicly on X/Twitter
4. 💰 **Monetizes** via x402 micropayments ($0.10/signal)
5. 🔗 **Enables** 1-click copy trading (non-custodial)

---

## 🛠️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PERKYFI AGENT                           │
│                   (OpenClaw + Custom Skills)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Polymarket  │───▶│   Analyzer   │───▶│    Morpho    │  │
│  │   (Bankr)    │    │  (Decision)  │    │   (Yield)    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                              │                              │
│                              ▼                              │
│                     ┌──────────────┐                       │
│                     │   X/Twitter  │                       │
│                     │  (Bird CLI)  │                       │
│                     └──────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERACTION                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. User sees signal on X/Twitter                         │
│   2. Clicks link → perkyfi-app.netlify.app/trade/[id]      │
│   3. Pays $0.10 USDC via x402                              │
│   4. Views full analysis + copy trade button               │
│   5. Executes trade in their own wallet (non-custodial)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Built With

### Coinbase Developer Platform
- **OnchainKit** - Wallet connection + transactions
- **x402 Protocol** - Micropayment monetization
- **Base Network** - All transactions on Base mainnet

### DeFi Protocols
- **Morpho** - Yield vault interactions (ERC-4626)
- **Polymarket** - Prediction market data (via Bankr)

### Agent Infrastructure
- **OpenClaw** - AI agent framework
- **Bird CLI** - X/Twitter automation

### Frontend
- **Next.js 15** - React framework
- **Tailwind CSS** - Styling
- **Netlify** - Deployment

---

## 📈 Key Features

### 1. Autonomous Analysis (Every 6 Hours)
```bash
# Agent workflow
./agent/scripts/hourly-cycle.sh
```
- Fetches Polymarket predictions via Bankr API
- Analyzes confidence levels
- Generates trade signals if threshold met

### 2. Social Distribution
- Posts signals to @PerkyFi on X
- Rate limited: 4 posts/day, 6h minimum interval
- Includes link to webapp for details

### 3. x402 Monetization
- Access to full analysis: $0.10 USDC
- Instant, trustless micropayments
- No subscriptions, no accounts required

### 4. Copy Trading
- Pre-filled Morpho transactions
- User signs with their own wallet
- Funds never touch PerkyFi

---

## 🚀 Live Demo

- **Web App:** https://perkyfi-app.netlify.app
- **X Account:** https://x.com/PerkyFi
- **GitHub:** https://github.com/PerkOS-xyz/PerkyFi

---

## 📊 Transaction Examples

### Agent Deposits to Morpho
```
Chain: Base Mainnet
Vault: Steakhouse USDC (0xBEEF...)
Action: deposit(amount, receiver)
```

### User Copy Trade
```
User connects wallet → Reviews signal → Signs transaction → Deposits to same vault
```

---

## 👥 Team

| Role | Agent/Person |
|------|--------------|
| PM + Docs | Morpheus (AI) |
| Lead Dev | Winston Scott (AI) |
| Developer | Neo (AI) |
| Content | Alice (AI) |
| Founder | Julio M Cruz |

Built with ❤️ by the **PerkOS** ecosystem.

---

## 🔗 Links

- **Live App:** https://perkyfi-app.netlify.app
- **X/Twitter:** https://x.com/PerkyFi
- **GitHub:** https://github.com/PerkOS-xyz/PerkyFi
- **x402 Facilitator:** stack.perkos.xyz

---

## 📄 License

MIT License - See LICENSE file
