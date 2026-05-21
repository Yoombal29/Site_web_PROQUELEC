import React from 'react';
import { Target, Eye, ArrowRight } from 'lucide-react';
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
    <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Visual side */}
                    <div className="relative">
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10">
                            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover" loading="lazy" />
              
                            <div className="absolute inset-0 bg-gradient-to-t from-proqblue/80 to-transparent"></div>

                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                <p className="text-orange-400 font-bold uppercase tracking-[0.2em] text-xs mb-2">Engagement National</p>
                                <h3 className="text-2xl font-bold">Expertise au service de la conformité électrique.</h3>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-proqblue/5 rounded-3xl -rotate-12"></div>
                    </div>

                    {/* Content side */}
                    <div className="space-y-10">
                        <div>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-proqblue/5 text-proqblue text-xs font-bold uppercase tracking-widest mb-4">
                                {badge}
                            </span>
                            <h2 className="text-4xl font-black text-slate-900 leading-tight mb-6">
                                {title}
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                {description || subtitle}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-proqblue/10 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-proqblue" />
                                </div>
                                <h4 className="font-bold text-slate-900">{missionTitle}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {missionDesc}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-orange-600" />
                                </div>
                                <h4 className="font-bold text-slate-900">{visionTitle}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {visionDesc}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                            <Link to="/about">
                                <button className="flex items-center gap-2 group text-proqblue font-bold hover:gap-3 transition-all" aria-label="Action">
                                    <span>En savoir plus sur nous</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>);

};