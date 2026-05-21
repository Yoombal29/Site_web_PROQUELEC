import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from
  "@/components/ui/dropdown-menu";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "@google/model-viewer";
import { QuickPrompts } from "@/expert-lab/components/quick-prompts";
import { ReportExport } from "@/expert-lab/components/report-export";

import {
  Zap, Send, Loader2, Bot, User, Paperclip, X, MicOff, Trash2, Box, Activity,
  Sparkles, RefreshCw, Shield, Layers,
  XCircle, Wand2, History, Calculator, HardHat, FileText,
  Sidebar as SidebarIcon, MoreHorizontal, Search, LayoutGrid, Folder, Share, Edit3, Headphones,
  HelpCircle, Check, Clock, Calendar, Lock, Settings as LucideSettings, Copy as LucideCopy, ChevronRight, ScanSearch, ShieldCheck,
  ExternalLink, Maximize2, Minimize2
} from
  "lucide-react";
import { isToday, isYesterday } from 'date-fns';


import { aiMaster } from "@/lib/ai-master";
import { cn } from "@/lib/utils";
import { Mermaid } from "@/components/ui/mermaid";
import { useSession } from "@/hooks/useSession";

// --- TYPES ---
type Message = {
  role: "user" | "assistant";
  content: string;
  images?: string[];
  widget?: unknown;
  metadata?: {
    mode: string;
    method: string;
    explanation: string;
    valueAdded: string;
    suggestions: string[];
  };
};

type ChatSession = {
  id: string;
  title: string;
  created_at: string;
};

