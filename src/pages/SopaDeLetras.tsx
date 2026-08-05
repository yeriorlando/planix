import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, Sparkles, Printer, RefreshCw, Eye, LockKeyhole, AlertCircle, HelpCircle,
    ChevronDown, Check, X, Crown, Search, Settings2, SlidersHorizontal,
    BookOpen, FileText, Smile, Zap, Brain
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentUser, Usuario } from '../lib/storage';
import { consumeCredits, hasEnoughCredits, getUserCredits, getCreditCosts } from '../lib/credits';
import ModalCreditos from '../components/ai/ModalCreditos';
import { generateWordSearchWords } from '../lib/services/aiService';
import { toast } from 'sonner';
import { logActivity } from '../lib/activityLog';

type Mode = 'topic' | 'custom';
type Difficulty = 'Fácil' | 'Medio' | 'Difícil';

// Algorithm for building the word search grid based on difficulty
function createWordSearch(words: string[], difficulty: Difficulty, size: number = 15) {
    // Try up to 5 times to place ALL words on a clean grid
    for (let tryCount = 0; tryCount < 5; tryCount++) {
        const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
        const placedWords: { word: string, row: number, col: number, dx: number, dy: number }[] = [];

        // Directions mapping based on difficulty
        let directions = [
            { dx: 1, dy: 0 },   // H. Der
            { dx: 0, dy: 1 },   // V. Abajo
        ];

        if (difficulty === 'Medio') {
            directions = [
                { dx: 1, dy: 0 },   // H. Der
                { dx: 0, dy: 1 },   // V. Abajo
                { dx: 1, dy: 1 },   // D. Abajo Der
                { dx: -1, dy: 0 },  // H. Izq
                { dx: 0, dy: -1 },  // V. Arriba
            ];
        } else if (difficulty === 'Difícil') {
            directions = [
                { dx: 1, dy: 0 },   // H. Der
                { dx: 0, dy: 1 },   // V. Abajo
                { dx: 1, dy: 1 },   // D. Abajo Der
                { dx: -1, dy: 0 },  // H. Izq
                { dx: 0, dy: -1 },  // V. Arriba
                { dx: -1, dy: -1 }, // D. Arriba Izq
                { dx: 1, dy: -1 },  // D. Arriba Der
                { dx: -1, dy: 1 },  // D. Abajo Izq
            ];
        }

        // Sort words by length descending to place larger words first
        const sortedWords = [...words].sort((a, b) => b.length - a.length);
        let allPlaced = true;

        for (const word of sortedWords) {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 300;

            while (!placed && attempts < maxAttempts) {
                attempts++;
                const dir = directions[Math.floor(Math.random() * directions.length)];
                const row = Math.floor(Math.random() * size);
                const col = Math.floor(Math.random() * size);

                let canPlace = true;
                for (let i = 0; i < word.length; i++) {
                    const r = row + i * dir.dy;
                    const c = col + i * dir.dx;
                    if (r < 0 || r >= size || c < 0 || c >= size || (grid[r][c] !== '' && grid[r][c] !== word[i])) {
                        canPlace = false;
                        break;
                    }
                }

                if (canPlace) {
                    for (let i = 0; i < word.length; i++) {
                        grid[row + i * dir.dy][col + i * dir.dx] = word[i];
                    }
                    placedWords.push({ word, row, col, dx: dir.dx, dy: dir.dy });
                    placed = true;
                }
            }

            if (!placed) {
                allPlaced = false;
                break; // Break the words loop and try with a new clean grid
            }
        }

        // If we placed all words, or this is our final attempt, fill empty cells and return
        if (allPlaced || tryCount === 4) {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (grid[r][c] === '') {
                        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
                    }
                }
            }
            return { grid, placedWords };
        }
    }

    return { grid: [], placedWords: [] };
}

