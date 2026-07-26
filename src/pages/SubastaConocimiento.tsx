import React, { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { consumeCredits, hasEnoughCredits, getUserCredits, getCreditCosts } from '../lib/credits';
import ModalCreditos from '../components/ai/ModalCreditos';
import { 
  ArrowLeft, RefreshCw, Trophy, Star, AlertCircle, Smile, Zap,
  BookOpen, HelpCircle, Award, Check, X, RotateCw, Crown,
  Gavel, Users, Coins, Volume2, VolumeX, ArrowRight, Play, Sparkles,
  ChevronDown, FileText, Brain, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, getClassrooms, Classroom, getStudents, Student } from '../lib/storage';
import { generateToolContent } from '../lib/services/aiService';

// Synthesize audio using Web Audio API
const playSynthSound = (type: 'correct' | 'incorrect' | 'complete' | 'tick' | 'gavel') => {
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
    } else if (type === 'gavel') {
      // Deep wood knock sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else if (type === 'correct') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1); // G5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } else if (type === 'incorrect') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'complete') {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + index * 0.08);
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

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Team {
  id: number;
  name: string;
  coins: number;
  score: number;
}

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "¿Qué gas absorben las plantas durante la fotosíntesis?",
    options: ["Oxígeno", "Dióxido de Carbono", "Nitrógeno", "Helio"],
    correct: 1,
    explanation: "Las plantas absorben dióxido de carbono (CO2) y liberan oxígeno (O2) al ambiente."
  },
  {
    id: 2,
    question: "¿En qué año se proclamó la Independencia de la República Dominicana?",
    options: ["1821", "1844", "1863", "1965"],
    correct: 1,
    explanation: "La Independencia dominicana fue proclamada el 27 de febrero de 1844 en la Puerta del Conde."
  },
  {
    id: 3,
    question: "¿Cuál es el resultado de multiplicar 12 x 8?",
    options: ["96", "86", "106", "76"],
    correct: 0,
    explanation: "12 por 8 es exactamente igual a 96."
  },
  {
    id: 4,
    question: "¿Quién escribió la letra del Himno Nacional Dominicano?",
    options: ["Emilio Prud'Homme", "José Reyes", "Juan Pablo Duarte", "Francisco del Rosario Sánchez"],
    correct: 0,
    explanation: "Emilio Prud'Homme escribió las letras líricas, mientras que José Reyes compuso la música melódica."
  },
  {
    id: 5,
    question: "¿Cuál es el río más largo de la República Dominicana?",
    options: ["Río Ozama", "Río Yaque del Norte", "Río Higuamo", "Río Camú"],
    correct: 1,
    explanation: "El Yaque del Norte es el río más largo del país, cruzando el productivo valle del Cibao."
  },
  {
    id: 6,
    question: "¿Qué tipo de palabra es 'rápido' según su acentuación?",
    options: ["Aguda", "Grave", "Esdrújula", "Sobreesdrújula"],
    correct: 2,
    explanation: "Las palabras esdrújulas llevan el acento ortográfico en la antepenúltima sílaba y siempre se tildan."
  }
];

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
    border: 'border-purple-200 hover:border-purple-300 dark:border-purple-500/20 dark:hover:border-purple-500/40',
    bg: 'bg-gradient-to-b from-purple-50/30 via-white to-white dark:from-purple-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-purple-650 dark:text-purple-400',
    glow: 'shadow-purple-500/5 hover:shadow-purple-500/10',
    pill: 'bg-purple-100/60 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
    dot: 'bg-purple-500',
  }
];

