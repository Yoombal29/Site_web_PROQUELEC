
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/HeroSection";
import { QuickLinks } from "@/components/QuickLinks";
import { LatestNews } from "@/components/LatestNews";
import { PartnerLogos } from "@/components/PartnerLogos";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { useEffect } from "react";
import { Shield, Zap, Award, Users, CheckCircle, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { settings } = useLiveSettings();

  useEffect(() => {
    console.log("Page vue: Accueil - Promotion de la Qualité des Installations Électriques - /");
  }, []);

  const pageStyle = {
    backgroundColor: settings?.background_color || '#ffffff',
    color: settings?.text_color || '#333333',
    fontFamily: settings?.font_family || 'Inter, sans-serif'
  };

  const features = [
    {
      icon: Shield,
      title: "Sécurité Électrique",
      description: "Installations conformes aux normes internationales pour une sécurité maximale",
      color: "#dc2626"
    },
    {
      icon: Zap,
      title: "Expertise Technique",
      description: "Équipe d'ingénieurs et techniciens hautement qualifiés et certifiés",
      color: "#f59e0b"
    },
    {
      icon: Award,
      title: "Certifications",
      description: "Reconnaissance officielle et certifications professionnelles validées",
      color: "#10b981"
    },
    {
      icon: Users,
      title: "Formation Continue",
      description: "Programmes de formation adaptés aux besoins du marché sénégalais",
      color: "#3b82f6"
    }
  ];

  const stats = [
    { number: "500+", label: "Projets Réalisés" },
    { number: "98%", label: "Satisfaction Client" },
    { number: "50+", label: "Experts Certifiés" },
    { number: "15+", label: "Années d'Expérience" }
  ];

  return (
    <div className="min-h-screen" style={pageStyle}>
      <SEO
        title="Accueil - PROQUELEC Sénégal"
        description="PROQUELEC - Promotion de la Qualité des Installations Électriques au Sénégal. Formations, certifications et services d'audit électrique professionnels."
        keywords="électricité, formations, certifications, qualité, Sénégal, sécurité, installations, audit électrique"
        canonical="https://proquelec.sn/"
      />
      <Header />

      <main className="pt-0">
        {/* Hero Section avec HeroSection */}
        <HeroSection
          badge="⚡ PROQUELEC SENEGAL"
          title="Promotion de la Qualité des Installations Électriques"
          subtitle="Sécurité · Qualité · Formation"
          description="Expert en installations électriques au Sénégal. Nous garantissons la sécurité, la qualité et la conformité de vos projets électriques avec les normes internationales."
          gradient="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900"
          buttons={[
            { label: "Nos Services", href: "#services", variant: "primary" },
            { label: "Contactez-nous", href: "/contact", variant: "secondary" }
          ]}
        />

        {/* Section "Pourquoi choisir PROQUELEC ?" */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Pourquoi choisir <span className="text-blue-600">PROQUELEC</span> ?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Leader dans la promotion de la qualité des installations électriques au Sénégal,
                nous accompagnons particuliers et entreprises dans leurs projets électriques.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon
                      className="w-8 h-8"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Statistiques */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {stat.number}
                  </div>
                  <div className="text-blue-100 text-sm md:text-base uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section "Nos Services" */}
        <section id="services" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Nos <span className="text-blue-600">Services</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Une gamme complète de services électriques professionnels adaptés aux besoins du marché sénégalais.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Audit et Diagnostic Électrique
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Évaluation complète de vos installations électriques selon les normes internationales.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Formation et Certification
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Programmes de formation certifiés pour professionnels de l'électricité.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Conseil et Expertise
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Accompagnement technique pour vos projets d'installations électriques.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Documentation Technique
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Bibliothèque complète de normes, guides et ressources électriques.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
                <div className="text-center">
                  <Star className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Prêt à commencer votre projet ?
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Contactez notre équipe d'experts pour discuter de vos besoins en installations électriques.
                  </p>
                  <Link to="/contact">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Nous contacter
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Liens rapides */}
        <QuickLinks />

        {/* Actualités */}
        <LatestNews />

        {/* Partenaires */}
        <PartnerLogos />

        {/* Newsletter */}
        <NewsletterSignup />
      </main>

      <ScrollToTopButton />
      <Footer />
    </div>
  );
};

export default Index;
