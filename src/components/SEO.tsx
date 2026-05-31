import { Helmet } from 'react-helmet-async';
import { useLiveSettings } from '@/hooks/useLiveSettings';

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
  schema?: Record<string, unknown>;
  path?: string;
  type?: string;
}

export function SEO({
  title,
  description,
  canonical,
  image,
  author,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  keywords = '',
  robots = 'index, follow',
  schema,
  path = '/'
}: SEOProps) {
  const { settings } = useLiveSettings();

  const siteName = settings?.site_name || 'PROQUELEC';
  const fullTitle = `${title} | ${siteName} - Qualité Électrique au Sénégal`;
  const baseUrl = window.location.origin;
  const canonicalUrl = canonical || `${baseUrl}${path}`;
  const defaultImage = settings?.logo_url || 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=630&fit=crop';
  const siteImage = image || defaultImage;
  const siteAuthor = author || siteName;

  // Convert keywords array to string if needed
  const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  const schemaMarkup = schema || {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: baseUrl,
    logo: settings?.logo_url || `${baseUrl}/logo.png`,
    description: description || settings?.slogan,
    image: siteImage,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings?.address || 'Dakar',
      addressLocality: 'Dakar',
      addressCountry: 'SN'
    },
    telephone: settings?.phone_number || '+221 33 848 68 55',
    email: settings?.contact_email || 'proquelec@proquelec.sn',
    sameAs: [
    settings?.facebook_url,
    settings?.linkedin_url,
    settings?.twitter_url].
    filter(Boolean)
  };

  const themeColor = settings?.primary_color || '#2376df';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content={siteAuthor} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={siteImage} />
      <meta property="twitter:creator" content={`@${siteName.toLowerCase().replace(/\s+/g, '')}`} />

      {/* Additional Tags */}
      <meta name="theme-color" content={themeColor} />
      <meta name="color-scheme" content="light dark" />
      <meta name="msapplication-TileColor" content={themeColor} />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>
    </Helmet>);

}

export default SEO;