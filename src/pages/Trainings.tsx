
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import {
  BookOpen,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Zap,
  ShieldCheck,
  GraduationCap,
  Calendar,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Trainings = () => {
  const formationCategories = [
    {
      title: "Installations & Normes",
      icon: Layers,
      formations: [
        {
          title: "Basse Tension (NFC 15-100)",
          duration: "40h (5 jours)",
          level: "Tous niveaux",
          description: "Maîtrisez les règles de conception et de réalisation des installations électriques basse tension."
        },
        {
          title: "Mise à la Terre & Parasurtenseurs",
          duration: "16h (2 jours)",
          level: "Intermédiaire",
          description: "Spécialisation sur la protection des équipements et la sécurité des personnes."
        }
      ]
    },
    {
      title: "Sécurité & Habilitation",
      icon: ShieldCheck,
      formations: [
        {
          title: "Habilitation Électrique (B1, B2, BR, BC)",
          duration: "24h (3 jours)",
          level: "Professionnel",
          description: "Préparation à l'habilitation pour l'exécution de travaux sur ou au voisinage des installations."
        },
        {
          title: "Risques Électriques & Prévention",
          duration: "8h (1 jour)",
          level: "Sensibilisation",
          description: "Fondamentaux de la sécurité pour tout personnel intervenant en environnement électrique."
        }
      ]
    },
    {
      title: "Expertise & Audit",
      icon: Zap,
      formations: [
        {
          title: "Audit Énergétique du Bâtiment",
          duration: "32h (4 jours)",
          level: "Avancé",
          description: "Méthodologie de diagnostic et préconisations pour l'efficacité énergétique."
        },
        {
          title: "Contrôle de Conformité Réglementaire",
          duration: "24h (3 jours)",
          level: "Expert",
          description: "Devenir inspecteur technique pour la validation officielle des installations."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title="Catalogue des Formations - PROQUELEC"
        description="Améliorez vos compétences avec les formations expertes de PROQUELEC. Basse tension, sécurité, audit énergétique et habilitations électriques."
      />

      <Header />

      <main>
        <HeroSection
          badge="Centre de Formation Agrée"
          title="Développez votre Expertise"
          subtitle="Des formations d'élite pour les professionnels de l'électricité"
          description="PROQUELEC propose des programmes pédagogiques de haut niveau, alliant théorie rigoureuse et pratique intensive sur bancs d'essais modernes."
          gradient="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900"
          buttons={[
            { label: "Voir le calendrier", href: "/events", variant: "primary" },
            { label: "S'inscrire", href: "/contact", variant: "secondary" }
          ]}
        />

        {/* Categories Section */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Explorez nos parcours</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Nos formations sont structurées par domaines d'expertise pour répondre précisément aux besoins du marché sénégalais.
              </p>
            </div>

            <div className="space-y-20">
              {formationCategories.map((cat, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
                      <cat.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">{cat.title}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {cat.formations.map((f, fIdx) => (
                      <div key={fIdx} className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                          <Badge className="bg-slate-100 text-slate-600 border-none font-bold px-3 py-1">
                            {f.level}
                          </Badge>
                          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                            <Clock className="w-4 h-4" />
                            {f.duration}
                          </div>
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                          {f.title}
                        </h4>
                        <p className="text-slate-600 leading-relaxed mb-8">
                          {f.description}
                        </p>
                        <Link to="/contact">
                          <Button variant="ghost" className="p-0 text-blue-600 font-bold hover:bg-transparent flex items-center gap-2 group-hover:gap-4 transition-all">
                            Détails du programme <ArrowRight className="w-5 h-5" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats / Why Proquelec */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Pourquoi choisir le centre PROQUELEC ?</h2>
                <div className="space-y-6">
                  {[
                    { title: "Experts Métiers", desc: "Formateurs en activité possédant une expérience terrain significative." },
                    { title: "Infrastructures Modernes", desc: "Plateaux techniques équipés des dernières technologies de contrôle." },
                    { title: "Certification d'État", desc: "Diplômes et attestations reconnus par les autorités nationales." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                        <p className="text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 text-center">
                  <div className="text-5xl font-black text-blue-400 mb-2">98%</div>
                  <div className="text-sm font-bold uppercase tracking-widest text-slate-300">Taux de succès</div>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 text-center">
                  <div className="text-5xl font-black text-blue-400 mb-2">500+</div>
                  <div className="text-sm font-bold uppercase tracking-widest text-slate-300">Certifiés / an</div>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 text-center">
                  <div className="text-5xl font-black text-blue-400 mb-2">15</div>
                  <div className="text-sm font-bold uppercase tracking-widest text-slate-300">Formateurs</div>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 text-center">
                  <div className="text-5xl font-black text-blue-400 mb-2">25</div>
                  <div className="text-sm font-bold uppercase tracking-widest text-slate-300">Ans d'histoire</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 bg-white text-center">
          <div className="max-w-4xl mx-auto">
            <GraduationCap className="w-16 h-16 text-blue-600 mx-auto mb-8" />
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8">Boostez vos compétences techniques</h2>
            <p className="text-xl text-slate-600 mb-12">
              Que vous soyez indépendant, salarié ou chef d'entreprise, nos formations s'adaptent à vos ambitions professionnelles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-10 text-lg rounded-xl">
                  S'inscrire à la prochaine session
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Trainings;
