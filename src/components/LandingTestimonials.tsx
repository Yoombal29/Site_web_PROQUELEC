import React from 'react';
import { useTestimonials } from '@/hooks/useHomeData';
import { Star, Quote } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export const LandingTestimonials = () => {
  const { data: testimonials, isLoading } = useTestimonials();

  if (isLoading) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) =>
          <div key={i} className="bg-slate-50 p-8 rounded-2xl space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex items-center gap-3 pt-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                        </div>
          )}
                </div>
            </div>);

  }

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-proqblue mb-4">Paroles d'acteurs</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Découvrez les témoignages des autorités, des ménages et des professionnels qui font confiance à PROQUELEC.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) =>
          <div key={testimonial.id} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 relative group">
                            <div className="absolute top-6 right-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Quote className="w-12 h-12 text-proqblue" />
                            </div>

                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) =>
              <Star
                key={i}
                className={`w-4 h-4 ${i < testimonial.rating ? 'text-orange-400 fill-orange-400' : 'text-slate-200'}`} />

              )}
                            </div>

                            <p className="text-slate-600 italic mb-8 relative z-10 leading-relaxed">
                                "{testimonial.content}"
                            </p>

                            <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                                <div className="w-12 h-12 rounded-full bg-proqblue/10 flex items-center justify-center overflow-hidden">
                                    {testimonial.avatar_url ?
                <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" loading="lazy" /> :

                <span className="text-proqblue font-bold text-sm">
                                            {testimonial.name.substring(0, 1)}
                                        </span>
                }
                                </div>
                                <div>
                                    <h4 className="font-bold text-proqblue">{testimonial.name}</h4>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
          )}
                </div>
            </div>
        </section>);

};