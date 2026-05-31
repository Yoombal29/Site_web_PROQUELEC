import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeTemplate {
  id: string;
  name: string;
  type: 'header' | 'footer' | 'single' | 'archive' | '404';
  serializedTree: any;
  conditions: { postType?: string; taxonomy?: string; term?: string };
  createdAt: string;
  updatedAt: string;
}

interface ThemeBuilderState {
  templates: ThemeTemplate[];
  activeHeader: string | null;
  activeFooter: string | null;
  setTemplate: (t: Omit<ThemeTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeTemplate: (id: string) => void;
  setActiveHeader: (id: string | null) => void;
  setActiveFooter: (id: string | null) => void;
  getActive: (type: 'header' | 'footer') => ThemeTemplate | undefined;
}

export const useThemeBuilderStore = create<ThemeBuilderState>()(
  persist(
    (set, get) => ({
      templates: [],
      activeHeader: null,
      activeFooter: null,
      setTemplate: (t) => set((state) => {
        const existing = state.templates.findIndex((x) => x.name === t.name && x.type === t.type);
        if (existing >= 0) {
          const arr = [...state.templates];
          arr[existing] = { ...arr[existing], ...t, updatedAt: new Date().toISOString() };
          return { templates: arr };
        }
        return {
          templates: [...state.templates, {
            ...t,
            id: 'tt_' + Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }],
        };
      }),
      removeTemplate: (id) => set((s) => ({
        templates: s.templates.filter((t) => t.id !== id),
        activeHeader: s.activeHeader === id ? null : s.activeHeader,
        activeFooter: s.activeFooter === id ? null : s.activeFooter,
      })),
      setActiveHeader: (id) => set({ activeHeader: id }),
      setActiveFooter: (id) => set({ activeFooter: id }),
      getActive: (type) => {
        const state = get();
        const id = type === 'header' ? state.activeHeader : state.activeFooter;
        return state.templates.find((t) => t.id === id);
      },
    }),
    { name: 'proquelec-theme-builder' }
  )
);
