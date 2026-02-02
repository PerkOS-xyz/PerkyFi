#!/bin/bash
# Make an x402 request with automatic payment handling
# Usage: ./x402-request.sh <url> [method] [body]

set -euo pipefail

URL="${1:-}"
METHOD="${2:-GET}"
BODY="${3:-}"
PRIVATE_KEY="${PRIVATE_KEY:-}"

if [ -z "$URL" ]; then
    echo "Usage: PRIVATE_KEY=<key> ./x402-request.sh <url> [method] [body]"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY required for signing payments" >&2
    exit 1
fi

# First request - may get 402
RESPONSE=$(curl -s -D /tmp/x402-headers.txt -o /tmp/x402-body.txt -w "%{http_code}" \
    -X "$METHOD" "$URL" ${BODY:+-d "$BODY"})

if [ "$RESPONSE" = "402" ]; then
    echo "Payment required, signing..." >&2
    
    # Get payment requirements
    PAYMENT_REQ=$(grep -i "payment-required:" /tmp/x402-headers.txt | cut -d: -f2- | tr -d ' \r')
    
    if [ -z "$PAYMENT_REQ" ]; then
        echo "Error: No payment requirements in 402 response" >&2
        exit 1
    fi
    
    # Decode requirements
    REQUIREMENTS=$(echo "$PAYMENT_REQ" | base64 -d)
    
    # Create payment payload (simplified - real impl needs proper signing)
    # This would normally use the x402 SDK for proper EIP-712 signing
    echo "Note: Full payment signing requires x402 SDK" >&2
    echo "Requirements: $REQUIREMENTS" >&2
    
    # For now, output the requirements for manual handling
    echo "$REQUIREMENTS"
    exit 402
else
    # Return the body
    cat /tmp/x402-body.txt
fi
