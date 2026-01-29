"use client"

import { useState, FC, FormEvent, useEffect } from 'react';
import { Mail, Lock, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

const LoginView: FC = () => {
  const router = useRouter();
  const { status } = useSession(); // 1. Get session status

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Check if user is logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard'); // Redirect immediately
    }
  }, [status, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  // 3. Show loading state while checking session to prevent "flash" of login form
  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen flex flex-col bg-white items-center justify-center">
        <span className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100 mb-6">
            <BookOpen size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Log in to continue your learning journey</p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-[20px] bg-slate-50 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 text-slate-900 transition-all font-medium"
                  placeholder="name@university.edu.ng"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-[20px] bg-slate-50 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 text-slate-900 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end mt-2">
                <button type="button" className="text-xs font-bold text-indigo-600 hover:underline">Forgot password?</button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-indigo-600 text-white py-4 px-4 rounded-[20px] text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ChevronRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            New here?{' '}
            <Link href={"/auth/register"} className="font-bold leading-6 text-indigo-600 hover:underline">
              Create a student account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;