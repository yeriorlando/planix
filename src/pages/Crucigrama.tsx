import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, Sparkles, Printer, RefreshCw, Eye, LockKeyhole, AlertCircle, HelpCircle,
    ChevronDown, Check, X, Crown, Search, Settings2, SlidersHorizontal,
    BookOpen, FileText, Smile, Zap, Brain, Grid
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentUser, Usuario } from '../lib/storage';
import { consumeCredits, hasEnoughCredits, getUserCredits, getCreditCosts } from '../lib/credits';
import ModalCreditos from '../components/ai/ModalCreditos';
import { generateCrosswordItems } from '../lib/services/aiService';
import { generateCrossword, CrosswordGrid } from '../lib/utils/crosswordGenerator';
import { toast } from 'sonner';

type Mode = 'topic' | 'custom';
type Difficulty = 'Fácil' | 'Medio' | 'Difícil';

export default function Crucigrama() {
    const user = getCurrentUser();
    const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';

    const [mode, setMode] = useState<Mode>('topic');
    const [topic, setTopic] = useState('');
    const [customText, setCustomText] = useState('');
    const [numWords, setNumWords] = useState<number>(10);
    const [difficulty, setDifficulty] = useState<Difficulty>('Medio');

    const [isGenerating, setIsGenerating] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [error, setError] = useState('');

    // Results
    const [puzzle, setPuzzle] = useState<CrosswordGrid | null>(null);
    const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPremium && !hasEnoughCredits('crossword_generator')) {
            setShowLimitModal(true);
            return;
        }
        if (mode === 'topic' && !topic.trim()) { 
            setError('Por favor ingresa un tema para el crucigrama.'); 
            toast.error('Completa los campos obligatorios');
            return; 
        }
        if (mode === 'custom' && customText.trim().length < 20) { 
            setError('El texto provisto debe ser de al menos 20 caracteres para poder extraer palabras clave.'); 
            toast.error('Texto demasiado corto');
            return; 
        }

        setError('');
        setIsGenerating(true);
        setPuzzle(null);
        setViewMode('student');

        try {
            const items = await generateCrosswordItems({
                topic: mode === 'topic' ? topic : '',
                customText: mode === 'custom' ? customText : '',
                numWords,
                difficulty
            });

            if (!items || items.length === 0) {
                throw new Error('Error al generar las palabras. Verifica tu conexión de red e inténtalo de nuevo.');
            }

            // Consumir créditos si no es pro
            if (!isPremium) {
                const consumed = consumeCredits('crossword_generator');
                if (!consumed) {
                    throw new Error('No posees suficientes Planix Coins para completar la generación.');
                }
            }

            // Build the crossword grid locally
            const generatedGrid = generateCrossword(items);
            if (generatedGrid.placedWords.length === 0) {
                throw new Error('No se pudo generar una cuadrícula conectada. Intenta de nuevo o reduce el número de palabras.');
            }

            setPuzzle(generatedGrid);
            toast.success('¡Crucigrama generado exitosamente!');
        } catch (err: any) {
            setError(err.message || 'Error inesperado. Intenta de nuevo.');
            toast.error(err.message || 'Ocurrió un error al generar el crucigrama.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        const cleanTopic = mode === 'topic' ? (topic.trim() || 'General') : 'Tema Personalizado';
        document.title = `Planix - Crucigrama - ${cleanTopic}`;

        window.print();

        setTimeout(() => {
            document.title = originalTitle;
        }, 100);
    };

    const horizontales = puzzle?.placedWords.filter(w => w.isHorizontal).sort((a, b) => a.number - b.number) || [];
    const verticales = puzzle?.placedWords.filter(w => !w.isHorizontal).sort((a, b) => a.number - b.number) || [];

    return (
        <div className="min-h-screen pb-24 print:bg-white print:p-0 w-full flex-1">
            <style type="text/css" media="print">
                {`@page { margin: 1.2cm; }`}
            </style>
            <style>{`
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--brand-primary);
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                    transition: transform 0.1s ease;
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                }
                input[type="range"]::-webkit-slider-thumb:active {
                    transform: scale(1.25);
                }
                input[type="range"]::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border: none;
                    border-radius: 50%;
                    background: var(--brand-primary);
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                    transition: transform 0.1s ease;
                }
                input[type="range"]::-moz-range-thumb:hover {
                    transform: scale(1.15);
                }
                input[type="range"]::-moz-range-thumb:active {
                    transform: scale(1.25);
                }
                :root {
                    --plx-slider-track-bg: #cbd5e1;
                }
                .dark :root, .dark {
                    --plx-slider-track-bg: #3f3f46;
                }
            `}</style>
            
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
                <div className="print:hidden mb-5 bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-indigo-600/10 dark:from-indigo-500/15 dark:to-blue-600/15 border border-indigo-500/15 dark:border-indigo-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full">
                    {/* Decoración de fondo */}
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Contenedor de Icono */}
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-500/20 dark:bg-indigo-500/30 flex items-center justify-center shrink-0 border border-indigo-500/30 dark:border-indigo-500/40 relative">
                        <Grid className="w-5 h-5 md:w-6 h-6 text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
                    </div>

                    {/* Textos */}
                    <div className="text-center md:text-left flex-1 relative z-10">
                        <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                             Generador de Crucigramas
                        </h1>
                        <p className="text-slate-650 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
                            Diseña crucigramas educativos divertidos listos para imprimir sobre cualquier tema curricular. Estimula el pensamiento crítico y la memoria de tus alumnos.
                        </p>
                    </div>
                </div>

                {/* FORMULARIO DE GENERACIÓN (Oculto al imprimir) */}
                <form onSubmit={handleGenerate} className="print:hidden space-y-6 mb-12">

                    {/* PASO 1: Contexto Pedagógico */}
                    <section className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs focus-within:shadow-xs transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">1</span>
                            <h2 className="text-lg font-black text-slate-800 dark:text-white">Tema o Texto de Origen</h2>
                        </div>
                        
                        {/* Selector de modo */}
                        <div className="flex items-center gap-2 mb-6 bg-slate-100/80 dark:bg-zinc-950 p-1.5 rounded-2xl w-fit border border-slate-200/40 dark:border-zinc-800/80">
                            <button 
                                type="button" 
                                onClick={() => setMode('topic')} 
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                    mode === 'topic' 
                                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                                }`}
                            >
                                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                                <span>Por Tema</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setMode('custom')} 
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                    mode === 'custom' 
                                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                                }`}
                            >
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span>Texto Personalizado</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {mode === 'topic' ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Tema Principal</label>
                                    <input 
                                        type="text" 
                                        value={topic} 
                                        onChange={e => setTopic(e.target.value)} 
                                        placeholder="Ej: La Célula y sus Organelas, La Independencia Nacional..." 
                                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs" 
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Texto Fuente</label>
                                    <textarea 
                                        value={customText} 
                                        onChange={e => setCustomText(e.target.value)} 
                                        placeholder="Pega aquí el texto del que quieres extraer los conceptos y pistas para el crucigrama..." 
                                        className="w-full h-32 p-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none" 
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* PASO 2: Configuración del Juego */}
                    <section className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs focus-within:shadow-xs transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">2</span>
                            <h2 className="text-lg font-black text-slate-800 dark:text-white">Ajustes del Crucigrama</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Dificultad */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Dificultad de las Pistas</label>
                                <div className="grid grid-cols-3 gap-2.5">
                                    {(['Fácil', 'Medio', 'Difícil'] as Difficulty[]).map(d => {
                                        const isSelected = difficulty === d;
                                        let icon = <Smile className="w-3.5 h-3.5 shrink-0" />;
                                        if (d === 'Medio') {
                                            icon = <Zap className="w-3.5 h-3.5 shrink-0" />;
                                        } else if (d === 'Difícil') {
                                            icon = <Brain className="w-3.5 h-3.5 shrink-0" />;
                                        }

                                        return (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setDifficulty(d)}
                                                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-brand-primary text-white border-transparent shadow-md shadow-brand-primary/20' 
                                                        : 'bg-slate-50 dark:bg-zinc-950 text-slate-550 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-850 border border-slate-250 dark:border-zinc-800'
                                                }`}
                                            >
                                                {icon}
                                                <span>{d}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 leading-tight border-none">
                                    {difficulty === 'Fácil' && '• Pistas muy directas, literales o descripciones obvias.'}
                                    {difficulty === 'Medio' && '• Mezcla de definiciones estándar de diccionario escolar.'}
                                    {difficulty === 'Difícil' && '• Descripciones metafóricas o deducción escolar avanzada.'}
                                </p>
                            </div>

                            {/* Cantidad de palabras */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 pl-1">Cantidad de conceptos (5 a 20)</label>
                                
                                <div className="flex items-center gap-3">
                                    {/* Decrement Button */}
                                    <button
                                        type="button"
                                        onClick={() => setNumWords(Math.max(5, numWords - 1))}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white active:scale-95 transition-all shadow-2xs cursor-pointer select-none border-none font-bold"
                                    >
                                        <span className="text-lg font-semibold leading-none">-</span>
                                    </button>

                                    {/* Slider */}
                                    <div className="flex-1 flex items-center px-1">
                                        <input 
                                            type="range" 
                                            min={5} 
                                            max={20} 
                                            value={numWords} 
                                            onChange={e => setNumWords(parseInt(e.target.value))}
                                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none active:scale-[1.01] transition-transform"
                                            style={{
                                                background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${((numWords - 5) / 15) * 100}%, var(--plx-slider-track-bg) ${((numWords - 5) / 15) * 100}%, var(--plx-slider-track-bg) 100%)`,
                                                WebkitAppearance: 'none'
                                            }}
                                        />
                                    </div>

                                    {/* Number Input Box */}
                                    <div className="w-11 h-9 flex items-center justify-center text-center font-bold border border-slate-250 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 shadow-2xs select-none">
                                        {numWords}
                                    </div>

                                    {/* Increment Button */}
                                    <button
                                        type="button"
                                        onClick={() => setNumWords(Math.min(20, numWords + 1))}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition-all shadow-2xs cursor-pointer select-none border-none font-bold"
                                    >
                                        <span className="text-lg font-semibold leading-none">+</span>
                                    </button>
                                </div>

                                {/* Quick-Select circles */}
                                <div className="flex gap-2.5 pl-12 pt-1">
                                    {[5, 10, 15, 20].map(val => {
                                        const isActive = numWords === val;
                                        return (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setNumWords(val)}
                                                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border cursor-pointer select-none active:scale-90 ${
                                                    isActive
                                                        ? 'bg-brand-primary border-brand-primary text-white shadow-2xs'
                                                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                                }`}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 rounded-2xl text-xs font-black border border-rose-100 dark:border-rose-900/50 flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex justify-center pt-6 pb-8">
                        <button
                            type="submit"
                            disabled={isGenerating}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white text-[13px] font-black uppercase tracking-wider rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 shadow-brand-primary/20"
                        >
                            {isGenerating ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Sparkles className="w-4.5 h-4.5" />}
                            {isGenerating ? 'Generando Crucigrama...' : 'Generar Crucigrama'}
                        </button>
                    </div>
                </form>

                {/* RESULTADO (Solo visible tras generar) */}
                {puzzle && !isGenerating && (
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
                                    <Eye className="w-3.5 h-3.5" /> Crucigrama
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

                                           <div className="max-w-4xl mx-auto space-y-8 print:space-y-4 pb-12 print:pb-2 print:max-w-none print:w-full print:px-0">

                            {/* Encabezado Escolar Formal */}
                            <div className="text-center space-y-3 print:space-y-1.5 border-b-2 border-slate-850 dark:border-zinc-700 pb-6 print:pb-3 page-break-inside-avoid">
                                <h2 className="text-2xl print:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                    CRUCIGRAMA
                                </h2>
                                <h3 className="text-base print:text-sm font-bold text-slate-550 dark:text-zinc-400 uppercase tracking-widest leading-relaxed">
                                    Tema: {mode === 'topic' ? topic : 'Personalizado'}
                                </h3>

                                {viewMode === 'teacher' && (
                                    <div className="inline-block mt-3 mb-1.5 bg-rose-100 border-2 border-rose-500 text-rose-700 px-6 py-2 rounded-lg font-black uppercase tracking-widest text-xs shadow-xs print:border-none print:bg-white print:text-black dark:bg-rose-950/20 dark:text-rose-405 dark:border-rose-900/50">
                                        CLAVE DE RESPUESTAS - USO DOCENTE
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 print:gap-1.5 text-left mt-6 print:mt-2 w-full max-w-2xl mx-auto print:max-w-full items-start">
                                    <div className="flex w-full items-end">
                                        <span className="font-bold text-slate-700 dark:text-zinc-350 whitespace-nowrap text-sm">Nombre del Estudiante: </span>
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

                            <div className="space-y-2 print:space-y-1">
                                <p className="font-bold text-slate-700 dark:text-zinc-350 text-sm print:text-xs leading-relaxed">
                                    Instrucciones: Resuelve el crucigrama completando las palabras en la cuadrícula de acuerdo a las pistas horizontales y verticales provistas en la parte inferior.
                                </p>                            
                                {/* TABLA Y GRIDA */}
                                <div className="flex justify-center mb-8 print:mb-4 overflow-x-auto pb-2 pt-2 hide-scrollbar">
                                    <div
                                        className="inline-grid gap-0 p-[2px]"
                                        style={{ gridTemplateColumns: `repeat(${puzzle.width}, minmax(0, 1fr))` }}
                                    >
                                        {puzzle.grid.map((row, rIdx) => (
                                            row.map((cell, cIdx) => (
                                                <div 
                                                    key={`${rIdx}-${cIdx}`} 
                                                    className={`relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center font-bold text-xs sm:text-sm md:text-base uppercase transition-all print:w-7 print:h-7 print:text-[10px] ${
                                                        cell 
                                                            ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border-[1.5px] border-slate-900 dark:border-zinc-700 print:border-black' 
                                                            : 'bg-transparent'
                                                    }`}
                                                >
                                                    {cell && cell.number && (
                                                        <span className="absolute top-0.5 left-0.5 text-[7px] sm:text-[8px] leading-none font-black text-slate-700 dark:text-zinc-400 print:text-black print:text-[7px]">{cell.number}</span>
                                                    )}
                                                    {cell && viewMode === 'teacher' && (
                                                        <span className="text-rose-700 dark:text-rose-400 print:text-black font-black">{cell.letter}</span>
                                                    )}
                                                </div>
                                            ))
                                        ))}
                                    </div>
                                </div>
                            </div>

                                {/* Lista de pistas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full print:grid-cols-2 print:gap-6">
                                    {/* Horizontales */}
                                    {horizontales.length > 0 && (
                                        <div className="bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 print:bg-white print:border-none print:p-0">
                                            <h3 className="font-black text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2 uppercase tracking-wider print:mb-2">
                                                <SlidersHorizontal className="w-4 h-4 text-brand-primary dark:text-blue-400" />
                                                Horizontales:
                                            </h3>
                                            <ul className="space-y-2.5 print:space-y-1.5">
                                                {horizontales.map((w, idx) => (
                                                    <li key={idx} className="flex gap-2.5 items-start">
                                                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-primary text-white text-[10px] font-black shrink-0 shadow-2xs mt-0.5">{w.number}</span>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-slate-700 dark:text-zinc-300 text-sm print:text-black leading-relaxed">{w.clue}</p>
                                                            {viewMode === 'teacher' && (
                                                                <span className="inline-block mt-1 font-black text-rose-600 dark:text-rose-400 text-xs uppercase tracking-wider print:text-black">— Respuesta: {w.word}</span>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Verticales */}
                                    {verticales.length > 0 && (
                                        <div className="bg-slate-50/50 dark:bg-zinc-955/20 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 print:bg-white print:border-none print:p-0">
                                            <h3 className="font-black text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2 uppercase tracking-wider print:mb-2">
                                                <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                Verticales:
                                            </h3>
                                            <ul className="space-y-2.5 print:space-y-1.5">
                                                {verticales.map((w, idx) => (
                                                    <li key={idx} className="flex gap-2.5 items-start">
                                                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-black shrink-0 shadow-2xs mt-0.5">{w.number}</span>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-slate-700 dark:text-zinc-300 text-sm print:text-black leading-relaxed">{w.clue}</p>
                                                            {viewMode === 'teacher' && (
                                                                <span className="inline-block mt-1 font-black text-rose-600 dark:text-rose-455 text-xs uppercase tracking-wider print:text-black">— Respuesta: {w.word}</span>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
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
                                    Creando Crucigrama
                                </h4>
                                <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed font-bold">
                                    Extrayendo conceptos y tejiendo la red de palabras cruzadas. Esto tomará unos segundos.
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
                requiredCredits={getCreditCosts().crossword_generator ?? 15}
                currentCredits={getUserCredits(user)}
                actionName="generar crucigramas con Inteligencia Artificial"
            />
        </div>
    );
}
