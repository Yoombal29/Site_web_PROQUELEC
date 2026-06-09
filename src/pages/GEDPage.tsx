import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Archive,
  FileCheck2,
  FilePlus2,
  Files,
  FolderKanban,
  Loader2,
  LockKeyhole,
  SearchCheck,
  ShieldCheck,
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { DocumentManager } from '@/components/DocumentManager';
import {
  FunctionalPanel,
  PremiumFunctionalShell,
} from '@/components/functional/PremiumFunctionalShell';
import { useSession } from '@/hooks/useSession';

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  secondary_admin: 'Admin secondaire',
  electricien: 'Electricien',
  entreprise: 'Entreprise',
  membre: 'Membre',
  partner: 'Partenaire',
};

export default function GEDPage() {
  const { user, isLoading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user && location.pathname === '/ged') {
      sessionStorage.setItem('redirectAfterLogin', '/ged');
      navigate('/connexion');
    }
  }, [user, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-500">Chargement de la GED...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roleLabel = roleLabels[user.role] || user.role || 'Utilisateur';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-20">
        <PremiumFunctionalShell
          eyebrow="GED technique"
          title="Une bibliothèque documentaire prête pour l’audit et la preuve."
          subtitle="Classez les pièces techniques, préparez les rapports et gardez une traçabilité exploitable pour chaque dossier PROQUELEC."
          icon={Files}
          accent="slate"
          metrics={[
            {
              label: 'Profil',
              value: roleLabel,
              detail: 'Droits appliqués selon votre espace connecté.',
              icon: LockKeyhole,
              tone: 'slate',
            },
            {
              label: 'Traçabilité',
              value: 'Active',
              detail: 'Les documents sont rattachables aux dossiers et audits.',
              icon: ShieldCheck,
              tone: 'emerald',
            },
            {
              label: 'Cycle GED',
              value: '4 étapes',
              detail: 'Dépôt, contrôle, validation, archivage.',
              icon: FolderKanban,
              tone: 'blue',
            },
            {
              label: 'Rapports',
              value: 'Prêts',
              detail: 'Accès rapide à l’éditeur documentaire.',
              icon: FileCheck2,
              tone: 'amber',
            },
          ]}
          actions={[
            {
              label: 'Nouveau document',
              description: 'Ouvrir l’éditeur de rapport',
              icon: FilePlus2,
              onClick: () => navigate('/office/document/new'),
            },
            {
              label: 'Dossiers techniques',
              description: 'Relier les documents aux audits',
              icon: FolderKanban,
              onClick: () => navigate('/projects'),
            },
          ]}
          rightRail={
            <>
              <FunctionalPanel title="Circuit documentaire" subtitle="Méthode recommandée">
                <div className="space-y-3">
                  {[
                    ['01', 'Déposer', 'Importer plans, photos, PV, certificats et notes de calcul.'],
                    ['02', 'Qualifier', 'Associer une catégorie et un dossier technique.'],
                    ['03', 'Contrôler', 'Vérifier lisibilité, version, conformité et complétude.'],
                    ['04', 'Archiver', 'Conserver une preuve propre pour audit ou renouvellement.'],
                  ].map(([step, title, detail]) => (
                    <div key={step} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white text-xs font-black text-slate-700 ring-1 ring-slate-200">
                        {step}
                      </span>
                      <div>
                        <p className="text-sm font-black text-slate-900">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FunctionalPanel>

              <FunctionalPanel title="Dossiers types" subtitle="Classement conseillé">
                <div className="grid gap-2">
                  {[
                    ['Etude', 'Plans, schémas, notes de calcul'],
                    ['Chantier', 'Photos, rapports de visite, réserves'],
                    ['Contrôle', 'PV, certificats, validations'],
                    ['Administratif', 'Contrats, demandes, échanges'],
                  ].map(([title, detail]) => (
                    <div key={title} className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-sm font-black text-slate-900">{title}</p>
                      <p className="mt-1 text-xs text-slate-500">{detail}</p>
                    </div>
                  ))}
                </div>
              </FunctionalPanel>
            </>
          }
        >
          <FunctionalPanel
            title="Explorateur GED"
            subtitle="Gestion des documents techniques, rapports et médias"
          >
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              {[
                {
                  icon: SearchCheck,
                  label: 'Retrouver vite',
                  detail: 'Recherchez les pièces par dossier, nom ou type.',
                },
                {
                  icon: Archive,
                  label: 'Archiver propre',
                  detail: 'Conservez des versions exploitables pour audit.',
                },
                {
                  icon: FileCheck2,
                  label: 'Préparer contrôle',
                  detail: 'Rassemblez les preuves avant validation.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <Icon className="mb-3 h-5 w-5 text-blue-700" />
                    <p className="text-sm font-black text-slate-900">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                  </div>
                );
              })}
            </div>

            <div className="min-h-[560px] overflow-hidden rounded-lg border border-slate-200 bg-white">
              <DocumentManager />
            </div>
          </FunctionalPanel>
        </PremiumFunctionalShell>
      </main>
      <Footer />
    </div>
  );
}
