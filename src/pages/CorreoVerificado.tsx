import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, BookOpen, GraduationCap, Library } from 'lucide-react';
import PlatformLogo from '../components/ui/PlatformLogo';

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4 py-12 relative overflow-hidden">
      {/* Simple Background */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <BookOpen className="absolute top-10 left-10 text-brand-primary" size={80} style={{ transform: 'rotate(-15deg)' }} />
        <GraduationCap className="absolute top-20 right-20 text-brand-primary" size={100} style={{ transform: 'rotate(20deg)' }} />
        <Library className="absolute bottom-32 left-20 text-brand-primary" size={90} style={{ transform: 'rotate(10deg)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-primary-200/30 dark:shadow-none p-8 md:p-12 text-center border border-slate-100 dark:border-zinc-800 animate-in zoom-in duration-500">

          <div className="flex justify-center mb-8">
            <PlatformLogo variant="large" />
          </div>

          <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs border border-green-200/50 dark:border-green-900/30">
            <CheckCircle2 size={40} />
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4 font-display">
            ¡Correo Verificado!
          </h2>

          <p className="text-slate-500 dark:text-neutral-400 font-medium text-sm mb-8 leading-relaxed">
            Tu cuenta ha sido confirmada exitosamente. <br />
            Ya puedes acceder a todas las funcionalidades de Planix.
          </p>

          <Link
            to="/login"
            className="w-full bg-brand-primary text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:bg-brand-hover hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Iniciar Sesión <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
