import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import Markdown from 'react-markdown';

export default function GymChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isAiLoading, isOpen]);

  const sendMessage = async () => {
    const trimmed = chatMessage.trim();
    if (!trimmed || isAiLoading) return;
    
    const newMessage = { role: 'user', text: trimmed };
    setChatHistory(prev => [...prev, newMessage]);
    setChatMessage('');
    setIsAiLoading(true);

    try {
      // Send only recent 4 messages to minimize token usage
      const optimizedHistory = chatHistory.slice(-4);

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: trimmed, 
          history: optimizedHistory, 
          user: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null
        })
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(prev => [...prev, { role: 'assistant', text: data.text }]);
      } else if (res.status === 429) {
        const data = await res.json();
        setChatHistory(prev => [...prev, { role: 'assistant', text: data.text || "⏳ Rate limit reached. Please wait a moment before sending another message." }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', text: "I'm sorry, I'm having trouble connecting right now." }]);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 left-4 top-4 sm:left-auto sm:top-auto sm:bottom-24 sm:right-6 origin-bottom-right pointer-events-auto flex flex-col justify-end"
          >
            <Card className="flex flex-col w-full h-full sm:w-[400px] sm:h-[500px] sm:max-h-[600px] p-0 overflow-hidden shadow-2xl border border-neutral-200">
              <div className="bg-[var(--color-brand-secondary)] p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">JB Fitness A.I</h3>
                    <p className="text-xs opacity-80">24/7 Receptionist & Fitness Guide</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100 transition-opacity">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--color-neu-light)]">
                {chatHistory.length === 0 ? (
                  <div className="text-center opacity-50 mt-10 font-medium text-sm">
                    Start a conversation...<br/>e.g. "What are the gym timings?"
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[var(--color-brand-primary)] text-black rounded-tr-sm font-semibold' : 'bg-white rounded-tl-sm shadow-sm font-medium border border-neutral-100'}`}>
                        <div className="markdown-body space-y-2"><Markdown>{msg.text}</Markdown></div>
                      </div>
                    </div>
                  ))
                )}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 rounded-2xl font-medium bg-white rounded-tl-sm shadow-sm flex items-center gap-2 border border-neutral-100">
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-3 bg-white border-t border-neutral-100 flex flex-col gap-1">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type your message (max 400 chars)..." 
                    maxLength={400}
                    className="flex-1 text-sm bg-neutral-50 h-10 border-neutral-200"
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && !isAiLoading && sendMessage()}
                    disabled={isAiLoading}
                  />
                  <Button variant="primary" className="h-10 px-4" onClick={sendMessage} disabled={isAiLoading || !chatMessage.trim()}>
                    Send
                  </Button>
                </div>
                {chatMessage.length > 300 && (
                  <span className="text-[10px] text-neutral-400 text-right">
                    {chatMessage.length}/400 chars
                  </span>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ pointerEvents: isOpen ? "none" : "auto" }}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-neutral-800 text-white rotate-90 scale-90 opacity-0 pointer-events-none absolute' : 'bg-[var(--color-brand-primary)] text-black hover:scale-105 active:scale-95 z-50 pointer-events-auto'}`}
      >
        <Dumbbell className="w-6 h-6" />
      </button>
      {isOpen && (
        <button 
          onClick={() => setIsOpen(false)}
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 bg-neutral-800 text-white hover:scale-105 active:scale-95 absolute bottom-0 right-0 z-50 pointer-events-auto"
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
