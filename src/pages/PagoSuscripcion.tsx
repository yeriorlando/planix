import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, CreditCard, Landmark, CheckCircle2, ChevronRight, Info, AlertCircle, Home, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/storage';
import { toast } from 'sonner';
import { requestD1 } from '../lib/services/d1Client';

const LABELS: Record<string, string> = {
    banco: 'BANCO',
    titular: 'TITULAR',
    tipo_cuenta: 'TIPO DE CUENTA',
    numero_cuenta: 'NÚMERO DE CUENTA',
    cedula_rnc: 'CÉDULA/RNC',
    cedula: 'CÉDULA/RNC',
    rnc: 'RNC'
};

async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const newFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    } else {
                        reject(new Error('Compression failed'));
                    }
                }, 'image/jpeg', 0.7); // 70% quality
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}

export default function PagoSuscripcion() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = getCurrentUser();
    const hasInitialized = useRef(false);

    const [selectedPlanId, setSelectedPlanId] = useState<string>('pro');
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    
    // Bank details loading state
    const [bankDetails, setBankDetails] = useState<Record<string, string>>({
        banco: 'Banreservas',
        titular: 'YERI ORLANDO DE LA CRUZ NIEVES',
        tipo_cuenta: 'Ahorro',
        numero_cuenta: '9603709733',
        cedula_rnc: '402-1275240-2'
    });

    const [plans, setPlans] = useState<any[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);

    useEffect(() => {
        if (!user) {
            toast.error('Debes iniciar sesión para acceder al pago.');
            navigate('/login?returnTo=/suscripcion/pago');
            return;
        }

        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const urlPlanId = searchParams.get('plan_id');
        if (urlPlanId) {
            setSelectedPlanId(urlPlanId);
            setStep(2); // Skip plan select if already passed from /suscripcion
        }

        async function loadData() {
            try {
                // Fetch site configs for payment details if exists
                try {
                    const configData = await requestD1<any>('/api/site-configs/payment_details');
                    if (configData?.value) {
                        setBankDetails(configData.value);
                    }
                } catch (configErr) {
                    console.warn("Could not load payment details from D1, using local defaults:", configErr);
                }

                // Fetch plans from D1 database
                const plansData = await requestD1<any[]>('/api/plans');
                const filteredPlans = (plansData || []).filter(p => p.id !== 'free');
                
                // Map interval/price to expected structure if needed
                const mappedPlans = filteredPlans.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    interval: p.interval,
                    description: p.description,
                    features: p.id === 'premium' ? [
                        '👑 **Acceso Total Multigrado** (Inicial, Primaria, Secundaria)',
                        '⚡ **IA Generativa Avanzada** (Ilimitada)',
                        '🌟 **Soporte Prioritario** (WhatsApp y Asistencia Directa)',
                        '📈 **Reportes de Calificaciones** (Periodos oficiales P1-P4)',
                        '🎁 **Recursos Didácticos Exclusivos** y Rúbricas Inteligentes'
                    ] : [
                        '🚀 **Acceso TOTAL** a Todos los recursos (Primaria)',
                        '⚡ **IA Generativa Avanzada** (Sin límites de creación)',
                        '💎 **Prioridad de Actualizaciones** (Nuevas asignaturas antes)',
                        '🔄 **Cambio Flexible de Nivel** (Gestión multidisciplinaria)',
                        '☀️ **Soporte Estándar** (Vía Ticket/Email)'
                    ],
                    metadata: p.id === 'premium' ? { badge_text: 'Mejor Valor' } : { badge_text: 'Más Popular' }
                }));

                setPlans(mappedPlans);

                if (!urlPlanId && mappedPlans.length > 0) {
                    setSelectedPlanId(mappedPlans[0].id);
                }
            } catch (error) {
                console.error('Error loading checkout data, using defaults:', error);
                setPlans([
                    {
                        id: 'pro',
                        name: 'Planix Pro',
                        price: 800,
                        interval: 'monthly',
                        description: 'Ideal para docentes que trabajen un único grado escolar.',
                        features: [
                            '🚀 **Acceso TOTAL** a Todos los recursos (Primaria)',
                            '⚡ **IA Generativa Avanzada** (Sin límites de creación)',
                            '💎 **Prioridad de Actualizaciones** (Nuevas asignaturas antes)',
                            '🔄 **Cambio Flexible de Nivel** (Gestión multidisciplinaria)',
                            '☀️ **Soporte Estándar** (Vía Ticket/Email)'
                        ],
                        metadata: { badge_text: 'Más Popular' }
                    }
                ]);
                setSelectedPlanId('pro');
            } finally {
                setIsLoadingPlans(false);
            }
        }
        loadData();
    }, [user, navigate, searchParams]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setIsCompressing(true);
            try {
                const compressedFile = await compressImage(selectedFile);
                setFile(compressedFile);
                toast.success('Imagen optimizada y lista para subir');
            } catch (error) {
                console.error('Error compressing image:', error);
                setFile(selectedFile);
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const handleSubmit = async () => {
        if (!file || !user || !selectedPlanId) return;

        setIsUploading(true);
        try {
            // 1. Upload file to Storage
            const fileName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('payment_receipts')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: urlData } = supabase.storage
                .from('payment_receipts')
                .getPublicUrl(fileName);

            const selectedPlan = plans.find(p => p.id === selectedPlanId);

            // 3. Create Payment Request in Supabase
            const { error: dbError } = await supabase
                .from('payment_requests')
                .insert({
                    user_id: user.id,
                    plan_type: selectedPlan?.interval === 'yearly' ? 'yearly' : 'monthly',
                    plan_id: selectedPlanId,
                    amount: selectedPlan?.price || 490,
                    receipt_url: urlData.publicUrl,
                    status: 'pending'
                });

            if (dbError) throw dbError;

            // 4. Create local or admin notification if supported
            try {
                await supabase.from('notifications').insert({
                    user_id: user.id,
                    title: 'Pago en verificación 🔍',
                    message: 'Hemos recibido tu comprobante de pago bancario. Tu plan premium se activará una vez validemos la transacción (normalmente toma menos de 24 horas).',
                    read: false
                });
            } catch (notifErr) {
                console.warn('Could not insert notifications record in DB:', notifErr);
            }

            toast.success('Comprobante enviado con éxito');
            navigate('/suscripcion/exito?type=bank');
        } catch (error: any) {
            console.error('Error submitting payment:', error);
            toast.error(`Error al enviar comprobante: ${error.message || error}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-base pb-24 font-sans text-text-main selection:bg-brand-primary/10">
            {/* Header */}
            <header className="sticky top-0 inset-x-0 h-20 bg-bg-base/80 backdrop-blur-md border-b border-black/5 z-40">
                <div className="max-w-4xl mx-auto h-full px-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-brand-primary animate-pulse" />
                        <span>Pago por Transferencia</span>
                    </h1>
                    <button 
                        onClick={() => navigate('/suscripcion')} 
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-zinc-800 text-text-main border border-black/5 dark:border-zinc-800 hover:opacity-90 font-semibold text-xs transition-all duration-300 shadow-sm active:scale-95"
                    >
                        <X className="w-4 h-4" />
                        <span>Cancelar</span>
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 mt-12">
                {/* Stepper */}
                <div className="flex items-center justify-between mb-12 relative px-8 md:px-16">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/10 -z-10 -translate-y-1/2 mx-16 md:mx-24"></div>

                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                step >= s 
                                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                                    : 'bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 text-text-muted'
                            }`}>
                                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                            </div>
                            <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${step >= s ? 'text-brand-primary' : 'text-text-muted'}`}>
                                {s === 1 ? 'Plan' : s === 2 ? 'Detalles' : 'Comprobante'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Step 1: Choose Plan */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center max-w-md mx-auto mb-8">
                            <h2 className="text-xl font-bold text-text-main">Selecciona tu Plan Premium</h2>
                            <p className="text-text-muted text-xs mt-1">Elige el plan que deseas pagar vía transferencia bancaria.</p>
                        </div>

                        <div className={`grid grid-cols-1 ${plans.length > 1 ? 'md:grid-cols-2' : 'max-w-md mx-auto'} gap-6`}>
                            {isLoadingPlans ? (
                                <div className="col-span-full p-20 text-center text-text-muted bg-white dark:bg-zinc-900 rounded-[32px] border border-black/5">
                                    Cargando planes...
                                </div>
                            ) : plans.length === 0 ? (
                                <div className="col-span-full p-20 text-center text-text-muted bg-white dark:bg-zinc-900 rounded-[32px] border border-black/5">
                                    No hay planes de pago disponibles.
                                </div>
                            ) : (
                                plans.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedPlanId(p.id)}
                                        className={`p-8 rounded-[32px] border-2 cursor-pointer transition-all duration-300 flex flex-col relative overflow-hidden ${
                                            selectedPlanId === p.id 
                                                ? 'border-brand-primary bg-white dark:bg-zinc-900 shadow-lg' 
                                                : 'border-black/5 bg-white dark:bg-zinc-900 hover:border-black/10'
                                        }`}
                                    >
                                        {p.metadata?.badge_text && (
                                            <div className="absolute top-0 right-0 bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest py-2 px-4 rounded-bl-xl">
                                                {p.metadata.badge_text}
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-text-main">{p.name}</h3>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                selectedPlanId === p.id ? 'border-brand-primary bg-brand-primary' : 'border-zinc-300'
                                            }`}>
                                                {selectedPlanId === p.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-3xl font-black text-text-main">RD$ {Number(p.price).toLocaleString('en-US')}</span>
                                            <span className="text-text-muted text-xs">/{p.interval === 'yearly' ? 'año' : 'mes'}</span>
                                        </div>
                                        <p className="text-xs text-text-muted mb-6">{p.description}</p>
                                        
                                        {Array.isArray(p.features) && p.features.length > 0 && (
                                            <ul className="space-y-3 mb-6 border-t border-black/5 dark:border-white/5 pt-4 mt-auto">
                                                {p.features.map((feature: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2.5 text-left">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                        <span 
                                                            className="text-xs text-text-muted leading-relaxed font-medium"
                                                            dangerouslySetInnerHTML={{ __html: feature.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} 
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Bank Details */}
                {step === 2 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-black/5 p-8 md:p-10 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-light dark:bg-brand-primary/10 text-brand-primary rounded-[16px]">
                                <Landmark className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-text-main">Detalles de Transferencia</h3>
                                <p className="text-text-muted text-xs mt-0.5">Realiza tu depósito o transferencia electrónica</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(bankDetails).map(([key, value]: [string, any]) => (
                                <div key={key} className="p-4 bg-bg-base dark:bg-zinc-800/40 rounded-[20px] border border-black/5 dark:border-zinc-800/50">
                                    <p className="text-[9px] uppercase tracking-widest text-text-muted font-bold mb-1">
                                        {LABELS[key.toLowerCase()] || key.replace('_', ' ')}
                                    </p>
                                    <p className="text-text-main font-bold text-sm select-all">{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-brand-secondary-light dark:bg-brand-secondary-light/10 rounded-[20px] border border-brand-secondary/10 flex gap-3">
                            <AlertCircle className="text-brand-secondary shrink-0 w-5 h-5 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs text-brand-secondary-hover font-bold">Instrucciones</p>
                                <p className="text-xs text-brand-secondary-hover/90 leading-relaxed font-medium">
                                    Por favor transfiere el monto exacto del plan seleccionado. Asegúrate de tomar una captura de pantalla del comprobante de transferencia exitosa para poder validarla en el siguiente paso.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Receipt Upload */}
                {step === 3 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-black/5 p-8 md:p-10 shadow-sm text-center space-y-6">
                        <h3 className="text-lg font-bold text-text-main">Subir Comprobante de Pago</h3>
                        <p className="text-text-muted text-xs max-w-md mx-auto -mt-2">
                            Adjunta el comprobante para que podamos validar tu transferencia bancaria y activar tu cuenta Premium.
                        </p>

                        <div className={`border-2 border-dashed rounded-[32px] p-12 transition-all duration-300 group ${
                            file 
                                ? 'border-emerald-500 bg-emerald-50/20' 
                                : 'border-zinc-200 dark:border-zinc-800 hover:border-brand-primary hover:bg-brand-light/20'
                        }`}>
                            {isCompressing ? (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-brand-light text-brand-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <p className="font-bold text-brand-primary text-xs uppercase tracking-wider">Optimizando imagen...</p>
                                </div>
                            ) : file ? (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-emerald-650 text-sm max-w-xs mx-auto truncate">{file.name}</p>
                                        <p className="text-xs text-emerald-600">{(file.size / 1024).toFixed(1)} KB — Listo para enviar</p>
                                    </div>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-xs text-text-muted underline hover:text-text-main cursor-pointer"
                                    >
                                        Cambiar imagen
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer space-y-4 block">
                                    <div className="w-16 h-16 bg-bg-base dark:bg-zinc-800 text-text-muted rounded-full flex items-center justify-center mx-auto group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-text-main text-sm">Selecciona una captura o foto</p>
                                        <p className="text-xs text-text-muted">Formatos aceptados: PNG, JPG, JPEG</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 px-4 sm:px-0">
                    <button
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 1 || isUploading}
                        className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all select-none ${
                            step === 1 
                                ? 'opacity-0 pointer-events-none' 
                                : 'bg-white dark:bg-zinc-800 border border-black/5 dark:border-zinc-800 text-text-main hover:bg-neutral-50 active:scale-95 cursor-pointer'
                        }`}
                    >
                        Anterior
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            className="px-8 py-3 bg-[#1B1B1B] text-white dark:bg-white dark:text-black rounded-full font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer select-none"
                        >
                            <span>Continuar</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!file || isUploading}
                            className={`px-10 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 select-none cursor-pointer ${
                                !file || isUploading
                                    ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                            }`}
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <span>Enviar Comprobante</span>
                            )}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}
