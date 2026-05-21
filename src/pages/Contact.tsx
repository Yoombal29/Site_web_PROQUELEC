import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, Building2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { HeroSection } from "@/components/HeroSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const iconMap: Record<string, unknown> = {
  Phone,
  Mail,
  MapPin,
  Clock,
  Building2
};

const Contact = () => {
  const { settings } = useLiveSettings();
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const pageData = settings?.page_sections?.contact;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => setFormStatus('sent'), 1500);
  };

  if (!pageData) return null;

  const heroData = pageData.content?.hero;
  const infoData = pageData.content?.info;

  const contactInfo = infoData?.features?.map((f: string) => {
    const [label, value] = f.split('|').map((s) => s.trim());
    const iconName = label === 'Téléphone' ? 'Phone' : label === 'Email' ? 'Mail' : label === 'Siège' ? 'MapPin' : 'Clock';
    return { label, value, icon: iconMap[iconName] || Mail };
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title="Contactez-nous - PROQUELEC"
        description="Une équipe d'experts à votre écoute pour tous vos projets électriques au Sénégal." />
      

      <Header solid={true} />

      <main>
        {heroData &&
        <HeroSection
          badge={heroData.features?.[0] || "Contact"}
          title={heroData.title}
          subtitle={heroData.subtitle}
          description={heroData.features?.slice(1).join(' • ')}
          image={heroData.image}
          gradient="bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900" />

        }

        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info Column */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">{infoData?.title}</h2>
                <p className="text-xl text-slate-600 leading-relaxed">
                  {infoData?.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contactInfo.map((item: unknown, idx: number) =>
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start transition-all hover:border-blue-200 group">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:bg-blue-600 group-hover:text-white">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.label}</h3>
                    <p className="text-slate-600">{item.value}</p>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-slate-200">
                <div className="flex items-center gap-4 text-slate-600">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <span className="font-bold">PROQUELEC Est une Association d'Utilité Publique</span>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-600 rounded-[2.5rem] rotate-1 opacity-5"></div>
              {formStatus === 'sent' ?
              <Card className="relative bg-white border-none shadow-2xl rounded-[2rem] overflow-hidden p-12 text-center py-20 space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">Message Envoyé !</h2>
                  <p className="text-lg text-slate-600 max-w-sm mx-auto">
                    Merci pour votre message. Nos experts le traiteront dans les plus brefs délais.
                  </p>
                  <Button
                  onClick={() => setFormStatus('idle')}
                  className="bg-blue-600 hover:bg-blue-700">
                  
                    Envoyer un autre message
                  </Button>
                </Card> :

              <Card className="relative bg-white border-none shadow-2xl rounded-[2rem] overflow-hidden">
                  <div className="bg-slate-900 p-8 text-white">
                    <div className="flex items-center gap-4">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                      <h3 className="text-2xl font-bold">Envoyez-nous un message</h3>
                    </div>
                  </div>
                  <CardContent className="p-8 sm:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Nom complet</label>
                          <Input required placeholder="Mamadou Diop" className="h-12 bg-slate-50 border-slate-100 focus:bg-white rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email professionnel</label>
                          <Input required type="email" placeholder="m.diop@orange.sn" className="h-12 bg-slate-50 border-slate-100 focus:bg-white rounded-xl" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider" htmlFor="subject-select">Sujet</label>
                        <select id="subject-select" title="Sujet de votre demande" className="w-full h-12 bg-slate-50 border border-slate-100 focus:bg-white rounded-xl px-4 text-slate-600 outline-none">
                          <option>Audit de conformité</option>
                          <option>Certification professionnelle</option>
                          <option>Formation technique</option>
                          <option>Autre demande</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Votre message</label>
                        <Textarea required placeholder="Décrivez votre besoin..." className="min-h-[120px] bg-slate-50 border-slate-100 rounded-xl resize-none" />
                      </div>

                      <Button disabled={formStatus === 'sending'} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-xl shadow-blue-600/10 flex items-center justify-center gap-3 transition-all">
                        {formStatus === 'sending' ? 'Envoi...' : 'Envoyer ma demande'}
                        <Send className="w-5 h-5" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              }
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Action" />
    </div>);

};

export default Contact;