import { useState } from "react";
import { normalizeUploadUrl } from '@/lib/normalizeUploadUrl';

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
      const localUrl = path.startsWith('http')
        ? normalizeUploadUrl(path)
        : normalizeUploadUrl(path.startsWith('/uploads/') ? path : `/uploads/${path}`);
      setUrl(localUrl);
      setLoading(false);
      return localUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to get URL');
      setUrl(null);
      setLoading(false);
      return null;
    }
  }

  return { url, loading, error, getUrl };
}