import React from 'react';
import { Element } from '@craftjs/core';
import { ContainerBlock, TextBlock, ButtonBlock, StatsBlock, CardBlock, TestimonialsBlock, PricingBlock, AccordionBlock, CounterBlock, ProgressBarBlock, AlertBlock, GalleryBlock, IconBoxBlock } from '../../components/blocks/ProquelecBlocks';
import { HeadingBlock, TeamMembersGridBlock, LogoGridBlock, BreadcrumbsBlock } from '../../components/blocks/ProquelecBlocksPlus';
import { DividerBlock, SpacerBlock, ColumnsBlock, HeroBlock } from '../../components/blocks/ProquelecBlocks';
import { CallToActionBlock } from '../../components/blocks/ProquelecBlocksPlus';
import type { Theme } from './themes';
import type { IndustryContent } from './industries';

export interface PageBlueprint {
  name: string;
  description: string;
  category: string;
  sections: SectionTemplate[];
}

export type SectionTemplate = (theme: Theme, content: IndustryContent) => React.ReactElement;

// ── SECTION FACTORIES ──

// 1. Hero
export const heroFull: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={80} paddingY={100} backgroundColor={t.colors.primary} maxWidth="100%">
    <Element is={ContainerBlock} canvas maxWidth="720px" style={{ margin: '0 auto', textAlign: 'center' }}>
      <HeadingBlock text={c.hero.title} level="h1" fontSize={48} color="#ffffff" textAlign="center" />
      <SpacerBlock height={16} />
      <TextBlock text={c.hero.subtitle} fontSize={18} color="rgba(255,255,255,0.85)" textAlign="center" />
      <SpacerBlock height={32} />
      <ButtonBlock text={c.hero.cta} type="primary" />
    </Element>
  </Element>
);

export const heroSplit: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={0} backgroundColor={t.colors.background} maxWidth="100%">
    <Element is={ColumnsBlock} canvas columns={2} gap={0}>
      <Element is={ContainerBlock} canvas padding={64} backgroundColor={t.colors.surface}>
        <HeadingBlock text={c.hero.title} level="h1" fontSize={42} color={t.colors.text} />
        <SpacerBlock height={16} />
        <TextBlock text={c.hero.subtitle} fontSize={18} color={t.colors.textMuted} />
        <SpacerBlock height={24} />
        <ButtonBlock text={c.hero.cta} type="primary" />
      </Element>
      <Element is={ContainerBlock} canvas padding={0} backgroundColor={t.colors.primary} style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TextBlock text="◻◻◻" fontSize={80} color="rgba(255,255,255,0.2)" textAlign="center" />
      </Element>
    </Element>
  </Element>
);

export const heroCentered: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.surface} maxWidth="100%">
    <Element is={ContainerBlock} canvas maxWidth="640px" style={{ margin: '0 auto', textAlign: 'center' }}>
      <HeadingBlock text={c.hero.title} level="h1" fontSize={44} color={t.colors.text} textAlign="center" />
      <SpacerBlock height={16} />
      <TextBlock text={c.hero.subtitle} fontSize={16} color={t.colors.textMuted} textAlign="center" />
      <SpacerBlock height={24} />
      <ButtonBlock text={c.hero.cta} type="primary" />
    </Element>
  </Element>
);

export const heroStats: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={0} backgroundColor={t.colors.background} maxWidth="100%">
    <Element is={ContainerBlock} canvas padding={80} paddingY={80} maxWidth="100%" style={{ textAlign: 'center' }}>
      <HeadingBlock text={c.hero.title} level="h1" fontSize={44} color={t.colors.text} textAlign="center" />
      <SpacerBlock height={16} />
      <ButtonBlock text={c.hero.cta} type="primary" />
    </Element>
    <StatsBlock />
  </Element>
);

// 2. Services
export const servicesCards: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.surface} maxWidth="100%">
    <HeadingBlock text={c.services.title} level="h2" fontSize={36} color={t.colors.text} textAlign="center" />
    <SpacerBlock height={40} />
    <Element is={ColumnsBlock} canvas columns={3} gap={24}>
      {c.services.items.map((svc, i) => (
        <CardBlock key={i} icon={svc.icon} title={svc.name} text={svc.desc} />
      ))}
    </Element>
  </Element>
);

