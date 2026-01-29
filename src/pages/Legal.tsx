import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

const Legal = () => (
  <div className="bg-proqgray min-h-screen font-roboto">
    <Header />
    <main className="container max-w-3xl mx-auto py-16 px-4 animate-fade-in pt-28">
      <h1 className="text-3xl font-roboto font-bold text-proqblue mb-6">Mentions légales & RGPD</h1>
      <p>
        Ce site est édité par PROQUELEC. Toutes les informations sont fournies à titre indicatif. Pour toute
        demande d’informations, veuillez utiliser le <a href="/contact" className="underline text-proqblue">formulaire de contact</a>.
      </p>
      <p className="mt-4">
        Respect de la vie privée : aucune donnée n’est collectée sans consentement.<br />
        Cookies utilisés uniquement à des fins de fonctionnement et statistiques anonymes.
      </p>
    </main>
    <ScrollToTopButton />
    <Footer />
  </div>
);

export default Legal;
