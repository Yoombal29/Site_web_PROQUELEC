
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

    // Pages statiques
    urls.push(
      { loc: '/', changefreq: 'daily', priority: 1.0 },
      { loc: '/about', changefreq: 'monthly', priority: 0.8 },
      { loc: '/activities', changefreq: 'monthly', priority: 0.8 },
      { loc: '/labels', changefreq: 'monthly', priority: 0.8 },
      { loc: '/contact', changefreq: 'monthly', priority: 0.9 },
      { loc: '/blog', changefreq: 'daily', priority: 0.9 },
      { loc: '/events', changefreq: 'weekly', priority: 0.8 },
      { loc: '/documents', changefreq: 'weekly', priority: 0.7 },
      { loc: '/legal', changefreq: 'yearly', priority: 0.3 }
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