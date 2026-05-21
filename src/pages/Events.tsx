
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import {

  MapPin,
  Clock,
  ArrowRight,
  Monitor,
  ShieldCheck,
  Handshake,
  CalendarCheck,
  Plus } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Events = () => {
  const officialEvents = [
  {
    title: "Conférence Technique : Normes 2025",
    type: "Présentiel",
    date: "15 Février 2026",
    time: "09:00 - 13:00",
    location: "Siège PROQUELEC, Dakar",
    category: "Conférence",
    featured: true,
    description: "Une session exclusive pour décrypter les évolutions majeures des normes d'installation électrique au Sénégal."
  },
  {
    title: "Atelier Pratique : Solaire & Stockage",
    type: "Présentiel",
    date: "5 Mars 2026",
    time: "08:30 - 17:30",
    location: "Centre de Formation PROQUELEC",
    category: "Atelier",
    description: "Mise en œuvre concrète de systèmes photovoltaïques avec gestion intelligente de l'énergie."
  }];


  const partnerEvents = [
  {
    title: "Salon de l'Énergie Renouvelable",
    organizer: "EnergiTech Sénégal",
    type: "Exposition",
    date: "20 Mars 2026",
    time: "10:00 - 18:00",
    location: "Place du Souvenir, Dakar",
    category: "Salon",
    description: "Le rendez-vous incontournable des acteurs locaux du renouvelable avec démonstrations en direct."
  },
  {
    title: "Webinaire : Domotique & Sécurité",
    organizer: "SmartHome Africa",
    type: "En ligne",
    date: "28 Mars 2026",
    time: "14:00 - 15:30",
    location: "Lien envoyé par email",
    category: "Webinaire",
    description: "Comment intégrer des solutions connectées tout en respectant les fondamentaux de la sécurité électrique."
  }];


  const EventCard = ({ event, isOfficial = false }: {event: unknown;isOfficial?: boolean;}) =>
  <div
    className={`group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row transition-all duration-300 hover:shadow-2xl ${isOfficial ? "border-l-8 border-l-blue-600" : "border-l-8 border-l-indigo-400"}`}>
    
      {/* Date Sidebar */}
      <div className={`${isOfficial ? 'bg-slate-900' : 'bg-slate-800'} text-white p-8 md:w-48 flex flex-col items-center justify-center text-center`}>
        <span className="text-sm font-bold opacity-60 uppercase mb-1">{event.date.split(' ')[2]}</span>
        <span className="text-4xl font-black mb-1">{event.date.split(' ')[0]}</span>
        <span className="text-lg font-bold text-blue-400">{event.date.split(' ')[1]}</span>
      </div>

      {/* Content */}
      <div className="p-8 md:p-10 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="secondary" className={`${isOfficial ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'} hover:bg-opacity-80 border-none font-bold`}>
            {event.category}
          </Badge>
          {!isOfficial &&
        <div className="flex items-center gap-1 text-indigo-600 text-sm font-bold bg-indigo-50 px-3 py-1 rounded-full">
              <Handshake className="w-4 h-4" />
              {event.organizer}
            </div>
        }
          {isOfficial &&
        <div className="flex items-center gap-1 text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              Officiel PROQUELEC
            </div>
        }
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>

        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
          {event.description}
        </p>

        <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-slate-500">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">{event.time}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">{event.location}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-8 md:p-10 bg-slate-50 md:w-64 flex flex-col justify-center gap-4 border-l border-slate-100">
        <Button className={`${isOfficial ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'} w-full font-bold h-12 shadow-md transition-all`}>
          M'inscrire
        </Button>
        <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-white font-bold h-12">
          Détails <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>;


  return (
    <div className="min-h-screen bg-slate-50 font-roboto">
      <SEO
        title="Événements & Agenda - PROQUELEC"
        description="Découvrez les événements officiels de PROQUELEC et les initiatives de nos partenaires pour l'expertise électrique au Sénégal." />
      

      <Header />

      <main>
        <HeroSection
          badge="Calendrier Expert"
          title="Événements & Agenda"
          subtitle="Le carrefour de l'expertise électrique"
          description="Participez aux moments forts du secteur : des conférences institutionnelles PROQUELEC aux initiatives innovantes de nos partenaires."
          gradient="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900"
          buttons={[
          { label: "Voir les événements officiels", href: "#official", variant: "primary" },
          { label: "Événements partenaires", href: "#partners", variant: "secondary" }]
          } />
        

        {/* Official Events Section */}
        <section id="official" className="py-24 px-4 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50 opacity-20 pointer-events-none -skew-x-12 transform translate-x-24" />
          <div className="max-w-7xl mx-auto relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <Badge className="bg-blue-600 text-white mb-4 px-4 py-1.5 text-sm uppercase tracking-widest font-bold border-none">
                  Institutionnel
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 flex items-center gap-4">
                  <CalendarCheck className="w-10 h-10 text-blue-600" />
                  Événements PROQUELEC
                </h2>
                <p className="mt-4 text-xl text-slate-600 leading-relaxed italic">
                  Nos rendez-vous officiels pour la promotion de la sécurité et de la qualité électrique au Sénégal.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {officialEvents.map((event, idx) =>
              <EventCard key={idx} event={event} isOfficial={true} />
              )}
            </div>
          </div>
        </section>

        {/* Partner Events Section */}
        <section id="partners" className="py-24 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <Badge className="bg-indigo-600 text-white mb-4 px-4 py-1.5 text-sm uppercase tracking-widest font-bold border-none">
                  Écosystème
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 flex items-center gap-4">
                  <Handshake className="w-10 h-10 text-indigo-600" />
                  Événements Partenaires
                </h2>
                <p className="mt-4 text-xl text-slate-600 leading-relaxed">
                  Des initiatives portées par nos partenaires agréés et certifiés, validées par l'expertise PROQUELEC.
                </p>
              </div>
              <Button size="lg" variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-white h-14 px-8 rounded-xl font-bold italic">
                Devenir Partenaire <Plus className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {partnerEvents.map((event, idx) =>
              <EventCard key={idx} event={event} isOfficial={false} />
              )}
            </div>
          </div>
        </section>

        {/* Propose Event CTA */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute h-96 w-96 rounded-full bg-blue-500 blur-3xl -top-24 -left-24" />
            <div className="absolute h-96 w-96 rounded-full bg-indigo-500 blur-3xl -bottom-24 -right-24" />
          </div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-10 transform -rotate-6 transition-transform hover:rotate-0 duration-500">
              <Monitor className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight italic">
              Diffusez votre expertise <br /> via le réseau PROQUELEC
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed">
              Partenaires, proposez vos ateliers et conférences sur notre plateforme pour toucher l'ensemble des professionnels du secteur.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-16 px-12 text-lg rounded-2xl shadow-xl shadow-blue-900/40">
                Soumettre un événement
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-16 px-12 text-lg rounded-2xl backdrop-blur-sm">
                En savoir plus
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Action" />
    </div>);

};

export default Events;