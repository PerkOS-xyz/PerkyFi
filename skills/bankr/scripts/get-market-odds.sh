#!/bin/bash
# get-market-odds.sh - Get odds for a specific Polymarket prediction
# Usage: ./get-market-odds.sh "ETH above $4000 by March"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/bankr-api.sh"

if [ -z "$1" ]; then
    echo "Usage: $0 <market_description>" >&2
    echo "Example: $0 \"ETH above \$4000 by March\"" >&2
    exit 1
fi

MARKET="$1"

echo "🎯 Getting odds for: $MARKET" >&2

PROMPT="What are the current Polymarket odds for: $MARKET? Give me the probability percentage for Yes and No outcomes."

result=$(bankr_query "$PROMPT")

if is_success "$result"; then
    echo "✅ Got odds" >&2
    echo ""
    get_response_text "$result"
else
    echo "❌ Failed to get odds" >&2
    echo "$result" | jq '.error // .response // "Unknown error"'
    exit 1
fi
