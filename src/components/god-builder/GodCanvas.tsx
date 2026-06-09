import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Frame, Element, useEditor } from '@craftjs/core';
import type { NodeTree } from '@craftjs/core';
import {
  ContainerBlock,
  HeroBlock,
  TextBlock,
  StatsBlock,
  SpacerBlock,
} from '../blocks/ProquelecBlocks';
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  Clipboard,
  Paintbrush,
  RefreshCw,
  Layers,
  Save,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { BuilderErrorBoundary } from './BuilderErrorBoundary';
import { useBuilderUiStore } from '@/stores/builder-ui.store';
import { useGlobalBlocksStore } from '@/stores/global-blocks.store';
import { useAnimateOnScroll } from '@/hooks/useAnimateOnScroll';
import { cloneNodeTreeWithNewIds } from './cloneNodeTree.ts';
import { useGodEditor } from './GodEditorContext';
import { buildAnimationRuntimeCss } from '@/components/blocks/animationPresets';

type BuilderDevice = 'desktop' | 'tablet' | 'mobile';
type SpacingStyles = {
  top: string;
  right: string;
  bottom: string;
  left: string;
};
type CraftComponentWithDefaults = {
  craft?: {
    props?: Record<string, unknown>;
  };
};

const VIEWPORT_WIDTHS: Record<BuilderDevice, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

const ZOOM_CLASS_MAP: Record<number, string> = {
  50: 'builder-canvas-scale-50',
  75: 'builder-canvas-scale-75',
  100: 'builder-canvas-scale-100',
  125: 'builder-canvas-scale-125',
  150: 'builder-canvas-scale-150',
};

const CONTEXT_MENU_CLASS = 'builder-context-menu';
const HOVER_OUTLINE_CLASS = 'builder-hover-outline';
const SELECTED_OUTLINE_CLASS = 'builder-selected-outline';
const PADDING_TOP_CLASS = 'builder-padding-top';
const PADDING_BOTTOM_CLASS = 'builder-padding-bottom';
const PADDING_LEFT_CLASS = 'builder-padding-left';
const PADDING_RIGHT_CLASS = 'builder-padding-right';
const BUILDER_CLIPBOARD_KEY = 'proquelec_builder_clipboard';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCraftNodeTree = (value: unknown): value is NodeTree => {
  if (!isRecord(value)) return false;

  const rootNodeId = value.rootNodeId;
  const nodes = value.nodes;

  if (typeof rootNodeId !== 'string' || !isRecord(nodes)) return false;

  const rootNode = nodes[rootNodeId];
  return isRecord(rootNode) && isRecord(rootNode.data);
};

