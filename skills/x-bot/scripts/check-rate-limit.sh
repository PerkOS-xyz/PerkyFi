#!/bin/bash
# check-rate-limit.sh - Check if we can post to X
# Returns JSON with rate limit status

HISTORY_DIR="${HOME}/.perkyfi"
HISTORY_FILE="$HISTORY_DIR/post-history.json"
MAX_POSTS_PER_DAY=4
MIN_INTERVAL_SECONDS=21600  # 6 hours

mkdir -p "$HISTORY_DIR"
[ -f "$HISTORY_FILE" ] || echo '{"posts": []}' > "$HISTORY_FILE"

TODAY=$(date '+%Y-%m-%d')
NOW_TS=$(date +%s)

POSTS_TODAY=$(jq -r "[.posts[] | select(.date == \"$TODAY\")] | length" "$HISTORY_FILE")
LAST_POST_TS=$(jq -r '.posts[-1].timestamp // 0' "$HISTORY_FILE")

ELAPSED=$((NOW_TS - LAST_POST_TS))
REMAINING=$((MAX_POSTS_PER_DAY - POSTS_TODAY))

CAN_POST=true
REASON=""

if [ "$POSTS_TODAY" -ge "$MAX_POSTS_PER_DAY" ]; then
    CAN_POST=false
    REASON="daily_limit_reached"
elif [ "$ELAPSED" -lt "$MIN_INTERVAL_SECONDS" ] && [ "$LAST_POST_TS" -gt 0 ]; then
    CAN_POST=false
    REASON="min_interval_not_met"
fi

NEXT_WINDOW=""
if [ "$LAST_POST_TS" -gt 0 ]; then
    NEXT_ALLOWED=$((LAST_POST_TS + MIN_INTERVAL_SECONDS))
    NEXT_WINDOW=$(date -r "$NEXT_ALLOWED" -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -d "@$NEXT_ALLOWED" -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo "")
fi

cat <<EOF
{
  "can_post": $CAN_POST,
  "posts_today": $POSTS_TODAY,
  "remaining_today": $REMAINING,
  "last_post_seconds_ago": $ELAPSED,
  "min_interval_seconds": $MIN_INTERVAL_SECONDS,
  "next_window": "$NEXT_WINDOW",
  "reason": "$REASON"
}
EOF
