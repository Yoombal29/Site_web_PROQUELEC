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
  ComplianceChecklistBlock, AuditProcessBlock, ResourceCardsBlock,
  PriceListBlock, FAQBlock, TestimonialCarouselBlock, StarRatingBlock,
  FeatureListBlock, FileDownloadBlock, AddressBlock,
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

export type TemplateCategory = 'hero' | 'pages' | 'content' | 'operations' | 'conversion' | 'media' | 'trust';

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
  pages: 'Pages premium',
  content: 'Contenu & services',
  operations: 'Métier & conformité',
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

  {
    label: 'Hero Formation Premium',
    description: 'Hero éditable pour page formation avec niveau, durée, certification et CTA',
    emoji: '🎓',
    category: 'hero',
    previewGradient: 'linear-gradient(135deg, #06111f 0%, #1e3a5f 58%, #f59e0b 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#06111f" maxWidth="100%">
        <Element is={ColumnsBlock} canvas columns={2} gap={36}>
          <Element is={ContainerBlock} canvas padding={0} backgroundColor="transparent">
            <TextBlock
              text="FORMATION CERTIFIANTE"
              fontSize={12}
              fontWeight="800"
              color="#fbbf24"
              extraClasses="uppercase tracking-widest"
            />
            <SpacerBlock height={14} />
            <HeadingBlock
              text="Maîtriser la conformité des installations électriques"
              level="h1"
              fontSize={46}
              color="#ffffff"
              fontWeight="900"
              lineHeight="1.08"
            />
            <SpacerBlock height={18} />
            <TextBlock
              text="Un parcours professionnel pour renforcer les compétences terrain, sécuriser les interventions et préparer les contrôles PROQUELEC."
              fontSize={18}
              color="#cbd5e1"
              lineHeight="1.7"
            />
            <SpacerBlock height={28} />
            <Element is={ColumnsBlock} canvas columns={3} gap={12}>
              <CardBlock icon="🎯" title="Niveau" text="Débutant à avancé" />
              <CardBlock icon="⏱️" title="Durée" text="3 à 5 jours" />
              <CardBlock icon="🏅" title="Attestation" text="Certificat PROQUELEC" />
            </Element>
            <SpacerBlock height={30} />
            <ButtonBlock label="Voir les dates disponibles" href="/formations" backgroundColor="#fbbf24" textColor="#111827" size="lg" rounded="lg" />
          </Element>
          <Element is={ContainerBlock} canvas padding={28} backgroundColor="#f8fafc">
            <TextBlock text="Programme clé" fontSize={13} fontWeight="800" color="#1e3a5f" extraClasses="uppercase tracking-widest" />
            <SpacerBlock height={16} />
            <FeatureListBlock
              iconColor="#fbbf24"
              gap={14}
              items={[
                { icon: '⚡', text: 'Bases électriques et règles de sécurité' },
                { icon: '📐', text: 'Lecture de schémas et repérage des circuits' },
                { icon: '🛡️', text: 'Protection différentielle et mise à la terre' },
                { icon: '✅', text: 'Préparation au contrôle de conformité' },
              ]}
            />
          </Element>
        </Element>
      </Element>
    ),
  },

  // ── PAGES PREMIUM ──
  {
    label: 'Page Formation Complète',
    description: 'Structure complète : hero, objectifs, programme, prérequis, tarifs, calendrier et CTA',
    emoji: '🎓',
    category: 'pages',
    previewGradient: 'linear-gradient(180deg, #06111f 0%, #eff6ff 42%, #ffffff 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#06111f" maxWidth="100%">
          <TextBlock text="ACADÉMIE PROQUELEC" fontSize={12} fontWeight="800" color="#fbbf24" textAlign="center" extraClasses="uppercase tracking-widest" />
          <SpacerBlock height={14} />
          <TextBlock text="Formation professionnelle en électricité" fontSize={44} textAlign="center" fontWeight="900" color="#ffffff" />
          <SpacerBlock height={14} />
          <TextBlock text="Un modèle premium pour présenter une formation, ses bénéfices, son programme et ses modalités d'inscription." fontSize={18} textAlign="center" color="#cbd5e1" lineHeight="1.7" />
          <SpacerBlock height={28} />
          <ButtonBlock label="Demander une inscription" href="/contact" backgroundColor="#fbbf24" textColor="#111827" size="lg" rounded="lg" />
        </Element>
        <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#f8fafc" maxWidth="100%">
          {sectionHeader('Objectifs', 'Compétences visées', 'Un parcours orienté pratique, sécurité et conformité.')}
          <Element is={ColumnsBlock} canvas columns={3} gap={24}>
            <CardBlock icon="⚡" title="Installer" text="Comprendre les circuits, protections et tableaux électriques." />
            <CardBlock icon="🛡️" title="Sécuriser" text="Identifier les risques et appliquer les bonnes pratiques." />
            <CardBlock icon="✅" title="Valider" text="Préparer les contrôles et documenter les corrections." />
          </Element>
        </Element>
        <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#ffffff" maxWidth="1120px">
          <Element is={ColumnsBlock} canvas columns={2} gap={32}>
            <Element is={ContainerBlock} canvas padding={28} backgroundColor="#f8fafc">
              <HeadingBlock text="Programme détaillé" level="h2" fontSize={30} color="#0f172a" fontWeight="900" />
              <SpacerBlock height={18} />
              <StepsBlock
                layout="vertical"
                items={[
                  { title: 'Jour 1', desc: 'Fondamentaux, sécurité et vocabulaire technique.' },
                  { title: 'Jour 2', desc: 'Schémas, protections et mise à la terre.' },
                  { title: 'Jour 3', desc: 'Cas pratiques et préparation du contrôle.' },
                ]}
              />
            </Element>
            <Element is={ContainerBlock} canvas padding={28} backgroundColor="#fff7ed">
              <HeadingBlock text="Prérequis & livrables" level="h2" fontSize={30} color="#0f172a" fontWeight="900" />
              <SpacerBlock height={18} />
              <FeatureListBlock
                iconColor="#f59e0b"
                items={[
                  { icon: '👷', text: 'Profil installateur, technicien ou responsable maintenance' },
                  { icon: '📄', text: 'Support de cours et fiche synthèse' },
                  { icon: '🏅', text: 'Attestation de participation' },
                  { icon: '📞', text: 'Orientation vers le contrôle ou l’audit' },
                ]}
              />
            </Element>
          </Element>
        </Element>
        <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#f8fafc" maxWidth="100%">
          {sectionHeader('Modalités', 'Tarifs et prochaines sessions', 'Des offres adaptables aux particuliers, entreprises et groupes.')}
          <PriceListBlock
            items={[
              { name: 'Individuel', price: 'Sur devis', desc: 'Inscription à une session programmée.', featured: false },
              { name: 'Entreprise', price: 'Groupe', desc: 'Session dédiée pour équipes techniques.', featured: true },
              { name: 'Sur site', price: 'Personnalisé', desc: 'Formation adaptée à vos installations.', featured: false },
            ]}
          />
        </Element>
        <CallToActionBlock
          title="Construisons votre parcours de formation"
          description="L’équipe PROQUELEC vous aide à choisir le niveau et les dates adaptés à votre besoin."
          buttonText="Contacter le pôle formation"
          buttonUrl="/contact"
          bgColor="#1e3a5f"
          textColor="#ffffff"
          buttonBg="#fbbf24"
          buttonTextColor="#111827"
          padding={56}
        />
      </Element>
    ),
  },
  {
    label: 'Page Audit Électrique',
    description: 'Landing complète pour audit : promesse, étapes, checklist, preuves et demande de devis',
    emoji: '🛡️',
    category: 'pages',
    previewGradient: 'linear-gradient(180deg, #0f172a 0%, #dbeafe 45%, #ffffff 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#0f172a" maxWidth="100%">
          <TextBlock text="AUDIT & CONFORMITÉ" fontSize={12} textAlign="center" fontWeight="800" color="#fbbf24" extraClasses="uppercase tracking-widest" />
          <SpacerBlock height={14} />
          <TextBlock text="Sécurisez vos installations avant contrôle" fontSize={44} textAlign="center" fontWeight="900" color="#ffffff" />
          <SpacerBlock height={12} />
          <TextBlock text="Une page premium pour transformer une demande d’audit en dossier cadré, priorisé et suivi." fontSize={18} textAlign="center" color="#cbd5e1" lineHeight="1.7" />
          <SpacerBlock height={28} />
          <StatsBlock />
        </Element>
        <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#f8fafc" maxWidth="100%">
          <AuditProcessBlock
            title="Méthodologie d’intervention"
            subtitle="Un processus clair pour qualifier la demande, inspecter les points sensibles et restituer des actions exploitables."
            accentColor="#fbbf24"
            backgroundColor="#1e3a5f"
          />
          <SpacerBlock height={30} />
          <ComplianceChecklistBlock
            title="Checklist audit terrain"
            subtitle="Les contrôles prioritaires pour identifier rapidement les écarts critiques."
            accentColor="#2563eb"
            backgroundColor="#ffffff"
          />
        </Element>
        <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#ffffff" maxWidth="1120px">
          {sectionHeader('Bénéfices', 'Un audit lisible et actionnable', 'Chaque partie prenante comprend les priorités techniques et les prochaines étapes.')}
          <Element is={ColumnsBlock} canvas columns={3} gap={24}>
            <CardBlock icon="📍" title="Diagnostic ciblé" text="Identification des zones à risque et des non-conformités visibles." />
            <CardBlock icon="📊" title="Priorisation" text="Classement des actions selon urgence, sécurité et impact." />
            <CardBlock icon="📄" title="Restitution claire" text="Synthèse exploitable pour décision, devis ou levée de réserves." />
          </Element>
        </Element>
        <CallToActionBlock
          title="Planifier un audit PROQUELEC"
          description="Décrivez votre installation, votre urgence et vos contraintes. Nous vous orientons vers la bonne intervention."
          buttonText="Demander un devis"
          buttonUrl="/contact"
          bgColor="#0f172a"
          textColor="#ffffff"
          buttonBg="#fbbf24"
          buttonTextColor="#111827"
          padding={56}
        />
      </Element>
    ),
  },
  {
    label: 'Page Certification / Agrément',
    description: 'Présentation premium d’un parcours de certification avec documents, délais et étapes',
    emoji: '🏅',
    category: 'pages',
    previewGradient: 'linear-gradient(180deg, #1e3a5f 0%, #fef3c7 48%, #ffffff 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#1e3a5f" maxWidth="100%">
          <TextBlock text="CERTIFICATION & AGRÉMENT" fontSize={12} textAlign="center" fontWeight="800" color="#fbbf24" extraClasses="uppercase tracking-widest" />
          <SpacerBlock height={14} />
          <TextBlock text="Structurer un dossier clair et recevable" fontSize={44} textAlign="center" fontWeight="900" color="#ffffff" />
          <SpacerBlock height={12} />
          <TextBlock text="Un template conçu pour expliquer les critères, les pièces à fournir et le processus de validation." fontSize={18} textAlign="center" color="#dbeafe" lineHeight="1.7" />
        </Element>
        <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#fffbeb" maxWidth="1120px">
          <Element is={ColumnsBlock} canvas columns={2} gap={30}>
            <Element is={ContainerBlock} canvas padding={28} backgroundColor="#ffffff">
              <HeadingBlock text="Documents requis" level="h2" fontSize={30} color="#0f172a" fontWeight="900" />
              <SpacerBlock height={18} />
              <FeatureListBlock
                iconColor="#f59e0b"
                items={[
                  { icon: '📄', text: 'Formulaire de demande renseigné' },
                  { icon: '🧾', text: 'Pièces administratives de l’entreprise' },
                  { icon: '👷', text: 'Références techniques ou expériences' },
                  { icon: '✅', text: 'Engagement qualité et conformité' },
                ]}
              />
            </Element>
            <Element is={ContainerBlock} canvas padding={28} backgroundColor="#ffffff">
              <HeadingBlock text="Parcours de validation" level="h2" fontSize={30} color="#0f172a" fontWeight="900" />
              <SpacerBlock height={18} />
              <StepsBlock
                layout="vertical"
                items={[
                  { title: 'Dépôt', desc: 'Réception et contrôle de complétude du dossier.' },
                  { title: 'Instruction', desc: 'Analyse des critères et demande de compléments si besoin.' },
                  { title: 'Décision', desc: 'Notification, suivi et recommandations opérationnelles.' },
                ]}
              />
            </Element>
          </Element>
        </Element>
        <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#ffffff" maxWidth="100%">
          <ResourceCardsBlock
            title="Ressources certification"
            subtitle="Regroupez ici les formulaires, guides et référentiels nécessaires au dossier."
            accentColor="#1e3a5f"
            backgroundColor="#ffffff"
            resources={[
              { type: 'Formulaire', title: 'Demande d’agrément', description: 'Document de base pour ouvrir le dossier.', href: '/documents', label: 'Télécharger' },
              { type: 'Guide', title: 'Critères techniques', description: 'Comprendre les exigences attendues.', href: '/normes-ressources', label: 'Consulter' },
              { type: 'Contact', title: 'Assistance dossier', description: 'Échanger avec l’équipe avant dépôt.', href: '/contact', label: 'Contacter' },
            ]}
          />
        </Element>
        <CallToActionBlock
          title="Besoin d’aide pour préparer votre dossier ?"
          description="PROQUELEC vous oriente sur les pièces, les délais et les points de vigilance."
          buttonText="Demander un accompagnement"
          buttonUrl="/contact"
          bgColor="#1e3a5f"
          textColor="#ffffff"
          buttonBg="#fbbf24"
          buttonTextColor="#111827"
          padding={56}
        />
      </Element>
    ),
  },
  {
    label: 'Landing Page Contact Premium',
    description: 'Page contact complète : promesse, formulaire, coordonnées, délais et raisons de contacter',
    emoji: '📬',
    category: 'pages',
    previewGradient: 'linear-gradient(180deg, #f8fafc 0%, #dbeafe 55%, #ffffff 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#f8fafc" maxWidth="100%">
          <TextBlock text="CONTACT PROQUELEC" fontSize={12} textAlign="center" fontWeight="800" color="#2563eb" extraClasses="uppercase tracking-widest" />
          <SpacerBlock height={14} />
          <TextBlock text="Une demande claire, une réponse orientée action" fontSize={40} textAlign="center" fontWeight="900" color="#0f172a" />
          <SpacerBlock height={12} />
          <TextBlock text="Centralisez les demandes de contrôle, formation, audit, certification ou assistance technique." fontSize={18} textAlign="center" color="#64748b" lineHeight="1.7" />
        </Element>
        <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#ffffff" maxWidth="1120px">
          <Element is={ColumnsBlock} canvas columns={2} gap={32}>
            <Element is={ContainerBlock} canvas padding={28} backgroundColor="#eff6ff">
              <HeadingBlock text="Envoyer une demande" level="h2" fontSize={30} color="#0f172a" fontWeight="900" />
              <SpacerBlock height={18} />
              <FormBlock />
            </Element>
            <Element is={ContainerBlock} canvas padding={28} backgroundColor="#f8fafc">
              <TextBlock text="Informations utiles" fontSize={13} fontWeight="800" color="#1e3a5f" extraClasses="uppercase tracking-widest" />
              <SpacerBlock height={18} />
              <AddressBlock />
              <SpacerBlock height={24} />
              <FeatureListBlock
                iconColor="#fbbf24"
                items={[
                  { icon: '⏱️', text: 'Réponse sous 24 h ouvrées' },
                  { icon: '📍', text: 'Contrôles et formations au Sénégal' },
                  { icon: '📄', text: 'Dossier orienté vers le bon service' },
                ]}
              />
            </Element>
          </Element>
        </Element>
        <Element is={ContainerBlock} canvas padding={48} paddingY={56} backgroundColor="#f8fafc" maxWidth="100%">
          <Element is={ColumnsBlock} canvas columns={3} gap={20}>
            <CardBlock icon="⚡" title="Contrôle" text="Demande de visite, réception ou levée de réserves." />
            <CardBlock icon="🎓" title="Formation" text="Inscription individuelle, groupe ou session sur site." />
            <CardBlock icon="🏅" title="Certification" text="Orientation sur les documents et le parcours." />
          </Element>
        </Element>
      </Element>
    ),
  },
  {
    label: 'Page Ressources Techniques',
    description: 'Bibliothèque premium pour guides, normes, formulaires et fiches pratiques',
    emoji: '📚',
    category: 'pages',
    previewGradient: 'linear-gradient(180deg, #ffffff 0%, #eff6ff 50%, #e0f2fe 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#ffffff" maxWidth="100%">
          <TextBlock text="RESSOURCES TECHNIQUES" fontSize={12} textAlign="center" fontWeight="800" color="#2563eb" extraClasses="uppercase tracking-widest" />
          <SpacerBlock height={14} />
          <TextBlock text="Guides, normes et documents utiles" fontSize={42} textAlign="center" fontWeight="900" color="#0f172a" />
          <SpacerBlock height={12} />
          <TextBlock text="Une structure propre pour organiser les ressources téléchargeables et orienter les professionnels." fontSize={18} textAlign="center" color="#64748b" lineHeight="1.7" />
        </Element>
        <ResourceCardsBlock
          title="Accès rapide"
          subtitle="Mettez en avant les contenus les plus demandés."
          accentColor="#2563eb"
          backgroundColor="#eff6ff"
          resources={[
            { type: 'Guide', title: 'Préparer un contrôle', description: 'Checklist des informations à réunir avant visite.', href: '/documents', label: 'Consulter' },
            { type: 'Norme', title: 'Référentiels électriques', description: 'Points clés pour installations intérieures.', href: '/normes-ressources', label: 'Explorer' },
            { type: 'Fiche', title: 'Sécurité chantier', description: 'Bonnes pratiques terrain et prévention.', href: '/documents', label: 'Voir la fiche' },
          ]}
        />
        <Element is={ContainerBlock} canvas padding={48} paddingY={64} backgroundColor="#ffffff" maxWidth="1120px">
          <Element is={ColumnsBlock} canvas columns={3} gap={20}>
            <FileDownloadBlock label="Formulaire de demande" fileSize="PDF" icon="📄" bgColor="#f8fafc" accentColor="#2563eb" />
            <FileDownloadBlock label="Guide de préparation" fileSize="PDF" icon="📘" bgColor="#f8fafc" accentColor="#2563eb" />
            <FileDownloadBlock label="Fiche conformité" fileSize="PDF" icon="✅" bgColor="#f8fafc" accentColor="#2563eb" />
          </Element>
        </Element>
        <CallToActionBlock
          title="Vous ne trouvez pas le document recherché ?"
          description="Contactez l’équipe PROQUELEC pour être orienté vers la bonne ressource."
          buttonText="Demander une ressource"
          buttonUrl="/contact"
          bgColor="#eff6ff"
          textColor="#0f172a"
          buttonBg="#2563eb"
          buttonTextColor="#ffffff"
          padding={48}
        />
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
    label: 'Section Pourquoi PROQUELEC',
    description: 'Argumentaire institutionnel premium : sécurité, qualité, expertise et accompagnement',
    emoji: '🏛️',
    category: 'content',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 55%, #fef3c7 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#ffffff" maxWidth="100%">
        {sectionHeader(
          'Pourquoi PROQUELEC',
          'Un tiers de confiance pour la qualité électrique',
          'Une section prête pour expliquer la valeur de l’organisme sur les pages institutionnelles et services.'
        )}
        <Element is={ColumnsBlock} canvas columns={2} gap={32}>
          <Element is={ContainerBlock} canvas padding={32} backgroundColor="#f8fafc">
            <HeadingBlock text="Ce qui fait la différence" level="h3" fontSize={28} color="#0f172a" fontWeight="900" />
            <SpacerBlock height={18} />
            <FeatureListBlock
              iconColor="#2563eb"
              gap={14}
              items={[
                { icon: '🛡️', text: 'Approche centrée sur la sécurité des usagers' },
                { icon: '📐', text: 'Lecture technique des installations et des risques' },
                { icon: '✅', text: 'Méthode structurée pour contrôler et documenter' },
                { icon: '🤝', text: 'Accompagnement des professionnels et collectivités' },
              ]}
            />
          </Element>
          <Element is={ContainerBlock} canvas padding={32} backgroundColor="#1e3a5f">
            <TextBlock text="PROMESSE" fontSize={12} fontWeight="800" color="#fbbf24" extraClasses="uppercase tracking-widest" />
            <SpacerBlock height={12} />
            <TextBlock text="Faire progresser la qualité des installations électriques au Sénégal." fontSize={30} fontWeight="900" color="#ffffff" lineHeight="1.22" />
            <SpacerBlock height={18} />
            <TextBlock text="Ce template met en avant le positionnement de PROQUELEC avec un rendu premium, sobre et réutilisable." fontSize={16} color="#dbeafe" lineHeight="1.7" />
            <SpacerBlock height={24} />
            <ButtonBlock label="Découvrir nos missions" href="/a-propos" backgroundColor="#fbbf24" textColor="#111827" size="lg" rounded="lg" />
          </Element>
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
    label: 'FAQ Premium',
    description: 'FAQ métier avec introduction, catégories et questions éditables',
    emoji: '❓',
    category: 'content',
    previewGradient: 'linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#ffffff" maxWidth="100%">
        {sectionHeader('FAQ', 'Réponses aux questions fréquentes', 'Une section premium pour réduire les frictions avant contact ou inscription.')}
        <Element is={ColumnsBlock} canvas columns={2} gap={32}>
          <Element is={ContainerBlock} canvas padding={28} backgroundColor="#f8fafc">
            <TextBlock text="Catégories utiles" fontSize={13} fontWeight="800" color="#2563eb" extraClasses="uppercase tracking-widest" />
            <SpacerBlock height={16} />
            <FeatureListBlock
              iconColor="#2563eb"
              items={[
                { icon: '⚡', text: 'Contrôles et conformité' },
                { icon: '🎓', text: 'Formations professionnelles' },
                { icon: '📄', text: 'Documents et dossiers' },
                { icon: '💬', text: 'Délais et accompagnement' },
              ]}
            />
          </Element>
          <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff">
            <FAQBlock
              activeColor="#2563eb"
              items={[
                { q: 'Comment préparer une demande de contrôle ?', a: 'Rassemblez les informations sur l’installation, les plans disponibles et les coordonnées du responsable technique.' },
                { q: 'Les formations sont-elles adaptées aux entreprises ?', a: 'Oui, les parcours peuvent être proposés en session dédiée ou adaptés au niveau des équipes.' },
                { q: 'Puis-je demander une assistance avant le dépôt d’un dossier ?', a: 'Oui, PROQUELEC peut orienter vers les documents utiles et les points de vigilance.' },
                { q: 'Comment connaître les prochaines dates ?', a: 'La page formations ou le formulaire de contact permettent de demander les sessions disponibles.' },
              ]}
            />
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

  // ── MÉTIER & CONFORMITÉ ──
  {
    label: 'Pack Audit Conformité',
    description: 'Processus d’audit + checklist technique prête pour une page service',
    emoji: '🛡️',
    category: 'operations',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 70%, #f59e0b 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={40} paddingY={56} backgroundColor="#f8fafc" maxWidth="100%">
        <AuditProcessBlock
          title="Audit de conformité électrique"
          subtitle="Une méthode structurée pour cadrer, contrôler et suivre les installations intérieures."
          accentColor="#fbbf24"
          backgroundColor="#0f172a"
        />
        <SpacerBlock height={28} />
        <ComplianceChecklistBlock
          title="Points de contrôle prioritaires"
          subtitle="Les éléments à valider avant réception, mise en service ou levée des réserves."
          accentColor="#2563eb"
          backgroundColor="#ffffff"
        />
      </Element>
    ),
  },
  {
    label: 'Checklist Contrôle',
    description: 'Carte conformité éditable avec statuts conforme / à vérifier / critique',
    emoji: '✅',
    category: 'operations',
    previewGradient: 'linear-gradient(180deg, #ecfdf5 0%, #eff6ff 100%)',
    factory: () => (
      <ComplianceChecklistBlock
        title="Préparer le contrôle PROQUELEC"
        subtitle="Utilisez cette checklist pour clarifier les prérequis avant intervention."
        accentColor="#059669"
        backgroundColor="#f8fafc"
      />
    ),
  },
  {
    label: 'Centre Ressources',
    description: 'Guides, formulaires et normes sous forme de cartes d’accès rapide',
    emoji: '📚',
    category: 'operations',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)',
    factory: () => (
      <ResourceCardsBlock
        title="Ressources pour vos démarches"
        subtitle="Centralisez les documents utiles pour les installateurs, entreprises et collectivités."
        accentColor="#2563eb"
        backgroundColor="#ffffff"
      />
    ),
  },
  {
    label: 'Bandeau Mise en conformité',
    description: 'CTA métier + ressources pour orienter vers contact ou documents',
    emoji: '⚙️',
    category: 'operations',
    previewGradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <CallToActionBlock
          title="Vous avez des réserves à lever ?"
          description="Nos équipes vous accompagnent dans la priorisation des corrections et la préparation du nouveau contrôle."
          buttonText="Demander un accompagnement"
          buttonUrl="/contact"
          bgColor="#1e3a5f"
          textColor="#ffffff"
          buttonBg="#fbbf24"
          buttonTextColor="#111827"
          padding={56}
        />
        <ResourceCardsBlock
          title="Documents utiles"
          subtitle="Préparez vos échanges avec les pièces et guides les plus demandés."
          accentColor="#2563eb"
          backgroundColor="#f8fafc"
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
    label: 'Comparatif Offres / Tarifs',
    description: 'Comparatif premium pour débutant, intermédiaire, avancé et entreprise',
    emoji: '💼',
    category: 'conversion',
    previewGradient: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 50%, #fff7ed 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#f8fafc" maxWidth="100%">
        {sectionHeader('Offres', 'Choisir le bon accompagnement', 'Un modèle clair pour comparer les niveaux, les prix et les usages.')}
        <PriceListBlock
          items={[
            { name: 'Débutant', price: 'Essentiel', desc: 'Découverte, bases de sécurité et première orientation.', featured: false },
            { name: 'Intermédiaire', price: 'Standard', desc: 'Programme structuré avec cas pratiques et support.', featured: true },
            { name: 'Avancé', price: 'Expert', desc: 'Approfondissement technique, conformité et audit.', featured: false },
            { name: 'Entreprise', price: 'Sur devis', desc: 'Parcours groupe, session dédiée et adaptation métier.', featured: false },
          ]}
        />
        <SpacerBlock height={28} />
        <Element is={ColumnsBlock} canvas columns={3} gap={20}>
          <CardBlock icon="📄" title="Devis clair" text="Chaque offre peut être reliée à une demande de prix ou d’inscription." />
          <CardBlock icon="🧩" title="Modules adaptables" text="Les contenus peuvent évoluer selon le niveau et le public." />
          <CardBlock icon="📞" title="Orientation rapide" text="Un CTA final dirige vers le bon interlocuteur." />
        </Element>
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
    label: 'Témoignages Premium',
    description: 'Avis clients premium avec note, carrousel et preuves de confiance',
    emoji: '⭐',
    category: 'trust',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 62%, #fbbf24 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={48} paddingY={72} backgroundColor="#0f172a" maxWidth="100%">
        <Element is={ColumnsBlock} canvas columns={2} gap={32}>
          <Element is={ContainerBlock} canvas padding={0} backgroundColor="transparent">
            <TextBlock text="CONFIANCE" fontSize={12} fontWeight="800" color="#fbbf24" extraClasses="uppercase tracking-widest" />
            <SpacerBlock height={14} />
            <TextBlock text="Des professionnels accompagnés avec méthode" fontSize={38} fontWeight="900" color="#ffffff" lineHeight="1.14" />
            <SpacerBlock height={16} />
            <TextBlock text="Un template premium pour valoriser les retours d’expérience, les notes et les preuves institutionnelles." fontSize={17} color="#cbd5e1" lineHeight="1.7" />
            <SpacerBlock height={24} />
            <StarRatingBlock rating={4.8} maxStars={5} size={26} color="#fbbf24" showValue />
            <SpacerBlock height={24} />
            <Element is={ColumnsBlock} canvas columns={3} gap={14}>
              <CardBlock icon="500+" title="Dossiers" text="Installations auditées" />
              <CardBlock icon="95%" title="Satisfaction" text="Retours positifs" />
              <CardBlock icon="24/7" title="Support" text="Orientation technique" />
            </Element>
          </Element>
          <Element is={ContainerBlock} canvas padding={0} backgroundColor="transparent">
            <TestimonialCarouselBlock
              bgColor="#ffffff"
              textColor="#0f172a"
              accentColor="#2563eb"
              items={[
                { text: 'PROQUELEC nous a aidés à clarifier les priorités avant réception du chantier.', author: 'Responsable technique', role: 'Entreprise partenaire' },
                { text: 'La formation a rendu les exigences de conformité plus concrètes pour notre équipe.', author: 'Chef d’équipe', role: 'Installateur électricien' },
                { text: 'Le suivi documentaire a facilité la préparation du dossier et les échanges internes.', author: 'Gestionnaire projet', role: 'Collectivité' },
              ]}
            />
          </Element>
        </Element>
      </Element>
    ),
  },
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
