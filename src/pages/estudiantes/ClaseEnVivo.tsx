import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { 
  ArrowLeft, Sparkles, RefreshCw, Users, Smile, AlertTriangle, Clock, Flame, ChevronDown, GraduationCap 
} from "lucide-react";
import { useRequireAuth } from "../../lib/useRequireAuth";
import { 
  getClassrooms, 
  getAllClassroomsAdmin, 
  getStudents, 
  saveAnecdotalRecord,
  uid,
  Student,
  Classroom,
  AnecdotalRecord
} from "../../lib/storage";
import confetti from "canvas-confetti";
import { toast, Toaster } from "sonner";

export default function ClaseEnVivo() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Classroom selection
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
  const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  // Live Class State Variables
  const [pickedStudent, setPickedStudent] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load classroom and students
  useEffect(() => {
    if (!user || !classId) return;
    const classes = getClassrooms(user.id);
    setClassrooms(classes);
    const current = classes.find(c => c.id === classId) || null;
    setActiveClassroom(current);
    
    if (current) {
      const list = getStudents(current.id);
      setStudents(list.sort((a, b) => a.numero_orden - b.numero_orden));
    }
  }, [user, classId]);

  // Timer tick effect
  useEffect(() => {
    if (isTimerActive && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            clearInterval(timerIntervalRef.current!);
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            toast.success("¡Tiempo terminado!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerActive, timerSeconds]);

  // Roulette picker function
  const spinRoulette = () => {
    if (students.length === 0) return;
    setIsSpinning(true);
    setPickedStudent(null);
    
    let cycles = 0;
    const maxCycles = 15;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * students.length);
      setPickedStudent(students[randomIdx]);
      cycles++;
      if (cycles >= maxCycles) {
        clearInterval(interval);
        setIsSpinning(false);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
        toast.success("¡Estudiante seleccionado!");
      }
    }, 100);
  };

  // Conduct logging function from Live Class
  const recordConductFromLiveClass = (student: Student, type: "P" | "N") => {
    if (!user) return;
    const record: AnecdotalRecord = {
      id: uid("rec"),
      classroom_id: student.classroom_id,
      student_id: student.id,
      docente_id: user.id,
      fecha: new Date().toISOString().split("T")[0],
      hecho: type === "P" 
        ? "Participación destacada y comportamiento ejemplar en clase en vivo."
        : "Llamado de atención por comportamiento inadecuado o falta de concentración en clase en vivo.",
      estado: "guardado",
      creado_en: new Date().toISOString()
    };
    saveAnecdotalRecord(record);
    toast.success(`Conducta ${type === "P" ? "Positiva" : "Incidencia"} registrada para ${student.nombre}`);
  };

  // Helper function to format timer display
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimerSeconds(120);
  };

  if (!user || !activeClassroom) return null;

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <Toaster position="top-center" richColors />

      <div className="flex flex-col gap-6 w-full text-left">
        {/* Header con Dropdown de Aulas */}
        <div className="flex flex-col gap-4 text-center relative pb-4 border-b border-slate-100 print:hidden mb-8 mt-6">
          <div className="absolute top-0 left-0">
            <button 
              onClick={() => navigate(`/aula-virtual`)}
              className="bg-white hover:bg-slate-50 border border-slate-200 rounded-full px-4 py-2 font-bold text-[13px] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Volver a Aulas
            </button>
          </div>
          <div className="absolute top-0 right-0">
            {classrooms.length > 0 && (
              <div className="flex flex-col items-center gap-1 select-none">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Aula o Grupo Activo
                </span>
                <div className="inline-block relative">
                  <button
                    onClick={() => setShowClassroomDropdown(!showClassroomDropdown)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition text-[13px] font-bold text-slate-800 shadow-sm cursor-pointer"
                  >
                    <Users size={14} className="text-slate-700" />
                    <span>{activeClassroom ? activeClassroom.nombre : "Seleccionar Aula"}</span>
                    <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${showClassroomDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showClassroomDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowClassroomDropdown(false)} />
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-black/5 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 mb-1 border-b border-slate-100">
                          Seleccionar Aula
                        </div>
                        <div className="space-y-0.5 max-h-60 overflow-y-auto">
                          {classrooms.map((c) => {
                            const isActive = c.id === classId;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setShowClassroomDropdown(false);
                                  navigate(`/aula-virtual/clase-en-vivo/${c.id}`);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                  isActive
                                    ? "bg-slate-100 text-[#1B1B1B]"
                                    : "text-slate-750 hover:bg-slate-50"
                                }`}
                              >
                                <Users size={14} className={isActive ? "text-slate-800" : "text-slate-400"} />
                                <span className="truncate">{c.nombre}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] tracking-wider leading-none">
              Clase en Vivo
            </h1>
            <p className="text-xs text-slate-500 font-bold mt-1.5">
              Herramientas dinámicas para la participación y gestión del aula en tiempo real.
            </p>
            
            {/* Centered Active Classroom Info Pill */}
            {activeClassroom && (
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                <div className="flex items-center gap-3 bg-white border border-black/5 shadow-sm px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-primary" />
                    <span className="text-xs font-bold text-brand-primary">{activeClassroom.nombre}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-500">{activeClassroom.periodo}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Class Components */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
          {/* Left Column: Roulette (Col span 7) */}
          <div className="lg:col-span-7 bg-white border border-black/5 rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-brand-primary" /> Ruleta de Participación Activa
              </h3>
              <p className="text-[11.5px] font-bold text-slate-400">
                Selecciona un estudiante al azar para responder o participar en clase con un solo clic.
              </p>
            </div>

            <div className="my-8 flex flex-col items-center justify-center">
              <div className={`w-52 h-52 rounded-full border-4 flex flex-col items-center justify-center p-4 text-center transition-all duration-300 relative ${
                isSpinning 
                  ? 'border-brand-primary animate-pulse scale-102 bg-brand-light/10' 
                  : pickedStudent 
                    ? 'border-emerald-500 bg-emerald-50/10 shadow-lg' 
                    : 'border-slate-200 bg-slate-50'
              }`}>
                {isSpinning ? (
                  <div className="space-y-2">
                    <RefreshCw className="h-8 w-8 text-brand-primary animate-spin mx-auto" />
                    <span className="text-xs font-black text-brand-primary uppercase tracking-widest animate-bounce block">Sorteando...</span>
                  </div>
                ) : pickedStudent ? (
                  <div className="space-y-2 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-black mx-auto border border-emerald-200">
                      {pickedStudent.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <h4 className="text-base font-black text-slate-855 leading-snug">{pickedStudent.nombre} {pickedStudent.apellido || ""}</h4>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      ¡Seleccionado!
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-slate-450">
                    <Users className="h-8 w-8 text-slate-350 mx-auto" />
                    <span className="text-xs font-bold block">¿Quién participará hoy?</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={spinRoulette}
                disabled={isSpinning || students.length === 0}
                className="flex-1 bg-brand-primary hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-[13px] px-4 py-2 rounded-full flex items-center justify-center gap-1.5 border-none cursor-pointer shadow-sm transition-all active:scale-98 select-none"
              >
                <RefreshCw className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} /> Girar Ruleta
              </button>

              {pickedStudent && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => recordConductFromLiveClass(pickedStudent, "P")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] px-4 py-2 rounded-full flex items-center gap-1.5 border-none cursor-pointer shadow-sm transition-colors active:scale-98 select-none"
                    title="Punto positivo de conducta"
                  >
                    <Smile className="h-4 w-4" /> Positivo
                  </button>
                  <button
                    onClick={() => recordConductFromLiveClass(pickedStudent, "N")}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[13px] px-4 py-2 rounded-full flex items-center gap-1.5 border-none cursor-pointer shadow-sm transition-colors active:scale-98 select-none"
                    title="Incidencia conductual"
                  >
                    <AlertTriangle className="h-4 w-4" /> Incidencia
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Timer & Voice Meter (Col span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Timer Card */}
            <div className="bg-white border border-black/5 rounded-[24px] p-6 shadow-sm flex flex-col justify-between flex-1 min-h-[180px]">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="h-4.5 w-4.5 text-blue-600" /> Temporizador de Actividades
                </h3>
              </div>

              <div className="my-4 text-center">
                <span className={`text-5xl font-mono font-black tracking-tight ${isTimerActive ? 'text-blue-600 animate-pulse' : 'text-slate-800'}`}>
                  {formatTime(timerSeconds)}
                </span>
              </div>

              <div className="space-y-4">
                {/* Presets */}
                <div className="flex justify-center gap-1.5">
                  {[30, 60, 120, 300].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        setIsTimerActive(false);
                        setTimerSeconds(sec);
                      }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 rounded-lg transition-colors cursor-pointer"
                    >
                      {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={toggleTimer}
                    className={`flex-1 font-bold text-[13px] px-4 py-2 rounded-full border-none cursor-pointer shadow-sm transition-colors select-none text-white ${
                      isTimerActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isTimerActive ? "Pausar" : "Iniciar"}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="bg-slate-50 hover:bg-slate-105 border border-slate-200 text-slate-650 font-bold text-[13px] px-4 py-2 rounded-full cursor-pointer transition-colors select-none"
                  >
                    Reiniciar
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Meter / Noise Level mock Card */}
            <div className="bg-white border border-black/5 rounded-[24px] p-6 shadow-sm flex flex-col justify-between flex-1 min-h-[180px]">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Flame className="h-4.5 w-4.5 text-orange-500 animate-pulse" /> Monitor de Ruido (Simulado)
                </h3>
                <p className="text-[10.5px] font-bold text-slate-400">
                  Mide visualmente el nivel de concentración y silencio en el aula.
                </p>
              </div>

              <div className="my-4 flex items-end justify-center gap-1 h-16 px-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bar) => {
                  const animDelay = `${bar * 0.08}s`;
                  return (
                    <div
                      key={bar}
                      style={{
                        animationDelay: animDelay,
                        height: `${Math.sin(bar) * 30 + 40}%`
                      }}
                      className={`w-2.5 rounded-full animate-bounce bg-gradient-to-t ${
                        bar > 9 
                          ? 'from-rose-400 to-rose-600' 
                          : bar > 6 
                            ? 'from-amber-400 to-amber-500' 
                            : 'from-emerald-400 to-emerald-500'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full">
                  Concentración: Óptima ✅
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
