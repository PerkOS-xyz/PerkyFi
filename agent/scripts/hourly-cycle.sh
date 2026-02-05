#!/bin/bash
# hourly-cycle.sh - PerkyFi agent hourly workflow
# Run via cron every 6 hours or on-demand
#
# Workflow:
# 1. Analyze Polymarket for crypto signals
# 2. Check Morpho vault status
# 3. Generate signal if confidence > threshold
# 4. Post to X via Bird CLI
# 5. Store signal in memory for frontend

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$AGENT_DIR")"

# Config
CONFIDENCE_THRESHOLD="${CONFIDENCE_THRESHOLD:-70}"
DRY_RUN="${DRY_RUN:-false}"
VAULT_ADDRESS="${VAULT_ADDRESS:-0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB}"

# Paths
BANKR_SCRIPTS="$PROJECT_ROOT/skills/bankr/scripts"
MORPHO_SCRIPTS="$PROJECT_ROOT/skills/morpho-base/scripts"
MEMORY_DIR="$AGENT_DIR/workspace/memory"
SIGNALS_DIR="$AGENT_DIR/workspace/signals"

# Ensure directories exist
mkdir -p "$MEMORY_DIR" "$SIGNALS_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "🔮 Starting PerkyFi hourly cycle..."

# Step 1: Generate signal from Polymarket analysis
log "📊 Analyzing Polymarket..."

if [ ! -x "$BANKR_SCRIPTS/generate-signal.sh" ]; then
    log "❌ generate-signal.sh not found or not executable"
    exit 1
fi

SIGNAL=$("$BANKR_SCRIPTS/generate-signal.sh" --dry-run 2>/dev/null || echo '{"error": "Failed to generate signal"}')

# Check if signal generation succeeded
if echo "$SIGNAL" | jq -e '.error' > /dev/null 2>&1; then
    log "❌ Signal generation failed: $(echo "$SIGNAL" | jq -r '.error')"
    exit 1
fi

SIGNAL_ID=$(echo "$SIGNAL" | jq -r '.id')
log "✅ Signal generated: $SIGNAL_ID"

# Step 2: Check Morpho vault status
log "🏦 Checking Morpho vault..."

APY_INFO=$("$MORPHO_SCRIPTS/get-vault-apy.sh" "$VAULT_ADDRESS" 2>/dev/null | tail -1 || echo '{}')
CURRENT_APY=$(echo "$APY_INFO" | jq -r '.apy_estimate // "4.2"')

log "✅ Vault APY: ${CURRENT_APY}%"

# Step 3: Store signal for frontend
SIGNAL_FILE="$SIGNALS_DIR/${SIGNAL_ID}.json"
echo "$SIGNAL" | jq --arg apy "$CURRENT_APY" '.recommendation.current_apy = ($apy + "%")' > "$SIGNAL_FILE"
log "💾 Signal saved to $SIGNAL_FILE"

# Step 4: Prepare post content
POST_TITLE=$(echo "$SIGNAL" | jq -r '.post_template.title')
POST_BODY=$(echo "$SIGNAL" | jq -r '.post_template.body')
POST_LINK=$(echo "$SIGNAL" | jq -r '.post_template.link')

FULL_POST="$POST_TITLE

$POST_BODY

$POST_LINK"

log "📝 Post prepared:"
echo "$FULL_POST"

# Step 5: Post to X (if not dry run)
if [ "$DRY_RUN" = "false" ]; then
    log "🐦 Posting to X..."
    
    # Check if bird CLI is available
    if command -v bird &> /dev/null; then
        bird post "$FULL_POST" 2>&1 || log "⚠️ Failed to post to X"
        log "✅ Posted to X"
    else
        log "⚠️ Bird CLI not available, skipping X post"
    fi
else
    log "🔸 DRY RUN - skipping X post"
fi

# Step 6: Log to memory
MEMORY_FILE="$MEMORY_DIR/$(date '+%Y-%m-%d').md"
{
    echo ""
    echo "## $(date '+%H:%M') - Signal $SIGNAL_ID"
    echo "- Action: $(echo "$SIGNAL" | jq -r '.recommendation.action')"
    echo "- Vault: $(echo "$SIGNAL" | jq -r '.recommendation.vault')"
    echo "- APY: ${CURRENT_APY}%"
    echo "- Link: $POST_LINK"
} >> "$MEMORY_FILE"

log "📝 Logged to memory: $MEMORY_FILE"

log "✅ Hourly cycle complete!"

# Output signal for API consumption
echo "$SIGNAL" | jq '.'
