import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, Zap, Layout, HelpCircle, CheckCircle } from 'lucide-react';
import mermaid from 'mermaid';

interface Message {
    role: 'user' | 'kebe';
    text: string;
    tools_used?: string[];
    has_schema?: boolean;
}

const InspecteurKEBE = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'kebe',
            text: "Salam ! Je suis l'Inspecteur KEBE de PROQUELEC. Comment puis-je vous aider dans votre installation électrique aujourd'hui ? Je peux calculer vos chutes de tension, dimensionner vos câbles ou dessiner vos schémas de tableau."
        }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.initialize({ startOnLoad: true, theme: 'dark' });
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (messages.some(m => m.has_schema)) {
            mermaid.contentLoaded();
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();
            const kebeMsg: Message = {
                role: 'kebe',
                text: data.message,
                tools_used: data.tools_used,
                has_schema: data.has_schema
            };
            setMessages(prev => [...prev, kebeMsg]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'kebe',
                text: "Désolé, je rencontre une difficulté technique avec mon cerveau artificiel. Veuillez vérifier que le serveur backend est lancé."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
            {/* Header */}
            <header className="bg-slate-900 border-b border-blue-900/50 p-4 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-blue-400">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                            Inspecteur KEBE
                        </h1>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Expert PROQUELEC — Norme NS 01-001
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex gap-4">
                    <div className="flex flex-col items-center">
                        <Zap className="text-yellow-400 w-5 h-5" />
                        <span className="text-[10px] text-slate-400">Calcul</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Layout className="text-blue-400 w-5 h-5" />
                        <span className="text-[10px] text-slate-400">Schéma</span>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 shadow-xl ${m.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                            }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>

                            {m.tools_used && m.tools_used.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-slate-800">
                                    {m.tools_used.map(tool => (
                                        <span key={tool} className="text-[10px] bg-blue-950 text-blue-400 px-2 py-1 rounded-full flex items-center gap-1 border border-blue-900">
                                            <CheckCircle size={10} /> {tool.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                            </div>
                            <span className="text-xs text-slate-400">KEBE réfléchit selon les normes...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>

            {/* Input Area */}
            <footer className="p-4 bg-slate-950 border-t border-slate-900">
                <div className="max-w-4xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Posez votre question technique à l'Inspecteur KEBE..."
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-blue-500 transition-colors shadow-2xl"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="absolute right-2 top-2 p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-full transition-all"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <p className="text-[10px] text-center text-slate-500 mt-2">
                    Assistant technique basé sur la norme NF C 15-100 / NS 01-001. Toujours vérifier les calculs sur site.
                </p>
            </footer>
        </div>
    );
};

export default InspecteurKEBE;
