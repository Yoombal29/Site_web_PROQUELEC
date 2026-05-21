
import React, { useState, useRef, useEffect } from 'react';
import { useSovereignAI } from '@/hooks/useSovereignAI';
import {
  Brain, Send,
  RotateCcw, Lock, ChevronRight,
  ShieldCheck, AlertTriangle, Scale } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


export default function SovereignAIEngine() {
  const { querySovereignEngine, loading } = useSovereignAI();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<unknown[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = query;
    setQuery('');

    const response = await querySovereignEngine(currentQuery);

    if (response) {
      if (response.status === 'refused') {
        setMessages((prev) => [...prev, {
          role: 'system',
          content: response.message,
          type: 'refusal'
        }]);
      } else {
        setMessages((prev) => [...prev, {
          role: 'ai',
          content: response.content,
          type: 'accepted',
          articles: response.articles
        }]);
      }
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-[#0d2a21]/60 rounded-[2.5rem] border border-emerald-900/40 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* HEADER DOCTRINAL */}
            <div className="bg-emerald-950/80 border-b border-emerald-900/50 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                        <Brain className="text-emerald-400 w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            Sovereign AI <Badge className="bg-emerald-500 text-slate-950 font-black text-[10px]">DOCTRINAL</Badge>
                        </h3>
                        <p className="text-xs text-emerald-500/60 font-medium">Soumis au Corpus Normatif Central</p>
                    </div>
                </div>
                <div className="hidden md:flex gap-3">
                    <Badge variant="outline" className="border-emerald-800 text-emerald-400/70 text-[9px] font-black uppercase tracking-widest">
                        SQL ONLY
                    </Badge>
                    <Badge variant="outline" className="border-emerald-800 text-emerald-400/70 text-[9px] font-black uppercase tracking-widest">
                        NO INTERPRETATION
                    </Badge>
                </div>
            </div>

            {/* MESSAGES ZONE */}
            <div className="flex-grow overflow-y-auto p-6 custom-scrollbar space-y-6" ref={scrollRef}>
                {messages.length === 0 &&
        <div className="h-full flex flex-col items-center justify-center text-center px-12 space-y-6">
                        <div className="p-4 bg-emerald-500/5 rounded-full border border-emerald-500/10 mb-2">
                            <Scale className="w-10 h-10 text-emerald-600 opacity-20" />
                        </div>
                        <h4 className="text-xl font-black text-emerald-100 italic">"La norme est la loi. La référence est la preuve."</h4>
                        <p className="text-sm text-slate-500 max-w-sm font-medium">
                            Posez une question technique. L'IA consultera exclusivement la base de données SQL pour vous répondre avec précision.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-4">
                            {['Limite chute de tension ?', 'Règles Habilitation B1 ?', 'Étapes Consignation ?', 'Volume 0 Salle de bain ?'].map((t) =>
            <button
              key={t}
              onClick={() => setQuery(t)}
              className="px-4 py-3 bg-[#0a231b] border border-emerald-900/50 rounded-xl text-xs font-bold text-emerald-500/80 hover:border-emerald-500/40 hover:text-emerald-400 transition-all text-left flex items-center justify-between" aria-label="Action">
              
                                    {t} <ChevronRight className="w-3 h-3" />
                                </button>
            )}
                        </div>
                    </div>
        }

                {messages.map((msg, idx) =>
        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className={`max-w-[85%] rounded-[1.5rem] p-6 relative ${msg.role === 'user' ?
          'bg-emerald-500 text-slate-950 font-bold' :
          msg.type === 'refusal' ?
          'bg-red-500/10 border border-red-500/20 text-red-400' :
          'bg-[#0a231b] border border-emerald-900/50 text-slate-300'}`
          }>
                            {msg.role === 'ai' &&
            <div className="flex items-center gap-2 mb-3">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70">Réponse Normée</span>
                                </div>
            }
                            {msg.type === 'refusal' &&
            <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500/70">Refus de Conformité</span>
                                </div>
            }

                            <div className="prose prose-invert prose-sm font-medium leading-relaxed">
                                {msg.content}
                            </div>

                            {msg.articles &&
            <div className="mt-6 pt-4 border-t border-emerald-900/50 space-y-2">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Preuve SQL consultée</p>
                                    {msg.articles.map((art: unknown, i: number) =>
              <div key={i} className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400 text-[10px] py-1 px-2">
                                                    {art.normative_books?.ref_code} - {art.article_ref}
                                                </Badge>
                                            </div>
                                        </div>
              )}
                                </div>
            }
                        </div>
                    </div>
        )}

                {loading &&
        <div className="flex justify-start animate-pulse">
                        <div className="bg-[#0a231b] border border-emerald-900/50 p-4 rounded-2xl flex items-center gap-3">
                            <RotateCcw className="w-4 h-4 animate-spin text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-500/60 uppercase tracking-widest leading-none">Consultation SQL...</span>
                        </div>
                    </div>
        }
            </div>

            {/* INPUT ZONE */}
            <div className="p-6 bg-emerald-950/40 border-t border-emerald-900/50">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="relative flex-grow">
                        <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Quelle est la limite de chute de tension pour l'éclairage ?"
              className="w-full bg-[#071914] border border-emerald-900/50 rounded-2xl h-14 pl-6 pr-12 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600" />
            
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <Lock className="w-3 h-3 text-slate-700" />
                        </div>
                    </div>
                    <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-14 w-14 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex-shrink-0">
            
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
                <p className="mt-3 text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest">
                    Logiciel de Sécurité <span className="text-emerald-800">NF C 18-510</span> activé par défaut
                </p>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.1); border-radius: 10px; }
      `}</style>
        </div>);

}