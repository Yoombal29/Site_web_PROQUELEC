import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileCode, FileText, Download, Copy, Check, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { apiFetch } from '@/lib/api-client';
import type { Block } from '@/types/builder';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blocks: Block[];
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  blocks,
}) => {
  const [format, setFormat] = useState<'react' | 'html' | 'json'>('react');
  const [enhance, setEnhance] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string; format: string; blockCount: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiFetch<{ success: boolean; code: string; format: string; blockCount: number }>('/api/ai/export', {
        method: 'POST',
        body: JSON.stringify({ blocks, format, enhance }),
      });
      if (res.success) {
        setResult(res);
      } else {
        setError('Échec de l\'export');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  const handleDownload = () => {
    if (!result) return;
    const ext = result.format === 'react' ? 'tsx' : result.format === 'html' ? 'html' : 'json';
    const blob = new Blob([result.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-export.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatLabels: Record<string, string> = {
    react: 'React (TSX)',
    html: 'HTML + Tailwind',
    json: 'JSON (production)',
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setResult(null); setError(null); } onOpenChange(o); }}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileCode className="w-5 h-5 text-blue-600" />
            Export Engine
          </DialogTitle>
          <DialogDescription>
            Exportez votre page en code React, HTML ou JSON — prêt à déployer.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Format</label>
                <Select value={format} onValueChange={(v: 'react' | 'html' | 'json') => setFormat(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react">React (TSX) — Composant Tailwind</SelectItem>
                    <SelectItem value="html">HTML + Tailwind CDN</SelectItem>
                    <SelectItem value="json">JSON minifié (production)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {format === 'react' && (
                <div className="flex items-center gap-2 pt-5">
                  <Switch id="enhance" checked={enhance} onCheckedChange={setEnhance} />
                  <label htmlFor="enhance" className="text-xs font-medium text-slate-500 flex items-center gap-1 cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    IA Enhancement
                  </label>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded border text-xs text-slate-500">
              <strong className="text-slate-700">{blocks.length} bloc{blocks.length > 1 ? 's' : ''}</strong> à exporter
              {format === 'react' && ' — Génère un composant React avec Tailwind CSS'}
              {format === 'html' && ' — Génère une page HTML autonome avec Tailwind CDN'}
              {format === 'json' && ' — Génère le JSON minifié pour production'}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isExporting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Export...</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" /> Exporter</>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Export {formatLabels[result.format]} — {result.blockCount} blocs
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? <><Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copié</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Copier</>}
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="w-3.5 h-3.5 mr-1" /> Télécharger
                </Button>
              </div>
            </div>

            <Tabs defaultValue="code">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
              </TabsList>
              <TabsContent value="code" className="border rounded">
                <pre className="bg-slate-950 text-slate-50 p-4 rounded text-xs font-mono overflow-auto max-h-[500px] whitespace-pre-wrap">
                  {result.code}
                </pre>
              </TabsContent>
              <TabsContent value="preview" className="border rounded">
                {result.format === 'html' ? (
                  <iframe
                    srcDoc={result.code}
                    className="w-full h-[500px] rounded"
                    title="Preview"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    {result.format === 'react'
                      ? 'Aperçu disponible uniquement pour le format HTML.'
                      : 'Aperçu non disponible pour le format JSON.'}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setResult(null); setError(null); }}>
                Nouvel export
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
