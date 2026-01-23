
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, MoreHorizontal, Video } from 'lucide-react';

const ScheduleView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');

  const upcomingSessions = [
    { id: '1', title: 'Calculus II Deep Dive', tutor: 'Ngozi Eze', time: 'Today, 2:00 PM', duration: '60 min', type: 'Online' },
    { id: '2', title: 'Python Basics', tutor: 'Tunde Bakare', time: 'Tomorrow, 10:30 AM', duration: '45 min', type: 'Jaja Hall Study Room' },
  ];

  const pastSessions = [
    { id: '3', title: 'Macroeconomics Intro', tutor: 'Chidi Okafor', time: 'Last Tuesday', duration: '60 min', type: 'Online' },
  ];

  const sessions = activeTab === 'UPCOMING' ? upcomingSessions : pastSessions;

  return (
    <div className="p-5 animate-in fade-in duration-500">
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

      {/* Sessions List */}
      <div className="space-y-6">
        {sessions.length > 0 ? (
          sessions.map((s) => (
            <div key={s.id} className="relative pl-8 before:content-[''] before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[2px] before:bg-slate-100 last:before:bottom-auto last:before:h-8">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-4 border-indigo-600 flex items-center justify-center z-10"></div>
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{s.title}</h3>
                    <p className="text-sm text-slate-500">with {s.tutor}</p>
                  </div>
                  <button className="text-slate-400">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 mb-6">
                  <div className="flex items-center text-xs text-slate-600">
                    <Clock size={16} className="text-indigo-500 mr-2" />
                    {s.time} ({s.duration})
                  </div>
                  <div className="flex items-center text-xs text-slate-600">
                    {s.type === 'Online' ? <Video size={16} className="text-indigo-500 mr-2" /> : <MapPin size={16} className="text-indigo-500 mr-2" />}
                    {s.type}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm shadow-md active:scale-95 transition-transform">
                    {s.type === 'Online' ? 'Join Call' : 'Check In'}
                  </button>
                  <button className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-semibold text-sm">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500">No sessions scheduled here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleView;
