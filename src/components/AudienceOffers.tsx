import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Building2, Users, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLiveSettings } from '@/hooks/useLiveSettings';

interface OfferCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  delay: number;
}

const OfferCard = ({ title, subtitle, description, icon: Icon, color, href, delay }: OfferCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className="group relative">

      <Link to={href} className="block h-full">
        <div className={cn(
          "h-full relative overflow-hidden rounded-3xl border transition-all duration-500",
          "bg-white/80 backdrop-blur-sm",
          "border-slate-200/60 hover:border-slate-300/80",
          "shadow-sm hover:shadow-2xl hover:-translate-y-1"
        )}>
          {/* Background gradient */}
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            color === 'emerald' ? 'bg-gradient-to-br from-emerald-50/80 to-transparent' :
              color === 'blue' ? 'bg-gradient-to-br from-blue-50/80 to-transparent' :
                'bg-gradient-to-br from-indigo-50/80 to-transparent'
          )} />

          <div className="relative p-8 lg:p-10">
            {/* Icon */}
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300",
              "group-hover:scale-110 group-hover:rotate-1",
              "shadow-sm",
              color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
            )}>
              <Icon className="w-7 h-7" />
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">{subtitle}</h4>
              <h3 className="text-2xl font-bold text-proqblue-dark group-hover:text-proqblue transition-colors leading-tight">{title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {description}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center gap-2 text-proqblue font-semibold text-sm group-hover:gap-3 transition-all">
              <span>Découvrir</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
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
    <section className="py-24 lg:py-32 px-4 bg-slate-50/80 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/60 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-50/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-proqblue/5 text-proqblue text-xs font-bold uppercase tracking-[0.2em] rounded-full px-5 py-2 mb-4 border border-proqblue/10">
              <Sparkles className="w-3.5 h-3.5" />
              Nos Offres
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            {titleFirst} <span className="text-proqblue">{titleRest}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            {subtitle}
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
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
