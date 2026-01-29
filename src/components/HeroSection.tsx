import { ReactNode } from "react";
import { Search, ChevronRight } from "lucide-react";

interface HeroSectionProps {
  title: string;
  subtitle: string;
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
  badgeColor = "bg-orange-500"
}: HeroSectionProps) => {
  return (
    <section
      className={`relative w-full pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden ${gradient}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {/* Dark overlay if background image */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/60"></div>
      )}

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        {badge && (
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className={`${badgeColor} text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 opacity-90`}>
              <span className="w-2 h-2 bg-white rounded-full"></span>
              {badge}
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center mb-4 sm:mb-6 leading-tight animate-fade-in">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-blue-100 text-center mb-6 sm:mb-8 max-w-3xl mx-auto animate-fade-in">
          {subtitle}
        </p>

        {/* Description */}
        {description && (
          <p className="text-sm sm:text-base text-slate-300 text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
            {description}
          </p>
        )}

        {/* Search Bar */}
        {showSearch && (
          <div className="flex justify-center mb-10 sm:mb-12 animate-fade-in">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl
                           text-white placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30
                           transition-all duration-300"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
                <Search className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        {buttons.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-8 sm:mb-12 flex-wrap">
            {buttons.map((button, idx) => (
              <a
                key={idx}
                href={button.href || "#"}
                onClick={button.onClick}
                className={`
                  px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300
                  ${button.variant === "secondary"
                    ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                    : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-orange-500/50"
                  }
                  hover:scale-105 active:scale-95
                `}
              >
                {button.label}
                {button.variant !== "secondary" && <ChevronRight className="h-4 w-4" />}
              </a>
            ))}
          </div>
        )}

        {/* Children (custom content) */}
        {children && (
          <div className="animate-fade-in">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};
