import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, Sparkles, Printer, RefreshCw, AlertCircle,
    BookText, Ruler, Globe, Leaf, Palette, Dumbbell, Heart, Languages, ChevronDown, Check, Crown,
    HeartHandshake, Copy
} from 'lucide-react';
import { getCurrentUser, Usuario } from '../lib/storage';
import { consumeCredits, hasEnoughCredits, getUserCredits, getCreditCosts } from '../lib/credits';
import ModalCreditos from '../components/ai/ModalCreditos';
import { generateAdditionalSupport } from '../lib/services/aiService';
import { toast } from 'sonner';

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

const SUBJECT_ID_TO_NAME: Record<string, string> = {
    'lengua-espanola': 'Lengua Española',
    'matematica': 'Matemáticas',
    'sociales': 'Ciencias Sociales',
    'naturales': 'Ciencias de la Naturaleza',
    'educacion-artistica': 'Educación Artística',
    'educacion-fisica': 'Educación Física',
    'formacion-humana': 'Formación H. Integral R.',
    'lengua-espanola-sec': 'Lengua Española',
    'matematica-sec': 'Matemáticas',
    'sociales-sec': 'Ciencias Sociales',
    'naturales-sec': 'Ciencias de la Naturaleza',
    'ingles': 'Lenguas Extranjeras (Inglés)',
    'educacion-artistica-sec': 'Educación Artística',
    'educacion-fisica-sec': 'Educación Física',
    'formacion-humana-sec': 'Formación H. Integral R.',
};

const DIFICULTADES = [
    { value: 'lectoescritura', label: 'Dificultades en Lectoescritura' },
    { value: 'logico-matematico', label: 'Razonamiento Lógico-Matemático' },
    { value: 'atencion', label: 'Déficit de Atención / Hiperactividad' },
    { value: 'conducta', label: 'Manejo Conductual / Emocional' },
    { value: 'ritmo', label: 'Ritmo de Aprendizaje Lento' }
];

interface SavedSupport {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    config: {
        nivel: string;
        grado: string;
        asignatura: string;
        difficulty: string;
        topic: string;
    };
}

function formatMarkdown(text: string): string {
    if (!text) return "";
    let html = text;
    
    // Escapar HTML
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    // Encabezados
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-base font-black text-slate-800 dark:text-zinc-100 mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-black text-slate-800 dark:text-zinc-100 mt-5 mb-2.5">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-black text-slate-900 dark:text-white mt-6 mb-3">$1</h1>');
    
    // Negrita
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Listas
    html = html.replace(/^\s*-\s+(.*?)$/gm, '<li class="ml-4 list-disc pl-1 py-0.5 text-sm">$1</li>');
    html = html.replace(/^\s*\*\s+(.*?)$/gm, '<li class="ml-4 list-disc pl-1 py-0.5 text-sm">$1</li>');
    html = html.replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<li class="ml-4 list-decimal pl-1 py-0.5 text-sm">$2</li>');
    
    // Párrafos
    html = html.split('\n').map(line => {
      if (line.trim().startsWith('<h') || line.trim().startsWith('<li') || line.trim() === '') {
        return line;
      }
      return `<p class="mb-2 text-sm leading-relaxed text-slate-700 dark:text-zinc-300 text-justify">${line}</p>`;
    }).join('\n');
    
    return html;
}

export default function ApoyoAdicional() {
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

    // Configuración
    const [difficulty, setDifficulty] = useState('atencion');
    const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
    const [topic, setTopic] = useState('');

    // Estado UI
    const [isGenerating, setIsGenerating] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [error, setError] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');

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

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPremium && !hasEnoughCredits('ai_planning')) {
            setShowLimitModal(true);
            return;
        }

        if (!asignatura || !grado) {
            setError('Por favor, completa al menos el Área y Grado');
            toast.error('Completa los campos obligatorios');
            return;
        }
        if (!topic.trim()) { 
            setError('Debes ingresar el tema actual de la clase.'); 
            return; 
        }

        setError('');
        setIsGenerating(true);
        setGeneratedContent('');

        try {
            const data = await generateAdditionalSupport({
                nivel, grado, asignatura, difficulty, topic
            });

            if (!data) {
                throw new Error('Error al consultar estrategias. Intenta de nuevo.');
            }

            // Consumir créditos
            if (!isPremium) {
                const consumed = consumeCredits('ai_planning');
                if (!consumed) {
                    throw new Error('No posees suficientes Planix Coins para completar la generación.');
                }
                const cost = getCreditCosts().ai_planning ?? 15;
                toast.success(`Se descontaron ${cost} Planix Coins de tu saldo.`);
            }

            setGeneratedContent(data);
            toast.success('¡Estrategias de apoyo generadas exitosamente!');
        } catch (err: any) {
            setError(err.message || 'Error inesperado. Intenta de nuevo.');
            toast.error(err.message || 'Ocurrió un error al generar.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        const cleanTopic = topic.trim() || 'General';
        const cleanAsignatura = asignatura || 'Asignatura';
        const cleanGrado = grado || 'Grado';

        document.title = `Planix - Apoyo Adicional - ${cleanTopic} - ${cleanAsignatura} - ${cleanGrado}`;
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
                {/* Título Banner */}
                <div className="print:hidden mb-5 bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-pink-600/10 dark:from-pink-500/15 dark:to-rose-600/15 border border-pink-500/15 dark:border-pink-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-pink-500/20 dark:bg-pink-500/30 flex items-center justify-center shrink-0 border border-pink-500/30 dark:border-pink-500/40 relative">
                        <HeartHandshake className="w-5 h-5 md:w-6 h-6 text-pink-600 dark:text-pink-400 stroke-[2.5]" />
                    </div>

                    <div className="text-center md:text-left flex-1 relative z-10">
                        <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                            Apoyo Adicional
                        </h1>
                        <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
                            Diseña estrategias de apoyo psicopedagógico basadas en DUA (Diseño Universal para el Aprendizaje) y adaptaciones curriculares específicas para alumnos con dificultades en lectoescritura, cálculo, atención, conducta o ritmo lento.
                        </p>
                    </div>
                </div>

                {/* FORMULARIO */}
                <div className="print:hidden space-y-6 mb-12">
                    {/* PASO 1: Contexto Educativo */}
                    <section className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs focus-within:shadow-xs transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">1</span>
                            <h2 className="text-lg font-black text-slate-800 dark:text-white">Contexto Educativo</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Nivel */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Nivel</label>
                                <div className="relative select-none">
                                    <button 
                                        type="button"
                                        onClick={() => setShowNivelDropdown(!showNivelDropdown)}
                                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-850 focus:border-brand-primary outline-none transition-all shadow-xs"
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
                                                                    : "text-slate-705 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
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

                            {/* Grado */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Grado</label>
                                <div className="relative select-none">
                                    <button 
                                        type="button"
                                        onClick={() => setShowGradoDropdown(!showGradoDropdown)}
                                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-850 focus:border-brand-primary outline-none transition-all shadow-xs"
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
                                                                    : "text-slate-750 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
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

                            {/* Asignatura */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Asignatura</label>
                                <div className="relative select-none">
                                    <button 
                                        type="button"
                                        onClick={() => setShowAsignaturaDropdown(!showAsignaturaDropdown)}
                                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-805 focus:border-brand-primary outline-none transition-all shadow-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            {asignatura ? (
                                                <>
                                                    <span className="shrink-0 text-slate-555 dark:text-zinc-400">{getSubjectIcon(asignatura, "h-4 w-4")}</span>
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
                                                        <div className="px-3 py-4 text-xs text-slate-400 dark:text-zinc-550 text-center font-bold">
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
                                                                    <span className="shrink-0 text-slate-500 dark:text-zinc-400">{getSubjectIcon(a, "h-4 w-4")}</span>
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

                    {/* PASO 2: Configuración del Apoyo */}
                    <section className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs focus-within:shadow-xs transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">2</span>
                            <h2 className="text-lg font-black text-slate-800 dark:text-white">Detalles de la Necesidad</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Dificultad */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Necesidad o Dificultad</label>
                                <div className="relative select-none">
                                    <button 
                                        type="button"
                                        onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
                                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                                    >
                                        <span>{DIFICULTADES.find(d => d.value === difficulty)?.label || "Seleccionar..."}</span>
                                        <ChevronDown className={`h-4 w-4 text-slate-400 dark:text-zinc-550 transition-transform duration-200 ${showDifficultyDropdown ? "rotate-180" : ""}`} />
                                    </button>
                                    
                                    {showDifficultyDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowDifficultyDropdown(false)} />
                                            <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                                <div className="space-y-0.5">
                                                    {DIFICULTADES.map((d) => (
                                                        <button
                                                            key={d.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setDifficulty(d.value);
                                                                setShowDifficultyDropdown(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors cursor-pointer ${
                                                                difficulty === d.value 
                                                                    ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" 
                                                                    : "text-slate-750 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                                            }`}
                                                        >
                                                            <span>{d.label}</span>
                                                            {difficulty === d.value && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Tema */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Tema actual de la clase</label>
                                <input 
                                    type="text" 
                                    value={topic} 
                                    onChange={e => setTopic(e.target.value)} 
                                    placeholder="Ej: Las fracciones, Los ecosistemas..." 
                                    className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs" 
                                />
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-455 rounded-2xl text-xs font-black border border-rose-100 dark:border-rose-900/50 flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Botón generar */}
                    <div className="flex justify-center pt-6">
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white text-[13px] font-black uppercase tracking-wider rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 shadow-brand-primary/20"
                        >
                            {isGenerating ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Sparkles className="w-4.5 h-4.5" />}
                            {isGenerating ? 'Generando Apoyo IA...' : 'Generar Estrategias'}
                        </button>
                    </div>
                </div>

                {/* RESULTADO (Solo visible tras generar) */}
                {generatedContent && !isGenerating && (
                    <div className="space-y-6">
                        <div className="print:m-0 print:border-none print:shadow-none bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-12 shadow-xs relative">
                            {/* Acciones */}
                            <div className="print:hidden flex flex-col md:flex-row justify-between items-center gap-4 mb-10 pb-6 border-b border-slate-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedContent);
                                            toast.success('Copiado al portapapeles');
                                        }} 
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl font-bold text-xs transition-all border-none cursor-pointer"
                                    >
                                        <Copy className="w-4.5 h-4.5" /> Copiar Texto
                                    </button>
                                </div>

                                <button 
                                    onClick={handlePrint} 
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer border-none"
                                >
                                    <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
                                </button>
                            </div>

                            {/* RECURSO IMPRIMIBLE */}
                            <div className="print:m-0 print:p-0 max-w-4xl mx-auto space-y-12 print:space-y-6 pb-16 print:pb-4 print:max-w-none print:w-full print:px-0">
                                <div className="text-center space-y-4 print:space-y-2 border-b-2 border-slate-855 dark:border-zinc-750 pb-8 print:pb-4 page-break-inside-avoid">
                                    <h2 className="text-2xl print:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
                                        ESTRATEGIAS DE APOYO ADICIONAL (DUA)
                                    </h2>
                                    <h3 className="text-lg print:text-base font-bold text-slate-655 dark:text-zinc-400">
                                        {asignatura.toUpperCase()} - {grado} ({nivel})
                                    </h3>
                                    <div className="inline-block mt-4 bg-rose-100 dark:bg-rose-955/40 border border-rose-300 dark:border-rose-900/50 text-rose-800 dark:text-rose-400 px-6 py-1.5 rounded-lg font-black uppercase tracking-widest text-xs shadow-xs print:border-none print:bg-white print:text-black">
                                        {DIFICULTADES.find(d => d.value === difficulty)?.label}
                                    </div>
                                </div>

                                <div 
                                    className="prose prose-slate max-w-none dark:prose-invert text-slate-800 dark:text-zinc-200 mt-8 print:mt-4 print:text-black"
                                    dangerouslySetInnerHTML={{ __html: formatMarkdown(generatedContent) }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <ModalCreditos 
                isOpen={showLimitModal} 
                onClose={() => setShowLimitModal(false)} 
                requiredCredits={getCreditCosts().ai_planning ?? 15}
                currentCredits={getUserCredits(user)}
                actionName="generar Estrategias de Apoyo Adicional con IA"
            />
        </div>
    );
}
