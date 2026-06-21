import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, LogOut, MessageSquare, ArrowLeft } from 'lucide-react';
import PlatformLogo from '../components/ui/PlatformLogo';
import { logout } from '../lib/storage';

export default function AccountSuspendedPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-brand-light selection:text-brand-primary">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-12 text-center border border-slate-100 dark:border-zinc-800">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <PlatformLogo variant="large" />
        </div>

        {/* Suspension Icon */}
        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 border border-amber-100/50 dark:border-amber-900/30">
          <AlertCircle size={48} strokeWidth={2.5} />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight font-display">
          Cuenta Suspendida
        </h1>

        <p className="text-slate-600 dark:text-neutral-350 mb-8 leading-relaxed font-medium text-sm">
          Tu acceso a la plataforma ha sido pausado temporalmente. Esto puede deberse a un ajuste administrativo o a una suscripción pendiente.
        </p>

        <div className="space-y-4">
          <a
            href="https://wa.me/18299416546"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare size={18} />
            Contactar Soporte
          </a>

          <button
            onClick={handleLogout}
            className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-250 dark:hover:bg-zinc-700 text-slate-600 dark:text-neutral-200 rounded-2xl py-4 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent dark:border-zinc-700"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium leading-relaxed">
            Si crees que esto es un error, por favor comunícate con nosotros inmediatamente.
          </p>
        </div>
      </div>

      <Link
        to="/"
        className="mt-8 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        Volver al inicio
      </Link>
    </div>
  );
}
