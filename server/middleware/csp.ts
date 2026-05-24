/**
 * Content Security Policy Middleware
 * Provides CSP headers to prevent XSS attacks and restrict resource loading
 */

export const cspHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdn.tailwindcss.com",
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com",
    "media-src 'self' https: blob:",
    "object-src 'none'",
    "frame-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

/**
 * Express middleware to apply CSP headers
 */
export const applyCSP = (req: any, res: any, next: any) => {
  Object.entries(cspHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
};
