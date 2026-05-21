
/**
 * PROQUELEC SELF-LEARNING REPAIR ENGINE
 * Module: Learning Engine
 * Purpose: Manage memory of past fixes and recognize error signatures.
 */

export interface ErrorFixEntry {
  signature: string;
  errorMessage: string;
  context: string;
  applied_fix: string;
  learned_from: string;
  success_count: number;
  last_applied: string;
}

/**
 * Generates a unique signature for an error based on its message.
 * This can be improved with regex to strip variable parts (line numbers, etc.)
 */
export function generateErrorSignature(message: string): string {
  // Simple normalization: remove hex IDs, line numbers, and paths
  const normalized = message.
  replace(/at .*\.tsx:\d+:\d+/g, 'at FILE:LINE:COL').
  replace(/0x[a-fA-F0-9]+/g, 'HEX_ID').
  trim();

  // Simple hash implementation for the demo (we would use crypto in Node, or Subtitle in browser)
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
}

/**
 * Simulates finding a known fix in memory.
 * In a real scenario, this would fetch from memory/error-memory.json
 */
export function findKnownFix(errorMessage: string, memory: ErrorFixEntry[]): ErrorFixEntry | undefined {
  const currentSignature = generateErrorSignature(errorMessage);
  return memory.find((entry) => entry.signature === currentSignature || errorMessage.includes(entry.errorMessage));
}

/**
 * Log an error to the engine for analysis.
 */
export function logEngineEvent(error: Error, componentStack?: string) {


  const event = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    componentStack,
    signature: generateErrorSignature(error.message)
  };

  // Here we would push to local-level telemetry or server-side logs
  console.table(event);
}