#!/bin/bash
# Deposit assets into a Morpho Vault on Base
# Usage: AMOUNT=100000000 ./deposit.sh <vault-address>

set -euo pipefail

VAULT_ADDRESS="${1:-}"
AMOUNT="${AMOUNT:-}"
PRIVATE_KEY="${PRIVATE_KEY:-}"
BASE_RPC="${BASE_RPC_URL:-https://mainnet.base.org}"

if [ -z "$VAULT_ADDRESS" ] || [ -z "$AMOUNT" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "Usage: AMOUNT=<amount> PRIVATE_KEY=<key> ./deposit.sh <vault-address>"
    echo "  AMOUNT: Amount in smallest unit (e.g., 100000000 for 100 USDC)"
    exit 1
fi

# Get asset address from vault
ASSET=$(cast call "$VAULT_ADDRESS" "asset()(address)" --rpc-url "$BASE_RPC")
echo "Asset: $ASSET"

# Check allowance
WALLET=$(cast wallet address "$PRIVATE_KEY")
ALLOWANCE=$(cast call "$ASSET" "allowance(address,address)(uint256)" "$WALLET" "$VAULT_ADDRESS" --rpc-url "$BASE_RPC")

if [ "$ALLOWANCE" -lt "$AMOUNT" ]; then
    echo "Approving vault to spend tokens..."
    cast send "$ASSET" "approve(address,uint256)" "$VAULT_ADDRESS" "$AMOUNT" \
        --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC"
fi

# Deposit
echo "Depositing $AMOUNT into vault..."
RESULT=$(cast send "$VAULT_ADDRESS" "deposit(uint256,address)(uint256)" "$AMOUNT" "$WALLET" \
    --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC" --json)

echo "$RESULT" | jq '.'
