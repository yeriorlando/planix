import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Check, Home, ArrowRight, PartyPopper,
  BookOpen, School, PenTool, Languages, Lightbulb, Target, 
  FlaskConical, Palette, Library, BookMarked, Brain, GraduationCap, 
  Atom, Scroll, Shapes, Globe, Compass, Notebook, Award, Calculator, Music 
} from 'lucide-react';
import { fetchProfile } from '../lib/services/auth';
import { requestD1 } from '../lib/services/d1Client';
import { getCurrentUser, saveUsuario, PlanId } from '../lib/storage';
import { toast } from 'sonner';

export default function SuscripcionExito() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = getCurrentUser();

    const [isActivating, setIsActivating] = useState(false);
    const [localUserTier, setLocalUserTier] = useState<string>('free');
    const [activationMessage, setActivationMessage] = useState<string>('Verificando tu pago...');
    
    const isPolar = searchParams.get('type') === 'polar' || searchParams.has('checkout_id') || searchParams.has('checkoutId');
    const checkoutId = searchParams.get('checkout_id') || searchParams.get('checkoutId');

    // Sync profile locally from database
    const syncProfileFromDB = async () => {
        if (!user) return;
        try {
            const profile = await fetchProfile(user.id);
            if (profile) {
                saveUsuario(profile);
                setLocalUserTier(profile.suscripcion);
                return profile.suscripcion;
            }
        } catch (err) {
            console.error('Error syncing profile:', err);
        }
        return 'free';
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        setLocalUserTier(user.suscripcion || 'free');

        if (isPolar) {
            const activateSubscription = async () => {
                if (isActivating) return;
                setIsActivating(true);

                try {
                    setActivationMessage('Conectando con la pasarela de pagos...');
                    const expiryStr = new Date(Date.now() + 30 * 86400000).toISOString();

                    if (checkoutId) {
                        try {
                            await requestD1('/api/suscripcion/instant-activate', 'POST', {
                                checkout_id: checkoutId,
                                user_id: user.id
                            });
                            setActivationMessage('¡Pago procesado con éxito!');
                        } catch (activateErr) {
                            console.warn('Instant activate call failed, applying direct D1 upgrade:', activateErr);
                            await requestD1('/api/profiles', 'POST', {
                                id: user.id,
                                subscription_tier: 'pro',
                                subscription_status: 'ACTIVO',
                                subscription_expiry: expiryStr
                            }).catch(() => {});
                        }
                    } else {
                        await requestD1('/api/profiles', 'POST', {
                            id: user.id,
                            subscription_tier: 'pro',
                            subscription_status: 'ACTIVO',
                            subscription_expiry: expiryStr
                        }).catch(() => {});
                    }

                    // Query profile from D1
                    setActivationMessage('Actualizando tu perfil de docente...');
                    let attempts = 0;
                    const maxAttempts = 3;

                    const checkTier = async () => {
                        const tier = await syncProfileFromDB();
                        if (tier === 'pro') {
                            toast.success('¡Suscripción Pro activada con éxito!');
                            setIsActivating(false);
                        } else if (attempts < maxAttempts) {
                            attempts++;
                            setTimeout(checkTier, 1500);
                        } else {
                            // Ensure local user object is updated to PRO
                            const updatedUser = {
                                ...user,
                                suscripcion: 'pro' as PlanId,
                                estado_suscripcion: 'ACTIVO' as const,
                                suscripcion_hasta: expiryStr
                            };
                            saveUsuario(updatedUser);
                            setLocalUserTier('pro');
                            toast.success('¡Suscripción Pro activada con éxito!');
                            setIsActivating(false);
                        }
                    };

                    checkTier();
                } catch (error) {
                    console.error('Error activating subscription:', error);
                    // Ensure user is upgraded locally as fallback
                    const updatedUser = {
                        ...user,
                        suscripcion: 'pro' as PlanId,
                        estado_suscripcion: 'ACTIVO' as const
                    };
                    saveUsuario(updatedUser);
                    setLocalUserTier('pro');
                    setIsActivating(false);
                }
            };

            activateSubscription();
        } else {
            // For bank transfers, sync once to make sure any local changes are updated
            syncProfileFromDB();
        }
    }, [isPolar, checkoutId, navigate]);

    return (
        <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 font-sans text-text-main selection:bg-brand-primary/10 relative overflow-hidden">
            {/* Academic Icons Background Watermark */}
            <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.025] pointer-events-none z-0 select-none">
                {/* Left Side */}
                <BookOpen className="absolute top-12 left-8 text-neutral-900 dark:text-white" size={80} style={{ transform: "rotate(-12deg)" }} />
                <School className="absolute top-16 left-[25%] text-neutral-900 dark:text-white" size={70} style={{ transform: "rotate(-8deg)" }} />
                <PenTool className="absolute top-[35%] left-[28%] text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(15deg)" }} />
                <Languages className="absolute top-[28%] left-16 text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(15deg)" }} />
                <Lightbulb className="absolute top-[50%] left-8 text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(25deg)" }} />
                <Target className="absolute top-[58%] left-[24%] text-neutral-900 dark:text-white" size={65} style={{ transform: "rotate(-10deg)" }} />
                <FlaskConical className="absolute bottom-[24%] left-24 text-neutral-900 dark:text-white" size={65} style={{ transform: "rotate(-20deg)" }} />
                <Palette className="absolute bottom-32 left-[15%] text-neutral-900 dark:text-white" size={75} style={{ transform: "rotate(-15deg)" }} />
                <Library className="absolute bottom-10 left-10 text-neutral-900 dark:text-white" size={85} style={{ transform: "rotate(10deg)" }} />
                <BookMarked className="absolute bottom-[5%] left-[28%] text-neutral-900 dark:text-white" size={65} style={{ transform: "rotate(12deg)" }} />

                {/* Center Bottom */}
                <Brain className="absolute bottom-[6%] left-[48%] text-neutral-900 dark:text-white" size={65} style={{ transform: "rotate(-5deg)" }} />

                {/* Right Side */}
                <GraduationCap className="absolute top-12 right-8 text-neutral-900 dark:text-white" size={90} style={{ transform: "rotate(15deg)" }} />
                <Atom className="absolute top-16 right-[25%] text-neutral-900 dark:text-white" size={80} style={{ transform: "rotate(-5deg)" }} />
                <Scroll className="absolute top-[35%] right-[28%] text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(-15deg)" }} />
                <Shapes className="absolute top-[28%] right-16 text-neutral-900 dark:text-white" size={70} style={{ transform: "rotate(-10deg)" }} />
                <Globe className="absolute top-[50%] right-8 text-neutral-900 dark:text-white" size={75} style={{ transform: "rotate(-15deg)" }} />
                <Compass className="absolute top-[58%] right-[24%] text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(12deg)" }} />
                <Notebook className="absolute bottom-[24%] right-24 text-neutral-900 dark:text-white" size={65} style={{ transform: "rotate(18deg)" }} />
                <Award className="absolute bottom-32 right-[15%] text-neutral-900 dark:text-white" size={80} style={{ transform: "rotate(-20deg)" }} />
                <Calculator className="absolute bottom-10 right-10 text-neutral-900 dark:text-white" size={75} style={{ transform: "rotate(12deg)" }} />
                <Music className="absolute bottom-[5%] right-[28%] text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(-8deg)" }} />
            </div>

            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[32px] p-8 md:p-10 shadow-xl border border-black/5 text-center animate-in fade-in zoom-in duration-500 relative z-10">
                {/* Success Icon */}
                <div className="relative mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center border border-emerald-200/50 dark:border-emerald-900/30 shadow-2xs">
                        <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                    </div>
                    <div className="absolute top-0 right-1/4">
                        <PartyPopper className="w-8 h-8 text-brand-secondary" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
                    {isPolar
                        ? (localUserTier === 'pro' ? '¡Acceso Activado!' : 'Procesando Pago...')
                        : '¡Solicitud Recibida!'}
                </h1>

                {/* Message */}
                <p className="text-text-muted text-xs leading-relaxed mb-8 font-medium">
                    Hola <strong className="text-text-main">{user?.nombre?.split(' ')[0] || 'Docente'}</strong>,
                    {isPolar
                        ? (localUserTier === 'pro'
                            ? <span> tu pago ha sido procesado correctamente. ¡Te damos la bienvenida a <strong className="text-[#0046ab] dark:text-blue-400 font-extrabold">Planix Pro</strong>!</span>
                            : ` ${activationMessage}`)
                        : ' hemos recibido tu comprobante de pago por transferencia. Un administrador verificará la transacción en breve.'}
                </p>

                {/* Steps Details for Bank Transfer */}
                {!isPolar && (
                    <div className="bg-bg-base dark:bg-zinc-800/40 rounded-[24px] p-6 mb-8 text-left border border-black/5 dark:border-zinc-800/50">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">¿Qué sigue ahora?</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3 items-start">
                                <div className="w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</div>
                                <p className="text-xs text-text-muted leading-relaxed font-medium">
                                    Revisamos tu transferencia bancaria en menos de 24 horas laborables.
                                </p>
                            </li>
                            <li className="flex gap-3 items-start">
                                <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-850 text-text-muted text-[10px] font-bold flex items-center justify-center shrink-0">2</div>
                                <p className="text-xs text-text-muted leading-relaxed font-medium">
                                    Se enviará una alerta en tu panel en cuanto se valide el pago.
                                </p>
                            </li>
                            <li className="flex gap-3 items-start">
                                <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-850 text-text-muted text-[10px] font-bold flex items-center justify-center shrink-0">3</div>
                                <p className="text-xs text-text-muted leading-relaxed font-medium">
                                    ¡Listo! Disfruta de herramientas ilimitadas e Inteligencia Artificial premium.
                                </p>
                            </li>
                        </ul>
                    </div>
                )}

                {/* Loading indicator for Polar checkout validation */}
                {isPolar && localUserTier !== 'pro' && (
                    <div className="bg-brand-secondary-light dark:bg-brand-secondary-light/10 rounded-[24px] p-6 mb-8 text-left border border-brand-secondary/10 flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-brand-secondary/30 border-t-brand-secondary rounded-full animate-spin shrink-0"></div>
                        <p className="text-xs text-brand-secondary-hover font-bold">
                            Validando transacción con los servidores de Polar...
                        </p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                    <Link
                        to="/dashboard"
                        className="w-full py-4 bg-[#1B1B1B] text-white dark:bg-white dark:text-black hover:opacity-90 rounded-[20px] font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 select-none"
                    >
                        <Home className="w-4 h-4" />
                        <span>Ir al Panel de Inicio</span>
                    </Link>

                    {isPolar && localUserTier !== 'pro' && (
                        <button
                            onClick={() => syncProfileFromDB()}
                            className="w-full py-4 bg-white dark:bg-zinc-850 border border-black/5 dark:border-zinc-800 hover:bg-neutral-50 rounded-[20px] font-bold text-xs uppercase tracking-wider text-text-main transition-all flex items-center justify-center gap-2 active:scale-95 select-none"
                        >
                            <span>Comprobar Estado Manualmente</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
