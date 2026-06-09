import React from 'react';
import { useNode, Element } from '@craftjs/core';
import { ContainerBlock } from './ContainerBlock';
import { TextBlock } from './TextBlock';

export const HeroBlock = () => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className="w-full bg-slate-900 text-white py-20 px-8 text-center"
    >
      <Element id="hero-title" is={ContainerBlock} padding={0} backgroundColor="transparent" canvas>
        <TextBlock text="TITRE PRINCIPAL" fontSize={48} textAlign="center" color="#ffffff" />
      </Element>
      <Element id="hero-subtitle" is={ContainerBlock} padding={10} backgroundColor="transparent" canvas>
        <TextBlock text="Sous-titre engageant pour votre section" fontSize={24} textAlign="center" color="#94a3b8" />
      </Element>
    </div>
  );
};

HeroBlock.craft = {
  displayName: 'Hero Section',
};
