
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import {
  Zap,
  ShieldCheck,
  Award,
  Users,
  CheckCircle,
  Search,
  BarChart3,
  ThumbsUp,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Labels = () => {
  const benefits = [
    {
      title: "Sécurité Renforcée",
      icon: ShieldCheck,
      description: "Garantie d'installations électriques conformes aux normes de sécurité internationales les plus strictes."
    },
    {
      title: "Reconnaissance Officielle",
      icon: Award,
      description: "Label reconnu par les autorités et les acteurs institutionnels du secteur électrique au Sénégal."
    },
    {
      title: "Avantage Concurrentiel",
      icon: BarChart3,
      description: "Différenciation claire sur le marché et renforcement de la confiance auprès de vos clients."
    },
    {
      title: "Réseau Professionnel",
      icon: Users,
      description: "Intégration dans un écosystème d'entreprises d'excellence engagées pour la qualité."
    }
  ];

  const criteria = [
    {
      title: "Conformité Normative",
      desc: "Respect rigoureux des normes NFC 15-100 (basse tension) et NFC 16-600 (diagnostic).",
      icon: CheckCircle
    },
    {
      title: "Expertise Technique",
      desc: "Validation des compétences des intervenants et utilisation de matériel certifié.",
      icon: Zap
    },
    {
      title: "Contrôle & Audit",
      desc: "Acceptation d'audits réguliers et de vérifications inopinées sur les chantiers.",
      icon: Search
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Label d'Excellence PROQUELEC"
        description="Le Label PROQUELEC est la marque de référence de la qualité électrique au Sénégal. Découvrez comment l'obtenir et valoriser votre entreprise."
      />

      <Header />

      <main>
        <HeroSection
          badge="Sceau de Qualité"
          title="Le Label PROQUELEC"
          subtitle="La référence de l'excellence électrique"
          description="Le Label PROQUELEC distingue les professionnels qui s'engagent pour une électricité sûre, performante et durable. Portez haut les couleurs de la qualité."
          gradient="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900"
          buttons={[
            { label: "Devenir labellisé", href: "/contact", variant: "primary" },
            { label: "Consulter les critères", href: "#critere", variant: "secondary" }
          ]}
        />

        {/* The Seal Visual */}
        <section className="py-20 bg-slate-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <img
                  src="/logo-proquelec.svg"
                  alt="Label PROQUELEC"
                  className="w-full max-w-md mx-auto drop-shadow-2xl animate-pulse"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                  Plus qu'un logo, un <span className="text-blue-600">engagement</span>.
                </h2>
                <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                  Le Label PROQUELEC est décerné aux entreprises qui placent la sécurité et la satisfaction client au cœur de leurs préoccupations. C'est le marqueur de confiance par excellence pour les maîtres d'ouvrage.
                </p>
                <div className="flex items-center gap-4 text-slate-900">
                  <div className="bg-green-100 p-3 rounded-full">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-lg font-bold">Approuvé par l'industrie électrique nationale</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Les Avantages du Label</h2>
              <p className="text-xl text-slate-600">Une valeur ajoutée concrète pour votre activité professionnelle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <benefit.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{benefit.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Criteria Section */}
        <section id="critere" className="py-24 px-4 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-8">Critères d'obtention</h2>
                <p className="text-xl text-slate-300 mb-12">
                  La rigueur de nos audits garantit la valeur de notre label. Voici les piliers de notre évaluation :
                </p>

                <div className="space-y-8">
                  {criteria.map((item, idx) => (
                    <div key={idx} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-6">Témoignage</h3>
                <blockquote className="text-xl italic text-slate-200 mb-8 leading-relaxed">
                  "L'obtention du label PROQUELEC a littéralement transformé notre image. Nos clients institutionnels exigent désormais ce label pour toutes nos interventions majeures."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xl">M</div>
                  <div>
                    <div className="font-bold">Mamadou DIOP</div>
                    <div className="text-sm text-slate-400">Directeur Technique, ElecSen SARL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-white text-center px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">Prêt à rejoindre l'élite ?</h2>
            <p className="text-xl text-slate-600 mb-12">
              Lancez votre processus de labellisation dès aujourd'hui et faites reconnaître votre savoir-faire au niveau national.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-10 text-lg rounded-xl shadow-lg hover:shadow-blue-500/30">
                  Déposer ma candidature
                  <ArrowRight className="w-5 h-5 ml-2" />
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

export default Labels;
