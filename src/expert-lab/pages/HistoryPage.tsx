import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from

"@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import {
  History,
  Search,
  Trash2,
  Download,
  MessageSquare,
  Calendar,
  MoreVertical,
  Eye,
  FileText,

  Zap,
  Clock,

  ArrowDownToLine,
  Star,
  StarOff } from
"lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = {role: "user" | "assistant";content: string;images?: string[];};

type ConversationSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  starred: boolean;
  tags: string[];
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null);
  const [filterStarred, setFilterStarred] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const savedSessions = localStorage.getItem("yeai_conversation_sessions");
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    } else {
      // Migrate from old format
      const oldHistory = localStorage.getItem("yeai_chat_history_v7");
      if (oldHistory) {
        const messages = JSON.parse(oldHistory);
        if (messages.length > 0) {
          const newSession: ConversationSession = {
            id: Date.now().toString(),
            title: generateTitle(messages),
            messages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            starred: false,
            tags: ["migré"]
          };
          setSessions([newSession]);
          saveSessions([newSession]);
        }
      }
    }
  };

  const generateTitle = (messages: Message[]): string => {
    const firstUserMsg = messages.find((m) => m.role === "user");
    if (firstUserMsg) {
      return firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? "..." : "");
    }
    return "Nouvelle conversation";
  };

  const saveSessions = (data: ConversationSession[]) => {
    localStorage.setItem("yeai_conversation_sessions", JSON.stringify(data));
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
    toast({ title: "Supprimé", description: "Conversation supprimée" });
  };

  const toggleStar = (id: string) => {
    const updated = sessions.map((s) =>
    s.id === id ? { ...s, starred: !s.starred } : s
    );
    setSessions(updated);
    saveSessions(updated);
  };

  const exportSession = (session: ConversationSession, format: "json" | "md" | "txt") => {
    let content = "";
    let filename = `yeai_${session.id}`;
    let mimeType = "text/plain";

    if (format === "json") {
      content = JSON.stringify(session, null, 2);
      filename += ".json";
      mimeType = "application/json";
    } else if (format === "md") {
      content = `# ${session.title}\n\n*Créé le ${new Date(session.createdAt).toLocaleDateString("fr-FR")}*\n\n---\n\n`;
      session.messages.forEach((m) => {
        const role = m.role === "user" ? "👤 **Utilisateur**" : "🤖 **YEAI**";
        content += `${role}\n\n${m.content}\n\n---\n\n`;
      });
      filename += ".md";
    } else {
      content = `${session.title}\nCréé le ${new Date(session.createdAt).toLocaleDateString("fr-FR")}\n\n`;
      session.messages.forEach((m) => {
        const role = m.role === "user" ? "[UTILISATEUR]" : "[YEAI]";
        content += `${role}\n${m.content}\n\n`;
      });
      filename += ".txt";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Export Réussi", description: `Fichier ${filename} téléchargé` });
  };

  const exportAll = () => {
    const content = JSON.stringify(sessions, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yeai_all_conversations_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Complet", description: "Toutes les conversations exportées" });
  };

  const clearAll = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer tout l'historique ?")) {
      setSessions([]);
      localStorage.removeItem("yeai_conversation_sessions");
      localStorage.removeItem("yeai_chat_history_v7");
      toast({ title: "Historique Vidé", description: "Toutes les conversations ont été supprimées" });
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStarred ? s.starred : true;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 relative overflow-hidden">
      <div className="scanline" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-violet-500/20 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 glass border-violet-500/40 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <History className="w-8 h-8 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
              Historique <span className="text-violet-400 tracking-normal">Neural</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-violet-400/50" />
              <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">{sessions.length} conversations archivées</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400/40" />
            <Input
              className="glass pl-10 h-10 w-64 border-violet-500/20 bg-black/20"
              placeholder="Rechercher dans l'historique..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} />
            
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFilterStarred(!filterStarred)}
            className={`h-10 w-10 ${filterStarred ? 'bg-amber-500/20 border-amber-500/40' : 'glass border-white/10'}`}>
            
            <Star className={`w-4 h-4 ${filterStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={exportAll} className="h-10 glass border-violet-500/20">
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            <span className="text-[10px] uppercase font-black">Export All</span>
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} className="h-10 glass border-red-500/20 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-2 text-red-400" />
            <span className="text-[10px] uppercase font-black text-red-400">Vider</span>
          </Button>
        </div>
      </div>

      {/* LISTE DES SESSIONS */}
      <div className="grid gap-4 relative z-10">
        {filteredSessions.length === 0 ?
        <Card className="glass border-violet-500/20 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-violet-400/20 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase text-zinc-500">Aucune conversation</h3>
            <p className="text-sm text-zinc-600 mt-2">Vos échanges avec YEAI apparaîtront ici</p>
          </Card> :

        <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3 pr-4">
              {filteredSessions.map((session) =>
            <Card
              key={session.id}
              className="glass border-violet-500/10 hover:border-violet-500/40 group transition-all cursor-pointer">
              
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0" onClick={() => setSelectedSession(session)}>
                        <div className="flex items-center gap-3 mb-2">
                          <MessageSquare className="w-4 h-4 text-violet-400 shrink-0" />
                          <h3 className="font-bold text-sm truncate group-hover:text-violet-400 transition-colors">
                            {session.title}
                          </h3>
                          {session.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(session.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {session.messages.length} messages
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {session.tags.map((tag, i) =>
                      <Badge key={i} variant="outline" className="text-[8px] border-violet-500/30 text-violet-400">
                              {tag}
                            </Badge>
                      )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass bg-black/90">
                          <DropdownMenuItem onClick={() => setSelectedSession(session)}>
                            <Eye className="w-4 h-4 mr-2" /> Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStar(session.id)}>
                            {session.starred ? <StarOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                            {session.starred ? "Retirer favori" : "Ajouter favori"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportSession(session, "md")}>
                            <FileText className="w-4 h-4 mr-2" /> Export MD
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportSession(session, "json")}>
                            <Download className="w-4 h-4 mr-2" /> Export JSON
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteSession(session.id)} className="text-red-400">
                            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
            )}
            </div>
          </ScrollArea>
        }
      </div>

      {/* DIALOG PREVIEW */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="glass bg-black/95 border-violet-500/30 max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-violet-400" />
              <span className="font-black uppercase">{selectedSession?.title}</span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4">
            <div className="space-y-4 pr-4">
              {selectedSession?.messages.map((msg, i) =>
              <div
                key={i}
                className={`p-4 rounded-2xl ${
                msg.role === "user" ?
                "bg-violet-500/10 border border-violet-500/20 ml-12" :
                "bg-cyan-500/5 border border-cyan-500/10 mr-12"}`
                }>
                
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-[8px] ${msg.role === "user" ? "border-violet-500/40 text-violet-400" : "border-cyan-500/40 text-cyan-400"}`}>
                      {msg.role === "user" ? "UTILISATEUR" : "YEAI"}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{msg.content}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>);

}