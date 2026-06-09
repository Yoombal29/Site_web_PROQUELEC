const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

const getCurrentHostname = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
};

export function normalizeUploadUrl(value: string): string {
  if (!value || typeof value !== 'string') return '';

  const candidate = value.trim();
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const parsed = new URL(candidate, base);

    if (parsed.pathname.startsWith('/uploads/')) {
      const currentHost = getCurrentHostname();
      const host = parsed.hostname;

      if (LOCAL_HOSTNAMES.has(host) || host === currentHost) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      return candidate;
    }
  } catch {
    // ignore invalid URLs and fallback to string normalization below
  }

  if (candidate.startsWith('uploads/')) {
    return `/${candidate}`;
  }

  return candidate;
}
