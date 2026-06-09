
import { useGetPublicBlogPosts } from "@/hooks/useBlogPosts";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
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
            <div className="text-center text-gray-500">Chargement des actualités...</div>
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
            <p className="text-gray-500 latest-news-empty-msg">
              Aucun article publié pour le moment.
            </p>
          </div>
        </div>
      </section>);

  }

  return (
    <section
      className="py-24 lg:py-28 px-4 relative overflow-hidden bg-slate-50/80"
      style={styles}>

      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-proqblue/[0.03] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-3xl"></div>
      </div>

      <div className="container max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-proqblue/5 text-proqblue text-xs font-bold uppercase tracking-[0.2em] rounded-full px-5 py-2 mb-4 border border-proqblue/10">
              <Sparkles className="w-3.5 h-3.5" />
              Dernières Actualités
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontSize: styles?.fontSize }}
            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Blog & Actualités
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 max-w-2xl mx-auto text-lg">
            Restez informé des conseils techniques, tendances et innovations dans le secteur électrique
          </motion.p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {paginatedPosts.map((post, index) =>
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}>

              <Link
                to={`/blog/${post.slug}`}
                className="group block h-full">

                <div className="h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 hover:border-proqblue/20 overflow-hidden flex flex-col">
                  {/* Image */}
                  {post.cover_image_url ?
                    <div className="aspect-video overflow-hidden relative bg-slate-100">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy" />

                      {/* Category badge */}
                      {post.blog_categories?.name &&
                        <div className="absolute top-4 right-4">
                          <span className="bg-white/90 backdrop-blur-sm text-proqblue-dark text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                            {post.blog_categories.name}
                          </span>
                        </div>
                      }
                    </div> :
                    <div className="aspect-video bg-gradient-to-br from-proqblue/5 to-proqblue-dark/10 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-proqblue/30" />
                    </div>
                  }

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-proqblue transition-colors leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-grow leading-relaxed">
                      {post.excerpt || "Découvrez cet article intéressant..."}
                    </p>

                    {/* Meta */}
                    {post.published_at &&
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 pt-4 border-t border-slate-100">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(post.published_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    }

                    {/* CTA */}
                    <div className="flex items-center gap-1 text-sm font-semibold text-proqblue group-hover:gap-2 transition-all">
                      <span>Lire l'article</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
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
              className="rounded-lg border-slate-200">

              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
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
                    className={`rounded-lg ${page === pageNum ? 'bg-proqblue hover:bg-proqblue-dark' : 'border-slate-200'}`}>

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
              className="rounded-lg border-slate-200">

              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        }

        {/* CTA to see all */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center">

          <Link to="/blog">
            <Button size="lg" className="bg-proqblue hover:bg-proqblue-dark rounded-xl px-8 h-12 shadow-lg shadow-proqblue/20">
              Découvrir tous les articles
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>);

};
