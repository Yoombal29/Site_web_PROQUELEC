
import { useSession } from './useSession';
import { startTransition } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

const fetchConstructionMode = async (): Promise<boolean> => {
  const res = await fetch('/api/construction-mode');
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Too many requests');
    }
    return false;
  }
  const data = await res.json();
  return data?.is_enabled === true;
};

export const useConstructionMode = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['construction-mode'],
    queryFn: fetchConstructionMode,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: false,
    onError: (error) => {
      if ((error as Error).message !== 'Too many requests') {
        console.error('Error fetching construction mode:', error);
      }
    }
  });

  const grantAccess = async () => {
    try {
      await authFetch('/api/construction-mode', {
        method: 'POST',
        body: JSON.stringify({ is_enabled: false })
      });
      queryClient.setQueryData(['construction-mode'], false);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const revokeAccess = async () => {
    if (!user) return;

    try {
      await authFetch('/api/construction-mode', {
        method: 'POST',
        body: JSON.stringify({ is_enabled: true })
      });
      queryClient.setQueryData(['construction-mode'], true);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return {
    isConstructionMode: query.data ?? false,
    isLoading: query.isLoading,
    grantAccess,
    revokeAccess
  };
};