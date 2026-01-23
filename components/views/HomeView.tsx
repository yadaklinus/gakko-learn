
import React, { useState } from 'react';
import { Bell, BookOpen, Star, BrainCircuit, X, Sparkles, Mic } from 'lucide-react';
import { User, Session } from '../types';
import { geminiService } from '../services/geminiService';
import { LiveAssistant } from '../components/LiveAssistant';

interface HomeViewProps {
  user: User;
}

const MOCK_SESSIONS: Session[] = [
  {
    id: 's1',
    studentId: 'u1',
    tutorId: 't2',
    subject: 'Data Structures',
    date: 'Today',
    time: '4:00 PM',
    duration: 60,
    status: 'UPCOMING',
    topic: 'Graph Algorithms'
  }
];

const HomeView: React.FC<HomeViewProps> = ({ user }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyGuide, setStudyGuide] = useState<string | null>(null);
  const [isLiveOpen, setIsLiveOpen] = useState(false);

  const handleGenerateGuide = async () => {
    setIsGenerating(true);
    const session = MOCK_SESSIONS[0];
    const guide = await geminiService.generateStudyGuide(session.subject, session.topic);
    setStudyGuide(guide);
    setIsGenerating(false);
  };

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 relative">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kedu, {user.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1">Master your subjects with verified peer experts.</p>
        </div>
        <button className="p-3 bg-white border border-slate-200 shadow-sm rounded-2xl relative hover:bg-slate-50 transition-colors">
          <Bell size={22} className="text-slate-600" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-600 p-6 rounded-[32px] text-white shadow-indigo-200 shadow-xl">
            <BookOpen className="mb-4" size={24} />
            <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Total Sessions</p>
            <p className="text-3xl font-black mt-1">12</p>
          </div>
          <div className="bg-emerald-500 p-6 rounded-[32px] text-white shadow-emerald-200 shadow-xl">
            <Star className="mb-4" size={24} />
            <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Campus Rank</p>
            <p className="text-3xl font-black mt-1">Top 5%</p>
          </div>
        </div>

        <div className="bg-white border-2 border-indigo-100 p-6 rounded-[32px] relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <BrainCircuit size={80} className="text-indigo-600" />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="bg-indigo-100 text-indigo-700 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 flex items-center">
              <Sparkles size={12} className="mr-1" /> AI Powered
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Study Prep</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-[80%]">Get an AI-generated study guide for your session on "{MOCK_SESSIONS[0].subject}".</p>
            <button 
              onClick={handleGenerateGuide}
              disabled={isGenerating}
              className="mt-auto w-full bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <>
                  <BrainCircuit size={18} />
                  <span>Generate Flash Guide</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Sessions</h2>
            <button className="text-indigo-600 text-sm font-bold hover:underline">View Calendar</button>
          </div>
          <div className="space-y-4">
            {MOCK_SESSIONS.map((session) => (
              <div key={session.id} className="group bg-white border border-slate-200 p-6 rounded-[32px] hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-inner group-hover:scale-105 transition-transform">
                      <img src={`https://picsum.photos/seed/${session.tutorId}/100`} alt="Tutor" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg leading-none mb-1">{session.subject}</h4>
                      <p className="text-sm text-slate-500 font-medium">{session.topic}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-slate-900">{session.time}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{session.date}</p>
                    </div>
                    <button className="bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all">
                      Join Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Top Rated</h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                  <img src={`https://picsum.photos/seed/tutor_side${i}/100`} alt="Tutor" className="object-cover w-full h-full" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    {i === 1 ? 'Dr. Chinelo Obi' : i === 2 ? 'Prof. Ibrahim Yusuf' : 'Zainab Dahiru'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {i === 1 ? 'Neuroscience' : i === 2 ? 'Applied Physics' : 'Economics'}
                  </p>
                </div>
                <div className="flex items-center text-amber-500 text-xs font-black">
                  <Star size={12} fill="currentColor" className="mr-1" />
                  5.0
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Floating AI Assistant Button */}
      <button 
        onClick={() => setIsLiveOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-200 flex items-center justify-center active:scale-90 transition-transform z-[150] hover:bg-indigo-700"
      >
        <Mic size={28} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
        </span>
      </button>

      {studyGuide && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setStudyGuide(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
              <X size={20} />
            </button>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <Sparkles size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Flash Guide</h3>
            </div>
            <div className="prose prose-slate max-h-[60vh] overflow-y-auto p-6 rounded-3xl border border-slate-100 bg-slate-50 whitespace-pre-wrap text-sm">
              {studyGuide}
            </div>
            <button onClick={() => setStudyGuide(null)} className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold">
              Done
            </button>
          </div>
        </div>
      )}

      <LiveAssistant isOpen={isLiveOpen} onClose={() => setIsLiveOpen(false)} />
    </div>
  );
};

export default HomeView;
