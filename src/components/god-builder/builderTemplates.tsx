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
  TargetAudienceTabsBlock,
  OrganizationStructureBlock,
  ReferenceStatsBlock,
} from '../blocks/ProquelecBlocksExtra';

// ── Types ──

export type TemplateCategory =
  | 'hero'
  | 'pages'
  | 'content'
  | 'operations'
  | 'conversion'
  | 'media'
  | 'trust';

export interface SectionTemplateMeta {
  /** Temps de rendu estimé (ms) */
  estimatedRenderMs?: number;
  /** Version du template */
  version?: number;
  /** Tags de recherche */
  tags?: string[];
  /** Auteur / Source */
  author?: string;
}

export interface SectionTemplate {
  label: string;
  description: string;
  emoji: string;
  category: TemplateCategory;
  previewGradient: string;
  factory: () => React.ReactElement;
  /** Métadonnées additionnelles */
  meta?: SectionTemplateMeta;
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

// ── Design System Tokens ──

const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  section: 48,
  sectionY: 64,
  hero: 72,
} as const;

const colors = {
  dark: '#0f172a',
  navy: '#1e3a5f',
  blue: '#2563eb',
  blueLight: '#dbeafe',
  blueBg: '#eff6ff',
  green: '#059669',
  greenLight: '#d1fae5',
  amber: '#d97706',
  amberLight: '#fef3c7',
  purple: '#7c3aed',
  purpleLight: '#ede9fe',
  gold: '#fbbf24',
  slate: '#64748b',
  slateLight: '#cbd5e1',
  light: '#f8fafc',
  white: '#ffffff',
  transparent: 'transparent',
} as const;

const font = {
  badge: '12' as const,
  h1: '44' as const,
  h2: '36' as const,
  h3: '28' as const,
  h4: '22' as const,
  body: '17' as const,
  bodySm: '15' as const,
} as const;

// ── Error Boundary pour templates ──

interface TemplateErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  templateName?: string;
}

interface TemplateErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class TemplateErrorBoundary extends React.Component<
  TemplateErrorBoundaryProps,
  TemplateErrorBoundaryState
> {
  constructor(props: TemplateErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TemplateErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[Template Error] ${this.props.templateName || 'Unknown'}:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            role="alert"
            className="p-8 bg-red-50 border border-red-200 rounded-xl text-center"
            aria-label={`Erreur dans le template ${this.props.templateName || ''}`}
          >
            <span className="text-3xl mb-2 block">⚠️</span>
            <p className="text-red-700 font-medium">Une erreur est survenue dans ce bloc.</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-2 text-xs text-red-500 text-left max-w-md mx-auto overflow-auto">
                {this.state.error.message}
              </pre>
            )}
          </div>
        )
      );
    }
    return this.props.children;
  }
}

/** Wrapper sécurisé pour les factory de templates */
function withErrorBoundary(
  factory: () => React.ReactElement,
  label: string,
): () => React.ReactElement {
  return () => <TemplateErrorBoundary templateName={label}>{factory()}</TemplateErrorBoundary>;
}

// ── Helpers de contenu ──

interface SectionHeaderProps {
  badge: string;
  title: string;
  subtitle: string;
  badgeColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  spacing?: keyof typeof spacing;
}

const SectionHeader = ({
  badge,
  title,
  subtitle,
  badgeColor = colors.blue,
  titleColor = colors.dark,
  subtitleColor = colors.slate,
  spacing: spacingKey = 'xxl',
}: SectionHeaderProps) => (
  <Element
    is={ContainerBlock}
    canvas
    padding={0}
    backgroundColor={colors.transparent}
    maxWidth="100%"
  >
    <TextBlock
      text={badge}
      fontSize={parseInt(font.badge)}
      textAlign="center"
      fontWeight="700"
      color={badgeColor}
      extraClasses="uppercase tracking-[0.15em]"
    />
    <SpacerBlock height={spacing.xs} />
    <TextBlock
      text={title}
      fontSize={parseInt(font.h2)}
      textAlign="center"
      fontWeight="900"
      color={titleColor}
      extraClasses="leading-[1.15]"
    />
    <SpacerBlock height={spacing.xs} />
    <TextBlock
      text={subtitle}
      fontSize={parseInt(font.body)}
      textAlign="center"
      color={subtitleColor}
      lineHeight="1.7"
      extraClasses="max-w-2xl mx-auto"
    />
    <SpacerBlock height={spacing[spacingKey]} />
  </Element>
);

/** Section wrapper avec fond et padding standardisés */
const Section = ({
  children,
  backgroundColor = colors.white,
  paddingY = spacing.sectionY,
  padding = spacing.section,
}: {
  children: React.ReactNode;
  backgroundColor?: string;
  paddingY?: number;
  padding?: number;
}) => (
  <Element
    is={ContainerBlock}
    canvas
    padding={padding}
    paddingY={paddingY}
    backgroundColor={backgroundColor}
    maxWidth="100%"
  >
    {children}
  </Element>
);

/** Grille responsive avec colonnes */
const Grid = ({
  children,
  columns = 3,
  gap = spacing.lg,
}: {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
}) => (
  <Element is={ColumnsBlock} canvas columns={columns} gap={gap}>
    {children}
  </Element>
);

const cardPresets = {
  blue: { accentColor: colors.blue },
  green: { accentColor: colors.green },
  amber: { accentColor: colors.amber },
  purple: { accentColor: colors.purple },
} as const;

const PremiumPageRoot = ({ children }: { children: React.ReactNode }) => (
  <Element is={ContainerBlock} canvas padding={0} backgroundColor={colors.white} maxWidth="100%">
    {children}
  </Element>
);

const PremiumHero = ({
  badge,
  title,
  subtitle,
  primaryLabel,
  primaryHref = '/contact',
  accentColor = colors.gold,
  backgroundColor = colors.dark,
}: {
  badge: string;
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryHref?: string;
  accentColor?: string;
  backgroundColor?: string;
}) => (
  <Section backgroundColor={backgroundColor} paddingY={spacing.hero}>
    <TextBlock
      text={badge}
      fontSize={parseInt(font.badge)}
      textAlign="center"
      fontWeight="800"
      color={accentColor}
      extraClasses="uppercase tracking-[0.15em]"
    />
    <SpacerBlock height={spacing.sm} />
    <TextBlock
      text={title}
      fontSize={parseInt(font.h1)}
      textAlign="center"
      fontWeight="900"
      color={colors.white}
      extraClasses="leading-[1.08] max-w-5xl mx-auto"
    />
    <SpacerBlock height={spacing.md} />
    <TextBlock
      text={subtitle}
      fontSize={parseInt(font.body)}
      textAlign="center"
      color={colors.slateLight}
      lineHeight="1.75"
      extraClasses="max-w-3xl mx-auto"
    />
    <SpacerBlock height={spacing.lg} />
    <ButtonBlock
      label={primaryLabel}
      href={primaryHref}
      backgroundColor={accentColor}
      textColor={backgroundColor === colors.dark ? colors.dark : colors.white}
      size="lg"
      rounded="xl"
    />
  </Section>
);

const PremiumCardGrid = ({
  items,
  columns = 3,
  accentColor = colors.blue,
}: {
  items: Array<{ icon: string; title: string; subtitle?: string; text: string }>;
  columns?: number;
  accentColor?: string;
}) => (
  <Grid columns={columns}>
    {items.map((item) => (
      <CardBlock
        key={item.title}
        icon={item.icon}
        title={item.title}
        subtitle={item.subtitle || ''}
        text={item.text}
        accentColor={accentColor}
      />
    ))}
  </Grid>
);

