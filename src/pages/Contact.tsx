
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { HeroSection } from '@/components/HeroSection';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Building,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    alert("Votre message a été envoyé avec succès ! Nous vous recontacterons sous 48h.");
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Contactez PROQUELEC | Expertise Électrique au Sénégal"
        description="Besoin d'un audit, d'une formation ou d'une certification ? Contactez les experts de PROQUELEC. Nous sommes à votre écoute pour tous vos projets électriques."
      />

      <Header />

      <main>
        <HeroSection
          badge="À votre écoute"
          title="Contactez-nous"
          subtitle="Une équipe d'experts à votre entière disposition"
          description="Que vous soyez un professionnel ou une institution, nous sommes là pour répondre à vos questions et vous accompagner dans vos démarches de mise en conformité."
          gradient="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900"
        />

        <section className="py-24 px-4 bg-white relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl -z-10 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-50"></div>

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

              {/* Contact Information */}
              <div className="space-y-12">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                    Parlons de vos <span className="text-blue-600">projets</span>
                  </h2>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    Nos bureaux sont ouverts du lundi au vendredi. N'hésitez pas à nous rendre visite ou à nous appeler pour toute urgence technique.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Phone className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Téléphone</h3>
                    <p className="text-slate-600 font-medium">+221 33 825 00 00</p>
                    <p className="text-slate-600 font-medium">+221 77 000 00 00</p>
                  </div>

                  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Email</h3>
                    <p className="text-slate-600 font-medium">contact@proquelec.sn</p>
                    <p className="text-slate-600 font-medium">support@proquelec.sn</p>
                  </div>

                  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Siège Social</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      Avenue Cheikh Anta Diop,<br />Dakar, Sénégal
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Horaires</h3>
                    <p className="text-slate-600 font-medium">Lun - Ven / 08h30 - 17h30</p>
                    <p className="text-slate-600 font-medium text-sm text-blue-600">Samedi sur RDV</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-slate-600">
                    <Building className="w-6 h-6 text-blue-600" />
                    <span className="font-bold">PROQUELEC Est une Association d'Utilité Publique</span>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-600 rounded-[2.5rem] rotate-1 opacity-10"></div>
                <Card className="relative bg-white border-none shadow-2xl rounded-[2rem] overflow-hidden">
                  <div className="bg-slate-900 p-8 text-white">
                    <div className="flex items-center gap-4">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                      <h3 className="text-2xl font-bold">Envoyez-nous un message</h3>
                    </div>
                  </div>
                  <CardContent className="p-8 sm:p-12">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Nom complet</label>
                          <Input placeholder="Mamadou Diop" className="h-14 bg-slate-50 border-slate-100 focus:bg-white rounded-xl transition-all" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Email professionnel</label>
                          <Input type="email" placeholder="m.diop@entreprise.sn" className="h-14 bg-slate-50 border-slate-100 focus:bg-white rounded-xl transition-all" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Sujet de votre demande</label>
                        <select className="w-full h-14 bg-slate-50 border border-slate-100 focus:bg-white rounded-xl px-4 text-slate-600 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all appearance-none cursor-pointer">
                          <option>Demande d'audit technique</option>
                          <option>Inscription formation</option>
                          <option>Label de qualité</option>
                          <option>Autre demande</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Votre message</label>
                        <Textarea
                          placeholder="Décrivez votre projet ou votre question en quelques lignes..."
                          className="min-h-[150px] bg-slate-50 border-slate-100 focus:bg-white rounded-xl transition-all resize-none"
                          required
                        />
                      </div>

                      <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3">
                        Envoyer ma demande <Send className="w-5 h-5" />
                      </Button>

                      <p className="text-center text-xs text-slate-500 font-medium">
                        En envoyant ce formulaire, vous acceptez notre politique de confidentialité.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </section>

        {/* Map Placeholder Section */}
        <section className="h-[400px] bg-slate-100 border-y border-slate-200 relative group cursor-pointer overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-white/90 backdrop-blur px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 transform group-hover:scale-110 transition-transform duration-500">
              <MapPin className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-slate-900">Cliquez pour voir sur Google Maps</span>
              <ArrowRight className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 opacity-50"></div>
          {/* Decorative grid pattern */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Contact;
