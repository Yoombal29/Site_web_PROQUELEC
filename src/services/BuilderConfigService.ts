/**
 * Service léger pour charger/registrer des configurations de builder par site.
 * Permet d'extraire la logique de configuration et de réutiliser le builder
 * pour plusieurs sites/tenants sans toucher au coeur du renderer.
 */

type SiteConfig = Record<string, unknown>;

/** Window augmentation to support server-injected __SITE_CONFIG__ */
interface SiteConfigWindow extends Window {
  __SITE_CONFIG__?: SiteConfig;
}

const siteConfigs: Map<string, SiteConfig> = new Map();

export const DEFAULT_SITE_ID = 'default';

export function registerSiteConfig(siteId: string, config: SiteConfig) {
  siteConfigs.set(siteId, config || {});
}

export function getSiteConfig(siteId = DEFAULT_SITE_ID): SiteConfig | null {
  return siteConfigs.get(siteId) || null;
}

export async function loadSiteConfig(siteId = DEFAULT_SITE_ID): Promise<SiteConfig | null> {
  // If config already registered, return it
  const existing = getSiteConfig(siteId);
  if (existing) return existing;

  // Try to read a global bootstrap config injected by server-side (window.__SITE_CONFIG__)
  try {
    const siteWin = (typeof window !== 'undefined') ? window as SiteConfigWindow : undefined;
    if (siteWin?.__SITE_CONFIG__) {
      registerSiteConfig(siteId, siteWin.__SITE_CONFIG__);
      return getSiteConfig(siteId);
    }
  } catch (e) {
    // ignore
  }

  // Fallback: try fetching a site config endpoint
  try {
    const res = await fetch(`/api/site-config?site=${encodeURIComponent(siteId)}`);
    if (res.ok) {
      const data = await res.json();
      registerSiteConfig(siteId, data || {});
      return getSiteConfig(siteId);
    }
  } catch (e) {
    // ignore network errors
  }

  return null;
}

// Auto-register global config if present at module load time
try {
  const siteWin = (typeof window !== 'undefined') ? window as SiteConfigWindow : undefined;
  if (siteWin?.__SITE_CONFIG__) {
    registerSiteConfig(DEFAULT_SITE_ID, siteWin.__SITE_CONFIG__);
  }
} catch (e) {
  // noop
}

export default {
  registerSiteConfig,
  getSiteConfig,
  loadSiteConfig,
  DEFAULT_SITE_ID
};
