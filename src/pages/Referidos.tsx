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
  Gift,
  Crown,
  DollarSign,
  MessageSquare,
  TrendingUp
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
  subscription_tier?: string;
  subscription_status?: string;
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
        // 1. Fetch latest profile from DB to ensure referral code & preferences are fresh
        try {
          const profile = await fetchProfile(currentUser.id);
          if (profile) {
            setCurrentUser(profile);
          }
        } catch (_) {}

        // 2. Fetch referred list with subscription tier
        try {
          const list = await requestD1<ReferredColleague[]>(`/api/profiles/${currentUser.id}/referrals`);
          if (list && Array.isArray(list)) {
            setReferrals(list);
          }
        } catch (_) {}

        // 3. Fetch referral configuration
        try {
          const configRow = await requestD1<any>('/api/site-configs/referral_settings');
          if (configRow && configRow.value) {
            const val = typeof configRow.value === 'string' ? JSON.parse(configRow.value) : configRow.value;
            setSettings({
              referrer_credits: val.referrer_credits ?? 50,
              referred_credits: val.referred_credits ?? 30
            });
          }
        } catch (_) {
          // Usa valores por defecto si no existe en base de datos
          setSettings({ referrer_credits: 50, referred_credits: 30 });
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

  // Format currency with comma thousands separator (e.g. 1,000, 2,500)
  const formatRD = (amount: number) => new Intl.NumberFormat('en-US').format(amount);

  // Commission calculations
  const proReferrals = referrals.filter(r => r.subscription_tier?.toLowerCase() === 'pro');
  const proCount = proReferrals.length;

  const userPrefs = typeof currentUser.preferences === 'string' 
    ? JSON.parse(currentUser.preferences || '{}') 
    : (currentUser.preferences || {});

  const isCommissionEnabled = Boolean(userPrefs.commission_enabled);
  const commissionAmountPerPro = Number(userPrefs.commission_amount_rd || 0);
  const totalEarnedCommissionRD = isCommissionEnabled ? proCount * commissionAmountPerPro : 0;

  // Estimate total credits earned
  const totalEarnedCredits = referrals.length * settings.referrer_credits;

  return (
    <div className="flex-1 flex flex-col pt-10 xl:pt-[44px] px-6 md:px-[60px] xl:px-16 w-full min-w-0 pb-12 text-left">
      <Toaster position="top-center" richColors />

      {/* Header Navigation */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <button
          onClick={() => navigate('/perfil')}
          className="self-start flex items-center gap-2 rounded-2xl bg-[#0046ab] hover:bg-[#003c96] active:scale-[0.98] text-white py-2.5 px-5 text-xs font-black shadow-xs transition-all cursor-pointer outline-none border-none shrink-0"
        >
          <ArrowLeft size={14} />
          Volver a mi Perfil
        </button>
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl text-[#1B1B1B] dark:text-white flex items-center gap-3">
            Programa de Referidos
            <span className="text-[10px] font-black uppercase bg-[#0046ab]/10 text-[#0046ab] dark:bg-blue-955/30 dark:text-blue-400 border border-[#0046ab]/10 px-2.5 py-0.5 rounded-full tracking-wider">
              Compartir
            </span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 font-semibold">
            Recomienda Planix a otros docentes y ganen Planix Coins juntos.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-zinc-900 rounded-[32px] border border-black/5 dark:border-zinc-800 shadow-2xs">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0046ab] mb-4"></div>
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Cargando estadísticas de invitación...</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Banner VIP de Comisiones en Efectivo (Solo visible si el admin activó la comisión) */}
          {isCommissionEnabled && (
            <Card className="p-6 bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-transparent border border-emerald-500/30 dark:border-emerald-500/20 rounded-[28px] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
              <div className="flex items-start sm:items-center gap-4 text-left">
                <div className="w-14 h-14 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-2xl flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
                  <DollarSign className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-black text-lg text-emerald-800 dark:text-emerald-300">
                      ¡Tienes activo el Programa de Comisiones en Efectivo!
                    </h3>
                    <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-md tracking-wider">
                      Afiliado VIP
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-semibold">
                    Ganas <strong className="text-emerald-700 dark:text-emerald-400 font-black">RD$ {formatRD(commissionAmountPerPro)}</strong> por cada colega que se registre con tu enlace y pase a <strong className="text-amber-600 dark:text-amber-400">Planix PRO 👑</strong>.
                  </p>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-emerald-500/20">
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-zinc-500 block">Comisión Acumulada</span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-tight block">
                    RD$ {formatRD(totalEarnedCommissionRD)}
                  </span>
                </div>
                <a
                  href={`https://wa.me/18299416546?text=${encodeURIComponent(`Hola Planix, soy ${currentUser.nombre || 'Docente'} (${currentUser.email}). Tengo activo mi programa de comisiones de referidos PRO y deseo coordinar el desembolso de mis RD$ ${formatRD(totalEarnedCommissionRD)} acumulados.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-xs select-none"
                >
                  <MessageSquare size={14} />
                  Solicitar Cobro
                </a>
              </div>
            </Card>
          )}

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
                  <div className="flex-1 bg-neutral-50 dark:bg-zinc-955 border border-neutral-200 dark:border-zinc-850 px-4 py-2 rounded-xl text-xs font-mono font-bold text-neutral-600 dark:text-zinc-400 truncate flex items-center justify-start min-h-[38px] h-[38px]">
                    {referralLink}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="bg-[#1B1B1B] hover:bg-[#2A2A2A] dark:bg-white dark:hover:bg-neutral-50 dark:text-neutral-900 text-white font-extrabold text-xs px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] select-none shrink-0 h-[38px]"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" strokeWidth={3} /> : <Copy size={14} />}
                    {copied ? '¡Copiado!' : 'Copiar Enlace'}
                  </button>
                </div>
              </Card>

              {/* Referred Colleagues Table / List */}
              <Card className="p-6 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-none space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-extrabold text-base text-[#1B1B1B] dark:text-white">
                      Docentes Invitados ({referrals.length})
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold mt-0.5">
                      Lista de colegas que se han unido a Planix a través de tu recomendación.
                    </p>
                  </div>
                  {proCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      <Crown size={13} className="text-amber-500 fill-amber-500" />
                      {proCount} {proCount === 1 ? 'PRO' : 'PROs'}
                    </span>
                  )}
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
                          <th className="pb-3 pr-4">Plan Actual</th>
                          <th className="pb-3 pr-4">Centro Educativo</th>
                          <th className="pb-3 pr-4">Nivel</th>
                          <th className="pb-3">Unido el</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100/50 dark:divide-zinc-800/40 text-xs">
                        {referrals.map((colleague) => {
                          const isPro = colleague.subscription_tier?.toLowerCase() === 'pro';

                          return (
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
                              <td className="py-3.5 pr-4 text-left">
                                {isPro ? (
                                  <div className="flex flex-col items-start gap-1">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-2xs">
                                      <Crown size={13} className="text-amber-500 fill-amber-500 shrink-0" />
                                      Planix PRO
                                    </span>
                                    {isCommissionEnabled && (
                                      <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/25">
                                        +RD$ {formatRD(commissionAmountPerPro)} ganado
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-500 dark:text-zinc-400 border border-neutral-200/60 dark:border-zinc-700/60">
                                    Plan Estándar
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 pr-4 text-left font-bold text-slate-600 dark:text-zinc-400">
                                <div className="flex items-center gap-1.5 truncate max-w-[180px]">
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Sidebar - Referral Statistics */}
            <div className="space-y-6">
              {/* Stats Card Compact & Professional */}
              <Card className="p-5 bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-3xl relative overflow-hidden transition-all duration-300 shadow-xs text-left space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#0046ab]/10 dark:bg-blue-950/40 text-[#0046ab] dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                      <TrendingUp className="h-4 w-4 text-[#0046ab] dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-850 dark:text-white leading-tight">
                        Rendimiento
                      </h3>
                      <p className="text-[10.5px] text-neutral-400 dark:text-zinc-500 font-bold leading-none mt-0.5">
                        Métricas de tus invitaciones
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    En vivo
                  </span>
                </div>

                {/* Grid 2x2 de Estadísticas Compactas */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Stat 1: Docentes Invitados */}
                  <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/50 rounded-2xl border border-slate-150 dark:border-zinc-800/70 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        Invitados
                      </span>
                      <Users size={14} className="text-slate-400 dark:text-zinc-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                        {referrals.length}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">docentes</span>
                    </div>
                  </div>

                  {/* Stat 2: Referidos PRO */}
                  <div className="p-3 bg-amber-500/10 dark:bg-amber-950/25 rounded-2xl border border-amber-500/25 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        Planix PRO
                      </span>
                      <Crown size={14} className="text-amber-500 fill-amber-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-amber-700 dark:text-amber-300 tracking-tight">
                        {proCount}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600/80 dark:text-amber-400/80">activos</span>
                    </div>
                  </div>

                  {/* Stat 3: Coins Ganadas */}
                  <div className={`p-3 bg-blue-500/5 dark:bg-blue-950/20 rounded-2xl border border-blue-500/20 flex flex-col justify-between ${!isCommissionEnabled ? 'col-span-2' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#0046ab] dark:text-blue-400 uppercase tracking-wider">
                        Coins Ganadas
                      </span>
                      <Coins size={14} className="text-[#0046ab] dark:text-blue-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <img 
                        src="/creditos.webp" 
                        alt="PC" 
                        className="w-5 h-5 object-contain shrink-0" 
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <span className="text-2xl font-black text-[#0046ab] dark:text-blue-400 tracking-tight">
                        {totalEarnedCredits}
                      </span>
                      <span className="text-[10px] font-black text-[#0046ab]/70 dark:text-blue-300">PC</span>
                    </div>
                  </div>

                  {/* Stat 4: Si Comisión en Dinero está activa */}
                  {isCommissionEnabled && (
                    <div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/25 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          Comisión RD$
                        </span>
                        <DollarSign size={14} className="text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                      </div>
                      <div className="mt-2">
                        <span className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight block">
                          RD$ {formatRD(totalEarnedCommissionRD)}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600/80 dark:text-emerald-400/80 block mt-0.5">
                          RD$ {formatRD(commissionAmountPerPro)} / PRO
                        </span>
                      </div>
                    </div>
                  )}
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
                    Se les otorgan sus Planix Coins de bienvenida y tú recibes tus PC al instante.
                  </li>
                  {isCommissionEnabled && (
                    <li className="text-emerald-700 dark:text-emerald-400 font-bold">
                      Cuando tu colega active Planix PRO, recibes automáticamente tu comisión de RD$ {commissionAmountPerPro.toLocaleString()} en tu balance.
                    </li>
                  )}
                </ul>
              </Card>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
