
import React, { useEffect, useRef, useState } from 'react';
//import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, X, Sparkles, Volume2 } from 'lucide-react';

// Audio Processing Utilities
function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

export const LiveAssistant: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);

  useEffect(() => {
    if (isOpen && !isActive && !isConnecting) {
      startSession();
    }
    return () => stopSession();
  }, [isOpen]);

  const startSession = async () => {
    setIsConnecting(true);
    // try {
    //   const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    //   audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    //   audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
    //   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
    //   const sessionPromise = ai.live.connect({
    //     model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    //     config: {
    //       responseModalities: [Modality.AUDIO],
    //       speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
    //       systemInstruction: "You are 'Kedu Assistant', a friendly and highly knowledgeable Nigerian peer tutor. You help university students (specifically from institutions like Unilag, UI, and OAU) with their studies. Be conversational, use a supportive tone, and occasionally use phrases like 'Oya let's go' or 'Correct' to make it feel local. Focus on clarity and academic excellence.",
    //     },
    //     callbacks: {
    //       onopen: () => {
    //         setIsActive(true);
    //         setIsConnecting(false);
    //         const source = audioContextInRef.current!.createMediaStreamSource(stream);
    //         const processor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
    //         processor.onaudioprocess = (e) => {
    //           const inputData = e.inputBuffer.getChannelData(0);
    //           const int16 = new Int16Array(inputData.length);
    //           for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
    //           sessionPromise.then(s => s.sendRealtimeInput({ 
    //             media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
    //           }));
    //         };
    //         source.connect(processor);
    //         processor.connect(audioContextInRef.current!.destination);
    //       },
    //       onmessage: async (msg) => {
    //         const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    //         if (base64Audio && audioContextOutRef.current) {
    //           const ctx = audioContextOutRef.current;
    //           nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
    //           const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000);
    //           const source = ctx.createBufferSource();
    //           source.buffer = buffer;
    //           source.connect(ctx.destination);
    //           source.start(nextStartTimeRef.current);
    //           nextStartTimeRef.current += buffer.duration;
    //         }
    //         if (msg.serverContent?.interrupted) {
    //           nextStartTimeRef.current = 0;
    //         }
    //       },
    //       onclose: () => setIsActive(false),
    //       onerror: (e) => console.error("Live API Error:", e),
    //     }
    //   });
    //   sessionRef.current = sessionPromise;
    // } catch (err) {
    //   console.error("Failed to start session:", err);
    //   setIsConnecting(false);
    // }
  };

  const stopSession = () => {
    sessionRef.current?.then((s: any) => s.close());
    audioContextInRef.current?.close();
    audioContextOutRef.current?.close();
    setIsActive(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-t-[48px] p-8 animate-in slide-in-from-bottom duration-500 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-none">Kedu Assistant</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                {isActive ? <><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span> Listening</> : 'Connecting...'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-full text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-10 space-y-8">
          <div className="relative flex items-center justify-center">
            <div className={`w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center relative z-10 transition-transform ${isActive ? 'scale-110 shadow-indigo-200 shadow-2xl' : 'opacity-50'}`}>
              <Mic size={48} className="text-white" />
            </div>
            {isActive && <div className="absolute pulse-ring w-48 h-48 pointer-events-none"></div>}
          </div>
          
          <div className="text-center max-w-xs">
            <p className="text-slate-900 font-bold text-lg mb-2">
              {isConnecting ? "Waking up your study buddy..." : "Ask me anything!"}
            </p>
            <p className="text-slate-400 text-sm">
              "Tell me the main points of my next session" or "Summarize my Calculus notes"
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
           <div className="p-4 bg-slate-50 rounded-3xl flex flex-col items-center text-center">
             <Volume2 size={20} className="text-slate-400 mb-2" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clear Audio</span>
           </div>
           <div className="p-4 bg-indigo-50 rounded-3xl flex flex-col items-center text-center">
             <Sparkles size={20} className="text-indigo-600 mb-2" />
             <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">AI Tutor</span>
           </div>
           <button onClick={stopSession} className="p-4 bg-rose-50 rounded-3xl flex flex-col items-center text-center">
             <MicOff size={20} className="text-rose-600 mb-2" />
             <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">End Session</span>
           </button>
        </div>
      </div>
    </div>
  );
};
