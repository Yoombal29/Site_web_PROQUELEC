/**
 * Health Check Script
 * Used by the deploy workflow to verify the app is running after deployment.
 *
 * Usage: node scripts/health-check.js [url] [timeout_ms]
 */

const BASE_URL = process.argv[2] || 'http://localhost:5175';
const TIMEOUT = parseInt(process.argv[3] || '30000', 10);
const MAX_RETRIES = parseInt(process.argv[4] || '5', 10);

async function healthCheck() {
  const startTime = Date.now();
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT / MAX_RETRIES);

      const response = await fetch(`${BASE_URL}/api/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const elapsed = Date.now() - startTime;

      console.log(JSON.stringify({
        status: 'healthy',
        attempt,
        responseTime: elapsed,
        data,
        url: BASE_URL,
        timestamp: new Date().toISOString(),
      }));

      process.exit(0);
    } catch (error) {
      lastError = error;
      console.warn(`[Attempt ${attempt}/${MAX_RETRIES}] Health check failed: ${error.message}`);

      if (attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(JSON.stringify({
    status: 'unhealthy',
    error: lastError?.message || 'Max retries exceeded',
    url: BASE_URL,
    timestamp: new Date().toISOString(),
  }));

  process.exit(1);
}

healthCheck();
