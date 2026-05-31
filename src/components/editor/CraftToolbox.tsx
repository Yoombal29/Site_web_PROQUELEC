import React from 'react';
import { useEditor } from '@craftjs/core';
import { ContainerBlock } from '../blocks/ContainerBlock';
import { TextBlock } from '../blocks/TextBlock';
import { HeroBlock } from '../blocks/HeroBlock';

export const CraftToolbox = () => {
  const { connectors } = useEditor();

  return (
    <div className="w-64 bg-white border-r border-slate-200 p-4 h-full flex flex-col">
      <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b">Blocs disponibles</h3>
      <div className="flex flex-col gap-3">
        <button
          ref={(ref) => { if (ref) connectors.create(ref, <ContainerBlock />) }}
          className="p-3 border border-slate-200 rounded text-sm text-left hover:bg-slate-50 cursor-grab"
        >
          🔲 Conteneur
        </button>
        <button
          ref={(ref) => { if (ref) connectors.create(ref, <TextBlock text="Nouveau texte" />) }}
          className="p-3 border border-slate-200 rounded text-sm text-left hover:bg-slate-50 cursor-grab"
        >
          📝 Texte
        </button>
        <button
          ref={(ref) => { if (ref) connectors.create(ref, <HeroBlock />) }}
          className="p-3 border border-slate-200 rounded text-sm text-left hover:bg-slate-50 cursor-grab"
        >
          🚀 Section Hero
        </button>
      </div>
    </div>
  );
};
