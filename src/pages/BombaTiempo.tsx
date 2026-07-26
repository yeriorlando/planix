import React, { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { consumeCredits, hasEnoughCredits, getUserCredits, getCreditCosts } from '../lib/credits';
import ModalCreditos from '../components/ai/ModalCreditos';
import { 
  ArrowLeft, RefreshCw, Trophy, Star, AlertCircle, Smile, Zap,
  BookOpen, HelpCircle, Award, Check, X, RotateCw, Crown,
  Clock, Users, Coins, Volume2, VolumeX, ArrowRight, Play, Sparkles,
  ChevronDown, FileText, Brain, GraduationCap, Heart, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, getClassrooms, Classroom, getStudents, Student } from '../lib/storage';
import { generateToolContent } from '../lib/services/aiService';
import { toast, Toaster } from 'sonner';

export interface BombaQuestion {
  pregunta: string;
  opciones: string[];
  correct: number;
}

// Audio synthesis
const playSynthSound = (type: 'correct' | 'incorrect' | 'complete' | 'tick' | 'boom') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'boom') {
      const bufferSize = ctx.sampleRate * 0.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.7);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + 0.8);
    } else if (type === 'correct') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'incorrect') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'complete') {
      [349.23, 440.00, 523.25, 698.46].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    }
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
};

