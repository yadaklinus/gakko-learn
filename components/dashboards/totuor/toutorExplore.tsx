"use client"
import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, CheckCircle2 } from 'lucide-react';

interface Request {
  id: string; // Connection ID
  student: {
    id: string;
    name: string;
    image: string | null;
    institution: string | null;
    major: string | null;
    bio: string | null;
  };
  createdAt: string;
}

const TutorRequestsView: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Request['student'] | null>(null);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
      setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
      setIsModalOpen(false);
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
        <div
          key={req.id}
          onClick={() => {
            setSelectedStudent(req.student);
            setActiveConnectionId(req.id);
            setIsModalOpen(true);
          }}
          className="group bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex items-center justify-between cursor-pointer animate-in slide-in-from-left-2 duration-300"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden group-hover:ring-2 group-hover:ring-indigo-100 transition-all">
              <img
                src={req.student.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.student.name)}`}
                className="w-full h-full object-cover"
                alt={req.student.name}
              />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{req.student.name}</h4>
              <p className="text-xs text-slate-500 truncate max-w-[120px]">{req.student.major}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(req.id, 'REJECTED');
              }}
              className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(req.id, 'ACCEPTED');
              }}
              className="p-2 bg-slate-900 text-white hover:bg-emerald-500 rounded-full transition-colors shadow-lg shadow-slate-200"
            >
              <Check size={18} />
            </button>
          </div>
        </div>
      ))}

      {/* Student Profile Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[42px] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300">
            {/* Minimal Header */}
            <div className="h-28 bg-gradient-to-br from-indigo-500 to-indigo-700 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex justify-center -mt-12 relative z-10">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                <img
                  src={selectedStudent.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=random`}
                  alt={selectedStudent.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-8 pt-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-slate-900">{selectedStudent.name}</h3>
                <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mt-0.5">Student Inquiry</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Institution</p>
                  <p className="text-[11px] font-bold text-slate-700 truncate">{selectedStudent.institution || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Major</p>
                  <p className="text-[11px] font-bold text-slate-700 truncate">{selectedStudent.major || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2 px-1">Personal Bio</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-24 overflow-y-auto">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedStudent.bio || "The student hasn't provided a bio yet."}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => activeConnectionId && handleAction(activeConnectionId, 'REJECTED')}
                  disabled={isProcessing}
                  className="flex-1 py-3.5 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => activeConnectionId && handleAction(activeConnectionId, 'ACCEPTED')}
                  disabled={isProcessing}
                  className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 shadow-lg active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="mr-2" />
                      <span>Accept Student</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorRequestsView;