import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, Sparkles, Printer, RefreshCw, Eye, LockKeyhole, AlertCircle, HelpCircle,
    BookText, Ruler, Globe, Leaf, Palette, Dumbbell, Heart, Languages, ChevronDown, Check, X, Crown,
    Search, Activity, Award
} from 'lucide-react';

const getEvaluationIcon = (type: string, className = "h-4 w-4") => {
    switch (type) {
        case 'Diagnóstica':
            return <Search className={className} />;
        case 'Formativa':
            return <Activity className={className} />;
        case 'Sumativa':
            return <Award className={className} />;
        default:
            return <Sparkles className={className} />;
    }
};
import { motion } from 'framer-motion';
import { getCurrentUser, Usuario } from '../lib/storage';
import { consumeCredits, hasEnoughCredits, getUserCredits, getCreditCosts } from '../lib/credits';
import ModalCreditos from '../components/ai/ModalCreditos';
import { generateExam } from '../lib/services/aiService';
import { toast } from 'sonner';
import { logActivity } from '../lib/activityLog';

// Tipos de Evaluación
const EVALUATION_TYPES = ['Diagnóstica', 'Formativa', 'Sumativa'];

// Iconos para cada asignatura
const SUBJECT_ICON_MAP: Record<string, React.ReactNode> = {
    'Lengua Española': <BookText className="h-4 w-4" />,
    'Matemáticas': <Ruler className="h-4 w-4" />,
    'Ciencias Sociales': <Globe className="h-4 w-4" />,
    'Ciencias de la Naturaleza': <Leaf className="h-4 w-4" />,
    'Educación Artística': <Palette className="h-4 w-4" />,
    'Educación Física': <Dumbbell className="h-4 w-4" />,
    'Formación H. Integral R.': <Heart className="h-4 w-4" />,
    'Lenguas Extranjeras (Inglés)': <Languages className="h-4 w-4" />,
};

const getSubjectIcon = (subjectName: string, size: string = "h-4 w-4") => {
    const icon = SUBJECT_ICON_MAP[subjectName];
    if (icon) return React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: size });
    return <BookText className={size} />;
};

// Asignaturas del Currículo Dominicano
const ASIGNATURAS = [
    'Lengua Española',
    'Matemáticas',
    'Ciencias Sociales',
    'Ciencias de la Naturaleza',
    'Educación Artística',
    'Educación Física',
    'Formación H. Integral R.',
    'Lenguas Extranjeras (Inglés)'
];

const SUBJECT_ID_TO_NAME: Record<string, string> = {
    // Primaria
    'lengua-espanola': 'Lengua Española',
    'matematica': 'Matemáticas',
    'sociales': 'Ciencias Sociales',
    'naturales': 'Ciencias de la Naturaleza',
    'educacion-artistica': 'Educación Artística',
    'educacion-fisica': 'Educación Física',
    'formacion-humana': 'Formación H. Integral R.',
    
    // Secundaria
    'lengua-espanola-sec': 'Lengua Española',
    'matematica-sec': 'Matemáticas',
    'sociales-sec': 'Ciencias Sociales',
    'naturales-sec': 'Ciencias de la Naturaleza',
    'ingles': 'Lenguas Extranjeras (Inglés)',
    'educacion-artistica-sec': 'Educación Artística',
    'educacion-fisica-sec': 'Educación Física',
    'formacion-humana-sec': 'Formación H. Integral R.',
};

// Tipos de Ítems Disponibles
const ITEM_TYPES = [
    'Verdadero / Falso',
    'Selección Múltiple',
    'Completa / Rellena',
    'Relaciona / Empareja',
    'Respuesta Corta',
    'Producción / Desarrollo',
    'Metacognición'
];

interface Question {
    id: number;
    tipo: string;
    enunciado: string;
    opciones?: string[];
    pares?: { columnaA: string, columnaB: string }[];
    respuestaCorrecta: string;
}

