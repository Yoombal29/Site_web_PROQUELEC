import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Brain,
  Bot,
  Loader2,
  Activity,
  RefreshCw,
  AlertCircle,
  Settings,
  ExternalLink,
  Calendar,
  Home,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// ─── Types ───────────────────────────────────────────────────
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface AIService {
  service: string;
  key: string;
  status: 'online' | 'offline' | 'starting';
  url?: string;
  provider?: string;
}

// ─── Templates ───────────────────────────────────────────────
const QUICK_TEMPLATES = [
  { label: 'Résumé NF C 15-100', prompt: 'Résume la norme NF C 15-100' },
  {
    label: 'Fiche sécurité électrique',
    prompt: 'Génère une fiche technique sur la sécurité électrique',
  },
  {
    label: 'Section vs chute de tension',
    prompt: 'Explique la différence entre section de câble et chute de tension',
  },
  {
    label: 'Vérifications avant mise sous tension',
    prompt: 'Rédige un mémento sur les vérifications avant mise sous tension',
  },
  { label: 'Analyse de code', prompt: 'Analyse ce code : [colle ton code ici]' },
];

// ─── Helpers ─────────────────────────────────────────────────
function renderMarkdown(text: string) {
  // Simple markdown rendering — converts basic patterns to HTML
  const html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks
    .replace(
      /```(\w*)\n([\s\S]*?)```/g,
      '<pre class="bg-muted p-3 rounded-lg overflow-x-auto text-sm my-2 font-mono">$2</pre>',
    )
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
    )
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Newlines
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br />');

  return `<p class="mb-2">${html}</p>`;
}

// ─── Component ───────────────────────────────────────────────
export default function AdminAICentral() {
  const { toast } = useToast();

  // Service status state
  const [services, setServices] = useState<AIService[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Bonjour ! Je suis votre assistant IA PROQUELEC. Posez-moi une question ou utilisez un modèle rapide ci-contre.',
    },
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Fetch service status ──
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/ai/status');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch {
      // Silently fail — status is secondary
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, []);

  // ── Auto-scroll on new messages ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send chat message ──
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || chatLoading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          task: 'text',
          context: { type: 'general_content_generation' },
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || `Erreur ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.code || data?.text || data?.response || JSON.stringify(data);

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      toast({
        title: 'Erreur IA',
        description: err?.message || 'Impossible de contacter le service IA',
        variant: 'destructive',
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Erreur : ${err?.message || 'Service indisponible'}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Quick template handler ──
  const handleTemplate = (prompt: string) => {
    setInput(prompt);
  };

  // ── Key handler ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Status dot color ──
  const statusDot = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'starting':
        return 'bg-yellow-500 animate-pulse';
      default:
        return 'bg-red-400';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return 'En ligne';
      case 'starting':
        return 'Démarrage…';
      default:
        return 'Hors ligne';
    }
  };

  // ── Provider display ──
  const providerName = (s: AIService) => {
    if (s.provider) return s.provider;
    // Infer from key / service name
    const name = (s.service || s.key || '').toLowerCase();
    if (name.includes('openai') || name.includes('gpt')) return 'OpenAI';
    if (name.includes('anthropic') || name.includes('claude')) return 'Anthropic';
    if (name.includes('mistral')) return 'Mistral';
    if (name.includes('ollama') || name.includes('local')) return 'Local (Ollama)';
    return s.service || s.key || 'AI';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Header ─── */}
      <div>
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-600" />
          IA Central — PROQUELEC
        </h2>
        <p className="text-muted-foreground mt-1">
          Assistant intelligent, statut des services et outils rapides
        </p>
      </div>

      {/* ─── Section 1: Service Status Bar ─── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Statut des services IA
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchStatus} disabled={statusLoading}>
              <RefreshCw className={`w-4 h-4 ${statusLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {statusLoading && services.length === 0 ? (
            <div className="flex items-center gap-3 text-muted-foreground text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement des services…
            </div>
          ) : services.length === 0 ? (
            <div className="flex items-center gap-3 text-muted-foreground text-sm py-2">
              <AlertCircle className="w-4 h-4" />
              Aucun service IA disponible — vérifiez la variable <code>REMOTE_AI_ENABLED</code>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {services.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-lg border bg-card text-sm"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${statusDot(s.status)}`} />
                  <span className="font-medium text-foreground">{s.service || s.key}</span>
                  <Badge
                    variant="outline"
                    className={`text-[11px] px-2 py-0 ${
                      s.status === 'online'
                        ? 'text-green-700 border-green-300 bg-green-50'
                        : s.status === 'starting'
                          ? 'text-yellow-700 border-yellow-300 bg-yellow-50'
                          : 'text-red-700 border-red-300 bg-red-50'
                    }`}
                  >
                    {statusLabel(s.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-1">{providerName(s)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Section 2 + 3: Chat + Quick Tools ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Chat (60%) ── */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              Assistant IA — Chat
            </CardTitle>
          </CardHeader>

          <ScrollArea className="flex-1 p-4 h-[460px]">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-muted-foreground">L'IA réfléchit…</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question…"
                disabled={chatLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={chatLoading || !input.trim()}>
                {chatLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Envoyer
              </Button>
            </div>
          </div>
        </Card>

        {/* ── Quick Tools (40%) ── */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Modèles rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Cliquez sur un modèle pour pré-remplir le chat, puis envoyez.
            </p>
            <div className="space-y-2">
              {QUICK_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => handleTemplate(tpl.prompt)}
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 rounded-lg transition text-sm font-medium text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-900/50"
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg">
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4" />
                Conseil
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Pour analyser du code, remplacez{' '}
                <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
                  [colle ton code ici]
                </code>{' '}
                dans le modèle « Analyse de code ».
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Navigation links ─── */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card border border-border rounded-lg">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">
          Navigation rapide
        </span>
        <a
          href="/expert"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-xs font-medium text-purple-700 dark:text-purple-300 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Hub IA (15 modules)
        </a>
        <a
          href="/expert/ai-providers"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Configurer les API
          <ExternalLink className="w-3 h-3 opacity-50" />
        </a>
        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Dashboard Admin
        </a>
        <a
          href="/events"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
          Calendrier public
          <ExternalLink className="w-3 h-3 opacity-50" />
        </a>
      </div>
    </div>
  );
}
