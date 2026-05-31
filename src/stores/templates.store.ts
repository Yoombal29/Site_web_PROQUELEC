import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  structure: any;
  themeConfig?: any;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  category?: string;
  tags?: string[];
  /** Set to true if this template was synced from server */
  serverId?: string;
}

interface TemplatesStore {
  templates: PageTemplate[];
  /** Replace entire list (e.g. after server sync) */
  setTemplates: (templates: PageTemplate[]) => void;
  addTemplate: (template: Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt'> & { serverId?: string }) => string;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, data: Partial<PageTemplate>) => void;
  getTemplate: (id: string) => PageTemplate | undefined;
  importTemplate: (json: string) => PageTemplate | null;
  exportTemplate: (id: string) => string | null;
  exportAllTemplates: () => string;
  importTemplatesBulk: (json: string) => number;
  /** Server-sync helpers */
  syncFromServer: (serverTemplates: PageTemplate[]) => void;
  deleteByServerId: (serverId: string) => void;
}

export const useTemplatesStore = create<TemplatesStore>()(
  persist(
    (set, get) => ({
      templates: [],

      setTemplates: (templates) => set({ templates }),

      addTemplate: (template) => {
        const id = crypto.randomUUID?.() || `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const now = new Date().toISOString();
        const entry: PageTemplate = { ...template, id, createdAt: now, updatedAt: now };
        set((s) => ({ templates: [...s.templates, entry] }));
        return id;
      },

      removeTemplate: (id) => {
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }));
      },

      updateTemplate: (id, data) => {
        set((s) => ({
          templates: s.templates.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      getTemplate: (id) => get().templates.find((t) => t.id === id),

      importTemplate: (json) => {
        try {
          const data = JSON.parse(json);
          const template: Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
            name: data.name || 'Template importé',
            description: data.description || '',
            structure: data.structure || data,
            themeConfig: data.themeConfig,
            metadata: data.metadata,
            category: data.category,
          };
          const id = get().addTemplate(template);
          return get().getTemplate(id) || null;
        } catch {
          return null;
        }
      },

      exportTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) return null;
        return JSON.stringify(template, null, 2);
      },

      exportAllTemplates: () => {
        return JSON.stringify(get().templates, null, 2);
      },

      importTemplatesBulk: (json) => {
        try {
          const data = JSON.parse(json);
          const list = Array.isArray(data) ? data : [data];
          let count = 0;
          for (const item of list) {
            const tpl: Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
              name: item.name || 'Template importé',
              description: item.description || '',
              structure: item.structure || item,
              themeConfig: item.themeConfig,
              metadata: item.metadata,
              category: item.category,
            };
            get().addTemplate(tpl);
            count++;
          }
          return count;
        } catch {
          return 0;
        }
      },

      syncFromServer: (serverTemplates) => {
        const existing = get().templates;
        const merged = [...serverTemplates];
        // Keep local-only templates (not yet synced or created offline)
        for (const local of existing) {
          if (!local.serverId) {
            merged.push(local);
          }
        }
        set({ templates: merged });
      },

      deleteByServerId: (serverId) => {
        set((s) => ({
          templates: s.templates.filter((t) => t.serverId !== serverId),
        }));
      },
    }),
    { name: 'proquelec-page-templates' }
  )
);
