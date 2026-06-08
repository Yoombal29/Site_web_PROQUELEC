import { BookOpen, Calculator, FileText, PenTool, Zap } from 'lucide-react';
import { RoleWorkspaceDashboard } from '@/components/functional/RoleWorkspaceDashboard';

export default function ElectricianDashboard() {
  return (
    <RoleWorkspaceDashboard
      navTheme="electrician"
      accent="emerald"
      eyebrow="Espace électricien"
      title="Pilotez vos calculs, audits et preuves chantier sans perdre le fil."
      subtitle="Un espace opérationnel pour suivre la conformité NS 01-001, préparer les contrôles et produire les justificatifs techniques attendus."
      icon={Zap}
      primaryAction={{ label: 'Créer un dossier audit', route: '/projects' }}
      modules={[
        {
          title: 'Calculs normatifs',
          description: 'Chute de tension, sections de câbles et contrôles rapides avant exécution.',
          icon: Calculator,
          route: '/expert/calculators',
          badge: 'NS 01-001',
          tone: 'emerald',
        },
        {
          title: 'Schémas techniques',
          description: 'Préparez les plans unifilaires et supports de contrôle.',
          icon: PenTool,
          route: '/expert/schemas',
          badge: 'Visuel',
          tone: 'blue',
        },
        {
          title: 'Base documentaire',
          description: 'Classez PV, photos chantier, plans et notes de calcul dans la GED.',
          icon: FileText,
          route: '/ged',
          tone: 'slate',
        },
        {
          title: 'Veille normes',
          description: 'Consultez les ressources techniques et articles utiles au chantier.',
          icon: BookOpen,
          route: '/expert/docs',
          tone: 'amber',
        },
      ]}
      signals={[
        {
          title: 'Avant chantier',
          detail: 'Complétez la fiche technique et vérifiez le dimensionnement avant dépôt du dossier.',
          tone: 'info',
        },
        {
          title: 'Pendant chantier',
          detail: 'Ajoutez les photos et rapports de visite dans la GED pour garder la preuve terrain.',
          tone: 'success',
        },
        {
          title: 'Alerte conformité',
          detail: 'Tout score inférieur à 70% doit déclencher une reprise technique ou une justification.',
          tone: 'warning',
        },
      ]}
      premiumTitle="Rapports prêts pour contrôle"
      premiumText="Activez les exports avancés et les modèles de rapport pour livrer des dossiers mieux structurés, plus vite."
    />
  );
}
