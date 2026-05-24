
import { useState, useEffect } from 'react';
import { useSession } from './useSession';
import { startTransition } from 'react';

interface ConstructionModeData {
  is_enabled: boolean;
}

// Helper for authorized fetch
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Request failed');
  }
  return res.json();
};

export const useConstructionMode = () => {
  const [isConstructionMode, setIsConstructionMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSession();

  useEffect(() => {
    fetchConstructionMode();
  }, []);

  const fetchConstructionMode = async () => {
    try {
      const res = await fetch("/api/construction-mode");
      if (res.ok) {
        const data = await res.json();
        const isEnabled = data?.is_enabled === true;
        startTransition(() => {
          setIsConstructionMode(isEnabled);
        });
      } else {
        startTransition(() => {
          setIsConstructionMode(false);
        });
      }
    } catch (error) {
      console.error('Error fetching construction mode:', error);
      startTransition(() => {
        setIsConstructionMode(false);
      });
    } finally {
      startTransition(() => {
        setIsLoading(false);
      });
    }
  };

  const grantAccess = async () => {
    try {

      await authFetch("/api/construction-mode", {
        method: 'POST',
        body: JSON.stringify({ is_enabled: false })
      });


      startTransition(() => {
        setIsConstructionMode(false);
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const revokeAccess = async () => {
    if (!user) return;

    try {

      await authFetch("/api/construction-mode", {
        method: 'POST',
        body: JSON.stringify({ is_enabled: true })
      });


      startTransition(() => {
        setIsConstructionMode(true);
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return {
    isConstructionMode,
    isLoading,
    grantAccess,
    revokeAccess
  };
};