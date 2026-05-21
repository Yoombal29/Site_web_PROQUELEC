
import { useQuery } from "@tanstack/react-query";

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
  footer_background_url?: string;
  audience_section_title?: string;
  audience_section_subtitle?: string;
  audience_title_electrician?: string;
  audience_subtitle_electrician?: string;
  audience_desc_electrician?: string;
  audience_title_company?: string;
  audience_subtitle_company?: string;
  audience_desc_company?: string;
  audience_title_member?: string;
  audience_subtitle_member?: string;
  audience_desc_member?: string;
  cta_primary_text?: string;
  cta_primary_url?: string;
  cta_secondary_text?: string;
  cta_secondary_url?: string;
  page_sections?: Record<string, unknown>;
}

const fetchLiveSettings = async (): Promise<LiveSettings> => {
  // console.log('Récupération des paramètres en temps réel...');

  let siteData = null;
  let themeData = null;

  try {
    const siteRes = await fetch('/api/site-settings');
    if (siteRes.ok) {
      const rawSite = await siteRes.json();
      siteData = Array.isArray(rawSite) ? rawSite[0] : rawSite;
    }
  } catch (e) {console.error('Error fetching site settings', e);}

  try {
    const themeRes = await fetch('/api/theme-settings');
    if (themeRes.ok) {
      const rawTheme = await themeRes.json();
      themeData = Array.isArray(rawTheme) ? rawTheme[0] : rawTheme;
    }
  } catch (e) {console.error('Error fetching theme settings', e);}

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
    footer_background_url: themeData?.footer_background_url,
    // CTA mapping
    cta_primary_text: siteData?.cta_primary_text,
    cta_primary_url: siteData?.cta_primary_url,
    cta_secondary_text: siteData?.cta_secondary_text,
    cta_secondary_url: siteData?.cta_secondary_url,
    // Audience mapping
    audience_section_title: siteData?.audience_section_title || 'Des Services Sur-Mesure',
    audience_section_subtitle: siteData?.audience_section_subtitle || "Que vous soyez indépendant, une entreprise ou un expert membre, PROQUELEC vous accompagne avec des outils dédiés.",
    audience_title_electrician: siteData?.audience_title_electrician || 'Électriciens',
    audience_subtitle_electrician: siteData?.audience_subtitle_electrician || 'Indépendants & Artisans',
    audience_desc_electrician: siteData?.audience_desc_electrician || 'Accédez aux normes gratuites, nos calculateurs pro et le générateur de schémas pour vos dossiers.',
    audience_title_company: siteData?.audience_title_company || 'Professionnels',
    audience_subtitle_company: siteData?.audience_subtitle_company || 'Entreprises & Installateurs',
    audience_desc_company: siteData?.audience_desc_company || "Gérez vos chantiers, vos certifications et bénéficiez d'une visibilité accrue sur l'annuaire national.",
    audience_title_member: siteData?.audience_title_member || 'Membres',
    audience_subtitle_member: siteData?.audience_subtitle_member || 'Association & Experts',
    audience_desc_member: siteData?.audience_desc_member || "Participez à la vie de l'institution, bénéficiez d'un support prioritaire et de la veille normative en avant-première.",
    page_sections: siteData?.page_sections || {}
  };

  // console.log('Paramètres récupérés:', settings);
  return settings;
};

export function useLiveSettings() {
  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ["liveSettings"],
    queryFn: fetchLiveSettings,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes au lieu de 2
    staleTime: 10000 // Considérer comme périmé après 10 secondes
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