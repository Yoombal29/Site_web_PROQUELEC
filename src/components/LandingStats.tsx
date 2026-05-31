import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useHomeStats } from '@/hooks/useHomeData';
import { Users, Building2, Zap, Award, CheckCircle2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'users': Users,
  'building': Building2,
  'zap': Zap,
  'award': Award,
  'check': CheckCircle2
};

const CountUp = ({ value, duration = 2000 }: { value: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    if (!isInView || numericValue === 0) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numericValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, numericValue, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
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
    <section className="py-24 lg:py-28 bg-proqblue-dark relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/[0.05] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.sort((a, b) => a.display_order - b.display_order).map((stat, idx) => {
            const Icon = ICON_MAP[stat.icon_name] || CheckCircle2;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center space-y-4 group">

                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/[0.15] transition-all duration-300 group-hover:scale-105">
                  <Icon className="w-7 h-7 text-amber-400" />
                </div>

                <div>
                  <div className="text-4xl md:text-5xl font-black text-white mb-1 tracking-tight">
                    <CountUp value={stat.value} />
                  </div>
                  <div className="text-sm font-bold uppercase tracking-[0.1em] text-white/60">
                    {stat.label}
                  </div>
                </div>

                <p className="text-xs text-white/40 max-w-[150px] leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>);

          })}
        </div>
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </section>);

};
