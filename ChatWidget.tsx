
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

  // Reset chat when student changes
  useEffect(() => {
    setMessages([]);
    chatSessionRef.current = null;
    if (isOpen) {
      initChat();
    }
  }, [student.id]);

  const initChat = () => {
    if (chatSessionRef.current) return;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const studentData = `
      Name: ${student.name}
      Section: ${student.section}
      FA1 Total: ${student.fa1.total} (Rank: ${student.fa1.rank})
      FA2 Total: ${student.fa2.total} (Rank: ${student.fa2.rank})
      SA1 Total: ${student.sa1.total} (Rank: ${student.sa1.rank})
      Attendance: ${student.attendance.totalAttendedDaysUntilNov}/120 days.
    `;

    chatSessionRef.current = ai.chats.create({
      model: 'gemini-flash-latest',
      config: {
        systemInstruction: `You are the S.P.P.Z.P.P. School Digital Mentor. 
        CONTEXT: ${studentData}
        RULES:
        1. Speak ONLY in TELUGU.
        2. Be encouraging, empathetic, and professional.
        3. Give detailed study plans based on the marks provided.
        4. If attendance is low, warn the parents gently.
        5. Mention the March 16th Public Exams as a key milestone.
        6. Keep responses formatted with bullet points for readability.`,
      }
    });

    setMessages([{
      role: 'model',
      text: `నమస్కారం! నేను ${student.name} గారి విద్యా సహాయకుడిని. మార్కుల విశ్లేషణ లేదా చదువులో మెరుగుదల గురించి మీకు ఏవైనా సందేహాలు ఉంటే ఇక్కడ అడగండి.`
    }]);
  };

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) initChat();

      const stream = await chatSessionRef.current.sendMessageStream({ message: textToSend });
      
      // Add empty message for streaming
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      let fullResponse = '';
      for await (const chunk of stream) {
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
      setMessages(prev => [...prev, { role: 'model', text: 'క్షమించండి, సర్వర్ సమస్య వల్ల సమాధానం ఇవ్వలేకపోతున్నాను.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    if (!isOpen) initChat();
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] no-print">
      {/* Launcher Bubble */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="group relative flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full shadow-[0_8px_30px_rgb(37,99,235,0.4)] hover:bg-blue-700 hover:scale-110 transition-all duration-300"
        >
          <div className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white text-[10px] font-bold flex items-center justify-center">1</span>
          </div>
          <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          
          {/* Tooltip */}
          <div className="absolute right-20 bg-slate-900 text-white text-xs font-black py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-slate-700">
            Ask AI Assistant (Telugu)
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[420px] h-[600px] max-h-[80vh] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  Interactive AI
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                </h3>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Live Support • {student.name}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed font-telugu shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text || <Loader2 className="w-4 h-4 animate-spin opacity-40" />}
                </div>
                <span className="text-[8px] mt-1 text-slate-400 font-black uppercase tracking-widest">
                  {msg.role === 'user' ? 'You' : 'Mentor AI'}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-100 space-y-4 shrink-0">
            {/* Quick Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(undefined, q)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-full text-[10px] font-bold transition-all whitespace-nowrap border border-slate-200 active:scale-95 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ప్రశ్న అడగండి..."
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl pl-5 pr-14 py-4 text-sm font-telugu focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all focus:bg-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all shadow-md active:scale-90 ${
                  input.trim() && !isLoading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
            
            <div className="flex items-center justify-center gap-1.5 text-[8px] text-slate-300 font-black uppercase tracking-[0.2em] pt-1">
               <Zap className="w-2.5 h-2.5 fill-current" /> Gemini Live Contextual Engine
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
