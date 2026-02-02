# ERC-8004 & Agent-to-Agent Communication Research

## 🔍 Overview

**Tres capas de comunicación para agentes:**

```
┌─────────────────────────────────────────────────────────────┐
│  1. DISCOVERY (ERC-8004)                                    │
│     "¿Cómo encuentro agentes confiables?"                   │
│     → Identity Registry (NFT)                               │
│     → Reputation Registry (feedback)                        │
│     → Validation Registry (verification)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. COMMUNICATION (A2A Protocol)                            │
│     "¿Cómo hablo con otro agente?"                          │
│     → Agent Cards (.well-known/agent-card.json)             │
│     → Task orchestration                                    │
│     → Message exchange                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. TOOLS (MCP)                                             │
│     "¿Cómo uso herramientas externas?"                      │
│     → Agent-to-tool communication                           │
│     → API access                                            │
│     → Resource fetching                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 ERC-8004: Identity & Trust Layer

### What it provides:

1. **Identity Registry** (ERC-721 NFT)
   - Cada agente tiene un `agentId` único
   - NFT transferible
   - `agentURI` apunta a registration file

2. **Reputation Registry**
   - Feedback de usuarios/otros agentes
   - Trust signals on-chain
   - Composable scoring

3. **Validation Registry**
   - Third-party verification
   - zkML proofs, TEE oracles
   - Stake-based validation

### Registration File Structure:

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "PerkyFi",
  "description": "Predictive Yield Agent on Base",
  "image": "ipfs://...",
  "services": [
    {
      "name": "web",
      "endpoint": "https://app.perkyfi.xyz"
    },
    {
      "name": "A2A",
      "endpoint": "https://api.perkyfi.xyz/.well-known/agent-card.json",
      "version": "0.3.0"
    },
    {
      "name": "MCP",
      "endpoint": "https://api.perkyfi.xyz/mcp",
      "version": "2025-06-18"
    },
    {
      "name": "x402",
      "endpoint": "https://api.perkyfi.xyz/",
      "version": "1.0.0"
    }
  ],
  "x402Support": true,
  "active": true,
  "registrations": [
    {
      "agentId": 42,
      "agentRegistry": "eip155:1:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
    }
  ],
  "supportedTrust": ["reputation"]
}
```

---

## 🤝 A2A Protocol: Agent-to-Agent Communication

### What it enables:

- **Interoperability** between different agent frameworks
- **Task delegation** to specialized agents
- **Secure messaging** without sharing internals
- **Skill advertisement** via Agent Cards

### Agent Card (A2A):

```json
// https://api.perkyfi.xyz/.well-known/agent-card.json
{
  "name": "PerkyFi",
  "description": "Predictive Yield Agent",
  "skills": [
    {
      "name": "analyze_market",
      "description": "Analyze Polymarket predictions"
    },
    {
      "name": "get_portfolio",
      "description": "Get current yield positions"
    },
    {
      "name": "copy_trade",
      "description": "Generate copy-trade signal"
    }
  ],
  "endpoint": "https://api.perkyfi.xyz/a2a"
}
```

### A2A Communication Flow:

```
Agent A (Client)                    Agent B (PerkyFi)
      │                                    │
      │  1. Discover via ERC-8004          │
      │  ─────────────────────────────►    │
      │     (get registration file)        │
      │                                    │
      │  2. Fetch Agent Card               │
      │  ─────────────────────────────►    │
      │     (GET /.well-known/agent-card)  │
      │                                    │
      │  3. Send Task Request              │
      │  ─────────────────────────────►    │
      │     { skill: "analyze_market",     │
      │       params: { token: "ETH" } }   │
      │                                    │
      │  4. Receive Response               │
      │  ◄─────────────────────────────    │
      │     { result: { confidence: 78% }} │
      │                                    │
      │  5. Give Feedback (ERC-8004)       │
      │  ─────────────────────────────►    │
      │     (reputation registry)          │
      │                                    │
```

---

## 🔧 OpenClaw Multi-Agent Support

### Current capabilities:

1. **Multiple isolated agents** in one Gateway
2. **Per-agent workspaces** (SOUL.md, skills, etc.)
3. **Routing via bindings** (channel → agent)
4. **Agent-to-Agent tool** (internal, same Gateway)

### OpenClaw Config for A2A (internal):

```json
{
  "tools": {
    "agentToAgent": {
      "enabled": true,
      "allow": ["perkyfi", "research-agent"]
    }
  }
}
```

### Limitation:
OpenClaw's `agentToAgent` es **interno** (mismo Gateway).
Para A2A **externo** (otros agentes en internet), necesitamos:
- Exponer endpoint A2A
- Implementar A2A protocol handler

---

## 🎯 PerkyFi Implementation Plan

### Phase 1: ERC-8004 Registration

```
1. Create registration JSON
2. Upload to IPFS (Pinata)
3. Register on Ethereum mainnet
4. Get agentId NFT
```

