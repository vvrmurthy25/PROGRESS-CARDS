
import React, { useState, useEffect, useRef } from 'react';
import { Student } from './types';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  Loader2, 
  Zap, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface Props {
  student: Student;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const QUICK_QUESTIONS = [
  "నా మొత్తం మార్కుల రిపోర్ట్ చెప్పండి.",
  "గణితంలో (Maths) నేను ఎలా మెరుగుపడాలి?",
  "నా హాజరు (Attendance) శాతం బాగుందా?",
  "పబ్లిక్ పరీక్షలకు ప్రిపరేషన్ టిప్స్ ఇవ్వండి."
];

const ChatWidget: React.FC<Props> = ({ student }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    chatSessionRef.current = null;
    if (isOpen) {
      initChat();
    }
  }, [student.id]);

  const initChat = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setMessages([{
        role: 'model',
        text: 'క్షమించండి, AI అసిస్టెంట్ పని చేయడానికి API కీ అవసరం. దయచేసి సెట్టింగ్స్ తనిఖీ చేయండి.'
      }]);
      return;
    }

    if (chatSessionRef.current) return;

    const ai = new GoogleGenAI({ apiKey });
    const studentData = `Name: ${student.name}, FA1: ${student.fa1.total}, FA2: ${student.fa2.total}, SA1: ${student.sa1.total}.`;

    chatSessionRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are the S.P.P.Z.P.P. School Digital Mentor. Context: ${studentData}. Speak ONLY in TELUGU.`,
      }
    });

    setMessages([{
      role: 'model',
      text: `నమస్కారం! నేను ${student.name} గారి విద్యా సహాయకుడిని. మీకు ఏవైనా సందేహాలు ఉంటే అడగండి.`
    }]);
  };

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    if (!process.env.API_KEY) {
      alert("API Key missing!");
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) initChat();

      const responseStream = await chatSessionRef.current.sendMessageStream({ message: textToSend });
      
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      let fullResponse = '';
      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullResponse += c.text;
          setMessages(prev => {
            const next = [...prev];
            next[next.length - 1].text = fullResponse;
            return next;
          });
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'model', text: 'క్షమించండి, సాంకేతిక సమస్య ఎదురైంది.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) initChat();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] no-print">
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="group relative flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all duration-300"
        >
          <MessageSquare className="w-8 h-8" />
        </button>
      )}

      {isOpen && (
        <div className="w-[90vw] sm:w-[420px] h-[600px] max-h-[80vh] bg-white rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest">Interactive AI</h3>
            <button onClick={() => setIsOpen(false)}><ChevronDown /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-sm font-telugu ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800'
                }`}>
                  {msg.text || <Loader2 className="animate-spin" />}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 bg-white border-t space-y-4">
             <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => handleSend(undefined, q)} className="px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold whitespace-nowrap">
                  {q}
                </button>
              ))}
            </div>
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ప్రశ్న అడగండి..."
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl pl-5 pr-14 py-4 text-sm font-telugu"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
