#!/bin/bash
# list-signals.sh - List all stored signals
# Usage: ./list-signals.sh [--limit N]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_DIR="$(dirname "$SCRIPT_DIR")"
SIGNALS_DIR="$AGENT_DIR/workspace/signals"

LIMIT="${1:-10}"
[ "$1" = "--limit" ] && LIMIT="${2:-10}"

echo "{"
echo '  "signals": ['

FIRST=true
ls -t "$SIGNALS_DIR"/*.json 2>/dev/null | head -n "$LIMIT" | while read -r file; do
    if [ "$FIRST" = true ]; then
        FIRST=false
    else
        echo ","
    fi
    cat "$file"
done

echo "  ]"
echo "}"
