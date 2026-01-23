
import React, { useState } from 'react';
import { Search, Filter, Star, CheckCircle, ChevronRight, BookOpen, BadgeCheck, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';

const MOCK_TUTORS = [
  { id: 't1', name: 'Dr. Ngozi Eze', major: 'Physics', rating: 4.9, reviews: 128, price: '₦5,000/hr', subjects: ['Physics', 'Calculus'], avatar: 'ngozi', isVerified: true },
  { id: 't2', name: 'Tunde Bakare', major: 'CompSci', rating: 4.8, reviews: 45, price: '₦4,000/hr', subjects: ['Data Structures', 'Python'], avatar: 'tunde', isVerified: true },
  { id: 't3', name: 'Ifeoma Okoro', major: 'Biology', rating: 5.0, reviews: 32, price: '₦4,500/hr', subjects: ['Organic Chemistry', 'Biology'], avatar: 'ifeoma', isVerified: false },
  { id: 't4', name: 'Abubakar Musa', major: 'History', rating: 4.7, reviews: 89, price: '₦3,500/hr', subjects: ['Nigerian History', 'Essays'], avatar: 'abubakar', isVerified: true },
  { id: 't5', name: 'Amina Bello', major: 'Mathematics', rating: 4.9, reviews: 210, price: '₦6,000/hr', subjects: ['Linear Algebra', 'Stats'], avatar: 'amina', isVerified: true },
];

const ExploreView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{ id: string, reason: string } | null>(null);

  const handleAiRecommendation = async () => {
    if (!searchQuery) return;
    setIsAiLoading(true);
    const recommendation = await geminiService.recommendTutors(searchQuery, MOCK_TUTORS);
    if (recommendation) {
      setAiRecommendation({
        id: recommendation.recommendedTutorId,
        reason: recommendation.reason
      });
    }
    setIsAiLoading(false);
  };

  const filteredTutors = MOCK_TUTORS.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-3xl mx-auto">
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

        {/* AI Recommendation Prompt */}
        {searchQuery.length > 2 && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-2 duration-300">
            <button 
              onClick={handleAiRecommendation}
              disabled={isAiLoading}
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

        {/* Recommendation Result */}
        {aiRecommendation && (
          <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[32px] mb-8 relative">
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                <Star size={14} fill="white" />
              </div>
              <p className="text-emerald-800 text-xs font-black uppercase tracking-widest">AI Top Pick</p>
            </div>
            <p className="text-emerald-900 font-medium leading-relaxed italic text-sm">"{aiRecommendation.reason}"</p>
          </div>
        )}

        {/* Tutor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTutors.map((tutor) => (
            <div 
              key={tutor.id} 
              className={`group bg-white border-2 p-5 rounded-[32px] transition-all relative cursor-pointer ${
                aiRecommendation?.id === tutor.id 
                  ? 'border-emerald-500 ring-8 ring-emerald-50' 
                  : 'border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-slate-200/50'
              }`}
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                  <img src={`https://picsum.photos/seed/${tutor.avatar}/200`} alt={tutor.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-1 mb-0.5">
                    <h4 className="font-black text-slate-900 truncate">{tutor.name}</h4>
                    {tutor.isVerified && (
                      <BadgeCheck size={16} className="text-indigo-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{tutor.major}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <div className="flex items-center text-amber-500 font-black text-xs">
                      <Star size={12} fill="currentColor" className="mr-0.5" />
                      {tutor.rating}
                    </div>
                    <span className="text-slate-200 text-xs">|</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">{tutor.reviews} Reviews</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-6">
                {tutor.subjects.map(s => (
                  <span key={s} className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 rounded-full font-bold">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rate</span>
                  <p className="text-lg font-black text-indigo-600">{tutor.price}</p>
                </div>
                <button className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm group-hover:bg-indigo-600 transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreView;
