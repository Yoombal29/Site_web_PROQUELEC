
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLiveSettings } from "@/hooks/useLiveSettings";

export const HeroBanner = () => {
  const { settings } = useLiveSettings();

  const heroStyle = {
    background: `linear-gradient(135deg, ${settings?.primary_color || '#2376df'}, ${settings?.secondary_color || '#054393'})`,
    color: settings?.text_color || '#ffffff'
  };

  const buttonStyle = {
    backgroundColor: settings?.accent_color || '#1a73e8',
    borderColor: settings?.accent_color || '#1a73e8'
  };

  return (
    <div className="relative py-16 sm:py-20 md:py-28 lg:py-32 text-white overflow-hidden" style={heroStyle}>
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      
      {/* Éléments décoratifs */}
      <div className="absolute top-10 right-0 w-40 h-40 sm:w-60 sm:h-60 bg-white bg-opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-80 sm:h-80 bg-white bg-opacity-5 rounded-full blur-3xl"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
        <span className="inline-block bg-white/20 text-white font-semibold rounded-full px-3 sm:px-4 py-1 mb-4 text-xs sm:text-sm tracking-widest uppercase shadow">
          Promotion de la qualité électrique
        </span>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 drop-shadow-lg leading-tight" style={{ fontFamily: settings?.font_family }}>
          {settings?.site_name || "PROQUELEC SENEGAL"}
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-90 leading-relaxed" style={{ fontFamily: settings?.font_family }}>
          {settings?.slogan || "Sécurité · Qualité · Formation"}
        </p>
        
        <p className="text-base sm:text-lg max-w-3xl mx-auto mb-8 sm:mb-12 opacity-90 leading-relaxed" style={{ fontFamily: settings?.font_family }}>
          Expert en installations électriques au Sénégal. Nous garantissons la sécurité, la qualité et la conformité de vos projets électriques avec les normes internationales.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center flex-wrap">
          <Link to="/events" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              className="w-full text-white font-semibold px-6 sm:px-8 py-3 hover:opacity-90 transition-opacity shadow-lg"
              style={buttonStyle}
            >
              Nos Formations
            </Button>
          </Link>
          <Link to="/contact" className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="lg"
              className="w-full border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 shadow-lg font-semibold transition-all"
            >
              Nous Contacter
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 md:h-24 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
};
