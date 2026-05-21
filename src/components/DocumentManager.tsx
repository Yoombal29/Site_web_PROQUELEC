
import { useState } from 'react';
import { toast } from 'sonner';
import { useMediaManager } from '@/hooks/useMediaManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Search, Trash2, Download, FileText, Eye, Sparkles, Loader2, Bot, MessageSquare, Shield, History, Activity } from 'lucide-react';
import { aiMaster } from '@/lib/ai-master';
import { AIMessage } from '@/expert-lab/lib/UnifiedAIService';
import { AIDocumentChat } from '@/components/AIDocumentChat';
import { PermissionEditor } from '@/components/PermissionEditor';
import { VersionHistory } from '@/components/VersionHistory';
import { AuditViewer } from '@/components/AuditViewer';
import { OfficeCreationMenu } from '@/components/office/shared/OfficeCreationMenu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Document {
  id: string;
  title: string;
  description: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  category: string;
  tags: string[];
  status: 'pending' | 'validated' | 'rejected';
  version: string;
  name: string;
  path?: string;
}

export function DocumentManager() {
  const { mediaFiles, uploadFile, deleteFile, isLoading } = useMediaManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeChatDocument, setActiveChatDocument] = useState<{ id: string, name: string, context?: string } | null>(null);
  const [activePermissionEditor, setActivePermissionEditor] = useState<{ id: string, name: string } | null>(null);
  const [activeVersionHistory, setActiveVersionHistory] = useState<{ id: string, name: string } | null>(null);
  const [activeAuditViewer, setActiveAuditViewer] = useState<{ id: string, name: string } | null>(null);

  // Project Assistant State
  const [projectMessages, setProjectMessages] = useState<AIMessage[]>([
    { role: 'assistant', content: "Bonjour ! Je suis l'intelligence globale du projet. Je peux analyser l'ensemble de vos documents ci-contre pour répondre à vos questions transverses (ex: 'Fais-moi un résumé du lot électricité')." }
  ]);
  const [projectInput, setProjectInput] = useState("");
  const [isProjectLoading, setIsProjectLoading] = useState(false);

  const categories = [
    { value: 'all', label: 'Tous les documents' },
    { value: 'formation', label: 'Formations' },
    { value: 'procedure', label: 'Procédures' },
    { value: 'certification', label: 'Certifications' },
    { value: 'technique', label: 'Documentation technique' },
    { value: 'legal', label: 'Documents légaux' },
    { value: 'general', label: 'Général' }
  ];

  const filteredDocuments = (mediaFiles || []).map(file => ({
    ...file,
    // Simulation details pending DB migration
    status: file.id.charCodeAt(0) % 2 === 0 ? 'validated' : 'pending',
    version: '1.0',
    tags: file.category ? [file.category] : [] // Ensure tags exist
  })).filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.type && doc.type.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }) as unknown as Document[];

  const handleProjectChat = async () => {
    if (!projectInput.trim()) return;

    const newMessages: AIMessage[] = [...projectMessages, { role: 'user', content: projectInput }];
    setProjectMessages(newMessages);
    setProjectInput('');
    setIsProjectLoading(true);

    try {
      // Create a context from all filtered documents
      const docsContext = filteredDocuments.map(d => `- ${d.name} (${d.category}): ${d.type}`).join('\n');

      const response = await aiMaster.process({
        task: 'expert',
        prompt: projectInput,
        device: 'desktop',
        context: {
          globalProjectContext: true,
          docsContext
        }
      });

      const aiResponseContent = response.success ? (typeof response.data === 'string' ? response.data : response.data.answer) : "Je n'ai pas pu analyser la réponse.";
      setProjectMessages(prev => [...prev, { role: 'assistant', content: aiResponseContent }]);

    } catch (error) {
      console.error("Erreur Project Chat:", error);
      setProjectMessages(prev => [...prev, { role: 'assistant', content: "Erreur de connexion au cerveau central." }]);
    } finally {
      setIsProjectLoading(false);
    }
  };

  const analyzeFileWithAI = async (file: File) => {
    setIsAnalyzing(true);
    try {
      // Simulation d'une lecture de contenu (dans le futur: extraction texte via worker)
      const description = `Document nommé ${file.name} de type ${file.type}, taille ${file.size} octets.`;

      const response = await aiMaster.process({
        task: 'seo', // Using SEO task logic as a proxy for 'audit/tagging' simulation
        prompt: `Analyse ce document: ${file.name}`,
        context: { fileName: file.name, description }
      });

      if (response.success && response.data.suggestions) {
        setUploadForm(prev => ({
          ...prev,
          title: prev.title || file.name,
          category: response.data.suggestions[0]?.toLowerCase().includes('formation') ? 'formation' : 'technique',
          tags: response.data.suggestions.join(', ')
        }));
      }
    } catch (error) {
      console.error("Erreur analyse IA:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadForm.title) {
        setUploadForm(prev => ({ ...prev, title: file.name }));
      }
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    try {
      toast.info("Importation en cours...");
      await uploadFile.mutateAsync({
        file: selectedFile,
        bucket: 'documents',
        // Pass the new Alfresco metadata
        // @ts-ignore - Extending the request body in the hook logic implicitly
        project_id: uploadForm.tags.split(',')[0] || 'general',
        status: 'pending_review',
        category: uploadForm.category,
        tags: uploadForm.tags,
        description: uploadForm.description
      });

      toast.success("Document importé avec succès !");
      setUploadForm({ title: '', description: '', category: 'general', tags: '' });
      setSelectedFile(null);
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Erreur lors de l'importation");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadDocument = (doc: Document) => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    return '📁';
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="explorer" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="explorer" className="gap-2"><FileText className="h-4 w-4" /> Explorateur</TabsTrigger>
            <TabsTrigger value="intelligence" className="gap-2 data-[state=active]:bg-proqblue data-[state=active]:text-white"><Bot className="h-4 w-4" /> Assistant Projet (IA)</TabsTrigger>
          </TabsList>

          <div className="flex gap-3">
            <OfficeCreationMenu />

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importer Fichier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Téléverser un document</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="file">Fichier</Label>
                    <Input id="file" type="file" onChange={handleFileSelect} />
                    {selectedFile && (
                      <Button
                        type="button"
                        onClick={() => analyzeFileWithAI(selectedFile)}
                        disabled={isAnalyzing}
                        className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyse IA en cours...
                          </>
                        ) : (
                          <>
                            <Bot className="h-4 w-4 mr-2" />
                            ✨ Auto-magique (Suggérer Catégorie & Tags)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Résumée par IA)</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du document"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-proqblue hover:bg-blue-50"
                        onClick={() => setUploadForm(prev => ({ ...prev, description: "Analyse en cours..." }))}
                      >
                        <Sparkles className="h-3 w-3 mr-1" /> Générer description
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="block text-sm font-medium mb-1">Catégorie</Label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      title="Catégorie du document"
                      aria-label="Sélectionner la catégorie du document"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-1">Tags (séparés par des virgules)</Label>
                    <Input
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="ex: urgent, confidentiel, v1"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Annuler</Button>
                  <Button onClick={handleConfirmUpload} disabled={isLoading || !selectedFile}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Importer le document
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="explorer" className="mt-0">
          <Card className="border-t-0 rounded-tl-none">
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher des documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md min-w-48 bg-white text-gray-900"
                  title="Filtrer par catégorie"
                  aria-label="Filtrer les documents par catégorie"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Aucun document trouvé.</p>
                  <p className="text-sm">Ajoutez des documents pour commencer.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="text-3xl">
                              {getFileIcon(doc.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg truncate">{doc.name}</h3>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="outline">
                                  {categories.find(cat => cat.value === doc.category)?.label}
                                </Badge>
                                {doc.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                <Badge
                                  variant={doc.status === 'validated' ? 'default' : 'outline'}
                                  className={doc.status === 'validated' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-amber-600 border-amber-600'}
                                >
                                  {doc.status === 'validated' ? ' Approuvé' : ' À valider'}
                                </Badge>
                                <Badge variant="outline" className="text-gray-500 text-xs">v{doc.version}</Badge>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 space-x-4">
                                <span>{doc.filename}</span>
                                <span>{formatFileSize(doc.size)}</span>
                                <span>{doc.uploadedAt.toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              onClick={() => setActiveChatDocument({
                                id: doc.id,
                                name: doc.name,
                                context: `Type: ${doc.type}, Catégorie: ${doc.category}, Tags: ${doc.tags.join(', ')}`
                              })}
                            >
                              <MessageSquare className="h-4 w-4 md:mr-2" />
                              <span className="hidden md:inline">Chat</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActivePermissionEditor({ id: doc.id, name: doc.name })}
                              title="Gérer les permissions"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveVersionHistory({ id: doc.id, name: doc.name })}
                              title="Historique des versions"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveAuditViewer({ id: doc.id, name: doc.name })}
                              title="Journal d'audit"
                            >
                              <Activity className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => downloadDocument(doc)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deleteFile.mutate({ id: doc.id, path: doc.path })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Sidebar: Context */}
            <Card className="col-span-1 flex flex-col">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-sm">Contexte Documentaire</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full p-4">
                  <p className="text-xs text-gray-500 mb-4">L'IA a accès aux métadonnées de ces fichiers :</p>
                  <div className="space-y-2">
                    {filteredDocuments.map(doc => (
                      <div key={doc.id} className="flex items-center gap-2 p-2 rounded bg-white border text-xs">
                        <FileText className="h-3 w-3 text-proqblue" />
                        <span className="truncate flex-1 font-medium">{doc.name}</span>
                        <Badge variant="outline" className="text-[10px]">{doc.category}</Badge>
                      </div>
                    ))}
                    {filteredDocuments.length === 0 && <p className="text-xs text-gray-400">Aucun document.</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat App */}
            <Card className="col-span-1 lg:col-span-2 flex flex-col border-proqblue/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-proqblue to-proqblue-dark text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                  Cerveau du Projet
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-4 bg-slate-50 flex flex-col gap-4 overflow-hidden relative">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {projectMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-proqblue text-white rounded-tr-none' : 'bg-white border rounded-tl-none shadow-sm'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isProjectLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border px-4 py-2 rounded-2xl flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-proqblue" />
                          <span className="text-xs text-gray-500">Réflexion globale...</span>
                        </div>
                      </div>
                    )}
                    <div className="h-1" />
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={projectInput}
                    onChange={(e) => setProjectInput(e.target.value)}
                    placeholder="Posez une question sur l'ensemble du projet..."
                    className="rounded-full shadow-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleProjectChat()}
                  />
                  <Button onClick={handleProjectChat} disabled={isProjectLoading} className="rounded-full w-10 h-10 p-0 bg-proqblue">
                    <Bot className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs >

      {activeChatDocument && (
        <AIDocumentChat
          documentName={activeChatDocument.name}
          documentContext={activeChatDocument.context}
          onClose={() => setActiveChatDocument(null)}
        />
      )
      }

      {
        activePermissionEditor && (
          <PermissionEditor
            documentId={activePermissionEditor.id}
            documentName={activePermissionEditor.name}
            onClose={() => setActivePermissionEditor(null)}
          />
        )
      }

      {
        activeVersionHistory && (
          <VersionHistory
            documentId={activeVersionHistory.id}
            documentName={activeVersionHistory.name}
            onClose={() => setActiveVersionHistory(null)}
          />
        )
      }

      {
        activeAuditViewer && (
          <AuditViewer
            documentId={activeAuditViewer.id}
            documentName={activeAuditViewer.name}
            onClose={() => setActiveAuditViewer(null)}
          />
        )
      }
    </div >
  );
}