export const servicesIconBox: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.background} maxWidth="100%">
    <HeadingBlock text={c.services.title} level="h2" fontSize={36} color={t.colors.text} textAlign="center" />
    <SpacerBlock height={40} />
    <Element is={ColumnsBlock} canvas columns={3} gap={32}>
      {c.services.items.map((svc, i) => (
        <IconBoxBlock key={i} icon={svc.icon} title={svc.name} text={svc.desc} />
      ))}
    </Element>
  </Element>
);

// 3. About
export const aboutSimple: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.background} maxWidth="768px" style={{ margin: '0 auto' }}>
    <HeadingBlock text={c.about.title} level="h2" fontSize={36} color={t.colors.text} textAlign="center" />
    <SpacerBlock height={24} />
    <TextBlock text={c.about.text} fontSize={16} color={t.colors.textMuted} textAlign="center" lineHeight="1.8" />
  </Element>
);

// 4. Stats
export const statsBar: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={48} paddingY={60} backgroundColor={t.colors.primary} maxWidth="100%">
    <Element is={ColumnsBlock} canvas columns={c.stats.length} gap={16}>
      {c.stats.map((s, i) => (
        <CounterBlock key={i} value={s.value} label={s.label} />
      ))}
    </Element>
  </Element>
);

export const statsWithBg: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={48} paddingY={60} backgroundColor={t.colors.secondary} maxWidth="100%">
    <Element is={ColumnsBlock} canvas columns={c.stats.length} gap={24}>
      {c.stats.map((s, i) => (
        <CounterBlock key={i} value={s.value} label={s.label} />
      ))}
    </Element>
  </Element>
);

// 5. Testimonials
export const testimonialsSimple: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.surface} maxWidth="100%">
    <HeadingBlock text="Témoignages" level="h2" fontSize={36} color={t.colors.text} textAlign="center" />
    <SpacerBlock height={32} />
    <Element is={ColumnsBlock} canvas columns={2} gap={24}>
      {c.testimonials.map((tm, i) => (
        <div key={i} style={{ padding: 24, background: t.colors.background, borderRadius: t.borderRadius, border: '1px solid ' + t.colors.border }}>
          <TextBlock text={'"' + tm.text + '"'} fontSize={14} color={t.colors.text} />
          <SpacerBlock height={12} />
          <TextBlock text={tm.name + ' — ' + tm.role} fontSize={12} color={t.colors.textMuted} />
        </div>
      ))}
    </Element>
  </Element>
);

// 6. CTA
export const ctaSimple: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.primary} maxWidth="100%">
    <Element is={ContainerBlock} canvas maxWidth="640px" style={{ margin: '0 auto', textAlign: 'center' }}>
      <HeadingBlock text={c.cta.title} level="h2" fontSize={36} color="#ffffff" textAlign="center" />
      <SpacerBlock height={12} />
      <TextBlock text={c.cta.description} fontSize={16} color="rgba(255,255,255,0.85)" textAlign="center" />
      <SpacerBlock height={24} />
      <ButtonBlock text={c.cta.button} type="primary" />
    </Element>
  </Element>
);

export const ctaBanner: SectionTemplate = (t, c) => (
  <CallToActionBlock title={c.cta.title} description={c.cta.description} buttonText={c.cta.button} bgColor={t.colors.primary} textColor="#ffffff" buttonBg="#ffffff" buttonTextColor={t.colors.primary} />
);

// 7. Features
export const featuresGrid: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.background} maxWidth="100%">
    <HeadingBlock text="Pourquoi Nous Choisir" level="h2" fontSize={36} color={t.colors.text} textAlign="center" />
    <SpacerBlock height={32} />
    <Element is={ColumnsBlock} canvas columns={4} gap={16}>
      {c.features.map((f, i) => (
        <Element key={i} is={ContainerBlock} canvas padding={24} backgroundColor={t.colors.surface} style={{ borderRadius: t.borderRadius, textAlign: 'center', border: '1px solid ' + t.colors.border }}>
          <TextBlock text={f.icon} fontSize={32} textAlign="center" />
          <SpacerBlock height={8} />
          <TextBlock text={f.text} fontSize={14} color={t.colors.text} fontWeight={600} textAlign="center" />
        </Element>
      ))}
    </Element>
  </Element>
);

// 8. Team
export const teamSection: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.surface} maxWidth="100%">
    <HeadingBlock text="Notre Équipe" level="h2" fontSize={36} color={t.colors.text} textAlign="center" />
    <SpacerBlock height={32} />
    <TeamMembersGridBlock members={[
      { name: 'Alice Dupont', role: 'CEO', photo: '', bio: 'Visionnaire' },
      { name: 'Bob Martin', role: 'CTO', photo: '', bio: 'Expert technique' },
      { name: 'Claire Dubois', role: 'CMO', photo: '', bio: 'Stratège' },
    ]} />
  </Element>
);

// 9. Logos / Clients
export const logosSection: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={32} paddingY={48} backgroundColor={t.colors.surface} maxWidth="100%">
    <HeadingBlock text="Ils nous font confiance" level="h3" fontSize={20} color={t.colors.textMuted} textAlign="center" />
    <SpacerBlock height={24} />
    <LogoGridBlock />
  </Element>
);

// 10. Pricing
export const pricingSection: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.background} maxWidth="100%">
    <HeadingBlock text="Nos Offres" level="h2" fontSize={36} color={t.colors.text} textAlign="center" />
    <SpacerBlock height={32} />
    <PricingBlock />
  </Element>
);

// 11. FAQ
export const faqSection: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.surface} maxWidth="768px" style={{ margin: '0 auto' }}>
    <HeadingBlock text="FAQ" level="h2" fontSize={36} color={t.colors.text} textAlign="center" />
    <SpacerBlock height={32} />
    <AccordionBlock />
  </Element>
);

// 12. Gallery
export const gallerySection: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.background} maxWidth="100%">
    <HeadingBlock text="Galerie" level="h2" fontSize={36} color={t.colors.text} textAlign="center" />
    <SpacerBlock height={32} />
    <GalleryBlock />
  </Element>
);

// 13. Progress bars (skills)
export const skillsSection: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.surface} maxWidth="640px" style={{ margin: '0 auto' }}>
    <HeadingBlock text="Nos Compétences" level="h2" fontSize={36} color={t.colors.text} textAlign="center" />
    <SpacerBlock height={32} />
    {['Expertise technique', 'Qualité service', 'Satisfaction client', 'Innovation'].map((label, i) => (
      <Element key={i} is={ContainerBlock} canvas style={{ marginBottom: 16 }}>
        <ProgressBarBlock percent={75 + i * 5} label={label} />
      </Element>
    ))}
  </Element>
);

// 14. Newsletter / Contact
export const newsletterSection: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={48} paddingY={60} backgroundColor={t.colors.primary} maxWidth="100%">
    <Element is={ContainerBlock} canvas maxWidth="480px" style={{ margin: '0 auto', textAlign: 'center' }}>
      <HeadingBlock text="Restez informé" level="h2" fontSize={32} color="#ffffff" textAlign="center" />
      <SpacerBlock height={8} />
      <TextBlock text="Recevez nos actualités chaque mois" fontSize={14} color="rgba(255,255,255,0.8)" textAlign="center" />
      <SpacerBlock height={24} />
      <Element is={ContainerBlock} canvas style={{ display: 'flex', gap: 8 }}>
        <Element is={ContainerBlock} canvas padding={0} style={{ flex: 1 }}>
          <TextBlock text="[ Email ]" fontSize={13} color="rgba(0,0,0,0.4)" />
        </Element>
        <ButtonBlock text="S'abonner" type="primary" />
      </Element>
    </Element>
  </Element>
);

// 15. Alert banner
export const alertSection: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={0} backgroundColor={t.colors.accent} maxWidth="100%">
    <AlertBlock message="🚀 Offre de lancement -20% sur tous les abonnements jusqu'au 30 juin" type="info" />
  </Element>
);

// 16. Divider + Spacer
export const dividerSection: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={0} backgroundColor={t.colors.background} maxWidth="100%">
    <DividerBlock />
  </Element>
);

// 17. Feature list
export const featureListSection: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={48} paddingY={60} backgroundColor={t.colors.background} maxWidth="100%">
    <HeadingBlock text="Fonctionnalités" level="h2" fontSize={36} color={t.colors.text} textAlign="center" />
    <SpacerBlock height={24} />
    <Element is={ColumnsBlock} canvas columns={2} gap={16} maxWidth="800px" style={{ margin: '0 auto' }}>
      {c.features.map((f, i) => (
        <Element key={i} is={ContainerBlock} canvas padding={16} backgroundColor={t.colors.surface} style={{ borderRadius: t.borderRadius, border: '1px solid ' + t.colors.border }}>
          <TextBlock text={f.icon + ' ' + f.text} fontSize={14} color={t.colors.text} fontWeight={500} />
        </Element>
      ))}
    </Element>
  </Element>
);

// 18. Hero with background (minimal)
export const heroMinimal: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={60} paddingY={80} backgroundColor={t.colors.background} maxWidth="100%">
    <Element is={ContainerBlock} canvas maxWidth="600px" style={{ margin: '0 auto', textAlign: 'center' }}>
      <TextBlock text={c.footer.company} fontSize={12} color={t.colors.accent} textAlign="center" fontWeight={700} />
      <SpacerBlock height={12} />
      <HeadingBlock text={c.hero.title} level="h1" fontSize={40} color={t.colors.text} textAlign="center" />
      <SpacerBlock height={16} />
      <TextBlock text={c.hero.subtitle} fontSize={16} color={t.colors.textMuted} textAlign="center" />
      <SpacerBlock height={32} />
      <ButtonBlock text={c.hero.cta} type="primary" />
    </Element>
  </Element>
);

// 19. Double CTA
export const doubleCTA: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={48} paddingY={60} backgroundColor={t.colors.secondary} maxWidth="100%">
    <Element is={ColumnsBlock} canvas columns={2} gap={32} maxWidth="800px" style={{ margin: '0 auto' }}>
      <Element is={ContainerBlock} canvas padding={32} backgroundColor={t.colors.primary} style={{ borderRadius: t.borderRadius, textAlign: 'center' }}>
        <HeadingBlock text={c.cta.title} level="h3" fontSize={24} color="#ffffff" textAlign="center" />
        <SpacerBlock height={12} />
        <ButtonBlock text={c.cta.button} type="primary" />
      </Element>
      <Element is={ContainerBlock} canvas padding={32} backgroundColor={t.colors.surface} style={{ borderRadius: t.borderRadius, textAlign: 'center', border: '1px solid ' + t.colors.border }}>
        <HeadingBlock text="Contactez-nous" level="h3" fontSize={24} color={t.colors.text} textAlign="center" />
        <SpacerBlock height={12} />
        <TextBlock text="contact@exemple.com" fontSize={14} color={t.colors.textMuted} textAlign="center" />
      </Element>
    </Element>
  </Element>
);

