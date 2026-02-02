#!/bin/bash
# Withdraw assets from a Morpho Vault on Base
# Usage: AMOUNT=100000000 ./withdraw.sh <vault-address>

set -euo pipefail

VAULT_ADDRESS="${1:-}"
AMOUNT="${AMOUNT:-}"
PRIVATE_KEY="${PRIVATE_KEY:-}"
BASE_RPC="${BASE_RPC_URL:-https://mainnet.base.org}"

if [ -z "$VAULT_ADDRESS" ] || [ -z "$AMOUNT" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "Usage: AMOUNT=<amount> PRIVATE_KEY=<key> ./withdraw.sh <vault-address>"
    exit 1
fi

WALLET=$(cast wallet address "$PRIVATE_KEY")

echo "Withdrawing $AMOUNT from vault..."
RESULT=$(cast send "$VAULT_ADDRESS" "withdraw(uint256,address,address)(uint256)" "$AMOUNT" "$WALLET" "$WALLET" \
    --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC" --json)

echo "$RESULT" | jq '.'
