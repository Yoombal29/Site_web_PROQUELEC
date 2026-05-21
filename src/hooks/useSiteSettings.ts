
import { useQuery } from "@tanstack/react-query";

import { toast } from 'sonner';
import { useEffect } from "react";

interface SiteSettings {
  site_name: string;
  slogan: string;
  logo_url?: string;
  favicon_url?: string;
  contact_email?: string;
  phone_number?: string;
  address?: string;
  copyright_text?: string;
  facebook_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
}

// Fonction pour récupérer les paramètres du site depuis l'API locale
const fetchSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const res = await fetch("/api/site-settings");
    if (!res.ok) throw new Error("Failed to fetch settings");
    const data = await res.json();
    // Assuming API returns array (getTable helper), we take first item or match single() logic
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    toast.error('Erreur lors de la récupération des paramètres du site.');
    return {
      site_name: "PROQUELEC SENEGAL",
      slogan: "Sécurité · Qualité · Formation",
      contact_email: "contact@proquelec.sn",
      phone_number: "+221 XX XXX XX XX",
      address: "Dakar, Sénégal",
      facebook_url: "https://facebook.com/proquelec",
      twitter_url: "https://twitter.com/proquelec",
      linkedin_url: "https://linkedin.com/company/proquelec",
    };
  }
};

export function useSiteSettings() {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: fetchSiteSettings,
    staleTime: Infinity, // Les paramètres du site ne changent pas souvent
  });

  // Effet pour mettre à jour le titre du document et le favicon
  useEffect(() => {
    if (settings) {
      document.title = `${settings.site_name}`;

      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (favicon && settings.favicon_url) {
        favicon.href = settings.favicon_url;
      }
    }
  }, [settings]);

  return { settings, isLoading, error };
}
