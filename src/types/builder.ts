export type BlockType = 'hero' | 'section' | 'text' | 'text-block' | 'image' | 'columns' | 'button' | 'html' | 'code';

export interface BlockStyle {
  width?: string;
  height?: string;
  padding?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  margin?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  color?: string;
  fontSize?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  display?: 'block' | 'flex' | 'grid' | 'inline-block';
  justifyContent?: string;
  alignItems?: string;
  flexDirection?: 'row' | 'column';
  gap?: string;
  maxWidth?: string;
  minHeight?: string;
  boxShadow?: string;
  opacity?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;
  letterSpacing?: string;
  className?: string; // Tailwind overrides
  customCss?: string; // Raw CSS for power users
  [key: string]: unknown;
}

export interface BlockContent {
  title?: string;
  subtitle?: string;
  text?: string;
  html?: string;
  code?: string;
  src?: string; // Image URL
  alt?: string;
  href?: string; // Button link
  caption?: string;
  items?: unknown[];
  [key: string]: unknown;
}

export interface Block {
  id: string; // UUID for dnd-kit
  type: BlockType | string; // Allow string for flexibility but prefer BlockType
  content: BlockContent;
  style?: BlockStyle;
  children?: Block[]; // Nested blocks (e.g. columns)
  isGlobal?: boolean; // If linked to a global component
}

export type HTMLString = string;

export interface PageStructure {
  blocks: Block[];
  version: number;
}