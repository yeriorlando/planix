import React, { useState, useMemo, useEffect, useCallback, useRef, Component } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { 
  Users, Plus, FileSpreadsheet, Sparkles, MessageCircle, AlertTriangle, 
  FileUp, FileDown, Trash2, Edit3, X, Check, Search, GraduationCap, 
  PlusCircle, RefreshCw, AlertCircle, Phone, Mail, User, Info, Save,
  ChevronRight, MoreVertical, ArrowLeft, History, ChevronDown, ChevronUp, Award, CalendarCheck, BookOpen, Clock, Zap, Trophy,
  Eye, FileText, TrendingUp, Printer, ShieldAlert, RotateCcw, Maximize, Minimize,
  BookText, Ruler, Globe, Leaf, Palette, Dumbbell, Heart, Languages
} from "lucide-react";
import { useRequireAuth } from "../lib/useRequireAuth";
import { 
  getClassrooms, 
  getAllClassroomsAdmin, 
  getStudents, 
  getAttendance,
  getOfficialGrades,
  syncOfficialGradesFromServer,
  saveOfficialGrades,
  OfficialGradeRecord,
  Classroom,
  Student
} from "../lib/storage";
import { 
  calculateCompetencyAverage, 
  calculateAreaAverage 
} from "../lib/utils/gradingCalculations";
import { generateBulletinsPDF } from "../lib/utils/bulletinGenerator";
import { consumeCredits, getCreditInfo } from "../lib/credits";
import { toast, Toaster } from "sonner";
import { OFFICIAL_DEFAULT_SUBJECTS } from "../lib/data/defaultSubjects";
import ModalCreditos from "../components/ai/ModalCreditos";

// Lucide icon mapping for subjects
const SUBJECT_ICON_MAP: Record<string, React.ReactNode> = {
  'lengua-espanola': <BookText className="h-4 w-4" />,
  'matematica': <Ruler className="h-4 w-4" />,
  'sociales': <Globe className="h-4 w-4" />,
  'naturales': <Leaf className="h-4 w-4" />,
  'educacion-artistica': <Palette className="h-4 w-4" />,
  'educacion-fisica': <Dumbbell className="h-4 w-4" />,
  'formacion-humana': <Heart className="h-4 w-4" />,
  'ingles': <Languages className="h-4 w-4" />,
  'lengua-espanola-sec': <BookText className="h-4 w-4" />,
  'matematica-sec': <Ruler className="h-4 w-4" />,
  'sociales-sec': <Globe className="h-4 w-4" />,
  'naturales-sec': <Leaf className="h-4 w-4" />,
  'educacion-artistica-sec': <Palette className="h-4 w-4" />,
  'educacion-fisica-sec': <Dumbbell className="h-4 w-4" />,
  'formacion-humana-sec': <Heart className="h-4 w-4" />,
};

const getSubjectIcon = (subjectId?: string, size: string = "h-4 w-4") => {
  if (!subjectId) return <BookOpen className={size} />;
  const icon = SUBJECT_ICON_MAP[subjectId];
  if (icon) return React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: size });
  return <BookOpen className={size} />;
};

const PRIMARY_COMPETENCIES = [
  {
    id: "C1",
    name: "Comunicativa",
    description: "Se comunica en diferentes contextos mediante un género textual adecuado, con el propósito de expresar sus ideas y pensamientos, haciendo uso de medios y recursos apropiados, de forma individual o colectiva."
  },
  {
    id: "C2",
    name: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Científica y Tecnológica",
    description: "Emplea textos variados (orales y escritos) en la construcción de nuevos conocimientos sobre temas y problemas de su vida social, con la finalidad de solucionarlos, a través de investigaciones científicas, y el uso de medios y recursos."
  },
  {
    id: "C3",
    name: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
    description: "Usa textos orales y escritos en demostración de conocimiento sobre las relaciones socioculturales, a fin de fortalecer su conocimiento y percepción del mundo, mediante de temas relacionados con salud, ambiente y comunidad, con el uso de medios y recursos tecnológicos y de otros tipos."
  }
];

