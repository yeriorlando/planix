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
    X
} from 'lucide-react';
import PlatformLogo from '../components/ui/PlatformLogo';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/storage';
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

export default function SubscriptionPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [checkingOut, setCheckingOut] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    
    const navigate = useNavigate();
    const user = getCurrentUser();

    useEffect(() => {
        async function loadPlans() {
            try {
                const { data, error } = await supabase
                    .from('plans')
                    .select('*')
                    .eq('is_active', true)
                    .order('price');

                if (error) throw error;
                setPlans(data || []);
            } catch (error) {
                console.error('Error loading plans, using local fallback:', error);
                // Fallback locally
                setPlans([
                    {
                        id: 'free',
                        name: 'Plan Gratuito',
                        price: 0,
                        interval: 'monthly',
                        description: 'Plan básico para planificar tus clases y llevar el control diario.',
                        features: ['2 Aulas virtuales', 'Planificador con IA limitado', 'Comunidad de Docentes'],
                        metadata: { badge_text: 'Básico' }
                    },
                    {
                        id: 'pro',
                        name: 'Plan Docente Pro',
                        price: 490,
                        interval: 'monthly',
                        description: 'Acceso total al poder de la Inteligencia Artificial y herramientas exclusivas para el MINERD.',
                        features: [
                            '📚 **Acceso Ilimitado** a recursos alineados al MINERD',
                            '🧠 **Generador con IA Ilimitada** (Actividades, Rúbricas y Exámenes)',
                            '✨ **Funciones Pro Exclusivas** y acceso anticipado',
                            '🔄 **Versatilidad Multigrado** y cambio de nivel incluido',
                            '⚡ **Atención Prioritaria** para resolver dudas rápido'
                        ],
                        metadata: { is_popular: true, badge_text: 'Más Popular' }
                    }
                ]);
            } finally {
                setLoadingPlans(false);
            }
        }
        loadPlans();
    }, []);

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
        setShowPaymentModal(true);
    };

    const handleCheckoutPolar = async () => {
        if (!selectedPlan || !user) return;
        setCheckingOut(selectedPlan.id);
        setShowPaymentModal(false);

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
                    throw new Error('El servidor de pagos (Next.js) no está corriendo o no se encuentra en el puerto esperado. Asegúrate de encender el servidor backend.');
                }
                throw new Error(`Error del servidor (${response.status}): respuesta no válida.`);
            }

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar el pago con tarjeta');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No se recibió la URL de pago desde Polar');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Error al iniciar el proceso de pago con tarjeta');
        } finally {
            setCheckingOut(null);
        }
    };

    const handleCheckoutBank = () => {
        if (!selectedPlan) return;
        setShowPaymentModal(false);
        navigate(`/suscripcion/pago?plan_id=${selectedPlan.id}`);
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
                    onClick={() => setShowPaymentModal(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer animate-in fade-in duration-200"
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-8 max-w-md w-full shadow-2xl relative cursor-default text-center animate-in zoom-in-95 duration-200"
                    >
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute right-5 top-5 w-8 h-8 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5 text-text-muted" />
                        </button>

                        <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-[16px] flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>

                        <h3 className="text-lg font-black text-text-main mb-2">Método de Pago</h3>
                        <p className="text-text-muted text-xs leading-relaxed mb-6">
                            Elige cómo deseas activar tu suscripción Premium para el plan <strong className="text-text-main">{selectedPlan.name}</strong> (RD$ {Number(selectedPlan.price).toLocaleString('en-US')}/mes):
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCheckoutPolar}
                                className="flex items-center justify-between gap-3 w-full p-4 bg-[#1B1B1B] dark:bg-white text-white dark:text-black hover:opacity-90 rounded-[20px] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-98 text-left shadow-md select-none"
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5" />
                                    <span>Pagar con Tarjeta (Polar/Stripe)</span>
                                </div>
                                <span className="bg-brand-primary text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest shrink-0">
                                    Inmediato
                                </span>
                            </button>

                            <button
                                onClick={handleCheckoutBank}
                                className="flex items-center gap-3 w-full p-4 bg-white dark:bg-zinc-850 hover:bg-neutral-50 dark:hover:bg-zinc-800 border border-black/5 dark:border-zinc-800 rounded-[20px] font-bold text-xs uppercase tracking-wider text-text-main transition-all cursor-pointer active:scale-98 text-left select-none"
                            >
                                <Landmark className="w-5 h-5 text-brand-primary" />
                                <span>Transferencia Bancaria (Manual)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
