#!/bin/bash
# generate-signal.sh - Generate a trading signal for PerkyFi
# Combines Polymarket analysis with Morpho action recommendation
# Usage: ./generate-signal.sh [--dry-run]
# Output: JSON signal ready for posting

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/bankr-api.sh"

DRY_RUN=false
[ "$1" = "--dry-run" ] && DRY_RUN=true

SIGNAL_ID="$(date +%s | tail -c 6)"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "🔮 Generating PerkyFi Signal #$SIGNAL_ID..." >&2

# Morpho vault info (hardcoded for MVP - Steakhouse USDC)
VAULT_NAME="Steakhouse USDC"
VAULT_ADDRESS="0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB"
VAULT_APY="4.2"  # Will be fetched dynamically in production

# Step 1: Analyze Polymarket for crypto signals
PROMPT=$(cat <<'EOF'
I'm an AI trading agent analyzing Polymarket for yield optimization signals.

Analyze current crypto prediction markets and give me:
1. The most relevant market for ETH or BTC price/sentiment
2. Current probability (odds) as a percentage
3. Your confidence in this being a good signal (high/medium/low)
4. Recommended action: bullish (deposit more) or bearish (hold/withdraw)

Keep response concise. I need: market name, probability %, and action recommendation.
EOF
)

echo "📊 Fetching Polymarket data..." >&2
result=$(bankr_query "$PROMPT")

if ! is_success "$result"; then
    echo "❌ Failed to fetch Polymarket data" >&2
    exit 1
fi

response=$(get_response_text "$result")
echo "✅ Got market data" >&2

# Parse response to extract key data
# In production, this would use structured richData
# For MVP, we'll use AI analysis directly

# Generate signal JSON
# Confidence threshold: >70% = post, <70% = skip
# For MVP, we assume the market data suggests action

# Create signal object
signal=$(cat <<EOF
{
  "id": "signal_$SIGNAL_ID",
  "timestamp": "$TIMESTAMP",
  "source": "polymarket",
  "market_analysis": $(echo "$response" | jq -Rs .),
  "recommendation": {
    "action": "deposit",
    "vault": "$VAULT_NAME",
    "vault_address": "$VAULT_ADDRESS",
    "current_apy": "$VAULT_APY%",
    "chain": "base"
  },
  "post_template": {
    "title": "🔮 PerkyFi Signal #$SIGNAL_ID",
    "body": "📊 Market Analysis Complete\\n💰 Action: Deposit to $VAULT_NAME ($VAULT_APY% APY)\\n🔗 Copy trade: perkyfi-app.netlify.app/trade/$SIGNAL_ID",
    "link": "https://perkyfi-app.netlify.app/trade/$SIGNAL_ID"
  },
  "dry_run": $DRY_RUN
}
EOF
)

echo "$signal" | jq '.'

# Log to memory if not dry run
if [ "$DRY_RUN" = false ]; then
    echo "📝 Signal generated and ready for posting" >&2
fi
