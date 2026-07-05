import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { 
  Play, Users, Plus, Trash2, Volume2, VolumeX, 
  Sparkles, RefreshCw, Check, X, HelpCircle, GraduationCap,
  Maximize2, Minimize2, Trophy, ChevronDown, Award, ArrowLeft,
  AlertCircle, Smile, Zap, Brain, FileText, Crown, Clock, Star, Type, ChevronRight,
  Gamepad2, Keyboard, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast, Toaster } from 'sonner';
import { getCurrentUser, getClassrooms, Classroom, getStudents, Student, Usuario } from '../lib/storage';
import { consumeCredits, hasEnoughCredits, getUserCredits, getCreditCosts } from '../lib/credits';
import { generateToolContent } from '../lib/services/aiService';
import ModalCreditos from '../components/ai/ModalCreditos';

// Predefined list of 50+ educational Spanish words with common rhymes
const PREDEFINED_WORDS = [
  "amor", "luna", "sol", "cancion", "gato", "flor", "cielo", "estrella", 
  "viento", "mar", "amigo", "espejo", "risa", "fuego", "tierra", "abrigo",
  "camino", "sueno", "brillo", "arena", "vuelo", "pelo", "corazon", "cantar",
  "juego", "escuela", "maestro", "libro", "clase", "jardin", "fruta", "melon",
  "limon", "pato", "plato", "zapato", "botella", "cuchara", "ventana", "puerta",
  "pintura", "dibujo", "sonido", "silencio", "camion", "avion", "cajon", "raton",
  "tesoro", "pintor", "tambor", "pastor", "calor", "color", "doctor"
];

// Spanish Vowels list
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú', 'ü'];

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["Z", "X", "C", "V", "B", "N", "M"],
  ["Á", "É", "Í", "Ó", "Ú", "Ü"]
];

// Clean word helper
function cleanWord(w: string): string {
  let cleaned = w
    .toLowerCase()
    .trim()
    .normalize("NFC")
    .replace(/[^a-zñáéíóúü]/g, "");

  // Rule 12: final 'y' sounds like 'i'
  if (cleaned.endsWith('y')) {
    cleaned = cleaned.substring(0, cleaned.length - 1) + 'i';
  }

  // Normalize digraphs where 'u' is silent before e/i
  cleaned = cleaned.replace(/qu([eiéí])/g, "k$1");
  cleaned = cleaned.replace(/gu([eiéí])/g, "g$1");

  return cleaned;
}

// Find index of the stressed vowel (vocal tónica) in a clean Spanish word
function getStressedVowelIndex(word: string): number {
  if (!word) return -1;
  
  // Rule 1: Look for explicit accent mark (tilde)
  const tildes = ['á', 'é', 'í', 'ó', 'ú', 'ý'];
  for (let i = 0; i < word.length; i++) {
    if (tildes.includes(word[i])) {
      return i;
    }
  }

  // Identify all vowel positions
  const vowelIndices: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (VOWELS.includes(word[i])) {
      vowelIndices.push(i);
    }
  }

  if (vowelIndices.length === 0) return -1;
  if (vowelIndices.length === 1) return vowelIndices[0];

  const lastChar = word[word.length - 1];
  
  // Rule 2: If word ends in a vowel, 'n', or 's', stress is on second-to-last syllable
  if (VOWELS.includes(lastChar) || lastChar === 'n' || lastChar === 's') {
    return vowelIndices[vowelIndices.length - 2];
  } else {
    // Rule 3: If it ends in any other consonant, stress is on the last syllable
    return vowelIndices[vowelIndices.length - 1];
  }
}

function isValidSpanishWordForm(word: string): boolean {
  const w = cleanWord(word);
  if (w.length < 2) return false;

  // Must contain at least one vowel
  const hasVowel = /[aeiouáéíóúü]/i.test(w);
  if (!hasVowel) return false;

  // Cannot have 4 consonants in a row (e.g. sdfg)
  if (/[bcdfghjklmnñpqrstvwxyz]{4,}/i.test(w)) {
    if (!/[nl]str/i.test(w)) {
      return false;
    }
  }

  // Basic keyboard mashing detection (consonant pairs that never occur in Spanish)
  const invalidPairs = [
    'qc', 'qd', 'qf', 'qg', 'qh', 'qj', 'qk', 'ql', 'qm', 'qn', 'qp', 'qq', 'qr', 'qs', 'qt', 'qv', 'qw', 'qx', 'qy', 'qz',
    'vj', 'vk', 'vp', 'vq', 'vx',
    'fp', 'fq', 'fv', 'fx',
    'jx', 'jc', 'jf', 'jg', 'jh', 'jk', 'jl', 'jm', 'jn', 'jp', 'jq', 'js', 'jv', 'jw', 'jy', 'jz'
  ];
  for (const pair of invalidPairs) {
    if (w.includes(pair)) return false;
  }

  return true;
}

// Check if two words rhyme. Returns 'consonante', 'asonante', or 'none'
function checkSpanishRhyme(word1: string, word2: string): 'consonante' | 'asonante' | 'none' {
  const w1 = cleanWord(word1);
  const w2 = cleanWord(word2);
  
  if (!w1 || !w2 || w1 === w2) return 'none';

  const idx1 = getStressedVowelIndex(w1);
  const idx2 = getStressedVowelIndex(w2);

  if (idx1 === -1 || idx2 === -1) return 'none';

  // Suffix starting from the stressed vowel
  const suf1 = w1.substring(idx1);
  const suf2 = w2.substring(idx2);

  // Helper to remove tildes and make lowercase comparisons
  const stripAccents = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ü/g, "u");
  };

  // Helper to map sounds for consonante rhyme
  const phoneticMap = (str: string) => {
    return stripAccents(str)
      .replace(/h/g, "")           // Silent h
      .replace(/v/g, "b")          // b/v sound equivalence
      .replace(/z/g, "s")          // s/z/c (before e,i) equivalence in Latin America
      .replace(/c([ei])/g, "s$1")
      .replace(/c/g, "k")          // Hard c
      .replace(/g([ei])/g, "j$1")  // g/j equivalence
      .replace(/ll/g, "y")         // ll/y equivalence
      .replace(/q/g, "k");
  };

  // Extract vowels from a suffix (for asonante rhyme)
  const extractVowels = (str: string) => {
    const stripped = stripAccents(str);
    let vowelsOnly = "";
    for (let char of stripped) {
      if (['a', 'e', 'i', 'o', 'u'].includes(char)) {
        vowelsOnly += char;
      }
    }
    return vowelsOnly;
  };

  // 1. Consonante Rhyme Check
  if (phoneticMap(suf1) === phoneticMap(suf2)) {
    return 'consonante';
  }

  // 2. Asonante Rhyme Check
  const v1 = extractVowels(suf1);
  const v2 = extractVowels(suf2);

  if (v1.length > 0 && v1 === v2) {
    return 'asonante';
  }

  return 'none';
}

