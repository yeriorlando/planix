import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { 
  Play, Users, Plus, Trash2, Volume2, VolumeX, 
  Sparkles, RefreshCw, Check, X, HelpCircle, GraduationCap,
  Maximize2, Minimize2, Trophy, ChevronDown, Award, ArrowLeft,
  AlertCircle, Smile, Zap, Brain, FileText, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast, Toaster } from 'sonner';
import { getCurrentUser, getClassrooms, Classroom, getStudents, Student } from '../lib/storage';
import { generateJeopardyBoard, JeopardyCategory, JeopardyQuestion } from '../lib/services/aiService';
import { consumeCredits, hasEnoughCredits, getUserCredits, getCreditCosts } from '../lib/credits';
import ModalCreditos from '../components/ai/ModalCreditos';

const teamStyles = [
  {
    border: 'border-blue-200 hover:border-blue-300 dark:border-blue-500/20 dark:hover:border-blue-500/40',
    bg: 'bg-gradient-to-b from-blue-50/30 via-white to-white dark:from-blue-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-blue-600 dark:text-blue-400',
    glow: 'shadow-blue-500/5 hover:shadow-blue-500/10',
    pill: 'bg-blue-100/60 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  {
    border: 'border-pink-200 hover:border-pink-300 dark:border-pink-500/20 dark:hover:border-pink-500/40',
    bg: 'bg-gradient-to-b from-pink-50/30 via-white to-white dark:from-pink-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-pink-600 dark:text-pink-400',
    glow: 'shadow-pink-500/5 hover:shadow-pink-500/10',
    pill: 'bg-pink-100/60 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300',
    dot: 'bg-pink-500',
  },
  {
    border: 'border-amber-200 hover:border-amber-300 dark:border-amber-500/20 dark:hover:border-amber-500/40',
    bg: 'bg-gradient-to-b from-amber-50/30 via-white to-white dark:from-amber-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-amber-500/5 hover:shadow-amber-500/10',
    pill: 'bg-amber-100/60 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  {
    border: 'border-emerald-200 hover:border-emerald-300 dark:border-emerald-500/20 dark:hover:border-emerald-500/40',
    bg: 'bg-gradient-to-b from-emerald-50/30 via-white to-white dark:from-emerald-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'shadow-emerald-500/5 hover:shadow-emerald-500/10',
    pill: 'bg-emerald-100/60 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  {
    border: 'border-cyan-200 hover:border-cyan-300 dark:border-cyan-500/20 dark:hover:border-cyan-500/40',
    bg: 'bg-gradient-to-b from-cyan-50/30 via-white to-white dark:from-cyan-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-cyan-600 dark:text-cyan-400',
    glow: 'shadow-cyan-500/5 hover:shadow-cyan-500/10',
    pill: 'bg-cyan-100/60 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300',
    dot: 'bg-cyan-500',
  },
  {
    border: 'border-red-200 hover:border-red-300 dark:border-red-500/20 dark:hover:border-red-500/40',
    bg: 'bg-gradient-to-b from-red-50/30 via-white to-white dark:from-red-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-red-650 dark:text-red-400',
    glow: 'shadow-red-500/5 hover:shadow-red-500/10',
    pill: 'bg-red-100/60 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    dot: 'bg-red-500',
  },
  {
    border: 'border-orange-200 hover:border-orange-300 dark:border-orange-500/20 dark:hover:border-orange-500/40',
    bg: 'bg-gradient-to-b from-orange-50/30 via-white to-white dark:from-orange-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-orange-600 dark:text-orange-400',
    glow: 'shadow-orange-500/5 hover:shadow-orange-500/10',
    pill: 'bg-orange-100/60 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  {
    border: 'border-teal-200 hover:border-teal-300 dark:border-teal-500/20 dark:hover:border-teal-500/40',
    bg: 'bg-gradient-to-b from-teal-50/30 via-white to-white dark:from-teal-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-teal-600 dark:text-teal-400',
    glow: 'shadow-teal-500/5 hover:shadow-teal-500/10',
    pill: 'bg-teal-100/60 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300',
    dot: 'bg-teal-500',
  },
  {
    border: 'border-rose-200 hover:border-rose-300 dark:border-rose-500/20 dark:hover:border-rose-500/40',
    bg: 'bg-gradient-to-b from-rose-50/30 via-white to-white dark:from-rose-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-rose-600 dark:text-rose-400',
    glow: 'shadow-rose-500/5 hover:shadow-rose-500/10',
    pill: 'bg-rose-100/60 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  {
    border: 'border-lime-200 hover:border-lime-300 dark:border-lime-500/20 dark:hover:border-lime-500/40',
    bg: 'bg-gradient-to-b from-lime-50/30 via-white to-white dark:from-lime-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-lime-600 dark:text-lime-400',
    glow: 'shadow-lime-500/5 hover:shadow-lime-500/10',
    pill: 'bg-lime-100/60 text-lime-700 dark:bg-lime-500/10 dark:text-lime-300',
    dot: 'bg-lime-500',
  }
];

