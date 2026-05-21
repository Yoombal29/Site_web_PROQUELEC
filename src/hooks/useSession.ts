
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';

export type User = {
  id: string;
  email: string;
  username?: string;
  role: string;
  is_active: boolean;
};

export function useSession() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Session invalid');
        }

        return await res.json();
      } catch (err) {
        localStorage.removeItem('token');
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });

  const signOut = async () => {
    localStorage.removeItem('token');
    queryClient.setQueryData(['session'], null);
    toast.success('Déconnexion réussie');
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    queryClient.setQueryData(['session'], userData);
  };

  return {
    session: user ? { access_token: localStorage.getItem('token'), user } : null,
    user: user as User | null,
    isLoading,
    signOut,
    login
  };
}
