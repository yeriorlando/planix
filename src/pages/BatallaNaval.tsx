import React, { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { consumeCredits, hasEnoughCredits, getUserCredits, getCreditCosts } from '../lib/credits';
import ModalCreditos from '../components/ai/ModalCreditos';
import { 
  ArrowLeft, RefreshCw, Trophy, Star, AlertCircle, Smile, Zap,
  BookOpen, HelpCircle, Award, Check, X, RotateCw, Crown,
  Anchor, Users, Coins, Volume2, VolumeX, ArrowRight, Play, Sparkles,
  ChevronDown, FileText, Brain, GraduationCap, Crosshair, HelpCircle as QuestionIcon,
  Flag, Ship, Waves} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, getClassrooms, Classroom, getStudents, Student } from '../lib/storage';
import { generateToolContent } from '../lib/services/aiService';
import { toast, Toaster } from 'sonner';

export interface NavalQuestion {
  pregunta: string;
  opciones: string[];
  correct: number;
  explicacion: string;
}

interface Cell {
  row: number;
  col: number;
  hasShip: boolean;
  state: 'hidden' | 'hit' | 'miss';
}

// Audio synthesis
const playSynthSound = (type: 'correct' | 'incorrect' | 'complete' | 'sonar' | 'explosion' | 'splash') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    if (type === 'sonar') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'explosion') {
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + 0.6);
    } else if (type === 'splash') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } else if (type === 'correct') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'incorrect') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'complete') {
      [261.63, 329.63, 392.00, 523.25].forEach((f, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + index * 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.1);
        osc.stop(ctx.currentTime + index * 0.1 + 0.35);
      });
    }
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
};

