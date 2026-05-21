import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Copy, ExternalLink, BookOpen, FileText, MapPin, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocumentationTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: string;
  description: string;
}

export default function IADocumentationPage() {
  const [tabs, setTabs] = useState<DocumentationTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inventory");
  const { toast } = useToast();

  useEffect(() => {
    loadDocumentation();
  }, []);

  const loadDocumentation = async () => {
    try {
      setLoading(true);
      
      // Charger les fichiers markdown depuis le serveur
      const filesToLoad = [
        {
          id: "inventory",
          label: "Inventaire Endpoints",
          icon: <BookOpen className="w-4 h-4" />,
          file: "ENDPOINTS_IA_INVENTORY.md",
          description: "Vue complète de tous les endpoints IA avec modèles et configurations"
        },
        {
          id: "mapping",
          label: "Mapping Composants",
          icon: <MapPin className="w-4 h-4" />,
          file: "ENDPOINTS_MAPPING.md",
          description: "Architecture visuelle et flux des composants vers les endpoints"
        },
        {
          id: "config",
          label: "Configuration",
          icon: <Settings className="w-4 h-4" />,
          file: "AI_PROVIDER_CONFIG.md",
          description: "Formats des endpoints, variables d'environnement, dépannage"
        }
      ];

      const loadedTabs = await Promise.all(
        filesToLoad.map(async (doc) => {
          try {
            // Essayer de charger depuis le serveur public
            const response = await fetch(`/${doc.file}`);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            const content = await response.text();
            return {
              id: doc.id,
              label: doc.label,
              icon: doc.icon,
              content,
              description: doc.description
            };
          } catch (error) {
            console.error(`Erreur chargement ${doc.file}:`, error);
            return {
              id: doc.id,
              label: doc.label,
              icon: doc.icon,
              content: `# Erreur\n\nImpossible de charger le fichier ${doc.file}.\n\n**Solution:** Assurez-vous que le fichier est présent à la racine du projet.`,
              description: doc.description
            };
          }
        })
      );

      setTabs(loadedTabs);
      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement documentation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la documentation IA",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "✅ Copié",
      description: "Contenu copié dans le presse-papiers"
    });
  };

  const downloadMarkdown = (content: string, filename: string) => {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/markdown;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin mb-4">⌛</div>
          <p className="text-slate-600">Chargement de la documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Documentation IA
        </h1>
        <p className="text-slate-600">
          Consultez la documentation complète des endpoints IA, configurations et mappings des composants.
        </p>
      </div>

      {/* Tabs */}
      <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle>Documentation Interactive</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDocumentation()}
                className="gap-2"
              >
                <span>🔄</span> Rafraîchir
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                {/* Description */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900 dark:text-blue-200">{tab.description}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadMarkdown(tab.content, `${tab.id}.md`)}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(tab.content)}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copier tout
                  </Button>
                </div>

                {/* Markdown Content */}
                <div className="prose dark:prose-invert max-w-none rounded-lg border border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/50">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mt-6 mb-4 text-slate-900 dark:text-slate-100">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-bold mt-5 mb-3 text-slate-800 dark:text-slate-200">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-semibold mt-4 mb-2 text-slate-700 dark:text-slate-300">
                          {children}
                        </h3>
                      ),
                      code: ({ inline, children }) =>
                        inline ? (
                          <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-sm text-slate-900 dark:text-slate-100 font-mono">
                            {children}
                          </code>
                        ) : (
                          <code className="block bg-slate-900 dark:bg-slate-800 text-slate-100 p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm">
                            {children}
                          </code>
                        ),
                      pre: ({ children }) => (
                        <pre className="bg-slate-900 dark:bg-slate-800 text-slate-100 p-4 rounded-lg my-4 overflow-x-auto">
                          {children}
                        </pre>
                      ),
                      table: ({ children }) => (
                        <table className="w-full border-collapse my-4">
                          {children}
                        </table>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-slate-200 dark:bg-slate-800">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-left font-semibold">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-slate-300 dark:border-slate-700 px-3 py-2">
                          {children}
                        </td>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1 my-3">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1 my-3">
                          {children}
                        </ol>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 dark:text-slate-400 my-3">
                          {children}
                        </blockquote>
                      )
                    }}
                  >
                    {tab.content}
                  </ReactMarkdown>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Ressources Externes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://platform.openai.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition"
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                📘 OpenAI Documentation
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Documentation officielle OpenAI (GPT-4o, DALL-E 3, Vision)
              </p>
            </a>
            <a
              href="https://docs.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition"
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                📘 Anthropic Documentation
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Documentation officielle Anthropic (Claude 3.5)
              </p>
            </a>
            <a
              href="https://haystack.deepset.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition"
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                📘 Haystack Documentation
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Framework Haystack pour modèles locaux
              </p>
            </a>
            <a
              href="/test_ai_endpoints.js"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition"
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                🧪 Script de Test
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Valider tous les endpoints IA
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
