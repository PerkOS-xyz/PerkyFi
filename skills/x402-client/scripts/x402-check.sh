#!/bin/bash
# Check if a URL requires x402 payment
# Usage: ./x402-check.sh <url>

set -euo pipefail

URL="${1:-}"

if [ -z "$URL" ]; then
    echo "Usage: ./x402-check.sh <url>"
    exit 1
fi

# Make HEAD request to check for 402
RESPONSE=$(curl -s -I -w "\n%{http_code}" "$URL" 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
HEADERS=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "402" ]; then
    echo "✅ Resource requires payment (HTTP 402)"
    
    # Extract PAYMENT-REQUIRED header
    PAYMENT_REQ=$(echo "$HEADERS" | grep -i "payment-required:" | cut -d: -f2- | tr -d ' \r')
    
    if [ -n "$PAYMENT_REQ" ]; then
        echo ""
        echo "Payment Requirements (base64):"
        echo "$PAYMENT_REQ"
        echo ""
        echo "Decoded:"
        echo "$PAYMENT_REQ" | base64 -d 2>/dev/null | jq '.' 2>/dev/null || echo "(Could not decode)"
    fi
else
    echo "❌ Resource does not require payment (HTTP $HTTP_CODE)"
fi
