
import React from 'react';
import { Settings, ChevronRight, LogOut, Shield, CreditCard, Award, HelpCircle, Edit3, Globe } from 'lucide-react';
import { User, UserRole } from '../types';

interface ProfileViewProps {
  user: User;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  const menuItems = [
    { icon: <Shield size={20} />, label: 'Verification Center', color: 'text-emerald-500' },
    { icon: <CreditCard size={20} />, label: 'Payments & Earnings', color: 'text-indigo-500' },
    { icon: <Award size={20} />, label: 'Badges & Achievements', color: 'text-amber-500' },
    { icon: <HelpCircle size={20} />, label: 'Support & Help', color: 'text-slate-500' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-indigo-600 pt-12 pb-8 px-5 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-indigo-500 rounded-full opacity-20"></div>
        <div className="absolute bottom-[-50px] left-[-30px] w-60 h-60 bg-indigo-400 rounded-full opacity-10"></div>
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-white/20 relative">
            <img src={user.avatar} alt={user.name} className="object-cover w-full h-full" />
            <button className="absolute bottom-1 right-1 bg-white p-1 rounded-lg text-indigo-600 shadow-sm">
              <Edit3 size={12} />
            </button>
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{user.name}</h2>
            <p className="text-indigo-100 text-sm opacity-80">{user.major} • {user.institution}</p>
            <div className="flex items-center mt-1">
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                {user.role}
              </span>
            </div>
          </div>
          <button className="ml-auto text-white p-2 hover:bg-white/10 rounded-full">
            <Settings size={22} />
          </button>
        </div>
      </div>

      <div className="px-5 -mt-6">
        {/* Become a Tutor Card */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-md mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Become a Tutor</h3>
              <p className="text-xs text-slate-500 mt-0.5">Share knowledge and earn credits.</p>
            </div>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-transform">
            Apply Now
          </button>
        </div>

        {/* Profile Details List */}
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

        {/* Log Out */}
        <button className="w-full flex items-center justify-center space-x-2 text-rose-500 font-bold text-sm py-4 border-2 border-slate-100 rounded-3xl mb-8 active:bg-rose-50 transition-colors">
          <LogOut size={18} />
          <span>Log Out</span>
        </button>

        <div className="text-center pb-10">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">AcademiaConnect v1.0.4</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
