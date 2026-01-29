import { useEffect, useState } from "react";
import { Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Données de secours (Fallback)
const fallbackPartners = [
  {
    name: "SENELEC",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop&auto=format",
    fallback: "SEN",
    category: "Opérateur national"
  },
  {
    name: "FISUEL",
    logo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=200&h=100&fit=crop&auto=format",
    fallback: "FIS",
    category: "Fédération sectorielle"
  },
  {
    name: "CNC",
    logo: "https://images.unsplash.com/photo-1560472355-a9a2bcd3bf11?w=200&h=100&fit=crop&auto=format",
    fallback: "CNC",
    category: "Chambre de commerce"
  },
];

type Partner = {
  id?: number;
  name: string;
  logo: string;
  fallback?: string;
  category: string;
  display_order?: number;
};

export const PartnerLogos = () => {
  const [partners, setPartners] = useState<Partner[]>(fallbackPartners);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (data && data.length > 0) {
          // Mapper les données DB vers le format attendu
          const mappedPartners = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            logo: p.logo_url,
            fallback: p.name.substring(0, 3).toUpperCase(),
            category: p.category,
          }));
          setPartners(mappedPartners);
        }
      } catch (err) {
        console.warn("Could not fetch partners, using fallback", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);
  return (
    <section className="py-20 px-4 relative overflow-hidden bg-white">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-proqblue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-proqblue/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block">
            <div className="flex items-center gap-2 justify-center mb-3">
              <Award className="h-6 w-6 text-proqblue" />
              <span className="text-sm font-semibold text-proqblue uppercase tracking-wider">Nos Partenaires</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-proqblue mb-4">
              Nos partenaires institutionnels
            </h2>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Nous collaborons avec des institutions de confiance pour garantir la qualité et la sécurité électrique au Sénégal
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {partners.map(({ name, logo, fallback, category }, index) => (
            <div
              key={name}
              className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-proqblue/20 p-8 overflow-hidden text-center"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-proqblue to-proqblue-dark"></div>

              {/* Logo section */}
              <div className="mb-6">
                <div className="relative inline-block">
                  <div className="h-20 w-40 flex items-center justify-center bg-gradient-to-br from-proqblue opacity-50 to-proqblue/10 rounded-lg p-4">
                    <img
                      src={logo}
                      alt={name}
                      className="h-full w-full object-contain max-w-[120px] grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallbackDiv = target.nextElementSibling as HTMLElement;
                        if (fallbackDiv) {
                          fallbackDiv.style.display = 'flex';
                        }
                      }}
                      title={name}
                    />
                    <div
                      className="hidden w-full h-full items-center justify-center bg-proqblue/20 text-proqblue font-bold text-2xl rounded border-2 border-dashed border-proqblue/30"
                      style={{ display: 'none' }}
                    >
                      {fallback}
                    </div>
                  </div>
                </div>
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-proqblue mb-1 group-hover:text-proqblue-dark transition-colors">
                {name}
              </h3>

              {/* Category */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                {category}
              </p>

              {/* Trust indicator */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-600 italic">
                  Partenaire de confiance depuis 2020
                </p>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-proqblue transition-opacity pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className="bg-gradient-to-r from-proqblue opacity-50 via-transparent to-proqblue/5 rounded-xl border border-proqblue/10 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-proqblue mb-2">3+</div>
              <p className="text-gray-600">Partenaires clés</p>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="h-8 w-8 text-proqblue mb-2" />
              <p className="text-gray-600">Croissance constante</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-proqblue mb-2">100%</div>
              <p className="text-gray-600">Qualité garantie</p>
            </div>
          </div>
        </div>

        {/* Footer message */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 text-lg font-medium">
            ✨ Ensemble pour un Sénégal <span className="text-proqblue font-bold">électriquement sûr</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PartnerLogos;
