import React, { useState } from 'react';
import { Sun, Battery, Zap, Calculator, RefreshCw, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface SolarInputs {
  dailyConsumption: string;   // kWh/jour
  sunHours: string;           // heures/jour
  autonomyDays: string;       // jours
  systemVoltage: string;      // 12 | 24 | 48
}

interface SolarResults {
  panelPower: number;   // W
  batteryCapacity: number;  // Ah
  controllerCurrent: number; // A
  dailyConsumption: number;
  sunHours: number;
  autonomyDays: number;
  systemVoltage: number;
}

// ──────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────

const INITIAL_INPUTS: SolarInputs = {
  dailyConsumption: '',
  sunHours: '',
  autonomyDays: '',
  systemVoltage: '12',
};

const INFO_CARDS = [
  {
    icon: Sun,
    title: 'Puissance Panneaux (W)',
    formula: '(Consommation × 1000) / (Ensoleillement × 0.8)',
    desc: 'La puissance crête nécessaire en Watts-crête (Wc). Le facteur 0.8 tient compte des pertes système (rendement onduleur, échauffement, poussière, etc.).',
  },
  {
    icon: Battery,
    title: 'Capacité Batteries (Ah)',
    formula: '(Consommation × Autonomie) / (Tension × 0.8)',
    desc: 'Capacité totale du parc batteries en Ampères-heures (Ah). Le facteur 0.8 limite la décharge à 80% pour préserver la durée de vie des batteries.',
  },
  {
    icon: Zap,
    title: 'Courant Régulateur (A)',
    formula: 'Puissance Panneaux / Tension Système',
    desc: 'Courant nominal que le régulateur de charge doit supporter, exprimé en Ampères (A). Prenez une marge de sécurité de 25% lors du choix.',
  },
];

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

export default function SolarSizingTool() {
  const [inputs, setInputs] = useState<SolarInputs>(INITIAL_INPUTS);
  const [results, setResults] = useState<SolarResults | null>(null);

  // ── Helpers ───────────────────────────────────────────

  const setInput = (field: keyof SolarInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // ── Calculation ───────────────────────────────────────

  const calculate = () => {
    const daily = parseFloat(inputs.dailyConsumption);
    const sun = parseFloat(inputs.sunHours);
    const autonomy = parseFloat(inputs.autonomyDays);
    const voltage = parseFloat(inputs.systemVoltage);

    if (
      isNaN(daily) || daily <= 0 ||
      isNaN(sun) || sun <= 0 ||
      isNaN(autonomy) || autonomy <= 0 ||
      isNaN(voltage) || voltage <= 0
    ) {
      return;
    }

    const panelPower = (daily * 1000) / (sun * 0.8);
    const batteryCapacity = (daily * autonomy) / (voltage * 0.8);
    const controllerCurrent = panelPower / voltage;

    setResults({
      panelPower: Math.round(panelPower),
      batteryCapacity: Math.round(batteryCapacity * 10) / 10,
      controllerCurrent: Math.round(controllerCurrent * 10) / 10,
      dailyConsumption: daily,
      sunHours: sun,
      autonomyDays: autonomy,
      systemVoltage: voltage,
    });
  };

  const reset = () => {
    setInputs(INITIAL_INPUTS);
    setResults(null);
  };

  // ── Render ────────────────────────────────────────────

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* ── Header ──────────────────────────────────── */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 mb-3">
          <Sun className="w-7 h-7 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-100">
          Calculateur Solaire
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Dimensionnez votre installation solaire autonome &mdash; panneaux,
          batteries et régulateur &mdash; à partir de vos besoins quotidiens.
        </p>
      </div>

      {/* ── Main Card ───────────────────────────────── */}
      <Card className="bg-[#0d2a22] border-emerald-900/40 shadow-xl">
        <CardHeader className="border-b border-emerald-900/20 pb-4">
          <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Paramètres de dimensionnement
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consommation journalière */}
            <div className="space-y-2">
              <Label htmlFor="dailyConsumption" className="text-slate-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                Consommation journalière
              </Label>
              <div className="relative">
                <Input
                  id="dailyConsumption"
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.dailyConsumption}
                  onChange={(e) => setInput('dailyConsumption', e.target.value)}
                  placeholder="Ex: 3.5"
                  className="bg-[#071914] border-emerald-900/40 text-slate-100 placeholder:text-slate-600 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                  kWh/jour
                </span>
              </div>
            </div>

            {/* Ensoleillement */}
            <div className="space-y-2">
              <Label htmlFor="sunHours" className="text-slate-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-emerald-400" />
                Ensoleillement moyen
              </Label>
              <div className="relative">
                <Input
                  id="sunHours"
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.sunHours}
                  onChange={(e) => setInput('sunHours', e.target.value)}
                  placeholder="Ex: 5.5"
                  className="bg-[#071914] border-emerald-900/40 text-slate-100 placeholder:text-slate-600 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                  h/jour
                </span>
              </div>
            </div>

            {/* Autonomie */}
            <div className="space-y-2">
              <Label htmlFor="autonomyDays" className="text-slate-300 flex items-center gap-1.5">
                <Battery className="w-4 h-4 text-emerald-400" />
                Autonomie souhaitée
              </Label>
              <div className="relative">
                <Input
                  id="autonomyDays"
                  type="number"
                  min="0"
                  step="1"
                  value={inputs.autonomyDays}
                  onChange={(e) => setInput('autonomyDays', e.target.value)}
                  placeholder="Ex: 2"
                  className="bg-[#071914] border-emerald-900/40 text-slate-100 placeholder:text-slate-600 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                  jours
                </span>
              </div>
            </div>

            {/* Tension système */}
            <div className="space-y-2">
              <Label htmlFor="systemVoltage" className="text-slate-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                Tension système
              </Label>
              <Select
                value={inputs.systemVoltage}
                onValueChange={(val) => setInput('systemVoltage', val)}
              >
                <SelectTrigger
                  id="systemVoltage"
                  className="bg-[#071914] border-emerald-900/40 text-slate-100"
                >
                  <SelectValue placeholder="Choisir la tension" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d2a22] border-emerald-900/40 text-slate-100">
                  <SelectItem value="12">12 V &mdash; Petite installation</SelectItem>
                  <SelectItem value="24">24 V &mdash; Installation moyenne</SelectItem>
                  <SelectItem value="48">48 V &mdash; Grande installation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              onClick={calculate}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
            >
              <Calculator className="w-4 h-4" />
              Calculer
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              className="flex-1 border-emerald-900/40 text-slate-300 hover:bg-[#071914] hover:text-slate-100 gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Results ─────────────────────────────────── */}
      {results && (
        <>
          {/* Results Summary */}
          <Card className="bg-[#0d2a22] border-emerald-900/40 shadow-xl">
            <CardHeader className="border-b border-emerald-900/20 pb-4">
              <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                  Résultats
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Panels */}
                <div className="bg-[#071914] rounded-xl p-5 border border-emerald-900/30 text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 mx-auto">
                    <Sun className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-300">
                    {results.panelPower}
                    <span className="text-base font-normal text-slate-400 ml-1">W</span>
                  </div>
                  <p className="text-xs text-slate-500">Puissance panneaux</p>
                </div>

                {/* Batteries */}
                <div className="bg-[#071914] rounded-xl p-5 border border-emerald-900/30 text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 mx-auto">
                    <Battery className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-300">
                    {results.batteryCapacity}
                    <span className="text-base font-normal text-slate-400 ml-1">Ah</span>
                  </div>
                  <p className="text-xs text-slate-500">Capacité batteries</p>
                </div>

                {/* Regulateur */}
                <div className="bg-[#071914] rounded-xl p-5 border border-emerald-900/30 text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 mx-auto">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-300">
                    {results.controllerCurrent}
                    <span className="text-base font-normal text-slate-400 ml-1">A</span>
                  </div>
                  <p className="text-xs text-slate-500">Courant régulateur</p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 text-xs text-slate-500 text-center space-y-1">
                <p>
                  Pour une consommation de <strong className="text-slate-300">{results.dailyConsumption} kWh/j</strong>,
                  avec <strong className="text-slate-300">{results.sunHours} h</strong> d&rsquo;ensoleillement,
                  <strong className="text-slate-300"> {results.autonomyDays} jour(s)</strong> d&rsquo;autonomie
                  et une tension de <strong className="text-slate-300">{results.systemVoltage} V</strong>.
                </p>
                <p className="text-emerald-600/60">
                  Ajoutez une marge de 25 % sur le courant du régulateur lors du choix du matériel.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── Info Cards ───────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INFO_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.title}
                  className="bg-[#0d2a22] border-emerald-900/30 shadow-lg"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-emerald-300 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <code className="block text-xs text-emerald-400/80 bg-[#071914] rounded px-2 py-1.5 font-mono">
                      {card.formula}
                    </code>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {card.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ── Resource & Info Section ──────────────────── */}
      {!results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INFO_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="bg-[#0d2a22] border-emerald-900/30 shadow-lg"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-emerald-300 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-emerald-400" />
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <code className="block text-xs text-emerald-400/80 bg-[#071914] rounded px-2 py-1.5 font-mono">
                    {card.formula}
                  </code>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Solar Map Link ──────────────────────────── */}
      <Card className="bg-[#0d2a22] border-emerald-900/30 shadow-lg">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                Ressource solaire au Sénégal
              </p>
              <p className="text-xs text-slate-500">
                Consultez la carte Global Solar Atlas pour connaître l&rsquo;ensoleillement
                moyen de votre localité.
              </p>
            </div>
          </div>
          <a
            href="https://globalsolaratlas.info/map?c=14.497401,-14.452637,7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors shrink-0"
          >
            Voir la carte
            <ExternalLink className="w-4 h-4" />
          </a>
        </CardContent>
      </Card>

      {/* ── Practical Tips ──────────────────────────── */}
      <Card className="bg-[#0d2a22] border-emerald-900/30 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-emerald-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" />
            Conseils pratiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex gap-2">
              <span className="text-emerald-500 mt-0.5">&bull;</span>
              <span>
                <strong className="text-slate-300">Orientation des panneaux :</strong> au Sénégal,
                orientez vos panneaux vers le sud avec une inclinaison de 15&deg; &agrave; 20&deg;.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500 mt-0.5">&bull;</span>
              <span>
                <strong className="text-slate-300">Câblage :</strong> utilisez des sections de c&acirc;ble
                adapt&eacute;es pour minimiser les chutes de tension, surtout en 12 V.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500 mt-0.5">&bull;</span>
              <span>
                <strong className="text-slate-300">R&eacute;gulateur :</strong> pr&eacute;f&eacute;rez un
                r&eacute;gulateur MPPT pour un gain de rendement de 15 &agrave; 30 % par rapport &agrave;
                un PWM.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500 mt-0.5">&bull;</span>
              <span>
                <strong className="text-slate-300">Entretien :</strong> nettoyez r&eacute;guli&egrave;rement
                vos panneaux pour &eacute;viter les pertes li&eacute;es &agrave; la poussi&egrave;re
                (jusqu&rsquo;&agrave; 20 % de perte).
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
