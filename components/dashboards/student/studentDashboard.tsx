"use client"

import React, { useState, useEffect } from 'react';
import { Bell, BookOpen, Star, BrainCircuit, X, Sparkles, Mic, Calendar } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { LiveAssistant } from '@/components/LiveAssistant';

// ==========================================
// 1. TYPES (Matching your Schema & API)
// ==========================================
interface DashboardData {
  institution: string | null;
  major: string | null;
  rating: number;
  bookingsAsStudent: Array<{
    id: string;
    subject: string;      // Schema: String
    topic: string | null; // Schema: String?
    date: string;         // Schema: DateTime (serialized as ISO string)
    duration: number;     // Schema: Int
    tutor: {
      name: string;
      image: string | null;
    };
  }>;
}

const StudentHomeView: React.FC = () => {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interaction State
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyGuide, setStudyGuide] = useState<string | null>(null);
  const [isLiveOpen, setIsLiveOpen] = useState(false);

  // ==========================================
  // 2. DATA FETCHING
  // ==========================================
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!session?.user?.id) return;
      
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        } else {
          console.error("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Network error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [session]);

  // ==========================================
  // 3. HELPERS
  // ==========================================
  const formatSessionTime = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    return {
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      dateLabel: isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };

  const handleGenerateGuide = async () => {
    // Safety check: ensure we have a session to generate for
    const nextSession = dashboardData?.bookingsAsStudent[0];
    if (!nextSession) return;

    setIsGenerating(true);
    
    // TODO: Replace this timeout with your actual Gemini API call
    // await geminiService.generateStudyGuide(nextSession.subject, nextSession.topic);
    
    setTimeout(() => {
        setStudyGuide(`**Auto-Generated Prep for ${nextSession.subject}**\n\nFocus Topic: ${nextSession.topic || 'General Review'}\n\n1. Key Concepts...\n2. Practice Problems...`);
        setIsGenerating(false);
    }, 1500);
  };

  // Safe user name extraction (fallback if Google/NextAuth name is missing)
  const firstName = session?.user?.name?.split(' ')[0] || 'Scholar';

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 relative pb-32">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight"> {firstName}!</h1>
          <p className="text-slate-500 mt-1">Master your subjects with verified peer experts.</p>
        </div>
        <button className="p-3 bg-white border border-slate-200 shadow-sm rounded-2xl relative hover:bg-slate-50 transition-colors">
          <Bell size={22} className="text-slate-600" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      {/* STATS & HERO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        
        {/* Left Col: Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-600 p-6 rounded-[32px] text-white shadow-indigo-200 shadow-xl">
            <BookOpen className="mb-4" size={24} />
            <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Upcoming</p>
            <p className="text-3xl font-black mt-1">
               {isLoading ? '-' : dashboardData?.bookingsAsStudent.length || 0}
            </p>
          </div>
          <div className="bg-emerald-500 p-6 rounded-[32px] text-white shadow-emerald-200 shadow-xl">
            <Star className="mb-4" size={24} />
            <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Rating</p>
            <p className="text-3xl font-black mt-1">
                {isLoading ? '-' : dashboardData?.rating.toFixed(1) || 'N/A'}
            </p>
          </div>
        </div>

        {/* Right Col: AI Prep Card */}
        <div className="bg-white border-2 border-indigo-100 p-6 rounded-[32px] relative overflow-hidden group shadow-sm flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <BrainCircuit size={80} className="text-indigo-600" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="bg-indigo-100 text-indigo-700 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 flex items-center">
              <Sparkles size={12} className="mr-1" /> AI Powered
            </div>
            
            {dashboardData?.bookingsAsStudent[0] ? (
                <>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Study Prep</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-[80%]">
                        Get an AI-generated study guide for your session on <span className="font-bold">"{dashboardData.bookingsAsStudent[0].subject}"</span>.
                    </p>
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
                </>
            ) : (
                <>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Upcoming Sessions</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-[80%]">Book a session to unlock AI study tools.</p>
                    <button className="mt-auto w-full bg-indigo-50 text-indigo-600 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-100 transition-all">
                        Find a Tutor
                    </button>
                </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* UPCOMING SESSIONS LIST */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Sessions</h2>
            <button className="text-indigo-600 text-sm font-bold hover:underline">View Calendar</button>
          </div>
          
          <div className="space-y-4">
            {isLoading && (
               <div className="p-10 text-center">
                 <span className="animate-spin inline-block h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
               </div>
            )}
            
            {!isLoading && dashboardData?.bookingsAsStudent.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-[32px] border border-slate-100">
                    <Calendar className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-slate-500 font-medium">No upcoming sessions found.</p>
                </div>
            )}

            {dashboardData?.bookingsAsStudent.map((session) => {
              const { time, dateLabel } = formatSessionTime(session.date);
              return (
                <div key={session.id} className="group bg-white border border-slate-200 p-6 rounded-[32px] hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-inner group-hover:scale-105 transition-transform">
                        <img 
                            src={session.tutor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.tutor.name)}&background=random`} 
                            alt="Tutor" 
                            className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg leading-none mb-1">
                            {session.subject}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                            <span>with {session.tutor.name}</span>
                        </p>
                        {session.topic && (
                            <span className="inline-block mt-1 text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                {session.topic}
                            </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900">{time}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{dateLabel}</p>
                      </div>
                      <button className="bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all whitespace-nowrap">
                        Join Call
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TOP RATED (Keep Static for now as per MVP requirements) */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Top Rated</h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex items-center space-x-4 hover:bg-white hover:shadow-md transition-all cursor-pointer">
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
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-200 flex items-center justify-center active:scale-90 transition-transform z-[150] hover:bg-indigo-700"
      >
        <Mic size={28} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
        </span>
      </button>

      {/* Study Guide Modal */}
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

export default StudentHomeView;