const teamStyles = [
  {
    border: 'border-blue-200 hover:border-blue-300 dark:border-blue-500/20 dark:hover:border-blue-500/40',
    bg: 'bg-gradient-to-b from-blue-50/30 via-white to-white dark:from-blue-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-blue-600 dark:text-blue-400',
    bgBadge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    accentColor: '#3b82f6'
  },
  {
    border: 'border-pink-200 hover:border-pink-300 dark:border-pink-500/20 dark:hover:border-pink-500/40',
    bg: 'bg-gradient-to-b from-pink-50/30 via-white to-white dark:from-pink-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-pink-600 dark:text-pink-400',
    bgBadge: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    accentColor: '#ec4899'
  },
  {
    border: 'border-amber-200 hover:border-amber-300 dark:border-amber-500/20 dark:hover:border-amber-500/40',
    bg: 'bg-gradient-to-b from-amber-50/30 via-white to-white dark:from-amber-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-amber-600 dark:text-amber-400',
    bgBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    accentColor: '#f59e0b'
  },
  {
    border: 'border-emerald-200 hover:border-emerald-300 dark:border-emerald-500/20 dark:hover:border-emerald-500/40',
    bg: 'bg-gradient-to-b from-emerald-50/30 via-white to-white dark:from-emerald-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-emerald-600 dark:text-emerald-400',
    bgBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    accentColor: '#10b981'
  },
  {
    border: 'border-purple-200 hover:border-purple-300 dark:border-purple-500/20 dark:hover:border-purple-500/40',
    bg: 'bg-gradient-to-b from-purple-50/30 via-white to-white dark:from-purple-500/5 dark:via-zinc-900 dark:to-zinc-900',
    text: 'text-purple-600 dark:text-purple-400',
    bgBadge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    accentColor: '#a855f7'
  }
];

interface WordRhymed {
  targetWord: string;
  userWord: string;
  type: 'consonante' | 'asonante';
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

export default function RimandoAndo() {
  const navigate = useNavigate();
  const [user, setUser] = useState<Usuario | null>(null);
  const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Configurations
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [participantMode, setParticipantMode] = useState<'class' | 'custom'>('class');
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [numTeams, setNumTeams] = useState<number>(3);
  const [teamNames, setTeamNames] = useState<string[]>(Array.from({ length: 10 }, (_, i) => `Grupo ${i + 1}`));
  const [teamStudents, setTeamStudents] = useState<string[][]>(Array.from({ length: 10 }, () => []));

  const [roundTime, setRoundTime] = useState<number>(60); // In seconds
  const [wordMode, setWordMode] = useState<'topic' | 'custom'>('topic');
  const [customWordsList, setCustomWordsList] = useState<string[]>(['', '', '']);
  const [customMode, setCustomMode] = useState<'manual' | 'extract'>('manual');
  const [customText, setCustomText] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('Medio');
  const [rhymeMode, setRhymeMode] = useState<'both' | 'consonante'>('both');

  // Game Phases
  const [phase, setPhase] = useState<'config' | 'game' | 'results'>('config');
  const [currentTeamIndex, setCurrentTeamIndex] = useState<number>(0);
  const [wordsByTeam, setWordsByTeam] = useState<Record<number, WordRhymed[]>>({});
  
  // Word pools generated/configured for each team
  const [wordPoolsByTeam, setWordPoolsByTeam] = useState<Record<number, string[]>>({});
  const [currentWordIndexInPool, setCurrentWordIndexInPool] = useState<number>(0);
  
  // Active Turn States
  const [timerLeft, setTimerLeft] = useState<number>(60);
  const [isActiveTurn, setIsActiveTurn] = useState<boolean>(false);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const [sparkleTrigger, setSparkleTrigger] = useState<number>(0);

  // Settings
  const [showSound, setShowSound] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    if (getCurrentUser()) {
      const list = getClassrooms(getCurrentUser()!.id);
      setClassrooms(list);
      if (list.length > 0) {
        setSelectedClassId(list[0].id);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      setClassStudents(getStudents(selectedClassId));
    } else {
      setClassStudents([]);
    }
  }, [selectedClassId]);

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

