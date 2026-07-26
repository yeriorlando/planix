import React, { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { consumeCredits, hasEnoughCredits, getUserCredits, getCreditCosts } from '../lib/credits';
import ModalCreditos from '../components/ai/ModalCreditos';
import { 
  ArrowLeft, RefreshCw, Trophy, Star, AlertCircle, Smile, Zap,
  BookOpen, HelpCircle, Award, Check, X, RotateCw, Crown,
  Fingerprint, Users, Coins, Volume2, VolumeX, ArrowRight, Play, Sparkles,
  ChevronDown, FileText, Brain, GraduationCap, Eye, EyeOff, CheckCircle, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, getClassrooms, Classroom, getStudents, Student } from '../lib/storage';
import { generateToolContent } from '../lib/services/aiService';
import { toast, Toaster } from 'sonner';

// Audio synthesis
const playSynthSound = (type: 'correct' | 'incorrect' | 'complete' | 'tick' | 'voting') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'voting') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } else if (type === 'correct') {
      const osc1 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc1.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);
    } else if (type === 'incorrect') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'complete') {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.35);
      });
    }
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
};

export default function Impostor() {
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
  const [gameState, setGameState] = useState<'config' | 'reveal' | 'clues' | 'voting' | 'resolution' | 'debate'>('config');
  const [loading, setLoading] = useState<boolean>(false);

  // Content generated
  const [mainWord, setMainWord] = useState<string>('');
  const [impostorWord, setImpostorWord] = useState<string>('');
  const [debateQuestions, setDebateQuestions] = useState<string[]>([]);
  const [impostorGroupIdx, setImpostorGroupIdx] = useState<number>(0);
  const [groupStudents, setGroupStudents] = useState<string[][]>([]);

  // Active steps in rounds
  const [revealedGroups, setRevealedGroups] = useState<boolean[]>([]);
  const [tempRevealIdx, setTempRevealIdx] = useState<number | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [spokenGroups, setSpokenGroups] = useState<boolean[]>([]);

  // Voting
  const [votes, setVotes] = useState<number[]>([]);
  const [votedImpostorIdx, setVotedImpostorIdx] = useState<number | null>(null);

  // Fullscreen support
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Credits info
  const [showCreditsModal, setShowCreditsModal] = useState<boolean>(false);
  const creditCost = getCreditCosts().impostor_generator;

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

  const handleSound = (type: 'correct' | 'incorrect' | 'complete' | 'tick' | 'voting') => {
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

    if (!hasEnoughCredits('impostor_generator')) {
      setShowCreditsModal(true);
      return;
    }

    setLoading(true);
    try {
      consumeCredits('impostor_generator');

      const response = await generateToolContent('impostor', `Tema: ${topic}. Dificultad: ${difficulty}.`);
      if (response && response.mainWord && response.impostorWord) {
        setMainWord(response.mainWord);
        setImpostorWord(response.impostorWord);
        setDebateQuestions(response.debateQuestions || []);
      } else {
        throw new Error("Respuesta inválida");
      }

      // Randomly assign impostor
      const randIdx = Math.floor(Math.random() * numGroups);
      setImpostorGroupIdx(randIdx);

      // Student distribution
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

      setRevealedGroups(Array(numGroups).fill(false));
      setSpokenGroups(Array(numGroups).fill(false));
      setVotes(Array(numGroups).fill(0));
      setCurrentRound(1);
      setVotedImpostorIdx(null);
      setGameState('reveal');
    } catch (err) {
      console.warn("Error generando. Cargando simulación local:", err);
      const response = await generateToolContent('impostor', "MOCK");
      setMainWord(response.mainWord);
      setImpostorWord(response.impostorWord);
      setDebateQuestions(response.debateQuestions);

      const randIdx = Math.floor(Math.random() * numGroups);
      setImpostorGroupIdx(randIdx);

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

      setRevealedGroups(Array(numGroups).fill(false));
      setSpokenGroups(Array(numGroups).fill(false));
      setVotes(Array(numGroups).fill(0));
      setCurrentRound(1);
      setVotedImpostorIdx(null);
      setGameState('reveal');
    } finally {
      setLoading(false);
    }
  };

  const handleRevealGroupCard = (idx: number) => {
    handleSound('tick');
    setTempRevealIdx(idx);
  };

  const handleConfirmReveal = (idx: number) => {
    handleSound('tick');
    const newRevealed = [...revealedGroups];
    newRevealed[idx] = true;
    setRevealedGroups(newRevealed);
    setTempRevealIdx(null);
  };

  const handleToggleClueSpoken = (idx: number) => {
    handleSound('tick');
    const newSpoken = [...spokenGroups];
    newSpoken[idx] = !newSpoken[idx];
    setSpokenGroups(newSpoken);
  };

  const handleNextRoundOrVote = () => {
    if (currentRound < 2) {
      setCurrentRound(prev => prev + 1);
      setSpokenGroups(Array(numGroups).fill(false));
    } else {
      setGameState('voting');
    }
  };

  const handleVoteSubmit = (idx: number) => {
    handleSound('voting');
    const newVotes = [...votes];
    newVotes[idx] += 1;
    setVotes(newVotes);
  };

  const handleEndVoting = () => {
    let maxVotes = -1;
    let maxIdx = 0;
    votes.forEach((v, index) => {
      if (v > maxVotes) {
        maxVotes = v;
        maxIdx = index;
      }
    });

    setVotedImpostorIdx(maxIdx);
    
    if (maxIdx === impostorGroupIdx) {
      handleSound('correct');
      handleSound('complete');
    } else {
      handleSound('incorrect');
    }
    
    setGameState('resolution');
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

      <main className={`flex-1 flex flex-col w-full min-w-0 text-left transition-all ${
        isFullscreen ? 'pt-2 pb-2 px-4' : `pt-6 pb-10 px-6 ${isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'}`
      }`}>
        
        <Toaster position="top-center" richColors />
        
        <ModalCreditos
          isOpen={showCreditsModal}
          onClose={() => setShowCreditsModal(false)}
          requiredCredits={creditCost}
          currentCredits={getUserCredits(user)}
          actionName="generar esta dinámica"
        />

        {/* Header Controls */}
        <header className={`flex items-center justify-between w-full max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs select-none gap-4 transition-all ${
          isFullscreen ? 'px-4 py-2 mb-3 mt-2' : 'px-6 py-4 mb-6 mt-4'
        }`}>
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
                <Coins className="w-5 h-5 text-purple-650 animate-pulse" />
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
        {gameState === 'config' && !isFullscreen && (
          <div className="print:hidden mb-5 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-purple-600/10 dark:from-purple-500/15 dark:to-indigo-600/15 border border-purple-500/15 dark:border-purple-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full max-w-4xl mx-auto">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/20 dark:bg-purple-500/30 flex items-center justify-center shrink-0 border border-purple-500/30 dark:border-purple-500/40 relative">
              <Fingerprint className="w-5 h-5 md:w-6 h-6 text-purple-600 dark:text-purple-400 stroke-[2.5]" />
            </div>

            <div className="text-center md:text-left flex-1 relative z-10">
              <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                El Impostor
              </h1>
              <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
                Un juego de deducción pedagógica. La IA generará una palabra clave secreta para la mayoría de los equipos y una palabra sutilmente diferente para el impostor. Los grupos describen su palabra y debaten para encontrar al infiltrado.
              </p>
            </div>
          </div>
        )}

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
                        : 'text-slate-500 dark:text-zinc-400'
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
                        : 'text-slate-500 dark:text-zinc-400'
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
                      onClick={() => setNumGroups(Math.max(3, numGroups - 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold border-none cursor-pointer"
                    >
                      -
                    </button>
                    <div className="flex-1 px-1">
                      <input
                        type="range"
                        min={3}
                        max={10}
                        value={numGroups}
                        onChange={e => setNumGroups(parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
                        style={{
                          background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${((numGroups - 3) / 7) * 100}%, #e2e8f0 ${((numGroups - 3) / 7) * 100}%, #e2e8f0 100%)`
                        }}
                      />
                    </div>
                    <div className="w-11 h-9 flex items-center justify-center text-center font-bold border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 shadow-2xs">
                      {numGroups}
                    </div>
                    <button
                      type="button"
                      onClick={() => setNumGroups(Math.min(10, numGroups + 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Team distribution UI */}
                  {participantMode === 'class' && classStudents.length > 0 && numGroups <= classStudents.length && (
                    <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl p-4 mt-3 animate-in fade-in duration-200 text-left select-none space-y-2.5">
                      <div className="flex items-center gap-2 text-brand-primary dark:text-blue-400 font-black text-xs uppercase tracking-wider">
                        <Users size={15} className="shrink-0" />
                        <span>Formación de Equipos</span>
                      </div>
                      <div className="space-y-1 text-slate-650 dark:text-zinc-300 font-bold text-xs">
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
                    <div className="bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200/60 dark:border-amber-800/30 rounded-2xl p-4 mt-3 animate-in fade-in duration-200 text-left select-none space-y-2">
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
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Tema o Contenido de la Clase</label>
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
                            : 'bg-slate-550/5 dark:bg-zinc-950 text-slate-550 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-850 border border-slate-250 dark:border-zinc-800'
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
                    {soundEnabled ? <Volume2 size={16} className="text-brand-primary" /> : <VolumeX size={16} className="text-slate-450" />}
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

          {gameState === 'reveal' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-4xl mx-auto w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-[32px] shadow-sm text-center transition-all ${
                isFullscreen ? 'p-7 space-y-4 my-auto' : 'p-8 space-y-6'
              }`}
            >
              <div>
                <span className="text-xs font-black uppercase text-brand-primary tracking-wider">Fase 1</span>
                <h2 className={`font-extrabold text-text-main dark:text-white mt-1 transition-all ${
                  isFullscreen ? 'text-2xl' : 'text-3xl'
                }`}>Revelar Palabras Secretas</h2>
                <p className={`text-text-muted mt-2 transition-all ${
                  isFullscreen ? 'text-sm max-w-2xl mx-auto' : 'text-sm'
                }`}>Pide a un representante de cada equipo que venga al computador y presione su tarjeta para revelar su palabra en secreto.</p>
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all ${
                isFullscreen ? 'py-3' : 'py-6'
              }`}>
                {Array(numGroups).fill(0).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => !revealedGroups[idx] && handleRevealGroupCard(idx)}
                    className={`aspect-[3/4] rounded-2xl border flex flex-col items-center justify-center transition-all relative overflow-hidden ${
                      isFullscreen ? 'p-3.5' : 'p-4'
                    } ${
                      revealedGroups[idx]
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-brand-primary/25 bg-brand-primary/5 dark:bg-brand-primary/5 hover:border-brand-primary/50'
                    }`}
                  >
                    <Fingerprint className={`transition-all ${
                      revealedGroups[idx] ? 'text-emerald-500' : 'text-brand-primary'
                    } ${isFullscreen ? 'w-10 h-10 mb-2' : 'w-12 h-12 mb-3'}`} />
                    <span className={`font-bold text-text-main dark:text-neutral-200 transition-all ${
                      isFullscreen ? 'text-sm' : 'text-sm'
                    }`}>Equipo {idx + 1}</span>
                    
                    {/* List students under group */}
                    {groupStudents[idx] && groupStudents[idx].length > 0 && (
                      <div className={`text-text-muted max-w-full truncate px-1 font-semibold leading-relaxed transition-all ${
                        isFullscreen ? 'text-[10px] mt-1' : 'text-[10px] mt-2'
                      }`}>
                        {groupStudents[idx].join(', ')}
                      </div>
                    )}
                    
                    <span className={`text-text-muted font-bold transition-all ${
                      isFullscreen ? 'text-[10px] mt-1.5' : 'text-xs mt-2'
                    }`}>
                      {revealedGroups[idx] ? '✓ Palabra Leída' : 'Pulse para revelar'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  disabled={!revealedGroups.every(r => r === true)}
                  onClick={() => setGameState('clues')}
                  className={`bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-bold flex items-center gap-2 disabled:opacity-40 shadow-md shadow-brand-primary/20 transition-all ${
                    isFullscreen ? 'py-3 px-7 text-sm' : 'py-4 px-8'
                  }`}
                >
                  Comenzar Ronda de Pistas <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'clues' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`max-w-4xl mx-auto w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-[32px] shadow-sm text-center transition-all ${
                isFullscreen ? 'p-7 space-y-4 my-auto' : 'p-8 space-y-6'
              }`}
            >
              <div>
                <span className="text-xs font-black uppercase text-brand-primary tracking-wider">Fase 2: Claves de una sola palabra</span>
                <h2 className={`font-extrabold text-text-main dark:text-white mt-1 transition-all ${
                  isFullscreen ? 'text-2xl' : 'text-3xl'
                }`}>Ronda {currentRound} de 2</h2>
                <p className={`text-text-muted mt-2 transition-all ${
                  isFullscreen ? 'text-sm max-w-2xl mx-auto' : 'text-sm'
                }`}>Cada equipo debe decir una única palabra descriptiva para demostrar que conoce el tema. El impostor debe intentar mezclarse.</p>
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all ${
                isFullscreen ? 'py-3' : 'py-6'
              }`}>
                {Array(numGroups).fill(0).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleToggleClueSpoken(idx)}
                    className={`rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer hover:shadow-md ${
                      isFullscreen ? 'p-4 gap-2' : 'p-6 gap-3'
                    } ${
                      spokenGroups[idx]
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/15 shadow-sm'
                        : 'border-slate-200/80 dark:border-zinc-700/60 bg-white dark:bg-slate-800 hover:border-brand-primary/30'
                    }`}
                  >
                    {spokenGroups[idx] ? (
                      <CheckCircle className={`text-emerald-500 transition-all ${isFullscreen ? 'w-7 h-7' : 'w-8 h-8'}`} />
                    ) : (
                      <div className={`rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-xs transition-all ${
                        isFullscreen ? 'w-7 h-7' : 'w-8 h-8'
                      }`}>
                        {idx + 1}
                      </div>
                    )}
                    <span className={`font-bold text-text-main dark:text-neutral-200 transition-all ${
                      isFullscreen ? 'text-sm' : 'text-sm'
                    }`}>Equipo {idx + 1}</span>
                    {groupStudents[idx] && groupStudents[idx].length > 0 && (
                      <div className={`text-text-muted max-w-full truncate px-1 transition-all ${
                        isFullscreen ? 'text-[10px]' : 'text-[10px]'
                      }`}>
                        {groupStudents[idx].join(', ')}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                disabled={!spokenGroups.some(s => s === true)}
                onClick={handleNextRoundOrVote}
                className={`bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-bold inline-flex items-center gap-2 shadow-md shadow-brand-primary/20 transition-all ${
                  isFullscreen ? 'py-3 px-7 text-sm' : 'py-4 px-8'
                }`}
              >
                {currentRound < 2 ? 'Iniciar Ronda 2' : 'Proceder a la Votación'} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {gameState === 'voting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`max-w-4xl mx-auto w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-[32px] shadow-sm text-center transition-all ${
                isFullscreen ? 'p-7 space-y-4 my-auto' : 'p-8 space-y-6'
              }`}
            >
              <div>
                <span className="text-xs font-black uppercase text-brand-primary tracking-wider">Fase 3: Juicio</span>
                <h2 className={`font-extrabold text-text-main dark:text-white mt-1 transition-all ${
                  isFullscreen ? 'text-2xl' : 'text-3xl'
                }`}>¿Quién es el Impostor?</h2>
                <p className={`text-text-muted mt-2 transition-all ${
                  isFullscreen ? 'text-sm max-w-2xl mx-auto' : 'text-sm'
                }`}>Los equipos discuten libremente y luego el maestro registra los votos apuntando al posible impostor.</p>
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all ${
                isFullscreen ? 'py-3' : 'py-6'
              }`}>
                {Array(numGroups).fill(0).map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-between transition-all ${
                      isFullscreen ? 'p-4 min-h-[120px]' : 'p-6 min-h-[160px]'
                    }`}
                  >
                    <div>
                      <span className={`font-bold text-text-main dark:text-neutral-200 transition-all ${
                        isFullscreen ? 'text-sm' : 'text-sm'
                      }`}>Equipo {idx + 1}</span>
                      <div className={`text-brand-primary font-black bg-brand-primary/10 dark:bg-brand-primary/15 rounded-full transition-all ${
                        isFullscreen ? 'text-sm mt-1.5 px-3 py-0.5' : 'text-sm mt-2 px-3 py-1'
                      }`}>
                        {votes[idx]} Votos
                      </div>
                    </div>
                    <button
                      onClick={() => handleVoteSubmit(idx)}
                      className={`w-full bg-slate-200 hover:bg-brand-primary/10 text-text-main hover:text-brand-primary rounded-xl text-xs font-bold transition-all ${
                        isFullscreen ? 'mt-3 py-2' : 'mt-4 py-2'
                      }`}
                    >
                      +1 Votar
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleEndVoting}
                className={`bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-bold inline-flex items-center gap-2 shadow-md shadow-brand-primary/20 transition-all ${
                  isFullscreen ? 'py-3 px-7 text-sm' : 'py-4 px-8'
                }`}
              >
                Revelar Impostor <Eye className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {gameState === 'resolution' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-2xl mx-auto text-center bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-[32px] shadow-sm transition-all ${
                isFullscreen ? 'p-8 space-y-5 my-auto' : 'p-12 space-y-8'
              }`}
            >
              {votedImpostorIdx === impostorGroupIdx ? (
                <div className={`transition-all ${isFullscreen ? 'space-y-3' : 'space-y-6'}`}>
                  <div className={`inline-flex bg-emerald-100 dark:bg-emerald-950/20 text-emerald-500 rounded-full items-center justify-center animate-bounce transition-all ${
                    isFullscreen ? 'w-16 h-16' : 'w-24 h-24'
                  }`}>
                    <Trophy className={`transition-all ${isFullscreen ? 'w-8 h-8' : 'w-12 h-12'}`} />
                  </div>
                  <h1 className={`font-extrabold tracking-tight text-emerald-600 transition-all ${
                    isFullscreen ? 'text-2xl' : 'text-4xl'
                  }`}>¡Impostor Descubierto!</h1>
                  <p className={`text-text-muted leading-relaxed transition-all ${
                    isFullscreen ? 'text-sm' : 'text-lg'
                  }`}>
                    El aula acusó correctamente al <strong>Equipo {impostorGroupIdx + 1}</strong>. Su palabra asignada era <strong>{impostorWord}</strong>, mientras que los demás tenían <strong>{mainWord}</strong>.
                  </p>
                </div>
              ) : (
                <div className={`transition-all ${isFullscreen ? 'space-y-3' : 'space-y-6'}`}>
                  <div className={`inline-flex bg-red-100 dark:bg-red-950/20 text-red-500 rounded-full items-center justify-center animate-pulse transition-all ${
                    isFullscreen ? 'w-16 h-16' : 'w-24 h-24'
                  }`}>
                    <EyeOff className={`transition-all ${isFullscreen ? 'w-8 h-8' : 'w-12 h-12'}`} />
                  </div>
                  <h1 className={`font-extrabold tracking-tight text-red-500 transition-all ${
                    isFullscreen ? 'text-2xl' : 'text-4xl'
                  }`}>¡El Impostor Ganó!</h1>
                  <p className={`text-text-muted leading-relaxed transition-all ${
                    isFullscreen ? 'text-sm' : 'text-lg'
                  }`}>
                    El infiltrado era el <strong>Equipo {impostorGroupIdx + 1}</strong> y logró pasar desapercibido. Su palabra asignada era <strong>{impostorWord}</strong>, mientras que la del resto era <strong>{mainWord}</strong>.
                  </p>
                </div>
              )}

              <button
                onClick={() => setGameState('debate')}
                className={`bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-bold inline-flex items-center gap-2 shadow-md shadow-brand-primary/20 mx-auto transition-all ${
                  isFullscreen ? 'py-3 px-7 text-sm' : 'py-4 px-8'
                }`}
              >
                Fase de Debate Curricular <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {gameState === 'debate' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`max-w-3xl mx-auto w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-[32px] shadow-sm text-center transition-all ${
                isFullscreen ? 'p-7 space-y-4 my-auto' : 'p-8 space-y-6'
              }`}
            >
              <div>
                <span className="text-xs font-black uppercase text-brand-primary tracking-wider">Fase de Discusión</span>
                <h2 className={`font-extrabold text-text-main dark:text-white mt-1 transition-all ${
                  isFullscreen ? 'text-2xl' : 'text-3xl'
                }`}>Preguntas de Consolidación</h2>
                <p className={`text-text-muted mt-2 transition-all ${
                  isFullscreen ? 'text-sm max-w-2xl mx-auto' : 'text-sm'
                }`}>La IA ha propuesto estas preguntas para conectar ambos conceptos y consolidar el aprendizaje.</p>
              </div>

              <div className={`text-left transition-all ${
                isFullscreen ? 'space-y-2.5 py-2' : 'space-y-4 py-4'
              }`}>
                {debateQuestions.map((q, idx) => (
                  <div key={idx} className={`bg-slate-50 dark:bg-slate-800 rounded-2xl border border-black/5 dark:border-white/5 flex gap-4 transition-all ${
                    isFullscreen ? 'p-3' : 'p-5'
                  }`}>
                    <div className={`rounded-xl bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                      isFullscreen ? 'w-6 h-6 text-xs' : 'w-8 h-8'
                    }`}>
                      {idx + 1}
                    </div>
                    <p className={`text-text-main dark:text-neutral-200 font-semibold py-1 transition-all ${
                      isFullscreen ? 'text-sm' : 'text-base'
                    }`}>{q}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setGameState('config')}
                  className={`border border-black/10 dark:border-white/10 text-text-main hover:bg-slate-50 rounded-2xl font-bold transition-all ${
                    isFullscreen ? 'py-3 px-7 text-sm' : 'py-4 px-8'
                  }`}
                >
                  Volver a configurar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Secret Card Reveal Modal */}
        <AnimatePresence>
          {tempRevealIdx !== null && (
            <div className="fixed inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 border border-black/8 dark:border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-6"
              >
                <div className="w-16 h-16 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                  <Eye className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="font-black text-2xl text-text-main dark:text-white">Equipo {tempRevealIdx + 1}</h3>
                  <p className="text-sm text-text-muted mt-2">Asegúrate de que los otros equipos miren a otro lado.</p>
                </div>

                <div className="bg-gradient-to-br from-brand-primary/8 via-blue-50/60 to-brand-primary/5 dark:from-brand-primary/15 dark:via-slate-800 dark:to-brand-primary/10 py-6 px-5 rounded-2xl border border-brand-primary/15 dark:border-brand-primary/25 shadow-xs">
                  <span className="text-[11px] uppercase text-brand-primary/60 dark:text-brand-primary/50 tracking-widest font-black block mb-2">Tu palabra secreta</span>
                  <span className="text-3xl font-black text-brand-primary tracking-wide select-none">
                    {tempRevealIdx === impostorGroupIdx ? impostorWord : mainWord}
                  </span>
                </div>

                <button
                  onClick={() => handleConfirmReveal(tempRevealIdx!)}
                  className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold shadow-md shadow-brand-primary/20 transition-all cursor-pointer"
                >
                  He anotado mi palabra (Cerrar)
                </button>
              </motion.div>
            </div>
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
                    Preparando El Impostor
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
