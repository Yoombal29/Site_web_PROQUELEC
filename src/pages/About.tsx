
import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import {
  History,
  Target,
  ShieldCheck,
  Award,
  Users,
  Lightbulb,
  Building2,
  CheckCircle2
} from 'lucide-react';

const About = () => {
  const values = [
    {
      title: "Sécurité",
      description: "Promouvoir des installations électriques sûres et fiables pour protéger les personnes et les biens.",
      icon: ShieldCheck,
      color: "blue"
    },
    {
      title: "Qualité",
      description: "Assurer une conformité rigoureuse aux normes internationales et nationales en vigueur.",
      icon: Award,
      color: "indigo"
    },
    {
      title: "Excellence",
      description: "Valoriser le savoir-faire des professionnels et encourager l'amélioration continue.",
      icon: CheckCircle2,
      color: "orange"
    },
    {
      title: "Innovation",
      description: "Adopter et promouvoir les meilleures pratiques modernes et les technologies émergentes.",
      icon: Lightbulb,
      color: "yellow"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="À propos de PROQUELEC | Organisme national de référence"
        description="Découvrez PROQUELEC, l'organisme national de référence pour la qualité et la sécurité des installations électriques au Sénégal. Notre mission, notre histoire et nos valeurs."
      />

      <Header />

      <main>
        <HeroSection
          badge="Notre Engagement"
          title="À propos de PROQUELEC"
          subtitle="L'organisme national de référence pour la qualité électrique au Sénégal"
          description="Depuis 1995, nous œuvrons pour élever les standards de sécurité et de performance du secteur électrique sénégalais."
          gradient="bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900"
        />

        {/* Story Section */}
        <section className="py-24 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4 mb-6">
                    <History className="w-8 h-8 text-blue-600" />
                    <h2 className="text-3xl font-bold text-slate-900">Notre Histoire</h2>
                  </div>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    Fondé en 1995, PROQUELEC a été créé pour répondre aux besoins croissants en matière de qualité et de sécurité dans le secteur électrique sénégalais.
                  </p>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Au fil des décennies, nous avons développé une expertise unique et établi des partenariats stratégiques avec les acteurs majeurs du secteur (Senelec, ministères, organisations professionnelles). Notre parcours est marqué par une volonté constante d'innovation et d'excellence technique.
                  </p>
                  <div className="grid grid-cols-2 gap-8 pt-8">
                    <div>
                      <div className="text-4xl font-bold text-blue-600 mb-2">1995</div>
                      <div className="text-slate-500 font-medium">Année de création</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-blue-600 mb-2">25+</div>
                      <div className="text-slate-500 font-medium">Années d'expertise</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-2xl rotate-3 group hover:rotate-0 transition-transform duration-700">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
                  {/* Image placeholder or actual asset if available */}
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Building2 className="w-32 h-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-24 bg-slate-900 text-white relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <Target className="w-16 h-16 text-blue-400 mx-auto mb-8" />
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Notre Mission & Objectifs</h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Promouvoir l'excellence professionnelle et assurer la conformité aux normes internationales pour une électricité sûre et accessible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                "Promouvoir la qualité des installations",
                "Assurer la sécurité des personnes",
                "Développer les compétences",
                "Moderniser le secteur électrique"
              ].map((obj, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                  <div className="text-blue-400 font-bold text-2xl mb-4">0{idx + 1}</div>
                  <p className="text-lg font-medium">{obj}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Nos Valeurs</h2>
              <p className="text-xl text-slate-600">Le socle de chacune de nos interventions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, idx) => (
                <div key={idx} className="p-10 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center group hover:bg-blue-600 hover:text-white transition-all duration-300">
                  <div className="w-16 h-16 bg-white text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="opacity-80 leading-relaxed font-medium">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team / Leadership Mention */}
        <section className="py-24 bg-blue-50 border-y border-blue-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Users className="w-16 h-16 text-blue-600 mx-auto mb-8" />
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Une expertise collective</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Nos équipes sont composées d'ingénieurs et techniciens hautement qualifiés, passionnés par la sécurité électrique et engagés dans un processus de veille continue pour rester à la pointe des normes mondiales.
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default About;
