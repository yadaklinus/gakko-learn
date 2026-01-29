"use client"

import React, { useState, useEffect } from 'react';
import { Bell, Wallet, Star, BrainCircuit, X, Sparkles, Mic, Calendar, CheckCircle2, XCircle, Clock, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { LiveAssistant } from '@/components/LiveAssistant';

// ==========================================
// 1. TYPES (Tutor Specific)
// ==========================================
interface TutorDashboardData {
  hourlyRate: number;
  rating: number;
  totalEarnings: number; // Calculated field
  pendingRequests: Array<{
    id: string;
    subject: string;
    topic: string | null;
    date: string;
    duration: number;
    student: {
      name: string;
      image: string | null;
      institution: string | null;
    };
  }>;
  upcomingSessions: Array<{
    id: string;
    subject: string;
    topic: string | null;
    date: string;
    duration: number;
    student: {
      name: string;
      image: string | null;
    };
  }>;
}

const TutorHomeView: React.FC = () => {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<TutorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interaction State
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<string | null>(null);
  const [isLiveOpen, setIsLiveOpen] = useState(false);

  // ==========================================
  // 2. DATA FETCHING
  // ==========================================
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!session?.user?.email) return;
      
      try {
        // In a real app, you might have specific endpoints like /api/tutor/dashboard
        // For now, we assume /api/users/me returns the user with tutor relations included
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const userData = await res.json();
          
          // Helper to filter bookings (Assuming API returns all bookings flat)
          // In production, do this filtering on the backend via Prisma queries
          const allBookings = userData.bookingsAsTutor || [];
          
          setDashboardData({
            hourlyRate: userData.hourlyRate || 0,
            rating: userData.rating || 5.0,
            totalEarnings: 45000, // Mock calculation or fetch real sum from completed bookings
            pendingRequests: allBookings.filter((b: any) => b.status === 'PENDING'),
            upcomingSessions: allBookings.filter((b: any) => b.status === 'CONFIRMED'),
          });
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
  // 3. ACTIONS
  // ==========================================
  const handleGenerateLessonPlan = async () => {
    const nextSession = dashboardData?.upcomingSessions[0];
    if (!nextSession) return;

    setIsGenerating(true);
    
    // Simulate AI Generation
    setTimeout(() => {
        setLessonPlan(`**Lesson Plan: ${nextSession.subject}**\n\nStudent: ${nextSession.student.name}\nTopic: ${nextSession.topic || 'General Review'}\n\n1. Ice Breaker (5 mins)\n2. Core Concept Review (20 mins)\n3. Guided Practice Problems (30 mins)\n4. Homework Assignment`);
        setIsGenerating(false);
    }, 1500);
  };

  const handleBookingAction = async (bookingId: string, action: 'CONFIRM' | 'CANCEL') => {
    // Optimistic UI update
    if (!dashboardData) return;
    
    const updatedRequests = dashboardData.pendingRequests.filter(b => b.id !== bookingId);
    setDashboardData({ ...dashboardData, pendingRequests: updatedRequests });

    try {
        // Call API to update status
        // await fetch(`/api/bookings/${bookingId}`, { method: 'PATCH', body: JSON.stringify({ status: action })})
        console.log(`Booking ${bookingId} ${action}ED`);
    } catch (e) {
        // Revert on error
        console.error("Failed to update booking");
    }
  };

  const formatSessionTime = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    return {
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      dateLabel: isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };

  const firstName = session?.user?.name?.split(' ')[0] || 'Tutor';

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 relative pb-32">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <div className="flex items-center space-x-2 mb-1">
             <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Tutor Mode</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {firstName}!</h1>
          <p className="text-slate-500 mt-1">Manage your students and lesson plans.</p>
        </div>
        <button className="p-3 bg-white border border-slate-200 shadow-sm rounded-2xl relative hover:bg-slate-50 transition-colors">
          <Bell size={22} className="text-slate-600" />
          {dashboardData?.pendingRequests.length ? (
             <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
          ) : null}
        </button>
      </header>

      {/* STATS & HERO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        
        {/* Left Col: Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-slate-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet size={60} />
            </div>
            <Wallet className="mb-4 text-emerald-400" size={24} />
            <p className="text-xs font-medium opacity-60 uppercase tracking-widest">Total Earnings</p>
            <p className="text-3xl font-black mt-1">
               {isLoading ? '-' : `₦${dashboardData?.totalEarnings.toLocaleString()}`}
            </p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-[32px] text-slate-900 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <Star className="text-amber-500" size={24} fill="currentColor" />
                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg">Top 5%</span>
            </div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Tutor Rating</p>
            <p className="text-3xl font-black mt-1">
                {isLoading ? '-' : dashboardData?.rating.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Right Col: AI Planner Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-[32px] relative overflow-hidden group shadow-indigo-200 shadow-xl flex flex-col text-white">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
            <BrainCircuit size={80} />
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 flex items-center backdrop-blur-sm">
              <Sparkles size={12} className="mr-1" /> AI Assistant
            </div>
            
            {dashboardData?.upcomingSessions[0] ? (
                <>
                    <h3 className="text-xl font-bold mb-2">Lesson Planner</h3>
                    <p className="text-indigo-100 text-sm mb-6 max-w-[85%]">
                        Generate a structured lesson plan for <span className="font-bold">{dashboardData.upcomingSessions[0].student.name}</span> on "{dashboardData.upcomingSessions[0].subject}".
                    </p>
                    <button 
                      onClick={handleGenerateLessonPlan}
                      disabled={isGenerating}
                      className="mt-auto w-full bg-white text-indigo-700 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg"
                    >
                      {isGenerating ? (
                        <span className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
                      ) : (
                        <>
                          <BrainCircuit size={18} />
                          <span>Generate Plan</span>
                        </>
                      )}
                    </button>
                </>
            ) : (
                <>
                    <h3 className="text-xl font-bold mb-2">Schedule Empty</h3>
                    <p className="text-indigo-100 text-sm mb-6 max-w-[80%]">Accept pending requests to start using AI tools.</p>
                </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* MAIN FEED */}
        <section className="lg:col-span-2 space-y-8">
            
            {/* 1. PENDING REQUESTS (Priority for Tutors) */}
            {dashboardData?.pendingRequests && dashboardData.pendingRequests.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <Clock className="mr-2 text-amber-500" size={20} />
                        Pending Requests
                        <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{dashboardData.pendingRequests.length}</span>
                    </h2>
                    <div className="space-y-3">
                        {dashboardData.pendingRequests.map((req) => (
                            <div key={req.id} className="bg-white border-l-4 border-amber-400 p-5 rounded-r-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in slide-in-from-left-4 duration-300">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden">
                                        <img src={req.student.image || `https://ui-avatars.com/api/?name=${req.student.name}&background=random`} alt="" className="w-full h-full object-cover"/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{req.student.name}</h4>
                                        <p className="text-xs text-slate-500 font-medium">Requested: <span className="text-indigo-600 font-bold">{req.subject}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 w-full sm:w-auto">
                                    <button 
                                        onClick={() => handleBookingAction(req.id, 'CANCEL')}
                                        className="flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                        Decline
                                    </button>
                                    <button 
                                        onClick={() => handleBookingAction(req.id, 'CONFIRM')}
                                        className="flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center"
                                    >
                                        <CheckCircle2 size={14} className="mr-1" />
                                        Accept
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. UPCOMING SESSIONS */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Upcoming Sessions</h2>
                    <button className="text-indigo-600 text-sm font-bold hover:underline">Full Schedule</button>
                </div>
                
                <div className="space-y-4">
                    {isLoading && (
                        <div className="p-10 text-center"><span className="animate-spin inline-block h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full"></span></div>
                    )}
                    
                    {!isLoading && dashboardData?.upcomingSessions.length === 0 && (
                        <div className="p-8 text-center bg-slate-50 rounded-[32px] border border-slate-100">
                            <Calendar className="mx-auto text-slate-300 mb-3" size={40} />
                            <p className="text-slate-500 font-medium">No confirmed sessions yet.</p>
                        </div>
                    )}

                    {dashboardData?.upcomingSessions.map((session) => {
                        const { time, dateLabel } = formatSessionTime(session.date);
                        return (
                            <div key={session.id} className="group bg-white border border-slate-200 p-5 rounded-[24px] hover:border-indigo-300 hover:shadow-lg transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xs border border-indigo-100">
                                            {session.duration}m
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{session.subject}</h4>
                                            <p className="text-xs text-slate-500 font-medium">Student: {session.student.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-900">{time}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{dateLabel}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                                    <button className="text-indigo-600 text-xs font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>

        {/* SIDEBAR: Quick Actions & Performance */}
        <section className="space-y-8">
            <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all text-left group">
                        <Clock className="text-slate-400 mb-2 group-hover:text-indigo-600" size={24} />
                        <p className="text-xs font-bold text-slate-700">Update Availability</p>
                    </button>
                    <button className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all text-left group">
                        <Users className="text-slate-400 mb-2 group-hover:text-emerald-600" size={24} />
                        <p className="text-xs font-bold text-slate-700">My Students</p>
                    </button>
                </div>
            </div>
        </section>
      </div>

      {/* Floating AI Assistant Button */}
      <button 
        onClick={() => setIsLiveOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-400 flex items-center justify-center active:scale-90 transition-transform z-[150] hover:bg-slate-800"
      >
        <Mic size={28} />
      </button>

      {/* Lesson Plan Modal */}
      {lessonPlan && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setLessonPlan(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
              <X size={20} />
            </button>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Lesson Plan</h3>
            </div>
            <div className="prose prose-slate max-h-[60vh] overflow-y-auto p-6 rounded-3xl border border-slate-100 bg-slate-50 whitespace-pre-wrap text-sm font-medium">
              {lessonPlan}
            </div>
            <div className="flex gap-3 mt-6">
                <button className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50">Save Draft</button>
                <button onClick={() => setLessonPlan(null)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700">Use Plan</button>
            </div>
          </div>
        </div>
      )}

      <LiveAssistant isOpen={isLiveOpen} onClose={() => setIsLiveOpen(false)} />
    </div>
  );
};

export default TutorHomeView;