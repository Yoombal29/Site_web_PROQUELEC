
import { useGetPublicBlogPosts } from "@/hooks/useBlogPosts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Sparkles } from "lucide-react";
import { useLiveSettings } from "@/hooks/useLiveSettings";

interface LatestNewsProps {
  styles?: React.CSSProperties;
}

export const LatestNews = ({ styles }: LatestNewsProps) => {
  const { data: posts, isLoading } = useGetPublicBlogPosts();
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { settings } = useLiveSettings();

  const publishedPosts = posts || [];
  const totalPages = Math.ceil(publishedPosts.length / pageSize);
  const paginatedPosts = publishedPosts.slice((page - 1) * pageSize, page * pageSize);

  const sectionStyle = {
    backgroundColor: settings?.background_color || '#f8f9fa'
  };

  const titleStyle = {
    color: settings?.primary_color || '#2376df',
    fontFamily: settings?.font_family || 'Roboto'
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4 latest-news-section" style={styles}>
        <style dangerouslySetInnerHTML={{
          __html: `
          .latest-news-section { background-color: ${styles?.backgroundColor || settings?.background_color || '#f8f9fa'}; }
          .latest-news-title { color: ${styles?.color || settings?.primary_color || '#2376df'}; font-family: ${settings?.font_family || 'Roboto'}; font-size: ${styles?.fontSize || 'inherit'}; }
        ` }} />
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 latest-news-title">
              Actualités & Blog
            </h2>
            <div className="text-center text-gray-600">Chargement des actualités...</div>
          </div>
        </div>
      </section>);

  }

  if (publishedPosts.length === 0) {
    return (
      <section className="py-20 px-4 latest-news-section" style={styles}>
        <style dangerouslySetInnerHTML={{
          __html: `
          .latest-news-section { background-color: ${styles?.backgroundColor || settings?.background_color || '#f8f9fa'}; }
          .latest-news-title { color: ${styles?.color || settings?.primary_color || '#2376df'}; font-family: ${settings?.font_family || 'Roboto'}; font-size: ${styles?.fontSize || 'inherit'}; }
          .latest-news-empty-msg { font-family: ${settings?.font_family || 'inherit'}; }
        ` }} />
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 latest-news-title">
              Actualités & Blog
            </h2>
            <p className="text-gray-600 latest-news-empty-msg">
              Aucun article publié pour le moment.
            </p>
          </div>
        </div>
      </section>);

  }

  return (
    <section
      className="py-20 px-4 relative overflow-hidden latest-news-section-main"
      style={styles}>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .latest-news-section-main {
          background-color: ${styles?.backgroundColor || settings?.background_color || '#f8f9fa'};
          --primary-color: ${styles?.color || settings?.primary_color || '#2376df'};
          --font-family: ${settings?.font_family || 'inherit'};
          --font-size: ${styles?.fontSize || 'inherit'};
        }
      ` }} />
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-proqblue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-proqblue/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block">
            <div className="flex items-center gap-2 justify-center mb-3">
              <Sparkles className="h-6 w-6 text-proqblue" />
              <span className="text-sm font-semibold text-proqblue uppercase tracking-wider">Dernières Actualités</span>
            </div>
            <h2
              style={{ fontSize: styles?.fontSize }}
              className="text-4xl md:text-5xl font-bold mb-4 text-[var(--primary-color)] font-[family-name:var(--font-family)]">
              
              Blog & Actualités
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg font-[family-name:var(--font-family)]">
            Restez informé des conseils techniques, tendances et innovations dans le secteur électrique
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {paginatedPosts.map((post, index) =>
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group h-full animate-in fade-in slide-in-from-bottom-4">
            
              <div className="h-full bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-proqblue/20 overflow-hidden flex flex-col">
                {/* Image */}
                {post.cover_image_url &&
              <div className="aspect-video overflow-hidden relative">
                    <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                
                    {/* Category badge */}
                    {post.blog_categories?.name &&
                <div className="absolute top-4 right-4">
                        <span className="bg-proqblue/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {post.blog_categories.name}
                        </span>
                      </div>
                }
                  </div>
              }

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Title */}
                  <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-proqblue transition-colors font-[family-name:var(--font-family)]">
                    {post.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow font-[family-name:var(--font-family)]">
                    {post.excerpt || "Découvrez cet article intéressant..."}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pt-4 border-t border-gray-100">
                    {post.published_at &&
                  <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(post.published_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                  }
                  </div>

                  {/* CTA */}
                  <div className="flex items-center text-sm font-medium text-proqblue group-hover:translate-x-1 transition-transform">
                    <span>Lire l'article</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 &&
        <div className="flex justify-center items-center gap-2 mb-12 flex-wrap">
            <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => {
              setPage(page - 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="rounded-lg">
            
              ← Précédent
            </Button>

            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="rounded-lg">
                  
                    {pageNum}
                  </Button>);

            })}
            </div>

            <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => {
              setPage(page + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="rounded-lg">
            
              Suivant →
            </Button>
          </div>
        }

        {/* CTA to see all */}
        <div className="text-center">
          <Link to="/blog">
            <Button size="lg" className="bg-proqblue hover:bg-proqblue-dark rounded-lg">
              Découvrir tous les articles
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>);

};