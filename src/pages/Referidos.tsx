import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Users, 
  Coins, 
  Sparkles, 
  School, 
  GraduationCap, 
  Calendar,
  Gift
} from 'lucide-react';
import { getCurrentUser } from '../lib/storage';
import { fetchProfile } from '../lib/services/auth';
import { requestD1 } from '../lib/services/d1Client';
import { toast, Toaster } from 'sonner';
import { Card } from '../components/ui/card';

interface ReferredColleague {
  id: string;
  full_name: string;
  email: string;
  school_name: string;
  nivel_principal: string;
  created_at: string;
}

export default function Referidos() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [referrals, setReferrals] = useState<ReferredColleague[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState({ referrer_credits: 50, referred_credits: 30 });

  // Load referral settings and colleague list
  useEffect(() => {
    async function loadReferralData() {
      if (!currentUser) return;
      try {
        // Fetch latest profile from DB to ensure referral code is available
        const profile = await fetchProfile(currentUser.id);
        if (profile) {
          setCurrentUser(profile);
        }

        // Fetch referred list
        const list = await requestD1<ReferredColleague[]>(`/api/profiles/${currentUser.id}/referrals`);
        if (list && Array.isArray(list)) {
          setReferrals(list);
        }

        // Fetch referral configuration
        const configRow = await requestD1<any>('/api/site-configs/referral_settings');
        if (configRow && configRow.value) {
          const val = typeof configRow.value === 'string' ? JSON.parse(configRow.value) : configRow.value;
          setSettings({
            referrer_credits: val.referrer_credits ?? 50,
            referred_credits: val.referred_credits ?? 30
          });
        }
      } catch (err) {
        console.error('Error loading referral data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReferralData();
  }, [currentUser?.id]);

  if (!currentUser) {
    return null;
  }

  // Calculate referral link
  const referralCode = currentUser.referral_code || 'CONFIGURANDO';
  const referralLink = `${window.location.origin}/registro?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('¡Enlace de referido copiado al portapapeles!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Estimate total credits earned (based on number of referrals * settings value)
  const totalEarnedCredits = referrals.length * settings.referrer_credits;

  return (
    <div className="flex-1 flex flex-col pt-10 xl:pt-[44px] px-6 md:px-[60px] xl:px-16 w-full min-w-0 pb-12 text-left">
      <Toaster position="top-center" richColors />

      {/* Header Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>          <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl text-[#1B1B1B] dark:text-white flex items-center gap-3">
            Programa de Referidos
            <span className="text-[10px] font-black uppercase bg-[#0046ab]/10 text-[#0046ab] dark:bg-blue-950/30 dark:text-blue-400 border border-[#0046ab]/10 px-2.5 py-0.5 rounded-full tracking-wider">
              Compartir
            </span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 font-semibold">
            Recomienda Planix a otros docentes y ganen Planix Coins juntos.
          </p>
        </div>
        <button
          onClick={() => navigate('/perfil')}
          className="flex items-center gap-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 active:scale-[0.99] text-[#1B1B1B] dark:text-white py-2.5 px-5 text-xs font-black shadow-xs transition-all cursor-pointer outline-none border-none"
        >
          <ArrowLeft size={14} />
          Volver a mi Perfil
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-zinc-900 rounded-[32px] border border-black/5 dark:border-zinc-800 shadow-2xs">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0046ab] mb-4"></div>
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Cargando estadísticas de invitación...</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 items-start">
          {/* Left / Top - Invitation Controls */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Promo Card */}
            <Card className="p-6 bg-gradient-to-r from-[#0046ab]/10 via-[#0046ab]/5 to-transparent dark:from-blue-955/20 dark:via-blue-955/10 dark:to-transparent border border-[#0046ab]/20 dark:border-[#0046ab]/10 rounded-[28px] relative overflow-hidden flex flex-col sm:flex-row items-center gap-5">
              <div className="w-14 h-14 bg-[#0046ab]/20 dark:bg-blue-955/40 rounded-full flex items-center justify-center shrink-0 text-[#0046ab] dark:text-blue-400 shadow-3xs">
                <Gift className="h-7 w-7" />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-display font-extrabold text-lg text-[#0046ab] dark:text-blue-300">
                  ¡Gana Planix Coins por cada docente invitado!
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-semibold">
                  Tus colegas obtienen <strong className="text-[#0046ab] dark:text-blue-400">+{settings.referred_credits} PC</strong> al registrarse con tu código, y tú recibirás <strong className="text-[#0046ab] dark:text-blue-400">+{settings.referrer_credits} PC</strong> al instante para generar planificaciones con IA.
                </p>
              </div>
            </Card>

            {/* Link Copy Box */}
            <Card className="p-6 space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-none">
              <div>
                <h3 className="font-display font-extrabold text-base text-[#1B1B1B] dark:text-white">
                  Comparte tu enlace único
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold mt-0.5">
                  Copia el enlace a continuación y envíalo por WhatsApp, redes sociales o correo.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-2">
                <div className="flex-1 bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-850 px-4 py-3 rounded-2xl text-xs font-mono font-bold text-neutral-600 dark:text-zinc-400 truncate flex items-center justify-start min-h-[44px]">
                  {referralLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="bg-[#1B1B1B] hover:bg-[#2A2A2A] dark:bg-white dark:hover:bg-neutral-50 dark:text-neutral-900 text-white font-extrabold text-xs px-6 py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] select-none shrink-0"
                >
                  {copied ? <Check size={14} className="text-emerald-500" strokeWidth={3} /> : <Copy size={14} />}
                  {copied ? '¡Copiado!' : 'Copiar Enlace'}
                </button>
              </div>
            </Card>

            {/* Referred Colleagues Table / List */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-none space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-[#1B1B1B] dark:text-white">
                  Docentes Invitados ({referrals.length})
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold mt-0.5">
                  Lista de colegas que se han unido a Planix a través de tu recomendación.
                </p>
              </div>

              {referrals.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-neutral-100 dark:border-zinc-800 rounded-2xl space-y-3">
                  <Users className="w-12 h-12 text-neutral-350 dark:text-zinc-650 mx-auto" />
                  <h4 className="font-extrabold text-sm text-neutral-700 dark:text-zinc-300">Aún no tienes referidos</h4>
                  <p className="text-xs text-neutral-450 dark:text-zinc-500 font-bold max-w-xs mx-auto">
                    Comparte tu enlace arriba para invitar a tus compañeros de escuela y ganar Planix Coins adicionales.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-100 dark:border-zinc-800/80 text-[10px] font-black text-neutral-400 dark:text-zinc-500 uppercase tracking-wider text-left">
                        <th className="pb-3 pr-4">Docente</th>
                        <th className="pb-3 pr-4">Centro Educativo</th>
                        <th className="pb-3 pr-4">Nivel</th>
                        <th className="pb-3">Unido el</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100/50 dark:divide-zinc-800/40 text-xs">
                      {referrals.map((colleague) => (
                        <tr key={colleague.id} className="group">
                          <td className="py-3.5 pr-4 text-left">
                            <div className="flex flex-col text-left">
                              <span className="font-extrabold text-slate-800 dark:text-zinc-200">
                                {colleague.full_name}
                              </span>
                              <span className="text-[10px] font-bold text-neutral-450 dark:text-zinc-555 leading-none mt-0.5">
                                {colleague.email.replace(/(.{3})(.*)(@.*)/, '$1***$3')}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 text-left font-bold text-slate-600 dark:text-zinc-400">
                            <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                              <School size={12} className="text-neutral-400 shrink-0" />
                              <span className="truncate">{colleague.school_name || 'No especificado'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 text-left">
                            <div className="flex items-center gap-1.5 capitalize font-bold text-neutral-600 dark:text-zinc-400">
                              <GraduationCap size={12} className="text-neutral-400 shrink-0" />
                              <span>{colleague.nivel_principal || 'No definido'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-left font-bold text-neutral-500 dark:text-zinc-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-neutral-400 shrink-0" />
                              <span>
                                {new Date(colleague.created_at).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar - Referral Statistics */}
          <div className="space-y-6">
            
            {/* Stats Cards */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] relative overflow-hidden transition-all duration-300 shadow-none text-left flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-zinc-800/80 pb-3">
                <div className="w-10 h-10 bg-[#0046ab]/10 dark:bg-blue-955/40 text-[#0046ab] dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 fill-[#0046ab]/20 text-[#0046ab] dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-[#1B1B1B] dark:text-white">
                    Estadísticas
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold mt-0.5">
                    Tu rendimiento de invitaciones.
                  </p>
                </div>
              </div>

              {/* Stat 1: Colleagues invited */}
              <div className="p-4 bg-neutral-50/50 dark:bg-zinc-955/45 rounded-2xl border border-neutral-100 dark:border-zinc-800/80 text-left flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-neutral-400 dark:text-zinc-500 uppercase tracking-wider block">
                    Docentes Invitados
                  </span>
                  <span className="text-3xl font-black text-[#1B1B1B] dark:text-white leading-none block">
                    {referrals.length}
                  </span>
                </div>
                <div className="w-10 h-10 bg-blue-100/40 dark:bg-blue-955/30 text-[#0046ab] dark:text-blue-400 rounded-full flex items-center justify-center shrink-0 font-extrabold">
                  <Users size={16} />
                </div>
              </div>

              {/* Stat 2: Credits generated */}
              <div className="p-4 bg-neutral-50/50 dark:bg-zinc-955/45 rounded-2xl border border-neutral-100 dark:border-zinc-800/85 text-left flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-neutral-400 dark:text-zinc-500 uppercase tracking-wider block">
                    Planix Coins Ganadas
                  </span>
                  <span className="text-3xl font-black text-[#0046ab] dark:text-blue-400 leading-none flex items-center gap-1.5 mt-1">
                    <img 
                      src="/creditos.webp" 
                      alt="Planix Coins" 
                      className="w-7 h-7 object-contain shrink-0" 
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    {totalEarnedCredits} <span className="text-xs font-extrabold text-neutral-400 dark:text-zinc-500 ml-1">PC</span>
                  </span>
                </div>
                <div className="w-10 h-10 bg-blue-100/40 dark:bg-blue-955/30 text-[#0046ab] dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                  <Coins size={16} className="text-[#0046ab] dark:text-blue-400" />
                </div>
              </div>
            </Card>

            {/* Help / Instructions Card */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-none space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-zinc-800/80 pb-2">
                <Sparkles className="w-4 h-4 text-[#0046ab]" />
                <h4 className="font-extrabold text-xs text-[#1B1B1B] dark:text-white uppercase tracking-wider">
                  ¿Cómo funciona?
                </h4>
              </div>

              <ul className="space-y-3 text-xs text-neutral-600 dark:text-zinc-400 font-semibold list-decimal pl-4">
                <li>
                  Envía el enlace de referido único a tus colegas docentes.
                </li>
                <li>
                  Ellos completan el registro en la plataforma Planix.
                </li>
                <li>
                  Se les otorgan sus Planix Coins de bienvenida de referido y tú recibes tus PC al instante de forma automática.
                </li>
              </ul>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}
