
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import DocumentsLibrary from "@/components/tools/DocumentsLibrary";
import {
  Download,
  ShieldAlert,
  Info,
  Sparkles,
  Zap,
  LayoutGrid,
  Settings2,
  Plus,
  Mail } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/useSession";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Documents = () => {
  const navigate = useNavigate();
  const { user } = useSession();
  const isAdmin = user?.role === 'admin';
  const [librarySearch, setLibrarySearch] = useState('');

  const scrollToLibrary = () => {
    document.getElementById('bibliotheque-documents')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleHeroSearch = (query: string) => {
    setLibrarySearch(query);
    if (query.trim().length > 1) scrollToLibrary();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SEO
        title="Documents & Ressources - PROQUELEC"
        description="Accédez à notre bibliothèque de documents techniques, guides de sécurité et normes électriques pour les professionnels du Sénégal." />
      

      <Header />

      <main className="relative">
        <HeroSection
          badge="Ressources Techniques"
          title="Documents & Ressources"
          subtitle="L'expertise technique à portée de main"
          description="Retrouvez l'intégralité des guides techniques, mémos de sécurité et textes réglementaires de PROQUELEC pour vos projets."
          gradient="bg-gradient-to-br from-proqblue-dark via-blue-900 to-slate-900"
          showSearch={true}
          searchPlaceholder="Rechercher un guide, une norme..."
          onSearch={handleHeroSearch} />
        
        <section id="bibliotheque-documents" className="py-14 px-4 relative scroll-mt-28">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-100 to-transparent pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <DocumentsLibrary externalSearchQuery={librarySearch} />
          </div>
        </section>


        {/* Floating Admin Button */}
        {isAdmin &&
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 right-8 z-50">
          
            <Button
            className="rounded-full h-16 w-16 shadow-2xl bg-proqblue hover:bg-proqblue-dark border-4 border-white group"
            onClick={() => navigate('/admin')}>
            
              <Settings2 className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </Button>
          </motion.div>
        }

        {/* Editorial Help Section */}
        <section className="px-4 py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-slate-100 to-transparent pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="rounded-3xl border border-white bg-white/80 p-5 shadow-xl shadow-slate-200/60 backdrop-blur md:p-6 xl:sticky xl:top-[var(--effective-header-height,110px)] xl:self-start">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                  <LayoutGrid className="h-4 w-4" />
                  Mini guide
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    {
                      title: 'Pour comprendre',
                      desc: 'Commencer par un guide technique complet.',
                      color: 'bg-blue-600',
                    },
                    {
                      title: 'Pour intervenir',
                      desc: 'Utiliser un mémento ou un feuillet sur chantier.',
                      color: 'bg-red-500',
                    },
                    {
                      title: 'Pour sensibiliser',
                      desc: 'Partager un dépliant clair avec les usagers.',
                      color: 'bg-green-500',
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${item.color}`}></span>
                        <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                      </div>
                      <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-blue-700 p-4 text-white shadow-lg shadow-blue-900/20">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/15 p-2">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                        Rappel utile
                      </p>
                      <p className="text-sm font-black">Toujours vérifier la version du document.</p>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <Badge variant="outline" className="mb-3 rounded-full bg-white px-3 py-1 text-blue-700">
                      Sélection rapide
                    </Badge>
                    <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                      Ressources <span className="text-proqblue">à consulter en priorité</span>
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
                      Ces couvertures servent de raccourcis visuels vers les documents les plus utiles :
                      référentiel, guides, mémentos, feuillets et dépliants.
                    </p>
                  </div>

                  {isAdmin && (
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl border-proqblue text-proqblue hover:bg-proqblue/5 font-bold md:w-auto"
                      onClick={() => navigate('/admin')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une ressource
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    {
                      kind: 'Référentiel',
                      title: 'Référentiel PROQUELEC',
                      desc: 'Le document de base pour cadrer les critères, démarches et exigences qualité.',
                      href: '/word/Referentiel-PROQUELEC.doc',
                      color: 'from-slate-950 to-blue-950',
                      chip: 'bg-slate-900 text-white',
                    },
                    {
                      kind: 'Guide technique',
                      title: 'Installation résidentielle',
                      desc: 'À utiliser pour préparer une installation domestique conforme et lisible.',
                      href: '/word/guide-installation-residentielle.doc',
                      color: 'from-blue-700 to-blue-950',
                      chip: 'bg-blue-600 text-white',
                    },
                    {
                      kind: 'Guide technique',
                      title: 'Vérifications et entretien',
                      desc: 'La référence pratique pour organiser le contrôle et le suivi d’une installation.',
                      href: '/word/guide-verifications-entretien-installations.doc',
                      color: 'from-cyan-600 to-blue-900',
                      chip: 'bg-blue-600 text-white',
                    },
                    {
                      kind: 'Mémento',
                      title: 'Protections électriques',
                      desc: 'Un aide-mémoire rapide pour retrouver les protections essentielles.',
                      href: '/word/memento-protections-electriques.doc',
                      color: 'from-red-500 to-red-800',
                      chip: 'bg-red-500 text-white',
                    },
                    {
                      kind: 'Feuillet technique',
                      title: 'Mise à la terre',
                      desc: 'Une fiche courte pour les points de vigilance terrain.',
                      href: '/word/feuillet-mise-a-la-terre.doc',
                      color: 'from-yellow-400 to-amber-600',
                      chip: 'bg-yellow-400 text-slate-950',
                    },
                    {
                      kind: 'Dépliant',
                      title: 'Choisir un électricien agréé',
                      desc: 'Un support de sensibilisation simple à partager avec les ménages.',
                      href: '/word/depliant-choisir-electricien-agree.doc',
                      color: 'from-emerald-500 to-green-800',
                      chip: 'bg-green-500 text-white',
                    },
                  ].map((doc) => (
                    <article
                      key={doc.href}
                      className="group flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10"
                    >
                      <div className={`relative min-h-48 bg-gradient-to-br ${doc.color} p-5 text-white`}>
                        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:22px_22px]"></div>
                        <div className="relative flex h-full min-h-40 flex-col justify-between rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                          <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${doc.chip}`}>
                            {doc.kind}
                          </span>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                              PROQUELEC
                            </p>
                            <h3 className="mt-2 text-2xl font-black leading-tight">{doc.title}</h3>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <p className="text-sm font-semibold leading-relaxed text-slate-600">{doc.desc}</p>
                        <a
                          href={doc.href}
                          className="mt-auto inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/10 transition hover:bg-blue-800"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </a>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      icon: ShieldAlert,
                      title: 'Conformité',
                      desc: 'Regrouper le référentiel, le guide adapté et les feuillets de contrôle avant validation.',
                    },
                    {
                      icon: Zap,
                      title: 'Mises à jour',
                      desc: 'Vérifier régulièrement les versions utilisées dans les dossiers techniques.',
                    },
                    {
                      icon: Info,
                      title: 'Support',
                      desc: "Besoin d'un document spécifique ? Contactez le centre de documentation technique.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-proqblue">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="px-4 mb-20">
          <div className="max-w-7xl mx-auto rounded-[3rem] bg-slate-900 p-12 md:p-20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-proqblue/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-proqblue/30 transition-colors duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-500/30">
                <Mail className="w-3 h-3" /> Veille Réglementaire
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-[1.1] tracking-tighter italic">
                Ne manquez aucune <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">évolution normative.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Inscrivez-vous à notre newsletter technique pour recevoir les alertes sur les nouveaux guides et amendements directement dans votre boîte mail.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                <Input
                  className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 focus:ring-proqblue focus:bg-white/10 transition-all"
                  placeholder="votre@email.com" />
                
                <Button className="h-14 bg-proqblue hover:bg-proqblue-dark text-white rounded-2xl px-10 font-black shadow-xl shadow-blue-950 transition-all active:scale-95">
                  Rejoindre la veille
                </Button>
              </div>
            </div>

            <div className="hidden lg:block absolute right-20 top-1/2 -translate-y-1/2">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-64 h-[400px] bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm p-8 shadow-2xl relative">
                
                <div className="space-y-6">
                  <div className="h-4 w-12 bg-white/10 rounded-full" />
                  <div className="h-10 w-full bg-white/10 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/5 rounded-full" />
                    <div className="h-2 w-full bg-white/5 rounded-full" />
                    <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                  </div>
                  <div className="pt-8 grid grid-cols-2 gap-4">
                    <div className="aspect-square bg-blue-500/20 rounded-2xl" />
                    <div className="aspect-square bg-white/5 rounded-2xl" />
                  </div>
                  <div className="h-12 w-full bg-blue-600 rounded-2xl shadow-lg shadow-blue-900" />
                </div>
                {/* Decorative floaters */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-proqblue rounded-full blur-3xl opacity-20"></div>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <ScrollToTopButton aria-label="Action" />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-slow-spin {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` }} />
    </div>);

};

export default Documents;
