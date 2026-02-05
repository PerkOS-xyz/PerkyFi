#!/bin/bash
# get-latest-signal.sh - Get the most recent signal
# Usage: ./get-latest-signal.sh [signal_id]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_DIR="$(dirname "$SCRIPT_DIR")"
SIGNALS_DIR="$AGENT_DIR/workspace/signals"

if [ -n "$1" ]; then
    # Get specific signal by ID
    SIGNAL_FILE="$SIGNALS_DIR/$1.json"
    if [ -f "$SIGNAL_FILE" ]; then
        cat "$SIGNAL_FILE"
    else
        echo '{"error": "Signal not found"}'
        exit 1
    fi
else
    # Get most recent signal
    LATEST=$(ls -t "$SIGNALS_DIR"/*.json 2>/dev/null | head -1)
    if [ -n "$LATEST" ]; then
        cat "$LATEST"
    else
        echo '{"error": "No signals found"}'
        exit 1
    fi
fi
