import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { SEO } from "@/components/SEO";
import { DynamicRenderer } from "@/components/DynamicRenderer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ExternalIntegrationsLoader } from "@/components/ExternalIntegrationsLoader";

const About = () => {
  return (
    <ThemeProvider>
      <ExternalIntegrationsLoader />
      <div className="bg-proqgray min-h-screen flex flex-col font-roboto">
        <SEO
          title="À propos - PROQUELEC"
          description="Découvrez l'histoire et les valeurs de PROQUELEC, référence en matière de qualité des installations électriques au Sénégal depuis 2005."
          keywords="PROQUELEC, histoire, valeurs, qualité électrique, Sénégal"
          canonical="https://proquelec.sn/about"
        />
        <Header />

        <main className="flex-1">
          {/* Section Hero Dynamique */}
          <DynamicRenderer
            componentName="hero-about"
            fallback={
              <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    À propos de PROQUELEC
                  </h1>
                  <p className="text-xl mb-8">
                    Promotion de la Qualité des Installations Électriques
                  </p>
                </div>
              </section>
            }
          />

          {/* Section Valeurs Dynamique */}
          <DynamicRenderer
            componentName="about-values"
            fallback={
              <section id="values" className="py-16 bg-white">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-bold text-center mb-12">Nos Valeurs</h2>
                  <p>Section valeurs temporaire en attendant la migration</p>
                </div>
              </section>
            }
          />

          {/* Section Histoire Dynamique */}
          <DynamicRenderer
            componentName="about-milestones"
            fallback={
              <section id="history" className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-bold text-center mb-12">Notre Histoire</h2>
                  <p>Section histoire temporaire en attendant la migration</p>
                </div>
              </section>
            }
          />

          {/* Section Mission et Vision (à créer dynamiquement) */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl font-bold text-proqblue mb-6">Notre Mission</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Promouvoir et garantir la qualité des installations électriques au Sénégal et en Afrique de l'Ouest
                    en offrant des services de formation, certification et audit conformes aux normes internationales.
                  </p>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-proqblue mb-6">Notre Vision</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Devenir la référence incontournable en matière de qualité et de sécurité des installations électriques
                    en Afrique de l'Ouest, contribuant ainsi au développement durable du secteur énergétique.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <ScrollToTopButton />
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default About;