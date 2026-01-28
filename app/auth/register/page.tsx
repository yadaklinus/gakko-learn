"use client";

import React, { useState } from 'react';
import { User as UserIcon, Mail, Building, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // 1. Import Toast

// Helper for conditional classes (optional but recommended)
const inputClasses = (hasError: boolean) => `
  block w-full pl-12 pr-4 py-4 border-2 rounded-2xl bg-slate-50 
  focus:ring-4 focus:ring-indigo-50 transition-all font-medium placeholder:text-slate-400
  ${hasError 
    ? 'border-red-300 focus:border-red-500 text-red-900' 
    : 'border-slate-100 focus:border-indigo-500 text-slate-900'}
`;

export default function RegisterView() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. New State for Field-specific errors
  // This matches the Zod .flatten().fieldErrors structure
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    // Clear error for this specific field when user types
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({}); // Clear previous errors

    // Client Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match"); // Toast immediately
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          institution: formData.institution,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 3. Handle Zod Validation Errors (Status 400)
        if (response.status === 400 && data.errors) {
          setFieldErrors(data.errors.fieldErrors);
          toast.error("Please fix the errors in the form.");
          return;
        }

        // Handle General Errors (e.g., User already exists)
        toast.error(data.message || 'Registration failed');
        return;
      }

      // 4. Success Logic
      toast.success("Account created successfully!");
      router.push('/auth/login?registered=true');

    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Visual Side (Left) - Kept mostly same as your code */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 items-center justify-center p-12 text-white relative overflow-hidden">
        {/* ... (Your existing visual side code) ... */}
         <div className="relative z-10 max-w-md">
           <h1 className="text-5xl font-black leading-tight mb-6">Master your courses.</h1>
           <p className="text-indigo-100 text-lg font-medium mb-10">Join thousands of students.</p>
         </div>
      </div>

      {/* Form Side (Right) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white rounded-t-[40px] lg:rounded-none relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Join the student community today.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            
            {/* Name Input */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon size={18} className={fieldErrors.name ? "text-red-400" : "text-slate-400"} />
                </div>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClasses(!!fieldErrors.name)}
                  placeholder="John Doe"
                />
              </div>
              {/* Display Validation Error Text */}
              {fieldErrors.name && (
                <p className="mt-1 text-xs font-bold text-red-500 ml-1 animate-pulse">
                  {fieldErrors.name[0]}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Institutional Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className={fieldErrors.email ? "text-red-400" : "text-slate-400"} />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClasses(!!fieldErrors.email)}
                  placeholder="j.doe@unilag.edu.ng"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs font-bold text-red-500 ml-1 animate-pulse">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            {/* Institution Select */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Institution</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building size={18} className={fieldErrors.institution ? "text-red-400" : "text-slate-400"} />
                </div>
                <select
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className={inputClasses(!!fieldErrors.institution)}
                >
                  <option value="">Select University</option>
                  <option value="University of Lagos">University of Lagos (Unilag)</option>
                  <option value="University of Ibadan">University of Ibadan (UI)</option>
                  <option value="Obafemi Awolowo University">Obafemi Awolowo University (OAU)</option>
                  <option value="Covenant University">Covenant University</option>
                </select>
              </div>
              {fieldErrors.institution && (
                <p className="mt-1 text-xs font-bold text-red-500 ml-1 animate-pulse">
                  {fieldErrors.institution[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className={fieldErrors.password ? "text-red-400" : "text-slate-400"} />
                </div>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClasses(!!fieldErrors.password)}
                  placeholder="••••••••"
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs font-bold text-red-500 ml-1 animate-pulse">
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>

            {/* Confirm Password (Client side only) */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClasses(false)} // We handle this via toast only
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-slate-900 text-white py-4 px-4 rounded-2xl text-sm font-black shadow-xl hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>

          {/* ... Footer Links ... */}
          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-bold text-indigo-600 hover:underline">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}