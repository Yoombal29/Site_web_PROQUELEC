import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BrandingConfig {
  /** Main brand name shown in the builder header */
  brandName: string;
  /** Short tagline under the brand name */
  brandTagline: string;
  /** Logo URL (replaces text logo) */
  logoUrl?: string;
  /** Small favicon/icon URL */
  iconUrl?: string;
  /** Primary brand color (hex) */
  primaryColor: string;
  /** Hide all "God Mode" / technical references */
  hideGodMode: boolean;
  /** Custom label for the builder ("Studio de Création", "Page Builder", etc.) */
  builderLabel: string;
  /** Footer text */
  footerText: string;
}

const DEFAULTS: BrandingConfig = {
  brandName: 'PROQUELEC',
  brandTagline: 'Qualité & Sécurité Électrique',
  logoUrl: '',
  iconUrl: '',
  primaryColor: '#2376df',
  hideGodMode: false,
  builderLabel: 'Studio de Création',
  footerText: '© PROQUELEC — Qualité des Installations Électriques au Sénégal',
};

interface BrandingStore {
  config: BrandingConfig;
  updateConfig: (partial: Partial<BrandingConfig>) => void;
  resetConfig: () => void;
}

export const useBrandingStore = create<BrandingStore>()(
  persist(
    (set) => ({
      config: { ...DEFAULTS },
      updateConfig: (partial) =>
        set((s) => ({ config: { ...s.config, ...partial } })),
      resetConfig: () => set({ config: { ...DEFAULTS } }),
    }),
    { name: 'proquelec-branding' }
  )
);
