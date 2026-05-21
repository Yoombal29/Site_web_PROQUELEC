// Types pour le système de contenu enrichi

export type LayoutType = 'left-right' | 'right-left' | 'centered' | 'full-width' | 'grid-2' | 'grid-3' | 'grid-4' | 'carousel' | 'accordion' | 'tabs' | 'masonry';

export type ComponentType =
    | 'hero'
    | 'text-image'
    | 'features-list'
    | 'stats'
    | 'testimonials'
    | 'pricing'
    | 'cta'
    | 'form'
    | 'gallery'
    | 'video'
    | 'faq'
    | 'custom-html';

export interface StyleSettings {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    borderColor?: string;
    borderWidth?: string;
    borderRadius?: string;
    padding?: string;
    margin?: string;
    fontSize?: string;
    fontWeight?: string;
    maxWidth?: string;
    textAlign?: 'left' | 'center' | 'right';
    shadow?: string;
    gradient?: string;
}

export interface MediaContent {
    type: 'image' | 'video' | 'gallery';
    url?: string;
    urls?: string[]; // Pour les galeries
    alt?: string;
    caption?: string;
    aspectRatio?: string;
    objectFit?: 'cover' | 'contain' | 'fill';
}

export interface ButtonConfig {
    text: string;
    url?: string;
    onclick?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    iconPosition?: 'left' | 'right';
}

export interface FeatureItem {
    icon?: string;
    title: string;
    description?: string;
    link?: string;
}

export interface StatItem {
    value: string | number;
    label: string;
    icon?: string;
    suffix?: string;
    prefix?: string;
}

export interface TestimonialItem {
    name: string;
    role?: string;
    company?: string;
    avatar?: string;
    content: string;
    rating?: number;
}

export interface PricingTier {
    name: string;
    price: string | number;
    period?: string;
    features: string[];
    highlighted?: boolean;
    buttonText?: string;
    buttonUrl?: string;
}

export interface FormField {
    name: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[]; // Pour select, radio
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface SectionContent {
    id: string;
    type: ComponentType;
    layout?: LayoutType;
    visible?: boolean;
    order?: number;

    // Contenu général
    title?: string;
    subtitle?: string;
    description?: string;
    badge?: string;

    // Médias
    media?: MediaContent;

    // Listes
    features?: FeatureItem[];
    stats?: StatItem[];
    testimonials?: TestimonialItem[];
    pricing?: PricingTier[];
    faq?: FAQItem[];

    // Actions
    buttons?: ButtonConfig[];

    // Formulaire
    formFields?: FormField[];
    formAction?: string;
    formMethod?: 'POST' | 'GET';

    // HTML personnalisé
    customHTML?: string;

    // Styles
    styles?: StyleSettings;
    customCSS?: string;

    // Animation
    animation?: {
        type?: 'fade' | 'slide' | 'zoom' | 'none';
        duration?: number;
        delay?: number;
    };

    // Métadonnées
    metadata?: {
        author?: string;
        lastModified?: string;
        version?: string;
    };
}

export interface PageContent {
    // En-tête de page
    hero: {
        badge?: string;
        title: string;
        subtitle?: string;
        backgroundImage?: string;
        backgroundVideo?: string;
        gradient?: string;
        buttons?: ButtonConfig[];
        height?: string;
    };

    // Navigation des sections
    navigation?: {
        sticky?: boolean;
        style?: 'tabs' | 'pills' | 'underline';
        items: Array<{
            id: string;
            label: string;
            icon?: string;
        }>;
    };

    // Sections de contenu
    sections: SectionContent[];

    // Footer personnalisé (optionnel)
    footer?: {
        content?: string;
        links?: Array<{
            label: string;
            url: string;
        }>;
    };

    // Paramètres globaux de la page
    settings?: {
        theme?: 'light' | 'dark' | 'auto';
        accentColor?: string;
        fontFamily?: string;
        maxWidth?: string;
        customCSS?: string;
        customJS?: string;
    };

    // Mode de rendu
    renderMode?: 'sections' | 'html';
    customHTML?: string;
}

export interface PageDefinition {
    key: string;
    label: string;
    icon?: string;
    themeColor?: string;
    content: PageContent;
}
