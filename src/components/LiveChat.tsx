
import { useState, useRef, useEffect } from "react";
import { aiMaster } from "@/lib/ai-master";
import { MessageCircle, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import axios from "axios";
import { toast } from "sonner";
import { Cpu, Activity, Play, Square, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  message: string;
  timestamp: Date;
}

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      message: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    }]
  );
  const [newMessage, setNewMessage] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isServiceLoading, setIsServiceLoading] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useIsAdmin();

  const handleAction = async (service: string, action: 'start' | 'stop') => {
    setIsServiceLoading(prev => ({ ...prev, [service]: true }));
    try {
      const endpoint = action === 'start' ? '/api/admin/ai/start' : '/api/admin/ai/stop';
      await axios.post(endpoint, { service }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success(`${service} : Action ${action} initiée.`);

      // Add a status feedback message
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'agent',
        message: `Action <strong>${action === 'start' ? 'Démarrage' : 'Arrêt'}</strong> demandée pour <strong>${service}</strong>. Le système traite votre requête.`,
        timestamp: new Date()
      }]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setIsServiceLoading(prev => ({ ...prev, [service]: false }));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'user',
      message: newMessage,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');

    // Handle Admin Commands
    if (isAdmin && (newMessage.toLowerCase().includes('/status') || newMessage.toLowerCase().includes('/ai'))) {
      setIsAgentTyping(true);
      setTimeout(async () => {
        try {
          const res = await axios.get('/api/ai/status');
          const statuses = res.data;

          let statusHtml = `
            <div class="space-y-3 p-1">
              <div class="flex items-center gap-2 border-b pb-2 mb-2">
                <span class="text-xs font-bold uppercase text-slate-500">Infrastructure IA</span>
              </div>
          `;

          statuses.forEach((s: any) => {
            const color = s.status === 'online' ? 'text-green-500' : s.status === 'starting' ? 'text-amber-500' : 'text-slate-400';
            statusHtml += `
              <div class="flex items-center justify-between gap-3 text-xs bg-white p-2 rounded border border-slate-100 shadow-sm">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-current ${color}"></div>
                  <span class="font-medium">${s.service}</span>
                </div>
                <span class="font-mono opacity-60">${s.status}</span>
              </div>
            `;
          });

          statusHtml += `
            <div class="pt-2 text-[10px] text-slate-400 italic">
              Allez dans le <strong>Tableau de Bord Administration</strong> pour un contrôle total.
            </div>
            </div>
          `;

          setMessages(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            sender: 'agent',
            message: statusHtml,
            timestamp: new Date()
          }]);
        } catch (err) {
          setMessages(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            sender: 'agent',
            message: 'Erreur lors de la récupération du statut IA.',
            timestamp: new Date()
          }]);
        }
        setIsAgentTyping(false);
      }, 800);
      return;
    }

    setIsAgentTyping(true);
    // AI-Powered Intelligent Response using AI MAITRE
    setTimeout(async () => {
      // UPDATED: Using Auto-Routing (task undefined = auto)
      const response = await aiMaster.process({
        task: 'auto',
        prompt: userMessage.message, // Pass direct user message for intent detection
        device: 'mobile'
      });

      let messageContent = response.success ? response.data : 'Excusez-moi, je rencontre une petite difficulté technique. Un agent humain va prendre le relais.';

      // Handle structured response from Expert RAG
      if (typeof messageContent === 'object' && messageContent !== null && 'answer' in messageContent) {
        messageContent = messageContent.answer;
      }
      // Handle Image URL response
      if (String(messageContent).startsWith('http')) {
        messageContent = `<img src="${messageContent}" alt="Visual generated" class="rounded-lg mt-2 max-w-full" />`;
      }

      const agentMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'agent',
        message: String(messageContent), // Ensure it's a string
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsAgentTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-proqblue hover:bg-proqblue-dark animate-pulse">

          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>);

  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl transition-all duration-300",
      isMinimized ? "w-80 h-14" : "w-80 h-96"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-proqblue text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-medium">Support PROQUELEC</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-proqblue-dark">

            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-proqblue-dark">

            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized &&
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 h-64 p-3">
            <div className="space-y-3">
              {messages.map((message) =>
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === 'user' ? "justify-end" : "justify-start"
                  )}>

                  <div
                    className={cn(
                      "max-w-[70%] px-3 py-2 rounded-lg text-sm",
                      message.sender === 'user' ?
                        "bg-proqblue text-white" :
                        "bg-gray-100 text-gray-800"
                    )}>

                    {/* Render HTML for images/formatting */}
                    <div dangerouslySetInnerHTML={{ __html: message.message }} />

                    <div className={cn(
                      "text-xs mt-1 opacity-70",
                      message.sender === 'user' ? "text-right" : "text-left"
                    )}>
                      {message.timestamp.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )}

              {isAgentTyping &&
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                  </div>
                </div>
              }
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 text-sm" />

              <Button
                onClick={sendMessage}
                size="sm"
                disabled={!newMessage.trim()}
                className="bg-proqblue hover:bg-proqblue-dark">

                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      }
    </div>);

}