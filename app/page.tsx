
import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  BrainCircuit, 
  Mic, 
  Zap,
  CheckCircle2,
  BookOpen,
  Layout,
  Search
} from 'lucide-react';

const LandingView: React.FC = () => {
  return (
    <div className="bg-white min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header/Nav */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <BookOpen className="text-white" size={24} />
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              Academia
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#ai" className="hover:text-indigo-600 transition-colors">AI Assistant</a>
            <a href="#tutors" className="hover:text-indigo-600 transition-colors">Find Tutors</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href={"/auth/login"} className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">Log In</Link>
            <Link href={"/auth/register"} className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Sparkles size={14} />
            <span>AI-Powered Peer Tutoring</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Master your courses with <br /> 
            <span className="text-indigo-600">Verified Peer Experts.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Connect with seniors and high-achievers from your campus who have aced the exact courses you're taking today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href={"/auth/register"} className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center group">
              Start Learning Now
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href={"/auth/login"} className="w-full sm:w-auto border-2 border-slate-100 text-slate-600 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center">
              Apply as Tutor
            </Link>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-20 max-w-5xl mx-auto px-6 relative animate-in zoom-in-95 duration-1000 delay-500">
          <div className="bg-white border-8 border-slate-100 rounded-[48px] shadow-[0_50px_100px_-20px_rgba(79,70,229,0.15)] overflow-hidden">
            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" alt="Dashboard Preview" className="w-full h-auto opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
          </div>
          
          {/* Floating UI Elements */}
          <div className="absolute -top-10 -left-10 hidden lg:block bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 animate-bounce duration-[3000ms]">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500 p-2 rounded-xl text-white">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">Calculus Verified</p>
                <p className="text-[10px] text-slate-500 font-bold">BY PROF. IBRAHIM</p>
              </div>
            </div>
          </div>

          <div className="absolute top-20 -right-10 hidden lg:block bg-indigo-600 text-white p-6 rounded-3xl shadow-2xl animate-pulse">
            <div className="flex items-center space-x-3">
              <Mic size={24} />
              <div>
                <p className="text-sm font-black">Live Coaching</p>
                <p className="text-[10px] opacity-80">ACTIVE NOW</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Universities */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-12">Trusted by students from</p>
          <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-60">
            <span className="text-2xl font-black text-slate-800">UNILAG</span>
            <span className="text-2xl font-black text-slate-800">UI IBADAN</span>
            <span className="text-2xl font-black text-slate-800">OAU IFE</span>
            <span className="text-2xl font-black text-slate-800">COVENANT</span>
            <span className="text-2xl font-black text-slate-800">UNN</span>
          </div>
        </div>
      </section>

      {/* AI Features Bento Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Built with Gemini Intelligence.</h2>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">We use state-of-the-art AI to ensure every study session is focused, effective, and tailored to your specific curriculum.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bento Item 1 */}
            <div className="md:col-span-2 bg-indigo-50 rounded-[40px] p-10 flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8">
                  <BrainCircuit size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">Smart Study Flash Guides</h3>
                <p className="text-indigo-900/60 font-medium text-lg leading-relaxed max-w-md">
                  Gemini analyzes your upcoming session topic and generates a custom 5-point study guide and practice question set instantly.
                </p>
              </div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/50 rounded-full blur-3xl"></div>
              <div className="mt-12 bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 relative z-10 max-w-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles size={16} className="text-indigo-600" />
                  <span className="text-xs font-black text-indigo-600 uppercase">Flash Guide Generated</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                  <div className="h-2 w-5/6 bg-slate-100 rounded-full"></div>
                  <div className="h-2 w-4/6 bg-slate-100 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Bento Item 2 */}
            <div className="bg-slate-900 rounded-[40px] p-10 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <Mic size={120} />
              </div>
              <div>
                <div className="bg-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8">
                  <Mic size={32} />
                </div>
                <h3 className="text-3xl font-black mb-4">Live Voice Assistant</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Meet Kedu. A real-time voice tutor powered by Gemini Live. Ask questions aloud and get human-like responses.
                </p>
              </div>
              <div className="mt-8 flex items-center space-x-2 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest">Listening</span>
              </div>
            </div>

            {/* Bento Item 3 */}
            <div className="bg-slate-50 rounded-[40px] p-10 flex flex-col justify-between">
              <div>
                <div className="bg-indigo-100 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 mb-8">
                  <Users size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">Perfect Match</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Our AI matching engine pairs you with the best possible tutor based on your learning style and campus.
                </p>
              </div>
              <div className="mt-12 flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://picsum.photos/seed/${i + 10}/100`} alt="Avatar" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  +500
                </div>
              </div>
            </div>

            {/* Bento Item 4 */}
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[40px] p-10 text-white flex flex-col md:flex-row items-center justify-between">
              <div className="mb-10 md:mb-0 md:max-w-md">
                <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-3xl font-black mb-4">Verified & Secure</h3>
                <p className="text-white/80 font-medium text-lg leading-relaxed">
                  Every tutor undergoes a rigorous ID verification and transcript review. We use campus-exclusive emails to ensure community integrity.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="font-black">Identity Verified</p>
                    <p className="text-xs opacity-60">MATCHED WITH UNILAG DATABASE</p>
                  </div>
                </div>
                <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-emerald-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Three steps to academic excellence.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                step: '01', 
                icon: <Layout className="text-indigo-600" />, 
                title: 'Join the Community', 
                desc: 'Sign up with your university email to join your specific campus community.' 
              },
              { 
                step: '02', 
                icon: <Search className="text-indigo-600" />, 
                title: 'Find Your Tutor', 
                desc: 'Use our AI search to find tutors who have excelled in the exact courses you need help with.' 
              },
              { 
                step: '03', 
                icon: <Zap className="text-indigo-600" />, 
                title: 'Learn & Succeed', 
                desc: 'Book a session, get your AI study guide, and master your subjects with peer support.' 
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <span className="text-8xl font-black text-indigo-600/5 absolute -top-10 -left-6 select-none">{item.step}</span>
                <div className="relative z-10">
                  <div className="bg-white w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center mb-8">
                    {item.icon}
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10">Ready to crush your next semester?</h2>
          <p className="text-slate-400 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto relative z-10">
            Join 5,000+ students already improving their GPAs through collaborative peer-to-peer learning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
            <Link href={"/auth/register"} className="w-full sm:w-auto bg-indigo-600 text-white px-12 py-5 rounded-2xl text-xl font-black shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center group">
              Get Started Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href={"/auth/login"} className="w-full sm:w-auto border-2 border-white/10 text-white px-12 py-5 rounded-2xl text-xl font-black hover:bg-white/5 transition-all">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="flex items-center space-x-2 mb-8 md:mb-0">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <BookOpen className="text-white" size={24} />
              </div>
              <span className="text-xl font-black text-slate-900">Academia</span>
            </div>
            <div className="flex space-x-8 text-sm font-bold text-slate-500">
              <a href="#" className="hover:text-indigo-600">Privacy</a>
              <a href="#" className="hover:text-indigo-600">Terms</a>
              <a href="#" className="hover:text-indigo-600">Contact</a>
              <a href="#" className="hover:text-indigo-600">FAQ</a>
            </div>
          </div>
          <div className="text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
            © 2025 AcademiaConnect Nigeria. Built for the future of education.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;