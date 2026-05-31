import React from 'react';
import { Frame, Element } from '@craftjs/core';
import { ContainerBlock } from '../blocks/ContainerBlock';
import { TextBlock } from '../blocks/TextBlock';
import { HeroBlock } from '../blocks/HeroBlock';

export const CraftEditorCanvas = () => {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white min-h-[800px] shadow-sm">
        {/* The Frame wraps the top-level element (the canvas) */}
        <Frame>
          <Element is={ContainerBlock} canvas padding={20} backgroundColor="#ffffff">
            <Element is={HeroBlock} canvas />
            <Element is={ContainerBlock} canvas padding={20} backgroundColor="#f8fafc">
              <TextBlock text="Bienvenue dans votre nouvel éditeur Craft.js" fontSize={24} textAlign="center" />
              <TextBlock text="Sélectionnez ce texte pour le modifier, ou glissez de nouveaux blocs depuis la barre de gauche." fontSize={16} textAlign="center" color="#64748b" />
            </Element>
          </Element>
        </Frame>
      </div>
    </div>
  );
};
