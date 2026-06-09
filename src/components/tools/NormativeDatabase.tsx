import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  BookOpen,
  FileText,
  Shield,
  Zap,
  Gavel,
  Info,
  Download,
  Database,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
interface CableSection {
  section: string;
  maxCurrent: string;
  usage: string;
}

interface ProtectionDevice {
  type: string;
  usage: string;
  norme: string;
}

interface NormeEntry {
  type: string;
  code: string;
  detail: string;
  pdf?: string;
  desc?: string;
}

interface ReglementEntry {
  type: string;
  code: string;
  detail: string;
  pdf?: string;
  desc?: string;
}

/* ─────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────── */
const CABLE_SECTIONS: CableSection[] = [
  { section: '1.5', maxCurrent: '16', usage: 'Éclairage' },
  { section: '2.5', maxCurrent: '25', usage: 'Prises' },
  { section: '4', maxCurrent: '32', usage: 'Cuisinière' },
  { section: '6', maxCurrent: '40', usage: 'Chauffe-eau' },
  { section: '10', maxCurrent: '55', usage: 'Climatisation' },
  { section: '16', maxCurrent: '75', usage: 'Arrivée TGBT' },
  { section: '25', maxCurrent: '100', usage: 'Grosse puissance' },
  { section: '35', maxCurrent: '125', usage: 'Colonne' },
  { section: '50', maxCurrent: '150', usage: 'Liaison' },
];

const PROTECTION_DEVICES: ProtectionDevice[] = [
  { type: 'Disjoncteur 10A', usage: 'Éclairage', norme: 'NF C 15-100' },
  { type: 'Disjoncteur 16A', usage: 'Prises', norme: 'NF C 15-100' },
  { type: 'Disjoncteur 20A', usage: 'Cuisinière', norme: 'NF C 15-100' },
  { type: 'Disjoncteur 32A', usage: 'Table de cuisson', norme: 'NF C 15-100' },
  { type: 'DDR 30mA type AC', usage: 'Prises générales', norme: 'NF C 15-100' },
  { type: 'DDR 30mA type A', usage: 'Circuits spéciaux', norme: 'NF C 15-100' },
  { type: 'DDR 300mA type S', usage: 'Incendie', norme: 'NF C 15-100' },
  { type: 'Parafoudre', usage: 'Protection surtension', norme: 'NF C 15-100' },
];

const NORMES_DATA: NormeEntry[] = [
  {
    type: 'Normes NF',
    code: 'NS 01-001',
    detail: 'Installations Électriques BT - Règles',
    desc: 'Norme de référence pour toute installation électrique basse tension au Sénégal. Elle définit les exigences de sécurité, de dimensionnement, de pose et de conformité. Inspirée de la NF C 15-100 française.',
    pdf: '',
  },
  {
    type: 'Normes NF',
    code: 'NF C 15-100',
    detail: 'Installations Électriques BT - France/Sénégal',
    desc: 'Norme fondamentale pour les installations électriques basse tension : protection des personnes, choix des conducteurs, section des câbles, dispositifs différentiels, etc.',
    pdf: '',
  },
  {
    type: 'Normes IEC',
    code: 'IEC 60364',
    detail: 'Low-voltage electrical installations',
    desc: 'Norme internationale pour les installations électriques basse tension, couvre la conception, la vérification et la sécurité des installations.',
    pdf: '',
  },
  {
    type: 'Lois/Décrets',
    code: 'Loi n°2010-21',
    detail: "Code de l'Électricité au Sénégal",
    desc: "Loi portant Code de l'Électricité. Réforme globale du cadre électrique : production, distribution, transport, droits et obligations.",
    pdf: '',
  },
  {
    type: 'Lois/Décrets',
    code: 'Décret n°2011-91',
    detail: "Conseil National de l'Énergie",
    desc: "Instauration du Conseil National de l'Énergie (CNE) pour la régulation et la planification énergétique au Sénégal.",
    pdf: '',
  },
  {
    type: 'Lois/Décrets',
    code: 'Décret n°2011-2013',
    detail: 'Énergies renouvelables',
    desc: "Application de la loi d'orientation sur les énergies renouvelables : conditions d'achat, rémunération, raccordement.",
    pdf: '',
  },
  {
    type: 'Lois/Décrets',
    code: 'Arrêté 2012',
    detail: 'Règles techniques de raccordement',
    desc: 'Arrêté fixant les règles techniques de raccordement aux réseaux électriques basse et moyenne tension au Sénégal.',
    pdf: '',
  },
  {
    type: 'Sécurité',
    code: 'Code du Travail',
    detail: 'Sécurité des travailleurs',
    desc: "Dispositions du Code du Travail relatives à la sécurité électrique des travailleurs : obligations de l'employeur, vérifications périodiques, équipements de protection.",
    pdf: '',
  },
];

const REGLEMENTS_DATA: ReglementEntry[] = [
  {
    type: 'Loi',
    code: 'Loi n°2021-31',
    detail: "Code de l'Électricité",
    pdf: '',
    desc: 'Réforme globale du cadre électrique sénégalais : production, distribution, transport, droits des clients, réglementation sectorielle.',
  },
  {
    type: 'Loi',
    code: 'Loi n°2010-21',
    detail: "Loi d'orientation sur les énergies renouvelables",
    pdf: '',
    desc: "Cadre d'orientation pour l'intégration des énergies renouvelables dans le mix énergétique sénégalais.",
  },
  {
    type: 'Décret',
    code: 'Décret n°2024-833',
    detail: "Conditions de vente et achat d'énergie électrique",
    pdf: '',
    desc: "Fixe les conditions de vente et modalités d'achat d'énergie électrique entre producteurs, fournisseurs et clients.",
  },
  {
    type: 'Décret',
    code: 'Décret n°2023-269',
    detail: "Titres d'exercice dans le secteur de l'électricité",
    pdf: '',
    desc: "Conditions et modalités de délivrance, modification, renouvellement et retrait des titres d'exercice.",
  },
  {
    type: 'Décret',
    code: 'Décret n°2023-286',
    detail: "Régime de l'autoproduction d'énergie électrique",
    pdf: '',
    desc: "Régime de l'autoproduction, conditions de vente du surplus, injection réseau.",
  },
  {
    type: 'Décret',
    code: 'Décret n°2011-91',
    detail: "Conseil National de l'Énergie",
    pdf: '',
    desc: "Instauration du Conseil National de l'Énergie (CNE).",
  },
  {
    type: 'Décret',
    code: 'Décret n°2011-2013',
    detail: 'Application loi énergies renouvelables',
    pdf: '',
    desc: "Application de la loi d'orientation sur les énergies renouvelables — conditions d'achat, rémunération, raccordement.",
  },
  {
    type: 'Décret',
    code: 'Décret n°2006-24',
    detail: "Fonds d'Électrification Rurale (FER)",
    pdf: '',
    desc: "Création du Fonds d'Électrification Rurale (FER) et règles d'organisation.",
  },
  {
    type: 'Arrêté',
    code: 'Arrêté n°13817',
    detail: 'Règlement de service électrification rurale',
    pdf: '',
    desc: "Règlement de service pour la concession d'électrification rurale.",
  },
  {
    type: 'Arrêté',
    code: 'Arrêté n°6242',
    detail: "Seuil d'éligibilité du client",
    pdf: '',
    desc: "Fixe le seuil et modalités de mise en œuvre de l'éligibilité du client.",
  },
  {
    type: 'Arrêté',
    code: 'Arrêté 2012',
    detail: 'Règles techniques de raccordement',
    pdf: '',
    desc: 'Arrêté fixant les règles techniques de raccordement aux réseaux électriques BT et MT.',
  },
  {
    type: 'Norme',
    code: 'Code du Travail',
    detail: 'Sécurité des travailleurs (volet électrique)',
    pdf: '',
    desc: 'Dispositions relatives à la sécurité électrique des travailleurs.',
  },
];

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
const categoryIcons: Record<string, React.ReactNode> = {
  'Normes NF': <FileText className="h-4 w-4 text-amber-400" />,
  'Normes IEC': <BookOpen className="h-4 w-4 text-blue-400" />,
  'Lois/Décrets': <Gavel className="h-4 w-4 text-purple-400" />,
  Sécurité: <Shield className="h-4 w-4 text-emerald-400" />,
};

const categoryColors: Record<string, string> = {
  'Normes NF': 'border-amber-500/30 bg-amber-950/20 text-amber-300',
  'Normes IEC': 'border-blue-500/30 bg-blue-950/20 text-blue-300',
  'Lois/Décrets': 'border-purple-500/30 bg-purple-950/20 text-purple-300',
  Sécurité: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
};

const typeBadgeColors: Record<string, string> = {
  Loi: 'border-green-500/30 bg-green-950/20 text-green-300',
  Décret: 'border-yellow-500/30 bg-yellow-950/20 text-yellow-300',
  Arrêté: 'border-red-500/30 bg-red-950/20 text-red-300',
  Code: 'border-purple-500/30 bg-purple-950/20 text-purple-300',
  Norme: 'border-blue-500/30 bg-blue-950/20 text-blue-300',
};

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
export default function NormativeDatabase() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [expandedNorm, setExpandedNorm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('normes');

  /* ── Filtered normes ── */
  const filteredNormes = useMemo(() => {
    const q = search.toLowerCase().trim();
    return NORMES_DATA.filter((n) => {
      // Filter by category
      if (categoryFilter !== 'Tous' && n.type !== categoryFilter) return false;
      // Filter by search
      if (!q) return true;
      return (
        n.code.toLowerCase().includes(q) ||
        n.detail.toLowerCase().includes(q) ||
        (n.desc && n.desc.toLowerCase().includes(q))
      );
    });
  }, [search, categoryFilter]);

  /* ── Filtered réglements ── */
  const [reglementSearch, setReglementSearch] = useState('');
  const [reglementTypeFilter, setReglementTypeFilter] = useState('Tous');
  const [expandedReglement, setExpandedReglement] = useState<string | null>(null);

  const filteredReglements = useMemo(() => {
    const q = reglementSearch.toLowerCase().trim();
    return REGLEMENTS_DATA.filter((r) => {
      if (reglementTypeFilter !== 'Tous' && r.type !== reglementTypeFilter) return false;
      if (!q) return true;
      return (
        r.code.toLowerCase().includes(q) ||
        r.detail.toLowerCase().includes(q) ||
        (r.desc && r.desc.toLowerCase().includes(q))
      );
    });
  }, [reglementSearch, reglementTypeFilter]);

  /* ── Export ── */
  const handleExport = () => {
    const allData = [
      '--- NORMES ET RÉGLEMENTATIONS ÉLECTROTECHNIQUES ---',
      '',
      ...NORMES_DATA.map(
        (n) => `[${n.type}] ${n.code} — ${n.detail}${n.desc ? `\n   ${n.desc}` : ''}`,
      ),
      '',
      '--- ARRÊTÉS, LOIS ET TEXTES RÉGLEMENTAIRES ---',
      '',
      ...REGLEMENTS_DATA.map(
        (r) => `[${r.type}] ${r.code} — ${r.detail}${r.desc ? `\n   ${r.desc}` : ''}`,
      ),
      '',
      '--- SECTIONS DE CÂBLES ---',
      '',
      'Section (mm²) | Courant max (A) | Usage',
      CABLE_SECTIONS.map((c) => `${c.section} | ${c.maxCurrent} | ${c.usage}`).join('\n'),
      '',
      '--- DISPOSITIFS DE PROTECTION ---',
      '',
      'Type | Usage | Norme',
      PROTECTION_DEVICES.map((d) => `${d.type} | ${d.usage} | ${d.norme}`).join('\n'),
    ].join('\n');

    const blob = new Blob([allData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'base-normative-proquelec.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Toggle expand ── */
  const toggleExpand = (code: string) => {
    setExpandedNorm((prev) => (prev === code ? null : code));
  };

  return (
    <div className="space-y-8">
      {/* ── Hero / Title ──────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-900/40 to-[#071914] border border-emerald-800/40 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20">
          <Database className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="mb-2 text-3xl font-bold text-slate-100">
          Base normative &amp; réglementaire
        </h2>
        <p className="mx-auto max-w-2xl text-slate-400">
          Base de données des normes et réglementations électrotechniques au Sénégal. Consultez les
          sections de câbles, les dispositifs de protection et les textes officiels applicables.
        </p>
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-[#071914] border border-emerald-800/30 rounded-xl p-1">
          <TabsTrigger
            value="normes"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 rounded-lg"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Normes
          </TabsTrigger>
          <TabsTrigger
            value="cables"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 rounded-lg"
          >
            <Zap className="mr-2 h-4 w-4" />
            Tableaux câbles
          </TabsTrigger>
          <TabsTrigger
            value="protection"
            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 rounded-lg"
          >
            <Shield className="mr-2 h-4 w-4" />
            Protection
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════
            TAB 1 — Normes & Réglementations
        ════════════════════════════════════════════════ */}
        <TabsContent value="normes" className="space-y-6 pt-6">
          {/* ── Normes section ── */}
          <Card className="border-emerald-800/30 bg-[#071914]/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 border-b border-emerald-800/20 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                <BookOpen className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-100">Normes électrotechniques</CardTitle>
                <p className="text-xs text-slate-400">
                  Normes NS, NF C, IEC et réglementations applicables au Sénégal
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {/* Search & Category filter */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="search"
                    placeholder="Rechercher par code, titre ou mot-clé…"
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    className="border-emerald-800/40 bg-emerald-950/20 pl-9 text-slate-100 placeholder:text-slate-600 focus-visible:ring-emerald-500"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] border-emerald-800/40 bg-emerald-950/20 text-slate-100 focus:ring-emerald-500">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent className="border-emerald-800/40 bg-[#071914] text-slate-100">
                    <SelectItem value="Tous">Tous</SelectItem>
                    <SelectItem value="Normes NF">Normes NF</SelectItem>
                    <SelectItem value="Normes IEC">Normes IEC</SelectItem>
                    <SelectItem value="Lois/Décrets">Lois/Décrets</SelectItem>
                    <SelectItem value="Sécurité">Sécurité</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Normes list */}
              {filteredNormes.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 text-sm text-slate-400">
                  <Info className="h-4 w-4 shrink-0 text-blue-400" />
                  Aucune norme trouvée pour cette recherche.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNormes.map((norme) => {
                    const isExpanded = expandedNorm === norme.code;
                    return (
                      <div
                        key={norme.code}
                        className="rounded-lg border border-emerald-800/20 bg-emerald-950/10 transition-colors hover:bg-emerald-950/20"
                      >
                        <button
                          type="button"
                          onClick={() => toggleExpand(norme.code)}
                          className="flex w-full items-center gap-3 p-3 text-left"
                        >
                          <div className="shrink-0">
                            {categoryIcons[norme.type] || (
                              <FileText className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-medium text-slate-100">
                                {norme.code}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${categoryColors[norme.type] || 'border-slate-500/30 bg-slate-950/20 text-slate-300'}`}
                              >
                                {norme.type}
                              </Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                              {norme.detail}
                            </p>
                          </div>
                          <div className="shrink-0 text-slate-500">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </button>
                        {isExpanded && norme.desc && (
                          <div className="border-t border-emerald-800/20 px-3 pb-3 pt-2">
                            <p className="text-xs leading-relaxed text-slate-400">{norme.desc}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-slate-500">
                Source : PROQUELEC, normes officielles sénégalaises et CEI. Dernière mise à jour :
                2025.
              </p>
            </CardContent>
          </Card>

          {/* ── Réglements section ── */}
          <Card className="border-emerald-800/30 bg-[#071914]/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 border-b border-emerald-800/20 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                <Gavel className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-100">
                  Arrêtés, Lois &amp; Réglementations
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Textes légaux et réglementaires applicables à l'électricité au Sénégal
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {/* Search & Type filter */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="search"
                    placeholder="Rechercher un texte (Loi, Décret, Arrêté…)"
                    value={reglementSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setReglementSearch(e.target.value)
                    }
                    className="border-emerald-800/40 bg-emerald-950/20 pl-9 text-slate-100 placeholder:text-slate-600 focus-visible:ring-emerald-500"
                  />
                </div>
                <Select value={reglementTypeFilter} onValueChange={setReglementTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] border-emerald-800/40 bg-emerald-950/20 text-slate-100 focus:ring-emerald-500">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="border-emerald-800/40 bg-[#071914] text-slate-100">
                    <SelectItem value="Tous">Tous</SelectItem>
                    <SelectItem value="Loi">Lois</SelectItem>
                    <SelectItem value="Décret">Décrets</SelectItem>
                    <SelectItem value="Arrêté">Arrêtés</SelectItem>
                    <SelectItem value="Code">Codes</SelectItem>
                    <SelectItem value="Norme">Normes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Réglements list */}
              {filteredReglements.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 text-sm text-slate-400">
                  <Info className="h-4 w-4 shrink-0 text-blue-400" />
                  Aucun texte trouvé pour cette recherche.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredReglements.map((reg) => {
                    const isExpanded = expandedReglement === reg.code;
                    return (
                      <div
                        key={reg.code}
                        className="rounded-lg border border-emerald-800/20 bg-emerald-950/10 transition-colors hover:bg-emerald-950/20"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReglement((prev) => (prev === reg.code ? null : reg.code))
                          }
                          className="flex w-full items-center gap-3 p-3 text-left"
                        >
                          <div className="shrink-0">
                            {reg.type === 'Loi' && <FileText className="h-4 w-4 text-green-400" />}
                            {reg.type === 'Décret' && (
                              <FileText className="h-4 w-4 text-yellow-400" />
                            )}
                            {reg.type === 'Arrêté' && <FileText className="h-4 w-4 text-red-400" />}
                            {reg.type === 'Code' && (
                              <BookOpen className="h-4 w-4 text-purple-400" />
                            )}
                            {reg.type === 'Norme' && <Shield className="h-4 w-4 text-blue-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-medium text-slate-100">
                                {reg.code}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${typeBadgeColors[reg.type] || 'border-slate-500/30 bg-slate-950/20 text-slate-300'}`}
                              >
                                {reg.type}
                              </Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                              {reg.detail}
                            </p>
                          </div>
                          <div className="shrink-0 text-slate-500">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </button>
                        {isExpanded && reg.desc && (
                          <div className="border-t border-emerald-800/20 px-3 pb-3 pt-2">
                            <p className="text-xs leading-relaxed text-slate-400">{reg.desc}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-slate-500">
                Source : Journal Officiel du Sénégal, ASN, PROQUELEC. Dernière mise à jour : 2025.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════
            TAB 2 — Sections de câbles
        ════════════════════════════════════════════════ */}
        <TabsContent value="cables" className="space-y-6 pt-6">
          <Card className="border-emerald-800/30 bg-[#071914]/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 border-b border-emerald-800/20 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-100">
                  Sections de câbles — Référence rapide
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Tableau des sections normalisées et courants maximaux associés — NF C 15-100
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-emerald-800/20 hover:bg-transparent">
                    <TableHead className="text-slate-400">Section (mm²)</TableHead>
                    <TableHead className="text-slate-400">Courant max (A)</TableHead>
                    <TableHead className="text-slate-400">Usage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CABLE_SECTIONS.map((c) => (
                    <TableRow
                      key={c.section}
                      className="border-emerald-800/10 hover:bg-emerald-900/10"
                    >
                      <TableCell className="font-mono font-medium text-slate-100">
                        {c.section}
                      </TableCell>
                      <TableCell className="font-mono text-emerald-400">{c.maxCurrent}</TableCell>
                      <TableCell className="text-slate-400">{c.usage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 rounded-lg border border-blue-800/30 bg-blue-950/20 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Rappel :</strong> Ces valeurs sont indicatives pour
              du cuivre en pose normalisée (NF C 15-100). Pour des conditions spécifiques
              (température, groupement de câbles, chute de tension), un calcul précis est
              nécessaire.
            </p>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════
            TAB 3 — Dispositifs de protection
        ════════════════════════════════════════════════ */}
        <TabsContent value="protection" className="space-y-6 pt-6">
          <Card className="border-emerald-800/30 bg-[#071914]/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 border-b border-emerald-800/20 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-100">
                  Dispositifs de protection — Référence rapide
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Disjoncteurs, DDR et parafoudres — usage et norme associée
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-emerald-800/20 hover:bg-transparent">
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Usage</TableHead>
                    <TableHead className="text-slate-400">Norme</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PROTECTION_DEVICES.map((d) => (
                    <TableRow
                      key={d.type}
                      className="border-emerald-800/10 hover:bg-emerald-900/10"
                    >
                      <TableCell className="font-medium text-slate-100">{d.type}</TableCell>
                      <TableCell className="text-slate-400">{d.usage}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 text-emerald-300 font-mono text-xs"
                        >
                          {d.norme}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* DDR types info */}
          <Alert className="border-emerald-800/30 bg-emerald-950/20">
            <Shield className="h-4 w-4 text-emerald-400" />
            <AlertDescription className="text-xs text-slate-400">
              <strong className="text-slate-300">Rappel différentiels :</strong> Type AC : courant
              alternatif sinusoïdal — Type A : courant alternatif et pulsé — Type S : sélectif
              (retardé) pour protection incendie. Seul le 30 mA protège directement les personnes.
            </AlertDescription>
          </Alert>

          <div className="flex items-start gap-2 rounded-lg border border-blue-800/30 bg-blue-950/20 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">NF C 15-100 :</strong> Les dispositifs
              différentiels à haute sensibilité (30 mA) sont obligatoires sur tous les circuits
              terminaux des bâtiments résidentiels (prises, éclairage, cuisine, salle de bains).
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Export Button ────────────────────────────── */}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={handleExport}
          className="bg-emerald-600 text-white hover:bg-emerald-500"
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter la base normative
        </Button>
      </div>
    </div>
  );
}
