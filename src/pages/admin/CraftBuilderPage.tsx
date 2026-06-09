import React from 'react';
import { Editor } from '@craftjs/core';
import { CraftTopbar } from '@/components/editor/CraftTopbar';
import { CraftToolbox } from '@/components/editor/CraftToolbox';
import { CraftEditorCanvas } from '@/components/editor/CraftEditorCanvas';
import { CraftSettingsPanel } from '@/components/editor/CraftSettingsPanel';

// Blocks
import { ContainerBlock } from '@/components/blocks/ContainerBlock';
import { TextBlock } from '@/components/blocks/TextBlock';
import { HeroBlock } from '@/components/blocks/HeroBlock';

const CraftBuilderPage = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100 font-sans">
      <Editor resolver={{ ContainerBlock, TextBlock, HeroBlock }}>
        <CraftTopbar />
        <div className="flex-1 flex overflow-hidden">
          <CraftToolbox />
          <CraftEditorCanvas />
          <CraftSettingsPanel />
        </div>
      </Editor>
    </div>
  );
};

export default CraftBuilderPage;
