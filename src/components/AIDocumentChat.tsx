import React, { useState } from 'react';
import { Send, Bot, User, X, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { aiMaster } from '@/lib/ai-master';
import { AIMessage } from '@/expert-lab/lib/UnifiedAIService';



// ... (other imports)
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AIDocumentChatProps {
  documentName: string;
  documentContext?: string; // Content summary or full text if available
  onClose: () => void;
}

export function AIDocumentChat({ documentName, documentContext, onClose }: AIDocumentChatProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
  { role: 'assistant', content: `Bonjour ! Je suis l'assistant IA de ce document ("${documentName}"). Posez-moi une question sur son contenu ou demandez-moi un résumé.` }]
  );
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const updatedMessages: AIMessage[] = [...messages, { role: 'user', content: inputValue }];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiMaster.process({
        task: 'expert',
        prompt: inputValue,
        context: {
          documentName,
          documentContext
        }
      });

      if (response.success) {
        const expertData = response.data;
        const answer = typeof expertData === 'string' ? expertData : expertData.answer;
        setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: "L'expert PROQUELEC est en cours de réflexion ou indisponible." }]);
      }
    } catch (error) {
      console.error("Erreur Expert Chat:", error);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Désolé, une erreur est survenue lors de l'analyse." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-2xl border-proqblue/20 w-full md:w-[450px] fixed bottom-4 right-4 z-50 bg-white">
            <CardHeader className="bg-gradient-to-r from-proqblue to-proqblue-dark text-white rounded-t-xl p-4 flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <div>
                        <CardTitle className="text-sm font-bold">Assistant Documentaire</CardTitle>
                        <div className="flex items-center gap-1 text-[10px] opacity-90 truncate max-w-[200px]">
                            <FileText className="h-3 w-3" /> {documentName}
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-slate-50 relative">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((msg, index) => {
              const isOutOfBounds = msg.role === 'assistant' && msg.content.includes("hors périmètre");

              return (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  
                                    <div
                    className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ?
                    'flex-row-reverse' :
                    'flex-row'}`
                    }>
                    
                                        <div className={`mt-1 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-proqblue text-white' : 'bg-amber-500 text-white'}`
                    }>
                                            {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                        </div>

                                        <div
                      className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm overflow-hidden prose prose-sm max-w-none ${msg.role === 'user' ?
                      'bg-proqblue text-white rounded-tr-none prose-invert' :
                      'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`
                      }>
                      
                                            {isOutOfBounds &&
                      <Alert variant="destructive" className="mb-2 p-2 border-red-200 bg-red-50">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertTitle className="ml-2 text-xs font-bold text-red-800">Hors Périmètre</AlertTitle>
                                                    <AlertDescription className="ml-2 text-xs text-red-700">
                                                        Cette question semble sortir du cadre normatif électrique.
                                                    </AlertDescription>
                                                </Alert>
                      }

                                            <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose-table:border-collapse prose-table:w-full prose-th:border prose-th:p-1 prose-td:border prose-td:p-1"
                        components={{
                          a: ({ node, ...props }) => <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
                        }}>
                        
                                                {msg.content}
                                            </ReactMarkdown>

                                            {msg.role === 'assistant' && index === 0 &&
                      <div className="mt-2 flex flex-wrap gap-2 not-prose">
                                                    <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 text-[10px]" onClick={() => setInputValue("Résume ce document")}>Résumer</Badge>
                                                    <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 text-[10px]" onClick={() => setInputValue("Quels sont les points clés ?")}>Points Clés</Badge>
                                                    <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 text-[10px]" onClick={() => setInputValue("Y a-t-il des non-conformités ?")}>Non-conformités</Badge>
                                                </div>
                      }
                                        </div>
                                    </div>
                                </div>);

            })}
                        {isLoading &&
            <div className="flex justify-start">
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 ml-10">
                                    <Loader2 className="h-4 w-4 animate-spin text-proqblue" />
                                    <span className="text-xs text-slate-500">Analyse en cours...</span>
                                </div>
                            </div>
            }
                        {/* Element to scroll to view (dummy) */}
                        <div className="h-1" />
                    </div>
                </ScrollArea>

                <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                    <div className="relative">
                        <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez une question sur le document..."
              className="pr-12 rounded-full border-slate-200 focus:border-proqblue focus:ring-proqblue" />
            
                        <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 rounded-full bg-proqblue hover:bg-proqblue-dark text-white">
              
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>);

}