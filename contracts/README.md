# PerkyFi Contracts

Smart contracts for PerkyFi agent identity and Morpho vault interactions.

## Prerequisites

Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Setup

```bash
cd contracts
forge init --no-commit
forge install
```

## Contracts

### ERC-8004 Identity (Ethereum Mainnet)

The agent uses ERC-8004 for on-chain identity:
- **Identity Registry:** `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- **Reputation Contract:** `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`

No deployment needed - we interact with existing contracts.

### Morpho Vault Wrapper (Base Mainnet)

Wrapper contract for simplified vault interactions:
- **Morpho Blue:** `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb`
- **USDC:** `0x833589fCD6eDb6E08f4c7c32D4f71b54bdA02913`
- **Steakhouse USDC Vault:** `0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB`

## Environment Variables

```bash
# Required for deployment
export PRIVATE_KEY=your_deployer_key
export BASE_RPC_URL=https://mainnet.base.org
export ETHERSCAN_API_KEY=your_key  # For verification
```

## Commands

```bash
# Build
forge build

# Test
forge test

# Deploy to Base
forge script script/Deploy.s.sol --rpc-url $BASE_RPC_URL --broadcast --verify

# Verify contract
forge verify-contract <address> src/MorphoWrapper.sol:MorphoWrapper --chain base
```

## Note

For MVP, we use existing Morpho contracts directly via `cast` CLI.
The wrapper is optional for advanced automation.
