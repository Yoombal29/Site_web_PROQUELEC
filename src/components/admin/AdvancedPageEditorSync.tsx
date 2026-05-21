import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Save, Eye, Code, Database, FileText, Settings,
  Plus, Trash2, Copy, AlertCircle, CheckCircle2 } from
'lucide-react';
import {
  useBidirectionalSync,
  useAutoSyncToServer,
  SyncBlock } from





'@/hooks/useBidirectionalSync';
import { PageBuilder } from './PageBuilder';
import { ContentBlock as PageBuilderBlock } from '@/types/PageSystem';


interface AdvancedPageEditorProps {
  pageId: string;
  initialPage?: {
    title: string;
    slug: string;
    meta_description: string;
    content: string;
    content_blocks?: unknown[];
  };
  onSave?: (data: unknown) => Promise<void>;
}

/**
 * Éditeur de page avancé avec synchronisation bidirectionnelle
 * HTML ↔ JSON ↔ Visuel ↔ Formulaire
 */
export const AdvancedPageEditorSync: React.FC<AdvancedPageEditorProps> = ({
  pageId,
  initialPage,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('visual');
  const [isManualSave, setIsManualSave] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const {
    html,
    contentBlocks,
    jsonString,
    formData,
    handlers,
    getAllData,
    lastModifiedBy
  } = useBidirectionalSync(initialPage?.content || '', {
    title: initialPage?.title,
    slug: initialPage?.slug,
    description: initialPage?.meta_description
  }, (initialPage?.content_blocks || []) as SyncBlock[]);

  // Auto-sync to server
  const { isSaving, lastSaved } = useAutoSyncToServer(
    pageId,
    getAllData(),
    autoSync,
    onSave
  );

  // Manual save
  const handleManualSave = async () => {
    setIsManualSave(true);
    try {
      const data = getAllData();
      if (onSave) {
        await onSave({
          content: data.html,
          content_blocks: data.contentBlocks,
          updated_at: new Date().toISOString()
        });
      } else {
        // Direct API call
        const response = await fetch(`/api/pages/${pageId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          },
          body: JSON.stringify({
            content: data.html,
            content_blocks: data.contentBlocks,
            updated_at: new Date().toISOString()
          })
        });

        if (!response.ok) throw new Error('Save failed');
      }

      toast.success('Page sauvegardée avec succès!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsManualSave(false);
    }
  };

  // Copy to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    toast.success('JSON copié!');
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html);
    toast.success('HTML copié!');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">{initialPage?.title || 'Nouvelle Page'}</h2>
                    <Badge variant="outline">
                        {lastModifiedBy ? `Dernière mod: ${lastModifiedBy}` : 'Non modifié'}
                    </Badge>
                    {lastSaved &&
          <Badge variant="secondary" className="text-green-600 border-green-200 bg-green-50">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Synchro: {lastSaved.toLocaleTimeString()}
                        </Badge>
          }
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                        <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="rounded"
              id="auto-sync" />
            
                        <label htmlFor="auto-sync" className="text-sm cursor-pointer">
                            Auto-sync
                        </label>
                    </div>

                    <Button
            onClick={handleManualSave}
            disabled={isManualSave}
            className="bg-blue-600 hover:bg-blue-700">
            
                        <Save className="w-4 h-4 mr-2" />
                        {isManualSave ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col mx-4 overflow-hidden">
                <TabsList className="mb-2 bg-gray-100">
                    <TabsTrigger value="visual" className="gap-2">
                        <Eye className="w-4 h-4" /> Visuel (Constructeur)
                    </TabsTrigger>
                    <TabsTrigger value="html" className="gap-2">
                        <Code className="w-4 h-4" /> HTML
                    </TabsTrigger>
                    <TabsTrigger value="json" className="gap-2">
                        <Database className="w-4 h-4" /> JSON
                    </TabsTrigger>
                    <TabsTrigger value="form" className="gap-2">
                        <FileText className="w-4 h-4" /> Formulaire
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2">
                        <Eye className="w-4 h-4" /> Aperçu
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="w-4 h-4" /> Paramètres
                    </TabsTrigger>
                </TabsList>

                {/* VISUAL BUILDER */}
                <TabsContent value="visual" className="flex-1 overflow-auto bg-gray-50 p-4 m-0 rounded-lg border">
                    <div className="max-w-6xl mx-auto">
                        <PageBuilder
              blocks={contentBlocks as unknown as PageBuilderBlock[]}
              onChange={handlers.handleBlocksChange as unknown} />
            
                    </div>
                </TabsContent>

                {/* HTML EDITOR */}
                <TabsContent value="html" className="flex-1 border rounded-lg overflow-hidden bg-[#1e1e1e] m-0 flex flex-col">
                    <div className="flex items-center justify-between p-2 bg-gray-900 border-b">
                        <span className="text-xs text-gray-400 font-mono">HTML</span>
                        <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyHtml}
              className="h-6">
              
                            <Copy className="w-3 h-3" />
                        </Button>
                    </div>
                    <Editor
            height="100%"
            defaultLanguage="html"
            theme="vs-dark"
            value={html}
            onChange={(val) => handlers.handleHtmlChange(val || '')}
            data-testid="html-editor"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'on',
              padding: { top: 16 },
              scrollBeyondLastLine: false
            }} />
          
                </TabsContent>

                {/* JSON EDITOR */}
                <TabsContent value="json" className="flex-1 border rounded-lg overflow-hidden bg-[#1e1e1e] m-0 flex flex-col">
                    <div className="flex items-center justify-between p-2 bg-gray-900 border-b">
                        <span className="text-xs text-gray-400 font-mono">JSON (Édition Brute)</span>
                        <div className="flex gap-1">
                            <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyJson}
                className="h-6">
                
                                <Copy className="w-3 h-3" />
                            </Button>
                            <div className="text-xs text-yellow-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Une erreur de syntaxe cassera la page
                            </div>
                        </div>
                    </div>
                    <Editor
            height="100%"
            defaultLanguage="json"
            theme="vs-dark"
            value={jsonString}
            onChange={(val) => handlers.handleJsonChange(val || '[]')}
            data-testid="json-editor"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'on',
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              formatOnPaste: true
            }} />
          
                </TabsContent>

                {/* FORM EDITOR */}
                <TabsContent value="form" className="flex-1 overflow-auto bg-gray-50 p-4 m-0 rounded-lg border">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations de la Page</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="form-title">Titre</Label>
                                    <Input
                    id="form-title"
                    value={formData.title}
                    onChange={(e) =>
                    handlers.handleFormChange({
                      ...formData,
                      title: e.target.value
                    })
                    }
                    placeholder="Titre de la page" />
                  
                                </div>

                                <div>
                                    <Label htmlFor="form-slug">Slug</Label>
                                    <Input
                    id="form-slug"
                    value={formData.slug}
                    onChange={(e) =>
                    handlers.handleFormChange({
                      ...formData,
                      slug: e.target.value
                    })
                    }
                    placeholder="slug-de-la-page" />
                  
                                </div>

                                <div>
                                    <Label htmlFor="form-description">Description</Label>
                                    <Textarea
                    id="form-description"
                    value={formData.description}
                    onChange={(e) =>
                    handlers.handleFormChange({
                      ...formData,
                      description: e.target.value
                    })
                    }
                    placeholder="Description courte"
                    rows={3} />
                  
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Blocs de Contenu ({formData.blocks.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {formData.blocks.map((block, index) =>
                <div
                  key={block.id}
                  className="p-3 bg-white border rounded-lg flex items-center justify-between">
                  
                                        <div>
                                            <div className="font-mono text-sm text-gray-600">
                                                Block {index + 1}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Type: {block.type}
                                            </div>
                                        </div>
                                        <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const newBlocks = formData.blocks.filter(
                        (b) => b.id !== block.id
                      );
                      handlers.handleFormChange({
                        ...formData,
                        blocks: newBlocks
                      });
                    }}>
                    
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                )}

                                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    const newBlock: SyncBlock = {
                      id: `block-${Date.now()}`,
                      type: 'section',
                      data: { content: 'Nouveau bloc' }
                    };
                    handlers.handleFormChange({
                      ...formData,
                      blocks: [...formData.blocks, newBlock]
                    });
                  }}>
                  
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ajouter un bloc
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* PREVIEW */}
                <TabsContent value="preview" className="flex-1 border rounded-lg bg-white m-0 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-auto p-4 bg-gray-100">
                        <div className="bg-white max-w-4xl mx-auto rounded-lg shadow-lg p-6">
                            <iframe
                title="Page Preview"
                srcDoc={`
                                    <!DOCTYPE html>
                                    <html>
                                        <head>
                                            <meta charset="utf-8">
                                            <meta name="viewport" content="width=device-width, initial-scale=1">
                                            <script src="https://cdn.tailwindcss.com"><\/script>
                                            <style>
                                                body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                                                * { box-sizing: border-box; }
                                            </style>
                                        </head>
                                        <body>
                                            ${html}
                                        </body>
                                    </html>
                                `}
                width="100%"
                height="600"
                className="w-full border-0"
                sandbox="allow-scripts" />
              
                        </div>
                    </div>
                </TabsContent>

                {/* SETTINGS */}
                <TabsContent value="settings" className="flex-1 overflow-auto bg-gray-50 p-4 m-0 rounded-lg border">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Paramètres de Synchronisation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div>
                                        <div className="font-medium text-sm">Synchronisation Automatique</div>
                                        <div className="text-xs text-gray-600">
                                            Sauvegarde automatique après 1 seconde d'inactivité
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="auto-sync-settings" className="cursor-pointer">Auto-sync</Label>
                                        <input
                      type="checkbox"
                      id="auto-sync-settings"
                      title="Activer la synchronisation automatique"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      className="w-5 h-5 rounded cursor-pointer" />
                    
                                    </div>
                                </div>

                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <div className="text-xs font-mono text-gray-600 space-y-1">
                                        <div>📝 Dernière modification: {lastModifiedBy || 'Aucune'}</div>
                                        <div>🔄 Dernière synchro: {lastSaved?.toLocaleTimeString() || 'Jamais'}</div>
                                        <div>🔐 Statut: {isSaving ? 'Sauvegarde...' : 'À jour'}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>À propos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-gray-600">
                                <p>
                                    ✨ <strong>Synchronisation bidirectionnelle:</strong> Toute modification dans l'un des éditeurs (HTML, JSON, Visuel, Formulaire) se reflète instantanément dans les autres.
                                </p>
                                <p>
                                    🚀 <strong>Auto-sync:</strong> Vos modifications sont automatiquement sauvegardées et synchronisées avec le site public.
                                </p>
                                <p>
                                    🔄 <strong>SSE:</strong> Les changements sont diffusés en temps réel via Server-Sent Events.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>);

};

export default AdvancedPageEditorSync;