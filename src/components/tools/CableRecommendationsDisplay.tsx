/**
 * 🔌 CableRecommendationsDisplay — Affichage des recommandations de sections de câbles
 *
 * Affiche les recommandations automatiques de sections de câbles selon NF C 15-100
 * avec analyse de conformité et suggestions d'optimisation
 */

import React from 'react';
import { Cable, AlertTriangle, CheckCircle, XCircle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CableRecommendation {
  tronçonId: string;
  courant: number;
  sectionRecommandee: number;
  sectionMinimale: number;
  materiau: 'Cu' | 'Al';
  raison: string;
  conformite: 'CONFORME' | 'AVERTISSEMENT' | 'NON_CONFORME';
}

interface CableRecommendationsDisplayProps {
  recommandations: CableRecommendation[];
}

export const CableRecommendationsDisplay: React.FC<CableRecommendationsDisplayProps> = ({
  recommandations
}) => {
  const getConformityIcon = (conformite: string) => {
    switch (conformite) {
      case 'CONFORME': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'AVERTISSEMENT': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'NON_CONFORME': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Zap className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConformityColor = (conformite: string) => {
    switch (conformite) {
      case 'CONFORME': return 'text-green-700 bg-green-50 border-green-200';
      case 'AVERTISSEMENT': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'NON_CONFORME': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getMaterialIcon = (materiau: string) => {
    return materiau === 'Cu' ? '🟫' : '⚪';
  };

  const stats = {
    conforme: recommandations.filter(r => r.conformite === 'CONFORME').length,
    avertissement: recommandations.filter(r => r.conformite === 'AVERTISSEMENT').length,
    nonConforme: recommandations.filter(r => r.conformite === 'NON_CONFORME').length,
    total: recommandations.length
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cable className="w-5 h-5" />
            Recommandations de Sections de Câbles
            <Badge variant="outline" className="ml-auto">
              {stats.total} tronçon{stats.total > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-green-600 font-semibold">{stats.conforme}</div>
              <div className="text-slate-500">Conformes</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-600 font-semibold">{stats.avertissement}</div>
              <div className="text-slate-500">Avertissements</div>
            </div>
            <div className="text-center">
              <div className="text-red-600 font-semibold">{stats.nonConforme}</div>
              <div className="text-slate-500">Non conformes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des recommandations */}
      <div className="space-y-3">
        {recommandations.map((rec, index) => (
          <Card key={index} className={`border ${getConformityColor(rec.conformite)}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getConformityIcon(rec.conformite)}
                    <span className="font-medium text-sm">{rec.tronçonId}</span>
                    <Badge variant="outline" className="text-xs">
                      {getMaterialIcon(rec.materiau)} {rec.materiau}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2">
                    <div>
                      <span className="text-slate-500">Courant:</span>
                      <div className="font-medium">{rec.courant.toFixed(1)} A</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Section min:</span>
                      <div className="font-medium">{rec.sectionMinimale} mm²</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Recommandée:</span>
                      <div className="font-medium">{rec.sectionRecommandee} mm²</div>
                    </div>
                    <div>
                      <span className="text-slate-500">État:</span>
                      <div className="font-medium capitalize">{rec.conformite.toLowerCase()}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                    {rec.raison}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Résumé et conseils */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Conseils d'optimisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {stats.nonConforme > 0 && (
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>{stats.nonConforme} tronçon{stats.nonConforme > 1 ? 's' : ''} non conforme{stats.nonConforme > 1 ? 's' : ''}:</strong> Les sections actuelles sont insuffisantes pour le courant transporté. Risque de surchauffe et non-conformité NF C 15-100.
                </span>
              </div>
            )}

            {stats.avertissement > 0 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>{stats.avertissement} tronçon{stats.avertissement > 1 ? 's' : ''} avec avertissement{stats.avertissement > 1 ? 's' : ''}:</strong> Les sections actuelles sont acceptables mais une marge de sécurité limitée est recommandée.
                </span>
              </div>
            )}

            {stats.conforme > 0 && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>{stats.conforme} tronçon{stats.conforme > 1 ? 's' : ''} conforme{stats.conforme > 1 ? 's' : ''}:</strong> Sections adaptées avec bonne marge de sécurité.
                </span>
              </div>
            )}

            <div className="flex items-start gap-2 mt-4 pt-2 border-t">
              <Cable className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Recommandations générales:</strong> Privilégiez le cuivre pour les faibles sections et l'aluminium pour les fortes sections. Vérifiez toujours les conditions d'installation (méthode C utilisée ici).
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};