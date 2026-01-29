"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar as CalendarIcon, Clock, MapPin, MoreHorizontal, Video, AlertCircle } from 'lucide-react';

// Type matching the Prisma Include return
interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  topic: string | null;
  date: string; // ISO String
  duration: number;
  location: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  student: { name: string; image: string | null };
  tutor: { name: string; image: string | null };
}

const StudentScheduleView: React.FC = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings);
        }
      } catch (error) {
        console.error("Failed to load schedule", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [session]);

  // Logic: Separate Upcoming vs Past based on Date
  const now = new Date();
  
  const filteredSessions = bookings.filter((b) => {
    const bookingDate = new Date(b.date);
    if (activeTab === 'UPCOMING') {
      return bookingDate >= now;
    } else {
      return bookingDate < now;
    }
  });

  // Sort: Upcoming = Ascending (soonest first), Past = Descending (most recent first)
  const sortedSessions = filteredSessions.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return activeTab === 'UPCOMING' ? dateA - dateB : dateB - dateA;
  });

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      dateStr: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      timeStr: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  };

  return (
    <div className="p-5 animate-in fade-in duration-500 pb-24">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Schedule</h1>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'UPCOMING' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('PAST')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'PAST' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          Past
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Sessions List */}
      {!isLoading && (
        <div className="space-y-6">
          {sortedSessions.length > 0 ? (
            sortedSessions.map((s) => {
              const { dateStr, timeStr } = formatDateTime(s.date);
              
              // Determine "Other Party" (If I am student, show Tutor. If I am tutor, show Student)
              const isMeStudent = session?.user?.id === s.studentId;
              const otherParty = isMeStudent ? s.tutor : s.student;
              const roleLabel = isMeStudent ? 'Tutor' : 'Student';

              return (
                <div key={s.id} className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[2px] before:bg-slate-100 last:before:bottom-auto last:before:h-8">
                  {/* Status Indicator Dot */}
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-4 flex items-center justify-center z-10 ${
                    s.status === 'CONFIRMED' ? 'border-emerald-500' : 
                    s.status === 'PENDING' ? 'border-amber-400' : 'border-slate-300'
                  }`}></div>
                  
                  <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{s.subject}</h3>
                        {s.topic && <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">{s.topic}</p>}
                        <div className="flex items-center space-x-2 mt-1">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100">
                                <img src={otherParty.image || `https://ui-avatars.com/api/?name=${otherParty.name}`} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-sm text-slate-500">with {otherParty.name}</p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        s.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                        s.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 mb-6">
                      <div className="flex items-center text-xs text-slate-600">
                        <Clock size={16} className="text-indigo-500 mr-2" />
                        {dateStr}, {timeStr}
                      </div>
                      <div className="flex items-center text-xs text-slate-600">
                        {s.location === 'Online' ? <Video size={16} className="text-indigo-500 mr-2" /> : <MapPin size={16} className="text-indigo-500 mr-2" />}
                        {s.location || 'Online'}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      {activeTab === 'UPCOMING' && (
                          <button className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm shadow-md active:scale-95 transition-transform">
                            {s.location === 'Online' ? 'Join Call' : 'View Details'}
                          </button>
                      )}
                      <button className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-200">
                        {activeTab === 'UPCOMING' ? 'Reschedule' : 'View Notes'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-500">No {activeTab.toLowerCase()} sessions found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentScheduleView;