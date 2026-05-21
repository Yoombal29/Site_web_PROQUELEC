import React from 'react';
import { useDynamicComponents } from '@/hooks/useDynamicSystems';
import { HeroSection } from './HeroSection';
import { NewsletterSignup } from './NewsletterSignup';
import { MediaGallery } from './MediaGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DynamicRendererProps {
  componentType?: string;
  componentName?: string;
  fallback?: React.ReactNode;
}

export function DynamicRenderer({ componentType, componentName, fallback }: DynamicRendererProps) {
  const { data: components, isLoading, error } = useDynamicComponents(componentType);

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>;
  }

  if (error) {
    console.error('Erreur chargement composant dynamique:', error);
    return fallback || null;
  }

  const component = componentName ?
  components?.find((c) => c.name === componentName) :
  components?.[0];

  if (!component) {
    return fallback || null;
  }

  return <DynamicComponentRenderer component={component} />;
}

interface DynamicComponentRendererProps {
  component: unknown;
}

function DynamicComponentRenderer({ component }: DynamicComponentRendererProps) {
  const { component_type, title, subtitle, content, settings } = component;

  switch (component_type) {
    case 'hero':
      return (
        <HeroSection
          title={title || content?.title || ""}
          subtitle={subtitle || content?.subtitle || ""}
          backgroundImage={content?.backgroundImage}
          buttons={content?.ctaText && content?.ctaLink ? [{
            label: content.ctaText,
            href: content.ctaLink,
            variant: "primary"
          }] : []} />);



    case 'newsletter':
      return (
        <NewsletterSignup
          variant={settings.variant || 'card'}
          className={settings.className} />);



    case 'gallery':
      return (
        <MediaGallery />);


    case 'cta':
      return (
        <div className={`text-center p-8 ${settings.className || ''}`}>
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          {subtitle && <p className="text-lg mb-6 text-gray-600">{subtitle}</p>}
          <Button
            size={settings.buttonSize || 'lg'}
            variant={settings.buttonVariant || 'default'}
            asChild>
            
            <a href={content.link || '#'}>{content.buttonText || 'En savoir plus'}</a>
          </Button>
        </div>);


    case 'testimonial':
      return (
        <Card className={settings.className}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-lg italic mb-4">"{content.quote}"</blockquote>
            <cite className="text-sm text-gray-600">- {content.author}</cite>
          </CardContent>
        </Card>);


    case 'feature':
      return (
        <div className={`text-center p-6 ${settings.className || ''}`}>
          <div className="mb-4">{content.icon}</div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>);


    default:
      return (
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            Composant dynamique non reconnu: {component_type}
          </p>
        </div>);

  }
}

// Hook pour rendre un composant spécifique
export function useDynamicComponent(name: string) {
  const { data: components } = useDynamicComponents();
  return components?.find((c) => c.name === name);
}

// Composant pour rendre tous les composants d'un type
export function DynamicComponentsList({ type, className = '' }: {type: string;className?: string;}) {
  const { data: components, isLoading } = useDynamicComponents(type);

  if (isLoading) {
    return <div className="space-y-4">
      {[...Array(3)].map((_, i) =>
      <div key={i} className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
      )}
    </div>;
  }

  if (!components?.length) {
    return null;
  }

  return (
    <div className={className}>
      {components.map((component) =>
      <DynamicComponentRenderer key={component.id} component={component} />
      )}
    </div>);

}