/**
 * Block Registry System
 * 
 * Centralized registry for all available block types and their properties
 * Enables lazy loading, dynamic component resolution, and metadata management
 * 
 * Architecture Benefits:
 * - Single source of truth for block definitions
 * - Lazy-loaded component bundles (code splitting)
 * - Runtime permissions and access control
 * - Block templates and default content
 * - Simplified component resolution in PropertyPanel and Builder
 */

import React, { lazy } from 'react';
import type { Block, BlockStyle } from '@/types/blocksDiscriminated';

/**
 * Block Metadata for UI display and behavior
 */
export interface BlockRegistryEntry {
  type: Block['type'];
  name: string; // Display name
  description: string; // For help text
  icon: React.ReactNode; // UI icon (can be lazy or string)
  category: 'layout' | 'content' | 'media' | 'interactive' | 'advanced';
  canHaveChildren: boolean;
  defaultStyle?: Partial<BlockStyle>;
  defaultContent?: Record<string, unknown>;
  templates?: Array<{
    name: string;
    content: Record<string, unknown>;
    style?: Partial<BlockStyle>;
  }>;
  allowedParents?: Block['type'][]; // Empty = allow all
  allowedChildren?: Block['type'][]; // Empty = allow all
  minHeight?: number; // For editor drag/drop
  previewImage?: string;
  permissions?: {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    duplicate?: boolean;
  };
}

/**
 * Lazy-loaded component type
 */
type LazyBlockComponent = React.ComponentType<{
  id: string;
  content: Record<string, unknown>;
  style?: BlockStyle;
  className?: string;
  children?: React.ReactNode;
}>;

/**
 * Core block registry
 * This maps block types to their metadata and lazy-loaded components
 */
const BLOCK_REGISTRY = new Map<Block['type'], BlockRegistryEntry>();
const COMPONENT_CACHE = new Map<Block['type'], LazyBlockComponent>();

/**
 * Initialize block registry with all available blocks
 */
export const initializeBlockRegistry = () => {
  // Import icons (you may need to adjust based on your icon library)
  const icons = {
    hero: '🎯',
    section: '📦',
    text: '📝',
    'text-block': '📄',
    image: '🖼️',
    html: '💻',
    code: '</>', 
    button: '🔘',
    columns: '📊'
  };

  // Register Hero Block
  BLOCK_REGISTRY.set('hero', {
    type: 'hero',
    name: 'Section Hero',
    description: 'Large banner section with title, subtitle, and CTA button',
    icon: icons.hero,
    category: 'layout',
    canHaveChildren: false,
    defaultStyle: {
      padding: '60px 20px',
      backgroundColor: '#f0f4f8',
      textAlign: 'center',
      minHeight: '300px'
    },
    defaultContent: {
      title: 'Your Headline Here',
      subtitle: 'Supporting text for your hero section',
      text: 'Learn More',
      href: '/contact'
    },
    allowedParents: []
  });

  // Register Section Block
  BLOCK_REGISTRY.set('section', {
    type: 'section',
    name: 'Section',
    description: 'Generic container for organizing content',
    icon: icons.section,
    category: 'layout',
    canHaveChildren: true,
    defaultStyle: {
      padding: '40px 20px',
      backgroundColor: '#ffffff'
    },
    defaultContent: {
      title: 'Section Title'
    },
    allowedParents: [],
    allowedChildren: ['text', 'image', 'button', 'columns']
  });

  // Register Text Block
  BLOCK_REGISTRY.set('text', {
    type: 'text',
    name: 'Text Block',
    description: 'Rich text content with HTML support',
    icon: icons.text,
    category: 'content',
    canHaveChildren: false,
    defaultStyle: {
      padding: '20px',
      lineHeight: '1.6'
    },
    defaultContent: {
      title: 'Heading',
      html: '<p>Your text content here...</p>'
    },
    allowedParents: ['section', 'columns']
  });

  // Register Text-Block variant
  BLOCK_REGISTRY.set('text-block', {
    type: 'text-block',
    name: 'Rich Text',
    description: 'Advanced text block with extended formatting',
    icon: icons['text-block'],
    category: 'content',
    canHaveChildren: false,
    defaultStyle: {
      padding: '20px',
      lineHeight: '1.8'
    },
    defaultContent: {
      title: 'Rich Content',
      html: '<p>Your rich text content here...</p>'
    },
    allowedParents: ['section', 'columns']
  });

  // Register Image Block
  BLOCK_REGISTRY.set('image', {
    type: 'image',
    name: 'Image',
    description: 'Responsive image with caption',
    icon: icons.image,
    category: 'media',
    canHaveChildren: false,
    defaultStyle: {
      width: '100%',
      maxWidth: '600px',
      borderRadius: '8px',
      objectFit: 'cover'
    },
    defaultContent: {
      src: 'https://via.placeholder.com/600x400',
      alt: 'Image description',
      caption: 'Image caption'
    },
    allowedParents: ['section', 'columns'],
    minHeight: 200
  });

  // Register HTML Block
  BLOCK_REGISTRY.set('html', {
    type: 'html',
    name: 'HTML Block',
    description: 'Custom HTML code block',
    icon: icons.html,
    category: 'advanced',
    canHaveChildren: false,
    defaultContent: {
      html: '<div class="custom-html">Your HTML here</div>'
    },
    allowedParents: ['section'],
    permissions: { create: true, edit: true, delete: true }
  });

  // Register Code Block
  BLOCK_REGISTRY.set('code', {
    type: 'code',
    name: 'Code',
    description: 'Code block with syntax highlighting',
    icon: icons.code,
    category: 'advanced',
    canHaveChildren: false,
    defaultStyle: {
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      padding: '15px',
      borderRadius: '6px',
      fontFamily: 'monospace'
    },
    defaultContent: {
      code: 'function example() {\n  console.log("Hello");\n}'
    },
    allowedParents: ['section'],
    minHeight: 150
  });

  // Register Button Block
  BLOCK_REGISTRY.set('button', {
    type: 'button',
    name: 'Button',
    description: 'Interactive call-to-action button',
    icon: icons.button,
    category: 'interactive',
    canHaveChildren: false,
    defaultStyle: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    defaultContent: {
      text: 'Click Me',
      href: '#'
    },
    allowedParents: ['section', 'hero', 'columns']
  });

  // Register Columns Block
  BLOCK_REGISTRY.set('columns', {
    type: 'columns',
    name: 'Columns',
    description: 'Multi-column layout container',
    icon: icons.columns,
    category: 'layout',
    canHaveChildren: true,
    defaultStyle: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px',
      padding: '20px'
    },
    defaultContent: {
      title: 'Columns'
    },
    allowedParents: ['section'],
    allowedChildren: ['text', 'image', 'button']
  });
};

