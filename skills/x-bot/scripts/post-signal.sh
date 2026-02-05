#!/bin/bash
# post-signal.sh - Post a PerkyFi signal to X/Twitter
# Usage: ./post-signal.sh <signal_json_file>
#    or: echo '{"post_template": {...}}' | ./post-signal.sh -

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HISTORY_DIR="${HOME}/.perkyfi"
HISTORY_FILE="$HISTORY_DIR/post-history.json"
MAX_POSTS_PER_DAY=4
MIN_INTERVAL_SECONDS=21600  # 6 hours

# Ensure history directory exists
mkdir -p "$HISTORY_DIR"
[ -f "$HISTORY_FILE" ] || echo '{"posts": []}' > "$HISTORY_FILE"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >&2
}

# Read signal from file or stdin
if [ "${1:-}" = "-" ]; then
    SIGNAL=$(cat)
elif [ -n "${1:-}" ] && [ -f "$1" ]; then
    SIGNAL=$(cat "$1")
else
    echo "Usage: $0 <signal_json_file> | $0 -" >&2
    exit 1
fi

# Extract post content
SIGNAL_ID=$(echo "$SIGNAL" | jq -r '.id // "unknown"')
POST_TITLE=$(echo "$SIGNAL" | jq -r '.post_template.title // ""')
POST_BODY=$(echo "$SIGNAL" | jq -r '.post_template.body // ""')
POST_LINK=$(echo "$SIGNAL" | jq -r '.post_template.link // ""')

if [ -z "$POST_TITLE" ]; then
    log "❌ Invalid signal: missing post_template.title"
    exit 1
fi

# Check rate limit
TODAY=$(date '+%Y-%m-%d')
POSTS_TODAY=$(jq -r "[.posts[] | select(.date == \"$TODAY\")] | length" "$HISTORY_FILE")

if [ "$POSTS_TODAY" -ge "$MAX_POSTS_PER_DAY" ]; then
    log "❌ Rate limit: Already posted $POSTS_TODAY times today (max: $MAX_POSTS_PER_DAY)"
    echo '{"success": false, "error": "rate_limited", "posts_today": '"$POSTS_TODAY"'}'
    exit 1
fi

# Check minimum interval
LAST_POST_TS=$(jq -r '.posts[-1].timestamp // 0' "$HISTORY_FILE")
NOW_TS=$(date +%s)
ELAPSED=$((NOW_TS - LAST_POST_TS))

if [ "$ELAPSED" -lt "$MIN_INTERVAL_SECONDS" ] && [ "$LAST_POST_TS" -gt 0 ]; then
    WAIT_TIME=$((MIN_INTERVAL_SECONDS - ELAPSED))
    log "❌ Too soon: Wait $WAIT_TIME more seconds"
    echo '{"success": false, "error": "too_soon", "wait_seconds": '"$WAIT_TIME"'}'
    exit 1
fi

# Check for duplicate
DUPLICATE=$(jq -r ".posts[] | select(.signal_id == \"$SIGNAL_ID\") | .signal_id" "$HISTORY_FILE")
if [ -n "$DUPLICATE" ]; then
    log "⚠️ Duplicate: Signal $SIGNAL_ID already posted"
    echo '{"success": false, "error": "duplicate", "signal_id": "'"$SIGNAL_ID"'"}'
    exit 1
fi

# Build full post
HASHTAGS="#DeFi #Base #AI #YieldFarming"
FULL_POST="$POST_TITLE

$POST_BODY

🔗 $POST_LINK

$HASHTAGS"

log "📝 Posting signal $SIGNAL_ID..."
log "Content: $POST_TITLE"

# Post via Bird CLI
if command -v bird &> /dev/null; then
    RESULT=$(bird post "$FULL_POST" 2>&1) || {
        log "❌ Bird CLI error: $RESULT"
        echo '{"success": false, "error": "bird_error", "message": "'"${RESULT//\"/\\\"}"'"}'
        exit 1
    }
    log "✅ Posted successfully"
else
    log "⚠️ Bird CLI not found - simulating post"
    RESULT="simulated"
fi

# Record in history
jq --arg id "$SIGNAL_ID" \
   --arg date "$TODAY" \
   --arg ts "$NOW_TS" \
   --arg title "$POST_TITLE" \
   '.posts += [{"signal_id": $id, "date": $date, "timestamp": ($ts | tonumber), "title": $title}]' \
   "$HISTORY_FILE" > "${HISTORY_FILE}.tmp" && mv "${HISTORY_FILE}.tmp" "$HISTORY_FILE"

# Output success
cat <<EOF
{
  "success": true,
  "signal_id": "$SIGNAL_ID",
  "posted_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "posts_today": $((POSTS_TODAY + 1))
}
EOF
