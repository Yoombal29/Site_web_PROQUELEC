/**
 * Dashboard RAG — État, statistiques et test de recherche
 */
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Database, Brain, RefreshCw, FileText, Check, X } from 'lucide-react';

interface Chunk {
  id: string;
  text: string;
  metadata: {
    source: string;
    section?: string;
    sourcesFusionnees?: string[];
    nbSources?: number;
  };
}

interface RagStats {
  initialized: boolean;
  totalChunks: number;
  sources: Record<string, number>;
}

export default function AdminRagDashboard() {
  const [stats, setStats] = useState<RagStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Chunk[]>([]);
  const [searching, setSearching] = useState(false);
  const [expandedChunk, setExpandedChunk] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/rag/status');
      if (res.ok) setStats(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadStats(); }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    try {
      const res = await fetch('/api/rag/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 10, deduplicate: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.chunks || []);
      }
    } catch {}
    setSearching(false);
  };

  const handleReload = async () => {
    toast.info('Rechargement de la base de connaissances...');
    try {
      await fetch('/api/rag/reload', { method: 'POST' });
      toast.success('Base rechargée');
      loadStats();
    } catch {
      toast.error('Erreur de rechargement');
    }
  };

  const sourcesList = stats?.sources ? Object.entries(stats.sources).sort((a, b) => b[1] - a[1]) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard RAG</h2>
          <p className="text-sm text-muted-foreground">Moteur de recherche vectoriel — État et tests</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReload} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Recharger
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Total chunks</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-black flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              {stats?.totalChunks?.toLocaleString() || '...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Sources</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-black flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              {sourcesList.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Statut</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xl font-black flex items-center gap-2">
              {stats?.initialized ? <><Check className="w-5 h-5 text-green-500" /> Prêt</> : <><X className="w-5 h-5 text-red-500" /> Non initialisé</>}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Providers IA</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-black flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <a href="/expert/ai-providers" className="hover:underline text-blue-600">12 config.</a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sources */}
      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-medium">Sources documentaires</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {sourcesList.map(([src, count]) => (
              <div key={src} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-xs">
                <span className="truncate font-medium" title={src}>{src.replace(/\.[^.]+$/, '').substring(0, 30)}</span>
                <Badge variant="outline" className="ml-2 shrink-0 text-[10px]">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test de recherche */}
      <Card>
        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-medium">Test de recherche</CardTitle></CardHeader>
        <CardContent className="p-4 pt-4 space-y-4">
          <div className="flex gap-3">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ex: consignation électrique, schéma TT, habilitation B0..."
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Chercher
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{results.length} résultat(s)</p>
              {results.map((chunk, i) => (
                <div key={chunk.id || i} className="border rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[9px]">{chunk.metadata.source}</Badge>
                      {chunk.metadata.nbSources && chunk.metadata.nbSources > 1 && (
                        <Badge className="bg-amber-100 text-amber-800 text-[9px]">{chunk.metadata.nbSources} sources</Badge>
                      )}
                      {chunk.metadata.section && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[300px]">{chunk.metadata.section}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{chunk.text.length}c</span>
                  </div>
                  <div className="relative">
                    <p className={`text-xs text-slate-700 leading-relaxed ${expandedChunk !== chunk.id ? 'line-clamp-3' : ''}`}>
                      {chunk.text}
                    </p>
                    {chunk.text.length > 300 && (
                      <button
                        onClick={() => setExpandedChunk(expandedChunk === chunk.id ? null : chunk.id)}
                        className="text-[10px] text-blue-600 hover:underline mt-0.5"
                      >
                        {expandedChunk === chunk.id ? 'Réduire' : 'Lire plus...'}
                      </button>
                    )}
                  </div>
                  {chunk.metadata.sourcesFusionnees && chunk.metadata.sourcesFusionnees.length > 1 && (
                    <div className="flex gap-1 flex-wrap">
                      {chunk.metadata.sourcesFusionnees.map((s, j) => (
                        <Badge key={j} variant="outline" className="text-[8px] text-muted-foreground">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {searching && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Recherche en cours...
            </div>
          )}

          {!searching && results.length === 0 && query && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun résultat pour "{query}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
