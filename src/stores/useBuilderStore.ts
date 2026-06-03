import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Block, BlockStyle, BlockContent } from '@/types/builder';
import { secureSetItem, secureGetItem, secureRemoveItem } from '@/lib/crypto-utils';
import cloneDeep from 'lodash.clonedeep';
import { eventBus } from '@/engine/events/bus';


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
            html: '<div class="max-w-3xl mx-auto p-8 rounded-3xl bg-slate-900/90 shadow-xl"><p class="text-slate-200 mb-4">Contactez-nous par téléphone, email ou formulaire. Nous adaptons notre solution à vos marchés, commerces et sites industriels.</p><div class="grid gap-4 md:grid-cols-3"><div class="rounded-2xl bg-slate-800 p-4"><p class="text-slate-400 text-xs uppercase mb-2">Téléphone</p><p class="font-semibold text-white">+221 33 848 68 55</p></div><div class="rounded-2xl bg-slate-800 p-4"><p class="text-slate-400 text-xs uppercase mb-2">Email</p><p class="font-semibold text-white">proquelec@proquelec.sn</p></div><div class="rounded-2xl bg-slate-800 p-4"><p class="text-slate-400 text-xs uppercase mb-2">Réponse</p><p class="font-semibold text-white">48h ouvrées</p></div></div></div>'
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
  },
  {
    id: uuidv4(),
    name: 'Page Modèle',
    createdAt: Date.now(),
    block: {
      id: uuidv4(),
      type: 'section',
      content: {
        title: 'Page Modèle Builder',
        subtitle: 'Un modèle complet pour tester toutes les capacités du builder.'
      },
      style: {
        padding: '0',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'Inter'
      },
      children: [
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<section class="bg-gradient-to-r from-sky-700 via-indigo-900 to-slate-900 text-white py-32"><div class="max-w-6xl mx-auto px-6 text-center"><h1 class="text-5xl md:text-6xl font-extrabold mb-6">Testez le Builder avec un modèle complet</h1><p class="max-w-3xl mx-auto text-lg md:text-xl text-slate-200 mb-8">Hero, fonctionnalités, chiffres clés, témoignages, tarifs et FAQ — tout est présent pour valider le rendu et la personnalisation.</p><a href="#" class="inline-flex items-center justify-center rounded-full bg-amber-400 px-8 py-3 text-base font-semibold text-slate-950 shadow-xl hover:bg-amber-300 transition">Démarrer le test</a></div></section>'
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter'
          }
        },
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<section class="bg-white py-24"><div class="max-w-6xl mx-auto px-6 grid gap-8 lg:grid-cols-3"><div class="rounded-3xl p-8 border border-slate-200 shadow-sm"><h2 class="text-2xl font-semibold mb-4">Modules multi-usages</h2><p class="text-slate-600">Un ensemble prêt à l’emploi pour tester des blocs de contenu et des sections visuelles.</p></div><div class="rounded-3xl p-8 border border-slate-200 shadow-sm"><h2 class="text-2xl font-semibold mb-4">Hero enrichi</h2><p class="text-slate-600">Section d’accueil immersive avec CTA, visuels et message premium.</p></div><div class="rounded-3xl p-8 border border-slate-200 shadow-sm"><h2 class="text-2xl font-semibold mb-4">Validation UX</h2><p class="text-slate-600">Navigation fluide et composants testés pour l’édition en temps réel.</p></div></div></section>'
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter'
          }
        },
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<section class="bg-slate-950 text-white py-24"><div class="max-w-6xl mx-auto px-6 grid gap-6 md:grid-cols-3"><div class="p-8 bg-slate-900 rounded-3xl shadow-xl"><h3 class="text-3xl font-bold mb-3">150+</h3><p class="text-slate-300">Projets testés</p></div><div class="p-8 bg-slate-900 rounded-3xl shadow-xl"><h3 class="text-3xl font-bold mb-3">99%</h3><p class="text-slate-300">Interfaces réactives</p></div><div class="p-8 bg-slate-900 rounded-3xl shadow-xl"><h3 class="text-3xl font-bold mb-3">24/7</h3><p class="text-slate-300">Support de test</p></div></div></section>'
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter'
          }
        },
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<section class="bg-white py-24"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-semibold mb-8 text-center">Témoignages et retours</h2><div class="grid gap-6 md:grid-cols-2"><div class="rounded-3xl p-8 border border-slate-200 shadow-sm"><p class="text-slate-600 mb-4">« Le builder supporte parfaitement des pages complexes et des composants variés. »</p><span class="font-semibold">- Client test 1</span></div><div class="rounded-3xl p-8 border border-slate-200 shadow-sm"><p class="text-slate-600 mb-4">« Nous avons pu monter un prototype très rapidement. »</p><span class="font-semibold">- Client test 2</span></div></div></div></section>'
          },
          style: {
            padding: '0',
            backgroundColor: 'transparent',
            fontFamily: 'Inter'
          }
        },
        {
          id: uuidv4(),
          type: 'text-block',
          content: {
            html: '<section class="bg-slate-100 py-24"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-semibold mb-8 text-center">FAQ de test</h2><div class="space-y-4"><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="font-semibold mb-2">Comment personnaliser ce modèle ?</h3><p class="text-slate-600">Utilisez le builder pour modifier le hero, les sections et les styles en temps réel.</p></div><div class="rounded-3xl p-6 bg-white shadow-sm"><h3 class="font-semibold mb-2">Est-ce que les sections sont réordonnables ?</h3><p class="text-slate-600">Oui, chaque bloc est conçu pour être déplacé et configuré dynamiquement.</p></div></div></div></section>'
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

export interface PageMetadata {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_robots?: 'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow';
  featured_image?: string;
  language_code?: string;

  is_published?: boolean;
  publish_date?: string;
  unpublish_date?: string;
  workflow_status?: 'draft' | 'review' | 'approved' | 'published';

  author?: string;
  reading_time?: number;
  categories?: string[];
  tags?: string[];

  // Hero Section Metadata
  hero_title?: string;
  hero_subtitle?: string;
  hero_background_image?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;

  template?: string;
  show_hero?: boolean;
  show_footer?: boolean;

  custom_css?: string;
  custom_js?: string;
  header_html?: string;
  footer_html?: string;
  menu_order?: number;
}

interface BuilderState {
  blocks: Block[];
  selectedBlockId: string | null;
  pageMetadata: PageMetadata;

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

  setPageMetadata: (metadata: Partial<PageMetadata>) => void;

  // Block Update Actions
  updateBlockStyle: (id: string, style: Partial<BlockStyle>) => void;
  updateBlockContent: (id: string, content: Partial<BlockContent>) => void;
  removeBlock: (id: string) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  snapshotHistory: () => void;

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

const countBlocks = (block: Block): number => {
  let count = 1;
  if (block.children) {
    for (const child of block.children) {
      count += countBlocks(child);
    }
  }
  return count;
};

const findBlockRecursive = (blocks: Block[], id: string): Block | undefined => {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children) {
      const found = findBlockRecursive(b.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

const insertBlockRecursive = (blocks: Block[], newBlock: Block, parentId?: string, index?: number): Block[] => {
  if (!parentId) {
    const newBlocks = [...blocks];
    if (typeof index === 'number') newBlocks.splice(index, 0, newBlock);
    else newBlocks.push(newBlock);
    return newBlocks;
  }
  return blocks.map(b => {
    if (b.id === parentId) {
      const children = b.children ? [...b.children] : [];
      if (typeof index === 'number') children.splice(index, 0, newBlock);
      else children.push(newBlock);
      return { ...b, children };
    }
    if (b.children) {
      return { ...b, children: insertBlockRecursive(b.children, newBlock, parentId, index) };
    }
    return b;
  });
};

const findBlockParent = (
  blocks: Block[],
  id: string,
  parent?: Block
): { block: Block; parent: Block | undefined; index: number } | null => {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === id) {
      return { block: blocks[i], parent, index: i };
    }
    if (blocks[i].children) {
      const found = findBlockParent(blocks[i].children!, id, blocks[i]);
      if (found) return found;
    }
  }
  return null;
};

// Helper: Save current state to history using deep clones for reliable undo/redo
const saveHistory = (state: BuilderState): Partial<BuilderState> => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(cloneDeep(state.blocks));

  if (newHistory.length > 20) newHistory.shift(); // Limit to 20 steps

  return {
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  selectedBlockId: null,
  pageMetadata: {},
  history: [],
  historyIndex: -1,
  templates: DEFAULT_BUILDER_TEMPLATES,

  setPageMetadata: (metadata) => {
    const previous = { ...useBuilderStore.getState().pageMetadata };
    set((state) => ({
      pageMetadata: { ...state.pageMetadata, ...metadata }
    }));
    eventBus.emit('page:metadata:updated', { previous, next: metadata });
  },

  setBlocks: (blocks) => {
    const cloned = cloneDeep(blocks);
    set({ blocks: cloned, history: [cloned], historyIndex: 0 });
    eventBus.emit('state:changed', { action: 'setBlocks', timestamp: Date.now() });
  },

  addBlock: (type, parentId, index) => {
    let createdBlock: Block | null = null;
    set((state) => {
      const historyUpdate = saveHistory(state);

      const newBlock: Block = {
        id: uuidv4(),
        type,
        content: { title: 'Nouveau Bloc' },
        style: { padding: '20px' },
        children: []
      };
      createdBlock = newBlock;

      let resolvedParentId: string | undefined = undefined;
      let targetIndex: number | undefined = index;

      if (parentId) {
        const info = findBlockParent(state.blocks, parentId);
        resolvedParentId = info ? parentId : undefined;
      }

      const newBlocks = insertBlockRecursive(state.blocks, newBlock, resolvedParentId, targetIndex);

      return {
        ...historyUpdate,
        blocks: newBlocks
      };
    });
    if (createdBlock) {
      eventBus.emit('block:created', { block: createdBlock, parentId, index });
    }
  },

  importBlock: (blockTemplate, parentId, index) => {
    let importedBlock: Block | null = null;
    set((state) => {
      const historyUpdate = saveHistory(state);
      const newBlock = cloneBlock(blockTemplate);
      importedBlock = newBlock;

      let resolvedParentId: string | undefined = undefined;
      let targetIndex: number | undefined = index;

      if (parentId) {
        const info = findBlockParent(state.blocks, parentId);
        resolvedParentId = info ? parentId : undefined;
      }

      const newBlocks = insertBlockRecursive(state.blocks, newBlock, resolvedParentId, targetIndex);

      return {
        ...historyUpdate,
        blocks: newBlocks
      };
    });
    if (importedBlock) {
      eventBus.emit('block:imported', { block: importedBlock, parentId, index });
    }
  },

  moveBlock: (activeId, overId) => {
    let moved = false;
    let prevIdx = -1;
    let newIdx = -1;
    set((state) => {
      const historyUpdate = saveHistory(state);
      const activeInfo = findBlockParent(state.blocks, activeId);
      const overInfo = findBlockParent(state.blocks, overId);

      if (activeInfo && overInfo && activeId !== overId) {
        prevIdx = activeInfo.index;
        const sameParent = activeInfo.parent?.id === overInfo.parent?.id;
        newIdx = overInfo.index;
        if (sameParent && activeInfo.index < overInfo.index) {
          newIdx = Math.max(0, overInfo.index - 1);
        }

        const movedBlock = activeInfo.block;
        let newBlocks = removeBlockRecursive(state.blocks, activeId);
        newBlocks = insertBlockRecursive(newBlocks, movedBlock, overInfo.parent?.id, newIdx);
        
        moved = true;
        return {
          ...historyUpdate,
          blocks: newBlocks
        };
      }
      return state;
    });
    if (moved) {
      eventBus.emit('block:moved', {
        activeId,
        overId,
        previousIndex: prevIdx,
        newIndex: newIdx,
      });
    }
  },

  removeBlock: (id) => {
    let deletedBlock: Block | null = null;
    let parentId: string | undefined;
    let blockIndex: number | undefined;
    set((state) => {
      const historyUpdate = saveHistory(state);
      const info = findBlockParent(state.blocks, id);
      if (info) {
        deletedBlock = info.block;
        parentId = info.parent?.id;
        blockIndex = info.index;
      }
      return {
        ...historyUpdate,
        blocks: removeBlockRecursive(state.blocks, id),
        selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId
      };
    });
    if (deletedBlock) {
      eventBus.emit('block:deleted', {
        id,
        block: deletedBlock,
        parentId,
        index: blockIndex,
      });
    }
  },

  updateBlockContent: (id, content) => {
    set((state) => ({
      blocks: updateBlockRecursive(state.blocks, id, (b) => ({
        ...b,
        content: { ...b.content, ...content }
      }))
    }));
  },

  updateBlockStyle: (id, style) => {
    set((state) => ({
      blocks: updateBlockRecursive(state.blocks, id, (b) => ({
        ...b,
        style: { ...b.style, ...style }
      }))
    }));
  },

  snapshotHistory: () => {
    set((state) => saveHistory(state));
    const { blocks, history } = useBuilderStore.getState();
    eventBus.emit('history:snapshot:created', {
      snapshot: {
        id: uuidv4(),
        label: `Snapshot #${history.length}`,
        timestamp: Date.now(),
        type: 'auto',
      },
      blocksCount: blocks.length,
    });
  },

  selectBlock: (id) => {
    const previousId = useBuilderStore.getState().selectedBlockId;
    set({ selectedBlockId: id });
    eventBus.emit('block:selected', { id, previousId });
  },

  // --- Undo / Redo ---
  undo: () => {
    const prevIndex = useBuilderStore.getState().historyIndex;
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          blocks: cloneDeep(state.history[newIndex]),
          historyIndex: newIndex
        };
      }
      return {};
    });
    const newIndex = useBuilderStore.getState().historyIndex;
    if (newIndex !== prevIndex) {
      eventBus.emit('history:undo', { fromIndex: prevIndex, toIndex: newIndex });
    }
  },

  redo: () => {
    const prevIndex = useBuilderStore.getState().historyIndex;
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          blocks: cloneDeep(state.history[newIndex]),
          historyIndex: newIndex
        };
      }
      return {};
    });
    const newIndex = useBuilderStore.getState().historyIndex;
    if (newIndex !== prevIndex) {
      eventBus.emit('history:redo', { fromIndex: prevIndex, toIndex: newIndex });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // --- Template Actions ---
  saveTemplate: (block, name) => {
    const newTemplate: BlockTemplate = {
      id: uuidv4(),
      name,
      block: cloneDeep(block),
      createdAt: Date.now()
    };

    set((state) => {
      const updatedTemplates = [...state.templates, newTemplate];
      secureSetItem('builder_templates', updatedTemplates);
      return { templates: updatedTemplates };
    });
    eventBus.emit('template:saved', { name, blocksCount: countBlocks(block) });
  },

  deleteTemplate: (templateId) => {
    let templateName = '';
    set((state) => {
      const target = state.templates.find((t) => t.id === templateId);
      if (target) templateName = target.name;
      const updatedTemplates = state.templates.filter((t) => t.id !== templateId);
      secureSetItem('builder_templates', updatedTemplates);
      return { templates: updatedTemplates };
    });
    if (templateName) {
      eventBus.emit('template:deleted', { id: templateId, name: templateName });
    }
  },

  loadTemplates: () => {
    try {
      const stored = secureGetItem<BlockTemplate[]>('builder_templates', []);
      if (stored) {
        try {
          if (Array.isArray(stored)) {
            set({ templates: [...DEFAULT_BUILDER_TEMPLATES, ...stored] });
            return;
          }
        } catch (e) {
          console.error('Failed to load templates', e);
          // Clear corrupted data
          localStorage.removeItem('builder_templates');
        }
      }

      set({ templates: DEFAULT_BUILDER_TEMPLATES });
      secureSetItem('builder_templates', DEFAULT_BUILDER_TEMPLATES);
    } catch (error) {
      console.error('[BuilderStore] Error in loadTemplates:', error);
      // Fallback to default templates
      set({ templates: DEFAULT_BUILDER_TEMPLATES });
    }
  }
}));