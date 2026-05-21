
import { useEffect } from 'react';
import { useSEO } from './useSEO';

interface PageSEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
}

export function usePageSEO({
  title,
  description,
  keywords,
  canonical,
  ogImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop&auto=format'
}: PageSEOProps) {
  const { updateSEO } = useSEO({
    title: `${title} | PROQUELEC`,
    description,
    keywords: keywords || 'électricité, sécurité, qualité, installation, Sénégal, PROQUELEC',
    author: 'PROQUELEC',
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogUrl: canonical || window.location.href,
    twitterCard: 'summary_large_image',
    canonical: canonical || window.location.href,
    robots: 'index, follow'
  });

  useEffect(() => {


  }, [title]);

  return { updateSEO };
}