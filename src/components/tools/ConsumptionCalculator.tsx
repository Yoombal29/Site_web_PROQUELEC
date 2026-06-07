/**
 * CALCULATRICE DE CONSOMMATION ÉNERGÉTIQUE — PROQUELEC
 *
 * Estime la consommation électrique mensuelle d'un logement
 * et fournit des conseils personnalisés d'optimisation.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calculator,
  Zap,
  Lightbulb,
  Tv,
  Wind,
  Snowflake,
  Droplets,
  Clock,
  Trash2,
  CheckCircle,
  Info,
  RotateCcw,
} from 'lucide-react';
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

// ════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════

interface EquipmentConfig {
  name: string;
  powerWatts: number;
  hoursPerDay: number;
  icon: React.ReactNode;
  key: string;
}

interface CalculationResult {
  monthlyConsumption: number;
  monthlyCost: number;
  aiAdvice: string;
  timestamp: string;
  surface: number;
  occupants: number;
  housingType: string;
  equipmentBreakdown: { name: string; monthlyKwh: number }[];
}

interface HistoryEntry extends CalculationResult {
  id: string;
}

// ════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════

const PRICE_PER_KWH = 85; // FCFA

const EQUIPMENT_LIST: Omit<EquipmentConfig, 'icon'>[] = [
  { name: 'Réfrigérateur', powerWatts: 150, hoursPerDay: 24, key: 'fridge' },
  { name: 'Climatisation', powerWatts: 2000, hoursPerDay: 8, key: 'ac' },
  { name: 'Éclairage LED', powerWatts: 10, hoursPerDay: 6, key: 'lighting' },
  { name: 'TV', powerWatts: 100, hoursPerDay: 6, key: 'tv' },
  { name: 'Machine à laver', powerWatts: 2000, hoursPerDay: 2, key: 'washer' },
];

const HOUSING_TYPES = [
  { value: 'Appartement', label: 'Appartement' },
  { value: 'Maison individuelle', label: 'Maison individuelle' },
  { value: 'Villa', label: 'Villa' },
];

const HISTORY_KEY = 'proquelec_consumption_history';

// ════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════

export default function ConsumptionCalculator() {
  // État du formulaire
  const [surface, setSurface] = useState('120');
  const [occupants, setOccupants] = useState('4');
  const [housingType, setHousingType] = useState('Appartement');

  // État des équipements
  const [equipmentQty, setEquipmentQty] = useState<Record<string, string>>({
    fridge: '1',
    ac: '1',
    lighting: '1',
    tv: '1',
    washer: '1',
  });

  // État des résultats
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Charger l'historique au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignorer les erreurs de parsing
    }
  }, []);

  // Persister l'historique
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Ignorer les erreurs de stockage
    }
  }, [history]);

  // Icônes par équipement
  const getEquipmentIcon = (key: string, className: string) => {
    switch (key) {
      case 'fridge':
        return <Snowflake className={className} />;
      case 'ac':
        return <Wind className={className} />;
      case 'lighting':
        return <Lightbulb className={className} />;
      case 'tv':
        return <Tv className={className} />;
      case 'washer':
        return <Droplets className={className} />;
      default:
        return <Zap className={className} />;
    }
  };

  // Générer le conseil IA
  const generateAdvice = (
    consumption: number,
    housingType: string,
    equipBreakdown: { name: string; monthlyKwh: number }[],
  ): string => {
    const sorted = [...equipBreakdown].sort((a, b) => b.monthlyKwh - a.monthlyKwh);
    const topConsumer = sorted[0];

    let advice = '';

    if (consumption > 800) {
      advice =
        "Votre consommation est élevée. Envisagez l'installation de panneaux solaires et le remplacement des équipements énergivores par des modèles plus efficaces (classe A++ ou supérieure).";
    } else if (consumption > 400) {
      advice =
        'Votre consommation est modérée. Pour réduire votre facture, privilégiez les appareils à haute efficacité énergétique et adoptez des gestes simples comme éteindre les veilles.';
    } else {
      advice =
        "Votre consommation est bien maîtrisée. Continuez à utiliser des équipements économes et pensez à vérifier régulièrement l'état de vos installations.";
    }

    if (topConsumer) {
      advice += ` L'équipement le plus consommateur est "${topConsumer.name}" (${Math.round(topConsumer.monthlyKwh)} kWh/mois).`;
    }

    if (housingType === 'Villa' && consumption > 600) {
      advice +=
        " Pour une villa, l'isolation thermique et l'orientation solaire peuvent significativement réduire vos besoins en climatisation.";
    }

    return advice;
  };

  // Calcul principal
  const calculateConsumption = useCallback(() => {
    setIsCalculating(true);

    // Simuler un délai de chargement
    setTimeout(() => {
      const surfaceVal = parseFloat(surface) || 0;
      const occupantsVal = parseInt(occupants) || 0;

      // Consommation de base (logement)
      const housingConsumption = surfaceVal * 15 + occupantsVal * 50; // kWh/mois

      // Consommation des équipements
      const equipmentBreakdown: { name: string; monthlyKwh: number }[] = [];
      let equipmentTotal = 0;

      EQUIPMENT_LIST.forEach((eq) => {
        const qty = parseInt(equipmentQty[eq.key]) || 0;
        const dailyWh = eq.powerWatts * eq.hoursPerDay * qty;
        const monthlyKwh = (dailyWh / 1000) * 30;
        equipmentTotal += monthlyKwh;
        equipmentBreakdown.push({ name: eq.name, monthlyKwh });
      });

      const monthlyConsumption = housingConsumption + equipmentTotal;
      const monthlyCost = monthlyConsumption * PRICE_PER_KWH;

      const aiAdvice = generateAdvice(monthlyConsumption, housingType, equipmentBreakdown);

      const newResult: CalculationResult = {
        monthlyConsumption,
        monthlyCost,
        aiAdvice,
        timestamp: new Date().toISOString(),
        surface: surfaceVal,
        occupants: occupantsVal,
        housingType,
        equipmentBreakdown,
      };

      setResult(newResult);

      // Ajouter à l'historique
      const entry: HistoryEntry = {
        ...newResult,
        id: crypto.randomUUID?.() || Date.now().toString(),
      };
      setHistory((prev) => {
        const updated = [entry, ...prev];
        return updated.slice(0, 20); // Garder max 20 entrées
      });

      setIsCalculating(false);
    }, 1200);
  }, [surface, occupants, housingType, equipmentQty]);

  // Mettre à jour la quantité d'équipement
  const updateEquipmentQty = (key: string, value: string) => {
    setEquipmentQty((prev) => ({ ...prev, [key]: value }));
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSurface('120');
    setOccupants('4');
    setHousingType('Appartement');
    setEquipmentQty({
      fridge: '1',
      ac: '1',
      lighting: '1',
      tv: '1',
      washer: '1',
    });
    setResult(null);
  };

  // Effacer l'historique
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  // Formater le nombre en FCFA
  const formatCurrency = (value: number): string => {
    return Math.round(value).toLocaleString('fr-FR') + ' FCFA';
  };

  // Formater la date
  const formatDate = (iso: string): string => {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* FORMULAIRE DE SAISIE */}
      <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <Calculator className="w-5 h-5" />
            Simulateur de Consommation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* INFORMATIONS SUR LE LOGEMENT */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Informations sur le logement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surface" className="text-slate-300 font-medium">
                  Surface (m²)
                </Label>
                <Input
                  id="surface"
                  type="number"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  placeholder="120"
                  min="0"
                  className="bg-emerald-900/20 border-emerald-800/40 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupants" className="text-slate-300 font-medium">
                  Nombre d'occupants
                </Label>
                <Input
                  id="occupants"
                  type="number"
                  value={occupants}
                  onChange={(e) => setOccupants(e.target.value)}
                  placeholder="4"
                  min="0"
                  className="bg-emerald-900/20 border-emerald-800/40 text-white"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="housingType" className="text-slate-300 font-medium">
                  Type de logement
                </Label>
                <Select value={housingType} onValueChange={setHousingType}>
                  <SelectTrigger
                    id="housingType"
                    className="bg-emerald-900/20 border-emerald-800/40 text-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOUSING_TYPES.map((ht) => (
                      <SelectItem key={ht.value} value={ht.value}>
                        {ht.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ÉQUIPEMENTS ÉLECTRIQUES */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Équipements électriques
            </h3>
            <div className="space-y-2">
              {EQUIPMENT_LIST.map((eq) => (
                <div
                  key={eq.key}
                  className="flex items-center justify-between p-3 rounded-lg bg-emerald-900/10 border border-emerald-800/30"
                >
                  <div className="flex items-center gap-2">
                    {getEquipmentIcon(eq.key, 'w-4 h-4 text-emerald-400')}
                    <Label className="text-slate-200 text-sm cursor-pointer">
                      {eq.name}
                      <span className="text-xs text-slate-400 ml-1">
                        ({eq.powerWatts}W × {eq.hoursPerDay}h/j)
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={equipmentQty[eq.key] || '0'}
                      onChange={(e) => updateEquipmentQty(eq.key, e.target.value)}
                      min="0"
                      className="w-20 h-9 bg-emerald-900/20 border-emerald-800/40 text-white text-center"
                    />
                    <span className="text-xs text-slate-400 w-4">pc(s)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOUTONS D'ACTION */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={calculateConsumption}
              disabled={isCalculating}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              {isCalculating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Calcul en cours...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Calculer la Consommation
                </>
              )}
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              className="border-emerald-800/40 text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RÉSULTATS ET HISTORIQUE */}
      <div className="space-y-6">
        {/* RÉSULTATS */}
        <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              Résultats de l'Analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Calculator className="w-12 h-12 mb-4 opacity-40" />
                <p className="text-sm">
                  Remplissez le formulaire et cliquez sur "Calculer la Consommation"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* CONSOMMATION MENSUELLE */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-900/10 border border-emerald-800/30">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-300">Consommation mensuelle</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-400">
                    {Math.round(result.monthlyConsumption)} kWh
                  </span>
                </div>

                {/* COÛT MENSUEL */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-900/10 border border-emerald-800/30">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-300">Coût mensuel estimé</span>
                  </div>
                  <span className="text-xl font-bold text-amber-400">
                    {formatCurrency(result.monthlyCost)}
                  </span>
                </div>

                {/* DÉTAIL PAR ÉQUIPEMENT */}
                <details className="group">
                  <summary className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
                    <Info className="w-4 h-4" />
                    Détail par équipement
                  </summary>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between items-center py-1 text-xs text-slate-500 border-b border-emerald-900/30">
                      <span>Équipement</span>
                      <span>kWh/mois</span>
                    </div>
                    {result.equipmentBreakdown.map((item) => (
                      <div
                        key={item.name}
                        className="flex justify-between items-center py-1 text-sm text-slate-300"
                      >
                        <span>{item.name}</span>
                        <span className="font-mono">{Math.round(item.monthlyKwh)} kWh</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-1.5 text-sm font-semibold text-emerald-300 border-t border-emerald-800/40 mt-1">
                      <span>Total base + équipements</span>
                      <span>{Math.round(result.monthlyConsumption)} kWh</span>
                    </div>
                  </div>
                </details>

                {/* CONSEIL PROQUELEC */}
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-300 mb-1">Conseil PROQUELEC</p>
                      <p className="text-sm text-slate-300">{result.aiAdvice}</p>
                    </div>
                  </div>
                </div>

                {/* BADGE DE NIVEAU */}
                <div className="flex justify-center">
                  <Badge
                    className={
                      result.monthlyConsumption > 800
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : result.monthlyConsumption > 400
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }
                  >
                    {result.monthlyConsumption > 800
                      ? 'Consommation élevée'
                      : result.monthlyConsumption > 400
                        ? 'Consommation modérée'
                        : 'Consommation faible'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* HISTORIQUE */}
        <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-emerald-400 text-lg">
              <Clock className="w-5 h-5" />
              Historique des simulations
            </CardTitle>
            {history.length > 0 && (
              <Button
                onClick={clearHistory}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Effacer
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-6">Aucun calcul sauvegardé</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg bg-emerald-900/10 border border-emerald-800/30 hover:bg-emerald-900/20 transition-colors cursor-pointer"
                    onClick={() => setResult(entry)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-200">
                        {Math.round(entry.monthlyConsumption)} kWh
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(entry.timestamp)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-slate-400">
                        {entry.surface} m² · {entry.occupants} occ. · {entry.housingType}
                      </span>
                      <span className="text-xs font-medium text-amber-400">
                        {formatCurrency(entry.monthlyCost)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
