#!/bin/sh
# Advanced verification with JWT inspection
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY5NjYxMDMxLCJleHAiOjIwODUwMjEwMzF9.Ogs9QlGJImh3E2SP_rlCzHAHeIdhTYRW7GW5rfQptEI"

echo "1. Obtaining Token..."
TOKEN=$(curl -s -X POST http://auth:9999/token?grant_type=password -H 'Content-Type: application/json' -d @/tmp/oumarkebe_final.json | sed 's/.*"access_token":"\([^"]*\)".*/\1/')
# Minimal base64 decode (busybox compatible)
PAYLOAD=$(echo "$TOKEN" | cut -d. -f2)
# Add padding if needed (simplified)
echo "JWT Payload (Raw Base64): $PAYLOAD"

echo "2. Querying API..."
RESPONSE=$(curl -v -H "Authorization: Bearer $TOKEN" -H "apikey: $ANON_KEY" "http://localhost:80/rest/v1/site_settings?select=*" 2>&1)

echo "--- API RESPONSE ---"
echo "$RESPONSE"
echo "--------------------"