const renderAuditElectricalPremiumPage = () => (
  <PremiumPageRoot>
    <PremiumHero
      badge="AUDIT ÉLECTRIQUE PREMIUM"
      title="Contrôler, prioriser et sécuriser les installations électriques"
      subtitle="Une page service complète pour transformer une demande d'audit en dossier clair : périmètre, méthode, livrables, criticité et demande de visite."
      primaryLabel="Demander un audit"
    />
    <StatsBlock
      stat1Value="4"
      stat1Label="Étapes d'audit"
      stat2Value="72h"
      stat2Label="Rapport cible"
      stat3Value="3"
      stat3Label="Niveaux de priorité"
      backgroundColor={colors.blueBg}
      accentColor={colors.blue}
    />
    <Section>
      <SectionHeader
        badge="PÉRIMÈTRE"
        title="Ce que l'audit vérifie"
        subtitle="Le visiteur comprend immédiatement les points contrôlés et les preuves attendues."
      />
      <PremiumCardGrid
        accentColor={colors.blue}
        items={[
          {
            icon: '⚡',
            title: 'Tableaux et protections',
            text: 'Repérage, calibres, différentiels, sélectivité et cohérence des départs.',
          },
          {
            icon: '⏚',
            title: 'Terre et continuité',
            text: 'Mesures, liaisons équipotentielles, circuits sensibles et zones humides.',
          },
          {
            icon: '📄',
            title: 'Dossier technique',
            text: 'Schémas, PV de mesure, photos, réserves et recommandations classées.',
          },
        ]}
      />
    </Section>
    <Section backgroundColor={colors.dark}>
      <AuditProcessBlock
        title="Méthode d'audit PROQUELEC"
        subtitle="Un parcours lisible pour cadrer, inspecter, documenter et suivre les réserves."
        steps={[
          {
            phase: '01',
            title: 'Cadrage',
            description: 'Site, usage, puissance, historique et documents disponibles.',
            meta: '24 h',
          },
          {
            phase: '02',
            title: 'Inspection',
            description: 'Contrôle visuel, mesures et photos des points critiques.',
            meta: 'Sur site',
          },
          {
            phase: '03',
            title: 'Rapport',
            description: 'Réserves classées par criticité avec actions recommandées.',
            meta: 'Livrable',
          },
          {
            phase: '04',
            title: 'Suivi',
            description: 'Validation de la levée des réserves si demandée.',
            meta: 'Option',
          },
        ]}
      />
    </Section>
    <Section>
      <ComplianceChecklistBlock
        title="Documents à préparer avant audit"
        subtitle="Une checklist simple pour réduire les allers-retours et accélérer le diagnostic."
        accentColor={colors.green}
        items={[
          {
            status: 'conforme',
            label: 'Adresse et interlocuteur technique',
            detail: 'Coordonnées du responsable présent pendant la visite.',
          },
          {
            status: 'a verifier',
            label: 'Plans, schémas et PV disponibles',
            detail: 'Même incomplets, ils aident à cadrer le contrôle.',
          },
          {
            status: 'critique',
            label: 'Incidents récents',
            detail: 'Disjonctions, échauffements, odeurs ou zones dangereuses.',
          },
        ]}
      />
    </Section>
    <ContactPremiumBlock
      title="Planifier un audit électrique"
      subtitle="Décrivez le site, le type d'installation et l'urgence. L'équipe oriente la demande vers le bon expert."
      backgroundColor={colors.blueBg}
    />
  </PremiumPageRoot>
);

const renderHouseholdDiagnosticPremiumPage = () => (
  <PremiumPageRoot>
    <PremiumHero
      badge="DIAGNOSTIC MÉNAGE PREMIUM"
      title="Aider les familles à repérer les risques avant l'incident"
      subtitle="Un parcours clair pour les particuliers : signaux d'alerte, photos utiles, niveau d'urgence et demande de diagnostic logement."
      primaryLabel="Demander un diagnostic"
      accentColor={colors.green}
      backgroundColor={colors.navy}
    />
    <Section>
      <SectionHeader
        badge="SÉCURITÉ DOMESTIQUE"
        title="Les signaux qui doivent alerter"
        subtitle="Le contenu parle simple et aide le ménage à savoir quand couper, documenter ou appeler."
        badgeColor={colors.green}
      />
      <PremiumCardGrid
        accentColor={colors.green}
        items={[
          {
            icon: '🔥',
            title: 'Échauffement',
            text: 'Prises chaudes, odeur de brûlé, tableau noirci ou appareil qui coupe souvent.',
          },
          {
            icon: '💧',
            title: 'Zones humides',
            text: "Cuisine, salle d'eau et extérieur doivent être protégés avec attention.",
          },
          {
            icon: '📷',
            title: 'Photos utiles',
            text: 'Tableau, prises concernées, câbles visibles et zone du problème.',
          },
        ]}
      />
    </Section>
    <Section backgroundColor={colors.light}>
      <ComplianceChecklistBlock
        title="Préparer la visite logement"
        subtitle="Les informations qui permettent au technicien de qualifier rapidement le risque."
        accentColor={colors.green}
        items={[
          {
            status: 'conforme',
            label: 'Adresse complète et disponibilité',
            detail: 'Créneau de visite et personne à contacter.',
          },
          {
            status: 'a verifier',
            label: 'Photo du tableau électrique',
            detail: 'Vue globale et gros plan des protections.',
          },
          {
            status: 'critique',
            label: 'Symptôme dangereux',
            detail: 'Odeur, étincelle, fil apparent, eau ou disjonction répétée.',
          },
        ]}
      />
    </Section>
    <ContactPremiumBlock
      title="Qualifier une demande ménage"
      subtitle="Le formulaire doit orienter vers diagnostic, conseil de prévention ou urgence technique."
      backgroundColor="#ecfdf5"
    />
  </PremiumPageRoot>
);

const renderTrainingProquelecPremiumPage = () => (
  <PremiumPageRoot>
    <TrainingHeroPremiumBlock
      badge="ACADÉMIE PROQUELEC"
      title="Formation PROQUELEC Premium"
      subtitle="Un catalogue clair pour former, évaluer et qualifier les compétences électriques selon le niveau réel des participants."
      duration="2 à 5 jours"
      level="BT / HTA"
      certification="Attestation PROQUELEC"
    />
    <Section>
      <SectionHeader
        badge="PARCOURS"
        title="Choisir le bon module"
        subtitle="Chaque module indique public, prérequis, durée, livrable et niveau d'habilitation."
      />
      <TrainingProgramPremiumBlock />
    </Section>
    <Section backgroundColor={colors.light}>
      <PremiumCardGrid
        accentColor={colors.blue}
        items={[
          {
            icon: '🎯',
            title: 'Analyse du besoin',
            text: 'Postes, missions, exposition au risque et niveau initial.',
          },
          {
            icon: '🧪',
            title: 'Cas pratiques',
            text: 'Manipulation, mesures, consignation et lecture de situations terrain.',
          },
          {
            icon: '🏅',
            title: 'Évaluation',
            text: 'QCM, observation pratique et attestation de fin de session.',
          },
        ]}
      />
    </Section>
    <PricingComparisonPremiumBlock
      title="Construire une session adaptée"
      subtitle="Individuel, groupe ou entreprise : le modèle laisse le webmaster ajuster les offres."
      accentColor={colors.green}
    />
    <ContactPremiumBlock
      title="Planifier une session"
      subtitle="Indiquez le nombre de participants, les profils et les habilitations souhaitées."
      backgroundColor={colors.blueBg}
    />
  </PremiumPageRoot>
);

const renderQualiElecCertificationPremiumPage = () => (
  <PremiumPageRoot>
    <PremiumHero
      badge="CERTIFICATION QUALI-ELEC"
      title="Transformer la conformité en preuve vérifiable"
      subtitle="Un parcours candidat complet : éligibilité, dossier, audit, commission, registre public et renouvellement."
      primaryLabel="Candidater au label"
      accentColor={colors.gold}
      backgroundColor={colors.navy}
    />
    <Section>
      <CertificationRequirementsPremiumBlock
        title="Dossier de certification QUALI-ELEC"
        accentColor={colors.amber}
        resources={[
          {
            type: 'Formulaire',
            title: 'Candidature',
            description: 'Entreprise, responsables, références et engagement qualité.',
            href: '/contact',
            label: 'Démarrer',
          },
          {
            type: 'Preuves',
            title: 'Documents techniques',
            description: 'Assurance, agrément, chantiers, schémas, PV et photos.',
            href: '/ged-publications',
            label: 'Préparer',
          },
          {
            type: 'Audit',
            title: 'Contrôle terrain',
            description: 'Vérification documentaire et inspection des pratiques.',
            href: '/expertises',
            label: 'Comprendre',
          },
        ]}
      />
    </Section>
    <Section backgroundColor={colors.light}>
      <AuditProcessBlock
        title="Cycle de certification"
        subtitle="Une logique traçable du dépôt jusqu'au renouvellement."
        backgroundColor={colors.navy}
        accentColor={colors.gold}
        steps={[
          {
            phase: '01',
            title: 'Pré-qualification',
            description: 'Vérification des critères administratifs et techniques.',
            meta: 'Dossier',
          },
          {
            phase: '02',
            title: 'Audit',
            description: 'Analyse documentaire et contrôle sur référence chantier.',
            meta: 'Terrain',
          },
          {
            phase: '03',
            title: 'Commission',
            description: 'Décision motivée, réserves et compléments éventuels.',
            meta: 'Avis',
          },
          {
            phase: '04',
            title: 'Registre',
            description: 'Publication du statut et suivi du renouvellement.',
            meta: 'Suivi',
          },
        ]}
      />
    </Section>
  </PremiumPageRoot>
);

