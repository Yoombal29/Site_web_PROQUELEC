import React from 'react';
import { useEditor } from '@craftjs/core';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const CraftTopbar = () => {
  const { actions, query, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const navigate = useNavigate();

  const handleSave = () => {
    const json = query.serialize();
    console.log('Saved JSON:', json);
    toast.success('Page sauvegardée avec succès !');
    // Here you would typically send `json` to your backend
  };

  return (
    <div className="w-full h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-800 font-medium text-sm"
        >
          &larr; Retour
        </button>
        <h1 className="font-bold text-lg text-slate-800">Craft.js Builder</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          disabled={!canUndo}
          onClick={() => actions.history.undo()}
          className="px-3 py-1.5 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
          title="Annuler (Ctrl+Z)"
        >
          ↩
        </button>
        <button
          disabled={!canRedo}
          onClick={() => actions.history.redo()}
          className="px-3 py-1.5 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
          title="Rétablir (Ctrl+Y)"
        >
          ↪
        </button>
        
        <div className="w-px h-6 bg-slate-200 mx-2" />
        
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium shadow-sm"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
};
