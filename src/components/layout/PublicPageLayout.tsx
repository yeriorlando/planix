import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Footer from '../planix/Footer';
import { getCurrentUser } from '../../lib/storage';

interface PublicPageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function PublicPageLayout({ title, subtitle, children }: PublicPageLayoutProps) {
  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 font-sans text-neutral-900 dark:text-neutral-100 flex flex-col justify-between selection:bg-brand-light selection:text-brand-primary">
      {/* Header */}
      <header className="relative w-full z-20 pt-6 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-neutral-150 dark:border-zinc-800 shadow-sm">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src="/Logo-login-y-landing.webp" alt="Planix" className="h-7 w-auto object-contain dark:brightness-125" />
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-black text-xs uppercase tracking-wide shadow-md shadow-brand-primary/20 hover:bg-brand-hover transition-all flex items-center gap-2"
              >
                Ir al Panel <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-neutral-50 dark:bg-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-700 text-text-main rounded-xl font-black text-xs uppercase tracking-wide transition-all border border-neutral-200 dark:border-zinc-700"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-black text-xs uppercase tracking-wide shadow-md shadow-brand-primary/20 hover:bg-brand-hover transition-all flex items-center gap-2"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="relative py-16 md:py-24 px-6 text-center border-b border-black/5 dark:border-white/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30">
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-text-main tracking-tighter leading-tight font-display">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-text-muted font-medium max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-white dark:bg-zinc-950 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