const parseBuilderClipboard = (raw: string | null): NodeTree | null => {
  const text = raw?.trim();
  if (!text || !text.startsWith('{')) return null;

  try {
    const parsed = JSON.parse(text) as unknown;
    return isCraftNodeTree(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────
// FLOATING ACTION BAR (appears above selected block)
// ─────────────────────────────────────────────────────────
const FloatingActionBar = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const selectedSet = state.events.selected;
    const id = selectedSet ? (Array.from(selectedSet)[0] as string) : null;

    if (!id || !state.nodes[id]) return { selected: null, isEnabled: state.options.enabled };

    const node = state.nodes[id];
    const parentId = node.data.parent;
    const siblings = (parentId && state.nodes[parentId]?.data?.nodes) || [];
    const myIndex = siblings.indexOf(id);

    return {
      selected: {
        id,
        name: node.data.displayName || node.data.name,
        isDeletable: query.node(id).isDeletable(),
        parentId,
        siblings,
        myIndex,
      },
      isEnabled: state.options.enabled,
    };
  });

  if (!selected || !isEnabled) return null;

  const canMoveUp = selected.myIndex > 0;
  const canMoveDown = selected.myIndex < selected.siblings.length - 1;

  const handleDuplicate = () => {
    window.dispatchEvent(new CustomEvent('god-duplicate-node', { detail: selected.id }));
  };

  const handleMoveUp = () => {
    if (!canMoveUp || !selected.parentId) return;
    actions.move(selected.id, selected.parentId, selected.myIndex - 1);
    toast.success('Bloc déplacé vers le haut');
  };

  const handleMoveDown = () => {
    if (!canMoveDown || !selected.parentId) return;
    actions.move(selected.id, selected.parentId, selected.myIndex + 2);
    toast.success('Bloc déplacé vers le bas');
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] pointer-events-none">
      {/* Selection outline & actions is managed natively or via custom menu */}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// BREADCRUMB
// ─────────────────────────────────────────────────────────
const Breadcrumb = () => {
  const { ancestors, selectedName, isEnabled } = useEditor((state, query) => {
    const selectedSet = state.events.selected;
    const id = selectedSet ? (Array.from(selectedSet)[0] as string) : null;

    if (!id || !state.nodes[id])
      return { ancestors: [], selectedName: null, isEnabled: state.options.enabled };

    const ancestors: { id: string; name: string }[] = [];
    let currentId: string | null = state.nodes[id]?.data?.parent || null;
    while (currentId && state.nodes[currentId]) {
      const node = state.nodes[currentId];
      ancestors.unshift({ id: currentId, name: node.data.displayName || node.data.name });
      currentId = node.data.parent || null;
    }

    return {
      ancestors,
      selectedName: state.nodes[id]?.data?.displayName || state.nodes[id]?.data?.name,
      isEnabled: state.options.enabled,
    };
  });

  if (!selectedName || !isEnabled) return null;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-[#12121f]/95 backdrop-blur border border-[#252538] rounded-full px-3 py-1.5 text-[11px] shadow-xl">
      <span className="text-slate-500">Page</span>
      {ancestors.map((a) => (
        <React.Fragment key={a.id}>
          <span className="text-slate-600">›</span>
          <span className="text-slate-400">{a.name}</span>
        </React.Fragment>
      ))}
      <span className="text-slate-600">›</span>
      <span className="text-indigo-400 font-semibold">{selectedName}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// EMPTY CANVAS PLACEHOLDER
// ─────────────────────────────────────────────────────────
const EmptyCanvasHint = () => {
  const { isEmpty, isEnabled } = useEditor((state, query) => {
    const rootNodes = state.nodes['ROOT']?.data?.nodes || [];
    return {
      isEmpty: rootNodes.length === 0,
      isEnabled: state.options.enabled,
    };
  });

  if (!isEmpty || !isEnabled) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center space-y-3 p-8">
        <div className="text-5xl animate-bounce">🎨</div>
        <p className="text-slate-400 font-semibold">Page vide</p>
        <p className="text-slate-500 text-sm max-w-xs">
          Glissez des blocs depuis le panneau de gauche pour construire votre page
        </p>
      </div>
    </div>
  );
};

export const CanvasOverlays = () => {
  const hoveredNodeId = useBuilderUiStore((s) => s.hoveredNodeId);
  const { selectedNodeId, query, isEnabled } = useEditor((state) => {
    const selectedSet = state.events.selected;
    const id = selectedSet ? (Array.from(selectedSet)[0] as string) : null;
    return {
      selectedNodeId: id,
      isEnabled: state.options.enabled,
    };
  });

  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null);
  const [hoverName, setHoverName] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [paddingStyles, setPaddingStyles] = useState<SpacingStyles | null>(null);
  const [marginStyles, setMarginStyles] = useState<SpacingStyles | null>(null);

  const updateRects = useCallback(() => {
    if (!isEnabled) {
      setHoverRect(null);
      setSelectedRect(null);
      return;
    }

    let nextHoverRect: DOMRect | null = null;
    let nextSelectedRect: DOMRect | null = null;

    if (hoveredNodeId && hoveredNodeId !== 'ROOT') {
      const dom = query.node(hoveredNodeId).get().dom;
      if (dom) {
        nextHoverRect = dom.getBoundingClientRect();
        const node = query.node(hoveredNodeId).get();
        setHoverName(node.data.displayName || node.data.name);
      }
    }

    if (selectedNodeId && selectedNodeId !== 'ROOT') {
      const dom = query.node(selectedNodeId).get().dom;
      if (dom) {
        nextSelectedRect = dom.getBoundingClientRect();
        const node = query.node(selectedNodeId).get();
        setSelectedName(node.data.displayName || node.data.name);

        // Extract padding / margin computed values for visual guidelines
        const style = window.getComputedStyle(dom);
        setPaddingStyles({
          top: style.paddingTop,
          right: style.paddingRight,
          bottom: style.paddingBottom,
          left: style.paddingLeft,
        });
        setMarginStyles({
          top: style.marginTop,
          right: style.marginRight,
          bottom: style.marginBottom,
          left: style.marginLeft,
        });
      }
    }

    setHoverRect(nextHoverRect);
    setSelectedRect(nextSelectedRect);
  }, [hoveredNodeId, selectedNodeId, query, isEnabled]);

  // Batch updates using requestAnimationFrame
  useEffect(() => {
    let active = true;
    const tick = () => {
      if (!active) return;
      updateRects();
      requestAnimationFrame(tick);
    };

    // Trigger on scroll or resize
    window.addEventListener('scroll', updateRects, true);
    window.addEventListener('resize', updateRects);

    requestAnimationFrame(tick);

    return () => {
      active = false;
      window.removeEventListener('scroll', updateRects, true);
      window.removeEventListener('resize', updateRects);
    };
  }, [updateRects]);

  const overlayStyles = useMemo(() => {
    let css = '';

    if (hoverRect) {
      css += `.${HOVER_OUTLINE_CLASS}{top:${hoverRect.top}px;left:${hoverRect.left}px;width:${hoverRect.width}px;height:${hoverRect.height}px;}`;
    }

    if (selectedRect) {
      css += `.${SELECTED_OUTLINE_CLASS}{top:${selectedRect.top}px;left:${selectedRect.left}px;width:${selectedRect.width}px;height:${selectedRect.height}px;}`;
    }

    if (paddingStyles) {
      css += `.${PADDING_TOP_CLASS}{height:${paddingStyles.top};}`;
      css += `.${PADDING_BOTTOM_CLASS}{height:${paddingStyles.bottom};}`;
      css += `.${PADDING_LEFT_CLASS}{width:${paddingStyles.left};}`;
      css += `.${PADDING_RIGHT_CLASS}{width:${paddingStyles.right};}`;
    }

    return css;
  }, [hoverRect, selectedRect, paddingStyles]);

  if (!isEnabled) return null;

  return createPortal(
    <>
      <style>{overlayStyles}</style>
      <div className="pointer-events-none fixed inset-0 z-[999999]">
        {/* Hover Outline */}
        {hoverRect && hoveredNodeId !== selectedNodeId && (
          <div
            className={`absolute border border-sky-400 bg-sky-400/5 transition-all duration-75 ${HOVER_OUTLINE_CLASS}`}
          >
            <div className="absolute -top-5 left-0 bg-sky-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
              <span>{hoverName}</span>
              <span className="opacity-75">
                {Math.round(hoverRect.width)} x {Math.round(hoverRect.height)}
              </span>
            </div>
          </div>
        )}

        {/* Selected Outline & Spacing Guides */}
        {selectedRect && (
          <div
            className={`absolute border-2 border-indigo-500 transition-all duration-75 ${SELECTED_OUTLINE_CLASS}`}
          >
            <div className="absolute -top-5.5 left-0 bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1.5">
              <span>{selectedName}</span>
              <span className="opacity-75">
                {Math.round(selectedRect.width)} x {Math.round(selectedRect.height)}
              </span>
            </div>

            {/* Padding Visualizer (Inside) */}
            {paddingStyles && (
              <div className="absolute inset-0 border border-emerald-400/30 bg-emerald-400/5 pointer-events-none">
                {/* Padding Indicators */}
                <div
                  className={`absolute top-0 left-0 right-0 bg-emerald-400/10 ${PADDING_TOP_CLASS}`}
                />
                <div
                  className={`absolute bottom-0 left-0 right-0 bg-emerald-400/10 ${PADDING_BOTTOM_CLASS}`}
                />
                <div
                  className={`absolute top-0 bottom-0 left-0 bg-emerald-400/10 ${PADDING_LEFT_CLASS}`}
                />
                <div
                  className={`absolute top-0 bottom-0 right-0 bg-emerald-400/10 ${PADDING_RIGHT_CLASS}`}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>,
    document.body,
  );
};

// ─────────────────────────────────────────────────────────
// MAIN CANVAS
// ─────────────────────────────────────────────────────────
export const GodCanvas = () => {
  const [device, setDevice] = useState<BuilderDevice>('desktop');
  const [zoom, setZoom] = useState(100);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
    nodeName: string;
  } | null>(null);

  const { isEnabled, actions, query } = useEditor((state) => ({
    isEnabled: state.options.enabled,
  }));

  const { initialStructure, markCanvasHydrated } = useGodEditor();
  const { setHoveredNodeId, hoveredNodeId } = useBuilderUiStore();

  const canvasRef = useRef<HTMLDivElement | null>(null);
  useAnimateOnScroll(canvasRef, { threshold: 0.1, once: true });

  useEffect(() => {
    if (!initialStructure) return;

    const timer = window.setTimeout(() => {
      try {
        markCanvasHydrated(query.serialize());
      } catch {
        markCanvasHydrated();
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialStructure, markCanvasHydrated, query]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isEnabled) return;
    const target = e.target as HTMLElement;
    const allNodeIds = Object.keys(query.getSerializedNodes());
    let hoveredId: string | null = null;
    let deepestDepth = -1;

    for (const id of allNodeIds) {
      const dom = query.node(id).get().dom;
      if (dom && dom.contains(target)) {
        const depth = query.node(id).ancestors().length;
        if (depth > deepestDepth && id !== 'ROOT') {
          deepestDepth = depth;
          hoveredId = id;
        }
      }
    }

    if (hoveredId !== hoveredNodeId) {
      setHoveredNodeId(hoveredId);
    }
  };

  useEffect(() => {
    const handler = (event: Event) => {
      const nextDevice = (event as CustomEvent<BuilderDevice>).detail;
      if (nextDevice in VIEWPORT_WIDTHS) {
        setDevice(nextDevice);
      }
    };
    window.addEventListener('god-viewport-change', handler);
    return () => window.removeEventListener('god-viewport-change', handler);
  }, []);

  // Close context menu on left click anywhere
  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  // Synchronize lockedNodes & hiddenNodes from Zustand to canvas DOM attributes
  const { lockedNodes, hiddenNodes } = useBuilderUiStore();
  useEffect(() => {
    if (!isEnabled) return;
    const allNodeIds = Object.keys(query.getSerializedNodes());
    allNodeIds.forEach((id) => {
      try {
        const dom = query.node(id).get().dom;
        if (dom) {
          dom.setAttribute('data-locked', lockedNodes[id] ? 'true' : 'false');
          dom.setAttribute('data-hidden', hiddenNodes[id] ? 'true' : 'false');
        }
      } catch {
        // Node may disappear while Craft is reconciling the canvas tree.
      }
    });
  }, [lockedNodes, hiddenNodes, query, isEnabled]);

  const deviceLabel = {
    desktop: '🖥️ Desktop',
    tablet: '📱 Tablet — 768px',
    mobile: '📱 Mobile — 390px',
  }[device];

  // ─────────────────────────────────────────────────────────
  // CONTEXT MENU HANDLERS
  // ─────────────────────────────────────────────────────────
  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isEnabled) return;
    e.preventDefault();

    const target = e.target as HTMLElement;
    const allNodeIds = Object.keys(query.getSerializedNodes());
    let clickedNodeId: string | null = null;
    let deepestDepth = -1;

    // Find deepest node DOM element containing the target
    for (const id of allNodeIds) {
      const node = query.node(id).get();
      if (node.dom && node.dom.contains(target)) {
        const depth = query.node(id).ancestors().length;
        if (depth > deepestDepth && id !== 'ROOT') {
          deepestDepth = depth;
          clickedNodeId = id;
        }
      }
    }

    if (!clickedNodeId) {
      clickedNodeId = 'ROOT';
    }

    // Select the clicked node
    actions.selectNode(clickedNodeId);

    const nodeName =
      query.node(clickedNodeId).get().data.displayName || query.node(clickedNodeId).get().data.name;

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId: clickedNodeId,
      nodeName,
    });
  };

  const isNodeLocked = useCallback(
    (id: string): boolean => {
      let currentId: string | null = id;
      while (currentId) {
        if (useBuilderUiStore.getState().lockedNodes[currentId]) return true;
        try {
          const node = query.node(currentId).get();
          currentId = node?.data?.parent || null;
        } catch (e) {
          break;
        }
      }
      return false;
    },
    [query],
  );

  const handleCopy = async (id: string) => {
    try {
      const tree = query.node(id).toNodeTree();
      const json = JSON.stringify(tree);
      localStorage.setItem(BUILDER_CLIPBOARD_KEY, json);
      // Also copy to system clipboard for external use
      try {
        await navigator.clipboard.writeText(json);
      } catch (_) {
        /* Permission denied — ignore */
      }
      toast.success(
        `Bloc "${query.node(id).get().data.displayName || query.node(id).get().data.name}" copié`,
      );
    } catch (err) {
      toast.error('Erreur lors de la copie du bloc');
    }
  };

  const handlePaste = async (parentId: string) => {
    if (isNodeLocked(parentId)) {
      toast.error('Conteneur verrouillé : action impossible');
      return;
    }

    let clipboard = localStorage.getItem(BUILDER_CLIPBOARD_KEY);
    let tree = parseBuilderClipboard(clipboard);

    if (clipboard && !tree) {
      localStorage.removeItem(BUILDER_CLIPBOARD_KEY);
      clipboard = null;
    }

    // Fallback: try reading from system clipboard
    if (!tree) {
      try {
        clipboard = await navigator.clipboard.readText();
        tree = parseBuilderClipboard(clipboard);
        if (tree && clipboard) {
          localStorage.setItem(BUILDER_CLIPBOARD_KEY, clipboard);
        }
      } catch (_) {
        /* Permission denied or empty */
      }
    }

    if (!clipboard) {
      toast.error('Le presse-papier est vide');
      return;
    }

    if (!tree) {
      toast.error('Le presse-papier ne contient pas un bloc Builder valide');
      return;
    }

    try {
      const newTree = cloneNodeTreeWithNewIds(tree, 'paste');

      const targetNode = query.node(parentId).get();
      let resolvedParentId = parentId;
      let resolvedIndex = undefined;

      // If pasting on a leaf block, paste as sibling
      if (
        parentId !== 'ROOT' &&
        targetNode.data.name !== 'ContainerBlock' &&
        targetNode.data.name !== 'ColumnsBlock'
      ) {
        resolvedParentId = targetNode.data.parent || 'ROOT';
        if (isNodeLocked(resolvedParentId)) {
          toast.error('Conteneur parent verrouillé : action impossible');
          return;
        }
        const siblings = query.node(resolvedParentId).childNodes();
        resolvedIndex = siblings.indexOf(parentId) + 1;
      }

      actions.addNodeTree(newTree, resolvedParentId, resolvedIndex);
      toast.success('Bloc collé avec succès');
    } catch (err) {
      console.error(err);
      toast.error('Impossible de coller le bloc');
    }
  };

  const handlePasteStyle = (targetId: string) => {
    if (isNodeLocked(targetId)) {
      toast.error('Bloc verrouillé : action impossible');
      return;
    }
    const clipboard = localStorage.getItem(BUILDER_CLIPBOARD_KEY);
    if (!clipboard) {
      toast.error('Presse-papier vide');
      return;
    }
    const tree = parseBuilderClipboard(clipboard);
    if (!tree) {
      localStorage.removeItem(BUILDER_CLIPBOARD_KEY);
      toast.error('Le presse-papier ne contient pas un bloc Builder valide');
      return;
    }
    try {
      const sourceProps = tree.nodes[tree.rootNodeId].data.props ?? {};
      const styleKeys = [
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'borderWidth',
        'borderColor',
        'borderStyle',
        'borderRadius',
        'opacity',
        'boxShadow',
        'zIndex',
        'customInlineCss',
        'extraClasses',
      ];

      actions.setProp(targetId, (props: Record<string, unknown>) => {
        styleKeys.forEach((key) => {
          if (sourceProps[key] !== undefined) {
            props[key] = JSON.parse(JSON.stringify(sourceProps[key]));
          }
        });
      });
      toast.success('Style collé uniquement');
    } catch (err) {
      toast.error('Impossible de coller les styles');
    }
  };

  const handleDuplicate = useCallback(
    (id: string) => {
      if (id === 'ROOT') return;
      if (isNodeLocked(id)) {
        toast.error('Bloc verrouillé : action impossible');
        return;
      }
      try {
        const node = query.node(id).get();
        const parentId = node.data.parent || 'ROOT';
        if (isNodeLocked(parentId)) {
          toast.error('Conteneur parent verrouillé : action impossible');
          return;
        }
        const siblings = query.node(parentId).childNodes();
        const index = siblings.indexOf(id) + 1;

        const tree = query.node(id).toNodeTree();
        const newTree = cloneNodeTreeWithNewIds(tree, 'dup');
        actions.addNodeTree(newTree, parentId, index);
        actions.selectNode(newTree.rootNodeId);

        toast.success('Bloc dupliqué avec succès');
      } catch (err) {
        console.error('Duplicate error:', err);
        toast.error('Erreur lors de la duplication');
      }
    },
    [actions, isNodeLocked, query],
  );

  // Duplicate custom event listener
  useEffect(() => {
    const handleDuplicateCustom = (event: Event) => {
      const nodeId = (event as CustomEvent<string>).detail;
      if (nodeId) handleDuplicate(nodeId);
    };
    window.addEventListener('god-duplicate-node', handleDuplicateCustom);
    return () => window.removeEventListener('god-duplicate-node', handleDuplicateCustom);
  }, [handleDuplicate]);

  const handleResetStyle = (id: string) => {
    if (isNodeLocked(id)) {
      toast.error('Bloc verrouillé : action impossible');
      return;
    }
    try {
      const styleKeys = [
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'borderWidth',
        'borderColor',
        'borderStyle',
        'borderRadius',
        'opacity',
        'boxShadow',
        'zIndex',
        'customInlineCss',
        'extraClasses',
      ];

      actions.setProp(id, (props: Record<string, unknown>) => {
        styleKeys.forEach((key) => {
          delete props[key];
        });
      });
      toast.success('Style réinitialisé');
    } catch (err) {
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  const handleResetBlock = (id: string) => {
    if (isNodeLocked(id)) {
      toast.error('Bloc verrouillé : action impossible');
      return;
    }
    try {
      const node = query.node(id).get();
      const ComponentType = node.data.type as CraftComponentWithDefaults | undefined;
      const defaultProps: Record<string, unknown> = ComponentType?.craft?.props || {};

      actions.setProp(id, (props: Record<string, unknown>) => {
        // Remet chaque prop à sa valeur par défaut
        Object.entries(defaultProps).forEach(([key, value]) => {
          props[key] = JSON.parse(JSON.stringify(value));
        });
        // Supprime les props qui ne sont pas dans les valeurs par défaut
        Object.keys(props).forEach((key) => {
          if (!(key in defaultProps)) {
            delete props[key];
          }
        });
      });

      const displayName = node.data.displayName || node.data.name || 'Bloc';
      toast.success(`"${displayName}" réinitialisé aux valeurs par défaut`);
    } catch (err) {
      console.error('ResetBlock error:', err);
      toast.error('Erreur lors de la réinitialisation du bloc');
    }
  };

  const handleMoveUp = (id: string) => {
    if (isNodeLocked(id)) {
      toast.error('Bloc verrouillé : action impossible');
      return;
    }
    const parentId = query.node(id).get().data.parent;
    if (!parentId) return;
    if (isNodeLocked(parentId)) {
      toast.error('Conteneur parent verrouillé : action impossible');
      return;
    }
    const siblings = query.node(parentId).childNodes();
    const idx = siblings.indexOf(id);
    if (idx > 0) {
      actions.move(id, parentId, idx - 1);
      toast.success('Bloc déplacé vers le haut');
    }
  };

  const handleMoveDown = (id: string) => {
    if (isNodeLocked(id)) {
      toast.error('Bloc verrouillé : action impossible');
      return;
    }
    const parentId = query.node(id).get().data.parent;
    if (!parentId) return;
    if (isNodeLocked(parentId)) {
      toast.error('Conteneur parent verrouillé : action impossible');
      return;
    }
    const siblings = query.node(parentId).childNodes();
    const idx = siblings.indexOf(id);
    if (idx < siblings.length - 1) {
      actions.move(id, parentId, idx + 2);
      toast.success('Bloc déplacé vers le bas');
    }
  };

  const handleSaveAsTemplate = async (id: string) => {
    try {
      const name = window.prompt('Nom du modèle :');
      if (!name) return;

      const tree = query.node(id).toNodeTree();
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/page-components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          name,
          category: 'Mes Modèles',
          default_structure: JSON.stringify(tree),
          thumbnail_url: null,
          is_global: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur réseau lors de la sauvegarde');
      }

      await response.json();
      toast.success(`Modèle "${name}" enregistré avec succès !`);
      window.dispatchEvent(new CustomEvent('god-templates-updated'));
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde du modèle');
    }
  };

  const handleSaveAsGlobal = (id: string) => {
    try {
      const name = window.prompt('Nom du bloc global :');
      if (!name) return;

      const tree = query.node(id).toNodeTree();
      const addBlock = useGlobalBlocksStore.getState().addBlock;
      addBlock({ name, serializedNode: tree, category: 'Général' });
      toast.success(`Bloc global "${name}" enregistré !`);
      window.dispatchEvent(new CustomEvent('god-global-blocks-updated'));
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde du bloc global');
    }
  };

  return (
    <div className="flex-1 bg-[#0a0a15] overflow-auto custom-scrollbar flex flex-col relative">
      {/* Top bar: device info + zoom */}
      <div className="sticky top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-[#0a0a15]/95 backdrop-blur border-b border-[#1a1a2a]">
        <span className="text-[11px] text-slate-500 font-mono">{deviceLabel}</span>

        <div className="flex items-center gap-2">
          {!isEnabled && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Eye size={10} /> MODE APERÇU
            </span>
          )}

          {/* Device presets */}
          <div className="flex items-center gap-1 border-r border-[#1a1a2a] pr-2">
            <button
              onClick={() => {
                setDevice('desktop');
                document.documentElement.style.removeProperty('--builder-viewport-width');
              }}
              className={`px-2 py-1 rounded text-[10px] font-medium transition ${device === 'desktop' ? 'bg-blue-600 text-white' : 'bg-[#1a1a2a] text-slate-400 hover:text-white'}`}
              title="Desktop (100%)"
            >
              🖥
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`px-2 py-1 rounded text-[10px] font-medium transition ${device === 'tablet' ? 'bg-blue-600 text-white' : 'bg-[#1a1a2a] text-slate-400 hover:text-white'}`}
              title="Tablette (768px)"
            >
              📱
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`px-2 py-1 rounded text-[10px] font-medium transition ${device === 'mobile' ? 'bg-blue-600 text-white' : 'bg-[#1a1a2a] text-slate-400 hover:text-white'}`}
              title="Mobile (390px)"
            >
              📲
            </button>
          </div>

          {/* Custom width input */}
          <div className="flex items-center gap-1 border-r border-[#1a1a2a] pr-2">
            <GripVertical size={12} className="text-slate-600 shrink-0" />
            <input
              type="number"
              value={
                device === 'desktop'
                  ? ''
                  : parseInt(String(VIEWPORT_WIDTHS[device] || '390').replace('px', ''))
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  setDevice(device === 'mobile' || device === 'tablet' ? device : 'mobile');
                  document.documentElement.style.setProperty(
                    '--builder-viewport-width',
                    val + 'px',
                  );
                }
              }}
              disabled={device === 'desktop'}
              className="w-14 h-6 bg-[#1a1a2a] border border-[#252538] rounded text-[10px] text-slate-300 text-center px-1 outline-none focus:border-blue-500"
              placeholder="px"
            />
            <span className="text-[9px] text-slate-600">px</span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#151521] border border-[#252538] rounded-lg px-2 py-1">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 25))}
              className="text-slate-400 hover:text-white text-xs w-4 text-center transition-colors"
              aria-label="Réduire le zoom du canvas"
              title="Zoom out"
            >
              −
            </button>
            <span className="text-[11px] text-slate-400 font-mono w-10 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 25))}
              className="text-slate-400 hover:text-white text-xs w-4 text-center transition-colors"
              aria-label="Augmenter le zoom du canvas"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => setZoom(100)}
              className="text-slate-500 hover:text-white text-[10px] ml-1 transition-colors"
              aria-label="Réinitialiser le zoom du canvas"
              title="Reset zoom"
            >
              ↺
            </button>
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div
        className="flex-1 p-6 flex justify-center min-h-full relative"
        onContextMenu={handleContextMenu}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNodeId(null)}
      >
        <div data-viewport={device} className="canvas-viewport-wrapper">
          <div
            ref={canvasRef}
            data-builder-canvas
            className={`relative bg-white shadow-2xl shadow-black/40 transition-all duration-300 ease-out build-canvas-wrapper ${ZOOM_CLASS_MAP[zoom] ?? ''} ${isEnabled ? 'builder-canvas-enabled' : 'builder-canvas-disabled'}`}
          >
            <BuilderErrorBoundary>
              <Frame
                key={initialStructure ? 'loaded-page-structure' : 'fallback-default-structure'}
                data={initialStructure || undefined}
              >
                {!initialStructure && (
                  <Element
                    is={ContainerBlock}
                    canvas
                    padding={0}
                    backgroundColor="#ffffff"
                    maxWidth="100%"
                  >
                    <Element is={HeroBlock} canvas />
                    <Element
                      is={ContainerBlock}
                      canvas
                      padding={60}
                      paddingY={60}
                      backgroundColor="#f8fafc"
                    >
                      <TextBlock
                        text="🚀 GOD MODE — ÉDITEUR CENTRALISÉ"
                        fontSize={28}
                        textAlign="center"
                        color="#0f172a"
                        fontWeight="900"
                      />
                      <SpacerBlock height={16} />
                      <TextBlock
                        text="Glissez des blocs depuis la barre de gauche. Cliquez pour éditer leurs propriétés dans le panneau de droite."
                        fontSize={16}
                        textAlign="center"
                        color="#64748b"
                      />
                    </Element>
                    <Element is={StatsBlock} canvas />
                  </Element>
                )}
              </Frame>
            </BuilderErrorBoundary>

            <EmptyCanvasHint />
          </div>
        </div>
      </div>

      {/* Breadcrumb overlay */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none flex justify-center pb-4">
        <Breadcrumb />
      </div>

      {/* Floating Action Bar */}
      <FloatingActionBar />

      {/* Sleek Context Menu */}
      {contextMenu && (
        <>
          <style>{`.${CONTEXT_MENU_CLASS}{top:${contextMenu.y}px;left:${contextMenu.x}px;}`}</style>
          <div
            className={`fixed z-[99999] bg-[#0c0c14]/90 backdrop-blur-md border border-[#252538] rounded-xl p-1.5 shadow-2xl w-52 text-left animate-in fade-in zoom-in-95 duration-100 ${CONTEXT_MENU_CLASS}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-2.5 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider border-b border-[#252538] mb-1 flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5 truncate">
                <Layers size={10} className="text-indigo-400 shrink-0" />
                {contextMenu.nodeName}
              </span>
              {isNodeLocked(contextMenu.nodeId) && (
                <span className="text-red-400 text-[8px] font-bold bg-red-500/10 px-1 py-0.5 rounded border border-red-500/25 uppercase shrink-0">
                  🔒 Verrouillé
                </span>
              )}
            </div>

            {/* Action List */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  handleCopy(contextMenu.nodeId);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
              >
                <Copy size={13} className="text-indigo-400 shrink-0" />
                Copier
              </button>
              <button
                onClick={() => {
                  handlePaste(contextMenu.nodeId);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
              >
                <Clipboard size={13} className="text-emerald-400 shrink-0" />
                Coller
              </button>
              <button
                onClick={() => {
                  handlePasteStyle(contextMenu.nodeId);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
              >
                <Paintbrush size={13} className="text-amber-400 shrink-0" />
                Coller le style uniquement
              </button>

              {contextMenu.nodeId !== 'ROOT' && (
                <>
                  <div className="h-px bg-[#252538] my-1" />
                  <button
                    onClick={() => {
                      handleSaveAsTemplate(contextMenu.nodeId);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                  >
                    <Layers size={13} className="text-amber-400 shrink-0" />
                    Enregistrer comme modèle
                  </button>
                  <button
                    onClick={() => {
                      handleSaveAsGlobal(contextMenu.nodeId);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                  >
                    <Save size={13} className="text-emerald-400 shrink-0" />
                    Enregistrer comme Global
                  </button>
                  <button
                    onClick={() => {
                      handleDuplicate(contextMenu.nodeId);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                  >
                    <Copy size={13} className="text-sky-400 shrink-0" />
                    Dupliquer
                  </button>
                  <button
                    onClick={() => {
                      handleMoveUp(contextMenu.nodeId);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                  >
                    <ChevronUp size={13} className="text-slate-400 shrink-0" />
                    Déplacer vers le haut
                  </button>
                  <button
                    onClick={() => {
                      handleMoveDown(contextMenu.nodeId);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                  >
                    <ChevronDown size={13} className="text-slate-400 shrink-0" />
                    Déplacer vers le bas
                  </button>

                  <div className="h-px bg-[#252538] my-1" />
                  <button
                    onClick={() => {
                      handleResetStyle(contextMenu.nodeId);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                  >
                    <RefreshCw size={13} className="text-yellow-500 shrink-0" />
                    Réinitialiser le style
                  </button>
                  <button
                    onClick={() => {
                      handleResetBlock(contextMenu.nodeId);
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                  >
                    <RefreshCw size={13} className="text-red-400 shrink-0" />
                    Réinitialiser le bloc
                  </button>
                  <button
                    onClick={() => {
                      if (isNodeLocked(contextMenu.nodeId)) {
                        toast.error('Bloc verrouillé : action impossible');
                        return;
                      }
                      actions.delete(contextMenu.nodeId);
                      setContextMenu(null);
                      toast.success('Bloc supprimé');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 text-xs transition-colors font-semibold"
                  >
                    <Trash2 size={13} className="text-rose-500 shrink-0" />
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
      {/* Visual Canvas Overlays (Hover Outlines & Spacing Guides) */}
      <CanvasOverlays />

      <style>{`
        /* Responsive viewport simulation - maps data-viewport to override real @media queries */
        .canvas-viewport-wrapper {
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .canvas-viewport-wrapper[data-viewport="mobile"] {
          width: var(--builder-viewport-width, 390px);
        }
        .canvas-viewport-wrapper[data-viewport="tablet"] {
          width: var(--builder-viewport-width, 768px);
        }
        .canvas-viewport-wrapper[data-viewport="desktop"] {
          width: 100%;
        }

        /* Responsive breakpoint simulation - these override the real @media queries */
        /* Mobile viewport: force mobile CSS vars */
        .canvas-viewport-wrapper[data-viewport="mobile"] .proquelec-builder-node {
          margin-top: var(--mobile-margin-top, var(--desktop-margin-top, 0px)) !important;
          margin-right: var(--mobile-margin-right, var(--desktop-margin-right, 0px)) !important;
          margin-bottom: var(--mobile-margin-bottom, var(--desktop-margin-bottom, 0px)) !important;
          margin-left: var(--mobile-margin-left, var(--desktop-margin-left, 0px)) !important;
          padding-top: var(--mobile-padding-top, var(--desktop-padding-top, 0px)) !important;
          padding-right: var(--mobile-padding-right, var(--desktop-padding-right, 0px)) !important;
          padding-bottom: var(--mobile-padding-bottom, var(--desktop-padding-bottom, 0px)) !important;
          padding-left: var(--mobile-padding-left, var(--desktop-padding-left, 0px)) !important;
          font-size: var(--mobile-font-size, var(--desktop-font-size, inherit)) !important;
          text-align: var(--mobile-text-align, var(--desktop-text-align, inherit)) !important;
          display: var(--mobile-display, var(--desktop-display, block)) !important;
          flex-direction: var(--mobile-flex-direction, var(--desktop-flex-direction, row)) !important;
          flex-wrap: var(--mobile-flex-wrap, var(--desktop-flex-wrap, nowrap)) !important;
          justify-content: var(--mobile-justify-content, var(--desktop-justify-content, flex-start)) !important;
          align-items: var(--mobile-align-items, var(--desktop-align-items, stretch)) !important;
          gap: var(--mobile-gap, var(--desktop-gap, 0px)) !important;
          flex-grow: var(--mobile-flex-grow, var(--desktop-flex-grow, 0)) !important;
          flex-shrink: var(--mobile-flex-shrink, var(--desktop-flex-shrink, 1)) !important;
          flex-basis: var(--mobile-flex-basis, var(--desktop-flex-basis, auto)) !important;
          order: var(--mobile-order, var(--desktop-order, 0)) !important;
          align-self: var(--mobile-align-self, var(--desktop-align-self, auto)) !important;
          grid-template-columns: var(--mobile-grid-template-columns, var(--desktop-grid-template-columns, none)) !important;
          grid-template-rows: var(--mobile-grid-template-rows, var(--desktop-grid-template-rows, none)) !important;
          place-items: var(--mobile-place-items, var(--desktop-place-items, stretch)) !important;
        }

        /* Tablet viewport: force tablet CSS vars */
        .canvas-viewport-wrapper[data-viewport="tablet"] .proquelec-builder-node {
          margin-top: var(--tablet-margin-top, var(--desktop-margin-top, 0px)) !important;
          margin-right: var(--tablet-margin-right, var(--desktop-margin-right, 0px)) !important;
          margin-bottom: var(--tablet-margin-bottom, var(--desktop-margin-bottom, 0px)) !important;
          margin-left: var(--tablet-margin-left, var(--desktop-margin-left, 0px)) !important;
          padding-top: var(--tablet-padding-top, var(--desktop-padding-top, 0px)) !important;
          padding-right: var(--tablet-padding-right, var(--desktop-padding-right, 0px)) !important;
          padding-bottom: var(--tablet-padding-bottom, var(--desktop-padding-bottom, 0px)) !important;
          padding-left: var(--tablet-padding-left, var(--desktop-padding-left, 0px)) !important;
          font-size: var(--tablet-font-size, var(--desktop-font-size, inherit)) !important;
          text-align: var(--tablet-text-align, var(--desktop-text-align, inherit)) !important;
          display: var(--tablet-display, var(--desktop-display, block)) !important;
          flex-direction: var(--tablet-flex-direction, var(--desktop-flex-direction, row)) !important;
          flex-wrap: var(--tablet-flex-wrap, var(--desktop-flex-wrap, nowrap)) !important;
          justify-content: var(--tablet-justify-content, var(--desktop-justify-content, flex-start)) !important;
          align-items: var(--tablet-align-items, var(--desktop-align-items, stretch)) !important;
          gap: var(--tablet-gap, var(--desktop-gap, 0px)) !important;
          flex-grow: var(--tablet-flex-grow, var(--desktop-flex-grow, 0)) !important;
          flex-shrink: var(--tablet-flex-shrink, var(--desktop-flex-shrink, 1)) !important;
          flex-basis: var(--tablet-flex-basis, var(--desktop-flex-basis, auto)) !important;
          order: var(--tablet-order, var(--desktop-order, 0)) !important;
          align-self: var(--tablet-align-self, var(--desktop-align-self, auto)) !important;
          grid-template-columns: var(--tablet-grid-template-columns, var(--desktop-grid-template-columns, none)) !important;
          grid-template-rows: var(--tablet-grid-template-rows, var(--desktop-grid-template-rows, none)) !important;
          place-items: var(--tablet-place-items, var(--desktop-place-items, stretch)) !important;
        }

        /* Hide responsive-only elements based on viewport mode */
        .canvas-viewport-wrapper[data-viewport="desktop"] .responsive-only-mobile,
        .canvas-viewport-wrapper[data-viewport="desktop"] .responsive-only-tablet { display: none !important; }
        .canvas-viewport-wrapper[data-viewport="tablet"] .responsive-only-desktop,
        .canvas-viewport-wrapper[data-viewport="tablet"] .responsive-only-mobile { display: none !important; }
        .canvas-viewport-wrapper[data-viewport="mobile"] .responsive-only-desktop,
        .canvas-viewport-wrapper[data-viewport="mobile"] .responsive-only-tablet { display: none !important; }

        /* Visibility classes work in builder too */
        .canvas-viewport-wrapper[data-viewport="desktop"] .hide-desktop { display: none !important; }
        .canvas-viewport-wrapper[data-viewport="tablet"] .hide-tablet { display: none !important; }
        .canvas-viewport-wrapper[data-viewport="mobile"] .hide-mobile { display: none !important; }
        .canvas-viewport-wrapper[data-viewport="mobile"] .reverse-mobile { flex-direction: column-reverse !important; }

        .build-canvas-wrapper {
          width: 100%;
          min-height: 900px;
          transform-origin: top center;
        }
        .builder-canvas-enabled {
          outline: 1px solid rgba(99,102,241,0.15);
        }
        .builder-canvas-disabled {
          outline: none;
        }
        .builder-canvas-scale-50 { transform: scale(0.5); margin-bottom: -450px; }
        .builder-canvas-scale-75 { transform: scale(0.75); margin-bottom: -225px; }
        .builder-canvas-scale-100 { transform: scale(1); margin-bottom: 0; }
        .builder-canvas-scale-125 { transform: scale(1.25); margin-bottom: 0; }
        .builder-canvas-scale-150 { transform: scale(1.5); margin-bottom: 0; }

        /* Style for hidden nodes inside builder canvas */
        .proquelec-builder-node[data-hidden="true"] {
          opacity: 0.35 !important;
          outline: 1px dashed #f59e0b !important;
          background-image: repeating-linear-gradient(45deg, rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.05) 10px, transparent 10px, transparent 20px) !important;
        }

        /* Style for locked nodes inside builder canvas */
        .proquelec-builder-node[data-locked="true"] {
          pointer-events: none !important;
          user-select: none !important;
        }

        ${buildAnimationRuntimeCss()}
      `}</style>
    </div>
  );
};
