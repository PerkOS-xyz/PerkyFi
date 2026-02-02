#!/bin/bash
# Get balance in a Morpho Vault
# Usage: ./get-balance.sh <vault-address> [user-address]

set -euo pipefail

VAULT_ADDRESS="${1:-}"
USER_ADDRESS="${2:-}"
BASE_RPC="${BASE_RPC_URL:-https://mainnet.base.org}"

if [ -z "$VAULT_ADDRESS" ]; then
    echo "Usage: ./get-balance.sh <vault-address> [user-address]"
    exit 1
fi

# Get shares
SHARES=$(cast call "$VAULT_ADDRESS" "balanceOf(address)(uint256)" "$USER_ADDRESS" --rpc-url "$BASE_RPC")

# Convert to assets
ASSETS=$(cast call "$VAULT_ADDRESS" "convertToAssets(uint256)(uint256)" "$SHARES" --rpc-url "$BASE_RPC")

# Get asset info
ASSET=$(cast call "$VAULT_ADDRESS" "asset()(address)" --rpc-url "$BASE_RPC")
DECIMALS=$(cast call "$ASSET" "decimals()(uint8)" --rpc-url "$BASE_RPC")
SYMBOL=$(cast call "$ASSET" "symbol()(string)" --rpc-url "$BASE_RPC")

echo "Vault: $VAULT_ADDRESS"
echo "User: $USER_ADDRESS"
echo "Shares: $SHARES"
echo "Assets: $ASSETS ($SYMBOL, $DECIMALS decimals)"

# Human readable
if [ "$DECIMALS" = "6" ]; then
    HUMAN=$(echo "scale=2; $ASSETS / 1000000" | bc)
elif [ "$DECIMALS" = "18" ]; then
    HUMAN=$(echo "scale=6; $ASSETS / 1000000000000000000" | bc)
else
    HUMAN=$ASSETS
fi
echo "Human readable: $HUMAN $SYMBOL"
