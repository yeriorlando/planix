import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Maximize, CheckCircle2, XCircle } from 'lucide-react';

interface AfifClimbGameProps {
    operation: 'addition' | 'reduction' | 'multiplication' | 'distribution';
    difficulty: 'beginner' | 'amateur' | 'pro';
    onExit: () => void;
}

interface Question {
    q: string;
    ans: number;
}

export default function AfifClimbGame({ operation, difficulty, onExit }: AfifClimbGameProps) {
    const [p1Value, setP1Value] = useState('');
    const [p2Value, setP2Value] = useState('');
    const [p1Question, setP1Question] = useState<Question>({ q: '', ans: 0 });
    const [p2Question, setP2Question] = useState<Question>({ q: '', ans: 0 });
    const [p1Climb, setP1Climb] = useState(0); // 0 to 7
    const [p2Climb, setP2Climb] = useState(0); // 0 to 7
    const [winner, setWinner] = useState<number | null>(null);
    const [p1Status, setP1Status] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [p2Status, setP2Status] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [isStarting, setIsStarting] = useState(true);
    const [countdownCount, setCountdownCount] = useState(3);
    const [isInternalFullscreen, setIsInternalFullscreen] = useState(false);

    const WIN_LIMIT = 7;

    const generateQuestion = useCallback((): Question => {
        let max = 10;
        if (difficulty === 'amateur') max = 50;
        if (difficulty === 'pro') max = 100;

        let a = Math.floor(Math.random() * max) + 1;
        let b = Math.floor(Math.random() * max) + 1;

        if (operation === 'addition') return { q: `${a} + ${b}`, ans: a + b };
        if (operation === 'reduction') {
            if (a < b) [a, b] = [b, a];
            return { q: `${a} - ${b}`, ans: a - b };
        }
        if (operation === 'multiplication') {
             const mMax = difficulty === 'beginner' ? 10 : difficulty === 'amateur' ? 12 : 15;
             const ma = Math.floor(Math.random() * mMax) + 1;
             const mb = Math.floor(Math.random() * 10) + 1;
             return { q: `${ma} × ${mb}`, ans: ma * mb };
        }
        const dMax = difficulty === 'beginner' ? 10 : difficulty === 'amateur' ? 50 : 100;
        const db = Math.floor(Math.random() * 9) + 2;
        const da = db * (Math.floor(Math.random() * (dMax/db)) + 1);
        return { q: `${da} ÷ ${db}`, ans: da / db };
    }, [operation, difficulty]);

    useEffect(() => {
        setP1Question(generateQuestion());
        setP2Question(generateQuestion());
    }, [generateQuestion]);

    useEffect(() => {
        if (isStarting) {
            const timer = setInterval(() => {
                setCountdownCount(prev => {
                    if (prev === 0) {
                        clearInterval(timer);
                        setIsStarting(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isStarting]);

    const handleKeypad = (val: string, player: 1 | 2) => {
        const status = player === 1 ? p1Status : p2Status;
        if (winner || isStarting || status !== 'idle') return;
        const current = player === 1 ? p1Value : p2Value;
        const setter = player === 1 ? setP1Value : setP2Value;

        if (val === 'CE') {
            setter('');
        } else if (val === '=') {
            checkAnswer(player);
        } else {
            if (current.length < 5) setter(current + val);
        }
    };

    const checkAnswer = (player: 1 | 2) => {
        const val = player === 1 ? p1Value : p2Value;
        const q = player === 1 ? p1Question : p2Question;
        const statusSetter = player === 1 ? setP1Status : setP2Status;
        const valSetter = player === 1 ? setP1Value : setP2Value;
        const qSetter = player === 1 ? setP1Question : setP2Question;
        const climbSetter = player === 1 ? setP1Climb : setP2Climb;

        if (parseInt(val) === q.ans) {
            statusSetter('correct');
            climbSetter(prev => {
                const next = Math.min(prev + 1, WIN_LIMIT);
                if (next === WIN_LIMIT) setWinner(player);
                return next;
            });
            setTimeout(() => {
                statusSetter('idle');
                valSetter('');
                qSetter(generateQuestion());
            }, 800);
        } else {
            statusSetter('wrong');
            climbSetter(prev => Math.max(prev - 1, 0)); // Slippery!
            setTimeout(() => {
                statusSetter('idle');
                valSetter('');
            }, 800);
        }
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsInternalFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsInternalFullscreen(false);
            }
        }
    };

    useEffect(() => {
        const handleFs = () => setIsInternalFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFs);
        return () => document.removeEventListener('fullscreenchange', handleFs);
    }, []);

    const getYPos = (climb: number) => {
        return (climb * (78 / WIN_LIMIT));
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-[#d6eaff] to-[#a7f3d0] flex flex-col items-center justify-center p-4 overflow-hidden z-50">
            <div className={`transition-all duration-700 ${isStarting ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} text-center mb-4`}>
                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter drop-shadow-sm">
                    Escalada matemática al poste
                </h1>
            </div>

            <div className="flex items-center justify-between w-full max-w-7xl relative gap-8">
                <div className="flex-shrink-0 flex flex-col items-center">
                    <Keypad 
                        value={p1Value} 
                        question={p1Question.q} 
                        onKey={(v: string) => handleKeypad(v, 1)} 
                        status={p1Status}
                        color="bg-[#1e88e5]"
                        isLarge={isInternalFullscreen}
                    />
                    {/* External Score Badge for P1 */}
                    <div className="mt-4 bg-white/90 backdrop-blur-md py-1.5 px-6 rounded-full border-2 border-white shadow-lg flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Correcto:</span>
                        <span className="text-xl font-black text-slate-700 leading-none">{p1Climb}/7</span>
                    </div>
                </div>

                {/* Central Climbing Area - Two Poles */}
                <div className={`relative flex-grow flex items-end justify-center transition-all ${isInternalFullscreen ? 'h-[80vh]' : 'h-[550px]'} gap-16 pb-20`}>
                    
                    {/* Pole 1 Area */}
                    <div className="relative h-full flex flex-col items-center justify-end">
                        <img 
                            src="/assets/games/afif/torre.png" 
                            alt="Tower 1" 
                            className="h-[95%] object-contain relative z-0"
                        />
                        {/* Character 1 (Left Pole) */}
                        <motion.div 
                            animate={{ 
                                bottom: `${getYPos(p1Climb)}%`,
                                x: (p1Status !== 'idle' || p1Climb > 0) ? -10 : -32
                            }}
                            initial={{ bottom: `${getYPos(0)}%` }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute z-10 left-1/2"
                            style={{ translateX: '-50%' }}
                        >
                            <img 
                                src={p1Status !== 'idle' || (p1Climb > 0 && p1Climb < WIN_LIMIT) ? "/assets/games/afif/escalando izquierdo.png" : "/assets/games/afif/de pie izquierdo.png"}
                                alt="P1"
                                className={`${isInternalFullscreen ? 'h-[16vh]' : 'h-28'} object-contain`}
                            />
                        </motion.div>
                    </div>

                    {/* Pole 2 Area */}
                    <div className="relative h-full flex flex-col items-center justify-end">
                        <img 
                            src="/assets/games/afif/torre.png" 
                            alt="Tower 2" 
                            className="h-[95%] object-contain relative z-0"
                        />
                         {/* Character 2 (Right Pole) */}
                        <motion.div 
                            animate={{ 
                                bottom: `${getYPos(p2Climb)}%`,
                                x: (p2Status !== 'idle' || p2Climb > 0) ? 10 : 32
                            }}
                            initial={{ bottom: `${getYPos(0)}%` }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute z-10 left-1/2"
                            style={{ translateX: '-50%' }}
                        >
                            <img 
                                src={p2Status !== 'idle' || (p2Climb > 0 && p2Climb < WIN_LIMIT) ? "/assets/games/afif/escalando derecho.png" : "/assets/games/afif/de pie derecho.png"}
                                alt="P2"
                                className={`${isInternalFullscreen ? 'h-[16vh]' : 'h-28'} object-contain`}
                            />
                        </motion.div>
                    </div>

                    {/* Instruction helper */}
                    <div className="absolute bottom-2 text-center w-full">
                         <p className="text-[13px] font-black text-slate-700 uppercase tracking-tighter bg-white/80 backdrop-blur-md px-8 py-2.5 rounded-full inline-block shadow-lg border border-white">
                            ¡Responde a las preguntas para subir al poste! (7 respuestas para ganar)
                         </p>
                    </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center">
                    <Keypad 
                        value={p2Value} 
                        question={p2Question.q} 
                        onKey={(v: string) => handleKeypad(v, 2)} 
                        status={p2Status}
                        color="bg-[#e53935]"
                        isLarge={isInternalFullscreen}
                    />
                    {/* External Score Badge for P2 */}
                    <div className="mt-4 bg-white/90 backdrop-blur-md py-1.5 px-6 rounded-full border-2 border-white shadow-lg flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Correcto:</span>
                        <span className="text-xl font-black text-slate-700 leading-none">{p2Climb}/7</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isStarting && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#3b82f6]/95 z-[200] flex flex-col items-center justify-center text-white"
                    >
                        <motion.div 
                            key={countdownCount}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.1, opacity: 1 }}
                            className="flex flex-col items-center"
                        >
                            <span className={`
                                font-black leading-none drop-shadow-2xl
                                ${countdownCount <= 0 
                                    ? 'text-[6rem] text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]' 
                                    : 'text-[7rem]'}
                            `}>
                                {countdownCount <= 0 ? '¡EMPIEZA!' : countdownCount}
                            </span>
                            
                            <motion.p 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className={`
                                    text-2xl font-black tracking-[0.2em] uppercase mt-4
                                    ${countdownCount <= 0 ? 'text-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]' : 'text-white/90'}
                                `}
                            >
                                {countdownCount === 3 ? "¡PREPÁRATE!" : countdownCount === 2 ? "¡CONCÉNTRATE!" : countdownCount === 1 ? "¡ENFÓCATE!" : "¡A JUGAR!"}
                            </motion.p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`fixed bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none transition-opacity duration-500 ${isStarting ? 'opacity-0' : 'opacity-100'}`}>
                <button onClick={onExit} className="p-3 bg-white rounded-full shadow-xl hover:shadow-2xl pointer-events-auto border-2 border-slate-100 group cursor-pointer">
                    <Home className="text-slate-600 group-hover:text-[#3b82f6] transition-colors" size={24} />
                </button>
                <button onClick={toggleFullScreen} className="p-3 bg-white rounded-full shadow-xl hover:shadow-2xl pointer-events-auto border-2 border-slate-100 group cursor-pointer">
                    <Maximize className="text-slate-600 group-hover:text-[#3b82f6] transition-colors" size={24} />
                </button>
            </div>

            <AnimatePresence>
                {winner && (
                    <>
                        <Confetti />
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
                            <motion.div 
                                initial={{ scale: 0.8, y: 30 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-gradient-to-br from-[#1e88e5] to-[#1565c0] rounded-[3rem] p-8 text-center space-y-4 max-w-[580px] w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-2 border-white/30 relative overflow-hidden"
                            >
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                
                                <div className="flex items-center justify-center gap-4">
                                    <span className="text-4xl drop-shadow-lg">🏆</span>
                                    <h2 className="text-2xl font-black tracking-tight text-white leading-tight uppercase">
                                        ¡EL JUGADOR {winner === 1 ? 'IZQUIERDO' : 'DERECHO'} GANA!
                                    </h2>
                                    <span className="text-4xl drop-shadow-lg">🏆</span>
                                </div>
                                
                                <p className="text-sm text-white/90 font-medium px-4 leading-relaxed max-w-[450px] mx-auto">
                                    ¡Increíble! Has escalado hasta lo más alto con tu poder matemático.
                                </p>
                                
                                <div className="pt-2">
                                    <button 
                                        onClick={() => { setWinner(null); setP1Climb(0); setP2Climb(0); setIsStarting(true); setCountdownCount(3); }}
                                        className="bg-white text-[#1e88e5] px-12 py-3 rounded-2xl text-lg font-bold shadow-lg transition-all hover:scale-[1.05] active:scale-[0.98] hover:shadow-xl cursor-pointer border-none"
                                    >
                                        Jugar de Nuevo
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function Confetti() {
    const [isVisible, setIsVisible] = useState(true);
    const particles = Array.from({ length: 120 });
    const colors = ['#ffcc00', '#ff3366', '#33ccff', '#33ff99', '#ff9933', '#ffffff', '#1e88e5'];
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(false), 5000);
        return () => clearTimeout(timer);
    }, []);
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 pointer-events-none z-[120] overflow-hidden">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ x: Math.random() * 100 + 'vw', y: -20, rotate: 0, scale: Math.random() * 0.5 + 0.5 }}
                    animate={{ y: '110vh', rotate: Math.random() * 1000, x: (Math.random() * 100 - 10) + 'vw' }}
                    transition={{ duration: Math.random() * 2 + 1.5, ease: "easeOut", delay: Math.random() * 0.5 }}
                    className="absolute w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
                />
            ))}
        </div>
    );
}

function Keypad({ value, question, onKey, status, color, isLarge }: any) {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CE', '0', '='];

    return (
        <div className={`bg-white/60 backdrop-blur-xl border-4 border-white rounded-[2.5rem] p-3 shadow-xl transition-all duration-500 ${isLarge ? 'w-[250px] space-y-4' : 'w-[220px] space-y-3'}`}>
            {/* Question Card */}
            <div className={`${color} rounded-[1.2rem] transition-all duration-500 ${isLarge ? 'p-5' : 'p-3'} text-center shadow-lg relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                <h3 className={`${isLarge ? 'text-3xl' : 'text-2xl'} font-black text-white tracking-widest`}>{question} = ?</h3>
            </div>

            {/* Input Display */}
            <div className={`bg-white rounded-2xl p-3 flex items-center justify-center shadow-inner border-2 border-slate-100 relative overflow-hidden transition-all duration-500 ${isLarge ? 'h-16' : 'h-14'}`}>
                <span className={`${isLarge ? 'text-3xl' : 'text-2xl'} font-black text-slate-800 tracking-widest`}>{value}</span>
                {status === 'correct' && <CheckCircle2 className="absolute right-3 text-emerald-500 animate-bounce" size={isLarge ? 28 : 20} />}
                {status === 'wrong' && <XCircle className="absolute right-3 text-red-500 animate-shake" size={isLarge ? 28 : 20} />}
            </div>

            {/* Grid */}
            <div className={`grid grid-cols-3 transition-all duration-500 ${isLarge ? 'gap-3' : 'gap-2'}`}>
                {keys.map((k, i) => (
                    <button
                        key={`key-${k}-${i}`}
                        onClick={() => onKey(k)}
                        className={`
                            rounded-xl flex items-center justify-center font-black transition-all active:scale-90 shadow-sm cursor-pointer border-none
                            ${isLarge ? 'h-14 text-xl' : 'h-11 text-lg'}
                            ${k === 'CE' ? 'bg-[#f0655e] text-white hover:bg-red-600' : 
                              k === '=' ? 'bg-[#6dabf4] text-white hover:bg-blue-600' : 
                              'bg-white text-slate-700 hover:bg-slate-50'}
                        `}
                    >
                        {k}
                    </button>
                ))}
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
