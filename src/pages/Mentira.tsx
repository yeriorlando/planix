import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { 
  Play, Users, Plus, Trash2, Volume2, VolumeX, 
  Sparkles, RefreshCw, Check, X, HelpCircle, GraduationCap,
  Maximize2, Minimize2, Trophy, ChevronDown, Award, ArrowLeft,
  AlertCircle, Smile, Zap, Brain, FileText, Crown,
  BookText, Ruler, Globe, Leaf, Palette, Dumbbell, Heart, Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast, Toaster } from 'sonner';
import { getCurrentUser, getClassrooms, Classroom, getStudents, Student } from '../lib/storage';
import { consumeCredits, hasEnoughCredits, getUserCredits, getCreditCosts } from '../lib/credits';
import { generateTwoTruthsAndLie, TwoTruthsAndLieChallenge } from '../lib/services/aiService';
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
    text: 'text-red-655 dark:text-red-400',
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
    text: 'text-teal-650 dark:text-teal-400',
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

const getSubjectIcon = (subjectName: string, sizeClass = "h-4 w-4") => {
  const icon = SUBJECT_ICON_MAP[subjectName];
  if (icon) return React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: sizeClass });
  return <BookText className={sizeClass} />;
};

const SUBJECTS = [
  'Lengua Española',
  'Matemáticas',
  'Ciencias Sociales',
  'Ciencias de la Naturaleza',
  'Educación Artística',
  'Educación Física',
  'Formación H. Integral R.',
  'Lenguas Extranjeras (Inglés)'
];

