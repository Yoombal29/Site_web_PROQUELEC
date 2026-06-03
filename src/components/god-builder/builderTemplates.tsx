import React from 'react';
import { Element } from '@craftjs/core';
import {
  ContainerBlock, TextBlock, HeroBlock, ButtonBlock, StatsBlock, CardBlock,
  ColumnsBlock, SpacerBlock, FormBlock, TestimonialsBlock, PricingBlock,
  AccordionBlock, GalleryBlock, HtmlBlock,
} from '../blocks/ProquelecBlocks';
import {
  HeadingBlock, NewsletterBlock, LogoGridBlock, TimelineBlock, StepsBlock,
  TeamMembersGridBlock, CallToActionBlock, CountdownBlock,
} from '../blocks/ProquelecBlocksPlus';

/** Hero gradient PROQUELEC — modifiable via bloc HTML (panneau « Modifier le code HTML »). */
export const PROQUELEC_HERO_PREMIUM_HTML = `<section class="relative text-white overflow-hidden" style="background:linear-gradient(to bottom right,var(--theme-primary,#1e3a5f),var(--theme-secondary,#2563eb))">
<div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
<div class="relative max-w-7xl mx-auto px-4 sm:px-5 py-20 sm:py-24 md:py-28 lg:py-32">
<div class="max-w-4xl">
<span class="inline-block px-3 sm:px-4 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[11px] sm:text-sm font-semibold mb-4 sm:mb-6 border border-white/20">PROQUELEC — SÉNÉGAL · DEPUIS 1995</span>
<h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-4 sm:mb-6 tracking-tight">Promotion de la Qualité des <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">Installations Électriques</span></h1>
<p class="text-base sm:text-lg md:text-xl lg:text-2xl text-white/85 max-w-3xl mb-6 sm:mb-8">Sécurité · Qualité · Formation — L'organisme national de référence pour la conformité des installations électriques intérieures au Sénégal.</p>
<div class="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5">
<a href="/contact" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white rounded-xl font-bold text-sm sm:text-base md:text-lg shadow-2xl shadow-white/20 hover:bg-blue-50 transition-colors" style="color:var(--theme-primary,#1e3a5f)">Demander un contrôle →</a>
<a href="/formations" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 border-2 border-white/40 text-white rounded-xl font-bold text-sm sm:text-base md:text-lg hover:bg-white/10 transition-colors">Découvrir nos formations</a>
</div>
</div>
</div>
<div class="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-28 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
</section>`;

export type TemplateCategory = 'hero' | 'content' | 'conversion' | 'media' | 'trust';

export interface SectionTemplate {
  label: string;
  description: string;
  emoji: string;
  category: TemplateCategory;
  /** Aperçu dans la barre latérale Templates */
  previewGradient: string;
  factory: () => React.ReactElement;
}

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  hero: 'Héros & bannières',
  content: 'Contenu & services',
  conversion: 'Conversion & contact',
  media: 'Média & équipe',
  trust: 'Confiance & preuve',
};

/** En-tête de section (sans Fragment — compatible parseReactElement / Craft.js). */
const sectionHeader = (badge: string, title: string, subtitle: string) => (
  <Element is={ContainerBlock} canvas padding={0} backgroundColor="transparent" maxWidth="100%">
    <TextBlock
      text={badge}
      fontSize={12}
      textAlign="center"
      fontWeight="700"
      color="#2563eb"
      extraClasses="uppercase tracking-widest"
    />
    <SpacerBlock height={12} />
    <TextBlock text={title} fontSize={36} textAlign="center" fontWeight="900" color="#0f172a" />
    <SpacerBlock height={8} />
    <TextBlock text={subtitle} fontSize={17} textAlign="center" color="#64748b" lineHeight="1.6" />
    <SpacerBlock height={40} />
  </Element>
);

export const SECTION_TEMPLATES: SectionTemplate[] = [
  // ── HERO ──
  {
    label: 'Hero PROQUELEC Premium',
    description: 'Dégradé thème, image de fond, badge, titre accent or & double CTA',
    emoji: '⚡',
    category: 'hero',
    previewGradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #1d4ed8 100%)',
    factory: () => <HtmlBlock html={PROQUELEC_HERO_PREMIUM_HTML} padding={0} hideLabel={false} />,
  },
  {
    label: 'Hero PROQUELEC (éditable)',
    description: 'Hero Craft.js avec champs badge, titre, CTA — synchro slides possible',
    emoji: '🏛️',
    category: 'hero',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)',
    factory: () => (
      <HeroBlock
        badgeText="PROQUELEC — SÉNÉGAL · DEPUIS 1995"
        headline="Promotion de la Qualité des Installations Électriques"
        subheadline="Sécurité · Qualité · Formation — L'organisme national de référence pour la conformité des installations électriques intérieures au Sénégal."
        ctaLabel="Demander un contrôle"
        ctaHref="/contact"
        secondaryCtaLabel="Découvrir nos formations"
        secondaryCtaHref="/formations"
        accentColor="#fbbf24"
        showStats={false}
      />
    ),
  },
  {
    label: 'Hero + Statistiques',
    description: 'Bannière institutionnelle puis bandeau de chiffres clés',
    emoji: '🚀',
    category: 'hero',
    previewGradient: 'linear-gradient(180deg, #1e3a5f 0%, #f8fafc 70%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <HeroBlock
          badgeText="Organisme national"
          headline="La qualité électrique, notre engagement"
          subheadline="Contrôle, formation et accompagnement des professionnels au Sénégal."
          ctaLabel="Nous contacter"
          ctaHref="/contact"
          accentColor="#f59e0b"
          showStats={false}
        />
        <Element is={ContainerBlock} canvas padding={32} paddingY={48} backgroundColor="#f8fafc" maxWidth="100%">
          <StatsBlock />
        </Element>
      </Element>
    ),
  },
  {
    label: 'Hero Split Image',
    description: 'Moitié message, moitié visuel — idéal page service',
    emoji: '🖼️',
    category: 'hero',
    previewGradient: 'linear-gradient(90deg, #f8fafc 50%, #2563eb 50%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <Element is={ColumnsBlock} canvas columns={2} gap={0}>
          <Element is={ContainerBlock} canvas padding={48} backgroundColor="#f8fafc">
            <TextBlock
              text="NOS MISSIONS"
              fontSize={11}
              fontWeight="700"
              color="#2563eb"
              extraClasses="uppercase tracking-widest"
            />
            <SpacerBlock height={12} />
            <HeadingBlock text="Excellence & conformité" level="h1" fontSize={40} color="#0f172a" fontWeight="800" />
            <SpacerBlock height={16} />
            <TextBlock
              text="Accompagner les installateurs et garantir la sécurité des usagers grâce à des contrôles rigoureux."
              fontSize={18}
              color="#475569"
              lineHeight="1.7"
            />
            <SpacerBlock height={28} />
            <ButtonBlock label="En savoir plus" href="/a-propos" backgroundColor="#2563eb" size="lg" rounded="lg" />
          </Element>
          <Element is={ContainerBlock} canvas padding={0} backgroundColor="#1e3a5f" />
        </Element>
      </Element>
    ),
  },
  {
    label: 'Hero CTA compact',
    description: 'Bandeau court avec appel à l\'action',
    emoji: '🎯',
    category: 'hero',
    previewGradient: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={40} paddingY={56} backgroundColor="#2563eb" maxWidth="100%">
        <TextBlock text="Besoin d'un contrôle ?" fontSize={32} textAlign="center" fontWeight="800" color="#ffffff" />
        <SpacerBlock height={12} />
        <TextBlock text="Planifiez une visite avec nos équipes certifiées." fontSize={18} textAlign="center" color="#dbeafe" />
        <SpacerBlock height={24} />
        <ButtonBlock label="Demander un rendez-vous" href="/contact" backgroundColor="#ffffff" textColor="#1e3a5f" size="lg" rounded="xl" />
      </Element>
    ),
  },

  // ── CONTENU ──
  {
    label: 'Section Services Premium',
    description: '3 cartes avec en-tête badge + fond dégradé léger',
    emoji: '⚡',
    category: 'content',
    previewGradient: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#f8fafc" maxWidth="100%">
        {sectionHeader(
          'Nos expertises',
          'Des services pour chaque étape',
          'Contrôle, formation et veille réglementaire au service des professionnels.'
        )}
        <Element is={ColumnsBlock} canvas columns={3} gap={28}>
          <CardBlock icon="⚡" title="Contrôle & conformité" text="Vérification des installations selon les normes en vigueur au Sénégal." />
          <CardBlock icon="🎓" title="Formation certifiante" text="Parcours pour installateurs, bureaux d'études et responsables techniques." />
          <CardBlock icon="🛡️" title="Accompagnement" text="Conseil, audit et mise en conformité de vos projets électriques." />
        </Element>
      </Element>
    ),
  },
  {
    label: 'Section 2 colonnes + image',
    description: 'Texte à gauche, zone visuelle à droite',
    emoji: '📐',
    category: 'content',
    previewGradient: 'linear-gradient(90deg, #fff 45%, #e2e8f0 45%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <Element is={ColumnsBlock} canvas columns={2} gap={48}>
          <Element is={ContainerBlock} canvas padding={48}>
            <HeadingBlock text="Pourquoi PROQUELEC ?" level="h2" fontSize={34} color="#0f172a" />
            <SpacerBlock height={16} />
            <TextBlock text="• Organisme de référence depuis 1995\n• Réseau national d'experts\n• Alignement sur les normes sénégalaises" fontSize={16} color="#475569" lineHeight="1.8" />
          </Element>
          <Element is={ContainerBlock} canvas padding={32} backgroundColor="#f1f5f9">
            <TextBlock text="Zone image / vidéo" fontSize={14} textAlign="center" color="#94a3b8" />
          </Element>
        </Element>
      </Element>
    ),
  },
  {
    label: 'Section FAQ',
    description: 'Questions fréquentes sur fond blanc épuré',
    emoji: '❓',
    category: 'content',
    previewGradient: 'linear-gradient(180deg, #ffffff, #f1f5f9)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#ffffff" maxWidth="800px">
        {sectionHeader('FAQ', 'Questions fréquentes', 'Tout ce que vous devez savoir sur nos prestations.')}
        <AccordionBlock />
      </Element>
    ),
  },
  {
    label: 'Section Étapes',
    description: 'Processus en 4 étapes numérotées',
    emoji: '📋',
    category: 'content',
    previewGradient: 'linear-gradient(135deg, #f8fafc, #e0e7ff)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#ffffff" maxWidth="100%">
        {sectionHeader('Processus', 'Comment ça marche', 'Un parcours simple, de la demande à la certification.')}
        <StepsBlock
          items={[
            { title: '1. Prise de contact', desc: 'Formulaire en ligne ou appel à notre siège' },
            { title: '2. Diagnostic', desc: 'Analyse de votre besoin et planification' },
            { title: '3. Intervention', desc: 'Contrôle sur site ou session de formation' },
            { title: '4. Rapport & suivi', desc: 'Livrable officiel et recommandations' },
          ]}
        />
      </Element>
    ),
  },

  // ── CONVERSION ──
  {
    label: 'Section Contact Premium',
    description: 'Formulaire centré avec fond doux',
    emoji: '📬',
    category: 'conversion',
    previewGradient: 'linear-gradient(180deg, #eff6ff, #ffffff)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#eff6ff" maxWidth="960px">
        {sectionHeader('Contact', 'Échangeons sur votre projet', 'Réponse sous 24 h ouvrées.')}
        <FormBlock />
      </Element>
    ),
  },
  {
    label: 'Section Tarifs',
    description: 'Grille tarifaire 3 colonnes',
    emoji: '💰',
    category: 'conversion',
    previewGradient: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#f8fafc" maxWidth="100%">
        {sectionHeader('Offres', 'Tarifs transparents', 'Choisissez la formule adaptée à votre structure.')}
        <PricingBlock />
      </Element>
    ),
  },
  {
    label: 'Bannière CTA large',
    description: 'Appel à l\'action pleine largeur',
    emoji: '🎯',
    category: 'conversion',
    previewGradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    factory: () => (
      <CallToActionBlock
        title="Prêt à sécuriser vos installations ?"
        description="Plus de 500 entreprises et artisans nous font confiance au Sénégal."
        buttonText="Demander un contrôle"
        buttonUrl="/contact"
        bgColor="var(--theme-primary, #1e3a5f)"
        textColor="#ffffff"
        buttonBg="#ffffff"
        buttonTextColor="var(--theme-primary, #1e3a5f)"
        padding={64}
      />
    ),
  },
  {
    label: 'Newsletter',
    description: 'Inscription actualités & normes',
    emoji: '📧',
    category: 'conversion',
    previewGradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#1e3a5f" maxWidth="100%">
        <TextBlock text="Veille réglementaire" fontSize={14} textAlign="center" fontWeight="700" color="#93c5fd" extraClasses="uppercase tracking-widest" />
        <SpacerBlock height={8} />
        <TextBlock text="Restez informé des évolutions normatives" fontSize={30} textAlign="center" fontWeight="800" color="#ffffff" />
        <SpacerBlock height={8} />
        <TextBlock text="Une newsletter mensuelle pour les professionnels du secteur." fontSize={16} textAlign="center" color="#bfdbfe" />
        <SpacerBlock height={28} />
        <NewsletterBlock />
      </Element>
    ),
  },
  {
    label: 'Compte à rebours',
    description: 'Événement ou session de formation à venir',
    emoji: '⏱️',
    category: 'conversion',
    previewGradient: 'linear-gradient(180deg, #0f172a, #334155)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#0f172a" maxWidth="100%">
        <TextBlock text="Prochaine session" fontSize={32} textAlign="center" fontWeight="900" color="#ffffff" />
        <SpacerBlock height={24} />
        <CountdownBlock targetDate="2027-01-01T00:00:00" boxBg="#1e293b" boxTextColor="#ffffff" />
      </Element>
    ),
  },

  // ── MÉDIA ──
  {
    label: 'Galerie projets',
    description: 'Grille photos installations',
    emoji: '🖼️',
    category: 'media',
    previewGradient: 'linear-gradient(180deg, #f1f5f9, #cbd5e1)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#f8fafc" maxWidth="100%">
        {sectionHeader('Réalisations', 'Nos interventions', 'Quelques chantiers et contrôles récents.')}
        <GalleryBlock />
      </Element>
    ),
  },
  {
    label: 'Équipe',
    description: 'Grille membres avec rôles',
    emoji: '👥',
    category: 'media',
    previewGradient: 'linear-gradient(135deg, #fafafa, #e2e8f0)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#ffffff" maxWidth="100%">
        {sectionHeader('Équipe', 'Des experts à votre écoute', 'Direction, contrôleurs et formateurs dédiés.')}
        <TeamMembersGridBlock
          members={[
            { name: 'Direction technique', role: 'Contrôle & normes', photo: '', bio: 'Pilotage des opérations terrain' },
            { name: 'Pôle formation', role: 'Pédagogie', photo: '', bio: 'Parcours certifiants' },
            { name: 'Relation clients', role: 'Accueil', photo: '', bio: 'Suivi des dossiers' },
          ]}
        />
      </Element>
    ),
  },
  {
    label: 'Timeline institutionnelle',
    description: 'Historique PROQUELEC',
    emoji: '📅',
    category: 'media',
    previewGradient: 'linear-gradient(90deg, #dbeafe 0%, #fff 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#ffffff" maxWidth="768px">
        {sectionHeader('Histoire', "30 ans d'engagement", 'Les étapes clés de notre organisme.')}
        <TimelineBlock
          items={[
            { year: '1995', title: 'Création', desc: 'Naissance de PROQUELEC au Sénégal' },
            { year: '2005', title: 'Extension', desc: 'Couverture nationale des contrôles' },
            { year: '2015', title: 'Formation', desc: 'Lancement du pôle académie' },
            { year: '2024', title: 'Digital', desc: 'Outils en ligne pour les professionnels' },
          ]}
        />
      </Element>
    ),
  },

  // ── CONFIANCE ──
  {
    label: 'Témoignages',
    description: 'Avis clients sur fond sombre premium',
    emoji: '💬',
    category: 'trust',
    previewGradient: 'linear-gradient(135deg, #0f172a, #1e293b)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#0f172a" maxWidth="100%">
        <TextBlock text="Témoignages" fontSize={14} textAlign="center" fontWeight="700" color="#818cf8" extraClasses="uppercase tracking-widest" />
        <SpacerBlock height={12} />
        <TextBlock text="Ils nous font confiance" fontSize={34} textAlign="center" fontWeight="900" color="#ffffff" />
        <SpacerBlock height={36} />
        <TestimonialsBlock />
      </Element>
    ),
  },
  {
    label: 'Chiffres clés',
    description: 'KPIs sur fond institutionnel',
    emoji: '📊',
    category: 'trust',
    previewGradient: 'linear-gradient(135deg, #1e3a5f, #0f172a)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#1e3a5f" maxWidth="100%">
        <TextBlock text="Impact" fontSize={14} textAlign="center" fontWeight="700" color="#93c5fd" extraClasses="uppercase tracking-widest" />
        <SpacerBlock height={12} />
        <TextBlock text="PROQUELEC en chiffres" fontSize={34} textAlign="center" fontWeight="900" color="#ffffff" />
        <SpacerBlock height={36} />
        <StatsBlock />
      </Element>
    ),
  },
  {
    label: 'Logos partenaires',
    description: 'Bandeau « Ils nous font confiance »',
    emoji: '🤝',
    category: 'trust',
    previewGradient: 'linear-gradient(180deg, #f8fafc, #e2e8f0)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={40} paddingY={48} backgroundColor="#f8fafc" maxWidth="100%">
        <TextBlock text="Partenaires & institutions" fontSize={22} textAlign="center" fontWeight="700" color="#64748b" />
        <SpacerBlock height={28} />
        <LogoGridBlock />
      </Element>
    ),
  },
];