export default function BombaTiempo() {
  const navigate = useNavigate();
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Session user
  const user = getCurrentUser();
  const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';

  // Classroom Config
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [participantMode, setParticipantMode] = useState<'class' | 'custom'>('class');

  // Game settings
  const [numGroups, setNumGroups] = useState<number>(3);
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('Medio');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Game states
  const [gameState, setGameState] = useState<'config' | 'playing' | 'boom' | 'gameover'>('config');
  const [loading, setLoading] = useState<boolean>(false);

  // Content generated
  const [questions, setQuestions] = useState<BombaQuestion[]>([]);
  const [groupLives, setGroupLives] = useState<number[]>([]);
  const [groupStudents, setGroupStudents] = useState<string[][]>([]);
  const [activeGroupIdx, setActiveGroupIdx] = useState<number>(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);

  // Timer states
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Fullscreen support
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Credits info
  const [showCreditsModal, setShowCreditsModal] = useState<boolean>(false);
  const creditCost = getCreditCosts().bomba_generator;

  // Load classrooms on mount
  useEffect(() => {
    if (user) {
      const list = getClassrooms(user.id);
      setClassrooms(list);
      if (list.length > 0) {
        setSelectedClassId(list[0].id);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedClassId) {
      setClassStudents(getStudents(selectedClassId));
    } else {
      setClassStudents([]);
    }
  }, [selectedClassId]);

  // Game tick countdown
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const interval = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleBoom();
            return 0;
          }
          handleSound('tick');
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState, activeGroupIdx, currentQuestionIdx]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        toast.error("No se pudo iniciar el modo pantalla completa.");
        console.error(err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSound = (type: 'correct' | 'incorrect' | 'complete' | 'tick' | 'boom') => {
    if (soundEnabled) {
      playSynthSound(type);
    }
  };

  const handleStartGame = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      toast.error("Por favor, introduce un tema de estudio.");
      return;
    }

    if (participantMode === 'class') {
      if (!selectedClassId) {
        toast.error("Por favor, selecciona un aula.");
        return;
      }
      if (classStudents.length === 0) {
        toast.error("El aula seleccionada no tiene estudiantes registrados.");
        return;
      }
      if (numGroups > classStudents.length) {
        toast.error(`No hay suficientes alumnos (${classStudents.length}) para formar ${numGroups} grupos.`);
        return;
      }
    }

    if (!hasEnoughCredits('bomba_generator')) {
      setShowCreditsModal(true);
      return;
    }

    setLoading(true);
    try {
      consumeCredits('bomba_generator');

      const prompt = `Tema: ${topic}. Dificultad: ${difficulty}.`;
      const response = await generateToolContent('bomba-tiempo', prompt);
      
      if (response && response.questions && response.questions.length > 0) {
        setQuestions(response.questions);
      } else {
        throw new Error("Formato de respuesta incorrecto");
      }

      setGroupLives(Array(numGroups).fill(3));
      setActiveGroupIdx(0);
      setCurrentQuestionIdx(0);
      setTimeLeft(15);

      if (participantMode === 'class') {
        const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
        const buckets: string[][] = Array.from({ length: numGroups }, () => []);
        shuffled.forEach((student, idx) => {
          buckets[idx % numGroups].push(student.nombre);
        });
        setGroupStudents(buckets);
      } else {
        setGroupStudents([]);
      }

      setGameState('playing');
    } catch (err) {
      console.warn("Error generando. Cargando simulación local:", err);
      const response = await generateToolContent('bomba-tiempo', "MOCK");
      setQuestions(response.questions);
      setGroupLives(Array(numGroups).fill(3));
      setActiveGroupIdx(0);
      setCurrentQuestionIdx(0);
      setTimeLeft(15);

      if (participantMode === 'class') {
        const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
        const buckets: string[][] = Array.from({ length: numGroups }, () => []);
        shuffled.forEach((student, idx) => {
          buckets[idx % numGroups].push(student.nombre);
        });
        setGroupStudents(buckets);
      } else {
        setGroupStudents([]);
      }

      setGameState('playing');
    } finally {
      setLoading(false);
    }
  };

  const handleBoom = () => {
    handleSound('boom');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 800);

    const newLives = [...groupLives];
    newLives[activeGroupIdx] = Math.max(0, newLives[activeGroupIdx] - 1);
    setGroupLives(newLives);

    setGameState('boom');
  };

  const handleContinueAfterBoom = () => {
    const activeTeams = groupLives.filter(l => l > 0).length;
    if (activeTeams <= 1) {
      handleSound('complete');
      setGameState('gameover');
      return;
    }

    let nextIdx = (activeGroupIdx + 1) % numGroups;
    while (groupLives[nextIdx] === 0) {
      nextIdx = (nextIdx + 1) % numGroups;
    }

    setActiveGroupIdx(nextIdx);
    setGameState('playing');
    setTimeLeft(15);
    setSelectedOptionIdx(null);
    setCurrentQuestionIdx(prev => (prev + 1) % questions.length);
  };

  const handleOptionClick = (idx: number) => {
    if (selectedOptionIdx !== null) return;
    setSelectedOptionIdx(idx);

    const question = questions[currentQuestionIdx];
    if (idx === question.correct) {
      handleSound('correct');
      setTimeout(() => {
        let nextIdx = (activeGroupIdx + 1) % numGroups;
        while (groupLives[nextIdx] === 0) {
          nextIdx = (nextIdx + 1) % numGroups;
        }
        setActiveGroupIdx(nextIdx);
        setTimeLeft(15);
        setSelectedOptionIdx(null);
        setCurrentQuestionIdx(prev => (prev + 1) % questions.length);
      }, 1000);
    } else {
      handleSound('incorrect');
      setTimeLeft(prev => Math.max(1, prev - 4));
      setTimeout(() => setSelectedOptionIdx(null), 1000);
    }
  };

  const winningGroup = () => {
    let maxLives = -1;
    let winner = 0;
    groupLives.forEach((lives, idx) => {
      if (lives > maxLives) {
        maxLives = lives;
        winner = idx;
      }
    });
    return winner;
  };

  return (
    <div ref={containerRef} className="w-full plx-fullscreen-bg flex flex-col items-stretch">
      <style>{`
        .plx-fullscreen-bg:fullscreen {
          background-color: #FBF9F6 !important;
          padding: 2rem !important;
          overflow-y: auto;
          width: 100vw;
          height: 100vh;
        }
        .dark .plx-fullscreen-bg:fullscreen {
          background-color: #0b0b0e !important;
        }
      `}</style>

      <main className={`flex-1 flex flex-col pt-6 w-full min-w-0 pb-10 px-6 ${
        isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
      } text-left`}>
        
        <Toaster position="top-center" richColors />
        
        <ModalCreditos
          isOpen={showCreditsModal}
          onClose={() => setShowCreditsModal(false)}
          requiredCredits={creditCost}
          currentCredits={getUserCredits(user)}
          actionName="generar esta dinámica"
        />

        {/* Header Controls */}
        <header className="flex items-center justify-between px-6 py-4 w-full max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs mb-6 mt-4 select-none gap-4">
          <div className="flex-1 flex justify-start">
            {gameState === 'config' ? (
              <Link 
                to="/dinamicas" 
                className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                ← VOLVER A DINÁMICAS
              </Link>
            ) : (
              <button
                onClick={() => setGameState('config')}
                className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                ← VOLVER A CONFIGURAR
              </button>
            )}
          </div>

          <div className="flex-none flex items-center justify-center">
            {isPremium ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/12 dark:from-amber-500/20 dark:to-amber-600/20 border border-amber-500/25 dark:border-amber-500/40 rounded-full shadow-[0_2px_12px_rgba(245,158,11,0.08)]">
                <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 fill-amber-500/20 stroke-[2.5]" />
                <span className="text-xs md:text-[13px] font-black text-amber-850 dark:text-amber-400 tracking-tight">
                  Planix Pro
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-xl px-3 py-1.5 shadow-2xs select-none">
                <Coins className="w-5 h-5 text-pink-650 animate-pulse" />
                <span className="text-xs md:text-sm font-black text-slate-800 dark:text-zinc-200">
                  {getUserCredits(user)} PC
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 flex justify-end gap-3 items-center">
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              {isFullscreen ? '⤢ SALIR PANTALLA COMPLETA' : '⤢ PANTALLA COMPLETA'}
            </button>
          </div>
        </header>

        {/* Title Banner */}
        <div className="print:hidden mb-5 bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-pink-600/10 dark:from-pink-500/15 dark:to-rose-600/15 border border-pink-500/15 dark:border-pink-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full max-w-4xl mx-auto">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-pink-50/20 dark:bg-pink-950/30 flex items-center justify-center shrink-0 border border-pink-500/30 dark:border-pink-500/40 relative">
            <Clock className="w-5 h-5 md:w-6 h-6 text-pink-600 dark:text-pink-400 stroke-[2.5]" />
          </div>

          <div className="text-center md:text-left flex-1 relative z-10">
            <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
              La Bomba de Tiempo
            </h1>
            <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
              ¡Tensión y rapidez en el aula! La bomba tiene una mecha corta. Para pasársela al siguiente equipo, el grupo activo debe responder la trivia escolar correctamente en segundos. Si el tiempo expira, la bomba explota y pierden una vida.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'config' && (
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Config Card: Participants */}
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-3 select-none">
                  <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">1</span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    Participantes
                  </h3>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-zinc-950 rounded-2xl border border-slate-200/40 dark:border-zinc-800/80 mb-5 select-none">
                  <button
                    type="button"
                    onClick={() => setParticipantMode('class')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      participantMode === 'class'
                        ? 'bg-brand-primary text-white shadow-md'
                        : 'text-slate-550 dark:text-zinc-400'
                    }`}
                  >
                    <GraduationCap size={14} />
                    <span>Seleccionar aula</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipantMode('custom')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      participantMode === 'custom'
                        ? 'bg-brand-primary text-white shadow-md'
                        : 'text-slate-550 dark:text-zinc-400'
                    }`}
                  >
                    <FileText size={14} />
                    <span>Lista personalizada</span>
                  </button>
                </div>

                {participantMode === 'class' ? (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Seleccionar Aula</label>
                      <div className="relative w-full select-none">
                        <button
                          type="button"
                          onClick={() => setShowClassDropdown(!showClassDropdown)}
                          className="w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer focus:border-brand-primary outline-none transition-all shadow-2xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span>🏫</span>
                            <span className="truncate">
                              {classrooms.find(c => c.id === selectedClassId)
                                ? `${classrooms.find(c => c.id === selectedClassId)?.nombre} - Sec. ${classrooms.find(c => c.id === selectedClassId)?.seccion}`
                                : "No tienes aulas creadas"}
                            </span>
                          </div>
                          <ChevronDown size={14} className={`text-slate-400 transition-transform ${showClassDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showClassDropdown && classrooms.length > 0 && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowClassDropdown(false)} />
                            <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-xl rounded-2xl p-1.5 z-50 max-h-60 overflow-y-auto">
                              {classrooms.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedClassId(c.id);
                                    setShowClassDropdown(false);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-755 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                >
                                  <span>{c.nombre} - Sec. {c.seccion}</span>
                                  {c.id === selectedClassId && <Check size={14} />}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-text-muted p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-black/5">
                    Modo libre activado. Los grupos se registrarán sin vincular alumnos matriculados.
                  </div>
                )}

                {/* Range Slider for teams */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Cantidad de Equipos</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setNumGroups(Math.max(2, numGroups - 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold border-none cursor-pointer"
                    >
                      -
                    </button>
                    <div className="flex-1 px-1">
                      <input
                        type="range"
                        min={2}
                        max={8}
                        value={numGroups}
                        onChange={e => setNumGroups(parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
                        style={{
                          background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${((numGroups - 2) / 6) * 100}%, #e2e8f0 ${((numGroups - 2) / 6) * 100}%, #e2e8f0 100%)`
                        }}
                      />
                    </div>
                    <div className="w-11 h-9 flex items-center justify-center text-center font-bold border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 shadow-2xs">
                      {numGroups}
                    </div>
                    <button
                      type="button"
                      onClick={() => setNumGroups(Math.min(8, numGroups + 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Team distribution UI */}
                  {participantMode === 'class' && classStudents.length > 0 && numGroups <= classStudents.length && (
                    <div className="bg-blue-50/40 dark:bg-blue-955/10 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl p-4 mt-3 animate-in fade-in duration-200 text-left select-none space-y-2.5">
                      <div className="flex items-center gap-2 text-brand-primary dark:text-blue-400 font-black text-xs uppercase tracking-wider">
                        <Users size={15} className="shrink-0" />
                        <span>Formación de Equipos</span>
                      </div>
                      <div className="space-y-1 text-slate-655 dark:text-zinc-300 font-bold text-xs">
                        <p className="font-extrabold text-slate-800 dark:text-zinc-150">
                          Se formarán {numGroups} grupos:
                        </p>
                        <ul className="list-none space-y-1 pl-0">
                          {(() => {
                            const total = classStudents.length;
                            const perTeam = Math.floor(total / numGroups);
                            const remainder = total % numGroups;
                            if (remainder === 0) {
                              return (
                                <li className="flex items-center gap-2 pl-1.5 border-l-2 border-blue-500">
                                  <span>•</span>
                                  <span>{numGroups} grupos de {perTeam} alumnos</span>
                                </li>
                              );
                            } else {
                              return (
                                <>
                                  {numGroups - remainder > 0 && (
                                    <li className="flex items-center gap-2 pl-1.5 border-l-2 border-blue-400">
                                      <span>•</span>
                                      <span>{numGroups - remainder} {numGroups - remainder === 1 ? 'grupo' : 'grupos'} de {perTeam} alumnos</span>
                                    </li>
                                  )}
                                  <li className="flex items-center gap-2 pl-1.5 border-l-2 border-blue-500">
                                    <span>•</span>
                                    <span>{remainder} {remainder === 1 ? 'grupo' : 'grupos'} de {perTeam + 1} alumnos</span>
                                  </li>
                                </>
                              );
                            }
                          })()}
                        </ul>
                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 mt-2 flex justify-between items-center text-[11px] font-black uppercase text-slate-500 dark:text-zinc-450">
                          <span>Total Estudiantes</span>
                          <span className="text-brand-primary dark:text-blue-400 font-black text-sm">
                            {classStudents.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Insufficient students warning */}
                  {participantMode === 'class' && classStudents.length > 0 && numGroups > classStudents.length && (
                    <div className="bg-amber-50/60 dark:bg-amber-955/15 border border-amber-200/60 dark:border-amber-800/30 rounded-2xl p-4 mt-3 animate-in fade-in duration-200 text-left select-none space-y-2">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>Alumnos insuficientes</span>
                      </div>
                      <p className="text-xs font-bold text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                        El aula solo tiene <span className="font-black text-amber-800 dark:text-amber-200">{classStudents.length}</span> {classStudents.length === 1 ? 'estudiante' : 'estudiantes'}, pero estás intentando formar <span className="font-black text-amber-800 dark:text-amber-200">{numGroups}</span> grupos. Se necesita al menos 1 alumno por grupo.
                      </p>
                      <p className="text-[11px] font-bold text-amber-600/70 dark:text-amber-400/60">
                        Reduce la cantidad de equipos a {classStudents.length} o menos.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Config Card: Trivia Generation */}
              <form onSubmit={handleStartGame} className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-3 select-none">
                  <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">2</span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    Generación de Trivia
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-650 dark:text-slate-400">Tema o Contenido de la Clase</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. La célula animal, Historia Dominicana, Fracciones"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={loading}
                    className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold focus:outline-none focus:border-brand-primary transition-colors shadow-2xs"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-655 dark:text-slate-400">Dificultad de las Preguntas</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {['Fácil', 'Medio', 'Difícil'].map((d) => {
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
                          disabled={loading}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${isSelected
                            ? 'bg-brand-primary text-white border-transparent shadow-md shadow-brand-primary/20'
                            : 'bg-slate-555/5 dark:bg-zinc-955 text-slate-555 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-850 border border-slate-250 dark:border-zinc-800'
                          }`}
                        >
                          {icon}
                          <span>{d}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 leading-tight">
                    {difficulty === 'Fácil' && '• Las preguntas serán más simples y directas para educación primaria.'}
                    {difficulty === 'Medio' && '• Las preguntas tendrán dificultad intermedia para primaria y secundaria.'}
                    {difficulty === 'Difícil' && '• Las preguntas serán más complejas y avanzadas para educación secundaria.'}
                  </p>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-655 dark:text-slate-400 bg-transparent border-none cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    {soundEnabled ? <Volume2 size={16} className="text-brand-primary" /> : <VolumeX size={16} className="text-slate-455" />}
                    <span>Efectos de Sonido ({soundEnabled ? 'Sí' : 'No'})</span>
                  </button>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    disabled={loading || (participantMode === 'class' && numGroups > classStudents.length)}
                    className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white text-[13px] font-black uppercase tracking-wider rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 shadow-brand-primary/20"
                  >
                    {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Sparkles className="w-4.5 h-4.5" />}
                    {loading ? 'Generando dinámica...' : 'Generar dinámica'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {gameState === 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 ${isShaking ? 'animate-[bounce_0.25s_infinite]' : ''}`}
            >
              {/* Left sidebar: Groups list and lives */}
              <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-6 space-y-4 shadow-sm">
                <h3 className="font-black text-sm uppercase text-text-muted tracking-wider">Equipos en Juego</h3>
                <div className="space-y-3">
                  {Array(numGroups).fill(0).map((_, idx) => {
                    const isDead = groupLives[idx] === 0;
                    const isActive = idx === activeGroupIdx;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                          isActive 
                            ? 'border-pink-500 bg-pink-50/15 dark:bg-pink-955/10' 
                            : isDead 
                              ? 'border-black/5 opacity-40 bg-slate-50 dark:bg-slate-800' 
                              : 'border-black/5 bg-slate-50 dark:bg-slate-800'
                        }`}
                      >
                        <div>
                          <span className={`font-black text-sm block ${isActive ? 'text-pink-655' : 'text-text-main dark:text-neutral-200'}`}>
                            Equipo {idx + 1}
                          </span>
                          {groupStudents[idx] && groupStudents[idx].length > 0 && (
                            <div className="text-[10px] text-text-muted mt-1 max-w-[120px] truncate">
                              {groupStudents[idx].join(', ')}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1">
                          {Array(3).fill(0).map((_, h) => (
                            <Heart
                              key={h}
                              className={`w-4 h-4 ${
                                h < groupLives[idx]
                                  ? 'text-pink-500 fill-pink-500'
                                  : 'text-slate-350 dark:text-slate-655'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right main board: Bomb and Question */}
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-8 shadow-sm flex flex-col justify-between min-h-[460px]">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-4 select-none">
                  <div>
                    <span className="text-[11px] font-black uppercase text-pink-655 tracking-wider">Turno del Equipo {activeGroupIdx + 1}</span>
                    <h4 className="text-sm font-bold text-text-main dark:text-white mt-0.5">La Bomba está activa</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-pink-655 animate-pulse">{timeLeft}s</span>
                    <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-pink-600 h-full transition-all duration-1000"
                        style={{ width: `${(timeLeft / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center py-4 text-left">
                  <span className="text-xs font-black text-text-muted uppercase tracking-wider block mb-2">Pregunta {currentQuestionIdx + 1}</span>
                  <h2 className="text-xl font-bold text-text-main dark:text-white mb-6 leading-relaxed">
                    {questions[currentQuestionIdx]?.pregunta}
                  </h2>

                  <div className="grid grid-cols-1 gap-3">
                    {questions[currentQuestionIdx]?.opciones.map((opt, oIdx) => {
                      const isCorrect = oIdx === questions[currentQuestionIdx].correct;
                      const isSelected = oIdx === selectedOptionIdx;
                      let btnStyle = 'border-black/10 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 text-text-main dark:text-neutral-200';
                      
                      if (selectedOptionIdx !== null) {
                        if (isCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold';
                        } else if (isSelected) {
                          btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-455';
                        } else {
                          btnStyle = 'border-black/5 opacity-50 text-text-muted';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionClick(oIdx)}
                          className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {selectedOptionIdx !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                          {selectedOptionIdx !== null && isSelected && !isCorrect && <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'boom' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-[32px] p-8 shadow-sm space-y-6"
            >
              <div className="w-24 h-24 bg-rose-100 dark:bg-rose-955/20 text-rose-500 rounded-full flex items-center justify-center mx-auto text-4xl animate-ping">
                💥
              </div>

              <div>
                <h1 className="text-3xl font-extrabold text-rose-500">¡BUM! La bomba explotó</h1>
                <p className="text-text-muted mt-2">
                  El <strong>Equipo {activeGroupIdx + 1}</strong> no logró responder a tiempo y ha perdido una vida.
                </p>
              </div>

              <button
                onClick={handleContinueAfterBoom}
                className="w-full py-4 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-2xl font-bold shadow-md transition-all active:scale-[0.98]"
              >
                Siguiente Pregunta
              </button>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-[32px] p-12 shadow-sm space-y-8"
            >
              <div className="w-24 h-24 bg-amber-100 dark:bg-amber-955/20 text-amber-500 rounded-full flex items-center justify-center mx-auto text-5xl">
                🏆
              </div>

              <div>
                <h1 className="text-4xl font-black text-text-main dark:text-white">¡Juego Terminado!</h1>
                <p className="text-text-muted text-lg mt-3">
                  ¡Felicitaciones al <strong>Equipo {winningGroup() + 1}</strong> por sobrevivir con la mayor cantidad de vidas!
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setGameState('config')}
                  className="flex-1 py-4 border border-black/10 dark:border-white/10 hover:bg-slate-50 text-text-main rounded-2xl font-bold transition-all"
                >
                  Volver a Jugar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Generation Loading Modal */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-[380px] p-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 mx-4 overflow-hidden">
              <div className="flex flex-col items-center justify-center p-8 pt-10 pb-7 text-center">
                <button
                  type="button"
                  onClick={() => setLoading(false)}
                  className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1.5 shadow-md transition-all duration-200 cursor-pointer border-none"
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
                  <h4 className="text-xl font-black text-slate-800 dark:text-zinc-150 tracking-tight">
                    Preparando La Bomba de Tiempo
                  </h4>
                  <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed font-bold">
                    Seleccionando las mejores preguntas y preparando el tablero. Esto puede tomar unos segundos.
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
      </main>
    </div>
  );
}