export default function SopaDeLetras() {
    const user = getCurrentUser();
    const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';

    const [mode, setMode] = useState<Mode>('topic');
    const [topic, setTopic] = useState('');
    const [customText, setCustomText] = useState('');
    const [numWords, setNumWords] = useState<number>(15);
    const [difficulty, setDifficulty] = useState<Difficulty>('Medio');

    const [isGenerating, setIsGenerating] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [error, setError] = useState('');

    // Results
    const [generatedWords, setGeneratedWords] = useState<string[]>([]);
    const [puzzle, setPuzzle] = useState<{ grid: string[][], placedWords: any[] }>({ grid: [], placedWords: [] });
    const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPremium && !hasEnoughCredits('wordsearch_generator')) {
            setShowLimitModal(true);
            return;
        }
        if (mode === 'topic' && !topic.trim()) { 
            setError('Por favor ingresa un tema para la sopa de letras.'); 
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
        setGeneratedWords([]);
        setPuzzle({ grid: [], placedWords: [] });
        setViewMode('student');

        try {
            const words = await generateWordSearchWords({
                topic: mode === 'topic' ? topic : '',
                customText: mode === 'custom' ? customText : '',
                numWords,
                difficulty
            });

            if (!words || words.length === 0) {
                throw new Error('Error al generar las palabras. Verifica tu conexión de red e inténtalo de nuevo.');
            }

            // Consumir créditos si no es pro
            if (!isPremium) {
                const consumed = consumeCredits('wordsearch_generator');
                if (!consumed) {
                    throw new Error('No posees suficientes Planix Coins para completar la generación.');
                }
            }

            // Compute grid size dynamically (based on word count & lengths)
            const maxWordLen = Math.max(...words.map(w => w.length));
            const gridSize = Math.max(maxWordLen + 2, Math.ceil(Math.sqrt(numWords * 10)));
            
            const computedPuzzle = createWordSearch(words, difficulty, gridSize);
            const placedWordsList = computedPuzzle.placedWords.map(pw => pw.word);
            const finalWords = words.filter(w => placedWordsList.includes(w));

            setGeneratedWords(finalWords);
            setPuzzle(computedPuzzle);
            void logActivity({
                kind: 'tool',
                userName: user?.nombre || user?.email || 'Usuario',
                title: 'Sopa de Letras',
                detail: `Creó una sopa de letras (${mode === 'topic' ? (topic.trim() || 'General') : 'Texto Personalizado'})`
            });
            toast.success('¡Sopa de letras generada exitosamente!');
        } catch (err: any) {
            setError(err.message || 'Error inesperado. Intenta de nuevo.');
            toast.error(err.message || 'Ocurrió un error al generar sopa de letras.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        const cleanTopic = mode === 'topic' ? (topic.trim() || 'General') : 'Tema Personalizado';
        document.title = `Planix - Sopa de Letras - ${cleanTopic}`;

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
                .word-highlighter-line {
                    stroke-width: 18px;
                }
                @media (min-width: 640px) {
                    .word-highlighter-line {
                        stroke-width: 22px;
                    }
                }
                @media (min-width: 768px) {
                    .word-highlighter-line {
                        stroke-width: 26px;
                    }
                }
                @media print {
                    .word-highlighter-line {
                        stroke-width: 20px;
                        stroke: rgba(0, 0, 0, 0.08) !important;
                    }
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
                <div className="print:hidden mb-5 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-rose-600/10 dark:from-rose-500/15 dark:to-pink-600/15 border border-rose-500/15 dark:border-rose-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full">
                    {/* Decoración de fondo */}
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Contenedor de Icono */}
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-rose-500/20 dark:bg-rose-500/30 flex items-center justify-center shrink-0 border border-rose-500/30 dark:border-rose-500/40 relative">
                        <Search className="w-5 h-5 md:w-6 h-6 text-rose-600 dark:text-rose-400 stroke-[2.5]" />
                    </div>

                    {/* Textos */}
                    <div className="text-center md:text-left flex-1 relative z-10">
                        <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                            Sopa de Letras
                        </h1>
                        <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
                            Diseña grillas de búsqueda de palabras interactivas y listas para imprimir sobre cualquier tema educativo. Fomenta el vocabulario y la concentración de tus estudiantes.
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
                                        placeholder="Ej: El Sistema Solar, Reinos de la Naturaleza, Frutas..." 
                                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs" 
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Texto Fuente</label>
                                    <textarea 
                                        value={customText} 
                                        onChange={e => setCustomText(e.target.value)} 
                                        placeholder="Pega aquí el contenido de lectura de tu clase para que la IA extraiga los términos clave..." 
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
                            <h2 className="text-lg font-black text-slate-800 dark:text-white">Ajustes del Juego</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Dificultad */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Dificultad de la Grilla</label>
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
                                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 leading-tight">
                                    {difficulty === 'Fácil' && '• Las palabras se escriben solo de Izquierda a Derecha y de Arriba a Abajo.'}
                                    {difficulty === 'Medio' && '• Permite palabras en reversa y en diagonal hacia abajo.'}
                                    {difficulty === 'Difícil' && '• Permite las 8 direcciones espaciales (horizontales, verticales y diagonales invertidas).'}
                                </p>
                            </div>

                            {/* Cantidad de palabras */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 pl-1">Cantidad de palabras</label>
                                
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
                                            max={30} 
                                            value={numWords} 
                                            onChange={e => setNumWords(parseInt(e.target.value))}
                                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none active:scale-[1.01] transition-transform"
                                            style={{
                                                background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${((numWords - 5) / 25) * 100}%, var(--plx-slider-track-bg) ${((numWords - 5) / 25) * 100}%, var(--plx-slider-track-bg) 100%)`,
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
                                        onClick={() => setNumWords(Math.min(30, numWords + 1))}
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
                            {isGenerating ? 'Generando Sopa de Letras...' : 'Generar Sopa de Letras'}
                        </button>
                    </div>
                </form>

                {/* RESULTADO (Solo visible tras generar) */}
                {puzzle.grid.length > 0 && !isGenerating && (
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

                                              <div className="max-w-4xl mx-auto space-y-8 print:space-y-4 pb-12 print:pb-2 print:max-w-none print:w-full print:px-0">

                            {/* Encabezado Escolar Formal */}
                            <div className="text-center space-y-3 print:space-y-1.5 border-b-2 border-slate-850 dark:border-zinc-700 pb-6 print:pb-3 page-break-inside-avoid">
                                <h2 className="text-2xl print:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                    SOPA DE LETRAS
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
                                <p className="font-bold text-slate-700 dark:text-zinc-350 text-sm print:text-xs">
                                    Instrucciones: Encuentra las palabras ocultas en la cuadrícula de letras de acuerdo a la lista que se muestra en la parte inferior. Puedes buscarlas en sentido horizontal, vertical u oblicuo.
                                </p>
                            </div>

                            {/* TABLA Y GRIDA */}
                            <div className="flex flex-col gap-10 items-center justify-center">
                                
                                {/* Grilla */}
                                <div className="bg-white dark:bg-zinc-950 p-3 md:p-4 rounded-3xl border-4 border-slate-800 dark:border-zinc-700 shrink-0 mx-auto print:mx-auto shadow-2xs">
                                    <div
                                        className="grid gap-0.5 select-none relative"
                                        style={{ gridTemplateColumns: `repeat(${puzzle.grid.length}, minmax(0, 1fr))` }}
                                    >
                                        {/* SVG Highlighter Overlay for Teacher view */}
                                        {viewMode === 'teacher' && (
                                            <svg 
                                                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                                                style={{ overflow: 'visible' }}
                                            >
                                                {puzzle.placedWords.map((pw: any, pwIdx: number) => {
                                                    const colors = [
                                                        'rgba(244, 63, 94, 0.25)',  // Rose
                                                        'rgba(59, 130, 246, 0.25)', // Blue
                                                        'rgba(16, 185, 129, 0.25)', // Green
                                                        'rgba(245, 158, 11, 0.25)', // Amber
                                                        'rgba(139, 92, 246, 0.25)', // Purple
                                                        'rgba(236, 72, 153, 0.25)', // Pink
                                                        'rgba(20, 184, 166, 0.25)', // Teal
                                                        'rgba(234, 179, 8, 0.25)',  // Yellow
                                                    ];
                                                    const color = colors[pwIdx % colors.length];
                                                    const size = puzzle.grid.length;
                                                    const x1 = `${((pw.col + 0.5) / size) * 100}%`;
                                                    const y1 = `${((pw.row + 0.5) / size) * 100}%`;
                                                    const x2 = `${((pw.col + (pw.word.length - 1) * pw.dx + 0.5) / size) * 100}%`;
                                                    const y2 = `${((pw.row + (pw.word.length - 1) * pw.dy + 0.5) / size) * 100}%`;

                                                    return (
                                                        <line
                                                            key={pwIdx}
                                                            x1={x1}
                                                            y1={y1}
                                                            x2={x2}
                                                            y2={y2}
                                                            stroke={color}
                                                            strokeLinecap="round"
                                                            className="word-highlighter-line"
                                                        />
                                                    );
                                                })}
                                            </svg>
                                        )}
                                        {puzzle.grid.map((row, rIndex) => (
                                            row.map((letter, cIndex) => {
                                                const isAnswer = viewMode === 'teacher' && puzzle.placedWords.some((pw: any) => {
                                                    for (let i = 0; i < pw.word.length; i++) {
                                                        const r = pw.row + i * pw.dy;
                                                        const c = pw.col + i * pw.dx;
                                                        if (r === rIndex && c === cIndex) return true;
                                                    }
                                                    return false;
                                                });

                                                return (
                                                    <div 
                                                        key={`${rIndex}-${cIndex}`} 
                                                        className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center text-sm sm:text-base md:text-lg font-black uppercase rounded-lg transition-all print:w-7 print:h-7 print:text-[11px] print:rounded-md ${
                                                            isAnswer 
                                                                ? 'text-rose-600 dark:text-rose-400 print:text-black print:bg-slate-100 print:border print:border-black' 
                                                                : 'text-slate-700 dark:text-zinc-300'
                                                        }`}
                                                    >
                                                        {letter}
                                                    </div>
                                                );
                                            })
                                        ))}
                                    </div>
                                </div>

                                {/* Lista de palabras */}
                                <div className="w-full bg-slate-55/50 dark:bg-zinc-950/20 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 print:bg-white print:border-none print:p-0">
                                    <h3 className="font-black text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2 uppercase tracking-wider print:mb-2">
                                        <Search className="w-4 h-4 text-brand-primary dark:text-blue-400" />
                                        Palabras a Buscar:
                                    </h3>
                                    
                                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 print:grid-cols-4 gap-y-3 gap-x-6">
                                        {generatedWords.map((word, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-zinc-700 print:border-black shrink-0"></span>
                                                <span className="font-bold text-slate-700 dark:text-zinc-300 print:text-black uppercase text-xs tracking-wider break-all">{word}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

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
                                    Creando Sopa de Letras
                                </h4>
                                <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed font-bold">
                                    Seleccionando las mejores palabras y diseñando la cuadrícula. Esto puede tomar unos segundos.
                                </p>

                                <div className="w-full max-w-[260px] h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-5 relative">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 to-brand-primary rounded-full"
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
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500/20 border-t-blue-600 animate-spin" />
                                    <span className="font-semibold tracking-wide">Generando...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ModalCreditos
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                requiredCredits={getCreditCosts().wordsearch_generator ?? 15}
                currentCredits={getUserCredits(user)}
                actionName="generar sopas de letras con Inteligencia Artificial"
            />
        </div>
    );
}
