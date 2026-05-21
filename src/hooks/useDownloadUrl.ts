import { useState } from "react";

/**
 * Hook to get download URL for files stored locally.
 * Since we now use local storage, files are accessible directly via their path.
 */
export function useDownloadUrl(bucket: string, path: string, expiry: number = 60) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getUrl() {
    setLoading(true);
    setError(null);

    try {
      // For local storage, files are served directly from /uploads/
      // If the stored path is an absolute localhost URL, normalize it to a relative path.
      const normalizeUploadUrl = (value: string) => {
        try {
          const parsed = new URL(value);
          if (parsed.pathname.startsWith('/uploads/')) {
            return `${parsed.pathname}${parsed.search}${parsed.hash}`;
          }
          return value;
        } catch {
          return value;
        }
      };

      const localUrl = path.startsWith('http') ? normalizeUploadUrl(path) : `/uploads/${path}`;
      setUrl(localUrl);
      setLoading(false);
      return localUrl;
    } catch (err: unknown) {
      setError(err.message || 'Failed to get URL');
      setUrl(null);
      setLoading(false);
      return null;
    }
  }

  return { url, loading, error, getUrl };
}