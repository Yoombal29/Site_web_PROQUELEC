
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';

export type User = {
  id: string;
  email: string;
  username?: string;
  role: string;
  is_active: boolean;
};

type RedirectDebugWindow = Window & { __LAST_REDIRECT_REASON?: string };

function setRedirectReason(reason: string) {
  if (typeof window !== 'undefined') {
    (window as RedirectDebugWindow).__LAST_REDIRECT_REASON = reason;
  }
}

function clearRedirectReason() {
  if (typeof window !== 'undefined') {
    delete (window as RedirectDebugWindow).__LAST_REDIRECT_REASON;
  }
}

async function readAuthErrorDetail(res: Response) {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = (await res.json()) as { error?: unknown; message?: unknown; code?: unknown };
      const detail = data.error || data.message || data.code;
      return typeof detail === 'string' ? detail : null;
    }

    const text = await res.text();
    return text.trim() || null;
  } catch {
    return null;
  }
}

export function useSession() {
  const queryClient = useQueryClient();

  const { data: user, error, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setRedirectReason('useSession: aucun token local');
        return null;
      }

      let res: Response;
      try {
        res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        setRedirectReason('useSession: /api/auth/me inaccessible (erreur reseau)');
        throw err;
      }

      if (!res.ok) {
        const detail = await readAuthErrorDetail(res);
        const suffix = detail ? ` - ${detail}` : '';
        if ([401, 403, 404].includes(res.status)) {
          setRedirectReason(`useSession: token refuse par /api/auth/me (HTTP ${res.status})${suffix}`);
          localStorage.removeItem('token');
          return null;
        }

        setRedirectReason(`useSession: /api/auth/me en erreur (HTTP ${res.status})${suffix}`);
        throw new Error(`Session check failed with HTTP ${res.status}`);
      }

      try {
        const sessionUser = await res.json();
        clearRedirectReason();
        return sessionUser;
      } catch (err) {
        setRedirectReason('useSession: reponse /api/auth/me illisible');
        localStorage.removeItem('token');
        throw err;
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
    clearRedirectReason();
    queryClient.setQueryData(['session'], userData);
  };

  return {
    session: user ? { access_token: localStorage.getItem('token'), user } : null,
    user: user as User | null,
    isLoading,
    error,
    signOut,
    login
  };
}
