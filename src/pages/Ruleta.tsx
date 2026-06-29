import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { 
  ArrowLeft, Play, Users, Plus, Trash2, Volume2, VolumeX, 
  Sparkles, RefreshCw, Check, X, HelpCircle, GraduationCap, Disc,
  FileText, Maximize2, Minimize2, Trophy, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wheel } from 'react-custom-roulette';
import confetti from 'canvas-confetti';
import { toast, Toaster } from 'sonner';
import { getCurrentUser, getClassrooms, getStudents, Classroom, Student } from '../lib/storage';

const WHEEL_COLORS = [
  { bg: '#1E293B', text: '#FFFFFF' }, // Navy Blue
  { bg: '#FCD34D', text: '#1E293B' }, // Yellow
  { bg: '#F97316', text: '#FFFFFF' }, // Orange/Coral
  { bg: '#38BDF8', text: '#1E293B' }, // Light Blue
];

export default function Ruleta() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Tabs state: 'aula' | 'personalizada'
  const [activeTab, setActiveTab] = useState<'aula' | 'personalizada'>('aula');
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // Classrooms & Students state
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);

  // Manual participants state (temporary additions)
  const [customNamesText, setCustomNamesText] = useState<string>('');
  const [customNamesList, setCustomNamesList] = useState<string[]>([]);
  
  // Excluded students list (by ID or by custom name string)
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  // Roulette core states
  const [mustStartSpinning, setMustStartSpinning] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [history, setHistory] = useState<Array<{ name: string, time: string, classroom?: string }>>([]);
  
  // Settings states
  const [showSound, setShowSound] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const [removeAfterWin, setRemoveAfterWin] = useState(true);

  // Winner modal states
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [winnerStudent, setWinnerStudent] = useState<any | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // Pagination state for students pool
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fullscreen support
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Sound synthesis functions
  const playTick = () => {
    if (!showSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
      console.warn('AudioContext tick failed', e);
    }
  };

  const playVictoryFanfare = () => {
    if (!showSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.12);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.12 + 0.35);
        osc.start(audioCtx.currentTime + index * 0.12);
        osc.stop(audioCtx.currentTime + index * 0.12 + 0.38);
      });
    } catch (e) {
      console.warn('AudioContext victory failed', e);
    }
  };

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

  // Load students when selected classroom changes
  useEffect(() => {
    if (selectedClassId && selectedClassId !== 'custom') {
      const list = getStudents(selectedClassId);
      setStudents(list.sort((a, b) => a.numero_orden - b.numero_orden));
      setExcludedIds(new Set()); // Reset exclusions on class change
      setCurrentPage(1); // Reset page on class change
    } else {
      setStudents([]);
      setCurrentPage(1);
    }
  }, [selectedClassId]);

  // Reset exclusions and pools when tab changes
  useEffect(() => {
    setExcludedIds(new Set());
    setCurrentPage(1); // Reset page on tab change
  }, [activeTab]);

  // Compile active list of participant names based on active tab
  const activeParticipants = useMemo(() => {
    if (activeTab === 'personalizada') {
      return customNamesList;
    }
    return students.map(s => `${s.nombre} ${s.apellido || ''}`.trim());
  }, [activeTab, students, customNamesList]);

  // Map active participants to whether they are excluded
  const participantDetails = useMemo(() => {
    return activeParticipants.map((name, index) => {
      const identifier = activeTab === 'personalizada' ? `custom-${index}-${name}` : (students[index]?.id || `idx-${index}`);
      const isExcluded = excludedIds.has(identifier);
      const student = activeTab === 'aula' ? students[index] : null;
      return {
        id: identifier,
        name,
        isExcluded,
        avatar_url: student?.avatar_url || null,
        genero: student?.genero || null,
        nombre: student?.nombre || name
      };
    });
  }, [activeParticipants, activeTab, students, excludedIds]);

  // The final subset of names to be loaded into the roulette
  const wheelParticipants = useMemo(() => {
    return participantDetails.filter(p => !p.isExcluded);
  }, [participantDetails]);

  // Pagination calculations for the checklist pool
  const ITEMS_PER_PAGE = 5;
  const totalPages = useMemo(() => {
    return Math.ceil(participantDetails.length / ITEMS_PER_PAGE);
  }, [participantDetails.length]);

  const paginatedParticipants = useMemo(() => {
    const pageToUse = Math.min(currentPage, Math.max(1, totalPages));
    const startIndex = (pageToUse - 1) * ITEMS_PER_PAGE;
    return participantDetails.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [participantDetails, currentPage, totalPages]);

  // Keep currentPage in bounds when list length changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Wheel data expected by react-custom-roulette
  const wheelData = useMemo(() => {
    if (wheelParticipants.length === 0) {
      return [{ option: 'Agrega nombres', style: { backgroundColor: '#F3F4F6', textColor: '#9CA3AF' } }];
    }
    return wheelParticipants.map((p, index) => {
      const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
      const displayName = formatNameFirstLast(p.name);
      return {
        option: displayName.length > 14 ? displayName.substring(0, 12) + '...' : displayName,
        style: {
          backgroundColor: color.bg,
          textColor: color.text
        }
      };
    });
  }, [wheelParticipants]);

  // Tómbola / Horizontal Reel states
  const viewportRef = useRef<HTMLDivElement>(null);
  const [reelTrack, setReelTrack] = useState<any[]>([]);
  const [viewportWidth, setViewportWidth] = useState(500);

  const isTombola = wheelParticipants.length > 20;

  const cardWidth = 160;
  const gap = 8;
  const step = cardWidth + gap; // 168
  const winnerSlot = 45;
  const targetX = (viewportWidth / 2) - (winnerSlot * step) - (cardWidth / 2);
  const initialX = (viewportWidth / 2) - (2 * step) - (cardWidth / 2);

  useEffect(() => {
    const handleResize = () => {
      if (viewportRef.current) {
        setViewportWidth(viewportRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isTombola]);

  useEffect(() => {
    if (isTombola && viewportRef.current) {
      setViewportWidth(viewportRef.current.offsetWidth);
    }
  }, [isTombola, wheelParticipants.length]);

  useEffect(() => {
    if (!mustStartSpinning && wheelParticipants.length > 0) {
      const initialTrack = [];
      for (let i = 0; i < 60; i++) {
        const p = wheelParticipants[i % wheelParticipants.length];
        initialTrack.push(p);
      }
      setReelTrack(initialTrack);
    }
  }, [wheelParticipants, mustStartSpinning]);

  // Handle adding custom manual names
  const handleAddCustomNames = () => {
    if (!customNamesText.trim()) return;
    const names = customNamesText
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (names.length === 0) return;

    setCustomNamesList(prev => [...prev, ...names]);
    setCustomNamesText('');
    toast.success(`Se agregaron ${names.length} participantes temporales`);
  };

  // Toggle individual participant inclusion
  const toggleParticipant = (id: string) => {
    setExcludedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle all inclusion/exclusion
  const toggleAllParticipants = (excludeAll: boolean) => {
    if (excludeAll) {
      const allIds = participantDetails.map(p => p.id);
      setExcludedIds(new Set(allIds));
    } else {
      setExcludedIds(new Set());
    }
  };

  // Trigger spinning roulette
  const handleSpinWheel = () => {
    if (mustStartSpinning) return;
    if (wheelParticipants.length === 0) {
      toast.error('No hay estudiantes activos en el pozo de la ruleta.');
      return;
    }

    const randomIndex = Math.floor(Math.random() * wheelParticipants.length);
    setPrizeNumber(randomIndex);

    // Generate horizontal reel track if in tombola mode
    if (wheelParticipants.length > 20) {
      const trackLength = 60;
      const winnerSlot = 45;
      const newTrack = [];
      for (let i = 0; i < trackLength; i++) {
        if (i === winnerSlot) {
          newTrack.push(wheelParticipants[randomIndex]);
        } else {
          const randParticipant = wheelParticipants[Math.floor(Math.random() * wheelParticipants.length)];
          newTrack.push(randParticipant);
        }
      }
      setReelTrack(newTrack);
    }

    setMustStartSpinning(true);

    // Ticking sound effect while spinning
    if (showSound) {
      let delay = 60;
      const maxDelay = 750;
      let timerId: any = null;

      const tick = () => {
        playTick();
        delay = delay * 1.10; // Slow down rate
        if (delay < maxDelay) {
          timerId = setTimeout(tick, delay);
        }
      };
      timerId = setTimeout(tick, delay);
    }
  };

  // Callback when roulette stops spinning
  const handleStopSpinning = () => {
    setMustStartSpinning(false);
    const winner = wheelParticipants[prizeNumber];
    if (!winner) return;

    setWinnerStudent(winner);
    setWinnerName(winner.name);
    setShowWinnerModal(true);

    // Audio victory fanfare
    playVictoryFanfare();

    // Confetti celebration
    if (showConfetti) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // Add to history
    const currentClassName = activeTab === 'personalizada' 
      ? 'Lista Temporal' 
      : (classrooms.find(c => c.id === selectedClassId)?.nombre || 'Clase');
    
    setHistory(prev => [
      {
        name: winner.name,
        time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        classroom: currentClassName
      },
      ...prev
    ]);

    // Remove from active pool if setting enabled
    if (removeAfterWin) {
      setExcludedIds(prev => {
        const next = new Set(prev);
        next.add(winner.id);
        return next;
      });
    }
  };

  // Delete manual participant from custom list
  const handleDeleteCustomParticipant = (indexToDelete: number) => {
    const pToDelete = participantDetails[indexToDelete];
    if (pToDelete) {
      setExcludedIds(prev => {
        const next = new Set(prev);
        next.delete(pToDelete.id);
        return next;
      });
    }
    setCustomNamesList(prev => prev.filter((_, idx) => idx !== indexToDelete));
  };

  // Clear manual custom participants completely
  const handleClearCustomList = () => {
    setCustomNamesList([]);
    setExcludedIds(new Set());
    toast.success('Lista temporal limpiada');
  };

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
          background-color: #09090b !important;
        }
      `}</style>
      
      <main className={`flex-1 flex flex-col pt-6 w-full min-w-0 pb-10 px-6 ${
        isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
      } text-left`}>
        
        <Toaster position="top-center" richColors />

        {/* Premium Header conteniendo solo los botones de control */}
        <header className="flex items-center justify-between px-6 py-4 w-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs mb-6 mt-4 select-none">
          <Link 
            to="/herramientas" 
            className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer"
          >
            ← VOLVER A HERRAMIENTAS
          </Link>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer"
          >
            {isFullscreen ? '⤢ SALIR PANTALLA COMPLETA' : '⤢ PANTALLA COMPLETA'}
          </button>
        </header>

        {/* Título Principal (HTML Rediseñado, Compacto y Estático) */}
        <div className="print:hidden mb-5 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/10 dark:from-amber-500/15 dark:to-yellow-600/15 border border-amber-500/15 dark:border-amber-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full">
            {/* Decoración de fondo */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />
            
            {/* Contenedor de Icono */}
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center shrink-0 border border-amber-500/30 dark:border-amber-500/40 relative">
                <Disc className="w-5 h-5 md:w-6 h-6 text-amber-600 dark:text-amber-400 stroke-[2.5]" />
            </div>

            {/* Textos */}
            <div className="text-center md:text-left flex-1 relative z-10">
                <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                    Ruleta de Participación
                </h1>
                <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
                    Selecciona alumnos al azar de forma divertida para incentivar la participación activa en tu clase. Gira la ruleta y motiva a todos tus estudiantes.
                </p>
            </div>
        </div>

        {/* Main panel layout: Grid with Wheel on left, settings/students on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left column: Wheel Board (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-6 md:p-8 flex flex-col items-center justify-center min-h-[500px] shadow-xs relative overflow-hidden">
               {/* Tómbola/Wheel selector wrapper */}
            <div className={`flex flex-col items-center justify-center relative w-full my-4 select-none ${isTombola ? 'max-w-[520px] py-8' : 'max-w-[440px] aspect-square'}`}>
              {wheelParticipants.length > 0 ? (
                isTombola ? (
                  <div className="w-full flex flex-col items-center justify-center py-6 animate-in fade-in duration-300">
                    {/* Icon / Header decoration */}
                    <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mb-4 border border-brand-primary/20 shadow-2xs">
                      <Disc size={32} className="animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    
                    <h3 className="text-base font-black text-slate-800 dark:text-zinc-200 uppercase tracking-widest mb-1">
                      Tómbola de Selección
                    </h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-8 max-w-sm text-center">
                      Modo lineal activo automáticamente para facilitar la lectura de los {wheelParticipants.length} alumnos.
                    </p>
                    
                    {/* Viewport wrapper */}
                    <div 
                      ref={viewportRef}
                      className="w-full max-w-[520px] h-24 bg-slate-50 dark:bg-black/40 rounded-3xl border-2 border-slate-200 dark:border-zinc-800 relative overflow-hidden flex items-center shadow-inner"
                    >
                      {/* Central vertical pointer line */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-brand-primary z-10 shadow-xs">
                        {/* Downward triangle/arrow */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-brand-primary"></div>
                        {/* Upward triangle/arrow */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-brand-primary"></div>
                      </div>
                      
                      {/* Left and right fade gradient overlays */}
                      <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none z-10"></div>
                      <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none z-10"></div>

                      {/* Animated track of cards */}
                      <motion.div
                        animate={{ x: mustStartSpinning ? targetX : initialX }}
                        transition={mustStartSpinning 
                          ? { duration: 4.5, ease: [0.1, 0.8, 0.1, 1] } 
                          : { duration: 0.5, ease: 'easeOut' }
                        }
                        onAnimationComplete={() => {
                          if (mustStartSpinning) {
                            handleStopSpinning();
                          }
                        }}
                        className="flex items-center"
                        style={{ gap: '8px' }}
                      >
                        {reelTrack.map((p, idx) => {
                          const color = WHEEL_COLORS[idx % WHEEL_COLORS.length];
                          const displayName = formatNameFirstLast(p?.name || '');
                          return (
                            <div 
                              key={idx}
                              className="w-40 h-16 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-center p-2 font-black shadow-xs shrink-0 select-none transition-transform"
                              style={{ 
                                backgroundColor: color.bg, 
                                color: color.text,
                                fontSize: wheelParticipants.length > 10 ? '10px' : '12px'
                              }}
                            >
                              <span className="truncate max-w-full">{displayName}</span>
                            </div>
                          );
                        })}
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <Wheel
                    mustStartSpinning={mustStartSpinning}
                    prizeNumber={prizeNumber}
                    data={displayDataHelper(wheelData)}
                    onStopSpinning={handleStopSpinning}
                    outerBorderColor="#E5E7EB"
                    outerBorderWidth={6}
                    innerRadius={15}
                    innerBorderColor="#FFFFFF"
                    innerBorderWidth={3}
                    radiusLineColor="#FFFFFF"
                    radiusLineWidth={2}
                    spinDuration={0.7}
                  />
                )
              ) : (
                <div className="w-[380px] h-[380px] rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-black/20">
                  <HelpCircle size={48} className="text-slate-400 dark:text-slate-655 mb-3" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">Pozo Vacío</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
                    Activa al menos 2 estudiantes o agrega nombres en el panel lateral para poder girar la ruleta.
                  </p>
                </div>
              )}
            </div>

            {/* Spin Control Button */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                onClick={handleSpinWheel}
                disabled={mustStartSpinning || wheelParticipants.length === 0}
                className={`px-5 py-2.5 rounded-full text-xs font-black shadow-md uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 ${
                  mustStartSpinning || wheelParticipants.length === 0
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-650 cursor-not-allowed border border-transparent shadow-none'
                    : 'bg-brand-primary text-white hover:bg-brand-primary/95 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer'
                }`}
              >
                <Play size={14} className="fill-current" />
                {mustStartSpinning ? 'Girando ruleta...' : '¡GIRAR RULETA!'}
              </button>

              <button
                onClick={() => {
                  setExcludedIds(new Set());
                  toast.success('Se han activado todos los participantes.');
                }}
                disabled={excludedIds.size === 0 || mustStartSpinning}
                className={`px-5 py-2.5 rounded-full text-xs font-black border uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md ${
                  excludedIds.size === 0 || mustStartSpinning
                    ? 'border-slate-100 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:border-slate-700 dark:text-slate-650 cursor-not-allowed shadow-none'
                    : 'bg-white dark:bg-zinc-800 border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-zinc-750 active:scale-95 cursor-pointer'
                }`}
              >
                <RefreshCw size={13} />
                Reiniciar Pozo
              </button>
            </div>

            {/* Quick Settings Panel - Restyled Premium Inline Rows */}
            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex flex-row flex-nowrap items-center justify-center gap-x-4 sm:gap-x-6 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-455 whitespace-nowrap w-full">
              
              {/* Exclude winner option checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={removeAfterWin}
                  onChange={(e) => setRemoveAfterWin(e.target.checked)}
                  className="w-4 h-4 rounded-lg border-black/10 dark:border-white/10 text-brand-primary focus:ring-brand-primary cursor-pointer accent-brand-primary"
                />
                <span>Excluir ganador al salir</span>
              </label>

              {/* Sound toggle button */}
              <button 
                onClick={() => setShowSound(!showSound)} 
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer select-none border-none bg-transparent"
              >
                {showSound ? <Volume2 size={16} className="text-brand-primary" /> : <VolumeX size={16} className="text-slate-400 dark:text-slate-550" />}
                <span>Efectos de Sonido ({showSound ? 'Sí' : 'No'})</span>
              </button>

              {/* Confetti toggle button */}
              <button 
                onClick={() => setShowConfetti(!showConfetti)} 
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer select-none border-none bg-transparent"
              >
                <Sparkles size={16} className={showConfetti ? 'text-brand-primary fill-brand-primary/20' : 'text-slate-400 dark:text-slate-550'} />
                <span>Confeti al ganar ({showConfetti ? 'Sí' : 'No'})</span>
              </button>
            </div>
          </div>

          {/* Right column: Config & Roster Panels (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Combined Config & Tab Selector Card */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs text-left">
              <div className="flex items-center gap-3 mb-4 select-none">
                <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">1</span>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  Participantes
                </h3>
              </div>
              
              {/* Styled Tabs selector container */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-zinc-950 rounded-2xl border border-slate-200/40 dark:border-zinc-800/80 mb-5 select-none">
                <button
                  onClick={() => setActiveTab('aula')}
                  disabled={mustStartSpinning}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed ${
                    activeTab === 'aula'
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <GraduationCap size={14} />
                  <span>Seleccionar aula</span>
                </button>
                <button
                  onClick={() => setActiveTab('personalizada')}
                  disabled={mustStartSpinning}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed ${
                    activeTab === 'personalizada'
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <FileText size={14} />
                  <span>Lista personalizada</span>
                </button>
              </div>
              
              {/* Tab Contents: Selecting class */}
              {activeTab === 'aula' ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="relative w-full select-none">
                    <button
                      type="button"
                      onClick={() => !mustStartSpinning && setShowClassDropdown(!showClassDropdown)}
                      disabled={mustStartSpinning}
                      className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-500">🏫</span>
                        <span className="truncate">
                          {classrooms.find(c => c.id === selectedClassId)
                            ? `${classrooms.find(c => c.id === selectedClassId)?.nombre} - Sec. ${classrooms.find(c => c.id === selectedClassId)?.seccion} (${classrooms.find(c => c.id === selectedClassId)?.periodo})`
                            : "No tienes aulas creadas"}
                        </span>
                      </div>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showClassDropdown ? 'rotate-180' : ''}`} />
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
                                    <span className="truncate">{c.nombre} - Sec. {c.seccion} ({c.periodo})</span>
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
              ) : (
                /* Tab Contents: Custom manual entries */
                <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                  <p className="text-[11px] text-text-muted font-bold leading-normal">
                    Escribe los nombres de los participantes (un nombre por línea) y presiona "Cargar Lista".
                  </p>
                  <textarea
                    rows={4}
                    value={customNamesText}
                    onChange={(e) => setCustomNamesText(e.target.value)}
                    placeholder="Ejemplo:&#10;María Santana&#10;Juan Pérez&#10;Alba Gómez"
                    disabled={mustStartSpinning}
                    className="w-full px-4 py-3 rounded-xl border border-black/5 dark:border-white/10 bg-neutral-50 dark:bg-zinc-900/50 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-2xs resize-none"
                  />
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleAddCustomNames}
                      disabled={mustStartSpinning || !customNamesText.trim()}
                      className="flex-1 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-650 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/30 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Plus size={14} /> Cargar Lista
                    </button>
                    {customNamesList.length > 0 && (
                      <button
                        onClick={handleClearCustomList}
                        disabled={mustStartSpinning}
                        className="bg-red-50 hover:bg-red-100 text-red-650 dark:bg-red-950/20 dark:hover:bg-red-950/30 dark:text-red-400 border border-red-100/40 dark:border-red-900/30 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title="Limpiar lista completa"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Student/Participants Checklist Card */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3 select-none">
                  <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">2</span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    Pozo de Estudiantes
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  {wheelParticipants.length} de {activeParticipants.length} activos
                </span>
              </div>

              {/* Quick Bulk Exclusions */}
              {activeParticipants.length > 0 && (
                <div className="flex gap-2 mb-3 border-b border-black/5 dark:border-white/5 pb-3 flex-wrap">
                  <button
                    onClick={() => toggleAllParticipants(false)}
                    disabled={mustStartSpinning}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 rounded-lg text-[10px] font-black transition-all cursor-pointer border border-indigo-100/20 shadow-3xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check size={11} />
                    Activar todos
                  </button>
                  <button
                    onClick={() => toggleAllParticipants(true)}
                    disabled={mustStartSpinning}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg text-[10px] font-black transition-all cursor-pointer border border-red-100/20 shadow-3xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={11} />
                    Excluir todos
                  </button>
                </div>
              )}

              {/* Scrollable list of student checkboxes */}
              <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1.5 scrollbar-hide">
                {participantDetails.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    {activeTab === 'personalizada' 
                      ? 'No hay participantes en la lista temporal.'
                      : 'Esta clase no tiene alumnos registrados.'}
                  </div>
                ) : (
                  paginatedParticipants.map((p, index) => {
                    const originalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs font-bold ${
                          p.isExcluded
                            ? 'bg-slate-50/50 dark:bg-black/10 text-slate-400 dark:text-slate-600 border-transparent'
                            : 'bg-white dark:bg-zinc-900 text-slate-850 dark:text-zinc-200 border-black/5 dark:border-white/5 shadow-3xs'
                        }`}
                      >
                        <label className="flex items-center gap-3 flex-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!p.isExcluded}
                            onChange={() => toggleParticipant(p.id)}
                            disabled={mustStartSpinning}
                            className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer disabled:opacity-50 accent-brand-primary"
                          />
                          <div className="relative shrink-0">
                            <img
                              src={p.avatar_url || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${encodeURIComponent(p.nombre || p.name)}`}
                              alt={p.nombre || p.name}
                              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-zinc-700 bg-white object-cover"
                            />
                            {p.genero && (
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white dark:border-zinc-900 ${
                                p.genero === 'F' ? 'bg-pink-500' : 'bg-blue-500'
                              }`} />
                            )}
                          </div>
                          <span className="truncate">{p.name}</span>
                        </label>
                        
                        {/* Trash button for temporary manual entries */}
                        {activeTab === 'personalizada' && (
                          <button
                            onClick={() => handleDeleteCustomParticipant(originalIndex)}
                            disabled={mustStartSpinning}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg cursor-pointer disabled:opacity-50"
                            title="Eliminar participante"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/80 select-none text-xs font-bold mt-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-slate-705 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-850 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Anterior
                  </button>
                  <span className="text-slate-500 dark:text-zinc-500">
                    Pág. {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-slate-705 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-850 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

            {/* Winner History Card */}
            <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3 select-none">
                  <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">3</span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    Historial de Giros
                  </h3>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg text-[10px] font-black transition-all cursor-pointer border border-red-100/20 shadow-3xs"
                  >
                    <Trash2 size={11} />
                    Limpiar Historial
                  </button>
                )}
              </div>

              <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2 scrollbar-hide">
                {history.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-bold border border-dashed border-slate-100 dark:border-slate-850 rounded-xl">
                    Los resultados de los giros se mostrarán aquí.
                  </div>
                ) : (
                  history.map((h, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-2.5 bg-slate-50/70 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5 rounded-xl text-xs font-semibold"
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold text-slate-800 dark:text-zinc-200">{h.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">{h.classroom}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 px-2 py-0.5 rounded-md">
                        {h.time}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Celebration/Winner Announcement Dialog Modal */}
        <AnimatePresence>
          {showWinnerModal && winnerName && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
              {/* Clickable Backdrop to close */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowWinnerModal(false)}
                className="absolute inset-0 cursor-pointer"
              />

              {/* Modal Body Container */}
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-[440px] w-full text-center border-2 border-black dark:border-white/20 shadow-2xl relative z-10 select-text"
              >
                {/* Top Avatar wrapper */}
                <div className="relative w-20 h-20 mx-auto mb-6 select-none flex items-center justify-center">
                  <img
                    src={winnerStudent?.avatar_url || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${encodeURIComponent(winnerStudent?.nombre || winnerName)}`}
                    alt={winnerStudent?.nombre || winnerName}
                    className="w-20 h-20 rounded-full border-2 border-neutral-200 dark:border-zinc-700 bg-white object-cover"
                  />
                  {winnerStudent?.genero && (
                    <span className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 ${
                      winnerStudent.genero === 'F' ? 'bg-pink-500' : 'bg-blue-500'
                    }`} />
                  )}
                </div>

                <span className="text-[11px] font-black uppercase text-indigo-650 dark:text-indigo-400 tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 rounded-full">
                  ¡Seleccionado/a!
                </span>

                <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-5 leading-tight tracking-tight">
                  {winnerName}
                </h2>

                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-3 max-w-[280px] mx-auto leading-relaxed">
                  Es tu turno de responder o participar en la dinámica de clase.
                </p>

                {/* Buttons */}
                <div className="mt-8 flex flex-col gap-3">
                  <button
                    onClick={() => setShowWinnerModal(false)}
                    className="w-full bg-[#1B1B1B] dark:bg-white text-white dark:text-[#1B1B1B] hover:bg-[#2c2c2c] dark:hover:bg-slate-50 px-6 py-3 rounded-full text-sm font-extrabold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                  >
                    ¡Excelente!
                  </button>
                  {removeAfterWin && (
                    <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500">
                      Este estudiante ha sido removido temporalmente de la ruleta.
                    </p>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowWinnerModal(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-655 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X size={18} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

// Display Data Helper to avoid division-by-zero crashes in react-custom-roulette
function displayDataHelper(dataArray: any[]) {
  if (dataArray.length === 0) {
    return [{ option: 'Agrega participantes', style: { backgroundColor: '#F3F4F6', textColor: '#9CA3AF' } }];
  }
  return dataArray;
}

// Helper function to extract first name and first surname
function formatNameFirstLast(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts.slice(0, 2).join(' ');
}
