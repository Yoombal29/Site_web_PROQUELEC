import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { SEO } from "@/components/SEO";
import { DynamicRenderer } from "@/components/DynamicRenderer";
import { DynamicComponentsList } from "@/components/DynamicRenderer";
import { DynamicForm } from "@/components/DynamicForm";
import { ExternalIntegrationsLoader } from "@/components/ExternalIntegrationsLoader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const { settings } = useLiveSettings();

  useEffect(() => {
    console.log("Page vue: Accueil - Promotion de la Qualité des Installations Électriques - /");
  }, []);

  const pageStyle = {
    backgroundColor: settings?.background_color || '#f8f9fa',
    color: settings?.text_color || '#333333',
    fontFamily: settings?.font_family || 'Roboto'
  };

  return (
    <ThemeProvider>
      <ExternalIntegrationsLoader />
      <div className="min-h-screen" style={pageStyle}>
        <SEO
          title="Accueil"
          description="PROQUELEC - Promotion de la Qualité des Installations Électriques au Sénégal. Formations, certifications et services d'audit électrique."
          keywords="électricité, formations, certifications, qualité, Sénégal, sécurité, installations"
          canonical="https://proquelec.sn/"
        />
        <Header />

        <main className="pt-0">
          {/* Section Hero Dynamique */}
          <DynamicRenderer
            componentName="hero-principal"
            fallback={
              <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    Bienvenue chez PROQUELEC
                  </h1>
                  <p className="text-xl mb-8">
                    Promotion de la Qualité des Installations Électriques
                  </p>
                  <div className="space-x-4">
                    <Link to="/about" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold">
                      Découvrir les services
                    </Link>
                  </div>
                </div>
              </section>
            }
          />

          {/* Liens rapides dynamiques */}
          <DynamicRenderer componentName="quick-links" />

          {/* Composants de fonctionnalités dynamiques */}
          <DynamicComponentsList type="feature" className="py-16 bg-gray-50" />

          {/* Actualités dynamiques */}
          <DynamicRenderer componentName="latest-news" />

          {/* Témoignages dynamiques */}
          <DynamicComponentsList type="testimonial" className="py-16" />

          {/* Formulaire de contact dynamique */}
          <section className="py-16 bg-gray-100">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto">
                <DynamicForm
                  formName="contact-principal"
                  onSubmit={(data) => console.log('Formulaire soumis:', data)}
                />
              </div>
            </div>
          </section>

          {/* Newsletter dynamique */}
          <DynamicRenderer componentName="newsletter-signup" />

          {/* Logos partenaires dynamiques */}
          <DynamicRenderer componentName="partner-logos" />
        </main>

        <Footer />
        <ScrollToTopButton />
      </div>
    </ThemeProvider>
  );
};

export default Index;