#!/bin/bash
# Get x402 payment requirements from a URL
# Usage: ./get-requirements.sh <url>

set -euo pipefail

URL="${1:-}"

if [ -z "$URL" ]; then
    echo "Usage: ./get-requirements.sh <url>"
    exit 1
fi

# Request the resource
RESPONSE=$(curl -s -D - "$URL" 2>/dev/null)

# Check for 402
if echo "$RESPONSE" | head -1 | grep -q "402"; then
    # Extract PAYMENT-REQUIRED header
    PAYMENT_REQ=$(echo "$RESPONSE" | grep -i "payment-required:" | cut -d: -f2- | tr -d ' \r')
    
    if [ -n "$PAYMENT_REQ" ]; then
        # Output decoded JSON
        echo "$PAYMENT_REQ" | base64 -d 2>/dev/null
    else
        echo "Error: No PAYMENT-REQUIRED header found" >&2
        exit 1
    fi
else
    echo "Error: Resource did not return 402" >&2
    exit 1
fi