/**
 * Get block metadata from registry
 */
export const getBlockMetadata = (type: Block['type']): BlockRegistryEntry | null => {
  return BLOCK_REGISTRY.get(type) || null;
};

/**
 * Get all available blocks for UI selection
 */
export const getAllBlocks = (): BlockRegistryEntry[] => {
  return Array.from(BLOCK_REGISTRY.values());
};

/**
 * Get blocks by category
 */
export const getBlocksByCategory = (category: BlockRegistryEntry['category']): BlockRegistryEntry[] => {
  return Array.from(BLOCK_REGISTRY.values()).filter(
    (block) => block.category === category
  );
};

/**
 * Check if a block can be added as child of another
 */
export const canAddChild = (parentType: Block['type'], childType: Block['type']): boolean => {
  const parent = getBlockMetadata(parentType);
  if (!parent || !parent.canHaveChildren) return false;

  if (!parent.allowedChildren || parent.allowedChildren.length === 0) {
    return true; // Allow any child
  }

  return parent.allowedChildren.includes(childType);
};

/**
 * Check if a block can be added as child of parent
 */
export const canAddParent = (parentType: Block['type'], childType: Block['type']): boolean => {
  const child = getBlockMetadata(childType);
  if (!child) return false;

  if (!child.allowedParents || child.allowedParents.length === 0) {
    return true; // Allow any parent
  }

  return child.allowedParents.includes(parentType);
};

/**
 * Register a lazy-loaded component for a block type
 */
export const registerBlockComponent = (type: Block['type'], component: LazyBlockComponent) => {
  COMPONENT_CACHE.set(type, component);
};

/**
 * Get component for block type (with lazy loading support)
 */
export const getBlockComponent = (type: Block['type']): LazyBlockComponent | null => {
  return COMPONENT_CACHE.get(type) || null;
};

/**
 * Get block template by name
 */
export const getBlockTemplate = (blockType: Block['type'], templateName: string) => {
  const metadata = getBlockMetadata(blockType);
  if (!metadata || !metadata.templates) return null;

  return metadata.templates.find((t) => t.name === templateName) || null;
};

/**
 * Export registry as JSON (useful for debugging and admin interfaces)
 */
export const exportRegistry = () => {
  const exported = Array.from(BLOCK_REGISTRY.entries()).map(([type, entry]) => ({
    type,
    name: entry.name,
    category: entry.category,
    canHaveChildren: entry.canHaveChildren,
    allowedParents: entry.allowedParents,
    allowedChildren: entry.allowedChildren
  }));

  return exported;
};

/**
 * Initialize registry on module load
 */
initializeBlockRegistry();

export default BLOCK_REGISTRY;
