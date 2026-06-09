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
  UNKNOWN: 'Une mystérieuse erreur est survenue. Nous enquêtons !',
  NETWORK_FAIL: 'Connexion impossible. Vérifiez votre accès internet.',
  AUTH_EXPIRED: 'Votre session a expiré. Redirection en cours...',
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ApiError = Error & {
  code?: string;
  status?: number;
  icon?: string;
};

export async function apiFetch<T>(url: string, options: RequestInit = {}, retries = 2): Promise<T> {
  const token = localStorage.getItem('token');
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  });

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('token');
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    let data: unknown = null;

    if (response.status !== 204) {
      if (isJson) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    }

    if (!response.ok) {
      if (isJson) {
        const errorData = data as Record<string, unknown>;
        console.error('API ERROR', {
          method,
          url,
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });
        const message = String(
          errorData?.message ||
            errorData?.error ||
            DEFAULT_ERRORS[String(errorData?.code)] ||
            DEFAULT_ERRORS['UNKNOWN'],
        );
        const error = new Error(message) as ApiError;
        error.code = String(errorData?.code ?? '');
        error.status = response.status;
        error.icon = String(errorData?.icon ?? '');
        throw error;
      }

      console.error('API ERROR', {
        method,
        url,
        status: response.status,
        statusText: response.statusText,
        text: data,
      });
      const message =
        typeof data === 'string' && data.trim().length > 0 ? data : DEFAULT_ERRORS['UNKNOWN'];
      const error = new Error(message) as ApiError;
      error.status = response.status;
      throw error;
    }

    return data as T;
  } catch (err: unknown) {
    const errorLike = err as Partial<ApiError>;
    const isGet = method === 'GET';
    if (
      retries > 0 &&
      isGet &&
      (errorLike.name === 'TypeError' || errorLike.code === 'NETWORK_FAIL')
    ) {
      await sleep(1000 * (3 - retries));
      return apiFetch<T>(url, options, retries - 1);
    }

    if (errorLike.name === 'TypeError' && errorLike.message === 'Failed to fetch') {
      const networkError = new Error(DEFAULT_ERRORS['NETWORK_FAIL']) as ApiError;
      networkError.code = 'NETWORK_FAIL';
      throw networkError;
    }
    throw err;
  }
}