**Registration file for PerkyFi:**
```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "PerkyFi",
  "description": "Predictive Yield Agent - Uses Polymarket predictions to optimize Morpho yields on Base",
  "image": "ipfs://[perkyfi-avatar-cid]",
  "services": [
    {
      "name": "web",
      "endpoint": "https://app.perkyfi.xyz"
    },
    {
      "name": "A2A",
      "endpoint": "https://api.perkyfi.xyz/.well-known/agent-card.json",
      "version": "0.3.0"
    },
    {
      "name": "x402",
      "endpoint": "https://api.perkyfi.xyz/",
      "version": "1.0.0"
    }
  ],
  "x402Support": true,
  "active": true,
  "supportedTrust": ["reputation"]
}
```

### Phase 2: A2A Endpoint (Optional for MVP)

Si queremos que otros agentes hablen con PerkyFi:

```
https://api.perkyfi.xyz/
├── .well-known/
│   └── agent-card.json    # A2A discovery
├── a2a/
│   └── task               # A2A task endpoint
└── api/
    ├── trade/[id]         # Trade signals (x402 gated)
    └── portfolio          # Public portfolio status
```

**Agent Card:**
```json
{
  "name": "PerkyFi",
  "description": "Predictive Yield Agent on Base",
  "skills": [
    {
      "name": "get_market_sentiment",
      "description": "Get Polymarket confidence for a token",
      "input": { "token": "string" },
      "output": { "confidence": "number", "trend": "string" }
    },
    {
      "name": "get_portfolio",
      "description": "Get PerkyFi's current yield positions",
      "output": { "positions": "array", "totalValue": "number" }
    },
    {
      "name": "get_latest_trade",
      "description": "Get the most recent trade signal",
      "output": { "tradeId": "string", "action": "string", "timestamp": "number" }
    }
  ],
  "endpoint": "https://api.perkyfi.xyz/a2a/task",
  "authentication": {
    "type": "x402",
    "facilitator": "https://stack.perkos.xyz/x402"
  }
}
```

### Phase 3: Reputation Building

```
1. Execute trades on Morpho
2. Post to X + Farcaster
3. Users interact and give feedback
4. Feedback recorded on Reputation Registry
5. Trust score grows over time
```

---

## 📊 How Other Agents Interact with PerkyFi

### Scenario: Research Agent wants market data

```
Research Agent                         PerkyFi
      │                                    │
      │  1. Query ERC-8004 Registry        │
      │     (find agents with "market")    │
      │                                    │
      │  2. Found PerkyFi (agentId: 42)    │
      │     Reputation score: 85/100       │
      │                                    │
      │  3. GET agent-card.json            │
      │  ─────────────────────────────►    │
      │                                    │
      │  4. Skill: "get_market_sentiment"  │
      │     requires x402 payment          │
      │                                    │
      │  5. Pay $0.01 via x402             │
      │  ─────────────────────────────►    │
      │                                    │
      │  6. Call skill                     │
      │  ─────────────────────────────►    │
      │     { token: "ETH" }               │
      │                                    │
      │  7. Response                       │
      │  ◄─────────────────────────────    │
      │     { confidence: 78%,             │
      │       trend: "bullish" }           │
      │                                    │
      │  8. Give feedback (optional)       │
      │  ─────────────────────────────►    │
      │     (Reputation Registry)          │
```

---

## 🚧 What We Need to Build

### For MVP (Quest deadline):

| Component | Required | Notes |
|-----------|----------|-------|
| ERC-8004 registration | ✅ Yes | On Ethereum mainnet |
| Agent Card endpoint | ⚠️ Optional | Nice to have |
| A2A task handler | ⚠️ Optional | Nice to have |
| x402 payment gate | ✅ Yes | For user access |
| Reputation feedback | ⚠️ Optional | Post-launch |

### Priority order:

1. **Register on ERC-8004** (identity + discovery)
2. **Host registration file** (IPFS or our server)
3. **Optional: Agent Card** for A2A discovery
4. **Later: A2A endpoint** for agent-to-agent calls

---

## 🔗 Integration with PerkOS Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      PerkOS Ecosystem                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  stack.perkos.xyz                                          │
│  ├── x402 Facilitator (payment verification)               │
│  ├── Agent Registry (could extend to ERC-8004)             │
│  └── API Gateway                                           │
│                                                             │
│  PerkyFi Agent                                             │
│  ├── ERC-8004 Identity (Ethereum mainnet)                  │
│  ├── Operations on Base (Morpho)                           │
│  ├── Social on X + Farcaster                               │
│  └── x402 payments via stack.perkos.xyz                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Next Steps

1. **Decide on registration approach:**
   - IPFS (via Pinata) - decentralized
   - Our server - simpler but centralized
   - Data URI - fully on-chain (expensive)

2. **Create registration file** with all services

3. **Register on Ethereum mainnet** (need ETH for gas)

4. **Optional: Set up A2A endpoint** for agent discovery

---

*Research completed: 2026-02-02*
