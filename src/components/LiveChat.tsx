
import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
      timestamp: new Date(),
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsAgentTyping(true);

    // Simulation d'une réponse automatique
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'agent',
        message: 'Merci pour votre message. Un de nos experts va vous répondre dans les plus brefs délais.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, agentMessage]);
      setIsAgentTyping(false);
    }, 2000);
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
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-proqblue hover:bg-proqblue-dark animate-pulse"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
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
            className="text-white hover:bg-proqblue-dark"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-proqblue-dark"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 h-64 p-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] px-3 py-2 rounded-lg text-sm",
                      message.sender === 'user'
                        ? "bg-proqblue text-white"
                        : "bg-gray-100 text-gray-800"
                    )}
                  >
                    {message.message}
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
              ))}
              
              {isAgentTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
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
                className="flex-1 text-sm"
              />
              <Button
                onClick={sendMessage}
                size="sm"
                disabled={!newMessage.trim()}
                className="bg-proqblue hover:bg-proqblue-dark"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