export default function SubastaConocimiento() {
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const user = getCurrentUser();
  const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);

  // Classroom and participants configurations (following Jeopardy setup)
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [participantMode, setParticipantMode] = useState<'class' | 'custom'>('custom');
  const [numTeams, setNumTeams] = useState<number>(3);
  const [teamNames, setTeamNames] = useState<string[]>(Array.from({ length: 10 }, (_, i) => `Grupo ${i + 1}`));
  const [teamStudents, setTeamStudents] = useState<string[][]>(Array.from({ length: 10 }, () => []));
  const [difficulty, setDifficulty] = useState<string>('Medio');
  const [showSound, setShowSound] = useState<boolean>(true);

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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Game active states
  const [phase, setPhase] = useState<'welcome' | 'playing' | 'completed'>('welcome');
  const [teams, setTeams] = useState<Team[]>([]);
  const [startingCoins, setStartingCoins] = useState<number>(300);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active play states
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [biddingPhase, setBiddingPhase] = useState<'bid' | 'reveal' | 'feedback'>('bid');
  
  // Auction bidding parameters
  const [winningTeamId, setWinningTeamId] = useState<number | null>(null);
  const [currentBid, setCurrentBid] = useState<number>(10);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  // Gavel animation trigger
  const [gavelStrike, setGavelStrike] = useState<boolean>(false);

  const startNewGame = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Class Mode validations
    if (participantMode === 'class') {
      if (classrooms.length === 0) {
        alert("Primero debes crear un aula en tu panel de control.");
        return;
      }
      if (classStudents.length === 0) {
        alert("El aula seleccionada no tiene estudiantes registrados.");
        return;
      }
      if (numTeams > classStudents.length) {
        alert(`No hay suficientes alumnos (${classStudents.length}) para formar ${numTeams} grupos.`);
        return;
      }
    }

    setCurrentQuestionIndex(0);
    setWinningTeamId(null);
    setCurrentBid(10);
    setSelectedAnswer(null);
    setBiddingPhase('bid');

    // Initialize team array
    const finalTeams: Team[] = [];
    for (let i = 0; i < numTeams; i++) {
      finalTeams.push({
        id: i + 1,
        name: teamNames[i] || `Grupo ${i + 1}`,
        coins: startingCoins,
        score: 0
      });
    }
    setTeams(finalTeams);

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

    if (customTopic.trim()) {
      if (!isPremium && !hasEnoughCredits('subasta_generator')) {
        setShowLimitModal(true);
        return;
      }
      setIsGenerating(true);
      try {
        const result = await generateToolContent(
          "generador-preguntas",
          `Genera 5 preguntas de opción múltiple de nivel de dificultad "${difficulty}" sobre el tema escolar: "${customTopic}". Responde estrictamente en un formato JSON plano que contenga un campo "questions" el cual sea una lista de objetos que sigan la estructura: { "question": "texto", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "explicación de la respuesta" }.`
        );
        if (result && result.questions && result.questions.length > 0) {
          const formatted = result.questions.map((q: any, idx: number) => ({
            id: idx + 1,
            question: q.question || q.pregunta || '',
            options: q.options || q.opciones || [],
            correct: typeof q.correct === 'number' ? q.correct : typeof q.correcta === 'number' ? q.correcta : 0,
            explanation: q.explanation || q.explicacion || ''
          }));
          setQuestions(formatted);
          if (!isPremium) {
            consumeCredits('subasta_generator');
          }
        } else {
          setQuestions(DEFAULT_QUESTIONS);
        }
      } catch (err) {
        console.warn("Generating questions failed, using default fallback:", err);
        setQuestions(DEFAULT_QUESTIONS);
      } finally {
        setIsGenerating(false);
      }
    } else {
      setQuestions(DEFAULT_QUESTIONS);
    }

    setPhase('playing');
    if (showSound) playSynthSound('complete');
  };

  const handleSellAuction = (teamId: number) => {
    if (winningTeamId !== null) return;
    setGavelStrike(true);
    if (showSound) playSynthSound('gavel');
    setTimeout(() => setGavelStrike(false), 300);

    setWinningTeamId(teamId);
    setBiddingPhase('reveal');
  };

  const handleAnswerSubmit = (optionIndex: number) => {
    if (winningTeamId === null || biddingPhase !== 'reveal') return;
    
    setSelectedAnswer(optionIndex);
    const correctIdx = questions[currentQuestionIndex].correct;

    const updatedTeams = teams.map(t => {
      if (t.id === winningTeamId) {
        if (optionIndex === correctIdx) {
          if (showSound) playSynthSound('correct');
          return {
            ...t,
            score: t.score + 10,
            coins: t.coins + currentBid // Win and earn the bid
          };
        } else {
          if (showSound) playSynthSound('incorrect');
          return {
            ...t,
            coins: Math.max(0, t.coins - currentBid) // Lose the bid
          };
        }
      }
      return t;
    });

    setTeams(updatedTeams);
    setBiddingPhase('feedback');
  };

  const handleNextQuestion = () => {
    setWinningTeamId(null);
    setCurrentBid(10);
    setSelectedAnswer(null);
    setBiddingPhase('bid');

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      if (showSound) playSynthSound('complete');
      setPhase('completed');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

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

      {/* Header Controls */}
      <header className="flex items-center justify-between px-6 py-4 w-full max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs mb-6 mt-4 select-none gap-4">
        <div className="flex-1 flex justify-start">
          {phase === 'welcome' ? (
            <Link 
              to="/dinamicas" 
              className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              ← VOLVER A DINÁMICAS
            </Link>
          ) : (
            <button
              onClick={() => {
                setPhase('welcome');
                if (document.fullscreenElement) {
                  document.exitFullscreen().catch(() => {});
                }
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
          {phase === 'playing' && (
            <button
              onClick={() => startNewGame()}
              className="px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-350 font-black text-xs rounded-full border border-black/10 dark:border-white/10 shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw size={12} className="shrink-0" />
              <span>Reiniciar</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
          >
            {isFullscreen ? '⤢ SALIR PANTALLA COMPLETA' : '⤢ PANTALLA COMPLETA'}
          </button>
        </div>
      </header>

      {/* Intro Banner */}
      {!isFullscreen && phase === 'welcome' && (
        <div className="print:hidden mb-5 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/10 dark:from-amber-500/15 dark:to-yellow-600/15 border border-amber-500/15 dark:border-amber-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full max-w-4xl mx-auto select-none">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center shrink-0 border border-amber-500/30 dark:border-amber-500/40">
            <Gavel className="w-5 h-5 md:w-6 h-6 text-amber-600 dark:text-amber-500 stroke-[2.5]" />
          </div>

          <div className="text-center md:text-left flex-1 relative z-10">
            <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
              Subasta de Conocimiento
            </h1>
            <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
              Dinámica interactiva grupal. Los equipos pujan con sus monedas por la oportunidad de responder y sumar puntos. ¡Una respuesta incorrecta les costará las monedas apostadas!
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col pt-2 w-full min-w-0 pb-10 px-6 text-text-main dark:text-white transition-colors duration-200">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          
          <AnimatePresence mode="wait">
            {/* Setup Screen (Redesigned to Match Jeopardy style) */}
            {phase === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-4"
              >
                {/* Step 1 Card: Participants */}
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

                      {/* Quantity slider for class mode */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Cantidad de Equipos</label>
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
                              max={6}
                              value={numTeams}
                              onChange={e => setNumTeams(parseInt(e.target.value))}
                              className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none active:scale-[1.01] transition-transform"
                              style={{
                                background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${((numTeams - 2) / 4) * 100}%, var(--plx-slider-track-bg, #e2e8f0) ${((numTeams - 2) / 4) * 100}%, var(--plx-slider-track-bg, #e2e8f0) 100%)`,
                                WebkitAppearance: 'none'
                              }}
                            />
                          </div>

                          <div className="w-11 h-9 flex items-center justify-center text-center font-bold border border-slate-250 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 shadow-2xs select-none">
                            {numTeams}
                          </div>

                          <button
                            type="button"
                            onClick={() => setNumTeams(Math.min(6, numTeams + 1))}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition-all shadow-2xs cursor-pointer select-none border-none font-bold"
                          >
                            <span className="text-lg font-semibold leading-none">+</span>
                          </button>
                        </div>
                      </div>

                      {/* Display class distribution info */}
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

                      {/* Display error if too many teams */}
                      {classStudents.length > 0 && numTeams > classStudents.length && (
                        <div className="bg-amber-50/60 dark:bg-amber-950/15 border border-amber-200/60 dark:border-amber-800/30 rounded-2xl p-4 mt-3 animate-in fade-in duration-200 text-left select-none space-y-2">
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>Alumnos insuficientes</span>
                          </div>
                          <p className="text-xs font-bold text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                            El aula solo tiene <span className="font-black text-amber-800 dark:text-amber-200">{classStudents.length}</span> estudiantes, pero estás intentando formar <span className="font-black text-amber-800 dark:text-amber-200">{numTeams}</span> grupos.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      {/* Quantity of Teams slider */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Cantidad de Equipos</label>
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
                              max={6}
                              value={numTeams}
                              onChange={e => setNumTeams(parseInt(e.target.value))}
                              className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none active:scale-[1.01] transition-transform"
                              style={{
                                background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${((numTeams - 2) / 4) * 100}%, var(--plx-slider-track-bg, #e2e8f0) ${((numTeams - 2) / 4) * 100}%, var(--plx-slider-track-bg, #e2e8f0) 100%)`,
                                WebkitAppearance: 'none'
                              }}
                            />
                          </div>

                          <div className="w-11 h-9 flex items-center justify-center text-center font-bold border border-slate-250 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 shadow-2xs select-none">
                            {numTeams}
                          </div>

                          <button
                            type="button"
                            onClick={() => setNumTeams(Math.min(6, numTeams + 1))}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition-all shadow-2xs cursor-pointer select-none border-none font-bold"
                          >
                            <span className="text-lg font-semibold leading-none">+</span>
                          </button>
                        </div>
                      </div>

                      {/* Personalizar nombres de equipos */}
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

                {/* Step 2 Card: Dynamic Generation (Gradable difficulty & topic) */}
                <form onSubmit={startNewGame} className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs space-y-5">
                  <div className="flex items-center gap-3 select-none">
                    <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">2</span>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                      Generación de Subasta
                    </h3>
                  </div>

                  {/* Topic Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tema o Contenido de la Clase</label>
                    <input
                      type="text"
                      required
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Ej. La célula animal, Historia Dominicana, Fracciones"
                      className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold focus:outline-none focus:border-brand-primary transition-colors shadow-2xs"
                    />
                  </div>

                  {/* Difficulty Selector (Fácil, Medio, Difícil) */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400">Dificultad de las Preguntas</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {['Fácil', 'Medio', 'Difícil'].map(d => {
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
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${isSelected
                              ? 'bg-brand-primary text-white border-transparent shadow-md shadow-brand-primary/20'
                              : 'bg-slate-50 dark:bg-zinc-950 text-slate-550 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-850 border border-slate-255 dark:border-zinc-800'
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

                  {/* Starting Coins Budget Setting */}
                  <div className="space-y-3 pt-4 border-t border-black/5 dark:border-white/5">
                    <label className="text-xs font-bold text-slate-655 dark:text-slate-400 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-500" /> Presupuesto Inicial de Monedas
                    </label>
                    <div className="flex items-center gap-4">
                      {[100, 200, 300, 500].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setStartingCoins(val);
                            playSynthSound('tick');
                          }}
                          className={`flex-1 py-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            startingCoins === val
                              ? 'bg-brand-primary text-white border-transparent shadow-md shadow-brand-primary/20'
                              : 'bg-slate-50 dark:bg-zinc-950 text-slate-550 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-850 border border-slate-255 dark:border-zinc-800'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sound effects switch */}
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

                  {/* Submit button */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white text-[13px] font-black uppercase tracking-wider rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-brand-primary/20"
                    >
                      <Sparkles className="w-4.5 h-4.5" />
                      <span>Generar dinámica</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Play Screen */}
            {phase === 'playing' && currentQuestion && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4"
              >
                {/* Left Column: Teams Dashboard */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-5 shadow-2xs">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 text-center">Banca de la Subasta</h3>

                    <div className="space-y-3">
                      {teams.map((t, index) => {
                        const style = teamStyles[index % teamStyles.length];
                        const isWinner = winningTeamId === t.id;
                        return (
                          <div 
                            key={t.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 relative overflow-hidden ${
                              isWinner 
                                ? 'bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/40 scale-[1.01]' 
                                : `${style.bg} ${style.border} ${style.glow}`
                            }`}
                          >
                            {/* Accent line on left */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isWinner ? 'bg-amber-500' : style.dot}`} />

                            <div className="flex items-center justify-between pl-1">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${isWinner ? 'bg-amber-500 animate-pulse' : style.dot}`} />
                                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-zinc-200">{t.name}</h4>
                                  {isWinner && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold tracking-wider uppercase">
                                      Pujador
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                                    <Trophy size={10} className="text-amber-500" />
                                    {t.score} Pts
                                  </span>
                                </div>
                              </div>

                              <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-black text-xs ${isWinner ? 'bg-amber-500 text-white' : style.pill} transition-colors`}>
                                <Coins size={13} className={isWinner ? 'text-white' : 'text-amber-500'} />
                                <span>{t.coins}</span>
                              </div>
                            </div>

                            {/* Show group members if in class mode */}
                            {participantMode === 'class' && teamStudents[index] && teamStudents[index].length > 0 && (
                              <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold pt-2 border-t border-dashed border-slate-200/60 dark:border-zinc-800/60 flex items-center gap-1.5 pl-1">
                                <Users size={11} className="text-slate-400 shrink-0" />
                                <span className="truncate">
                                  <strong className="font-bold text-slate-400">Alumnos: </strong>
                                  {teamStudents[index].join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bid Adjustment panel */}
                  {biddingPhase === 'bid' && (
                    <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-6 shadow-md text-center space-y-5">
                      <span className="text-xs font-black text-slate-400 tracking-widest uppercase">Valor de la Puja Activa</span>
                      
                      <div className="flex items-center justify-center gap-6">
                        <button
                          onClick={() => {
                            setCurrentBid(prev => Math.max(10, prev - 10));
                            if (showSound) playSynthSound('tick');
                          }}
                          className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-full font-black text-xl flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                          <Coins className="text-amber-500" size={28} /> {currentBid}
                        </span>
                        <button
                          onClick={() => {
                            setCurrentBid(prev => prev + 10);
                            if (showSound) playSynthSound('tick');
                          }}
                          className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-full font-black text-xl flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold block">Adjudicar la pregunta al equipo ganador de la puja:</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {teams.map((t) => (
                            <button
                              key={t.id}
                              disabled={t.coins < currentBid}
                              onClick={() => handleSellAuction(t.id)}
                              className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 font-black text-xs rounded-xl transition-all border border-indigo-100/50 dark:border-indigo-950/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Vendido a {t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gavel Hammer animation box */}
                  <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-5 shadow-2xs flex flex-col items-center justify-center min-h-[160px]">
                    <motion.div
                      animate={{ rotate: gavelStrike ? -45 : 0 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="text-amber-700 dark:text-amber-600 mb-4 cursor-pointer"
                      onClick={() => {
                        setGavelStrike(true);
                        if (showSound) playSynthSound('gavel');
                        setTimeout(() => setGavelStrike(false), 300);
                      }}
                    >
                      <Gavel size={64} className="stroke-[1.5]" />
                    </motion.div>
                    <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Toca el martillo para golpear</span>
                  </div>
                </div>

                {/* Right Column: Question & Auction Area */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-8 shadow-md relative min-h-[500px] flex flex-col justify-between">
                  
                  {/* Top metadata */}
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4 w-full">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Pregunta {currentQuestionIndex + 1} de {questions.length}
                    </span>
                    <span className="text-xs font-bold text-slate-655 dark:text-zinc-350 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                      Subasta Curricular (Nivel: {difficulty})
                    </span>
                  </div>

                  {/* Big Auction question display */}
                  <div className="my-auto py-8 space-y-8 w-full text-center">
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white max-w-2xl mx-auto leading-relaxed">
                      {currentQuestion.question}
                    </h2>

                    {/* Reveal Options Phase */}
                    {biddingPhase === 'bid' ? (
                      <div className="p-10 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md mx-auto flex flex-col items-center gap-3">
                        <Gavel className="w-12 h-12 text-slate-300 dark:text-zinc-700" />
                        <h4 className="font-extrabold text-sm text-slate-655 dark:text-zinc-400">Fase de Pujas Activa</h4>
                        <p className="text-[11px] text-slate-400 font-medium">Las opciones de respuesta están ocultas. El profesor realiza la subasta del derecho a responder por monedas de oro.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                        {currentQuestion.options.map((option, idx) => {
                          const isCorrect = idx === currentQuestion.correct;
                          const isSelected = idx === selectedAnswer;

                          let btnStyle = 'border-slate-200 dark:border-zinc-800 hover:border-brand-primary bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-200';
                          
                          if (biddingPhase === 'feedback') {
                            if (isCorrect) {
                              btnStyle = 'border-green-550 bg-green-500/10 text-green-700 dark:text-green-400';
                            } else if (isSelected) {
                              btnStyle = 'border-red-550 bg-red-500/10 text-red-700 dark:text-red-400';
                            } else {
                              btnStyle = 'border-slate-200/50 dark:border-zinc-850 opacity-40 text-slate-400';
                            }
                          }

                          return (
                            <button
                              key={idx}
                              disabled={biddingPhase !== 'reveal'}
                              onClick={() => handleAnswerSubmit(idx)}
                              className={`p-5 rounded-2xl border font-bold text-sm transition-all leading-normal flex items-start gap-3 text-left ${btnStyle} ${
                                biddingPhase === 'reveal' ? 'cursor-pointer hover:-translate-y-0.5' : ''
                              }`}
                            >
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black/5 dark:bg-white/5 text-[11px] font-black shrink-0">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="flex-1">{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Bottom Navigation controls */}
                  <div className="border-t border-black/5 dark:border-white/10 pt-4 w-full flex items-center justify-between">
                    <div>
                      {winningTeamId !== null && (
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full">
                          Adjudicado a: <strong>{teams.find(t => t.id === winningTeamId)?.name}</strong> por <strong>{currentBid} monedas</strong>
                        </span>
                      )}
                    </div>

                    <div>
                      {biddingPhase === 'feedback' && (
                        <button
                          onClick={handleNextQuestion}
                          className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-black text-xs rounded-full uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-1.5"
                        >
                          <span>Siguiente Pregunta</span>
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* Completed screen */}
            {phase === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl mx-auto w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-8 md:p-10 shadow-lg text-center mt-8 space-y-6"
              >
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-955/30 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Trophy className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-855 dark:text-white uppercase tracking-tight">¡Subasta Concluida!</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Los lotes de conocimiento se han vendido en su totalidad. Aquí están los resultados:
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-3.5 py-4">
                  {[...teams].sort((a,b) => b.score - a.score).map((t, idx) => (
                    <div 
                      key={t.id}
                      className="p-4 bg-slate-50 dark:bg-slate-855 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          idx === 0 ? 'bg-amber-550 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-655'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-sm text-slate-850 dark:text-white">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-5 font-black text-xs text-slate-655">
                        <span>Puntos: <strong className="text-slate-850 dark:text-white text-sm">{t.score}</strong></span>
                        <span className="flex items-center gap-0.5 text-amber-600"><Coins size={14} /> {t.coins}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-center gap-4">
                  <button
                    onClick={() => setPhase('welcome')}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-black text-xs rounded-full uppercase tracking-wider cursor-pointer"
                  >
                    Volver a Configurar
                  </button>
                  <button
                    onClick={() => startNewGame()}
                    className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-black text-xs rounded-full uppercase tracking-wider cursor-pointer shadow-md"
                  >
                    Volver a Jugar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Jeopardy-style Custom Generation Loading Modal */}
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
                  Preparando Subasta
                </h4>
                <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed font-bold">
                  Generando las preguntas de subasta de nivel {difficulty.toLowerCase()}. Esto puede tomar unos segundos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <ModalCreditos 
        isOpen={showLimitModal} 
        onClose={() => setShowLimitModal(false)} 
        requiredCredits={getCreditCosts().subasta_generator}
        currentCredits={getUserCredits(user)}
        actionName="generar esta dinámica"
      />
    </div>
  );
}