export default function Mentira() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Classroom States
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [participantMode, setParticipantMode] = useState<'class' | 'custom'>('class');
  const [teamStudents, setTeamStudents] = useState<string[][]>(Array.from({ length: 10 }, () => []));
  const [expandedTeams, setExpandedTeams] = useState<boolean[]>(Array.from({ length: 10 }, () => false));
  const [classStudents, setClassStudents] = useState<Student[]>([]);

  // Configurations
  const [challengeMode, setChallengeMode] = useState<'automatico' | 'tema' | 'manual'>('automatico');
  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECTS[0]);
  const [difficulty, setDifficulty] = useState<string>('Intermedio');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [customTheme, setCustomTheme] = useState<string>('');
  
  // Manual statement inputs
  const [manualTruth1, setManualTruth1] = useState<string>('');
  const [manualTruth2, setManualTruth2] = useState<string>('');
  const [manualLie, setManualLie] = useState<string>('');
  const [manualExplanation, setManualExplanation] = useState<string>('');
  const [manualCategory, setManualCategory] = useState<string>('');

  // Group scoring settings
  const [enableScoring, setEnableScoring] = useState<boolean>(true);
  const [numTeams, setNumTeams] = useState<number>(3);
  const [teamNames, setTeamNames] = useState<string[]>(Array.from({ length: 10 }, (_, i) => `Grupo ${i + 1}`));
  const [scores, setScores] = useState<number[]>(Array.from({ length: 10 }, () => 0));

  // Game states
  const [phase, setPhase] = useState<'config' | 'game' | 'summary'>('config');
  const [challenge, setChallenge] = useState<TwoTruthsAndLieChallenge | null>(null);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  // Common setups
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

  // Fullscreen detector
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard listeners for gameplay phase
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'game') return;
      if (e.key === 'Escape') {
        setShowExitModal(true);
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // Prevent page scrolling
        if (!isRevealed) {
          handleReveal();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, isRevealed, selectedCardIdx, challenge]);

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
      const audio = new Audio("https://cdn.pixabay.com/audio/2021/08/04/audio_bb430d8376.mp3");
      audio.play().catch(e => console.warn("Failed to play sound", e));
    } catch (e) {
      console.warn('Audio failed', e);
    }
  };

  const playSoundFailure = () => {
    if (!showSound) return;
    try {
      const audio = new Audio("https://cdn.pixabay.com/audio/2022/03/10/audio_f7c1d76383.mp3");
      audio.play().catch(e => console.warn("Failed to play sound", e));
    } catch (e) {
      console.warn('Audio failed', e);
    }
  };

  // Launch AI generator or prepare manual game
  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (challengeMode === 'tema' && !customTheme.trim()) {
      toast.error("Por favor, ingresa un tema para generar la dinámica.");
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
      if (numTeams > classStudents.length) {
        toast.error(`No hay suficientes alumnos (${classStudents.length}) para formar ${numTeams} grupos.`);
        return;
      }
    }

    if (challengeMode === 'manual') {
      if (!manualTruth1.trim() || !manualTruth2.trim() || !manualLie.trim()) {
        toast.error("Por favor, completa las dos verdades y la mentira.");
        return;
      }

      // Shuffle statements so order is secret
      const items = [
        { text: manualTruth1.trim(), isLie: false },
        { text: manualTruth2.trim(), isLie: false },
        { text: manualLie.trim(), isLie: true }
      ].sort(() => Math.random() - 0.5);

      setChallenge({
        statements: items.map(x => x.text),
        lieIndex: items.findIndex(x => x.isLie),
        explanation: manualExplanation.trim() || "Esta es la mentira que habías ingresado.",
        category: manualCategory.trim() || "Manual"
      });

      // Distribute students randomly if in 'class' mode
      if (participantMode === 'class') {
        const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
        const buckets: string[][] = Array.from({ length: numTeams }, () => []);
        shuffled.forEach((student, idx) => {
          buckets[idx % numTeams].push(student.nombre);
        });
        setTeamStudents(buckets);
      } else {
        setTeamStudents(Array.from({ length: numTeams }, () => []));
      }

      // Reset game states
      setScores(new Array(10).fill(0));
      setSelectedCardIdx(null);
      setIsRevealed(false);
      setPhase('game');
      playSoundSuccess();
      toast.success("¡Partida manual preparada correctamente!");
      return;
    }

    // AI Generation Mode (automatico / tema)
    // Credits validation
    if (!isPremium && !hasEnoughCredits('mentira_generator')) {
      setShowLimitModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generateTwoTruthsAndLie({
        subject: challengeMode === 'automatico' ? selectedSubject : undefined,
        topic: challengeMode === 'tema' ? customTheme.trim() : undefined,
        difficulty: difficulty === 'Básico' ? 'Básico' : difficulty === 'Avanzado' ? 'Avanzado' : 'Intermedio'
      });

      // Deduct coins silently
      if (!isPremium) {
        consumeCredits('mentira_generator');
      }

      setChallenge(generated);
      
      // Distribute students randomly if in 'class' mode
      if (participantMode === 'class') {
        const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
        const buckets: string[][] = Array.from({ length: numTeams }, () => []);
        shuffled.forEach((student, idx) => {
          buckets[idx % numTeams].push(student.nombre);
        });
        setTeamStudents(buckets);
      } else {
        setTeamStudents(Array.from({ length: numTeams }, () => []));
      }

      // Reset game states
      setScores(new Array(10).fill(0));
      setSelectedCardIdx(null);
      setIsRevealed(false);
      setPhase('game');
      playSoundSuccess();
      toast.success("¡Dinámica generada exitosamente!");
    } catch (err: any) {
      console.error(err);
      toast.error("Ocurrió un error al generar las afirmaciones con la IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectCard = (idx: number) => {
    if (isRevealed) return;
    setSelectedCardIdx(idx);
    playSoundTick();
  };

  const handleReveal = () => {
    if (selectedCardIdx === null) {
      toast.error("Por favor, selecciona una afirmación primero para adivinar cuál es la mentira.");
      return;
    }
    
    setIsRevealed(true);
    const isCorrect = selectedCardIdx === challenge?.lieIndex;

    if (isCorrect) {
      playSoundSuccess();
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success("¡Excelente! Han adivinado la mentira correctamente.");
    } else {
      playSoundFailure();
      toast.error("¡Incorrecto! Esa afirmación es una verdad.");
    }
  };

  const assignPoints = (teamIdx: number, val: number) => {
    setScores(prev => {
      const updated = [...prev];
      updated[teamIdx] = Math.max(0, updated[teamIdx] + val);
      return updated;
    });
    if (val > 0) {
      playSoundSuccess();
      toast.success(`Se sumaron +${val} pts a ${teamNames[teamIdx]}`);
    } else {
      playSoundFailure();
      toast.error(`Se restaron ${Math.abs(val)} pts a ${teamNames[teamIdx]}`);
    }
  };

  const handleNewRound = async () => {
    if (challengeMode === 'manual') {
      setPhase('config');
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generateTwoTruthsAndLie({
        subject: challengeMode === 'automatico' ? selectedSubject : undefined,
        topic: challengeMode === 'tema' ? customTheme.trim() : undefined,
        difficulty: difficulty === 'Básico' ? 'Básico' : difficulty === 'Avanzado' ? 'Avanzado' : 'Intermedio'
      });
      setChallenge(generated);
      setSelectedCardIdx(null);
      setIsRevealed(false);
      playSoundSuccess();
      toast.success("¡Nueva ronda generada!");
    } catch (err: any) {
      console.error(err);
      toast.error("Error al generar la nueva ronda.");
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerWinnerCelebration = () => {
    setPhase('summary');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 95,
        origin: { y: 0.5 }
      });
    }, 150);
  };

  const maxScore = Math.max(...scores.slice(0, numTeams));
  const winningIndices = scores
    .slice(0, numTeams)
    .map((score, idx) => (score === maxScore && score > 0 ? idx : -1))
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
          requiredCredits={getCreditCosts().mentira_generator}
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
                onClick={() => setShowExitModal(true)}
                className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                ← CONFIGURAR NUEVA
              </button>
            )}
          </div>

          <div className="flex-none flex items-center justify-center">
            {isPremium ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/12 dark:from-amber-500/20 dark:to-amber-600/20 border border-amber-500/25 dark:border-amber-500/40 rounded-full shadow-[0_2px_12px_rgba(245,158,11,0.08)]">
                <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-505 fill-amber-500/20 stroke-[2.5]" />
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
                />
                <span className="text-xs md:text-sm font-black text-slate-800 dark:text-zinc-200">
                  {getUserCredits(user)} PC
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 flex justify-end gap-3 items-center">
            {phase === 'game' && enableScoring && (
              <>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-350 font-black text-xs rounded-full border border-black/10 dark:border-white/10 shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <RefreshCw size={12} className="shrink-0" />
                  <span>Reiniciar Pts</span>
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

        {/* Title Banner */}
        <div className="print:hidden mb-5 bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-pink-600/10 dark:from-pink-500/15 dark:to-rose-600/15 border border-pink-500/15 dark:border-pink-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full max-w-4xl mx-auto">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-rose-500/10 dark:bg-rose-505/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-pink-500/20 dark:bg-pink-500/30 flex items-center justify-center shrink-0 border border-pink-500/30 dark:border-pink-505/40 relative">
                <Sparkles className="w-5 h-5 md:w-6 h-6 text-pink-600 dark:text-pink-400 stroke-[2.5]" />
            </div>

            <div className="text-center md:text-left flex-1 relative z-10">
                <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                    Dos Verdades y Una Mentira
                </h1>
                <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
                    Propón afirmaciones fascinantes a los alumnos: 2 son verdades pedagógicas y 1 es una mentira. ¡Descubran cuál es el dato falso!
                </p>
            </div>
        </div>

        {/* PHASE 1: CONFIGURATION */}
        {phase === 'config' && (
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Card: Game Setup & Teams (Matching Jeopardy Style) */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 select-none">
                <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">1</span>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  Participantes
                </h3>
              </div>

              {/* Styled Tabs selector container */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-zinc-950 rounded-2xl border border-slate-200/40 dark:border-zinc-800/80 select-none">
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
                          <span className="text-slate-505">🏫</span>
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

                  {/* Number of Teams slider */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-450">Cantidad de Equipos</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNumTeams(Math.max(2, numTeams - 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white active:scale-95 transition-all shadow-2xs cursor-pointer select-none border-none font-bold"
                      >
                        <span className="text-lg leading-none">-</span>
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
                        <span className="text-lg leading-none">+</span>
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
                  {/* Number of Teams slider */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-455">Cantidad de Equipos</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNumTeams(Math.max(2, numTeams - 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white active:scale-95 transition-all shadow-2xs cursor-pointer select-none border-none font-bold"
                      >
                        <span className="text-lg leading-none">-</span>
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
                        <span className="text-lg leading-none">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Team name inputs */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-455">Nombres de los Equipos</label>
                    <div className="grid grid-cols-2 gap-3.5">
                      {Array.from({ length: numTeams }).map((_, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400">Grupo {idx + 1}</span>
                          <input
                            type="text"
                            value={teamNames[idx]}
                            onChange={(e) => {
                              const updated = [...teamNames];
                              updated[idx] = e.target.value;
                              setTeamNames(updated);
                            }}
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-brand-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Card: Generation Options */}
            <form onSubmit={handleStartGame} className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 select-none">
                <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">2</span>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  Modalidad del Reto
                </h3>
              </div>

              {/* Mode Tabs */}
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 dark:bg-zinc-950 rounded-2xl border border-slate-200/40 dark:border-zinc-800/80 select-none">
                <button
                  type="button"
                  onClick={() => setChallengeMode('automatico')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    challengeMode === 'automatico'
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'text-slate-550 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <GraduationCap size={13} />
                  <span>Asignatura</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChallengeMode('tema')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    challengeMode === 'tema'
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'text-slate-550 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>Por Tema</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChallengeMode('manual')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    challengeMode === 'manual'
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'text-slate-550 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <FileText size={13} />
                  <span>Manual</span>
                </button>
              </div>

              {/* AUTOMATICO: Subject selection */}
              {challengeMode === 'automatico' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Asignatura</label>
                    <div className="relative w-full select-none">
                      <button
                        type="button"
                        onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                        className="w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="shrink-0 text-slate-550 dark:text-zinc-400">{getSubjectIcon(selectedSubject, "h-4 w-4")}</span>
                          <span className="truncate">{selectedSubject}</span>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-250 ${showSubjectDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showSubjectDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowSubjectDropdown(false)} />
                          <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-xl rounded-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75 text-left max-h-60 overflow-y-auto">
                            <div className="space-y-0.5">
                              {SUBJECTS.map((s) => {
                                const isActive = s === selectedSubject;
                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                      setSelectedSubject(s);
                                      setShowSubjectDropdown(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                      isActive
                                        ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white"
                                        : "text-slate-750 dark:text-zinc-455 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="shrink-0 text-slate-550 dark:text-zinc-455">{getSubjectIcon(s, "h-4 w-4")}</span>
                                      <span className="truncate">{s}</span>
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

                  {/* Difficulty selector (Logical difficulty) */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Dificultad de las Preguntas</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(['Básico', 'Intermedio', 'Avanzado']).map(d => {
                        const isSelected = difficulty === d;
                        let icon = <Smile className="w-3.5 h-3.5 shrink-0" />;
                        if (d === 'Intermedio') icon = <Zap className="w-3.5 h-3.5 shrink-0" />;
                        if (d === 'Avanzado') icon = <Brain className="w-3.5 h-3.5 shrink-0" />;
                        
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
                      {difficulty === 'Básico' && '• Las afirmaciones serán más simples y directas para educación primaria.'}
                      {difficulty === 'Intermedio' && '• Las afirmaciones tendrán dificultad intermedia para primaria y secundaria.'}
                      {difficulty === 'Avanzado' && '• Las afirmaciones serán más complejas y avanzadas para educación secundaria.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TEMA: Custom AI Topic Generation */}
              {challengeMode === 'tema' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Tema o Contenido de la Clase</label>
                    <input
                      type="text"
                      required
                      value={customTheme}
                      onChange={(e) => setCustomTheme(e.target.value)}
                      placeholder="Ej. El Descubrimiento de América, Multiplicación, Fotosíntesis"
                      className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold focus:outline-none focus:border-brand-primary transition-colors shadow-2xs"
                    />
                  </div>

                  {/* Difficulty selector (Logical difficulty) */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-455">Dificultad de las Preguntas</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(['Básico', 'Intermedio', 'Avanzado']).map(d => {
                        const isSelected = difficulty === d;
                        let icon = <Smile className="w-3.5 h-3.5 shrink-0" />;
                        if (d === 'Intermedio') icon = <Zap className="w-3.5 h-3.5 shrink-0" />;
                        if (d === 'Avanzado') icon = <Brain className="w-3.5 h-3.5 shrink-0" />;
                        
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
                      {difficulty === 'Básico' && '• Las afirmaciones serán más simples y directas para educación primaria.'}
                      {difficulty === 'Intermedio' && '• Las afirmaciones tendrán dificultad intermedia para primaria y secundaria.'}
                      {difficulty === 'Avanzado' && '• Las afirmaciones serán más complejas y avanzadas para educación secundaria.'}
                    </p>
                  </div>
                </div>
              )}

              {/* MANUAL: Custom Input Setup */}
              {challengeMode === 'manual' && (
                <div className="space-y-3.5 text-left animate-in fade-in duration-200 max-h-[300px] overflow-y-auto pr-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Verdad #1</label>
                    <textarea
                      required
                      rows={2}
                      value={manualTruth1}
                      onChange={(e) => setManualTruth1(e.target.value)}
                      placeholder="Escribe el primer dato verdadero..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Verdad #2</label>
                    <textarea
                      required
                      rows={2}
                      value={manualTruth2}
                      onChange={(e) => setManualTruth2(e.target.value)}
                      placeholder="Escribe el segundo dato verdadero..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-rose-500 dark:text-rose-400">Mentira (Dato Falso)</label>
                    <textarea
                      required
                      rows={2}
                      value={manualLie}
                      onChange={(e) => setManualLie(e.target.value)}
                      placeholder="Escribe la mentira o dato falso..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Explicación Didáctica (Opcional)</label>
                    <input
                      type="text"
                      value={manualExplanation}
                      onChange={(e) => setManualExplanation(e.target.value)}
                      placeholder="¿Por qué la mentira es falsa?"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Categoría o Tema (Opcional)</label>
                    <input
                      type="text"
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      placeholder="Ej. Anatomía, Geografía"
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              )}

              {/* Sound Option */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-505 dark:text-slate-400 py-1.5 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowSound(!showSound)}
                  className="flex items-center gap-2 cursor-pointer border-none bg-transparent hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  {showSound ? <Volume2 size={16} className="text-brand-primary" /> : <VolumeX size={16} className="text-slate-400" />}
                  <span>Efectos de Sonido ({showSound ? 'Sí' : 'No'})</span>
                </button>
              </div>

              {/* Play CTA Button (Renamed to GENERAR DINÁMICA) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white text-[13px] font-black uppercase tracking-wider rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 shadow-brand-primary/20 animate-in fade-in"
                >
                  {isGenerating ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Sparkles className="w-4.5 h-4.5" />}
                  {isGenerating ? 'Generando dinámica...' : 'Generar dinámica'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PHASE 2: GAMEPLAY RETO (Fullscreen Overlay layout matching 3rd and 4th images) */}
        {phase === 'game' && challenge && (
          <div className="fixed inset-0 z-50 bg-slate-50 text-slate-800 dark:bg-gradient-to-b dark:from-[#0B0F19] dark:via-[#0F172A] dark:to-[#1E1B4B] dark:text-white flex flex-col justify-between select-none p-6 md:p-10 overflow-y-auto">
            
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-6 shrink-0 gap-4 select-none">
              <button 
                onClick={() => setShowExitModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover border border-transparent rounded-full text-xs font-black tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-md select-none text-white"
              >
                <span>← Volver al Inicio</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-yellow-400 text-slate-950 font-black rounded border-none shadow-2xs">ESC</kbd>
              </button>

              <div className="flex flex-col items-center text-center select-none">
                <span className="text-xs md:text-sm font-black tracking-widest text-brand-primary dark:text-[#38BDF8] uppercase">
                  {challenge.category}
                </span>
                <span className="text-lg md:text-xl font-extrabold tracking-wide text-amber-600 dark:text-amber-400">
                  DOS VERDADES Y UNA MENTIRA
                </span>
              </div>

              <div className="flex items-center gap-3 select-none">
                {challengeMode !== 'manual' && (
                  <button 
                    disabled={isGenerating}
                    onClick={handleNewRound}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400/40 text-white border border-transparent rounded-full text-xs font-black tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-md select-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span>{isGenerating ? 'Generando...' : 'Nueva Partida'}</span>
                  </button>
                )}

                {!isRevealed ? (
                  <button 
                    onClick={handleReveal}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 border border-transparent text-white rounded-full text-xs font-black tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-md select-none"
                  >
                    <span>Revelar Mentira</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-yellow-400 text-slate-950 font-black rounded border-none shadow-2xs">Espacio</kbd>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-black tracking-wider uppercase select-none">
                    <Check size={14} />
                    <span>Revelada</span>
                  </div>
                )}
              </div>
            </div>

            {/* Question Text & Options Grid */}
            <div className="flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto w-full my-6 text-center select-none space-y-8 md:space-y-12">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 dark:text-white leading-snug drop-shadow-xs max-w-4xl tracking-tight px-4 select-none">
                ¿Cuál de las siguientes afirmaciones es la mentira (el dato falso)?
              </h2>
              
              {/* Multiple Choice Options Grid */}
              <div className="grid grid-cols-1 gap-4 md:gap-5 w-full px-4 select-none">
                {challenge.statements.map((statement, optIdx) => {
                  const isLie = optIdx === challenge.lieIndex;
                  const isSelected = selectedCardIdx === optIdx;

                  let buttonClass = 'bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border-slate-200 dark:border-zinc-800 text-brand-primary dark:text-[#38BDF8] hover:scale-[1.01] active:scale-[0.99]';
                  if (isRevealed) {
                    if (isLie) {
                      buttonClass = 'bg-rose-600 border-rose-500 text-white scale-[1.02] shadow-lg shadow-rose-500/20 border-2';
                    } else if (isSelected) {
                      buttonClass = 'bg-emerald-600 border-emerald-500 text-white scale-[1.02] shadow-lg shadow-emerald-500/20 opacity-85';
                    } else {
                      buttonClass = 'bg-slate-100 dark:bg-[#1E293B]/20 border-slate-200/50 dark:border-white/5 text-slate-400 dark:text-slate-500 opacity-40';
                    }
                  } else if (isSelected) {
                    buttonClass = 'bg-brand-primary border-brand-primary text-white scale-[1.02] shadow-lg shadow-brand-primary/25';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isRevealed}
                      onClick={() => handleSelectCard(optIdx)}
                      className={`p-5 md:p-6 rounded-[24px] border-2 font-black text-base md:text-xl lg:text-2xl text-left transition-all duration-200 flex items-start gap-4 ${buttonClass} ${
                        !isRevealed ? 'cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                        isRevealed && isLie 
                          ? 'bg-white text-rose-600' 
                          : isSelected 
                            ? 'bg-white text-brand-primary dark:bg-zinc-950 dark:text-[#38BDF8]' 
                            : isRevealed 
                              ? 'bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-slate-500'
                              : 'bg-brand-primary text-white dark:bg-[#38BDF8] dark:text-zinc-955'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1 pt-0.5">{statement}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Banner (when revealed) */}
              {isRevealed && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-4xl mx-auto p-5 md:p-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-250 dark:border-emerald-505/25 rounded-[24px] text-left space-y-1 md:space-y-2 backdrop-blur-xs select-none shadow-md"
                >
                  <span className="text-[10px] md:text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Check size={14} className="stroke-[3]" />
                    <span>Explicación Didáctica</span>
                  </span>
                  <p className="text-xs md:text-sm lg:text-base font-semibold text-emerald-800 dark:text-emerald-200/90 leading-relaxed">
                    {challenge.explanation}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer Scoring Panel */}
            {enableScoring && (
              <div className="w-full max-w-5xl mx-auto bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[28px] p-5 backdrop-blur-xs select-none space-y-3 shrink-0 shadow-sm">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] md:text-xs font-black text-slate-400 dark:text-white/50 uppercase tracking-widest">
                    Puntaje de la Dinámica
                  </span>
                  <span className="text-[10px] md:text-xs font-black text-brand-primary dark:text-[#38BDF8] uppercase tracking-widest animate-pulse">
                    Asignar a los Grupos
                  </span>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 w-full py-1">
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
                        <div className="flex justify-center mb-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${style.pill} truncate max-w-full`}>
                            {teamNames[idx]}
                          </span>
                        </div>
                        
                        {/* Team Score */}
                        <div className="flex items-baseline justify-center gap-1 my-1">
                          <span className={`text-3xl md:text-4xl font-black tracking-tight ${style.text}`}>
                            {teamScore}
                          </span>
                          <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                            pts
                          </span>
                        </div>

                        {/* Student List */}
                        {participantMode === 'class' && teamStudents[idx] && teamStudents[idx].length > 0 && (
                          <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-zinc-800/80 text-left">
                            <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5 select-none">
                              Estudiantes:
                            </p>
                            <ul className="space-y-0.5 text-[10px] font-medium text-slate-650 dark:text-zinc-455 max-h-32 overflow-y-auto pl-1 list-disc list-inside">
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
                                className="mt-1 text-[9px] font-black text-brand-primary dark:text-[#38BDF8] hover:underline cursor-pointer uppercase select-none block border-none bg-transparent"
                              >
                                {expandedTeams[idx] ? "Ver menos" : `Ver más (${teamStudents[idx].length - 5} más)`}
                              </button>
                            )}
                          </div>
                        )}
                        
                        {/* Buttons Footer */}
                        <div className="flex gap-2 w-full justify-between items-center mt-3 pt-2.5 border-t border-slate-150 dark:border-zinc-800/80">
                          {/* Correct (+) */}
                          <button
                            onClick={() => assignPoints(idx, 100)}
                            className="flex-1 py-2 px-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wide transition-all duration-200 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1 hover:shadow-sm hover:shadow-emerald-500/20 border-none"
                          >
                            <Check size={12} className="stroke-[3.5] shrink-0" />
                            <span>CORRECTO</span>
                          </button>
                          
                          {/* Incorrect (-) */}
                          <button
                            onClick={() => assignPoints(idx, -100)}
                            className="flex-1 py-2 px-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wide transition-all duration-200 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1 hover:shadow-sm hover:shadow-rose-500/20 border-none"
                          >
                            <X size={12} className="stroke-[3.5] shrink-0" />
                            <span>INCORRECTO</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom footer actions if scoring is disabled */}
            {!enableScoring && (
              <div className="flex justify-center shrink-0 py-4 mt-6 border-t border-black/10 dark:border-white/10 w-full max-w-4xl mx-auto select-none">
                {isRevealed && (
                  <button
                    onClick={handleNewRound}
                    className="px-8 py-3 bg-brand-primary hover:bg-brand-hover text-white text-sm font-black uppercase tracking-wider rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-brand-primary/20 flex items-center gap-2"
                  >
                    <Play size={16} />
                    <span>Nueva Partida</span>
                  </button>
                )}
              </div>
            )}
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
                ¡Resultados de la Trivia!
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-2">
                Puntuaciones finales de los equipos de clase.
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
                        ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900 text-slate-855 dark:text-zinc-100 shadow-md font-black scale-[1.01]'
                        : 'bg-slate-50/30 dark:bg-zinc-800/10 border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-455 font-bold'
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
                type="button"
                onClick={() => setPhase('config')}
                className="px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white font-black text-xs rounded-full shadow-md uppercase tracking-wider cursor-pointer"
              >
                Volver a Configurar
              </button>

              <button
                type="button"
                onClick={() => {
                  setScores(new Array(10).fill(0));
                  setSelectedCardIdx(null);
                  setIsRevealed(false);
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

      {/* Exit confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[400px] p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 mx-4 text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-550 dark:text-rose-455 flex items-center justify-center">
              <AlertCircle size={28} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 dark:text-zinc-150 tracking-tight">
                ¿Terminar partida?
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed font-bold max-w-[285px] mx-auto">
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

      {/* Reset confirmation Modal */}
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
                ¿Estás seguro de que deseas reiniciar el puntaje de todos los equipos del juego?
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
                  setScores(new Array(10).fill(0));
                  toast.success("Los puntajes han sido reiniciados.");
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all shadow-md cursor-pointer border-none"
              >
                Sí, reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generation Loading Modal (Using animation.json Lottie player) */}
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
                  Preparando Reto
                </h4>
                <p className="text-[12px] text-slate-550 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed font-bold">
                  Seleccionando las mejores preguntas y preparando la dinámica. Esto puede tomar unos segundos.
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

              <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-555 dark:text-zinc-400">
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
