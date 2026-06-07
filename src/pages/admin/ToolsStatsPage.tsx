/**
 * ToolsStatsPage.tsx
 * Page admin de statistiques d'utilisation des outils
 */
import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Wrench,
  Eye,
  Lock,
  Download,
  Trash2,
  RefreshCw,
  Calendar,
  Settings,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';
import { freeApps, premiumApps } from '@/data/applications-catalog';

const allApps = [...freeApps, ...premiumApps];
const appMap = new Map(allApps.map((a) => [a.id, a]));

export default function ToolsStatsPage() {
  const { getStats, clearStats } = useToolAnalytics();
  const [refreshKey, setRefreshKey] = useState(0);

  const stats = useMemo(() => getStats(), [refreshKey, getStats]);

  const sortedByOpens = useMemo(
    () =>
      Object.entries(stats.byTool)
        .sort(([, a], [, b]) => b.opens - a.opens)
        .map(([id, s]) => ({ id, ...s, app: appMap.get(id) })),
    [stats.byTool],
  );

  const totalOpens = sortedByOpens.reduce((sum, t) => sum + t.opens, 0);
  const totalBlocked = sortedByOpens.reduce((sum, t) => sum + t.blocked, 0);
  const totalExports = sortedByOpens.reduce((sum, t) => sum + t.exports, 0);
  const dailyEntries = Object.entries(stats.byDay).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
              <span>Administration</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-medium text-slate-800">Stats outils</span>
              <span className="text-slate-300 mx-1">|</span>
              <a
                href="/admin/tools-manager"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                <Settings className="w-3.5 h-3.5" />
                Gestion
              </a>
              <span className="text-slate-300 mx-1">|</span>
              <a
                href="/outils"
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Voir les outils
              </a>
            </nav>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-blue-600" />
              Statistiques des outils
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Actualiser
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                clearStats();
                setRefreshKey((k) => k + 1);
              }}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          </div>
        </div>

        {/* Cartes résumé */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{totalOpens}</div>
                <div className="text-xs text-slate-500 font-medium">Ouvertures</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{totalBlocked}</div>
                <div className="text-xs text-slate-500 font-medium">Blocages premium</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{totalExports}</div>
                <div className="text-xs text-slate-500 font-medium">Exports</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{stats.uniqueTools}</div>
                <div className="text-xs text-slate-500 font-medium">Outils utilisés</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classement des outils */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Top outils les plus ouverts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedByOpens.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Aucune donnée pour le moment. Utilisez des outils pour voir les statistiques.
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedByOpens.slice(0, 10).map((tool, i) => (
                    <div
                      key={tool.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-bold text-slate-400 w-5 text-right">
                          #{i + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800 truncate">
                            {tool.app?.title || tool.id}
                          </div>
                          <div className="text-[10px] text-slate-400">{tool.app?.group || ''}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant="secondary" className="text-xs">
                          {tool.opens} ouverts
                        </Badge>
                        {tool.blocked > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs text-amber-600 border-amber-200"
                          >
                            {tool.blocked} bloqués
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activité quotidienne */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Activité quotidienne
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyEntries.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">Aucune activité récente.</p>
              ) : (
                <div className="space-y-1">
                  {dailyEntries.slice(0, 14).map(([day, count]) => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-500 w-24">
                        {new Date(day + 'T00:00:00').toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (count / Math.max(...dailyEntries.slice(0, 14).map(([, c]) => c))) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tableau détaillé */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Détail par outil</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedByOpens.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Aucune donnée collectée. Les analytics sont stockées localement dans votre
                navigateur.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                        Outil
                      </th>
                      <th className="text-center py-2 px-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                        Ouvertures
                      </th>
                      <th className="text-center py-2 px-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                        Blocages
                      </th>
                      <th className="text-center py-2 px-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                        Exports
                      </th>
                      <th className="text-center py-2 px-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedByOpens.map((tool) => (
                      <tr key={tool.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3">
                          <span className="font-medium text-slate-800">
                            {tool.app?.title || tool.id}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-2">
                            {tool.app?.group || ''}
                          </span>
                        </td>
                        <td className="text-center py-2 px-3 font-semibold text-blue-600">
                          {tool.opens}
                        </td>
                        <td className="text-center py-2 px-3 font-semibold text-amber-600">
                          {tool.blocked || '—'}
                        </td>
                        <td className="text-center py-2 px-3 font-semibold text-green-600">
                          {tool.exports || '—'}
                        </td>
                        <td className="text-center py-2 px-3 font-semibold text-slate-800">
                          {tool.opens + tool.blocked + tool.exports}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-slate-400 text-center mt-6">
          Toutes les données sont stockées localement dans votre navigateur (localStorage). Les
          analytics sont réinitialisées si vous effacez vos données de navigation.
        </p>
      </div>
    </div>
  );
}
