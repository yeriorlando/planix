import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Volume2,
  VolumeX,
  Timer,
  UserCircle,
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Crown,
  Check,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast, Toaster } from 'sonner';
import { getCurrentUser, getClassrooms, Classroom, getStudents, Student, getStudentAvatar } from '../lib/storage';

export default function Profesor() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Configurations & Database State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  // Selection & Game State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [showSound, setShowSound] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<any>(null);

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

  // Fetch students when selected class changes
  useEffect(() => {
    if (selectedClassId) {
      const list = getStudents(selectedClassId);
      setStudents(list);
      setSelectedStudent(null);
      setTimeLeft(60);
      setIsActive(false);
    } else {
      setStudents([]);
      setSelectedStudent(null);
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

  // Synthesized sounds using AudioContext
  const playTick = () => {
    if (!showSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio tick failed', e);
    }
  };

  const playSuccessBell = () => {
    if (!showSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.1 + 0.4);
        osc.start(audioCtx.currentTime + index * 0.1);
        osc.stop(audioCtx.currentTime + index * 0.1 + 0.4);
      });
    } catch (e) {
      console.warn('Audio success fanfare failed', e);
    }
  };

  // Random Selection logic with tómbola effect
  const selectRandomStudent = () => {
    if (students.length === 0) return;
    setIsSelecting(true);
    setSelectedStudent(null);
    setTimeLeft(60);
    setIsActive(false);

    let count = 0;
    const interval = setInterval(() => {
      const tempStudent = students[Math.floor(Math.random() * students.length)];
      setSelectedStudent(tempStudent);
      playTick();
      count++;
      if (count > 15) {
        clearInterval(interval);
        setIsSelecting(false);
      }
    }, 100);
  };

  // Timer Countdown Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsActive(false);
            playSuccessBell();
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#6366f1', '#818cf8', '#fbbf24']
            });
            return 0;
          }
          if (prev <= 6) {
            playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive, timeLeft, showSound]);

  const toggleTimer = () => {
    if (timeLeft === 0) return;
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(60);
  };

  const progress = (timeLeft / 60) * 100;

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

        {/* Header Controls */}
        <header className="flex items-center justify-between px-6 py-4 w-full max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs mb-6 mt-4 select-none gap-4">
          <div className="flex-1 flex justify-start">
            <Link
              to="/dinamicas"
              className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              ← VOLVER A DINÁMICAS
            </Link>
          </div>

          <div className="flex-none flex items-center justify-center">
            {isPremium && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/12 dark:from-amber-500/20 dark:to-amber-600/20 border border-amber-500/25 dark:border-amber-500/40 rounded-full shadow-[0_2px_12px_rgba(245,158,11,0.08)]">
                <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 fill-amber-500/20 stroke-[2.5]" />
                <span className="text-xs md:text-[13px] font-black text-amber-855 dark:text-amber-400 tracking-tight">
                  Planix Pro
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 flex justify-end gap-3 items-center">
            <button
              onClick={() => setShowSound(!showSound)}
              className={`p-2 rounded-xl transition-all border ${!showSound ? 'bg-rose-50 border-rose-100 text-rose-500 dark:bg-rose-950/20 dark:border-rose-900/30' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-655 dark:bg-zinc-850 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
              title={showSound ? "Silenciar" : "Activar sonido"}
            >
              {showSound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              {isFullscreen ? '⤢ SALIR PANTALLA COMPLETA' : '⤢ PANTALLA COMPLETA'}
            </button>
          </div>
        </header>

        {/* Title Banner */}
        <div className="print:hidden mb-8 bg-gradient-to-r from-brand-primary/10 via-purple-500/5 to-brand-primary/15 dark:from-brand-primary/15 dark:to-purple-600/15 border border-brand-primary/15 dark:border-brand-primary/25 rounded-2xl py-4 px-6 flex flex-col md:flex-row items-center gap-4 shadow-2xs relative overflow-hidden w-full max-w-4xl mx-auto">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="w-12 h-12 rounded-xl bg-brand-primary/20 dark:bg-brand-primary/30 flex items-center justify-center shrink-0 border border-brand-primary/30 dark:border-brand-primary/40 relative">
            <GraduationCap className="w-6 h-6 text-brand-primary stroke-[2.5]" />
          </div>

          <div className="text-center md:text-left flex-1 relative z-10">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
              Profesor por un Minuto
            </h1>
            <p className="text-slate-655 dark:text-zinc-400 font-medium text-xs mt-1 max-w-3xl leading-normal">
              El estudiante asume el rol del maestro para explicar un concept o tema de clase en 60 segundos. ¡Fomenta la confianza y el dominio de los temas!
            </p>
          </div>
        </div>

        {/* Configurations Card */}
        <div className="max-w-4xl mx-auto w-full space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-8 shadow-xs space-y-6">
            <div className="max-w-md mx-auto space-y-2">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 block text-center">Seleccionar Aula</label>
              
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
                        : "Seleccionar curso..."}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-255 ${showClassDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showClassDropdown && classrooms.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowClassDropdown(false)} />
                    <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-xl rounded-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75 text-left max-h-60 overflow-y-auto">
                      <div className="space-y-0.5">
                        {classrooms.map((c) => {
                          const isActiveClass = c.id === selectedClassId;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedClassId(c.id);
                                setShowClassDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                isActiveClass
                                  ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white"
                                  : "text-slate-750 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span>🏫</span>
                                <span className="truncate">{c.nombre} - Sec. {c.seccion}</span>
                              </div>
                              {isActiveClass && <Check size={14} className="shrink-0 text-brand-primary" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/60 flex justify-center">
              <button
                onClick={selectRandomStudent}
                disabled={isSelecting || !selectedClassId || students.length === 0}
                className={`px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest shadow-md transition-all flex items-center gap-3 active:scale-95 border-none text-xs text-white ${
                  isSelecting || !selectedClassId || students.length === 0
                    ? 'bg-slate-350 dark:bg-zinc-855 cursor-not-allowed shadow-none text-slate-500'
                    : 'bg-brand-primary hover:bg-brand-hover shadow-brand-primary/10 cursor-pointer'
                }`}
              >
                {isSelecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isSelecting ? 'Eligiendo Alumno...' : 'Seleccionar "Profesor"'}
              </button>
            </div>
          </div>

          {/* Game Area */}
          <AnimatePresence mode="wait">
            {(selectedStudent || isSelecting) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Student Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-zinc-800 rounded-[28px] p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 text-slate-500">
                    <GraduationCap className="h-4 w-4 text-brand-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Docente por hoy</span>
                  </div>

                  <div className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-zinc-855 p-2 transition-all duration-300 ${isSelecting ? 'animate-pulse ring-4 ring-brand-primary/20' : 'ring-4 ring-emerald-500/20 shadow-lg'}`}>
                    {selectedStudent ? (
                      <img 
                        src={getStudentAvatar(selectedStudent)} 
                        alt={selectedStudent.nombre} 
                        className="w-full h-full object-contain rounded-full" 
                      />
                    ) : (
                      <UserCircle className="h-20 w-20 text-slate-350 dark:text-slate-700" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h2 className={`text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-zinc-150 ${isSelecting ? 'opacity-30' : ''}`}>
                      {selectedStudent ? `${selectedStudent.nombre} ${selectedStudent.apellido || ''}` : '...'}
                    </h2>
                    {!isSelecting && selectedStudent && (
                      <span className="text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg inline-block">
                        ¡Seleccionado!
                      </span>
                    )}
                  </div>
                </div>

                {/* Timer Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-zinc-800 rounded-[28px] p-8 flex flex-col items-center justify-center space-y-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 text-slate-500">
                    <Timer className="h-4 w-4 text-brand-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Tiempo Restante</span>
                  </div>

                  {/* SVG Timer Circle */}
                  <div className="relative w-40 h-40 flex items-center justify-center select-none">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="72"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-100 dark:text-zinc-800"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="72"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={452}
                        strokeDashoffset={452 - (452 * progress) / 100}
                        strokeLinecap="round"
                        className="text-brand-primary transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <h2 className={`text-5xl font-black tracking-tighter tabular-nums transition-colors leading-none ${timeLeft < 10 && timeLeft > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-800 dark:text-zinc-200'}`}>
                        {timeLeft}
                      </h2>
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">segundos</span>
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="flex items-center gap-4 select-none w-full justify-center">
                    <button
                      onClick={resetTimer}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-455 hover:text-slate-655 dark:text-zinc-400 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-700 transition-all cursor-pointer"
                      title="Reiniciar temporizador"
                    >
                      <RotateCcw className="h-4.5 w-4.5" />
                    </button>
                    
                    <button
                      onClick={toggleTimer}
                      disabled={timeLeft === 0}
                      className={`px-6 py-3 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all border-none ${
                        timeLeft === 0 
                          ? 'bg-slate-100 text-slate-400 dark:bg-zinc-850 dark:text-zinc-600 cursor-not-allowed'
                          : isActive 
                            ? 'bg-rose-500 hover:bg-rose-600 text-white cursor-pointer' 
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10 cursor-pointer'
                      }`}
                    >
                      {isActive ? (
                        <> <Pause className="h-4.5 w-4.5 fill-white text-white border-none" /> Pausar </>
                      ) : (
                        <> <Play className="h-4.5 w-4.5 fill-white text-white border-none" /> Iniciar </>
                      )}
                    </button>
                  </div>

                  {timeLeft === 0 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 text-brand-primary"
                    >
                      <Trophy className="h-5 w-5" />
                      <span className="text-xs font-black uppercase tracking-widest">¡Excelente Explicación!</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!selectedStudent && !isSelecting && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-40 animate-in fade-in duration-300">
              <GraduationCap className="h-16 w-16 text-slate-400" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center max-w-md">
                {selectedClassId 
                  ? (students.length > 0 ? '¡Selecciona un alumno para comenzar la explicación!' : 'Este aula no tiene estudiantes registrados') 
                  : 'Elige un aula para comenzar la dinámica'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