export default function Jeopardy() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Configuration Phase States
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [numTeams, setNumTeams] = useState<number>(3);
  const [teamNames, setTeamNames] = useState<string[]>(Array.from({ length: 10 }, (_, i) => `Grupo ${i + 1}`));
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('Medio');
  const [participantMode, setParticipantMode] = useState<'class' | 'custom'>('class');
  const [teamStudents, setTeamStudents] = useState<string[][]>(Array.from({ length: 10 }, () => []));
  const [expandedTeams, setExpandedTeams] = useState<boolean[]>(Array.from({ length: 10 }, () => false));
  const [classStudents, setClassStudents] = useState<Student[]>([]);

  // Core Game Phase States
  const [phase, setPhase] = useState<'config' | 'game' | 'summary'>('config');
  const [categories, setCategories] = useState<JeopardyCategory[]>([]);
  const [scores, setScores] = useState<number[]>(Array.from({ length: 10 }, () => 0));
  const [playedQuestions, setPlayedQuestions] = useState<Set<string>>(new Set());
  const [activeQuestion, setActiveQuestion] = useState<{ question: JeopardyQuestion; catIdx: number; qIdx: number } | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [clickCoords, setClickCoords] = useState<{ x: number; y: number } | null>(null);

  // Settings
  const [showSound, setShowSound] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Adjust team names length when numTeams changes
  useEffect(() => {
    setTeamNames(prev => {
      const copy = [...prev];
      for (let i = 0; i < 10; i++) {
        if (!copy[i]) {
          copy[i] = `Grupo ${i + 1}`;
        }
      }
      return copy;
    });
  }, [numTeams]);

  // Keyboard listeners for Jeopardy fullscreen question mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeQuestion) return;
      if (e.key === 'Escape') {
        closeQuestionModal();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // Prevent page scrolling
        if (!showAnswer) {
          setShowAnswer(true);
          playSoundSuccess();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeQuestion, showAnswer]);

  // Fullscreen detector
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

  // Sound effects
  const playSoundTick = () => {
    if (!showSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio tick failed', e);
    }
  };

  const playSoundSuccess = () => {
    if (!showSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio success failed', e);
    }
  };

  const playSoundFailure = () => {
    if (!showSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
      osc.frequency.setValueAtTime(147, audioCtx.currentTime + 0.15); // D3
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio failure failed', e);
    }
  };

  // Launch AI generator
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error("Por favor, ingresa un tema curricular para continuar.");
      return;
    }

    let classStudents: Student[] = [];
    if (participantMode === 'class') {
      if (!selectedClassId) {
        toast.error("Por favor, selecciona un aula.");
        return;
      }
      classStudents = getStudents(selectedClassId);
      if (classStudents.length === 0) {
        toast.error("El aula seleccionada no tiene estudiantes registrados.");
        return;
      }
      if (numTeams > classStudents.length) {
        toast.error(`No hay suficientes alumnos (${classStudents.length}) para formar ${numTeams} grupos.`);
        return;
      }
    }

    // Credits validation
    const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';
    if (!isPremium && !hasEnoughCredits('wordsearch_generator')) {
      setShowLimitModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const { categories: generatedCategories, teamNames: generatedTeamNames } = await generateJeopardyBoard({
        topic: topic.trim(),
        difficulty,
        numTeams
      });

      // Deduct coins silently
      if (!isPremium) {
        consumeCredits('wordsearch_generator');
      }

      setCategories(generatedCategories);
      
      // Distribute students randomly if in 'class' mode
      if (participantMode === 'class') {
        const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
        const buckets: string[][] = Array.from({ length: numTeams }, () => []);
        shuffled.forEach((student, idx) => {
          buckets[idx % numTeams].push(student.nombre);
        });
        setTeamStudents(buckets);
        // Use generated team names
        const finalTeamNames = [...teamNames];
        for (let i = 0; i < numTeams; i++) {
          finalTeamNames[i] = generatedTeamNames[i] || `Grupo ${i + 1}`;
        }
        setTeamNames(finalTeamNames);
      } else {
        // Clear students
        setTeamStudents(Array.from({ length: numTeams }, () => []));
      }

      // Reset game states
      setScores(new Array(10).fill(0));
      setPlayedQuestions(new Set());
      setActiveQuestion(null);
      setShowAnswer(false);
      setSelectedAnswerIdx(null);
      setPhase('game');
      playSoundSuccess();
      toast.success("¡Tablero Jeopardy generado exitosamente!");
    } catch (err: any) {
      console.error(err);
      toast.error("Ocurrió un error al generar las preguntas de Jeopardy.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCardClick = (catIdx: number, qIdx: number, question: JeopardyQuestion, e: React.MouseEvent) => {
    const key = `${catIdx}-${qIdx}`;
    if (playedQuestions.has(key)) return;

    setClickCoords({ x: e.clientX, y: e.clientY });
    playSoundTick();
    setActiveQuestion({ question, catIdx, qIdx });
    setShowAnswer(false);
    setSelectedAnswerIdx(null);
  };

  const assignPoints = (teamIdx: number, value: number) => {
    if (!activeQuestion) return;
    setScores(prev => {
      const updated = [...prev];
      updated[teamIdx] = Math.max(0, updated[teamIdx] + value);
      return updated;
    });
    if (value > 0) {
      playSoundSuccess();
      toast.success(`Se sumaron +${value} pts a ${teamNames[teamIdx]}`);
    } else {
      playSoundFailure();
      toast.error(`Se restaron ${value} pts a ${teamNames[teamIdx]}`);
    }
  };

  const closeQuestionModal = () => {
    if (!activeQuestion) return;
    const key = `${activeQuestion.catIdx}-${activeQuestion.qIdx}`;
    setPlayedQuestions(prev => {
      const updated = new Set(prev);
      updated.add(key);
      return updated;
    });
    setActiveQuestion(null);
  };

  const checkGameCompletion = () => {
    // If all cards played (4 categories * 5 rows = 20 questions)
    const totalQuestions = categories.length * 5;
    return playedQuestions.size >= totalQuestions;
  };

  const triggerWinnerCelebration = () => {
    setPhase('summary');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });
    }, 150);
  };

  // Find winning score and team names
  const maxScore = Math.max(...scores.slice(0, numTeams));
  const winningIndices = scores
    .slice(0, numTeams)
    .map((score, idx) => (score === maxScore ? idx : -1))
    .filter(idx => idx !== -1);

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
          isOpen={showLimitModal} 
          onClose={() => setShowLimitModal(false)} 
          requiredCredits={getCreditCosts().jeopardy_generator}
          currentCredits={getUserCredits(user)}
          actionName="generar esta dinámica"
        />

        {/* Header Controls */}
        <header className="flex items-center justify-between px-6 py-4 w-full max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs mb-6 mt-4 select-none gap-4">
          <div className="flex-1 flex justify-start">
            {phase === 'config' ? (
              <Link 
                to="/dinamicas" 
                className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                ← VOLVER A DINÁMICAS
              </Link>
            ) : (
              <button
                onClick={() => {
                  setShowExitModal(true);
                }}
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

          <div className="flex-1 flex justify-end gap-3 items-center">
            {phase !== 'config' && (
              <>
                <button
                  onClick={() => {
                    setShowResetModal(true);
                  }}
                  className="px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-350 font-black text-xs rounded-full border border-black/10 dark:border-white/10 shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <RefreshCw size={12} className="shrink-0" />
                  <span>Reiniciar</span>
                </button>

                <button
                  onClick={triggerWinnerCelebration}
                  className="px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white font-black text-xs rounded-full shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Trophy size={14} />
                  Terminar Juego
                </button>
              </>
            )}

            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              {isFullscreen ? '⤢ SALIR PANTALLA COMPLETA' : '⤢ PANTALLA COMPLETA'}
            </button>
          </div>
        </header>


        {/* Título Principal (HTML Rediseñado, Compacto y Estático) */}
        <div className="print:hidden mb-5 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-sky-600/10 dark:from-sky-500/15 dark:to-blue-600/15 border border-sky-500/15 dark:border-sky-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full max-w-4xl mx-auto">
            {/* Decoración de fondo */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-500/10 dark:bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            
            {/* Contenedor de Icono */}
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-sky-500/20 dark:bg-sky-500/30 flex items-center justify-center shrink-0 border border-sky-500/30 dark:border-sky-500/40 relative">
                <Trophy className="w-5 h-5 md:w-6 h-6 text-sky-600 dark:text-sky-400 stroke-[2.5]" />
            </div>

            {/* Textos */}
            <div className="text-center md:text-left flex-1 relative z-10">
                <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                    Jeopardy Planix
                </h1>
                <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
                    Divide tu aula en grupos, selecciona categorías con Inteligencia Artificial y juega al clásico Jeopardy escolar.
                </p>
            </div>
        </div>

        {/* PHASE 1: CONFIGURATION */}
        {phase === 'config' && (
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Config Card Left */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 select-none">
                <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">1</span>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  Participantes
                </h3>
              </div>

              {/* Styled Tabs selector container */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-zinc-950 rounded-2xl border border-slate-200/40 dark:border-zinc-800/80 mb-5 select-none">
                <button
                  type="button"
                  onClick={() => setParticipantMode('class')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    participantMode === 'class'
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
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
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <FileText size={14} />
                  <span>Lista personalizada</span>
                </button>
              </div>

              {/* Tab Contents */}
              {participantMode === 'class' ? (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Class Select Custom Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Seleccionar Aula</label>
                    <div className="relative w-full select-none">
                      <button
                        type="button"
                        onClick={() => setShowClassDropdown(!showClassDropdown)}
                        className="w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-slate-500">🏫</span>
                          <span className="truncate">
                            {classrooms.find(c => c.id === selectedClassId)
                              ? `${classrooms.find(c => c.id === selectedClassId)?.nombre} - Sec. ${classrooms.find(c => c.id === selectedClassId)?.seccion}`
                              : "No tienes aulas creadas"}
                          </span>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-250 ${showClassDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showClassDropdown && classrooms.length > 0 && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowClassDropdown(false)} />
                          <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-xl rounded-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75 text-left max-h-60 overflow-y-auto">
                            <div className="space-y-0.5">
                              {classrooms.map((c) => {
                                const isActive = c.id === selectedClassId;
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedClassId(c.id);
                                      setShowClassDropdown(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                      isActive
                                        ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white"
                                        : "text-slate-750 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span>🏫</span>
                                      <span className="truncate">{c.nombre} - Sec. {c.seccion}</span>
                                    </div>
                                    {isActive && <Check size={14} className="shrink-0 text-[#1B1B1B] dark:text-white" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Number of Teams (Cantidad de Equipos) */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Cantidad de Equipos</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNumTeams(Math.max(2, numTeams - 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white active:scale-95 transition-all shadow-2xs cursor-pointer select-none border-none font-bold"
                      >
                        <span className="text-lg font-semibold leading-none">-</span>
                      </button>

                      <div className="flex-1 flex items-center px-1">
                        <input
                          type="range"
                          min={2}
                          max={10}
                          value={numTeams}
                          onChange={e => setNumTeams(parseInt(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none active:scale-[1.01] transition-transform"
                          style={{
                            background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${((numTeams - 2) / 8) * 100}%, var(--plx-slider-track-bg, #e2e8f0) ${((numTeams - 2) / 8) * 100}%, var(--plx-slider-track-bg, #e2e8f0) 100%)`,
                            WebkitAppearance: 'none'
                          }}
                        />
                      </div>

                      <div className="w-11 h-9 flex items-center justify-center text-center font-bold border border-slate-250 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 shadow-2xs select-none">
                        {numTeams}
                      </div>

                      <button
                        type="button"
                        onClick={() => setNumTeams(Math.min(10, numTeams + 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition-all shadow-2xs cursor-pointer select-none border-none font-bold"
                      >
                        <span className="text-lg font-semibold leading-none">+</span>
                      </button>
                    </div>
                    {classStudents.length > 0 && numTeams <= classStudents.length && (
                      <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl p-4 mt-3 animate-in fade-in duration-200 text-left select-none space-y-2.5">
                        <div className="flex items-center gap-2 text-brand-primary dark:text-blue-400 font-black text-xs uppercase tracking-wider">
                          <Users size={15} className="shrink-0" />
                          <span>Formación de Equipos</span>
                        </div>
                        <div className="space-y-1 text-slate-650 dark:text-zinc-300 font-bold text-xs">
                          <p className="font-extrabold text-slate-800 dark:text-zinc-150">
                            Se formarán {numTeams} grupos:
                          </p>
                          <ul className="list-none space-y-1 pl-0">
                            {(() => {
                              const total = classStudents.length;
                              const perTeam = Math.floor(total / numTeams);
                              const remainder = total % numTeams;
                              if (remainder === 0) {
                                return (
                                  <li className="flex items-center gap-2 pl-1.5 border-l-2 border-blue-500">
                                    <span>•</span>
                                    <span>{numTeams} grupos de {perTeam} alumnos</span>
                                  </li>
                                );
                              } else {
                                return (
                                  <>
                                    {numTeams - remainder > 0 && (
                                      <li className="flex items-center gap-2 pl-1.5 border-l-2 border-blue-400">
                                        <span>•</span>
                                        <span>{numTeams - remainder} {numTeams - remainder === 1 ? 'grupo' : 'grupos'} de {perTeam} alumnos</span>
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
                    {classStudents.length > 0 && numTeams > classStudents.length && (
                      <div className="bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200/60 dark:border-amber-800/30 rounded-2xl p-4 mt-3 animate-in fade-in duration-200 text-left select-none space-y-2">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider">
                          <AlertCircle size={15} className="shrink-0" />
                          <span>Alumnos insuficientes</span>
                        </div>
                        <p className="text-xs font-bold text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                          El aula solo tiene <span className="font-black text-amber-800 dark:text-amber-200">{classStudents.length}</span> {classStudents.length === 1 ? 'estudiante' : 'estudiantes'}, pero estás intentando formar <span className="font-black text-amber-800 dark:text-amber-200">{numTeams}</span> grupos. Se necesita al menos 1 alumno por grupo.
                        </p>
                        <p className="text-[11px] font-bold text-amber-600/70 dark:text-amber-400/60">
                          Reduce la cantidad de equipos a {classStudents.length} o menos.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Number of Teams (Cantidad de Equipos) */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Cantidad de Equipos</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNumTeams(Math.max(2, numTeams - 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white active:scale-95 transition-all shadow-2xs cursor-pointer select-none border-none font-bold"
                      >
                        <span className="text-lg font-semibold leading-none">-</span>
                      </button>

                      <div className="flex-1 flex items-center px-1">
                        <input
                          type="range"
                          min={2}
                          max={10}
                          value={numTeams}
                          onChange={e => setNumTeams(parseInt(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none active:scale-[1.01] transition-transform"
                          style={{
                            background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${((numTeams - 2) / 8) * 100}%, var(--plx-slider-track-bg, #e2e8f0) ${((numTeams - 2) / 8) * 100}%, var(--plx-slider-track-bg, #e2e8f0) 100%)`,
                            WebkitAppearance: 'none'
                          }}
                        />
                      </div>

                      <div className="w-11 h-9 flex items-center justify-center text-center font-bold border border-slate-250 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 shadow-2xs select-none">
                        {numTeams}
                      </div>

                      <button
                        type="button"
                        onClick={() => setNumTeams(Math.min(10, numTeams + 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition-all shadow-2xs cursor-pointer select-none border-none font-bold"
                      >
                        <span className="text-lg font-semibold leading-none">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Name Inputs */}
                  <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Personalizar nombres de equipos</label>
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: numTeams }).map((_, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400">Equipo {idx + 1}</span>
                          <input
                            type="text"
                            value={teamNames[idx]}
                            onChange={(e) => {
                              const updated = [...teamNames];
                              updated[idx] = e.target.value;
                              setTeamNames(updated);
                            }}
                            className="w-full h-9 px-3 rounded-lg border border-black/5 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:border-brand-primary transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Config Card Right (AI Topic) */}
            <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 select-none">
                <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">2</span>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  Generación de Trivia
                </h3>
              </div>

              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tema o Contenido de la Clase</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej. La célula animal, Historia Dominicana, Fracciones"
                  disabled={isGenerating}
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold focus:outline-none focus:border-brand-primary transition-colors shadow-2xs"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Dificultad de las Preguntas</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Fácil', 'Medio', 'Difícil']).map(d => {
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
                        disabled={isGenerating}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${isSelected
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
                  {difficulty === 'Fácil' && '• Las preguntas serán más simples y directas para educación primaria.'}
                  {difficulty === 'Medio' && '• Las preguntas tendrán dificultad intermedia para primaria y secundaria.'}
                  {difficulty === 'Difícil' && '• Las preguntas serán más complejas y avanzadas para educación secundaria.'}
                </p>
              </div>

              {/* Play Sound and options */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 py-2 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowSound(!showSound)}
                  className="flex items-center gap-2 cursor-pointer border-none bg-transparent hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  {showSound ? <Volume2 size={16} className="text-brand-primary" /> : <VolumeX size={16} className="text-slate-400" />}
                  <span>Efectos de Sonido ({showSound ? 'Sí' : 'No'})</span>
                </button>
              </div>

              {/* Submit Trigger */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white text-[13px] font-black uppercase tracking-wider rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 shadow-brand-primary/20"
                >
                  {isGenerating ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Sparkles className="w-4.5 h-4.5" />}
                  {isGenerating ? 'Generando dinámica...' : 'Generar dinámica'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PHASE 2: GAME BOARD */}
        {phase === 'game' && categories.length > 0 && (
          <div className="space-y-8 select-none">
            
            {/* Grid Container */}
            <div className="w-full overflow-x-auto scrollbar-hide pb-2">
              <div className="min-w-[800px] grid grid-cols-4 gap-4">
                
                {/* Category Header Row */}
                {categories.map((cat, catIdx) => (
                  <div 
                    key={catIdx}
                    className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 rounded-xl p-4 text-center shadow-xs flex items-center justify-center min-h-[70px]"
                  >
                    <span className="text-xs md:text-sm font-black text-slate-700 dark:text-zinc-200 tracking-wide uppercase line-clamp-2">
                      {cat.name}
                    </span>
                  </div>
                ))}

                {/* Point Value Rows (100 to 500) */}
                {Array.from({ length: 5 }).map((_, qIdx) => {
                  const points = (qIdx + 1) * 100;
                  return (
                    <React.Fragment key={qIdx}>
                      {categories.map((cat, catIdx) => {
                        const question = cat.questions.find(q => q.points === points) || cat.questions[qIdx];
                        const key = `${catIdx}-${qIdx}`;
                        const isPlayed = playedQuestions.has(key);

                        return (
                          <div 
                            key={catIdx}
                            onClick={(e) => !isPlayed && handleCardClick(catIdx, qIdx, question, e)}
                            className={`h-24 rounded-2xl flex items-center justify-center text-xl font-black tracking-wider cursor-pointer border transition-all ${
                              isPlayed
                                ? 'bg-slate-50 dark:bg-zinc-950/20 text-slate-300 dark:text-zinc-850 border-dashed border-slate-200 dark:border-zinc-850 opacity-40 cursor-not-allowed'
                                : 'bg-brand-primary hover:bg-brand-hover text-white shadow-md border-transparent hover:scale-105 active:scale-95'
                            }`}
                          >
                            <span>{points}</span>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

              </div>
            </div>

            {/* Sticky Scoreboard Footer */}
            <div className="w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-lg space-y-4">
              <h4 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-widest text-center md:text-left select-none">
                Equipos Jeopardy
              </h4>
              
              {/* Score List */}
              <div className="flex flex-wrap items-stretch justify-center md:justify-start gap-4">
                {Array.from({ length: numTeams }).map((_, idx) => {
                  const teamScore = scores[idx];
                  const style = teamStyles[idx % teamStyles.length];
                  return (
                    <div 
                      key={idx} 
                      className={`flex-1 min-w-[150px] max-w-[180px] flex flex-col ${style.bg} border-2 ${style.border} rounded-[24px] p-4 text-center transition-all duration-350 hover:-translate-y-0.5 hover:shadow-md ${style.glow} shadow-sm select-none relative overflow-hidden group/team`}
                    >
                      {/* Top Accent Strip */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${style.dot}`} />

                      {/* Team Name Pill */}
                      <div className="flex justify-center mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${style.pill} truncate max-w-full`}>
                          {teamNames[idx]}
                        </span>
                      </div>
                      
                      {/* Team Score */}
                      <div className="flex items-baseline justify-center gap-0.5 my-1">
                        <span className={`text-2xl md:text-3xl font-black tracking-tight ${style.text}`}>
                          {teamScore}
                        </span>
                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                          pts
                        </span>
                      </div>

                      {/* Student List */}
                      {participantMode === 'class' && teamStudents[idx] && teamStudents[idx].length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-left">
                          <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 select-none">
                            Estudiantes:
                          </p>
                          <ul className="space-y-0.5 text-[10px] font-medium text-slate-650 dark:text-zinc-400 max-h-40 overflow-y-auto pl-1 list-disc list-inside">
                            {(expandedTeams[idx] ? teamStudents[idx] : teamStudents[idx].slice(0, 5)).map((name, sIdx) => (
                              <li key={sIdx} className="truncate select-none">
                                {name}
                              </li>
                            ))}
                          </ul>
                          {teamStudents[idx].length > 5 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedTeams(prev => {
                                  const copy = [...prev];
                                  copy[idx] = !copy[idx];
                                  return copy;
                                });
                              }}
                              className="mt-1.5 text-[9px] font-black text-brand-primary dark:text-[#38BDF8] hover:underline cursor-pointer uppercase select-none block border-none bg-transparent"
                            >
                              {expandedTeams[idx] ? "Ver menos" : `Ver más (${teamStudents[idx].length - 5} más)`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* PHASE 3: GAME SUMMARY / WINNER PODIUM */}
        {phase === 'summary' && (
          <div className="max-w-2xl mx-auto w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-8 md:p-12 shadow-lg text-center space-y-8 select-none">
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/30 text-amber-500 rounded-3xl flex items-center justify-center mb-6 shadow-xs border border-amber-200/50">
                <Trophy size={44} className="animate-bounce" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-zinc-150 uppercase tracking-wide">
                ¡Fin de la trivia Jeopardy!
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-2">
                Puntuaciones y resultados finales de la sesión de clase.
              </p>
            </div>

            {/* Winner Roster */}
            <div className="space-y-3">
              {scores.slice(0, numTeams)
                .map((score, idx) => ({ name: teamNames[idx], score, isWinner: winningIndices.includes(idx) }))
                .sort((a, b) => b.score - a.score)
                .map((team, rank) => (
                  <div 
                    key={rank}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      team.isWinner
                        ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900 text-slate-850 dark:text-zinc-100 shadow-md font-black'
                        : 'bg-slate-50/30 dark:bg-zinc-800/10 border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-450 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-850 text-xs font-black flex items-center justify-center shadow-xs">
                        #{rank + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{team.name}</span>
                        {team.isWinner && <Award size={16} className="text-amber-500 fill-amber-100 dark:fill-amber-950/20" />}
                      </div>
                    </div>
                    <span className="text-lg font-black">{team.score} pts</span>
                  </div>
                ))}
            </div>

            {/* Option CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setPhase('config')}
                className="px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white font-black text-xs rounded-full shadow-md uppercase tracking-wider cursor-pointer"
              >
                Volver a Configurar
              </button>

              <button
                onClick={() => {
                  setScores(new Array(6).fill(0));
                  setPlayedQuestions(new Set());
                  setPhase('game');
                  confetti({ particleCount: 80, spread: 60 });
                }}
                className="px-6 py-3 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-350 border border-black/10 dark:border-white/10 font-black text-xs rounded-full shadow-md uppercase tracking-wider cursor-pointer"
              >
                Jugar de nuevo
              </button>
            </div>

          </div>
        )}

      </main>

      {/* QUESTION DISPLAY FULLSCREEN (ACTIVE STAGE) */}
      <AnimatePresence>
        {activeQuestion && (
          <motion.div 
            initial={{ 
              clipPath: clickCoords 
                ? `circle(0px at ${clickCoords.x}px ${clickCoords.y}px)` 
                : 'circle(0% at 50% 50%)',
              opacity: 0.8
            }}
            animate={{ 
              clipPath: clickCoords 
                ? `circle(150% at ${clickCoords.x}px ${clickCoords.y}px)` 
                : 'circle(150% at 50% 50%)',
              opacity: 1
            }}
            exit={{ 
              clipPath: clickCoords 
                ? `circle(0px at ${clickCoords.x}px ${clickCoords.y}px)` 
                : 'circle(0% at 50% 50%)',
              opacity: 0
            }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-slate-50 text-slate-800 dark:bg-gradient-to-b dark:from-[#0B0F19] dark:via-[#0F172A] dark:to-[#1E1B4B] dark:text-white flex flex-col justify-between select-none p-6 md:p-10 overflow-y-auto"
          >
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-6 shrink-0 gap-4">
              <button 
                onClick={closeQuestionModal}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover border border-transparent rounded-full text-xs font-black tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-md select-none text-white"
              >
                <span>← Volver al Tablero</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-yellow-400 text-slate-950 font-black rounded border-none shadow-2xs">ESC</kbd>
              </button>

              <div className="flex flex-col items-center text-center">
                <span className="text-xs md:text-sm font-black tracking-widest text-brand-primary dark:text-[#38BDF8] uppercase select-none">
                  {categories[activeQuestion.catIdx].name}
                </span>
                <span className="text-lg md:text-xl font-extrabold tracking-wide text-amber-600 dark:text-amber-400 select-none">
                  {activeQuestion.question.points} PUNTOS
                </span>
              </div>

              {!showAnswer ? (
                <button 
                  onClick={() => {
                    setShowAnswer(true);
                    playSoundSuccess();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 border border-transparent text-white rounded-full text-xs font-black tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-md select-none"
                >
                  <span>Revelar Respuesta</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-yellow-400 text-slate-950 font-black rounded border-none shadow-2xs">Espacio</kbd>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-black tracking-wider uppercase select-none">
                  <Check size={14} />
                  <span>Revelada</span>
                </div>
              )}
            </div>

            {/* Question Text & Options Grid */}
            <div className="flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto w-full my-6 text-center select-none space-y-8 md:space-y-12">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 dark:text-white leading-snug drop-shadow-xs max-w-4xl tracking-tight px-4 select-none">
                {activeQuestion.question.question}
              </h2>
              
              {/* Multiple Choice Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full px-4 select-none">
                {activeQuestion.question.options.map((opt, optIdx) => {
                  const isCorrect = opt === activeQuestion.question.correctAnswer;
                  const isSelected = selectedAnswerIdx === optIdx;

                  let buttonClass = 'bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border-slate-200 dark:border-zinc-800 text-brand-primary dark:text-[#38BDF8] hover:scale-[1.01] active:scale-[0.99]';
                  if (showAnswer) {
                    if (isCorrect) {
                      buttonClass = 'bg-emerald-600 border-emerald-500 text-white scale-[1.02] shadow-lg shadow-emerald-500/20';
                    } else if (isSelected) {
                      buttonClass = 'bg-red-650 border-red-500 text-white opacity-85';
                    } else {
                      buttonClass = 'bg-slate-100 dark:bg-[#1E293B]/20 border-slate-200/50 dark:border-white/5 text-slate-400 dark:text-slate-500 opacity-40';
                    }
                  } else if (isSelected) {
                    buttonClass = 'bg-brand-primary border-brand-primary text-white scale-[1.02] shadow-lg shadow-brand-primary/25';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={showAnswer}
                      onClick={() => {
                        setSelectedAnswerIdx(optIdx);
                        playSoundTick();
                      }}
                      className={`p-5 md:p-7 rounded-[24px] border-2 font-black text-base md:text-xl lg:text-2xl text-left transition-all duration-200 flex items-start gap-4 ${buttonClass} ${
                        !showAnswer ? 'cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                        showAnswer && isCorrect 
                          ? 'bg-white text-emerald-600' 
                          : isSelected 
                            ? 'bg-white text-brand-primary dark:bg-zinc-950 dark:text-[#38BDF8]' 
                            : showAnswer 
                              ? 'bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-slate-500'
                              : 'bg-brand-primary text-white dark:bg-[#38BDF8] dark:text-zinc-950'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1 pt-0.5">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Banner (when revealed) */}
              {showAnswer && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-4xl mx-auto p-5 md:p-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-[24px] text-left space-y-1 md:space-y-2 backdrop-blur-xs select-none shadow-md"
                >
                  <span className="text-[10px] md:text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Check size={14} />
                    Explicación Correcta
                  </span>
                  <p className="text-xs md:text-sm lg:text-base font-semibold text-emerald-800 dark:text-emerald-200/90 leading-relaxed">
                    {activeQuestion.question.explanation || `La respuesta correcta es: ${activeQuestion.question.correctAnswer}`}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer Scoring Panel */}
            <div className="w-full max-w-5xl mx-auto bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[28px] p-5 backdrop-blur-xs select-none space-y-3 shrink-0 shadow-sm">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] md:text-xs font-black text-slate-400 dark:text-white/50 uppercase tracking-widest">
                  Puntaje del Tablero
                </span>
                <span className="text-[10px] md:text-xs font-black text-brand-primary dark:text-[#38BDF8] uppercase tracking-widest">
                  Asignar a los Grupos
                </span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 w-full">
                {Array.from({ length: numTeams }).map((_, idx) => {
                  const teamScore = scores[idx];
                  const style = teamStyles[idx % teamStyles.length];
                  return (
                    <div 
                      key={idx}
                      className={`flex-1 min-w-[230px] max-w-[260px] flex flex-col ${style.bg} border-2 ${style.border} rounded-[28px] p-5 text-center transition-all duration-350 hover:-translate-y-1 hover:shadow-lg ${style.glow} shadow-sm select-none relative overflow-hidden group/team`}
                    >
                      {/* Top Accent Strip */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${style.dot}`} />

                      {/* Team Name Pill */}
                      <div className="flex justify-center mb-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${style.pill} truncate max-w-full`}>
                          {teamNames[idx]}
                        </span>
                      </div>
                      
                      {/* Team Score */}
                      <div className="flex items-baseline justify-center gap-1 my-2">
                        <span className={`text-4xl md:text-5xl font-black tracking-tight ${style.text}`}>
                          {teamScore}
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                          pts
                        </span>
                      </div>

                      {/* Student List */}
                      {participantMode === 'class' && teamStudents[idx] && teamStudents[idx].length > 0 && (
                        <div className="mt-1 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-left">
                          <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 select-none">
                            Estudiantes:
                          </p>
                          <ul className="space-y-0.5 text-[10px] font-medium text-slate-650 dark:text-zinc-400 max-h-40 overflow-y-auto pl-1 list-disc list-inside">
                            {(expandedTeams[idx] ? teamStudents[idx] : teamStudents[idx].slice(0, 5)).map((name, sIdx) => (
                              <li key={sIdx} className="truncate select-none">
                                {name}
                              </li>
                            ))}
                          </ul>
                          {teamStudents[idx].length > 5 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedTeams(prev => {
                                  const copy = [...prev];
                                  copy[idx] = !copy[idx];
                                  return copy;
                                });
                              }}
                              className="mt-1.5 text-[9px] font-black text-brand-primary dark:text-[#38BDF8] hover:underline cursor-pointer uppercase select-none block border-none bg-transparent"
                            >
                              {expandedTeams[idx] ? "Ver menos" : `Ver más (${teamStudents[idx].length - 5} más)`}
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Buttons Footer */}
                      <div className="flex gap-2 w-full justify-between items-center mt-4 pt-3 border-t border-slate-150 dark:border-zinc-800/80">
                        {/* Correct (+) */}
                        <button
                          onClick={() => assignPoints(idx, activeQuestion.question.points)}
                          className="flex-1 py-2.5 px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wide transition-all duration-200 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5 hover:shadow-sm hover:shadow-emerald-500/20"
                        >
                          <Check size={13} className="stroke-[3.5] shrink-0" />
                          <span>CORRECTO</span>
                        </button>
                        
                        {/* Incorrect (-) */}
                        <button
                          onClick={() => assignPoints(idx, -activeQuestion.question.points)}
                          className="flex-1 py-2.5 px-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wide transition-all duration-200 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5 hover:shadow-sm hover:shadow-rose-500/20"
                        >
                          <X size={13} className="stroke-[3.5] shrink-0" />
                          <span>INCORRECTO</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Exit Confirm Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[400px] p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 mx-4 text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-550 dark:text-rose-455 flex items-center justify-center">
              <AlertCircle size={28} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 dark:text-zinc-150 tracking-tight">
                ¿Salir del juego?
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed font-bold max-w-[280px] mx-auto">
                ¿Estás seguro de que deseas salir del juego actual? Perderás el progreso y los puntajes de la partida.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer border-none"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
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

      {/* Custom Reset Confirm Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[400px] p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 mx-4 text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-550 dark:text-amber-455 flex items-center justify-center">
              <AlertCircle size={28} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 dark:text-zinc-150 tracking-tight">
                ¿Reiniciar puntajes?
              </h3>
              <p className="text-[12px] text-slate-550 dark:text-zinc-400 leading-relaxed font-bold max-w-[280px] mx-auto">
                ¿Estás seguro de que deseas reiniciar el puntaje de todos los equipos y las preguntas jugadas?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer border-none"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setScores(new Array(6).fill(0));
                  setPlayedQuestions(new Set());
                  toast.success("El juego ha sido reiniciado.");
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all shadow-md cursor-pointer border-none"
              >
                Sí, reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Generation Loading Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[380px] p-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 mx-4 overflow-hidden">
            <div className="flex flex-col items-center justify-center p-8 pt-10 pb-7 text-center">
              <button
                type="button"
                onClick={() => setIsGenerating(false)}
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
                  Preparando Jeopardy
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

    </div>
  );
}