// 20. Footer-like section
export const footerSection: SectionTemplate = (t, c) => (
  <Element is={ContainerBlock} canvas padding={40} paddingY={48} backgroundColor={t.colors.secondary} maxWidth="100%">
    <Element is={ContainerBlock} canvas maxWidth="1024px" style={{ margin: '0 auto' }}>
      <Element is={ColumnsBlock} canvas columns={3} gap={32}>
        <Element is={ContainerBlock} canvas>
          <HeadingBlock text={c.footer.company} level="h4" fontSize={18} color="#ffffff" />
          <SpacerBlock height={8} />
          <TextBlock text={c.footer.tagline} fontSize={13} color="rgba(255,255,255,0.6)" />
        </Element>
        <Element is={ContainerBlock} canvas>
          <HeadingBlock text="Navigation" level="h4" fontSize={14} color="#ffffff" />
          <SpacerBlock height={8} />
          {['Accueil', 'Services', 'Contact'].map((l, i) => <TextBlock key={i} text={l} fontSize={13} color="rgba(255,255,255,0.6)" />)}
        </Element>
        <Element is={ContainerBlock} canvas>
          <HeadingBlock text="Contact" level="h4" fontSize={14} color="#ffffff" />
          <SpacerBlock height={8} />
          <TextBlock text="contact@exemple.com" fontSize={13} color="rgba(255,255,255,0.6)" />
          <TextBlock text="+221 33 824 10 10" fontSize={13} color="rgba(255,255,255,0.6)" />
        </Element>
      </Element>
      <SpacerBlock height={24} />
      <DividerBlock />
      <SpacerBlock height={12} />
      <TextBlock text={'© ' + new Date().getFullYear() + ' ' + c.footer.company + '. Tous droits réservés.'} fontSize={11} color="rgba(255,255,255,0.4)" textAlign="center" />
    </Element>
  </Element>
);

// ── REGISTRY ──
export const ALL_SECTIONS: { id: string; name: string; factory: SectionTemplate }[] = [
  { id: 'hero-full', name: 'Hero Pleine Page', factory: heroFull },
  { id: 'hero-split', name: 'Hero Split', factory: heroSplit },
  { id: 'hero-centered', name: 'Hero Centré', factory: heroCentered },
  { id: 'hero-stats', name: 'Hero + Stats', factory: heroStats },
  { id: 'hero-minimal', name: 'Hero Minimal', factory: heroMinimal },
  { id: 'services-cards', name: 'Services Cartes', factory: servicesCards },
  { id: 'services-icons', name: 'Services IconBox', factory: servicesIconBox },
  { id: 'about-simple', name: 'À Propos', factory: aboutSimple },
  { id: 'stats-bar', name: 'Statistiques', factory: statsBar },
  { id: 'stats-bg', name: 'Stats Fond', factory: statsWithBg },
  { id: 'testimonials', name: 'Témoignages', factory: testimonialsSimple },
  { id: 'cta-simple', name: 'CTA Simple', factory: ctaSimple },
  { id: 'cta-banner', name: 'Bannière CTA', factory: ctaBanner },
  { id: 'features-grid', name: 'Fonctionnalités', factory: featuresGrid },
  { id: 'feature-list', name: 'Liste Fonctionnalités', factory: featureListSection },
  { id: 'team', name: 'Équipe', factory: teamSection },
  { id: 'logos', name: 'Logos Clients', factory: logosSection },
  { id: 'pricing', name: 'Tarification', factory: pricingSection },
  { id: 'faq', name: 'FAQ', factory: faqSection },
  { id: 'gallery', name: 'Galerie', factory: gallerySection },
  { id: 'skills', name: 'Compétences', factory: skillsSection },
  { id: 'newsletter', name: 'Newsletter', factory: newsletterSection },
  { id: 'alert', name: 'Bannière Alerte', factory: alertSection },
  { id: 'divider', name: 'Séparateur', factory: dividerSection },
  { id: 'double-cta', name: 'Double CTA', factory: doubleCTA },
  { id: 'footer', name: 'Pied de page', factory: footerSection },
];

// ── PAGE BLUEPRINTS ──
export const PAGE_BLUEPRINTS: PageBlueprint[] = [
  { name: 'Accueil Standard', description: 'Hero + Services + Stats + Témoignages + CTA + Footer', category: 'Accueil', sections: [heroFull, servicesCards, statsBar, testimonialsSimple, ctaSimple, footerSection] },
  { name: 'Accueil Split', description: 'Hero Split + Features + About + Team + CTA + Footer', category: 'Accueil', sections: [heroSplit, featuresGrid, aboutSimple, teamSection, ctaBanner, footerSection] },
  { name: 'Accueil Minimal', description: 'Hero Minimal + Feature List + Stats + Testimonials + Footer', category: 'Accueil', sections: [heroMinimal, featureListSection, statsWithBg, testimonialsSimple, footerSection] },
  { name: 'Accueil Premium', description: 'Hero Full + Logos + Services Icons + Pricing + FAQ + CTA + Footer', category: 'Accueil', sections: [heroFull, logosSection, servicesIconBox, pricingSection, faqSection, ctaSimple, footerSection] },
  { name: 'Accueil Creative', description: 'Hero Centered + Gallery + Skills + Double CTA + Footer', category: 'Accueil', sections: [heroCentered, gallerySection, skillsSection, doubleCTA, footerSection] },
  { name: 'Services', description: 'Services + Logos + Feature List + CTA + Footer', category: 'Pages', sections: [heroCentered, servicesCards, logosSection, featureListSection, ctaBanner, footerSection] },
  { name: 'À Propos', description: 'About + Stats + Team + Testimonials + Footer', category: 'Pages', sections: [aboutSimple, statsBar, teamSection, testimonialsSimple, footerSection] },
  { name: 'Contact', description: 'Hero Minimal + Double CTA + Newsletter + Footer', category: 'Pages', sections: [heroMinimal, doubleCTA, newsletterSection, footerSection] },
  { name: 'Portfolio', description: 'Hero Centered + Gallery + Skills + Testimonials + Footer', category: 'Pages', sections: [heroCentered, gallerySection, skillsSection, testimonialsSimple, footerSection] },
  { name: 'Tarifs', description: 'Hero Minimal + Pricing + FAQ + CTA + Footer', category: 'Pages', sections: [heroMinimal, pricingSection, faqSection, ctaSimple, footerSection] },
  { name: 'Landing Promo', description: 'Alert + Hero Full + Features + Stats + CTA + Footer', category: 'Landing Pages', sections: [alertSection, heroFull, featuresGrid, statsBar, ctaBanner, footerSection] },
  { name: 'Landing Produit', description: 'Hero Split + Feature List + Testimonials + Pricing + CTA + Footer', category: 'Landing Pages', sections: [heroSplit, featureListSection, testimonialsSimple, pricingSection, ctaSimple, footerSection] },
  { name: 'Landing App', description: 'Hero Stats + Features + Double CTA + Newsletter + Footer', category: 'Landing Pages', sections: [heroStats, featuresGrid, doubleCTA, newsletterSection, footerSection] },
  { name: 'One Page', description: 'Hero + About + Services + Stats + Team + Testimonials + CTA + Footer', category: 'One Page', sections: [heroFull, aboutSimple, servicesCards, statsBar, teamSection, testimonialsSimple, ctaBanner, footerSection] },
  { name: 'One Page Premium', description: 'Hero Centered + Logos + Feature List + Pricing + FAQ + Newsletter + Footer', category: 'One Page', sections: [heroCentered, logosSection, featureListSection, pricingSection, faqSection, newsletterSection, footerSection] },
  { name: 'Page Équipe', description: 'Hero Minimal + Team + Skills + Double CTA + Footer', category: 'Pages', sections: [heroMinimal, teamSection, skillsSection, doubleCTA, footerSection] },
  { name: 'FAQ Page', description: 'Hero Centered + FAQ + Pricing + CTA + Footer', category: 'Pages', sections: [heroCentered, faqSection, pricingSection, ctaSimple, footerSection] },
  { name: 'Média / Galerie', description: 'Hero Split + Gallery + Testimonials + Newsletter + Footer', category: 'Pages', sections: [heroSplit, gallerySection, testimonialsSimple, newsletterSection, footerSection] },
  { name: 'Startup Landing', description: 'Alert + Hero Stats + Services Icons + Features + Pricing + CTA + Footer', category: 'Landing Pages', sections: [alertSection, heroStats, servicesIconBox, featuresGrid, pricingSection, ctaBanner, footerSection] },
  { name: 'Rendez-vous', description: 'Hero Minimal + Double CTA + Newsletter + Footer', category: 'Pages', sections: [heroMinimal, doubleCTA, newsletterSection, footerSection] },
];