const SECONDARY_COMPETENCIES = [
  {
    id: "PC1",
    name: "Competencia Específica 1",
    description: "Grupo de competencias específicas del área según el currículo del Nivel Secundario."
  },
  {
    id: "PC2",
    name: "Competencia Específica 2",
    description: "Grupo de competencias específicas del área según el currículo del Nivel Secundario."
  },
  {
    id: "PC3",
    name: "Competencia Específica 3",
    description: "Grupo de competencias específicas del área según el currículo del Nivel Secundario."
  },
  {
    id: "PC4",
    name: "Competencia Específica 4",
    description: "Grupo de competencias específicas del área según el currículo del Nivel Secundario."
  }
];

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
          <h2 className="text-lg font-bold mb-2">¡Error en Registro de Calificaciones!</h2>
          <pre className="text-xs overflow-auto font-mono whitespace-pre-wrap">{this.state.error?.stack || this.state.error?.message || String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function RegistroCalificaciones() {
  const user = useRequireAuth();
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

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

  // States imported from Estudiantes.tsx
  const [selectedRegSubject, setSelectedRegSubject] = useState<any>(null);
  const [showRegSubjectDropdown, setShowRegSubjectDropdown] = useState(false);
  const [activeCompetency, setActiveCompetency] = useState("C1");
  const [grades, setGrades] = useState<Record<string, Record<string, any>>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [showReportView, setShowReportView] = useState(false);
  const [isBoletinesModalOpen, setIsBoletinesModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [printType, setPrintType] = useState<"boletin" | "reporte" | null>(null);
  const [printStudentId, setPrintStudentId] = useState<string | "ALL" | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showCreditsExhausted, setShowCreditsExhausted] = useState(false);
  const [creditsExhaustedInfo, setCreditsExhaustedInfo] = useState({ required: 10, current: 0 });

  // Sync URL classId with activeClassId
  useEffect(() => {
    if (classId) {
      setActiveClassId(classId);
    }
  }, [classId]);

  // Load classrooms
  useEffect(() => {
    if (!user) return;
    const data = getClassrooms(user.id);
    setClassrooms(data);
  }, [user]);

  // Redirect if classId is missing from the URL
  useEffect(() => {
    if (classrooms.length > 0 && !classId) {
      const savedClassId = localStorage.getItem('activeClassId');
      const targetId = (savedClassId && classrooms.some(c => c.id === savedClassId)) 
        ? savedClassId 
        : classrooms[0].id;
      navigate(`/aula-virtual/registro-calificaciones/${targetId}`, { replace: true });
    }
  }, [classrooms, classId, navigate]);

  // Sync activeClassId to localStorage
  useEffect(() => {
    if (activeClassId) {
      localStorage.setItem('activeClassId', activeClassId);
    }
  }, [activeClassId]);

  const activeClassroom = useMemo(() => {
    if (!activeClassId) return null;
    return classrooms.find(c => c.id === activeClassId) || null;
  }, [classrooms, activeClassId]);

  const students = useMemo(() => {
    if (!activeClassId) return [];
    return getStudents(activeClassId);
  }, [activeClassId]);

  const profileSubjectsList = useMemo(() => {
    if (!activeClassroom) return [];
    const levelUpper = activeClassroom.nivel.toUpperCase();
    const gradeId = `${activeClassroom.nivel}-${activeClassroom.grado}`;
    
    let list = OFFICIAL_DEFAULT_SUBJECTS.filter((s) => s.level === levelUpper);
    if (user && user.allowed_subjects && user.allowed_subjects[gradeId]) {
      const allowed = user.allowed_subjects[gradeId];
      list = list.filter(s => allowed.includes(s.id));
    }
    return list;
  }, [activeClassroom, user]);

  const is12Primaria = useMemo(() => {
    if (!activeClassroom) return false;
    const levelStr = `${activeClassroom.nivel || ""} ${activeClassroom.grado || ""} ${activeClassroom.nombre || ""}`.toLowerCase();
    const isPrimaria = levelStr.includes("primari");
    let detectedGrade = 0;
    if (/1er|1ro|primer/i.test(levelStr)) detectedGrade = 1;
    else if (/2do|2ndo|segund/i.test(levelStr)) detectedGrade = 2;
    return isPrimaria && (detectedGrade === 1 || detectedGrade === 2);
  }, [activeClassroom]);

  // Handle subject list and set default
  useEffect(() => {
    if (profileSubjectsList.length > 0) {
      if (!selectedRegSubject || !profileSubjectsList.some(s => s.id === selectedRegSubject.id)) {
        setSelectedRegSubject(profileSubjectsList[0]);
      }
    } else {
      setSelectedRegSubject(null);
    }

    if (activeClassroom) {
      const isSec = activeClassroom.nivel === "secundaria";
      setActiveCompetency(isSec ? "PC1" : "C1");
    }
  }, [activeClassroom, profileSubjectsList]);

  // Load and seed grades
  useEffect(() => {
    if (!activeClassroom || !selectedRegSubject) return;
    
    // 1. Load from localStorage instantly
    const localRecords = getOfficialGrades(activeClassroom.id, selectedRegSubject.id);
    applyRecords(localRecords);

    // 2. Load from Supabase server in the background
    let active = true;
    syncOfficialGradesFromServer(activeClassroom.id, selectedRegSubject.id)
      .then((remoteRecords) => {
        if (active) {
          applyRecords(remoteRecords);
        }
      })
      .catch((err) => {
        console.error("Error loading grades from server:", err);
      });

    function applyRecords(records: OfficialGradeRecord[]) {
      const loaded: Record<string, Record<string, any>> = {};
      records.forEach(g => {
        if (!loaded[g.student_id]) loaded[g.student_id] = {};
        loaded[g.student_id][g.competency_id] = {
          p1: g.p1, rp1: g.rp1, p2: g.p2, rp2: g.rp2,
          p3: g.p3, rp3: g.rp3, p4: g.p4, rp4: g.rp4,
        };
        if (!loaded[g.student_id]["_subject"]) {
          loaded[g.student_id]["_subject"] = { rpf: null, rpe: null };
        }
        if (g.rpf !== undefined && g.rpf !== null) {
          loaded[g.student_id]["_subject"].rpf = g.rpf;
        }
        if (g.rpe !== undefined && g.rpe !== null) {
          loaded[g.student_id]["_subject"].rpe = g.rpe;
        }
      });
      setGrades(loaded);
      setHasUnsavedChanges(false);
      setLastSaved(null);
    }

    return () => {
      active = false;
    };
  }, [activeClassroom, selectedRegSubject, students]);

  const handleSaveAllGrades = useCallback((isAuto = false) => {
    if (!activeClassroom || !selectedRegSubject || Object.keys(grades).length === 0) return;
    setSaving(true);
    const records: OfficialGradeRecord[] = [];
    for (const studentId in grades) {
      const subjectData = grades[studentId]["_subject"] || {};
      const rpf = subjectData.rpf;
      const rpe = subjectData.rpe;

      for (const compId in grades[studentId]) {
        if (compId === "_subject") continue;
        const g = grades[studentId][compId];
        const avg = calculateCompetencyAverage([
          { p: g.p1, rp: is12Primaria ? null : g.rp1 }, 
          { p: g.p2, rp: is12Primaria ? null : g.rp2 },
          { p: g.p3, rp: is12Primaria ? null : g.rp3 }, 
          { p: g.p4, rp: is12Primaria ? null : g.rp4 },
        ]);
        records.push({
          student_id: studentId,
          classroom_id: activeClassroom.id,
          subject_id: selectedRegSubject.id,
          competency_id: compId,
          p1: g.p1, 
          rp1: is12Primaria ? null : g.rp1, 
          p2: g.p2, 
          rp2: is12Primaria ? null : g.rp2,
          p3: g.p3, 
          rp3: is12Primaria ? null : g.rp3, 
          p4: g.p4, 
          rp4: is12Primaria ? null : g.rp4,
          rpf: is12Primaria ? null : rpf,
          rpe: is12Primaria ? null : rpe,
          competency_average: avg,
          academic_year: activeClassroom.periodo,
        });
      }
    }
    saveOfficialGrades(records);
    setHasUnsavedChanges(false);
    setLastSaved(new Date());
    setSaving(false);
    if (!isAuto) toast.success("Registro guardado exitosamente.");
  }, [grades, activeClassroom, selectedRegSubject, is12Primaria]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(() => handleSaveAllGrades(true), 2000);
    }
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [grades, hasUnsavedChanges, handleSaveAllGrades]);

  const handleGradeChange = (studentId: string, competencyId: string, field: string, value: string) => {
    const numValue = value === "" ? null : Math.min(100, Math.max(0, parseInt(value) || 0));
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [competencyId]: {
          ...(prev[studentId]?.[competencyId] || {}),
          [field]: numValue
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSubjectGradeChange = (studentId: string, field: 'rpf' | 'rpe', value: string) => {
    const numValue = value === "" ? null : Math.min(100, Math.max(0, parseInt(value) || 0));
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        _subject: {
          ...(prev[studentId]?._subject || {}),
          [field]: numValue
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handlePrintReport = () => {
    setPrintType("reporte");
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintBoletin = async (studentId: string | "ALL") => {
    if (!activeClassroom) return;

    const allStr = `${activeClassroom.nivel || ""} ${activeClassroom.grado || ""} ${activeClassroom.nombre || ""}`.toLowerCase();
    const isPrimaria = allStr.includes("primari");
    let hasTemplate = false;
    if (isPrimaria) {
      if (/1er|1ro|primer|2do|2ndo|segund|3er|3ro|tercer|4to|cuart|5to|quint|6to|sext/i.test(allStr)) {
        hasTemplate = true;
      }
    }

    if (hasTemplate) {
      const toastId = toast.loading("Generando boletines oficiales en formato PDF...");
      try {
        const result = await generateBulletinsPDF(activeClassroom, studentId);
        if (result.success) {
          toast.success("¡Boletín generado con éxito!", { id: toastId });
        } else {
          if (result.error === "PLANTILLA_NO_DISPONIBLE") {
            toast.error("La plantilla oficial no está disponible para este grado.", { id: toastId });
          } else {
            toast.error(result.error || "Error al generar el boletín.", { id: toastId });
          }
        }
      } catch (err: any) {
        toast.error("Ocurrió un error inesperado al generar el PDF.", { id: toastId });
      }
    } else {
      setPrintType("boletin");
      setPrintStudentId(studentId);
      setTimeout(() => {
        window.print();
      }, 150);
    }
  };

  const renderReportTable = () => {
    if (!activeClassroom) return null;
    const isSecondary = activeClassroom.nivel === "secundaria";
    const COMPETENCIES = isSecondary ? SECONDARY_COMPETENCIES : PRIMARY_COMPETENCIES;
    const PASSING_GRADE = isSecondary ? 70 : 65;

    return (
      <div className="p-0 overflow-x-auto print:overflow-visible">
        <style dangerouslySetInnerHTML={{
          __html: `
            .report-table {
              width: 100%;
              border-collapse: collapse;
              font-family: Arial, sans-serif;
              font-size: 9.5px;
              background-color: #fff;
            }
            
            .report-table th, 
            .report-table td {
              border: 1px solid #000;
              padding: 4.5px 3px;
              text-align: center;
              vertical-align: middle;
            }
            
            .comp-header {
              text-align: left;
              font-weight: normal;
              font-size: 9.5px;
              vertical-align: top;
              padding: 6px 8px;
              background-color: #fff;
              border: 1px solid #000;
              min-height: auto;
            }
            
            .comp-circle {
              border: 1px solid #000;
              border-radius: 50%;
              width: 18px;
              height: 18px;
              display: inline-block;
              text-align: center;
              line-height: 16px;
              font-weight: bold;
              font-size: 9.5px;
              margin-right: 4px;
              vertical-align: top;
            }
            
            .comp-content {
              display: inline-block;
              vertical-align: top;
              width: calc(100% - 24px);
            }
            
            .comp-title {
              font-weight: bold;
              font-size: 9.5px;
              margin-bottom: 2px;
              line-height: 1.2;
              display: block;
            }
            
            .comp-desc {
              font-weight: normal;
              font-size: 8px;
              line-height: 1.2;
              color: #000;
              display: block;
            }
            
            .side-header {
              writing-mode: vertical-rl;
              transform: rotate(180deg);
              font-size: 8px;
              font-weight: bold;
              background-color: #fff;
              padding: 8px 4px;
              text-align: center;
              border: 1px solid #000;
              text-transform: uppercase;
              letter-spacing: 0.1px;
              line-height: 1.2;
            }
            
            .order-cell {
              font-weight: bold;
              font-size: 10px;
              color: #000;
              background-color: #fff;
              text-align: center;
              min-width: 24px;
              padding: 4px 3px;
            }
            
            .value-cell {
              min-width: 22px;
              font-size: 9.5px;
              background-color: #fff;
              padding: 4px 3px;
            }
            
            .recovery-value {
              color: #000;
            }
            
            .period-subheader {
              font-weight: bold;
              font-size: 9px;
              background-color: #fff;
              padding: 4px 3px;
              text-align: center;
              height: auto;
              line-height: 1;
            }
            
            .avg-section-header {
              font-size: 9.5px;
              font-weight: bold;
              text-align: center;
              background-color: #fff;
              border: 1px solid #000;
              padding: 4px;
            }
            
            .avg-column-header {
              background-color: #fff;
              border: 1px solid #000;
              padding: 4px 3px;
              text-align: center;
              vertical-align: bottom;
            }
            
            .avg-circle-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-end;
              gap: 3px;
            }
            
            .avg-comp-circle {
              border: 1px solid #000;
              border-radius: 50%;
              width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 8px;
              flex-shrink: 0;
            }
            
            .vertical-text-column {
              writing-mode: vertical-rl;
              transform: rotate(180deg);
              white-space: nowrap;
              font-size: 8px;
              font-weight: normal;
              display: inline-block;
            }
            
            .avg-cell {
              font-weight: bold;
              font-size: 9.5px;
              background-color: #fff;
              padding: 4px 3px;
            }
            
            .cal-section-header {
              font-size: 9.5px;
              font-weight: bold;
              text-align: center;
              background-color: #fff;
              border: 1px solid #000;
              padding: 4px;
            }
            
            .cal-column-header {
              background-color: #fff;
              border: 1px solid #000;
              padding: 4px 3px;
              text-align: center;
              vertical-align: bottom;
            }

            @media screen {
              .comp-header.comp-group-c1,
              .comp-header.comp-group-pc1,
              .period-subheader.comp-group-c1,
              .period-subheader.comp-group-pc1,
              .value-cell.comp-group-c1,
              .value-cell.comp-group-pc1 {
                background-color: rgba(219, 234, 254, 0.3) !important;
              }
              .comp-header.comp-group-c2,
              .comp-header.comp-group-pc2,
              .period-subheader.comp-group-c2,
              .period-subheader.comp-group-pc2,
              .value-cell.comp-group-c2,
              .value-cell.comp-group-pc2 {
                background-color: rgba(209, 250, 229, 0.3) !important;
              }
              .comp-header.comp-group-c3,
              .comp-header.comp-group-pc3,
              .period-subheader.comp-group-c3,
              .period-subheader.comp-group-pc3,
              .value-cell.comp-group-c3,
              .value-cell.comp-group-pc3 {
                background-color: rgba(254, 243, 199, 0.3) !important;
              }
              .comp-header.comp-group-pc4,
              .period-subheader.comp-group-pc4,
              .value-cell.comp-group-pc4 {
                background-color: rgba(237, 233, 254, 0.3) !important;
              }

              /* Dark theme overrides for screen mode */
              .dark .print-container {
                background-color: #09090b !important;
                color: #e4e4e7 !important;
              }
              .dark .report-table {
                background-color: #09090b !important;
                color: #e4e4e7 !important;
              }
              .dark .report-table th,
              .dark .report-table td {
                border-color: #27272a !important;
                color: #e4e4e7 !important;
              }
              .dark .comp-header {
                background-color: #09090b !important;
                border-color: #27272a !important;
              }
              .dark .comp-title {
                color: #f4f4f5 !important;
              }
              .dark .comp-desc {
                color: #a1a1aa !important;
              }
              .dark .comp-circle {
                border-color: #27272a !important;
                color: #e4e4e7 !important;
              }
              .dark .side-header {
                background-color: #09090b !important;
                border-color: #27272a !important;
                color: #e4e4e7 !important;
              }
              .dark .order-cell {
                background-color: #09090b !important;
                color: #e4e4e7 !important;
              }
              .dark .value-cell {
                background-color: #09090b !important;
                color: #e4e4e7 !important;
              }
              .dark .period-subheader {
                background-color: #09090b !important;
                color: #e4e4e7 !important;
              }
              .dark .avg-section-header {
                background-color: #09090b !important;
                border-color: #27272a !important;
                color: #e4e4e7 !important;
              }
              .dark .avg-column-header {
                background-color: #09090b !important;
                border-color: #27272a !important;
                color: #e4e4e7 !important;
              }
              .dark .avg-comp-circle {
                border-color: #27272a !important;
                color: #e4e4e7 !important;
              }
              .dark .avg-cell {
                background-color: #09090b !important;
                color: #e4e4e7 !important;
              }
              .dark .cal-section-header {
                background-color: #09090b !important;
                border-color: #27272a !important;
                color: #e4e4e7 !important;
              }
              .dark .cal-column-header {
                background-color: #09090b !important;
                border-color: #27272a !important;
                color: #e4e4e7 !important;
              }
              .dark input {
                background-color: #18181b !important;
                border-color: #27272a !important;
                color: #f4f4f5 !important;
              }
              .dark .text-slate-800 {
                color: #e4e4e7 !important;
              }
              
              .dark .comp-header.comp-group-c1,
              .dark .comp-header.comp-group-pc1,
              .dark .period-subheader.comp-group-c1,
              .dark .period-subheader.comp-group-pc1,
              .dark .value-cell.comp-group-c1,
              .dark .value-cell.comp-group-pc1 {
                background-color: rgba(30, 58, 138, 0.3) !important;
              }
              .dark .comp-header.comp-group-c2,
              .dark .comp-header.comp-group-pc2,
              .dark .period-subheader.comp-group-c2,
              .dark .period-subheader.comp-group-pc2,
              .dark .value-cell.comp-group-c2,
              .dark .value-cell.comp-group-pc2 {
                background-color: rgba(6, 78, 59, 0.3) !important;
              }
              .dark .comp-header.comp-group-c3,
              .dark .comp-header.comp-group-pc3,
              .dark .period-subheader.comp-group-c3,
              .dark .period-subheader.comp-group-pc3,
              .dark .value-cell.comp-group-c3,
              .dark .value-cell.comp-group-pc3 {
                background-color: rgba(120, 53, 4, 0.3) !important;
              }
              .dark .comp-header.comp-group-pc4,
              .dark .period-subheader.comp-group-pc4,
              .dark .value-cell.comp-group-pc4 {
                background-color: rgba(88, 28, 135, 0.3) !important;
              }
              .dark .recovery-value {
                color: #fbbf24 !important;
              }
            }
          `
        }} />

        <div className="print-container p-2 bg-white print:px-6 print:py-1">
          <div className="text-center font-bold text-lg mt-1 mb-5 uppercase tracking-widest pb-2 print:mt-2 print:mb-2 text-slate-800">
            REGISTRO DE EVALUACIÓN DE LOS APRENDIZAJES
          </div>

          <table className="report-table">
            <thead>
              {/* Row 1 */}
              <tr>
                <th rowSpan={3} className="side-header">
                  COMPETENCIAS FUNDAMENTALES<br />Y ESPECÍFICAS DEL GRADO
                </th>

                {COMPETENCIES.map((comp) => (
                  <th key={comp.id} colSpan={is12Primaria ? 4 : 8} rowSpan={2} className={`comp-header comp-group-${comp.id.toLowerCase()}`}>
                    <span className="comp-circle">{comp.id}</span>
                    <div className="comp-content">
                      <span className="comp-title text-slate-900">{comp.name}</span>
                      <span className="comp-desc text-slate-700">{comp.description}</span>
                    </div>
                  </th>
                ))}

                <th colSpan={COMPETENCIES.length} className="avg-section-header">
                  {isSecondary ? "Promedio de Competencias\nEspecíficas" : "Promedio del área\npor competencia"}
                </th>

                <th colSpan={is12Primaria ? 1 : 3} className="cal-section-header">
                  Calificación
                </th>
              </tr>

              {/* Row 2 */}
              <tr>
                {COMPETENCIES.map((comp, idx) => (
                  <th key={comp.id} rowSpan={2} className="avg-column-header">
                    <div className="avg-circle-wrapper">
                      <span className="vertical-text-column">{isSecondary ? `Competencia ${idx + 1}` : `Competencia ${idx + 1}`}</span>
                      <div className="avg-comp-circle">{comp.id}</div>
                    </div>
                  </th>
                ))}

                <th rowSpan={2} className="cal-column-header">
                  <span className="vertical-text-column font-bold">Final del área</span>
                </th>
                {!is12Primaria && (
                  <>
                    <th rowSpan={2} className="cal-column-header">
                      <span className="vertical-text-column font-bold">Recuperación final</span>
                    </th>
                    <th rowSpan={2} className="cal-column-header">
                      <span className="vertical-text-column font-bold">Recuperación especial</span>
                    </th>
                  </>
                )}
              </tr>

              {/* Row 3: P1, RP1, P2... */}
              <tr>
                {COMPETENCIES.map((comp) => {
                  const groupClass = `comp-group-${comp.id.toLowerCase()}`;
                  return (
                    <React.Fragment key={`${comp.id}-periods`}>
                      <th className={`period-subheader ${groupClass}`}>P1</th>
                      {!is12Primaria && <th className={`period-subheader ${groupClass}`}>RP1</th>}
                      <th className={`period-subheader ${groupClass}`}>P2</th>
                      {!is12Primaria && <th className={`period-subheader ${groupClass}`}>RP2</th>}
                      <th className={`period-subheader ${groupClass}`}>P3</th>
                      {!is12Primaria && <th className={`period-subheader ${groupClass}`}>RP3</th>}
                      <th className={`period-subheader ${groupClass}`}>P4</th>
                      {!is12Primaria && <th className={`period-subheader ${groupClass}`}>RP4</th>}
                    </React.Fragment>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {students.map((st, idx) => {
                const studentGrades = grades[st.id] || {};

                // Determine if student has any RP grade
                let hasAnyRp = false;
                COMPETENCIES.forEach(comp => {
                  const cData = studentGrades[comp.id];
                  if (cData) {
                    if (cData.rp1 !== null && cData.rp1 !== undefined && (cData.rp1 as any) !== '') hasAnyRp = true;
                    if (cData.rp2 !== null && cData.rp2 !== undefined && (cData.rp2 as any) !== '') hasAnyRp = true;
                    if (cData.rp3 !== null && cData.rp3 !== undefined && (cData.rp3 as any) !== '') hasAnyRp = true;
                    if (cData.rp4 !== null && cData.rp4 !== undefined && (cData.rp4 as any) !== '') hasAnyRp = true;
                  }
                });

                // Calculate averages including RP if exists (only if NOT 1st-2nd grade primary)
                const compAveragesWithRp = COMPETENCIES.map(comp => {
                  const cData = studentGrades[comp.id];
                  if (!cData) return null;
                  const effValues = [
                    (cData.rp1 !== null && cData.rp1 !== undefined && (cData.rp1 as any) !== '' && !is12Primaria) ? cData.rp1 : cData.p1,
                    (cData.rp2 !== null && cData.rp2 !== undefined && (cData.rp2 as any) !== '' && !is12Primaria) ? cData.rp2 : cData.p2,
                    (cData.rp3 !== null && cData.rp3 !== undefined && (cData.rp3 as any) !== '' && !is12Primaria) ? cData.rp3 : cData.p3,
                    (cData.rp4 !== null && cData.rp4 !== undefined && (cData.rp4 as any) !== '' && !is12Primaria) ? cData.rp4 : cData.p4,
                  ].map(v => v !== null && v !== undefined && (v as any) !== '' ? Number(v) : null)
                   .filter((v): v is number => v !== null && !isNaN(v));
                  if (effValues.length === 0) return null;
                  return Math.round(effValues.reduce((a, b) => a + b, 0) / effValues.length);
                });

                const compAverages = compAveragesWithRp;
                const finalAreaAvg = calculateAreaAverage(compAveragesWithRp);

                const subjectGrades = studentGrades["_subject"] || {};
                const rpfVal = subjectGrades.rpf ?? null;
                const rpeVal = subjectGrades.rpe ?? null;
                const isFailed = finalAreaAvg !== null && finalAreaAvg < PASSING_GRADE;

                return (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="order-cell" title={st.nombre}>
                      {st.numero_orden || idx + 1}
                    </td>

                    {COMPETENCIES.map((comp) => {
                      const g = studentGrades[comp.id] || {};
                      const groupClass = `comp-group-${comp.id.toLowerCase()}`;
                      return (
                        <React.Fragment key={comp.id}>
                          <td className={`value-cell ${groupClass}`}>{g.p1 ?? ''}</td>
                          {!is12Primaria && <td className={`value-cell recovery-value ${groupClass} font-bold text-amber-700`}>{g.rp1 ?? '—'}</td>}
                          <td className={`value-cell ${groupClass}`}>{g.p2 ?? ''}</td>
                          {!is12Primaria && <td className={`value-cell recovery-value ${groupClass} font-bold text-amber-700`}>{g.rp2 ?? '—'}</td>}
                          <td className={`value-cell ${groupClass}`}>{g.p3 ?? ''}</td>
                          {!is12Primaria && <td className={`value-cell recovery-value ${groupClass} font-bold text-amber-700`}>{g.rp3 ?? '—'}</td>}
                          <td className={`value-cell ${groupClass}`}>{g.p4 ?? ''}</td>
                          {!is12Primaria && <td className={`value-cell recovery-value ${groupClass} font-bold text-amber-700`}>{g.rp4 ?? '—'}</td>}
                        </React.Fragment>
                      );
                    })}

                    {compAverages.map((avg, cIdx) => (
                      <td key={cIdx} className="avg-cell">{avg ?? ''}</td>
                    ))}

                    <td className="avg-cell text-blue-800 bg-blue-50/10">{finalAreaAvg ?? ''}</td>
                    {!is12Primaria && (
                      <>
                        <td className="value-cell font-bold text-slate-800 bg-slate-50/20">
                          {isFailed ? (
                            <input 
                              type="number"
                              min={0}
                              max={100}
                              value={rpfVal === null ? "" : rpfVal}
                              onChange={e => handleSubjectGradeChange(st.id, 'rpf', e.target.value)}
                              className="w-12 h-7 text-center text-xs font-bold rounded border border-slate-350 text-slate-800 bg-white focus:border-brand-primary outline-none print:border-none print:bg-transparent"
                              placeholder="RPF"
                            />
                          ) : '—'}
                        </td>
                        <td className="value-cell font-bold text-slate-800 bg-slate-50/20">
                          {isFailed ? (
                            <input 
                              type="number"
                              min={0}
                              max={100}
                              value={rpeVal === null ? "" : rpeVal}
                              onChange={e => handleSubjectGradeChange(st.id, 'rpe', e.target.value)}
                              className="w-12 h-7 text-center text-xs font-bold rounded border border-slate-350 text-slate-800 bg-white focus:border-brand-primary outline-none print:border-none print:bg-transparent"
                              placeholder="RPE"
                            />
                          ) : '—'}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}

              {students.length === 0 && (
                <tr>
                  <td colSpan={1 + COMPETENCIES.length * (is12Primaria ? 4 : 8) + COMPETENCIES.length + (is12Primaria ? 1 : 3)} className="p-8 text-center text-muted-foreground italic">
                    No hay estudiantes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPrintableBoletines = () => {
    if (!activeClassroom) return null;
    const isSecondary = activeClassroom.nivel === "secundaria";
    const COMPETENCIES = isSecondary ? SECONDARY_COMPETENCIES : PRIMARY_COMPETENCIES;
    
    const studentsToPrint = printStudentId === "ALL" 
      ? students 
      : students.filter(s => s.id === printStudentId);
      
    const allGrades = JSON.parse(localStorage.getItem('plx:official_grades') || '[]');
    const classGrades = allGrades.filter((g: any) => g.classroom_id === activeClassroom.id);
    
    const gradesByStudent: Record<string, Record<string, Record<string, any>>> = {};
    classGrades.forEach((g: any) => {
      if (!gradesByStudent[g.student_id]) gradesByStudent[g.student_id] = {};
      if (!gradesByStudent[g.student_id][g.subject_id]) gradesByStudent[g.student_id][g.subject_id] = {};
      gradesByStudent[g.student_id][g.subject_id][g.competency_id] = g;
    });

    const attendanceRecords = getAttendance(activeClassroom.id);
    
    const calculateAttendanceStats = (studentId: string) => {
      const stats = {
        P1: { present: 0, absent: 0, total: 45 },
        P2: { present: 0, absent: 0, total: 40 },
        P3: { present: 0, absent: 0, total: 35 },
        P4: { present: 0, absent: 0, total: 40 }
      };

      const getPeriod = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        const month = date.getMonth() + 1;
        if (month >= 8 && month <= 10) return "P1";
        if (month >= 11 || month === 12 || month === 1) return "P2";
        if (month >= 2 && month <= 3) return "P3";
        if (month >= 4 && month <= 6) return "P4";
        return null;
      };

      attendanceRecords.forEach(att => {
        const period = getPeriod(att.fecha);
        if (!period) return;
        
        const status = att.registro[studentId];
        if (status === "P" || status === "T") {
          stats[period].present++;
        } else if (status === "A") {
          stats[period].absent++;
        }
      });

      return stats;
    };

    return (
      <div className="w-full bg-white text-black p-0 print:p-0">
        {studentsToPrint.map((student, sIdx) => {
          const sGrades = gradesByStudent[student.id] || {};
          const attStats = calculateAttendanceStats(student.id);
          
          return (
            <div
              key={student.id}
              className="bg-white p-8 border border-neutral-200 rounded-2xl shadow-sm mb-12 print:mb-0 print:border-0 print:shadow-none print:p-4"
              style={{ pageBreakAfter: sIdx < studentsToPrint.length - 1 ? "always" : "auto", minHeight: "27cm" }}
            >
              <div className="flex items-center justify-between border-b-4 border-double border-black pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center border border-slate-350 shrink-0">
                    <GraduationCap className="h-8 w-8 text-brand-primary" />
                  </div>
                  <div>
                    <h1 className="text-xs font-black uppercase tracking-wider leading-none">República Dominicana</h1>
                    <h2 className="text-[10px] font-bold uppercase text-slate-700 mt-1">Ministerio de Educación (MINERD)</h2>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Informe de Aprendizaje y Rendimiento Escolar</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm">
                    BOLETÍN OFICIAL
                  </div>
                  <p className="text-[9px] font-bold text-slate-800 mt-1">Año Lectivo: {activeClassroom.periodo}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[7.5px]">Estudiante</span>
                  <span className="font-bold text-slate-900 text-[11px]">{student.nombre} {student.apellido || ""}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[7.5px]">Centro Educativo</span>
                  <span className="font-bold text-slate-800">{user?.colegio || "Colegio Santo Domingo"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[7.5px]">Nivel y Grado</span>
                  <span className="font-bold text-slate-800 uppercase">{activeClassroom.nombre}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[7.5px]">RNE / Código</span>
                  <span className="font-mono text-slate-600 font-bold">{student.rne_matricula || `RNE-${student.numero_orden || sIdx + 1}`}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <table className="w-full border-collapse border border-black text-center text-[9px] font-sans">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-black p-2 font-black uppercase text-left w-36">Asignatura</th>
                      <th className="border border-black p-2 font-black uppercase text-left w-48">Competencia Específica</th>
                      <th className="border border-black p-1.5 font-bold">P1</th>
                      <th className="border border-black p-1.5 font-bold text-amber-700 bg-amber-50/20">RP1</th>
                      <th className="border border-black p-1.5 font-bold">P2</th>
                      <th className="border border-black p-1.5 font-bold text-amber-700 bg-amber-50/20">RP2</th>
                      <th className="border border-black p-1.5 font-bold">P3</th>
                      <th className="border border-black p-1.5 font-bold text-amber-700 bg-amber-50/20">RP3</th>
                      <th className="border border-black p-1.5 font-bold">P4</th>
                      <th className="border border-black p-1.5 font-bold text-amber-700 bg-amber-50/20">RP4</th>
                      <th className="border border-black p-2 font-black bg-blue-50 text-brand-primary">CALIF. FINAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileSubjectsList.map((subj) => {
                      const subjGrades = sGrades[subj.id] || {};
                      const compAverages = COMPETENCIES.map(comp => {
                        const g = subjGrades[comp.id] || {};
                        return calculateCompetencyAverage([
                          { p: g.p1, rp: g.rp1 }, { p: g.p2, rp: g.rp2 },
                          { p: g.p3, rp: g.rp3 }, { p: g.p4, rp: g.rp4 }
                        ]);
                      });
                      
                      const finalAreaAvg = calculateAreaAverage(compAverages);
                      
                      return COMPETENCIES.map((comp, compIdx) => {
                        const g = subjGrades[comp.id] || {};
                        const isFirst = compIdx === 0;
                        
                        return (
                          <tr key={`${subj.id}-${comp.id}`}>
                            {isFirst && (
                              <td
                                rowSpan={COMPETENCIES.length}
                                className="border border-black p-2 font-bold text-left bg-slate-50/35 leading-tight w-36 align-middle"
                              >
                                {subj.name}
                              </td>
                            )}
                            
                            <td className="border border-black p-2 text-left w-48 font-medium">
                              <span className="font-bold text-slate-800">{comp.id}</span> — {comp.name}
                            </td>
                            
                            <td className="border border-black p-1.5">{g.p1 !== null && g.p1 !== undefined ? g.p1 : ""}</td>
                            <td className="border border-black p-1.5 text-amber-700 bg-amber-50/10 font-bold">{g.rp1 !== null && g.rp1 !== undefined ? g.rp1 : "—"}</td>
                            <td className="border border-black p-1.5">{g.p2 !== null && g.p2 !== undefined ? g.p2 : ""}</td>
                            <td className="border border-black p-1.5 text-amber-700 bg-amber-50/10 font-bold">{g.rp2 !== null && g.rp2 !== undefined ? g.rp2 : "—"}</td>
                            <td className="border border-black p-1.5">{g.p3 !== null && g.p3 !== undefined ? g.p3 : ""}</td>
                            <td className="border border-black p-1.5 text-amber-700 bg-amber-50/10 font-bold">{g.rp3 !== null && g.rp3 !== undefined ? g.rp3 : "—"}</td>
                            <td className="border border-black p-1.5">{g.p4 !== null && g.p4 !== undefined ? g.p4 : ""}</td>
                            <td className="border border-black p-1.5 text-amber-700 bg-amber-50/10 font-bold">{g.rp4 !== null && g.rp4 !== undefined ? g.rp4 : "—"}</td>
                            
                            {isFirst && (
                              <td
                                rowSpan={COMPETENCIES.length}
                                className="border border-black p-2 font-black text-center bg-brand-primary/5 text-brand-primary text-xs align-middle"
                              >
                                {finalAreaAvg !== null ? finalAreaAvg : "—"}
                              </td>
                            )}
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mt-6 items-start">
                <div className="sm:col-span-6">
                  <h4 className="font-black text-[9px] uppercase tracking-wide text-slate-800 mb-2">Asistencia Escolar</h4>
                  <table className="w-full border-collapse border border-black text-center text-[8.5px]">
                    <thead>
                      <tr className="bg-slate-50 font-bold">
                        <th className="border border-black p-1">Periodo</th>
                        <th className="border border-black p-1">Días Laborados</th>
                        <th className="border border-black p-1">Asistencias</th>
                        <th className="border border-black p-1">Ausencias</th>
                        <th className="border border-black p-1">% Asist.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {["P1", "P2", "P3", "P4"].map(p => {
                        const s = attStats[p as keyof typeof attStats];
                        const pct = s.present + s.absent > 0 
                          ? Math.round((s.present / (s.present + s.absent)) * 100) 
                          : 100;
                        return (
                          <tr key={p}>
                            <td className="border border-black p-1 font-bold">{p}</td>
                            <td className="border border-black p-1">{s.total}</td>
                            <td className="border border-black p-1">{s.present}</td>
                            <td className="border border-black p-1">{s.absent}</td>
                            <td className="border border-black p-1 font-bold">{pct}%</td>
                          </tr>
                        );
                      })}
                      {(() => {
                        const totalDays = attStats.P1.total + attStats.P2.total + attStats.P3.total + attStats.P4.total;
                        const totalPresent = attStats.P1.present + attStats.P2.present + attStats.P3.present + attStats.P4.present;
                        const totalAbsent = attStats.P1.absent + attStats.P2.absent + attStats.P3.absent + attStats.P4.absent;
                        const totalPct = totalPresent + totalAbsent > 0
                          ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100)
                          : 100;
                        return (
                          <tr className="bg-slate-100 font-bold">
                            <td className="border border-black p-1 uppercase">TOTAL</td>
                            <td className="border border-black p-1">{totalDays}</td>
                            <td className="border border-black p-1">{totalPresent}</td>
                            <td className="border border-black p-1">{totalAbsent}</td>
                            <td className="border border-black p-1 text-brand-primary font-black">{totalPct}%</td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
                
                <div className="sm:col-span-6 grid grid-cols-2 gap-4 mt-4 text-center">
                  <div className="border-t border-black pt-2 mt-8 text-[8px] font-bold">
                    Firma del Docente
                  </div>
                  <div className="border-t border-black pt-2 mt-8 text-[8px] font-bold">
                    Firma del Director(a)
                  </div>
                  <div className="col-span-2 mt-2">
                    <div className="w-16 h-16 border-2 border-dashed border-slate-350 rounded-full mx-auto flex items-center justify-center text-[7px] text-slate-400 font-bold uppercase select-none">
                      Sello Centro
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[8px] text-slate-400 font-semibold tracking-wide">
                Documento de control académico generado oficialmente por Planix® • República Dominicana
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Dynamic Page Orientation Injection
  useEffect(() => {
    const styleId = "dynamic-print-style";
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    if (printType === "boletin") {
      styleEl.innerHTML = `
        @media print {
          @page { size: portrait; margin: 0.5cm; }
          body { background-color: #fff; color: #000; }
          .print-view { display: block !important; }
          .print\\:hidden { display: none !important; }
        }
      `;
    } else if (printType === "reporte") {
      styleEl.innerHTML = `
        @media print {
          @page { size: landscape; margin: 0.5cm; }
          body { background-color: #fff; color: #000; }
          .print-view { display: block !important; }
          .print\\:hidden { display: none !important; }
        }
      `;
    } else {
      styleEl.innerHTML = "";
    }

    return () => {
      if (styleEl) styleEl.innerHTML = "";
    };
  }, [printType]);

  // Handle window.afterprint to clean up orientation
  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintType(null);
      setPrintStudentId(null);
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  if (!activeClassroom) {
    return (
      <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
        isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
      }`}>
        <div className="bg-white/70 backdrop-blur-md border border-black/5 rounded-3xl p-10 text-center font-bold text-lg text-slate-800 shadow-sm">
          No hay aulas disponibles o no se ha seleccionado ninguna.
        </div>
      </main>
    );
  }

  const isSecondary = activeClassroom.nivel === "secundaria";
  const COMPETENCIES = isSecondary ? SECONDARY_COMPETENCIES : PRIMARY_COMPETENCIES;
  const PASSING_GRADE = isSecondary ? 70 : 65;
  const levelLabel = activeClassroom.nivel === "inicial" ? "Inicial" : activeClassroom.nivel === "primaria" ? "Primaria" : "Secundaria";

  if (showReportView) {
    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 400));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
    const handleResetZoom = () => setZoomLevel(100);
    const toggleFullScreen = () => {
      setIsFullScreen(prev => {
        if (prev) setZoomLevel(100);
        return !prev;
      });
    };

    return (
      <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
        isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
      }`}>
        <Toaster position="top-center" richColors />
        <div className={`space-y-6 pt-6 ${isFullScreen ? "fixed inset-0 z-50 bg-white dark:bg-zinc-950 overflow-auto p-8" : ""}`}>
          {/* Header Toolbar */}
          <div className="relative flex flex-col items-center justify-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-sm print:hidden w-full gap-4">
            {/* Left: Volver */}
            <div className="w-full md:w-auto md:absolute md:left-6 md:top-1/2 md:-translate-y-1/2 flex justify-center md:justify-start">
              <button
                onClick={() => {
                  setShowReportView(false);
                  setIsFullScreen(false);
                }}
                className="bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 dark:text-zinc-200 rounded-full px-4 py-2 flex items-center justify-center shadow-sm font-bold text-[13px] transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver al Registro
              </button>
            </div>

            {/* Center Content: Title, Subtitle, and Controls underneath */}
            <div className="flex flex-col items-center text-center">
              <h1 className="text-xl font-black text-slate-900 dark:text-zinc-100 uppercase tracking-wider leading-none">Reporte de Evaluación</h1>
              <p className="text-sm text-slate-500 dark:text-zinc-400 font-bold mt-1.5">{selectedRegSubject?.name} — {activeClassroom.nombre}</p>
              
              {/* Controls Row */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-zinc-950 rounded-xl p-1 shadow-inner border border-slate-200 dark:border-zinc-800">
                  <button onClick={handleZoomOut} disabled={zoomLevel <= 50} className="h-8 w-8 p-0 flex items-center justify-center bg-transparent border-none cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900 dark:text-zinc-350 rounded-lg disabled:opacity-40" title="Alejar">
                    <Minimize className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-bold min-w-[40px] text-center text-slate-700 dark:text-zinc-300">{zoomLevel}%</span>
                  <button onClick={handleZoomIn} disabled={zoomLevel >= 400} className="h-8 w-8 p-0 flex items-center justify-center bg-transparent border-none cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900 dark:text-zinc-350 rounded-lg disabled:opacity-40" title="Acercar">
                    <Maximize className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={handleResetZoom} className="h-8 w-8 p-0 flex items-center justify-center bg-transparent border-none cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900 dark:text-zinc-350 rounded-lg" title="Restablecer">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <button
                  onClick={toggleFullScreen}
                  className="bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 dark:text-zinc-200 h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold uppercase transition-colors cursor-pointer shadow-sm"
                >
                  {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  <span>{isFullScreen ? "Salir Pantalla" : "Pantalla Completa"}</span>
                </button>

                <button
                  onClick={handlePrintReport}
                  className="bg-brand-primary hover:bg-brand-hover text-white font-bold px-4 py-2 rounded-full flex items-center gap-2 text-[13px] border-none cursor-pointer shadow-sm transition-colors"
                >
                  <Printer className="h-4 w-4" /> Imprimir Reporte
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Container with Zoom */}
          <div className="overflow-x-auto w-full border border-black/5 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 shadow-sm p-2 print:border-0 print:shadow-none print:p-0">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top left",
                transition: "transform 0.2s ease-in-out",
                width: "fit-content"
              }}
            >
              {renderReportTable()}
            </div>
          </div>

          {/* Print only container wrapped in print-view */}
          <div className="hidden print:block print-view">
            {renderReportTable()}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <Toaster position="top-center" richColors />

      {printType === "boletin" && (
        <div className="hidden print:block print-view w-full">
          {renderPrintableBoletines()}
        </div>
      )}

      <div className="space-y-6 pt-6 animate-in fade-in duration-200 print:hidden">
        {/* Header con Dropdown de Aulas */}
        <div className="flex flex-col gap-4 text-center relative pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="absolute top-0 left-0">
            <button 
              onClick={() => navigate(`/aula-virtual`)}
              className="bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 dark:text-zinc-200 rounded-full px-4 py-2 font-bold text-[13px] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none"
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
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-sm cursor-pointer"
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
                          {classrooms.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setShowClassroomDropdown(false);
                                navigate(`/aula-virtual/registro-calificaciones/${c.id}`);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                c.id === activeClassId
                                  ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-zinc-100"
                                  : "text-slate-750 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                              }`}
                            >
                              <Users size={14} className={c.id === activeClassId ? "text-slate-800 dark:text-zinc-200" : "text-slate-400 dark:text-zinc-500"} />
                              <span className="truncate">{c.nombre}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-zinc-100 tracking-wider leading-none">
              Registro de Calificaciones
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold mt-1.5">
              Registro de calificaciones por asignatura, competencia y periodo del año escolar.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-sm px-4 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-primary" />
                <span className="text-xs font-bold text-brand-primary">{activeClassroom.nombre}</span>
              </div>
              <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800" />
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">{activeSchoolYear}</span>
              </div>
            </div>

            {profileSubjectsList.length > 1 ? (
              <div className="relative select-none">
                <button 
                  onClick={() => setShowRegSubjectDropdown(!showRegSubjectDropdown)}
                  className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-sm px-4 py-2 rounded-xl hover:border-brand-primary/30 dark:hover:border-zinc-700 transition text-xs font-bold text-slate-800 dark:text-zinc-200 cursor-pointer"
                >
                  <span className="shrink-0">{getSubjectIcon(selectedRegSubject?.id, "h-4 w-4")}</span>
                  <span>{selectedRegSubject?.name || "Seleccionar Asignatura"}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${showRegSubjectDropdown ? "rotate-180" : ""}`} />
                </button>
                {showRegSubjectDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowRegSubjectDropdown(false)} />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-xl rounded-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100 text-left">
                      <div className="space-y-0.5">
                        {profileSubjectsList.map(s => (
                          <button 
                            key={s.id} 
                            onClick={() => { setSelectedRegSubject(s); setShowRegSubjectDropdown(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                              selectedRegSubject?.id === s.id 
                                ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-zinc-100" 
                                : "text-slate-750 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <span className="shrink-0">{getSubjectIcon(s.id, "h-4 w-4")}</span>
                            <span className="truncate">{s.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : profileSubjectsList.length === 1 ? (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-indigo-950/20 border border-blue-100 dark:border-indigo-900/30 rounded-xl px-4 py-2 text-xs font-bold text-brand-primary dark:text-indigo-400">
                <span className="shrink-0">{getSubjectIcon(profileSubjectsList[0].id, "h-4 w-4")}</span>
                <span>{profileSubjectsList[0].name}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Subject + Save Bar */}
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-black/5 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-800 dark:text-zinc-200">
              <span className="shrink-0">{getSubjectIcon(selectedRegSubject?.id, "h-5 w-5")}</span>
              <span>Registro de Evaluación: {selectedRegSubject?.name}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
              Criterio: <span className="text-brand-primary font-bold">{COMPETENCIES.find(c => c.id === activeCompetency)?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {saving ? (
              <span className="text-[10px] uppercase font-bold px-3 py-1.5 bg-blue-50 dark:bg-indigo-950/20 border border-blue-200 dark:border-indigo-900/30 text-blue-600 dark:text-indigo-400 rounded-md animate-pulse">Sincronizando...</span>
            ) : hasUnsavedChanges ? (
              <span className="inline-flex items-center text-[10px] uppercase font-bold px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-450 rounded-md"><AlertCircle className="h-3.5 w-3.5 mr-1" />Pendiente de Guardado</span>
            ) : lastSaved ? (
              <span className="inline-flex items-center text-[10px] uppercase font-bold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md"><Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />Guardado</span>
            ) : (
              <span className="inline-flex items-center text-[10px] uppercase font-bold px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 rounded-md"><Info className="h-3.5 w-3.5 mr-1" />Sin cambios</span>
            )}
            <button 
              onClick={() => handleSaveAllGrades(false)} 
              disabled={saving} 
              className="bg-brand-primary hover:bg-brand-hover text-white font-bold text-xs h-8 px-4 rounded-xl flex items-center gap-1.5 border-none cursor-pointer shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" /> Guardar Ahora
            </button>
          </div>
        </div>

        {/* Competency Tabs and Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {COMPETENCIES.map(comp => {
              const isActive = activeCompetency === comp.id;
              return (
                <button 
                  key={comp.id} 
                  onClick={() => setActiveCompetency(comp.id)}
                  className={`h-8 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer select-none border shadow-sm active:scale-95 flex items-center justify-center ${
                    isActive 
                      ? "bg-brand-primary text-white border-transparent font-extrabold shadow-md hover:bg-brand-hover" 
                      : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-350 hover:text-slate-800 dark:hover:text-zinc-100 border-black/10 dark:border-zinc-800 hover:border-black/15 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  Competencia {comp.id}
                </button>
              );
            })}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsBoletinesModalOpen(true)}
              className="bg-brand-primary hover:bg-brand-hover text-white flex items-center justify-center font-bold text-[13px] px-4 py-2 rounded-full gap-1.5 cursor-pointer shadow-sm border-none transition-colors"
            >
              <Printer className="h-3.5 w-3.5" /> Boletines oficiales
            </button>

             <button
              onClick={() => {
                const canProceed = consumeCredits('grades_report');
                if (canProceed) {
                  setShowReportView(true);
                } else {
                  const info = getCreditInfo('grades_report');
                  setCreditsExhaustedInfo({ required: info.cost, current: info.currentCredits });
                  setShowCreditsExhausted(true);
                }
              }}
              className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-brand-primary dark:text-indigo-400 flex items-center justify-center font-bold text-[13px] px-4 py-2 rounded-full gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <FileText className="h-3.5 w-3.5" /> Reporte de Evaluación
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-3 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 w-fit">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-50 dark:bg-rose-950/30 border border-red-200 dark:border-rose-900/50 rounded-sm" /><span className="text-rose-700 dark:text-rose-450">Pendiente de RP</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-50 dark:bg-emerald-950/30 border border-green-200 dark:border-emerald-900/50 rounded-sm" /><span className="text-green-700 dark:text-emerald-450">Recuperado</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-sm" /><span className="text-amber-700 dark:text-amber-450">RP Registrada</span></div>
        </div>

        {/* Grading Table */}
        <div className="bg-white dark:bg-zinc-950 border border-black/5 dark:border-zinc-800 rounded-[calc(var(--radius)+8px)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800">
                  <th className="p-3.5 font-bold text-center w-14 text-slate-800 dark:text-zinc-300">#</th>
                  <th className="p-3.5 font-bold min-w-[200px] text-slate-800 dark:text-zinc-200">Estudiante</th>
                  {[1,2,3,4].map(p => {
                    const colors = ["text-blue-700 dark:text-blue-400","text-emerald-700 dark:text-emerald-400","text-amber-700 dark:text-amber-400","text-purple-700 dark:text-purple-400"];
                    const bgs = ["bg-blue-50/25 dark:bg-blue-950/20","bg-emerald-50/25 dark:bg-emerald-950/20","bg-amber-50/25 dark:bg-amber-950/20","bg-purple-50/25 dark:bg-purple-950/20"];
                    return (
                      <th key={p} className={`p-2.5 border-l border-slate-200 dark:border-zinc-800 text-center ${bgs[p-1]}`} colSpan={is12Primaria ? 1 : 2}>
                        <div className={`text-[8.5px] font-black uppercase tracking-wider mb-1 opacity-85 ${colors[p-1]}`}>Periodo {p}</div>
                        <div className="flex justify-center text-[10px] gap-4">
                          <span className={`w-12 text-center font-bold ${colors[p-1]}`}>P{p}</span>
                          {!is12Primaria && <span className="w-12 text-center font-bold text-orange-600 dark:text-orange-400">RP{p}</span>}
                        </div>
                      </th>
                    );
                  })}
                  <th className="p-3.5 font-bold text-center bg-brand-primary text-white min-w-[100px]">
                    <div className="text-[8.5px] opacity-90 uppercase font-black">Promedio</div>
                    <div className="text-[10px] font-black uppercase">Acumulado</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => {
                  const sg = grades[st.id]?.[activeCompetency] || {};
                  const avg = calculateCompetencyAverage([
                    { p: sg.p1, rp: is12Primaria ? null : sg.rp1 }, 
                    { p: sg.p2, rp: is12Primaria ? null : sg.rp2 },
                    { p: sg.p3, rp: is12Primaria ? null : sg.rp3 }, 
                    { p: sg.p4, rp: is12Primaria ? null : sg.rp4 },
                  ]);
                  const periodsStatus = [1,2,3,4].map(p => {
                    const pVal = sg[`p${p}` as keyof any] ?? null;
                    const rpVal = sg[`rp${p}` as keyof any] ?? null;
                    if (pVal !== null && (pVal as number) < PASSING_GRADE) {
                      return (rpVal !== null && (rpVal as number) >= PASSING_GRADE) ? "recovered" : "pending";
                    }
                    return "ok";
                  });
                  const statusIcon = periodsStatus.includes("pending")
                    ? <AlertCircle className="h-3.5 w-3.5 text-rose-500 animate-pulse shrink-0" />
                    : periodsStatus.includes("recovered")
                    ? <Check className="h-3.5 w-3.5 text-green-600 shrink-0 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-full p-0.5" />
                    : null;

                  return (
                    <tr key={st.id} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="p-3 text-center font-medium text-slate-450 dark:text-zinc-500">{st.numero_orden || idx + 1}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-zinc-200">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/aula-virtual/perfil/${st.id}`)}
                            className="text-left font-bold text-slate-800 dark:text-zinc-200 hover:text-blue-700 dark:hover:text-indigo-400 transition-colors cursor-pointer bg-transparent border-none p-0"
                          >
                            {st.nombre} {st.apellido || ""}
                          </button>
                          {statusIcon}
                        </div>
                      </td>
                      {[1,2,3,4].map(p => {
                        const pKey = `p${p}`;
                        const rpKey = `rp${p}`;
                        const pVal = sg[pKey] ?? null;
                        const rpVal = sg[rpKey] ?? null;
                        const isLow = pVal !== null && (pVal as number) < PASSING_GRADE;
                        return (
                          <td key={p} className="p-2 border-l border-slate-100 dark:border-zinc-800" colSpan={is12Primaria ? 1 : 2}>
                            <div className="flex justify-center gap-2">
                              <input 
                                type="number" 
                                min={0} 
                                max={100}
                                value={pVal === null ? "" : pVal}
                                onChange={e => handleGradeChange(st.id, activeCompetency, pKey, e.target.value)}
                                className={`w-12 h-9 text-center text-xs font-bold rounded-lg border transition-all outline-none ${
                                  rpVal !== null ? "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600 line-through opacity-60"
                                  : isLow ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 focus:border-red-400"
                                  : pVal !== null && (pVal as number) >= PASSING_GRADE ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-emerald-400 focus:border-green-400"
                                  : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 focus:border-brand-primary dark:focus:border-indigo-500"
                                }`}
                                placeholder={`P${p}`} 
                              />
                              {!is12Primaria && (
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    min={0} 
                                    max={100}
                                    value={rpVal === null ? "" : rpVal}
                                    onChange={e => handleGradeChange(st.id, activeCompetency, rpKey, e.target.value)}
                                    className={`w-12 h-9 text-center text-xs font-bold rounded-lg border transition-all outline-none ${
                                      rpVal !== null ? "border-amber-250 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-450"
                                      : "border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400"
                                    }`}
                                    placeholder="RP" 
                                  />
                                  {rpVal !== null && (rpVal as number) >= PASSING_GRADE && (
                                    <Check className="absolute -top-1 -right-1 h-3 w-3 text-white bg-green-600 border border-green-700 dark:border-green-800 rounded-full p-0.2 shrink-0" />
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-3 bg-brand-primary/5 dark:bg-indigo-950/20 text-center font-black text-brand-primary dark:text-indigo-400 text-sm">
                        {avg !== null ? avg : "—"}
                        {avg !== null && <div className="text-[8px] text-slate-500 dark:text-zinc-450 font-normal mt-0.5 tracking-wide">Promedio</div>}
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr><td colSpan={11} className="py-12 text-center text-slate-400 dark:text-zinc-500 font-semibold italic">No hay alumnos inscritos en esta aula.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-blue-50/40 dark:bg-indigo-950/10 border border-blue-100 dark:border-indigo-900/20 rounded-2xl flex items-start gap-3.5 shadow-xs">
            <div className="bg-brand-primary p-2.5 rounded-xl text-white"><Info className="h-5 w-5" /></div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">Resumen de Evaluación Curricular</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-1 leading-relaxed">
                {isSecondary
                  ? "La Calificación Final se calcula promediando las 4 competencias específicas (PC1 + PC2 + PC3 + PC4) / 4."
                  : "La Calificación Final del Área se calcula promediando las 3 competencias fundamentales (C1 + C2 + C3) / 3."}
              </p>
              <span className="inline-flex mt-2 text-[9px] font-black uppercase tracking-wider bg-blue-100 dark:bg-indigo-950/40 text-blue-800 dark:text-indigo-300 border border-blue-200 dark:border-indigo-900/40 px-2 py-0.5 rounded-md leading-none">Mínimo para aprobar: {PASSING_GRADE} pts</span>
            </div>
          </div>
          <div className="p-5 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl flex items-start gap-3.5 shadow-xs">
            <div className="bg-amber-500 p-2.5 rounded-xl text-white"><AlertCircle className="h-5 w-5" /></div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">Normativa de Recuperación Pedagógica (RP)</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-1 leading-relaxed italic">
                "Si un estudiante obtiene una calificación menor a la nota mínima de aprobación en un período (P), se activa la Recuperación Pedagógica (RP). El valor obtenido en la RP reemplaza al del período correspondiente para los cálculos de promedios."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Impresión de Boletines Modal */}
      {isBoletinesModalOpen && (
        <div 
          onClick={() => setIsBoletinesModalOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 print:hidden"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-md w-full shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200"
          >
            <button 
              onClick={() => setIsBoletinesModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:bg-[#B3172A] bg-[#D31B32] border-none rounded-full p-1.5 transition cursor-pointer shadow-sm active:scale-95"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-indigo-950/20 border border-blue-100 dark:border-indigo-900/30 text-brand-primary dark:text-indigo-400 rounded-full flex items-center justify-center">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-zinc-100 leading-none">Impresión de Boletines</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-1">Generar boletines oficiales del MINERD</p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <button
                onClick={() => {
                  setIsBoletinesModalOpen(false);
                  handlePrintBoletin("ALL");
                }}
                className="w-full bg-brand-primary hover:bg-brand-hover text-white border border-transparent text-xs font-bold h-10 px-4 rounded-xl shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Imprimir Todos los Boletines ({students.length})
              </button>
              
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">O por estudiante</span>
                <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {students.map((st, sIdx) => (
                  <div key={st.id} className="flex items-center justify-between p-2 rounded-xl border border-black/5 dark:border-zinc-800/50 bg-slate-50/30 dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-900 text-[10px] font-bold text-slate-500 dark:text-zinc-400 flex items-center justify-center shrink-0">
                        {st.numero_orden || sIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate pr-4">
                        {st.nombre} {st.apellido || ""}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsBoletinesModalOpen(false);
                        handlePrintBoletin(st.id);
                      }}
                      className="bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-black/10 dark:border-zinc-800 text-[10.5px] font-bold h-7.5 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95 shrink-0"
                    >
                      <Printer className="h-3 w-3" /> Imprimir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <ModalCreditos
        isOpen={showCreditsExhausted}
        onClose={() => setShowCreditsExhausted(false)}
        requiredCredits={creditsExhaustedInfo.required}
        currentCredits={creditsExhaustedInfo.current}
        actionName="ver el reporte de evaluación"
      />
    </main>
  );
}

export default function RegistroCalificacionesWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <RegistroCalificaciones />
    </ErrorBoundary>
  );
}
