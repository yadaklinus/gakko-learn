"use client"
import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, BadgeCheck, Sparkles, UserPlus, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Tutor {
  id: string;
  name: string;
  image: string | null;
  major: string | null;
  subjects: string | null; // API sends string "Math,Physics"
  rating: number;
  totalReviews: number;
  hourlyRate: number | null;
  // This status determines the button state
  connectionStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null; 
}

const StudentExploreView: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for loading specific button actions to prevent double-clicks
  const [requestingId, setRequestingId] = useState<string | null>(null);

  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{ id: string, reason: string } | null>(null);

  // 1. Fetch Tutors (Debounced)
  useEffect(() => {
    const fetchTutors = async () => {
      setIsLoading(true);
      try {
        const url = `/api/tutors?search=${encodeURIComponent(searchQuery)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setTutors(data.tutors);
        }
      } catch (error) {
        console.error("Failed to search tutors", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchTutors();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Send Connection Request
  const sendRequest = async (tutorId: string) => {
    setRequestingId(tutorId);
    try {
        const res = await fetch('/api/connections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tutorId })
        });

        if (res.ok) {
            // Optimistic Update: Update UI immediately
            setTutors(prev => prev.map(t => 
                t.id === tutorId ? { ...t, connectionStatus: 'PENDING' } : t
            ));
        } else {
            console.error("Request failed");
        }
    } catch (error) {
        console.error("Failed to send request", error);
    } finally {
        setRequestingId(null);
    }
  };

  const handleAiRecommendation = async () => {
    if (!searchQuery) return;
    setIsAiLoading(true);
    // Simulate AI delay
    setTimeout(() => {
        setIsAiLoading(false);
        if (tutors.length > 0) {
            setAiRecommendation({
                id: tutors[0].id,
                reason: `Based on your search for "${searchQuery}", ${tutors[0].name} is the best match due to their high rating in ${tutors[0].major}.`
            });
        }
    }, 1500);
  };

  return (
    <div className="p-6 md:p-10 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Discover Peer Tutors</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-14 py-4 border-2 border-slate-100 rounded-3xl bg-slate-50 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 text-lg transition-all placeholder:text-slate-400 font-medium"
            placeholder="Search by subject, name or major..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        {/* AI Recommendation Button */}
        {searchQuery.length > 2 && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-2 duration-300">
            <button 
              onClick={handleAiRecommendation}
              disabled={isAiLoading || tutors.length === 0}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-3xl font-black text-sm flex items-center justify-center space-x-3 shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {isAiLoading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Ask AI for a Perfect Match</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* AI Result Box */}
        {aiRecommendation && (
          <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[32px] mb-8 relative animate-in zoom-in duration-300">
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                <Star size={14} fill="white" />
              </div>
              <p className="text-emerald-800 text-xs font-black uppercase tracking-widest">AI Top Pick</p>
            </div>
            <p className="text-emerald-900 font-medium leading-relaxed italic text-sm">"{aiRecommendation.reason}"</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
            <div className="flex justify-center py-20">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        )}

        {/* Empty State */}
        {!isLoading && tutors.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-slate-100">
                <p className="text-slate-400 font-medium">No tutors found for "{searchQuery}".</p>
            </div>
        )}

        {/* Tutor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutors.map((tutor) => {
            const subjectList = tutor.subjects ? tutor.subjects.split(',') : [];

            return (
                <div 
                  key={tutor.id} 
                  className={`group bg-white border-2 p-5 rounded-[32px] transition-all relative cursor-pointer ${
                    aiRecommendation?.id === tutor.id 
                      ? 'border-emerald-500 ring-4 ring-emerald-50' 
                      : 'border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-slate-200/50'
                  }`}
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                      <img 
                        src={tutor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=random`} 
                        alt={tutor.name} 
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1 mb-0.5">
                        <h4 className="font-black text-slate-900 truncate max-w-[150px]">{tutor.name}</h4>
                        <BadgeCheck size={16} className="text-indigo-500 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter truncate">{tutor.major || 'General'}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <div className="flex items-center text-amber-500 font-black text-xs">
                          <Star size={12} fill="currentColor" className="mr-0.5" />
                          {tutor.rating.toFixed(1)}
                        </div>
                        <span className="text-slate-200 text-xs">|</span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase">{tutor.totalReviews} Reviews</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subject Tags */}
                  <div className="flex flex-wrap gap-1 mb-6 h-12 overflow-hidden">
                    {subjectList.slice(0, 3).map((s, i) => (
                      <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 rounded-full font-bold">
                        {s.trim()}
                      </span>
                    ))}
                    {subjectList.length > 3 && (
                        <span className="bg-slate-50 text-slate-400 text-[10px] px-2 py-1 rounded-full font-bold">+{subjectList.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rate</span>
                      <p className="text-lg font-black text-indigo-600">
                        {tutor.hourlyRate ? `₦${tutor.hourlyRate.toLocaleString()}` : 'Free'}
                      </p>
                    </div>
                    
                    {/* BUTTON LOGIC */}
                    {tutor.connectionStatus === 'ACCEPTED' ? (
                        <button 
                            disabled
                            className="bg-emerald-100 text-emerald-700 px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center hover:bg-emerald-200 transition-colors"
                        >
                            <MessageCircle size={16} className="mr-2"/>
                            Connected
                        </button>
                    ) : tutor.connectionStatus === 'PENDING' ? (
                        <button 
                            disabled
                            className="bg-slate-100 text-slate-400 px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center cursor-not-allowed"
                        >
                            <Clock size={16} className="mr-2"/>
                            Pending
                        </button>
                    ) : (
                        <button 
                            onClick={(e) => { e.stopPropagation(); sendRequest(tutor.id); }}
                            disabled={requestingId === tutor.id}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center shadow-lg shadow-slate-200 active:scale-95 transform"
                        >
                            {requestingId === tutor.id ? (
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                            ) : (
                                <UserPlus size={16} className="mr-2"/>
                            )}
                            Add Tutor
                        </button>
                    )}
                  </div>
                </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentExploreView;