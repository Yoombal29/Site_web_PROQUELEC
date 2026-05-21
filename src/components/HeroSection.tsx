import { useEffect, useState } from "react";
import { Search, ChevronRight } from "lucide-react";

export interface HeroSlide {
  title: string;
  subtitle: string;
  description?: string;
  gradient?: string;
  badge?: string;
  buttons?: Array<{
    label: string;
    href?: string;
    variant?: "primary" | "secondary";
  }>;
}

interface HeroSectionProps {
  // Static props (legacy support)
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  gradient?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  buttons?: Array<{
    label: string;
    onClick?: () => void;
    variant?: "primary" | "secondary";
    href?: string;
  }>;
  children?: ReactNode;
  badge?: string;
  badgeColor?: string;
  image?: string;

  // New dynamic props
  slides?: HeroSlide[];
}

export const HeroSection = ({
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundColor = "#1a2845",
  gradient = "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
  searchPlaceholder = "Rechercher...",
  onSearch,
  showSearch = false,
  buttons = [],
  children,
  badge,
  badgeColor = "bg-orange-500",
  image,
  slides = []
}: HeroSectionProps) => {

  const finalBackgroundImage = image || backgroundImage;

  // State management for slideshow
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // If slides are provided, use them; otherwise construct a single slide from static props
  const activeSlides = slides.length > 0 ? slides : [{
    title: title || "",
    subtitle: subtitle || "",
    description: description || "",
    gradient: gradient,
    badge: badge,
    buttons: buttons
  }];

  const currentSlide = activeSlides[currentSlideIndex];

  // Auto-rotate slides
  useEffect(() => {
    if (activeSlides.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
        setIsTransitioning(false);
      }, 500); // Wait for fade out before changing index
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, [activeSlides.length]);

  return (
    <section
      className={`relative w-full pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden transition-all duration-1000 ease-in-out ${currentSlide.gradient || gradient}`}>
      
      {/* Background Image using img tag instead of inline style to avoid lint errors */}
      {finalBackgroundImage &&
      <img
        src={finalBackgroundImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60" loading="lazy" />

      }

      {/* Dark overlay for better contrast if image exists */}
      {finalBackgroundImage &&
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      }

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Transition Container */}
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

          {/* Badge */}
          {currentSlide.badge &&
          <div className="flex justify-center mb-6 sm:mb-8">
              <div className={`${badgeColor} text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 opacity-90 shadow-lg backdrop-blur-sm`}>
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                {currentSlide.badge}
              </div>
            </div>
          }

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center mb-4 sm:mb-6 leading-tight drop-shadow-xl">
            {currentSlide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-blue-100 text-center mb-6 sm:mb-8 max-w-3xl mx-auto drop-shadow-md">
            {currentSlide.subtitle}
          </p>

          {/* Description */}
          {currentSlide.description &&
          <p className="text-sm sm:text-base text-slate-300 text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
              {currentSlide.description}
            </p>
          }

          {/* Search Bar */}
          {showSearch &&
          <div className="flex justify-center mb-10 sm:mb-12">
              <div className="relative w-full max-w-xl">
                <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl
                             text-white placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30
                             transition-all duration-300 shadow-xl" />

              


              
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
              </div>
            </div>
          }

          {/* Buttons */}
          {currentSlide.buttons && currentSlide.buttons.length > 0 &&
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-8 sm:mb-12 flex-wrap">
              {currentSlide.buttons.map((button, idx) =>
            <a
              key={idx}
              href={button.href || "#"}
              className={`
                    px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300
                    ${button.variant === "secondary" ?
              "bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm" :
              "bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-orange-500/50 hover:-translate-y-1"}
                  `
              }>
              
                  {button.label}
                  {button.variant !== "secondary" && <ChevronRight className="h-4 w-4" />}
                </a>
            )}
            </div>
          }

          {/* Children (custom content) */}
          {children &&
          <div>
              {children}
            </div>
          }

        </div>

        {/* Slide Indicators */}
        {activeSlides.length > 1 &&
        <div className="flex justify-center gap-3 mt-8">
            {activeSlides.map((_, index) =>
          <button
            key={index}
            onClick={() => setCurrentSlideIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlideIndex ? "bg-white w-8" : "bg-white/30 hover:bg-white/50"}`
            }
            aria-label={`Go to slide ${index + 1}`} />

          )}
          </div>
        }

      </div>
    </section>);

};