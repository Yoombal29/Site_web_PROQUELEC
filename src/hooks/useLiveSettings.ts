
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface LiveSettings {
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
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
}

const fetchLiveSettings = async (): Promise<LiveSettings> => {
  // console.log('Récupération des paramètres en temps réel...');
  
  // Récupérer les paramètres du site
  const { data: siteData, error: siteError } = await supabase
    .from("site_settings")
    .select("*")
    .single();

  if (siteError) {
    console.error('Erreur paramètres site:', siteError);
  }

  // Récupérer les paramètres de thème
  const { data: themeData, error: themeError } = await supabase
    .from("theme_settings")
    .select("*")
    .single();

  if (themeError) {
    console.error('Erreur paramètres thème:', themeError);
  }

  // Combiner les données
  const settings = {
    site_name: siteData?.site_name || "PROQUELEC SENEGAL",
    slogan: siteData?.slogan || "Sécurité · Qualité · Formation",
    logo_url: siteData?.logo_url,
    favicon_url: siteData?.favicon_url,
    contact_email: siteData?.contact_email || "contact@proquelec.sn",
    phone_number: siteData?.phone_number || "+221 XX XXX XX XX",
    address: siteData?.address || "Dakar, Sénégal",
    copyright_text: siteData?.copyright_text,
    facebook_url: siteData?.facebook_url,
    linkedin_url: siteData?.linkedin_url,
    twitter_url: siteData?.twitter_url,
    primary_color: themeData?.primary_color || "#2376df",
    secondary_color: themeData?.secondary_color || "#054393",
    accent_color: themeData?.accent_color || "#1a73e8",
    background_color: themeData?.background_color || "#f8f9fa",
    text_color: themeData?.text_color || "#333333",
    font_family: themeData?.font_family || "Roboto",
  };

  // console.log('Paramètres récupérés:', settings);
  return settings;
};

export function useLiveSettings() {
  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ["liveSettings"],
    queryFn: fetchLiveSettings,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes au lieu de 2
    staleTime: 10000, // Considérer comme périmé après 10 secondes
  });

  // Appliquer les styles CSS dynamiquement
  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      
      // Appliquer les couleurs
      root.style.setProperty('--color-proqblue', settings.primary_color);
      root.style.setProperty('--color-proqblue-dark', settings.secondary_color);
      root.style.setProperty('--color-accent', settings.accent_color);
      root.style.setProperty('--color-background', settings.background_color);
      root.style.setProperty('--color-text', settings.text_color);
      
      // Appliquer la police
      document.body.style.fontFamily = settings.font_family;
      
      // Mettre à jour le titre et favicon
      document.title = settings.site_name;
      
      if (settings.favicon_url) {
        const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (favicon) {
          favicon.href = settings.favicon_url;
        }
      }
      
      // console.log('Styles appliqués:', settings);
    }
  }, [settings]);

  return { settings, isLoading, error, refetch };
}
