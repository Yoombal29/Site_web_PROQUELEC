
import { useEffect } from 'react';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  canonical?: string;
  robots?: string;
}

export function useSEO(seoData: SEOData) {
  useEffect(() => {
    // Mise à jour du titre
    if (seoData.title) {
      document.title = seoData.title;
    }

    // Création ou mise à jour des meta tags
    const updateMetaTag = (name: string, content: string, property?: string) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Meta tags de base
    if (seoData.description) {
      updateMetaTag('description', seoData.description);
    }
    
    if (seoData.keywords) {
      updateMetaTag('keywords', seoData.keywords);
    }
    
    if (seoData.author) {
      updateMetaTag('author', seoData.author);
    }
    
    if (seoData.robots) {
      updateMetaTag('robots', seoData.robots);
    }

    // Open Graph
    if (seoData.ogTitle) {
      updateMetaTag('og:title', String(seoData.ogTitle), 'property');
    }
    
    if (seoData.ogDescription) {
      updateMetaTag('og:description', String(seoData.ogDescription), 'property');
    }
    
    if (seoData.ogImage) {
      updateMetaTag('og:image', String(seoData.ogImage), 'property');
    }
    
    if (seoData.ogUrl) {
      updateMetaTag('og:url', String(seoData.ogUrl), 'property');
    }

    // Twitter Card
    if (seoData.twitterCard) {
      updateMetaTag('twitter:card', String(seoData.twitterCard));
    }

    // Canonical URL
    if (seoData.canonical) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', seoData.canonical);
    }

    // Schema.org JSON-LD
    const generateSchema = () => {
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "PROQUELEC",
        "description": seoData.description || "Syndicat professionnel des entrepreneurs en équipements électriques",
        "url": seoData.ogUrl || window.location.origin,
        "logo": seoData.ogImage,
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": "French"
        }
      };
    };

    // Injection du schema
    let schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(generateSchema());

  }, [seoData]);

  return {
    updateSEO: (newSeoData: SEOData) => {
      // Cette fonction permettrait de mettre à jour le SEO dynamiquement
    }
  };
}
