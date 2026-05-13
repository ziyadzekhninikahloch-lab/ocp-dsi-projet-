import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, ShieldAlert, FileText, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AuditResult } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIFixHelperProps {
  auditResult: AuditResult | null;
}

export default function AIFixHelper({ auditResult }: AIFixHelperProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
      const context = auditResult 
        ? `Le résultat de l'audit actuel est: score ${auditResult.score}%. Findings: ${auditResult.findings.join(', ')}. Code Quality: ${auditResult.codeQuality}. Documentation: ${auditResult.documentation}.`
        : "Aucun audit n'a été effectué pour le moment.";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: "user", parts: [{ text: `Système: Tu es l'assistant IA OCP DSI spécialisé dans l'amélioration des projets. Voici le contexte de l'audit: ${context}\n\nUtilisateur: ${text}` }] }
        ],
      });

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.text || "Je suis désolé, je n'ai pas pu générer de réponse." 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Erreur de connexion avec l'IA." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickButtons = [
    { label: 'How to fix security?', icon: ShieldAlert, action: () => handleSend('How to fix security issues in my project based on the audit?') },
    { label: 'Why is my score so low?', icon: Info, action: () => handleSend('Explain why my audit score is what it is and how to improve it.') },
  ];

  return (
    <aside className="w-[240px] h-full bg-white/40 backdrop-blur-3xl border-l border-white/60 flex flex-col shrink-0 p-6 z-10 shadow-2xl overflow-hidden">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-tr from-ocp-blue to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">AI Fix Helper</p>
          <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Live Assistant</p>
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="bg-ocp-blue text-white p-3 rounded-2xl rounded-tl-none shadow-md">
              <p className="text-[11px] leading-relaxed">
                Connectez un projet pour obtenir des conseils personnalisés sur votre score d'audit.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex flex-col gap-1", msg.role === 'user' ? "items-end" : "items-start")}>
              <div className={cn(
                "max-w-full p-3 rounded-2xl text-[11px] leading-relaxed",
                msg.role === 'user' 
                  ? "bg-slate-800 text-white rounded-tr-none" 
                  : "bg-white/80 border border-white/60 text-slate-600 rounded-tl-none shadow-sm"
              )}>
                <div className="prose prose-sm prose-slate prose-invert">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/80 border border-white/60 p-2 rounded-2xl flex gap-1">
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 shrink-0 space-y-2">
        {quickButtons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-left px-3 flex items-center gap-2"
          >
            <btn.icon className="w-3 h-3 text-ocp-blue" />
            {btn.label}
          </button>
        ))}
        <button 
          onClick={() => alert('Générateur de rapport...')}
          className="w-full py-2 bg-ocp-lime text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-lime-200/50 hover:bg-ocp-lime/90 transition-all mt-2"
        >
          Generate Report PDF
        </button>
      </div>

      <div className="mt-4 bg-slate-100/50 rounded-2xl p-1 flex border border-slate-200 shrink-0">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask for fixes..." 
          className="bg-transparent border-none text-[11px] w-full px-3 py-2 outline-none" 
        />
        <Button 
          size="icon" 
          onClick={() => handleSend()}
          className="w-8 h-8 rounded-xl bg-ocp-blue hover:bg-ocp-blue/90"
        >
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </aside>
  );
}
