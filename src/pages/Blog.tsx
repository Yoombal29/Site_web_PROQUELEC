import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/HeroSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Loader2, ArrowRight, Calendar, User, Search, Filter, BookOpen, TrendingUp, Users, Star } from "lucide-react";
import { useGetPublicBlogPosts } from "@/hooks/useBlogPosts";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const Blog = () => {
  const { data: articles, isLoading, error } = useGetPublicBlogPosts();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const pageSize = 6;

  // Filtrage
  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !selectedCategory || article.blog_categories?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    if (!articles) return [];
    const cats = articles
      .map(a => a.blog_categories?.name)
      .filter((v, i, arr) => v && arr.indexOf(v) === i);
    return cats as string[];
  }, [articles]);

  const totalPages = useMemo(() => Math.ceil(filteredArticles.length / pageSize), [filteredArticles]);
  const paginatedArticles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredArticles.slice(start, start + pageSize);
  }, [filteredArticles, page]);

  const stats = [
    { label: "Articles publiés", value: articles?.length || "0", icon: BookOpen, color: "#3b82f6" },
    { label: "Lecteurs actifs", value: "2500+", icon: Users, color: "#10b981" },
    { label: "Articles populaires", value: "95%", icon: TrendingUp, color: "#f59e0b" },
    { label: "Taux de satisfaction", value: "4.8/5", icon: Star, color: "#dc2626" }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SEO
        title="Blog | PROQUELEC Sénégal"
        description="Actualités, conseils et expertises du secteur électrique. Restez informé des dernières normes, technologies et meilleures pratiques."
        keywords="blog électrique, actualités, conseils, normes électriques, PROQUELEC, Sénégal"
        canonical="https://proquelec.sn/blog"
      />
      <Header />

      <main className="pt-0">
        {/* Hero Section */}
        <HeroSection
          badge="📝 BLOG & ACTUALITÉS"
          title="Actualités & Conseils"
          subtitle="Restez informé du secteur électrique"
          description="Découvrez nos articles experts sur les normes électriques, les meilleures pratiques, les innovations technologiques et l'actualité du secteur au Sénégal."
          gradient="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800"
          buttons={[
            { label: "Voir tous les articles", href: "#articles", variant: "primary" },
            { label: "S'abonner", href: "#newsletter", variant: "secondary" }
          ]}
        />

        {/* Section Statistiques */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                PROQUELEC <span className="text-blue-600">Blog</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Votre source d'information de référence sur l'électricité au Sénégal
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Recherche et Filtres */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recherche */}
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10 h-12 text-base"
                  />
                </div>

                {/* Filtre Catégories */}
                <div className="relative">
                  <Filter className="absolute left-3 top-3 text-gray-400 z-10" size={20} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-3 h-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none bg-white text-base"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Articles */}
        <section id="articles" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-blue-600 font-medium">Chargement des articles...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg mb-8 border border-red-200">
                <p className="font-semibold mb-2">Erreur lors du chargement des articles</p>
                <p className="text-sm">Veuillez vérifier les autorisations de lecture publique dans Supabase.</p>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {paginatedArticles && paginatedArticles.length > 0 ? (
                  <>
                    {/* Résultats */}
                    {(searchTerm || selectedCategory) && (
                      <div className="text-center mb-8">
                        <p className="text-sm text-gray-600">
                          {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} trouvé{filteredArticles.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    {/* Grille d'articles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                      {paginatedArticles.map(article => (
                        <Link
                          to={`/blog/${article.slug}`}
                          key={article.id}
                          className="group"
                        >
                          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden h-full group-hover:-translate-y-1">
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                              <img
                                src={article.cover_image_url || '/placeholder.svg'}
                                alt={`Image de couverture pour ${article.title}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {article.blog_categories?.name && (
                                <Badge className="absolute top-3 left-3 bg-blue-600 text-white border-0">
                                  {article.blog_categories.name}
                                </Badge>
                              )}
                            </div>

                            {/* Contenu */}
                            <CardContent className="p-6 flex flex-col flex-grow">
                              <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2 leading-tight">
                                {article.title}
                              </CardTitle>

                              <CardDescription className="text-gray-600 mb-4 flex-grow line-clamp-3 leading-relaxed">
                                {article.excerpt}
                              </CardDescription>

                              {/* Métadonnées */}
                              <div className="pt-4 border-t border-gray-100 text-sm text-gray-500 space-y-2">
                                {article.created_at && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(article.created_at)}
                                  </div>
                                )}
                                {article.author && (
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {article.author}
                                  </div>
                                )}
                              </div>

                              {/* CTA */}
                              <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:underline">
                                Lire la suite
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center">
                        <Pagination className="mt-10">
                          <PaginationContent>
                            {Array.from({ length: totalPages }, (_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  isActive={page === i + 1}
                                  href="#"
                                  onClick={e => {
                                    e.preventDefault();
                                    setPage(i + 1);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      Aucun article ne correspond
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Essayez d'affiner votre recherche ou réinitialisez les filtres.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("");
                        setPage(1);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Section Newsletter */}
        <section id="newsletter" className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Restez informé de nos publications
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Recevez les derniers articles et actualités du secteur électrique directement dans votre boîte mail.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Votre adresse email..."
                  className="flex-1 h-12 bg-white text-gray-900 border-0"
                />
                <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 h-12 whitespace-nowrap">
                  S'abonner
                </Button>
              </div>

              <p className="text-sm text-blue-200 mt-4">
                En vous abonnant, vous acceptez de recevoir notre newsletter. Vous pouvez vous désabonner à tout moment.
              </p>
            </div>
          </div>
        </section>
      </main>

      <ScrollToTopButton />
      <Footer />
    </div>
  );
};

export default Blog;
