import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, Sparkles, RefreshCw, X, Check, HelpCircle, 
    Maximize2, Minimize2, Gamepad2, Settings2, SlidersHorizontal, 
    Play, Trophy, Timer, Star, AlertCircle, Smile, Zap, Brain, 
    Crown, BookOpen, FileText, List, CloudRain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, Usuario } from '../lib/storage';
import { consumeCredits, hasEnoughCredits, getUserCredits, getCreditCosts } from '../lib/credits';
import ModalCreditos from '../components/ai/ModalCreditos';
import { generateWordSearchWords } from '../lib/services/aiService';
import { toast } from 'sonner';

type Mode = 'topic' | 'custom';
type Difficulty = 'Fácil' | 'Medio' | 'Difícil';

interface WordGameState {
    word: string;
    guessedLetters: string[];
    livesLeft: number;
    status: 'pending' | 'success' | 'failed';
    hintsUsed: number;
}

const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
    ["Z", "X", "C", "V", "B", "N", "M"]
];

export default function BajoLaLluvia() {
    const [user, setUser] = useState<Usuario | null>(null);
    const [mode, setMode] = useState<Mode>('topic');
    const [topic, setTopic] = useState('');
    const [customText, setCustomText] = useState('');
    const [customType, setCustomType] = useState<'text' | 'list'>('text');
    const [customWords, setCustomWords] = useState<string[]>(['', '', '']);
    const [difficulty, setDifficulty] = useState<Difficulty>('Medio');
    const [numWords, setNumWords] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    
    // Game Phase States
    const [phase, setPhase] = useState<'config' | 'game' | 'summary'>('config');
    const [gameStates, setGameStates] = useState<WordGameState[]>([]);
    const [currentWordIdx, setCurrentWordIdx] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [elapsedTime, setElapsedTime] = useState(0);

    const gameContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setUser(getCurrentUser());
        
        // Listen to user changes
        const handleUserChanged = () => setUser(getCurrentUser());
        window.addEventListener('plx:user_changed', handleUserChanged);
        return () => window.removeEventListener('plx:user_changed', handleUserChanged);
    }, []);

    // Fullscreen Event Handler
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Timer logic during game
    useEffect(() => {
        let interval: any;
        if (phase === 'game') {
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [phase, startTime]);

    const activeState = gameStates[currentWordIdx];

    // Keyboard physical event listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (phase !== 'game' || !activeState || activeState.status !== 'pending') return;
            const char = e.key.toUpperCase();
            if (char === 'Ñ' || (char.length === 1 && char >= 'A' && char <= 'Z')) {
                guessLetter(char);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase, activeState]);

    const guessLetter = (letter: string) => {
        if (!activeState || activeState.status !== 'pending') return;
        if (activeState.guessedLetters.includes(letter)) return;

        const updatedGuessed = [...activeState.guessedLetters, letter];
        const isCorrect = activeState.word.includes(letter);
        const nextLives = isCorrect ? activeState.livesLeft : activeState.livesLeft - 1;

        // Check success
        const cleanWord = activeState.word;
        const allLettersGuessed = [...cleanWord].every(l => updatedGuessed.includes(l));

        let nextStatus: 'pending' | 'success' | 'failed' = 'pending';
        if (allLettersGuessed) {
            nextStatus = 'success';
        } else if (nextLives <= 0) {
            nextStatus = 'failed';
        }

        const updatedStates = gameStates.map((state, idx) => {
            if (idx === currentWordIdx) {
                return {
                    ...state,
                    guessedLetters: updatedGuessed,
                    livesLeft: nextLives,
                    status: nextStatus
                };
            }
            return state;
        });

        setGameStates(updatedStates);
    };

    const handleUseHint = () => {
        if (!activeState || activeState.status !== 'pending') return;
        
        // Find letters that are in the word but not yet guessed
        const cleanWord = activeState.word;
        const unrevealedLetters = [...cleanWord].filter(l => !activeState.guessedLetters.includes(l));

        if (unrevealedLetters.length === 0) return;

        // Pick random letter
        const randomLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
        
        // Guess this letter
        const updatedGuessed = [...activeState.guessedLetters, randomLetter];
        
        // Check success
        const allLettersGuessed = [...cleanWord].every(l => updatedGuessed.includes(l));
        const nextStatus = allLettersGuessed ? 'success' as const : 'pending' as const;

        const updatedStates = gameStates.map((state, idx) => {
            if (idx === currentWordIdx) {
                return {
                    ...state,
                    guessedLetters: updatedGuessed,
                    status: nextStatus,
                    hintsUsed: state.hintsUsed + 1
                };
            }
            return state;
        });

        setGameStates(updatedStates);
        toast.success(`Pista utilizada: Se reveló la letra "${randomLetter}"`);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === 'topic' && !topic.trim()) {
            toast.error('Por favor escribe un tema para continuar.');
            return;
        }
        if (mode === 'custom') {
            if (customType === 'text' && !customText.trim()) {
                toast.error('Por favor ingresa las palabras o el texto fuente.');
                return;
            }
            if (customType === 'list') {
                const hasValidWord = customWords.some(w => w.trim().length >= 3);
                if (!hasValidWord) {
                    toast.error('Por favor ingresa al menos una palabra de 3 o más letras.');
                    return;
                }
            }
        }

        // Check credits (Only needed for AI topic generation)
        const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';
        const needsAI = mode === 'topic';
        if (needsAI && !isPremium && !hasEnoughCredits('bajo_la_lluvia')) {
            setShowLimitModal(true);
            return;
        }

        setIsGenerating(true);

        try {
            let words: string[] = [];
            if (mode === 'topic') {
                words = await generateWordSearchWords({
                    topic: topic.trim(),
                    numWords,
                    difficulty
                });
            } else if (mode === 'custom' && customType === 'text') {
                // Split custom text by lines, commas, or spaces
                const candidates = customText
                    .split(/[\n, ]+/)
                    .map(w => w.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, ''))
                    .filter(w => w.length >= 3);
                
                // Shuffle and limit candidates
                words = Array.from(new Set(candidates)).slice(0, numWords) as string[];
                
                if (words.length < 3) {
                    throw new Error('El texto proporcionado debe contener al menos 3 palabras válidas de 3 o más letras.');
                }
            } else if (mode === 'custom' && customType === 'list') {
                const candidates = customWords
                    .map(w => w.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, ''))
                    .filter(w => w.length >= 3);
                
                words = Array.from(new Set(candidates)) as string[];
            }

            // Consumir créditos si no es pro (silenciosamente)
            if (needsAI && !isPremium) {
                const consumed = consumeCredits('bajo_la_lluvia');
                if (!consumed) {
                    throw new Error('No posees suficientes Planix Coins para completar la generación.');
                }
            }

            // Initialize game state for generated words
            const initialStates = words.map(w => ({
                word: w,
                guessedLetters: [],
                livesLeft: 6,
                status: 'pending' as const,
                hintsUsed: 0
            }));

            setGameStates(initialStates);
            setCurrentWordIdx(0);
            setStartTime(Date.now());
            setElapsedTime(0);
            setPhase('game');
        } catch (err: any) {
            toast.error(err.message || 'Ocurrió un error al generar las palabras del juego.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNextWord = () => {
        if (currentWordIdx < gameStates.length - 1) {
            setCurrentWordIdx(currentWordIdx + 1);
        } else {
            setPhase('summary');
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        }
    };

    const toggleFullscreen = () => {
        if (!gameContainerRef.current) return;
        if (!document.fullscreenElement) {
            gameContainerRef.current.requestFullscreen().catch((err) => {
                toast.error("No se pudo iniciar el modo pantalla completa.");
                console.error(err);
            });
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    // SVG Drawing of the Cloud, Rain, and Character
    const renderRainySVG = (livesLeft: number) => {
        const mistakes = 6 - livesLeft;
        const cloudPath = "M 40 55 C 25 55, 20 40, 35 35 C 30 20, 45 10, 60 15 C 70 0, 85 0, 100 5 C 115 0, 130 0, 140 10 C 155 5, 170 15, 175 30 C 185 35, 185 45, 180 50 C 180 55, 170 55, 165 55 C 110 60, 70 60, 40 55 Z";

        let characterImg = "/Bajo la lluvia/Fase 1.webp";
        if (mistakes >= 1 && mistakes < 6) {
            characterImg = "/Bajo la lluvia/Fase 2.webp";
        } else if (mistakes >= 6) {
            characterImg = "/Bajo la lluvia/Fase 3.webp";
        }

        return (
            <svg 
                viewBox="0 0 220 250" 
                className={`w-full h-auto stroke-slate-800 dark:stroke-zinc-100 transition-all duration-300 ${
                    isFullscreen ? 'max-w-[380px]' : 'max-w-[280px]'
                }`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* Sun (Visible only when mistakes === 0) */}
                <AnimatePresence>
                    {mistakes === 0 && (
                        <motion.g
                            key="sun"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <circle cx="45" cy="30" r="14" className="fill-amber-400 dark:fill-amber-300 stroke-amber-500" strokeWidth="2" />
                            <line x1="45" y1="8" x2="45" y2="2" strokeWidth="2" className="stroke-amber-500" />
                            <line x1="45" y1="52" x2="45" y2="58" strokeWidth="2" className="stroke-amber-500" />
                            <line x1="23" y1="30" x2="17" y2="30" strokeWidth="2" className="stroke-amber-500" />
                            <line x1="67" y1="30" x2="73" y2="30" strokeWidth="2" className="stroke-amber-500" />
                            <line x1="29" y1="14" x2="25" y2="10" strokeWidth="2" className="stroke-amber-500" />
                            <line x1="61" y1="46" x2="65" y2="50" strokeWidth="2" className="stroke-amber-500" />
                            <line x1="61" y1="14" x2="65" y2="10" strokeWidth="2" className="stroke-amber-500" />
                            <line x1="29" y1="46" x2="25" y2="50" strokeWidth="2" className="stroke-amber-500" />
                        </motion.g>
                    )}
                </AnimatePresence>

                {/* Character Image from public assets */}
                <image
                    href={characterImg}
                    x="30"
                    y="80"
                    width="160"
                    height="160"
                />

                {/* Cloud Outline & Progressive Cloudy Fill */}
                {mistakes >= 1 && (
                    <>
                        {mistakes >= 2 && (
                            <motion.path 
                                d={cloudPath} 
                                className="stroke-none transition-colors duration-500"
                                style={{
                                    fill: 
                                        mistakes === 2 ? "rgba(148, 163, 184, 0.25)" :
                                        mistakes === 3 ? "rgba(148, 163, 184, 0.45)" :
                                        mistakes === 4 ? "rgba(100, 116, 139, 0.65)" :
                                        mistakes === 5 ? "rgba(71, 85, 105, 0.85)" :
                                        "rgba(47, 55, 71, 0.95)"
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            />
                        )}
                        <motion.path 
                            d={cloudPath} 
                            strokeWidth="3.5" 
                            className="stroke-slate-700 dark:stroke-zinc-400"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.8 }}
                        />
                    </>
                )}

                {/* Step 3: Light Rain (Diagonal Drops) */}
                {mistakes >= 3 && (
                    <>
                        <motion.line 
                            x1="70" y1="60" x2="65" y2="80" 
                            strokeWidth="2.5" 
                            className="stroke-blue-400/70 dark:stroke-blue-300/70" 
                            strokeDasharray="4 4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0], y: [0, 30] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                        <motion.line 
                            x1="110" y1="60" x2="105" y2="80" 
                            strokeWidth="2.5" 
                            className="stroke-blue-400/70 dark:stroke-blue-300/70" 
                            strokeDasharray="4 4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0], y: [0, 30] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.4 }}
                        />
                        <motion.line 
                            x1="150" y1="60" x2="145" y2="80" 
                            strokeWidth="2.5" 
                            className="stroke-blue-400/70 dark:stroke-blue-300/70" 
                            strokeDasharray="4 4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0], y: [0, 30] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.8 }}
                        />
                    </>
                )}

                {/* Step 4: Medium Rain */}
                {mistakes >= 4 && (
                    <>
                        <motion.line 
                            x1="90" y1="60" x2="85" y2="90" 
                            strokeWidth="2.5" 
                            className="stroke-blue-400 dark:stroke-blue-300" 
                            strokeDasharray="4 4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0], y: [0, 40] }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: "linear", delay: 0.2 }}
                        />
                        <motion.line 
                            x1="130" y1="60" x2="125" y2="90" 
                            strokeWidth="2.5" 
                            className="stroke-blue-400 dark:stroke-blue-300" 
                            strokeDasharray="4 4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0], y: [0, 40] }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: "linear", delay: 0.6 }}
                        />
                    </>
                )}

                {/* Step 5: Lightning Bolt */}
                {mistakes >= 5 && (
                    <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                    >
                        {/* Main central lightning bolt */}
                        <path 
                            d="M 110 55 L 98 80 L 112 80 L 102 105" 
                            strokeWidth="3.5" 
                            className="stroke-amber-500 fill-amber-500" 
                        />
                        {/* Left small lightning bolt */}
                        <path 
                            d="M 65 57 L 58 72 L 67 72 L 60 87" 
                            strokeWidth="2.2" 
                            className="stroke-amber-500 fill-amber-500" 
                        />
                        {/* Right small lightning bolt */}
                        <path 
                            d="M 155 57 L 148 72 L 157 72 L 150 87" 
                            strokeWidth="2.2" 
                            className="stroke-amber-500 fill-amber-500" 
                        />
                    </motion.g>
                )}

                {/* Step 6: Heavy Rain downpour */}
                {mistakes >= 6 && (
                    <>
                        {/* Direct rain on head */}
                        <motion.line 
                            x1="105" y1="60" x2="105" y2="120" 
                            strokeWidth="2.5" 
                            className="stroke-blue-500 dark:stroke-blue-400" 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0], y: [0, 50] }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        />
                        <motion.line 
                            x1="115" y1="60" x2="115" y2="120" 
                            strokeWidth="2.5" 
                            className="stroke-blue-500 dark:stroke-blue-400" 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0], y: [0, 50] }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: "linear", delay: 0.3 }}
                        />
                    </>
                )}
            </svg>
        );
    };

    const countCorrectWords = () => {
        return gameStates.filter(s => s.status === 'success').length;
    };

    const formatSeconds = (sec: number) => {
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';

    return (
        <div className="w-full flex-1 flex flex-col items-stretch">
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
                .plx-fullscreen-bg:fullscreen {
                    background-color: var(--bg-base) !important;
                }
            `}</style>
            
            {phase === 'config' && (
                <div className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
                    <header className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs mb-6 mt-4 select-none">
                        <Link to="/dinamicas" className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-4 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider">
                            <ArrowLeft className="w-3.5 h-3.5" /> Volver a Dinámicas
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


                    {/* Título Principal (HTML Rediseñado, Compacto y Estático) */}
                    <div className="print:hidden mb-5 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-600/10 dark:from-blue-500/15 dark:to-indigo-600/15 border border-blue-500/15 dark:border-blue-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full">
                        {/* Decoración de fondo */}
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                        
                        {/* Contenedor de Icono */}
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center shrink-0 border border-blue-500/30 dark:border-blue-500/40 relative">
                            <CloudRain className="w-5 h-5 md:w-6 h-6 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
                        </div>

                        {/* Textos */}
                        <div className="text-center md:text-left flex-1 relative z-10">
                            <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                                Bajo la Lluvia
                            </h1>
                            <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
                                Genera listas de palabras temáticas mediante Inteligencia Artificial y desafía a tus alumnos a resolverlas letra por letra.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-6 mb-12">
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
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="Ej: El Sistema Solar, Reinos de la Naturaleza, Frutas..."
                                            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:focus:border-zinc-700 dark:focus:ring-white/5 rounded-xl px-4 py-3 text-slate-800 dark:text-zinc-150 font-bold text-sm outline-none transition-all"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Selector de tipo personalizado (Texto vs Lista Manual) */}
                                        <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-zinc-950 p-1.5 rounded-2xl w-fit border border-slate-200/40 dark:border-zinc-800/80">
                                            <button 
                                                type="button" 
                                                onClick={() => setCustomType('text')} 
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                                    customType === 'text' 
                                                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                                                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                                                }`}
                                            >
                                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                                <span>Extraer de Texto</span>
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setCustomType('list')} 
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                                    customType === 'list' 
                                                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                                                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                                                }`}
                                            >
                                                <List className="w-3.5 h-3.5 shrink-0" />
                                                <span>Lista de Palabras</span>
                                            </button>
                                        </div>

                                        {customType === 'text' ? (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Texto Fuente</label>
                                                <textarea
                                                    value={customText}
                                                    onChange={(e) => setCustomText(e.target.value)}
                                                    placeholder="Pega aquí el contenido de lectura de tu clase para que la IA extraiga los términos clave..."
                                                    className="w-full h-32 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:focus:border-zinc-700 dark:focus:ring-white/5 rounded-xl px-4 py-3 text-slate-800 dark:text-zinc-150 font-medium text-sm outline-none transition-all resize-none"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                                                    Palabras del Juego (se enumeran automáticamente)
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {customWords.map((word, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-slate-400 dark:text-zinc-550 w-6 text-right select-none">
                                                                {idx + 1}.
                                                            </span>
                                                            <input
                                                                type="text"
                                                                value={word}
                                                                onChange={(e) => {
                                                                    const newWords = [...customWords];
                                                                    newWords[idx] = e.target.value;
                                                                    setCustomWords(newWords);
                                                                }}
                                                                placeholder={`Palabra ${idx + 1}`}
                                                                className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:focus:border-zinc-700 dark:focus:ring-white/5 rounded-xl px-4 py-2.5 text-slate-800 dark:text-zinc-150 font-bold text-sm outline-none transition-all"
                                                            />
                                                            {customWords.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newWords = customWords.filter((_, i) => i !== idx);
                                                                        setCustomWords(newWords);
                                                                    }}
                                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black transition-all cursor-pointer border-none shadow-sm active:scale-95 animate-in fade-in zoom-in-95 duration-150 shadow-rose-500/10"
                                                                    title="Eliminar palabra"
                                                                >
                                                                    <X size={16} strokeWidth={2.5} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => setCustomWords([...customWords, ''])}
                                                    className="mt-2 flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 border-none cursor-pointer shadow-emerald-600/10"
                                                >
                                                    <span className="text-base font-semibold leading-none">+</span>
                                                    <span>Añadir</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* PASO 2: Ajustes del Juego */}
                        <section className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs focus-within:shadow-xs transition-shadow">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">2</span>
                                <h2 className="text-lg font-black text-slate-800 dark:text-white">Ajustes del Juego</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 dark:text-zinc-400">Dificultad de las Palabras</label>
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
                                        {difficulty === 'Fácil' && '• Las palabras a generar serán cortas y simples para estudiantes pequeños.'}
                                        {difficulty === 'Medio' && '• Las palabras serán de longitud moderada para educación primaria.'}
                                        {difficulty === 'Difícil' && '• Las palabras serán técnicas o avanzadas para educación secundaria.'}
                                    </p>
                                </div>

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

                        <div className="flex justify-center pt-6 pb-8">
                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white text-[13px] font-black uppercase tracking-wider rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 shadow-brand-primary/20"
                            >
                                {isGenerating ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Sparkles className="w-4.5 h-4.5" />}
                                {isGenerating ? 'Generando dinámica...' : 'Generar dinámica'}
                            </button>
                        </div>
                    </form>
                </div>
            )}            {phase === 'game' && activeState && (
                <div 
                    ref={gameContainerRef}
                    className={`flex-1 flex flex-col w-full bg-transparent plx-fullscreen-bg ${
                        isFullscreen ? 'fixed inset-0 z-50 p-6 bg-bg-base overflow-y-auto' : 'py-6 px-4 md:px-8'
                    }`}
                >
                    {/* Game Header */}
                    <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-zinc-800 w-full max-w-6xl mx-auto">
                        {/* Left: Back Button */}
                        <div className="flex justify-start w-full md:w-auto">
                            <button
                                onClick={() => setShowExitConfirm(true)}
                                className="w-full md:w-auto flex items-center justify-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-4 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer border-none"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" /> Volver Atrás
                            </button>
                        </div>

                        {/* Center: Title */}
                        <div className="text-center flex flex-col items-center">
                            <div className="flex flex-col items-center">
                                <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                    Bajo la lluvia
                                </h1>
                                {mode === 'topic' && topic && (
                                    <span className="text-xs font-bold text-brand-primary mt-1">({topic})</span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold flex items-center gap-1.5 mt-1 justify-center">
                                <Timer size={13} className="text-blue-500" />
                                Tiempo transcurrido: {formatSeconds(elapsedTime)}
                            </p>
                        </div>

                        {/* Right: Fullscreen Button */}
                        <div className="flex justify-end w-full md:w-auto">
                            <button
                                onClick={toggleFullscreen}
                                className="w-full md:w-auto flex items-center justify-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-4 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer border-none"
                                title={isFullscreen ? "Salir Pantalla Completa" : "Pantalla Completa"}
                            >
                                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                <span>{isFullscreen ? 'Salir Pantalla Completa' : 'Pantalla Completa'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Pagination indicators */}
                    <div className={`w-full mx-auto mb-8 ${isFullscreen ? 'max-w-7xl' : 'max-w-6xl'}`}>
                        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-zinc-400 font-black uppercase tracking-wider mb-3">
                            <span>Palabra {currentWordIdx + 1} de {gameStates.length}</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{countCorrectWords()} correctas</span>
                        </div>
                        
                        {/* Page Dots Grid */}
                        <div className="flex flex-wrap gap-2.5 items-center justify-center p-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl shadow-3xs">
                            {gameStates.map((state, idx) => {
                                const isActive = currentWordIdx === idx;
                                const isSuccess = state.status === 'success';
                                const isFailed = state.status === 'failed';

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentWordIdx(idx)}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs md:text-sm border transition-all ${
                                            isActive
                                                ? 'bg-brand-primary border-brand-primary text-white shadow-xs scale-105'
                                                : isSuccess
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : isFailed
                                                ? 'bg-rose-500 border-rose-500 text-white'
                                                : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
                                        }`}
                                    >
                                        {isSuccess ? <Check size={14} strokeWidth={3} /> : isFailed ? <X size={14} strokeWidth={3} /> : idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Game Layout */}
                    <div className={`w-full mx-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-6 ${isFullscreen ? 'max-w-7xl' : 'max-w-6xl'}`}>
                        
                        {/* Left Card: Hangman SVG Board */}
                        <div className={`bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center shadow-3xs relative ${
                            isFullscreen ? 'p-10 min-h-[500px]' : 'p-6 min-h-[300px]'
                        }`}>
                            {activeState.status === 'pending' && (
                                <button
                                    onClick={handleUseHint}
                                    className={`absolute z-20 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/15 dark:border-amber-900/50 border border-amber-200 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-black transition-all shadow-3xs cursor-pointer ${
                                        isFullscreen ? 'top-6 right-6' : 'top-4 right-4'
                                    }`}
                                >
                                    <HelpCircle size={15} />
                                    <span>Pista</span>
                                </button>
                            )}

                             <div className="flex-1 flex items-center justify-center w-full">
                                {renderRainySVG(activeState.livesLeft)}
                            </div>
                            
                            <div className="mt-4 text-center">
                                <span className={`text-sm font-black uppercase tracking-wide px-4 py-1.5 rounded-full ${
                                    activeState.livesLeft <= 2
                                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                                }`}>
                                    Intentos restantes: <span className="font-extrabold text-base">{activeState.livesLeft}</span>
                                </span>
                            </div>
                        </div>

                        {/* Right Card: Guess Panel / Keyboard */}
                        <div className={`bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl flex flex-col justify-between shadow-3xs ${
                            isFullscreen ? 'p-10 min-h-[500px]' : 'p-6 min-h-[300px]'
                        }`}>
                            
                            {/* Word Spacing Representation */}
                            <div className="flex-1 flex flex-col items-center justify-center p-4">
                                <div className="flex flex-wrap gap-x-2 gap-y-4 justify-center mb-6">
                                    {[...activeState.word].map((letter, index) => {
                                        const isRevealed = activeState.guessedLetters.includes(letter) || activeState.status === 'failed';
                                        const wordLen = activeState.word.length;
                                        
                                        // Dynamic sizing based on word length to prevent line wrapping & overlapping layout breaks
                                        let boxSizeClass = "";
                                        if (isFullscreen) {
                                            if (wordLen <= 8) {
                                                boxSizeClass = "w-12 h-16 text-3xl md:text-5xl mx-1";
                                            } else if (wordLen <= 12) {
                                                boxSizeClass = "w-9 h-12 text-2xl md:text-4xl mx-0.5";
                                            } else {
                                                boxSizeClass = "w-7 h-10 text-xl md:text-3xl mx-0.5";
                                            }
                                        } else {
                                            if (wordLen <= 8) {
                                                boxSizeClass = "w-9 h-11 md:w-11 md:h-14 text-xl md:text-3.5xl";
                                            } else if (wordLen <= 12) {
                                                boxSizeClass = "w-7 h-9 md:w-8 md:h-11 text-lg md:text-2.5xl";
                                            } else {
                                                boxSizeClass = "w-5 h-7 md:w-6 md:h-9 text-sm md:text-lg";
                                            }
                                        }

                                        return (
                                            <div 
                                                key={index} 
                                                className={`border-b-[4px] flex items-end justify-center pb-2 font-black transition-all ${boxSizeClass} ${
                                                    isRevealed 
                                                        ? 'border-brand-primary text-slate-800 dark:text-white' 
                                                        : 'border-slate-300 dark:border-zinc-700 text-transparent'
                                                }`}
                                            >
                                                {isRevealed ? letter : ''}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Status overlays or virtual keyboard */}
                                <AnimatePresence mode="wait">
                                    {activeState.status === 'success' && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex flex-col items-center text-center space-y-4 pt-4"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-450 shadow-xs">
                                                <Check size={36} strokeWidth={3} />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black text-emerald-700 dark:text-emerald-400">¡Palabra Resuelta!</h4>
                                                <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold">¡Buen trabajo, adivinaste todas las letras!</p>
                                            </div>
                                            <button
                                                onClick={handleNextWord}
                                                className="bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 font-black px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider shadow-md cursor-pointer border-none"
                                            >
                                                <span>Continuar</span>
                                                <Play size={12} className="fill-current w-3 h-3 shrink-0" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {activeState.status === 'failed' && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex flex-col items-center text-center space-y-4 pt-4"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-xs">
                                                <X size={36} strokeWidth={3} />
                                            </div>
                                            <div className="space-y-1">
                                                 <h4 className="text-xl font-black text-rose-600 dark:text-rose-455">¡Empapado!</h4>
                                                <p className="text-sm text-slate-700 dark:text-zinc-300 font-bold">
                                                    La palabra era: <span className="font-extrabold text-slate-900 dark:text-white underline">{activeState.word}</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleNextWord}
                                                className="bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 font-black px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider shadow-md cursor-pointer border-none"
                                            >
                                                <span>Continuar</span>
                                                <Play size={12} className="fill-current w-3 h-3 shrink-0" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {activeState.status === 'pending' && (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="w-full space-y-3 pt-4"
                                        >
                                            {/* On-screen virtual keyboard */}
                                            {KEYBOARD_ROWS.map((row, rIdx) => (
                                                <div key={rIdx} className={`flex justify-center ${isFullscreen ? 'gap-2.5' : 'gap-1.5'}`}>
                                                    {row.map((char) => {
                                                        const isGuessed = activeState.guessedLetters.includes(char);
                                                        const isCorrect = activeState.word.includes(char);

                                                        return (
                                                            <button
                                                                key={char}
                                                                onClick={() => guessLetter(char)}
                                                                disabled={isGuessed}
                                                                className={`rounded-lg font-black transition-all flex items-center justify-center ${
                                                                    isFullscreen 
                                                                        ? 'w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg' 
                                                                        : 'w-7 h-9 sm:w-9 sm:h-11 md:w-10 md:h-12 text-xs sm:text-sm'
                                                                } ${
                                                                    isGuessed
                                                                        ? isCorrect
                                                                            ? 'bg-emerald-500 border border-emerald-500 text-white cursor-default'
                                                                            : 'bg-rose-500 border border-rose-500 text-white cursor-default'
                                                                        : 'bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs active:scale-95'
                                                                }`}
                                                            >
                                                                {char}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* RESUMEN FINAL */}
            {phase === 'summary' && (
                <div className="max-w-md mx-auto px-4 py-6 w-full flex-1 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 w-full shadow-lg text-center space-y-4"
                    >
                        <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/20 flex items-center justify-center text-amber-600 dark:text-amber-500">
                            <Trophy size={28} strokeWidth={2} />
                        </div>

                        <div className="space-y-0.5">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                                ¡Dinámica Completada!
                            </h2>
                            <p className="text-slate-500 dark:text-zinc-400 font-bold text-[10px] md:text-xs uppercase tracking-wide">
                                Resumen del juego
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-850">
                            <div className="text-center space-y-0.5 border-r border-slate-200 dark:border-zinc-800">
                                <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">
                                    {countCorrectWords()} <span className="text-xs font-bold text-slate-400">/ {gameStates.length}</span>
                                </span>
                                <p className="text-[9px] md:text-[10px] text-slate-500 dark:text-zinc-450 font-black uppercase tracking-wider">
                                    Adivinadas
                                </p>
                            </div>
                            <div className="text-center space-y-0.5">
                                <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">
                                    {formatSeconds(elapsedTime)}
                                </span>
                                <p className="text-[9px] md:text-[10px] text-slate-500 dark:text-zinc-450 font-black uppercase tracking-wider">
                                    Tiempo Total
                                </p>
                            </div>
                        </div>

                        {/* List of Words Summary */}
                        <div className="text-left space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Registro de palabras:</h4>
                            {gameStates.map((state, idx) => (
                                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-850 text-xs">
                                    <span className="font-extrabold text-slate-800 dark:text-zinc-200">{state.word}</span>
                                    <span className={`flex items-center gap-1 text-[10px] font-bold ${
                                        state.status === 'success'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-rose-600 dark:text-rose-400'
                                    }`}>
                                        {state.status === 'success' ? (
                                            <>
                                                <Check size={12} strokeWidth={2.5} />
                                                Resuelta
                                            </>
                                        ) : (
                                            <>
                                                <X size={12} strokeWidth={2.5} />
                                                Empapado
                                            </>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 flex flex-col gap-2.5">
                            <button
                                onClick={() => setPhase('config')}
                                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs md:text-sm font-black py-2.5 px-5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <RefreshCw size={14} />
                                Jugar de nuevo
                            </button>
                            
                            <Link
                                to="/dinamicas"
                                className="w-full border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-950 text-slate-700 dark:text-zinc-300 text-xs md:text-sm font-black py-2.5 px-5 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                Volver al catálogo
                            </Link>
                        </div>
                    </motion.div>
                </div>
            )}

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
                                    Preparando Bajo la Lluvia
                                </h4>
                                <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed font-bold">
                                    Seleccionando las mejores palabras y preparando el juego. Esto puede tomar unos segundos.
                                </p>
                            </div>

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
            )}

            <ModalCreditos
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                requiredCredits={getCreditCosts().bajo_la_lluvia}
                currentCredits={getUserCredits(user)}
                actionName="generar esta dinámica"
            />

            {showExitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-[400px] p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 mx-4 text-center space-y-5">
                        <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-550 dark:text-rose-455 flex items-center justify-center">
                            <AlertCircle size={28} />
                        </div>
                        
                        <div className="space-y-1.5">
                            <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                                ¿Salir del juego?
                            </h3>
                            <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed font-bold max-w-[280px] mx-auto">
                                ¿Estás seguro de que deseas salir del juego actual? Perderás el progreso de la partida.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowExitConfirm(false)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer border-none"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowExitConfirm(false);
                                    setPhase('config');
                                    if (document.fullscreenElement) {
                                        document.exitFullscreen().catch(() => {});
                                    }
                                }}
                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all shadow-md cursor-pointer border-none"
                            >
                                Sí, salir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
