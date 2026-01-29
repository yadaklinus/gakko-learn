"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Settings, ChevronRight, LogOut, Shield, CreditCard, Award, HelpCircle, Edit3, Globe, Save, X } from 'lucide-react';
import TutorApplicationModal from '@/components/ToutorApplication';

// Enum matches Prisma
enum UserRole {
  STUDENT = "STUDENT",
  TUTOR = "TUTOR",
  BOTH = "BOTH"
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  institution: string | null;
  major: string | null;
  bio: string | null;
  hourlyRate: number | null;
  subjects: string | null;
}

export default function ProfileView() {
  const { data: session, update: updateSession } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Widget State
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Logic
  const fetchProfile = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      // We can use a GET endpoint, or just reload the session if your strategy allows. 
      // Assuming you have a GET /api/users/me endpoint from your prompt
      const res = await fetch('/api/users/me'); 
      if (res.ok) {
        const data = await res.json();
        const userData = data.user || data;
        setUser(userData);
        setFormData(userData);
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsEditing(false);
        // Force session update to reflect changes in UI elsewhere if needed
        updateSession(); 
      }
    } catch (error) {
      console.error("Failed to update", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplicationSuccess = async () => {
    // 1. Refresh local user data
    await fetchProfile();
    // 2. Trigger session update so the middleware/navbar knows the role changed
    await updateSession();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  }

  if (!user) return null;

  const menuItems = [
    { icon: <Shield size={20} />, label: 'Verification Center', color: 'text-emerald-500' },
    { icon: <CreditCard size={20} />, label: 'Payments & Earnings', color: 'text-indigo-500' },
    { icon: <Award size={20} />, label: 'Badges & Achievements', color: 'text-amber-500' },
    { icon: <HelpCircle size={20} />, label: 'Support & Help', color: 'text-slate-500' },
  ];

  return (
    <div className="animate-in fade-in duration-500 pb-24">
      {/* HEADER */}
      <div className="bg-indigo-600 pt-12 pb-8 px-5 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-indigo-500 rounded-full opacity-20"></div>
        <div className="absolute bottom-[-50px] left-[-30px] w-60 h-60 bg-indigo-400 rounded-full opacity-10"></div>
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-white/20 relative bg-indigo-800">
            <img 
              src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
              alt={user.name} 
              className="object-cover w-full h-full" 
            />
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute bottom-1 right-1 bg-white p-1 rounded-lg text-indigo-600 shadow-sm hover:bg-slate-100"
              >
                <Edit3 size={12} />
              </button>
            )}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{user.name}</h2>
            <p className="text-indigo-100 text-sm opacity-80">
              {user.major || 'No Major'} • {user.institution || 'No Institution'}
            </p>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
          <button className="ml-auto text-white p-2 hover:bg-white/10 rounded-full">
            <Settings size={22} />
          </button>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20">
        
        {/* EDIT FORM */}
        {isEditing && (
          <div className="bg-white border border-indigo-100 p-5 rounded-3xl shadow-xl mb-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border-b border-slate-200 py-2 focus:border-indigo-600 outline-none font-medium" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Institution</label>
                <input 
                  value={formData.institution || ''} 
                  onChange={e => setFormData({...formData, institution: e.target.value})}
                  className="w-full border-b border-slate-200 py-2 focus:border-indigo-600 outline-none font-medium" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Major</label>
                <input 
                  value={formData.major || ''} 
                  onChange={e => setFormData({...formData, major: e.target.value})}
                  className="w-full border-b border-slate-200 py-2 focus:border-indigo-600 outline-none font-medium" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Bio</label>
                <textarea 
                  value={formData.bio || ''} 
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full border-b border-slate-200 py-2 focus:border-indigo-600 outline-none font-medium text-sm h-20 resize-none" 
                />
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* BECOME A TUTOR CTA */}
        {user.role === UserRole.STUDENT && (
          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-md mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Become a Tutor</h3>
                <p className="text-xs text-slate-500 mt-0.5">Share knowledge and earn.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsApplicationOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-transform"
            >
              Apply
            </button>
          </div>
        )}

        {/* TUTOR STATS (Show if they are a tutor) */}
        {user.role !== UserRole.STUDENT && (
           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                 <p className="text-xs text-slate-400 font-bold uppercase mb-1">Hourly Rate</p>
                 <p className="text-2xl font-black text-slate-900">₦{user.hourlyRate || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                 <p className="text-xs text-slate-400 font-bold uppercase mb-1">Subjects</p>
                 <p className="text-sm font-bold text-slate-900 truncate">
                    {user.subjects ? user.subjects.split(',')[0] : 'None'}
                    {user.subjects && user.subjects.split(',').length > 1 && ` +${user.subjects.split(',').length - 1}`}
                 </p>
              </div>
           </div>
        )}

        {/* MENU ITEMS */}
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2">Account</h3>
          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-slate-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`${item.color} opacity-80`}>{item.icon}</div>
                  <span className="font-semibold text-slate-700 text-sm">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            ))}
          </div>
        </div>

        {/* LOG OUT */}
        <button 
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="w-full flex items-center justify-center space-x-2 text-rose-500 font-bold text-sm py-4 border-2 border-slate-100 rounded-3xl mb-8 active:bg-rose-50 transition-colors bg-white"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>

        <div className="text-center pb-10">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">AcademiaConnect v1.0.4</p>
        </div>
      </div>

      {/* TUTOR APPLICATION WIDGET */}
      <TutorApplicationModal 
        isOpen={isApplicationOpen} 
        onClose={() => setIsApplicationOpen(false)} 
        onSuccess={handleApplicationSuccess}
      />

    </div>
  );
}