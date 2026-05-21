/**
 * Discriminated Union Types for Builder Blocks
 * 
 * Provides type-safe block definitions using discriminated unions (tagged unions)
 * This ensures compile-time safety and enables exhaustiveness checking in switch statements
 * 
 * Architecture Pattern:
 * - Each block type has a unique 'type' discriminator field
 * - Block-specific content is validated against BlockContent subtype
 * - Eliminates runtime type checking with proper TypeScript inference
 */

/**
 * Base block properties shared by all block types
 */
interface BaseBlock {
  id: string; // UUID identifier
  type: string; // Discriminator field (overridden in subtypes)
  style?: BlockStyle;
  children?: Block[];
  isGlobal?: boolean;
  metadata?: {
    createdAt?: number;
    updatedAt?: number;
    version?: number;
  };
}

/** Block styling interface */
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
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  id?: string; // HTML id attribute
  [key: string]: unknown;
}

// ============= HERO BLOCK =============
export interface HeroBlockContent {
  title?: string;
  subtitle?: string;
  text?: string; // Button text
  href?: string; // Button link
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  content: HeroBlockContent;
  children?: never; // Hero blocks don't have children
}

// ============= SECTION BLOCK =============
export interface SectionBlockContent {
  title?: string;
  subtitle?: string;
}

export interface SectionBlock extends BaseBlock {
  type: 'section';
  content: SectionBlockContent;
  children?: Block[]; // Sections can contain other blocks
}

// ============= TEXT BLOCK =============
export interface TextBlockContent {
  title?: string;
  text?: string;
  html?: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text' | 'text-block';
  content: TextBlockContent;
  children?: never;
}

// ============= IMAGE BLOCK =============
export interface ImageBlockContent {
  src?: string;
  alt?: string;
  caption?: string;
  href?: string; // Optional link on image
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  content: ImageBlockContent;
  children?: never;
}

// ============= HTML BLOCK =============
export interface HtmlBlockContent {
  html?: string;
}

export interface HtmlBlockType extends BaseBlock {
  type: 'html';
  content: HtmlBlockContent;
  children?: never;
}

// ============= CODE BLOCK =============
export interface CodeBlockContent {
  code?: string;
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  content: CodeBlockContent;
  children?: never;
}

// ============= BUTTON BLOCK =============
export interface ButtonBlockContent {
  text?: string;
  title?: string;
  href?: string;
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  content: ButtonBlockContent;
  children?: never;
}

// ============= COLUMNS BLOCK =============
export interface ColumnsBlockContent {
  // Columns block is primarily a layout container
  title?: string;
}

export interface ColumnsBlock extends BaseBlock {
  type: 'columns';
  content: ColumnsBlockContent;
  children?: Block[]; // Columns contain column child blocks
}

// ============= DISCRIMINATED UNION TYPE =============
/**
 * All possible block types united
 * This enables exhaustiveness checking and type-safe pattern matching
 */
export type Block = 
  | HeroBlock 
  | SectionBlock 
  | TextBlock 
  | ImageBlock 
  | HtmlBlockType 
  | CodeBlock 
  | ButtonBlock 
  | ColumnsBlock;

/**
 * Extract content type from a block type
 * Usage: type HeroContent = BlockContentByType<'hero'>;
 */
export type BlockContentByType<T extends Block['type']> = Extract<Block, { type: T }>['content'];

/**
 * Type guard functions for narrowing block types
 */
export const isHeroBlock = (block: Block): block is HeroBlock => block.type === 'hero';
export const isSectionBlock = (block: Block): block is SectionBlock => block.type === 'section';
export const isTextBlock = (block: Block): block is TextBlock => block.type === 'text' || block.type === 'text-block';
export const isImageBlock = (block: Block): block is ImageBlock => block.type === 'image';
export const isHtmlBlock = (block: Block): block is HtmlBlockType => block.type === 'html';
export const isCodeBlock = (block: Block): block is CodeBlock => block.type === 'code';
export const isButtonBlock = (block: Block): block is ButtonBlock => block.type === 'button';
export const isColumnsBlock = (block: Block): block is ColumnsBlock => block.type === 'columns';

/**
 * Container blocks that can have children
 */
export const CONTAINER_BLOCKS: Block['type'][] = ['section', 'columns'];

/**
 * Check if a block can have children
 */
export const canHaveChildren = (blockType: Block['type']): boolean => {
  return CONTAINER_BLOCKS.includes(blockType);
};

/**
 * Page structure type
 */
export interface PageStructure {
  blocks: Block[];
  version: number;
  metadata?: {
    title?: string;
    description?: string;
    createdAt?: number;
    updatedAt?: number;
  };
}

export default Block;
