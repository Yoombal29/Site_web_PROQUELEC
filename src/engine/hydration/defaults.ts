import type { Block, BlockStyle, BlockContent } from '@/types/builder';

export function defaultStyle(): BlockStyle {
  return {};
}

export function defaultContent(): BlockContent {
  return {};
}

export function defaultBlock(type: string): Block {
  return {
    id: '',
    type,
    content: defaultContent(),
    style: defaultStyle(),
    children: [],
  };
}

export const BLOCK_DEFAULTS: Record<string, Partial<Block>> = {
  hero: {
    content: { title: '', subtitle: '' },
    style: {
      padding: '64px 24px',
      textAlign: 'center',
      backgroundColor: 'primary.500',
      color: '#ffffff',
    },
  },
  section: {
    content: {},
    style: {
      padding: '48px 24px',
      maxWidth: '1200px',
    },
  },
  text: {
    content: { text: '' },
    style: { fontSize: '16px', lineHeight: '1.6' },
  },
  'text-block': {
    content: { html: '' },
    style: { fontSize: '16px', lineHeight: '1.6' },
  },
  image: {
    content: { src: '', alt: '' },
    style: { maxWidth: '100%' },
  },
  button: {
    content: { title: 'Button', href: '#' },
    style: {
      display: 'inline-block',
      padding: '12px 24px',
      borderRadius: '6px',
      backgroundColor: 'primary.500',
      color: '#ffffff',
      fontWeight: '600',
      textAlign: 'center',
    },
  },
  divider: {
    content: {},
    style: { borderTop: '1px solid gray.300', margin: '24px 0' },
  },
  spacer: {
    content: {},
    style: { height: '24px' },
  },
  columns: {
    content: {},
    style: { display: 'flex', gap: '24px' },
  },
  grid: {
    content: {},
    style: { display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(3, 1fr)' },
  },
  card: {
    content: { title: '', content: '' },
    style: {
      padding: '24px',
      borderRadius: '8px',
      boxShadow: 'md',
      backgroundColor: '#ffffff',
    },
  },
  video: {
    content: { src: '' },
    style: { maxWidth: '100%', aspectRatio: '16 / 9' },
  },
  list: {
    content: { items: [] },
    style: { padding: '0 0 0 24px' },
  },
  stats: {
    content: { items: [] },
    style: { display: 'flex', gap: '24px', textAlign: 'center' },
  },
  form: {
    content: {},
    style: { display: 'flex', flexDirection: 'column', gap: '16px' },
  },
  html: {
    content: { html: '' },
    style: {},
  },
  code: {
    content: { code: '', type: 'javascript' },
    style: {},
  },
};

export function applyDefaults(block: Block): Block {
  const typeDefaults = BLOCK_DEFAULTS[block.type];
  if (!typeDefaults) return block;

  return {
    ...typeDefaults,
    ...block,
    content: { ...typeDefaults.content, ...(block.content || {}) },
    style: { ...typeDefaults.style, ...(block.style || {}) },
    children: block.children ? block.children.map(applyDefaults) : [],
  } as Block;
}
