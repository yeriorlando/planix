import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, CheckCircle2, XCircle, Maximize } from 'lucide-react';

interface AfifTugOfWarProps {
    operation: 'addition' | 'reduction' | 'multiplication' | 'distribution';
    difficulty: 'beginner' | 'amateur' | 'pro';
    onExit: () => void;
}

interface Question {
    q: string;
    ans: number;
}

export default function AfifTugOfWar({ operation, difficulty, onExit }: AfifTugOfWarProps) {
    const [p1Value, setP1Value] = useState('');
    const [p2Value, setP2Value] = useState('');
    const [p1Question, setP1Question] = useState<Question>({ q: '', ans: 0 });
    const [p2Question, setP2Question] = useState<Question>({ q: '', ans: 0 });
    const [ropePos, setRopePos] = useState(0); // -100 to 100
    const [winner, setWinner] = useState<number | null>(null);
    const [p1Status, setP1Status] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [p2Status, setP2Status] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [isStarting, setIsStarting] = useState(true);
    const [countdownCount, setCountdownCount] = useState(3);
    const [p1Score, setP1Score] = useState(0);
    const [p2Score, setP2Score] = useState(0);

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
        // Division
        const dMax = difficulty === 'beginner' ? 10 : difficulty === 'amateur' ? 50 : 100;
        const db = Math.floor(Math.random() * 9) + 2;
        const da = db * (Math.floor(Math.random() * (dMax/db)) + 1);
        return { q: `${da} ÷ ${db}`, ans: da / db };
    }, [operation, difficulty]);

    useEffect(() => {
        setP1Question(generateQuestion());
        setP2Question(generateQuestion());
        
        // Countdown Logic
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
    }, [generateQuestion, isStarting]);

    const handleKeypad = (val: string, player: 1 | 2) => {
        if (winner || isStarting) return;
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

        if (parseInt(val) === q.ans) {
            statusSetter('correct');
            setRopePos(prev => {
                const newPos = player === 1 ? prev - 15 : prev + 15;
                if (newPos <= -75) setWinner(1);
                if (newPos >= 75) setWinner(2);
                return newPos;
            });
            if (player === 1) setP1Score(prev => prev + 1);
            else setP2Score(prev => prev + 1);
            setTimeout(() => {
                statusSetter('idle');
                valSetter('');
                qSetter(generateQuestion());
            }, 500);
        } else {
            statusSetter('wrong');
            setTimeout(() => {
                statusSetter('idle');
                valSetter('');
            }, 500);
        }
    };

    const [isInternalFullscreen, setIsInternalFullscreen] = useState(false);

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

    // Listen for escape key or other ways fullscreen is exited
    useEffect(() => {
        const handleFs = () => setIsInternalFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFs);
        return () => document.removeEventListener('fullscreenchange', handleFs);
    }, []);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#d6eaff] transition-all overflow-hidden z-50">
            <AnimatePresence>
                {isStarting && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-gradient-to-br from-[#1e88e5] to-[#1565c0] flex flex-col items-center justify-center text-white"
                    >
                        <motion.div
                            key={countdownCount}
                            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 2, opacity: 0, rotate: 10 }}
                            transition={{ type: "spring", damping: 15 }}
                            className="flex flex-col items-center text-center"
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

            {/* Header */}
            <div className={`w-full max-w-full transition-all duration-700 ${isStarting ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-0'}`}>
                <h1 className={`${isInternalFullscreen ? 'text-4xl' : 'text-3xl'} font-black text-slate-800 mb-8 text-center uppercase tracking-tighter`}>
                    Tira y Afloja Matemático
                </h1>
                
                <div className={`w-full flex items-center justify-between transition-all duration-500 ${isInternalFullscreen ? 'gap-12 lg:gap-24 px-12' : 'gap-10 lg:gap-20 px-8'}`}>
                    {/* Player 1 Area */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <Keypad 
                            player={1} 
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
                            <span className="text-xl font-black text-slate-700 leading-none">{p1Score}/5</span>
                        </div>
                    </div>

                    {/* Center Visual Area */}
                    <div className={`relative flex-grow flex flex-col items-center justify-center transition-all ${isInternalFullscreen ? 'h-[60vh]' : 'h-[400px]'}`}>
                        <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center pointer-events-none">
                             <div className="w-[4px] h-[80%] bg-slate-500/20 rounded-full" />
                        </div>

                        <motion.div 
                            animate={{ x: `${ropePos}px` }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="relative z-10 flex items-center justify-center w-full"
                        >
                            <img 
                                src="/assets/games/afif/character.png" 
                                alt="Personajes" 
                                className={`w-auto transition-all duration-500 transform ${isInternalFullscreen ? 'h-[45vh]' : 'h-[300px]'}`}
                                style={{ 
                                    maskImage: 'linear-gradient(to right, black, black)',
                                    objectFit: 'contain'
                                }}
                            />
                        </motion.div>

                        <div className="mt-8 text-center w-full flex justify-center">
                            <div className="bg-white/80 backdrop-blur-md px-8 py-2.5 rounded-full inline-block shadow-lg border border-white">
                                <p className={`${isInternalFullscreen ? 'text-sm' : 'text-xs'} font-black text-slate-500 uppercase tracking-widest leading-tight`}>
                                    ¡Responde las preguntas para tirar de la cuerda!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Player 2 Area */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <Keypad 
                            player={2} 
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
                            <span className="text-xl font-black text-slate-700 leading-none">{p2Score}/5</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Corner Controls */}
            <div className={`fixed bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none transition-opacity duration-500 ${isStarting ? 'opacity-0' : 'opacity-100'}`}>
                <button 
                    onClick={onExit}
                    className="p-3 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 active:scale-95 pointer-events-auto border-2 border-slate-100 group cursor-pointer"
                >
                    <Home className="text-slate-600 group-hover:text-[#1e88e5] transition-colors" size={24} />
                </button>

                <button 
                    onClick={toggleFullScreen}
                    className="p-3 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 active:scale-95 pointer-events-auto border-2 border-slate-100 group cursor-pointer"
                >
                    <Maximize className="text-slate-600 group-hover:text-[#1e88e5] transition-colors" size={24} />
                </button>
            </div>

            {/* Winner Modal */}
            <AnimatePresence>
                {winner && (
                    <>
                        <Confetti />
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
                        >
                            <motion.div 
                                initial={{ scale: 0.8, y: 30 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-gradient-to-br from-[#1e88e5] to-[#1565c0] rounded-[3rem] p-8 text-center space-y-4 max-w-[580px] w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-2 border-white/30 relative overflow-hidden"
                            >
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                
                                <div className="flex items-center justify-center gap-4">
                                    <span className="text-4xl drop-shadow-lg">🏆</span>
                                    <h2 className="text-2xl font-black tracking-tight text-white uppercase leading-tight">
                                        ¡EL JUGADOR {winner === 1 ? 'IZQUIERDO' : 'DERECHO'} GANA!
                                    </h2>
                                    <span className="text-4xl drop-shadow-lg">🏆</span>
                                </div>
                                
                                <p className="text-sm text-white/90 font-medium px-4 leading-relaxed max-w-[450px] mx-auto">
                                    ¡Excelente trabajo! Has demostrado una fuerza mental imparable en este desafío.
                                </p>
                                
                                <div className="pt-2">
                                    <button 
                                        onClick={() => { setWinner(null); setRopePos(0); setP1Score(0); setP2Score(0); setIsStarting(true); setCountdownCount(3); }}
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
                    initial={{ 
                        x: Math.random() * 100 + 'vw', 
                        y: -20, 
                        rotate: 0,
                        scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{ 
                        y: '110vh', 
                        rotate: Math.random() * 1000,
                        x: (Math.random() * 100 - 10) + 'vw'
                    }}
                    transition={{ 
                        duration: Math.random() * 2 + 1.5, 
                        ease: "easeOut",
                        delay: Math.random() * 0.5
                    }}
                    className="absolute w-2.5 h-2.5 rounded-sm shadow-sm"
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
