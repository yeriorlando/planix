import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Minus, X, Divide, ChevronRight, ArrowLeft, Star,
  BookOpen, School, PenTool, Languages, Lightbulb, Target, 
  FlaskConical, Palette, Library, BookMarked, Brain, GraduationCap, 
  Atom, Scroll, Shapes, Globe, Compass, Notebook, Award, Calculator, Music 
} from 'lucide-react';
import AfifTugOfWar from './AfifTugOfWar';
import AfifClimbGame from './AfifClimbGame';
import AfifSackRace from './AfifSackRace';

type GameState = 'menu' | 'select-ops' | 'select-diff' | 'playing' | 'game-over';
type GameType = 'tira-y-afloja' | 'escalar-poste' | 'carrera-sacos';
type Operation = 'addition' | 'reduction' | 'multiplication' | 'distribution';
type Difficulty = 'beginner' | 'amateur' | 'pro';

export default function AfifPortal() {
    const navigate = useNavigate();
    const [state, setState] = useState<GameState>('menu');
    const [gameType, setGameType] = useState<GameType>('tira-y-afloja');
    const [operation, setOperation] = useState<Operation>('addition');
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');

    const selectGame = (type: GameType) => {
        setGameType(type);
        setState('select-ops');
    };

    const selectOp = (op: Operation) => {
        setOperation(op);
        setState('select-diff');
    };

    const selectDiff = (diff: Difficulty) => {
        setDifficulty(diff);
        setState('playing');
    };

    const goBack = () => {
        if (state === 'select-ops') setState('menu');
        if (state === 'select-diff') setState('select-ops');
        if (state === 'playing') setState('select-diff');
    };

    return (
        <div className="fixed inset-0 bg-[#f5f6f8] dark:bg-[#0b0f19] flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto z-40 select-none">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-card-pink/15 dark:bg-card-pink/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-card-green/15 dark:bg-card-green/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Academic Icons Background */}
            <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.02] pointer-events-none z-0 overflow-hidden">
                {/* Left Side */}
                <BookOpen className="absolute top-8 left-6 text-neutral-900 dark:text-white" size={75} style={{ transform: "rotate(-12deg)" }} />
                <School className="absolute top-12 left-[22%] text-neutral-900 dark:text-white" size={65} style={{ transform: "rotate(-8deg)" }} />
                <PenTool className="absolute top-[30%] left-[28%] text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(15deg)" }} />
                <Languages className="absolute top-[26%] left-16 text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(15deg)" }} />
                <Lightbulb className="absolute top-[48%] left-6 text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(25deg)" }} />
                <Target className="absolute top-[56%] left-[24%] text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(-10deg)" }} />
                <FlaskConical className="absolute bottom-[24%] left-24 text-neutral-905 dark:text-white" size={60} style={{ transform: "rotate(-20deg)" }} />
                <Palette className="absolute bottom-32 left-[14%] text-neutral-900 dark:text-white" size={70} style={{ transform: "rotate(-15deg)" }} />
                <Library className="absolute bottom-10 left-8 text-neutral-900 dark:text-white" size={80} style={{ transform: "rotate(10deg)" }} />
                <BookMarked className="absolute bottom-[5%] left-[26%] text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(12deg)" }} />

                {/* Center Bottom */}
                <Brain className="absolute bottom-[6%] left-[48%] text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(-5deg)" }} />

                {/* Right Side */}
                <GraduationCap className="absolute top-8 right-6 text-neutral-900 dark:text-white" size={85} style={{ transform: "rotate(15deg)" }} />
                <Atom className="absolute top-12 right-[22%] text-neutral-900 dark:text-white" size={75} style={{ transform: "rotate(-5deg)" }} />
                <Scroll className="absolute top-[30%] right-[28%] text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(-15deg)" }} />
                <Shapes className="absolute top-[26%] right-16 text-neutral-900 dark:text-white" size={65} style={{ transform: "rotate(-10deg)" }} />
                <Globe className="absolute top-[48%] right-6 text-neutral-900 dark:text-white" size={70} style={{ transform: "rotate(-15deg)" }} />
                <Compass className="absolute top-[56%] right-[24%] text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(12deg)" }} />
                <Notebook className="absolute bottom-[24%] right-24 text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(18deg)" }} />
                <Award className="absolute bottom-32 right-[14%] text-neutral-900 dark:text-white" size={75} style={{ transform: "rotate(-20deg)" }} />
                <Calculator className="absolute bottom-10 right-8 text-neutral-900 dark:text-white" size={70} style={{ transform: "rotate(12deg)" }} />
                <Music className="absolute bottom-[5%] right-[26%] text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(-8deg)" }} />
            </div>

            {/* Global Back to Games Button */}
            {state !== 'playing' && (
                <button 
                    onClick={() => navigate('/dinamicas')}
                    className="absolute top-6 left-6 hidden md:flex items-center gap-2 px-5 py-2.5 text-white rounded-full text-xs font-black transition-all border-0 shadow-md bg-[#1e88e5] hover:bg-[#1e88e5]/90 z-[100] cursor-pointer uppercase tracking-wider"
                >
                    <ArrowLeft size={14} />
                    <span>Volver atrás</span>
                </button>
            )}

            <AnimatePresence mode="wait">
                {state === 'menu' && (
                    <motion.div 
                        key="menu"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[32px] p-6 md:p-8 border border-black/5 dark:border-white/10 shadow-2xl max-w-[440px] w-full text-center space-y-5 relative z-10"
                    >
                        <header className="space-y-1.5">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Juegos de matemáticas</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Selecciona un tema para comenzar</p>
                        </header>

                        <div className="space-y-4">
                            {[
                                {
                                    id: 'tira-y-afloja',
                                    title: 'Tira y afloja',
                                    subtitle: 'Inspirado por el profesor Saloom',
                                    img: '/assets/games/afif/tira y afloja.png',
                                    color: 'bg-red-400',
                                    cardBg: 'from-red-50/50 via-white to-white dark:from-red-950/15 dark:via-slate-900/90 dark:to-slate-900/90 hover:from-red-50/80 dark:hover:from-red-950/25',
                                    cardBorder: 'border-red-100/60 dark:border-red-900/30',
                                    imgBorder: 'border-red-100 dark:border-red-900/40'
                                },
                                {
                                    id: 'escalar-poste',
                                    title: 'Escalada al poste',
                                    subtitle: '¡Sube hasta la cima de la torre!',
                                    img: '/assets/games/afif/Juego de la escalada.png',
                                    color: 'bg-teal-400',
                                    cardBg: 'from-teal-50/50 via-white to-white dark:from-teal-950/15 dark:via-slate-900/90 dark:to-slate-900/90 hover:from-teal-50/80 dark:hover:from-teal-950/25',
                                    cardBorder: 'border-teal-100/60 dark:border-teal-900/30',
                                    imgBorder: 'border-teal-100 dark:border-teal-900/40'
                                },
                                {
                                    id: 'carrera-sacos',
                                    title: 'Carrera de sacos',
                                    subtitle: '¡Suma respuestas correctas y salta a la meta!',
                                    img: '/assets/games/afif/carrera de sacos.png',
                                    color: 'bg-pink-400',
                                    cardBg: 'from-pink-50/50 via-white to-white dark:from-pink-950/15 dark:via-slate-900/90 dark:to-slate-900/90 hover:from-pink-50/80 dark:hover:from-pink-950/25',
                                    cardBorder: 'border-pink-100/60 dark:border-pink-900/30',
                                    imgBorder: 'border-pink-100 dark:border-pink-900/40'
                                }
                            ].map((game) => (
                                <button 
                                    key={game.id}
                                    onClick={() => selectGame(game.id as GameType)}
                                    className={`w-full bg-gradient-to-r ${game.cardBg} border ${game.cardBorder} p-3 rounded-[20px] flex items-center gap-4 shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-98 group cursor-pointer text-left relative overflow-hidden`}
                                >
                                    {/* Left Accent indicator */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${game.color}`} />
                                    
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border ${game.imgBorder} overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                         <img src={game.img} alt={game.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <h3 className="text-[18px] font-bold text-slate-800 dark:text-white group-hover:text-[#1e88e5] dark:group-hover:text-blue-400 transition-colors leading-tight">{game.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-snug font-medium">{game.subtitle}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1e88e5] dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
                                </button>
                            ))}
                        </div>

                        <div className="pt-2 flex flex-col items-center justify-center">
                            <span className="text-[18px] md:text-[20px] text-[#1e88e5] dark:text-blue-400 font-black tracking-tight select-none">Planix + Afifedu</span>
                        </div>
                    </motion.div>
                )}

                {state === 'select-ops' && (
                    <motion.div 
                        key="select-ops"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[32px] p-6 md:p-8 border border-black/5 dark:border-white/10 shadow-2xl max-w-[380px] w-full text-center space-y-5 relative z-10"
                    >
                        <header className="space-y-1.5">
                            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                                {gameType === 'tira-y-afloja' ? 'Tira y afloja matemático' : gameType === 'escalar-poste' ? 'Escalada matemática' : 'Carrera matemática'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Selecciona el tipo de operación</p>
                        </header>

                        <div className="grid gap-2.5">
                            {[
                                { id: 'addition', label: 'Adición', icon: <Plus size={16} className="stroke-[3]" />, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/25 border-blue-500/20' },
                                { id: 'reduction', label: 'Reducción', icon: <Minus size={16} className="stroke-[3]" />, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/25 border-indigo-500/20' },
                                { id: 'multiplication', label: 'Multiplicación', icon: <X size={12} className="stroke-[3]" />, color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/25 border-purple-500/20' },
                                { id: 'distribution', label: 'Distribución', icon: <Divide size={16} className="stroke-[3]" />, color: 'text-pink-600 dark:text-pink-400 bg-pink-500/10 dark:bg-pink-500/25 border-pink-500/20' },
                            ].map((op) => (
                                <button 
                                    key={op.id}
                                    onClick={() => selectOp(op.id as Operation)}
                                    className="w-full bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/80 p-3 rounded-xl flex items-center gap-3 transition-all hover:-translate-y-0.5 active:scale-98 group cursor-pointer text-left shadow-2xs"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${op.color}`}>
                                        {op.icon}
                                    </div>
                                    <span className="text-slate-800 dark:text-slate-200 font-bold text-base group-hover:text-[#1e88e5] dark:group-hover:text-blue-400 transition-colors flex-1">{op.label}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1e88e5] dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
                                </button>
                            ))}
                            
                            <button 
                                onClick={goBack}
                                className="w-full text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 p-3 rounded-xl font-bold transition-all mt-4 text-sm flex items-center justify-center gap-2 border-0 cursor-pointer"
                            >
                                <ArrowLeft size={16} />
                                <span>Volver</span>
                            </button>
                        </div>

                        <div className="pt-2 flex flex-col items-center justify-center">
                            <span className="text-[18px] md:text-[20px] text-[#1e88e5] dark:text-blue-400 font-black tracking-tight select-none">Planix + Afifedu</span>
                        </div>
                    </motion.div>
                )}

                {state === 'select-diff' && (
                    <motion.div 
                        key="select-diff"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[32px] p-6 md:p-8 border border-black/5 dark:border-white/10 shadow-2xl max-w-[390px] w-full text-center space-y-5 relative z-10"
                    >
                        <header className="space-y-1.5">
                            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Nivel de dificultad</h1>
                            <p className="text-slate-405 dark:text-slate-505 text-[9px] font-extrabold uppercase tracking-widest">
                                Modo: {operation === 'addition' ? 'Adición' : operation === 'reduction' ? 'Reducción' : operation === 'multiplication' ? 'Multiplicación' : 'Distribución'}
                            </p>
                        </header>

                        <div className="space-y-3">
                            {[
                                { 
                                    id: 'beginner', 
                                    label: 'Principiante', 
                                    sub: '1 dígito + 1 dígito', 
                                    color: 'bg-emerald-500', 
                                    stars: 1, 
                                    themeClasses: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400',
                                    cardBg: 'from-emerald-50/50 via-white to-white dark:from-emerald-950/15 dark:via-slate-900/90 dark:to-slate-900/90 hover:from-emerald-50/80 dark:hover:from-emerald-950/25',
                                    cardBorder: 'border-emerald-100/60 dark:border-emerald-900/30'
                                },
                                { 
                                    id: 'amateur', 
                                    label: 'Aficionado', 
                                    sub: '1 dígito + 2 dígitos (mixto)', 
                                    color: 'bg-amber-500', 
                                    stars: 2, 
                                    themeClasses: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400',
                                    cardBg: 'from-amber-50/50 via-white to-white dark:from-amber-950/15 dark:via-slate-900/90 dark:to-slate-900/90 hover:from-amber-50/80 dark:hover:from-amber-950/25',
                                    cardBorder: 'border-amber-100/60 dark:border-amber-900/30'
                                },
                                { 
                                    id: 'pro', 
                                    label: 'Pro', 
                                    sub: '2 dígitos + 2 dígitos', 
                                    color: 'bg-rose-500', 
                                    stars: 3, 
                                    themeClasses: 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-200/60 dark:border-rose-800/40 text-rose-600 dark:text-rose-450',
                                    cardBg: 'from-rose-50/50 via-white to-white dark:from-rose-950/15 dark:via-slate-900/90 dark:to-slate-900/90 hover:from-rose-50/80 dark:hover:from-rose-950/25',
                                    cardBorder: 'border-rose-100/60 dark:border-rose-900/30'
                                },
                            ].map((d) => (
                                <button 
                                    key={d.id}
                                    onClick={() => selectDiff(d.id as Difficulty)}
                                    className={`w-full bg-gradient-to-r ${d.cardBg} border ${d.cardBorder} p-3 rounded-xl flex items-center gap-3 transition-all hover:-translate-y-0.5 active:scale-98 group cursor-pointer text-left relative overflow-hidden shadow-2xs hover:shadow-md`}
                                >
                                    {/* Left Accent indicator */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${d.color}`} />

                                    <div className={`w-12 h-10 rounded-lg flex items-center justify-center gap-0.5 shrink-0 border ${d.themeClasses}`}>
                                        {[...Array(d.stars)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <h4 className="text-base font-bold text-slate-800 dark:text-white leading-tight">{d.label}</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">{d.sub}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1e88e5] dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
                                </button>
                            ))}
                            
                            <button 
                                onClick={goBack}
                                className="w-full text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 p-3 rounded-xl font-bold transition-all mt-4 text-sm flex items-center justify-center gap-2 border-0 cursor-pointer"
                            >
                                <ArrowLeft size={16} />
                                <span>Volver</span>
                            </button>
                        </div>

                        <div className="pt-2 flex flex-col items-center justify-center">
                            <span className="text-[18px] md:text-[20px] text-[#1e88e5] dark:text-blue-400 font-black tracking-tight select-none">Planix + Afifedu</span>
                        </div>
                    </motion.div>
                )}

                {state === 'playing' && (
                    <motion.div 
                        key="playing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full"
                    >
                        {gameType === 'tira-y-afloja' ? (
                            <AfifTugOfWar 
                                operation={operation} 
                                difficulty={difficulty} 
                                onExit={() => navigate('/dinamicas')} 
                            />
                        ) : gameType === 'escalar-poste' ? (
                            <AfifClimbGame 
                                operation={operation} 
                                difficulty={difficulty} 
                                onExit={() => navigate('/dinamicas')} 
                            />
                        ) : (
                            <AfifSackRace 
                                operation={operation} 
                                difficulty={difficulty} 
                                onExit={() => navigate('/dinamicas')} 
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;900&display=swap');
                body {
                    font-family: 'Outfit', sans-serif;
                }
            `}</style>
        </div>
    );
}
