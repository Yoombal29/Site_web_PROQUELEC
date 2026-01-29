
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import {
  ShieldCheck,
  Award,
  BookOpen,
  Zap,
  ClipboardCheck,
  FileSearch,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Activities = () => {
  const activityGroups = [
    {
      title: "Contrôle & Conformité",
      icon: ShieldCheck,
      color: "blue",
      items: [
        {
          title: "Contrôle de conformité",
          description: "Vérification complète et certification des installations électriques selon les normes en vigueur (NFC 15-100, NFC 16-600).",
          icon: ClipboardCheck
        },
        {
          title: "Audits énergétiques",
          description: "Analyse approfondie de votre consommation pour optimiser l'efficacité énergétique de vos bâtiments.",
          icon: Zap
        }
      ]
    },
    {
      title: "Labellisation & Certification",
      icon: Award,
      color: "orange",
      items: [
        {
          title: "Label PROQUELEC",
          description: "Évaluation et délivrance du label d'excellence pour les entreprises et professionnels du secteur.",
          icon: Award
        },
        {
          title: "Habilitations Électriques",
          description: "Évaluation des compétences et délivrance des titres d'habilitation pour travailler en toute sécurité.",
          icon: ShieldCheck
        }
      ]
    },
    {
      title: "Formation & Conseil",
      icon: BookOpen,
      color: "green",
      items: [
        {
          title: "Formations Professionnelles",
          description: "Programmes complets pour monter en compétence sur les nouvelles technologies et réglementations.",
          icon: BookOpen
        },
        {
          title: "Conseils & Accompagnement",
          description: "Assistance technique et stratégique pour vos projets d'infrastructure électrique complexe.",
          icon: Lightbulb
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title="Nos Activités - PROQUELEC"
        description="Découvrez l'ensemble des activités de PROQUELEC : contrôle de conformité, labellisation, formation et audit électrique au Sénégal."
      />

      <Header />

      <main>
        <HeroSection
          badge="Expertise Technique"
          title="Nos Activités & Services"
          subtitle="Au service de la sécurité et de la qualité électrique au Sénégal"
          description="PROQUELEC accompagne les professionnels et les particuliers dans la sécurisation et l'optimisation de leurs installations électriques à travers une gamme complète de services experts."
          gradient="bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900"
          buttons={[
            { label: "Demander un devis", href: "/contact", variant: "primary" },
            { label: "Voir nos formations", href: "/formations", variant: "secondary" }
          ]}
        />

        {/* Dynamic Activity Sections */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {activityGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="mb-20 last:mb-0">
                <div className="flex items-center gap-4 mb-10">
                  <div className={`p-3 rounded-xl bg-blue-100 text-blue-600`}>
                    <group.icon className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">{group.title}</h2>
                  <div className="flex-1 h-px bg-slate-200 hidden md:block"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {group.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-start gap-6">
                        <div className="p-4 rounded-xl bg-slate-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                          <p className="text-slate-600 leading-relaxed mb-6">
                            {item.description}
                          </p>
                          <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
                          >
                            En savoir plus <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Un besoin spécifique pour votre installation ?</h2>
            <p className="text-xl opacity-90 mb-10">
              Nos experts sont à votre disposition pour vous conseiller et vous accompagner dans tous vos projets électriques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 w-full sm:w-auto h-14 px-8 font-bold text-lg">
                  Contactez un expert
                </Button>
              </Link>
              <Link to="/formations">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto h-14 px-8 font-bold text-lg">
                  Découvrir nos formations
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

export default Activities;