import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { 
  ArrowLeft, Sparkles, RefreshCw, Users, Smile, AlertTriangle, Clock, Flame, ChevronDown, GraduationCap,
  Trophy, Search, CheckCircle2, Star, MessageSquare, Undo2, Settings, X, Medal, Award, Check, Plus, Mic, MicOff
} from "lucide-react";
import { useRequireAuth } from "../../lib/useRequireAuth";
import { 
  getClassrooms, 
  getStudents, 
  saveAnecdotalRecord,
  uid,
  Student,
  Classroom,
  AnecdotalRecord
} from "../../lib/storage";
import confetti from "canvas-confetti";
import { toast, Toaster } from "sonner";

interface ParticipationLog {
  id: string;
  student_id: string;
  type: "participo" | "destacado";
  label: string;
  points: number;
  timestamp: string;
}

interface StudentParticipationData {
  points: number;
  logs: ParticipationLog[];
}

export default function ClaseEnVivo() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Active Tab: 'participacion' | 'marcador' | 'herramientas'
  const [activeTab, setActiveTab] = useState<"participacion" | "marcador" | "herramientas">("participacion");

  // Classroom selection
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
  const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Points Config State (Default: Participó +1, Destacado +3)
  const [pointsConfig, setPointsConfig] = useState<{ participo: number; destacado: number }>(() => {
    if (!classId) return { participo: 1, destacado: 3 };
    try {
      const saved = localStorage.getItem(`plx:part_config_${classId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { participo: 1, destacado: 3 };
  });
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [tempParticipo, setTempParticipo] = useState(pointsConfig.participo);
  const [tempDestacado, setTempDestacado] = useState(pointsConfig.destacado);

  // Participation Data State
  const [participationData, setParticipationData] = useState<Record<string, StudentParticipationData>>({});

  // Quick Anecdotal Note Modal State
  const [selectedStudentForAnecdotal, setSelectedStudentForAnecdotal] = useState<Student | null>(null);
  const [anecdotalNoteText, setAnecdotalNoteText] = useState("");

  // Live Class Tools State (Roulette & Timer)
  const [pickedStudent, setPickedStudent] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real Noise Monitor Web Audio API State
  const [isMicActive, setIsMicActive] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>(Array(12).fill(15));
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Today Date Strings
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const todayFormatted = useMemo(() => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

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

  // Load participation records for active classroom & today
  useEffect(() => {
    if (!classId) return;
    try {
      const saved = localStorage.getItem(`plx:part_${classId}_${todayStr}`);
      if (saved) {
        setParticipationData(JSON.parse(saved));
      } else {
        setParticipationData({});
      }
    } catch (e) {
      setParticipationData({});
    }
  }, [classId, todayStr]);

  // Helper function to get student avatar
  const getStudentAvatarUrl = (student?: Student | null) => {
    if (!student) return "";
    if (student.avatar_url && student.avatar_url.trim() !== '') {
      return student.avatar_url;
    }
    const seed = encodeURIComponent(`${student.nombre}_${student.apellido || ''}_${student.numero_orden}`);
    return `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${seed}`;
  };

  // Sync temp points modal state
  useEffect(() => {
    setTempParticipo(pointsConfig.participo);
    setTempDestacado(pointsConfig.destacado);
  }, [pointsConfig]);

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

  // Save Points Config
  const handleSavePointsConfig = () => {
    const newConfig = {
      participo: Number(tempParticipo) || 1,
      destacado: Number(tempDestacado) || 3,
    };
    setPointsConfig(newConfig);
    if (classId) {
      try {
        localStorage.setItem(`plx:part_config_${classId}`, JSON.stringify(newConfig));
      } catch (e) {}
    }
    setIsPointsModalOpen(false);
    toast.success("Configuración de puntos guardada.");
  };

  // Real Noise Monitor Web Audio API Handler Functions
  const startNoiseMonitor = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMicActive(true);
      toast.success("Micrófono activado. Monitor de ruido en vivo iniciado.");

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const update = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normVol = Math.min(100, Math.round((avg / 128) * 100));
        setNoiseLevel(normVol);

        const newBars: number[] = [];
        const step = Math.max(1, Math.floor(bufferLength / 12));
        for (let b = 0; b < 12; b++) {
          const val = dataArray[b * step] || 0;
          const pct = Math.min(100, Math.max(10, Math.round((val / 225) * 100)));
          newBars.push(pct);
        }
        setBarHeights(newBars);

        animFrameRef.current = requestAnimationFrame(update);
      };

      update();
    } catch (err: any) {
      console.error("Noise monitor error:", err);
      toast.error("No se pudo acceder al micrófono. Verifica los permisos de tu navegador.");
    }
  };

  const stopNoiseMonitor = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsMicActive(false);
    setNoiseLevel(0);
    setBarHeights(Array(12).fill(15));
    toast.info("Monitor de ruido desactivado.");
  };

  // Cleanup microphone resources on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // Add Participation
  const handleAddParticipation = (student: Student, type: "participo" | "destacado") => {
    if (!user || !activeClassroom || !classId) return;
    const points = type === "participo" ? pointsConfig.participo : pointsConfig.destacado;
    const label = type === "participo" ? "Participó" : "Destacado";

    const newLog: ParticipationLog = {
      id: uid("ptlog"),
      student_id: student.id,
      type,
      label,
      points,
      timestamp: new Date().toISOString()
    };

    setParticipationData((prev) => {
      const studentData = prev[student.id] || { points: 0, logs: [] };
      const nextStudentData = {
        points: Math.max(0, studentData.points + points),
        logs: [...studentData.logs, newLog]
      };
      const nextState = {
        ...prev,
        [student.id]: nextStudentData
      };
      try {
        localStorage.setItem(`plx:part_${classId}_${todayStr}`, JSON.stringify(nextState));
      } catch (e) {}
      return nextState;
    });

    // Celebratory Animations
    if (type === "participo") {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#34d399', '#10b981', '#059669', '#ecfdf5']
      });
      toast.success(`Participación registrada (+${points}) para ${student.nombre}`);
    } else {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
        shapes: ['star', 'circle'],
        colors: ['#FDE047', '#EAB308', '#CA8A04', '#FEF08A'],
        scalar: 1.2
      });
      toast.success(`¡${student.nombre} es destacado (+${points})! 🌟`);
    }
  };

  // Undo Last Action for Student
  const handleUndoLastParticipation = (studentId: string) => {
    const studentData = participationData[studentId];
    if (!studentData || !studentData.logs || studentData.logs.length === 0) {
      toast.error("No hay acciones recientes para deshacer.");
      return;
    }

    const lastLog = studentData.logs[studentData.logs.length - 1];
    const nextLogs = studentData.logs.slice(0, -1);
    const nextPoints = Math.max(0, studentData.points - lastLog.points);

    setParticipationData((prev) => {
      const nextState = {
        ...prev,
        [studentId]: {
          points: nextPoints,
          logs: nextLogs
        }
      };
      if (classId) {
        try {
          localStorage.setItem(`plx:part_${classId}_${todayStr}`, JSON.stringify(nextState));
        } catch (e) {}
      }
      return nextState;
    });

    toast.info("Acción deshecha correctamente.");
  };

  // Save Quick Anecdotal Note from modal
  const handleSaveQuickAnecdotal = () => {
    if (!selectedStudentForAnecdotal || !anecdotalNoteText.trim() || !user) return;
    const record: AnecdotalRecord = {
      id: uid("rec"),
      classroom_id: selectedStudentForAnecdotal.classroom_id,
      student_id: selectedStudentForAnecdotal.id,
      docente_id: user.id,
      fecha: todayStr,
      hecho: anecdotalNoteText.trim(),
      estado: "guardado",
      creado_en: new Date().toISOString()
    };
    saveAnecdotalRecord(record);
    toast.success(`Nota guardada para ${selectedStudentForAnecdotal.nombre}`);
    setSelectedStudentForAnecdotal(null);
    setAnecdotalNoteText("");
  };

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

  // Format timer
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsTimerActive(!isTimerActive);
  const resetTimer = () => {
    setIsTimerActive(false);
    setTimerSeconds(120);
  };

  // Filtered students for search
  const filteredStudents = useMemo(() => {
    return students.filter(s =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.apellido && s.apellido.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [students, searchTerm]);

  // Leaderboard ranked list
  const rankedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const pA = participationData[a.id]?.points || 0;
      const pB = participationData[b.id]?.points || 0;
      return pB - pA;
    });
  }, [students, participationData]);

  if (!user || !activeClassroom) return null;

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <Toaster position="top-center" richColors />

      <div className="flex flex-col gap-6 w-full text-left">
        {/* Header con Dropdown de Aulas */}
        <div className="flex flex-col gap-4 text-center relative pb-4 border-b border-slate-100 print:hidden mb-6 mt-4">
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
              Registro dinámico de participación, marcador de clase y herramientas pedagógicas en tiempo real.
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

        {/* View Switcher Tabs */}
        <div className="flex justify-center mb-6 print:hidden">
          <div className="bg-slate-100/90 p-1.5 rounded-2xl flex flex-wrap items-center justify-center gap-1.5 shadow-inner border border-slate-200/60">
            <button 
              onClick={() => setActiveTab("participacion")}
              className={`px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === "participacion"
                  ? "bg-white text-[#1e88e5] shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Participación en clases
            </button>
            <button 
              onClick={() => setActiveTab("marcador")}
              className={`px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "marcador" 
                  ? "bg-white text-amber-600 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              Marcador en Vivo
            </button>
            <button 
              onClick={() => setActiveTab("herramientas")}
              className={`px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "herramientas" 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Herramientas de Clase
            </button>
          </div>
        </div>

        {/* TAB 1: PARTICIPACIÓN EN CLASES */}
        {activeTab === "participacion" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Control Bar: Student Count, Ajustar Puntos, Search Input */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-blue-50/80 text-[#1e88e5] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100/60 shadow-2xs">
                  <Users className="h-4 w-4" />
                  <span>{filteredStudents.length} {filteredStudents.length === 1 ? "Estudiante" : "Estudiantes"}</span>
                </div>
                <button
                  onClick={() => setIsPointsModalOpen(true)}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-extrabold transition-all border border-slate-200 shadow-2xs flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span>Ajustar Puntos</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#1e88e5] focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Students Participation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const studentData = participationData[student.id] || { points: 0, logs: [] };
                  const hasLogs = studentData.logs && studentData.logs.length > 0;

                  return (
                    <div 
                      key={student.id} 
                      className="bg-white border border-slate-200/80 rounded-3xl p-5 relative flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group select-none"
                    >
                      {/* Order Badge (Top-Left) */}
                      <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-700 font-black text-xs">
                        {student.numero_orden}
                      </div>

                      {/* Top-Right Action Icons */}
                      <div className="absolute top-4 right-4 flex items-center gap-1">
                        {hasLogs && (
                          <button
                            onClick={() => handleUndoLastParticipation(student.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Deshacer última participación"
                          >
                            <Undo2 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedStudentForAnecdotal(student)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                          title="Añadir nota anecdótica"
                        >
                          <MessageSquare size={17} />
                        </button>
                      </div>

                      {/* Central Participation Badge */}
                      <div className="flex flex-col items-center gap-2 pt-2">
                        <div 
                          className="w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-md border-4 border-white transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundColor: '#1e88e5' }}
                          title="Puntos de Participación"
                        >
                          <span className="text-[7.5px] font-black leading-none opacity-90 uppercase tracking-widest">Part.</span>
                          <span className="text-base font-black leading-tight">{studentData.points}</span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-[15px] text-slate-850 leading-tight">
                            {student.nombre} {student.apellido || ""}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                            REGISTRO DEL DÍA: {todayFormatted}
                          </p>
                        </div>
                      </div>

                      {/* Participation Action Buttons: ONLY Participó +1 and Destacado +3 */}
                      <div className="flex items-center justify-center gap-2.5 w-full pt-1">
                        <button
                          onClick={() => handleAddParticipation(student, "participo")}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] font-extrabold transition-all active:scale-95 bg-emerald-50/80 border-emerald-200/80 text-emerald-700 hover:bg-emerald-100/80 shadow-2xs cursor-pointer"
                        >
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>Participó</span>
                          <span className="text-[10.5px] font-black px-1.5 py-0.5 rounded-md bg-emerald-200/60 text-emerald-800">
                            +{pointsConfig.participo}
                          </span>
                        </button>

                        <button
                          onClick={() => handleAddParticipation(student, "destacado")}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] font-extrabold transition-all active:scale-95 bg-amber-50/80 border-amber-200/80 text-amber-800 hover:bg-amber-100/80 shadow-2xs cursor-pointer"
                        >
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                          <span>Destacado</span>
                          <span className="text-[10.5px] font-black px-1.5 py-0.5 rounded-md bg-amber-200/60 text-amber-900">
                            +{pointsConfig.destacado}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-6">
                  <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-base font-extrabold text-slate-700">No se encontraron estudiantes</h4>
                  <p className="text-xs font-bold text-slate-400 mt-1">Prueba ajustando el término de búsqueda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MARCADOR EN VIVO (LEADERBOARD CARD - TROPHY UI) */}
        {activeTab === "marcador" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Trophy UI Leaderboard Card Container */}
            {rankedStudents.length >= 3 && (
              <div className="bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 border border-amber-200/60 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100/90 border border-amber-200 flex items-center justify-center shadow-2xs mx-auto mb-2 text-amber-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-amber-950 uppercase tracking-wider">
                    PODIO DE PARTICIPACIÓN DE HOY
                  </h3>
                  <p className="text-xs text-amber-800/70 font-semibold mt-1">
                    Estudiantes destacados en la clase en vivo del {todayFormatted}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-lg mx-auto pt-2 relative z-10">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-1.5">
                      <img
                        src={getStudentAvatarUrl(rankedStudents[1])}
                        alt={rankedStudents[1]?.nombre}
                        className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-300 object-cover shadow-sm"
                      />
                      <span className="absolute -top-1 -right-1 bg-slate-200 text-slate-700 border border-slate-300 rounded-full p-1 shadow-2xs">
                        <Medal className="h-3.5 w-3.5 text-slate-600" />
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 line-clamp-1 text-center max-w-[100px]">
                      {rankedStudents[1]?.nombre}
                    </span>
                    <span className="text-[10.5px] font-black text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-full border border-slate-200 mt-1 shadow-2xs">
                      {participationData[rankedStudents[1]?.id]?.points || 0} pts
                    </span>
                    <div className="w-full h-24 bg-gradient-to-t from-slate-300 via-slate-250 to-slate-200/90 rounded-t-3xl mt-3 flex items-center justify-center text-slate-700 font-black text-xl shadow-inner border-t border-slate-200">
                      2°
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-1.5">
                      <img
                        src={getStudentAvatarUrl(rankedStudents[0])}
                        alt={rankedStudents[0]?.nombre}
                        className="w-18 h-18 rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 border-3 border-amber-400 object-cover shadow-md"
                      />
                      <span className="absolute -top-1.5 -right-1 bg-amber-400 text-amber-950 border border-amber-500 rounded-full p-1 shadow-xs">
                        <Trophy className="h-4 w-4 text-amber-900" />
                      </span>
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 border border-amber-500 text-[9px] font-black px-2 py-0.2 rounded-full shadow-2xs uppercase whitespace-nowrap">
                        N° 1
                      </span>
                    </div>
                    <span className="text-sm font-black text-amber-950 line-clamp-1 text-center max-w-[120px]">
                      {rankedStudents[0]?.nombre}
                    </span>
                    <span className="text-xs font-black text-amber-900 bg-amber-200/90 px-3 py-0.5 rounded-full border border-amber-300 mt-1 shadow-2xs">
                      {participationData[rankedStudents[0]?.id]?.points || 0} pts
                    </span>
                    <div className="w-full h-32 bg-gradient-to-t from-amber-400 via-amber-350 to-amber-300 rounded-t-3xl mt-3 flex items-center justify-center text-amber-950 font-black text-2xl shadow-sm border-t border-amber-200">
                      1°
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-1.5">
                      <img
                        src={getStudentAvatarUrl(rankedStudents[2])}
                        alt={rankedStudents[2]?.nombre}
                        className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-700/30 object-cover shadow-sm"
                      />
                      <span className="absolute -top-1 -right-1 bg-amber-200/90 text-amber-900 border border-amber-300 rounded-full p-1 shadow-2xs">
                        <Award className="h-3.5 w-3.5 text-amber-800" />
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 line-clamp-1 text-center max-w-[100px]">
                      {rankedStudents[2]?.nombre}
                    </span>
                    <span className="text-[10.5px] font-black text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-200 mt-1 shadow-2xs">
                      {participationData[rankedStudents[2]?.id]?.points || 0} pts
                    </span>
                    <div className="w-full h-20 bg-gradient-to-t from-amber-700/30 via-amber-700/20 to-amber-700/15 rounded-t-3xl mt-3 flex items-center justify-center text-amber-900 font-black text-lg shadow-inner border-t border-amber-300/40">
                      3°
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ranking List Table Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest px-2">
                TABLA DE POSICIONES COMPLETA
              </h3>
              <div className="divide-y divide-slate-100">
                {rankedStudents.map((st, index) => {
                  const pts = participationData[st.id]?.points || 0;
                  const logs = participationData[st.id]?.logs || [];
                  return (
                    <div key={st.id} className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-slate-50/80 rounded-2xl transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-2xs shrink-0 ${
                          index === 0 ? "bg-amber-400 text-amber-950 border border-amber-500/50" : index === 1 ? "bg-slate-300 text-slate-800 border border-slate-400/50" : index === 2 ? "bg-amber-700/30 text-amber-950 border border-amber-800/30" : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {index + 1}
                        </span>

                        {/* Student Avatar */}
                        <img 
                          src={getStudentAvatarUrl(st)} 
                          alt={st.nombre}
                          className="w-9 h-9 rounded-full border border-slate-200 object-cover bg-slate-100 shrink-0 shadow-2xs"
                        />

                        <div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-850">{st.nombre} {st.apellido || ""}</h4>
                          <span className="text-[10px] text-slate-400 font-extrabold">N° {st.numero_orden} · {logs.length} participaciones</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-[#1e88e5] bg-blue-50/80 px-3.5 py-1.5 rounded-xl border border-blue-100 shadow-2xs">
                          {pts} pto(s)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HERRAMIENTAS DE CLASE (RULETA & TEMPORIZADOR & MONITOR) */}
        {activeTab === "herramientas" && (
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
                  className="flex-1 bg-brand-primary hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-[13px] px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5 border-none cursor-pointer shadow-sm transition-all active:scale-98 select-none"
                >
                  <RefreshCw className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} /> Girar Ruleta
                </button>

                {pickedStudent && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAddParticipation(pickedStudent, "participo")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] px-4 py-2.5 rounded-full flex items-center gap-1.5 border-none cursor-pointer shadow-sm transition-colors active:scale-98 select-none"
                      title="Registrar participación"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Participó
                    </button>
                    <button
                      onClick={() => handleAddParticipation(pickedStudent, "destacado")}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[13px] px-4 py-2.5 rounded-full flex items-center gap-1.5 border-none cursor-pointer shadow-sm transition-colors active:scale-98 select-none"
                      title="Registrar destacado"
                    >
                      <Star className="h-4 w-4 fill-white" /> Destacado
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

              {/* Real Noise Monitor Card (Web Audio API) */}
              <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm flex flex-col justify-between flex-1 min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className={`h-4.5 w-4.5 ${noiseLevel > 60 ? 'text-rose-500' : noiseLevel > 30 ? 'text-amber-500' : 'text-emerald-500'}`} />
                      Monitor de Ruido en Tiempo Real
                    </h3>
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isMicActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                      {isMicActive ? "Micrófono En Vivo 🔴" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400">
                    Captura el nivel de volumen y ruido en el aula a través del micrófono del dispositivo.
                  </p>
                </div>

                {/* Real-time Equalizer Bars */}
                <div className="my-4 flex items-end justify-center gap-1.5 h-20 px-4 bg-slate-50/70 rounded-2xl border border-slate-100 py-3">
                  {barHeights.map((height, bIdx) => (
                    <div
                      key={bIdx}
                      style={{ height: `${isMicActive ? height : 12}%` }}
                      className={`w-2.5 rounded-full transition-all duration-75 bg-gradient-to-t ${
                        height > 65
                          ? 'from-rose-400 to-rose-600'
                          : height > 35
                            ? 'from-amber-400 to-amber-500'
                            : 'from-emerald-400 to-emerald-500'
                      }`}
                    />
                  ))}
                </div>

                {/* Dynamic Status Badge & Button */}
                <div className="space-y-3">
                  <div className="text-center">
                    {!isMicActive ? (
                      <span className="text-[10.5px] font-extrabold text-slate-500 bg-slate-100 px-3.5 py-1 rounded-full border border-slate-200">
                        Haz clic abajo para activar la medición
                      </span>
                    ) : noiseLevel > 60 ? (
                      <span className="text-[10.5px] font-black uppercase tracking-wider px-3.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full shadow-2xs">
                        ¡Mucho Ruido en Aula! 🚨 ({noiseLevel}%)
                      </span>
                    ) : noiseLevel > 30 ? (
                      <span className="text-[10.5px] font-black uppercase tracking-wider px-3.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full shadow-2xs">
                        Ruido Moderado ⚠️ ({noiseLevel}%)
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-black uppercase tracking-wider px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full shadow-2xs">
                        Concentración Óptima / Silencio ✅ ({noiseLevel}%)
                      </span>
                    )}
                  </div>

                  <button
                    onClick={isMicActive ? stopNoiseMonitor : startNoiseMonitor}
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                      isMicActive
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isMicActive ? (
                      <>
                        <MicOff size={15} /> Detener Monitor de Ruido
                      </>
                    ) : (
                      <>
                        <Mic size={15} /> Activar Micrófono Real
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: AJUSTE DE PUNTOS DE PARTICIPACIÓN */}
      {isPointsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">Ajuste de Puntos de Participación</h3>
              <button
                onClick={() => setIsPointsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4">
                <p className="text-xs font-bold text-amber-900 leading-relaxed">
                  Ajusta el valor que tendrá cada acción durante la clase de hoy. Lo que asignes aquí alimentará el &quot;Marcador en Vivo&quot; al instante.
                </p>
              </div>

              {/* Option 1: Participó */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">Participó</h4>
                    <span className="text-[10px] text-slate-400 font-bold">Respuesta regular en clase</span>
                  </div>
                </div>
                <input
                  type="number"
                  value={tempParticipo}
                  onChange={(e) => setTempParticipo(Number(e.target.value))}
                  className="w-16 h-10 text-center font-black text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-[#1e88e5] outline-none"
                />
              </div>

              {/* Option 2: Destacado */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Star size={20} className="fill-amber-500 text-amber-500" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">Destacado</h4>
                    <span className="text-[10px] text-slate-400 font-bold">Aporte excelente o brillante</span>
                  </div>
                </div>
                <input
                  type="number"
                  value={tempDestacado}
                  onChange={(e) => setTempDestacado(Number(e.target.value))}
                  className="w-16 h-10 text-center font-black text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-[#1e88e5] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setIsPointsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePointsConfig}
                className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-[#1e88e5] hover:bg-blue-600 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Listo, guardar para esta asignatura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOTA ANECDÓTICA RÁPIDA */}
      {selectedStudentForAnecdotal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">
                Observación: {selectedStudentForAnecdotal.nombre}
              </h3>
              <button
                onClick={() => setSelectedStudentForAnecdotal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <label className="text-xs font-extrabold text-slate-700">Hecho u Observación de la Clase:</label>
              <textarea
                value={anecdotalNoteText}
                onChange={(e) => setAnecdotalNoteText(e.target.value)}
                placeholder="Escribe un comentario sobre el desempeño del estudiante hoy en clase..."
                className="w-full h-28 p-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#1e88e5] focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setSelectedStudentForAnecdotal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuickAnecdotal}
                className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-[#1e88e5] hover:bg-blue-600 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Guardar Observación
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
