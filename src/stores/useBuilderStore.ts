import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';


export interface BlockTemplate {
  id: string;
  name: string;
  block: Block;
  thumbnail?: string;
  createdAt: number;
}

const DEFAULT_BUILDER_TEMPLATES: BlockTemplate[] = [
  {
    id: uuidv4(),
    name: 'Hero Épuré',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'hero',
      content: {
        title: 'Sécurisez vos espaces commerciaux avec élégance',
        subtitle: 'Solutions de protection électrique, design moderne et performance garantie.',
        text: 'Découvrir nos services',
        href: '/contact'
      },
      style: {
        padding: '120px 20px',
        backgroundImage: 'linear-gradient(135deg, #020617 0%, #102a52 100%)',
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Poppins',
        boxShadow: '0 30px 90px rgba(0,0,0,0.18)'
      }
    }
  },
  {
    id: uuidv4(),
    name: 'Bannière Statistiques',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Résultats mesurables',
        subtitle: 'Objectif zéro sinistre, 500+ audits et accompagnement 24/7.'
      },
      style: {
        padding: '60px 30px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
        fontFamily: 'Inter'
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-3"><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">95%</h3><p class="text-sm text-slate-500 mt-2">Taux de satisfaction client</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">500+</h3><p class="text-sm text-slate-500 mt-2">Installations auditées</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">24/7</h3><p class="text-sm text-slate-500 mt-2">Assistance technique</p></div></div>'
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter'
          }
        }
      ]
    }
  },
  {
    id: uuidv4(),
    name: 'Module Avantages',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Pourquoi nous choisir ?',
        subtitle: 'Des solutions sur-mesure, un suivi pro et un design épuré pour chaque projet.'
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        maxWidth: '1100px',
        marginLeft: 'auto',
        marginRight: 'auto',
        fontFamily: 'Inter'
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-3 text-left"><div class="rounded-[28px] p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Analyse complète</h3><p class="text-sm text-slate-500">Étude terrain, audit technique et recommandations claires.</p></div><div class="rounded-[28px] p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Installation sûre</h3><p class="text-sm text-slate-500">Mise en œuvre certifiée, protection durable et respect des normes.</p></div><div class="rounded-[28px] p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Support premium</h3><p class="text-sm text-slate-500">Accompagnement 24/7 pour votre tranquillité d’esprit.</p></div></div>'
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter'
          }
        }
      ]
    }
  },
  {
    id: uuidv4(),
    name: 'Appel à l’action',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        html: '<div class="rounded-[32px] bg-blue-950 text-white p-10 md:p-12"><div class="max-w-3xl mx-auto text-center"><h2 class="text-3xl md:text-4xl font-extrabold mb-4">Prêt à sécuriser votre espace ?</h2><p class="text-sm md:text-base text-slate-200 mb-6">Passez à l’action avec une équipe experte, des solutions personnalisées et une réalisation impeccable.</p><a href="/devis" class="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-3 text-sm font-semibold shadow-lg hover:bg-orange-400 transition">Demander un devis</a></div></div>'
      },
      style: {
        padding: '0',
        backgroundColor: 'transparent',
        fontFamily: 'Inter'
      }
    }
  },
  {
    id: uuidv4(),
    name: 'Témoignages Clients',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Ils nous font confiance',
        subtitle: 'Des retours concrets et vérifiés de clients professionnels.'
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        fontFamily: 'Inter'
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-3"><div class="rounded-3xl p-6 bg-white shadow-sm"><p class="text-slate-500">"Une équipe très réactive et un travail soigné."</p><span class="mt-4 block font-semibold">- Marie</span></div><div class="rounded-3xl p-6 bg-white shadow-sm"><p class="text-slate-500">"Nous avons réduit les incidents électriques de 100%."</p><span class="mt-4 block font-semibold">- Oumar</span></div><div class="rounded-3xl p-6 bg-white shadow-sm"><p class="text-slate-500">"Conseils clairs, mise en œuvre rapide."</p><span class="mt-4 block font-semibold">- Fatou</span></div></div>'
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter'
          }
        }
      ]
    }
  },
  {
    id: uuidv4(),
    name: 'Grille de Services',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Nos services clés',
        subtitle: 'Une offre modulaire pour chaque besoin électrique.'
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Inter'
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-3 text-left"><div class="rounded-3xl p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Audit électrique</h3><p class="text-sm text-slate-500">Contrôle complet et rapport d’optimisation.</p></div><div class="rounded-3xl p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Mise en conformité</h3><p class="text-sm text-slate-500">Installation aux normes NF C 15-100.</p></div><div class="rounded-3xl p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Maintenance</h3><p class="text-sm text-slate-500">Suivi préventif et dépannage rapide.</p></div></div>'
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter'
          }
        }
      ]
    }
  },
  {
    id: uuidv4(),
    name: 'FAQ Rapide',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Questions fréquentes',
        subtitle: 'Réponses claires pour rassurer vos clients.'
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        fontFamily: 'Inter'
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="space-y-4 text-left max-w-3xl mx-auto"><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="font-semibold">Comment réserver un audit ?</h3><p class="text-slate-500">Contactez-nous via le formulaire ou par téléphone.</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="font-semibold">Quels services sont couverts ?</h3><p class="text-slate-500">Audit, conformité, formation et maintenance.</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="font-semibold">Intervenez-vous sur site rapidement ?</h3><p class="text-slate-500">Oui, nos équipes sont disponibles sous 48h.</p></div></div>'
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter'
          }
        }
      ]
    }
  },
  {
    id: uuidv4(),
    name: 'Contact Rapide',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Besoin d’un devis rapide ?',
        subtitle: 'Nous sommes prêts à vous répondre en moins de 24h.'
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#111827',
        color: '#f8fafc',
        textAlign: 'center',
        fontFamily: 'Inter'
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="max-w-3xl mx-auto p-8 rounded-3xl bg-slate-900/90 shadow-xl"><p class="text-slate-200 mb-4">Contactez-nous par téléphone, email ou formulaire. Nous adaptons notre solution à vos marchés, commerces et sites industriels.</p><div class="grid gap-4 md:grid-cols-3"><div class="rounded-2xl bg-slate-800 p-4"><p class="text-slate-400 text-xs uppercase mb-2">Téléphone</p><p class="font-semibold text-white">+221 33 123 45 67</p></div><div class="rounded-2xl bg-slate-800 p-4"><p class="text-slate-400 text-xs uppercase mb-2">Email</p><p class="font-semibold text-white">contact@proquelec.sn</p></div><div class="rounded-2xl bg-slate-800 p-4"><p class="text-slate-400 text-xs uppercase mb-2">Réponse</p><p class="font-semibold text-white">48h ouvrées</p></div></div></div>'
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter'
          }
        }
      ]
    }
  },
  {
    id: uuidv4(),
    name: 'Equipe Experte',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Notre équipe',
        subtitle: 'Des experts certifiés pour chaque intervention.'
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Inter'
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-3"><div class="rounded-3xl p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Ingénieurs</h3><p class="text-slate-500">Conception et supervision de projets.</p></div><div class="rounded-3xl p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Techniciens</h3><p class="text-slate-500">Mise en œuvre et maintenance spécialisée.</p></div><div class="rounded-3xl p-6 border border-slate-200"><h3 class="text-xl font-semibold mb-3">Auditeurs</h3><p class="text-slate-500">Contrôle qualité et conformité réglementaire.</p></div></div>'
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter'
          }
        }
      ]
    }
  },
  {
    id: uuidv4(),
    name: 'Indicateurs de Performance',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Performance et conformité',
        subtitle: 'Des chiffres clairs pour convaincre vos partenaires.'
      },
      style: {
        padding: '70px 30px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        fontFamily: 'Inter'
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<div class="grid gap-6 md:grid-cols-4"><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">100+</h3><p class="text-sm text-slate-500 mt-2">Marchés sécurisés</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">98%</h3><p class="text-sm text-slate-500 mt-2">Satisfaction client</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">24/7</h3><p class="text-sm text-slate-500 mt-2">Support continu</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="text-3xl font-bold">5 ans</h3><p class="text-sm text-slate-500 mt-2">Garantie d’intervention</p></div></div>'
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter'
          }
        }
      ]
    }
  }
];