// Custom premium illustrations matching mockup design
const BlueFlag = () => (
  <svg viewBox="0 0 64 64" className="w-7.5 h-7.5 shrink-0 select-none pointer-events-none">
    <defs>
      <linearGradient id="flagpoleGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="50%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="blueFlagGrad" x1="0" y1="0" x2="1" y2="0.5">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="35%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <rect x="17.5" y="10" width="3" height="48" rx="1.5" fill="url(#flagpoleGrad)" />
    <circle cx="19" cy="8" r="3.5" fill="url(#goldGrad)" />
    <path
      d="M20.5,13.5 C24,11.5 29,17 34,14 C39,11 44,15.5 48.5,13 C50,12.2 51.5,12.7 51.5,14.5 L51.5,31.5 C51.5,33.3 50,33.8 48.5,33 C44,30.5 39,35 34,32 C29,29 24,34.5 20.5,32.5 Z"
      fill="url(#blueFlagGrad)"
    />
  </svg>
);

const RedFlag = () => (
  <svg viewBox="0 0 64 64" className="w-7.5 h-7.5 shrink-0 select-none pointer-events-none">
    <defs>
      <linearGradient id="flagpoleGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="50%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="redFlagGrad" x1="0" y1="0" x2="1" y2="0.5">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="35%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
    </defs>
    <rect x="17.5" y="10" width="3" height="48" rx="1.5" fill="url(#flagpoleGrad)" />
    <circle cx="19" cy="8" r="3.5" fill="url(#goldGrad)" />
    <path
      d="M20.5,13.5 C24,11.5 29,17 34,14 C39,11 44,15.5 48.5,13 C50,12.2 51.5,12.7 51.5,14.5 L51.5,31.5 C51.5,33.3 50,33.8 48.5,33 C44,30.5 39,35 34,32 C29,29 24,34.5 20.5,32.5 Z"
      fill="url(#redFlagGrad)"
    />
  </svg>
);

const GreenFlag = () => (
  <svg viewBox="0 0 64 64" className="w-7.5 h-7.5 shrink-0 select-none pointer-events-none">
    <defs>
      <linearGradient id="flagpoleGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="50%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="greenFlagGrad" x1="0" y1="0" x2="1" y2="0.5">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="35%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <rect x="17.5" y="10" width="3" height="48" rx="1.5" fill="url(#flagpoleGrad)" />
    <circle cx="19" cy="8" r="3.5" fill="url(#goldGrad)" />
    <path
      d="M20.5,13.5 C24,11.5 29,17 34,14 C39,11 44,15.5 48.5,13 C50,12.2 51.5,12.7 51.5,14.5 L51.5,31.5 C51.5,33.3 50,33.8 48.5,33 C44,30.5 39,35 34,32 C29,29 24,34.5 20.5,32.5 Z"
      fill="url(#greenFlagGrad)"
    />
  </svg>
);

const YellowFlag = () => (
  <svg viewBox="0 0 64 64" className="w-7.5 h-7.5 shrink-0 select-none pointer-events-none">
    <defs>
      <linearGradient id="flagpoleGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="50%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="yellowFlagGrad" x1="0" y1="0" x2="1" y2="0.5">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="35%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <rect x="17.5" y="10" width="3" height="48" rx="1.5" fill="url(#flagpoleGrad)" />
    <circle cx="19" cy="8" r="3.5" fill="url(#goldGrad)" />
    <path
      d="M20.5,13.5 C24,11.5 29,17 34,14 C39,11 44,15.5 48.5,13 C50,12.2 51.5,12.7 51.5,14.5 L51.5,31.5 C51.5,33.3 50,33.8 48.5,33 C44,30.5 39,35 34,32 C29,29 24,34.5 20.5,32.5 Z"
      fill="url(#yellowFlagGrad)"
    />
  </svg>
);

const teamStyles = [
  {
    name: 'Blue',
    border: 'border-blue-500',
    bg: 'bg-blue-50/15 dark:bg-blue-955/10',
    text: 'text-blue-600 dark:text-blue-400',
    pill: 'text-blue-700 bg-blue-50/50 border-blue-100 dark:bg-blue-950 dark:border-blue-900',
    flag: <BlueFlag />
  },
  {
    name: 'Red',
    border: 'border-rose-500',
    bg: 'bg-rose-50/15 dark:bg-rose-955/10',
    text: 'text-rose-600 dark:text-rose-400',
    pill: 'text-rose-700 bg-rose-50/50 border-rose-100 dark:bg-rose-955 dark:border-rose-900',
    flag: <RedFlag />
  },
  {
    name: 'Green',
    border: 'border-emerald-500',
    bg: 'bg-emerald-50/15 dark:bg-emerald-955/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    pill: 'text-emerald-700 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950 dark:border-emerald-900',
    flag: <GreenFlag />
  },
  {
    name: 'Yellow',
    border: 'border-amber-500',
    bg: 'bg-amber-50/15 dark:bg-amber-955/10',
    text: 'text-amber-600 dark:text-amber-400',
    pill: 'text-amber-700 bg-amber-50/50 border-amber-100 dark:bg-amber-950 dark:border-amber-900',
    flag: <YellowFlag />
  }
];

const ShipIllustration = () => (
  <svg viewBox="0 0 64 64" className="w-10 h-10 text-slate-400 dark:text-zinc-500 shrink-0 select-none pointer-events-none">
    <defs>
      <linearGradient id="shipGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    <path d="M12,38 L52,38 L48,46 L16,46 Z" fill="url(#shipGrad)" />
    <rect x="20" y="28" width="14" height="10" fill="#cbd5e1" />
    <rect x="22" y="30" width="4" height="4" fill="#334155" />
    <rect x="28" y="30" width="4" height="4" fill="#334155" />
    <rect x="36" y="24" width="5" height="14" fill="#64748b" />
    <rect x="35" y="22" width="7" height="2" fill="#ef4444" />
    <line x1="45" y1="18" x2="45" y2="38" stroke="#475569" strokeWidth="1.5" />
    <polygon points="45,18 49,21 45,24" fill="#ef4444" />
  </svg>
);

const ThinnerShip = ({ className = "w-6 h-6", strokeWidth = 1.8 }: { className?: string; strokeWidth?: number }) => (
  <svg 
    viewBox="0 0 64 64" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Mast */}
    <line x1="32" y1="10" x2="32" y2="20" />
    
    {/* Cabin (top structure) with rounded corners */}
    <path d="M22 32 V23 C22 21.5, 23.5 20, 25 20 H39 C40.5 20, 42 21.5, 42 23 V32" />
    
    {/* Deck / Bow horizontal V-cut line */}
    <path d="M14 36 L32 43 L50 36" />
    
    {/* Hull side curves */}
    <path d="M14 36 C14 48, 22 55, 32 55 C42 55, 50 48, 50 36" />
    
    {/* Bow vertical dividing line */}
    <line x1="32" y1="43" x2="32" y2="55" />
    
    {/* Waves at bottom */}
    <path d="M10 55 C14 51.5, 18 51.5, 22 55 C26 58.5, 30 58.5, 34 55 C38 51.5, 42 51.5, 46 55 C50 58.5, 54 58.5, 58 55" />
  </svg>
);

export default function BatallaNaval() {
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
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('Medio');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Game states
  const [gameState, setGameState] = useState<'config' | 'playing' | 'question' | 'gameover'>('config');
  const [loading, setLoading] = useState<boolean>(false);

  // Board & Grid
  const [grid, setGrid] = useState<Cell[]>([]);
  const [targetCellIdx, setTargetCellIdx] = useState<number | null>(null);

  // Teams & Scores
  interface Team {
    name: string;
    color: string;
    score: number;
    students: string[];
  }
  const [teamMode, setTeamMode] = useState<'auto' | 'custom'>('auto');
  const [numTeams, setNumTeams] = useState<number>(3);
  const [teamNames, setTeamNames] = useState<string[]>(Array.from({ length: 4 }, (_, i) => `Grupo ${i + 1}`));
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeamIdx, setActiveTeamIdx] = useState<number>(0);
  const [remainingShips, setRemainingShips] = useState<number>(5);

  useEffect(() => {
    setTeamNames(prev => {
      const copy = [...prev];
      for (let i = 0; i < 4; i++) {
        if (!copy[i]) {
          copy[i] = `Grupo ${i + 1}`;
        }
      }
      return copy;
    });
  }, [numTeams]);

  // Questions
  const [questions, setQuestions] = useState<NavalQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Fullscreen support
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Credits info
  const [showCreditsModal, setShowCreditsModal] = useState<boolean>(false);
  const creditCost = getCreditCosts().naval_generator;

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

  const handleSound = (type: 'correct' | 'incorrect' | 'complete' | 'sonar' | 'explosion' | 'splash') => {
    if (soundEnabled) playSynthSound(type);
  };

  const initGrid = () => {
    const tempGrid: Cell[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 7; c++) {
        tempGrid.push({
          row: r,
          col: c,
          hasShip: false,
          state: 'hidden'
        });
      }
    }

    // Place 5 ships randomly
    let shipsPlaced = 0;
    while (shipsPlaced < 5) {
      const randIdx = Math.floor(Math.random() * tempGrid.length);
      if (!tempGrid[randIdx].hasShip) {
        tempGrid[randIdx].hasShip = true;
        shipsPlaced++;
      }
    }
    setGrid(tempGrid);
    setRemainingShips(5);
  };

  const handleStartGame = async () => {
    if (!topic.trim()) {
      toast.error("Por favor, introduce un tema de estudio.");
      return;
    }

    if (participantMode === 'class') {
      if (!selectedClassId) {
        toast.error("Por favor, selecciona un aula.");
        return;
      }
      if (classStudents.length < 2) {
        toast.error("Se necesitan al menos 2 alumnos para jugar.");
        return;
      }
    }

    if (!hasEnoughCredits('naval_generator')) {
      setShowCreditsModal(true);
      return;
    }

    setLoading(true);
    try {
      consumeCredits('naval_generator');
      const prompt = `Tema: ${topic}. Dificultad: ${difficulty}.`;
      const response = await generateToolContent('batalla-naval', prompt);

      if (teamMode === 'custom' && participantMode === 'class' && numTeams > classStudents.length) {
        toast.error(`No hay suficientes alumnos (${classStudents.length}) para formar ${numTeams} grupos.`);
        setLoading(false);
        return;
      }

      if (response && response.questions && response.questions.length > 0) {
        setQuestions(response.questions);
      } else {
        throw new Error("Formato de respuesta inválido");
      }

      // Setup teams
      const finalTeams: Team[] = [];
      if (teamMode === 'auto') {
        let blueSquad: string[] = [];
        let redSquad: string[] = [];
        if (participantMode === 'class') {
          const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
          shuffled.forEach((student, idx) => {
            if (idx % 2 === 0) {
              blueSquad.push(student.nombre);
            } else {
              redSquad.push(student.nombre);
            }
          });
        }
        finalTeams.push(
          { name: 'Escuadra Azul', color: 'Blue', score: 0, students: blueSquad },
          { name: 'Escuadra Roja', color: 'Red', score: 0, students: redSquad }
        );
      } else {
        // Custom Mode
        for (let i = 0; i < numTeams; i++) {
          finalTeams.push({
            name: teamNames[i] || `Grupo ${i + 1}`,
            color: ['Blue', 'Red', 'Green', 'Yellow'][i],
            score: 0,
            students: []
          });
        }
        if (participantMode === 'class') {
          const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
          shuffled.forEach((student, idx) => {
            finalTeams[idx % numTeams].students.push(student.nombre);
          });
        }
      }

      setTeams(finalTeams);
      setActiveTeamIdx(0);
      initGrid();
      setCurrentQuestionIdx(0);
      setSelectedOptionIdx(null);
      setShowExplanation(false);
      setGameState('playing');
    } catch (err) {
      console.warn("Error generando. Cargando simulación local:", err);
      const response = await generateToolContent('batalla-naval', "MOCK");
      setQuestions(response.questions);

      // Setup teams
      const finalTeams: Team[] = [];
      if (teamMode === 'auto') {
        let blueSquad: string[] = [];
        let redSquad: string[] = [];
        if (participantMode === 'class') {
          const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
          shuffled.forEach((student, idx) => {
            if (idx % 2 === 0) {
              blueSquad.push(student.nombre);
            } else {
              redSquad.push(student.nombre);
            }
          });
        }
        finalTeams.push(
          { name: 'Escuadra Azul', color: 'Blue', score: 0, students: blueSquad },
          { name: 'Escuadra Roja', color: 'Red', score: 0, students: redSquad }
        );
      } else {
        // Custom Mode
        for (let i = 0; i < numTeams; i++) {
          finalTeams.push({
            name: teamNames[i] || `Grupo ${i + 1}`,
            color: ['Blue', 'Red', 'Green', 'Yellow'][i],
            score: 0,
            students: []
          });
        }
        if (participantMode === 'class') {
          const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
          shuffled.forEach((student, idx) => {
            finalTeams[idx % numTeams].students.push(student.nombre);
          });
        }
      }

      setTeams(finalTeams);
      setActiveTeamIdx(0);
      initGrid();
      setCurrentQuestionIdx(0);
      setSelectedOptionIdx(null);
      setShowExplanation(false);
      setGameState('playing');
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (cellIdx: number) => {
    if (grid[cellIdx].state !== 'hidden') return;
    handleSound('sonar');
    setTargetCellIdx(cellIdx);
    setGameState('question');
  };

  const handleAnswerSubmit = (optionIdx: number) => {
    if (selectedOptionIdx !== null) return;
    setSelectedOptionIdx(optionIdx);

    const question = questions[currentQuestionIdx];
    const isCorrect = optionIdx === question.correct;

    if (isCorrect) {
      handleSound('correct');
    } else {
      handleSound('incorrect');
    }

    setShowExplanation(true);
  };

  const handleCloseQuestion = () => {
    if (targetCellIdx === null || selectedOptionIdx === null) return;

    const question = questions[currentQuestionIdx];
    const isCorrect = selectedOptionIdx === question.correct;
    const cell = grid[targetCellIdx];
    const updatedGrid = [...grid];

    if (isCorrect) {
      if (cell.hasShip) {
        handleSound('explosion');
        updatedGrid[targetCellIdx].state = 'hit';
        setTeams(prev => prev.map((t, idx) => {
          if (idx === activeTeamIdx) {
            return { ...t, score: t.score + 1 };
          }
          return t;
        }));
        setRemainingShips(prev => prev - 1);
      } else {
        handleSound('splash');
        updatedGrid[targetCellIdx].state = 'miss';
      }
    } else {
      handleSound('splash');
    }

    setGrid(updatedGrid);
    setSelectedOptionIdx(null);
    setShowExplanation(false);
    setTargetCellIdx(null);

    // Pass turn
    setActiveTeamIdx(prev => (prev + 1) % teams.length);

    const allRevealed = updatedGrid.filter(c => c.state !== 'hidden').length;
    const noShipsLeft = updatedGrid.filter(c => c.hasShip && c.state !== 'hit').length === 0;

    if (noShipsLeft || allRevealed >= 24 || currentQuestionIdx >= questions.length - 1) {
      handleSound('complete');
      setGameState('gameover');
    } else {
      setCurrentQuestionIdx(prev => prev + 1);
      setGameState('playing');
    }
  };

  const colNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

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
                <Coins className="w-5 h-5 text-emerald-650 animate-pulse" />
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
        <div className="print:hidden mb-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-600/10 dark:from-emerald-500/15 dark:to-teal-600/15 border border-emerald-500/15 dark:border-emerald-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full max-w-4xl mx-auto">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/30 flex items-center justify-center shrink-0 border border-emerald-500/30 dark:border-emerald-500/40 relative">
            <Anchor className="w-5 h-5 md:w-6 h-6 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          </div>

          <div className="text-center md:text-left flex-1 relative z-10">
            <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
              Batalla Naval del Saber
            </h1>
            <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
              Dos escuadras (Azul y Roja) eligen coordenadas y responden preguntas con IA para disparar torpedos y localizar barcos enemigos ocultos en el mar.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'config' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
            >
              {/* Left Config Card: Participants */}
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-3 select-none">
                  <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">1</span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    Participantes
                  </h3>
                </div>

                {/* Team Mode Select */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-100/85 dark:bg-zinc-950 rounded-2xl border border-slate-200/40 dark:border-zinc-800/80 select-none">
                  <button
                    type="button"
                    onClick={() => setTeamMode('auto')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      teamMode === 'auto'
                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    <span>Automático (2 Escuadras)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeamMode('custom')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      teamMode === 'custom'
                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    <span>Personalizado (Grupos)</span>
                  </button>
                </div>

                {/* Participant List Mode Select */}
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

                {/* Selection Details */}
                {participantMode === 'class' ? (
                  <div className="space-y-4">
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
                                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-750 hover:bg-slate-50 dark:hover:bg-zinc-800 text-left"
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
                  <div className="text-xs text-text-muted p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-black/5">
                    Modo libre activado. Los grupos se registrarán sin vincular alumnos matriculados.
                  </div>
                )}

                {/* Team mode specific details */}
                {teamMode === 'auto' ? (
                  <div className="text-xs text-text-muted p-4 bg-emerald-50/20 dark:bg-emerald-955/5 rounded-xl border border-emerald-500/20 leading-relaxed font-bold">
                    La clase se dividirá automáticamente en dos escuadras equilibradas: la <strong>Escuadra Azul</strong> y la <strong>Escuadra Roja</strong>.
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Teams Count Slider */}
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
                            max={4}
                            value={numTeams}
                            onChange={e => setNumTeams(parseInt(e.target.value))}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none active:scale-[1.01] transition-transform"
                            style={{
                              background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${((numTeams - 2) / 2) * 100}%, var(--plx-slider-track-bg, #e2e8f0) ${((numTeams - 2) / 2) * 100}%, var(--plx-slider-track-bg, #e2e8f0) 100%)`,
                              WebkitAppearance: 'none'
                            }}
                          />
                        </div>

                        <div className="w-11 h-9 flex items-center justify-center text-center font-bold border border-slate-250 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 shadow-2xs select-none">
                          {numTeams}
                        </div>

                        <button
                          type="button"
                          onClick={() => setNumTeams(Math.min(4, numTeams + 1))}
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition-all shadow-2xs cursor-pointer select-none border-none font-bold"
                        >
                          <span className="text-lg font-semibold leading-none">+</span>
                        </button>
                      </div>
                    </div>

                    {/* Team Names Inputs */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Personalizar nombres de equipos</label>
                      <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: numTeams }).map((_, i) => (
                          <div key={i} className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-455 dark:text-zinc-500 uppercase">Equipo {i + 1}</label>
                            <input
                              type="text"
                              value={teamNames[i] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTeamNames(prev => {
                                  const copy = [...prev];
                                  copy[i] = val;
                                  return copy;
                                });
                              }}
                              className="w-full h-10 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Classroom distribution */}
                    {participantMode === 'class' && classStudents.length > 0 && numTeams <= classStudents.length && (
                      <div className="bg-blue-50/40 dark:bg-blue-955/10 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl p-4 mt-3 animate-in fade-in duration-200 text-left select-none space-y-2.5">
                        <div className="flex items-center gap-2 text-brand-primary dark:text-blue-400 font-black text-xs uppercase tracking-wider">
                          <Users size={15} className="shrink-0" />
                          <span>Formación de Equipos</span>
                        </div>
                        <div className="space-y-1 text-slate-655 dark:text-zinc-300 font-bold text-xs">
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
                  </div>
                )}
              </div>

              {/* Right Config Card: Trivia Generation */}
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-3 select-none">
                  <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">2</span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    Generación de Trivia
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Tema de estudio</label>
                  <input
                    type="text"
                    placeholder="Ej. Descubrimiento de América, Geografía, Multiplicación"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Dificultad de las Preguntas</label>
                  <div className="flex gap-1.5 bg-slate-50 dark:bg-zinc-950 p-1 rounded-xl border border-black/5 dark:border-white/5">
                    {['Fácil', 'Medio', 'Difícil'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          difficulty === d 
                            ? 'bg-brand-primary text-white shadow-xs' 
                            : 'text-slate-550 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {d === 'Fácil' ? <Smile className="w-3.5 h-3.5" /> : d === 'Medio' ? <Zap className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    <span>Efectos de Sonido ({soundEnabled ? 'Sí' : 'No'})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full transition-all relative ${soundEnabled ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${soundEnabled ? 'right-0.5' : 'left-0.5'}`} strokeWidth={2} />
                  </button>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleStartGame}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white text-[13px] font-black uppercase tracking-wider rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 shadow-brand-primary/20"
                  >
                    {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Sparkles className="w-4.5 h-4.5" />}
                    {loading ? 'Generando dinámica...' : 'Generar dinámica'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`w-full grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-300 ${
                isFullscreen ? 'max-w-6xl mx-auto' : 'max-w-4xl mx-auto'
              }`}
            >
              {/* Left sidebar: Squads list and scores */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] shadow-sm overflow-hidden flex flex-col select-none">
                  {/* Header Banner */}
                  <div className="bg-[#224597] px-5 py-4 flex items-center gap-3 text-white">
                    <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center text-white shrink-0 shadow-2xs">
                      <Trophy className="w-4 h-4 text-white fill-current" />
                    </div>
                    <span className="text-sm font-black tracking-wide uppercase">Marcador de escuadras</span>
                  </div>

                  <div className="p-4 space-y-3">
                    {teams.map((t, idx) => {
                      const isActive = idx === activeTeamIdx;
                      const style = teamStyles.find(s => s.name === t.color) || teamStyles[0];
                      return (
                        <div key={idx} className={`p-2.5 rounded-xl border transition-all flex gap-3 items-center ${
                          isActive 
                            ? `${style.border} ${style.bg} shadow-sm` 
                            : 'border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50'
                        }`}>
                          <div className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                              : 'border-slate-100 bg-white dark:border-zinc-800 dark:bg-zinc-950'
                          }`}>
                            {style.flag}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="w-full flex items-center justify-between gap-2">
                              <span className={`font-extrabold text-xs ${style.text}`}>{t.name}</span>
                              <span className={`font-black text-xs ${style.text} shrink-0`}>{t.score} pts</span>
                            </div>
                            {t.students.length > 0 && (
                              <div className="flex items-center gap-1 mt-1 bg-slate-100/60 dark:bg-zinc-800/40 px-2 py-0.5 rounded-md w-fit max-w-full border border-slate-150/40 dark:border-zinc-700/30">
                                <Users className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                                <span className="text-[10px] text-slate-600 dark:text-zinc-350 truncate font-semibold leading-none">
                                  {t.students.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Remaining Ships */}
                <div className="border border-slate-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] p-4.5 shadow-2xs flex flex-col items-center justify-center relative select-none">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">Barcos restantes ocultos</span>
                  <div className="flex items-center justify-center w-full mt-1 relative">
                    <span className="text-3xl font-black text-emerald-600 pl-8">{remainingShips}</span>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-slate-455">
                      <ShipIllustration />
                    </div>
                  </div>
                </div>

                {/* Game Instructions Box */}
                <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-5 border border-slate-200/60 dark:border-zinc-800 text-left select-none space-y-4.5 shadow-sm">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-850">
                    <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-450" />
                    <span className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-widest">¿Cómo se juega?</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-955/20 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                        <Crosshair className="w-4.5 h-4.5" strokeWidth={2.2} />
                      </div>
                      <span className="text-xs font-semibold text-slate-655 dark:text-zinc-300 leading-snug">Elige una coordenada en el tablero.</span>
                    </div>

                    <div className="flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-955/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-650 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
                        <QuestionIcon className="w-4.5 h-4.5" strokeWidth={2.2} />
                      </div>
                      <span className="text-xs font-semibold text-slate-655 dark:text-zinc-350 leading-snug">Responde la pregunta que genere la IA.</span>
                    </div>

                    <div className="flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-955/20 border border-cyan-100 dark:border-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-2xs">
                        <Anchor className="w-4.5 h-4.5" strokeWidth={2.2} />
                      </div>
                      <span className="text-xs font-semibold text-slate-655 dark:text-zinc-355 leading-snug">Si aciertas, disparas un torpedo.</span>
                    </div>

                    <div className="flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0 shadow-2xs">
                        <Ship className="w-4.5 h-4.5" strokeWidth={2.2} />
                      </div>
                      <span className="text-xs font-semibold text-slate-655 dark:text-zinc-355 leading-snug">¡Encuentra todos los barcos enemigos!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Sea Grid */}
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-6.5 shadow-sm flex flex-col justify-start space-y-4 min-h-[380px] text-center">
                <div>
                  <span className="text-xs font-black uppercase text-emerald-650 tracking-wider">Fase de Disparos</span>
                  <h2 className="text-xl md:text-2xl font-bold mt-1 text-text-main dark:text-white">
                    Turno de: <span className={(() => {
                      const activeTeamObj = teams[activeTeamIdx];
                      const style = teamStyles.find(s => s.name === activeTeamObj?.color) || teamStyles[0];
                      return style.text;
                    })()}>
                      {teams[activeTeamIdx]?.name}
                    </span>
                  </h2>
                  <p className="text-xs text-text-muted mt-1">Elige una coordenada para lanzar un torpedo sonar y responder la trivia curricular.</p>
                </div>

                <div className="pt-2 pb-1 flex justify-center">
                  <div className={`grid grid-cols-8 gap-3 w-full transition-all duration-300 ${
                    isFullscreen ? 'max-w-[640px]' : 'max-w-[580px]'
                  }`}>
                    <div />
                    {colNames.map(c => (
                       <div key={c} className="flex items-center justify-center font-bold text-sm text-slate-500 dark:text-zinc-400 pb-2">{c}</div>
                    ))}

                    {Array(4).fill(0).map((_, rIdx) => (
                      <React.Fragment key={rIdx}>
                        <div className="flex items-center justify-center font-bold text-sm text-slate-500 dark:text-zinc-400 pr-2">{rIdx + 1}</div>
                        {Array(7).fill(0).map((_, cIdx) => {
                          const cellIdx = rIdx * 7 + cIdx;
                          const cell = grid[cellIdx];
                          
                          let cellStyle = 'bg-white dark:bg-zinc-900 border-[#EEF2F6] dark:border-zinc-850 hover:bg-[#F8FAFC] hover:border-blue-200 dark:hover:bg-zinc-800 text-[#475569]/40 hover:text-blue-500 hover:scale-[1.03] active:scale-[0.97] cursor-pointer';
                          
                          if (cell) {
                            if (cell.state === 'hit') {
                              cellStyle = 'bg-[#60A5FA] dark:bg-blue-600 border-[#3B82F6] dark:border-blue-500 text-white cursor-not-allowed scale-[1.02] shadow-sm';
                            } else if (cell.state === 'miss') {
                              cellStyle = 'bg-[#F1F5F9] dark:bg-zinc-950/60 border-[#E2E8F0] dark:border-zinc-850 text-slate-400 dark:text-zinc-650 cursor-not-allowed opacity-75';
                            }
                          }

                          return (
                            <button
                              key={cIdx}
                              disabled={cell?.state !== 'hidden'}
                              onClick={() => handleCellClick(cellIdx)}
                              className={`w-full aspect-square rounded-[18px] border-2 flex items-center justify-center transition-all ${cellStyle}`}
                            >
                              {cell?.state === 'hit' ? (
                                <ThinnerShip className="w-7.5 h-7.5 text-white" strokeWidth={4.8} />
                              ) : cell?.state === 'miss' ? (
                                <Waves className="w-5 h-5 stroke-[2.2]" />
                              ) : (
                                <Anchor className="w-5 h-5 stroke-[2] text-[#4F81C7]/70" />
                              )}
                            </button>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'question' && targetCellIdx !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="fixed inset-0 z-50 bg-slate-50 text-slate-800 dark:bg-gradient-to-b dark:from-[#0B0F19] dark:via-[#0F172A] dark:to-[#1E1B4B] dark:text-white flex flex-col justify-between select-none p-6 md:p-10 overflow-y-auto"
            >
              {/* Header info */}
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-6 shrink-0 gap-4">
                <button
                  onClick={() => {
                    setSelectedOptionIdx(null);
                    setShowExplanation(false);
                    setTargetCellIdx(null);
                    setGameState('playing');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover border border-transparent rounded-full text-xs font-black tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-md select-none text-white"
                >
                  <span>← Volver al Radar</span>
                </button>

                <div className="flex flex-col items-center text-center">
                  <span className="text-xs md:text-sm font-black tracking-widest text-[#10B981] dark:text-[#34D399] uppercase select-none">
                    Coordenada {colNames[grid[targetCellIdx].col]}{grid[targetCellIdx].row + 1}
                  </span>
                  <span className="text-lg md:text-xl font-extrabold tracking-wide text-blue-650 dark:text-blue-400 select-none">
                    Pregunta para: <span className={(() => {
                      const activeTeamObj = teams[activeTeamIdx];
                      const style = teamStyles.find(s => s.name === activeTeamObj?.color) || teamStyles[0];
                      return style.text;
                    })()}>
                      {teams[activeTeamIdx]?.name}
                    </span>
                  </span>
                </div>

                <div className="w-[120px] hidden md:block" />
              </div>

              {/* Question Text & Options Grid */}
              <div className="flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto w-full my-6 text-center select-none space-y-8 md:space-y-12">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 dark:text-white leading-snug drop-shadow-xs max-w-4xl tracking-tight px-4 select-none">
                  {questions[currentQuestionIdx]?.pregunta}
                </h2>

                {/* Multiple Choice Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full px-4 select-none">
                  {questions[currentQuestionIdx]?.opciones.map((opt, oIdx) => {
                    const isCorrect = oIdx === questions[currentQuestionIdx].correct;
                    const isSelected = oIdx === selectedOptionIdx;

                    let buttonClass = 'bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border-slate-200 dark:border-zinc-800 text-brand-primary dark:text-[#38BDF8] hover:scale-[1.01] active:scale-[0.99]';
                    if (selectedOptionIdx !== null) {
                      if (isCorrect) {
                        buttonClass = 'bg-emerald-600 border-emerald-500 text-white scale-[1.02] shadow-lg shadow-emerald-500/20';
                      } else if (isSelected) {
                        buttonClass = 'bg-red-600 border-red-500 text-white scale-[1.02] shadow-lg shadow-red-500/20';
                      } else {
                        buttonClass = 'bg-slate-100 dark:bg-[#1E293B]/20 border-slate-200/50 dark:border-white/5 text-slate-400 dark:text-slate-500 opacity-40';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={selectedOptionIdx !== null}
                        onClick={() => handleAnswerSubmit(oIdx)}
                        className={`p-5 md:p-7 rounded-[24px] border-2 font-black text-base md:text-xl lg:text-2xl text-left transition-all duration-200 flex items-start gap-4 ${buttonClass} ${
                          selectedOptionIdx === null ? 'cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                          selectedOptionIdx !== null && isCorrect
                            ? 'bg-white text-emerald-600'
                            : isSelected
                              ? 'bg-white text-red-600'
                              : selectedOptionIdx !== null
                                ? 'bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-slate-500'
                                : 'bg-brand-primary text-white dark:bg-[#38BDF8] dark:text-zinc-950'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="flex-1 pt-0.5">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Banner */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-4xl mx-auto p-5 md:p-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-[24px] text-left space-y-1 md:space-y-2 backdrop-blur-xs select-none shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <span className="text-[10px] md:text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Check size={14} />
                      Explicación
                    </span>
                    <p className="text-xs md:text-sm lg:text-base font-semibold text-emerald-800 dark:text-emerald-200/90 leading-relaxed">
                      {questions[currentQuestionIdx]?.explicacion}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Confirm button */}
              {selectedOptionIdx !== null ? (
                <div className="flex justify-center shrink-0 pb-4">
                  <button
                    onClick={handleCloseQuestion}
                    className="py-4 px-8 bg-brand-primary hover:bg-brand-hover text-white rounded-full text-xs font-black tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-md select-none flex items-center gap-2"
                  >
                    <span>Confirmar e Impactar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="h-[60px]" />
              )}
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-8 shadow-md space-y-6 select-none animate-in zoom-in-95 duration-200"
            >
              <div className="w-20 h-20 bg-yellow-100/80 dark:bg-yellow-950/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto border border-yellow-200/50">
                <Trophy className="w-10 h-10 fill-current" />
              </div>

              <div className="space-y-2.5">
                <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">¡Batalla Terminada!</h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold leading-normal">
                  La escuadra vencedora del radar naval es la:
                </p>
                <div className="pt-2">
                  {(() => {
                    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
                    const isTie = sortedTeams.length > 1 && sortedTeams[0].score === sortedTeams[1].score;
                    const winner = sortedTeams[0];
                    const winnerStyle = teamStyles.find(s => s.name === winner?.color) || teamStyles[0];
                    return (
                      <span className={`inline-block text-lg font-black px-5 py-2 rounded-full border shadow-2xs ${
                        isTie
                          ? 'text-slate-850 bg-slate-50 border-slate-100 dark:bg-zinc-800 dark:border-zinc-700'
                          : `${winnerStyle.text} ${winnerStyle.pill}`
                      }`}>
                        {isTie ? '¡Empate de Flotas! 🤝' : `${winner.name} 🏆`}
                      </span>
                    );
                  })()}
                </div>
                
                <div className="mt-5 flex flex-wrap justify-center gap-6 text-[11px] font-bold border-t border-slate-100 dark:border-zinc-800 pt-3 text-slate-500 select-none">
                  {teams.map((t, idx) => {
                    const style = teamStyles.find(s => s.name === t.color) || teamStyles[0];
                    return (
                      <div key={idx} className={style.text}>
                        {t.name}: <span className="font-black text-xs">{t.score} impactos</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setGameState('config')}
                className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md"
              >
                Volver a Jugar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Generation Loading Modal */}
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
                    Preparando Batalla Naval
                  </h4>
                  <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed font-bold">
                    Posicionando las flotas y generando las preguntas curriculares. Esto puede tomar unos segundos.
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
