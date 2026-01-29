"use client"

import React, { useState } from 'react';
import { CheckCircle2, Award, FileText, ArrowLeft, Camera, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TutorApplicationModal({ isOpen, onClose, onSuccess }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [major, setMajor] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [currentSubject, setCurrentSubject] = useState('');

  if (!isOpen) return null;

  const addSubject = () => {
    if (currentSubject.trim() && !subjects.includes(currentSubject.trim())) {
      setSubjects([...subjects, currentSubject.trim()]);
      setCurrentSubject('');
    }
  };

  const removeSubject = (sub: string) => {
    setSubjects(subjects.filter(s => s !== sub));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tutor/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          major,
          subjects,
          hourlyRate: parseFloat(hourlyRate) || 0
        }),
      });

      if (!res.ok) throw new Error('Application failed');

      // Success Logic:
      // We immediately sign the user out. This forces a session refresh (to get the new 'TUTOR' role)
      // and redirects them to the login page.
      await signOut({ callbackUrl: '/auth/login' });
      
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      setIsLoading(false); // Only stop loading on error (on success we redirect)
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between bg-white z-10">
          <div className="flex items-center space-x-4">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex space-x-1">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 w-6 rounded-full transition-all duration-300 ${step >= s ? 'bg-indigo-600' : 'bg-slate-100'}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          
          {/* STEP 1: Intro */}
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                <Award size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Become a Tutor</h2>
              <p className="text-slate-500 font-medium mb-8">Share your expertise and help fellow students excel.</p>
              
              <div className="space-y-3 mb-8">
                {[
                  { title: 'Set your own rate', desc: 'Choose what you charge per hour.' },
                  { title: 'Flexible schedule', desc: 'Tutor whenever you have free time.' },
                  { title: 'Campus recognition', desc: 'Build your reputation as an expert.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <CheckCircle2 className="text-emerald-500 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(2)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all">
                Start Application
              </button>
            </div>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
              <h2 className="text-2xl font-black text-slate-900">Your Expertise</h2>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Major</label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-medium transition-all"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Hourly Rate (₦)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-medium transition-all"
                  placeholder="e.g. 2000"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Subjects</label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={currentSubject}
                    onChange={(e) => setCurrentSubject(e.target.value)}
                    className="flex-1 px-5 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-medium transition-all"
                    placeholder="e.g. Calculus 101"
                    onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                  />
                  <button onClick={addSubject} className="bg-slate-900 text-white px-5 rounded-2xl font-bold hover:bg-slate-800 transition-colors">Add</button>
                </div>
                
                {subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {subjects.map(s => (
                      <span key={s} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center animate-in zoom-in-50">
                        {s}
                        <button onClick={() => removeSubject(s)} className="ml-2 hover:text-indigo-900">×</button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Add at least one subject you can teach.</p>
                )}
              </div>

              <button 
                onClick={() => setStep(3)} 
                disabled={!major || subjects.length === 0 || !hourlyRate}
                className="w-full mt-4 bg-indigo-600 text-white py-4 rounded-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 3: Verify */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
              <h2 className="text-2xl font-black text-slate-900">Verification</h2>
              <p className="text-sm text-slate-500 font-medium">Upload proof of your student status. This helps build trust.</p>

              <div className="space-y-4">
                <button className="w-full border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
                  <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                    <Camera size={20} className="text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Upload Student ID</p>
                </button>

                <button className="w-full border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
                  <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                    <FileText size={20} className="text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Upload Transcript (Optional)</p>
                </button>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center disabled:opacity-70 hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}