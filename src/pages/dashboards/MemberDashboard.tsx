import { FileText, Globe, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { RoleWorkspaceDashboard } from '@/components/functional/RoleWorkspaceDashboard';

export default function MemberDashboard() {
  return (
    <RoleWorkspaceDashboard
      navTheme="member"
      accent="indigo"
      eyebrow="Espace membre"
      title="Transformez la veille et la gouvernance en décisions suivies."
      subtitle="Un espace de coordination pour suivre les initiatives, consulter les rapports et garder une vision claire de l’activité PROQUELEC."
      icon={Globe}
      primaryAction={{ label: 'Lancer une initiative', route: '/projects' }}
      modules={[
        {
          title: 'Initiatives suivies',
          description: 'Regroupez les projets stratégiques, commissions et actions terrain.',
          icon: Users,
          route: '/projects',
          badge: 'Gouvernance',
          tone: 'indigo',
        },
        {
          title: 'Rapports sectoriels',
          description: 'Consultez les documents, bilans et pièces utiles à la décision.',
          icon: FileText,
          route: '/ged',
          tone: 'slate',
        },
        {
          title: 'Commission normes',
          description: 'Accédez aux ressources techniques et aux supports de veille normative.',
          icon: ShieldCheck,
          route: '/expert-lab/docs',
          tone: 'blue',
        },
        {
          title: 'Académie membre',
          description: 'Repérez les contenus de formation et ressources pédagogiques prioritaires.',
          icon: GraduationCap,
          route: '/formations',
          tone: 'amber',
        },
      ]}
      signals={[
        {
          title: 'Décisions traçables',
          detail: 'Chaque initiative peut être reliée à des dossiers, documents et justifications.',
          tone: 'success',
        },
        {
          title: 'Veille consolidée',
          detail: 'Les signaux métier remontent depuis les projets et la documentation technique.',
          tone: 'info',
        },
        {
          title: 'Points d’attention',
          detail: 'Les dossiers en revue ou à risque doivent être inscrits à l’ordre du jour.',
          tone: 'warning',
        },
      ]}
      premiumTitle="Gouvernance plus lisible"
      premiumText="Centralisez les preuves, rapports et indicateurs pour préparer les réunions et arbitrages avec plus de rigueur."
    />
  );
}
