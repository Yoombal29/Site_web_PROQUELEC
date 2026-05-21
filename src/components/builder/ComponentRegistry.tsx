
import React from 'react';
import {
  HeroBlock,
  TextBlock,
  ImageBlock,
  HtmlBlock,
  SectionBlock } from
'./blocks/CoreBlocks';

// Mapping Type JSON -> React Component
export const ComponentRegistry: Record<string, React.FC<unknown>> = {
  'hero': HeroBlock,
  'section': SectionBlock, // Using proper empty Section now
  'html': HtmlBlock,
  'text-block': TextBlock,
  'image': ImageBlock,

  // Backwards compatibility or aliases
  'text': TextBlock,
  'code': HtmlBlock
};