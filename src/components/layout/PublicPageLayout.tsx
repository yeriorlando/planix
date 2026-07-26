import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LogIn } from 'lucide-react';
import Footer from '../planix/Footer';
import PlatformLogo from '../ui/PlatformLogo';
import { getCurrentUser } from '../../lib/storage';

interface PublicPageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function PublicPageLayout({ title, subtitle, children }: PublicPageLayoutProps) {
  const user = getCurrentUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg-base font-sans text-text-main flex flex-col justify-between selection:bg-brand-light selection:text-brand-primary">
      {/* STICKY NAVBAR — Glassmorphism (same as Landing Page) */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <header className={`flex items-center justify-between rounded-2xl px-5 py-2 transition-all duration-300 ${
            scrolled
              ? 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-lg shadow-zinc-900/5 dark:shadow-black/20 border border-zinc-200/60 dark:border-zinc-800/60'
              : 'bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/30 dark:border-zinc-800/30'
          }`}>
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <PlatformLogo className="h-14 md:h-16" />
            </Link>

            <div className="flex items-center gap-2.5">
              {user ? (
                <Link to="/dashboard">
                  <button className="px-4 py-2 bg-[#02327e] hover:bg-[#012563] text-white font-semibold text-sm rounded-xl transition-all cursor-pointer active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-none">
                    Ir al Panel <ArrowRight size={14} />
                  </button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <button className="px-4 py-2 bg-[#02b36d] hover:bg-[#029a5e] text-white font-semibold text-sm rounded-xl transition-all cursor-pointer active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-none">
                      <LogIn size={14} /> Iniciar Sesión
                    </button>
                  </Link>
                  <Link to="/registro">
                    <button className="px-4 py-2 bg-[#02327e] hover:bg-[#012563] text-white font-semibold text-sm rounded-xl transition-all cursor-pointer active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-none">
                      Comenzar Gratis <ArrowRight size={14} />
                    </button>
                  </Link>
                </>
              )}
            </div>
          </header>
        </div>
      </div>

      {/* Hero Header spacer and design */}
      <div className="relative pt-28 pb-12 md:pt-32 md:pb-16 px-6 text-center border-b border-black/5 dark:border-white/5 overflow-hidden bg-bg-base">
        {/* Soft Decorative background circle */}
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30">
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-1">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-text-main tracking-tighter leading-tight font-display">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-text-muted font-medium max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-bg-base relative z-10">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
