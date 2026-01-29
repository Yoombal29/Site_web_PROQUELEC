import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useDownloadUrl(bucket: string, path: string, expiry: number = 60) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getUrl() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiry);
    setLoading(false);
    if (error) {
      setError(error.message);
      setUrl(null);
      return null;
    }
    setUrl(data?.signedUrl || null);
    return data?.signedUrl || null;
  }

  return { url, loading, error, getUrl };
}
