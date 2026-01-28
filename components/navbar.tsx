"use client"
import { Home, Search, Calendar,BookOpen, MessageSquare, User as UserIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types/types';

const MOCK_USER: User = {
  id: 'u1',
  name: 'Adebayo Olumide',
  avatar: 'https://picsum.photos/seed/adebayo/200',
  role: UserRole.STUDENT,
  institution: 'University of Lagos',
  major: 'Computer Science',
  rating: 4.8,
  bio: 'Final year CS student at Unilag. Passionate about Algorithms and Backend Dev.',
  subjects: ['Calculus', 'Python', 'Algorithms'],
  isVerified: false
};

export const Navigation: React.FC = () => {

  const pathname = usePathname()
  const router = useRouter()

  

  const navItems = [
    { icon: <Home size={22} />, label: 'Home', path: '/dashboard' },
    { icon: <Search size={22} />, label: 'Explore', path: '/dashboard/explore' },
    { icon: <Calendar size={22} />, label: 'Schedule', path: '/dashboard/schedule' },
    { icon: <MessageSquare size={22} />, label: 'Messages', path: '/dashboard/messages' },
    { icon: <UserIcon size={22} />, label: 'Profile', path: '/dashboard/profile' },
  ];

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex justify-between items-center z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] md:hidden">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              pathname === item.path ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 p-6 flex-col z-50">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <BookOpen className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Academia
          </span>
        </div>
        <div className="space-y-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all font-medium ${
                pathname === item.path 
                  ? 'text-indigo-600 bg-indigo-50 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-auto p-4 bg-slate-50 rounded-2xl">
          <p className="text-xs text-slate-500 font-medium mb-1">Signed in as</p>
          <p className="text-sm font-bold text-slate-900 truncate">{MOCK_USER.name}</p>
        </div>
      </nav>
    </>
  );
};