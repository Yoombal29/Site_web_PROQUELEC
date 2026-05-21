
import requests
import json

url = "http://localhost:8002/api/v1/chat"
payload = {
    "query": "Hello",
    "session_id": "test_script",
    "persona": "installateur"
}

print(f"Testing {url}...")
try:
    response = requests.post(url, json=payload, timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    try:
        print(f"Body: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Raw Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Try root
print("\nTesting root http://localhost:8002/...")
try:
    response = requests.get("http://localhost:8002/", timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")

# Try /docs
print("\nTesting docs http://localhost:8002/docs...")
try:
    response = requests.get("http://localhost:8002/docs", timeout=5)
    print(f"Status: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")
