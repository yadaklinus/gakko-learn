"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar as CalendarIcon, Clock, MapPin, Video, Plus, X, Users, BookOpen, Check } from 'lucide-react';

interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  topic: string | null;
  date: string;
  duration: number;
  location: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  student: { name: string; image: string | null };
}

interface ConnectedStudent {
  id: string;
  student: {
    id: string;
    name: string;
    image: string | null;
  };
  status: string;
}

const TutorScheduleView: React.FC = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myStudents, setMyStudents] = useState<ConnectedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    date: '',
    time: '',
    duration: 60
  });

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, connectionsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/connections?status=ACCEPTED') // Corrected Endpoint: Get Active Connections
      ]);

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data.bookings || []); // Safety check
      }

      if (connectionsRes.ok) {
          const data = await connectionsRes.json();
          // The API returns { connections: [...] }
          // We map it to our local interface
          const validConnections = data.connections || [];
          
          setMyStudents(validConnections.map((c: any) => ({
              id: c.student.id, 
              student: c.student,
              status: c.status
          })));
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) refreshData();
  }, [session]);

  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allStudentIds = myStudents.map(s => s.id);

    if (allStudentIds.length === 0) {
        alert("You have no connected students to schedule a class for.");
        return;
    }
    
    setIsSubmitting(true);

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: allStudentIds, 
          subject: formData.subject,
          topic: formData.topic || undefined,
          date: dateTime.toISOString(),
          duration: Number(formData.duration),
          location: 'Online'
        }),
      });

      if (!res.ok) throw new Error('Failed to schedule');

      setIsModalOpen(false);
      setFormData({ subject: '', topic: '', date: '', time: '', duration: 60 });
      refreshData(); 
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe filtering logic
  const now = new Date();
  const safeBookings = bookings || [];
  
  const filteredSessions = safeBookings.filter((b) => {
    const bookingDate = new Date(b.date);
    return activeTab === 'UPCOMING' ? bookingDate >= now : bookingDate < now;
  });

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
    <div className="p-5 animate-in fade-in duration-500 pb-24 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Class Schedule</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
        >
          <Plus size={18} className="mr-2" />
          Schedule Class
        </button>
      </div>

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

      {!isLoading && (
        <div className="space-y-6">
          {sortedSessions.length > 0 ? (
            sortedSessions.map((s) => {
              const { dateStr, timeStr } = formatDateTime(s.date);
              return (
                <div key={s.id} className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[2px] before:bg-slate-100 last:before:bottom-auto last:before:h-8">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-4 flex items-center justify-center z-10 ${
                    s.status === 'CONFIRMED' ? 'border-emerald-500' : 'border-amber-400'
                  }`}></div>
                  
                  <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{s.subject}</h3>
                        {s.topic && <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">{s.topic}</p>}
                        <div className="flex items-center space-x-2 mt-1">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100">
                                <img src={s.student.image || `https://ui-avatars.com/api/?name=${s.student.name}`} alt="Student" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-sm text-slate-500">Student: {s.student.name}</p>
                        </div>
                      </div>
                      
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                        {s.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 mb-6">
                      <div className="flex items-center text-xs text-slate-600">
                        <Clock size={16} className="text-indigo-500 mr-2" />
                        {dateStr}, {timeStr} ({s.duration}m)
                      </div>
                      <div className="flex items-center text-xs text-slate-600">
                        {s.location === 'Online' ? <Video size={16} className="text-indigo-500 mr-2" /> : <MapPin size={16} className="text-indigo-500 mr-2" />}
                        {s.location || 'Online'}
                      </div>
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
              <p className="text-slate-500">No {activeTab.toLowerCase()} classes found.</p>
            </div>
          )}
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center">
              <Plus className="mr-2 text-indigo-600" />
              Schedule Class
            </h2>

            <form onSubmit={handleScheduleClass} className="space-y-4">
              
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center">
                <Users className="text-indigo-600 mr-3" size={24} />
                <p className="text-sm text-indigo-900 font-medium">
                  This class will be automatically scheduled for all <span className="font-bold">{myStudents?.length || 0}</span> connected students.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Subject</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Calculus II"
                  className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Topic (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Exam Prep"
                  className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Time</label>
                    <input 
                      type="time" 
                      required
                      className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                    />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Duration (Minutes)</label>
                <select 
                  className="w-full px-4 py-3 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                >
                    <option value={30}>30 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={90}>1.5 Hours</option>
                    <option value={120}>2 Hours</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
              >
                {isSubmitting ? 'Scheduling...' : 'Confirm Class'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorScheduleView;