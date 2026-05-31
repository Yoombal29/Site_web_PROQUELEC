import React, { useState, useMemo, useEffect } from 'react';
import { useEditor, Element } from '@craftjs/core';
import {
  Type, Square, LayoutTemplate, Image, SeparatorHorizontal, MoveVertical,
  Columns, BarChart3, Video, FileText, MousePointerClick, CreditCard,
  Search, MessageSquare, DollarSign, ChevronDown, List, Zap,
  Hash, MapPin, Share2, X, Layers, BookOpen, Code2, Trash2, Sparkles, Palette, Database, Save
} from 'lucide-react';
import { toast } from 'sonner';
import { useGlobalBlocksStore } from '@/stores/global-blocks.store';

import {
  ContainerBlock, TextBlock, HeroBlock, ButtonBlock, ImageBlock,
  StatsBlock, VideoBlock, DividerBlock, SpacerBlock, CardBlock,
  ColumnsBlock, FormBlock,
  TestimonialsBlock, PricingBlock, AccordionBlock,
  IconBoxBlock, CounterBlock, GalleryBlock, HtmlBlock,
  TabsBlock, CarouselBlock, ProgressBarBlock, AlertBlock,
} from '../blocks/ProquelecBlocks';
import {
  HeadingBlock, ListBlock, QuoteBlock, TableBlock, CodeBlock,
  BlockquoteBlock, HighlightedTextBlock, DropCapBlock, PullquoteBlock,
  DefinitionListBlock, AddressBlock, ImageCarouselBlock, VideoPopupBlock,
  ImageHotspotBlock, ImageComparisonBlock, MasonryGalleryBlock, LottieBlock,
  AudioBlock, FileDownloadBlock, ThumbnailGalleryBlock,
  FlipBoxBlock, CountdownBlock, TestimonialCarouselBlock, FAQBlock,
  ModalBlock, ToggleBlock, TimelineBlock, StepsBlock, TeamMembersGridBlock,
  CallToActionBlock, PriceListBlock, StarRatingBlock, SocialIconsBlock,
  ShareButtonsBlock, NewsletterBlock,
  BreadcrumbsBlock, AuthorBoxBlock, LogoGridBlock, CookieConsentBlock,
  BackToTopBlock, SearchBlock, AvatarBlock, BadgeBlock,
  ShapeDividerBlock, AnimatedHeadlineBlock, FeatureListBlock,
  ParallaxContainerBlock, ScrollProgressBlock, ImageAccordionBlock,
  PaginationBlock, StickyContainerBlock, ParticlesBlock,
  TableOfContentsBlock,
} from '../blocks/ProquelecBlocksPlus';
import {
  FormBuilderBlock, TextFieldBlock, EmailFieldBlock, TextareaFieldBlock,
  SelectFieldBlock, CheckboxFieldBlock, RadioFieldBlock, FileUploadFieldBlock,
  HiddenFieldBlock, DateFieldBlock, TelFieldBlock, ColorFieldBlock,
} from '../blocks/FormBuilderBlocks';
import { RichTextBlock } from '../blocks/RichTextEditorBlock';
import { PopupBlock } from '../blocks/PopupBuilderBlock';
import {
  DynamicTextBlock, DynamicRepeaterBlock, DynamicImageBlock, DataSourceConfigBlock,
} from '../blocks/DynamicDataBlocks';
import {
  ProductGridBlock, CartBlock, ProductBlock, ProductAdminBlock, PriceBlock, AddToCartButtonBlock, CheckoutBlock,
} from '../blocks/EcommerceBlocks';
import { NavMenuBlock, MenuItemBlock, MegaMenuContainerBlock } from '../blocks/MegaMenuBlock';
import { OffCanvasPanelBlock, OffCanvasToggleBlock } from '../blocks/OffCanvasBlock';

// ─────────────────────────────────────────────────────────
// BLOCK REGISTRY
// ─────────────────────────────────────────────────────────
const BLOCK_GROUPS = [
  {
    label: 'Structure',
    color: 'text-indigo-400',
    icon: Layers,
    items: [
      { icon: Square, label: 'Conteneur', color: 'text-indigo-400', tags: ['layout', 'wrapper', 'section'], factory: () => <ContainerBlock /> },
      { icon: Columns, label: 'Colonnes', color: 'text-indigo-400', tags: ['grid', 'layout', 'columns'], factory: () => <ColumnsBlock /> },
      { icon: MoveVertical, label: 'Espace', color: 'text-slate-400', tags: ['spacer', 'gap'], factory: () => <SpacerBlock /> },
      { icon: SeparatorHorizontal, label: 'Séparateur', color: 'text-slate-400', tags: ['divider', 'line', 'hr'], factory: () => <DividerBlock /> },
      { icon: MoveVertical, label: 'Conteneur Sticky', color: 'text-indigo-400', tags: ['sticky', 'fixed', 'header'], factory: () => <StickyContainerBlock /> },
      { icon: LayoutTemplate, label: 'Séparateur Forme', color: 'text-indigo-400', tags: ['divider', 'shape', 'svg', 'wave'], factory: () => <ShapeDividerBlock /> },
      { icon: Image, label: 'Parallaxe', color: 'text-indigo-400', tags: ['parallax', 'scroll', 'background'], factory: () => <ParallaxContainerBlock /> },
    ]
  },
  {
    label: 'Contenu',
    color: 'text-emerald-400',
    icon: Type,
    items: [
      { icon: Type, label: 'Texte', color: 'text-emerald-400', tags: ['text', 'paragraph', 'heading', 'titre'], factory: () => <TextBlock /> },
      { icon: Image, label: 'Image', color: 'text-emerald-400', tags: ['image', 'photo', 'picture'], factory: () => <ImageBlock /> },
      { icon: Video, label: 'Vidéo', color: 'text-emerald-400', tags: ['video', 'youtube', 'embed'], factory: () => <VideoBlock /> },
      { icon: FileText, label: 'Formulaire', color: 'text-emerald-400', tags: ['form', 'contact', 'mail'], factory: () => <FormBlock /> },
      { icon: MousePointerClick, label: 'Bouton CTA', color: 'text-rose-400', tags: ['button', 'cta', 'link', 'action'], factory: () => <ButtonBlock /> },
      { icon: Hash, label: 'Compteur', color: 'text-cyan-400', tags: ['counter', 'number', 'animate'], factory: () => <CounterBlock /> },
      { icon: Code2, label: 'Code HTML', color: 'text-indigo-400', tags: ['html', 'code', 'raw', 'embed'], factory: () => <HtmlBlock /> },
      { icon: FileText, label: 'Texte enrichi', color: 'text-emerald-400', tags: ['rich', 'text', 'tiptap', 'wysiwyg'], factory: () => <RichTextBlock /> },
    ]
  },
  {
    label: 'Formulaires',
    color: 'text-emerald-400',
    icon: FileText,
    items: [
      { icon: FileText, label: 'Formulaire Builder', color: 'text-emerald-400', tags: ['form', 'builder', 'contact'], factory: () => <FormBuilderBlock /> },
      { icon: Type, label: 'Champ Texte', color: 'text-emerald-400', tags: ['input', 'text'], factory: () => <TextFieldBlock /> },
      { icon: Type, label: 'Champ Email', color: 'text-emerald-400', tags: ['input', 'email'], factory: () => <EmailFieldBlock /> },
      { icon: FileText, label: 'Zone de texte', color: 'text-emerald-400', tags: ['textarea', 'message'], factory: () => <TextareaFieldBlock /> },
      { icon: List, label: 'Liste déroulante', color: 'text-emerald-400', tags: ['select', 'dropdown'], factory: () => <SelectFieldBlock /> },
      { icon: Square, label: 'Case à cocher', color: 'text-emerald-400', tags: ['checkbox', 'accept'], factory: () => <CheckboxFieldBlock /> },
      { icon: Square, label: 'Bouton radio', color: 'text-emerald-400', tags: ['radio', 'choice'], factory: () => <RadioFieldBlock /> },
      { icon: Image, label: 'Fichier', color: 'text-emerald-400', tags: ['file', 'upload'], factory: () => <FileUploadFieldBlock /> },
      { icon: Code2, label: 'Champ caché', color: 'text-emerald-400', tags: ['hidden', 'input'], factory: () => <HiddenFieldBlock /> },
      { icon: Type, label: 'Date', color: 'text-emerald-400', tags: ['date', 'calendar'], factory: () => <DateFieldBlock /> },
      { icon: Type, label: 'Téléphone', color: 'text-emerald-400', tags: ['tel', 'phone'], factory: () => <TelFieldBlock /> },
      { icon: Palette, label: 'Couleur', color: 'text-emerald-400', tags: ['color', 'picker'], factory: () => <ColorFieldBlock /> },
    ]
  },
  {
    label: 'Contenu Avancé',
    color: 'text-teal-400',
    icon: Type,
    items: [
      { icon: Type, label: 'Titre (H1-H6)', color: 'text-teal-400', tags: ['heading', 'title', 'titre'], factory: () => <HeadingBlock /> },
      { icon: List, label: 'Liste', color: 'text-teal-400', tags: ['list', 'bullet', 'numbered'], factory: () => <ListBlock /> },
      { icon: MessageSquare, label: 'Citation', color: 'text-teal-400', tags: ['quote', 'citation'], factory: () => <QuoteBlock /> },
      { icon: Columns, label: 'Tableau', color: 'text-teal-400', tags: ['table', 'grid', 'data'], factory: () => <TableBlock /> },
      { icon: Code2, label: 'Code', color: 'text-teal-400', tags: ['code', 'pre', 'syntax'], factory: () => <CodeBlock /> },
      { icon: MessageSquare, label: 'Bloc Citation', color: 'text-teal-400', tags: ['blockquote', 'quote'], factory: () => <BlockquoteBlock /> },
      { icon: Type, label: 'Texte surligné', color: 'text-teal-400', tags: ['highlight', 'mark'], factory: () => <HighlightedTextBlock /> },
      { icon: Type, label: 'Lettrine', color: 'text-teal-400', tags: ['dropcap', 'lettrine'], factory: () => <DropCapBlock /> },
      { icon: Square, label: 'Citation flottante', color: 'text-teal-400', tags: ['pullquote', 'floating'], factory: () => <PullquoteBlock /> },
      { icon: List, label: 'Définitions', color: 'text-teal-400', tags: ['definition', 'dl', 'terms'], factory: () => <DefinitionListBlock /> },
      { icon: MapPin, label: 'Adresse', color: 'text-teal-400', tags: ['address', 'contact', 'info'], factory: () => <AddressBlock /> },
      { icon: Type, label: 'Titre animé', color: 'text-teal-400', tags: ['animated', 'headline', 'rotating', 'text'], factory: () => <AnimatedHeadlineBlock /> },
      { icon: List, label: 'Liste fonctionnalités', color: 'text-teal-400', tags: ['feature', 'list', 'icon', 'bullet'], factory: () => <FeatureListBlock /> },
    ]
  },
  {
    label: 'Média',
    color: 'text-sky-400',
    icon: Image,
    items: [
      { icon: Image, label: 'Carrousel Images', color: 'text-sky-400', tags: ['carousel', 'slider', 'gallery'], factory: () => <ImageCarouselBlock /> },
      { icon: Video, label: 'Popup Vidéo', color: 'text-sky-400', tags: ['video', 'popup', 'youtube'], factory: () => <VideoPopupBlock /> },
      { icon: Image, label: 'Image Hotspots', color: 'text-sky-400', tags: ['hotspot', 'interactive', 'image'], factory: () => <ImageHotspotBlock /> },
      { icon: Image, label: 'Comparaison', color: 'text-sky-400', tags: ['comparison', 'before', 'after'], factory: () => <ImageComparisonBlock /> },
      { icon: Image, label: 'Galerie Masonry', color: 'text-sky-400', tags: ['masonry', 'gallery', 'grid'], factory: () => <MasonryGalleryBlock /> },
      { icon: Zap, label: 'Animation Lottie', color: 'text-sky-400', tags: ['lottie', 'animation'], factory: () => <LottieBlock /> },
      { icon: Video, label: 'Audio', color: 'text-sky-400', tags: ['audio', 'music', 'podcast'], factory: () => <AudioBlock /> },
      { icon: FileText, label: 'Téléchargement', color: 'text-sky-400', tags: ['download', 'file', 'pdf'], factory: () => <FileDownloadBlock /> },
      { icon: Image, label: 'Galerie Vignettes', color: 'text-sky-400', tags: ['thumbnail', 'gallery', 'preview'], factory: () => <ThumbnailGalleryBlock /> },
      { icon: Image, label: 'Accordéon Images', color: 'text-sky-400', tags: ['accordion', 'image', 'gallery', 'interactive'], factory: () => <ImageAccordionBlock /> },
    ]
  },
  {
    label: 'Sections PROQUELEC',
    color: 'text-amber-400',
    icon: Zap,
    items: [
      { icon: LayoutTemplate, label: 'Hero Section', color: 'text-amber-400', tags: ['hero', 'banner', 'header'], factory: () => <HeroBlock /> },
      { icon: BarChart3, label: 'Statistiques', color: 'text-amber-400', tags: ['stats', 'numbers', 'chiffres'], factory: () => <StatsBlock /> },
      { icon: CreditCard, label: 'Carte', color: 'text-amber-400', tags: ['card', 'feature', 'service'], factory: () => <CardBlock /> },
      { icon: MessageSquare, label: 'Témoignages', color: 'text-violet-400', tags: ['testimonials', 'reviews', 'avis'], factory: () => <TestimonialsBlock /> },
      { icon: DollarSign, label: 'Tarification', color: 'text-green-400', tags: ['pricing', 'plans', 'tarifs'], factory: () => <PricingBlock /> },
      { icon: List, label: 'Accordéon FAQ', color: 'text-orange-400', tags: ['accordion', 'faq', 'collapse'], factory: () => <AccordionBlock /> },
      { icon: Zap, label: 'IconBox', color: 'text-sky-400', tags: ['icon', 'feature', 'box', 'service'], factory: () => <IconBoxBlock /> },
      { icon: Image, label: 'Galerie', color: 'text-pink-400', tags: ['gallery', 'photos', 'grid'], factory: () => <GalleryBlock /> },
    ]
  },
  {
    label: 'Interactif',
    color: 'text-orange-400',
    icon: Sparkles,
    items: [
      { icon: Square, label: 'FlipBox', color: 'text-orange-400', tags: ['flip', 'card', '3d'], factory: () => <FlipBoxBlock /> },
      { icon: Hash, label: 'Compte à rebours', color: 'text-orange-400', tags: ['countdown', 'timer'], factory: () => <CountdownBlock /> },
      { icon: MessageSquare, label: 'Témoignages Dyn.', color: 'text-orange-400', tags: ['testimonial', 'carousel', 'slider'], factory: () => <TestimonialCarouselBlock /> },
      { icon: List, label: 'FAQ', color: 'text-orange-400', tags: ['faq', 'questions', 'accordion'], factory: () => <FAQBlock /> },
      { icon: Square, label: 'Modale', color: 'text-orange-400', tags: ['modal', 'popup', 'dialog'], factory: () => <ModalBlock /> },
      { icon: Square, label: 'Toggle', color: 'text-orange-400', tags: ['toggle', 'collapse', 'show'], factory: () => <ToggleBlock /> },
      { icon: List, label: 'Timeline', color: 'text-orange-400', tags: ['timeline', 'history', 'steps'], factory: () => <TimelineBlock /> },
      { icon: List, label: 'Étapes', color: 'text-orange-400', tags: ['steps', 'process', 'guide'], factory: () => <StepsBlock /> },
      { icon: Image, label: 'Membres Équipe', color: 'text-orange-400', tags: ['team', 'members', 'people'], factory: () => <TeamMembersGridBlock /> },
    ]
  },
  {
    label: 'Marketing',
    color: 'text-rose-400',
    icon: MousePointerClick,
    items: [
      { icon: MousePointerClick, label: 'CTA', color: 'text-rose-400', tags: ['cta', 'call', 'action', 'banner'], factory: () => <CallToActionBlock /> },
      { icon: CreditCard, label: 'Grille Tarifs', color: 'text-rose-400', tags: ['pricing', 'price', 'plans'], factory: () => <PriceListBlock /> },
      { icon: Zap, label: 'Avis ★', color: 'text-rose-400', tags: ['rating', 'stars', 'review'], factory: () => <StarRatingBlock /> },
      { icon: Share2, label: 'Réseaux sociaux', color: 'text-rose-400', tags: ['social', 'facebook', 'twitter'], factory: () => <SocialIconsBlock /> },
      { icon: Share2, label: 'Boutons partage', color: 'text-rose-400', tags: ['share', 'social'], factory: () => <ShareButtonsBlock /> },
      { icon: MessageSquare, label: 'Newsletter', color: 'text-rose-400', tags: ['newsletter', 'email', 'subscribe'], factory: () => <NewsletterBlock /> },
    ]
  },
  {
    label: 'Premium & Interactivité',
    color: 'text-purple-400',
    icon: Sparkles,
    items: [
      { icon: List, label: 'Onglets', color: 'text-purple-400', tags: ['tabs', 'switch', 'onglets', 'content'], factory: () => <TabsBlock /> },
      { icon: LayoutTemplate, label: 'Carrousel Slides', color: 'text-purple-400', tags: ['carousel', 'slider', 'slideshow'], factory: () => <CarouselBlock /> },
      { icon: BarChart3, label: 'Barre de Progrès', color: 'text-purple-400', tags: ['progress', 'skills', 'pourcentage'], factory: () => <ProgressBarBlock /> },
      { icon: Zap, label: 'Bannière d\'Alerte', color: 'text-purple-400', tags: ['alert', 'banner', 'warning', 'info'], factory: () => <AlertBlock /> },
      { icon: Square, label: 'Popup Builder', color: 'text-purple-400', tags: ['popup', 'modal', 'overlay', 'trigger'], factory: () => <PopupBlock /> },
      { icon: Zap, label: 'Particules', color: 'text-purple-400', tags: ['particles', 'background', 'animated', 'canvas'], factory: () => <ParticlesBlock /> },
      { icon: List, label: 'Menu Navigation', color: 'text-purple-400', tags: ['nav', 'menu', 'navigation'], factory: () => <NavMenuBlock /> },
      { icon: List, label: 'Lien Menu', color: 'text-purple-400', tags: ['link', 'menu', 'nav'], factory: () => <MenuItemBlock /> },
      { icon: Square, label: 'Mega Menu', color: 'text-purple-400', tags: ['megamenu', 'dropdown', 'nav'], factory: () => <MegaMenuContainerBlock /> },
      { icon: Square, label: 'Panneau Off-Canvas', color: 'text-purple-400', tags: ['offcanvas', 'panel', 'slide'], factory: () => <OffCanvasPanelBlock /> },
      { icon: Square, label: 'Bouton Off-Canvas', color: 'text-purple-400', tags: ['offcanvas', 'toggle', 'button'], factory: () => <OffCanvasToggleBlock /> },
    ]
  },
  {
    label: 'Données',
    color: 'text-cyan-400',
    icon: Database,
    items: [
      { icon: Database, label: 'Texte Dynamique', color: 'text-cyan-400', tags: ['dynamic', 'data', 'expression'], factory: () => <DynamicTextBlock /> },
      { icon: Database, label: 'Liste Dynamique', color: 'text-cyan-400', tags: ['dynamic', 'list', 'repeater'], factory: () => <DynamicRepeaterBlock /> },
      { icon: Database, label: 'Image Dynamique', color: 'text-cyan-400', tags: ['dynamic', 'image', 'data'], factory: () => <DynamicImageBlock /> },
      { icon: Database, label: 'Sources de Données', color: 'text-cyan-400', tags: ['source', 'api', 'data', 'config'], factory: () => <DataSourceConfigBlock /> },
    ]
  },
  {
    label: 'E-commerce',
    color: 'text-amber-400',
    icon: DollarSign,
    items: [
      { icon: Image, label: 'Grille Produits', color: 'text-amber-400', tags: ['shop', 'products', 'grid', 'ecommerce'], factory: () => <ProductGridBlock /> },
      { icon: Square, label: 'Produit', color: 'text-amber-400', tags: ['product', 'single', 'details'], factory: () => <ProductBlock /> },
      { icon: DollarSign, label: 'Prix', color: 'text-amber-400', tags: ['price', 'product'], factory: () => <PriceBlock /> },
      { icon: MousePointerClick, label: 'Bouton Achat', color: 'text-amber-400', tags: ['addtocart', 'buy', 'button'], factory: () => <AddToCartButtonBlock /> },
      { icon: CreditCard, label: 'Panier', color: 'text-amber-400', tags: ['cart', 'shopping', 'basket'], factory: () => <CartBlock /> },
      { icon: CreditCard, label: 'Checkout', color: 'text-amber-400', tags: ['checkout', 'payment', 'order'], factory: () => <CheckoutBlock /> },
      { icon: CreditCard, label: 'Catalogue Produits', color: 'text-amber-400', tags: ['admin', 'catalog', 'products', 'manage'], factory: () => <ProductAdminBlock /> },
    ]
  },
  {
    label: 'Utilitaire',
    color: 'text-slate-400',
    icon: Search,
    items: [
      { icon: List, label: 'Fil d\'Ariane', color: 'text-slate-400', tags: ['breadcrumb', 'nav'], factory: () => <BreadcrumbsBlock /> },
      { icon: Image, label: 'Boîte Auteur', color: 'text-slate-400', tags: ['author', 'bio'], factory: () => <AuthorBoxBlock /> },
      { icon: Image, label: 'Grille Logos', color: 'text-slate-400', tags: ['logo', 'grid', 'clients'], factory: () => <LogoGridBlock /> },
      { icon: FileText, label: 'Cookies Consent', color: 'text-slate-400', tags: ['cookie', 'gdpr', 'consent'], factory: () => <CookieConsentBlock /> },
      { icon: Square, label: 'Retour Haut', color: 'text-slate-400', tags: ['back', 'top', 'scroll'], factory: () => <BackToTopBlock /> },
      { icon: Search, label: 'Recherche', color: 'text-slate-400', tags: ['search', 'input'], factory: () => <SearchBlock /> },
      { icon: Image, label: 'Avatar', color: 'text-slate-400', tags: ['avatar', 'profile'], factory: () => <AvatarBlock /> },
      { icon: Zap, label: 'Badge', color: 'text-slate-400', tags: ['badge', 'tag', 'label'], factory: () => <BadgeBlock /> },
      { icon: BarChart3, label: 'Barre Progression', color: 'text-slate-400', tags: ['progress', 'scroll', 'bar', 'reading'], factory: () => <ScrollProgressBlock /> },
      { icon: List, label: 'Pagination', color: 'text-slate-400', tags: ['pagination', 'pages', 'nav'], factory: () => <PaginationBlock /> },
      { icon: List, label: 'Table des matières', color: 'text-slate-400', tags: ['toc', 'table', 'contents', 'sommaire'], factory: () => <TableOfContentsBlock /> },
    ]
  },
];

// ─────────────────────────────────────────────────────────
// SECTION TEMPLATES
// ─────────────────────────────────────────────────────────
const SECTION_TEMPLATES = [
  // ── HERO ──
  {
    label: 'Hero + Stats',
    description: 'Section héro avec statistiques',
    emoji: '🚀',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <HeroBlock title="Titre accrocheur" subtitle="Sous-titre convaincant" ctaText="Commencer" />
        <StatsBlock />
      </Element>
    ),
  },
  {
    label: 'Hero Simple',
    description: 'Bannière minimaliste avec CTA',
    emoji: '🎯',
    factory: () => <HeroBlock title="Votre slogan" subtitle="Phrase percutante" ctaText="Découvrir" backgroundColor="#2563eb" />,
  },
  {
    label: 'Hero Vidéo',
    description: 'Hero avec fond vidéo et overlay',
    emoji: '🎬',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={60} backgroundColor="#0f172a" maxWidth="100%">
        <HeroBlock title="Notre Mission" subtitle="Découvrez nos services" ctaText="En savoir plus" backgroundColor="#1e293b" />
      </Element>
    ),
  },
  {
    label: 'Hero Split',
    description: 'Hero moitié texte / moitié image',
    emoji: '🖼️',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <Element is={ColumnsBlock} canvas columns={2} gap={0}>
          <Element is={ContainerBlock} canvas padding={48} backgroundColor="#f8fafc">
            <HeadingBlock text="Notre Vision" level="h1" fontSize={42} color="#0f172a" />
            <SpacerBlock height={16} />
            <TextBlock text="Description convaincante…" fontSize={18} color="#475569" />
            <SpacerBlock height={24} />
            <ButtonBlock text="Commencer" type="primary" />
          </Element>
          <Element is={ContainerBlock} canvas padding={0} backgroundColor="#2563eb" />
        </Element>
      </Element>
    ),
  },
  // ── CONTENU ──
  {
    label: 'Section Services',
    description: '3 cartes de services côte à côte',
    emoji: '⚡',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={40} paddingY={60} backgroundColor="#f8fafc" maxWidth="100%">
        <TextBlock text="Nos Services" fontSize={36} textAlign="center" fontWeight="900" color="#0f172a" />
        <SpacerBlock height={32} />
        <Element is={ColumnsBlock} canvas columns={3} gap={24}>
          <CardBlock icon="⚡" title="Service 1" text="Description du service..." />
          <CardBlock icon="🔧" title="Service 2" text="Description du service..." />
          <CardBlock icon="🛡️" title="Service 3" text="Description du service..." />
        </Element>
      </Element>
    ),
  },
  {
    label: 'Section Témoignages',
    description: 'Avis clients avec fond coloré',
    emoji: '💬',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={40} paddingY={60} backgroundColor="#0f172a" maxWidth="100%">
        <TextBlock text="Ce que disent nos clients" fontSize={32} textAlign="center" fontWeight="900" color="#ffffff" />
        <SpacerBlock height={32} />
        <TestimonialsBlock />
      </Element>
    ),
  },
  {
    label: 'Section Contact',
    description: 'Formulaire de contact centré',
    emoji: '📬',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={40} paddingY={60} backgroundColor="#ffffff" maxWidth="1024px">
        <TextBlock text="Contactez-nous" fontSize={36} textAlign="center" fontWeight="900" color="#0f172a" />
        <SpacerBlock height={8} />
        <TextBlock text="Réponse sous 24h" fontSize={16} textAlign="center" color="#64748b" />
        <SpacerBlock height={32} />
        <FormBlock />
      </Element>
    ),
  },
  {
    label: 'Section Tarifs',
    description: '3 colonnes de prix avec mise en avant',
    emoji: '💰',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={60} backgroundColor="#f8fafc" maxWidth="100%">
        <TextBlock text="Nos Offres" fontSize={36} textAlign="center" fontWeight="900" color="#0f172a" />
        <SpacerBlock height={32} />
        <PricingBlock />
      </Element>
    ),
  },
  {
    label: 'Section FAQ',
    description: 'Accordéon questions/réponses',
    emoji: '❓',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={60} backgroundColor="#ffffff" maxWidth="768px">
        <TextBlock text="FAQ" fontSize={36} textAlign="center" fontWeight="900" color="#0f172a" />
        <SpacerBlock height={32} />
        <AccordionBlock />
      </Element>
    ),
  },
  {
    label: 'Section Chiffres',
    description: 'Statistiques et KPIs',
    emoji: '📊',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={60} backgroundColor="#1e293b" maxWidth="100%">
        <TextBlock text="Nos Chiffres" fontSize={36} textAlign="center" fontWeight="900" color="#ffffff" />
        <SpacerBlock height={32} />
        <StatsBlock />
      </Element>
    ),
  },
  {
    label: 'Section Newsletter',
    description: 'Inscription à la newsletter',
    emoji: '📧',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={60} backgroundColor="#2563eb" maxWidth="100%">
        <TextBlock text="Restez informé" fontSize={36} textAlign="center" fontWeight="900" color="#ffffff" />
        <SpacerBlock height={8} />
        <TextBlock text="Recevez nos actualités chaque mois" fontSize={16} textAlign="center" color="#bfdbfe" />
        <SpacerBlock height={24} />
        <NewsletterBlock />
      </Element>
    ),
  },
  // ── MÉDIA ──
  {
    label: 'Section Galerie',
    description: 'Grille d\'images avec lightbox',
    emoji: '🖼️',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} backgroundColor="#f8fafc" maxWidth="100%">
        <TextBlock text="Galerie" fontSize={36} textAlign="center" fontWeight="900" color="#0f172a" />
        <SpacerBlock height={32} />
        <GalleryBlock />
      </Element>
    ),
  },
  {
    label: 'Section Équipe',
    description: 'Membres de l\'équipe en grille',
    emoji: '👥',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} backgroundColor="#ffffff" maxWidth="100%">
        <TextBlock text="Notre Équipe" fontSize={36} textAlign="center" fontWeight="900" color="#0f172a" />
        <SpacerBlock height={32} />
        <TeamMembersGridBlock members={[
          { name: 'Alice Dupont', role: 'CEO', photo: '', bio: 'Fondatrice visionnaire' },
          { name: 'Bob Martin', role: 'CTO', photo: '', bio: 'Expert technique' },
          { name: 'Claire Dubois', role: 'CMO', photo: '', bio: 'Stratège marketing' },
        ]} />
      </Element>
    ),
  },
  {
    label: 'Section Logo Clients',
    description: 'Grille de logos partenaires',
    emoji: '🤝',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={32} backgroundColor="#f8fafc" maxWidth="100%">
        <TextBlock text="Ils nous font confiance" fontSize={24} textAlign="center" fontWeight="600" color="#64748b" />
        <SpacerBlock height={24} />
        <LogoGridBlock />
      </Element>
    ),
  },
  {
    label: 'Section Timeline',
    description: 'Historique chronologique',
    emoji: '📅',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} backgroundColor="#ffffff" maxWidth="768px">
        <TextBlock text="Notre Histoire" fontSize={36} textAlign="center" fontWeight="900" color="#0f172a" />
        <SpacerBlock height={32} />
        <TimelineBlock items={[
          { year: '2010', title: 'Création', desc: 'Fondation de l\'entreprise' },
          { year: '2015', title: 'Expansion', desc: 'Ouverture de 3 agences' },
          { year: '2020', title: 'Innovation', desc: 'Lancement des services digitaux' },
          { year: '2024', title: 'Leader', desc: 'Positionnement national' },
        ]} />
      </Element>
    ),
  },
  {
    label: 'Section CTA Large',
    description: 'Bannière d\'appel à l\'action',
    emoji: '🎯',
    factory: () => (
      <CallToActionBlock title="Prêt à démarrer ?" description="Rejoignez les 500+ entreprises qui nous font confiance" buttonText="Nous contacter" bgColor="#2563eb" textColor="#ffffff" buttonBg="#ffffff" buttonTextColor="#2563eb" />
    ),
  },
  {
    label: 'Section Compte à Rebours',
    description: 'Timer pour événement',
    emoji: '⏱️',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} backgroundColor="#0f172a" maxWidth="100%">
        <TextBlock text="Événement à venir" fontSize={36} textAlign="center" fontWeight="900" color="#ffffff" />
        <SpacerBlock height={24} />
        <CountdownBlock targetDate="2027-01-01T00:00:00" boxBg="#1e293b" boxTextColor="#ffffff" />
      </Element>
    ),
  },
  {
    label: 'Section Étapes',
    description: 'Processus en 3-4 étapes',
    emoji: '📋',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} backgroundColor="#ffffff" maxWidth="100%">
        <TextBlock text="Comment ça marche" fontSize={36} textAlign="center" fontWeight="900" color="#0f172a" />
        <SpacerBlock height={32} />
        <StepsBlock items={[
          { title: '1. Contact', desc: 'Prenez rendez-vous en ligne' },
          { title: '2. Diagnostic', desc: 'Analyse gratuite de vos besoins' },
          { title: '3. Devis', desc: 'Proposition personnalisée' },
          { title: '4. Réalisation', desc: 'Mise en œuvre par nos experts' },
        ]} />
      </Element>
    ),
  },
];

// ─────────────────────────────────────────────────────────
// MAIN TOOLBOX
// ─────────────────────────────────────────────────────────
export const GodToolbox = () => {
  const { connectors, actions, query } = useEditor();
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'blocks' | 'templates' | 'globals'>('blocks');
  const [search, setSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/page-components', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDbTemplates(data);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    }
  }, [activeTab]);

  useEffect(() => {
    window.addEventListener('god-templates-updated', fetchTemplates);
    return () => window.removeEventListener('god-templates-updated', fetchTemplates);
  }, []);

  const handleDeleteTemplate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce modèle ?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/page-components/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (response.ok) {
        toast.success("Modèle supprimé");
        fetchTemplates();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
      toast.error("Impossible de supprimer le modèle");
    }
  };

  const handleAddDbTemplate = (defaultStructure: string | object) => {
    try {
      const tree = typeof defaultStructure === 'string' ? JSON.parse(defaultStructure) : defaultStructure;
      actions.addNodeTree(tree, 'ROOT');
      toast.success('Modèle inséré avec succès');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'insertion du modèle');
    }
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return BLOCK_GROUPS;
    const q = search.toLowerCase();
    return BLOCK_GROUPS.map(g => ({
      ...g,
      items: g.items.filter(item =>
        item.label.toLowerCase().includes(q) ||
        item.tags.some(t => t.includes(q))
      )
    })).filter(g => g.items.length > 0);
  }, [search]);

  const handleAddTemplate = (factory: () => React.ReactElement) => {
    const rootNodes = query.getSerializedNodes();
    // We add the template to the ROOT node
    // This uses Craft.js's add method
    const el = factory();
    connectors.create(document.createElement('div'), el);
  };

  return (
    <div className={`${expanded ? 'w-56' : 'w-12'} transition-all duration-300 ease-in-out bg-[#12121f] border-r border-[#252538] h-full flex flex-col shrink-0 z-40 relative`}>

      {/* Header */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-[#252538] shrink-0">
        <span className={`text-slate-300 font-bold uppercase text-[10px] tracking-wider transition-opacity ${expanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
          {activeTab === 'blocks' ? 'Blocs' : activeTab === 'templates' ? 'Templates' : 'Globaux'}
        </span>
        <button
          onClick={() => setExpanded(v => !v)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#252538] transition-colors shrink-0"
          title={expanded ? 'Réduire' : 'Agrandir'}
        >
          {expanded ? '◀' : '▶'}
        </button>
      </div>

      {expanded && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-[#252538] shrink-0">
            <button
              onClick={() => setActiveTab('blocks')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'blocks' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Layers size={10} className="inline mr-1" />Blocs
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'templates' ? 'text-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <BookOpen size={10} className="inline mr-1" />Templates
            </button>
            <button
              onClick={() => setActiveTab('globals')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'globals' ? 'text-white border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Layers size={10} className="inline mr-1" />Globaux
            </button>
          </div>

          {/* Search (only in blocks tab) */}
          {activeTab === 'blocks' && (
            <div className="px-2 pt-2 pb-1 shrink-0">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full bg-[#0d0d1a] border border-[#252538] rounded-lg pl-7 pr-6 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {activeTab === 'blocks' ? (
          // ── BLOCKS TAB ──
          <div className="space-y-1">
            {filteredGroups.map(group => {
              const isCollapsed = collapsedGroups.has(group.label);
              const GroupIcon = group.icon;
              return (
                <div key={group.label}>
                  {expanded && (
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-[#1a1a2a] transition-colors"
                    >
                      <span className={`flex items-center gap-1.5 ${group.color}`}>
                        <GroupIcon size={10} />
                        {group.label}
                      </span>
                      <ChevronDown size={10} className={`text-slate-600 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                    </button>
                  )}

                  {!isCollapsed && (
                    <div className="px-1.5 space-y-0.5 pb-1">
                      {group.items.map(item => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.label}
                            ref={(ref) => { if (ref) connectors.create(ref, item.factory()); }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#1e1e30] text-slate-400 hover:text-white transition-all cursor-grab active:cursor-grabbing text-left group"
                            title={item.label}
                          >
                            <Icon size={14} className={`${item.color} shrink-0 group-hover:scale-110 transition-transform`} />
                            {expanded && (
                              <span className="text-xs font-medium truncate">{item.label}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredGroups.length === 0 && search && (
              <div className="px-3 py-6 text-center text-slate-600 text-xs">
                Aucun bloc trouvé pour "<span className="text-slate-400">{search}</span>"
              </div>
            )}
          </div>
        ) : activeTab === 'templates' ? (
          // ── TEMPLATES TAB ──
          <div className="px-2 space-y-4 pt-1">
            {/* Custom DB Templates */}
            <div>
              <div className="px-1 py-1 text-[9px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-[#252538]/50">
                <BookOpen size={10} />
                Mes Modèles ({dbTemplates.length})
              </div>
              
              {loadingTemplates ? (
                <div className="text-[10px] text-slate-500 text-center py-4">Chargement...</div>
              ) : dbTemplates.length === 0 ? (
                <div className="text-[10px] text-slate-600 text-center py-4 leading-normal">
                  Aucun modèle enregistré.<br />
                  Faites un clic droit sur un bloc pour l'enregistrer comme modèle.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {dbTemplates.map(tmpl => (
                    <div
                      key={tmpl.id}
                      onClick={() => handleAddDbTemplate(tmpl.default_structure)}
                      className="w-full text-left p-2.5 bg-[#0d0d1a] hover:bg-[#1a1a2a] border border-[#252538] hover:border-amber-500/30 rounded-lg transition-all group flex items-start justify-between cursor-pointer"
                      title="Cliquez pour insérer ce modèle au bas de la page"
                    >
                      <div className="flex items-start gap-2 truncate">
                        <span className="text-sm shrink-0">📁</span>
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                            {tmpl.name}
                          </div>
                          <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                            {tmpl.category || 'Mes Modèles'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteTemplate(e, tmpl.id)}
                        className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Supprimer ce modèle"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Default Static Templates */}
            <div>
              <div className="px-1 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-[#252538]/50">
                <Layers size={10} />
                Modèles Prédéfinis
              </div>
              <div className="space-y-1.5">
                {SECTION_TEMPLATES.map(tmpl => (
                  <button
                    key={tmpl.label}
                    ref={(ref) => { if (ref) connectors.create(ref, tmpl.factory()); }}
                    className="w-full text-left p-2.5 bg-[#0d0d1a] hover:bg-[#1a1a2a] border border-[#252538] hover:border-amber-500/30 rounded-lg transition-all cursor-grab active:cursor-grabbing group"
                    title={`Glisser: ${tmpl.label}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base shrink-0">{tmpl.emoji}</span>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {tmpl.label}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                          {tmpl.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <GlobalBlocksTab expanded={expanded} />
        )}
      </div>

      {/* Footer hint */}
      {expanded && (
        <div className="px-3 py-2 border-t border-[#252538] shrink-0">
          <p className="text-[9px] text-slate-600 text-center">Glissez un bloc sur le canvas →</p>
        </div>
      )}
    </div>
  );
};

// ── GLOBAL BLOCKS TAB ──
const GlobalBlocksTab = ({ expanded }: { expanded: boolean }) => {
  const { connectors, actions, query } = useEditor();
  const blocks = useGlobalBlocksStore((s) => s.blocks);
  const removeBlock = useGlobalBlocksStore((s) => s.removeBlock);

  const handleAddGlobal = (serializedNode: any) => {
    try {
      const tree = typeof serializedNode === 'string' ? JSON.parse(serializedNode) : serializedNode;
      actions.addNodeTree(tree, 'ROOT');
      toast.success('Bloc global inséré');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'insertion du bloc global');
    }
  };

  if (!expanded) return null;

  return (
    <div className="px-2 space-y-2 pt-1">
      <div className="px-1 py-1 text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-[#252538]/50">
        <Layers size={10} />
        Blocs Globaux ({blocks.length})
      </div>

      {blocks.length === 0 ? (
        <div className="text-[10px] text-slate-600 text-center py-6 leading-normal">
          Aucun bloc global.<br />
          Faites un clic droit sur un bloc et choisissez<br />
          <span className="text-emerald-400">"Enregistrer comme Global"</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {blocks.map((block) => (
            <div
              key={block.id}
              onClick={() => handleAddGlobal(block.serializedNode)}
              className="w-full text-left p-2.5 bg-[#0d0d1a] hover:bg-[#1a1a2a] border border-[#252538] hover:border-emerald-500/30 rounded-lg transition-all group flex items-start justify-between cursor-pointer"
              title="Cliquez pour insérer"
            >
              <div className="flex items-start gap-2 truncate">
                <span className="text-sm shrink-0">📦</span>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                    {block.name}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {block.category || 'Général'} · {new Date(block.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeBlock(block.id); toast.success('Bloc global supprimé'); }}
                className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                title="Supprimer"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
