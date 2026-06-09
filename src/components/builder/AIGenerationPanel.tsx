import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Wand2, Plus, RotateCcw } from 'lucide-react';
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
import { apiFetch } from '@/lib/api-client';
import type { Block } from '@/types/builder';

interface AIGenerationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (blocks: Block[]) => void;
  existingBlocks: Block[];
  pageTitle?: string;
}

const SUGGESTIONS = [
  "Crée une page d'accueil professionnelle pour une entreprise d'électricité",
  "Crée une page de présentation des services électriques (installation, maintenance, dépannage)",
  "Crée une page de conformité électrique NF C 15-100 avec les normes et certifications",
  "Crée une page de contact avec formulaire et informations",
  "Crée une section hero moderne pour PROQUELEC avec titre accrocheur",
  "Crée une page de témoignages clients pour une entreprise électrique",
  "Crée une grille de cartes présentant les formations électriques proposées",
  "Crée une page de statistiques et chiffres clés pour PROQUELEC Sénégal",
];

export const AIGenerationPanel: React.FC<AIGenerationPanelProps> = ({
  open,
  onOpenChange,
  onApply,
  existingBlocks,
  pageTitle,
}) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'new' | 'add'>('new');
  const [tone, setTone] = useState('professionnelle');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedBlocks, setGeneratedBlocks] = useState<Block[] | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedBlocks(null);
    try {
      const result = await apiFetch<{ success: boolean; blocks: Block[] }>('/api/ai/layout-generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt: prompt.trim(),
          tone,
          mode,
          existingBlocks: mode === 'add' ? existingBlocks : undefined,
          pageTitle,
        }),
      });
      if (result.success && result.blocks) {
        setGeneratedBlocks(result.blocks);
      } else {
        setError('La génération n\'a pas retourné de blocs valides.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedBlocks) return;
    const blocksWithIds = generatedBlocks.map(block => ({
      ...block,
      id: crypto.randomUUID(),
      children: block.children?.map(child => ({ ...child, id: crypto.randomUUID() })),
    }));
    onApply(blocksWithIds);
    setGeneratedBlocks(null);
    setPrompt('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setGeneratedBlocks(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="w-5 h-5 text-blue-600" />
            Générateur de Layout IA
          </DialogTitle>
          <DialogDescription>
            Décrivez la page ou la section que vous voulez créer. L'IA génère une structure JSON prête à l'emploi.
          </DialogDescription>
        </DialogHeader>

        {!generatedBlocks ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Mode</label>
                <Select value={mode} onValueChange={(v: 'new' | 'add') => setMode(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nouvelle page</SelectItem>
                    <SelectItem value="add">Ajouter à la page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Tonalité</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professionnelle">Professionnelle</SelectItem>
                    <SelectItem value="moderne">Moderne</SelectItem>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="commerciale">Commerciale</SelectItem>
                    <SelectItem value="pédagogique">Pédagogique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Description</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Crée une page d'accueil moderne pour PROQUELEC avec hero, services, statistiques et témoignages clients..."
                rows={4}
              />
            </div>

            <details className="text-xs text-slate-400">
              <summary className="cursor-pointer hover:text-slate-600">Suggestions de prompts</summary>
              <div className="mt-2 space-y-1">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(s)}
                    className="block w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </details>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Générer</>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                {generatedBlocks.length} bloc{generatedBlocks.length > 1 ? 's' : ''} généré{generatedBlocks.length > 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setGeneratedBlocks(null); setError(null); }}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Modifier le prompt
                </Button>
              </div>
            </div>

            <Tabs defaultValue="preview">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
                <TabsTrigger value="code">JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="border rounded p-4 bg-white max-h-[400px] overflow-y-auto">
                {generatedBlocks.map((block, i) => (
                  <BlockPreview key={i} block={block} depth={0} />
                ))}
              </TabsContent>
              <TabsContent value="code" className="border rounded">
                <pre className="bg-slate-950 text-slate-50 p-4 rounded text-xs font-mono overflow-auto max-h-[400px]">
                  {JSON.stringify(generatedBlocks, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setGeneratedBlocks(null); setError(null); }}>
                <RotateCcw className="w-4 h-4 mr-2" /> Re-générer
              </Button>
              <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" /> Appliquer les blocs
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const BlockPreview: React.FC<{ block: Block; depth: number }> = ({ block, depth }) => {
  const typeLabels: Record<string, string> = {
    hero: 'Hero',
    section: 'Section',
    'text-block': 'Texte',
    text: 'Texte',
    image: 'Image',
    html: 'HTML',
    code: 'Code',
    columns: 'Colonnes',
    button: 'Bouton',
    divider: 'Séparateur',
    spacer: 'Espace',
    grid: 'Grille',
    card: 'Carte',
    video: 'Vidéo',
    list: 'Liste',
    stats: 'Statistiques',
    form: 'Formulaire',
  };

  const typeColors: Record<string, string> = {
    hero: 'bg-violet-100 border-violet-200 text-violet-700',
    section: 'bg-blue-100 border-blue-200 text-blue-700',
    'text-block': 'bg-green-100 border-green-200 text-green-700',
    text: 'bg-green-100 border-green-200 text-green-700',
    image: 'bg-amber-100 border-amber-200 text-amber-700',
    columns: 'bg-cyan-100 border-cyan-200 text-cyan-700',
    button: 'bg-rose-100 border-rose-200 text-rose-700',
    card: 'bg-indigo-100 border-indigo-200 text-indigo-700',
    stats: 'bg-emerald-100 border-emerald-200 text-emerald-700',
  };

  const colorClass = typeColors[block.type] || 'bg-slate-100 border-slate-200 text-slate-700';
  const hasChildren = block.children && block.children.length > 0;

  return (
    <div style={{ marginLeft: depth * 16 }} className="mb-1">
      <div className={`flex items-center gap-2 px-2 py-1.5 rounded border text-xs font-medium ${colorClass}`}>
        <span className="uppercase tracking-wider">{typeLabels[block.type] || block.type}</span>
        {block.content?.title && (
          <span className="text-slate-500 font-normal truncate max-w-[200px]">
            {block.content.title}
          </span>
        )}
        {hasChildren && (
          <span className="text-slate-400 font-normal">
            ({block.children!.length} enfant{block.children!.length > 1 ? 's' : ''})
          </span>
        )}
      </div>
      {hasChildren && block.children!.map((child, i) => (
        <BlockPreview key={i} block={child} depth={depth + 1} />
      ))}
    </div>
  );
};
