import React, { useEffect, useState } from "react";


const PartnerImage = ({ name, logo, fallback }: {name: string;logo: string;fallback: string;}) => {
  const [error, setError] = useState(false);

  if (error || !logo) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-proqblue/10 text-proqblue font-bold text-2xl rounded border-2 border-dashed border-proqblue/20 transition-all duration-300 group-hover:bg-proqblue/20 group-hover:border-proqblue/30">
        {fallback}
      </div>);

  }

  return (
    <img
      src={logo}
      alt={name}
      className="h-full w-full object-contain max-w-[120px] grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
      onError={() => setError(true)}
      title={name} loading="lazy" />);


};

// Données de secours (Fallback)
const fallbackPartners = [
{
  name: "SENELEC",
  logo: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=200&h=100&fit=crop",
  fallback: "SEN",
  category: "Opérateur national"
},
{
  name: "FISUEL",
  logo: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&h=100&fit=crop",
  fallback: "FIS",
  category: "Fédération sectorielle"
},
{
  name: "CNC",
  logo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=100&fit=crop",
  fallback: "CNC",
  category: "Chambre de commerce"
}];


type Partner = {
  id?: string | number;
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
        const response = await fetch("/api/partners");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        if (data && data.length > 0) {
          // Mapper les données DB vers le format attendu
          const mappedPartners = data.map((p: unknown) => ({
            id: p.id,
            name: p.name,
            logo: p.logo_url,
            fallback: p.name.substring(0, 3).toUpperCase(),
            category: p.category
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

      <div className="max-w-7xl mx-auto relative px-4">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-block">
            <h2 className="text-3xl font-bold text-proqblue mb-2">
              Ils nous font confiance
            </h2>
            <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full"></div>
          </div>
        </div>

        {/* Infinite Scroll Carousel */}
        <div className="w-full inline-flex flex-nowrap overflow-hidden mask-marquee py-8">
          <ul className="flex items-center justify-center md:justify-start [&_li]:mx-12 [&_img]:max-w-none animate-infinite-scroll">
            {/* Original Set */}
            {partners.map((partner, index) =>
            <li key={`p1-${index}`}>
                <div className="group w-[180px] h-[100px] flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-500 cursor-pointer">
                  <PartnerImage
                  name={partner.name}
                  logo={partner.logo}
                  fallback={partner.fallback || partner.name.substring(0, 3).toUpperCase()} />
                
                </div>
              </li>
            )}
            {/* Duplicate Set for smooth loop */}
            {partners.map((partner, index) =>
            <li key={`p2-${index}`}>
                <div className="group w-[180px] h-[100px] flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-500 cursor-pointer">
                  <PartnerImage
                  name={partner.name}
                  logo={partner.logo}
                  fallback={partner.fallback || partner.name.substring(0, 3).toUpperCase()} />
                
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>);

};


export default PartnerLogos;