import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VisionMissionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  missionTitle?: string;
  missionDesc?: string;
  visionTitle?: string;
  visionDesc?: string;
  image?: string;
  badge?: string;
}

export const VisionMission = ({
  title = "Garantir la sécurité pour tous les sénégalais.",
  subtitle = "Depuis 1995, PROQUELEC s'engage pour la promotion de la qualité des installations électriques.",
  description,
  missionTitle = "Notre Mission",
  missionDesc = "Promouvoir la sécurité et la conformité normative à travers la sensibilisation, le diagnostic et la formation.",
  visionTitle = "Notre Vision",
  visionDesc = "Devenir la référence nationale absolue en matière de sécurité électrique et d'innovation normative.",
  image = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
  badge = "L'Institution"
}: VisionMissionProps) => {
  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-proqblue/[0.02] rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none"></div>

      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Visual side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative">

            {/* Main image */}
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy" />

              <div className="absolute inset-0 bg-gradient-to-t from-proqblue-dark/70 via-transparent to-transparent"></div>

              {/* Badge on image */}
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="text-amber-400 font-bold uppercase tracking-[0.15em] text-xs mb-2">Engagement National</p>
                <h3 className="text-xl lg:text-2xl font-bold leading-tight">Expertise au service de la conformité électrique.</h3>
              </div>
            </div>

            {/* Decorative frame */}
            <div className="absolute -top-4 -right-4 w-full h-full border-2 border-proqblue/10 rounded-3xl -z-10"></div>

            {/* Decorative elements */}
            <div className="absolute -top-8 -left-8 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-proqblue/5 rounded-3xl -rotate-6 pointer-events-none"></div>

            {/* Trust badge floating */}
            <div className="absolute -bottom-4 -left-4 z-20 bg-white rounded-2xl shadow-lg border border-slate-100 px-5 py-3 flex items-center gap-3">
              <Shield className="w-8 h-8 text-proqblue" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Depuis</p>
                <p className="text-xl font-black text-slate-900">1995</p>
              </div>
            </div>
          </motion.div>

          {/* Content side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="space-y-8 lg:space-y-10">

            {/* Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-proqblue/5 text-proqblue text-xs font-bold uppercase tracking-[0.15em] border border-proqblue/10">
                <span className="w-1.5 h-1.5 rounded-full bg-proqblue"></span>
                {badge}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              {title}
            </h2>

            <p className="text-slate-500 leading-relaxed text-lg max-w-xl">
              {description || subtitle}
            </p>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 pt-4">
              <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-proqblue/[0.02] to-transparent border border-proqblue/5">
                <div className="w-12 h-12 rounded-xl bg-proqblue/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-proqblue" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{missionTitle}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {missionDesc}
                </p>
              </div>

              <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-amber-500/[0.02] to-transparent border border-amber-500/5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{visionTitle}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {visionDesc}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t border-slate-100">
              <Link to="/about">
                <span className="inline-flex items-center gap-2 group text-proqblue font-semibold hover:gap-3 transition-all cursor-pointer">
                  <span>En savoir plus sur nous</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

};
