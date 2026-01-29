
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2, Calendar, User, ArrowLeft, Share2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetBlogPostBySlug } from "@/hooks/useBlogPosts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useGetBlogPostBySlug(slug);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white">
      {post && (
        <SEO
          title={`${post.title} | Blog PROQUELEC`}
          description={post.excerpt || post.title}
        />
      )}
      <Header />

      <main className="pt-24 pb-20">
        {isLoading && (
          <div className="flex flex-col justify-center items-center py-40">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-500 font-medium">Chargement de l'article...</p>
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto text-center py-20 px-4">
            <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100">
              <h2 className="text-2xl font-bold mb-4">Oups !</h2>
              <p className="mb-6">Une erreur est survenue lors du chargement de l'article.</p>
              <Link to="/blog">
                <Button className="bg-red-600 hover:bg-red-700 font-bold">Retour au blog</Button>
              </Link>
            </div>
          </div>
        )}

        {!isLoading && !error && post && (
          <article className="animate-fade-in">
            {/* Post Header */}
            <header className="py-12 md:py-20 bg-slate-50 border-b border-slate-100 mb-12">
              <div className="container max-w-4xl mx-auto px-4">
                <Link to="/blog" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-8 hover:gap-3 transition-all">
                  <ArrowLeft className="w-4 h-4" />
                  Retour au blog
                </Link>

                <div className="flex flex-wrap gap-3 mb-6">
                  {post.blog_categories?.name && (
                    <Badge className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-1 text-sm font-bold border-none">
                      {post.blog_categories.name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-slate-200 text-slate-500 bg-white flex items-center gap-1.5 px-3">
                    <Clock className="w-3 h-3" />
                    5 min de lecture
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-8 leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      P
                    </div>
                    <span className="font-bold text-slate-900">Équipe PROQUELEC</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.published_at || post.created_at!)}
                  </div>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {post.cover_image_url && (
              <div className="container max-w-5xl mx-auto px-4 -mt-20 mb-16">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full max-h-[500px] object-cover"
                  />
                </div>
              </div>
            )}

            {/* Post Content */}
            <div className="container max-w-3xl mx-auto px-4">
              <div
                className="prose prose-lg md:prose-xl max-w-none text-slate-700 
                           prose-headings:text-slate-900 prose-headings:font-black 
                           prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                           prose-strong:text-slate-900 prose-img:rounded-3xl prose-img:shadow-lg
                           prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />

              {/* Share and Footer */}
              <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">Partager cet article :</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 text-blue-600">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <Link to="/blog">
                  <Button variant="outline" className="border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
                    Découvrir d'autres articles
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        )}

        {!isLoading && !error && !post && (
          <div className="max-w-xl mx-auto text-center py-20 px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Article non trouvé</h2>
            <p className="text-lg text-slate-600 mb-8">Désolé, nous n'avons pas pu trouver l'article que vous cherchez.</p>
            <Link to="/blog">
              <Button className="bg-blue-600 hover:bg-blue-700 font-bold h-12 px-8">
                Retour au blog
              </Button>
            </Link>
          </div>
        )}
      </main>

      <ScrollToTopButton />
      <Footer />
    </div>
  );
}
