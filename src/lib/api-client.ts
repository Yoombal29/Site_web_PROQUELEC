
/**
 * PROQUELEC API Client with Empathy Layer
 * Handles errors with human-friendly messages and automatic retries.
 */

export interface AppErrorResponse {
  success: false;
  code: string;
  message: string;
  icon?: string;
  details?: unknown;
}

const DEFAULT_ERRORS: Record<string, string> = {
  'UNKNOWN': "Une mystérieuse erreur est survenue. Nous enquêtons !",
  'NETWORK_FAIL': "Connexion impossible. Vérifiez votre accès internet.",
  'AUTH_EXPIRED': "Votre session a expiré. Redirection en cours..."
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function apiFetch<T>(url: string, options: RequestInit = {}, retries = 2): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  });

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('token');
    }

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as AppErrorResponse;
      const error = new Error(errorData.message || DEFAULT_ERRORS[errorData.code] || DEFAULT_ERRORS['UNKNOWN']);
      (error as unknown).code = errorData.code;
      (error as unknown).status = response.status;
      (error as unknown).icon = errorData.icon;
      throw error;
    }

    return data as T;
  } catch (err: unknown) {
    const isGet = !options.method || options.method.toUpperCase() === 'GET';
    if (retries > 0 && isGet && (err.name === 'TypeError' || err.code === 'NETWORK_FAIL')) {
      await sleep(1000 * (3 - retries));
      return apiFetch<T>(url, options, retries - 1);
    }

    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      const networkError = new Error(DEFAULT_ERRORS['NETWORK_FAIL']);
      (networkError as unknown).code = 'NETWORK_FAIL';
      throw networkError;
    }
    throw err;
  }
}