import React, { useState } from 'react';
import { Calculator, Zap, AlertTriangle, CheckCircle, Info, RotateCcw, Cable, Ruler, Weight, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CableSizingResult {
  current: number;
  section: number;
  voltageDrop: number;
  isCompliant: boolean;
  material: string;
  voltage: number;
  power: number;
  length: number;
}

const STANDARD_SECTIONS = [
  { mm2: 1.5, maxCurrent: 16 },
  { mm2: 2.5, maxCurrent: 25 },
  { mm2: 4, maxCurrent: 32 },
  { mm2: 6, maxCurrent: 40 },
  { mm2: 10, maxCurrent: 50 },
  { mm2: 16, maxCurrent: 63 },
  { mm2: 25, maxCurrent: 80 },
  { mm2: 35, maxCurrent: 100 },
  { mm2: 50, maxCurrent: 125 },
] as const;

const RESISTIVITY = {
  cuivre: 0.0175,
  aluminium: 0.028,
} as const;

function determineSection(current: number): number {
  if (current <= 16) return 1.5;
  if (current <= 25) return 2.5;
  if (current <= 32) return 4;
  if (current <= 40) return 6;
  if (current <= 50) return 10;
  if (current <= 63) return 16;
  if (current <= 80) return 25;
  if (current <= 100) return 35;
  if (current <= 125) return 50;
  return 70;
}

export default function CableSizingTool() {
  const [power, setPower] = useState<string>('');
  const [voltage, setVoltage] = useState<string>('230');
  const [length, setLength] = useState<string>('');
  const [material, setMaterial] = useState<string>('cuivre');
  const [result, setResult] = useState<CableSizingResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const calculate = () => {
    const powerNum = parseFloat(power);
    const voltageNum = parseFloat(voltage);
    const lengthNum = parseFloat(length);

    if (isNaN(powerNum) || isNaN(voltageNum) || isNaN(lengthNum) || powerNum <= 0 || voltageNum <= 0 || lengthNum <= 0) {
      return;
    }

    setIsCalculating(true);

    // Simulate a brief calculation delay for UX
    setTimeout(() => {
      // Calculate current based on single-phase or three-phase
      const current = voltageNum === 230
        ? (powerNum * 1000) / voltageNum
        : (powerNum * 1000) / (voltageNum * Math.sqrt(3));

      // Determine required cable section
      const section = determineSection(current);

      // Calculate voltage drop (using copper resistivity as base)
      const rho = RESISTIVITY[material as keyof typeof RESISTIVITY];
      const voltageDrop = (2 * current * lengthNum * rho) / (section * voltageNum) * 100;

      const isCompliant = voltageDrop <= 3;

      setResult({
        current: Math.round(current * 100) / 100,
        section,
        voltageDrop: Math.round(voltageDrop * 100) / 100,
        isCompliant,
        material,
        voltage: voltageNum,
        power: powerNum,
        length: lengthNum,
      });

      setIsCalculating(false);
    }, 400);
  };

  const reset = () => {
    setPower('');
    setVoltage('230');
    setLength('');
    setMaterial('cuivre');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Cable className="w-6 h-6 text-emerald-400" />
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            NF C 15-100
          </Badge>
        </div>
        <h2 className="text-2xl font-black text-white">Calculateur de Section de Câble</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Dimensionnez la section de câble minimale requise selon la puissance, la tension et la longueur.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INPUT FORM */}
        <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-400">
              <Zap className="w-5 h-5" />
              Paramètres d'Installation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Power Input */}
            <div className="space-y-2">
              <Label htmlFor="power" className="text-slate-300 font-medium">
                Puissance (kW)
              </Label>
              <div className="relative">
                <Input
                  id="power"
                  type="number"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  placeholder="12"
                  step="0.1"
                  min="0"
                  className="bg-emerald-900/20 border-emerald-800/40 text-white pl-8"
                />
                <Gauge className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Voltage Select */}
            <div className="space-y-2">
              <Label htmlFor="voltage" className="text-slate-300 font-medium">
                Tension (V)
              </Label>
              <Select value={voltage} onValueChange={setVoltage}>
                <SelectTrigger id="voltage" className="bg-emerald-900/20 border-emerald-800/40 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="230">230 V — Monophasé</SelectItem>
                  <SelectItem value="400">400 V — Triphasé</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {voltage === '230'
                  ? 'Réseau monophasé standard (P = U × I)'
                  : 'Réseau triphasé équilibré (P = U × I × √3)'
                }
              </p>
            </div>

            {/* Length Input */}
            <div className="space-y-2">
              <Label htmlFor="length" className="text-slate-300 font-medium">
                Longueur du câble (m)
              </Label>
              <div className="relative">
                <Input
                  id="length"
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="50"
                  min="0"
                  className="bg-emerald-900/20 border-emerald-800/40 text-white pl-8"
                />
                <Ruler className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Material Select */}
            <div className="space-y-2">
              <Label htmlFor="material" className="text-slate-300 font-medium">
                Matériau du conducteur
              </Label>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger id="material" className="bg-emerald-900/20 border-emerald-800/40 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cuivre">Cuivre (ρ = 0.0175 Ω·mm²/m)</SelectItem>
                  <SelectItem value="aluminium">Aluminium (ρ = 0.028 Ω·mm²/m)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Weight className="w-3 h-3" />
                <span>
                  Résistivité: {RESISTIVITY[material as keyof typeof RESISTIVITY]} Ω·mm²/m
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={calculate}
                disabled={isCalculating || !power || !length}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-11"
              >
                {isCalculating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Calcul...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Calculer
                  </span>
                )}
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 h-11"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RESULTS & TABLE */}
        <div className="space-y-6">
          {/* Results */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400">
                <Cable className="w-5 h-5" />
                Résultats du Dimensionnement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  {/* Current & Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-900/20 border border-emerald-800/40 rounded-lg">
                      <Label className="text-slate-400 text-sm">Intensité calculée (Ib)</Label>
                      <div className="text-2xl font-black text-white mt-1">
                        {result.current} <span className="text-sm font-medium text-slate-400">A</span>
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-900/20 border border-emerald-800/40 rounded-lg">
                      <Label className="text-slate-400 text-sm">Section minimale requise</Label>
                      <div className="text-2xl font-black text-emerald-400 mt-1">
                        {result.section} <span className="text-sm font-medium text-slate-400">mm²</span>
                      </div>
                    </div>
                  </div>

                  {/* Voltage Drop */}
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-sm">Chute de tension</Label>
                    <div className="flex items-end gap-3">
                      <div className="text-2xl font-black text-white">
                        {result.voltageDrop} <span className="text-sm font-medium text-slate-400">%</span>
                      </div>
                      <span className="text-slate-500 text-sm mb-1">Limite: 3%</span>
                    </div>
                  </div>

                  {/* Compliance Badge */}
                  <div
                    className={`flex items-center gap-2 p-4 rounded-lg border ${
                      result.isCompliant
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    {result.isCompliant
                      ? <CheckCircle className="w-5 h-5 text-green-400" />
                      : <AlertTriangle className="w-5 h-5 text-red-400" />
                    }
                    <span className={`font-bold ${result.isCompliant ? 'text-green-400' : 'text-red-400'}`}>
                      {result.isCompliant ? 'CONFORME — Chute de tension ≤ 3%' : 'NON CONFORME — Chute de tension > 3%'}
                    </span>
                  </div>

                  {/* Summary Details */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Puissance</span>
                      <span className="text-white font-medium">{result.power} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tension</span>
                      <span className="text-white font-medium">{result.voltage} V {result.voltage === 230 ? '(monophasé)' : '(triphasé)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Longueur</span>
                      <span className="text-white font-medium">{result.length} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Matériau</span>
                      <span className="text-white font-medium capitalize">{result.material}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Cable className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Saisissez les paramètres et cliquez sur "Calculer"</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Standard Sections Table */}
          <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400 text-sm">
                <Info className="w-4 h-4" />
                Sections normalisées et courant maximal admissible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-emerald-900/40">
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Section (mm²)</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Courant max (A)</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Usage typique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STANDARD_SECTIONS.map((sec) => (
                      <tr
                        key={sec.mm2}
                        className={`border-b border-emerald-900/20 transition-colors ${
                          result && result.section === sec.mm2
                            ? 'bg-emerald-500/10'
                            : 'hover:bg-emerald-900/10'
                        }`}
                      >
                        <td className="py-2 px-3 text-white font-medium">
                          {sec.mm2}
                          {result && result.section === sec.mm2 && (
                            <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                              Recommandé
                            </Badge>
                          )}
                        </td>
                        <td className="text-right py-2 px-3 text-slate-300">{sec.maxCurrent} A</td>
                        <td className="text-right py-2 px-3 text-slate-500">
                          {sec.mm2 <= 1.5 && 'Éclairage'}
                          {sec.mm2 === 2.5 && 'Prises de courant'}
                          {sec.mm2 === 4 && 'Petits appareils'}
                          {sec.mm2 === 6 && 'Cuisson / Climatisation'}
                          {sec.mm2 === 10 && 'Gros appareils'}
                          {sec.mm2 >= 16 && 'Distribution / TGBT'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Formula Reference */}
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-amber-400 mt-0.5" />
            <div className="space-y-3">
              <h4 className="font-black text-amber-400">Référence Normative NF C 15-100</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  <strong>Chapitre 52 — Sections 523, 524, 525 :</strong> La section minimale des conducteurs
                  est déterminée en fonction du courant d'emploi et de la chute de tension maximale autorisée.
                </p>
                <div className="bg-slate-800/50 p-3 rounded font-mono text-xs">
                  <div className="text-amber-400 font-medium mb-2">Formules de calcul :</div>
                  <div>• Monophasé : Ib = P(kW) × 1000 / U (V)</div>
                  <div>• Triphasé : Ib = P(kW) × 1000 / (U(V) × √3)</div>
                  <div>• Chute de tension : ΔU(%) = (2 × Ib × L × ρ) / (S × U) × 100</div>
                  <div className="text-slate-500 mt-2">
                    ρ = résistivité du conducteur (Cuivre: 0.0175, Aluminium: 0.028 Ω·mm²/m)
                  </div>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>• Limite de chute de tension : 3% maximum pour les circuits d'éclairage et de puissance</div>
                  <div>• Section minimale : 1.5 mm² pour l'éclairage, 2.5 mm² pour les prises de courant</div>
                  <div>• Ib = courant d'emploi du circuit (en ampères)</div>
                  <div>• L = longueur simple du câble (en mètres)</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
