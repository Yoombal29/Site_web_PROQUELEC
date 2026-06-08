import { Award, BarChart3, FileText, ShieldCheck, Users } from 'lucide-react';
import { RoleWorkspaceDashboard } from '@/components/functional/RoleWorkspaceDashboard';

export default function CompanyDashboard() {
  return (
    <RoleWorkspaceDashboard
      navTheme="company"
      accent="blue"
      eyebrow="Espace entreprise"
      title="Centralisez vos équipes, labels et dossiers de conformité."
      subtitle="Un tableau de pilotage pour organiser les audits, suivre les renouvellements et documenter la qualité électrique de vos chantiers."
      icon={ShieldCheck}
      primaryAction={{ label: 'Ouvrir un dossier entreprise', route: '/projects' }}
      modules={[
        {
          title: 'Portefeuille chantiers',
          description: 'Visualisez les dossiers ouverts, statuts de revue et risques de non-conformité.',
          icon: BarChart3,
          route: '/projects',
          badge: 'Pilotage',
          tone: 'blue',
        },
        {
          title: 'Équipes & preuves',
          description: 'Rassemblez documents, qualifications et rapports techniques dans un espace unique.',
          icon: Users,
          route: '/ged',
          tone: 'slate',
        },
        {
          title: 'Labels & audits',
          description: 'Préparez les éléments demandés pour certification, renouvellement et contrôle.',
          icon: Award,
          route: '/certifications',
          badge: 'Qualité',
          tone: 'amber',
        },
        {
          title: 'Documents entreprise',
          description: 'Accédez aux rapports, modèles et justificatifs administratifs.',
          icon: FileText,
          route: '/documents',
          tone: 'emerald',
        },
      ]}
      signals={[
        {
          title: 'Visibilité annuaire',
          detail: 'Un profil documenté améliore la crédibilité et la sélection par les maîtres d’ouvrage.',
          tone: 'success',
        },
        {
          title: 'Renouvellements',
          detail: 'Les labels doivent être anticipés avec preuves chantier et historique des audits.',
          tone: 'info',
        },
        {
          title: 'Risque portefeuille',
          detail: 'Les dossiers sans score ou avec score faible doivent être revus avant publication.',
          tone: 'warning',
        },
      ]}
      premiumTitle="Une vitrine qualité plus crédible"
      premiumText="Structurez vos preuves de conformité, suivez vos labels et préparez des rapports d’entreprise exploitables."
    />
  );
}