interface BuilderState {
  blocks: Block[];
  selectedBlockId: string | null;

  // Undo/Redo
  history: Block[][];
  historyIndex: number;

  // Templates
  templates: BlockTemplate[];

  // Actions
  setBlocks: (blocks: Block[]) => void;
  addBlock: (type: string, parentId?: string, index?: number) => void;
  importBlock: (block: Block, parentId?: string, index?: number) => void;
  moveBlock: (activeId: string, overId: string) => void;
  selectBlock: (id: string | null) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Template Actions
  saveTemplate: (block: Block, name: string) => void;
  deleteTemplate: (templateId: string) => void;
  loadTemplates: () => void;
}

// Helpers
const updateBlockRecursive = (blocks: Block[], id: string, updater: (b: Block) => Block): Block[] => {
  return blocks.map((b) => {
    if (b.id === id) return updater(b);
    if (b.children && b.children.length > 0) {
      return { ...b, children: updateBlockRecursive(b.children, id, updater) };
    }
    return b;
  });
};

const removeBlockRecursive = (blocks: Block[], id: string): Block[] => {
  return blocks.filter((b) => b.id !== id).map((b) => ({
    ...b,
    children: b.children ? removeBlockRecursive(b.children, id) : undefined
  }));
};

const cloneBlock = (block: Block): Block => {
  const newBlock = { ...block, id: uuidv4() };
  if (newBlock.children) {
    newBlock.children = newBlock.children.map((child) => cloneBlock(child));
  }
  return newBlock;
};

