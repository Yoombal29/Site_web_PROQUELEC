
import { Facebook, Linkedin, Twitter, Mail, Phone, MapPin, ArrowRight, Shield, Award, Zap, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { useMenuItems } from "@/hooks/useMenuItems";

export const Footer = () => {
  const { settings } = useLiveSettings();
  const { data: menuItems } = useMenuItems();

  const footerStyle = {
    backgroundColor: settings?.secondary_color || '#2C2C2C', // Gris anthracite par défaut
    color: settings?.text_color || '#ffffff'
  };

  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} ${settings?.site_name || 'PROQUELEC'}. Tous droits réservés.`;

  // Fetch dynamic footer menu items
  const dbFooterMenuItems = menuItems?.filter((item) => item.menu_type === 'footer' && item.is_active).
  sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0)) || [];

  const footerLinks = {
    navigation: dbFooterMenuItems.length > 0 ?
    dbFooterMenuItems.map((item) => ({ id: item.id, label: item.title, path: item.url })) :
    [
    { label: "Accueil", path: "/" },
    { label: "À propos", path: "/about" },
    { label: "Activités", path: "/activities" },
    { label: "Nos labels", path: "/labels" },
    { label: "Documents", path: "/documents" },
    { label: "Blog & Actualités", path: "/blog" },
    { label: "Événements", path: "/events" }],

    services: [
    { label: "Formations", path: "/formations", icon: BookOpen },
    { label: "Certifications", path: "/certifications", icon: Award },
    { label: "Documentation", path: "/documents", icon: Shield },
    { label: "Labels", path: "/labels", icon: Zap },
    { label: "Contact", path: "/contact", icon: Mail }]

  };

  const SocialLink = ({ href, icon: Icon, label }) =>
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="group flex items-center justify-center w-10 h-10 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 hover:scale-110 hover:shadow-lg">
    
      <Icon className="h-5 w-5" />
    </a>;


  const FooterLink = ({ to, children, icon: Icon = null }) =>
  <Link
    to={to}
    className="group text-xs sm:text-sm opacity-85 hover:opacity-100 transition-opacity duration-200 inline-flex items-center gap-1.5">
    
      {Icon && <Icon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />}
      {children}
      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </Link>;


  return (
    <footer
      className={`mt-8 sm:mt-12 md:mt-16 relative overflow-hidden text-white bg-cover bg-center bg-fixed bg-no-repeat ${settings?.footer_background_url ? 'footer-with-bg' : 'bg-[var(--color-proqblue-dark)]'}`}>
      
      {settings?.footer_background_url &&
      <style dangerouslySetInnerHTML={{
        __html: `
          .footer-with-bg {
            background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${settings.footer_background_url});
          }
        ` }} />
      }
      {/* Gradient overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Main content grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 sm:mb-16">
          {/* Colonne 1: Entreprise */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {settings?.logo_url ?
                <img
                  src={settings.logo_url}
                  alt={settings.site_name}
                  className="h-10 sm:h-12 w-auto" loading="lazy" /> :


                <img
                  src="/logo.png"
                  alt="PROQUELEC"
                  className="h-10 sm:h-12 w-auto object-contain" loading="lazy" />

                }
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  {settings?.site_name || "PROQUELEC"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm opacity-75 max-w-xs">
                {settings?.slogan?.replace('S?curit?', 'Sécurité')?.replace('Qualit?', 'Qualité') || "Information · Sensibilisation · Conseil"}
              </p>
            </div>

            {/* Contact info */}
            <div className="space-y-3 pt-2 border-t border-white border-opacity-10">
              {settings?.address &&
              <div className="flex items-start gap-2 text-xs sm:text-sm group">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="opacity-85 group-hover:opacity-100 transition-opacity">{settings.address}</span>
                </div>
              }
              {settings?.phone_number &&
              <a href={`tel:${settings.phone_number}`} className="flex items-center gap-2 text-xs sm:text-sm group opacity-85 hover:opacity-100 transition-opacity">
                  <Phone className="h-4 w-4 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span>{settings.phone_number}</span>
                </a>
              }
              {settings?.contact_email &&
              <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 text-xs sm:text-sm group opacity-85 hover:opacity-100 transition-opacity">
                  <Mail className="h-4 w-4 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="break-all">{settings.contact_email}</span>
                </a>
              }
            </div>
          </div>

          {/* Colonne 2: Navigation */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-5 flex items-center gap-2">
              Navigation
            </h4>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link, index) =>
              <li key={link.id || link.path || `footer-${index}`}>
                  <FooterLink to={link.path}>
                    {link.label}
                  </FooterLink>
                </li>
              )}
            </ul>
          </div>

          {/* Colonne 3: Services */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-5">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((service) =>
              <li key={service.path}>
                  <FooterLink to={service.path} icon={service.icon}>
                    {service.label}
                  </FooterLink>
                </li>
              )}
            </ul>
          </div>

          {/* Colonne 4: Réseaux sociaux */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-5">
              Suivez-nous
            </h4>
            <div className="flex flex-wrap gap-3">
              {settings?.facebook_url &&
              <SocialLink href={settings.facebook_url} icon={Facebook} label="Facebook" />
              }
              {settings?.linkedin_url &&
              <SocialLink href={settings.linkedin_url} icon={Linkedin} label="LinkedIn" />
              }
              {settings?.twitter_url &&
              <SocialLink href={settings.twitter_url} icon={Twitter} label="Twitter / X" />
              }
              {settings?.contact_email &&
              <SocialLink href={`mailto:${settings.contact_email}`} icon={Mail} label="Email" />
              }
            </div>

            {/* Quick CTA */}
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-xs font-medium transition-all duration-300 hover:shadow-lg group">
              
              <span>Nous contacter</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white border-opacity-15 my-8 sm:my-12"></div>

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <p className="text-xs sm:text-sm opacity-70 text-center sm:text-left">
            {settings?.copyright_text || defaultCopyright}
          </p>
          <div className="flex justify-center sm:justify-end gap-4 text-xs sm:text-sm flex-wrap">
            <Link to="/legal" className="opacity-70 hover:opacity-100 transition-opacity">
              Mentions légales
            </Link>
            <span className="opacity-30">·</span>
            <Link to="/legal" className="opacity-70 hover:opacity-100 transition-opacity">
              Confidentialité
            </Link>
            <span className="opacity-30">·</span>
            <Link to="/sitemap" className="opacity-70 hover:opacity-100 transition-opacity">
              Plan du site
            </Link>
          </div>
        </div>
      </div>
    </footer>);

};