const renderAwarenessCampaignPremiumPage = () => (
  <PremiumPageRoot>
    <PremiumHero
      badge="CAMPAGNE DE SENSIBILISATION"
      title="Organiser une action terrain mesurable"
      subtitle="Un modèle pour annoncer une campagne, préciser les publics concernés, mobiliser les partenaires et publier un bilan utile."
      primaryLabel="Proposer une campagne"
      accentColor={colors.gold}
    />
    <StatsBlock
      stat1Value="Objectif"
      stat1Label="Risque ciblé"
      stat2Value="Terrain"
      stat2Label="Actions locales"
      stat3Value="Bilan"
      stat3Label="Indicateurs suivis"
      backgroundColor={colors.amberLight}
      accentColor={colors.amber}
    />
    <Section>
      <SectionHeader
        badge="ORGANISATION"
        title="Une campagne doit être cadrée avant publication"
        subtitle="Le webmaster peut renseigner lieu, cible, responsable, partenaires et résultats attendus."
        badgeColor={colors.amber}
      />
      <PremiumCardGrid
        accentColor={colors.amber}
        items={[
          {
            icon: '📍',
            title: 'Lieu et public',
            text: 'Marché, école, collectivité, quartier ou zone professionnelle.',
          },
          {
            icon: '🤝',
            title: 'Partenaires',
            text: 'Responsabilités, relais local, ressources et supports de communication.',
          },
          {
            icon: '📊',
            title: 'Indicateurs',
            text: 'Personnes sensibilisées, sites visités, demandes reçues et suites prévues.',
          },
        ]}
      />
    </Section>
    <Section backgroundColor={colors.light}>
      <AuditProcessBlock
        title="Workflow campagne"
        subtitle="Un parcours opérationnel pour passer de l'annonce au bilan."
        backgroundColor={colors.dark}
        accentColor={colors.gold}
        steps={[
          {
            phase: '01',
            title: 'Objectif',
            description: 'Définir le risque, la cible et le message prioritaire.',
            meta: 'Cadrage',
          },
          {
            phase: '02',
            title: 'Mobilisation',
            description: 'Confirmer lieu, partenaire local, supports et équipe.',
            meta: 'Agenda',
          },
          {
            phase: '03',
            title: 'Action terrain',
            description: 'Sensibiliser, collecter les constats et orienter les demandes.',
            meta: 'Jour J',
          },
          {
            phase: '04',
            title: 'Bilan',
            description: 'Publier chiffres, enseignements et actions de suivi.',
            meta: 'Après',
          },
        ]}
      />
    </Section>
  </PremiumPageRoot>
);

const renderSecurityObservatoryPremiumPage = () => (
  <PremiumPageRoot>
    <PremiumHero
      badge="OBSERVATOIRE SÉCURITÉ"
      title="Piloter les risques électriques par la donnée"
      subtitle="Une page premium pour présenter indicateurs, sources, tendances, cartes et priorités d'action par territoire."
      primaryLabel="Demander un bilan"
      accentColor={colors.blueLight}
      backgroundColor={colors.navy}
    />
    <StatsBlock
      stat1Value="Cartes"
      stat1Label="Territoires"
      stat2Value="Risques"
      stat2Label="Criticité"
      stat3Value="Rapports"
      stat3Label="Publication"
      backgroundColor={colors.blueBg}
      accentColor={colors.blue}
    />
    <Section>
      <SectionHeader
        badge="INDICATEURS"
        title="Des chiffres orientés décision"
        subtitle="Chaque donnée doit afficher sa source, sa date, sa définition et son usage."
      />
      <PremiumCardGrid
        columns={4}
        accentColor={colors.blue}
        items={[
          {
            icon: '✅',
            title: 'Conformité',
            text: 'Taux de dossiers conformes et réserves fréquentes.',
          },
          {
            icon: '⚠️',
            title: 'Incidents',
            text: 'Signalements, zones sensibles et facteurs récurrents.',
          },
          {
            icon: '🎓',
            title: 'Formations',
            text: 'Professionnels formés par région, métier et module.',
          },
          {
            icon: '📣',
            title: 'Campagnes',
            text: 'Sites visités, personnes sensibilisées et suites engagées.',
          },
        ]}
      />
    </Section>
    <Section backgroundColor={colors.light}>
      <ResourceCardsBlock
        title="Tableau de bord public"
        subtitle="Ajoutez cartes, rapports, notes de méthode et exports de synthèse."
        accentColor={colors.blue}
      />
    </Section>
  </PremiumPageRoot>
);

const renderGedResourcesPremiumPage = () => (
  <PremiumPageRoot>
    <PremiumHero
      badge="GED & RESSOURCES PREMIUM"
      title="Centraliser les documents utiles et traçables"
      subtitle="Une bibliothèque claire pour guides, rapports, formulaires, fiches pratiques et ressources de campagne."
      primaryLabel="Demander un document"
      accentColor={colors.purpleLight}
      backgroundColor={colors.dark}
    />
    <Section>
      <SectionHeader
        badge="DOCUMENTATION"
        title="Une GED utile est classée, datée et versionnée"
        subtitle="Le visiteur comprend le statut du document, son public cible et l'usage attendu."
        badgeColor={colors.purple}
      />
      <Grid>
        <ResourceCardsBlock
          title="Guides pratiques"
          subtitle="Fiches prévention, checklists et supports pour ménages, pros et collectivités."
          accentColor={colors.purple}
        />
        <ResourceCardsBlock
          title="Rapports et bilans"
          subtitle="Synthèses de campagne, observatoire, notes d'orientation et retours terrain."
          accentColor={colors.purple}
        />
        <ResourceCardsBlock
          title="Documents techniques"
          subtitle="Référentiels commentés, formulaires et modèles de dossier."
          accentColor={colors.purple}
        />
      </Grid>
    </Section>
    <Section backgroundColor={colors.light}>
      <ComplianceChecklistBlock
        title="Qualité documentaire"
        subtitle="Avant publication, chaque document doit être vérifié et contextualisé."
        accentColor={colors.purple}
        items={[
          {
            status: 'conforme',
            label: 'Titre, version et date',
            detail: 'Le document est identifiable sans ambiguïté.',
          },
          {
            status: 'a verifier',
            label: 'Public cible',
            detail: 'Public, professionnel, collectivité, presse ou interne.',
          },
          {
            status: 'critique',
            label: 'Droits de publication',
            detail: 'Aucun texte normatif protégé ne doit être publié sans autorisation.',
          },
        ]}
      />
    </Section>
  </PremiumPageRoot>
);

const renderQualifiedContactPremiumPage = () => (
  <PremiumPageRoot>
    <ContactPremiumBlock
      title="Contact qualifié PROQUELEC"
      subtitle="Un modèle contact orienté routage : audit, diagnostic ménage, formation, certification, partenariat ou presse."
      backgroundColor={colors.blueBg}
    />
    <Section>
      <SectionHeader
        badge="ROUTAGE"
        title="Diriger chaque demande vers le bon service"
        subtitle="Le contenu aide le visiteur à préparer les bonnes informations dès le premier message."
      />
      <PremiumCardGrid
        columns={4}
        accentColor={colors.blue}
        items={[
          {
            icon: '🛡️',
            title: 'Audit',
            text: 'Site, usage, urgence, documents et interlocuteur technique.',
          },
          {
            icon: '🏠',
            title: 'Ménage',
            text: 'Adresse, photos, symptôme visible et disponibilité.',
          },
          {
            icon: '🎓',
            title: 'Formation',
            text: 'Nombre de participants, profils et habilitations visées.',
          },
          {
            icon: '🏅',
            title: 'Certification',
            text: 'Type de label, entreprise, références et pièces disponibles.',
          },
        ]}
      />
    </Section>
  </PremiumPageRoot>
);

// ══════════════════════════════════════════════
// SECTION TEMPLATES
// ══════════════════════════════════════════════

