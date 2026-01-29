/**
 * 🇸🇳 YEAI - Your Electrical AI (Version Sénégalaise)
 * IA Souveraine spécialisée en électricité - EXCLUSIVEMENT NS 01-001
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSenegalAI } from '@/hooks/useSenegalAI';
import {
    Brain, Send, RotateCcw, ChevronRight,
    ShieldCheck, AlertTriangle, Flag, BookOpen,
    Zap, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStats } from '@/data/ns01001-loader';

export default function YEAISenegal() {
    const { querySenegalEngine, loading } = useSenegalAI();
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const stats = getStats();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || loading) return;

        const userMsg = { role: 'user', content: query };
        setMessages(prev => [...prev, userMsg]);
        const currentQuery = query;
        setQuery('');

        const response = await querySenegalEngine(currentQuery);

        if (response.status === 'refused') {
            setMessages(prev => [...prev, {
                role: 'system',
                content: response.message,
                type: 'refusal',
                metadata: response.metadata
            }]);
        } else {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: response.content,
                type: 'accepted',
                articles: response.articles,
                metadata: response.metadata
            }]);
        }
    };

    const suggestedQuestions = [
        'Hauteur minimale des tableaux électriques ?',
        'Protection différentielle obligatoire ?',
        'Section minimale des conducteurs ?',
        'Distances de sécurité en BT ?'
    ];

    return (
        <div className="flex flex-col h-[700px] bg-gradient-to-br from-green-950/80 via-emerald-950/60 to-teal-950/80 rounded-[2.5rem] border border-green-500/30 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* HEADER SÉNÉGALAIS */}
            <div className="bg-gradient-to-r from-green-900/90 to-emerald-900/90 border-b border-green-500/40 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
                                <Flag className="text-white w-7 h-7" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-2 border-green-950 flex items-center justify-center">
                                <Brain className="w-3 h-3 text-green-950" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                🇸🇳 YEAI Sénégal
                                <Badge className="bg-green-400 text-green-950 font-black text-[10px] px-3 py-1">
                                    NS 01-001 ONLY
                                </Badge>
                            </h3>
                            <p className="text-xs text-green-300/80 font-semibold mt-1">
                                IA Souveraine • {stats.totalRules} Articles • Norme Sénégalaise Exclusive
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Badge variant="outline" className="border-green-400/30 text-green-300 text-[9px] font-black uppercase">
                                <Shield className="w-3 h-3 mr-1" /> 100% Sénégal
                            </Badge>
                            <Badge variant="outline" className="border-green-400/30 text-green-300 text-[9px] font-black uppercase">
                                <Zap className="w-3 h-3 mr-1" /> No Foreign Norms
                            </Badge>
                        </div>
                        <p className="text-[8px] text-right text-green-500/50 font-bold">
                            Pages {stats.pageRange.start}-{stats.pageRange.end} • {stats.totalTitres} Titres
                        </p>
                    </div>
                </div>
            </div>

            {/* ZONE DE MESSAGES */}
            <div className="flex-grow overflow-y-auto p-6 custom-scrollbar space-y-6" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-12 space-y-6">
                        <div className="p-6 bg-green-500/10 rounded-3xl border border-green-500/20 mb-2">
                            <BookOpen className="w-14 h-14 text-green-400 opacity-40" />
                        </div>
                        <h4 className="text-2xl font-black text-green-100 italic">
                            "La Souveraineté Normative du Sénégal"
                        </h4>
                        <p className="text-sm text-slate-400 max-w-xl font-medium leading-relaxed">
                            Cette IA consulte <span className="text-green-400 font-bold">exclusivement la norme sénégalaise NS 01-001</span>.
                            Les normes étrangères (NF C, IEC, IEEE) sont <span className="text-red-400 font-bold">automatiquement rejetées</span>.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-6">
                            {suggestedQuestions.map(q => (
                                <button
                                    key={q}
                                    onClick={() => setQuery(q)}
                                    className="px-5 py-4 bg-green-950/60 border border-green-700/50 rounded-2xl text-xs font-bold text-green-300 hover:border-green-400/60 hover:bg-green-900/40 transition-all text-left flex items-center justify-between group"
                                >
                                    <span className="flex-1">{q}</span>
                                    <ChevronRight className="w-4 h-4 text-green-500/50 group-hover:text-green-400 transition-colors" />
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl max-w-lg">
                            <p className="text-[10px] text-yellow-400 font-bold uppercase text-center">
                                ⚠️ Refus Automatique des Normes Étrangères
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className={`max-w-[85%] rounded-[1.5rem] p-6 relative ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/20'
                                : msg.type === 'refusal'
                                    ? 'bg-red-500/10 border-2 border-red-500/30 text-red-300'
                                    : 'bg-green-950/60 border-2 border-green-700/40 text-slate-200'
                            }`}>
                            {msg.role === 'ai' && (
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-green-700/30">
                                    <ShieldCheck className="w-5 h-5 text-green-400" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-green-400">
                                        Réponse Normée NS 01-001
                                    </span>
                                    {msg.metadata && (
                                        <Badge className="ml-auto bg-green-500/20 text-green-300 text-[8px] px-2 py-0.5">
                                            {msg.metadata.rulesFound} règle(s) • {msg.metadata.processingTime}ms
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {msg.type === 'refusal' && (
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-red-500/30">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-red-400">
                                        Refus de Conformité
                                    </span>
                                </div>
                            )}

                            <div className="prose prose-invert prose-sm font-medium leading-relaxed max-w-none">
                                {msg.content.split('\n').map((line: string, i: number) => (
                                    <p key={i} className="mb-2 last:mb-0">{line}</p>
                                ))}
                            </div>

                            {msg.articles && msg.articles.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-green-700/30 space-y-3">
                                    <p className="text-[9px] font-black text-green-500/70 uppercase tracking-widest mb-3">
                                        📚 Références NS 01-001 Consultées
                                    </p>
                                    <div className="space-y-2">
                                        {msg.articles.map((art: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 rounded-lg p-2">
                                                <Badge className="bg-green-500/20 text-green-300 text-[10px] px-2 py-1 font-bold">
                                                    Art. {art.article}
                                                </Badge>
                                                <span className="text-[10px] text-slate-400 flex-1">
                                                    {art.titre.substring(0, 40)}...
                                                </span>
                                                <span className="text-[9px] text-green-500/50 font-mono">
                                                    p.{art.page}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-green-950/60 border-2 border-green-700/40 p-5 rounded-2xl flex items-center gap-3">
                            <RotateCcw className="w-5 h-5 animate-spin text-green-400" />
                            <span className="text-sm font-bold text-green-400 uppercase tracking-widest">
                                Consultation NS 01-001...
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* ZONE DE SAISIE */}
            <div className="p-6 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-t border-green-500/30">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="relative flex-grow">
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Ex: Quelle est la section minimale pour un circuit d'éclairage ?"
                            className="w-full bg-green-950/60 border-2 border-green-700/40 rounded-2xl h-14 pl-6 pr-12 text-sm font-medium text-white placeholder:text-green-700 focus:ring-2 focus:ring-green-500/40 focus:border-green-500/60 outline-none transition-all"
                            disabled={loading}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Flag className="w-4 h-4 text-green-600" />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-2xl transition-all shadow-xl shadow-green-500/30 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
                <p className="mt-3 text-[10px] text-center text-green-600 font-bold uppercase tracking-widest">
                    🇸🇳 Propulsé par la <span className="text-green-400">Norme Sénégalaise NS 01-001</span> • {stats.totalRules} Articles
                </p>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(34, 197, 94, 0.2); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(34, 197, 94, 0.3); 
        }
      `}</style>
        </div>
    );
}
