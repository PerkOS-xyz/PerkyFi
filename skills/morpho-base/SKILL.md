---
name: perkyfi-morpho-base
description: Interact with Morpho Vaults on Base chain. Deposit/withdraw USDC and other assets for yield. Uses ERC-4626 standard vaults.
metadata:
  {
    "clawdbot": {
      "emoji": "🏦",
      "homepage": "https://morpho.org",
      "requires": { "bins": ["curl", "jq", "cast"] }
    }
  }
---

# Morpho Base Skill

Deposit and withdraw assets from Morpho Vaults on Base for optimized yield.

## Overview

Morpho Vaults are ERC-4626 compliant vaults that optimize yield across lending markets. This skill enables:
- Depositing USDC/ETH into yield-generating vaults
- Withdrawing assets from vaults
- Checking vault APYs and balances
- Monitoring positions

## Contract Addresses (Base)

| Contract | Address | Description |
|----------|---------|-------------|
| Morpho Blue | `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb` | Core protocol |
| USDC | `0x833589fCD6eDb6E08f4c7c32D4f71b54bdA02913` | USDC on Base |
| WETH | `0x4200000000000000000000000000000000000006` | Wrapped ETH |

## Popular Vaults (Base)

| Vault | Address | Asset | Description |
|-------|---------|-------|-------------|
| Steakhouse USDC | `0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB` | USDC | Flagship USDC vault |
| Gauntlet WETH | `0x...` | WETH | ETH yield vault |

## Usage

### Check Vault APY

```bash
./scripts/get-vault-apy.sh <vault-address>
```

### Check Balance

```bash
./scripts/get-balance.sh <vault-address> <user-address>
```

### Deposit

```bash
# Deposit 100 USDC into vault
AMOUNT=100000000 ./scripts/deposit.sh <vault-address>
```

### Withdraw

```bash
# Withdraw 50 USDC from vault  
AMOUNT=50000000 ./scripts/withdraw.sh <vault-address>
```

### Full Withdrawal (Redeem All)

```bash
# Redeem all shares from vault
./scripts/redeem-all.sh <vault-address>
```

## ERC-4626 Interface

All Morpho Vaults implement the ERC-4626 standard:

```solidity
// Deposit assets, receive shares
function deposit(uint256 assets, address receiver) returns (uint256 shares);

// Withdraw specific amount of assets
function withdraw(uint256 assets, address receiver, address owner) returns (uint256 shares);

// Mint specific amount of shares
function mint(uint256 shares, address receiver) returns (uint256 assets);

// Redeem shares for assets (best for full withdrawal)
function redeem(uint256 shares, address receiver, address owner) returns (uint256 assets);

// View functions
function totalAssets() returns (uint256);
function convertToShares(uint256 assets) returns (uint256);
function convertToAssets(uint256 shares) returns (uint256);
function balanceOf(address owner) returns (uint256);
```

## Workflow for PerkyFi

1. **Monitor Polymarket** → Get market sentiment
2. **Analyze confidence** → High confidence = more aggressive yield
3. **Adjust allocation** → Deposit/withdraw from Morpho vaults
4. **Post update** → Share decision on X + Farcaster

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PRIVATE_KEY` | Wallet private key | Yes |
| `BASE_RPC_URL` | Base RPC endpoint | Yes (default: public) |

## Safety Notes

- Always check vault APY before depositing
- Use `redeem()` for full withdrawals to avoid dust
- Verify vault is properly protected (dead shares > 1e9)
- Start with small amounts for testing

## Integration with Bankr

For complex operations, use Bankr's arbitrary transaction feature:

```bash
# Via Bankr natural language
bankr.sh "Deposit 100 USDC into Morpho vault 0xBEEF... on Base"
```

## Resources

- [Morpho Docs](https://docs.morpho.org)
- [Morpho App](https://app.morpho.org)
- [ERC-4626 Standard](https://eips.ethereum.org/EIPS/eip-4626)
- [Base Chain](https://base.org)

---

*Part of the PerkyFi project - PerkOS ecosystem*
