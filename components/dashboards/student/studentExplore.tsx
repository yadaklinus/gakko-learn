import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, BadgeCheck, Sparkles, UserPlus, Clock, MessageCircle, X, Building, BookOpen, Globe, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";

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
  hasRated?: boolean;
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

  // Profile Modal State
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [fullTutor, setFullTutor] = useState<any | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  // Rating Modal State
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingTutor, setRatingTutor] = useState<Tutor | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

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
        toast.success("Connection request sent!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send request");
      }
    } catch (error) {
      console.error("Failed to send request", error);
      toast.error("Network error");
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

  const openProfile = async (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setIsProfileOpen(true);
    setIsFetchingProfile(true);
    try {
      const res = await fetch(`/api/tutors/${tutor.id}`);
      if (res.ok) {
        const data = await res.json();
        setFullTutor(data.tutor);
      }
    } catch (error) {
      console.error("Failed to fetch tutor profile", error);
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleRate = async () => {
    if (!ratingTutor || userRating === 0) return;
    setIsSubmittingRating(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: ratingTutor.id,
          rating: userRating,
          comment: userComment
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Rating submitted successfully!");
        // Update tutor rating in list
        setTutors(prev => prev.map(t =>
          t.id === ratingTutor.id
            ? { ...t, rating: data.rating, totalReviews: data.totalReviews, hasRated: true }
            : t
        ));
        setIsRatingOpen(false);
        setUserRating(0);
        setUserComment('');
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Failed to rate", error);
      toast.error("Network error");
    } finally {
      setIsSubmittingRating(false);
    }
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
            className="block w-full pl-12 pr-14 py-4 border-2 border-slate-100 rounded-3xl bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 text-lg transition-all placeholder:text-slate-400 font-medium shadow-sm"
            placeholder="Search by subject, name or major..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-14 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
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
          <div className="bg-gradient-to-br from-emerald-50 text-emerald-900 border border-emerald-100 p-6 rounded-[32px] mb-10 relative animate-in zoom-in duration-300 shadow-xl shadow-emerald-100/50">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={60} />
            </div>
            <div className="flex items-center space-x-2 mb-3 relative z-10">
              <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 p-1.5 rounded-lg text-white shadow-md">
                <Star size={14} fill="white" />
              </div>
              <p className="text-emerald-800 text-xs font-black uppercase tracking-widest">AI Perfect Match</p>
            </div>
            <p className="font-medium leading-relaxed italic text-sm relative z-10">"{aiRecommendation.reason}"</p>
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
          <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm animate-in fade-in">
            <Search className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No tutors found</h3>
            <p className="text-slate-500 font-medium text-sm">Try adjusting your search criteria or checking back later.</p>
          </div>
        )}

        {/* Tutor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutors.map((tutor) => {
            const subjectList = tutor.subjects ? tutor.subjects.split(',') : [];

            return (
              <div
                key={tutor.id}
                onClick={() => openProfile(tutor)}
                className={`group cursor-pointer bg-white border p-6 rounded-[32px] transition-all duration-300 relative flex flex-col h-full ${aiRecommendation?.id === tutor.id
                  ? 'border-emerald-400 ring-4 ring-emerald-50 shadow-xl shadow-emerald-100/50'
                  : 'border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1'
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
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (tutor.hasRated) return;
                          setRatingTutor(tutor);
                          setIsRatingOpen(true);
                        }}
                        disabled={tutor.hasRated}
                        className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition-all border ${tutor.hasRated
                          ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100'
                          }`}
                      >
                        {tutor.hasRated ? 'Rated' : 'Rate'}
                      </button>
                      <button
                        disabled
                        className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center border border-emerald-100/50"
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Connected
                      </button>
                    </div>
                  ) : tutor.connectionStatus === 'PENDING' ? (
                    <button
                      disabled
                      className="bg-amber-50 text-amber-600 px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center cursor-not-allowed border border-amber-100/50"
                    >
                      <Clock size={16} className="mr-2" />
                      Pending
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); sendRequest(tutor.id); }}
                      disabled={requestingId === tutor.id}
                      className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-slate-800 hover:shadow-lg transition-all flex items-center active:scale-95 disabled:opacity-70 disabled:scale-100"
                    >
                      {requestingId === tutor.id ? (
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      ) : (
                        <UserPlus size={16} className="mr-2" />
                      )}
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TUTOR PROFILE MODAL */}
      {isProfileOpen && selectedTutor && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">

            {/* Header / Banner Area */}
            <div className="relative h-48 bg-gradient-to-br from-indigo-600 to-purple-700 flex-shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

              <button
                onClick={() => { setIsProfileOpen(false); setFullTutor(null); }}
                className="absolute top-6 right-6 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md border border-white/10"
              >
                <X size={24} />
              </button>

              <div className="absolute -bottom-16 left-10 p-1 bg-white rounded-[32px] shadow-xl">
                <Avatar
                  src={selectedTutor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTutor.name)}&background=random`}
                  className="w-32 h-32 rounded-[28px] text-large"
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pt-20 px-10 pb-10 custom-scrollbar">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedTutor.name}</h2>
                    <BadgeCheck size={24} className="text-indigo-500" />
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center text-slate-500 font-bold text-sm">
                      <Building size={16} className="mr-1.5 opacity-60" />
                      {fullTutor?.institution || 'Academic Community'}
                    </div>
                    <div className="flex items-center text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-full">
                      <BookOpen size={16} className="mr-1.5" />
                      {selectedTutor.major || 'Peer Expert'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Rating</p>
                    <div className="flex items-center text-amber-500 font-black text-xl leading-none">
                      <Star size={18} fill="currentColor" className="mr-1" />
                      {selectedTutor.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Reviews</p>
                    <p className="text-xl font-black text-slate-900 leading-none">{selectedTutor.totalReviews}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Rate</p>
                    <p className="text-xl font-black text-indigo-600 leading-none">₦{selectedTutor.hourlyRate?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>

              {/* Bio & Subjects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                      <Globe size={14} className="mr-2" />
                      About this Tutor
                    </h4>
                    {isFetchingProfile ? (
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-100 rounded-full w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-slate-100 rounded-full w-4/6 animate-pulse"></div>
                      </div>
                    ) : (
                      <p className="text-slate-600 font-medium leading-relaxed text-lg">
                        {fullTutor?.bio || `${selectedTutor.name} is a dedicated high-achiever in ${selectedTutor.major}. They have helped numerous students master complex concepts and improve their grades through personalized sessions.`}
                      </p>
                    )}
                  </div>

                  <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[32px] border border-indigo-100/50">
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center">
                      <Award size={14} className="mr-2" />
                      Teaching Style
                    </h4>
                    <p className="text-indigo-900/70 text-sm font-medium leading-relaxed">
                      Expert in breaking down complex theoretical concepts into practical, easy-to-understand examples. Focused on outcome-based learning and exam preparation strategies.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                      <Search size={14} className="mr-2" />
                      Subjects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTutor.subjects?.split(',').map((s, i) => (
                        <Chip key={i} variant="flat" className="bg-white border border-slate-200 text-slate-900 font-bold px-4 py-4 rounded-2xl h-auto">
                          {s.trim()}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    {/* Dynamic Action Area */}
                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Availability</p>
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <p className="text-sm font-bold">Accepting New Students</p>
                      </div>

                      {selectedTutor.connectionStatus === 'ACCEPTED' ? (
                        <Button
                          className="w-full bg-emerald-500 text-white font-black py-6 rounded-2xl"
                          startContent={<MessageCircle size={20} />}
                          isDisabled
                        >
                          Connected
                        </Button>
                      ) : selectedTutor.connectionStatus === 'PENDING' ? (
                        <Button
                          className="w-full bg-amber-500 text-white font-black py-6 rounded-2xl"
                          startContent={<Clock size={20} />}
                          isDisabled
                        >
                          Request Pending
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-indigo-600 text-white font-black py-6 rounded-2xl shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-95"
                          startContent={<UserPlus size={20} />}
                          isLoading={requestingId === selectedTutor.id}
                          onPress={() => sendRequest(selectedTutor.id)}
                        >
                          Connect to Message
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* RATING MODAL */}
      {isRatingOpen && ratingTutor && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Rate {ratingTutor.name}</h3>
              <button onClick={() => setIsRatingOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"><X size={20} /></button>
            </div>

            <div className="flex flex-col items-center space-y-6">
              {/* Stars */}
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star
                      size={40}
                      fill={star <= userRating ? "#f59e0b" : "none"}
                      className={star <= userRating ? "text-amber-500" : "text-slate-300"}
                    />
                  </button>
                ))}
              </div>

              <textarea
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[28px] text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 min-h-[120px] font-medium"
                placeholder="Share your experience with this tutor (optional)..."
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
              />

              <button
                onClick={handleRate}
                disabled={userRating === 0 || isSubmittingRating}
                className="w-full bg-slate-900 text-white py-4 rounded-3xl font-black text-sm flex items-center justify-center space-x-2 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-200"
              >
                {isSubmittingRating ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentExploreView;