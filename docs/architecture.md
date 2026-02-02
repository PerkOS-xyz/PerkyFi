# PerkyFi Architecture

## 🎯 Overview

PerkyFi is a **Predictive Yield Agent** that:
1. Analyzes Polymarket predictions
2. Manages real funds on Base mainnet (Morpho)
3. Posts analysis to X + Farcaster
4. Allows users to copy trades via x402-gated frontend

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PERKYFI AGENT                            │
│                      (OpenClaw + Skills)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │  Polymarket  │───▶│   Analyzer   │───▶│    Morpho    │     │
│  │   (Bankr)    │    │  (Decision)  │    │   (Yield)    │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                              │                   │              │
│                              ▼                   ▼              │
│                     ┌──────────────┐    ┌──────────────┐       │
│                     │   Social     │    │  Agent       │       │
│                     │  (X + FC)    │    │  Wallet      │       │
│                     └──────────────┘    └──────────────┘       │
│                              │                   │              │
└──────────────────────────────┼───────────────────┼──────────────┘
                               │                   │
                               ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User sees post on X/Farcaster                                │
│              │                                                  │
│              ▼                                                  │
│   Clicks link: app.perkyfi.xyz/trade/[id]                      │
│              │                                                  │
│              ▼                                                  │
│   ┌─────────────────────────────────────┐                      │
│   │      x402 Payment Gate              │                      │
│   │   (via stack.perkos.xyz)            │                      │
│   │                                     │                      │
│   │   User wallet ──► USDC payment      │                      │
│   │   $0.10 per trade signal            │                      │
│   └─────────────────────────────────────┘                      │
│              │                                                  │
│              ▼ (after payment verified)                        │
│   ┌─────────────────────────────────────┐                      │
│   │      Trade Interface                │                      │
│   │                                     │                      │
│   │   • Pre-filled transaction          │                      │
│   │   • User connects wallet            │                      │
│   │   • User signs & executes           │                      │
│   │   • Funds stay in USER wallet       │                      │
│   └─────────────────────────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 Wallet Architecture

### Agent Wallet (PerkyFi-controlled)
```
Address: 0xPerkyFi... (TBD - will be created)
Chain: Base Mainnet
Assets: USDC for Morpho deposits
Purpose: Execute agent's own trades
Funding: Initial seed from Julio
```

### User Wallets (User-controlled)
```
Address: User's own wallet
Chain: Base Mainnet
Assets: User's USDC
Purpose: Copy trades after x402 payment
```

### x402 Payment Flow
```
User → stack.perkos.xyz → Verify payment → Grant access
         │
         └── $0.10 USDC per trade signal (configurable)
```

---

## 🔄 Workflow: Hourly Cycle

```
[Every Hour - Cron Job]
         │
         ▼
┌─────────────────────────────────────┐
│ 1. FETCH POLYMARKET DATA            │
│    via Bankr skill                  │
│    - ETH predictions                │
│    - BTC predictions                │
│    - Macro events                   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 2. ANALYZE & DECIDE                 │
│    - Confidence > 75%? → Action     │
│    - Confidence < 60%? → Reduce     │
│    - Otherwise → Hold               │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 3. EXECUTE ON MORPHO (if needed)    │
│    - Deposit to vault               │
│    - Withdraw from vault            │
│    - Rebalance positions            │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 4. GENERATE TRADE SIGNAL            │
│    - Create unique trade ID         │
│    - Store in database/on-chain     │
│    - Generate shareable link        │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 5. POST TO SOCIAL                   │
│    - X: Full analysis + link        │
│    - Farcaster: Same content        │
│    - Include: tx hash, trade link   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 6. LOG TO ERC-8004                  │
│    - Record action for reputation   │
│    - Update track record            │
└─────────────────────────────────────┘
```

---

## 🔗 User Copy-Trade Flow

### Step 1: Discovery
```
User scrolling X/Farcaster
         │
         ▼
Sees PerkyFi post:
"🔮 just moved 30% to ETH yield
 polymarket: 78% confidence
 copy this trade → app.perkyfi.xyz/trade/abc123"
```

### Step 2: Access
```
User clicks link
         │
         ▼
app.perkyfi.xyz/trade/abc123
         │
         ▼
x402 payment gate appears:
"Pay $0.10 USDC to view this trade signal"
         │
         ▼
User wallet prompts for payment
         │
         ▼
Payment sent to stack.perkos.xyz
         │
         ▼
Middleware verifies → grants access
```

### Step 3: Execute
```
User sees trade details:
┌─────────────────────────────────────┐
│  PERKYFI TRADE SIGNAL #abc123       │
│                                     │
│  Action: Deposit to Morpho          │
│  Vault: Steakhouse USDC             │
│  Amount: You choose                 │
│  Current APY: 4.2%                  │
│                                     │
│  PerkyFi's move:                    │
│  • Deposited $3,000 USDC            │
│  • TX: 0x123...                     │
│                                     │
│  [Connect Wallet]                   │
│  [Enter Amount: _____ USDC]         │
│  [Execute Trade]                    │
└─────────────────────────────────────┘
         │
         ▼
User connects wallet (RainbowKit/Privy)
         │
         ▼
User enters amount they want to deposit
         │
         ▼
Frontend generates transaction:
- to: Morpho Vault (0xBEEF...)
- function: deposit(amount, userAddress)
- User signs with their wallet
         │
         ▼
Transaction executed
User's funds go to Morpho (NOT to PerkyFi)
```

---

## 📦 Components to Build

### 1. Agent (OpenClaw)
```
perkyfi-agent/
├── config/
│   └── openclaw.json      # Agent configuration
├── skills/
│   ├── morpho-base/       # Already created
│   ├── erc-8004/          # Already created
│   ├── x402-client/       # Already created
│   └── polymarket/        # Need to create (or use Bankr)
├── SOUL.md                # Agent personality
├── cron/
│   └── hourly-cycle.md    # Cron job definition
└── scripts/
    └── setup.sh           # Installation script
```

### 2. Frontend (Next.js)
```
perkyfi-app/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── trade/[id]/        # Trade signal page
│   │   └── dashboard/         # Agent status page
│   ├── components/
│   │   ├── TradeCard.tsx      # Trade signal display
│   │   ├── x402Gate.tsx       # Payment gate
│   │   └── WalletConnect.tsx  # Wallet connection
│   └── lib/
│       ├── x402.ts            # x402 integration
│       ├── morpho.ts          # Morpho interactions
│       └── api.ts             # Backend calls
├── package.json
└── .env.local
```

### 3. Backend/API (Optional - can be serverless)
```
perkyfi-api/
├── functions/
│   ├── createSignal.ts    # Create new trade signal
│   ├── getSignal.ts       # Fetch signal by ID
│   └── verifyPayment.ts   # x402 verification
└── db/
    └── signals.ts         # Signal storage (Firebase/Supabase)
```

---

## 🔐 x402 Integration

### Middleware: stack.perkos.xyz

```typescript
// Frontend: x402Gate.tsx
import { paymentMiddleware } from '@x402/next';

export const middleware = paymentMiddleware({
  "GET /api/trade/:id": {
    price: "$0.10",
    network: "base",
    token: "USDC",
    recipient: "0xPerkyFiWallet",
    facilitator: "https://stack.perkos.xyz/x402"
  }
});
```

### Payment Flow
```
1. User requests /trade/abc123
2. Server returns 402 + payment requirements
3. User wallet signs payment
4. Payment header sent with request
5. stack.perkos.xyz verifies signature
6. If valid → return trade data
7. If invalid → return 402 again
```

---

## 📊 Data Model

### Trade Signal
```typescript
interface TradeSignal {
  id: string;              // Unique ID (uuid)
  timestamp: number;       // Unix timestamp
  
  // Polymarket data
  prediction: {
    market: string;        // "ETH > $4k"
    confidence: number;    // 0-100
    change24h: number;     // +/- percentage
  };
  
  // Agent's action
  action: {
    type: 'deposit' | 'withdraw' | 'hold';
    vault: string;         // Morpho vault address
    amount: string;        // Amount in wei
    txHash: string;        // Transaction hash
  };
  
  // For copy-trading
  copyTrade: {
    vaultAddress: string;
    vaultName: string;
    currentApy: number;
    minAmount: string;
    maxAmount: string;
  };
  
  // Social
  posted: {
    x: string;             // Tweet ID
    farcaster: string;     // Cast hash
  };
}
```

---

## 🚀 Deployment Plan

### Phase 1: Agent Core (Days 1-2)
- [ ] Create agent wallet on Base
- [ ] Fund with initial USDC
- [ ] Configure OpenClaw with skills
- [ ] Test Morpho interactions

### Phase 2: Frontend MVP (Days 3-4)
- [ ] Next.js app with x402 gate
- [ ] Trade signal display page
- [ ] Wallet connection (RainbowKit)
- [ ] Morpho deposit integration

### Phase 3: Social Integration (Days 4-5)
- [ ] Create X account
- [ ] Create Farcaster account
- [ ] Configure posting automation
- [ ] Test hourly cycle

### Phase 4: Launch (Days 5-6)
- [ ] Deploy frontend to Vercel
- [ ] Run agent in production
- [ ] Submit to Base Builder Quest
- [ ] Create demo video

---

## 💰 Economics

### Agent Costs
- Initial funding: ~$100-500 USDC
- Gas fees: ~$0.01 per Morpho transaction
- Estimated monthly: ~$5 in gas

### Revenue (x402)
- Per signal access: $0.10 USDC
- If 100 users/day: $10/day = $300/month
- Goes to agent wallet (reinvested in yield)

### User Costs
- x402 payment: $0.10 per signal
- Gas for their own trades: ~$0.01
- No fees to PerkyFi on their trades

---

## 🔮 Future Enhancements

1. **Subscription model**: Pay monthly for unlimited signals
2. **Tiered access**: Free delayed signals, paid real-time
3. **Portfolio tracking**: Users can track their copy performance
4. **Leaderboard**: Compare with other followers
5. **Social features**: Comments, reactions on signals

---

*Last updated: 2026-02-02*
