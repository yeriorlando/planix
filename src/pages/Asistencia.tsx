import React, { useState, useMemo, useEffect, useRef, Component } from "react";
import { createPortal } from "react-dom";
import { 
  Calendar as CalendarIcon, Check, X, AlertCircle, Clock, Save, 
  ArrowRight, UserCheck, TrendingUp, Printer, ChevronLeft, ChevronRight, 
  BookOpen, Sparkles, Users, Info, RefreshCw, AlertTriangle, GraduationCap,
  Eraser, RotateCcw, Minimize, Maximize, ZoomIn, ZoomOut, ArrowLeft, ChevronDown,
  Grid, List
} from "lucide-react";
import { useRequireAuth } from "../lib/useRequireAuth";
import { consumeCredits, getCreditInfo } from "../lib/credits";
import ModalCreditos from "../components/ai/ModalCreditos";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { 
  getClassrooms, 
  getAllClassroomsAdmin, 
  getStudents, 
  getAttendance, 
  syncAttendanceFromServer,
  saveAttendance, 
  Student, 
  Attendance, 
  Classroom,
  getStudentAvatar
} from "../lib/storage";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isWeekend, 
  addDays, 
  subDays,
  isSameMonth,
  startOfWeek,
  addMonths,
  subMonths
} from "date-fns";
import { es } from "date-fns/locale";
import { toast, Toaster } from "sonner";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState;
  props: ErrorBoundaryProps;
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-800 rounded-xl m-6 border border-red-200">
          <h2 className="text-lg font-bold mb-2">¡Error en Asistencia!</h2>
          <pre className="text-xs overflow-auto font-mono whitespace-pre-wrap">{this.state.error?.stack || this.state.error?.message || String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const STATUS_CONFIG = {
  P: { label: "Presente", color: "bg-emerald-500 text-white", text: "text-emerald-600", border: "border-emerald-200 bg-emerald-50/20", char: "P", value: "P" },
  A: { label: "Ausente", color: "bg-red-500 text-white", text: "text-red-600", border: "border-red-200 bg-red-50/20", char: "A", value: "A" },
  T: { label: "Tarde", color: "bg-amber-400 text-[#1B1B1B]", text: "text-amber-600", border: "border-amber-200 bg-amber-50/20", char: "T", value: "T" },
  E: { label: "Excusa", color: "bg-blue-500 text-white", text: "text-blue-600", border: "border-blue-200 bg-blue-50/20", char: "E", value: "E" },
  F: { label: "Feriado", color: "bg-pink-500 text-white", text: "text-pink-600", border: "border-pink-200 bg-pink-50/20", char: "F", value: "F" },
  G: { label: "Grupo Pedagógico", color: "bg-purple-500 text-white", text: "text-purple-600", border: "border-purple-200 bg-purple-50/20", char: "G", value: "G" },
};

const CARD_STYLES = {
  P: {
    cardBg: "bg-[#EAFBEA] dark:bg-emerald-950/25",
    border: "border-[#A1E3A1] dark:border-emerald-800/80",
    text: "text-[#2E7D32] dark:text-emerald-450",
    badgeBg: "bg-[#2E7D32] dark:bg-emerald-600",
    char: "P",
    label: "Presente"
  },
  A: {
    cardBg: "bg-[#FDF2F2] dark:bg-rose-950/25",
    border: "border-[#F8B4B4] dark:border-rose-800/80",
    text: "text-[#C81E1E] dark:text-rose-450",
    badgeBg: "bg-[#C81E1E] dark:bg-rose-600",
    char: "A",
    label: "Ausente"
  },
  T: {
    cardBg: "bg-[#FEF9E6] dark:bg-amber-950/25",
    border: "border-[#FCD34D] dark:border-amber-800/80",
    text: "text-[#D97706] dark:text-amber-450",
    badgeBg: "bg-[#D97706] dark:bg-amber-600",
    char: "T",
    label: "Tardanza"
  },
  E: {
    cardBg: "bg-[#EBF5FF] dark:bg-blue-950/25",
    border: "border-[#93C5FD] dark:border-blue-800/80",
    text: "text-[#1E3A8A] dark:text-blue-400",
    badgeBg: "bg-[#1E3A8A] dark:bg-blue-600",
    char: "E",
    label: "Justificado"
  }
};

const WEEK_COLORS = [
  "bg-blue-50/30 dark:bg-blue-950/10",
  "bg-emerald-50/30 dark:bg-emerald-950/10",
  "bg-amber-50/30 dark:bg-amber-950/10",
  "bg-rose-50/30 dark:bg-rose-950/10",
  "bg-indigo-50/30 dark:bg-indigo-950/10"
];

const generateAcademicMonths = (academicYearStr: string) => {
  const years = academicYearStr ? academicYearStr.split('-') : ['2025', '2026'];
  const startYear = parseInt(years[0]) || 2025;
  const endYear = parseInt(years[1]) || 2026;

  const months = [
    { month: 8, year: startYear, label: 'Agosto' },
    { month: 9, year: startYear, label: 'Septiembre' },
    { month: 10, year: startYear, label: 'Octubre' },
    { month: 11, year: startYear, label: 'Noviembre' },
    { month: 12, year: startYear, label: 'Diciembre' },
    { month: 1, year: endYear, label: 'Enero' },
    { month: 2, year: endYear, label: 'Febrero' },
    { month: 3, year: endYear, label: 'Marzo' },
    { month: 4, year: endYear, label: 'Abril' },
    { month: 5, year: endYear, label: 'Mayo' },
    { month: 6, year: endYear, label: 'Junio' },
  ];

  return months.map(m => {
    const endDay = new Date(m.year, m.month, 0).getDate();
    return {
      start: `${m.year}-${String(m.month).padStart(2, '0')}-01`,
      end: `${m.year}-${String(m.month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,
      label: m.label,
      month: m.month,
      year: m.year
    };
  });
};

function Asistencia() {
  const user = useRequireAuth();
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const dateInputRef = useRef<HTMLInputElement>(null);
  const monthInputRef = useRef<HTMLInputElement>(null);

  // Classrooms selection
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
  const [activeSchoolYear, setActiveSchoolYear] = useState(() => localStorage.getItem('plx:active_school_year') || '2025-2026');

  useEffect(() => {
    const handleYearChanged = () => {
      setActiveSchoolYear(localStorage.getItem('plx:active_school_year') || '2025-2026');
    };
    if (typeof window !== "undefined") {
      window.addEventListener("plx:active_school_year_changed", handleYearChanged);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("plx:active_school_year_changed", handleYearChanged);
      }
    };
  }, []);

  // Active View Tab: diaria, mensual, anual
  const [activeView, setActiveView] = useState<"diaria" | "mensual" | "anual">("diaria");
  
  // Monthly view states
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [hoveredStudent, setHoveredStudent] = useState<{ name: string; x: number; y: number } | null>(null);
  const [hasUnsavedMonthlyChanges, setHasUnsavedMonthlyChanges] = useState(false);
  const [showCreditsExhausted, setShowCreditsExhausted] = useState(false);
  const [creditsExhaustedInfo, setCreditsExhaustedInfo] = useState({ required: 5, current: 0 });

  // Date selection (Daily View)
  const [attendanceDate, setAttendanceDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Current month (Monthly View)
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  // Classroom data
  const [students, setStudents] = useState<Student[]>([]);
  const [allAttendance, setAllAttendance] = useState<Attendance[]>([]);
  
  // Day type: regular, feriado, grupo_pedagogico
  const [dayType, setDayType] = useState<"regular" | "feriado" | "grupo_pedagogico">("regular");

  // Sync URL classId with activeClassId
  useEffect(() => {
    if (classId) {
      setActiveClassId(classId);
    }
  }, [classId]);

  // Load classrooms
  useEffect(() => {
    if (!user) return;
    const data = user.rol === "admin" ? getAllClassroomsAdmin() : getClassrooms(user.id);
    setClassrooms(data);
  }, [user]);

  // Redirect if classId is missing from the URL
  useEffect(() => {
    if (classrooms.length > 0 && !classId) {
      const savedClassId = localStorage.getItem('activeClassId');
      const targetId = (savedClassId && classrooms.some(c => c.id === savedClassId)) 
        ? savedClassId 
        : classrooms[0].id;
      navigate(`/aula-virtual/asistencia/${targetId}`, { replace: true });
    }
  }, [classrooms, classId, navigate]);

  // Sync activeClassId to localStorage
  useEffect(() => {
    if (activeClassId) {
      localStorage.setItem('activeClassId', activeClassId);
    }
  }, [activeClassId]);

  const activeClassroom = useMemo(() => {
    return classrooms.find(c => c.id === activeClassId) || null;
  }, [classrooms, activeClassId]);

  // Load students and attendance records
  const loadData = () => {
    if (activeClassId) {
      setStudents(getStudents(activeClassId).sort((a, b) => a.numero_orden - b.numero_orden));
      
      // Load from localStorage instantly
      const localAttendance = getAttendance(activeClassId);
      setAllAttendance(localAttendance);
      
      // Sync from Supabase server in the background
      syncAttendanceFromServer(activeClassId)
        .then((remoteAttendance) => {
          setAllAttendance(remoteAttendance);
        })
        .catch((err) => {
          console.error("Error loading attendance from server:", err);
        });
    } else {
      setStudents([]);
      setAllAttendance([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeClassId]);

  // Find attendance record for selected date
  const currentRecord = useMemo(() => {
    return allAttendance.find(a => a.fecha === attendanceDate) || null;
  }, [allAttendance, attendanceDate]);

  useEffect(() => {
    if (currentRecord) {
      setDayType(currentRecord.tipo_dia || "regular");
    } else {
      setDayType("regular");
    }
  }, [currentRecord, attendanceDate]);

  // In-memory draft for the selected day's checklist
  const [draftRegister, setDraftRegister] = useState<Record<string, "P" | "A" | "T" | "E">>({});

  // Daily view layout switcher
  const [dailyLayout, setDailyLayout] = useState<"grid" | "list">("grid");

  // Format date in Spanish
  const formattedDate = useMemo(() => {
    const dateObj = new Date(attendanceDate + "T12:00:00");
    const base = format(dateObj, "EEEE d 'de' MMMM, yyyy", { locale: es });
    return base.charAt(0).toUpperCase() + base.slice(1);
  }, [attendanceDate]);

  const isToday = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return attendanceDate === todayStr;
  }, [attendanceDate]);

  // Attendance counts summary
  const counts = useMemo(() => {
    let p = 0, a = 0, t = 0, e = 0;
    students.forEach(st => {
      const status = draftRegister[st.id] || "P";
      if (status === "P") p++;
      else if (status === "A") a++;
      else if (status === "T") t++;
      else if (status === "E") e++;
    });
    return { p, a, t, e };
  }, [students, draftRegister]);

  // Cycle status for student card click (P -> A -> T -> E -> P)
  const cycleStatus = (studentId: string) => {
    if (dayType !== "regular") return;
    const currentStatus = draftRegister[studentId] || "P";
    const nextStatusMap: Record<"P" | "A" | "T" | "E", "P" | "A" | "T" | "E"> = {
      P: "A",
      A: "T",
      T: "E",
      E: "P",
    };
    setStatus(studentId, nextStatusMap[currentStatus]);
  };

  // Sync draft when students or date record changes
  useEffect(() => {
    if (currentRecord) {
      setDraftRegister(currentRecord.registro);
    } else {
      const initial: Record<string, "P" | "A" | "T" | "E"> = {};
      students.forEach(s => {
        initial[s.id] = "P"; // Default Presente
      });
      setDraftRegister(initial);
    }
  }, [currentRecord, students, attendanceDate]);

  // Handle single student status change (highly optimized, instant response)
  const setStatus = (studentId: string, status: "P" | "A" | "T" | "E") => {
    const updated = { ...draftRegister, [studentId]: status };
    
    // 1. Instantly update draft state
    setDraftRegister(updated);

    // 2. Optimistically update allAttendance in-memory state so currentRecord remains in sync synchronously
    if (activeClassId) {
      const recordId = currentRecord?.id || `att_${activeClassId}_${attendanceDate}`;
      const record = {
        id: recordId,
        classroom_id: activeClassId,
        fecha: attendanceDate,
        registro: updated,
        tipo_dia: dayType,
      };

      setAllAttendance(prev => {
        const index = prev.findIndex(r => r.fecha === attendanceDate);
        if (index >= 0) {
          const newAll = [...prev];
          newAll[index] = record;
          return newAll;
        } else {
          return [...prev, record];
        }
      });

      // 3. Save to localStorage without blocking the UI thread
      saveAttendance(record);
    }
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const updated: Record<string, "P" | "A" | "T" | "E"> = {};
    students.forEach(s => {
      updated[s.id] = "P";
    });
    setDraftRegister(updated);

    if (activeClassId) {
      const recordId = currentRecord?.id || `att_${activeClassId}_${attendanceDate}`;
      saveAttendance({
        id: recordId,
        classroom_id: activeClassId,
        fecha: attendanceDate,
        registro: updated,
        tipo_dia: dayType,
      });
      toast.success("Todos los estudiantes marcados como Presente.");
      loadData();
    }
  };

  // Change day type
  const handleSetDayType = (type: "regular" | "feriado" | "grupo_pedagogico") => {
    setDayType(type);
    if (activeClassId) {
      const recordId = currentRecord?.id || `att_${activeClassId}_${attendanceDate}`;
      saveAttendance({
        id: recordId,
        classroom_id: activeClassId,
        fecha: attendanceDate,
        registro: draftRegister,
        tipo_dia: type,
      });
      toast.success(`Día marcado como: ${type === "regular" ? "Clase regular" : type === "feriado" ? "Feriado" : "Grupo pedagógico"}`);
      loadData();
    }
  };

  // Save manual attendance trigger (just for feedback, since we autosave)
  const handleSaveAll = () => {
    if (activeClassId) {
      const recordId = currentRecord?.id || `att_${activeClassId}_${attendanceDate}`;
      saveAttendance({
        id: recordId,
        classroom_id: activeClassId,
        fecha: attendanceDate,
        registro: draftRegister,
        tipo_dia: dayType,
      });
      toast.success("¡Asistencia del día guardada correctamente!");
      loadData();
    }
  };

  // Shifting dates
  const shiftDateByAmount = (amount: number) => {
    const current = new Date(attendanceDate + "T12:00:00");
    const next = amount > 0 ? addDays(current, amount) : subDays(current, Math.abs(amount));
    setAttendanceDate(next.toISOString().split("T")[0]);
  };

  // Reset unsaved changes when changing class, month or date
  useEffect(() => {
    setHasUnsavedMonthlyChanges(false);
  }, [activeClassId, currentMonth, attendanceDate]);

  const monthlyAttendance = useMemo(() => {
    if (!activeClassId) return {};

    const startStr = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const endStr = format(endOfMonth(currentMonth), "yyyy-MM-dd");

    const map: Record<string, { registro: Record<string, "P" | "A" | "T" | "E">; tipo_dia: "regular" | "feriado" | "grupo_pedagogico" }> = {};

    allAttendance.forEach((att) => {
      if (att.fecha >= startStr && att.fecha <= endStr) {
        map[att.fecha] = {
          registro: { ...att.registro },
          tipo_dia: att.tipo_dia || "regular"
        };
      }
    });

    return map;
  }, [activeClassId, currentMonth, allAttendance]);

  const currentMonthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const currentMonthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

  const weeks = useMemo(() => {
    const w: { index: number; days: Date[] }[] = [];
    const firstDay = currentMonthStart;
    let startGridDate: Date;

    if (isWeekend(firstDay)) {
      startGridDate = startOfWeek(addDays(firstDay, (8 - firstDay.getDay()) % 7), { weekStartsOn: 1 });
    } else {
      startGridDate = startOfWeek(firstDay, { weekStartsOn: 1 });
    }

    let runnerDate = startGridDate;

    for (let i = 0; i < 5; i++) {
      const weekDays = [];
      for (let d = 0; d < 5; d++) {
        const date = addDays(runnerDate, d);
        weekDays.push(date);
      }
      w.push({ index: i, days: weekDays });
      runnerDate = addDays(runnerDate, 7);
    }
    return w;
  }, [currentMonthStart]);

  const ordinals = ["1ra", "2da", "3ra", "4ta", "5ta"];

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: currentMonthStart,
      end: currentMonthEnd,
    }).filter((d) => !isWeekend(d));
  }, [currentMonthStart, currentMonthEnd]);

  const getStudentStatusOnDate = (studentId: string, dateStr: string) => {
    const dayData = monthlyAttendance[dateStr];
    if (!dayData) return null;
    if (dayData.tipo_dia === "feriado") return "F";
    if (dayData.tipo_dia === "grupo_pedagogico") return "G";
    return dayData.registro[studentId] || null;
  };

  const toggleMonthlyStatus = (studentId: string, dateStr: string) => {
    const currentStatus = getStudentStatusOnDate(studentId, dateStr);
    const sequence: ("P" | "A" | "T" | "E" | "F" | "G" | null)[] = [null, "P", "A", "T", "E", "F", "G"];
    const idx = sequence.indexOf(currentStatus as any);
    const nextStatus = sequence[(idx + 1) % sequence.length];

    setAllAttendance((prev) => {
      const existingIdx = prev.findIndex((a) => a.fecha === dateStr);
      const updated = [...prev];
      let attObj: any = null;

      if (existingIdx >= 0) {
        const rec = { ...updated[existingIdx] };
        rec.registro = { ...rec.registro };

        if (nextStatus === "F") {
          rec.tipo_dia = "feriado";
        } else if (nextStatus === "G") {
          rec.tipo_dia = "grupo_pedagogico";
        } else if (nextStatus === null) {
          rec.tipo_dia = "regular";
          delete rec.registro[studentId];
        } else {
          rec.tipo_dia = "regular";
          rec.registro[studentId] = nextStatus;
        }
        updated[existingIdx] = rec;
        attObj = rec;
      } else {
        const registro: Record<string, "P" | "A" | "T" | "E"> = {};
        let tipo_dia: "regular" | "feriado" | "grupo_pedagogico" = "regular";

        if (nextStatus === "F") {
          tipo_dia = "feriado";
        } else if (nextStatus === "G") {
          tipo_dia = "grupo_pedagogico";
        } else if (nextStatus !== null) {
          registro[studentId] = nextStatus;
        }

        attObj = {
          id: `att_${activeClassId}_${dateStr}`,
          classroom_id: activeClassId || "",
          fecha: dateStr,
          registro,
          tipo_dia,
        };
        updated.push(attObj);
      }

      // Auto-save: save updated day state directly
      if (activeClassId && attObj) {
        saveAttendance(attObj);
      }

      return updated;
    });

    setHasUnsavedMonthlyChanges(true);
  };

  const eraseMonthlyStatus = (studentId: string, dateStr: string) => {
    setAllAttendance((prev) => {
      const existingIdx = prev.findIndex((a) => a.fecha === dateStr);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const rec = { ...updated[existingIdx] };
        rec.registro = { ...rec.registro };
        delete rec.registro[studentId];
        if (rec.tipo_dia !== "regular") {
          rec.tipo_dia = "regular";
        }
        updated[existingIdx] = rec;

        // Auto-save: save updated day state directly
        if (activeClassId) {
          saveAttendance(rec);
        }

        return updated;
      }
      return prev;
    });

    setHasUnsavedMonthlyChanges(true);
  };

  const getMonthlyStatsForStudent = (studentId: string) => {
    let p = 0, t = 0, a = 0, e = 0;

    weeks.forEach((week) => {
      week.days.forEach((day) => {
        if (isSameMonth(day, currentMonth)) {
          const dateStr = format(day, "yyyy-MM-dd");
          const status = getStudentStatusOnDate(studentId, dateStr);
          if (status === "P") p++;
          if (status === "T") t++;
          if (status === "A") a++;
          if (status === "E") e++;
        }
      });
    });

    return { P: p, T: t, A: a, E: e };
  };

  const handleSaveMonthlyAttendance = () => {
    if (!activeClassId) return;

    allAttendance.forEach((attObj) => {
      saveAttendance(attObj);
    });

    setHasUnsavedMonthlyChanges(false);
    toast.success("¡Asistencia mensual guardada correctamente!");
    loadData();
  };

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(startOfMonth(newMonth));
  };

  // Zoom and Pan handlers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 400));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => {
      const next = !prev;
      if (!next) {
        setZoomLevel(100);
      }
      return next;
    });
    setScrollPos({ x: 0, y: 0 });
    setIsPanning(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFullScreen || zoomLevel <= 100 || !containerRef.current) return;
    if (e.button !== 0) return;

    setIsPanning(true);
    setStartPos({
      x: e.clientX,
      y: e.clientY,
    });
    setScrollPos({
      x: containerRef.current.scrollLeft,
      y: containerRef.current.scrollTop,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !containerRef.current) return;

    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;

    containerRef.current.scrollLeft = scrollPos.x - dx;
    containerRef.current.scrollTop = scrollPos.y - dy;
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsErasing(false);
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullScreen]);

  function AttendanceTable() {
    return (
      <table className={`w-full text-sm border-collapse table-fixed select-none print:border-black ${isEraserMode ? 'cursor-crosshair' : ''}`}>
        <colgroup>
          <col style={{ width: isFullScreen ? '100px' : '40px' }} />
          {weeks.map((_, idx) => (
            <col key={idx} span={5} style={{ width: 'auto' }} />
          ))}
          <col style={{ width: '45px' }} />
          <col style={{ width: '45px' }} />
          <col style={{ width: '45px' }} />
          <col style={{ width: '45px' }} />
        </colgroup>
        <thead>
          <tr className="bg-neutral-50/50 print:bg-transparent dark:bg-zinc-950/40">
            <th className="border-r border-b border-black p-0 align-middle print:border-black" rowSpan={2}>
              <div className="writing-vertical-simple py-2 text-[11px] font-bold flex items-center justify-center w-full dark:text-zinc-300">
                Nº de orden
              </div>
            </th>
            {weeks.map((week, idx) => (
              <th key={idx} colSpan={5} className={`py-3.5 px-1 text-center font-bold text-xs uppercase tracking-wider ${WEEK_COLORS[idx % WEEK_COLORS.length]} border-r border-b border-black text-neutral-800 dark:text-zinc-200 print:bg-transparent print:border-black week-header`}>
                {ordinals[idx]} Semana
              </th>
            ))}
            <th colSpan={4} className="py-3.5 px-1 text-center font-bold text-xs uppercase tracking-wider bg-neutral-100 border-b border-black text-neutral-800 dark:text-zinc-200 print:bg-transparent print:border-black dark:bg-zinc-800">
              Resumen del mes
            </th>
          </tr>
          <tr className="bg-neutral-50/50 print:bg-transparent dark:bg-zinc-950/40">
            {weeks.map((week, idx) => (
              week.days.map((day, dIdx) => (
                <th key={`${idx}-${dIdx}`} className={`p-0 border-r border-b border-black font-bold text-[10px] vertical-header ${WEEK_COLORS[idx % WEEK_COLORS.length]} print:bg-transparent print:border-black`}>
                  <div 
                    style={{ height: "95px" }}
                    className="writing-vertical-simple flex items-center justify-center print:text-black dark:text-zinc-300"
                  >
                    {((dayName) => dayName.charAt(0).toUpperCase() + dayName.slice(1))(format(day, 'EEEE', { locale: es }))}
                  </div>
                </th>
              ))
            ))}
            <th className="bg-emerald-50/50 dark:bg-emerald-950/30 p-0 border-r border-b border-black vertical-header print:bg-transparent print:border-black" rowSpan={2}>
              <div 
                style={{ height: "95px" }}
                className="writing-vertical-simple text-[9.5px] uppercase tracking-wider flex items-center justify-center font-bold text-emerald-700/80 print:text-black dark:text-emerald-400"
              >
                Presente
              </div>
            </th>
            <th className="bg-amber-50/50 dark:bg-amber-950/30 p-0 border-r border-b border-black vertical-header print:bg-transparent print:border-black" rowSpan={2}>
              <div 
                style={{ height: "95px" }}
                className="writing-vertical-simple text-[9.5px] uppercase tracking-wider flex items-center justify-center font-bold text-amber-700/80 print:text-black dark:text-amber-400"
              >
                Tardanza
              </div>
            </th>
            <th className="bg-rose-50/50 dark:bg-rose-950/30 p-0 border-r border-b border-black vertical-header print:bg-transparent print:border-black" rowSpan={2}>
              <div 
                style={{ height: "95px" }}
                className="writing-vertical-simple text-[9.5px] uppercase tracking-wider flex items-center justify-center font-bold text-rose-700/80 print:text-black dark:text-rose-400"
              >
                Ausente
              </div>
            </th>
            <th className="bg-blue-50/50 dark:bg-blue-950/30 p-0 border-r border-b border-black vertical-header print:bg-transparent print:border-black" rowSpan={2}>
              <div 
                style={{ height: "95px" }}
                className="writing-vertical-simple text-[9.5px] uppercase tracking-wider flex items-center justify-center font-bold text-blue-700/80 print:text-black dark:text-blue-400"
              >
                Excusa
              </div>
            </th>
          </tr>
          <tr className="bg-white dark:bg-zinc-950">
            <th className="border-r border-b border-black font-bold text-[9px] bg-neutral-50 dark:bg-zinc-900 print:bg-transparent print:border-black uppercase px-1 fecha-header dark:text-zinc-300">
              Fecha
            </th>
            {weeks.map((week, wIdx) => {
              return week.days.map((dayObj, dIdx) => {
                const isSameMonthDay = isSameMonth(dayObj, currentMonth);
                return (
                  <th key={`${wIdx}-${dIdx}`} className={`border-r border-b border-black font-bold text-[10px] ${WEEK_COLORS[wIdx % WEEK_COLORS.length]} print:bg-transparent print:border-black h-8 relative dark:text-zinc-300`}>
                    {isSameMonthDay ? format(dayObj, 'dd') : ''}
                  </th>
                );
              });
            })}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-950">
          {students.map((student, sIdx) => {
            const stats = getMonthlyStatsForStudent(student.id);
            const isGrayRow = sIdx % 2 !== 0;
            const fullName = student.nombre;

            return (
              <tr
                key={student.id}
                className={`border-b border-black/10 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors group ${sIdx % 2 === 0 ? 'bg-white dark:bg-zinc-950' : 'bg-neutral-50/40 dark:bg-zinc-900/40'} print:border-black h-[38px] print:h-auto`}
                onMouseEnter={(e) => {
                  setHoveredStudent({
                    name: fullName,
                    x: e.clientX,
                    y: e.clientY
                  });
                }}
                onMouseMove={(e) => {
                  setHoveredStudent({
                    name: fullName,
                    x: e.clientX,
                    y: e.clientY
                  });
                }}
                onMouseLeave={() => setHoveredStudent(null)}
              >
                <td
                  className={`p-0 text-center font-bold border-r border-black/20 text-[12px] group-hover:bg-blue-100 group-hover:text-blue-600 transition-all cursor-help relative group/number ${sIdx % 2 === 0 ? 'bg-white dark:bg-zinc-950' : 'bg-neutral-50/80 dark:bg-zinc-900/80'} ${isGrayRow ? 'print-gray-row' : ''} print:border-black print:text-black dark:text-zinc-300`}
                >
                  {student.numero_orden}
                </td>
                {weeks.map((week, wIdx) => {
                  const bgClass = WEEK_COLORS[wIdx % WEEK_COLORS.length];
                  return week.days.map((dayObj, dIdx) => {
                    const dateKey = format(dayObj, 'yyyy-MM-dd');
                    const isValidDay = isSameMonth(dayObj, currentMonth);
                    const status = isValidDay ? getStudentStatusOnDate(student.id, dateKey) : null;

                    return (
                      <td
                        key={`${wIdx}-${dIdx}`}
                        className={`p-0 border-r border-black/10 text-center relative group/cell transition-colors duration-200 ${bgClass} ${isEraserMode ? 'cursor-crosshair hover:bg-red-50/50 dark:hover:bg-red-950/20' : 'cursor-pointer hover:bg-white/50 dark:hover:bg-white/20'} print:border-black print:bg-transparent`}
                        onMouseDown={() => {
                          if (!isValidDay) return;
                          if (isEraserMode) {
                            setIsErasing(true);
                            eraseMonthlyStatus(student.id, dateKey);
                          } else {
                            toggleMonthlyStatus(student.id, dateKey);
                          }
                        }}
                        onMouseEnter={() => {
                          if (isEraserMode && isErasing && isValidDay) {
                            eraseMonthlyStatus(student.id, dateKey);
                          }
                        }}
                      >
                        {isValidDay && status && STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ? (
                          <div className={`
                            ${STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].color} 
                            text-white font-black text-[10px] 
                            w-5 h-5 rounded-md mx-auto 
                            flex items-center justify-center 
                            shadow-[0_2px_4px_rgba(0,0,0,0.1)] scale-100 group-hover/cell:scale-110 
                            transition-all duration-200
                            ring-2 ring-white/30
                            status-indicator
                            ${status === 'F' ? 'print:hidden' : ''}
                            print:bg-transparent print:text-black print:shadow-none print:ring-0 print:rounded-none print:w-auto print:h-auto print:inline-block print:font-bold print:text-[11px]
                          `}>
                            {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].value}
                          </div>
                        ) : isValidDay ? (
                          <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-zinc-800 mx-auto opacity-0 group-hover/cell:opacity-40 transition-opacity"></div>
                        ) : null}
                      </td>
                    );
                  });
                })}
                <td className={`border-l border-r border-black p-0 text-center font-bold text-[11px] text-emerald-600 print:text-black ${isGrayRow ? 'print-gray-row' : sIdx % 2 === 0 ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : 'bg-emerald-50/40 dark:bg-emerald-950/20'} print:bg-transparent print:border-black print:font-bold dark:text-emerald-400`}>
                  {stats.P || 0}
                </td>
                <td className={`border-r border-black p-0 text-center font-bold text-[11px] text-amber-600 print:text-black ${isGrayRow ? 'print-gray-row' : sIdx % 2 === 0 ? 'bg-amber-50/20 dark:bg-amber-950/10' : 'bg-amber-50/40 dark:bg-amber-950/20'} print:bg-transparent print:border-black print:font-bold dark:text-amber-400`}>
                  {stats.T || 0}
                </td>
                <td className={`border-r border-black p-0 text-center font-bold text-[11px] text-red-600 print:text-black ${isGrayRow ? 'print-gray-row' : sIdx % 2 === 0 ? 'bg-red-50/20 dark:bg-rose-950/10' : 'bg-red-50/40 dark:bg-rose-950/20'} print:bg-transparent print:border-black print:font-bold dark:text-rose-400`}>
                  {stats.A || 0}
                </td>
                <td className={`border-r border-black p-0 text-center font-bold text-[11px] text-blue-600 print:text-black ${isGrayRow ? 'print-gray-row' : sIdx % 2 === 0 ? 'bg-blue-50/20 dark:bg-blue-950/10' : 'bg-blue-50/40 dark:bg-blue-950/20'} print:bg-transparent print:border-black print:font-bold dark:text-blue-400`}>
                  {stats.E || 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  // Annual View months list
  const academicMonthsList = useMemo(() => {
    const period = activeSchoolYear;
    return generateAcademicMonths(period);
  }, [activeSchoolYear]);

  // Student stats summaries
  const calculateStudentMonthStats = (studentId: string, monthConfig: any) => {
    let p = 0, a = 0, t = 0, e = 0;
    allAttendance.forEach(att => {
      if (att.tipo_dia && att.tipo_dia !== "regular") return; // exclude holidays
      if (att.fecha >= monthConfig.start && att.fecha <= monthConfig.end) {
        const stat = att.registro[studentId];
        if (stat === "P") p++;
        else if (stat === "A") a++;
        else if (stat === "T") t++;
        else if (stat === "E") e++;
      }
    });
    return { p, a, t, e };
  };

  const calculateStudentAnnualStats = (studentId: string) => {
    let p = 0, a = 0, t = 0, e = 0;
    allAttendance.forEach(att => {
      if (att.tipo_dia && att.tipo_dia !== "regular") return;
      const stat = att.registro[studentId];
      if (stat === "P") p++;
      else if (stat === "A") a++;
      else if (stat === "T") t++;
      else if (stat === "E") e++;
    });

    const total = p + a + t + e;
    const rate = total > 0 ? Math.round(((p + t) / total) * 100) : 100;
    const absenceRate = total > 0 ? Math.round((a / total) * 100) : 0;
    return { p, a, t, e, total, rate, absenceRate };
  };

  if (!user) return null;

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <Toaster position="top-center" richColors />

      <style dangerouslySetInnerHTML={{ __html: `
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="month"]::-webkit-calendar-picker-indicator {
          display: none !important;
          -webkit-appearance: none !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .writing-vertical-simple {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
          margin: 0 auto;
        }
        
        .vertical-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
          margin: 0 auto;
          font-size: 7.5px;
          line-height: 1;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }
          
          #attendance-print-area,
          #attendance-print-area *,
          #annual-print-area,
          #annual-print-area *,
          .print-only,
          .print-only * {
            visibility: visible !important;
          }
          
          html, body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          #root, .app-shell, main, [class*="max-w-"], .shadow-lg {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            min-height: auto !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Position monthly print area */
          #attendance-print-area {
            position: fixed !important;
            top: 8mm !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            color: #000 !important;
            transform: scale(0.95) !important;
            transform-origin: top center !important;
            min-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          /* Position annual print area */
          #annual-print-area {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            min-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          /* Monthly print header styling */
          #attendance-print-area .custom-header {
            display: block !important;
            text-align: center !important;
            margin: 0 0 3mm 0 !important;
            padding: 0 !important;
          }
          
          #attendance-print-area .custom-title {
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            margin: 0 0 2mm 0 !important;
            color: #000 !important;
            text-transform: uppercase !important;
          }
          
          /* Monthly table styling for print */
          #attendance-print-area table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 9px !important;
            border: 1px solid #000 !important;
          }
          
          #attendance-print-area th, 
          #attendance-print-area td {
            border: 1px solid #000 !important;
            padding: 0 !important;
            text-align: center !important;
            vertical-align: middle !important;
            background: #fff !important;
            color: #000 !important;
            overflow: hidden !important;
            line-height: 1 !important;
          }
          
          #attendance-print-area thead th { 
            font-weight: 700 !important; 
          }
          
          #attendance-print-area thead tr:nth-child(1) th { height: 18px !important; }
          #attendance-print-area thead tr:nth-child(2) th { height: 62px !important; }
          #attendance-print-area thead tr:nth-child(3) th { height: 16px !important; }
          #attendance-print-area tbody tr, 
          #attendance-print-area tbody td { height: 16px !important; }
          
          #attendance-print-area .writing-vertical-simple,
          #attendance-print-area .vertical-header div {
            writing-mode: vertical-rl !important;
            transform: rotate(180deg) !important;
            white-space: nowrap !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 11px !important;
            font-weight: 400 !important;
          }
          
          #attendance-print-area th.fecha-header {
            background: #eaeaea !important;
            text-align: left !important;
            padding-left: 2px !important;
            font-size: 8px !important;
            font-weight: 700 !important;
          }
          
          #attendance-print-area tbody tr td { background: #fff !important; }
          #attendance-print-area tbody tr:nth-child(odd) td { background: #f2f2f2 !important; }
          
          #attendance-print-area .status-indicator {
            background: transparent !important;
            color: #000 !important;
            border: none !important;
            box-shadow: none !important;
            transform: none !important;
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-weight: 700 !important;
            font-size: 9px !important;
          }

          /* Annual table styling for print */
          #annual-print-area table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 8px !important;
            border: 1px solid #000 !important;
            background-color: white !important;
          }
          
          #annual-print-area th, 
          #annual-print-area td {
            border: 1px solid #000 !important;
            color: black !important;
            padding: 2px 1px !important;
            text-align: center !important;
            vertical-align: middle !important;
          }
          
          #annual-print-area .vertical-text {
            writing-mode: vertical-rl !important;
            transform: rotate(180deg) !important;
            white-space: nowrap !important;
            margin: 0 auto !important;
            font-size: 7.5px !important;
            line-height: 1 !important;
          }
          
          .print-only {
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
      ` }} />

      {activeView === "mensual" ? (
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 portrait !important;
              margin: 0mm 5mm 5mm 5mm !important;
            }
          }
        ` }} />
      ) : activeView === "anual" ? (
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: landscape !important;
              margin: 5mm !important;
            }
          }
        ` }} />
      ) : null}

      {/* Header con Dropdown de Aulas */}
      <div className="flex flex-col gap-4 text-center relative pb-4 border-b border-slate-100 dark:border-zinc-800 print:hidden mb-8 mt-6">
        <div className="absolute top-0 left-0">
          <button 
            onClick={() => navigate(`/aula-virtual`)}
            className="bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-full px-4 py-2 font-bold text-[13px] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Volver a Aulas
          </button>
        </div>
        <div className="absolute top-0 right-0">
          {classrooms.length > 0 && (
            <div className="flex flex-col items-center gap-1 select-none">
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                Aula o Grupo Activo
              </span>
              <div className="inline-block relative">
                <button
                  onClick={() => setShowClassroomDropdown(!showClassroomDropdown)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full hover:bg-slate-50 dark:hover:bg-zinc-800 transition text-[13px] font-bold text-slate-800 dark:text-zinc-200 shadow-sm cursor-pointer"
                >
                  <Users size={14} className="text-slate-700 dark:text-zinc-300" />
                  <span>{activeClassroom ? activeClassroom.nombre : "Seleccionar Aula"}</span>
                  <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${showClassroomDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showClassroomDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowClassroomDropdown(false)} />
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-3 py-1.5 mb-1 border-b border-slate-100 dark:border-zinc-800">
                        Seleccionar Aula
                      </div>
                      <div className="space-y-0.5 max-h-60 overflow-y-auto">
                        {classrooms.map((c) => {
                          const isActive = c.id === activeClassId;
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                setShowClassroomDropdown(false);
                                navigate(`/aula-virtual/asistencia/${c.id}`);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                isActive
                                  ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                                  : "text-slate-750 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                              }`}
                            >
                              <Users size={14} className={isActive ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-zinc-500"} />
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
          <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white tracking-wider leading-none">
            Registro de Asistencia
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold mt-1.5">
            Registro de asistencia diario, mensual y acumulado anual del año escolar.
          </p>
          
          {/* Centered Active Classroom Info Pill */}
          {activeClassroom ? (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-sm px-4 py-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-brand-primary dark:text-blue-450" />
                  <span className="text-xs font-bold text-brand-primary dark:text-blue-450">{activeClassroom.nombre}</span>
                </div>
                <div className="w-px h-4 bg-slate-200 dark:bg-zinc-850" />
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-500 dark:text-zinc-450" />
                  <span className="text-xs font-bold text-slate-500 dark:text-zinc-450">{activeSchoolYear}</span>
                </div>
              </div>
            </div>
          ) : (
            classrooms.length === 0 && (
              <div className="bg-white border border-black/5 rounded-[24px] p-4 text-[13px] font-semibold text-text-muted mt-4 inline-block">
                No tienes aulas creadas. Créalas en Configuración.
              </div>
            )
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex justify-center gap-2.5 mb-8 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { id: "diaria", label: "Pase de Lista Diario", icon: <UserCheck size={16} /> },
          { id: "mensual", label: "Registro Mensual", icon: <CalendarIcon size={16} /> },
          { id: "anual", label: "Resumen Acumulado Anual", icon: <TrendingUp size={16} /> },
        ].map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "anual") {
                  const canProceed = consumeCredits('attendance_summary');
                  if (!canProceed) {
                    const info = getCreditInfo('attendance_summary');
                    setCreditsExhaustedInfo({ required: info.cost, current: info.currentCredits });
                    setShowCreditsExhausted(true);
                    return;
                  }
                }
                setActiveView(tab.id as any);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[13px] transition-all cursor-pointer whitespace-nowrap active:scale-95 select-none border shadow-sm ${
                isActive 
                  ? "bg-[#1B1B1B] text-white border-black/15 shadow-md dark:bg-white dark:text-[#1B1B1B] dark:border-transparent" 
                  : "bg-white text-text-muted hover:bg-black/5 border-black/10 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="w-full">
        {/* VIEW 1: DAILY ATTENDANCE */}
        {activeView === "diaria" && (
          <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto">
            {/* Header consolidando Fecha, Estadísticas y Acciones */}
            <div className="flex flex-col lg:flex-row items-center justify-between w-full pb-4 border-b border-slate-100 dark:border-zinc-800/40 gap-4">
              {/* Spacer on the left to balance layout */}
              <div className="w-1/4 hidden lg:block" />

              {/* Date navigation & Stats in the absolute center */}
              <div className="flex flex-col items-center justify-center gap-2 lg:w-2/4">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => shiftDateByAmount(-1)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer text-neutral-500"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div 
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="relative flex items-center gap-2.5 font-black text-neutral-850 dark:text-zinc-200 text-lg md:text-xl cursor-pointer hover:opacity-80 select-none"
                  >
                    <span>{formattedDate}</span>
                    {isToday && (
                      <span className="bg-brand-primary text-white text-[11px] font-black px-2.5 py-0.5 rounded-md">
                        Hoy
                      </span>
                    )}
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
                    />
                  </div>
                  <button
                    onClick={() => shiftDateByAmount(1)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer text-neutral-500"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                {/* Status summary bullets (Mockup Style) */}
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-[13px] font-extrabold text-neutral-600 dark:text-zinc-300">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>{counts.p} Presente</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-extrabold text-neutral-600 dark:text-zinc-300">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span>{counts.a} Ausente</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-extrabold text-neutral-600 dark:text-zinc-300">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>{counts.t} Tardanza</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-extrabold text-neutral-600 dark:text-zinc-300">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>{counts.e} Justificado</span>
                  </div>
                </div>
              </div>

              {/* Layout Switchers & Save Button on the right */}
              <div className="flex items-center gap-3 justify-end lg:w-1/4 w-full">
                {/* Grid / List Toggles */}
                <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                  <button
                    onClick={() => setDailyLayout("grid")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      dailyLayout === "grid" 
                        ? "bg-white dark:bg-zinc-700 text-neutral-800 dark:text-white shadow-2xs" 
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                    }`}
                    title="Vista Cuadrícula"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setDailyLayout("list")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      dailyLayout === "list" 
                        ? "bg-white dark:bg-zinc-700 text-neutral-800 dark:text-white shadow-2xs" 
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                    }`}
                    title="Vista Lista"
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* Guardar Asistencia Button */}
                <button
                  onClick={handleSaveAll}
                  disabled={students.length === 0}
                  className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 select-none"
                >
                  <Save size={14} />
                  Guardar Asistencia
                </button>
              </div>
            </div>

            {/* Non-lectivo alert if Day Type is not regular */}
            {dayType !== "regular" && (
              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 mt-2">
                <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                <div>
                  <h4 className="text-[13px] font-bold text-neutral-800 dark:text-zinc-200 uppercase tracking-wider">
                    {dayType === "feriado" ? "Día Feriado Declarado" : "Grupo Pedagógico Docente"}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-zinc-400 mt-0.5">
                    Este día está registrado como no lectivo. Las estadísticas acumuladas excluirán este día de la tasa de inasistencia de los alumnos.
                  </p>
                </div>
              </div>
            )}

            {/* Day Type selector & Mark all present toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-50 dark:bg-zinc-900/40 border border-black/5 dark:border-zinc-800 rounded-2xl px-6 py-3 mt-1 shadow-2xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                  Tipo de Día:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { 
                      id: "regular", 
                      label: "Clase Regular", 
                      icon: <BookOpen size={14} />, 
                      color: "bg-white dark:bg-zinc-950 text-neutral-800 dark:text-zinc-200 border-black/10 dark:border-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-800" 
                    },
                    { 
                      id: "feriado", 
                      label: "Feriado", 
                      icon: <Sparkles size={14} />, 
                      color: "bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900/30 hover:bg-pink-100 dark:hover:bg-pink-900/50" 
                    },
                    { 
                      id: "grupo_pedagogico", 
                      label: "Pedagógico", 
                      icon: <GraduationCap size={14} />, 
                      color: "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50" 
                    }
                  ].map((type) => {
                    const isSelected = dayType === type.id;
                    const activeStyles = {
                      regular: "bg-[#1B1B1B] text-white dark:bg-white dark:text-[#1B1B1B] border-transparent shadow-xs",
                      feriado: "bg-pink-500 text-white border-transparent shadow-xs",
                      grupo_pedagogico: "bg-purple-500 text-white border-transparent shadow-xs"
                    };
                    return (
                      <button
                        key={type.id}
                        onClick={() => handleSetDayType(type.id as any)}
                        className={`px-4 py-2 border rounded-full text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95 select-none ${
                          isSelected 
                            ? activeStyles[type.id] 
                            : type.color
                        }`}
                      >
                        {type.icon}
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <button
                onClick={handleMarkAllPresent}
                disabled={dayType !== "regular" || students.length === 0}
                className="bg-white border border-black/10 dark:bg-zinc-950 dark:border-zinc-800 text-neutral-800 dark:text-zinc-200 text-[13px] font-bold px-4 py-2 rounded-full transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 select-none"
              >
                <UserCheck size={14} />
                Todos Presentes
              </button>
            </div>

            {/* Centered Legend Bar */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-2 py-2 px-6 bg-white/70 dark:bg-zinc-900/40 border border-black/5 dark:border-zinc-800 rounded-full w-fit mx-auto shadow-2xs select-none">
              {/* P - Presente */}
              <div className="group relative flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-zinc-400 cursor-help">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black shadow-xs">P</span>
                <span className="uppercase tracking-wider">Presente</span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-neutral-900 dark:bg-zinc-800 text-white dark:text-zinc-200 text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-md z-50 text-center pointer-events-none">
                  1 clic en la tarjeta cambia a Presente.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900 dark:border-t-zinc-800 w-0 h-0" />
                </div>
              </div>

              {/* A - Ausente */}
              <div className="group relative flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-zinc-400 cursor-help">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black shadow-xs">A</span>
                <span className="uppercase tracking-wider">Ausente</span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-neutral-900 dark:bg-zinc-800 text-white dark:text-zinc-200 text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-md z-50 text-center pointer-events-none">
                  2 clics en la tarjeta cambian a Ausente.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900 dark:border-t-zinc-800 w-0 h-0" />
                </div>
              </div>

              {/* T - Tarde */}
              <div className="group relative flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-zinc-400 cursor-help">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-black shadow-xs">T</span>
                <span className="uppercase tracking-wider">Tarde</span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-neutral-900 dark:bg-zinc-800 text-white dark:text-zinc-200 text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-md z-50 text-center pointer-events-none">
                  3 clics en la tarjeta cambian a Tardanza.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900 dark:border-t-zinc-800 w-0 h-0" />
                </div>
              </div>

              {/* E - Excusa */}
              <div className="group relative flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-zinc-400 cursor-help">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black shadow-xs">E</span>
                <span className="uppercase tracking-wider">Excusa</span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-neutral-900 dark:bg-zinc-800 text-white dark:text-zinc-200 text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-md z-50 text-center pointer-events-none">
                  4 clics en la tarjeta cambian a Justificado/Excusa.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900 dark:border-t-zinc-800 w-0 h-0" />
                </div>
              </div>
            </div>

            {/* Students Grid / List (Mockup Style) */}
            {students.length > 0 ? (
              dailyLayout === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mt-4">
                  {students.map((st) => {
                    const currentStatus = draftRegister[st.id] || "P";
                    const style = CARD_STYLES[currentStatus as keyof typeof CARD_STYLES] || CARD_STYLES.P;
                    
                    return (
                      <div
                        key={st.id}
                        onClick={() => cycleStatus(st.id)}
                        className={`border rounded-3xl p-5 flex flex-col items-center justify-center relative cursor-pointer select-none transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 ${style.cardBg} ${style.border} group`}
                      >
                        {/* Avatar Wrapper */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-white rounded-full border border-black/5 shadow-sm overflow-visible">
                          <img
                            src={getStudentAvatar(st)}
                            alt={`Avatar de ${st.nombre}`}
                            className="w-full h-full rounded-full object-cover p-1.5"
                            loading="lazy"
                          />
                          
                          {/* Status Badge Overlap */}
                          <div className={`absolute top-0 right-0 w-7 h-7 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-[11px] font-black leading-none ${style.badgeBg} transform translate-x-1.5 -translate-y-1.5`}>
                            {style.char}
                          </div>
                        </div>
                        
                        {/* Student Name */}
                        <h4 className={`text-center font-bold text-[13px] sm:text-[14px] mt-4 leading-snug tracking-tight px-1 transition-colors select-none ${style.text}`}>
                          {st.nombre} {st.apellido || ""}
                        </h4>
                        
                        {/* Tiny Order Index Number in corner */}
                        <div className="absolute top-3 left-3.5 text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                          #{st.numero_orden}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View: A more premium styled list layout */
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xs mt-4">
                  <div className="divide-y divide-black/5 dark:divide-zinc-800">
                    {students.map((st) => {
                      const currentStatus = draftRegister[st.id] || "P";
                      const style = CARD_STYLES[currentStatus as keyof typeof CARD_STYLES] || CARD_STYLES.P;
                      
                      return (
                        <div
                          key={st.id}
                          className="flex items-center justify-between p-3 hover:bg-slate-50/30 dark:hover:bg-zinc-800/10 select-none transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[11px] font-black font-mono">
                              {st.numero_orden}
                            </span>
                            
                            {/* Avatar */}
                            <div className="relative w-10 h-10 bg-white rounded-full border border-black/5 shadow-2xs">
                              <img
                                src={getStudentAvatar(st)}
                                alt={`Avatar de ${st.nombre}`}
                                className="w-full h-full rounded-full object-cover p-0.5"
                                loading="lazy"
                              />
                            </div>
                            
                            <span className="font-bold text-neutral-800 dark:text-zinc-200 text-sm">
                              {st.nombre} {st.apellido || ""}
                            </span>
                          </div>

                          {/* Action Buttons for each state */}
                          <div className="flex items-center gap-2">
                            {[
                              { id: "P", label: "P", name: "Presente", active: "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent", inactive: "text-emerald-500 bg-emerald-50/50 hover:bg-emerald-100/60 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 border-emerald-100/50 dark:border-emerald-950/20" },
                              { id: "A", label: "A", name: "Ausente", active: "bg-rose-500 hover:bg-rose-600 text-white border-transparent", inactive: "text-rose-500 bg-rose-50/50 hover:bg-rose-100/60 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 border-rose-100/50 dark:border-rose-950/20" },
                              { id: "T", label: "T", name: "Tardanza", active: "bg-amber-500 hover:bg-amber-600 text-white border-transparent", inactive: "text-amber-600 dark:text-amber-500 bg-amber-50/50 hover:bg-amber-100/60 dark:bg-amber-950/10 dark:hover:bg-amber-950/20 border-amber-100/50 dark:border-amber-950/20" },
                              { id: "E", label: "E", name: "Justificado", active: "bg-blue-500 hover:bg-blue-600 text-white border-transparent", inactive: "text-blue-500 bg-blue-50/50 hover:bg-blue-100/60 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 border-blue-100/50 dark:border-blue-950/20" }
                            ].map((state) => {
                              const isActive = currentStatus === state.id;
                              return (
                                <button
                                  key={state.id}
                                  onClick={() => {
                                    setStatus(st.id, state.id as any);
                                  }}
                                  className={`w-8 h-8 rounded-full border text-xs font-black flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-90 select-none ${
                                    isActive ? state.active : state.inactive
                                  }`}
                                  title={state.name}
                                >
                                  {state.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-3xl p-12 text-center text-neutral-400 dark:text-zinc-505 font-bold shadow-2xs mt-4">
                No hay estudiantes registrados para pasar lista.
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: MONTHLY ATTENDANCE GRID */}
        {activeView === "mensual" && (
          <div className={`space-y-6 w-full max-w-[1600px] mx-auto px-4 relative ${isEraserMode ? 'cursor-auto' : ''}`}>


            {/* Controls Row: Legend, Month Selector, and Zoom Controls */}
            {!isFullScreen && (
              <div className="flex flex-col items-center gap-4 no-print w-full">
                {/* Legend - Status Codes */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white dark:bg-zinc-900 rounded-full px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200/40 dark:border-zinc-800">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-1.5 sm:gap-2">
                      <div className={`${config.color} text-white font-black text-[9px] w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center shadow-sm`}>
                        {config.value}
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{config.label}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Controls Row: Borrador and Zoom controls centered */}
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                  {/* Eraser Button */}
                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-2xl p-1 shadow-sm border border-slate-200/40 dark:border-zinc-800 w-fit">
                    <Button
                      variant={isEraserMode ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setIsEraserMode(!isEraserMode)}
                      className={`h-8 px-3 flex items-center gap-1.5 rounded-xl border ${isEraserMode
                        ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                        : "text-slate-600 dark:text-zinc-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 border-transparent"
                        }`}
                      title={isEraserMode ? "Desactivar Borrador" : "Activar Borrador"}
                    >
                      <Eraser className="h-3.5 w-3.5" />
                      <span className="text-xs font-bold hidden sm:inline">
                        {isEraserMode ? "Borrador Activo" : "Borrador"}
                      </span>
                    </Button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 rounded-2xl p-1 shadow-sm border border-slate-200/40 dark:border-zinc-800 w-fit select-none">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 50}
                      className="h-8 w-8 bg-bg-base dark:bg-zinc-950 hover:bg-black/5 dark:hover:bg-zinc-800 rounded-xl border border-black/10 dark:border-zinc-800 text-text-main dark:text-zinc-200 flex items-center justify-center p-0 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-xs"
                      title="Alejar"
                    >
                      <ZoomOut size={15} />
                    </button>

                    <span className="text-xs font-semibold min-w-[36px] text-center text-slate-700 dark:text-zinc-300 select-none">
                      {zoomLevel}%
                    </span>

                    <button
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 400}
                      className="h-8 w-8 bg-bg-base dark:bg-zinc-950 hover:bg-black/5 dark:hover:bg-zinc-800 rounded-xl border border-black/10 dark:border-zinc-800 text-text-main dark:text-zinc-200 flex items-center justify-center p-0 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-xs"
                      title="Acercar"
                    >
                      <ZoomIn size={15} />
                    </button>

                    <button
                      onClick={handleResetZoom}
                      className="h-8 w-8 bg-bg-base dark:bg-zinc-950 hover:bg-black/5 dark:hover:bg-zinc-800 rounded-xl border border-black/10 dark:border-zinc-800 text-text-main dark:text-zinc-200 flex items-center justify-center p-0 transition-colors cursor-pointer shadow-xs"
                      title="Restablecer"
                    >
                      <RotateCcw size={15} />
                    </button>

                    <div className="w-px h-5 bg-slate-200 dark:bg-zinc-800 mx-1"></div>

                    <button
                      onClick={toggleFullScreen}
                      className="h-8 px-3.5 bg-bg-base dark:bg-zinc-950 hover:bg-black/5 dark:hover:bg-zinc-800 rounded-xl border border-black/10 dark:border-zinc-800 text-text-main dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
                    >
                      {isFullScreen ? <Minimize size={14} /> : <Maximize size={14} />}
                      <span className="text-[11px] font-bold">
                        {isFullScreen ? "Salir" : "Pantalla Completa"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Standard View */}
            {!isFullScreen && (
              <div className="block">
                <Card className="shadow-lg border-slate-200/60 dark:border-zinc-800 overflow-visible relative p-4 bg-white dark:bg-zinc-900 rounded-3xl">
                  <div className="flex justify-between items-center no-print mb-4 border-b border-slate-100 dark:border-zinc-850 pb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleMonthChange(subMonths(currentMonth, 1))}
                        className="p-2.5 bg-bg-base dark:bg-zinc-950 hover:bg-black/5 dark:hover:bg-zinc-800 rounded-full border border-black/5 dark:border-zinc-800 text-text-main dark:text-zinc-200 transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <div 
                        onClick={() => monthInputRef.current?.showPicker()}
                        className="relative flex items-center gap-2 font-bold text-[14px] cursor-pointer hover:opacity-85 select-none"
                      >
                        <CalendarIcon size={16} className="text-text-muted dark:text-zinc-400 flex-shrink-0" />
                        <span className="capitalize text-text-main dark:text-zinc-200 font-extrabold whitespace-nowrap">
                          {format(currentMonth, "MMMM yyyy", { locale: es })}
                        </span>
                        <input
                          ref={monthInputRef}
                          type="month"
                          value={format(currentMonth, "yyyy-MM")}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [year, month] = e.target.value.split("-");
                              handleMonthChange(new Date(parseInt(year), parseInt(month) - 1, 1));
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
                        />
                      </div>
                      <button
                        onClick={() => handleMonthChange(addMonths(currentMonth, 1))}
                        className="p-2.5 bg-bg-base dark:bg-zinc-950 hover:bg-black/5 dark:hover:bg-zinc-800 rounded-full border border-black/5 dark:border-zinc-800 text-text-main dark:text-zinc-200 transition-colors cursor-pointer"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status sync indicators */}
                      {hasUnsavedMonthlyChanges ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-tight">Pendiente</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-400 dark:text-zinc-500">
                          <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span className="text-[10px] font-bold uppercase tracking-tight">Sin cambios</span>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
                          const oldTitle = document.title;
                          document.title = `Planix - Registro Asistencia - ${activeClassroom?.nombre} - ${dateStr}`;
                          window.print();
                          document.title = oldTitle;
                        }}
                        className="bg-white dark:bg-zinc-950 border-neutral-200 dark:border-zinc-800 text-neutral-700 dark:text-zinc-350 hover:bg-neutral-50 dark:hover:bg-zinc-900 shadow-sm"
                      >
                        <Printer className="mr-2 h-4 w-4 text-emerald-500" /> Imprimir
                      </Button>

                      <Button
                        onClick={handleSaveMonthlyAttendance}
                        disabled={!hasUnsavedMonthlyChanges}
                        className="bg-brand-primary text-white hover:bg-brand-hover font-bold rounded-xl shadow-md cursor-pointer transition-all duration-200 h-8 py-1.5 px-4 text-xs flex items-center gap-1.5"
                      >
                        <Save className="h-4 w-4" /> Guardar Asistencia
                      </Button>
                    </div>
                  </div>

                  <div
                    id="attendance-print-area"
                    className="bg-white dark:bg-zinc-900 rounded-xl overflow-x-auto"
                    style={{
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: "top left",
                      transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {/* Attendance Table Header for Print */}
                    <div className="custom-header hidden print-only">
                      <h1 className="custom-title uppercase">CONTROL DE ASISTENCIA Y PUNTUALIDAD</h1>
                      <div className="flex justify-center gap-[30px] text-[11px] mt-[10px] mb-[15px]">
                        <div className="flex items-center gap-1">
                          <span>Mes:</span>
                          <span className="border-b border-black px-2 min-w-[220px] text-center font-bold uppercase">
                            {format(currentMonth, "MMMM", { locale: es })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Días trabajados:</span>
                          <span className="border-b border-black px-2 min-w-[150px] text-center font-bold">
                            {daysInMonth.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {AttendanceTable()}
                  </div>
                </Card>
              </div>
            )}

            {/* Fullscreen Overlay */}
            {isFullScreen && (
              <div
                ref={containerRef}
                className={`fixed inset-0 z-[9999] overflow-auto fullscreen-overlay p-8 ${isPanning ? 'cursor-grabbing' :
                  isEraserMode ? 'cursor-crosshair bg-white dark:bg-zinc-950' : 'bg-white dark:bg-zinc-950'
                  }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                {/* Legend in Fullscreen - Top Left corner */}
                <div className="fixed top-6 left-8 z-[110] flex items-center gap-4 bg-white dark:bg-zinc-900 rounded-full px-6 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-neutral-100 dark:border-zinc-800 no-print">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <div className={`${config.color} text-white font-black text-[10px] w-6 h-6 rounded-lg flex items-center justify-center shadow-sm`}>
                        {config.value}
                      </div>
                      <span className="text-[10px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">{config.label}</span>
                    </div>
                  ))}
                </div>

                {/* Controls in Fullscreen - Top Right */}
                <div className="fixed top-6 right-8 z-[110] flex items-center gap-2 no-print">
                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 rounded-2xl p-1 shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-200/40 dark:border-zinc-800 select-none">
                    {/* Eraser Button in Fullscreen */}
                    <button
                      onClick={() => setIsEraserMode(!isEraserMode)}
                      className={`h-8 px-3 flex items-center gap-1.5 rounded-xl transition-colors cursor-pointer text-xs font-bold border ${isEraserMode
                        ? 'bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-sm'
                        : 'bg-bg-base dark:bg-zinc-950 hover:bg-black/5 dark:hover:bg-zinc-800 border-black/10 dark:border-zinc-800 text-text-main dark:text-zinc-200 shadow-xs'
                        }`}
                      title={isEraserMode ? "Desactivar Borrador" : "Activar Borrador"}
                    >
                      <Eraser size={15} />
                      <span className="hidden sm:inline">
                        {isEraserMode ? "Activo" : "Borrador"}
                      </span>
                    </button>

                    <div className="w-px h-5 bg-neutral-200 dark:bg-zinc-800 mx-1" />

                    <button
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 50}
                      className="h-8 w-8 bg-bg-base dark:bg-zinc-950 hover:bg-black/5 dark:hover:bg-zinc-800 rounded-xl border border-black/10 dark:border-zinc-800 text-text-main dark:text-zinc-200 flex items-center justify-center p-0 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-xs"
                      title="Alejar"
                    >
                      <ZoomOut size={15} />
                    </button>

                    <span className="text-xs font-semibold min-w-[36px] text-center text-slate-700 dark:text-zinc-350 select-none">
                      {zoomLevel}%
                    </span>

                    <button
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 400}
                      className="h-8 w-8 bg-bg-base dark:bg-zinc-950 hover:bg-black/5 dark:hover:bg-zinc-800 rounded-xl border border-black/10 dark:border-zinc-800 text-text-main dark:text-zinc-200 flex items-center justify-center p-0 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-xs"
                      title="Acercar"
                    >
                      <ZoomIn size={15} />
                    </button>

                    <button
                      onClick={handleResetZoom}
                      className="h-8 w-8 bg-bg-base dark:bg-zinc-950 hover:bg-black/5 dark:hover:bg-zinc-800 rounded-xl border border-black/10 dark:border-zinc-800 text-text-main dark:text-zinc-200 flex items-center justify-center p-0 transition-colors cursor-pointer shadow-xs"
                      title="Restablecer"
                    >
                      <RotateCcw size={15} />
                    </button>

                    <div className="w-px h-5 bg-neutral-200 dark:bg-zinc-800 mx-1" />

                    <button
                      onClick={toggleFullScreen}
                      className="h-8 px-3 bg-bg-base dark:bg-zinc-950 hover:bg-red-50 dark:hover:bg-zinc-900 hover:text-red-650 dark:hover:text-red-400 hover:border-red-200/50 rounded-xl border border-black/10 dark:border-zinc-800 text-text-main dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Salir de pantalla completa"
                    >
                      <Minimize size={14} />
                      <span className="text-[11px] font-bold">Salir</span>
                    </button>
                  </div>
                </div>

                <div className="min-h-full flex flex-col items-start pt-24 pb-48 px-8 sm:px-12 md:px-16 gap-4">
                  {/* Save Controls in Fullscreen - Above Table */}
                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-200/40 dark:border-zinc-800 min-h-[40px] no-print">
                    {/* Save Status Block */}
                    <div className="flex items-center no-print min-w-[110px] justify-center px-1">
                      {hasUnsavedMonthlyChanges ? (
                        <div className="flex items-center gap-2 px-2 py-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-tight">Pendiente</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-2 py-1 bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-lg text-neutral-400 dark:text-zinc-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-zinc-700" />
                          <span className="text-[9px] font-black uppercase tracking-tight">Sin cambios</span>
                        </div>
                      )}
                    </div>

                    <div className="w-px h-6 bg-neutral-200 dark:bg-zinc-800 mx-1" />

                    {/* Save Now Button */}
                    <button
                      className={`border-none shadow-sm h-8 px-4 rounded-xl flex items-center gap-1.5 transition-all duration-300
                        ${!hasUnsavedMonthlyChanges
                          ? 'bg-neutral-100 dark:bg-zinc-800 text-neutral-400 dark:text-zinc-550 cursor-not-allowed'
                          : 'bg-[#1B1B1B] dark:bg-zinc-200 dark:hover:bg-zinc-300 dark:text-zinc-950 hover:bg-slate-850 text-white cursor-pointer shadow-md'}`}
                      onClick={handleSaveMonthlyAttendance}
                      disabled={!hasUnsavedMonthlyChanges}
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Guardar Asistencia</span>
                    </button>
                  </div>

                  <div
                    style={{
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: '0 0',
                      width: 'fit-content',
                      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      minWidth: `${(zoomLevel / 100) * 100}%`
                    }}
                  >
                    <div className="bg-white dark:bg-zinc-900 p-4 shadow-xl rounded-xl">
                      {AttendanceTable()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: ANNUAL CUMULATIVE */}
        {activeView === "anual" && (
          <div className="flex flex-col gap-6">
            
            {/* Control bar */}
            <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
              <div>
                <h4 className="text-[15px] font-bold text-text-main dark:text-zinc-100">Resumen Anual de Asistencia</h4>
                <p className="text-[12px] text-text-muted dark:text-zinc-400 mt-0.5">
                  Estadísticas acumuladas de asistencia y ausencias por mes para el Año Escolar {activeClassroom?.periodo || "2025-2026"}.
                </p>
              </div>
              <Button 
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm flex items-center justify-center cursor-pointer transition-all duration-200 text-xs px-4 py-2 border-none" 
                onClick={() => window.print()}
              >
                <Printer className="mr-1.5 h-4 w-4" /> Imprimir Resumen
              </Button>
            </div>

            {/* Print Area wrapping both header and table */}
            <div id="annual-print-area" className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm p-4 print:p-0 w-full">
              {/* Print Header - Visible ONLY when printing */}
              <div className="text-center mb-6 print:block hidden">
                <h1 className="text-2xl font-black uppercase tracking-wide text-slate-900">Resumen Anual de Asistencia</h1>
                <p className="text-xs font-bold text-slate-600 mt-1 uppercase">
                  Aula: {activeClassroom?.nombre} | Año Escolar: {activeClassroom?.periodo || "2025-2026"}
                </p>
                <div className="flex justify-start mt-4 text-xs font-semibold text-slate-700">
                  <span className="mr-2">Días trabajados:</span>
                  <div className="border-b border-slate-800 w-64"></div>
                </div>
              </div>

              {/* Annual Table */}
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full border-collapse border border-slate-300 dark:border-zinc-700 text-[8px] bg-white dark:bg-zinc-950 print:border-slate-800 leading-none min-w-[900px]">
                  <thead>
                    {/* Row 1: Months */}
                    <tr className="bg-slate-50 dark:bg-zinc-900 print:bg-white text-slate-700 dark:text-zinc-300 border-b border-slate-300 dark:border-zinc-700 print:border-slate-800">
                      <th rowSpan={2} className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 p-0 w-5">
                        <div className="vertical-text h-24 font-bold text-slate-800 dark:text-zinc-200">Nº de orden</div>
                      </th>
                      {academicMonthsList.map((month) => (
                        <th key={month.label} colSpan={4} className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 py-2 text-center font-bold text-[8.5px]">
                          {month.label}
                        </th>
                      ))}
                      {/* Annual Summary */}
                      <th colSpan={4} className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 py-2 text-center font-bold bg-slate-100 dark:bg-zinc-800 print:bg-slate-100 dark:text-zinc-200">
                        Resumen Anual
                      </th>
                      <th colSpan={2} className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 py-2 text-center font-bold bg-slate-50 dark:bg-zinc-800/40 print:bg-slate-50 dark:text-zinc-200">
                        Porcentaje Anual
                      </th>
                    </tr>
                    {/* Row 2: Sub-columns */}
                    <tr className="bg-slate-50/50 dark:bg-zinc-900/50 print:bg-white text-slate-600 dark:text-zinc-400 border-b border-slate-300 dark:border-zinc-700 print:border-slate-800">
                      {academicMonthsList.map((month) => (
                        <React.Fragment key={month.label}>
                          <th className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 p-0 w-[14px]"><div className="vertical-text h-16">Asistencia</div></th>
                          <th className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 p-0 w-[14px]"><div className="vertical-text h-16">Tardanza</div></th>
                          <th className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 p-0 w-[14px]"><div className="vertical-text h-16">Ausencia</div></th>
                          <th className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 p-0 w-[14px]"><div className="vertical-text h-16">Excusa</div></th>
                        </React.Fragment>
                      ))}
                      {/* Annual Columns */}
                      <th className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 p-0 w-[14px] bg-slate-100 dark:bg-zinc-800 print:bg-slate-100"><div className="vertical-text h-16">Asistencia</div></th>
                      <th className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 p-0 w-[14px] bg-slate-100 dark:bg-zinc-800 print:bg-slate-100"><div className="vertical-text h-16">Tardanza</div></th>
                      <th className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 p-0 w-[14px] bg-slate-100 dark:bg-zinc-800 print:bg-slate-100"><div className="vertical-text h-16">Ausencia</div></th>
                      <th className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 p-0 w-[14px] bg-slate-100 dark:bg-zinc-800 print:bg-slate-100"><div className="vertical-text h-16">Excusa</div></th>

                      <th className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 p-0 w-[22px] bg-slate-50 dark:bg-zinc-800/40 print:bg-slate-50"><div className="vertical-text h-16">Asistencia</div></th>
                      <th className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 p-0 w-[22px] bg-slate-50 dark:bg-zinc-800/40 print:bg-slate-50"><div className="vertical-text h-16">Ausencia</div></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 45 }).map((_, idx) => {
                      const student = students[idx];
                      const annualStats = student ? calculateStudentAnnualStats(student.id) : null;

                      return (
                        <tr 
                          key={idx} 
                          className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 print:hover:bg-transparent group h-[18px] border-b border-slate-200 dark:border-zinc-800 print:border-slate-800"
                          onMouseEnter={student ? (e) => setHoveredStudent({ name: student.nombre, x: e.clientX, y: e.clientY }) : undefined}
                          onMouseLeave={student ? () => setHoveredStudent(null) : undefined}
                          onMouseMove={student ? (e) => setHoveredStudent({ name: student.nombre, x: e.clientX, y: e.clientY }) : undefined}
                        >
                          <td className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 text-center font-bold text-slate-800 dark:text-zinc-300 bg-slate-50/30 dark:bg-zinc-900/30 print:bg-white p-0 text-[8px] cursor-help" title={student ? student.nombre : ''}>
                            {idx + 1}
                          </td>

                          {academicMonthsList.map((month) => {
                            const stats = student ? calculateStudentMonthStats(student.id, month) : null;
                            return (
                              <React.Fragment key={month.label}>
                                <td className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 text-center text-slate-700 dark:text-zinc-300 font-medium p-0 text-[8px]">{stats?.p || ''}</td>
                                <td className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 text-center text-slate-700 dark:text-zinc-300 font-medium p-0 text-[8px]">{stats?.t || ''}</td>
                                <td className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 text-center text-slate-700 dark:text-zinc-300 font-medium p-0 text-[8px]">{stats?.a || ''}</td>
                                <td className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 text-center text-slate-700 dark:text-zinc-300 font-medium p-0 text-[8px]">{stats?.e || ''}</td>
                              </React.Fragment>
                            );
                          })}

                          {/* Annual Summary */}
                          <td className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 text-center font-bold bg-slate-100/40 dark:bg-zinc-900 print:bg-slate-100 text-slate-900 dark:text-zinc-200 p-0 text-[8px]">{annualStats?.p || ''}</td>
                          <td className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 text-center font-bold bg-slate-100/40 dark:bg-zinc-900 print:bg-slate-100 text-slate-900 dark:text-zinc-200 p-0 text-[8px]">{annualStats?.t || ''}</td>
                          <td className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 text-center font-bold bg-slate-100/40 dark:bg-zinc-900 print:bg-slate-100 text-slate-900 dark:text-zinc-200 p-0 text-[8px]">{annualStats?.a || ''}</td>
                          <td className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 text-center font-bold bg-slate-100/40 dark:bg-zinc-900 print:bg-slate-100 text-slate-900 dark:text-zinc-200 p-0 text-[8px]">{annualStats?.e || ''}</td>

                          {/* Percentages */}
                          <td className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 text-center font-bold bg-indigo-50/50 dark:bg-indigo-950/20 print:bg-indigo-50/50 text-indigo-700 dark:text-indigo-450 p-0 text-[8px]">{annualStats && (annualStats.p || annualStats.t || annualStats.a || annualStats.e) ? `${annualStats.rate}%` : ''}</td>
                          <td className="border border-slate-300 dark:border-zinc-700 print:border-slate-800 text-center font-bold bg-red-50/50 dark:bg-rose-950/20 print:bg-red-50/50 text-red-600 dark:text-rose-450 p-0 text-[8px]">{annualStats && (annualStats.p || annualStats.t || annualStats.a || annualStats.e) ? `${annualStats.absenceRate}%` : ''}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>

      {hoveredStudent && createPortal(
        <div
          className="fixed pointer-events-none z-[99999] transition-opacity duration-150 no-print"
          style={{
            left: `${hoveredStudent.x}px`,
            top: `${hoveredStudent.y}px`,
            transform: 'translate(-50%, -100%) translateY(-15px)'
          }}
        >
          <div className="bg-neutral-900 border border-neutral-800 text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap uppercase tracking-wider flex flex-col items-center">
            {hoveredStudent.name}
            <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 rotate-45 w-2.5 h-2.5 bg-neutral-900 border-r border-b border-neutral-800"></div>
          </div>
        </div>,
        document.body
      )}

      <ModalCreditos
        isOpen={showCreditsExhausted}
        onClose={() => setShowCreditsExhausted(false)}
        requiredCredits={creditsExhaustedInfo.required}
        currentCredits={creditsExhaustedInfo.current}
        actionName="ver el resumen acumulado anual"
      />
    </main>
  );
}

export default function AsistenciaWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Asistencia />
    </ErrorBoundary>
  );
}
