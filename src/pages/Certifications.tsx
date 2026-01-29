
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Star,
  TrendingUp,
  FileBadge,
  Medal,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Certifications = () => {
  const certificationLevels = [
    {
      title: "Électricien Qualifié",
      level: "Niveau 1",
      icon: CheckCircle2,
      color: "blue",
      description: "Validation des compétences fondamentales pour les installations résidentielles et tertiaires standards.",
      benefits: ["Reconnaissance officielle", "Accès aux chantiers certifiés", "Badge de confiance client"]
    },
    {
      title: "Technicien Supérieur",
      level: "Niveau 2",
      icon: Medal,
      color: "indigo",
      description: "Expertise approfondie en systèmes industriels, automatisme et maintenance complexe.",
      benefits: ["Maîtrise des systèmes complexes", "Gestion d'équipe technique", "Expertise multi-domaines"]
    },
    {
      title: "Maître Électricien",
      level: "Expert",
      icon: Star,
      color: "orange",
      description: "Le plus haut niveau de certification garantissant une maîtrise totale des normes et de l'ingénierie électrique.",
      benefits: ["Signature de projets majeurs", "Consultant expert", "Référence sectorielle"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Certifications Professionnelles - PROQUELEC"
        description="Valorisez votre expertise avec les certifications PROQUELEC. Des parcours qualifiants pour tous les niveaux de professionnels de l'électricité."
      />

      <Header />

      <main>
        <HeroSection
          badge="Reconnaissance d'Excellence"
          title="Certifications Professionnelles"
          subtitle="Valorisez votre expertise, boostez votre carrière"
          description="Les certifications PROQUELEC sont la référence de qualité au Sénégal, garantissant aux clients et partenaires un niveau de compétence conforme aux standards internationaux."
          gradient="bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900"
          buttons={[
            { label: "Démarrer une certification", href: "/contact", variant: "primary" },
            { label: "Guide du candidat", href: "/documents", variant: "secondary" }
          ]}
        />

        {/* Benefits Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Pourquoi se faire certifier ?</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                La certification n'est pas qu'un diplôme, c'est un gage de sécurité et de performance pour vos projets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: ShieldCheck, title: "Garantie de Sécurité", desc: "Assurez la protection des biens et des personnes par le respect strict des normes." },
                { icon: TrendingUp, title: "Plus d'Opportunités", desc: "Accédez à des marchés publics et privés réservés aux professionnels certifiés." },
                { icon: FileBadge, title: "Crédibilité Accrue", desc: "Démarquez-vous de la concurrence grâce à un label de qualité reconnu." }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certification Levels */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-12">
              {certificationLevels.map((cert, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-500"
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/3 bg-slate-900 p-12 text-white flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-all"></div>
                      <cert.icon className="w-20 h-20 text-blue-400 mb-6 relative z-10" />
                      <span className="text-sm font-bold tracking-widest text-blue-300 uppercase relative z-10">{cert.level}</span>
                      <h3 className="text-2xl font-bold mt-2 relative z-10 text-center">{cert.title}</h3>
                    </div>

                    <div className="lg:w-2/3 p-10 md:p-12">
                      <div className="max-w-xl">
                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                          {cert.description}
                        </p>

                        <div className="space-y-4 mb-10">
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Avantages Clés :</h4>
                          {cert.benefits.map((benefit, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-3 text-slate-700 font-medium">
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                              {benefit}
                            </div>
                          ))}
                        </div>

                        <Link to="/contact">
                          <Button className="bg-blue-600 hover:bg-blue-700 font-bold px-8 h-12">
                            Demander les prérequis
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-slate-900 text-white text-center px-4 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-orange-500"></div>
          <div className="max-w-3xl mx-auto">
            <Award className="w-16 h-16 text-blue-400 mx-auto mb-8 animate-pulse" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Validez vos compétences dès aujourd'hui</h2>
            <p className="text-xl text-slate-300 mb-10">
              Rejoignez l'élite des électriciens certifiés PROQUELEC et participez à l'élévation des standards de qualité au Sénégal.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 font-bold h-14 px-10 text-lg">
                  S'inscrire à une session
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

export default Certifications;
