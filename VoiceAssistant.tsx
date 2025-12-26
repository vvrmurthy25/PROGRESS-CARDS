
import React, { useState, useRef, useEffect } from 'react';
import { Student } from './types';
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, X, Volume2, VolumeX, Loader2, Waves } from 'lucide-react';

interface Props {
  student: Student;
}

// Audio Encoding & Decoding Utilities
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const VoiceAssistant: React.FC<Props> = ({ student }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const liveSessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = () => {
    setIsActive(false);
    setStatus('idle');
    if (liveSessionRef.current) {
      try { liveSessionRef.current.close(); } catch (e) {}
      liveSessionRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      try { outputAudioContextRef.current.close(); } catch (e) {}
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
  };

  const startSession = async () => {
    if (isActive) return;

    try {
      setStatus('connecting');
      setIsActive(true);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      await audioContextRef.current.resume();
      await outputAudioContextRef.current.resume();

      nextStartTimeRef.current = 0;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const studentContext = `Student: ${student.name}, Section: ${student.section}, FA1: ${student.fa1.total}, FA2: ${student.fa2.total}, SA1: ${student.sa1.total}. Attendance: ${student.attendance.totalAttendedDaysUntilNov}/120.`;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContextRef.current,
                24000,
                1,
              );
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Voice AI Error:', e);
            stopSession();
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are the S.P.P.Z.P.P. High School Interactive Voice Assistant. 
          Conduct a TWO-WAY conversation in TELUGU with ${student.name}. 
          CONTEXT: ${studentContext}
          RULES:
          1. Speak ONLY in TELUGU.
          2. Introduce yourself: "నమస్కారం! నేను మీ లైవ్ వాయిస్ అసిస్టెంట్‌ని. ${student.name} మార్కుల గురించి చర్చిద్దాం."
          3. Be encouraging and provide clear study tips.
          4. Warn about March 16th public exams.
          5. Keep responses concise and audible.`
        },
      });

      liveSessionRef.current = await sessionPromise;

    } catch (err) {
      console.error('Voice Assistant failed to start:', err);
      stopSession();
    }
  };

  return (
    <div className="fixed bottom-6 right-24 z-[100] no-print">
      {!isActive ? (
        <button
          onClick={startSession}
          className="group relative flex items-center justify-center w-16 h-16 bg-slate-900 text-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:bg-slate-800 hover:scale-110 transition-all duration-300 border border-slate-700"
        >
          <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
             <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-slate-900"></span>
          </div>
          <div className="absolute right-20 bg-slate-900 text-white text-[10px] font-black py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-slate-700">
            LIVE VOICE (TELUGU)
          </div>
        </button>
      ) : (
        <div className="w-72 bg-slate-900 text-white rounded-[2rem] shadow-2xl border border-slate-700 overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          <div className="p-5 flex flex-col items-center gap-6">
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Assistant</span>
              </div>
              <button onClick={stopSession} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                status === 'active' ? 'bg-blue-600 scale-110' : 'bg-slate-800'
              }`}>
                {status === 'connecting' ? (
                  <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
                ) : (
                   <Waves className={`w-10 h-10 ${status === 'active' ? 'animate-pulse' : 'opacity-20'}`} />
                )}
              </div>
              {status === 'active' && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-400/30 animate-ping" />
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm font-bold font-telugu">
                {status === 'connecting' ? 'కనెక్ట్ అవుతోంది...' : 
                 status === 'active' ? 'AI మాట్లాడుతోంది...' : 'సిద్ధంగా ఉంది'}
              </p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Real-time Audio Engine</p>
            </div>

            <div className="flex gap-4 w-full pt-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all ${
                  isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{isMuted ? 'Muted' : 'Listen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
