import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Eye, Loader2, Lock, Bot, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";

interface MonacoTabContentProps {
  content: string;
  onChange: (value: string) => void;
  pageId: string;
  userId: string;
  readOnly?: boolean;
  immutable?: boolean;
}

export const MonacoTabContent: React.FC<MonacoTabContentProps> = ({
  content,
  onChange,
  pageId,
  userId,
  readOnly,
  immutable
}) => {
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini' | 'ollama'>(
    localStorage.getItem('ai_provider') as 'openai' | 'gemini' | 'ollama' || 'openai'
  );

  const handleAIRequest = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Veuillez entrer une demande pour l'AI");
      return;
    }

    setLoadingAI(true);
    try {
      const data = await apiFetch<{code?: string;error?: string;provider?: string;version?: string;}>('/api/ai-code-assistant', {
        method: 'POST',
        body: JSON.stringify({
          prompt: aiPrompt,
          currentCode: content,
          pageId,
          userId,
          provider: selectedProvider
        })
      });

      // Save provider preference
      localStorage.setItem('ai_provider', selectedProvider);

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.code) {
        onChange(data.code);
        const providerName = data.provider === 'openai' ? 'OpenAI' : 'Gemini';
        toast.success(`✨ Code généré par ${providerName} ! Version ${data.version || 'N/A'}`);
        setAiPrompt('');
      }
    } catch (error: unknown) {
      console.error("Full AI Error:", error);
      toast.error(error.message || "Erreur lors de la génération AI");
    } finally {
      setLoadingAI(false);
    }
  };

  const quickPrompts = [
  "Ajoute une section contact avec formulaire",
  "Corrige toutes les erreurs HTML",
  "Rends le code responsive (mobile-first)",
  "Optimise pour le SEO"];


  return (
    <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 bg-slate-100 border-b">
                <Button
          type="button"
          onClick={() => setShowAI(!showAI)}
          variant={showAI ? "default" : "outline"}
          size="sm">
          
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Assistant
                </Button>

                {immutable &&
        <Badge variant="destructive" className="ml-auto">
                        <Lock className="w-3 h-3 mr-1" />
                        IMMUTABLE
                    </Badge>
        }
            </div>

            {/* AI Panel */}
            {showAI &&
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                    {/* Provider Selector */}
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200">
                        <Label className="text-xs font-medium text-slate-700">Provider IA :</Label>
                        <div className="flex gap-2">
                            <Button
              type="button"
              size="sm"
              variant={selectedProvider === 'openai' ? 'default' : 'outline'}
              onClick={() => setSelectedProvider('openai')}
              className="h-7 text-xs"
              disabled={loadingAI || immutable}>
              
                                <Bot className="w-3 h-3 mr-1" />
                                OpenAI
                                <Badge variant="secondary" className="ml-1 text-[10px] px-1">GPT-4o mini</Badge>
                            </Button>
                            <Button
              type="button"
              size="sm"
              variant={selectedProvider === 'gemini' ? 'default' : 'outline'}
              onClick={() => setSelectedProvider('gemini')}
              className="h-7 text-xs"
              disabled={loadingAI || immutable}>
              
                                <Zap className="w-3 h-3 mr-1" />
                                Gemini
                                <Badge variant="secondary" className="ml-1 text-[10px] px-1">1.5 Flash</Badge>
                            </Button>
                            <Button
              type="button"
              size="sm"
              variant={selectedProvider === 'ollama' ? 'default' : 'outline'}
              onClick={() => setSelectedProvider('ollama')}
              className="h-7 text-xs border-slate-300"
              disabled={loadingAI || immutable}>
              
                                <div className="w-3 h-3 mr-1 rounded-full bg-orange-500" />
                                Ollama
                                <Badge variant="secondary" className="ml-1 text-[10px] px-1">Local</Badge>
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-3">
                        <Input
            placeholder="Ex: 'Ajoute section contact', 'Corrige erreurs', 'Rends responsive'"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAIRequest()}
            className="flex-1"
            disabled={loadingAI || immutable} />
          
                        <Button
            type="button"
            onClick={handleAIRequest}
            disabled={loadingAI || immutable || !aiPrompt.trim()}>
            
                            {loadingAI ?
            <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Génération...
                                </> :

            <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Générer
                                </>
            }
                        </Button>
                    </div>

                    {/* Quick Prompts */}
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-600">Suggestions rapides :</span>
                        {quickPrompts.map((prompt, i) =>
          <Button
            key={i}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAiPrompt(prompt)}
            className="text-xs"
            disabled={loadingAI || immutable}>
            
                                {prompt}
                            </Button>
          )}
                    </div>
                </div>
      }

            {/* Split View Container */}
            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
                {/* Monaco Editor Area */}
                <div className={`${showAI ? 'h-[60%] md:h-full md:w-1/2' : 'h-1/2 md:h-full md:w-1/2'} transition-all duration-300 border-r relative flex flex-col`}>
                    <div className="absolute top-0 right-0 z-10 p-2 opacity-50 hover:opacity-100">
                        <Badge variant="outline" className="bg-slate-800 text-white">Editor</Badge>
                    </div>
                    <Editor
            height="100%"
            language="html"
            theme="vs-dark"
            value={content}
            onChange={onChange}
            loading={<Loader2 className="animate-spin text-blue-500" />}
            options={{
              wordWrap: 'on',
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              readOnly: readOnly || immutable,
              scrollBeyondLastLine: false,
              automaticLayout: true
            }} />
          
                </div>

                {/* Live Preview Area */}
                <div className="flex-1 bg-gray-100 flex flex-col h-1/2 md:h-full border-l overflow-hidden">
                    <div className="bg-white border-b p-2 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            <span className="font-semibold text-gray-700">Live Preview</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">Tailwind CDN Ready</Badge>
                    </div>
                    <div className="flex-1 bg-white relative">
                        <iframe
              key={content.length} // Force re-render on significant changes acting as a crude debounce
              srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 0; } 
    /* Scrollbar styling for modern feel */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  </style>
</head>
<body>${content}</body>
</html>`}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-0"
              title="Preview Sandbox" />
            
                        {/* Overlay to prevent iframe capturing clicks during resize (if we added resizing) */}
                        <div className="absolute inset-0 pointer-events-none border-4 border-transparent"></div>
                    </div>
                </div>
            </div>
        </div>);

};