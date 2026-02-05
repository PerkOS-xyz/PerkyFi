#!/bin/bash
# search-crypto-markets.sh - Search Polymarket for crypto predictions
# Usage: ./search-crypto-markets.sh [search_term]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/bankr-api.sh"

SEARCH_TERM="${1:-crypto}"

echo "🔍 Searching Polymarket for: $SEARCH_TERM" >&2

PROMPT="Search Polymarket for prediction markets about $SEARCH_TERM. Show me active markets with their current odds/probabilities. Focus on BTC, ETH, and Base ecosystem if available."

result=$(bankr_query "$PROMPT")

if is_success "$result"; then
    echo "✅ Search complete" >&2
    echo ""
    get_response_text "$result"
    
    # Also output raw richData if available
    rich_data=$(echo "$result" | jq '.richData // []')
    if [ "$rich_data" != "[]" ]; then
        echo ""
        echo "📊 Rich Data:"
        echo "$rich_data" | jq '.'
    fi
else
    echo "❌ Search failed" >&2
    echo "$result" | jq '.error // .response // "Unknown error"'
    exit 1
fi
