import React from 'react';
import { Element } from '@craftjs/core';
import {
  ContainerBlock,
  TextBlock,
  HeroBlock,
  ButtonBlock,
  StatsBlock,
  CardBlock,
  ColumnsBlock,
  SpacerBlock,
  ImageBlock,
  AccordionBlock,
  GalleryBlock,
} from '../blocks/ProquelecBlocks';
import {
  HeadingBlock,
  NewsletterBlock,
  LogoGridBlock,
  TimelineBlock,
  StepsBlock,
  TeamMembersGridBlock,
  CallToActionBlock,
  CountdownBlock,
  ComplianceChecklistBlock,
  AuditProcessBlock,
  ResourceCardsBlock,
  FileDownloadBlock,
  TrainingHeroPremiumBlock,
  TrainingProgramPremiumBlock,
  PricingComparisonPremiumBlock,
  ContactPremiumBlock,
  CertificationRequirementsPremiumBlock,
  FAQPremiumBlock,
  TestimonialsPremiumBlock,
  WhyProquelecPremiumBlock,
} from '../blocks/ProquelecBlocksPlus';
import {
  HabilitationCardsBlock,
  TrainingPricingTableBlock,
  ProquelecActivitiesGridBlock,
  TargetAudienceTabsBlock,
  OrganizationStructureBlock,
  ReferenceStatsBlock,
} from '../blocks/ProquelecBlocksExtra';

export type TemplateCategory =
  | 'hero'
  | 'pages'
  | 'content'
  | 'operations'
  | 'conversion'
  | 'media'
  | 'trust';

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
        showStats
        slidesJson={JSON.stringify([
          {
            id: 'proquelec-premium',
            title: 'Promotion de la Qualité des Installations Électriques',
            subtitle:
              "Sécurité · Qualité · Formation — L'organisme national de référence pour la conformité des installations électriques intérieures au Sénégal.",
            badge: 'PROQUELEC — SÉNÉGAL · DEPUIS 1995',
            background_url:
              'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=2000&auto=format&fit=crop',
            cta_text: 'Demander un contrôle',
            cta_link: '/contact',
            secondary_cta_text: 'Découvrir nos formations',
            secondary_cta_link: '/formations',
          },
        ])}
      />
    ),
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
        <Element
          is={ContainerBlock}
          canvas
          padding={32}
          paddingY={48}
          backgroundColor="#f8fafc"
          maxWidth="100%"
        >
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
            <HeadingBlock
              text="Excellence & conformité"
              level="h1"
              fontSize={40}
              color="#0f172a"
              fontWeight="800"
            />
            <SpacerBlock height={16} />
            <TextBlock
              text="Accompagner les installateurs et garantir la sécurité des usagers grâce à des contrôles rigoureux."
              fontSize={18}
              color="#475569"
              lineHeight="1.7"
            />
            <SpacerBlock height={28} />
            <ButtonBlock
              label="En savoir plus"
              href="/about"
              backgroundColor="#2563eb"
              size="lg"
              rounded="lg"
            />
          </Element>
          <Element is={ContainerBlock} canvas padding={24} backgroundColor="#1e3a5f">
            <ImageBlock
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1600&auto=format&fit=crop"
              alt="Technicien électricien en intervention"
              height={460}
              rounded="lg"
            />
          </Element>
        </Element>
      </Element>
    ),
  },
  {
    label: 'Hero CTA compact',
    description: "Bandeau court avec appel à l'action",
    emoji: '🎯',
    category: 'hero',
    previewGradient: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    factory: () => (
      <Element
        is={ContainerBlock}
        canvas
        padding={40}
        paddingY={56}
        backgroundColor="#2563eb"
        maxWidth="100%"
      >
        <TextBlock
          text="Besoin d'un contrôle ?"
          fontSize={32}
          textAlign="center"
          fontWeight="800"
          color="#ffffff"
        />
        <SpacerBlock height={12} />
        <TextBlock
          text="Planifiez une visite avec nos équipes certifiées."
          fontSize={18}
          textAlign="center"
          color="#dbeafe"
        />
        <SpacerBlock height={24} />
        <ButtonBlock
          label="Demander un rendez-vous"
          href="/contact"
          backgroundColor="#ffffff"
          textColor="#1e3a5f"
          size="lg"
          rounded="xl"
        />
      </Element>
    ),
  },

  {
    label: 'Hero Formation Premium',
    description: 'Hero éditable pour page formation avec niveau, durée, certification et CTA',
    emoji: '🎓',
    category: 'hero',
    previewGradient: 'linear-gradient(135deg, #06111f 0%, #1e3a5f 58%, #f59e0b 100%)',
    factory: () => <TrainingHeroPremiumBlock />,
  },

  // ── PAGES PREMIUM ──
  {
    label: 'Page Catalogue Formations Habilitation',
    description: "Page complète avec hero, fiches d'habilitation et tarifs.",
    emoji: '🎓',
    category: 'pages',
    previewGradient: 'linear-gradient(180deg, #1e3a5f 0%, #eff6ff 42%, #ffffff 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <TrainingHeroPremiumBlock
          badge="FORMATIONS PROQUELEC"
          title="Habilitation Électrique"
          subtitle="Formations par modules ou packs adaptées à vos besoins spécifiques."
        />
        <HabilitationCardsBlock />
        <TrainingPricingTableBlock />
      </Element>
    ),
  },
  {
    label: 'Page Qui Sommes-Nous & Gouvernance',
    description: "Structure, missions et conseil d'administration.",
    emoji: '🏛️',
    category: 'pages',
    previewGradient: 'linear-gradient(180deg, #0f172a 0%, #ffffff 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <OrganizationStructureBlock />
        <WhyProquelecPremiumBlock />
      </Element>
    ),
  },
  {
    label: 'Page Formation Complète',
    description:
      'Structure complète : hero, objectifs, programme, prérequis, tarifs, calendrier et CTA',
    emoji: '🎓',
    category: 'pages',
    previewGradient: 'linear-gradient(180deg, #06111f 0%, #eff6ff 42%, #ffffff 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <TrainingHeroPremiumBlock
          badge="ACADÉMIE PROQUELEC"
          title="Formation professionnelle en électricité"
          subtitle="Un modèle premium pour présenter une formation, ses bénéfices, son programme et ses modalités d'inscription."
          primaryLabel="Demander une inscription"
          primaryHref="/contact"
          secondaryLabel="Voir le programme"
          secondaryHref="/formations"
        />
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={64}
          backgroundColor="#f8fafc"
          maxWidth="100%"
        >
          {sectionHeader(
            'Objectifs',
            'Compétences visées',
            'Un parcours orienté pratique, sécurité et conformité.',
          )}
          <Element is={ColumnsBlock} canvas columns={3} gap={24}>
            <CardBlock
              icon="⚡"
              title="Installer"
              text="Comprendre les circuits, protections et tableaux électriques."
            />
            <CardBlock
              icon="🛡️"
              title="Sécuriser"
              text="Identifier les risques et appliquer les bonnes pratiques."
            />
            <CardBlock
              icon="✅"
              title="Valider"
              text="Préparer les contrôles et documenter les corrections."
            />
          </Element>
        </Element>
        <TrainingProgramPremiumBlock
          title="Programme détaillé"
          subtitle="Modules, prérequis et livrables pour une session structurée autour de la sécurité et de la conformité."
          backgroundColor="#ffffff"
        />
        <PricingComparisonPremiumBlock
          title="Tarifs et prochaines sessions"
          subtitle="Des offres adaptables aux particuliers, entreprises et groupes."
          plans={[
            {
              name: 'Individuel',
              price: 'Sur devis',
              description: 'Inscription à une session programmée.',
              features: ['Programme complet', 'Support de cours', 'Attestation'],
              buttonText: 'Demander une date',
              href: '/contact',
              featured: false,
            },
            {
              name: 'Entreprise',
              price: 'Groupe',
              description: 'Session dédiée pour équipes techniques.',
              features: ['Session dédiée', 'Cas pratiques métier', 'Planning adapté'],
              buttonText: 'Demander un devis',
              href: '/contact',
              featured: true,
            },
            {
              name: 'Sur site',
              price: 'Personnalisé',
              description: 'Formation adaptée à vos installations.',
              features: ['Audit du besoin', 'Contenu ajusté', 'Accompagnement terrain'],
              buttonText: 'Planifier',
              href: '/contact',
              featured: false,
            },
          ]}
        />
        <ContactPremiumBlock
          title="Construisons votre parcours de formation"
          subtitle="L’équipe PROQUELEC vous aide à choisir le niveau, le format et les dates adaptés à votre besoin."
          buttonText="Contacter le pôle formation"
        />
      </Element>
    ),
  },
  {
    label: 'Page Audit Électrique',
    description:
      'Landing complète pour audit : promesse, étapes, checklist, preuves et demande de devis',
    emoji: '🛡️',
    category: 'pages',
    previewGradient: 'linear-gradient(180deg, #0f172a 0%, #dbeafe 45%, #ffffff 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={72}
          backgroundColor="#0f172a"
          maxWidth="100%"
        >
          <TextBlock
            text="AUDIT & CONFORMITÉ"
            fontSize={12}
            textAlign="center"
            fontWeight="800"
            color="#fbbf24"
            extraClasses="uppercase tracking-widest"
          />
          <SpacerBlock height={14} />
          <TextBlock
            text="Sécurisez vos installations avant contrôle"
            fontSize={44}
            textAlign="center"
            fontWeight="900"
            color="#ffffff"
          />
          <SpacerBlock height={12} />
          <TextBlock
            text="Une page premium pour transformer une demande d’audit en dossier cadré, priorisé et suivi."
            fontSize={18}
            textAlign="center"
            color="#cbd5e1"
            lineHeight="1.7"
          />
          <SpacerBlock height={28} />
          <StatsBlock />
        </Element>
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={64}
          backgroundColor="#f8fafc"
          maxWidth="100%"
        >
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
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={64}
          backgroundColor="#ffffff"
          maxWidth="1120px"
        >
          {sectionHeader(
            'Bénéfices',
            'Un audit lisible et actionnable',
            'Chaque partie prenante comprend les priorités techniques et les prochaines étapes.',
          )}
          <Element is={ColumnsBlock} canvas columns={3} gap={24}>
            <CardBlock
              icon="📍"
              title="Diagnostic ciblé"
              text="Identification des zones à risque et des non-conformités visibles."
            />
            <CardBlock
              icon="📊"
              title="Priorisation"
              text="Classement des actions selon urgence, sécurité et impact."
            />
            <CardBlock
              icon="📄"
              title="Restitution claire"
              text="Synthèse exploitable pour décision, devis ou levée de réserves."
            />
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
    description:
      'Présentation premium d’un parcours de certification avec documents, délais et étapes',
    emoji: '🏅',
    category: 'pages',
    previewGradient: 'linear-gradient(180deg, #1e3a5f 0%, #fef3c7 48%, #ffffff 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        <CertificationRequirementsPremiumBlock
          title="Structurer un dossier clair et recevable"
          subtitle="Un template conçu pour expliquer les critères, les pièces à fournir et le processus de validation."
        />
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={64}
          backgroundColor="#ffffff"
          maxWidth="100%"
        >
          <ResourceCardsBlock
            title="Ressources certification"
            subtitle="Regroupez ici les formulaires, guides et référentiels nécessaires au dossier."
            accentColor="#1e3a5f"
            backgroundColor="#ffffff"
            resources={[
              {
                type: 'Formulaire',
                title: 'Demande d’agrément',
                description: 'Document de base pour ouvrir le dossier.',
                href: '/documents',
                label: 'Télécharger',
              },
              {
                type: 'Guide',
                title: 'Critères techniques',
                description: 'Comprendre les exigences attendues.',
                href: '/normes-ressources',
                label: 'Consulter',
              },
              {
                type: 'Contact',
                title: 'Assistance dossier',
                description: 'Échanger avec l’équipe avant dépôt.',
                href: '/contact',
                label: 'Contacter',
              },
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
    description:
      'Page contact complète : promesse, formulaire, coordonnées, délais et raisons de contacter',
    emoji: '📬',
    category: 'pages',
    previewGradient: 'linear-gradient(180deg, #f8fafc 0%, #dbeafe 55%, #ffffff 100%)',
    factory: () => (
      <ContactPremiumBlock
        title="Une demande claire, une réponse orientée action"
        subtitle="Centralisez les demandes de contrôle, formation, audit, certification ou assistance technique."
      />
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
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={64}
          backgroundColor="#ffffff"
          maxWidth="100%"
        >
          <TextBlock
            text="RESSOURCES TECHNIQUES"
            fontSize={12}
            textAlign="center"
            fontWeight="800"
            color="#2563eb"
            extraClasses="uppercase tracking-widest"
          />
          <SpacerBlock height={14} />
          <TextBlock
            text="Guides, normes et documents utiles"
            fontSize={42}
            textAlign="center"
            fontWeight="900"
            color="#0f172a"
          />
          <SpacerBlock height={12} />
          <TextBlock
            text="Une structure propre pour organiser les ressources téléchargeables et orienter les professionnels."
            fontSize={18}
            textAlign="center"
            color="#64748b"
            lineHeight="1.7"
          />
        </Element>
        <ResourceCardsBlock
          title="Accès rapide"
          subtitle="Mettez en avant les contenus les plus demandés."
          accentColor="#2563eb"
          backgroundColor="#eff6ff"
          resources={[
            {
              type: 'Guide',
              title: 'Préparer un contrôle',
              description: 'Checklist des informations à réunir avant visite.',
              href: '/documents',
              label: 'Consulter',
            },
            {
              type: 'Norme',
              title: 'Référentiels électriques',
              description: 'Points clés pour installations intérieures.',
              href: '/normes-ressources',
              label: 'Explorer',
            },
            {
              type: 'Fiche',
              title: 'Sécurité chantier',
              description: 'Bonnes pratiques terrain et prévention.',
              href: '/documents',
              label: 'Voir la fiche',
            },
          ]}
        />
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={64}
          backgroundColor="#ffffff"
          maxWidth="1120px"
        >
          <Element is={ColumnsBlock} canvas columns={3} gap={20}>
            <FileDownloadBlock
              label="Formulaire de demande"
              fileSize="PDF"
              icon="📄"
              bgColor="#f8fafc"
              accentColor="#2563eb"
            />
            <FileDownloadBlock
              label="Guide de préparation"
              fileSize="PDF"
              icon="📘"
              bgColor="#f8fafc"
              accentColor="#2563eb"
            />
            <FileDownloadBlock
              label="Fiche conformité"
              fileSize="PDF"
              icon="✅"
              bgColor="#f8fafc"
              accentColor="#2563eb"
            />
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
    label: "Section Nos Domaines d'Intervention",
    description: 'Grille présentant les activités de PROQUELEC.',
    emoji: '🛠️',
    category: 'operations',
    previewGradient: 'linear-gradient(90deg, #eff6ff 0%, #f8fafc 100%)',
    factory: () => <ProquelecActivitiesGridBlock />,
  },
  {
    label: 'Section Solutions par Public',
    description: 'Onglets ciblés pour Professionnels, Syndics, etc.',
    emoji: '👥',
    category: 'content',
    previewGradient: 'linear-gradient(90deg, #ffffff 0%, #f1f5f9 100%)',
    factory: () => <TargetAudienceTabsBlock />,
  },
  {
    label: 'Section Bilan & Références',
    description: 'Statistiques et chiffres clés de PROQUELEC.',
    emoji: '📊',
    category: 'trust',
    previewGradient: 'linear-gradient(90deg, #1e3a5f 0%, #1d4ed8 100%)',
    factory: () => <ReferenceStatsBlock />,
  },
  {
    label: 'Section Services Premium',
    description: '3 cartes avec en-tête badge + fond dégradé léger',
    emoji: '⚡',
    category: 'content',
    previewGradient: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
    factory: () => (
      <Element
        is={ContainerBlock}
        canvas
        padding={48}
        paddingY={72}
        backgroundColor="#f8fafc"
        maxWidth="100%"
      >
        {sectionHeader(
          'Nos expertises',
          'Des services pour chaque étape',
          'Contrôle, formation et veille réglementaire au service des professionnels.',
        )}
        <Element is={ColumnsBlock} canvas columns={3} gap={28}>
          <CardBlock
            icon="⚡"
            title="Contrôle & conformité"
            text="Vérification des installations selon les normes en vigueur au Sénégal."
          />
          <CardBlock
            icon="🎓"
            title="Formation certifiante"
            text="Parcours pour installateurs, bureaux d'études et responsables techniques."
          />
          <CardBlock
            icon="🛡️"
            title="Accompagnement"
            text="Conseil, audit et mise en conformité de vos projets électriques."
          />
        </Element>
      </Element>
    ),
  },
  {
    label: 'Section Pourquoi PROQUELEC',
    description:
      'Argumentaire institutionnel premium : sécurité, qualité, expertise et accompagnement',
    emoji: '🏛️',
    category: 'content',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 55%, #fef3c7 100%)',
    factory: () => (
      <WhyProquelecPremiumBlock subtitle="Une section prête pour expliquer la valeur de l’organisme sur les pages institutionnelles et services." />
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
            <TextBlock
              text="• Organisme de référence depuis 1995\n• Réseau national d'experts\n• Alignement sur les normes sénégalaises"
              fontSize={16}
              color="#475569"
              lineHeight="1.8"
            />
          </Element>
          <Element is={ContainerBlock} canvas padding={32} backgroundColor="#f1f5f9">
            <ImageBlock
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop"
              alt="Tableau électrique et câblage"
              height={360}
              rounded="lg"
            />
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
      <FAQPremiumBlock
        title="Réponses aux questions fréquentes"
        subtitle="Une section premium pour réduire les frictions avant contact ou inscription."
      />
    ),
  },
  {
    label: 'Section FAQ',
    description: 'Questions fréquentes sur fond blanc épuré',
    emoji: '❓',
    category: 'content',
    previewGradient: 'linear-gradient(180deg, #ffffff, #f1f5f9)',
    factory: () => (
      <Element
        is={ContainerBlock}
        canvas
        padding={48}
        paddingY={72}
        backgroundColor="#ffffff"
        maxWidth="800px"
      >
        {sectionHeader(
          'FAQ',
          'Questions fréquentes',
          'Tout ce que vous devez savoir sur nos prestations.',
        )}
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
      <Element
        is={ContainerBlock}
        canvas
        padding={48}
        paddingY={72}
        backgroundColor="#ffffff"
        maxWidth="100%"
      >
        {sectionHeader(
          'Processus',
          'Comment ça marche',
          'Un parcours simple, de la demande à la certification.',
        )}
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
      <Element
        is={ContainerBlock}
        canvas
        padding={40}
        paddingY={56}
        backgroundColor="#f8fafc"
        maxWidth="100%"
      >
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
      <ContactPremiumBlock
        title="Échangeons sur votre projet"
        subtitle="Réponse sous 24 h ouvrées pour orienter votre demande vers le bon service."
        backgroundColor="#eff6ff"
      />
    ),
  },
  {
    label: 'Section Tarifs',
    description: 'Grille tarifaire 3 colonnes',
    emoji: '💰',
    category: 'conversion',
    previewGradient: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
    factory: () => (
      <PricingComparisonPremiumBlock
        title="Tarifs transparents"
        subtitle="Choisissez la formule adaptée à votre structure."
        accentColor="#059669"
        backgroundColor="#ecfdf5"
      />
    ),
  },
  {
    label: 'Comparatif Offres / Tarifs',
    description: 'Comparatif premium pour débutant, intermédiaire, avancé et entreprise',
    emoji: '💼',
    category: 'conversion',
    previewGradient: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 50%, #fff7ed 100%)',
    factory: () => (
      <PricingComparisonPremiumBlock
        title="Choisir le bon accompagnement"
        subtitle="Un modèle clair pour comparer les niveaux, les prix et les usages."
        plans={[
          {
            name: 'Débutant',
            price: 'Essentiel',
            description: 'Découverte, bases de sécurité et première orientation.',
            features: ['Bases électriques', 'Support synthèse', 'Attestation'],
            buttonText: 'Choisir',
            href: '/contact',
            featured: false,
          },
          {
            name: 'Intermédiaire',
            price: 'Standard',
            description: 'Programme structuré avec cas pratiques et support.',
            features: ['Modules complets', 'Cas pratiques', 'Suivi pédagogique'],
            buttonText: 'Demander un devis',
            href: '/contact',
            featured: true,
          },
          {
            name: 'Avancé',
            price: 'Expert',
            description: 'Approfondissement technique, conformité et audit.',
            features: ['Contrôle avancé', 'Études de cas', 'Plan d’action'],
            buttonText: 'Être orienté',
            href: '/contact',
            featured: false,
          },
          {
            name: 'Entreprise',
            price: 'Sur devis',
            description: 'Parcours groupe, session dédiée et adaptation métier.',
            features: ['Session dédiée', 'Planning flexible', 'Reporting équipe'],
            buttonText: 'Planifier',
            href: '/contact',
            featured: false,
          },
        ]}
      />
    ),
  },
  {
    label: 'Bannière CTA large',
    description: "Appel à l'action pleine largeur",
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
      <Element
        is={ContainerBlock}
        canvas
        padding={48}
        paddingY={64}
        backgroundColor="#1e3a5f"
        maxWidth="100%"
      >
        <TextBlock
          text="Veille réglementaire"
          fontSize={14}
          textAlign="center"
          fontWeight="700"
          color="#93c5fd"
          extraClasses="uppercase tracking-widest"
        />
        <SpacerBlock height={8} />
        <TextBlock
          text="Restez informé des évolutions normatives"
          fontSize={30}
          textAlign="center"
          fontWeight="800"
          color="#ffffff"
        />
        <SpacerBlock height={8} />
        <TextBlock
          text="Une newsletter mensuelle pour les professionnels du secteur."
          fontSize={16}
          textAlign="center"
          color="#bfdbfe"
        />
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
      <Element
        is={ContainerBlock}
        canvas
        padding={48}
        paddingY={64}
        backgroundColor="#0f172a"
        maxWidth="100%"
      >
        <TextBlock
          text="Prochaine session"
          fontSize={32}
          textAlign="center"
          fontWeight="900"
          color="#ffffff"
        />
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
      <Element
        is={ContainerBlock}
        canvas
        padding={48}
        paddingY={64}
        backgroundColor="#f8fafc"
        maxWidth="100%"
      >
        {sectionHeader(
          'Réalisations',
          'Nos interventions',
          'Quelques chantiers et contrôles récents.',
        )}
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
      <Element
        is={ContainerBlock}
        canvas
        padding={48}
        paddingY={64}
        backgroundColor="#ffffff"
        maxWidth="100%"
      >
        {sectionHeader(
          'Équipe',
          'Des experts à votre écoute',
          'Direction, contrôleurs et formateurs dédiés.',
        )}
        <TeamMembersGridBlock
          members={[
            {
              name: 'Direction technique',
              role: 'Contrôle & normes',
              photo: '',
              bio: 'Pilotage des opérations terrain',
            },
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
      <Element
        is={ContainerBlock}
        canvas
        padding={48}
        paddingY={64}
        backgroundColor="#ffffff"
        maxWidth="768px"
      >
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
      <TestimonialsPremiumBlock
        title="Des professionnels accompagnés avec méthode"
        subtitle="Un template premium pour valoriser les retours d’expérience, les notes et les preuves institutionnelles."
      />
    ),
  },
  {
    label: 'Témoignages',
    description: 'Avis clients sur fond sombre premium',
    emoji: '💬',
    category: 'trust',
    previewGradient: 'linear-gradient(135deg, #0f172a, #1e293b)',
    factory: () => (
      <TestimonialsPremiumBlock
        title="Ils nous font confiance"
        subtitle="Avis clients et preuves de confiance sur fond institutionnel sombre."
        accentColor="#818cf8"
      />
    ),
  },
  {
    label: 'Chiffres clés',
    description: 'KPIs sur fond institutionnel',
    emoji: '📊',
    category: 'trust',
    previewGradient: 'linear-gradient(135deg, #1e3a5f, #0f172a)',
    factory: () => (
      <Element
        is={ContainerBlock}
        canvas
        padding={48}
        paddingY={72}
        backgroundColor="#1e3a5f"
        maxWidth="100%"
      >
        <TextBlock
          text="Impact"
          fontSize={14}
          textAlign="center"
          fontWeight="700"
          color="#93c5fd"
          extraClasses="uppercase tracking-widest"
        />
        <SpacerBlock height={12} />
        <TextBlock
          text="PROQUELEC en chiffres"
          fontSize={34}
          textAlign="center"
          fontWeight="900"
          color="#ffffff"
        />
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
      <Element
        is={ContainerBlock}
        canvas
        padding={40}
        paddingY={48}
        backgroundColor="#f8fafc"
        maxWidth="100%"
      >
        <TextBlock
          text="Partenaires & institutions"
          fontSize={22}
          textAlign="center"
          fontWeight="700"
          color="#64748b"
        />
        <SpacerBlock height={28} />
        <LogoGridBlock />
      </Element>
    ),
  },

  // ── OUTILS ──
  {
    label: 'Catalogue Outils par Thème',
    description:
      'Grille premium listant tous les outils PROQUELEC par thématique (calculateurs, diagnostic, devis, normes).',
    emoji: '🧰',
    category: 'content',
    previewGradient: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 30%, #2563eb 70%, #f8fafc 100%)',
    factory: () => (
      <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
        {/* ── SECTION HERO ── */}
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={72}
          backgroundColor="#0f172a"
          maxWidth="100%"
        >
          <TextBlock
            text="CATALOGUE OUTILS"
            fontSize={12}
            textAlign="center"
            fontWeight="800"
            color="#fbbf24"
            extraClasses="uppercase tracking-widest"
          />
          <SpacerBlock height={14} />
          <TextBlock
            text="Tous les outils PROQUELEC"
            fontSize={44}
            textAlign="center"
            fontWeight="900"
            color="#ffffff"
          />
          <SpacerBlock height={12} />
          <TextBlock
            text="Simulateurs, diagnostics, devis, normes et guides — une plateforme d'ingénierie souveraine au service des professionnels et du grand public."
            fontSize={18}
            textAlign="center"
            color="#cbd5e1"
            lineHeight="1.7"
          />
          <SpacerBlock height={28} />
          <StatsBlock />
        </Element>

        {/* ── THÈME 1 : CALCULATEURS & SIMULATEURS ── */}
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={64}
          backgroundColor="#f8fafc"
          maxWidth="100%"
        >
          <TextBlock
            text="CALCULATEURS & SIMULATEURS"
            fontSize={12}
            textAlign="center"
            fontWeight="700"
            color="#2563eb"
            extraClasses="uppercase tracking-widest"
          />
          <SpacerBlock height={8} />
          <TextBlock
            text="Des outils techniques pour dimensionner et calculer"
            fontSize={28}
            textAlign="center"
            fontWeight="800"
            color="#0f172a"
          />
          <SpacerBlock height={32} />
          <Element is={ColumnsBlock} canvas columns={3} gap={24}>
            <CardBlock
              icon="📊"
              title="Simulateur Consommation"
              text="Estimez la consommation électrique de votre logement selon surface, occupants et équipements."
              accentColor="#2563eb"
            />
            <CardBlock
              icon="📏"
              title="Dimensionnement Câbles"
              text="Calculez la section de câble optimale selon la puissance, la longueur et le matériau."
              accentColor="#2563eb"
            />
            <CardBlock
              icon="⚡"
              title="Chute de Tension"
              text="Calcul normé de chute de tension selon NS 01-001 pour installations BT."
              accentColor="#2563eb"
            />
            <CardBlock
              icon="☀️"
              title="Dimensionnement Solaire"
              text="Dimensionnez panneaux solaires, batteries et régulateur selon votre consommation."
              accentColor="#2563eb"
            />
            <CardBlock
              icon="💡"
              title="Calculateur Éclairage"
              text="Calculez l'éclairement en lux pour vos espaces intérieurs et extérieurs."
              accentColor="#2563eb"
            />
            <CardBlock
              icon="🔄"
              title="Convertisseur Unités"
              text="Convertissez tensions, courants, puissances et fréquences en un clic."
              accentColor="#2563eb"
            />
          </Element>
        </Element>

        {/* ── THÈME 2 : DIAGNOSTIC & SÉCURITÉ ── */}
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={64}
          backgroundColor="#ffffff"
          maxWidth="100%"
        >
          <TextBlock
            text="DIAGNOSTIC & SÉCURITÉ"
            fontSize={12}
            textAlign="center"
            fontWeight="700"
            color="#059669"
            extraClasses="uppercase tracking-widest"
          />
          <SpacerBlock height={8} />
          <TextBlock
            text="Évaluez, vérifiez et sécurisez vos installations"
            fontSize={28}
            textAlign="center"
            fontWeight="800"
            color="#0f172a"
          />
          <SpacerBlock height={32} />
          <Element is={ColumnsBlock} canvas columns={3} gap={24}>
            <CardBlock
              icon="🩺"
              title="Diagnostic Interactif"
              text="Guide pas à pas : symptômes, causes, solutions et génération de rapport."
              accentColor="#059669"
            />
            <CardBlock
              icon="✅"
              title="Checklist Sécurité"
              text="Évaluez la conformité de votre installation avec 13 points de contrôle notés."
              accentColor="#059669"
            />
            <CardBlock
              icon="🛡️"
              title="Vérification Terre"
              text="Vérifiez la prise de terre et la conformité avec la norme NF C 15-100."
              accentColor="#059669"
            />
            <CardBlock
              icon="🌍"
              title="Guide Terre & Différentiel"
              text="Guide complet sur le couple terre + différentiel : principes, calculs, tableaux."
              accentColor="#059669"
            />
          </Element>
        </Element>

        {/* ── THÈME 3 : DEVIS & DOCUMENTS ── */}
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={64}
          backgroundColor="#f8fafc"
          maxWidth="100%"
        >
          <TextBlock
            text="DEVIS & DOCUMENTS"
            fontSize={12}
            textAlign="center"
            fontWeight="700"
            color="#d97706"
            extraClasses="uppercase tracking-widest"
          />
          <SpacerBlock height={8} />
          <TextBlock
            text="Générez, téléchargez et gérez vos documents techniques"
            fontSize={28}
            textAlign="center"
            fontWeight="800"
            color="#0f172a"
          />
          <SpacerBlock height={32} />
          <Element is={ColumnsBlock} canvas columns={3} gap={24}>
            <CardBlock
              icon="📄"
              title="Générateur de Devis"
              text="Créez des devis professionnels avec catalogue produits, TVA et QR code."
              accentColor="#d97706"
            />
            <CardBlock
              icon="📚"
              title="Bibliothèque Documents"
              text="Téléchargez guides techniques et mémentos électriques PROQUELEC."
              accentColor="#d97706"
            />
            <CardBlock
              icon="🏷️"
              title="Label Qualité"
              text="Formulaire de demande de certification PROQUELEC (Bronze, Argent, Or)."
              accentColor="#d97706"
            />
          </Element>
        </Element>

        {/* ── THÈME 4 : NORMES & RÉFÉRENCES ── */}
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={64}
          backgroundColor="#ffffff"
          maxWidth="100%"
        >
          <TextBlock
            text="NORMES & RÉFÉRENCES"
            fontSize={12}
            textAlign="center"
            fontWeight="700"
            color="#7c3aed"
            extraClasses="uppercase tracking-widest"
          />
          <SpacerBlock height={8} />
          <TextBlock
            text="Consultez les textes et tableaux de référence"
            fontSize={28}
            textAlign="center"
            fontWeight="800"
            color="#0f172a"
          />
          <SpacerBlock height={32} />
          <Element is={ColumnsBlock} canvas columns={3} gap={24}>
            <CardBlock
              icon="🗄️"
              title="Base Normative"
              text="Recherche dans les normes NS 01-001, NF C 15-100, IEC et tableaux de câbles."
              accentColor="#7c3aed"
            />
          </Element>
        </Element>

        {/* ── CTA FINAL ── */}
        <Element
          is={ContainerBlock}
          canvas
          padding={48}
          paddingY={56}
          backgroundColor="#2563eb"
          maxWidth="100%"
        >
          <TextBlock
            text="Accédez à tous les outils"
            fontSize={32}
            textAlign="center"
            fontWeight="800"
            color="#ffffff"
          />
          <SpacerBlock height={12} />
          <TextBlock
            text="Plateforme d'ingénierie électrotechnique souveraine — 40 applications pour professionnels et grand public."
            fontSize={18}
            textAlign="center"
            color="#dbeafe"
          />
          <SpacerBlock height={24} />
          <ButtonBlock
            label="Explorer les outils"
            href="/outils"
            backgroundColor="#ffffff"
            textColor="#1e3a5f"
            size="lg"
            rounded="xl"
          />
        </Element>
      </Element>
    ),
  },
];
