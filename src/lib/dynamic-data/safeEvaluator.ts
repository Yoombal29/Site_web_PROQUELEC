import type { DynamicToken } from './tokenizer';

export interface EvaluationContext {
  page?: {
    title?: string;
    slug?: string;
    meta_description?: string;
    status?: string;
    updated_at?: string;
    [key: string]: string | undefined;
  };
  global?: Record<string, string>;
  date?: {
    year?: string;
    month?: string;
    day?: string;
  };
  ds?: Record<string, any>;
  query?: Record<string, string>;
  user?: Record<string, any>;
  cart?: Record<string, any>;
}

const DEFAULT_GLOBAL_DATA = {
  siteName: 'PROQUELEC Sénégal',
  contactEmail: 'contact@proquelec.sn',
  contactPhone: '+221 33 824 10 10',
};

function deepGet(obj: any, path: string): any {
  if (!obj) return '';
  const parts = path.split('.');
  let current = obj;
  for (const p of parts) {
    if (current === null || current === undefined) return '';
    if (p === '*') {
      if (Array.isArray(current)) return current.map((item: any) => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(', ');
      return '';
    }
    current = current[p];
  }
  return current !== null && current !== undefined ? String(current) : '';
}

/**
 * Évalue de manière sandboxée et sécurisée un token par rapport à un contexte défini.
 * Whitelist stricte, pas d'eval(), pas d'accès global non autorisé.
 * Supporte les chemins multi-niveaux via deepGet() pour le namespace 'ds'.
 */
export const evaluateToken = (token: DynamicToken, context: EvaluationContext = {}): string => {
  const { namespace, key } = token;

  if (namespace === 'page') {
    const pageData = context.page || {};
    const allowedKeys = ['title', 'slug', 'meta_description', 'status', 'updated_at'];
    if (allowedKeys.includes(key)) {
      return pageData[key] || '';
    }
  }

  if (namespace === 'global') {
    const globalData = { ...DEFAULT_GLOBAL_DATA, ...(context.global || {}) };
    return globalData[key] || '';
  }

  if (namespace === 'date') {
    const dateObj = new Date();
    const dateData = {
      year: String(dateObj.getFullYear()),
      month: String(dateObj.getMonth() + 1).padStart(2, '0'),
      day: String(dateObj.getDate()).padStart(2, '0'),
      ...(context.date || {}),
    };
    if (key in dateData) return dateData[key as keyof typeof dateData] || '';
  }

  if (namespace === 'ds') {
    // Multi-level path resolution: {{ ds.products.0.title }}
    return deepGet(context.ds, key);
  }

  if (namespace === 'query') {
    if (typeof window === 'undefined') return '';
    const params = context.query || Object.fromEntries(new URLSearchParams(window.location.search));
    return params[key] || '';
  }

  if (namespace === 'user') {
    const userData = context.user || {};
    const allowedKeys = ['name', 'email', 'role', 'avatar', 'id'];
    const first = key.split('.')[0];
    if (allowedKeys.includes(first)) return deepGet(userData, key);
  }

  if (namespace === 'cart') {
    const cartData = context.cart || {};
    const allowedKeys = ['count', 'total', 'items', 'subtotal', 'currency'];
    const first = key.split('.')[0];
    if (allowedKeys.includes(first)) return deepGet(cartData, key);
  }

  return '';
};
