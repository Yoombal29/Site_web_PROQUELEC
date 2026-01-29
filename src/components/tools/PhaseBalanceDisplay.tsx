/**
 * ⚖️ PhaseBalanceDisplay — Affichage de l'équilibrage des phases triphasées
 *
 * Visualise la répartition des charges sur les phases R, S, T
 * selon NF C 15-100 pour optimiser l'équilibrage et minimiser les courants de neutre
 */

import React from 'react';
import { Zap, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PhaseBalance } from '@/engines/NetworkEngine';

interface PhaseBalanceDisplayProps {
  phaseBalance: PhaseBalance;
}

export const PhaseBalanceDisplay: React.FC<PhaseBalanceDisplayProps> = ({
  phaseBalance
}) => {
  const { phaseR, phaseS, phaseT, desequilibrePercent, recommandations } = phaseBalance;

  // Calculer les pourcentages pour les barres de progression
  const totalPower = phaseR.puissanceTotale + phaseS.puissanceTotale + phaseT.puissanceTotale;
  const getPercentage = (power: number) => totalPower > 0 ? (power / totalPower) * 100 : 0;

  const getBalanceColor = (percent: number) => {
    if (percent <= 10) return 'text-green-600';
    if (percent <= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBalanceIcon = (percent: number) => {
    if (percent <= 10) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (percent <= 20) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  const formatPower = (power: number) => `${power.toFixed(0)}W`;
  const formatCurrent = (current: number) => `${current.toFixed(1)}A`;

  return (
    <div className="space-y-4">
      {/* En-tête avec statut global */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Équilibrage des Phases Triphasées
            {getBalanceIcon(desequilibrePercent)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Déséquilibre</div>
              <div className={`text-2xl font-bold ${getBalanceColor(desequilibrePercent)}`}>
                {desequilibrePercent.toFixed(1)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Puissance totale</div>
              <div className="text-xl font-semibold">{formatPower(totalPower)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Répartition par phase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Phase R */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Phase R
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Puissance</span>
                <span className="font-medium">{formatPower(phaseR.puissanceTotale)}</span>
              </div>
              <Progress value={getPercentage(phaseR.puissanceTotale)} className="h-2" />
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Courant: </span>
              <span className="font-medium">{formatCurrent(phaseR.courantTotal)}</span>
            </div>
            <div className="text-xs text-slate-500">
              {phaseR.charges.length} charge{phaseR.charges.length > 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>

        {/* Phase S */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              Phase S
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Puissance</span>
                <span className="font-medium">{formatPower(phaseS.puissanceTotale)}</span>
              </div>
              <Progress value={getPercentage(phaseS.puissanceTotale)} className="h-2" />
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Courant: </span>
              <span className="font-medium">{formatCurrent(phaseS.courantTotal)}</span>
            </div>
            <div className="text-xs text-slate-500">
              {phaseS.charges.length} charge{phaseS.charges.length > 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>

        {/* Phase T */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Phase T
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Puissance</span>
                <span className="font-medium">{formatPower(phaseT.puissanceTotale)}</span>
              </div>
              <Progress value={getPercentage(phaseT.puissanceTotale)} className="h-2" />
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Courant: </span>
              <span className="font-medium">{formatCurrent(phaseT.courantTotal)}</span>
            </div>
            <div className="text-xs text-slate-500">
              {phaseT.charges.length} charge{phaseT.charges.length > 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations */}
      {recommandations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recommandations d'équilibrage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommandations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Zap className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Détails des charges par phase */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Détail des charges par phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Phase R détaillée */}
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Phase R
              </h4>
              <div className="space-y-1">
                {phaseR.charges.map((charge, index) => (
                  <div key={index} className="text-xs bg-red-50 p-2 rounded">
                    <div className="font-medium">{charge.nom}</div>
                    <div className="text-slate-600">
                      {formatPower(charge.puissance)} • {formatCurrent(charge.courantNominal)}
                    </div>
                  </div>
                ))}
                {phaseR.charges.length === 0 && (
                  <div className="text-xs text-slate-500 italic">Aucune charge</div>
                )}
              </div>
            </div>

            {/* Phase S détaillée */}
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Phase S
              </h4>
              <div className="space-y-1">
                {phaseS.charges.map((charge, index) => (
                  <div key={index} className="text-xs bg-yellow-50 p-2 rounded">
                    <div className="font-medium">{charge.nom}</div>
                    <div className="text-slate-600">
                      {formatPower(charge.puissance)} • {formatCurrent(charge.courantNominal)}
                    </div>
                  </div>
                ))}
                {phaseS.charges.length === 0 && (
                  <div className="text-xs text-slate-500 italic">Aucune charge</div>
                )}
              </div>
            </div>

            {/* Phase T détaillée */}
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Phase T
              </h4>
              <div className="space-y-1">
                {phaseT.charges.map((charge, index) => (
                  <div key={index} className="text-xs bg-blue-50 p-2 rounded">
                    <div className="font-medium">{charge.nom}</div>
                    <div className="text-slate-600">
                      {formatPower(charge.puissance)} • {formatCurrent(charge.courantNominal)}
                    </div>
                  </div>
                ))}
                {phaseT.charges.length === 0 && (
                  <div className="text-xs text-slate-500 italic">Aucune charge</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};