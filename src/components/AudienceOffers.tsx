import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Building2, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLiveSettings } from '@/hooks/useLiveSettings';

interface OfferCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: string;
  href: string;
  delay: number;
}

const OfferCard = ({ title, subtitle, description, icon: Icon, color, href, delay }: OfferCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative">
      
            <Link to={href} className="block h-full">
                <div className="h-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group-hover:border-blue-200">
                    <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3",
            color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
            color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
          )}>
                        <Icon className="w-7 h-7" />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{subtitle}</h4>
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tighter leading-none">{title}</h3>
                        <p className="text-slate-500 leading-relaxed text-sm">
                            {description}
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-blue-600 font-bold group-hover:pl-2 transition-all">
                        <span>Découvrir mes avantages</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </Link>
        </motion.div>);

};

export const AudienceOffers = () => {
  const { settings } = useLiveSettings();

  const title = settings?.audience_section_title || "Des Services Sur-Mesure";
  const titleParts = title.split(' ');
  const titleFirst = titleParts[0];
  const titleRest = titleParts.slice(1).join(' ');

  const subtitle = settings?.audience_section_subtitle || "Que vous soyez indépendant, une entreprise ou un expert membre, PROQUELEC vous accompagne avec des outils dédiés.";

  const electricianTitle = settings?.audience_title_electrician || "Électriciens";
  const electricianSubtitle = settings?.audience_subtitle_electrician || "Indépendants & Artisans";
  const electricianDesc = settings?.audience_desc_electrician || "Accédez aux normes gratuites, nos calculateurs pro et le générateur de schémas pour vos dossiers.";

  const companyTitle = settings?.audience_title_company || "Professionnels";
  const companySubtitle = settings?.audience_subtitle_company || "Entreprises & Installateurs";
  const companyDesc = settings?.audience_desc_company || "Gérez vos chantiers, vos certifications et bénéficiez d'une visibilité accrue sur l'annuaire national.";

  const memberTitle = settings?.audience_title_member || "Membres";
  const memberSubtitle = settings?.audience_subtitle_member || "Association & Experts";
  const memberDesc = settings?.audience_desc_member || "Participez à la vie de l'institution, bénéficiez d'un support prioritaire et de la veille normative en avant-première.";

  return (
    <section className="py-24 px-4 bg-slate-50/50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent"></div>

            <div className="container max-w-7xl mx-auto relative">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">
                        {titleFirst} <span className="text-blue-600">{titleRest}</span>
                    </h2>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                        {subtitle}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <OfferCard
            title={electricianTitle}
            subtitle={electricianSubtitle}
            description={electricianDesc}
            icon={Zap}
            color="emerald"
            href="/avantages?type=electrician"
            delay={0.1} />
          
                    <OfferCard
            title={companyTitle}
            subtitle={companySubtitle}
            description={companyDesc}
            icon={Building2}
            color="blue"
            href="/avantages?type=company"
            delay={0.2} />
          
                    <OfferCard
            title={memberTitle}
            subtitle={memberSubtitle}
            description={memberDesc}
            icon={Users}
            color="indigo"
            href="/avantages?type=member"
            delay={0.3} />
          
                </div>
            </div>
        </section>);

};