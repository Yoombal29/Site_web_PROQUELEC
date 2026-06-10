// ─────────────────────────────────────────────────────────
// CRAFT.JS RESOLVER
// Maps block type names to React components for Craft.js deserialization
// ─────────────────────────────────────────────────────────

import React from 'react';

import {
  ContainerBlock,
  TextBlock,
  HeroBlock,
  ButtonBlock,
  ImageBlock,
  StatsBlock,
  VideoBlock,
  DividerBlock,
  SpacerBlock,
  CardBlock,
  ColumnsBlock,
  FormBlock,
  TestimonialsBlock,
  PricingBlock,
  AccordionBlock,
  IconBoxBlock,
  CounterBlock,
  GalleryBlock,
  HtmlBlock,
  TabsBlock,
  CarouselBlock,
  ProgressBarBlock,
  AlertBlock,
} from './ProquelecBlocks';
import {
  HeroBannerBlock,
  AudienceOffersBlock,
  VisionMissionBlock,
  LandingStatsBlock,
  LatestNewsBlock,
  PartnerLogosBlock,
} from '../builder/HomepageBlocks';

import {
  HeadingBlock,
  ListBlock,
  QuoteBlock,
  TableBlock,
  CodeBlock,
  BlockquoteBlock,
  HighlightedTextBlock,
  DropCapBlock,
  PullquoteBlock,
  DefinitionListBlock,
  AddressBlock,
  ImageCarouselBlock,
  VideoPopupBlock,
  ImageHotspotBlock,
  ImageComparisonBlock,
  MasonryGalleryBlock,
  LottieBlock,
  AudioBlock,
  FileDownloadBlock,
  ThumbnailGalleryBlock,
  FlipBoxBlock,
  CountdownBlock,
  TestimonialCarouselBlock,
  FAQBlock,
  ModalBlock,
  ToggleBlock,
  TimelineBlock,
  StepsBlock,
  TeamMembersGridBlock,
  CallToActionBlock,
  PriceListBlock,
  StarRatingBlock,
  SocialIconsBlock,
  ShareButtonsBlock,
  NewsletterBlock,
  BreadcrumbsBlock,
  AuthorBoxBlock,
  LogoGridBlock,
  CookieConsentBlock,
  BackToTopBlock,
  SearchBlock,
  AvatarBlock,
  BadgeBlock,
  ShapeDividerBlock,
  AnimatedHeadlineBlock,
  FeatureListBlock,
  ParallaxContainerBlock,
  ScrollProgressBlock,
  ImageAccordionBlock,
  PaginationBlock,
  StickyContainerBlock,
  ParticlesBlock,
  TableOfContentsBlock,
  ComplianceChecklistBlock,
  AuditProcessBlock,
  ResourceCardsBlock,
  TrainingHeroPremiumBlock,
  TrainingProgramPremiumBlock,
  PricingComparisonPremiumBlock,
  ContactPremiumBlock,
  CertificationRequirementsPremiumBlock,
  FAQPremiumBlock,
  TestimonialsPremiumBlock,
  WhyProquelecPremiumBlock,
} from './ProquelecBlocksPlus';

import {
  HabilitationCardsBlock,
  TrainingPricingTableBlock,
  ProquelecActivitiesGridBlock,
  TargetAudienceTabsBlock,
  OrganizationStructureBlock,
  ReferenceStatsBlock,
} from './ProquelecBlocksExtra';

import { RichTextBlock } from './RichTextEditorBlock';
import { PopupBlock } from './PopupBuilderBlock';

import { PdfViewerBlock, WordViewerBlock, ExcelViewerBlock } from './DocumentViewerBlocks';

import { FunctionalPageBlock } from './FunctionalPageBlock';

import {
  FormBuilderBlock,
  TextFieldBlock,
  EmailFieldBlock,
  TextareaFieldBlock,
  SelectFieldBlock,
  CheckboxFieldBlock,
  RadioFieldBlock,
  FileUploadFieldBlock,
  HiddenFieldBlock,
  DateFieldBlock,
  TelFieldBlock,
  ColorFieldBlock,
} from './FormBuilderBlocks';

import {
  DynamicTextBlock,
  DynamicRepeaterBlock,
  DynamicImageBlock,
  DataSourceConfigBlock,
} from './DynamicDataBlocks';

import {
  ProductGridBlock,
  CartBlock,
  ProductBlock,
  ProductAdminBlock,
  PriceBlock,
  AddToCartButtonBlock,
  CheckoutBlock,
} from './EcommerceBlocks';

import { NavMenuBlock, MenuItemBlock, MegaMenuContainerBlock } from './MegaMenuBlock';
import { OffCanvasPanelBlock, OffCanvasToggleBlock } from './OffCanvasBlock';
import { HeaderBuilderBlock, FooterBuilderBlock } from './HeaderFooterBlocks';
import { TemplateErrorBoundary } from '../god-builder/builderTemplates';

/**
 * Fallback component for missing/unknown block types
 */
const FallbackBlock = ({ type }: { type?: string }) =>
  React.createElement(
    'div',
    {
      className:
        'p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-600 text-sm',
    },
    React.createElement('p', null, '⚠️ Block type not available: ' + (type || 'unknown')),
  );

/**
 * Complete resolver for Craft.js deserialization
 * Maps serialized node types to their React component implementations
 */
export const CRAFT_RESOLVER = {
  // Core blocks from ProquelecBlocks
  ContainerBlock,
  TextBlock,
  HeroBlock,
  ButtonBlock,
  ImageBlock,
  StatsBlock,
  VideoBlock,
  DividerBlock,
  SpacerBlock,
  CardBlock,
  ColumnsBlock,
  FormBlock,
  TestimonialsBlock,
  PricingBlock,
  AccordionBlock,
  IconBoxBlock,
  CounterBlock,
  GalleryBlock,
  HtmlBlock,
  TabsBlock,
  CarouselBlock,
  ProgressBarBlock,
  AlertBlock,

  // Extended blocks from ProquelecBlocksPlus
  HeadingBlock,
  ListBlock,
  QuoteBlock,
  TableBlock,
  CodeBlock,
  BlockquoteBlock,
  HighlightedTextBlock,
  DropCapBlock,
  PullquoteBlock,
  DefinitionListBlock,
  AddressBlock,
  ImageCarouselBlock,
  VideoPopupBlock,
  ImageHotspotBlock,
  ImageComparisonBlock,
  MasonryGalleryBlock,
  LottieBlock,
  AudioBlock,
  FileDownloadBlock,
  ThumbnailGalleryBlock,
  FlipBoxBlock,
  CountdownBlock,
  TestimonialCarouselBlock,
  FAQBlock,
  ModalBlock,
  ToggleBlock,
  TimelineBlock,
  StepsBlock,
  TeamMembersGridBlock,
  CallToActionBlock,
  PriceListBlock,
  StarRatingBlock,
  SocialIconsBlock,
  ShareButtonsBlock,
  NewsletterBlock,
  BreadcrumbsBlock,
  AuthorBoxBlock,
  LogoGridBlock,
  CookieConsentBlock,
  BackToTopBlock,
  SearchBlock,
  AvatarBlock,
  BadgeBlock,
  ShapeDividerBlock,
  AnimatedHeadlineBlock,
  FeatureListBlock,
  ParallaxContainerBlock,
  ScrollProgressBlock,
  ImageAccordionBlock,
  PaginationBlock,
  StickyContainerBlock,
  ParticlesBlock,
  TableOfContentsBlock,
  ComplianceChecklistBlock,
  AuditProcessBlock,
  ResourceCardsBlock,
  TrainingHeroPremiumBlock,
  TrainingProgramPremiumBlock,
  PricingComparisonPremiumBlock,
  ContactPremiumBlock,
  CertificationRequirementsPremiumBlock,
  FAQPremiumBlock,
  TestimonialsPremiumBlock,
  WhyProquelecPremiumBlock,

  // Extra PROQUELEC blocks
  HabilitationCardsBlock,
  TrainingPricingTableBlock,
  ProquelecActivitiesGridBlock,
  TargetAudienceTabsBlock,
  OrganizationStructureBlock,
  ReferenceStatsBlock,

  // Rich text & popup
  RichTextBlock,
  PopupBlock,

  // Document viewers
  PdfViewerBlock,
  WordViewerBlock,
  ExcelViewerBlock,

  // Functional page blocks (design-locked)
  FunctionalPageBlock,

  // Form builder
  FormBuilderBlock,
  TextFieldBlock,
  EmailFieldBlock,
  TextareaFieldBlock,
  SelectFieldBlock,
  CheckboxFieldBlock,
  RadioFieldBlock,
  FileUploadFieldBlock,
  HiddenFieldBlock,
  DateFieldBlock,
  TelFieldBlock,
  ColorFieldBlock,

  // Dynamic data
  DynamicTextBlock,
  DynamicRepeaterBlock,
  DynamicImageBlock,
  DataSourceConfigBlock,

  // E-commerce
  ProductGridBlock,
  CartBlock,
  ProductBlock,
  ProductAdminBlock,
  PriceBlock,
  AddToCartButtonBlock,
  CheckoutBlock,

  // Navigation & panels
  NavMenuBlock,
  MenuItemBlock,
  MegaMenuContainerBlock,
  OffCanvasPanelBlock,
  OffCanvasToggleBlock,

  // Header & Footer Builder
  HeaderBuilderBlock,
  FooterBuilderBlock,

  // Legacy / homepage-specific aliases
  cardBlock: CardBlock,
  statsBlock: StatsBlock,
  textBlockBlock: TextBlock,
  HeroBannerBlock,
  LatestNewsBlock,
  PartnerLogosBlock,
  VisionMissionBlock,
  AudienceOffersBlock,
  LandingStatsBlock,

  // Error Boundary for templates
  TemplateErrorBoundary,

  // Fallback for missing types
  '': FallbackBlock,
  undefined: FallbackBlock,
  ROOT: ContainerBlock,
};
