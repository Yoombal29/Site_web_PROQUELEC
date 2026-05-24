/**
 * Zod Validation Schemas for Builder Data
 * Provides server-side validation for blocks, templates, and page data
 */

import { z } from 'zod';

/**
 * Block Style Schema
 */
const BlockStyleSchema = z.object({
  width: z.string().optional(),
  height: z.string().optional(),
  padding: z.string().optional(),
  paddingTop: z.string().optional(),
  paddingBottom: z.string().optional(),
  paddingLeft: z.string().optional(),
  paddingRight: z.string().optional(),
  margin: z.string().optional(),
  marginTop: z.string().optional(),
  marginBottom: z.string().optional(),
  marginLeft: z.string().optional(),
  marginRight: z.string().optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  backgroundImage: z.string().url().optional(),
  backgroundSize: z.string().optional(),
  backgroundPosition: z.string().optional(),
  borderRadius: z.string().optional(),
  borderWidth: z.string().optional(),
  borderColor: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontSize: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  display: z.enum(['block', 'flex', 'grid', 'inline-block']).optional(),
  justifyContent: z.string().optional(),
  alignItems: z.string().optional(),
  flexDirection: z.enum(['row', 'column']).optional(),
  gap: z.string().optional(),
  maxWidth: z.string().optional(),
  minHeight: z.string().optional(),
  boxShadow: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
  fontWeight: z.string().optional(),
  fontFamily: z.string().optional(),
  lineHeight: z.string().optional(),
  letterSpacing: z.string().optional(),
  className: z.string().optional(),
  customCss: z.string().max(10000).optional(),
  darkStyle: z.lazy(() => BlockStyleSchema.partial()).optional(),
  tablet: z.lazy(() => BlockStyleSchema.partial()).optional(),
  mobile: z.lazy(() => BlockStyleSchema.partial()).optional(),
  id: z.string().optional(),
  objectFit: z.enum(['cover', 'contain', 'fill', 'none']).optional(),
});

/**
 * Block Content Schema
 */
const BlockContentSchema = z.object({
  title: z.string().max(500).optional(),
  subtitle: z.string().max(1000).optional(),
  text: z.string().max(10000).optional(),
  html: z.string().max(50000).optional(),
  code: z.string().max(50000).optional(),
  src: z.string().url().optional(),
  alt: z.string().max(200).optional(),
  href: z.string().url().optional(),
  caption: z.string().max(500).optional(),
  type: z.string().optional(),
  items: z.array(z.any()).optional(),
});

/**
 * Block Schema
 */
export const BlockSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1).max(50),
  content: BlockContentSchema,
  style: BlockStyleSchema.optional(),
  children: z.lazy(() => z.array(BlockSchema)).optional(),
  isGlobal: z.boolean().optional(),
  enabled: z.boolean().optional(),
  props: BlockContentSchema.optional(),
});

/**
 * Block Template Schema
 */
export const BlockTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  block: BlockSchema,
  thumbnail: z.string().url().optional(),
  createdAt: z.number(),
});

/**
 * Page Metadata Schema
 */
export const PageMetadataSchema = z.object({
  id: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().max(200).optional(),
  excerpt: z.string().max(500).optional(),
  meta_description: z.string().max(500).optional(),
  meta_keywords: z.string().max(500).optional(),
  meta_robots: z.enum(['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow']).optional(),
  featured_image: z.string().url().optional(),
  language_code: z.enum(['fr', 'en']).optional(),
  is_published: z.boolean().optional(),
  publish_date: z.string().optional(),
  unpublish_date: z.string().optional(),
  workflow_status: z.enum(['draft', 'review', 'approved', 'published', 'archived']).optional(),
  author: z.string().max(100).optional(),
  reading_time: z.number().min(0).max(60).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  hero_title: z.string().max(200).optional(),
  hero_subtitle: z.string().max(500).optional(),
  hero_background_image: z.string().url().optional(),
  hero_cta_text: z.string().max(100).optional(),
  hero_cta_link: z.string().url().optional(),
  template: z.string().optional(),
  show_hero: z.boolean().optional(),
  show_footer: z.boolean().optional(),
  custom_css: z.string().max(10000).optional(),
  custom_js: z.string().max(10000).optional(),
  header_html: z.string().max(5000).optional(),
  footer_html: z.string().max(5000).optional(),
  menu_order: z.number().optional(),
});

/**
 * Page Structure Schema
 */
export const PageStructureSchema = z.object({
  blocks: z.array(BlockSchema),
  version: z.number(),
});

/**
 * Validation helper functions
 */
export const validateBlock = (data: unknown) => BlockSchema.safeParse(data);
export const validateTemplate = (data: unknown) => BlockTemplateSchema.safeParse(data);
export const validatePageMetadata = (data: unknown) => PageMetadataSchema.safeParse(data);
export const validatePageStructure = (data: unknown) => PageStructureSchema.safeParse(data);
