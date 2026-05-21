
import { apiFetch } from '@/lib/api-client';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private baseUrl: string;

  constructor(baseUrl: string = window.location.origin) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async generateSitemap(): Promise<string> {
    const urls: SitemapUrl[] = [];

    // Pages statiques et CMS
    urls.push(
      // Navigation Principale
      { loc: '/', changefreq: 'daily', priority: 1.0 },
      { loc: '/about', changefreq: 'monthly', priority: 0.9 },
      { loc: '/activities', changefreq: 'monthly', priority: 0.8 },
      { loc: '/actualites-evenements', changefreq: 'weekly', priority: 0.8 },
      { loc: '/blog', changefreq: 'daily', priority: 0.9 },
      { loc: '/labels', changefreq: 'monthly', priority: 0.8 },
      { loc: '/partenaires', changefreq: 'monthly', priority: 0.7 },
      { loc: '/contact', changefreq: 'monthly', priority: 0.9 },
      { loc: '/contact-premium', changefreq: 'monthly', priority: 0.8 },
      { loc: '/legal', changefreq: 'yearly', priority: 0.3 },
      
      // Formation & Apprentissage
      { loc: '/formation-certification', changefreq: 'monthly', priority: 0.8 },
      { loc: '/certifications', changefreq: 'monthly', priority: 0.8 },
      { loc: '/formations', changefreq: 'monthly', priority: 0.8 },
      { loc: '/formations-proquelec', changefreq: 'monthly', priority: 0.8 },
      
      // Normes & Ressources
      { loc: '/normes-ressources', changefreq: 'monthly', priority: 0.8 },
      { loc: '/expertises-techniques', changefreq: 'monthly', priority: 0.8 },
      { loc: '/projets-realisations', changefreq: 'monthly', priority: 0.7 },
      
      // Espace Professionnel
      { loc: '/outils', changefreq: 'weekly', priority: 0.9 },
      { loc: '/showroom', changefreq: 'monthly', priority: 0.8 },
      { loc: '/ged', changefreq: 'weekly', priority: 0.7 },
      { loc: '/schema-builder', changefreq: 'weekly', priority: 0.7 },
      { loc: '/avantages', changefreq: 'monthly', priority: 0.8 },
      { loc: '/rubrique-selector', changefreq: 'monthly', priority: 0.6 },
      
      // Piliers & Espaces
      { loc: '/utilite-publique', changefreq: 'monthly', priority: 0.8 },
      { loc: '/autorites', changefreq: 'monthly', priority: 0.8 },
      { loc: '/menages', changefreq: 'monthly', priority: 0.8 },
      { loc: '/professionnels', changefreq: 'monthly', priority: 0.8 },
      { loc: '/presse', changefreq: 'monthly', priority: 0.8 },
      { loc: '/social', changefreq: 'monthly', priority: 0.8 },
      { loc: '/espace-menages', changefreq: 'monthly', priority: 0.7 },
      { loc: '/espace-professionnels', changefreq: 'monthly', priority: 0.7 },
      { loc: '/espace-autorites', changefreq: 'monthly', priority: 0.7 },
      
      // Ressources & Documentation
      { loc: '/documents', changefreq: 'weekly', priority: 0.8 },
      { loc: '/events', changefreq: 'weekly', priority: 0.8 },
      
      // Expert Lab (IA)
      { loc: '/expert', changefreq: 'weekly', priority: 0.7 },
      { loc: '/expert-lab', changefreq: 'monthly', priority: 0.7 },
      { loc: '/expert/chat', changefreq: 'weekly', priority: 0.6 },
      { loc: '/expert/calculators', changefreq: 'weekly', priority: 0.6 },
      { loc: '/expert/scanner', changefreq: 'weekly', priority: 0.6 },
      { loc: '/expert/history', changefreq: 'monthly', priority: 0.5 },
      { loc: '/expert/logs', changefreq: 'daily', priority: 0.4 }
    );

    try {
      // Pages dynamiques depuis la base de données (API locale)
      const pages = await apiFetch<unknown[]>('/api/pages');

      if (pages) {
        urls.push(...pages.filter((p) => p.is_published).map((page) => ({
          loc: `/${page.slug}`,
          lastmod: page.updated_at,
          changefreq: 'monthly' as const,
          priority: 0.7
        })));
      }

      // Articles de blog
      const posts = await apiFetch<unknown[]>('/api/blog-posts');

      if (posts) {
        urls.push(...posts.filter((p) => p.published_at).map((post) => ({
          loc: `/blog/${post.slug}`,
          lastmod: post.published_at,
          changefreq: 'monthly' as const,
          priority: 0.6
        })));
      }

      // Événements
      const events = await apiFetch<unknown[]>('/api/events');

      if (events) {
        const now = new Date().toISOString();
        urls.push(...events.filter((e) => e.date >= now).map((event) => ({
          loc: `/events#${event.id}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly' as const,
          priority: 0.5
        })));
      }

    } catch (error) {
      console.error('Erreur génération sitemap:', error);
    }

    return this.generateXML(urls);
  }

  private generateXML(urls: SitemapUrl[]): string {
    const urlElements = urls.map((url) => {
      const fullUrl = `${this.baseUrl}${url.loc}`;
      let xml = `    <url>\n      <loc>${fullUrl}</loc>\n`;

      if (url.lastmod) {
        xml += `      <lastmod>${new Date(url.lastmod).toISOString()}</lastmod>\n`;
      }

      if (url.changefreq) {
        xml += `      <changefreq>${url.changefreq}</changefreq>\n`;
      }

      if (url.priority !== undefined) {
        xml += `      <priority>${url.priority}</priority>\n`;
      }

      xml += '    </url>';
      return xml;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
  }

  async downloadSitemap(): Promise<void> {
    try {
      const sitemap = await this.generateSitemap();
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement sitemap:', error);
    }
  }
}

export const sitemapGenerator = new SitemapGenerator();