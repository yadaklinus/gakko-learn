"use client"
import React from 'react';
import { Home, Search, Calendar, BookOpen, MessageSquare, User as UserIcon, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const navItems = [
    { icon: <Home size={22} />, label: 'Home', path: '/dashboard' },
    { icon: <Search size={22} />, label: 'Explore', path: '/dashboard/explore' },
    { icon: <Calendar size={22} />, label: 'Schedule', path: '/dashboard/schedule' },
    { icon: <MessageSquare size={22} />, label: 'Messages', path: '/dashboard/messages' },
    { icon: <UserIcon size={22} />, label: 'Profile', path: '/dashboard/profile' },
  ];

  // Helper to check active state
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile Navigation (Bottom Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] md:hidden">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
              isActive(item.path) 
                ? 'text-indigo-600 bg-indigo-50 scale-110' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {item.icon}
            {/* Optional: Hide label on mobile for cleaner look, or keep tiny */}
            {/* <span className="text-[9px] mt-1 font-bold">{item.label}</span> */}
          </button>
        ))}
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 p-6 flex-col z-50">
        
        {/* Logo Area */}
        <div className="flex items-center space-x-3 mb-12 px-2">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
            <BookOpen className="text-white" size={26} />
          </div>
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
            Academia
          </span>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group font-bold text-sm ${
                isActive(item.path)
                  ? 'text-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              
              {isActive(item.path) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* User Footer */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div 
            onClick={() => router.push('/dashboard/profile')}
            className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
               {/* Use session image or fallback */}
               <img 
                 src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}&background=random`} 
                 alt="User" 
                 className="w-full h-full object-cover" 
               />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium">Signed in as</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {session?.user?.name || 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};