export const SECTION_TEMPLATES: SectionTemplate[] = [
  // ── HERO ──
  {
    label: 'Hero PROQUELEC Premium',
    description: 'Dégradé thème, image de fond, badge, titre accent or & double CTA',
    emoji: '⚡',
    category: 'hero',
    previewGradient: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.blue} 55%, #1d4ed8 100%)`,
    factory: withErrorBoundary(
      () => (
        <HeroBlock
          badgeText="PROQUELEC — SÉNÉGAL · DEPUIS 1995"
          headline="Promotion de la Qualité des Installations Électriques"
          subheadline="Sécurité · Qualité · Formation — L'organisme national de référence pour la conformité des installations électriques intérieures au Sénégal."
          slidesJson={JSON.stringify([
            {
              id: 'proquelec-premium',
              title: 'Promotion de la Qualité des Installations Électriques',
              subtitle: "Sécurité · Qualité · Formation — L'organisme national de référence.",
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
      'Hero PROQUELEC Premium',
    ),
    meta: { version: 2, estimatedRenderMs: 50, tags: ['hero', 'premium', 'accueil'] },
  },

  {
    label: 'Hero PROQUELEC (éditable)',
    description: 'Hero Craft.js avec champs badge, titre, CTA — synchro slides possible',
    emoji: '🏛️',
    category: 'hero',
    previewGradient: `linear-gradient(135deg, ${colors.dark} 0%, #1e40af 100%)`,
    factory: withErrorBoundary(
      () => (
        <HeroBlock
          badgeText="PROQUELEC — SÉNÉGAL · DEPUIS 1995"
          headline="Promotion de la Qualité des Installations Électriques"
          subheadline="Sécurité · Qualité · Formation — L'organisme national de référence."
          slidesJson="[]"
        />
      ),
      'Hero PROQUELEC (éditable)',
    ),
    meta: { version: 2, estimatedRenderMs: 30, tags: ['hero', 'editable'] },
  },

  {
    label: 'Hero + Statistiques',
    description: 'Bannière institutionnelle puis bandeau de chiffres clés',
    emoji: '🚀',
    category: 'hero',
    previewGradient: `linear-gradient(180deg, ${colors.navy} 0%, ${colors.light} 70%)`,
    factory: withErrorBoundary(
      () => (
        <Element
          is={ContainerBlock}
          canvas
          padding={0}
          backgroundColor={colors.white}
          maxWidth="100%"
        >
          <HeroBlock
            badgeText="Organisme national"
            headline="La qualité électrique, notre engagement"
            subheadline="Depuis 1995, nous œuvrons pour la sécurité électrique au Sénégal."
            slidesJson="[]"
          />
          <Section backgroundColor={colors.light} paddingY={spacing.section}>
            <StatsBlock />
          </Section>
        </Element>
      ),
      'Hero + Statistiques',
    ),
    meta: { version: 2, estimatedRenderMs: 40 },
  },

  {
    label: 'Hero Split Image',
    description: 'Moitié message, moitié visuel — idéal page service',
    emoji: '🖼️',
    category: 'hero',
    previewGradient: `linear-gradient(90deg, ${colors.light} 50%, ${colors.blue} 50%)`,
    factory: withErrorBoundary(
      () => (
        <Element
          is={ContainerBlock}
          canvas
          padding={0}
          backgroundColor={colors.white}
          maxWidth="100%"
        >
          <Element is={ColumnsBlock} canvas columns={2} gap={0}>
            <Element
              is={ContainerBlock}
              canvas
              padding={spacing.section}
              backgroundColor={colors.light}
            >
              <TextBlock
                text="EXPERTISE ÉLECTRIQUE"
                fontSize={parseInt(font.badge)}
                fontWeight="700"
                color={colors.blue}
                extraClasses="uppercase tracking-[0.12em]"
              />
              <SpacerBlock height={spacing.sm} />
              <TextBlock
                text="Sécurisez vos installations électriques"
                fontSize={parseInt(font.h2)}
                fontWeight="900"
                color={colors.dark}
                extraClasses="leading-[1.15]"
              />
              <SpacerBlock height={spacing.md} />
              <TextBlock
                text="PROQUELEC vous accompagne dans la mise en conformité de vos installations résidentielles, tertiaires et industrielles."
                fontSize={parseInt(font.body)}
                color={colors.slate}
                lineHeight="1.7"
              />
              <SpacerBlock height={spacing.lg} />
              <ButtonBlock
                label="Demander un audit"
                href="/contact"
                backgroundColor={colors.blue}
                textColor={colors.white}
                size="lg"
                rounded="xl"
              />
            </Element>
            <Element
              is={ContainerBlock}
              canvas
              padding={0}
              backgroundColor={colors.blue}
              minHeight={400}
            >
              <ImageBlock
                alt="Installation électrique professionnelle"
                url="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1000"
              />
            </Element>
          </Element>
        </Element>
      ),
      'Hero Split Image',
    ),
    meta: { version: 2, estimatedRenderMs: 45 },
  },

  {
    label: 'Hero CTA compact',
    description: "Bandeau court avec appel à l'action",
    emoji: '🎯',
    category: 'hero',
    previewGradient: `linear-gradient(135deg, ${colors.blue}, ${colors.purple})`,
    factory: withErrorBoundary(
      () => (
        <Element
          is={ContainerBlock}
          canvas
          padding={spacing.xxl}
          backgroundColor={colors.blue}
          maxWidth="100%"
        >
          <TextBlock
            text="Prêt à sécuriser vos installations ?"
            fontSize={parseInt(font.h3)}
            textAlign="center"
            fontWeight="800"
            color={colors.white}
          />
          <SpacerBlock height={spacing.sm} />
          <TextBlock
            text="Plus de 500 entreprises et 1 000 professionnels nous font confiance au Sénégal."
            fontSize={parseInt(font.body)}
            textAlign="center"
            color={colors.blueLight}
            lineHeight="1.6"
          />
          <SpacerBlock height={spacing.lg} />
          <ButtonBlock
            label="Demander un contrôle"
            href="/contact"
            backgroundColor={colors.white}
            textColor={colors.blue}
            size="lg"
            rounded="xl"
          />
        </Element>
      ),
      'Hero CTA compact',
    ),
    meta: { version: 2, estimatedRenderMs: 25 },
  },

  {
    label: 'Hero Formation Premium',
    description: 'Hero éditable pour page formation avec niveau, durée, certification et CTA',
    emoji: '🎓',
    category: 'hero',
    previewGradient: `linear-gradient(135deg, #06111f 0%, ${colors.navy} 58%, ${colors.gold} 100%)`,
    factory: withErrorBoundary(() => <TrainingHeroPremiumBlock />, 'Hero Formation Premium'),
    meta: { version: 2, estimatedRenderMs: 35 },
  },

  // ── PAGES PREMIUM ──
  {
    label: 'Page Catalogue Formations Habilitation',
    description: "Page complète avec hero, fiches d'habilitation et tarifs.",
    emoji: '🎓',
    category: 'pages',
    previewGradient: `linear-gradient(180deg, ${colors.navy} 0%, ${colors.blueBg} 42%, ${colors.white} 100%)`,
    factory: withErrorBoundary(
      () => (
        <Element
          is={ContainerBlock}
          canvas
          padding={0}
          backgroundColor={colors.white}
          maxWidth="100%"
        >
          <TrainingHeroPremiumBlock
            badge="FORMATIONS PROQUELEC"
            title="Habilitation Électrique"
            subtitle="Maîtrisez les normes de sécurité pour intervenir sur les installations basse tension."
            duration="21 heures"
            level="Intermédiaire"
            certification="Certificat PROQUELEC"
          />
          <Section backgroundColor={colors.light}>
            <SectionHeader
              badge="NOS HABILITATIONS"
              title="Formations par niveau d'habilitation"
              subtitle="Du non-électricien à l'expert — un parcours adapté à chaque besoin."
            />
            <HabilitationCardsBlock />
          </Section>
          <Section>
            <SectionHeader
              badge="INVESTISSEMENT"
              title="Tarifs des formations"
              subtitle="Financement sur mesure pour les professionnels et les entreprises."
              badgeColor={colors.green}
            />
            <TrainingPricingTableBlock />
          </Section>
        </Element>
      ),
      'Page Catalogue Formations Habilitation',
    ),
    meta: { version: 2, estimatedRenderMs: 60 },
  },

  {
    label: 'Page Qui Sommes-Nous & Gouvernance',
    description: "Structure, missions et conseil d'administration.",
    emoji: '🏛️',
    category: 'pages',
    previewGradient: `linear-gradient(180deg, ${colors.dark} 0%, ${colors.white} 100%)`,
    factory: withErrorBoundary(
      () => (
        <Element
          is={ContainerBlock}
          canvas
          padding={0}
          backgroundColor={colors.white}
          maxWidth="100%"
        >
          <OrganizationStructureBlock />
          <WhyProquelecPremiumBlock subtitle="Une institution au service de la qualité électrique nationale." />
        </Element>
      ),
      'Page Qui Sommes-Nous & Gouvernance',
    ),
    meta: { version: 2, estimatedRenderMs: 35 },
  },

  {
    label: 'Formation PROQUELEC Premium',
    description:
      'Page complete pour presenter modules, publics, prerequis, durees, livrables, tarifs et demande de session.',
    emoji: '🎓',
    category: 'pages',
    previewGradient: `linear-gradient(180deg, #06111f 0%, ${colors.blueBg} 42%, ${colors.white} 100%)`,
    factory: withErrorBoundary(renderTrainingProquelecPremiumPage, 'Formation PROQUELEC Premium'),
    meta: {
      version: 3,
      estimatedRenderMs: 75,
      tags: ['formation', 'habilitation', 'certification', 'catalogue'],
    },
  },

  {
    label: 'Audit Électrique Premium',
    description:
      'Page service complete pour cadrer un audit, expliquer la methode, les livrables, la criticite et la demande de visite.',
    emoji: '🛡️',
    category: 'pages',
    previewGradient: `linear-gradient(180deg, ${colors.dark} 0%, ${colors.blueLight} 45%, ${colors.white} 100%)`,
    factory: withErrorBoundary(renderAuditElectricalPremiumPage, 'Audit Électrique Premium'),
    meta: { version: 3, estimatedRenderMs: 90, tags: ['audit', 'conformite', 'diagnostic'] },
  },

  {
    label: 'Diagnostic Ménage Premium',
    description:
      'Page orientee particuliers avec signaux d alerte, checklist logement, informations a preparer et contact qualifie.',
    emoji: '🏠',
    category: 'pages',
    previewGradient: `linear-gradient(180deg, ${colors.navy} 0%, #ecfdf5 52%, ${colors.white} 100%)`,
    factory: withErrorBoundary(renderHouseholdDiagnosticPremiumPage, 'Diagnostic Ménage Premium'),
    meta: {
      version: 1,
      estimatedRenderMs: 70,
      tags: ['menage', 'diagnostic', 'securite domestique'],
    },
  },

  {
    label: 'Certification QUALI-ELEC Premium',
    description:
      'Page complete pour expliquer candidature, dossier, audit, commission, registre public et renouvellement.',
    emoji: '🏅',
    category: 'pages',
    previewGradient: `linear-gradient(180deg, ${colors.navy} 0%, ${colors.amberLight} 48%, ${colors.white} 100%)`,
    factory: withErrorBoundary(
      renderQualiElecCertificationPremiumPage,
      'Certification QUALI-ELEC Premium',
    ),
    meta: { version: 3, estimatedRenderMs: 70, tags: ['certification', 'quali-elec', 'label'] },
  },

  {
    label: 'Campagne de Sensibilisation Premium',
    description:
      'Page evenement terrain avec objectif, public, partenaires, indicateurs et bilan post-campagne.',
    emoji: '📣',
    category: 'pages',
    previewGradient: `linear-gradient(180deg, ${colors.dark} 0%, ${colors.amberLight} 52%, ${colors.white} 100%)`,
    factory: withErrorBoundary(
      renderAwarenessCampaignPremiumPage,
      'Campagne de Sensibilisation Premium',
    ),
    meta: { version: 1, estimatedRenderMs: 75, tags: ['campagne', 'sensibilisation', 'evenement'] },
  },

  {
    label: 'Observatoire Sécurité Premium',
    description:
      'Page tableau de bord pour presenter indicateurs, sources, risques, cartes, rapports et priorites publiques.',
    emoji: '📊',
    category: 'pages',
    previewGradient: `linear-gradient(180deg, ${colors.navy} 0%, ${colors.blueBg} 50%, ${colors.white} 100%)`,
    factory: withErrorBoundary(
      renderSecurityObservatoryPremiumPage,
      'Observatoire Sécurité Premium',
    ),
    meta: { version: 1, estimatedRenderMs: 75, tags: ['observatoire', 'donnees', 'risques'] },
  },

  {
    label: 'Contact Qualifié Premium',
    description:
      'Page contact avancee pour router les demandes audit, menage, formation, certification, partenariat ou presse.',
    emoji: '📬',
    category: 'pages',
    previewGradient: `linear-gradient(180deg, ${colors.light} 0%, ${colors.blueLight} 55%, ${colors.white} 100%)`,
    factory: withErrorBoundary(renderQualifiedContactPremiumPage, 'Contact Qualifié Premium'),
    meta: { version: 3, estimatedRenderMs: 55, tags: ['contact', 'routage', 'formulaire'] },
  },

  {
    label: 'GED / Ressources Premium',
    description:
      'Bibliotheque premium pour guides, rapports, normes commentees, formulaires, versions et droits de publication.',
    emoji: '📚',
    category: 'pages',
    previewGradient: `linear-gradient(180deg, ${colors.white} 0%, ${colors.blueBg} 50%, #e0f2fe 100%)`,
    factory: withErrorBoundary(renderGedResourcesPremiumPage, 'GED / Ressources Premium'),
    meta: { version: 3, estimatedRenderMs: 75, tags: ['ged', 'ressources', 'documents'] },
  },

  // ── CONTENT ──
  {
    label: 'Section Solutions par Public',
    description: 'Onglets ciblés pour Professionnels, Syndics, etc.',
    emoji: '👥',
    category: 'content',
    previewGradient: `linear-gradient(90deg, ${colors.white} 0%, ${colors.light} 100%)`,
    factory: withErrorBoundary(() => <TargetAudienceTabsBlock />, 'Section Solutions par Public'),
    meta: { version: 2, estimatedRenderMs: 40 },
  },

  {
    label: 'Section Bilan & Références',
    description: 'Statistiques et chiffres clés de PROQUELEC.',
    emoji: '📊',
    category: 'trust',
    previewGradient: `linear-gradient(90deg, ${colors.navy} 0%, #1d4ed8 100%)`,
    factory: withErrorBoundary(() => <ReferenceStatsBlock />, 'Section Bilan & Références'),
    meta: { version: 2, estimatedRenderMs: 25 },
  },

  {
    label: 'Section Services Premium',
    description: '3 cartes avec en-tête badge + fond dégradé léger',
    emoji: '⚡',
    category: 'content',
    previewGradient: `linear-gradient(180deg, ${colors.blueBg} 0%, ${colors.light} 100%)`,
    factory: withErrorBoundary(
      () => (
        <Section backgroundColor={colors.light}>
          <SectionHeader
            badge="NOS SERVICES"
            title="Des solutions pour chaque besoin"
            subtitle="De la formation à l'audit, PROQUELEC vous accompagne."
          />
          <Grid>
            <CardBlock
              icon="📚"
              title="Formations"
              text="Habilitations électriques certifiantes pour tous les niveaux."
              {...cardPresets.blue}
            />
            <CardBlock
              icon="🛡️"
              title="Audits"
              text="Vérifications de conformité et diagnostics de sécurité."
              {...cardPresets.blue}
            />
            <CardBlock
              icon="⚡"
              title="Certifications"
              text="Labels de qualité pour les installations conformes."
              {...cardPresets.blue}
            />
          </Grid>
        </Section>
      ),
      'Section Services Premium',
    ),
    meta: { version: 2, estimatedRenderMs: 35 },
  },

  {
    label: 'Section Pourquoi PROQUELEC',
    description:
      'Argumentaire institutionnel premium : sécurité, qualité, expertise et accompagnement',
    emoji: '🏛️',
    category: 'content',
    previewGradient: `linear-gradient(135deg, ${colors.white} 0%, ${colors.blueBg} 55%, ${colors.amberLight} 100%)`,
    factory: withErrorBoundary(
      () => (
        <WhyProquelecPremiumBlock subtitle="Une section prête pour expliquer la valeur de l'organisme sur les pages institutionnelles et services." />
      ),
      'Section Pourquoi PROQUELEC',
    ),
    meta: { version: 2, estimatedRenderMs: 30 },
  },

  {
    label: 'Section 2 colonnes + image',
    description: 'Texte à gauche, zone visuelle à droite',
    emoji: '📐',
    category: 'content',
    previewGradient: `linear-gradient(90deg, ${colors.white} 45%, #e2e8f0 45%)`,
    factory: withErrorBoundary(
      () => (
        <Element
          is={ContainerBlock}
          canvas
          padding={0}
          backgroundColor={colors.white}
          maxWidth="100%"
        >
          <Element is={ColumnsBlock} canvas columns={2} gap={spacing.section}>
            <Element is={ContainerBlock} canvas padding={spacing.section}>
              <TextBlock
                text="Pourquoi PROQUELEC ?"
                fontSize={parseInt(font.h2)}
                fontWeight="900"
                color={colors.dark}
                extraClasses="leading-[1.15]"
              />
              <SpacerBlock height={spacing.sm} />
              <TextBlock
                text="Depuis 1995, PROQUELEC est l'organisme national de référence pour la qualité des installations électriques au Sénégal."
                fontSize={parseInt(font.body)}
                color={colors.slate}
                lineHeight="1.7"
              />
              <SpacerBlock height={spacing.md} />
              <ButtonBlock
                label="En savoir plus"
                href="/about"
                backgroundColor={colors.blue}
                textColor={colors.white}
                size="md"
                rounded="lg"
              />
            </Element>
            <Element is={ContainerBlock} canvas padding={0} minHeight={400}>
              <ImageBlock
                alt="Équipe PROQUELEC"
                url="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800"
              />
            </Element>
          </Element>
        </Element>
      ),
      'Section 2 colonnes + image',
    ),
    meta: { version: 2, estimatedRenderMs: 40 },
  },

  {
    label: 'FAQ Premium',
    description: 'FAQ métier avec introduction, catégories et questions éditables',
    emoji: '❓',
    category: 'content',
    previewGradient: `linear-gradient(180deg, ${colors.white} 0%, ${colors.blueBg} 100%)`,
    factory: withErrorBoundary(
      () => (
        <FAQPremiumBlock
          title="Réponses aux questions fréquentes"
          subtitle="Une section premium pour réduire les frictions avant contact ou inscription."
        />
      ),
      'FAQ Premium',
    ),
    meta: { version: 2, estimatedRenderMs: 30 },
  },

  {
    label: 'Section FAQ',
    description: 'Questions fréquentes sur fond blanc épuré',
    emoji: '❓',
    category: 'content',
    previewGradient: `linear-gradient(180deg, ${colors.white}, ${colors.light})`,
    factory: withErrorBoundary(
      () => (
        <Section>
          <TextBlock
            text="FAQ"
            fontSize={parseInt(font.h3)}
            textAlign="center"
            fontWeight="800"
            color={colors.dark}
          />
          <SpacerBlock height={spacing.lg} />
          <AccordionBlock />
        </Section>
      ),
      'Section FAQ',
    ),
    meta: { version: 2, estimatedRenderMs: 25 },
  },

  {
    label: 'Section Étapes',
    description: 'Processus en 4 étapes numérotées',
    emoji: '📋',
    category: 'content',
    previewGradient: `linear-gradient(135deg, ${colors.light}, #e0e7ff)`,
    factory: withErrorBoundary(
      () => (
        <Section backgroundColor={colors.light}>
          <SectionHeader
            badge="PROCESSUS"
            title="Comment ça marche ?"
            subtitle="Un accompagnement en 4 étapes simples."
          />
          <StepsBlock />
        </Section>
      ),
      'Section Étapes',
    ),
    meta: { version: 2, estimatedRenderMs: 30 },
  },

  // ── OPERATIONS ──
  {
    label: 'Pack Audit Conformité',
    description: "Processus d'audit + checklist technique prête pour une page service",
    emoji: '🛡️',
    category: 'operations',
    previewGradient: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.navy} 70%, ${colors.gold} 100%)`,
    factory: withErrorBoundary(
      () => (
        <Section backgroundColor={colors.dark} paddingY={spacing.xxl}>
          <TextBlock
            text="AUDIT DE CONFORMITÉ"
            fontSize={parseInt(font.badge)}
            textAlign="center"
            fontWeight="700"
            color={colors.gold}
            extraClasses="uppercase tracking-[0.15em]"
          />
          <SpacerBlock height={spacing.sm} />
          <TextBlock
            text="Sécurisez votre installation électrique"
            fontSize={parseInt(font.h3)}
            textAlign="center"
            fontWeight="800"
            color={colors.white}
          />
          <SpacerBlock height={spacing.md} />
          <TextBlock
            text="Un diagnostic complet réalisé par nos experts certifiés."
            fontSize={parseInt(font.bodySm)}
            textAlign="center"
            color={colors.slateLight}
          />
          <SpacerBlock height={spacing.lg} />
          <AuditProcessBlock />
        </Section>
      ),
      'Pack Audit Conformité',
    ),
    meta: { version: 2, estimatedRenderMs: 35 },
  },

  {
    label: 'Checklist Contrôle',
    description: 'Carte conformité éditable avec statuts conforme / à vérifier / critique',
    emoji: '✅',
    category: 'operations',
    previewGradient: `linear-gradient(180deg, #ecfdf5 0%, ${colors.blueBg} 100%)`,
    factory: withErrorBoundary(
      () => (
        <Section backgroundColor="#ecfdf5">
          <ComplianceChecklistBlock
            title="Préparer le contrôle PROQUELEC"
            subtitle="Utilisez cette checklist pour clarifier les prérequis avant intervention."
            accentColor={colors.green}
          />
        </Section>
      ),
      'Checklist Contrôle',
    ),
    meta: { version: 2, estimatedRenderMs: 30 },
  },

  {
    label: 'Centre Ressources',
    description: "Guides, formulaires et normes sous forme de cartes d'accès rapide",
    emoji: '📚',
    category: 'operations',
    previewGradient: `linear-gradient(135deg, ${colors.white} 0%, ${colors.blueLight} 100%)`,
    factory: withErrorBoundary(
      () => (
        <Section>
          <SectionHeader
            badge="RESSOURCES"
            title="Centre de ressources"
            subtitle="Tout ce dont vous avez besoin pour vos projets électriques."
            badgeColor={colors.blue}
          />
          <Grid>
            <ResourceCardsBlock
              title="Guides techniques"
              subtitle="Manuels et guides d'installation conformes aux normes."
              accentColor={colors.blue}
            />
            <FileDownloadBlock />
            <ResourceCardsBlock
              title="Normes en vigueur"
              subtitle="NS 01-001, NS 01-001 et référentiels associés."
              accentColor={colors.blue}
            />
          </Grid>
        </Section>
      ),
      'Centre Ressources',
    ),
    meta: { version: 2, estimatedRenderMs: 35 },
  },

  {
    label: 'Bandeau Mise en conformité',
    description: 'CTA métier + ressources pour orienter vers contact ou documents',
    emoji: '⚙️',
    category: 'operations',
    previewGradient: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.blue} 100%)`,
    factory: withErrorBoundary(
      () => (
        <Section backgroundColor={colors.blue} paddingY={spacing.xxl}>
          <TextBlock
            text="Vous avez des réserves à lever ?"
            fontSize={parseInt(font.h3)}
            textAlign="center"
            fontWeight="800"
            color={colors.white}
          />
          <SpacerBlock height={spacing.sm} />
          <TextBlock
            text="Nos équipes vous accompagnent dans la priorisation des corrections."
            fontSize={parseInt(font.body)}
            textAlign="center"
            color={colors.blueLight}
          />
          <SpacerBlock height={spacing.lg} />
          <ButtonBlock
            label="Contacter un expert"
            href="/contact"
            backgroundColor={colors.white}
            textColor={colors.navy}
            size="lg"
            rounded="xl"
          />
        </Section>
      ),
      'Bandeau Mise en conformité',
    ),
    meta: { version: 2, estimatedRenderMs: 25 },
  },

  // ── CONVERSION ──
  {
    label: 'Section Contact Premium',
    description: 'Formulaire centré avec fond doux',
    emoji: '📬',
    category: 'conversion',
    previewGradient: `linear-gradient(180deg, ${colors.blueBg}, ${colors.white})`,
    factory: withErrorBoundary(
      () => (
        <ContactPremiumBlock
          title="Échangeons sur votre projet"
          subtitle="Réponse sous 24 h ouvrées pour orienter votre demande vers le bon service."
          backgroundColor={colors.blueBg}
        />
      ),
      'Section Contact Premium',
    ),
    meta: { version: 2, estimatedRenderMs: 30 },
  },

  {
    label: 'Section Tarifs',
    description: 'Grille tarifaire 3 colonnes',
    emoji: '💰',
    category: 'conversion',
    previewGradient: `linear-gradient(135deg, #ecfdf5, #f0fdf4)`,
    factory: withErrorBoundary(
      () => (
        <PricingComparisonPremiumBlock
          title="Tarifs transparents"
          subtitle="Choisissez la formule adaptée à votre structure."
          accentColor={colors.green}
        />
      ),
      'Section Tarifs',
    ),
    meta: { version: 2, estimatedRenderMs: 35 },
  },

  {
    label: 'Comparatif Offres / Tarifs',
    description: 'Comparatif premium pour débutant, intermédiaire, avancé et entreprise',
    emoji: '💼',
    category: 'conversion',
    previewGradient: `linear-gradient(135deg, ${colors.light} 0%, ${colors.blueLight} 50%, #fff7ed 100%)`,
    factory: withErrorBoundary(
      () => (
        <PricingComparisonPremiumBlock
          title="Choisir le bon accompagnement"
          subtitle="Un modèle clair pour comparer les niveaux, les prix et les usages."
          plans={[
            {
              name: 'Débutant',
              price: 'Gratuit',
              description: 'Pour découvrir les bases.',
              features: ['Accès aux normes gratuites', 'Calculateur de base', 'Consultation blog'],
              buttonText: "S'inscrire",
              href: '/auth/register',
              featured: false,
            },
            {
              name: 'Pro',
              price: '15 000 FCFA/mois',
              description: 'Pour les professionnels.',
              features: [
                'Normes complètes',
                'Calculateurs avancés',
                'Diagnostic IA',
                'Certification',
              ],
              buttonText: 'Choisir Pro',
              href: '/auth/register',
              featured: true,
            },
            {
              name: 'Expert',
              price: '50 000 FCFA/mois',
              description: 'Pour les experts.',
              features: [
                'Accès illimité',
                'API & intégration',
                'Support prioritaire',
                'Audit complet',
              ],
              buttonText: 'Choisir Expert',
              href: '/auth/register',
              featured: false,
            },
            {
              name: 'Entreprise',
              price: 'Sur devis',
              description: 'Solution sur-mesure.',
              features: ['Multi-utilisateurs', 'API dédiée', 'SLA garanti', 'Formation équipe'],
              buttonText: 'Nous contacter',
              href: '/contact',
              featured: false,
            },
          ]}
        />
      ),
      'Comparatif Offres / Tarifs',
    ),
    meta: { version: 2, estimatedRenderMs: 50 },
  },

  {
    label: 'Bannière CTA large',
    description: "Appel à l'action pleine largeur",
    emoji: '🎯',
    category: 'conversion',
    previewGradient: `linear-gradient(135deg, ${colors.blue}, #1d4ed8)`,
    factory: withErrorBoundary(
      () => (
        <CallToActionBlock
          title="Prêt à sécuriser vos installations ?"
          description="Plus de 500 entreprises et artisans nous font confiance au Sénégal."
          buttonText="Demander un contrôle"
          href="/contact"
          backgroundColor={colors.blue}
          textColor={colors.white}
          buttonBg={colors.white}
          buttonTextColor={colors.blue}
        />
      ),
      'Bannière CTA large',
    ),
    meta: { version: 2, estimatedRenderMs: 25 },
  },

  {
    label: 'Newsletter',
    description: 'Inscription actualités & normes',
    emoji: '📧',
    category: 'conversion',
    previewGradient: `linear-gradient(135deg, #1e40af, ${colors.blue})`,
    factory: withErrorBoundary(
      () => (
        <Section backgroundColor={colors.blue} paddingY={spacing.xxl}>
          <TextBlock
            text="Restez informé"
            fontSize={parseInt(font.h3)}
            textAlign="center"
            fontWeight="800"
            color={colors.white}
          />
          <SpacerBlock height={spacing.xs} />
          <TextBlock
            text="Recevez nos actualités, normes et conseils techniques."
            fontSize={parseInt(font.body)}
            textAlign="center"
            color={colors.blueLight}
          />
          <SpacerBlock height={spacing.lg} />
          <NewsletterBlock />
        </Section>
      ),
      'Newsletter',
    ),
    meta: { version: 2, estimatedRenderMs: 30 },
  },

  {
    label: 'Compte à rebours',
    description: 'Événement ou session de formation à venir',
    emoji: '⏱️',
    category: 'conversion',
    previewGradient: `linear-gradient(180deg, ${colors.dark}, #334155)`,
    factory: withErrorBoundary(
      () => (
        <Section backgroundColor={colors.dark}>
          <TextBlock
            text="Événement à venir"
            fontSize={parseInt(font.h3)}
            textAlign="center"
            fontWeight="800"
            color={colors.white}
          />
          <SpacerBlock height={spacing.lg} />
          <CountdownBlock
            targetDate="2026-12-31T23:59:59"
            label="Prochaine session de certification"
          />
        </Section>
      ),
      'Compte à rebours',
    ),
    meta: { version: 2, estimatedRenderMs: 25 },
  },

  // ── MEDIA ──
  {
    label: 'Galerie projets',
    description: 'Grille photos installations',
    emoji: '🖼️',
    category: 'media',
    previewGradient: `linear-gradient(180deg, ${colors.light}, #cbd5e1)`,
    factory: withErrorBoundary(
      () => (
        <Section backgroundColor={colors.light}>
          <SectionHeader
            badge="RÉALISATIONS"
            title="Nos projets"
            subtitle="Découvrez nos réalisations en images."
          />
          <GalleryBlock />
        </Section>
      ),
      'Galerie projets',
    ),
    meta: { version: 2, estimatedRenderMs: 35 },
  },

  {
    label: 'Équipe',
    description: 'Grille membres avec rôles',
    emoji: '👥',
    category: 'media',
    previewGradient: `linear-gradient(135deg, #fafafa, #e2e8f0)`,
    factory: withErrorBoundary(
      () => (
        <Section>
          <SectionHeader
            badge="NOTRE ÉQUIPE"
            title="Des experts à votre service"
            subtitle="Une équipe passionnée au service de la qualité électrique."
          />
          <TeamMembersGridBlock />
        </Section>
      ),
      'Équipe',
    ),
    meta: { version: 2, estimatedRenderMs: 30 },
  },

  {
    label: 'Timeline institutionnelle',
    description: 'Historique PROQUELEC',
    emoji: '📅',
    category: 'media',
    previewGradient: `linear-gradient(90deg, ${colors.blueLight} 0%, ${colors.white} 100%)`,
    factory: withErrorBoundary(
      () => (
        <Section backgroundColor={colors.blueLight}>
          <SectionHeader
            badge="HISTORIQUE"
            title="L'histoire de PROQUELEC"
            subtitle="Depuis 1995, un engagement constant pour la sécurité électrique."
          />
          <TimelineBlock />
        </Section>
      ),
      'Timeline institutionnelle',
    ),
    meta: { version: 2, estimatedRenderMs: 30 },
  },

  // ── TRUST ──
  {
    label: 'Témoignages Premium',
    description: 'Avis clients premium avec note, carrousel et preuves de confiance',
    emoji: '⭐',
    category: 'trust',
    previewGradient: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.navy} 62%, ${colors.gold} 100%)`,
    factory: withErrorBoundary(
      () => (
        <TestimonialsPremiumBlock
          title="Des professionnels accompagnés avec méthode"
          subtitle="Un template premium pour valoriser les retours d'expérience, les notes et les preuves institutionnelles."
        />
      ),
      'Témoignages Premium',
    ),
    meta: { version: 2, estimatedRenderMs: 30 },
  },

  {
    label: 'Témoignages',
    description: 'Avis clients sur fond sombre premium',
    emoji: '💬',
    category: 'trust',
    previewGradient: `linear-gradient(135deg, ${colors.dark}, #1e293b)`,
    factory: withErrorBoundary(
      () => (
        <TestimonialsPremiumBlock
          title="Ils nous font confiance"
          subtitle="Avis clients et preuves de confiance sur fond institutionnel sombre."
          accentColor="#818cf8"
        />
      ),
      'Témoignages',
    ),
    meta: { version: 2, estimatedRenderMs: 30 },
  },

  {
    label: 'Chiffres clés',
    description: 'KPIs sur fond institutionnel',
    emoji: '📊',
    category: 'trust',
    previewGradient: `linear-gradient(135deg, ${colors.navy}, ${colors.dark})`,
    factory: withErrorBoundary(
      () => (
        <Section backgroundColor={colors.navy} paddingY={spacing.xxl}>
          <TextBlock
            text="PROQUELEC EN CHIFFRES"
            fontSize={parseInt(font.badge)}
            textAlign="center"
            fontWeight="700"
            color={colors.gold}
            extraClasses="uppercase tracking-[0.15em]"
          />
          <SpacerBlock height={spacing.sm} />
          <TextBlock
            text="Notre impact"
            fontSize={parseInt(font.h3)}
            textAlign="center"
            fontWeight="800"
            color={colors.white}
          />
          <SpacerBlock height={spacing.lg} />
          <StatsBlock />
        </Section>
      ),
      'Chiffres clés',
    ),
    meta: { version: 2, estimatedRenderMs: 30 },
  },

  {
    label: 'Logos partenaires',
    description: 'Bandeau « Ils nous font confiance »',
    emoji: '🤝',
    category: 'trust',
    previewGradient: `linear-gradient(180deg, ${colors.light}, #e2e8f0)`,
    factory: withErrorBoundary(
      () => (
        <Section backgroundColor={colors.light}>
          <TextBlock
            text="ILS NOUS FONT CONFIANCE"
            fontSize={parseInt(font.badge)}
            textAlign="center"
            fontWeight="700"
            color={colors.slate}
            extraClasses="uppercase tracking-[0.15em]"
          />
          <SpacerBlock height={spacing.lg} />
          <LogoGridBlock />
        </Section>
      ),
      'Logos partenaires',
    ),
    meta: { version: 2, estimatedRenderMs: 25 },
  },

  // ── SPECIAL: Catalogue complet ──
  {
    label: 'Catalogue Outils par Thème',
    description: 'Grille premium listant tous les outils PROQUELEC par thématique.',
    emoji: '🧰',
    category: 'content',
    previewGradient: `linear-gradient(180deg, ${colors.dark} 0%, ${colors.navy} 30%, ${colors.blue} 70%, ${colors.light} 100%)`,
    factory: withErrorBoundary(
      () => (
        <Element
          is={ContainerBlock}
          canvas
          padding={0}
          backgroundColor={colors.white}
          maxWidth="100%"
        >
          {/* HERO */}
          <Section backgroundColor={colors.dark} paddingY={spacing.hero}>
            <TextBlock
              text="CATALOGUE OUTILS"
              fontSize={parseInt(font.badge)}
              textAlign="center"
              fontWeight="800"
              color={colors.gold}
              extraClasses="uppercase tracking-widest"
            />
            <SpacerBlock height={spacing.sm} />
            <TextBlock
              text="Tous les outils PROQUELEC"
              fontSize={parseInt(font.h1)}
              textAlign="center"
              fontWeight="900"
              color={colors.white}
            />
            <SpacerBlock height={spacing.sm} />
            <TextBlock
              text="Simulateurs, diagnostics, devis, normes et guides."
              fontSize={parseInt(font.body)}
              textAlign="center"
              color={colors.slateLight}
              lineHeight="1.7"
            />
            <SpacerBlock height={spacing.lg} />
            <StatsBlock />
          </Section>

          {/* Thème 1 : Calculateurs */}
          <Section backgroundColor={colors.light}>
            <SectionHeader
              badge="CALCULATEURS & SIMULATEURS"
              title="Des outils techniques pour dimensionner et calculer"
              subtitle="Dimensionnez, simulez et optimisez vos installations."
            />
            <Grid columns={3} gap={spacing.lg}>
              <CardBlock
                icon="📊"
                title="Simulateur Consommation"
                text="Estimez la consommation selon surface, occupants et équipements."
                {...cardPresets.blue}
              />
              <CardBlock
                icon="📏"
                title="Dimensionnement Câbles"
                text="Section de câble optimale selon puissance, longueur et matériau."
                {...cardPresets.blue}
              />
              <CardBlock
                icon="⚡"
                title="Chute de Tension"
                text="Calcul normé selon NS 01-001 pour installations BT."
                {...cardPresets.blue}
              />
              <CardBlock
                icon="☀️"
                title="Dimensionnement Solaire"
                text="Panneaux, batteries et régulateur selon votre consommation."
                {...cardPresets.blue}
              />
              <CardBlock
                icon="💡"
                title="Calculateur Éclairage"
                text="Éclairement en lux pour vos espaces intérieurs et extérieurs."
                {...cardPresets.blue}
              />
              <CardBlock
                icon="🔄"
                title="Convertisseur Unités"
                text="Tensions, courants, puissances et fréquences en un clic."
                {...cardPresets.blue}
              />
            </Grid>
          </Section>

          {/* Thème 2 : Diagnostic */}
          <Section>
            <SectionHeader
              badge="DIAGNOSTIC & SÉCURITÉ"
              title="Évaluez, vérifiez et sécurisez"
              subtitle="Des outils de diagnostic pour une sécurité maximale."
              badgeColor={colors.green}
            />
            <Grid columns={3} gap={spacing.lg}>
              <CardBlock
                icon="🩺"
                title="Diagnostic Interactif"
                text="Guide pas à pas avec génération de rapport."
                {...cardPresets.green}
              />
              <CardBlock
                icon="✅"
                title="Checklist Sécurité"
                text="13 points de contrôle notés pour évaluer la conformité."
                {...cardPresets.green}
              />
              <CardBlock
                icon="🛡️"
                title="Vérification Terre"
                text="Contrôle de la prise de terre NS 01-001."
                {...cardPresets.green}
              />
              <CardBlock
                icon="🌍"
                title="Guide Terre & Différentiel"
                text="Principes, calculs et tableaux de référence."
                {...cardPresets.green}
              />
            </Grid>
          </Section>

          {/* Thème 3 : Devis */}
          <Section backgroundColor={colors.light}>
            <SectionHeader
              badge="DEVIS & DOCUMENTS"
              title="Générez et gérez vos documents"
              subtitle="Devis, labels et documents techniques."
              badgeColor={colors.amber}
            />
            <Grid columns={3} gap={spacing.lg}>
              <CardBlock
                icon="📄"
                title="Générateur de Devis"
                text="Devis professionnels avec catalogue et QR code."
                {...cardPresets.amber}
              />
              <CardBlock
                icon="📚"
                title="Bibliothèque Documents"
                text="Guides techniques et mémentos électriques."
                {...cardPresets.amber}
              />
              <CardBlock
                icon="🏷️"
                title="Label Qualité"
                text="Demande de certification Bronze, Argent, Or."
                {...cardPresets.amber}
              />
            </Grid>
          </Section>

          {/* Thème 4 : Normes */}
          <Section>
            <SectionHeader
              badge="NORMES & RÉFÉRENCES"
              title="Consultez les textes de référence"
              subtitle="Base complète de normes électriques."
              badgeColor={colors.purple}
            />
            <Grid columns={3} gap={spacing.lg}>
              <CardBlock
                icon="🗄️"
                title="Base Normative"
                text="NS 01-001, NS 01-001, IEC et tableaux de câbles."
                {...cardPresets.purple}
              />
            </Grid>
          </Section>

          {/* CTA Final */}
          <Section backgroundColor={colors.blue} paddingY={spacing.xxl}>
            <TextBlock
              text="Accédez à tous les outils"
              fontSize={parseInt(font.h3)}
              textAlign="center"
              fontWeight="800"
              color={colors.white}
            />
            <SpacerBlock height={spacing.sm} />
            <TextBlock
              text="Plateforme d'ingénierie électrotechnique souveraine."
              fontSize={parseInt(font.body)}
              textAlign="center"
              color={colors.blueLight}
            />
            <SpacerBlock height={spacing.lg} />
            <ButtonBlock
              label="Explorer les outils"
              href="/outils"
              backgroundColor={colors.white}
              textColor={colors.navy}
              size="lg"
              rounded="xl"
            />
          </Section>
        </Element>
      ),
      'Catalogue Outils par Thème',
    ),
    meta: { version: 2, estimatedRenderMs: 120, tags: ['catalogue', 'outils', 'complet'] },
  },
];

