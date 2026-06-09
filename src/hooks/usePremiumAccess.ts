/**
 * usePremiumAccess.ts
 * Hook pour vérifier si l'utilisateur a un abonnement premium actif
 */
import { useQuery } from '@tanstack/react-query';
import { useSession } from './useSession';

export type PremiumStatus = {
  hasPremium: boolean;
  subscription: {
    planName: string;
    endDate: string;
    isPremium: boolean;
    manuallyActivated: boolean;
  } | null;
};

export function usePremiumAccess() {
  const { user } = useSession();

  const { data, isLoading, error, refetch } = useQuery<PremiumStatus>({
    queryKey: ['premium-access'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return { hasPremium: false, subscription: null };

      const res = await fetch('/api/premium-check', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Erreur vérification accès premium');
      }

      return res.json();
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  return {
    hasPremium: data?.hasPremium ?? false,
    subscription: data?.subscription ?? null,
    isLoading,
    error,
    refetch,
  };
}
