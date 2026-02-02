#!/bin/bash
# Get Morpho Vault info
# Usage: ./get-vault-info.sh <vault-address>

set -euo pipefail

VAULT_ADDRESS="${1:-}"
BASE_RPC="${BASE_RPC_URL:-https://mainnet.base.org}"

if [ -z "$VAULT_ADDRESS" ]; then
    echo "Usage: ./get-vault-info.sh <vault-address>"
    exit 1
fi

echo "=== Vault Info ==="
echo "Address: $VAULT_ADDRESS"

NAME=$(cast call "$VAULT_ADDRESS" "name()(string)" --rpc-url "$BASE_RPC" 2>/dev/null || echo "N/A")
SYMBOL=$(cast call "$VAULT_ADDRESS" "symbol()(string)" --rpc-url "$BASE_RPC" 2>/dev/null || echo "N/A")
ASSET=$(cast call "$VAULT_ADDRESS" "asset()(address)" --rpc-url "$BASE_RPC")
TOTAL_ASSETS=$(cast call "$VAULT_ADDRESS" "totalAssets()(uint256)" --rpc-url "$BASE_RPC")
TOTAL_SUPPLY=$(cast call "$VAULT_ADDRESS" "totalSupply()(uint256)" --rpc-url "$BASE_RPC")

echo "Name: $NAME"
echo "Symbol: $SYMBOL"  
echo "Asset: $ASSET"
echo "Total Assets: $TOTAL_ASSETS"
echo "Total Supply: $TOTAL_SUPPLY"

# Calculate share price
if [ "$TOTAL_SUPPLY" != "0" ]; then
    SHARE_PRICE=$(echo "scale=6; $TOTAL_ASSETS * 1000000 / $TOTAL_SUPPLY" | bc)
    echo "Share Price: $SHARE_PRICE (scaled)"
fi