// --- WIDGETS ---
const CalculationWidget = ({ data, onDetach, isDetached = false }: { data: unknown; onDetach?: () => void; isDetached?: boolean; }) => {
  if (!data) return null;
  const isConforme = data.type === "voltage_drop" ? data.result.conforme_autre : true;

  return (
    <div className={cn(
      "bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_-3px_rgba(6,182,212,0.1)]",
      isDetached ? "w-64" : "my-4 max-w-md animate-in zoom-in duration-300"
    )}>
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/50 flex items-center justify-center border border-cyan-500/30">
            <Calculator className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-100">Calculateur</h4>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-slate-400 uppercase leading-none">{data.type === "voltage_drop" ? "Chute de Tension" : "Court-Circuit"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDetached && onDetach &&
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-500 hover:text-cyan-400"
              onClick={onDetach}
              title="Détacher le widget">

              <ExternalLink className="w-3 h-3" />
            </Button>
          }
          <Badge variant={isConforme ? "default" : "destructive"} className="text-[10px] font-bold border-none px-1.5 h-5">
            {isConforme ? 'OK' : 'KO'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {data.type === "voltage_drop" &&
          <>
            <div className="p-2.5 bg-black/20 rounded-lg border border-white/5">
              <p className="text-[9px] text-slate-500 uppercase mb-1">Chute (%)</p>
              <p className="text-lg font-black text-cyan-400">{data.result.ΔU_percent}%</p>
            </div>
            <div className="p-2.5 bg-black/20 rounded-lg border border-white/5">
              <p className="text-[9px] text-slate-500 uppercase mb-1">Section</p>
              <p className="text-lg font-black text-emerald-400">{data.result.section} mm²</p>
            </div>
          </>
        }
      </div>

      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
    </div>);

};

const availableModelsList = [
  { id: "sovereign", name: "IA Souveraine (NS 01-001)", provider: "local" },
  { id: "openai/gpt-4o", name: "GPT-4o Expert", provider: "openai" }];


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("sovereign");
  const [attachment, setAttachment] = useState<{ name: string; type: string; content: string; url?: string; } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSovereignMode, setIsSovereignMode] = useState(true);
  const [aiTemperature, setAiTemperature] = useState(0.7);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [detachedWidgets, setDetachedWidgets] = useState<{ data: unknown; x: number; y: number; isMinimized?: boolean; }[]>([]);
  const { user } = useSession();

  const recognitionRef = useRef<unknown>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // --- PERSISTENCE LOGIC (API + LocalStorage Fallback) ---
  const fetchChats = async () => {
    try {
      // Attempt API fetch
      const res = await fetch('/api/chats', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      } else {
        // Fallback to local storage if API fails or returns error
        const saved = localStorage.getItem("yeai_sessions");
        if (saved) setSessions(JSON.parse(saved));
      }
    } catch (e) {
      // Truly offline fallback
      const saved = localStorage.getItem("yeai_sessions");
      if (saved) setSessions(JSON.parse(saved));
    }
  };

  useEffect(() => {
    fetchChats();
    // Speech Init
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as unknown).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.onresult = (e: unknown) => setInput((prev) => (prev + " " + e.results[0][0].transcript).trim());
      recognitionRef.current.onend = () => setIsListening(false);
    }

    // Auto-hide sidebar on mobile on init
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  }, []);

  const loadSession = async (id: string) => {
    setActiveSessionId(id);
    try {
      const res = await fetch(`/api/chats/${id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      } else {
        setMessages([]);
      }
    } catch (e) { setMessages([]); }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Supprimer cette conversation ?")) return;

    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (activeSessionId === id) createNewChat();
        toast({ title: "Conversation supprimée" });
      }
    } catch (e) { toast({ title: "Erreur lors de la suppression", variant: "destructive" }); }
  };

  const startRenaming = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const saveRename = async (id: string) => {
    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: editingTitle })
      });
      if (res.ok) {
        setSessions((prev) => prev.map((s) => s.id === id ? { ...s, title: editingTitle } : s));
        setEditingSessionId(null);
      }
    } catch (e) { toast({ title: "Erreur lors du renommage" }); }
  };

  const createNewChat = async () => {
    setMessages([]);
    setActiveSessionId(null);
    window.history.pushState({}, '', '/expert/chat');
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupSessionsByDate = (sessions: ChatSession[]) => {
    const groups: { [key: string]: ChatSession[]; } = {
      "Aujourd'hui": [],
      "Hier": [],
      "Précédents": []
    };

    sessions.forEach((s) => {
      const d = new Date(s.created_at);
      if (isToday(d)) groups["Aujourd'hui"].push(s); else
        if (isYesterday(d)) groups["Hier"].push(s); else
          groups["Précédents"].push(s);
    });

    return groups;
  };

  const groupedSessions = groupSessionsByDate(filteredSessions);

  const detachWidget = (widgetData: unknown) => {
    // Check if duplicate
    if (detachedWidgets.find((w) => JSON.stringify(w.data) === JSON.stringify(widgetData))) {
      toast({ title: "Widget déjà détaché" });
      return;
    }
    const newWidget = {
      data: widgetData,
      x: window.innerWidth - 300,
      y: 100 + detachedWidgets.length * 40,
      isMinimized: false
    };
    setDetachedWidgets((prev) => [...prev, newWidget]);
    toast({ title: "Widget épinglé à l'écran" });
  };

  const closeDetachedWidget = (index: number) => {
    setDetachedWidgets((prev) => prev.filter((_, i) => i !== index));
  };

  const updateWidgetPos = (index: number, x: number, y: number) => {
    setDetachedWidgets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], x, y };
      return next;
    });
  };

  const toggleMinimizeWidget = (index: number) => {
    setDetachedWidgets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], isMinimized: !next[index].isMinimized };
      return next;
    });
  };

  const loadDemo = () => {
    setMessages([
      { role: 'user', content: "Analyse ce schéma de liaison à la terre." },
      {
        role: 'assistant',
        content: `### Analyse du Régime de Neutre (SLT)

D'après les éléments fournis, voici l'analyse technique :

| Caractéristique | Valeur Détectée | Status |
| :--- | :--- | :--- |
| **Régime** | **TT** (Neutre à la terre) | ✅ Standard |
| **Prise de Terre** | 12.4 Ohms | ✅ Conforme (< 100Ω) |
| **Différentiel** | 500mA (Général) | ✅ Sélectif |

#### 📹 Inspection Vidéo
Voici l'extrait pertinent de l'inspection vidéo du TGBT :

<div class="video-container my-4 rounded-xl overflow-hidden shadow-2xl border border-white/10">
  <video controls class="w-full">
    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
  </video>
</div>

#### ⚠️ Recommandations
1. Vérifier la **continuité du PE** sur les départs secondaires.
2. Le disjoncteur **Q4 (Éclairage)** semble sous-calibré par rapport à la section (1.5mm² vs 20A protection).

> **Note :** La sélectivité ampèremétrique n'est pas totale avec le départ "Atelier".`,
        metadata: {
          mode: "Demo",
          method: "N/A",
          explanation: "Mode démonstration activé",
          valueAdded: "Démo",
          suggestions: []
        }
      },
      { role: 'user', content: "Calcule la chute de tension pour l'atelier." },
      {
        role: 'assistant',
        content: "Calcul effectué selon la norme **NF C 15-100**.",
        widget: {
          type: "voltage_drop",
          result: {
            ΔU_percent: 3.4,
            section: 10,
            conforme_autre: true
          }
        }
      }]
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  const streamChat = async (text: string, att?: typeof attachment) => {
    let finalInput = text;
    if (att) {
      if (att.url) {
        finalInput = `[Fichier Joint: ${att.name}](${att.url})\nCONTEXTE: Ce fichier a été uploadé par l'utilisateur. Analyse-le ou utilise-le comme référence.\nREQUÊTE: ${text}`;
      } else {
        finalInput = `[FICHIER: ${att.name}]\nCONTENU: ${att.content}\nREQUÊTE: ${text}`;
      }
    }

    const newMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    setIsLoading(true);
    setInput("");
    setAttachment(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    let currentSessionId = activeSessionId;

    try {
      // 1. Create Session if needed (API)
      if (!currentSessionId) {
        try {
          const res = await fetch('/api/chats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title: text.substring(0, 30) + "...", firstMessage: newMsg })
          });
          if (res.ok) {
            const data = await res.json();
            currentSessionId = data.id;
            setActiveSessionId(data.id);
            fetchChats(); // Refresh sidebar
          }
        } catch (e) { console.error("Failed to create chat session", e); }
      } else {
        // Save User Message to existing chat
        fetch(`/api/chats/${currentSessionId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ role: 'user', content: text })
        }).catch((e) => console.error("Failed to save user message", e));
      }

      const response = await aiMaster.process({
        task: 'auto', // ENABLE AUTO-ROUTING (was 'expert')
        prompt: finalInput,
        device: 'desktop',
        context: { activeAgent: 'expert' }
      });

      if (!response.success) throw new Error(response.message);

      // DYNAMIC RESPONSE HANDLING
      let content = "";
      let metadata = {
        mode: "Souverain (NS 01-001)",
        method: "Recherche Vectorielle (RAG)",
        explanation: "Consultation directe du corpus normatif.",
        valueAdded: "Information certifiée",
        suggestions: [] as string[]
      };

      if (response.modelUsed.includes('DESSIN')) {
        const imageUrl = response.data;
        content = `Voici la proposition visuelle pour votre demande : **${text}**\n\n![Visuel Généré](${imageUrl})`;
        metadata.mode = "DESSIN-PROQ AI";
        metadata.method = "Génération Visuelle Tech";
        metadata.explanation = "Schéma généré et validé par l'IA.";
        metadata.valueAdded = "Visualisation Technique";
      } else
        if (response.modelUsed.includes('KEBE') || response.modelUsed.includes('expert') || response.modelUsed.includes('Expert')) {
          const expertData = response.data;
          content = expertData.answer || (typeof expertData === 'string' ? expertData : JSON.stringify(expertData));
          metadata.explanation = `Consultation du corpus. ${expertData.sources?.length || 0} articles identifiés.`;
        } else {
          // Fallback for other agents
          content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
          metadata.mode = response.modelUsed;
          metadata.explanation = `Réponse générée par ${response.modelUsed}`;
        }

      const assistantMsg: Message = {
        role: "assistant",
        content: content,
        metadata: metadata
      };

      // 1. Save Full Message to DB (Background)
      if (currentSessionId) {
        fetch(`/api/chats/${currentSessionId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            role: 'assistant',
            content: assistantMsg.content,
            metadata: assistantMsg.metadata
          })
        }).catch((e) => console.error("Failed to save assistant message", e));
      }

      // 2. Stream to UI (Typewriter Effect)
      setIsLoading(false); // Stop spinner
      setMessages((prev) => [...prev, { ...assistantMsg, content: "" }]); // Start with empty

      const fullText = assistantMsg.content;
      let charIndex = 0;

      const streamInterval = setInterval(() => {
        if (charIndex >= fullText.length) {
          clearInterval(streamInterval);
          return;
        }

        const chunk = fullText.slice(charIndex, charIndex + 4); // 4 chars per tick
        charIndex += 4;

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          const lastMsg = updated[lastIdx];

          if (lastMsg && lastMsg.role === 'assistant') {
            updated[lastIdx] = {
              ...lastMsg,
              content: lastMsg.content + chunk
            };
          }
          return updated;
        });
      }, 10); // Very fast ticking for smooth effect

    } catch (err: unknown) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const generateVisual = async () => {
    if (!input.trim()) {
      toast({ title: "Prompt requis", description: "Décrivez l'image que vous voulez générer.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const prompt = input;
    setInput(""); // Clear input immediately

    // Add User Request to Chat
    const userMsg: Message = { role: "user", content: `🎨 Génère une image visuelle de : ${prompt}` };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ prompt: prompt, style: "technical-realistic" })
      });

      const data = await res.json();

      if (data.success && data.url) {
        const assistantMsg: Message = {
          role: "assistant",
          content: `Voici le visuel généré pour : **${prompt}**\n\n![Visuel Généré](${data.url})`,
          metadata: {
            mode: "DALL-E 3",
            method: "Generative AI",
            explanation: "Génération visuelle souveraine (via Python Backend)",
            valueAdded: "Illustration Technique",
            suggestions: []
          }
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Save to DB
        if (activeSessionId) {
          // Save both messages
          await fetch(`/api/chats/${activeSessionId}/messages`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ role: 'user', content: userMsg.content })
          });
          await fetch(`/api/chats/${activeSessionId}/messages`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ role: 'assistant', content: assistantMsg.content, metadata: assistantMsg.metadata })
          });
        }

      } else {
        throw new Error("Erreur de génération");
      }

    } catch (e: unknown) {
      toast({ title: "Erreur", description: "Impossible de générer l'image.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-slate-200 overflow-hidden font-sans">

      {/* --- SIDEBAR (Proquelec Pro Theme) --- */}
      <div className={cn(
        "bg-[#0f172a] flex flex-col border-r border-slate-800 transition-all duration-300 absolute md:relative z-30 h-full",
        showSidebar ? "w-[280px] translate-x-0 shadow-2xl md:shadow-none" : "w-0 -translate-x-full overflow-hidden opacity-0 md:opacity-100"
      )}>
        {/* Mobile Close Button */}
        <div className="md:hidden absolute -right-10 top-4">
          <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="text-white bg-slate-800/80 rounded-r-lg">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* New Chat & Search */}
        <div className="p-3 space-y-2">
          <Button
            onClick={createNewChat}
            className="w-full justify-start gap-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium h-10 px-3 rounded-lg transition-all shadow-[0_0_15px_-3px_rgba(8,145,178,0.4)]">

            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-lg font-light leading-none mb-0.5">+</span>
            </div>
            Nouveau chat
            <Edit3 className="w-4 h-4 ml-auto text-cyan-200/50" />
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b] border-none rounded-lg py-2 pl-9 pr-3 text-sm text-slate-300 focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-400" />

          </div>
        </div>

        {/* Navigation Categories */}
        <div className="px-3 py-2 space-y-1 border-b border-slate-800/50 pb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 text-slate-300 hover:text-cyan-100 hover:bg-cyan-900/10 h-9 px-3 rounded-lg text-sm font-normal transition-colors group">
                <LayoutGrid className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-left">Hub Applications</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="bg-[#1e293b] border-slate-700 text-slate-200 w-64 p-2 shadow-2xl">
              <DropdownMenuItem onClick={() => window.location.href = '/expert'} className="focus:bg-cyan-900/20 focus:text-cyan-400 cursor-pointer">
                <Activity className="w-4 h-4 mr-3 text-cyan-500" /> Dashboard Expert
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/expert/calculators'} className="focus:bg-emerald-900/20 focus:text-emerald-400 cursor-pointer">
                <Calculator className="w-4 h-4 mr-3 text-emerald-500" /> Calculateurs Normatifs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/expert/scanner'} className="focus:bg-amber-900/20 focus:text-amber-400 cursor-pointer">
                <ScanSearch className="w-4 h-4 mr-3 text-amber-500" /> Scanner de Conformité Photo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/expert/schemas'} className="focus:bg-purple-900/20 focus:text-purple-400 cursor-pointer">
                <Box className="w-4 h-4 mr-3 text-purple-500" /> Schémas & Diagrammes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/ged'} className="focus:bg-blue-900/20 focus:text-blue-400 cursor-pointer">
                <ShieldCheck className="w-4 h-4 mr-3 text-blue-500" /> GED PROQUELEC (Souveraine)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/office/document/new'} className="focus:bg-orange-900/20 focus:text-orange-400 cursor-pointer">
                <FileText className="w-4 h-4 mr-3 text-orange-500" /> Nouveau Rapport Expert
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 text-slate-300 hover:text-cyan-100 hover:bg-cyan-900/10 h-9 px-3 rounded-lg text-sm font-normal transition-colors group">
                <Folder className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-left">Mes Projets</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="bg-[#1e293b] border-slate-700 text-slate-200 w-64 p-2 shadow-2xl">
              <DropdownMenuItem className="focus:bg-slate-800 cursor-pointer">
                <HardHat className="w-4 h-4 mr-3 text-amber-500" /> Optimisation Almadies
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-slate-800 cursor-pointer">
                <Layers className="w-4 h-4 mr-3 text-indigo-500" /> Mise en conformité Villa Rose
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-slate-800 cursor-pointer">
                <Shield className="w-4 h-4 mr-3 text-green-500" /> Étude Installation Plateaux
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/expert/history'} className="focus:bg-slate-800 cursor-pointer">
                <History className="w-4 h-4 mr-3 text-slate-400" /> Voir tout l'historique
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setShowHelpModal(true)} variant="ghost" className="w-full justify-start gap-3 text-amber-500 hover:text-amber-100 hover:bg-amber-900/10 h-9 px-3 rounded-lg text-sm font-normal transition-colors">
            <HelpCircle className="w-4 h-4" /> Aide & Fonctionnalités
          </Button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {Object.entries(groupedSessions).map(([group, groupSessions]) => groupSessions.length > 0 &&
            <div key={group}>
              <p className="text-[10px] font-bold text-slate-500 px-3 mb-2 uppercase tracking-widest flex items-center gap-2">
                {group === "Aujourd'hui" && <Clock className="w-3 h-3" />}
                {group === "Hier" && <Calendar className="w-3 h-3" />}
                {group === "Précédents" && <History className="w-3 h-3" />}
                {group}
              </p>
              <div className="space-y-1">
                {groupSessions.map((session) =>
                  <div
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                    className={cn(
                      "group relative w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-sm truncate border border-transparent hover:border-slate-700",
                      activeSessionId === session.id ? "bg-slate-800 text-cyan-400 border-slate-700" : "text-slate-300 hover:bg-slate-800/80"
                    )}>

                    {editingSessionId === session.id ?
                      <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          title="Titre de la conversation"
                          placeholder="Renommer..."
                          className="bg-slate-900 text-white rounded px-1 w-full border border-cyan-500 outline-none"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveRename(session.id)} />

                        <button onClick={() => saveRename(session.id)} title="Enregistrer" className="text-green-500"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setEditingSessionId(null)} title="Annuler" className="text-red-500"><X className="w-3 h-3" /></button>
                      </div> :

                      <>
                        <span className="truncate flex-1">{session.title}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-slate-700 text-slate-400" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                            <DropdownMenuItem className="focus:bg-slate-700" onClick={(e) => startRenaming(session, e)}><Edit3 className="w-4 h-4 mr-2" /> Renommer</DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-slate-700"><Share className="w-4 h-4 mr-2" /> Partager</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem className="focus:bg-red-900/20 text-red-400 focus:text-red-400" onClick={(e) => deleteSession(session.id, e)}><Trash2 className="w-4 h-4 mr-2" /> Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    }
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#0f172a]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg text-[10px] font-bold text-white shadow-cyan-500/20">
                  {user?.email?.substring(0, 2).toUpperCase() || 'PRO'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-slate-200 truncate">{user?.email || 'Utilisateur Expert'}</p>
                  <p className="text-[10px] text-cyan-500 font-medium">{user?.role === 'admin' ? 'Administrateur' : 'Licence Active'}</p>
                </div>
                <LucideSettings className="w-4 h-4 text-slate-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" className="bg-[#1e293b] border-slate-700 text-slate-200 w-64 p-3 space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Configuration IA</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 flex items-center gap-2"><Lock className="w-3 h-3 text-cyan-400" /> Mode Souverain</span>
                  <button
                    onClick={() => setIsSovereignMode(!isSovereignMode)}
                    title={isSovereignMode ? "Désactiver le Mode Souverain" : "Activer le Mode Souverain"}
                    className={cn(
                      "w-8 h-4 rounded-full transition-colors relative",
                      isSovereignMode ? "bg-cyan-600" : "bg-slate-700"
                    )}>

                    <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", isSovereignMode ? "left-4.5" : "left-0.5")} />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Température: {aiTemperature}</span>
                  </div>
                  <input
                    type="range" min="0" max="1" step="0.1"
                    title="Température de l'IA"
                    value={aiTemperature}
                    onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500" />

                </div>
              </div>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem className="focus:bg-slate-800"><LucideSettings className="w-4 h-4 mr-2" /> Paramètres Compte</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-red-900/20 text-red-400"><XCircle className="w-4 h-4 mr-2" /> Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* --- HELP MODAL --- */}
      {
        showHelpModal &&
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-cyan-500/10">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-900/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30">
                  <HelpCircle className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Guide IA Souveraine</h3>
                  <p className="text-xs text-slate-400">Écosystème Expert PROQUELEC v2.5</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-400" />
                  </div>
                  <h4 className="font-bold text-slate-200">Mode Expert NS</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Intelligence certifiée basée sur les référentiels NS 01-001 et NF C 15-100 pour des réponses normatives garanties.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4 className="font-bold text-slate-200">Données Souveraines</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Tous vos échanges et calculs sont stockés localement sur les serveurs PROQUELEC, garantissant une confidentialité totale.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="font-bold text-slate-200">Assistant Visuel</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Générez des schémas techniques et des vues architecturales directement par commande vocale ou textuelle.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-green-400" />
                  </div>
                  <h4 className="font-bold text-slate-200">Calculateurs Intégrés</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Chute de tension, section de câble, bilan de puissance - l'IA exécute les calculs et affiche les widgets interactifs.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                <h4 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Astuces d'Utilisation
                </h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
                  <li>Utilisez le bouton 🪄 pour transformer une idée technique en visuel 3D/2D.</li>
                  <li>Uploadez vos photos de coffrets pour une analyse de conformité automatique.</li>
                  <li>Demandez "Affiche le calcul de chute de tension" pour activer le widget spécialisé.</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end">
              <Button onClick={() => setShowHelpModal(false)} className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl px-8">J'ai compris</Button>
            </div>
          </div>
        </div>

      }

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col relative w-full bg-[#020617]">

        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-slate-800/50 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)} className="text-slate-400 hover:text-white">
              <SidebarIcon className="w-5 h-5" />
            </Button>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-8 border-none bg-transparent hover:bg-slate-800 focus:ring-0 text-slate-200 gap-2 px-2 md:px-3 rounded-lg font-medium text-xs md:text-sm max-w-[150px] md:max-w-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                {availableModelsList.map((m) =>
                  <SelectItem key={m.id} value={m.id} className="focus:bg-slate-800 cursor-pointer text-xs md:text-sm">
                    <span className="font-medium text-cyan-400">{m.name}</span> <span className="text-slate-500 ml-2 hidden md:inline">({m.provider})</span>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <ReportExport messages={messages} />
        </header>

        {/* Detached Widgets Container */}
        {detachedWidgets.map((w, idx) =>
          <div
            key={idx}
            className={cn(
              "fixed z-[100] transition-shadow duration-300 dynamic-pos",
              w.isMinimized ? "shadow-md" : "shadow-2xl"
            )}
            // eslint-disable-next-line react/forbid-dom-props
            style={{
              '--pos-x': `${w.x}px`,
              '--pos-y': `${w.y}px`
            } as React.CSSProperties}>

            <div className="relative group pointer-events-auto bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-xl animate-in zoom-in duration-300">
              {/* Header / Drag Handle */}
              <div
                className="h-8 bg-slate-800/80 flex items-center justify-between px-2 cursor-move select-none"
                onMouseDown={(e) => {
                  const startX = e.pageX - w.x;
                  const startY = e.pageY - w.y;
                  const onMouseMove = (moveE: MouseEvent) => {
                    updateWidgetPos(idx, moveE.pageX - startX, moveE.pageY - startY);
                  };
                  const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}>

                <div className="flex items-center gap-2">
                  <Calculator className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                    {w.data.type === "voltage_drop" ? "Chute Tent." : "Calcul"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleMinimizeWidget(idx)}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400"
                    title={w.isMinimized ? "Agrandir" : "Réduire"}>

                    {w.isMinimized ? <Maximize2 className="w-2.5 h-2.5" /> : <Minimize2 className="w-2.5 h-2.5" />}
                  </button>
                  <button
                    onClick={() => closeDetachedWidget(idx)}
                    className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-500"
                    title="Fermer">

                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {!w.isMinimized &&
                <div className="p-1">
                  <CalculationWidget data={w.data} isDetached />
                </div>
              }
              {w.isMinimized &&
                <div className="px-3 py-1 bg-cyan-500/10 text-[10px] text-cyan-400 font-bold">
                  {w.data.result.ΔU_percent}% | {w.data.result.section}mm²
                </div>
              }
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scroll-smooth" onClick={() => window.innerWidth < 768 && setShowSidebar(false)}>
          <div className="max-w-[50rem] mx-auto w-full px-4 pt-4 md:pt-10 pb-32">

            {messages.length === 0 &&
              <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="relative">
                  <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="w-20 h-20 bg-[#0f172a] rounded-2xl flex items-center justify-center border border-cyan-500/30 relative z-10 shadow-2xl">
                    <Zap className="w-10 h-10 text-cyan-400 fill-cyan-400/10" />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Expert NS 01-001</h2>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    L'intelligence artificielle souveraine pour vos audits électriques. Normes certifiées et calculs précis.
                  </p>
                </div>
                <QuickPrompts onSelectPrompt={(p) => streamChat(p)} />
              </div>
            }

            {messages.map((m, i) =>
              <div key={i} className="group w-full py-8 text-slate-200">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 pt-1">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shadow-lg",
                      m.role === "assistant" ? "bg-cyan-600 text-white shadow-cyan-500/20" : "bg-slate-700 text-slate-300"
                    )}>
                      {m.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                  </div>

                  <div className="relative flex-1 space-y-2 overflow-hidden">
                    <div className="prose prose-invert max-w-none prose-p:leading-7 prose-headings:text-cyan-100 prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-code:text-cyan-200 prose-code:bg-cyan-950/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#0f172a] prose-pre:border prose-pre:border-slate-800">
                      <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: unknown) {
                            const match = /language-(\w+)/.exec(className || '');
                            if (!inline && match && match[1] === 'mermaid') {
                              return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                            }
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>);

                          },
                          div: ({ className, children, ...props }) => <div className={className} {...props}>{children}</div>,
                          img: ({ src, alt, ...props }) =>
                            <img
                              src={src}
                              alt={alt || "Image générée"}
                              className="rounded-lg max-w-full h-auto shadow-lg border border-slate-700 my-4"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'https://placehold.co/600x400/0f172a/94a3b8?text=Image+Indisponible';
                              }}
                              {...props} />


                        }}>

                        {m.content}
                      </ReactMarkdown>
                    </div>

                    {m.widget &&
                      <CalculationWidget
                        data={m.widget}
                        onDetach={() => detachWidget(m.widget)} />

                    }

                    {/* Message Actions */}
                    {m.role === 'assistant' &&
                      <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-cyan-400 hover:bg-cyan-950/30">
                          <LucideCopy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-cyan-400 hover:bg-cyan-950/30"><RefreshCw className="w-3 h-3" /></Button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            )}

            {isLoading &&
              <div className="py-8 flex gap-6 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/50" />
                <div className="space-y-2 flex-1 pt-1">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            }

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* --- FLOATING INPUT --- */}
        <div className="absolute bottom-6 left-0 right-0 px-4 z-20 pointer-events-none">
          <div className="max-w-[48rem] mx-auto pointer-events-auto">
            {/* Typing Indicator / Model Badge */}
            {showSidebar && messages.length > 0 &&
              <div className="flex justify-center mb-4">
                <Badge variant="outline" className="bg-black/40 backdrop-blur-sm border-cyan-500/30 text-cyan-400 text-[10px] px-3 py-1 animate-in fade-in slide-in-from-bottom-2">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Mode Expert | NS 01-001
                </Badge>
              </div>
            }

            <div className="bg-[#1e293b]/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-[26px] p-2 flex flex-col gap-2 transition-all focus-within:ring-1 focus-within:ring-cyan-500/50 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] relative overflow-hidden">
              {/* Gradient Glow */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

              {attachment &&
                <div className="px-4 pt-2 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                  <div className="w-10 h-10 bg-cyan-950/50 rounded-lg flex items-center justify-center border border-cyan-500/20">
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-200 truncate">{attachment.name}</p>
                    <p className="text-[10px] text-slate-400">Document joint</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-slate-700/50" onClick={() => setAttachment(null)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              }

              <div className="flex items-end gap-2 px-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-400 hover:text-white hover:bg-white/10 mb-0.5" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-purple-400 hover:text-purple-200 hover:bg-purple-900/20 mb-0.5" onClick={generateVisual} title="Générer un visuel (DALL-E)">
                  <Wand2 className="w-5 h-5" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  aria-label="Upload file"
                  title="Upload file"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // 1. Upload to Server (Real Storage)
                      const formData = new FormData();
                      formData.append('file', file);

                      try {
                        const res = await fetch('/api/storage/upload', {
                          method: 'POST',
                          body: formData,
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });

                        if (res.ok) {
                          const data = await res.json();
                          setAttachment({
                            name: file.name,
                            type: file.type.startsWith('image/') ? 'image' : 'document',
                            content: '[Uploaded to Server]',
                            url: data.url
                          });
                          toast({ description: "Fichier uploadé avec succès", duration: 1500 });
                        } else {
                          throw new Error("Upload failed");
                        }
                      } catch (err) {
                        console.error(err);
                        // Fallback to local read if upload fails
                        if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setAttachment({ name: file.name, type: 'document', content: ev.target?.result as string });
                          reader.readAsText(file);
                        } else {
                          setAttachment({ name: file.name, type: 'binary', content: 'Upload failed' });
                          toast({ variant: "destructive", description: "Erreur d'upload" });
                        }
                      }
                    }
                  }} />

                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); streamChat(input); } }}
                  placeholder="Posez une question technique..."
                  className="flex-1 min-h-[44px] max-h-[150px] bg-transparent border-none focus-visible:ring-0 resize-none py-3 text-[15px] placeholder:text-slate-400 text-slate-100 font-medium" />


                <div className="flex items-center gap-1 mb-0.5">
                  {!input.trim() &&
                    <Button variant="ghost" size="icon" className={cn("h-9 w-9 rounded-full transition-colors", isListening ? "text-red-500 bg-red-500/10 animate-pulse" : "text-slate-400 hover:text-white hover:bg-white/10")}
                      onClick={() => { if (recognitionRef.current) { isListening ? recognitionRef.current.stop() : recognitionRef.current.start(); setIsListening(!isListening); } }}>
                      {isListening ? <MicOff className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
                    </Button>
                  }

                  <Button
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    onClick={() => streamChat(input)}
                    className={cn("h-9 w-9 rounded-xl transition-all flex items-center justify-center",
                      input.trim() ? "bg-cyan-500 text-white hover:bg-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.5)]" : "bg-slate-700 text-slate-500")}>

                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center mt-3">
              <p className="text-[10px] text-slate-500 font-medium">
                IA certifiée PROQUELEC v2.5. Les résultats techniques doivent être validés par un ingénieur agréé.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>);

}

// Icons
function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00006H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006L2.5 1.00006C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50006C5 4.67163 5.67157 4.00006 6.5 4.00006H12.5C13.3284 4.00006 14 4.67163 14 5.50006V12.5001C14 13.3285 13.3284 14.0001 12.5 14.0001H6.5C5.67157 14.0001 5 13.3285 5 12.5001V5.50006ZM6.5 5.00006H12.5C12.7761 5.00006 13 5.22392 13 5.50006V12.5001C13 12.7762 12.7761 13.0001 12.5 13.0001H6.5C6.22386 13.0001 6 12.7762 6 12.5001V5.50006C6 5.22392 6.22386 5.00006 6.5 5.00006Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>);

}

function SettingsIcon() {
  return <MoreHorizontal className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />;
}