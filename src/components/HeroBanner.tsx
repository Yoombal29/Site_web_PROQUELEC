
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, Shield, Zap, Award } from "lucide-react";
import { useHomeSlides } from "@/hooks/useHomeData";

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
interface HeroBannerProps {
  slides?: any[];
  autoplayInterval?: number;
  styles?: React.CSSProperties;
  // Builder-editable overrides (passed from GodMode)
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  accentColor?: string;
  showStats?: boolean;
}

/* ─────────────────────────────────────────────────────────
   Floating stat pill
───────────────────────────────────────────────────────── */
const Stat = ({ value, label, icon: Icon }: { value: string; label: string; icon: any }) => (
  <div className="flex items-center gap-3 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3">
    <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-amber-400" />
    </div>
    <div>
      <div className="text-white font-black text-lg leading-none">{value}</div>
      <div className="text-white/50 text-[10px] uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   Animated word cycle
───────────────────────────────────────────────────────── */
const ROTATING_WORDS = ["Sécurité", "Qualité", "Performance", "Conformité"];

const RotatingWord = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 300);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="text-amber-400 inline-block transition-all duration-300"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-8px)" }}
    >
      {ROTATING_WORDS[index]}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────── */
export const HeroBanner: React.FC<HeroBannerProps> = ({
  slides: propSlides,
  autoplayInterval = 8000,
  styles,
  headline,
  subheadline,
  badgeText,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  accentColor = "#f59e0b",
  showStats = true,
}) => {
  const { data: dbSlides, isLoading } = useHomeSlides();
  const slides = propSlides || dbSlides;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // If builder overrides exist, use them for slide-0 content
  const hasBuilderOverride = !!(headline || subheadline || ctaLabel);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    setIsReady(true);
    const interval = setInterval(() => emblaApi.scrollNext(), autoplayInterval);
    return () => {
      clearInterval(interval);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect, autoplayInterval]);

  /* ── Loading ── */
  if (isLoading && !propSlides) {
    return (
      <div className="relative h-[88vh] min-h-[600px] bg-[#020b1a] flex items-center justify-center overflow-hidden">
        {/* Background geometry */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-l from-[#0a1f3f]/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020b1a] to-transparent" />
        </div>
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden bg-[#020b1a]"
      style={styles}
    >
      {/* ── Carousel viewport ── */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, index) => {
            const isActive = selectedIndex === index;

            // Apply builder overrides to first slide
            const title     = (hasBuilderOverride && index === 0) ? headline    : slide.title;
            const subtitle  = (hasBuilderOverride && index === 0) ? subheadline : slide.subtitle;
            const badge     = (hasBuilderOverride && index === 0 && badgeText)  ? badgeText   : slide.badge;
            const ctaTxt    = (hasBuilderOverride && index === 0 && ctaLabel)   ? ctaLabel    : slide.cta_text;
            const ctaLink   = (hasBuilderOverride && index === 0 && ctaHref)    ? ctaHref     : slide.cta_link;
            const secCtaTxt = (hasBuilderOverride && index === 0 && secondaryCtaLabel) ? secondaryCtaLabel : slide.secondary_cta_text;
            const secCtaLnk = (hasBuilderOverride && index === 0 && secondaryCtaHref)  ? secondaryCtaHref  : slide.secondary_cta_link;

            return (
              <div
                key={slide.id || index}
                className="relative flex-[0_0_100%] h-[88vh] min-h-[600px] flex items-center"
              >
                {/* ── Background image with subtle zoom ── */}
                <div className="absolute inset-0 overflow-hidden">
                  {slide.background_url && (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out"
                      style={{
                        backgroundImage: `url(${slide.background_url})`,
                        transform: isActive ? "scale(1.04)" : "scale(1.12)",
                      }}
                    />
                  )}

                  {/* ── Overlays ── */}
                  {/* Dark base */}
                  <div className="absolute inset-0 bg-[#020b1a]/80" />
                  {/* Left-side gradient for content legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#020b1a] via-[#020b1a]/70 to-transparent" />
                  {/* Bottom fade to white for smooth section transition */}
                  <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

                  {/* ── Geometric accent (right side) ── */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-[45%] pointer-events-none"
                    style={{ background: `linear-gradient(135deg, transparent 0%, ${accentColor}08 100%)` }}
                  />
                  {/* Corner accent lines */}
                  <div className="absolute top-12 right-12 w-24 h-24 border border-white/5 rotate-45 rounded-2xl" />
                  <div className="absolute top-20 right-20 w-12 h-12 border border-amber-400/10 rotate-12 rounded-xl" />
                  <div className="absolute bottom-24 right-[12%] w-36 h-36 border border-white/[0.04] -rotate-12 rounded-3xl" />

                  {/* ── Ambient glow ── */}
                  <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[140px]" />
                  <div className="absolute bottom-[5%] right-[15%] w-[400px] h-[400px] bg-amber-500/6 rounded-full blur-[120px]" />
                </div>

                {/* ── Content ── */}
                <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 py-24">
                  <div className="max-w-3xl">

                    {/* Badge */}
                    {badge && (
                      <div
                        className={`inline-flex items-center gap-2 mb-8 transition-all duration-700 ${
                          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        }`}
                        style={{ transitionDelay: "100ms" }}
                      >
                        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          {badge}
                        </span>
                      </div>
                    )}

                    {/* Main headline */}
                    <h1
                      className={`text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black leading-[1.06] tracking-tight mb-6 text-white transition-all duration-1000 ${
                        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                      }`}
                      style={{ transitionDelay: "250ms" }}
                    >
                      {/* If this is a slide with a special split format */}
                      {(title || "").includes("|") ? (
                        (title || "").split("|").map((part: string, i: number) => (
                          <span key={i} className={i % 2 === 1 ? "text-amber-400" : "text-white"}>
                            {part.trim()}{" "}
                          </span>
                        ))
                      ) : title ? (
                        <>
                          <span className="text-white">
                            {(title || "").split(" ").slice(0, -2).join(" ")}{" "}
                          </span>
                          <span className="text-amber-400">
                            {(title || "").split(" ").slice(-2).join(" ")}
                          </span>
                        </>
                      ) : (
                        <>
                          L&apos;excellence électrique au <RotatingWord />
                        </>
                      )}
                    </h1>

                    {/* Subtitle / Description */}
                    {(subtitle || slide.description) && (
                      <p
                        className={`text-base md:text-lg text-white/60 max-w-2xl mb-10 leading-relaxed font-light transition-all duration-1000 ${
                          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                        style={{ transitionDelay: "450ms" }}
                      >
                        {subtitle || slide.description}
                      </p>
                    )}

                    {/* CTAs */}
                    <div
                      className={`flex flex-wrap gap-4 transition-all duration-1000 ${
                        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                      }`}
                      style={{ transitionDelay: "650ms" }}
                    >
                      {ctaTxt && (
                        <Link
                          to={ctaLink || "/contact"}
                          className="group inline-flex items-center gap-3 h-13 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.03] active:scale-[0.98]"
                          style={{ backgroundColor: accentColor, color: "#020b1a" }}
                        >
                          {ctaTxt}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      )}
                      {secCtaTxt && (
                        <Link
                          to={secCtaLnk || "#"}
                          className="inline-flex items-center gap-2 h-13 px-8 py-4 rounded-xl font-semibold text-sm uppercase tracking-widest border border-white/15 text-white/80 hover:bg-white/8 hover:text-white hover:border-white/30 transition-all"
                        >
                          {secCtaTxt}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Floating stats ribbon ── */}
      {showStats && (
        <div className="absolute bottom-14 left-0 right-0 z-20 pointer-events-none">
          <div className="container mx-auto px-6 md:px-12 lg:px-20">
            <div className="flex flex-wrap gap-3">
              <Stat value="500+" label="Installations auditées" icon={Shield} />
              <Stat value="95%"  label="Taux de satisfaction"   icon={Award}  />
              <Stat value="24/7" label="Support technique"      icon={Zap}    />
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation arrows ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white/5 hover:bg-white/12 text-white/60 hover:text-white transition-all backdrop-blur-md z-20 hidden md:flex items-center justify-center border border-white/8 group"
            title="Précédent"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white/5 hover:bg-white/12 text-white/60 hover:text-white transition-all backdrop-blur-md z-20 hidden md:flex items-center justify-center border border-white/8 group"
            title="Suivant"
          >
            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* ── Slide dots ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`rounded-full transition-all duration-500 ${
                selectedIndex === i
                  ? "w-7 h-1.5 bg-amber-400"
                  : "w-1.5 h-1.5 bg-white/20 hover:bg-white/50"
              }`}
              title={`Diapositive ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
