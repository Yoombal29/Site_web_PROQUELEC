import React, { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { useBuilderUiStore } from '@/stores/builder-ui.store';
import { 
  ChevronDown, ChevronRight, Eye, EyeOff, Lock, Unlock, 
  Trash2, Copy, Layers, Folder, File 
} from 'lucide-react';
import { toast } from 'sonner';

export const GodLayers = () => {
  const { actions, query, selectedNodeId, nodes } = useEditor((state) => {
    const selectedSet = state.events.selected;
    const selectedNodeId = selectedSet ? Array.from(selectedSet)[0] : null;
    return {
      selectedNodeId,
      nodes: state.nodes,
    };
  });

  const { 
    lockedNodes, 
    hiddenNodes, 
    collapsedLayers, 
    toggleLockNode, 
    toggleHideNode, 
    toggleCollapseLayer,
    setHoveredNodeId 
  } = useBuilderUiStore();

  // Helper to recursively check if an ancestor is locked
  const isNodeLocked = (id: string): boolean => {
    let currentId: string | null = id;
    while (currentId) {
      if (lockedNodes[currentId]) return true;
      const node = nodes[currentId];
      currentId = node?.data?.parent || null;
    }
    return false;
  };

  // Node drop handler
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('nodeId');
    if (!draggedId || draggedId === targetId) return;

    // Prevent dropping ROOT
    if (draggedId === 'ROOT') return;

    // Prevent dragging a parent into its own child
    const isDescendant = (parent: string, child: string): boolean => {
      let curr = child;
      while (curr) {
        if (curr === parent) return true;
        const node = nodes[curr];
        curr = node?.data?.parent || '';
      }
      return false;
    };

    if (isDescendant(draggedId, targetId)) {
      toast.error('Impossible de déplacer un conteneur dans lui-même');
      return;
    }

    // Check if locked
    if (isNodeLocked(targetId) || isNodeLocked(draggedId)) {
      toast.error('Opération bloquée : un des éléments est verrouillé');
      return;
    }

    const targetNode = nodes[targetId];
    const draggedNode = nodes[draggedId];
    if (!targetNode || !draggedNode) return;

    const isContainer = targetNode.data.isCanvas || 
                        targetNode.data.displayName === 'Conteneur' || 
                        targetNode.data.name === 'ContainerBlock';

    if (isContainer) {
      // Move inside container
      actions.move(draggedId, targetId, 0);
      toast.success('Bloc déplacé dans le conteneur');
    } else {
      // Move as sibling
      const parentId = targetNode.data.parent;
      if (parentId) {
        const parentNode = nodes[parentId];
        const siblings = parentNode?.data?.nodes || [];
        const index = siblings.indexOf(targetId);
        actions.move(draggedId, parentId, index + 1);
        toast.success('Bloc réordonné');
      }
    }
  };

  // Duplicate handler with lock check
  const handleDuplicate = (id: string) => {
    if (id === 'ROOT') return;
    if (isNodeLocked(id)) {
      toast.error('Bloc verrouillé : duplication impossible');
      return;
    }
    window.dispatchEvent(new CustomEvent('god-duplicate-node', { detail: id }));
  };

  // Delete handler with lock check
  const handleDelete = (id: string) => {
    if (id === 'ROOT') return;
    if (isNodeLocked(id)) {
      toast.error('Bloc verrouillé : suppression impossible');
      return;
    }
    actions.delete(id);
    toast.success('Bloc supprimé');
  };

  // Recursive Node Row Renderer
  const NodeRow = ({ id, depth }: { id: string; depth: number }) => {
    const node = nodes[id];
    if (!node) return null;

    const isSelected = selectedNodeId === id;
    const isLocked = lockedNodes[id];
    const isParentLocked = isNodeLocked(id);
    const isHidden = hiddenNodes[id];
    const isCollapsed = collapsedLayers[id];

    // Children & Linked Nodes extraction
    const childNodes = node.data.nodes || [];
    const linkedNodes = Object.values(node.data.linkedNodes || {});
    const allChildren = [...childNodes, ...linkedNodes];
    const hasChildren = allChildren.length > 0;

    const displayName = node.data.displayName || node.data.name || 'Bloc';

    const handleSelect = (e: React.MouseEvent) => {
      e.stopPropagation();
      actions.selectNode(id);
    };

    return (
      <div className="select-none text-slate-300">
        {/* Layer Item Row */}
        <div
          draggable={id !== 'ROOT' && !isParentLocked}
          onDragStart={(e) => {
            e.dataTransfer.setData('nodeId', id);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, id)}
          onMouseEnter={() => setHoveredNodeId(id)}
          onMouseLeave={() => setHoveredNodeId(null)}
          onClick={handleSelect}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={`h-9 flex items-center justify-between border-b border-[#1e1e2f] cursor-pointer group transition-colors ${
            isSelected 
              ? 'bg-indigo-500/20 text-white font-semibold border-l-2 border-indigo-500' 
              : 'hover:bg-[#1a1a2e]/50'
          } ${isHidden ? 'opacity-40' : ''}`}
        >
          {/* Label + Expand icon */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapseLayer(id);
                }}
                className="w-4 h-4 flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors"
              >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>
            ) : (
              <div className="w-4" />
            )}

            {hasChildren ? (
              <Folder size={12} className={isSelected ? 'text-indigo-400' : 'text-slate-500'} />
            ) : (
              <File size={12} className={isSelected ? 'text-indigo-400' : 'text-slate-600'} />
            )}

            <span className="text-[11px] truncate font-mono tracking-tight">
              {displayName}
            </span>
          </div>

          {/* Quick Actions (Vis on Hover / selection) */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pr-2 shrink-0">
            {/* Toggle Hide */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleHideNode(id);
              }}
              title={isHidden ? 'Afficher' : 'Masquer'}
              className={`p-1 rounded hover:bg-[#252538] transition-colors ${isHidden ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>

            {/* Toggle Lock */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLockNode(id);
              }}
              title={isLocked ? 'Déverrouiller' : 'Verrouiller'}
              className={`p-1 rounded hover:bg-[#252538] transition-colors ${isLocked ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
            </button>

            {id !== 'ROOT' && (
              <>
                {/* Duplicate */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(id);
                  }}
                  title="Dupliquer"
                  className="p-1 rounded hover:bg-[#252538] text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <Copy size={11} />
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(id);
                  }}
                  title="Supprimer"
                  className="p-1 rounded hover:bg-[#252538] text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Children Rows */}
        {hasChildren && !isCollapsed && (
          <div className="border-l border-[#2d2d3d] ml-[14px]">
            {allChildren.map((childId) => (
              <NodeRow key={childId} id={childId} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#12121f] border-t border-[#252538] custom-scrollbar flex flex-col min-h-[220px]">
      <div className="h-10 flex items-center justify-between px-4 border-b border-[#252538] shrink-0 sticky top-0 bg-[#12121f] z-10">
        <span className="text-slate-400 font-bold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
          <Layers size={12} className="text-indigo-400" />
          Navigateur de Calques
        </span>
        <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold uppercase">
          DnD Actif
        </span>
      </div>

      <div className="p-1 overflow-y-auto flex-1">
        {nodes['ROOT'] ? (
          <NodeRow id="ROOT" depth={0} />
        ) : (
          <div className="text-slate-500 italic text-[11px] p-4 text-center">
            Initialisation du canvas...
          </div>
        )}
      </div>
    </div>
  );
};
