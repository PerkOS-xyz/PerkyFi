#!/bin/bash
# bankr-api.sh - Core Bankr API helper functions
# Source this file to use in other scripts

set -e

BANKR_API_URL="${BANKR_API_URL:-https://api.bankr.bot}"
POLL_INTERVAL=2
MAX_POLL_ATTEMPTS=150  # 5 minutes max

# Check for API key
if [ -z "$BANKR_API_KEY" ]; then
    echo "Error: BANKR_API_KEY not set" >&2
    exit 1
fi

# Submit a prompt and get job ID
# Usage: submit_prompt "your prompt"
submit_prompt() {
    local prompt="$1"
    
    curl -s -X POST "$BANKR_API_URL/agent/prompt" \
        -H "X-API-Key: $BANKR_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"prompt\": \"$prompt\"}"
}

# Get job status
# Usage: get_job_status "job_id"
get_job_status() {
    local job_id="$1"
    
    curl -s -X GET "$BANKR_API_URL/agent/job/$job_id" \
        -H "X-API-Key: $BANKR_API_KEY"
}

# Poll until job completes
# Usage: poll_job "job_id"
# Returns: Final job result JSON
poll_job() {
    local job_id="$1"
    local attempts=0
    local status=""
    local result=""
    
    while [ $attempts -lt $MAX_POLL_ATTEMPTS ]; do
        sleep $POLL_INTERVAL
        ((attempts++))
        
        result=$(get_job_status "$job_id")
        status=$(echo "$result" | jq -r '.status')
        
        case "$status" in
            completed|failed|cancelled)
                echo "$result"
                return 0
                ;;
            pending|processing)
                # Show progress
                local update=$(echo "$result" | jq -r '.statusUpdates[-1].message // empty')
                if [ -n "$update" ]; then
                    echo "[$attempts] $update" >&2
                fi
                ;;
            *)
                echo "Unknown status: $status" >&2
                echo "$result"
                return 1
                ;;
        esac
    done
    
    echo "Timeout waiting for job $job_id" >&2
    return 1
}

# Submit prompt and wait for result
# Usage: bankr_query "your prompt"
# Returns: Final response JSON
bankr_query() {
    local prompt="$1"
    
    echo "Submitting: $prompt" >&2
    
    # Submit
    local submit_result=$(submit_prompt "$prompt")
    local success=$(echo "$submit_result" | jq -r '.success')
    
    if [ "$success" != "true" ]; then
        echo "Failed to submit: $(echo "$submit_result" | jq -r '.error // .message // "Unknown error"')" >&2
        echo "$submit_result"
        return 1
    fi
    
    local job_id=$(echo "$submit_result" | jq -r '.jobId')
    echo "Job ID: $job_id" >&2
    
    # Poll until complete
    poll_job "$job_id"
}

# Extract just the response text
# Usage: get_response_text "$json"
get_response_text() {
    local json="$1"
    echo "$json" | jq -r '.response // "No response"'
}

# Check if job succeeded
# Usage: is_success "$json"
is_success() {
    local json="$1"
    local status=$(echo "$json" | jq -r '.status')
    [ "$status" = "completed" ]
}
