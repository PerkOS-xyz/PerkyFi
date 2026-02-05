#!/bin/bash
# analyze-for-signal.sh - Full analysis pipeline for signal generation
# Returns structured JSON with recommendation
# Usage: ./analyze-for-signal.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/bankr-api.sh"

echo "🔮 Running full analysis for signal generation..." >&2

# Step 1: Get current crypto market predictions
PROMPT=$(cat <<'EOF'
Analyze Polymarket for crypto trading signals. I need:

1. Top 3 crypto-related prediction markets with highest liquidity
2. Current odds/probability for each
3. Recent price movement direction (bullish/bearish sentiment)

Focus on: ETH, BTC, Base ecosystem, DeFi regulations, ETF approvals

Format response as analysis with confidence levels.
EOF
)

result=$(bankr_query "$PROMPT")

if ! is_success "$result"; then
    echo "❌ Analysis failed" >&2
    echo '{"error": "Failed to fetch Polymarket data", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' 
    exit 1
fi

response=$(get_response_text "$result")
timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "✅ Analysis complete" >&2

# Output structured signal data
# In production, this would parse the response and generate proper JSON
# For MVP, we output the raw analysis with metadata

cat <<EOF
{
  "type": "analysis",
  "timestamp": "$timestamp",
  "source": "polymarket_via_bankr",
  "raw_analysis": $(echo "$response" | jq -Rs .),
  "metadata": {
    "focus_areas": ["ETH", "BTC", "Base", "DeFi"],
    "analysis_type": "sentiment_and_odds"
  }
}
EOF
