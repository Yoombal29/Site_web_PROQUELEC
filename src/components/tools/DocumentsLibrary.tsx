import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  File,
  FileText,
  FolderOpen,
  Search,
} from 'lucide-react';

type DocumentCategory = 'referentiel' | 'guide' | 'memento' | 'feuillet' | 'depliant';
type CategoryFilter = 'tous' | DocumentCategory;

interface DocumentEntry {
  filename: string;
  title: string;
  description: string;
  category: DocumentCategory;
}

interface DownloadCounts {
  [key: string]: number;
}

interface DocumentsLibraryProps {
  externalSearchQuery?: string;
}

const DOCUMENTS: DocumentEntry[] = [
  {
    filename: 'Referentiel-PROQUELEC.doc',
    title: 'Référentiel PROQUELEC',
    description: 'Document de référence pour les critères, démarches et exigences du label PROQUELEC.',
    category: 'referentiel',
  },
  {
    filename: 'guide-choix-materiels-mise-en-oeuvre.doc',
    title: 'Choix des matériels et mise en œuvre',
    description: 'Guide : Choix des matériels et mise en œuvre.',
    category: 'guide',
  },
  {
    filename: 'guide-economie-energie-consommation.doc',
    title: "Économie d'énergie et consommation",
    description: "Guide : Économie d'énergie et consommation.",
    category: 'guide',
  },
  {
    filename: 'guide-gestion-risques-prevention-incendie.doc',
    title: 'Gestion des risques et prévention incendie',
    description: 'Guide : Gestion des risques et prévention incendie.',
    category: 'guide',
  },
  {
    filename: 'guide-installation-menages-faible-revenu.doc',
    title: 'Installation pour ménages à faible revenu',
    description: 'Guide : Installation pour ménages à faible revenu.',
    category: 'guide',
  },
  {
    filename: 'guide-installation-residentielle.doc',
    title: 'Installation résidentielle',
    description: 'Guide : Installation résidentielle.',
    category: 'guide',
  },
  {
    filename: 'guide-installations-emplacements-specifiques.doc',
    title: 'Installations emplacements spécifiques',
    description: 'Guide : Installations emplacements spécifiques.',
    category: 'guide',
  },
  {
    filename: 'guide-securite-conformite-marches.doc',
    title: 'Sécurité et conformité marchés',
    description: 'Guide : Sécurité et conformité marchés.',
    category: 'guide',
  },
  {
    filename: 'guide-verifications-entretien-installations.doc',
    title: 'Vérifications et entretien installations',
    description: 'Guide : Vérifications et entretien installations.',
    category: 'guide',
  },
  {
    filename: 'memento-caracteristiques-generales.doc',
    title: 'Caractéristiques générales',
    description: 'Mémento : Caractéristiques générales.',
    category: 'memento',
  },
  {
    filename: 'memento-conformite-mise-sous-tension.doc',
    title: 'Conformité mise sous tension',
    description: 'Mémento : Conformité mise sous tension.',
    category: 'memento',
  },
  {
    filename: 'memento-couleurs-conducteurs.doc',
    title: 'Couleurs des conducteurs',
    description: 'Mémento : Couleurs des conducteurs.',
    category: 'memento',
  },
  {
    filename: 'memento-glossaire-electricite.doc',
    title: 'Glossaire électricité',
    description: 'Mémento : Glossaire électricité.',
    category: 'memento',
  },
  {
    filename: 'memento-norme-ns01-001.doc',
    title: 'Norme NS01-001',
    description: 'Mémento : Norme NS01-001.',
    category: 'memento',
  },
  {
    filename: 'memento-protections-electriques.doc',
    title: 'Protections électriques',
    description: 'Mémento : Protections électriques.',
    category: 'memento',
  },
  {
    filename: 'memento-protections.doc',
    title: 'Protections',
    description: 'Mémento : Protections.',
    category: 'memento',
  },
  {
    filename: 'memento-schemas-electricite.doc',
    title: 'Schémas électricité',
    description: 'Mémento : Schémas électricité.',
    category: 'memento',
  },
  {
    filename: 'memento-sections-cables.doc',
    title: 'Sections de câbles',
    description: 'Mémento : Sections de câbles.',
    category: 'memento',
  },
  {
    filename: 'memento-symboles-electriques.doc',
    title: 'Symboles électriques',
    description: 'Mémento : Symboles électriques.',
    category: 'memento',
  },
  {
    filename: 'feuillet-alimentation-maison-individuelle.doc',
    title: 'Alimentation maison individuelle',
    description: 'Feuillet : Alimentation maison individuelle.',
    category: 'feuillet',
  },
  {
    filename: 'feuillet-appareils-salle-eau.doc',
    title: "Appareils salle d'eau",
    description: "Feuillet : Appareils salle d'eau.",
    category: 'feuillet',
  },
  {
    filename: 'feuillet-canalisations-enterrees.doc',
    title: 'Canalisations enterrées',
    description: 'Feuillet : Canalisations enterrées.',
    category: 'feuillet',
  },
  {
    filename: 'feuillet-colonnes-montantes-parties-communes.doc',
    title: 'Colonnes montantes parties communes',
    description: 'Feuillet : Colonnes montantes parties communes.',
    category: 'feuillet',
  },
  {
    filename: 'feuillet-compteur.doc',
    title: 'Compteur',
    description: 'Feuillet : Compteur.',
    category: 'feuillet',
  },
  {
    filename: 'feuillet-disjoncteur-differentiel.doc',
    title: 'Disjoncteur différentiel',
    description: 'Feuillet : Disjoncteur différentiel.',
    category: 'feuillet',
  },
  {
    filename: 'feuillet-installation-triphasée.doc',
    title: 'Installation triphasée',
    description: 'Feuillet : Installation triphasée.',
    category: 'feuillet',
  },
  {
    filename: 'feuillet-liaison-equipotentielle-salle-eau.doc',
    title: "Liaison équipotentielle salle d'eau",
    description: "Feuillet : Liaison équipotentielle salle d'eau.",
    category: 'feuillet',
  },
  {
    filename: 'feuillet-mise-a-la-terre.doc',
    title: 'Mise à la terre',
    description: 'Feuillet : Mise à la terre.',
    category: 'feuillet',
  },
  {
    filename: 'feuillet-parafoudre.doc',
    title: 'Parafoudre',
    description: 'Feuillet : Parafoudre.',
    category: 'feuillet',
  },
  {
    filename: 'feuillet-prise-16a.doc',
    title: 'Prise 16A',
    description: 'Feuillet : Prise 16A.',
    category: 'feuillet',
  },
  {
    filename: 'feuillet-prise-de-terre.doc',
    title: 'Prise de terre',
    description: 'Feuillet : Prise de terre.',
    category: 'feuillet',
  },
  {
    filename: 'feuillet-prise-rj45.doc',
    title: 'Prise RJ45',
    description: 'Feuillet : Prise RJ45.',
    category: 'feuillet',
  },
  {
    filename: 'feuillet-protection-installation-electrique.doc',
    title: 'Protection installation électrique',
    description: 'Feuillet : Protection installation électrique.',
    category: 'feuillet',
  },
  {
    filename: 'feuillet-vmc.doc',
    title: 'VMC',
    description: 'Feuillet : VMC.',
    category: 'feuillet',
  },
  {
    filename: 'depliant-choisir-electricien-agree.doc',
    title: 'Choisir un électricien agréé',
    description: 'Dépliant : Choisir un électricien agréé.',
    category: 'depliant',
  },
  {
    filename: 'depliant-economisez-energie-quotidien.doc',
    title: "Économisez l'énergie au quotidien",
    description: "Dépliant : Économisez l'énergie au quotidien.",
    category: 'depliant',
  },
  {
    filename: 'depliant-electricite-chez-vous.doc',
    title: "L'électricité chez vous",
    description: "Dépliant : L'électricité chez vous.",
    category: 'depliant',
  },
  {
    filename: 'depliant-informations-proquelec.doc',
    title: 'Informations PROQUELEC',
    description: 'Dépliant : Informations PROQUELEC.',
    category: 'depliant',
  },
  {
    filename: 'depliant-installation-vieillit-securite.doc',
    title: 'Installation vieillissante et sécurité',
    description: 'Dépliant : Installation vieillissante et sécurité.',
    category: 'depliant',
  },
  {
    filename: 'depliant-prevention-accidents-domestiques.doc',
    title: 'Prévention des accidents domestiques',
    description: 'Dépliant : Prévention des accidents domestiques.',
    category: 'depliant',
  },
];

const CATEGORY_META: Record<
  DocumentCategory,
  { label: string; shortLabel: string; color: string; muted: string; icon: React.ComponentType<{ className?: string }> }
> = {
  referentiel: {
    label: 'Référentiel',
    shortLabel: 'Référentiel',
    color: 'bg-slate-900 text-white',
    muted: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: FileText,
  },
  guide: {
    label: 'Guides techniques',
    shortLabel: 'Guide technique',
    color: 'bg-blue-600 text-white',
    muted: 'bg-blue-50 text-blue-700 border-blue-100',
    icon: BookOpen,
  },
  memento: {
    label: 'Mémentos',
    shortLabel: 'Mémento',
    color: 'bg-red-500 text-white',
    muted: 'bg-red-50 text-red-700 border-red-100',
    icon: FileText,
  },
  feuillet: {
    label: 'Feuillets techniques',
    shortLabel: 'Feuillet technique',
    color: 'bg-yellow-400 text-slate-950',
    muted: 'bg-yellow-50 text-yellow-800 border-yellow-100',
    icon: FileText,
  },
  depliant: {
    label: 'Dépliants',
    shortLabel: 'Dépliant',
    color: 'bg-green-500 text-white',
    muted: 'bg-green-50 text-green-700 border-green-100',
    icon: FileText,
  },
};

const CATEGORY_OPTIONS: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'tous', label: 'Tous' },
  { value: 'referentiel', label: CATEGORY_META.referentiel.label },
  { value: 'guide', label: CATEGORY_META.guide.label },
  { value: 'memento', label: CATEGORY_META.memento.label },
  { value: 'feuillet', label: CATEGORY_META.feuillet.label },
  { value: 'depliant', label: CATEGORY_META.depliant.label },
];

const CATEGORY_ORDER: DocumentCategory[] = ['referentiel', 'guide', 'memento', 'feuillet', 'depliant'];
const STORAGE_KEY = 'proquelec-doc-downloads';

const getDownloadUrl = (filename: string) => `/word/${filename}`;

function getCategoryCounts() {
  return DOCUMENTS.reduce<Record<CategoryFilter, number>>(
    (acc, doc) => {
      acc.tous += 1;
      acc[doc.category] += 1;
      return acc;
    },
    { tous: 0, referentiel: 0, guide: 0, memento: 0, feuillet: 0, depliant: 0 },
  );
}

export default function DocumentsLibrary({ externalSearchQuery = '' }: DocumentsLibraryProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('tous');
  const [downloadCounts, setDownloadCounts] = useState<DownloadCounts>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<DocumentCategory, boolean>>({
    referentiel: false,
    guide: true,
    memento: false,
    feuillet: false,
    depliant: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setDownloadCounts(JSON.parse(saved));
    } catch {
      setDownloadCounts({});
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(downloadCounts));
    }
  }, [downloadCounts, isLoaded]);

  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  const handleDownload = useCallback((filename: string) => {
    setDownloadCounts((prev) => ({
      ...prev,
      [filename]: (prev[filename] || 0) + 1,
    }));
  }, []);

  const counts = useMemo(() => getCategoryCounts(), []);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return DOCUMENTS.filter((doc) => {
      const matchesCategory = activeCategory === 'tous' || doc.category === activeCategory;
      const matchesSearch =
        !query ||
        doc.filename.toLowerCase().includes(query) ||
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const totalDownloads = useMemo(
    () => Object.values(downloadCounts).reduce((total, count) => total + count, 0),
    [downloadCounts],
  );

  const handleCategoryFilter = (value: CategoryFilter) => {
    setActiveCategory(value);
    if (value !== 'tous') {
      setOpenCategories((prev) => ({ ...prev, [value]: true }));
    }
  };

  const toggleCategory = (category: DocumentCategory) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="w-full space-y-6 text-[#071225] md:space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {(['guide', 'memento', 'feuillet', 'depliant'] as DocumentCategory[]).map((category) => (
              <span
                key={category}
                className={`inline-flex rounded-full px-3 py-2 text-xs font-black shadow md:px-4 md:text-sm ${CATEGORY_META[category].color}`}
              >
                {CATEGORY_META[category].label}
              </span>
            ))}
          </div>
          <h2 className="mt-5 text-2xl font-black text-blue-900 md:mt-6 md:text-3xl">
            Bibliothèque documentaire
          </h2>
          <p className="mt-3 max-w-5xl text-sm leading-relaxed text-slate-700 md:text-base">
            <strong>Quelle différence ?</strong>
            <span className="mt-4 block">
              <strong>Guide technique</strong> : document complet qui détaille une thématique, une
              méthode ou une procédure.
            </span>
            <span className="mt-4 block">
              <strong>Mémento</strong> : aide-mémoire synthétique pour retrouver rapidement les
              données essentielles sur le terrain.
            </span>
            <span className="mt-4 block">
              <strong>Feuillet technique</strong> : fiche courte centrée sur un produit, un matériel
              ou une opération précise.
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm lg:min-w-[220px]">
          <div className="flex items-center gap-2 font-black text-blue-900">
            <FolderOpen className="h-4 w-4" />
            {counts.tous} documents importés
          </div>
          {totalDownloads > 0 && (
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {totalDownloads} téléchargement{totalDownloads > 1 ? 's' : ''} enregistré
              {totalDownloads > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4 lg:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher un document, un guide, une fiche..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </label>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {CATEGORY_OPTIONS.map((option) => {
            const active = activeCategory === option.value;
            const activeClass =
              option.value === 'tous'
                ? 'bg-blue-600 text-white'
                : CATEGORY_META[option.value].color;
            const inactiveClass =
              option.value === 'tous'
                ? 'border-slate-200 bg-slate-100 text-slate-700'
                : CATEGORY_META[option.value].muted;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleCategoryFilter(option.value)}
                className={`min-h-11 rounded-full border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5 md:px-4 md:text-sm ${
                  active ? activeClass : inactiveClass
                }`}
              >
                {option.label}
                <span className="ml-2 opacity-80">{counts[option.value]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <FolderOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-lg font-black text-slate-700">Aucun document trouvé</p>
          <p className="mt-1 text-sm text-slate-500">Modifiez votre recherche ou le filtre actif.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {CATEGORY_ORDER.map((category) => {
              const docs = filteredDocuments.filter((doc) => doc.category === category);
              if (docs.length === 0) return null;
              const shouldForceOpen = searchQuery.trim().length > 0;
              const isOpen = shouldForceOpen || openCategories[category];
              const PanelIcon = CATEGORY_META[category].icon;

              return (
                <section
                  key={category}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="flex w-full flex-col gap-4 p-4 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between md:p-5"
                    aria-expanded={isOpen}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${CATEGORY_META[category].muted}`}
                      >
                        <PanelIcon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black shadow ${CATEGORY_META[category].color}`}
                        >
                          {CATEGORY_META[category].label}
                        </span>
                        <span className="mt-2 block text-sm font-semibold text-slate-500">
                          {docs.length} document{docs.length > 1 ? 's' : ''}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-3 text-sm font-black text-blue-800 sm:justify-end">
                      {isOpen ? 'Replier' : 'Afficher'}
                      {isOpen ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 p-4 md:p-5">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {docs.map((doc) => (
                          <DocumentCard
                            key={doc.filename}
                            document={doc}
                            downloadCount={downloadCounts[doc.filename] || 0}
                            onDownload={handleDownload}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
        </div>
      )}

      <div className="text-center">
        <a
          href="https://proquelec.sn/documents/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-2xl bg-blue-700 px-6 py-3 text-base font-black text-white shadow-lg shadow-blue-900/20"
        >
          <FolderOpen className="mr-2 h-5 w-5" />
          Voir tous les documents et guides PROQUELEC
        </a>
      </div>
    </div>
  );
}

interface DocumentCardProps {
  document: DocumentEntry;
  downloadCount: number;
  onDownload: (filename: string) => void;
}

function DocumentCard({ document, downloadCount, onDownload }: DocumentCardProps) {
  const meta = CATEGORY_META[document.category];
  const Icon = meta.icon;
  const downloadUrl = getDownloadUrl(document.filename);

  return (
    <article className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:min-h-[230px] md:p-5">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.muted}`}>
            <Icon className="h-5 w-5" />
          </div>
          {downloadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">
              <File className="mr-1 h-3 w-3" />
              {downloadCount}
            </span>
          )}
        </div>
        <p className="text-xs font-black uppercase tracking-wide text-blue-700">{meta.shortLabel}</p>
        <h3 className="mt-2 text-base font-black leading-tight text-slate-950 md:text-lg">
          {document.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{document.description}</p>
        <p className="mt-3 break-all text-xs font-semibold text-slate-400">{document.filename}</p>
      </div>
      <a
        href={downloadUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onDownload(document.filename)}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-800"
      >
        <Download className="mr-2 h-4 w-4" />
        Télécharger
      </a>
    </article>
  );
}
