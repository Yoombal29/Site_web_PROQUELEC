import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileText,
  BookOpen,
  Download,
  Search,
  FileSpreadsheet,
  File,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Document {
  filename: string;
  title: string;
  description: string;
  category: 'guide' | 'memento';
}

interface DownloadCounts {
  [key: string]: number;
}

type CategoryFilter = 'tous' | 'guide' | 'memento';

// ─── Data ──────────────────────────────────────────────────────────────────────

const DOCUMENTS: Document[] = [
  // Guides (8)
  {
    filename: 'guide-choix-materiels-mise-en-oeuvre.doc',
    title: 'Choix des matériels et mise en œuvre',
    description:
      'Guide pour le choix des matériels électriques et leur mise en œuvre conforme aux normes.',
    category: 'guide',
  },
  {
    filename: 'guide-economie-energie-consommation.doc',
    title: "Économie d'énergie et consommation",
    description:
      'Guide sur les bonnes pratiques pour réduire la consommation énergétique des installations.',
    category: 'guide',
  },
  {
    filename: 'guide-gestion-risques-prevention-incendie.doc',
    title: 'Gestion des risques et prévention incendie',
    description:
      'Guide de gestion des risques électriques et de prévention des incendies domestiques et professionnels.',
    category: 'guide',
  },
  {
    filename: 'guide-installation-menages-faible-revenu.doc',
    title: 'Installation pour ménages à faible revenu',
    description:
      "Guide dédié aux solutions d'installation électrique adaptées aux ménages à faible revenu.",
    category: 'guide',
  },
  {
    filename: 'guide-installation-residentielle.doc',
    title: 'Installation résidentielle',
    description:
      "Guide complet pour l'installation électrique résidentielle conforme à la norme NS 01 001.",
    category: 'guide',
  },
  {
    filename: 'guide-installations-emplacements-specifiques.doc',
    title: 'Installations emplacements spécifiques',
    description:
      "Guide pour les installations électriques dans les emplacements spécifiques (salles d'eau, locaux professionnels…).",
    category: 'guide',
  },
  {
    filename: 'guide-securite-conformite-marches.doc',
    title: 'Sécurité et conformité marchés',
    description:
      'Guide sur la sécurité électrique et la conformité requise pour les marchés publics et privés.',
    category: 'guide',
  },
  {
    filename: 'guide-verifications-entretien-installations.doc',
    title: 'Vérifications et entretien installations',
    description:
      "Guide des vérifications périodiques et de l'entretien des installations électriques.",
    category: 'guide',
  },
  // Mémentos (8)
  {
    filename: 'memento-caracteristiques-generales.doc',
    title: 'Caractéristiques générales',
    description: 'Aide-mémoire sur les caractéristiques générales des installations électriques.',
    category: 'memento',
  },
  {
    filename: 'memento-conformite-mise-sous-tension.doc',
    title: 'Conformité mise sous tension',
    description:
      "Mémento sur les procédures de conformité avant la mise sous tension d'une installation.",
    category: 'memento',
  },
  {
    filename: 'memento-couleurs-conducteurs.doc',
    title: 'Couleurs des conducteurs',
    description: 'Aide-mémoire sur le code couleurs des conducteurs électriques selon la norme.',
    category: 'memento',
  },
  {
    filename: 'memento-glossaire-electricite.doc',
    title: 'Glossaire électricité',
    description:
      'Lexique et glossaire des termes techniques utilisés en électricité bâtiment et industrie.',
    category: 'memento',
  },
  {
    filename: 'memento-norme-ns01-001.doc',
    title: 'Norme NS01-001',
    description: 'Mémento récapitulatif des exigences essentielles de la norme NS01-001.',
    category: 'memento',
  },
  {
    filename: 'memento-protections-electriques.doc',
    title: 'Protections électriques',
    description:
      'Aide-mémoire sur les dispositifs de protection électrique (disjoncteurs, fusibles, différentiels).',
    category: 'memento',
  },
  {
    filename: 'memento-sections-cables.doc',
    title: 'Sections de câbles',
    description:
      "Mémento sur le choix des sections de câbles en fonction de l'intensité et de la distance.",
    category: 'memento',
  },
  {
    filename: 'memento-symboles-electriques.doc',
    title: 'Symboles électriques',
    description:
      "Aide-mémoire des symboles électriques normalisés pour schémas et plans d'installation.",
    category: 'memento',
  },
];

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'tous', label: 'Tous' },
  { value: 'guide', label: 'Guides' },
  { value: 'memento', label: 'Mémentos' },
];

const STORAGE_KEY = 'proquelec-doc-downloads';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getCategoryCounts() {
  const guides = DOCUMENTS.filter((d) => d.category === 'guide').length;
  const mementos = DOCUMENTS.filter((d) => d.category === 'memento').length;
  return { tous: DOCUMENTS.length, guides, mementos };
}

// ─── Component ─────────────────────────────────────────────────────────────────

const DocumentsLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('tous');
  const [downloadCounts, setDownloadCounts] = useState<DownloadCounts>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted download counts from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setDownloadCounts(JSON.parse(saved));
      }
    } catch {
      // Silently ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever counts change (skip initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(downloadCounts));
    }
  }, [downloadCounts, isLoaded]);

  const handleDownload = useCallback((filename: string) => {
    setDownloadCounts((prev) => ({
      ...prev,
      [filename]: (prev[filename] || 0) + 1,
    }));
  }, []);

  const totalCounts = useMemo(() => getCategoryCounts(), []);

  const filteredDocuments = useMemo(() => {
    return DOCUMENTS.filter((doc) => {
      const matchesSearch =
        searchQuery === '' ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory === 'tous' || doc.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const totalDownloads = useMemo(() => {
    return Object.values(downloadCounts).reduce((sum, count) => sum + count, 0);
  }, [downloadCounts]);

  return (
    <div className="w-full space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-900/40 flex items-center justify-center">
            <FolderOpen className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              Bibliothèque de documents techniques
            </h2>
            <p className="text-slate-400 text-sm">
              Accédez à l'ensemble des guides et mémentos techniques PROQUELEC.
            </p>
          </div>
        </div>
      </div>

      {/* ── Search & Filters ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Label htmlFor="doc-search" className="sr-only">
            Rechercher un document
          </Label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          <Input
            id="doc-search"
            type="text"
            placeholder="Rechercher un document…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 bg-[#0a2a21] border-emerald-900/50 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
          />
        </div>

        {/* Category filter */}
        <Select
          value={activeCategory}
          onValueChange={(val: CategoryFilter) => setActiveCategory(val)}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-[#0a2a21] border-emerald-900/50 text-slate-100 focus-visible:ring-emerald-500 focus-visible:border-emerald-500">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent className="bg-[#0a2a21] border-emerald-900/50 text-slate-100">
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="focus:bg-emerald-900/40 focus:text-slate-100 cursor-pointer"
              >
                <span className="flex items-center justify-between w-full gap-3">
                  {opt.label}
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 bg-emerald-900/40 text-slate-400 font-normal"
                  >
                    {totalCounts[opt.value]}
                  </Badge>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Quick category pills (alternative to Select) ──── */}
      <div className="flex flex-wrap gap-2 -mt-2">
        {CATEGORY_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value)}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200 border
              ${
                activeCategory === value
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/30'
                  : 'bg-[#0a2a21] text-slate-300 border-emerald-900/30 hover:border-emerald-600/50 hover:text-slate-100'
              }
            `}
          >
            {label}
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${
                  activeCategory === value
                    ? 'bg-emerald-700/60 text-emerald-100'
                    : 'bg-emerald-900/40 text-slate-400'
                }
              `}
            >
              {totalCounts[value]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filteredDocuments.length} document
          {filteredDocuments.length !== 1 ? 's' : ''} trouvé
          {filteredDocuments.length !== 1 ? 's' : ''}
        </p>
        {totalDownloads > 0 && (
          <Badge
            variant="outline"
            className="gap-1.5 border-emerald-800/50 text-emerald-400 bg-emerald-950/20 text-xs"
          >
            <Download className="h-3 w-3" />
            {totalDownloads} téléchargement{totalDownloads !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* ── Document grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <DocumentCard
            key={doc.filename}
            document={doc}
            downloadCount={downloadCounts[doc.filename] || 0}
            onDownload={handleDownload}
          />
        ))}
      </div>

      {/* ── Empty state ───────────────────────────────────── */}
      {filteredDocuments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-2xl bg-[#0a2a21] border border-emerald-900/30 flex items-center justify-center mb-4">
            <FolderOpen className="h-8 w-8 text-slate-600" />
          </div>
          <p className="text-slate-400 text-lg font-medium">Aucun document trouvé</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
            Essayez de modifier votre recherche ou votre filtre de catégorie.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('tous');
            }}
            className="mt-4 border-emerald-700/50 text-emerald-400 hover:bg-emerald-600 hover:text-white"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
};

// ─── Document Card ─────────────────────────────────────────────────────────────

interface DocumentCardProps {
  document: Document;
  downloadCount: number;
  onDownload: (filename: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document: doc,
  downloadCount,
  onDownload,
}) => {
  const { filename, title, description, category } = doc;

  const IconComponent = category === 'guide' ? BookOpen : FileText;
  const categoryLabel = category === 'guide' ? 'Guide technique' : 'Mémento';
  const downloadUrl = `/public/word/${filename}`;

  const handleClick = useCallback(() => {
    onDownload(filename);
    // Programmatically trigger the hidden download link
    const link = window.document.getElementById(`dl-${filename}`);
    if (link) {
      link.click();
    }
  }, [filename, onDownload]);

  return (
    <Card className="bg-[#0a2a21] border-emerald-900/40 hover:border-emerald-700/60 transition-all duration-200 group flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Category icon */}
            <div
              className={`
                shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                ${
                  category === 'guide'
                    ? 'bg-blue-900/40 text-blue-400'
                    : 'bg-amber-900/40 text-amber-400'
                }
              `}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold text-slate-100 truncate">
                {title}
              </CardTitle>
              <Badge
                variant="outline"
                className={`
                  mt-1 text-[10px] px-1.5 py-0 font-medium border
                  ${
                    category === 'guide'
                      ? 'text-blue-400 border-blue-800/50 bg-blue-950/30'
                      : 'text-amber-400 border-amber-800/50 bg-amber-950/30'
                  }
                `}
              >
                {categoryLabel}
              </Badge>
            </div>
          </div>
          {/* Download count badge */}
          {downloadCount > 0 && (
            <Badge
              variant="secondary"
              className="shrink-0 flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-emerald-900/30 text-emerald-400 border border-emerald-800/30"
            >
              <File className="h-2.5 w-2.5" />
              {downloadCount}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col flex-1">
        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2 flex-1">
          {description}
        </p>
        <Button
          size="sm"
          onClick={handleClick}
          className="
            w-full gap-2 text-xs font-medium
            bg-emerald-700/20 border border-emerald-700/50 text-emerald-400
            hover:bg-emerald-600 hover:text-white hover:border-emerald-500
            transition-all duration-200
          "
        >
          <Download className="h-3.5 w-3.5" />
          Télécharger (.doc)
        </Button>
        {/* Hidden anchor for actual download */}
        <a
          href={downloadUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="hidden"
          id={`dl-${filename}`}
        />
      </CardContent>
    </Card>
  );
};

export default DocumentsLibrary;
