import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { 
  ArrowLeft, Play, Pause, RotateCcw, Clock, Volume2, VolumeX, 
  Maximize2, Minimize2, Plus, Minus, Bell, Sparkles, CheckCircle2, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

type SoundType = "timbre" | "campana" | "alerta";

export default function CronometroActividades() {
  const navigate = useNavigate();
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Timer State
  const [totalSeconds, setTotalSeconds] = useState(120); // Default 2 mins
  const [timeLeft, setTimeLeft] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [activityTitle, setActivityTitle] = useState("Trabajo en Equipo");
  
  // Custom Time Inputs
  const [customMin, setCustomMin] = useState(2);
  const [customSec, setCustomSec] = useState(0);

  // Audio / Visual Settings
  const [soundType, setSoundType] = useState<SoundType>("timbre");
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom Drawer Toggle
  const [showCustomDrawer, setShowCustomDrawer] = useState(false);

  // Synthesize High-Volume Loud Alarm via Web Audio API
  const playAlarm = (type: SoundType = soundType) => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(1.0, now); // Max Volume
      masterGain.connect(ctx.destination);

      if (type === "timbre") {
        // High-Volume Electric School Bell (Pulsing 780Hz/920Hz)
        for (let i = 0; i < 12; i++) {
          const pulseStart = now + i * 0.12;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = "sawtooth";
          osc2.type = "square";
          osc1.frequency.setValueAtTime(780, pulseStart);
          osc2.frequency.setValueAtTime(920, pulseStart);

          gain.gain.setValueAtTime(0, pulseStart);
          gain.gain.linearRampToValueAtTime(0.8, pulseStart + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, pulseStart + 0.1);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(masterGain);

          osc1.start(pulseStart);
          osc2.start(pulseStart);
          osc1.stop(pulseStart + 0.11);
          osc2.stop(pulseStart + 0.11);
        }
      } else if (type === "campana") {
        // Loud Resonant Brass Bell Chime (C5 - G5 - C6 - E6)
        const freqs = [523.25, 783.99, 1046.50, 1318.51];
        freqs.forEach((freq, idx) => {
          const startTime = now + idx * 0.22;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.9, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(startTime);
          osc.stop(startTime + 1.25);
        });
      } else {
        // Loud Digital Emergency Siren (Multi-tone rapid beep)
        for (let b = 0; b < 6; b++) {
          const beepStart = now + b * 0.18;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "square";
          osc.frequency.setValueAtTime(b % 2 === 0 ? 1200 : 1500, beepStart);

          gain.gain.setValueAtTime(0.9, beepStart);
          gain.gain.exponentialRampToValueAtTime(0.001, beepStart + 0.14);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(beepStart);
          osc.stop(beepStart + 0.15);
        }
      }
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  // Timer Tick Interval Effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsFinished(true);
            playAlarm();
            toast.success("¡Tiempo finalizado!", { description: `La actividad "${activityTitle}" ha concluido.` });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundType, isMuted, volume, activityTitle]);

  // Listen to browser native fullscreen change (e.g. ESC key)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Handlers
  const handleStart = () => {
    if (timeLeft <= 0) {
      resetTimer(totalSeconds);
    }
    setIsFinished(false);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const resetTimer = (secs: number = totalSeconds) => {
    setIsRunning(false);
    setIsFinished(false);
    setTotalSeconds(secs);
    setTimeLeft(secs);
  };

  const setPreset = (secs: number) => {
    resetTimer(secs);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    setCustomMin(m);
    setCustomSec(s);
  };

  const handleApplyCustomTime = () => {
    const calculated = Math.max(5, customMin * 60 + customSec);
    resetTimer(calculated);
    toast.info(`Cronómetro configurado en ${formatTime(calculated)}`);
  };

  const addTime = (secsToAdd: number) => {
    setTimeLeft((prev) => {
      const updated = Math.max(0, prev + secsToAdd);
      setTotalSeconds((tPrev) => Math.max(tPrev, updated));
      return updated;
    });
    if (isFinished) setIsFinished(false);
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Formatting Helpers
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const percentage = totalSeconds > 0 ? Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100) : 0;
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      ref={containerRef}
      className={`w-full min-h-screen plx-fullscreen-bg flex flex-col items-stretch transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-[#FBF9F6] dark:bg-[#09090b] text-slate-900 dark:text-white p-4 sm:p-8 overflow-y-auto"
          : (isSidebarPinned ? "md:px-6 xl:px-8 pt-6 pb-12 px-4" : "md:px-12 xl:px-16 pt-6 pb-12 px-4")
      }`}
    >
      <style>{`
        .plx-fullscreen-bg:fullscreen {
          background-color: #FBF9F6 !important;
          padding: 1.5rem !important;
          overflow-y: auto;
          width: 100vw;
          height: 100vh;
        }
        .dark .plx-fullscreen-bg:fullscreen {
          background-color: #09090b !important;
        }
      `}</style>

      {/* Header Bar (Identical to Ruleta Header - Always visible in both modes) */}
      <header className={`flex items-center justify-between px-6 py-4 w-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs mb-6 select-none shrink-0 ${
        isFullscreen ? "max-w-6xl mx-auto" : "max-w-4xl mx-auto"
      }`}>
        <button
          onClick={() => navigate("/herramientas")}
          className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer"
        >
          ← VOLVER A HERRAMIENTAS
        </button>

        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer"
        >
          {isFullscreen ? "⤢ SALIR PANTALLA COMPLETA" : "⤢ PANTALLA COMPLETA"}
        </button>
      </header>

      {/* FULLSCREEN MODE: 2-COLUMN LAYOUT */}
      {isFullscreen ? (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full flex-1">
          {/* Main Title Banner (Ruleta Style) */}
          <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/10 dark:from-amber-500/15 dark:to-yellow-600/15 border border-amber-500/15 dark:border-amber-500/25 rounded-2xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full shrink-0">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center shrink-0 border border-amber-500/30 dark:border-amber-500/40 relative">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 stroke-[2.5]" />
            </div>

            <div className="text-center md:text-left flex-1 relative z-10">
              <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                Cronómetro de Actividades Escolar
              </h1>
              <p className="text-slate-600 dark:text-zinc-400 font-medium text-xs mt-0.5 max-w-3xl leading-normal">
                Gestiona el tiempo en tus clases dinámicamente con temporizador en pantalla grande y alertas sonoras.
              </p>
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            {/* Left Column: Big Clock Visual */}
            <div className={`lg:col-span-7 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-6 sm:p-8 flex flex-col items-center justify-center min-h-[460px] shadow-xs relative overflow-hidden ${
              isFinished ? "ring-4 ring-rose-400" : ""
            }`}>
              
              {/* Circular Display Section */}
              <div className="relative flex flex-col items-center justify-center my-2 select-none">
                <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r={radius}
                      className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                      strokeWidth="16"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r={radius}
                      className={`fill-none transition-all duration-1000 ${
                        isFinished 
                          ? "stroke-rose-500" 
                          : timeLeft < 30 
                            ? "stroke-rose-500" 
                            : timeLeft < 60 
                              ? "stroke-amber-500" 
                              : "stroke-brand-primary"
                      }`}
                      strokeWidth="16"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-6xl sm:text-7xl font-mono font-black tracking-tight select-none ${
                      isFinished 
                        ? "text-rose-600 dark:text-rose-400" 
                        : isRunning 
                          ? "text-slate-900 dark:text-white" 
                          : "text-slate-700 dark:text-slate-200"
                    }`}>
                      {formatTime(timeLeft)}
                    </span>

                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">
                      {isFinished ? "¡TIEMPO FINALIZADO! 🔔" : isRunning ? "EN PROGRESO..." : "PAUSADO"}
                    </span>
                  </div>
                </div>

                {/* Quick Adjust Pills */}
                <div className="flex items-center gap-2 mt-4">
                  <button onClick={() => addTime(-60)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1">
                    <Minus size={12} /> 1m
                  </button>
                  <button onClick={() => addTime(-10)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1">
                    <Minus size={12} /> 10s
                  </button>
                  <button onClick={() => addTime(10)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1">
                    <Plus size={12} /> 10s
                  </button>
                  <button onClick={() => addTime(60)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1">
                    <Plus size={12} /> 1m
                  </button>
                </div>
              </div>

              {/* Primary Controls */}
              <div className="flex items-center justify-center gap-3 mt-6">
                {!isRunning ? (
                  <button onClick={handleStart} className="bg-brand-primary hover:bg-brand-hover text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-2xs hover:shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer select-none">
                    <Play size={16} className="fill-white" /> Iniciar Cronómetro
                  </button>
                ) : (
                  <button onClick={handlePause} className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-2xs hover:shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer select-none">
                    <Pause size={16} className="fill-white" /> Pausar
                  </button>
                )}

                <button onClick={() => resetTimer()} className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all cursor-pointer select-none flex items-center gap-1.5 shadow-2xs active:scale-95">
                  <RotateCcw size={15} /> Reiniciar
                </button>
              </div>
            </div>

            {/* Right Column: Controls & Configuration Cards */}
            <div className="lg:col-span-5 space-y-5">
              {/* Card 1: Nombre */}
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs text-left">
                <div className="flex items-center gap-3 mb-3 select-none">
                  <span className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">1</span>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    Nombre de la Actividad
                  </h3>
                </div>

                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Escribe el nombre de la actividad..."
                  className="text-base font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <p className="text-[11px] text-slate-400 font-medium mt-2">Personaliza el título visible durante la proyección en clase</p>
              </div>

              {/* Card 2: Tiempo */}
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs text-left">
                <div className="flex items-center gap-3 mb-4 select-none">
                  <span className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">2</span>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    Selección de Tiempo
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "3 min", sec: 180 },
                    { label: "5 min", sec: 300 },
                    { label: "10 min", sec: 600 },
                    { label: "20 min", sec: 1200 },
                    { label: "30 min", sec: 1800 }
                  ].map((p) => (
                    <button
                      key={p.sec}
                      onClick={() => { setPreset(p.sec); setShowCustomDrawer(false); }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        totalSeconds === p.sec && !showCustomDrawer
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                          : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}

                  <button
                    onClick={() => setShowCustomDrawer(!showCustomDrawer)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 border ${
                      showCustomDrawer
                        ? "bg-brand-primary text-white border-brand-primary shadow-2xs"
                        : "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <Sparkles size={12} className={showCustomDrawer ? "text-white" : "text-amber-600"} /> Personalizado
                  </button>
                </div>

                {showCustomDrawer && (
                  <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 w-full animate-in fade-in slide-in-from-top-2 duration-200">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-2">
                      <Sparkles size={12} className="text-amber-500" /> Configurar Tiempo
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 flex-1">
                        <input type="number" min="0" max="180" value={customMin} onChange={(e) => setCustomMin(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-center outline-none focus:ring-2 focus:ring-brand-primary" />
                        <span className="text-[11px] font-bold text-slate-400">min</span>
                      </div>
                      <div className="flex items-center gap-1 flex-1">
                        <input type="number" min="0" max="59" value={customSec} onChange={(e) => setCustomSec(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-center outline-none focus:ring-2 focus:ring-brand-primary" />
                        <span className="text-[11px] font-bold text-slate-400">seg</span>
                      </div>
                      <button onClick={handleApplyCustomTime} className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0">
                        Aplicar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Sonido */}
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-xs text-left">
                <div className="flex items-center justify-between mb-4 select-none">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">3</span>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                      Alerta Sonora
                    </h3>
                  </div>

                  <button onClick={() => setIsMuted(!isMuted)} className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${isMuted ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}>
                    {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "timbre", label: "Timbre 🎵" },
                    { id: "campana", label: "Campana 🔔" },
                    { id: "alerta", label: "Alerta 🚨" }
                  ].map((s) => (
                    <button key={s.id} onClick={() => { setSoundType(s.id as SoundType); playAlarm(s.id as SoundType); }} className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${soundType === s.id ? "bg-brand-primary text-white border-brand-primary shadow-2xs" : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>

                <button onClick={() => playAlarm()} className="mt-3.5 w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                  <Volume2 size={14} /> Probar Sonido Seleccionado
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* NORMAL MODE: CENTERED SINGLE CARD LAYOUT */
        <div className={`bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-[32px] p-6 sm:p-8 shadow-lg max-w-4xl mx-auto w-full relative overflow-hidden my-auto ${
          isFinished ? "ring-4 ring-rose-400" : ""
        }`}>
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
              <Clock size={13} className="animate-spin-slow" /> Cronómetro de Actividades Escolar
            </div>
            
            {/* Editable Activity Title */}
            <div className="flex justify-center items-center gap-2 max-w-md mx-auto">
              <input
                type="text"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                placeholder="Escribe el nombre de la actividad..."
                className="text-xl sm:text-2xl font-black text-center text-slate-900 dark:text-white bg-transparent border-b-2 border-dashed border-slate-300 dark:border-slate-600 focus:border-brand-primary outline-none px-2 py-1 w-full"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Haz clic en el título para personalizar el nombre de la tarea</p>
          </div>

          {/* Circular Display Section */}
          <div className="relative flex flex-col items-center justify-center my-4">
            <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-700 fill-none"
                  strokeWidth="16"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  className={`fill-none transition-all duration-1000 ${
                    isFinished 
                      ? "stroke-rose-500" 
                      : timeLeft < 30 
                        ? "stroke-rose-500" 
                        : timeLeft < 60 
                          ? "stroke-amber-500" 
                          : "stroke-brand-primary"
                  }`}
                  strokeWidth="16"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-6xl sm:text-7xl font-mono font-black tracking-tight select-none ${
                  isFinished 
                    ? "text-rose-600 dark:text-rose-400" 
                    : isRunning 
                      ? "text-slate-900 dark:text-white" 
                      : "text-slate-700 dark:text-slate-200"
                }`}>
                  {formatTime(timeLeft)}
                </span>

                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                  {isFinished ? "¡TIEMPO FINALIZADO! 🔔" : isRunning ? "EN PROGRESO..." : "PAUSADO"}
                </span>
              </div>
            </div>

            {/* Quick Adjustment Pills */}
            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => addTime(-60)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1">
                <Minus size={12} /> 1m
              </button>
              <button onClick={() => addTime(-10)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1">
                <Minus size={12} /> 10s
              </button>
              <button onClick={() => addTime(10)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1">
                <Plus size={12} /> 10s
              </button>
              <button onClick={() => addTime(60)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1">
                <Plus size={12} /> 1m
              </button>
            </div>
          </div>

          {/* Primary Controls */}
          <div className="flex items-center justify-center gap-3 my-5">
            {!isRunning ? (
              <button onClick={handleStart} className="bg-brand-primary hover:bg-brand-hover text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-2xs hover:shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer select-none">
                <Play size={16} className="fill-white" /> Iniciar Cronómetro
              </button>
            ) : (
              <button onClick={handlePause} className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-2xs hover:shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer select-none">
                <Pause size={16} className="fill-white" /> Pausar
              </button>
            )}

            <button onClick={() => resetTimer()} className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all cursor-pointer select-none flex items-center gap-1.5 shadow-2xs active:scale-95">
              <RotateCcw size={15} /> Reiniciar
            </button>
          </div>

          {/* Presets Grid */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 text-center">
              Tiempos Predeterminados Rápidos
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
              {[
                { label: "3 min", sec: 180 },
                { label: "5 min", sec: 300 },
                { label: "10 min", sec: 600 },
                { label: "20 min", sec: 1200 },
                { label: "30 min", sec: 1800 }
              ].map((p) => (
                <button
                  key={p.sec}
                  onClick={() => { setPreset(p.sec); setShowCustomDrawer(false); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    totalSeconds === p.sec && !showCustomDrawer
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600"
                  }`}
                >
                  {p.label}
                </button>
              ))}

              <button
                onClick={() => setShowCustomDrawer(!showCustomDrawer)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  showCustomDrawer
                    ? "bg-brand-primary text-white border-brand-primary shadow-2xs"
                    : "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                }`}
              >
                <Sparkles size={13} className={showCustomDrawer ? "text-white" : "text-amber-600"} /> Personalizado
              </button>
            </div>

            {showCustomDrawer && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 max-w-md mx-auto animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" /> Configurar Tiempo Personalizado
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 flex-1">
                    <input type="number" min="0" max="180" value={customMin} onChange={(e) => setCustomMin(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-brand-primary" />
                    <span className="text-xs font-bold text-slate-400">min</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-1">
                    <input type="number" min="0" max="59" value={customSec} onChange={(e) => setCustomSec(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-brand-primary" />
                    <span className="text-xs font-bold text-slate-400">seg</span>
                  </div>
                  <button onClick={handleApplyCustomTime} className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0">
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sound & Alarm Configuration */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 max-w-xl mx-auto w-full">
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Bell size={14} className="text-brand-primary" /> Sonido al Finalizar
                  </h4>
                  <button onClick={() => setIsMuted(!isMuted)} className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${isMuted ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}>
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "timbre", label: "Timbre 🎵" },
                    { id: "campana", label: "Campana 🔔" },
                    { id: "alerta", label: "Alerta 🚨" }
                  ].map((s) => (
                    <button key={s.id} onClick={() => { setSoundType(s.id as SoundType); playAlarm(s.id as SoundType); }} className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${soundType === s.id ? "bg-brand-primary text-white border-brand-primary shadow-2xs" : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => playAlarm()} className="mt-3 w-full py-2 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                <Volume2 size={14} /> Probar Sonido Seleccionado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
