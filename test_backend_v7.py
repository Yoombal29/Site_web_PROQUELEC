
import requests
import json
import sys

# Test Payload V7
payload = {
    "query": "salam",
    "persona": "installateur",
    "session_id": "python_test_v7",
    "mode": "hybrid"
}

print(f"--- Sending V7 Test Request ---")
print(f"Payload: {payload}")

try:
    response = requests.post("http://localhost:8002/api/v1/chat", json=payload, timeout=120)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Response: {data.get('response')}")
        print(f"Intent: {data.get('intent', 'UNKNOWN')}")
        print("✅ SUCCESS: Backend V7 is OPERATIONAL")
    else:
        print(f"❌ ERROR: Backend returned {response.status_code}")
        print(f"Details: {response.text}")

except Exception as e:
    print(f"❌ CRITICAL CONNECTION ERROR: {e}")
