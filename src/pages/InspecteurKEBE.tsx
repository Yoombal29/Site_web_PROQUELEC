import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, Zap, Layout, HelpCircle, CheckCircle, Search, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
    role: 'user' | 'kebe';
    text: string;
    tools_used?: string[];
    has_schema?: boolean;
    sources?: string[];
}

const detectTools = (text: string, prevMsg?: string): string[] => {
  const tools: string[] = [];
  const lower = (text + ' ' + (prevMsg || '')).toLowerCase();
  if (lower.match(/chute.?de.?tension|voltage.?drop|chute.?tension/i)) tools.push('calcul_chute_tension');
  if (lower.match(/section.?de.?cable|cable.?section|dimensionnement/i)) tools.push('dimensionnement_cable');
  if (lower.match(/loi.?d.?ohm|ohm|tension|courant|puissance/i)) tools.push('loi_ohm');
  if (lower.match(/schema|schéma|diagram|mermaid|tableau|unifilaire/i)) tools.push('generation_schema');
  if (lower.match(/norme|nf|ns|article|conformité/i)) tools.push('consultation_norme');
  if (lower.match(/protection|disjoncteur|différentiel|sectionneur/i)) tools.push('protection_electrique');
  if (lower.match(/eclairage|éclairage|lumière|luminosité/i)) tools.push('calcul_eclairage');
  if (lower.match(/mise.?a.?la.?terre|terre|prise.?de.?terre/i)) tools.push('verification_terre');
  return [...new Set(tools)];
};

const hasSchema = (text: string): boolean => {
  return text.includes('```mermaid') || text.includes('graph ') || text.includes('flowchart') ||
         /\[.*\]\(.*\)|\bbob\b|sequenceDiagram|classDiagram/.test(text);
};

const InspecteurKEBE = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'kebe',
            text: "Salam 👋\n\nJe suis l'Assistant PROQUELEC, votre guide intelligent pour le site et l'électricité.\n\nJe peux vous aider à :\n\n• 🔧 **Calculs techniques** (chute de tension, section de câble, loi d'Ohm)\n• 📐 **Schémas électriques** (tableaux, unifilaires)\n• 📖 **Normes** NS 01-001\n• 🗺️ **Vous guider** sur le site (pages, outils, services)\n• 🛡️ **Protection et sécurité** des installations\n\nQue puis-je pour vous ?",
            tools_used: ['consultation_norme']
        }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        const question = input;
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Tu es l'Inspecteur KEBE, expert en électricité et normes PROQUELEC (NS 01-001).
Réponds de manière précise et professionnelle en français.
Si la question concerne un calcul (chute de tension, section de câble, loi d'Ohm), donne la formule et un exemple chiffré.
Si la question concerne un schéma électrique, réponds avec un diagramme en format mermaid (entre \`\`\`mermaid et \`\`\`).
Si la question concerne une norme, cite l'article exact.

Question : ${question}`,
                    task: 'text',
                    context: { type: 'expert_kebe' }
                }),
            });

            if (!response.ok) {
              const errText = await response.text().catch(() => '');
              throw new Error(errText || `Erreur ${response.status}`);
            }

            const data = await response.json();
            const reply = data?.response || data?.text || data?.code || JSON.stringify(data);

            const tools = detectTools(reply, question);
            const has_mermaid = hasSchema(reply);

            const kebeMsg: Message = {
                role: 'kebe',
                text: reply,
                tools_used: tools.length > 0 ? tools : undefined,
                has_schema: has_mermaid,
            };
            setMessages(prev => [...prev, kebeMsg]);
        } catch (error: any) {
            toast({
              title: 'Erreur',
              description: "Impossible de contacter l'IA. Vérifiez que Groq est configuré.",
              variant: 'destructive',
            });
            setMessages(prev => [...prev, {
                role: 'kebe',
                text: "Désolé, l'Assistant PROQUELEC rencontre une difficulté. Vérifiez que la clé API Groq est configurée dans /expert/ai-providers."
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
                            Assistant PROQUELEC
                        </h1>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Guide intelligent du site — Alimenté par Groq
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex gap-6">
                    <div className="flex flex-col items-center">
                        <Zap className="text-yellow-400 w-5 h-5" />
                        <span className="text-[10px] text-slate-400">Calcul</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Layout className="text-blue-400 w-5 h-5" />
                        <span className="text-[10px] text-slate-400">Schéma</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Search className="text-green-400 w-5 h-5" />
                        <span className="text-[10px] text-slate-400">Normes</span>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 shadow-xl ${
                            m.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}>
                            <p className="whitespace-pre-wrap leading-relaxed text-sm">{m.text}</p>

                            {m.tools_used && m.tools_used.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-slate-800">
                                    {m.tools_used.map(tool => (
                                        <span key={tool} className="text-[10px] bg-blue-950 text-blue-400 px-2 py-1 rounded-full flex items-center gap-1 border border-blue-900">
                                            <CheckCircle size={10} /> {tool.replace(/_/g, ' ')}
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
                            <span className="text-xs text-slate-400">KEBE consulte les normes...</span>
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
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Posez votre question à l'Assistant PROQUELEC..."
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-blue-500 transition-colors shadow-2xl"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-2 p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-full transition-all"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <p className="text-[10px] text-center text-slate-500 mt-2">
                    Assistant PROQUELEC — alimenté par Groq · Vérifiez toujours les calculs sur site
                </p>
            </footer>
        </div>
    );
};

export default InspecteurKEBE;
