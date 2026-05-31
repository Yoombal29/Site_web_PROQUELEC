export type BlockType = 'hero' | 'section' | 'text' | 'text-block' | 'image' | 'columns' | 'button' | 'divider' | 'spacer' | 'grid' | 'card' | 'video' | 'list' | 'stats' | 'form' | 'html' | 'code';

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
  className?: string;
  customCss?: string;
  darkStyle?: Partial<BlockStyle>;
  mobile?: Partial<BlockStyle>;
  tablet?: Partial<BlockStyle>;
  id?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';

  // ── Layout Engine fields ──────────────────────────────────────
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky';
  flexWrap?: 'wrap' | 'nowrap';
  overflow?: 'visible' | 'hidden' | 'auto' | 'scroll';
  zIndex?: number;
  aspectRatio?: string;
  transform?: string;
  transition?: string;
  animation?: string;
  cursor?: string;
  pointerEvents?: 'auto' | 'none';
  userSelect?: 'auto' | 'none' | 'text';
  isolation?: 'auto' | 'isolate';
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
  items?: BlockContentItem[];
  type?: string; // For code blocks
}

export interface BlockContentItem {
  title?: string;
  content?: string;
  label?: string;
  value?: string;
  name?: string;
  role?: string;
  url?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Block {
  id: string; // UUID for dnd-kit
  type: BlockType | string; // Allow string for flexibility but prefer BlockType
  content: BlockContent;
  style?: BlockStyle;
  children?: Block[]; // Nested blocks (e.g. columns)
  isGlobal?: boolean; // If linked to a global component
  enabled?: boolean; // For new schema
  props?: BlockContent; // New schema alternative to content

  // ── Data Binding fields ──────────────────────────────────────────
  dataSource?: import('@/engine/data/types').DataSource;
  bindings?: import('@/engine/data/types').DataBinding;
  /** ID of the registered data source in the data store */
  dataSourceId?: string;
}

export type HTMLString = string;

export interface PageStructure {
  blocks: Block[];
  version: number;
}