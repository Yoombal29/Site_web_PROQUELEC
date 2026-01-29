import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  author?: string;
  ogType?: string;
  twitterCard?: string;
  keywords?: string | string[];
  robots?: string;
  schema?: Record<string, any>;
  path?: string;
  type?: string;
}

export function SEO({
  title,
  description,
  canonical,
  image = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop',
  author = 'PROQUELEC',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  keywords = '',
  robots = 'index, follow',
  schema,
  path = '/'
}: SEOProps) {
  const fullTitle = `${title} | PROQUELEC - Qualité Électrique au Sénégal`;
  const baseUrl = 'https://proquelec.sn';
  const canonicalUrl = canonical || `${baseUrl}${path}`;
  
  // Convert keywords array to string if needed
  const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  const schemaMarkup = schema || {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PROQUELEC',
    url: baseUrl,
    logo: 'https://proquelec.sn/logo.png',
    description: description,
    image: image,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Immeubles Coumba Castel',
      addressLocality: 'Dakar',
      addressCountry: 'SN'
    },
    telephone: '+221 76 644 76 06',
    email: 'omarkebe@proquelec.sn',
    sameAs: [
      'https://facebook.com/proquelec',
      'https://linkedin.com/company/proquelec',
      'https://twitter.com/proquelec'
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="PROQUELEC" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@proquelec" />

      {/* Additional Tags */}
      <meta name="theme-color" content="#2376df" />
      <meta name="color-scheme" content="light dark" />
      <meta name="msapplication-TileColor" content="#2376df" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>
    </Helmet>
  );
}

export default SEO;
