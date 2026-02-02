#!/bin/bash
# Redeem all shares from a Morpho Vault
# Usage: ./redeem-all.sh <vault-address>

set -euo pipefail

VAULT_ADDRESS="${1:-}"
PRIVATE_KEY="${PRIVATE_KEY:-}"
BASE_RPC="${BASE_RPC_URL:-https://mainnet.base.org}"

if [ -z "$VAULT_ADDRESS" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "Usage: PRIVATE_KEY=<key> ./redeem-all.sh <vault-address>"
    exit 1
fi

WALLET=$(cast wallet address "$PRIVATE_KEY")

# Get share balance
SHARES=$(cast call "$VAULT_ADDRESS" "balanceOf(address)(uint256)" "$WALLET" --rpc-url "$BASE_RPC")
echo "Shares to redeem: $SHARES"

if [ "$SHARES" -eq 0 ]; then
    echo "No shares to redeem"
    exit 0
fi

# Redeem all
echo "Redeeming all shares..."
RESULT=$(cast send "$VAULT_ADDRESS" "redeem(uint256,address,address)(uint256)" "$SHARES" "$WALLET" "$WALLET" \
    --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC" --json)

echo "$RESULT" | jq '.'