// Helper: Save current state to history
const saveHistory = (state: BuilderState): Partial<BuilderState> => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(state.blocks)));

  if (newHistory.length > 20) newHistory.shift(); // Limit to 20 steps

  return {
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  selectedBlockId: null,
  history: [],
  historyIndex: -1,
  templates: DEFAULT_BUILDER_TEMPLATES,

  setBlocks: (blocks) => set({ blocks, history: [blocks], historyIndex: 0 }),

  addBlock: (type, parentId, index) => set((state) => {
    const historyUpdate = saveHistory(state);

    const newBlock: Block = {
      id: uuidv4(),
      type,
      content: { title: 'Nouveau Bloc' },
      style: { padding: '20px' },
      children: []
    };

    const newBlocks = [...state.blocks];
    if (typeof index === 'number') {
      newBlocks.splice(index, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    return {
      ...historyUpdate,
      blocks: newBlocks
    };
  }),

  importBlock: (blockTemplate, parentId, index) => set((state) => {
    const historyUpdate = saveHistory(state);
    const newBlock = cloneBlock(blockTemplate);

    const newBlocks = [...state.blocks];
    if (typeof index === 'number') {
      newBlocks.splice(index, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    return {
      ...historyUpdate,
      blocks: newBlocks
    };
  }),

  moveBlock: (activeId, overId) => set((state) => {
    const historyUpdate = saveHistory(state);
    const oldIndex = state.blocks.findIndex((b) => b.id === activeId);
    const newIndex = state.blocks.findIndex((b) => b.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newBlocks = [...state.blocks];
      const [movedBlock] = newBlocks.splice(oldIndex, 1);
      newBlocks.splice(newIndex, 0, movedBlock);
      return {
        ...historyUpdate,
        blocks: newBlocks
      };
    }
    return state;
  }),

  removeBlock: (id) => set((state) => {
    const historyUpdate = saveHistory(state);
    return {
      ...historyUpdate,
      blocks: removeBlockRecursive(state.blocks, id),
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId
    };
  }),

  updateBlockContent: (id, content) => set((state) => {
    const historyUpdate = saveHistory(state);
    return {
      ...historyUpdate,
      blocks: updateBlockRecursive(state.blocks, id, (b) => ({
        ...b,
        content: { ...b.content, ...content }
      }))
    };
  }),

  updateBlockStyle: (id, style) => set((state) => {
    // Optimisation: ne pas sauvegarder l'historique pour chaque pixel de drag/slider si possible
    // Mais pour l'instant on garde simple.
    const historyUpdate = saveHistory(state);
    return {
      ...historyUpdate,
      blocks: updateBlockRecursive(state.blocks, id, (b) => ({
        ...b,
        style: { ...b.style, ...style }
      }))
    };
  }),

  selectBlock: (id) => set({ selectedBlockId: id }),

  // --- Undo / Redo ---
  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      return {
        blocks: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex
      };
    }
    return {};
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      return {
        blocks: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex
      };
    }
    return {};
  }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // --- Template Actions ---
  saveTemplate: (block, name) => {
    const newTemplate: BlockTemplate = {
      id: uuidv4(),
      name,
      block: JSON.parse(JSON.stringify(block)),
      createdAt: Date.now()
    };

    set((state) => {
      const updatedTemplates = [...state.templates, newTemplate];
      localStorage.setItem('builder_templates', JSON.stringify(updatedTemplates));
      return { templates: updatedTemplates };
    });
  },

  deleteTemplate: (templateId) => {
    set((state) => {
      const updatedTemplates = state.templates.filter((t) => t.id !== templateId);
      localStorage.setItem('builder_templates', JSON.stringify(updatedTemplates));
      return { templates: updatedTemplates };
    });
  },

  loadTemplates: () => {
    const stored = localStorage.getItem('builder_templates');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as BlockTemplate[];
        if (Array.isArray(parsed)) {
          set({ templates: [...DEFAULT_BUILDER_TEMPLATES, ...parsed] });
          return;
        }
      } catch (e) {
        console.error('Failed to load templates', e);
      }
    }

    set({ templates: DEFAULT_BUILDER_TEMPLATES });
    localStorage.setItem('builder_templates', JSON.stringify(DEFAULT_BUILDER_TEMPLATES));
  }
}));