"use client"
import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X } from 'lucide-react';

interface Request {
  id: string; // Connection ID
  student: {
    id: string;
    name: string;
    image: string | null;
    institution: string | null;
    major: string | null;
  };
  createdAt: string;
}

const TutorRequestsView: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Logic
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/connections');
      if (res.ok) {
        const data = await res.json();
        // FIX: Read from 'connections', fallback to empty array
        setRequests(data.connections || []);
      }
    } catch (error) {
      console.error("Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Action Logic
  const handleAction = async (connectionId: string, status: 'ACCEPTED' | 'REJECTED') => {
    // Optimistic UI removal: remove item from list instantly
    setRequests(prev => prev.filter(r => r.id !== connectionId));

    try {
        const res = await fetch('/api/connections', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ connectionId, status })
        });
        
        if (!res.ok) {
            console.error("Action failed on server");
        }
    } catch (error) {
        console.error("Failed to update status");
    }
  };

  if (isLoading) return (
    <div className="flex justify-center p-6">
        <span className="animate-spin h-5 w-5 border-2 border-slate-300 border-t-slate-900 rounded-full"></span>
    </div>
  );

  if (!requests || requests.length === 0) {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center">
            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <UserPlus size={20} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm">No pending student requests.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Pending Requests</h3>
      {requests.map((req) => (
        <div key={req.id} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex items-center justify-between animate-in slide-in-from-left-2 duration-300">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden">
                    <img 
                        src={req.student.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.student.name)}`} 
                        className="w-full h-full object-cover" 
                        alt={req.student.name}
                    />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-sm">{req.student.name}</h4>
                    <p className="text-xs text-slate-500 truncate max-w-[120px]">{req.student.major}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => handleAction(req.id, 'REJECTED')}
                    className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors"
                >
                    <X size={18} />
                </button>
                <button 
                    onClick={() => handleAction(req.id, 'ACCEPTED')}
                    className="p-2 bg-slate-900 text-white hover:bg-emerald-500 rounded-full transition-colors shadow-lg shadow-slate-200"
                >
                    <Check size={18} />
                </button>
            </div>
        </div>
      ))}
    </div>
  );
};

export default TutorRequestsView;