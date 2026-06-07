import React, { useState } from 'react';
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
import {
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calculator,
  Info,
  Lightbulb,
  Gauge,
  Hash,
  Ruler,
  BookOpen,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
interface SoilType {
  name: string;
  resistivity: number; // Ω·m
}

interface CalcResult {
  resistance: number;
  compliant: boolean;
  message: string;
}

/* ─────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────── */
const SOIL_TYPES: SoilType[] = [
  { name: 'Argile', resistivity: 50 },
  { name: 'Argile sableuse', resistivity: 100 },
  { name: 'Sable argileux', resistivity: 200 },
  { name: 'Sable', resistivity: 500 },
  { name: 'Sable sec', resistivity: 1000 },
];

const ZONES = [
  {
    zone: 'Zone Sèche',
    locations: 'Salon, chambre, bureau, couloir',
    ul: 50,
    risk: 'Faible',
    color: 'emerald',
  },
  {
    zone: 'Zone Humide',
    locations: 'Salle de bains, cuisine, buanderie, extérieur',
    ul: 25,
    risk: 'Moyen',
    color: 'amber',
  },
  {
    zone: 'Zone Immergée',
    locations: 'Piscine, spa, fontaine, bassin',
    ul: 12,
    risk: 'Élevé',
    color: 'red',
  },
];

const DIFF_RULES = [
  {
    usage: 'Prises, circuits généraux',
    sensitivity: '30 mA',
    type: 'AC',
    color: 'emerald',
  },
  {
    usage: 'Circuits spéciaux (four, clim, pompe)',
    sensitivity: '30 mA',
    type: 'A',
    color: 'emerald',
  },
  {
    usage: 'Protection incendie',
    sensitivity: '300 mA',
    type: 'A / S',
    color: 'amber',
  },
  {
    usage: 'Abonné général (gestionnaire de réseau)',
    sensitivity: '500 mA',
    type: 'S',
    color: 'red',
  },
];

/* ─────────────────────────────────────────────────────────
   Helper
───────────────────────────────────────────────────────── */
const ROD_DIAMETER = 0.016; // m (standard 16mm rod)

function calcGroundingResistance(resistivity: number, lengthMeters: number): number {
  if (lengthMeters <= 0) return 0;
  // Simplified formula: R ≈ ρ / L (valid for standard rod geometry)
  // Full formula: R = ρ / (2 × π × L) × ln(4L / d)
  const r =
    (resistivity / (2 * Math.PI * lengthMeters)) * Math.log((4 * lengthMeters) / ROD_DIAMETER);
  return Math.max(0, r);
}

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
export default function GroundingGuide() {
  const [selectedSoil, setSelectedSoil] = useState<SoilType>(SOIL_TYPES[0]);
  const [rodLength, setRodLength] = useState<string>('2');
  const [result, setResult] = useState<CalcResult | null>(null);

  const handleCalculate = () => {
    const length = parseFloat(rodLength);
    if (isNaN(length) || length <= 0) {
      setResult({
        resistance: 0,
        compliant: false,
        message: '❌ Veuillez entrer une longueur de piquet valide (en mètres).',
      });
      return;
    }

    const r = calcGroundingResistance(selectedSoil.resistivity, length);
    const compliant = r <= 100;
    const color = compliant ? '✅' : '⚠️';

    setResult({
      resistance: r,
      compliant,
      message: `${color} Résistance ≈ ${r.toFixed(1)} Ω — ${
        compliant ? 'Conforme NF C 15-100 (R ≤ 100 Ω)' : 'Non conforme — dépasse la limite de 100 Ω'
      }`,
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Hero / Title ──────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-900/40 to-[#071914] border border-emerald-800/40 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20">
          <Zap className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="mb-2 text-3xl font-bold text-slate-100">Guide Terre &amp; Différentiel</h2>
        <p className="mx-auto max-w-2xl text-slate-400">
          Comprendre le couple terre + différentiel, les limites de tension de sécurité, les règles
          de sensibilité différentielle et calculer la résistance de votre prise de terre selon la
          norme NF C 15-100.
        </p>
      </div>

      {/* ── 1. Fundamental Safety Principle ───────────── */}
      <Card className="border-emerald-800/30 bg-[#071914]/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-emerald-800/20 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
            <Lightbulb className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-100">
              Principe fondamental de sécurité : le couple terre + différentiel
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <p className="text-sm leading-relaxed text-slate-300">
            La sécurité électrique repose sur deux éléments indissociables : la{' '}
            <strong className="text-emerald-400">prise de terre</strong> et le{' '}
            <strong className="text-emerald-400">dispositif différentiel</strong>. Ensemble, ils
            garantissent qu'en cas de défaut d'isolement, la tension de contact{' '}
            <strong className="text-slate-100">
              U<sub>c</sub>
            </strong>{' '}
            reste inférieure à la limite autorisée{' '}
            <strong className="text-slate-100">
              U<sub>L</sub>
            </strong>
            .
          </p>

          <div className="rounded-xl border border-emerald-800/30 bg-emerald-950/30 p-5">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <Zap className="h-4 w-4" />
              Loi d'Ohm appliquée à la sécurité
            </h4>
            <div className="mb-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-lg font-mono text-slate-100">
              <span className="rounded bg-emerald-900/50 px-3 py-1">
                U<sub>c</sub>
              </span>
              <span className="text-emerald-400">=</span>
              <span className="rounded bg-emerald-900/50 px-3 py-1">
                R<sub>terre</sub>
              </span>
              <span className="text-emerald-400">×</span>
              <span className="rounded bg-emerald-900/50 px-3 py-1">
                I<sub>Δn</sub>
              </span>
            </div>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>
                <strong className="text-slate-300">
                  U<sub>c</sub>
                </strong>{' '}
                : tension de contact en volts (V)
              </li>
              <li>
                <strong className="text-slate-300">
                  R<sub>terre</sub>
                </strong>{' '}
                : résistance de la prise de terre en ohms (Ω)
              </li>
              <li>
                <strong className="text-slate-300">
                  I<sub>Δn</sub>
                </strong>{' '}
                : courant de défaut / seuil de déclenchement du différentiel en ampères (A)
              </li>
            </ul>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Exemple concret :</strong> Avec une prise de terre
              de 20 Ω et un différentiel 30 mA (0,03 A), la tension de contact sera U<sub>c</sub> =
              20 × 0,03 = <strong className="text-emerald-400">0,6 V</strong>, bien en dessous de la
              limite de 50 V en zone sèche.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Safety Voltage Limits Table ────────────── */}
      <Card className="border-emerald-800/30 bg-[#071914]/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-emerald-800/20 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
            <Gauge className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-100">
              Limites de tension de sécurité (U<sub>L</sub>) par zone
            </CardTitle>
            <p className="text-xs text-slate-400">
              Selon la norme NF C 15-100 — la tension de contact ne doit jamais dépasser ces seuils.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-800/20 hover:bg-transparent">
                <TableHead className="text-slate-400">Zone</TableHead>
                <TableHead className="text-slate-400">Emplacements</TableHead>
                <TableHead className="text-right text-slate-400">
                  U<sub>L</sub> (V)
                </TableHead>
                <TableHead className="text-right text-slate-400">Risque</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ZONES.map((z) => (
                <TableRow key={z.zone} className="border-emerald-800/10 hover:bg-emerald-900/10">
                  <TableCell className="font-medium text-slate-100">{z.zone}</TableCell>
                  <TableCell className="text-slate-400">{z.locations}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={`border-${z.color}-500/40 text-${z.color}-400 font-mono text-sm`}
                    >
                      {z.ul} V
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={z.color === 'red' ? 'destructive' : 'secondary'}>
                      {z.risk}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── 3. Differential Rules Table ──────────────── */}
      <Card className="border-emerald-800/30 bg-[#071914]/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-emerald-800/20 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-100">
              Règles de sensibilité différentielle
            </CardTitle>
            <p className="text-xs text-slate-400">
              Tableau des seuils de déclenchement par usage — norme NF C 15-100
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-800/20 hover:bg-transparent">
                <TableHead className="text-slate-400">Usage</TableHead>
                <TableHead className="text-slate-400">Sensibilité</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DIFF_RULES.map((rule) => (
                <TableRow
                  key={rule.sensitivity + rule.usage}
                  className="border-emerald-800/10 hover:bg-emerald-900/10"
                >
                  <TableCell className="font-medium text-slate-100">{rule.usage}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-mono text-sm ${
                        rule.color === 'emerald'
                          ? 'border-emerald-500/40 text-emerald-400'
                          : rule.color === 'amber'
                            ? 'border-amber-500/40 text-amber-400'
                            : 'border-red-500/40 text-red-400'
                      }`}
                    >
                      {rule.sensitivity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 font-mono">{rule.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── 4. Grounding Resistance Calculator ────────── */}
      <Card className="border-emerald-800/30 bg-[#071914]/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-emerald-800/20 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
            <Calculator className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-100">
              Calculateur de résistance de terre
            </CardTitle>
            <p className="text-xs text-slate-400">
              Estimez la résistance approximative d&apos;une prise de terre verticale selon la
              nature du sol et la longueur du piquet.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {/* Soil type selector */}
          <div className="space-y-2">
            <Label htmlFor="soil-type" className="text-sm text-slate-300">
              Type de sol
            </Label>
            <div className="flex flex-wrap gap-2">
              {SOIL_TYPES.map((soil) => (
                <Button
                  key={soil.name}
                  type="button"
                  variant={selectedSoil.name === soil.name ? 'default' : 'outline'}
                  size="sm"
                  className={
                    selectedSoil.name === soil.name
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'border-emerald-800/40 text-slate-300 hover:bg-emerald-900/20'
                  }
                  onClick={() => setSelectedSoil(soil)}
                >
                  {soil.name}
                  <span className="ml-1.5 text-xs opacity-70">({soil.resistivity} Ω·m)</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Rod length input */}
          <div className="space-y-2">
            <Label htmlFor="rod-length" className="text-sm text-slate-300">
              Longueur du piquet de terre (m)
            </Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Ruler className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="rod-length"
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={rodLength}
                  onChange={(e) => setRodLength(e.target.value)}
                  placeholder="2"
                  className="border-emerald-800/40 bg-emerald-950/20 pl-9 text-slate-100 placeholder:text-slate-600 focus-visible:ring-emerald-500"
                />
              </div>
              <Button
                type="button"
                onClick={handleCalculate}
                className="bg-emerald-600 text-white hover:bg-emerald-500"
              >
                <Hash className="mr-1.5 h-4 w-4" />
                Calculer
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Piquet standard de diamètre {ROD_DIAMETER * 1000} mm.
            </p>
          </div>

          {/* Formula reference */}
          <div className="rounded-lg border border-slate-700/40 bg-slate-800/20 p-3">
            <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Info className="h-3.5 w-3.5 text-emerald-400" />
              Formule utilisée
            </h4>
            <div className="text-xs font-mono text-slate-400">R = ρ / (2 × π × L) × ln(4L / d)</div>
            <div className="mt-1 text-xs text-slate-500">
              ρ : résistivité du sol (Ω·m) — L : longueur du piquet (m) — d : diamètre du piquet (m)
            </div>
          </div>

          {/* Result */}
          {result && (
            <div
              className={`rounded-xl border p-4 ${
                result.compliant
                  ? 'border-emerald-700/40 bg-emerald-950/30'
                  : 'border-red-700/40 bg-red-950/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {result.compliant ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-slate-100">{result.message}</p>
                  <p className="text-xs text-slate-400">
                    Résistance estimée :{' '}
                    <strong className="font-mono text-slate-200">
                      {result.resistance.toFixed(1)} Ω
                    </strong>
                  </p>
                  <p className="text-xs text-slate-500">
                    Condition NF C 15-100 : R ≤ 100 Ω (pour DDR 30 mA)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick reference strip */}
          <div className="flex items-start gap-2 rounded-lg border border-blue-800/30 bg-blue-950/20 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Rappel normatif :</strong> La norme NF C 15-100
              exige une résistance de terre <strong className="text-emerald-400">R ≤ 100 Ω</strong>{' '}
              pour garantir qu&apos;un différentiel 30 mA maintienne la tension de contact sous la
              limite de sécurité.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── 5. Visual Diagram — Terre + Différentiel ── */}
      <Card className="border-emerald-800/30 bg-[#071914]/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-emerald-800/20 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
            <Zap className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-100">
              Schéma de principe : couple terre + différentiel
            </CardTitle>
            <p className="text-xs text-slate-400">
              Parcours du courant de défaut et déclenchement de la protection
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="overflow-x-auto">
            {/* Flow diagram */}
            <div className="flex min-w-[640px] flex-col items-center gap-1">
              {/* Row 1: Source → Defect */}
              <div className="flex w-full items-center justify-center gap-3">
                <div className="flex h-14 w-28 flex-col items-center justify-center rounded-lg border border-emerald-700/40 bg-emerald-950/30 px-3">
                  <span className="text-xs font-semibold text-emerald-300">Source</span>
                  <span className="text-[10px] text-slate-500">230 V</span>
                </div>
                <div className="flex items-center text-emerald-500">
                  <span className="text-xs">Défaut d&apos;isolement</span>
                  <svg
                    className="ml-1 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>

              {/* Connecting line down */}
              <div className="flex h-8 w-0.5 bg-emerald-700/40" />

              {/* Row 2: Differential detects */}
              <div className="flex w-full items-center justify-center gap-3">
                <div className="flex h-14 w-36 flex-col items-center justify-center rounded-lg border border-amber-700/40 bg-amber-950/30 px-3">
                  <Shield className="mb-1 h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-300">Différentiel détecte</span>
                  <span className="text-[10px] text-slate-500">IΔn &gt; seuil</span>
                </div>
                <div className="flex items-center text-amber-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
                <div className="flex h-14 w-32 flex-col items-center justify-center rounded-lg border border-red-700/40 bg-red-950/30 px-3">
                  <span className="text-xs font-semibold text-red-300">Coupe le circuit</span>
                  <span className="text-[10px] text-slate-500">&lt; 300 ms</span>
                </div>
              </div>

              {/* Connecting line down */}
              <div className="flex h-8 w-0.5 bg-emerald-700/40" />

              {/* Row 3: Earth path */}
              <div className="flex w-full items-center justify-center gap-3">
                <div className="flex h-14 w-36 flex-col items-center justify-center rounded-lg border border-emerald-700/40 bg-emerald-950/30 px-3">
                  <span className="text-xs font-semibold text-emerald-300">Prise de terre</span>
                  <span className="text-[10px] text-slate-500">R ≤ 100 Ω</span>
                </div>
                <div className="flex items-center text-emerald-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
                <div className="flex h-14 w-36 flex-col items-center justify-center rounded-lg border border-emerald-700/40 bg-emerald-950/30 px-3">
                  <CheckCircle2 className="mb-1 h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">Tension Uc ≤ UL</span>
                  <span className="text-[10px] text-slate-500">Personnes protégées</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-5 grid grid-cols-1 gap-2 rounded-lg border border-slate-700/40 bg-slate-800/20 p-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="h-3 w-3 rounded bg-emerald-500/40" />
              <span>Chemin du courant de défaut vers la terre</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="h-3 w-3 rounded bg-amber-500/40" />
              <span>Détection et décision du différentiel</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="h-3 w-3 rounded bg-red-500/40" />
              <span>Coupure rapide &lt; 300 ms</span>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Principe :</strong> En cas de défaut, le courant
              emprunte la prise de terre (chemin de moindre résistance). Le différentiel mesure la
              différence entre le courant aller et retour — si elle dépasse le seuil (IΔn), il coupe
              l&apos;alimentation en moins de 300 ms, limitant la tension de contact U<sub>c</sub>{' '}
              sous la limite U<sub>L</sub>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── 6. Conformity Summary ─────────────────────── */}
      <Card className="border-emerald-800/30 bg-[#071914]/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-emerald-800/20 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-100">
              Vérification de conformité NF C 15-100
            </CardTitle>
            <p className="text-xs text-slate-400">
              Critères combinés terre + différentiel pour une installation conforme.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-3">
          {[
            {
              label: 'Résistance de terre',
              condition: 'R ≤ 100 Ω',
              note: 'Pour DDR 30 mA',
              icon: Calculator,
              color: 'emerald',
            },
            {
              label: 'Tension de contact',
              condition: 'Uc ≤ UL',
              note: 'Uc = R × IΔn',
              icon: Zap,
              color: 'amber',
            },
            {
              label: 'Différentiel',
              condition: '30 mA obligatoire',
              note: 'Protection personnes',
              icon: Shield,
              color: 'red',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-700/40 bg-slate-800/20 p-4 transition-colors hover:bg-slate-800/40"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                  <item.icon className="h-4 w-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-100">{item.label}</h4>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">
                {item.condition}
              </Badge>
              <p className="mt-2 text-xs text-slate-500">{item.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── 7. Tips — Installation & Maintenance ──────── */}
      <Card className="border-emerald-800/30 bg-[#071914]/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-emerald-800/20 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
            <BookOpen className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-100">
              Conseils d&apos;installation et d&apos;entretien
            </CardTitle>
            <p className="text-xs text-slate-400">
              Bonnes pratiques pour garantir l&apos;efficacité de votre protection terre +
              différentiel
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
          {/* Installation */}
          <div className="rounded-xl border border-emerald-800/30 bg-emerald-950/20 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <Zap className="h-4 w-4" />
              Installation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  Utilisez un piquet de terre en cuivre ou acier cuivré d&apos;au moins{' '}
                  <strong className="text-slate-300">2 m</strong> de longueur.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  Enfoncez le piquet verticalement dans un sol humide et stable, loin des
                  canalisations enterrées.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  Connectez le conducteur de terre au piquet avec un collier de serrage en laiton
                  résistant à la corrosion.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  Installez un différentiel <strong className="text-slate-300">30 mA</strong> en
                  tête de tableau pour la protection des personnes.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  Respectez la section minimale du conducteur de terre :{' '}
                  <strong className="text-slate-300">16 mm²</strong> en cuivre nu.
                </span>
              </li>
            </ul>
          </div>

          {/* Maintenance */}
          <div className="rounded-xl border border-amber-800/30 bg-amber-950/20 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              Entretien &amp; Vérification
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  Testez mensuellement le bouton{' '}
                  <strong className="text-slate-300">&quot;T&quot;</strong> de chaque différentiel
                  pour vérifier son bon fonctionnement.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  Faites mesurer la résistance de terre par un professionnel{' '}
                  <strong className="text-slate-300">tous les 5 ans</strong> (ou après travaux).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  Après un orage ou une crue, vérifiez l&apos;intégrité du piquet et des connexions
                  exposées.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  Ne confondez pas terre et neutre — une inversion annule toute protection
                  différentielle.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  Un différentiel qui déclenche fréquemment sans raison apparente doit être{' '}
                  <strong className="text-slate-300">diagnostiqué</strong> par un électricien.
                </span>
              </li>
            </ul>
          </div>

          {/* Additional info strip */}
          <div className="flex items-start gap-2 rounded-lg border border-emerald-800/30 bg-emerald-950/20 p-3 sm:col-span-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Rappel important :</strong> Le bouton &quot;T&quot;
              ne teste que le mécanisme interne du différentiel, pas la boucle de terre. Seul un{' '}
              <strong className="text-slate-300">Telluromètre</strong> utilisé par un professionnel
              permet de valider l&apos;ensemble de la protection (terre + boucle + temps de
              déclenchement).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
