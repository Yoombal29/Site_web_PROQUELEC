import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomFont {
  id: string;
  name: string;
  type: 'google' | 'custom';
  url?: string;
  weights: number[];
  active: boolean;
}

interface FontsState {
  fonts: CustomFont[];
  activeFonts: () => CustomFont[];
  addFont: (font: Omit<CustomFont, 'id'>) => void;
  removeFont: (id: string) => void;
  toggleFont: (id: string) => void;
}

const GOOGLE_FONTS_PRESETS = [
  { name: 'Inter', weights: [400, 500, 600, 700] },
  { name: 'Roboto', weights: [300, 400, 500, 700] },
  { name: 'Poppins', weights: [300, 400, 500, 600, 700] },
  { name: 'Open Sans', weights: [300, 400, 500, 600, 700] },
  { name: 'Montserrat', weights: [300, 400, 500, 600, 700] },
  { name: 'Lato', weights: [300, 400, 700] },
  { name: 'Playfair Display', weights: [400, 500, 600, 700] },
  { name: 'Merriweather', weights: [300, 400, 700] },
  { name: 'Source Sans 3', weights: [400, 600, 700] },
  { name: 'Raleway', weights: [300, 400, 500, 600, 700] },
  { name: 'Nunito', weights: [400, 600, 700] },
  { name: 'Quicksand', weights: [300, 400, 500, 600] },
];

export const GOOGLE_FONTS_LIST = GOOGLE_FONTS_PRESETS;

export const useFontsStore = create<FontsState>()(
  persist(
    (set, get) => ({
      fonts: [],
      activeFonts: () => get().fonts.filter((f) => f.active),
      addFont: (font) => set((state) => ({
        fonts: [...state.fonts, {
          ...font,
          id: 'font_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        }],
      })),
      removeFont: (id) => set((state) => ({
        fonts: state.fonts.filter((f) => f.id !== id),
      })),
      toggleFont: (id) => set((state) => ({
        fonts: state.fonts.map((f) => f.id === id ? { ...f, active: !f.active } : f),
      })),
    }),
    { name: 'proquelec-fonts' }
  )
);

// Inject active fonts into document head
let injected = false;
export function injectActiveFonts(fonts: CustomFont[]) {
  const active = fonts.filter((f) => f.active);
  if (active.length === 0) return;

  const googleFonts = active.filter((f) => f.type === 'google');
  const customFonts = active.filter((f) => f.type === 'custom');

  if (googleFonts.length > 0) {
    const families = googleFonts.map((f) =>
      `family=${f.name.replace(/\s+/g, '+')}:wght@${f.weights.join(';')}`
    ).join('&');
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }

  customFonts.forEach((f) => {
    if (f.url && !document.querySelector(`style[data-font="${f.name}"]`)) {
      const style = document.createElement('style');
      style.setAttribute('data-font', f.name);
      style.textContent = `
        @font-face {
          font-family: '${f.name}';
          src: url('${f.url}') format('woff2');
          font-weight: ${f.weights.join(', ')};
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    }
  });
}
