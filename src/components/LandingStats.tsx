import React from 'react';
import { useHomeStats } from '@/hooks/useHomeData';
import { Users, Building2, Zap, Award, CheckCircle2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const ICON_MAP: Record<string, unknown> = {
  'users': Users,
  'building': Building2,
  'zap': Zap,
  'award': Award,
  'check': CheckCircle2
};

export const LandingStats = () => {
  const { data: stats, isLoading } = useHomeStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 py-20">
                {[1, 2, 3, 4].map((i) =>
        <div key={i} className="flex flex-col items-center space-y-2">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
        )}
            </div>);

  }

  if (!stats || stats.length === 0) return null;

  return (
    <section className="py-20 bg-proqblue text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 relative">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {stats.sort((a, b) => a.display_order - b.display_order).map((stat) => {
            const Icon = ICON_MAP[stat.icon_name] || CheckCircle2;
            return (
              <div key={stat.id} className="flex flex-col items-center text-center space-y-4 group">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                                    <Icon className="w-8 h-8 text-orange-400" />
                                </div>
                                <div>
                                    <div className="text-3xl md:text-4xl font-black mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm font-bold uppercase tracking-wider text-white/70">
                                        {stat.label}
                                    </div>
                                </div>
                                <p className="text-xs text-white/50 max-w-[150px] leading-relaxed">
                                    {stat.description}
                                </p>
                            </div>);

          })}
                </div>
            </div>
        </section>);

};