export default function GeneradorExamenes() {
    const [user, setUser] = useState<Usuario | null>(() => getCurrentUser());

    useEffect(() => {
        const handleUserChange = () => {
            setUser(getCurrentUser());
        };
        window.addEventListener('plx:user_changed', handleUserChange);
        return () => window.removeEventListener('plx:user_changed', handleUserChange);
    }, []);

    const isPremium = user?.suscripcion === 'pro' || user?.rol === 'admin';

    // Contexto Educativo
    const [nivel, setNivel] = useState('');
    const [grado, setGrado] = useState('');
    const [asignatura, setAsignatura] = useState('');
    const [showAsignaturaDropdown, setShowAsignaturaDropdown] = useState(false);
    const [showNivelDropdown, setShowNivelDropdown] = useState(false);
    const [showGradoDropdown, setShowGradoDropdown] = useState(false);

    // Dynamic allowed levels based on user interests
    const allowedNiveles = React.useMemo(() => {
        if (!user || user.rol === 'admin') {
            return [
                { value: "Primario", label: "Nivel Primario" },
                { value: "Secundario", label: "Nivel Secundario" }
            ];
        }
        
        const list = [];
        let hasPrimaria = false;
        let hasSecundaria = false;

        if (user.allowed_subjects && Object.keys(user.allowed_subjects).length > 0) {
            const keys = Object.keys(user.allowed_subjects);
            hasPrimaria = keys.some(k => k.startsWith('primaria-'));
            hasSecundaria = keys.some(k => k.startsWith('secundaria-'));
        } else if (user.nivel) {
            hasPrimaria = user.nivel === 'primaria';
            hasSecundaria = user.nivel === 'secundaria';
        } else {
            hasPrimaria = true;
            hasSecundaria = true;
        }

        if (hasPrimaria) list.push({ value: "Primario", label: "Nivel Primario" });
        if (hasSecundaria) list.push({ value: "Secundario", label: "Nivel Secundario" });
        return list;
    }, [user]);

    // Dynamic allowed grades based on selected level and user interests
    const allowedGrados = React.useMemo(() => {
        const allGrados = ["1ro", "2do", "3ro", "4to", "5to", "6to"];
        if (!user || user.rol === 'admin' || !nivel) {
            return allGrados;
        }

        if (user.allowed_subjects && Object.keys(user.allowed_subjects).length > 0) {
            const prefix = nivel === 'Primario' ? 'primaria-' : 'secundaria-';
            const keys = Object.keys(user.allowed_subjects).filter(k => k.startsWith(prefix));
            if (keys.length > 0) {
                return allGrados.filter(g => keys.includes(`${prefix}${g}`));
            }
        } else if (user.grado) {
            const prefix = nivel === 'Primario' ? 'primaria-' : 'secundaria-';
            const normalizedUserGrade = user.grado.replace(/^(primaria|secundaria|inicial)-/, '');
            if (user.grado.startsWith(prefix) || !user.grado.includes('-')) {
                return allGrados.filter(g => g === normalizedUserGrade);
            }
        }

        return allGrados;
    }, [user, nivel]);

    const filteredAsignaturas = React.useMemo(() => {
        if (!user || user.rol === 'admin' || !user.allowed_subjects || Object.keys(user.allowed_subjects).length === 0) {
            return ASIGNATURAS;
        }

        if (!nivel || !grado) return [];

        const gradeId = `${nivel === 'Primario' ? 'primaria' : 'secundaria'}-${grado}`;
        const allowedIds = user.allowed_subjects[gradeId] || [];
        const allowedNames = allowedIds.map(id => SUBJECT_ID_TO_NAME[id]).filter(Boolean);

        return ASIGNATURAS.filter(name => allowedNames.includes(name));
    }, [user, nivel, grado]);

    // Auto-detect and select level/grade/subject on load
    useEffect(() => {
        if (user && user.rol !== 'admin') {
            let initialNivel = '';
            let initialGrado = '';
            
            if (user.allowed_subjects && Object.keys(user.allowed_subjects).length > 0) {
                const keys = Object.keys(user.allowed_subjects);
                const firstKey = keys[0];
                if (firstKey.startsWith('primaria-')) {
                    initialNivel = 'Primario';
                    initialGrado = firstKey.replace('primaria-', '');
                } else if (firstKey.startsWith('secundaria-')) {
                    initialNivel = 'Secundario';
                    initialGrado = firstKey.replace('secundaria-', '');
                }
            } else if (user.nivel) {
                initialNivel = user.nivel === 'primaria' ? 'Primario' : user.nivel === 'secundaria' ? 'Secundario' : '';
                if (user.grado) {
                    initialGrado = user.grado.replace(/^(primaria|secundaria|inicial)-/, '');
                }
            }

            if (initialNivel) setNivel(initialNivel);
            if (initialGrado) setGrado(initialGrado);
        }
    }, [user]);

    // Auto-select subject once level and grade are resolved
    useEffect(() => {
        if (user && user.rol !== 'admin' && nivel && grado && !asignatura) {
            const gradeId = `${nivel === 'Primario' ? 'primaria' : 'secundaria'}-${grado}`;
            if (user.allowed_subjects && user.allowed_subjects[gradeId]) {
                const allowed = user.allowed_subjects[gradeId];
                if (allowed && allowed.length > 0) {
                    const firstAllowedName = SUBJECT_ID_TO_NAME[allowed[0]];
                    if (firstAllowedName) {
                        setAsignatura(firstAllowedName);
                    }
                }
            }
        }
    }, [user, nivel, grado, asignatura]);

    useEffect(() => {
        if (asignatura && filteredAsignaturas.length > 0 && !filteredAsignaturas.includes(asignatura)) {
            setAsignatura('');
        }
    }, [filteredAsignaturas, asignatura]);

    // Contenido y Objetivos
    const [evaluationType, setEvaluationType] = useState('Formativa');
    const [topic, setTopic] = useState('');
    const [indicators, setIndicators] = useState('');

    // Tipos de Ítems y Cantidades
    const [itemTypeCounts, setItemTypeCounts] = useState<Record<string, number | "">>({ 'Selección Múltiple': 5 });
    const numQuestions = Object.values(itemTypeCounts).reduce<number>((a, b) => a + (typeof b === 'number' ? b : 0), 0);

    // Estado UI
    const [isGenerating, setIsGenerating] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [error, setError] = useState('');
    const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
    const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student');

    const toggleItemType = (type: string) => {
        setItemTypeCounts(prev => {
            const newCounts = { ...prev };
            if (newCounts[type]) {
                delete newCounts[type];
            } else {
                newCounts[type] = 5;
            }
            return newCounts;
        });
    };

    const updateItemCount = (type: string, value: string) => {
        if (value === "") {
            setItemTypeCounts(prev => ({ ...prev, [type]: "" }));
            return;
        }
        const count = parseInt(value);
        if (!isNaN(count) && count >= 0) {
            setItemTypeCounts(prev => ({ ...prev, [type]: count }));
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPremium && !hasEnoughCredits('exam_generator')) {
            setShowLimitModal(true);
            return;
        }

        if (!asignatura || !grado) {
            setError('Por favor, completa al menos el Área y Grado');
            toast.error('Completa los campos obligatorios');
            return;
        }
        if (!topic.trim()) { 
            setError('Debes ingresar un tema a evaluar.'); 
            return; 
        }

        // Limpiar los valores vacíos o en cero
        const validItemTypeCounts: Record<string, number> = {};
        for (const [key, val] of Object.entries(itemTypeCounts)) {
            if (typeof val === 'number' && val > 0) {
                validItemTypeCounts[key] = val;
            }
        }

        const selectedItemTypes = Object.keys(validItemTypeCounts);
        if (selectedItemTypes.length === 0) { 
            setError('Debes elegir al menos un Tipo de Ítem válido con cantidad mayor a 0.'); 
            return; 
        }
        if (numQuestions > 50) { 
            setError('El máximo total de preguntas permitidas es 50.'); 
            return; 
        }

        setError('');
        setIsGenerating(true);
        setGeneratedQuestions([]);
        setViewMode('student');

        try {
            const data = await generateExam({
                nivel, grado, asignatura,
                evaluationType, numQuestions, topic, indicators,
                itemTypeCounts: validItemTypeCounts
            });

            if (!data || !data.questions || data.questions.length === 0) {
                throw new Error('Error al generar el examen. Verifica tu conexión de red e inténtalo de nuevo.');
            }

            // Consumir créditos si no es pro
            if (!isPremium) {
                const consumed = consumeCredits('exam_generator');
                if (!consumed) {
                    throw new Error('No posees suficientes Planix Coins para completar la generación.');
                }
                const cost = getCreditCosts().exam_generator ?? 20;
                toast.success(`Se descontaron ${cost} Planix Coins de tu saldo.`);
            }

            setGeneratedQuestions(data.questions);
            void logActivity({
                kind: 'tool',
                userName: user?.nombre || user?.email || 'Usuario',
                title: 'Generador de Exámenes',
                detail: `Creó un examen de ${asignatura} · ${grado}`
            });
            toast.success('¡Examen generado exitosamente!');
        } catch (err: any) {
            setError(err.message || 'Error inesperado. Intenta de nuevo.');
            toast.error(err.message || 'Ocurrió un error al generar examen.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        const cleanTopic = topic.trim() || 'General';
        const cleanAsignatura = asignatura || 'Asignatura';
        const cleanGrado = grado || 'Grado';

        const prefix = viewMode === 'teacher' ? 'GUIA DOCENTE' : 'Examen';
        document.title = `Planix - ${prefix} - ${cleanTopic} - ${cleanAsignatura} - ${cleanGrado}`;

        window.print();

        setTimeout(() => {
            document.title = originalTitle;
        }, 100);
    };

    return (
        <div className="min-h-screen pb-24 print:bg-white print:p-0 w-full flex-1">
            <style type="text/css" media="print">
                {`@page { margin: 1.2cm; }`}
            </style>
            
            {/* Ocultar UI en impresión */}
            <header className="print:hidden flex items-center justify-between px-6 py-4 max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs mb-6 mt-4">
                <Link to="/herramientas" className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-4 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider">
                    <ArrowLeft className="w-3.5 h-3.5" /> Volver a Herramientas
                </Link>
                <div className="flex items-center gap-3">
                    {isPremium ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/12 dark:from-amber-500/20 dark:to-amber-600/20 border border-amber-500/25 dark:border-amber-500/40 rounded-full shadow-[0_2px_12px_rgba(245,158,11,0.08)]">
                            <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 fill-amber-500/20 stroke-[2.5]" />
                            <span className="text-xs md:text-[13px] font-black text-amber-850 dark:text-amber-400 tracking-tight">
                                Planix Pro
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-xl px-3 py-1.5 shadow-2xs select-none">
                            <img 
                                src="/creditos.webp" 
                                alt="Créditos" 
                                className="w-7 h-7 object-contain shrink-0" 
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                            <span className="text-xs md:text-sm font-black text-slate-800 dark:text-zinc-200">
                                {getUserCredits(user)} PC
                            </span>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 print:max-w-none print:px-0">

                {/* Título Principal (HTML Rediseñado, Compacto y Estático) */}
                <div className="print:hidden mb-5 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-violet-600/10 dark:from-violet-500/15 dark:to-purple-600/15 border border-violet-500/15 dark:border-violet-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full">
                    {/* Decoración de fondo */}
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Contenedor de Icono */}
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-violet-500/20 dark:bg-violet-500/30 flex items-center justify-center shrink-0 border border-violet-500/30 dark:border-violet-500/40 relative">
                        <BookText className="w-5 h-5 md:w-6 h-6 text-violet-600 dark:text-violet-400 stroke-[2.5]" />
                    </div>

                    {/* Textos */}
                    <div className="text-center md:text-left flex-1 relative z-10">
                        <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                            Generador de Exámenes
                        </h1>
                        <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
                            Crea evaluaciones estructuradas y claves de respuesta docente personalizadas al instante. Diseña exámenes diagnósticos, formativos o sumativos alineados a tu planificación.
                        </p>
                    </div>
                </div>

                {/* FORMULARIO DE GENERACIÓN (Oculto al imprimir) */}
                <div className="print:hidden space-y-6 mb-12">

                    {/* PASO 1: Contexto Educativo */}
                    <section className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs focus-within:shadow-xs transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">1</span>
                            <h2 className="text-lg font-black text-slate-800 dark:text-white">Contexto Educativo</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Nivel Dropdown */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Nivel</label>
                                <div className="relative select-none">
                                    <button 
                                        type="button"
                                        onClick={() => setShowNivelDropdown(!showNivelDropdown)}
                                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                                    >
                                        <span>{nivel ? (nivel === "Primario" ? "Nivel Primario" : "Nivel Secundario") : "Seleccionar nivel..."}</span>
                                        <ChevronDown className={`h-4 w-4 text-slate-400 dark:text-zinc-550 transition-transform duration-200 ${showNivelDropdown ? "rotate-180" : ""}`} />
                                    </button>
                                    
                                    {showNivelDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowNivelDropdown(false)} />
                                            <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                                <div className="space-y-0.5">
                                                    {allowedNiveles.map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setNivel(opt.value);
                                                                setShowNivelDropdown(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors cursor-pointer ${
                                                                nivel === opt.value 
                                                                    ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" 
                                                                    : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                                            }`}
                                                        >
                                                            <span>{opt.label}</span>
                                                            {nivel === opt.value && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Grado Dropdown */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Grado</label>
                                <div className="relative select-none">
                                    <button 
                                        type="button"
                                        onClick={() => setShowGradoDropdown(!showGradoDropdown)}
                                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                                    >
                                        <span>{grado ? grado : "Seleccionar grado..."}</span>
                                        <ChevronDown className={`h-4 w-4 text-slate-400 dark:text-zinc-550 transition-transform duration-200 ${showGradoDropdown ? "rotate-180" : ""}`} />
                                    </button>
                                    
                                    {showGradoDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowGradoDropdown(false)} />
                                            <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-60 overflow-y-auto">
                                                <div className="space-y-0.5">
                                                    {allowedGrados.map((g) => (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => {
                                                                setGrado(g);
                                                                setShowGradoDropdown(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors cursor-pointer ${
                                                                grado === g 
                                                                    ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" 
                                                                    : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                                            }`}
                                                        >
                                                            <span>{g}</span>
                                                            {grado === g && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Asignatura Dropdown */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Asignatura</label>
                                <div className="relative select-none">
                                    <button 
                                        type="button"
                                        onClick={() => setShowAsignaturaDropdown(!showAsignaturaDropdown)}
                                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            {asignatura ? (
                                                <>
                                                    <span className="shrink-0 text-slate-550 dark:text-zinc-400">{getSubjectIcon(asignatura, "h-4 w-4")}</span>
                                                    <span>{asignatura}</span>
                                                </>
                                            ) : (
                                                <span className="text-slate-400 dark:text-zinc-550 font-normal">Seleccionar área...</span>
                                            )}
                                        </div>
                                        <ChevronDown className={`h-4 w-4 text-slate-400 dark:text-zinc-550 transition-transform duration-200 ${showAsignaturaDropdown ? "rotate-180" : ""}`} />
                                    </button>
                                    
                                    {showAsignaturaDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowAsignaturaDropdown(false)} />
                                            <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-60 overflow-y-auto">
                                                <div className="space-y-0.5">
                                                    {filteredAsignaturas.length === 0 ? (
                                                        <div className="px-3 py-4 text-xs text-slate-400 dark:text-zinc-500 text-center font-bold">
                                                            {!nivel || !grado ? "Selecciona nivel y grado primero" : "No tienes asignaturas habilitadas para este grado"}
                                                        </div>
                                                    ) : (
                                                        filteredAsignaturas.map(a => (
                                                            <button 
                                                                key={a} 
                                                                type="button"
                                                                onClick={() => { setAsignatura(a); setShowAsignaturaDropdown(false); }}
                                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors cursor-pointer ${
                                                                    asignatura === a 
                                                                        ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" 
                                                                        : "text-slate-750 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="shrink-0 text-slate-500 dark:text-zinc-450">{getSubjectIcon(a, "h-4 w-4")}</span>
                                                                    <span>{a}</span>
                                                                </div>
                                                                {asignatura === a && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PASO 2: Contenido y Objetivos */}
                    <section className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs focus-within:shadow-xs transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">2</span>
                            <h2 className="text-lg font-black text-slate-800 dark:text-white">Contenido y Objetivos</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Tipo de Evaluación</label>
                                <div className="flex flex-wrap gap-2">
                                    {EVALUATION_TYPES.map(t => {
                                        const isSelected = evaluationType === t;
                                        return (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setEvaluationType(t)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                                                        : 'bg-slate-50 dark:bg-zinc-950 text-slate-550 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800'
                                                }`}
                                            >
                                                {getEvaluationIcon(t, "h-3.5 w-3.5 shrink-0")}
                                                <span>{t}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Cantidad Total de Ítems</label>
                                <div className="relative">
                                    <input type="number" readOnly value={numQuestions} className="w-full h-10 px-3.5 bg-slate-100 dark:bg-zinc-955/60 border border-neutral-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-200 font-black text-sm outline-none cursor-default pr-16" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-550 font-black text-[10px] tracking-wider pointer-events-none uppercase">ITEMS</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Tema o Contenido Trabajado</label>
                                <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ej: La Célula, Las Fracciones, La Noticia..." className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                    Indicadores de Logro (Opcional)
                                    <span className="text-[10px] font-medium text-slate-400">(Ayuda a enfocar las preguntas)</span>
                                </label>
                                <textarea value={indicators} onChange={e => setIndicators(e.target.value)} placeholder="Pega aquí los indicadores oficiales del currículo..." className="w-full h-24 p-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none" />
                            </div>
                        </div>
                    </section>

                    {/* PASO 3: Tipos de Ítems */}
                    <section className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs focus-within:shadow-xs transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">3</span>
                            <h2 className="text-lg font-black text-slate-800 dark:text-white">Tipos de Ítems</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {ITEM_TYPES.map(type => {
                                const isSelected = !!itemTypeCounts[type] || itemTypeCounts[type] === "";
                                return (
                                    <div
                                        key={type}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                                            isSelected 
                                                ? 'border-brand-primary bg-indigo-50/50 dark:bg-brand-primary/10 dark:border-blue-500' 
                                                : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleItemType(type)}
                                            className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                                                isSelected 
                                                    ? 'bg-brand-primary border-brand-primary text-white dark:bg-blue-600 dark:border-blue-600' 
                                                    : 'border-slate-350 dark:border-zinc-700 bg-white dark:bg-zinc-950'
                                            }`}>
                                                {isSelected && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`text-xs font-bold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-655 dark:text-zinc-350'}`}>{type}</span>
                                        </button>

                                        {isSelected && (
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="50"
                                                    value={itemTypeCounts[type] === undefined ? '' : itemTypeCounts[type]}
                                                    onChange={(e) => updateItemCount(type, e.target.value)}
                                                    className="w-14 px-2 py-1 text-center border border-brand-primary/30 dark:border-blue-500/30 rounded-lg text-xs bg-white dark:bg-zinc-950 font-black text-brand-primary dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {error && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 rounded-2xl text-xs font-black border border-rose-100 dark:border-rose-900/50 flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex justify-center pt-6 pb-8">
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white text-[13px] font-black uppercase tracking-wider rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 shadow-brand-primary/20"
                        >
                            {isGenerating ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Sparkles className="w-4.5 h-4.5" />}
                            {isGenerating ? 'Generando Evaluación IA...' : 'Generar Examen'}
                        </button>
                    </div>
                </div>

                {/* RESULTADO (Solo visible tras generar) */}
                {generatedQuestions.length > 0 && !isGenerating && (
                    <div className="print:m-0 print:border-none print:shadow-none bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-12 shadow-xs relative">

                        {/* HEADER DE ACCIONES (No imprimible) */}
                        <div className="print:hidden flex flex-col md:flex-row justify-between items-center gap-4 mb-10 pb-6 border-b border-slate-100 dark:border-zinc-800">

                            {/* Toggle Estudiante vs Profesor */}
                            <div className="flex items-center bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-zinc-800">
                                <button 
                                    onClick={() => setViewMode('student')} 
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                        viewMode === 'student' 
                                            ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                                            : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <Eye className="w-3.5 h-3.5" /> Vista Estudiante
                                </button>
                                <button 
                                    onClick={() => setViewMode('teacher')} 
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                        viewMode === 'teacher' 
                                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                                            : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <LockKeyhole className="w-3.5 h-3.5" /> Guía Docente
                                </button>
                            </div>

                            <button 
                                onClick={handlePrint} 
                                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer border-none"
                            >
                                <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
                            </button>
                        </div>

                        {/* EXAMEN IMPRIMIBLE */}
                        <div className="max-w-4xl mx-auto space-y-12 print:space-y-6 pb-16 print:pb-4 print:max-w-none print:w-full print:px-0">

                            {/* Encabezado Escolar Formal */}
                            <div className="text-center space-y-4 print:space-y-2 border-b-2 border-slate-800 dark:border-zinc-700 pb-8 print:pb-4 page-break-inside-avoid">
                                <h2 className="text-2xl print:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
                                    EVALUACIÓN {evaluationType.toUpperCase()} DE {asignatura.toUpperCase()}
                                </h2>
                                <h3 className="text-lg print:text-base font-bold text-slate-600 dark:text-zinc-400">
                                    Nivel {nivel} - Grado {grado}
                                </h3>

                                {viewMode === 'teacher' && (
                                    <div className="inline-block mt-4 mb-2 bg-rose-100 border-2 border-rose-500 text-rose-700 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs shadow-xs print:border-none print:bg-white print:text-black dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50">
                                        CLAVE DE RESPUESTAS - USO DOCENTE
                                    </div>
                                )}

                                <div className="flex flex-col gap-4 print:gap-2 text-left mt-8 print:mt-4 w-full max-w-2xl mx-auto print:max-w-full items-start">
                                    <div className="flex w-full items-end">
                                        <span className="font-bold text-slate-700 dark:text-zinc-350 whitespace-nowrap text-sm">Nombre: </span>
                                        <div className="border-b border-slate-400 dark:border-zinc-700 w-full ml-2 mb-1"></div>
                                    </div>
                                    <div className="flex w-full items-end gap-6">
                                        <div className="flex flex-1 items-end">
                                            <span className="font-bold text-slate-700 dark:text-zinc-350 whitespace-nowrap text-sm">Fecha: </span>
                                            <div className="border-b border-slate-400 dark:border-zinc-700 w-full ml-2 mb-1"></div>
                                        </div>
                                        <div className="flex items-end min-w-[200px]">
                                            <span className="font-bold text-slate-700 dark:text-zinc-350 whitespace-nowrap text-sm">Calificación: </span>
                                            <div className="border-b border-slate-400 dark:border-zinc-700 w-full ml-2 mb-1"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 print:space-y-1 print:mt-2">
                                <p className="font-bold text-slate-700 dark:text-zinc-350 text-sm print:text-xs italic">Tema General: {topic}</p>
                                <p className="font-bold text-slate-700 dark:text-zinc-350 text-sm print:text-xs">
                                    Instrucciones: Lee cuidadosamente cada pregunta antes de responder. {viewMode === 'teacher' && <span className="text-rose-600 dark:text-rose-450 font-black">Las respuestas correctas están marcadas en este documento.</span>}
                                </p>
                            </div>

                            {/* PREGUNTAS MAPEADAS */}
                            <div className="space-y-12 print:space-y-6 print:mt-4">
                                {generatedQuestions.map((q, idx) => {
                                    const isFirstOfType = idx === 0 || q.tipo !== generatedQuestions[idx - 1].tipo;

                                    return (
                                        <div key={q.id || idx}>
                                            {isFirstOfType && (
                                                <div className="pt-6 pb-2 border-b-2 border-slate-800 dark:border-zinc-700 mt-12 mb-8 page-break-inside-avoid print:mt-6 print:mb-4 print:pt-2 print:pb-1">
                                                    <h4 className="text-lg print:text-base font-black text-slate-900 dark:text-white uppercase tracking-widest">{q.tipo}</h4>
                                                </div>
                                            )}
                                            <div className="relative pb-2 pt-2 print:break-inside-auto print:pl-8">
                                                {/* Insignia del tipo de pregunta invisible en impresión parea ahorro de espacio */}
                                                <div className="print:hidden absolute -top-4 -left-2 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border border-slate-200/60 dark:border-zinc-700">
                                                    {q.tipo}
                                                </div>

                                                <div className="flex print:block gap-4 print:gap-0">
                                                    <span className="font-black text-lg print:text-base text-slate-800 dark:text-white print:absolute print:left-0 print:top-2">{idx + 1}.</span>
                                                    <div className="flex-1 print:block">
                                                        <p className="font-bold text-slate-900 dark:text-zinc-150 text-base md:text-[17px] leading-relaxed mb-4 print:mb-2">{q.enunciado}</p>

                                                        {/* Opciones Si es V/F o Múltiple */}
                                                        {q.tipo === 'Verdadero / Falso' ? (
                                                            <div className="space-y-4 print:space-y-2 mt-6 print:mt-4 ml-2 print:ml-0">
                                                                {['Verdadero', 'Falso'].map((opt, oIdx) => {
                                                                    const isCorrectAnswer = opt === q.respuestaCorrecta;
                                                                    return (
                                                                        <div key={oIdx} className="flex items-start gap-3 print:gap-2">
                                                                            <div className={`w-5 h-5 print:w-4 print:h-4 rounded-full border-2 mt-0.5 print:mt-0 shrink-0 flex items-center justify-center
                                                                            ${viewMode === 'teacher' && isCorrectAnswer ? 'border-rose-600 bg-rose-50 print:bg-transparent print:border-black dark:border-rose-500 dark:bg-rose-950/20' : 'border-slate-400 dark:border-zinc-650 bg-white dark:bg-zinc-950 print:border-black'}
                                                                        `}>
                                                                                {viewMode === 'teacher' && isCorrectAnswer && (
                                                                                    <svg className="w-3 h-3 text-rose-600 dark:text-rose-400 print:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                                                )}
                                                                            </div>
                                                                            <span className={`text-slate-800 dark:text-zinc-300 text-sm md:text-base ${viewMode === 'teacher' && isCorrectAnswer ? 'font-black text-rose-700 dark:text-rose-400 print:text-black' : ''}`}>{opt}</span>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        ) : q.opciones && q.opciones.length > 0 ? (
                                                            <div className="space-y-3 print:space-y-1.5 ml-2 print:ml-0 mt-4 print:mt-1">
                                                                {q.opciones.map((opt, oIdx) => {
                                                                    const isCorrectAnswer = opt === q.respuestaCorrecta;
                                                                    return (
                                                                        <div key={oIdx} className="flex items-start gap-3 print:gap-2">
                                                                            <div className={`w-5 h-5 print:w-4 print:h-4 rounded-full border-2 mt-0.5 print:mt-0 shrink-0 flex items-center justify-center
                                                                        ${viewMode === 'teacher' && isCorrectAnswer ? 'border-rose-600 bg-rose-50 print:bg-transparent print:border-black dark:border-rose-500 dark:bg-rose-950/20' : 'border-slate-400 dark:border-zinc-650 bg-white dark:bg-zinc-950 print:border-black'}
                                                                    `}>
                                                                                {viewMode === 'teacher' && isCorrectAnswer && (
                                                                                    <svg className="w-3 h-3 text-rose-600 dark:text-rose-400 print:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                                                )}
                                                                            </div>
                                                                            <span className={`text-slate-800 dark:text-zinc-300 text-sm md:text-base ${viewMode === 'teacher' && isCorrectAnswer ? 'font-black text-rose-700 dark:text-rose-400 print:text-black' : ''}`}>{opt}</span>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        ) : q.pares && q.pares.length > 0 ? (
                                                            <div className="mt-8 print:mt-4 ml-2 print:ml-0">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-12 print:gap-x-6 gap-y-4 print:gap-y-2 items-start">
                                                                    <div className="space-y-4">
                                                                        {q.pares.map((par, pIdx) => (
                                                                            <div key={`A-${pIdx}`} className="text-slate-800 dark:text-zinc-300 text-sm md:text-base font-semibold">{par.columnaA}</div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        {q.pares.map((par, pIdx) => (
                                                                            <div key={`B-${pIdx}`} className="flex items-center gap-3">
                                                                                <div className="w-12 border-b border-slate-550 dark:border-zinc-650 shrink-0 self-end mb-1"></div>
                                                                                <span className="text-slate-700 dark:text-zinc-400 text-sm md:text-base font-medium">{par.columnaB}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {viewMode === 'teacher' && (
                                                                    <div className="bg-rose-50 dark:bg-rose-950/15 border-l-4 border-rose-500 p-4 rounded-r-lg mt-8 print:bg-white print:border-l-2 print:border-black print:p-2">
                                                                        <span className="block text-xs font-black text-rose-500 dark:text-rose-455 mb-1 uppercase tracking-widest print:text-black">Clave de Emparejamiento</span>
                                                                        <p className="text-rose-900 dark:text-rose-300 font-bold whitespace-pre-wrap leading-relaxed print:text-black text-sm">{q.respuestaCorrecta}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            /* Líneas de escritura / Respuestas */
                                                            <div className="mt-4">
                                                                {viewMode === 'teacher' ? (
                                                                    <div className="bg-rose-50 dark:bg-rose-950/15 border-l-4 border-rose-500 p-4 rounded-r-lg mt-4 print:bg-white print:border-l-2 print:border-black print:p-2">
                                                                        <span className="block text-xs font-black text-rose-500 dark:text-rose-455 mb-1 uppercase tracking-widest print:text-black">Respuesta Esperada</span>
                                                                        <p className="text-rose-900 dark:text-rose-300 font-bold whitespace-pre-wrap leading-relaxed print:text-black text-sm">{q.respuestaCorrecta}</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-8 print:space-y-8 mt-10 print:mt-8 w-[96%] mx-auto opacity-40">
                                                                        <div className="border-b-2 border-slate-400 dark:border-zinc-700 w-full"></div>
                                                                        {(q.tipo.includes('Desarrollo') || q.tipo.includes('Metacognición') || q.tipo.includes('Abierta') || q.tipo.includes('Producción')) && (
                                                                            <>
                                                                                <div className="border-b-2 border-slate-400 dark:border-zinc-700 w-full mt-8"></div>
                                                                                <div className="border-b-2 border-slate-400 dark:border-zinc-700 w-full mt-8"></div>
                                                                                <div className="border-b-2 border-slate-400 dark:border-zinc-700 w-full mt-8"></div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                        </div>
                    </div>
                )}
            </main>
            {isGenerating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-[380px] p-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 mx-4 overflow-hidden">
                        <div className="flex flex-col items-center justify-center p-8 pt-10 pb-7 text-center">
                            <button
                                type="button"
                                onClick={() => setIsGenerating(false)}
                                className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1.5 shadow-md transition-all duration-200 cursor-pointer"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                            
                            <div className="w-32 h-32 flex items-center justify-center relative overflow-hidden select-none pointer-events-none mb-2">
                                {/* @ts-ignore */}
                                <lottie-player
                                    src="/animacion.json"
                                    background="transparent"
                                    speed="1.2"
                                    style={{ width: "130px", height: "130px" }}
                                    loop
                                    autoplay
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <h4 className="text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                                    Diseñando examen
                                </h4>
                                <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed font-bold">
                                    Elaborando las preguntas, opciones y clave de respuestas. Esto puede tomar unos segundos.
                                </p>
                            </div>

                            <div className="w-full max-w-[260px] h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-5 relative">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                                    initial={{ left: "-100%", width: "50%" }}
                                    animate={{ left: "150%" }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.6,
                                        ease: "easeInOut"
                                    }}
                                    style={{ position: "absolute", top: 0 }}
                                />
                            </div>

                            <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-500 dark:text-zinc-400">
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500/20 border-t-indigo-600 animate-spin" />
                                <span className="font-semibold tracking-wide">Generando...</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ModalCreditos
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                requiredCredits={getCreditCosts().exam_generator ?? 20}
                currentCredits={getUserCredits(user)}
                actionName="generar exámenes estructurados con Inteligencia Artificial"
            />
        </div>
    );
}