  // Sounds
  const playSoundTick = () => {
    if (!showSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      console.warn(e);
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
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.24); // C6
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn(e);
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
      osc.frequency.setValueAtTime(180, audioCtx.currentTime); 
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn(e);
    }
  };

  const playSoundEnd = () => {
    if (!showSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn(e);
    }
  };

  // AI Content Generator
  const generateAITargetWords = async (subject: string, count: number, isTextExtraction = false): Promise<string[]> => {
    try {
      const rhymeInstructions = rhymeMode === 'consonante'
        ? "Es sumamente importante que todas las palabras generadas sean idóneas para formar rimas consonantes (perfectas) fáciles en español (por ejemplo, sustantivos o verbos comunes con terminaciones predecibles y claras)."
        : "Las palabras deben ser idóneas para formar rimas consonantes o asonantes fáciles en español.";
        
      const systemPrompt = isTextExtraction
        ? `Extrae un listado de exactamente ${count} palabras de origen sustantivas o verbos comunes en español, de nivel o dificultad ${difficulty}, a partir del texto provisto por el usuario. Todas las palabras del listado deben ser completamente únicas y no repetirse. ${rhymeInstructions} Devuelve estrictamente un objeto JSON con la estructura: {"words": ["palabra1", "palabra2"]}`
        : `Genera un listado de exactamente ${count} palabras de origen sustantivas o verbos comunes en español, de nivel o dificultad ${difficulty}, relacionadas con el tema educativo provisto. Todas las palabras del listado deben ser completamente únicas y no repetirse. ${rhymeInstructions} Devuelve estrictamente un objeto JSON con la estructura: {"words": ["palabra1", "palabra2"]}`;

      const response = await generateToolContent("sopa-de-letras", subject, systemPrompt);
      if (response && Array.isArray(response.words) && response.words.length > 0) {
        return response.words.map((w: string) => w.toLowerCase().trim());
      }
    } catch (e) {
      console.warn("AI generation failed, using fallback.", e);
    }
    // Fallback
    return [...PREDEFINED_WORDS].sort(() => Math.random() - 0.5);
  };

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (wordMode === 'topic' && !topic.trim()) {
      toast.error("Por favor, escribe un tema curricular.");
      return;
    }

    if (wordMode === 'custom') {
      if (customMode === 'extract' && !customText.trim()) {
        toast.error("Por favor, ingresa el texto de origen para extraer las palabras.");
        return;
      }
      if (customMode === 'manual') {
        const validCustomWords = customWordsList.filter(w => w.trim().length >= 2);
        if (validCustomWords.length === 0) {
          toast.error("Por favor, introduce al menos una palabra de inicio válida.");
          return;
        }
      }
    }

    setIsGenerating(true);

    try {
      const pools: Record<number, string[]> = {};
      let generatedList: string[] = [];
      const wordsPerTeam = Math.min(45, Math.max(15, Math.round(roundTime / 5)));
      const totalWordsNeeded = wordsPerTeam * numTeams;

      if (wordMode === 'topic' || (wordMode === 'custom' && customMode === 'extract')) {
        // Validation credits
        if (!isPremium && !hasEnoughCredits('rimando_ando')) {
          setShowLimitModal(true);
          setIsGenerating(false);
          return;
        }

        if (wordMode === 'topic') {
          generatedList = await generateAITargetWords(topic.trim(), totalWordsNeeded);
        } else {
          generatedList = await generateAITargetWords(customText.trim(), totalWordsNeeded, true);
        }

        if (!isPremium) {
          consumeCredits('rimando_ando');
        }
      } else {
        // wordMode === 'custom' && customMode === 'manual'
        generatedList = customWordsList.filter(w => w.trim().length >= 2).map(w => w.trim().toLowerCase());
      }

      // Distribute words to each team pool ensuring no overlap
      let availableWords = [...generatedList];
      // Remove duplicates
      availableWords = Array.from(new Set(availableWords));

      for (let i = 0; i < numTeams; i++) {
        pools[i] = [];
        while (pools[i].length < wordsPerTeam) {
          if (availableWords.length > 0) {
            const w = availableWords.shift()!;
            // Ensure no overlap with previous pools
            let alreadyUsed = false;
            for (let prevIdx = 0; prevIdx < i; prevIdx++) {
              if (pools[prevIdx].includes(w)) {
                alreadyUsed = true;
                break;
              }
            }
            if (!alreadyUsed) {
              pools[i].push(w);
            }
          } else {
            // Fill with PREDEFINED_WORDS that aren't already used in any pool
            const fallbackList = [...PREDEFINED_WORDS].sort(() => Math.random() - 0.5);
            let foundWord = false;
            for (const fw of fallbackList) {
              let alreadyUsed = false;
              for (let prevIdx = 0; prevIdx <= i; prevIdx++) {
                if (pools[prevIdx].includes(fw)) {
                  alreadyUsed = true;
                  break;
                }
              }
              if (!alreadyUsed) {
                pools[i].push(fw);
                foundWord = true;
                break;
              }
            }
            if (!foundWord) {
              // If we ran out of unique fallback words, just add anything to avoid infinite loop
              pools[i].push(fallbackList[Math.floor(Math.random() * fallbackList.length)]);
            }
          }
        }
      }

      setWordPoolsByTeam(pools);

      // Handle student distribution
      if (participantMode === 'class') {
        const shuffledStudents = [...classStudents].sort(() => Math.random() - 0.5);
        const buckets: string[][] = Array.from({ length: numTeams }, () => []);
        shuffledStudents.forEach((student, idx) => {
          buckets[idx % numTeams].push(student.nombre);
        });
        setTeamStudents(buckets);
      } else {
        setTeamStudents(Array.from({ length: numTeams }, () => []));
      }

      // Initialize results
      const emptyWords: Record<number, WordRhymed[]> = {};
      for (let i = 0; i < numTeams; i++) {
        emptyWords[i] = [];
      }
      setWordsByTeam(emptyWords);

      setCurrentTeamIndex(0);
      setCurrentWordIndexInPool(0);
      setTimerLeft(roundTime);
      setIsActiveTurn(false);
      setPhase('game');
      playSoundSuccess();
      toast.success("¡Juego listo para comenzar!");

    } catch (err: any) {
      console.error(err);
      toast.error("Ocurrió un error al preparar el juego.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartTimer = () => {
    setIsActiveTurn(true);
    setTimerLeft(roundTime);
    setCurrentWordIndexInPool(0);
    playSoundSuccess();

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    timerIntervalRef.current = setInterval(() => {
      setTimerLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleTimeOver();
          return 0;
        }
        if (prev <= 6) {
          playSoundTick();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOver = () => {
    playSoundEnd();
    setIsActiveTurn(false);
    toast.info(`¡Tiempo terminado para el ${teamNames[currentTeamIndex]}!`);

    setTimeout(() => {
      if (currentTeamIndex < numTeams - 1) {
        setCurrentTeamIndex(currentTeamIndex + 1);
        setTimerLeft(roundTime);
      } else {
        handleEndGame();
      }
    }, 2500);
  };

  const triggerSparkles = () => {
    setSparkleTrigger(prev => prev + 1);
    
    // Spawn custom sparkles around the screen
    const newSparkles: SparkleParticle[] = Array.from({ length: 20 }).map((_, i) => ({
      id: Math.random() + i,
      x: 30 + Math.random() * 40, 
      y: 40 + Math.random() * 30, 
      size: 10 + Math.random() * 25,
      color: ['#FFE066', '#F59E0B', '#FBBF24', '#FCD34D', '#ec4899', '#a855f7'][Math.floor(Math.random() * 6)],
      delay: Math.random() * 0.4
    }));
    setSparkles(newSparkles);

    // Fire canvas-confetti stars
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#FBBF24', '#F59E0B', '#ec4899', '#a855f7', '#ffffff'],
      shapes: ['star']
    });
  };

  const handleSkipWord = () => {
    if (!isActiveTurn) return;
    playSoundTick();
    const currentPool = wordPoolsByTeam[currentTeamIndex] || [];
    
    if (currentWordIndexInPool < currentPool.length - 1) {
      setCurrentWordIndexInPool(prev => prev + 1);
      setCurrentInput('');
      toast.info("Palabra saltada.");
    } else {
      // If we reached the end of the pool, end the turn early or wrap around
      toast.warning("Has recorrido todas las palabras. ¡Turno terminado!");
      handleTimeOver();
    }
  };

  const handleVirtualKey = (char: string) => {
    playSoundTick();
    if (char === 'BACKSPACE') {
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (char === 'SPACE') {
      setCurrentInput(prev => prev + ' ');
    } else {
      setCurrentInput(prev => prev + char.toLowerCase());
    }
  };

  const handleSubmitWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActiveTurn) return;

    const inputCleaned = currentInput.trim().toLowerCase();
    if (!inputCleaned) return;

    if (inputCleaned.length < 2) {
      playSoundFailure();
      toast.error("La palabra es demasiado corta.");
      return;
    }

    const currentPool = wordPoolsByTeam[currentTeamIndex] || [];
    const activeWord = currentPool[currentWordIndexInPool];

    if (!activeWord) {
      handleTimeOver();
      return;
    }

    if (inputCleaned === cleanWord(activeWord)) {
      playSoundFailure();
      toast.error("No puedes escribir la misma palabra.");
      return;
    }

    // Validate that it is a valid Spanish word shape
    if (!isValidSpanishWordForm(inputCleaned)) {
      playSoundFailure();
      toast.error("Por favor, escribe una palabra válida en español.");
      return;
    }

    // Validate that the input is not a substring or suffix of the target word
    const w1 = cleanWord(activeWord);
    const w2 = cleanWord(inputCleaned);
    if (w1.endsWith(w2) || w2.endsWith(w1) || w1.includes(w2) || w2.includes(w1)) {
      playSoundFailure();
      toast.error("No puedes usar la misma palabra o partes/sufijos de ella.");
      return;
    }

    // Verify Rhyme
    const rhymeType = checkSpanishRhyme(activeWord, inputCleaned);

    if (rhymeType === 'none') {
      playSoundFailure();
      toast.error(`"${currentInput}" no rima con "${activeWord}".`);
      return;
    }

    if (rhymeMode === 'consonante' && rhymeType === 'asonante') {
      playSoundFailure();
      toast.error(`"${currentInput}" es una rima asonante, pero se requiere Rima Consonante.`);
      return;
    }

    // Success!
    playSoundSuccess();
    triggerSparkles();

    // Log the word
    setWordsByTeam((prev) => ({
      ...prev,
      [currentTeamIndex]: [
        ...(prev[currentTeamIndex] || []),
        { targetWord: activeWord, userWord: inputCleaned, type: rhymeType }
      ]
    }));

    setCurrentInput('');

    // Immediately load next word
    if (currentWordIndexInPool < currentPool.length - 1) {
      setCurrentWordIndexInPool(prev => prev + 1);
    } else {
      // Wrap around or generate more words from the PREDEFINED_WORDS backup
      const backupWords = [...PREDEFINED_WORDS].sort(() => Math.random() - 0.5);
      setWordPoolsByTeam(prev => ({
        ...prev,
        [currentTeamIndex]: [...prev[currentTeamIndex], ...backupWords]
      }));
      setCurrentWordIndexInPool(prev => prev + 1);
    }
  };

  const handleEndGame = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsActiveTurn(false);
    setPhase('results');
    playSoundSuccess();

    // Trigger fireworks show using canvas-confetti
    const duration = 6 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Fire bursts from random locations on left and right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleResetGame = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsActiveTurn(false);
    setPhase('config');
  };

  const getWinnerInfo = () => {
    let maxWordsCount = -1;
    let winners: number[] = [];

    for (let i = 0; i < numTeams; i++) {
      const count = wordsByTeam[i]?.length || 0;
      if (count > maxWordsCount) {
        maxWordsCount = count;
        winners = [i];
      } else if (count === maxWordsCount) {
        winners.push(i);
      }
    }

    return { winners, maxCount: maxWordsCount };
  };

  const getSortedTeams = () => {
    return Array.from({ length: numTeams })
      .map((_, idx) => ({
        index: idx,
        name: teamNames[idx],
        score: wordsByTeam[idx]?.length || 0,
        words: wordsByTeam[idx] || []
      }))
      .sort((a, b) => b.score - a.score);
  };

  const sortedTeams = getSortedTeams();
  const { winners, maxCount } = getWinnerInfo();
  const currentPool = wordPoolsByTeam[currentTeamIndex] || [];
  const activeWord = currentPool[currentWordIndexInPool] || '';

  return (
    <div ref={containerRef} className="w-full plx-fullscreen-bg flex flex-col items-stretch">
      <style>{`
        .plx-fullscreen-bg:fullscreen {
          background-color: #f8fafc !important;
          padding: 2rem !important;
          overflow-y: auto;
          width: 100vw;
          height: 100vh;
        }
        .dark .plx-fullscreen-bg:fullscreen {
          background-color: #0b0b0e !important;
        }
        @keyframes sparkle-animation {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        .sparkle-particle {
          position: absolute;
          pointer-events: none;
          animation: sparkle-animation 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
      `}</style>

      <main className={`flex-1 flex flex-col pt-6 w-full min-w-0 pb-10 px-6 ${
        isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
      } text-left`}>
        
        <Toaster position="top-center" richColors />
        <ModalCreditos 
          isOpen={showLimitModal} 
          onClose={() => setShowLimitModal(false)} 
          requiredCredits={getCreditCosts().rimando_ando}
          currentCredits={getUserCredits(user)}
          actionName="generar esta dinámica"
        />

        {/* Header Controls */}
        <header className="flex items-center justify-between px-6 py-4 w-full max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs mb-6 mt-4 select-none gap-4">
          <div className="flex-1 flex justify-start">
            {phase === 'config' ? (
              <Link 
                to="/dinamicas" 
                className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/95 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                ← VOLVER A DINÁMICAS
              </Link>
            ) : (
              <button
                onClick={() => setShowExitConfirm(true)}
                className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/95 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                ← ABANDONAR JUEGO
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
              <button
                onClick={() => setShowExitConfirm(true)}
                className="px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-755 text-slate-700 dark:text-zinc-350 font-black text-xs rounded-full border border-black/10 dark:border-white/10 shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <RefreshCw size={12} className="shrink-0" />
                <span>Reiniciar</span>
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/95 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              {isFullscreen ? '⤢ SALIR PANTALLA COMPLETA' : '⤢ PANTALLA COMPLETA'}
            </button>
          </div>
        </header>

        {/* Título Principal */}
        <div className="print:hidden mb-5 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-purple-600/10 dark:from-purple-500/15 dark:to-pink-600/15 border border-purple-500/15 dark:border-purple-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full max-w-4xl mx-auto">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/20 dark:bg-purple-500/30 flex items-center justify-center shrink-0 border border-purple-500/30 dark:border-purple-500/40 relative">
                <Sparkles className="w-5 h-5 md:w-6 h-6 text-purple-600 dark:text-purple-400 stroke-[2.5]" />
            </div>

            <div className="text-center md:text-left flex-1 relative z-10">
                <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                    Rimando Ando
                </h1>
                <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
                    Divide tu clase en grupos. Se presentará una palabra y deberán escribir una que rime para pasar a la siguiente palabra. ¡Logra la mayor cantidad de rimas!
                </p>
            </div>
        </div>

        {/* PHASE 1: CONFIGURATION */}
        {phase === 'config' && (
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-in fade-in duration-200">
            
            {/* Setup Left: Group settings */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 select-none">
                <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">1</span>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  Participantes
                </h3>
              </div>

              {/* Class mode vs Custom mode (Tabs styled exactly like Jeopardy) */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-zinc-955 rounded-2xl border border-slate-200/40 dark:border-zinc-800/80 mb-5 select-none">
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

              {participantMode === 'class' ? (
                <div className="space-y-5 animate-in fade-in duration-200">
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

                  {/* Range Slider styled exactly like Jeopardy */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-655 dark:text-slate-400 block">Cantidad de Equipos</label>
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
                  {/* Number of Teams */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-655 dark:text-slate-400 block">Cantidad de Equipos</label>
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

                  {/* Dynamic Name Inputs styled exactly like Jeopardy */}
                  <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Personalizar nombres de equipos</label>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                      {Array.from({ length: numTeams }).map((_, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400">Equipo {idx + 1}</span>
                          <input
                            type="text"
                            value={teamNames[idx] || ''}
                            onChange={(e) => {
                              const updated = [...teamNames];
                              updated[idx] = e.target.value;
                              setTeamNames(updated);
                            }}
                            placeholder={`Grupo ${idx + 1}`}
                            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs font-bold focus:outline-none focus:border-brand-primary transition-colors text-slate-800 dark:text-zinc-150"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Setup Right: Game configurations (Generación de Rimas) */}
            <form onSubmit={handleStartGame} className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-3 select-none">
                <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">2</span>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  Generación de Rimas
                </h3>
              </div>

              {/* Word Mode selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Palabras de Origen</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100/80 dark:bg-zinc-955 p-1.5 rounded-xl border border-slate-250/20 dark:border-zinc-800/80 select-none">
                  <button
                    type="button"
                    onClick={() => setWordMode('topic')}
                    className={`py-2 rounded-lg text-xs font-black cursor-pointer transition-all flex items-center justify-center gap-1.5 ${wordMode === 'topic' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'}`}
                  >
                    <BookOpen size={14} className="shrink-0" />
                    <span>Tema</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWordMode('custom')}
                    className={`py-2 rounded-lg text-xs font-black cursor-pointer transition-all flex items-center justify-center gap-1.5 ${wordMode === 'custom' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'}`}
                  >
                    <FileText size={14} className="shrink-0" />
                    <span>Lista personalizada</span>
                  </button>
                </div>
              </div>

              {wordMode === 'topic' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Topic Input */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tema o Contenido de la Clase</label>
                    <input
                      type="text"
                      required={wordMode === 'topic'}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Ej: Animales mamíferos, Frutas, El cuerpo, Navidad..."
                      className="w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-855 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-primary transition-colors shadow-2xs text-slate-800 dark:text-zinc-150"
                    />
                  </div>

                  {/* Difficulty exactly styled as Jeopardy */}
                  <div className="space-y-3 text-left">
                    <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Dificultad de las Palabras</label>
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
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${isSelected
                              ? 'bg-brand-primary text-white border-transparent shadow-md shadow-brand-primary/20'
                              : 'bg-slate-50 dark:bg-zinc-955 text-slate-555 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-850 border border-slate-250 dark:border-zinc-800'
                            }`}
                          >
                            {icon}
                            <span>{d}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 leading-tight">
                      {difficulty === 'Fácil' && '• Las palabras generadas serán sustantivos simples e infantiles de rima muy directa.'}
                      {difficulty === 'Medio' && '• Las palabras tendrán un vocabulario curricular estándar para primaria y secundaria.'}
                      {difficulty === 'Difícil' && '• Se utilizarán palabras más complejas con desafíos fonéticos y métricos mayores.'}
                    </p>
                  </div>
                </div>
              )}

              {wordMode === 'custom' && (
                <div className="space-y-4 animate-in fade-in duration-150 text-left">
                  {/* Selector para método de ingreso */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-100/80 dark:bg-zinc-950 p-1.5 rounded-xl border border-slate-255/20 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setCustomMode('manual')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-black cursor-pointer transition-all ${customMode === 'manual' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'}`}
                    >
                      <Type size={13} />
                      <span>Lista Manual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomMode('extract')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-black cursor-pointer transition-all ${customMode === 'extract' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'}`}
                    >
                      <FileText size={13} />
                      <span>Extraer de texto (IA)</span>
                    </button>
                  </div>

                  {customMode === 'manual' ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Lista de Palabras de Inicio</label>
                        <button
                          type="button"
                          onClick={() => setCustomWordsList([...customWordsList, ''])}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black tracking-wider uppercase active:scale-95 transition-all flex items-center gap-1 cursor-pointer select-none"
                        >
                          <Plus size={10} />
                          <span>Añadir Palabra</span>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
                        {customWordsList.map((word, idx) => (
                          <div key={idx} className="flex items-center gap-2 animate-in fade-in duration-100">
                            <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-xs shrink-0 select-none shadow-xs">
                              {idx + 1}
                            </div>
                            <input
                              type="text"
                              value={word}
                              onChange={(e) => {
                                const newList = [...customWordsList];
                                newList[idx] = e.target.value;
                                setCustomWordsList(newList);
                              }}
                              placeholder={`Palabra ${idx + 1}`}
                              className="flex-1 h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200 outline-none focus:border-brand-primary"
                            />
                            {customWordsList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setCustomWordsList(customWordsList.filter((_, i) => i !== idx))}
                                className="h-8 w-8 bg-rose-500 hover:bg-rose-600 text-white rounded-lg active:scale-95 transition-all cursor-pointer border-none shrink-0 flex items-center justify-center"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Texto o Lectura de Origen</label>
                      <textarea
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Pega aquí un cuento, poema o párrafo de tu clase. La IA extraerá automáticamente las palabras clave de origen para que los grupos puedan rimar..."
                        className="w-full h-32 bg-slate-50 dark:bg-zinc-955 border border-slate-250 dark:border-zinc-800 rounded-2xl p-3.5 text-xs font-bold focus:outline-none focus:border-brand-primary transition-colors text-slate-855 dark:text-zinc-150 resize-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Rhyme Mode (Consonante vs Asonante) */}
              <div className="space-y-3 pt-3 border-t border-black/5 dark:border-white/5 select-none text-left">
                <label className="text-xs font-bold text-slate-655 dark:text-slate-400 block">Tipo de Rima Permitida</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRhymeMode('both')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${rhymeMode === 'both'
                      ? 'bg-brand-primary text-white border-transparent shadow-md shadow-brand-primary/20'
                      : 'bg-slate-50 dark:bg-zinc-955 text-slate-550 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-855 border border-slate-250 dark:border-zinc-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Consonante y Asonante</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRhymeMode('consonante')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${rhymeMode === 'consonante'
                      ? 'bg-brand-primary text-white border-transparent shadow-md shadow-brand-primary/20'
                      : 'bg-slate-50 dark:bg-zinc-955 text-slate-550 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-855 border border-slate-250 dark:border-zinc-800'
                    }`}
                  >
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>Solo Consonante (Estricto)</span>
                  </button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 leading-tight">
                  {rhymeMode === 'both' 
                    ? '• Flexible: Se aceptan rimas tanto consonantes (perfectas) como asonantes (vocálicas).' 
                    : '• Estricto: Solo se validan palabras que coincidan exactamente en vocales y consonantes desde la última sílaba tónica.'
                  }
                </p>
              </div>

              {/* Round Time selector */}
              <div className="space-y-2 pt-3 border-t border-black/5 dark:border-white/5">
                <div className="flex justify-between items-center select-none">
                  <label className="text-xs font-bold text-slate-655 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-500" />
                    Duración del Turno
                  </label>
                  <span className="text-xs font-black text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                    {Math.floor(roundTime / 60)} {Math.floor(roundTime / 60) === 1 ? 'minuto' : 'minutos'} {roundTime % 60 > 0 ? `${roundTime % 60} seg` : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={240}
                  step={30}
                  value={roundTime}
                  onChange={(e) => setRoundTime(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-zinc-805 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  style={{
                    background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${((roundTime - 60) / 180) * 100}%, var(--plx-slider-track-bg, #e2e8f0) ${((roundTime - 60) / 180) * 100}%, var(--plx-slider-track-bg, #e2e8f0) 100%)`,
                    WebkitAppearance: 'none'
                  }}
                />
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 leading-tight">
                  {`• Se generarán ${Math.min(45, Math.max(15, Math.round(roundTime / 5)))} palabras únicas por grupo para esta duración.`}
                </p>
              </div>

              {/* Sound switch */}
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

              {/* Generate Dynamica Action Button (Renamed from Iniciar to Generar dinámica) */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white text-[13px] font-black uppercase tracking-wider rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 shadow-brand-primary/20"
                >
                  <Sparkles className="w-4.5 h-4.5" />
                  <span>Generar dinámica</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PHASE 2: GAME SCREEN */}
        {phase === 'game' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col items-stretch space-y-6 relative animate-in fade-in duration-200 select-none">
            
            {/* Sparkles Floating Layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
              {sparkles.map((p) => (
                <div
                  key={p.id}
                  className="sparkle-particle"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    color: p.color,
                    animationDelay: `${p.delay}s`
                  }}
                >
                  <Star className="w-full h-full fill-current stroke-none" />
                </div>
              ))}
            </div>

            {/* Turn Intro Card */}
            {!isActiveTurn ? (
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-8 text-center shadow-lg space-y-6 max-w-xl mx-auto w-full py-12 animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-brand-primary/10 border-2 border-brand-primary/20">
                  <Users className="w-10 h-10 text-brand-primary" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-brand-primary tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full">
                    Siguiente Turno
                  </span>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white">
                    {teamNames[currentTeamIndex]}
                  </h2>
                  {teamStudents[currentTeamIndex]?.length > 0 && (
                    <p className="text-xs font-bold text-slate-555 dark:text-zinc-400">
                      Integrantes: {teamStudents[currentTeamIndex].join(', ')}
                    </p>
                  )}
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-zinc-955 rounded-2xl border border-slate-200/50 dark:border-zinc-800/80 text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase">
                    <Type className="w-4 h-4" />
                    <span>Tu primera palabra de origen es:</span>
                  </div>
                  <div className="text-2xl font-black text-brand-primary text-center tracking-wide uppercase py-1">
                    {activeWord}
                  </div>
                  <p className="text-[11px] text-slate-455 dark:text-zinc-500 font-bold text-center">
                    Cada vez que aciertes una rima, la palabra cambiará inmediatamente.
                  </p>
                </div>

                <button
                  onClick={handleStartTimer}
                  className="px-8 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-black text-sm rounded-xl transition-all shadow-md active:scale-98 cursor-pointer w-full flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>EMPEZAR TIEMPO ({roundTime}s)</span>
                </button>
              </div>
            ) : (
              // Active round screen
              <div className="space-y-6 w-full">
                
                {/* Active Round Info Grid */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  
                  {/* Current Active Group Card */}
                  <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${teamStyles[currentTeamIndex % 5].border} shadow-2xs flex items-center gap-3 text-left`}>
                    <div className={`w-3.5 h-3.5 rounded-full`} style={{ backgroundColor: teamStyles[currentTeamIndex % 5].accentColor }} />
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">GRUPO JUGANDO</div>
                      <h4 className="text-base font-black text-slate-800 dark:text-white truncate">
                        {teamNames[currentTeamIndex]}
                      </h4>
                    </div>
                  </div>

                  {/* Timer Card */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-zinc-800 shadow-2xs flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">TIEMPO RESTANTE</span>
                    <div className={`text-2xl font-black tabular-nums transition-colors duration-300 ${timerLeft <= 10 ? 'text-rose-500 animate-pulse scale-105' : 'text-slate-800 dark:text-white'}`}>
                      {timerLeft}s
                    </div>
                  </div>

                  {/* Score Card */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-zinc-800 shadow-2xs flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">RIMAS LOGRADAS</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-500">
                      {wordsByTeam[currentTeamIndex]?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Progress bar representing time left */}
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden border border-black/5">
                  <div 
                    className={`h-full transition-all duration-1000 ${timerLeft <= 10 ? 'bg-rose-500' : 'bg-brand-primary'}`} 
                    style={{ width: `${(timerLeft / roundTime) * 100}%` }}
                  />
                </div>

                {/* Main Typing / Game Core Box */}
                <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-8 shadow-md text-center space-y-6 relative overflow-hidden">
                  
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">
                      Palabra a rimar:
                    </span>
                    <h3 className="text-5xl md:text-6xl font-black tracking-wide text-slate-800 dark:text-white uppercase">
                      {activeWord}
                    </h3>
                    <p className="text-xs font-bold text-slate-555 dark:text-zinc-400 mt-2">
                      Rima válida: {rhymeMode === 'both' ? 'Consonante o Asonante' : 'Únicamente Consonante (Estricta)'}
                    </p>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSubmitWord} className="max-w-xl mx-auto flex gap-3 items-center">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder={`Escribe una rima para "${activeWord}"...`}
                      autoFocus
                      className="flex-1 h-14 px-5 bg-slate-50 dark:bg-zinc-955 border-2 border-slate-250 focus:border-brand-primary dark:border-zinc-850 dark:focus:border-zinc-700 rounded-2xl text-base font-black tracking-wide text-slate-800 dark:text-zinc-100 outline-none transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      className="h-14 px-6 bg-brand-primary hover:bg-brand-primary/95 text-white font-black text-sm rounded-2xl shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center"
                    >
                      ENVIAR RIMA
                    </button>
                  </form>

                  {/* Toggle Keyboard Button */}
                  <div className="flex justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => setShowKeyboard(!showKeyboard)}
                      className={`px-4 py-1.5 font-black text-xs rounded-full border transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                        showKeyboard 
                          ? 'bg-brand-primary/10 border-brand-primary/25 text-brand-primary dark:bg-brand-primary/20 dark:border-brand-primary/40 dark:text-blue-400' 
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-slate-250 dark:border-zinc-800 text-slate-655 dark:text-zinc-350'
                      }`}
                    >
                      <Keyboard size={14} className="shrink-0" />
                      <span>{showKeyboard ? 'Ocultar teclado' : 'Mostrar teclado'}</span>
                    </button>
                  </div>

                  {showKeyboard && (
                    <div className="w-full max-w-xl mx-auto space-y-2 pt-2 pb-4 select-none animate-in fade-in slide-in-from-top-1 duration-150">
                      {KEYBOARD_ROWS.map((row, rIdx) => (
                        <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5 md:gap-2">
                          {row.map((char) => (
                            <button
                              key={char}
                              type="button"
                              onClick={() => handleVirtualKey(char)}
                              className="w-8 h-10 sm:w-10 sm:h-12 text-xs sm:text-sm md:text-base rounded-xl font-black bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                            >
                              {char}
                            </button>
                          ))}
                        </div>
                      ))}
                      {/* Control Row */}
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleVirtualKey('SPACE')}
                          className="h-10 sm:h-12 px-6 text-xs sm:text-sm rounded-xl font-black bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-750 text-slate-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                        >
                          Espacio
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVirtualKey('BACKSPACE')}
                          className="h-10 sm:h-12 px-6 text-xs sm:text-sm rounded-xl font-black bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 shadow-2xs hover:shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Skip word button */}
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleSkipWord}
                      className="px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 dark:bg-amber-500/5 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 font-black text-xs rounded-xl shadow-2xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-all active:scale-95 select-none"
                    >
                      <span>Saltar Palabra</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Turn history log */}
                <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                    Historial del Turno ({wordsByTeam[currentTeamIndex]?.length || 0} palabras)
                  </h4>
                  <div className="flex flex-wrap gap-2 items-center">
                    {(!wordsByTeam[currentTeamIndex] || wordsByTeam[currentTeamIndex].length === 0) ? (
                      <span className="text-xs font-medium text-slate-400 italic">No se han registrado palabras todavía...</span>
                    ) : (
                      wordsByTeam[currentTeamIndex]?.map((w, index) => (
                        <motion.span
                          key={index}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 shadow-2xs"
                        >
                          <span className="text-slate-455 text-[10px] lowercase font-normal">{w.targetWord} &rarr;</span>
                          <span>{w.userWord}</span>
                          <span className="text-[9px] px-1 bg-emerald-500/20 rounded font-normal lowercase tracking-tighter">
                            {w.type}
                          </span>
                        </motion.span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PHASE 3: RESULTS SCREEN */}
        {phase === 'results' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col items-stretch space-y-6 animate-in fade-in duration-200 select-none">
            
            {/* Main Trophy Box */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-8 shadow-lg text-center space-y-6 py-12">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center bg-amber-500/10 border-2 border-amber-500/20 rounded-full">
                <Trophy className="w-14 h-14 text-amber-500 fill-amber-500/10" />
                <Award className="absolute -bottom-1 -right-1 w-8 h-8 text-yellow-500 fill-yellow-500/10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-amber-500 tracking-widest bg-amber-500/10 px-4 py-1.5 rounded-full">
                  ¡Juego Completado!
                </span>
                
                {/* Winner Declaration */}
                {winners.length === 1 ? (
                  <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white">
                    ¡Ganó el {teamNames[winners[0]]}! 🏆
                  </h2>
                ) : (
                  <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white">
                    ¡Empate en el primer lugar! 🤝
                  </h2>
                )}
                
                <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm max-w-xl mx-auto mt-2">
                  {winners.length === 1 
                    ? `Felicidades al equipo por lograr escribir ${maxCount} rimas válidas en total.`
                    : `Los equipos empataron al escribir ${maxCount} rimas válidas en total.`
                  }
                </p>
              </div>

              {/* Podium Layout */}
              <div className="flex flex-col md:flex-row items-end justify-center gap-6 pt-10 pb-8 max-w-2xl mx-auto border-b border-black/5 dark:border-white/5 select-none">
                
                {/* 2ND PLACE PODIUM STAND */}
                {sortedTeams[1] && (
                  <div className="flex flex-col items-center w-48 order-2 md:order-1">
                    <div className="text-center mb-3">
                      <span className="text-4xl">🥈</span>
                      <h4 className="font-black text-sm text-slate-700 dark:text-zinc-350 truncate max-w-[120px] mx-auto">{sortedTeams[1].name}</h4>
                      <p className="text-xs font-black text-slate-500">{sortedTeams[1].score} rimas</p>
                    </div>
                    <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 dark:from-zinc-800 dark:to-zinc-700 h-28 rounded-t-2xl flex items-center justify-center border-t-2 border-slate-300 dark:border-zinc-600 shadow-sm relative">
                      <span className="text-5xl font-black text-slate-400 dark:text-zinc-550 select-none">2</span>
                      <div className="absolute inset-0 bg-white/5 pointer-events-none rounded-t-2xl" />
                    </div>
                  </div>
                )}

                {/* 1ST PLACE PODIUM STAND */}
                {sortedTeams[0] && (
                  <div className="flex flex-col items-center w-52 order-1 md:order-2 z-10 -translate-y-2 md:translate-y-0">
                    <div className="text-center mb-3 relative">
                      <Crown className="w-8 h-8 text-amber-500 fill-amber-500/20 absolute -top-8 left-1/2 -translate-x-1/2" />
                      <span className="text-5xl">🥇</span>
                      <h4 className="font-black text-base text-slate-855 dark:text-white truncate max-w-[140px] mx-auto">{sortedTeams[0].name}</h4>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-500">{sortedTeams[0].score} rimas</p>
                    </div>
                    <div className="w-full bg-gradient-to-t from-amber-400 to-amber-300 dark:from-amber-600 dark:to-amber-500 h-40 rounded-t-2xl flex items-center justify-center border-t-2 border-amber-350 dark:border-amber-400 shadow-md relative">
                      <span className="text-6xl font-black text-amber-100/60 select-none">1</span>
                      <div className="absolute inset-0 bg-white/10 pointer-events-none rounded-t-2xl" />
                    </div>
                  </div>
                )}

                {/* 3RD PLACE PODIUM STAND */}
                {sortedTeams[2] && (
                  <div className="flex flex-col items-center w-48 order-3">
                    <div className="text-center mb-3">
                      <span className="text-4xl">🥉</span>
                      <h4 className="font-black text-sm text-slate-700 dark:text-zinc-350 truncate max-w-[120px] mx-auto">{sortedTeams[2].name}</h4>
                      <p className="text-xs font-black text-slate-500">{sortedTeams[2].score} rimas</p>
                    </div>
                    <div className="w-full bg-gradient-to-t from-orange-350 to-orange-200 dark:from-amber-800/20 dark:to-amber-900/40 h-20 rounded-t-2xl flex items-center justify-center border-t-2 border-orange-200 dark:border-amber-700 shadow-xs relative">
                      <span className="text-4xl font-black text-orange-400 dark:text-amber-800 select-none">3</span>
                      <div className="absolute inset-0 bg-white/5 pointer-events-none rounded-t-2xl" />
                    </div>
                  </div>
                )}

              </div>

              {/* Group scores review breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto pt-6 justify-center">
                {sortedTeams.map((team, idx) => {
                  const is1st = idx === 0;
                  const is2nd = idx === 1;
                  const is3rd = idx === 2;
                  
                  let badge = "";
                  if (is1st) badge = "🥇 1er Lugar";
                  else if (is2nd) badge = "🥈 2do Lugar";
                  else if (is3rd) badge = "🥉 3er Lugar";
                  else badge = `🏅 ${idx + 1}º Lugar`;

                  return (
                    <div 
                      key={team.index} 
                      className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-44 shadow-2xs relative ${
                        is1st 
                          ? 'border-amber-450 bg-amber-500/5 dark:border-amber-500/30 shadow-xs' 
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20'
                      }`}
                    >
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-black uppercase bg-black/5 dark:bg-white/5 px-2.5 py-0.5 rounded-full text-slate-555 dark:text-zinc-400">
                          {badge}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-black text-base text-slate-850 dark:text-zinc-150 uppercase truncate pr-20">
                          {team.name}
                        </h4>
                      </div>

                      <div className="flex-1 overflow-y-auto my-2 pr-1 space-y-1 text-xs">
                        <div className="text-[9px] font-black uppercase text-slate-400">Rimas logradas ({team.score}):</div>
                        <p className="text-slate-655 dark:text-zinc-350 font-bold text-xs space-y-1 leading-relaxed">
                          {team.words.map(w => `${w.targetWord} (${w.userWord})`).join(', ') || '(Ninguna)'}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/5">
                        <span className="text-[10px] font-extrabold uppercase text-slate-455">PUNTOS</span>
                        <span className="text-lg font-black text-slate-800 dark:text-white">
                          {team.score} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reset Game Button */}
              <div className="pt-6 flex justify-center gap-4">
                <button
                  onClick={handleResetGame}
                  className="px-8 py-3.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4.5 h-4.5" />
                  <span>JUGAR DE NUEVO / NUEVA CONFIGURACIÓN</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EXIT CONFIRMATION MODAL */}
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 select-none">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-855 dark:text-white">
                  ¿Seguro que deseas salir del juego?
                </h3>
                <p className="text-xs font-bold text-slate-555 dark:text-zinc-400">
                  Perderás el progreso de la partida actual. Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-655 dark:text-zinc-350 rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowExitConfirm(false);
                    handleResetGame();
                  }}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-rose-500/10"
                >
                  Sí, salir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Generation Loading Modal matching Jeopardy exactly */}
        {isGenerating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
            <div className="w-full max-w-[380px] p-0 bg-white dark:bg-zinc-900 border border-slate-205 dark:border-zinc-800 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 mx-4 overflow-hidden">
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
                  <h4 className="text-xl font-black text-slate-805 dark:text-zinc-150 tracking-tight">
                    Preparando Rimando Ando
                  </h4>
                  <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed font-bold">
                    Preparando el listado de palabras y las reglas de rima. Esto puede tomar unos segundos.
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
