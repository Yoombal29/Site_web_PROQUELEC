import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, BookOpen, Award, MessageSquare, ArrowRight, Zap, LucideIcon } from "lucide-react";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { supabase } from "@/integrations/supabase/client";

// Mapping des noms d'icônes vers les composants React
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Award,
  FileText,
  MessageSquare,
  Zap,
};

const fallbackLinks = [
  {
    title: "Formations",
    description: "Découvrez nos programmes de formation électrique certifiés et reconnus",
    icon: BookOpen,
    href: "/formations",
    color: "#2376df",
    delay: 0
  },
  {
    title: "Certifications",
    description: "Obtenez vos certifications professionnelles en installations électriques",
    icon: Award,
    href: "/certifications",
    color: "#054393",
    delay: 100
  },
  {
    title: "Documents techniques",
    description: "Accédez à notre bibliothèque de normes, guides et ressources électriques",
    icon: FileText,
    href: "/documents",
    color: "#1a73e8",
    delay: 200
  },
  {
    title: "Contactez-nous",
    description: "Parlons de vos projets électriques avec nos experts disponibles",
    icon: MessageSquare,
    href: "/contact",
    color: "#16a34a",
    delay: 300
  }
];

export const QuickLinks = () => {
  const { settings } = useLiveSettings();
  const [quickLinks, setQuickLinks] = useState(fallbackLinks);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('quick_links')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (data && data.length > 0) {
          const mappedLinks = data.map((l: any, index: number) => ({
            title: l.title,
            description: l.description,
            icon: iconMap[l.icon_name] || Zap, // Fallback icon
            href: l.href,
            color: l.color,
            delay: 100 * index
          }));
          setQuickLinks(mappedLinks);
        }
      } catch (e) {
        console.error("Error fetching links", e);
      }
    };
    fetchLinks();
  }, []);

  const sectionStyle = {
    backgroundColor: settings?.background_color || '#f8f9fa',
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={sectionStyle}>
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-proqblue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-proqblue/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block">
            <div className="flex items-center gap-2 justify-center mb-3">
              <Zap className="h-6 w-6 text-proqblue" />
              <span className="text-sm font-semibold text-proqblue uppercase tracking-wider">Accès Rapide</span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                color: settings?.primary_color || '#2376df',
                fontFamily: settings?.font_family || 'Roboto'
              }}
            >
              Trouvez ce qu'il vous faut
            </h2>
          </div>
          <p
            className="text-gray-600 max-w-2xl mx-auto text-lg"
            style={{ fontFamily: settings?.font_family || 'Roboto' }}
          >
            Accédez rapidement à nos formations, certifications et ressources techniques
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((linkItem, index) => {
            const Icon = linkItem.icon;

            return (
              <Link
                key={index}
                to={linkItem.href}
                className="group"
                style={{ animationDelay: `${linkItem.delay}ms` }}
              >
                <div className="h-full bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-proqblue/20 overflow-hidden">
                  {/* Top accent bar */}
                  <div
                    className="h-1 w-full"
                    style={{ backgroundColor: linkItem.color }}
                  ></div>

                  {/* Content */}
                  <div className="p-6 flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${linkItem.color}20`, color: linkItem.color }}
                    >
                      <Icon className="h-7 w-7" />
                    </div>

                    {/* Title */}
                    <h3
                      className="text-lg font-semibold mb-2 group-hover:translate-x-1 transition-transform"
                      style={{
                        color: linkItem.color,
                        fontFamily: settings?.font_family || 'Roboto'
                      }}
                    >
                      {linkItem.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-sm text-gray-600 mb-4 flex-grow"
                      style={{ fontFamily: settings?.font_family || 'Roboto' }}
                    >
                      {linkItem.description}
                    </p>

                    {/* CTA Arrow */}
                    <div className="flex items-center text-sm font-medium" style={{ color: linkItem.color }}>
                      <span>En savoir plus</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                    style={{ backgroundColor: linkItem.color }}
                  ></div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
