#!/bin/sh
# Extract and decode JWT payload
echo "Getting fresh token..."
RESPONSE=$(curl -s -X POST http://auth:9999/token?grant_type=password -H 'Content-Type: application/json' -d @/tmp/oumarkebe_final.json)

echo "Full response:"
echo "$RESPONSE" | head -c 500
echo ""
echo ""

TOKEN=$(echo "$RESPONSE" | sed 's/.*"access_token":"\([^"]*\)".*/\1/')
echo "Extracted token: $TOKEN"
echo "Token length: ${#TOKEN}"
echo ""

# Decode JWT payload (part 2 of 3)
if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "$RESPONSE" ]; then
    PAYLOAD=$(echo "$TOKEN" | cut -d. -f2)
    echo "Payload (base64): $PAYLOAD"
    echo ""
    echo "Decoded payload:"
    echo "$PAYLOAD" | base64 -d 2>/dev/null || echo "$PAYLOAD" | base64 -D 2>/dev/null || echo "Could not decode"
fi
