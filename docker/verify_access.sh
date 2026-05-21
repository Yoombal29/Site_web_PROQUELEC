#!/bin/sh
# Scripts to verify access from inside the container
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY5NjYxMDMxLCJleHAiOjIwODUwMjEwMzF9.Ogs9QlGJImh3E2SP_rlCzHAHeIdhTYRW7GW5rfQptEI"

echo "1. Logging in..."
TOKEN=$(curl -s -X POST http://auth:9999/token?grant_type=password -H 'Content-Type: application/json' -d @/tmp/oumarkebe_final.json | sed 's/.*"access_token":"\([^"]*\)".*/\1/')

if [ -z "$TOKEN" ] || [ "${TOKEN}" = "{" ]; then
    echo "Login Failed. Token is empty or invalid."
    exit 1
fi

echo "2. Token obtained (length: ${#TOKEN})"

echo "3. Querying Protected Resource (site_settings)..."
# Using internal port 80 since we are inside the gateway container
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" -H "apikey: $ANON_KEY" "http://localhost:80/rest/v1/site_settings?select=*")

echo "HTTP Status for Protected Resource: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "SUCCESS: Access Granted!"
else
    echo "FAILURE: Access Denied with code $HTTP_CODE"
fi
