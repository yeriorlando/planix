import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Check,
    Sparkles,
    Zap,
    BrainCircuit,
    FileText,
    ArrowRight,
    Shield,
    Home,
    CreditCard,
    Landmark,
    X,
    ShieldCheck,
    Info,
    Clock,
    AlertCircle,
    ChevronRight,
    Copy
} from 'lucide-react';
import PlatformLogo from '../components/ui/PlatformLogo';
import { supabase } from '../lib/supabase';
import { getCurrentUser, saveUsuario } from '../lib/storage';
import { fetchProfile } from '../lib/services/auth';
import { requestD1 } from '../lib/services/d1Client';
import { toast } from 'sonner';

function BenefitItem({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-3">
            <div className="mt-1 w-5 h-5 rounded-full bg-brand-light dark:bg-brand-primary/10 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-brand-primary dark:text-brand-hover" />
            </div>
            <span className="text-text-muted text-sm">{children}</span>
        </li>
    );
}

export default function Suscripcion() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [checkingOut, setCheckingOut] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [modalStep, setModalStep] = useState<'select' | 'bank' | 'waiting_polar'>('select');
    
    const navigate = useNavigate();
    const user = getCurrentUser();

    useEffect(() => {
        async function loadPlans() {
            try {
                const data = await requestD1<any[]>('/api/plans');
                const proPlan = data?.find(p => p.id === 'pro');
                if (proPlan) {
                    proPlan.price = 3500;
                    proPlan.name = 'Suscripción Pro';
                    proPlan.description = 'Acceso ilimitado a todas las herramientas de planificación con Inteligencia Artificial.';
                    proPlan.features = [
                        '🚀 **Acceso TOTAL** a Todos los recursos (Inicial, Primaria, Secundaria)',
                        '⚡ **IA Generativa Avanzada** (Sin límites de creación)',
                        '💎 **Planificador con IA ilimitado**',
                        '🔄 **Registro de Calificaciones y Asistencia**',
                        '☀️ **Soporte Prioritario** (Vía WhatsApp y Correo)'
                    ];
                    proPlan.metadata = { ...proPlan.metadata, is_popular: true, badge_text: 'Recomendado' };
                    setPlans([proPlan]);
                } else {
                    throw new Error('Pro plan not found in database');
                }
            } catch (error) {
                console.error('Error loading plans, using local fallback:', error);
                setPlans([
                    {
                        id: 'pro',
                        name: 'Suscripción Pro',
                        price: 3500,
                        interval: 'monthly',
                        description: 'Acceso ilimitado a todas las herramientas de planificación con Inteligencia Artificial.',
                        features: [
                            '🚀 **Acceso TOTAL** a Todos los recursos (Inicial, Primaria, Secundaria)',
                            '⚡ **IA Generativa Avanzada** (Sin límites de creación)',
                            '💎 **Planificador con IA ilimitado**',
                            '🔄 **Registro de Calificaciones y Asistencia**',
                            '☀️ **Soporte Prioritario** (Vía WhatsApp y Correo)'
                        ],
                        metadata: { is_popular: true, badge_text: 'Recomendado' }
                    }
                ]);
            } finally {
                setLoadingPlans(false);
            }
        }
        loadPlans();
    }, []);

    // Effect to poll subscription status from D1 when waiting for Polar payment
    useEffect(() => {
        if (modalStep !== 'waiting_polar' || !user || !showPaymentModal) return;
        
        const intervalId = setInterval(async () => {
            try {
                const profile = await fetchProfile(user.id);
                if (profile && profile.suscripcion === 'pro') {
                    saveUsuario(profile);
                    toast.success('¡Suscripción Pro activada con éxito!');
                    clearInterval(intervalId);
                    setShowPaymentModal(false);
                    navigate('/suscripcion/exito?type=polar');
                }
            } catch (err) {
                console.error("Error polling profile subscription status:", err);
            }
        }, 3000);

        return () => clearInterval(intervalId);
    }, [modalStep, user, navigate, showPaymentModal]);

    // Manual check function for waiting screen
    const verifyPaymentImmediately = async () => {
        if (!user) return;
        const loadingToast = toast.loading('Verificando pago con Polar...');
        try {
            const profile = await fetchProfile(user.id);
            if (profile && profile.suscripcion === 'pro') {
                saveUsuario(profile);
                toast.success('¡Suscripción Pro activada con éxito!', { id: loadingToast });
                setShowPaymentModal(false);
                navigate('/suscripcion/exito?type=polar');
            } else {
                toast.error('El pago aún no ha sido confirmado. Por favor, asegúrate de completar el pago en Polar.', { id: loadingToast });
            }
        } catch (err) {
            console.error("Error manual verification of profile status:", err);
            toast.error('Error al verificar. Intenta de nuevo.', { id: loadingToast });
        }
    };

    const handlePlanSelect = (plan: any) => {
        if (!user) {
            toast.error('Debes iniciar sesión para suscribirte.');
            navigate(`/login?returnTo=${encodeURIComponent('/suscripcion')}`);
            return;
        }

        if (plan.id === 'free') {
            toast.info('Ya tienes el plan gratuito por defecto.');
            return;
        }

        setSelectedPlan(plan);
        setModalStep('select');
        setShowPaymentModal(true);
    };

    const handleCheckoutPolar = async () => {
        if (!selectedPlan || !user) return;
        setCheckingOut(selectedPlan.id);
        setModalStep('waiting_polar');

        let checkoutUrl = '';

        try {
            // Check for Next.js endpoint or custom API env (fallback to 3001 in dev)
            const apiBase = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');
            const response = await fetch(`${apiBase}/api/checkout/polar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: selectedPlan.metadata?.polar_product_id || import.meta.env.VITE_POLAR_PRODUCT_ID,
                    plan_id: selectedPlan.id,
                    user_id: user.id,
                    user_email: user.email
                })
            });

            let data: any = {};
            const text = await response.text();
            try {
                data = text ? JSON.parse(text) : {};
            } catch (parseErr) {
                console.error('Failed to parse checkout response text:', text);
                if (response.status === 404) {
                    throw new Error('El servidor de pagos (Next.js) no está corriendo o no se encuentra en el puerto esperado.');
                }
                throw new Error(`Error del servidor (${response.status}): respuesta no válida.`);
            }

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar el pago con tarjeta');
            }

            if (data.url) {
                checkoutUrl = data.url;
            } else {
                throw new Error('No se recibió la URL de pago desde Polar');
            }
        } catch (error: any) {
            console.warn('Backend checkout API failed/not running, trying direct Polar checkout link:', error);
            try {
                // Direct checkout fallback URL using Polar client-side pattern
                const baseUrl = "https://buy.polar.sh/polar_cl_oyQIPzYXQTmTZ1FyiYUvxv0J0Ow1tkAg4vkCH3COaPA";
                const urlWithMetadata = new URL(baseUrl);
                
                if (user?.id) {
                    urlWithMetadata.searchParams.append('checkout_metadata[user_id]', user.id);
                }
                urlWithMetadata.searchParams.append('checkout_metadata[plan_id]', selectedPlan.id);
                if (user?.email) {
                    urlWithMetadata.searchParams.append('customer_email', user.email);
                }

                checkoutUrl = urlWithMetadata.toString();
            } catch (fallbackErr) {
                console.error('Fallback checkout redirect error:', fallbackErr);
                toast.error('No se pudo iniciar el proceso de pago. Por favor, intenta de nuevo o selecciona transferencia.');
            }
        } finally {
            setCheckingOut(null);
            if (checkoutUrl) {
                window.open(checkoutUrl, '_blank');
                toast.info('Redirigiendo al portal de pago seguro en una nueva pestaña...');
            }
        }
    };

    const handleCheckoutBank = () => {
        if (!selectedPlan) return;
        setModalStep('bank');
    };

    const isPremiumPlan = (plan: any) => plan.interval === 'yearly' || plan.price > 400;

    if (loadingPlans) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-base">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-black/10 border-t-brand-primary"></div>
                    <span className="text-sm font-semibold text-text-muted">Cargando planes de suscripción...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-base selection:bg-brand-primary/10 selection:text-brand-primary pb-24 font-sans text-text-main">
            {/* Header */}
            <header className="sticky top-0 inset-x-0 h-20 bg-bg-base/80 backdrop-blur-md border-b border-black/5 z-40">
                <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
                    <Link to="/dashboard">
                        <PlatformLogo />
                    </Link>
                    <Link 
                        to="/dashboard" 
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B1B1B] text-white hover:opacity-90 dark:bg-white dark:text-black font-semibold text-xs transition-all duration-300 shadow-sm active:scale-95"
                    >
                        <Home className="w-4 h-4" />
                        <span>Volver a Inicio</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-16">
                {/* Hero */}
                <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
                    <span className="inline-block bg-brand-primary/10 text-brand-primary text-[11px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                        Membresía Premium
                    </span>
                    <h1 className="text-4xl md:text-[52px] font-semibold tracking-tight leading-[1.1] text-text-main">
                        Lleva tu planificación al <br />
                        <span className="text-brand-primary">Siguiente Nivel</span>
                    </h1>
                    <p className="text-base md:text-lg text-text-muted max-w-xl mx-auto font-medium">
                        Desbloquea el poder de la Inteligencia Artificial y herramientas exclusivas diseñadas para ahorrarte horas de trabajo cada semana.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="flex flex-wrap justify-center gap-8 mx-auto mb-24 max-w-5xl">
                    {plans.map((plan) => {
                        const isPopular = plan.metadata?.is_popular;
                        const badgeText = plan.metadata?.badge_text;
                        const highlight = isPopular || isPremiumPlan(plan);

                        return (
                            <div key={plan.id} className="w-full max-w-md md:w-[calc(50%-2rem)] flex-grow-0 flex-shrink-0 relative group">
                                <div className={`absolute -inset-0.5 bg-gradient-to-r ${highlight ? 'from-brand-primary to-brand-secondary opacity-20' : 'from-zinc-200 to-zinc-300 opacity-0'} rounded-[32px] blur-md group-hover:opacity-40 transition duration-1000`}></div>
                                
                                <div className={`relative h-full bg-white dark:bg-zinc-900 border-2 ${highlight ? 'border-brand-primary shadow-xl' : 'border-black/5'} p-8 rounded-[32px] flex flex-col transition-all duration-300 hover:shadow-2xl overflow-hidden`}>
                                    
                                    {badgeText && (
                                        <div className={`absolute top-0 right-0 ${highlight ? 'bg-brand-primary text-white' : 'bg-zinc-100 text-zinc-600'} text-[9px] font-black uppercase tracking-widest py-2 px-5 rounded-bl-2xl`}>
                                            {badgeText}
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-text-main mb-2">{plan.name}</h3>
                                        <p className="text-text-muted text-xs leading-relaxed font-medium">
                                            {plan.description || (plan.name.toLowerCase().includes('pro')
                                                ? 'Potencia tu práctica docente con IA avanzada y planeación 100% alineada al currículo dominicano.'
                                                : 'Plan estándar de Planix.')}
                                        </p>
                                    </div>

                                    <div className="flex flex-col mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-text-main tracking-tight">
                                                {plan.price === 0 ? 'Gratis' : `RD$ ${Number(plan.price).toLocaleString('en-US')}`}
                                            </span>
                                            {plan.price > 0 && (
                                                <span className="text-text-muted text-sm font-semibold">/ {plan.interval === 'monthly' ? 'mes' : 'año'}</span>
                                            )}
                                        </div>
                                        {plan.price > 0 && (
                                            <span className="text-text-muted text-[10px] font-bold mt-1 uppercase tracking-wider">
                                                ~ ${(plan.price / 59).toFixed(0)} USD aproximados
                                            </span>
                                        )}
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        {Array.isArray(plan.features) ? (
                                            plan.features.map((feature: string, idx: number) => (
                                                <BenefitItem key={idx}>
                                                    <span dangerouslySetInnerHTML={{ __html: feature.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                                </BenefitItem>
                                            ))
                                        ) : (
                                            <BenefitItem>Acceso Premium Completo</BenefitItem>
                                        )}
                                    </ul>

                                    <button
                                        onClick={() => handlePlanSelect(plan)}
                                        disabled={checkingOut === plan.id || (plan.id === 'free' && user?.suscripcion === 'free')}
                                        className={`w-full py-4 rounded-[20px] font-black text-[11px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed select-none ${
                                            plan.id === 'free' && user?.suscripcion === 'free'
                                                ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'
                                                : highlight 
                                                    ? 'bg-brand-primary hover:opacity-90 text-white shadow-md' 
                                                    : 'bg-[#1B1B1B] hover:opacity-90 text-white dark:bg-white dark:text-black shadow-sm'
                                        }`}
                                    >
                                        {checkingOut === plan.id ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : plan.id === 'pro' ? (
                                            <>Actualizar a Docente PRO <Sparkles className="w-4 h-4" /></>
                                        ) : plan.id === 'free' && user?.suscripcion === 'free' ? (
                                            'Tu plan actual'
                                        ) : plan.interval === 'yearly' ? (
                                            <>Activar Plan Anual <Sparkles className="w-4 h-4" /></>
                                        ) : (
                                            <>Seleccionar Plan <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>

                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Features Breakdown */}
                <div className="text-center mb-16">
                    <h2 className="text-2xl font-bold text-text-main tracking-tight">Potenciado por Inteligencia Artificial</h2>
                    <div className="h-1 w-16 bg-brand-primary mx-auto mt-3 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    {[
                        {
                            icon: BrainCircuit,
                            title: "Asistente Inteligente",
                            desc: "Dile adiós a la hoja en blanco. La IA te sugiere actividades didácticas innovadoras en segundos."
                        },
                        {
                            icon: Zap,
                            title: "Auto-completado",
                            desc: "Completa secuencias didácticas completas y planes diarios en cuestión de segundos."
                        },
                        {
                            icon: FileText,
                            title: "Rúbricas Listas",
                            desc: "Genera indicadores de logro, checklist y rúbricas de evaluación personalizadas."
                        },
                        {
                            icon: Shield,
                            title: "Respaldo Oficial",
                            desc: "Todo alineado 100% al currículo actualizado del MINERD de la República Dominicana."
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-black/5 hover:shadow-md transition-all text-center">
                            <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-[16px] flex items-center justify-center mx-auto mb-4">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-text-main text-sm mb-2">{feature.title}</h4>
                            <p className="text-text-muted text-xs leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto">
                    <h3 className="text-xl font-bold text-text-main text-center mb-8">Preguntas Frecuentes</h3>
                    <div className="space-y-4">
                        {[
                            {
                                q: "¿Cómo activo mi suscripción?",
                                a: "Puedes pagar instantáneamente con Tarjeta de Crédito/Débito vía Polar.sh (procesado por Stripe) o realizar una transferencia bancaria manual. Las activaciones por transferencia se validan en menos de 24 horas laborables."
                            },
                            {
                                q: "¿Los planes se renuevan automáticamente?",
                                a: "Sí, las suscripciones vía tarjeta se renuevan mensualmente de manera automática. Los pagos por transferencia bancaria requieren renovación manual. Puedes cancelar tu suscripción en cualquier momento desde tu perfil."
                            },
                            {
                                q: "¿Cuál es la política de reembolso?",
                                a: "Ofrecemos una garantía de satisfacción de 7 días. Si Planix no cumple con tus expectativas, puedes solicitar un reembolso completo durante tu primera semana de uso a través del chat de soporte."
                            }
                        ].map((faq, idx) => (
                            <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-black/5">
                                <h4 className="font-bold text-text-main text-sm mb-2">{faq.q}</h4>
                                <p className="text-text-muted text-xs leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Custom overlay modal for selecting checkout method */}
            {showPaymentModal && selectedPlan && (
                <div 
                    onClick={() => {
                        // Prevent closing by accident if we are in the middle of a transaction
                        if (modalStep !== 'waiting_polar') {
                            setShowPaymentModal(false);
                        }
                    }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer animate-in fade-in duration-200"
                >
                    {modalStep === 'select' && (
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] max-w-[400px] w-full shadow-2xl relative cursor-default overflow-hidden animate-in zoom-in-95 duration-200"
                        >
                            {/* Red Header Block */}
                            <div className="bg-[#B31A38] p-6 text-white relative overflow-hidden">
                                <CreditCard className="absolute -right-4 -bottom-4 h-32 w-32 text-white opacity-[0.08] rotate-12 pointer-events-none" />
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowPaymentModal(false)}
                                        className="absolute top-0 right-0 text-white/80 hover:text-white transition-colors cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                                        PASARELA DE PAGO SEGURA
                                    </div>
                                    <h2 className="text-2xl font-black leading-tight">Suscripción Pro</h2>
                                    <div className="mt-4 flex items-baseline gap-1">
                                        <span className="text-3xl font-black">RD$ 800.00</span>
                                        <span className="text-xs opacity-80">/mes (~$14 USD)</span>
                                    </div>
                                </div>
                            </div>

                            {/* White Body Block */}
                            <div className="p-6 space-y-4">
                                {/* CARD BUTTON */}
                                <button 
                                    onClick={handleCheckoutPolar}
                                    className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-[#B31A38] dark:border-zinc-800 dark:hover:border-[#B31A38] bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all text-left group relative overflow-hidden shadow-sm active:scale-98"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-[#B31A38] flex items-center justify-center text-white shadow-lg shadow-red-900/10 group-hover:scale-105 transition-transform duration-300">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-extrabold text-base text-slate-800 dark:text-white mb-0.5">Pago con Tarjeta</div>
                                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wide">DÉBITO O CRÉDITO VÍA POLAR.SH</div>
                                    </div>
                                    <div className="h-6 w-6 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0">
                                        <ChevronRight className="h-3.5 w-3.5 text-[#B31A38]" />
                                    </div>
                                </button>

                                {/* TRANSFER BUTTON */}
                                <button 
                                    onClick={handleCheckoutBank}
                                    className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-[#B31A38] dark:border-zinc-800 dark:hover:border-[#B31A38] bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all text-left group relative overflow-hidden shadow-sm active:scale-98"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-md shadow-blue-500/5 group-hover:scale-105 transition-transform duration-300">
                                        <Landmark className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-extrabold text-base text-slate-800 dark:text-white mb-0.5">Transferencia</div>
                                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wide">PAGO DIRECTO A CUENTA LOCAL</div>
                                    </div>
                                    <div className="h-6 w-6 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0">
                                        <ChevronRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </button>

                                {/* Footer Policy */}
                                <p className="text-center text-[9px] text-slate-400 dark:text-zinc-500 px-2 pt-2 leading-relaxed">
                                    Al suscribirte aceptas nuestros <a href="/terminos" className="underline hover:text-[#B31A38]">Términos de Servicio</a> y <a href="/privacidad" className="underline hover:text-[#B31A38]">Políticas de Privacidad</a>. Los cargos se realizarán mensualmente de forma automática.
                                </p>
                            </div>
                        </div>
                    )}

                    {modalStep === 'bank' && (
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-[420px] w-full shadow-2xl relative cursor-default text-center animate-in zoom-in-95 duration-200"
                        >
                            <button 
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Pink circle Landmark Icon */}
                            <div className="w-12 h-12 bg-pink-50 dark:bg-pink-950/20 text-pink-500 dark:text-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-100 dark:border-pink-900/30 shadow-sm shadow-pink-50/20">
                                <Landmark className="w-6 h-6" />
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Datos Bancarios</h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-6 max-w-xs mx-auto">
                                Realiza la transferencia y envíanos el comprobante por WhatsApp para activar tu plan de inmediato.
                            </p>

                            {/* Bank details card shape */}
                            <div className="bg-[#F4F7FC] dark:bg-zinc-850 rounded-[24px] p-5 space-y-4 border border-slate-100 dark:border-zinc-800/80 relative overflow-hidden text-left shadow-sm">
                                <Landmark className="absolute top-1/2 right-2 h-20 w-20 text-slate-300/10 dark:text-zinc-700/10 -translate-y-1/2 pointer-events-none" />
                                
                                <div className="space-y-0.5 relative">
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">INSTITUCIÓN BANCARIA</div>
                                    <div className="font-extrabold text-base text-slate-800 dark:text-white flex items-center justify-between">
                                        <span>Banreservas</span>
                                        <button 
                                            onClick={() => { navigator.clipboard.writeText("Banreservas"); toast.success("Nombre de banco copiado"); }}
                                            className="h-8 w-8 rounded-lg hover:bg-slate-200/50 dark:hover:bg-zinc-850 flex items-center justify-center text-slate-500"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-0.5 relative">
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">NÚMERO DE CUENTA</div>
                                    <div className="font-extrabold text-2xl text-[#D31B32] flex items-center justify-between tracking-tight">
                                        <span>9603709733</span>
                                        <button 
                                            onClick={() => { navigator.clipboard.writeText("9603709733"); toast.success("Número de cuenta copiado"); }}
                                            className="h-8 w-8 rounded-lg hover:bg-slate-200/50 dark:hover:bg-zinc-850 flex items-center justify-center text-slate-500"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 relative">
                                    <div className="space-y-0.5">
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">TIPO</div>
                                        <div className="font-extrabold text-slate-800 dark:text-white text-xs">Ahorro</div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">RNC / CÉDULA</div>
                                        <div className="font-extrabold text-slate-800 dark:text-white text-xs">402-1275240-2</div>
                                    </div>
                                </div>

                                <div className="space-y-0.5 border-t border-slate-200/50 dark:border-zinc-800 pt-3 relative">
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">TITULAR DE LA CUENTA</div>
                                    <div className="font-extrabold text-slate-800 dark:text-white text-xs uppercase">YERI ORLANDO DE LA CRUZ NIEVES</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid gap-2.5 mt-6">
                                <button 
                                    onClick={() => {
                                        const text = encodeURIComponent(`Hola Yeri, acabo de realizar la transferencia para la Suscripción Pro (usuario: ${user?.nombre || ''}, email: ${user?.email || ''}). Aquí envío el comprobante.`);
                                        window.open(`https://wa.me/18299416546?text=${text}`, "_blank");
                                    }}
                                    className="w-full py-4 bg-[#60D176] hover:bg-[#4fbf64] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.449 5.421 1.45 5.511 0 9.993-4.484 9.996-9.998.002-2.671-1.037-5.182-2.927-7.072C17.247 1.644 14.736.604 12.01.604c-5.517 0-10.002 4.482-10.006 9.995-.001 1.932.501 3.82 1.457 5.432l-.955 3.486 3.57-.936c1.625.887 3.447 1.356 5.281 1.358zm12.385-7.142c-.328-.164-1.94-.959-2.242-1.07-.301-.11-.52-.164-.738.164-.219.329-.848 1.07-1.039 1.29-.19.219-.382.246-.71.082-.328-.164-1.386-.511-2.641-1.63-1.03-.919-1.688-2.054-1.89-2.382-.202-.329-.022-.507.142-.671.148-.147.328-.383.493-.575.164-.19.219-.329.328-.548.11-.219.055-.411-.027-.575-.083-.164-.738-1.78-.999-2.41-.26-.63-.52-.547-.715-.557-.19-.01-.41-.01-.628-.01-.219 0-.575.083-.876.411-.301.329-1.15 1.123-1.15 2.738 0 1.616 1.177 3.177 1.341 3.396.164.219 2.316 3.536 5.61 4.956.783.338 1.395.539 1.872.69.787.25 1.5.215 2.066.13.63-.095 1.94-.794 2.215-1.56.275-.767.275-1.423.192-1.56-.083-.137-.301-.219-.63-.383z"/>
                                    </svg>
                                    <span>ENVIAR COMPROBANTE</span>
                                </button>
                                <button 
                                    onClick={() => setModalStep('select')}
                                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Volver
                                </button>
                            </div>
                        </div>
                    )}

                    {modalStep === 'waiting_polar' && (
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-[400px] w-full shadow-2xl relative cursor-default text-center animate-in zoom-in-95 duration-200"
                        >
                            {/* Blue alert box (Image 3 style) */}
                            <div className="bg-[#EBF3FE] border border-[#BFDBFE] text-[#1E40AF] px-5 py-4 rounded-[20px] flex items-start gap-3 text-left mb-6 shadow-sm">
                                <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5 animate-bounce" />
                                <div>
                                    <h4 className="font-bold text-sm text-[#1E3A8A]">Esperando confirmación de pago...</h4>
                                    <p className="text-[11px] text-[#2563EB] mt-1 font-semibold leading-relaxed">
                                        Una vez completado el pago en Polar, tu plan se activará automáticamente.
                                    </p>
                                </div>
                            </div>

                            {/* Loading spinner */}
                            <div className="space-y-4 py-6">
                                <div className="w-12 h-12 border-4 border-[#B31A38]/30 border-t-[#B31A38] rounded-full animate-spin mx-auto shadow-sm"></div>
                                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-widest animate-pulse">
                                    Verificando transacción...
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 mt-4">
                                <button 
                                    onClick={verifyPaymentImmediately}
                                    className="w-full py-3.5 bg-[#B31A38] hover:bg-[#991630] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
                                >
                                    Verificar Estado Ahora
                                </button>
                                <button 
                                    onClick={() => setModalStep('select')}
                                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Volver a opciones
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
