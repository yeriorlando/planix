import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { 
  Users, Plus, FileSpreadsheet, Sparkles, MessageCircle, AlertTriangle, 
  FileUp, FileDown, Trash2, Edit3, X, Check, Search, GraduationCap, 
  PlusCircle, RefreshCw, AlertCircle, Phone, Mail, User, Info, Save,
  ChevronRight, MoreVertical, ArrowLeft, History, ChevronDown, ChevronUp, Award, CalendarCheck, BookOpen, Clock, Zap, Trophy,
  Eye, FileText, TrendingUp, Printer, ShieldAlert, RotateCcw, Maximize, Minimize,
  BookText, Ruler, Globe, Leaf, Palette, Dumbbell, Heart, Smile, AlertOctagon, Flame,
  UserCheck, Languages
} from "lucide-react";
import { useRequireAuth } from "../lib/useRequireAuth";
import { 
  getClassrooms, 
  getAllClassroomsAdmin, 
  getStudents, 
  saveStudent, 
  saveClassroom,
  deleteClassroom,
  deleteStudent, 
  getAnecdotalRecords, 
  saveAnecdotalRecord, 
  getIncidences, 
  saveIncidence, 
  generateWithIA, 
  uid, 
  Classroom, 
  Student, 
  AnecdotalRecord, 
  Incidence,
  getStudentOfficialGrades,
  getStudentRubricEvaluations,
  getAllRubrics,
  getStudentAnecdotalRecords,
  getAttendance,
  getOfficialGrades,
  saveOfficialGrades,
  OfficialGradeRecord
} from "../lib/storage";
import { 
  calculateCompetencyAverage, 
  calculateEffectiveGrade, 
  calculateAreaAverage 
} from "../lib/utils/gradingCalculations";
import { generateBulletinsPDF } from "../lib/utils/bulletinGenerator";
import * as XLSX from "xlsx";
import confetti from "canvas-confetti";
import { toast, Toaster } from "sonner";
import { OFFICIAL_DEFAULT_SUBJECTS } from "../lib/data/defaultSubjects";
import { EDUCATION_STRUCTURE, getGradesByLevel } from "../lib/data/educationStructure";

// Lucide icon mapping for subjects (replaces emojis)
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

// Gravity level icon mapping
const GRAVITY_ICONS: Record<string, React.ReactNode> = {
  'leve': <Smile className="h-3.5 w-3.5" />,
  'moderada': <AlertOctagon className="h-3.5 w-3.5" />,
  'grave': <Flame className="h-3.5 w-3.5" />,
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

const formatPhone = (phone?: string) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

const getWhatsAppLink = (phone?: string, tutorName?: string, studentName?: string) => {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10 && (cleaned.startsWith("809") || cleaned.startsWith("829") || cleaned.startsWith("849"))) {
    cleaned = "1" + cleaned;
  }
  const message = `Hola ${tutorName || "Tutor/a"}, le escribimos desde el centro educativo de su representado/a ${studentName || "el alumno/a"}.`;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
};

const WhatsAppIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
  </svg>
);

export default function Estudiantes() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Classrooms State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);

  // Sync activeClassId to localStorage
  useEffect(() => {
    if (activeClassId) {
      localStorage.setItem('activeClassId', activeClassId);
    }
  }, [activeClassId]);

  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showAnecdotalStudentDropdown, setShowAnecdotalStudentDropdown] = useState(false);
  const [showIncidentStudentDropdown, setShowIncidentStudentDropdown] = useState(false);
  const [showTutor1RelDropdown, setShowTutor1RelDropdown] = useState(false);
  const [showTutor2RelDropdown, setShowTutor2RelDropdown] = useState(false);
  const [showProfileSubjectDropdown, setShowProfileSubjectDropdown] = useState(false);
  const [activeDropdownStudentId, setActiveDropdownStudentId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"roster" | "anecdotal" | "incidences" | "live-class">("roster");

  // Create Classroom Modal State
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassLevel, setNewClassLevel] = useState<"inicial" | "primaria" | "secundaria">("primaria");
  const [newClassGrade, setNewClassGrade] = useState("primaria-4to");
  const [newClassSection, setNewClassSection] = useState("A");
  const [activeSchoolYear, setActiveSchoolYear] = useState(() => localStorage.getItem('plx:active_school_year') || '2025-2026');
  const [newClassPeriodo, setNewClassPeriodo] = useState(() => localStorage.getItem('plx:active_school_year') || '2025-2026');

  useEffect(() => {
    const handleYearChanged = () => {
      const activeYear = localStorage.getItem('plx:active_school_year') || '2025-2026';
      setActiveSchoolYear(activeYear);
      setNewClassPeriodo(activeYear);
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
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);

  // Delete/Edit Classroom State
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [editClassName, setEditClassName] = useState("");
  const [editClassLevel, setEditClassLevel] = useState<"inicial" | "primaria" | "secundaria">("primaria");
  const [editClassGrade, setEditClassGrade] = useState("");
  const [editClassSection, setEditClassSection] = useState("");
  const [editClassPeriodo, setEditClassPeriodo] = useState("");
  const [showEditLevelDropdown, setShowEditLevelDropdown] = useState(false);
  const [showEditGradeDropdown, setShowEditGradeDropdown] = useState(false);

  // Allowed levels and grades based on registration choices
  const allowedLevels = useMemo(() => {
    if (!user) return ["inicial", "primaria", "secundaria"];
    if (user.nivel) return [user.nivel];
    return ["inicial", "primaria", "secundaria"];
  }, [user]);

  const allowedGrades = useMemo(() => {
    if (!user) return [];
    if (user.allowed_subjects && Object.keys(user.allowed_subjects).length > 0) {
      return Object.keys(user.allowed_subjects);
    }
    if (user.grado) {
      return [user.grado];
    }
    return [];
  }, [user]);

  // Sync classroom level and grade default with user profile
  useEffect(() => {
    if (user) {
      const userLevel = user.nivel || "primaria";
      setNewClassLevel(userLevel as any);
      const firstAllowedGrade = allowedGrades[0] || user.grado || (userLevel === "primaria" ? "primaria-1ro" : userLevel === "secundaria" ? "secundaria-1ro" : "inicial-prekinder");
      setNewClassGrade(firstAllowedGrade);
    }
  }, [user, allowedGrades]);

  // Grade list for new classroom selector
  const availableGrades = useMemo(() => {
    const allGrades = getGradesByLevel(newClassLevel.toUpperCase() as any);
    if (allowedGrades.length > 0) {
      return allGrades.filter(g => allowedGrades.includes(g.id));
    }
    return allGrades;
  }, [newClassLevel, allowedGrades]);

  const availableEditGrades = useMemo(() => {
    return getGradesByLevel(editClassLevel.toUpperCase() as any);
  }, [editClassLevel]);

  // Default editClassGrade when editClassLevel shifts
  useEffect(() => {
    if (editingClassroom && availableEditGrades.length > 0) {
      if (!availableEditGrades.some(g => g.id === editClassGrade || g.name === editClassGrade)) {
        setEditClassGrade(availableEditGrades[0].id);
      }
    }
  }, [availableEditGrades, editingClassroom]);

  // Live Class State Variables
  const [pickedStudent, setPickedStudent] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    
    // Refresh student list and count
    loadStudents(activeClassId!);
  };

  // Create new classroom submit function
  const handleCreateClassroomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newClassName.trim() || !newClassSection.trim()) {
      toast.error("Completa el nombre y la sección.");
      return;
    }

    const newClass: Classroom = {
      id: uid("cls"),
      docente_id: user.id,
      nombre: newClassName,
      nivel: newClassLevel,
      grado: newClassGrade,
      seccion: newClassSection,
      periodo: newClassPeriodo,
      creado_en: new Date().toISOString()
    };

    saveClassroom(newClass);
    
    // Reload classrooms list
    const data = user.rol === "admin" ? getAllClassroomsAdmin() : getClassrooms(user.id);
    setClassrooms(data);
    setActiveClassId(newClass.id);
    
    // Reset form & close modal
    setNewClassName("");
    setNewClassSection("A");
    setNewClassPeriodo(activeSchoolYear);
    setIsCreateClassModalOpen(false);
    toast.success("¡Aula registrada con éxito!");
  };

  // Helper function to count all anecdotal records for a classroom
  const getStudentAnecdotalRecordsCount = (classId: string) => {
    const classStudents = getStudents(classId);
    let count = 0;
    classStudents.forEach(s => {
      count += getStudentAnecdotalRecords(s.id).length;
    });
    return count;
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

  // Load classrooms
  useEffect(() => {
    if (!user) return;
    const data = user.rol === "admin" ? getAllClassroomsAdmin() : getClassrooms(user.id);
    setClassrooms(data);
    // Maintain activeClassId if it is still valid in the new data list
    setActiveClassId(prev => {
      if (prev && data.some(c => c.id === prev)) {
        return prev;
      }
      return null;
    });
  }, [user]);

  const activeClassroom = useMemo(() => {
    return classrooms.find(c => c.id === activeClassId) || null;
  }, [classrooms, activeClassId]);

  // Students list
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadStudents = (classId: string) => {
    const list = getStudents(classId);
    setStudents(list.sort((a, b) => a.numero_orden - b.numero_orden));
  };

  useEffect(() => {
    if (activeClassId) {
      loadStudents(activeClassId);
    } else {
      setStudents([]);
    }
  }, [activeClassId]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    return students.filter(s => 
      s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.apellido && s.apellido.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.rne_matricula && s.rne_matricula.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [students, searchQuery]);

  // Modals / Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Student Form Fields
  const [studNombre, setStudNombre] = useState("");
  const [studApellido, setStudApellido] = useState("");
  const [studGenero, setStudGenero] = useState<"M" | "F">("M");
  const [studOrden, setStudOrden] = useState<number>(1);
  const [studRne, setStudRne] = useState("");
  const [studDireccion, setStudDireccion] = useState("");
  const [studTutor, setStudTutor] = useState("");
  const [studTutorPhone, setStudTutorPhone] = useState("");
  const [studTutorEmail, setStudTutorEmail] = useState("");
  const [studTutorRelacion, setStudTutorRelacion] = useState("Madre");
  const [studTutor2Nombre, setStudTutor2Nombre] = useState("");
  const [studTutor2Telefono, setStudTutor2Telefono] = useState("");
  const [studTutor2Relacion, setStudTutor2Relacion] = useState("Padre");
  const [showTutor2, setShowTutor2] = useState(false);

  // Unused profile states defined to prevent runtime ReferenceErrors in JSX
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<any>(null);
  const [activeProfileSubjectId, setActiveProfileSubjectId] = useState<string>("");
  const [showAllAnecdotalModal, setShowAllAnecdotalModal] = useState(false);
  const [showAllIncidencesModal, setShowAllIncidencesModal] = useState(false);
  const [expandedRubricId, setExpandedRubricId] = useState<string | null>(null);
  const [profileStartDate, setProfileStartDate] = useState<string>("");
  const [profileEndDate, setProfileEndDate] = useState<string>("");
  const [printRecordId, setPrintRecordId] = useState<string | null>(null);
  const profileSubjectsList = useMemo(() => {
    if (!activeClassroom) return [];
    const levelUpper = activeClassroom.nivel.toUpperCase();
    const gradeId = `${activeClassroom.nivel}-${activeClassroom.grado}`;
    
    let list = OFFICIAL_DEFAULT_SUBJECTS.filter((s) => s.level === levelUpper);
    if (user && user.rol !== "admin" && user.allowed_subjects && user.allowed_subjects[gradeId]) {
      const allowed = user.allowed_subjects[gradeId];
      list = list.filter(s => allowed.includes(s.id));
    }
    return list;
  }, [activeClassroom, user]);

  useEffect(() => {
    if (selectedStudentForProfile && profileSubjectsList.length > 0 && !activeProfileSubjectId) {
      setActiveProfileSubjectId(profileSubjectsList[0].id);
    }
  }, [selectedStudentForProfile, profileSubjectsList, activeProfileSubjectId]);

  const profileStats = useMemo(() => {
    if (!selectedStudentForProfile) {
      return { attendancePct: 100, present: 0, absent: 0, tardy: 0, excuse: 0, totalDays: 0, anecdotalCount: 0, incidentCount: 0, academicAverage: 0 };
    }
    
    // Attendance
    const classroomAttendance = getAttendance(activeClassroom?.id || "");
    let present = 0, absent = 0, tardy = 0, excuse = 0, totalDays = 0;
    classroomAttendance.forEach((att) => {
      const status = att.registro?.[selectedStudentForProfile.id];
      if (status) {
        totalDays++;
        if (status === "P") present++;
        else if (status === "A") absent++;
        else if (status === "T") tardy++;
        else if (status === "E") excuse++;
      }
    });
    const attendancePct = totalDays > 0 ? Math.round(((present + tardy) / totalDays) * 100) : 100;

    const anecdotalCount = getStudentAnecdotalRecords(selectedStudentForProfile.id).length;
    const incidentCount = getIncidences(selectedStudentForProfile.id).length;

    const grades = getStudentOfficialGrades(selectedStudentForProfile.id);
    let sum = 0, count = 0;
    grades.forEach((g) => {
      const avg = g.competency_average !== undefined && g.competency_average !== null
        ? g.competency_average
        : calculateCompetencyAverage([
            { p: g.p1, rp: g.rp1 },
            { p: g.p2, rp: g.rp2 },
            { p: g.p3, rp: g.rp3 },
            { p: g.p4, rp: g.rp4 }
          ]);
      if (avg !== null) {
        sum += avg;
        count++;
      }
    });
    const academicAverage = count > 0 ? Math.round(sum / count) : 0;

    return { attendancePct, present, absent, tardy, excuse, totalDays, anecdotalCount, incidentCount, academicAverage };
  }, [selectedStudentForProfile, activeClassroom]);

  const rubricsList = useMemo(() => {
    return getAllRubrics();
  }, []);

  const studentRubricsEvaluations = useMemo(() => {
    if (!selectedStudentForProfile) return [];
    const evals = getStudentRubricEvaluations(selectedStudentForProfile.id);
    return evals.map((ev) => {
      const rubric = rubricsList.find((r) => r.id === ev.rubric_id);
      return {
        ...ev,
        rubricTitle: rubric ? rubric.titulo : "Rúbrica sin título",
      };
    });
  }, [selectedStudentForProfile, rubricsList]);

  const profileSubjectGrades = useMemo(() => {
    if (!selectedStudentForProfile || !activeProfileSubjectId) return [];
    return getStudentOfficialGrades(selectedStudentForProfile.id).filter(
      (g) => g.subject_id === activeProfileSubjectId
    );
  }, [selectedStudentForProfile, activeProfileSubjectId]);

  const subjectAverages = useMemo(() => {
    if (!selectedStudentForProfile) return {};
    const averages: Record<string, number> = {};
    const studentGrades = getStudentOfficialGrades(selectedStudentForProfile.id);
    profileSubjectsList.forEach(sub => {
      const subGrades = studentGrades.filter(g => g.subject_id === sub.id);
      if (subGrades.length > 0) {
        const validAverages = subGrades.map(g => {
          if (g.competency_average !== undefined && g.competency_average !== null) {
            return g.competency_average;
          }
          return calculateCompetencyAverage([
            { p: g.p1, rp: g.rp1 },
            { p: g.p2, rp: g.rp2 },
            { p: g.p3, rp: g.rp3 },
            { p: g.p4, rp: g.rp4 }
          ]);
        }).filter((val): val is number => val !== null);

        if (validAverages.length > 0) {
          const sum = validAverages.reduce((acc, curr) => acc + curr, 0);
          averages[sub.id] = Math.round(sum / validAverages.length);
        }
      }
    });
    return averages;
  }, [selectedStudentForProfile, profileSubjectsList]);

  const generalAverage = useMemo(() => {
    const keys = Object.keys(subjectAverages);
    if (keys.length === 0) return null;
    const sum = keys.reduce((acc, k) => acc + subjectAverages[k], 0);
    return Math.round(sum / keys.length);
  }, [subjectAverages]);

  const openAddModal = () => {
    setEditingStudent(null);
    setStudNombre("");
    setStudApellido("");
    setStudGenero("M");
    setStudRne("");
    setStudDireccion("");
    setStudTutor("");
    setStudTutorPhone("");
    setStudTutorEmail("");
    setStudTutorRelacion("Madre");
    setStudTutor2Nombre("");
    setStudTutor2Telefono("");
    setStudTutor2Relacion("Padre");
    setShowTutor2(false);
    
    const maxOrder = students.reduce((max, s) => s.numero_orden > max ? s.numero_orden : max, 0);
    setStudOrden(maxOrder + 1);
    
    setShowAddModal(true);
    setTimeout(() => {
      document.getElementById("student-form-container")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setStudNombre(student.nombre);
    setStudApellido(student.apellido || "");
    setStudGenero(student.genero);
    setStudOrden(student.numero_orden);
    setStudRne(student.rne_matricula || "");
    setStudDireccion(student.direccion || "");
    setStudTutor(student.tutor_nombre || "");
    setStudTutorPhone(student.tutor_telefono || "");
    setStudTutorEmail(student.email_tutor || "");
    setStudTutorRelacion(student.tutor_relacion || "Madre");
    setStudTutor2Nombre(student.tutor2_nombre || "");
    setStudTutor2Telefono(student.tutor2_telefono || "");
    setStudTutor2Relacion(student.tutor2_relacion || "Padre");
    setShowTutor2(!!student.tutor2_nombre);
    
    setShowAddModal(true);
    setTimeout(() => {
      document.getElementById("student-form-container")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClassId) return;

    if (!studNombre.trim()) {
      toast.error("El nombre del estudiante es obligatorio.");
      return;
    }

    const sData: Student = {
      id: editingStudent ? editingStudent.id : uid("std"),
      classroom_id: activeClassId,
      nombre: studNombre.trim(),
      apellido: studApellido.trim() || undefined,
      numero_orden: Number(studOrden),
      genero: studGenero,
      rne_matricula: studRne.trim() || undefined,
      direccion: studDireccion.trim() || undefined,
      tutor_nombre: studTutor.trim() || undefined,
      tutor_telefono: studTutorPhone.trim() || undefined,
      email_tutor: studTutorEmail.trim() || undefined,
      tutor_relacion: studTutorRelacion || undefined,
      tutor2_nombre: showTutor2 && studTutor2Nombre.trim() ? studTutor2Nombre.trim() : undefined,
      tutor2_telefono: showTutor2 && studTutor2Telefono.trim() ? studTutor2Telefono.trim() : undefined,
      tutor2_relacion: showTutor2 ? studTutor2Relacion : undefined,
      creado_en: editingStudent ? editingStudent.creado_en : new Date().toISOString(),
    };

    saveStudent(sData);
    loadStudents(activeClassId);
    setShowAddModal(false);
    setEditingStudent(null);
    toast.success(editingStudent ? "Estudiante actualizado" : "Estudiante registrado");
    
    if (!editingStudent) {
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudentToDelete(student);
    }
  };

  const handlePrintSingle = (id: string) => {
    setPrintRecordId(id);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setPrintRecordId(null);
      }, 500);
    }, 50);
  };

  // Excel Import / Export
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeClassId) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        let count = 0;
        let startOrder = students.reduce((max, s) => s.numero_orden > max ? s.numero_orden : max, 0) + 1;

        json.forEach((row) => {
          const name = row.Nombre || row.nombre || row["Nombre Completo"] || row["Estudiante"];
          if (!name) return;

          const genderRaw = String(row.Genero || row.genero || row.Sexo || row.sexo || "M").toUpperCase();
          const gender: "M" | "F" = genderRaw.startsWith("F") || genderRaw.startsWith("M") 
            ? (genderRaw.startsWith("F") ? "F" : "M") 
            : "M";

          const rne = row.RNE || row.rne || row.Matricula || row.matricula || "";
          const tutor = row.Tutor || row.tutor || row["Nombre Tutor"] || "";
          const phone = row.Telefono || row.telefono || row["Celular Tutor"] || "";
          const email = row.Email || row.email || row["Correo Tutor"] || "";

          const st: Student = {
            id: uid("std"),
            classroom_id: activeClassId,
            nombre: name,
            numero_orden: startOrder++,
            genero: gender,
            rne_matricula: rne || undefined,
            tutor_nombre: tutor || undefined,
            tutor_telefono: phone || undefined,
            email_tutor: email || undefined,
            creado_en: new Date().toISOString()
          };
          saveStudent(st);
          count++;
        });

        loadStudents(activeClassId);
        toast.success(`Importación exitosa. Se agregaron ${count} estudiantes.`);
        confetti({ particleCount: 60, spread: 60 });
      } catch (err) {
        console.error(err);
        toast.error("Error al leer el archivo Excel. Asegúrate de tener columnas con el formato correcto (Nombre, Genero, RNE).");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ""; // clear input
  };

  const handleExportExcel = () => {
    if (students.length === 0) {
      toast.error("No hay estudiantes para exportar.");
      return;
    }

    const exportData = students.map(s => ({
      "Nro. Orden": s.numero_orden,
      "Nombre Completo": s.nombre,
      "Género": s.genero,
      "RNE / Matrícula": s.rne_matricula || "N/A",
      "Nombre Tutor": s.tutor_nombre || "N/A",
      "Teléfono Tutor": s.tutor_telefono || "N/A",
      "Correo Tutor": s.email_tutor || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");
    
    const fileName = activeClassroom 
      ? `Estudiantes_${activeClassroom.nombre.replace(/\s+/g, "_")}.xlsx` 
      : "listado_estudiantes.xlsx";

    XLSX.writeFile(workbook, fileName);
    toast.success("Excel descargado correctamente.");
  };

  // Anecdotal Records tab states
  const [selectedAnecdotalStudentId, setSelectedAnecdotalStudentId] = useState("");
  const [anecdotalHecho, setAnecdotalHecho] = useState("");
  const [anecdotalSugerencia, setAnecdotalSugerencia] = useState("");
  const [anecdotalList, setAnecdotalList] = useState<AnecdotalRecord[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const loadAnecdotal = () => {
    if (activeClassId) {
      const all = getAnecdotalRecords(activeClassId);
      const filtered = selectedAnecdotalStudentId 
        ? all.filter(r => r.student_id === selectedAnecdotalStudentId)
        : all;
      setAnecdotalList(filtered.sort((a, b) => b.fecha.localeCompare(a.fecha)));
    }
  };

  useEffect(() => {
    loadAnecdotal();
  }, [activeClassId, selectedAnecdotalStudentId]);

  const handleImproveAnecdotalWithAi = () => {
    if (!anecdotalHecho.trim()) {
      toast.error("Escribe un hecho primero para que la IA pueda redactarlo.");
      return;
    }
    setLoadingAi(true);
    setTimeout(() => {
      const redraft = generateWithIA(anecdotalHecho, "ANECDOTAL_REDRAFT");
      setAnecdotalSugerencia(redraft);
      setLoadingAi(false);
      toast.success("Sugerencia de redacción IA completada.");
    }, 1200);
  };

  const handleSaveAnecdotal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClassId || !selectedAnecdotalStudentId) {
      toast.error("Selecciona un estudiante.");
      return;
    }
    if (!anecdotalHecho.trim()) {
      toast.error("Escribe el hecho observado.");
      return;
    }

    const rec: AnecdotalRecord = {
      id: uid("rec"),
      classroom_id: activeClassId,
      student_id: selectedAnecdotalStudentId,
      docente_id: user.id,
      fecha: new Date().toISOString().split("T")[0],
      hecho: anecdotalHecho,
      sugerencia_ia: anecdotalSugerencia || undefined,
      estado: "guardado",
      creado_en: new Date().toISOString(),
    };

    saveAnecdotalRecord(rec);
    setAnecdotalHecho("");
    setAnecdotalSugerencia("");
    loadAnecdotal();
    toast.success("Registro anecdótico guardado.");
  };

  // Incidences Tab states
  const [selectedIncidentStudentId, setSelectedIncidentStudentId] = useState("");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidentGravedad, setIncidentGravedad] = useState<"leve" | "moderada" | "grave">("leve");
  const [incidentMedidas, setIncidentMedidas] = useState("");
  const [incidentList, setIncidentList] = useState<Incidence[]>([]);

  const loadIncidences = () => {
    if (selectedIncidentStudentId) {
      const all = getIncidences(selectedIncidentStudentId);
      setIncidentList(all.sort((a, b) => b.fecha.localeCompare(a.fecha)));
    } else {
      setIncidentList([]);
    }
  };

  useEffect(() => {
    loadIncidences();
  }, [selectedIncidentStudentId]);

  const handleSaveIncidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentStudentId) {
      toast.error("Selecciona un estudiante.");
      return;
    }
    if (!incidentDesc.trim()) {
      toast.error("Escribe la descripción de la incidencia.");
      return;
    }

    const inc: Incidence = {
      id: uid("inc"),
      student_id: selectedIncidentStudentId,
      fecha: new Date().toISOString().split("T")[0],
      descripcion: incidentDesc,
      gravedad: incidentGravedad,
      medidas_tomadas: incidentMedidas,
    };

    saveIncidence(inc);
    setIncidentDesc("");
    setIncidentMedidas("");
    setIncidentGravedad("leve");
    loadIncidences();
    toast.success("Incidencia guardada.");
  };

  if (!user) return null;

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <Toaster position="top-center" richColors />

          {/* Header section */}
          {!selectedStudentForProfile && (
            <div className="space-y-6 pt-1">
              {/* Title, Subtitle and Action Button */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2 text-left">
                <div>
                  <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight leading-[1] text-text-main">
                    Aula Virtual
                  </h1>
                  <p className="text-[14px] text-text-muted mt-2">
                    Gestiona tus aulas virtuales, matrícula de estudiantes, anecdotario y dinámicas en vivo.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateClassModalOpen(true)}
                  className="bg-brand-primary hover:bg-brand-hover text-white border border-transparent rounded-full px-4 py-2 font-bold text-[13px] shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none shrink-0"
                >
                  <Sparkles size={14} /> Crear Aula Virtual
                </button>
              </div>

              {/* AULAS Y SECCIONES GRID */}
              {classrooms.length > 0 ? (
                <div className="mb-6 mt-10">
                  <h3 className="text-[13px] font-black text-slate-450 uppercase tracking-widest mb-5">Aulas y Secciones</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {classrooms.map((c, idx) => {
                      const isActive = c.id === activeClassId;
                      const classStudents = getStudents(c.id);
                      const studentCount = classStudents.length;
                      const girlsCount = classStudents.filter(s => s.genero === "F").length;
                      const boysCount = classStudents.filter(s => s.genero === "M").length;
                      const isPrimaria = c.nivel === "primaria";
                      
                      // 8 distinct premium gradient palettes that cycle per card
                      const CARD_PALETTES = [
                        { bg: 'from-[#FFF4E0] to-[#FFE4E1]', dark: 'dark:from-amber-950/20 dark:to-slate-900', accent: 'text-orange-600 dark:text-orange-400', fill: 'fill-orange-500/20', badge: 'text-orange-700 dark:text-orange-300', border: 'border-orange-500 shadow-orange-500/10' },
                        { bg: 'from-[#E0E7FF] to-[#EDE9FE]', dark: 'dark:from-indigo-950/20 dark:to-slate-900', accent: 'text-indigo-600 dark:text-indigo-400', fill: 'fill-indigo-500/20', badge: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-500 shadow-indigo-500/10' },
                        { bg: 'from-[#E6F4EA] to-[#F1F9F5]', dark: 'dark:from-emerald-950/20 dark:to-slate-900', accent: 'text-emerald-600 dark:text-emerald-400', fill: 'fill-emerald-500/20', badge: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500 shadow-emerald-500/10' },
                        { bg: 'from-[#FFEAF0] to-[#FFF0F5]', dark: 'dark:from-rose-950/20 dark:to-slate-900', accent: 'text-rose-600 dark:text-rose-400', fill: 'fill-rose-500/20', badge: 'text-rose-700 dark:text-rose-300', border: 'border-rose-500 shadow-rose-500/10' },
                        { bg: 'from-[#E8F0FE] to-[#F4F8FF]', dark: 'dark:from-blue-950/20 dark:to-slate-900', accent: 'text-blue-600 dark:text-blue-400', fill: 'fill-blue-500/20', badge: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500 shadow-blue-500/10' },
                        { bg: 'from-[#FEF7E0] to-[#FFFBF0]', dark: 'dark:from-yellow-950/20 dark:to-slate-900', accent: 'text-yellow-600 dark:text-yellow-500', fill: 'fill-yellow-500/20', badge: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-500 shadow-yellow-500/10' },
                        { bg: 'from-[#F3E8FF] to-[#FAF5FF]', dark: 'dark:from-purple-950/20 dark:to-slate-900', accent: 'text-purple-600 dark:text-purple-400', fill: 'fill-purple-500/20', badge: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500 shadow-purple-500/10' },
                        { bg: 'from-[#E0F2FE] to-[#F0F9FF]', dark: 'dark:from-cyan-950/20 dark:to-slate-900', accent: 'text-cyan-600 dark:text-cyan-400', fill: 'fill-cyan-500/20', badge: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-500 shadow-cyan-500/10' },
                      ];
                      const palette = CARD_PALETTES[idx % CARD_PALETTES.length];

                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setActiveClassId(isActive ? null : c.id);
                          }}
                          className={`rounded-[28px] p-6 relative overflow-hidden cursor-pointer transition-all duration-300 select-none flex flex-col justify-between min-h-[190px] group hover:-translate-y-1 active:scale-[0.97] shadow-sm hover:shadow-md bg-gradient-to-br ${palette.bg} ${palette.dark} ${
                            isActive 
                              ? `border-2 ${palette.border} shadow-md` 
                              : 'border border-transparent hover:border-black/5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs bg-white/50 dark:bg-black/40 ${palette.accent}`}>
                              {isPrimaria ? <BookOpen size={18} className={palette.fill} /> : <GraduationCap size={18} className={palette.fill} />}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg shadow-2xs bg-white/60 dark:bg-black/30 ${palette.badge}`}>
                                {isPrimaria ? "Primaria" : "Secundaria"}
                              </span>
                              <span className="text-[10px] font-bold text-[#1B1B1B]/40 dark:text-slate-500">
                                {c.periodo}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 relative z-10 w-full">
                            <h4 className="text-[15px] font-black text-[#1B1B1B] dark:text-white line-clamp-1 mb-1 leading-tight tracking-tight">
                              {c.nombre}
                            </h4>
                            <div className="flex flex-col gap-2 mt-2">
                              <span className="text-[11.5px] font-bold text-[#1B1B1B]/60 dark:text-slate-400 flex items-center gap-1.5">
                                <Users size={12} className="text-[#1B1B1B]/40 dark:text-slate-500" />
                                <span>{studentCount} {studentCount === 1 ? "alumno" : "alumnos"}</span>
                              </span>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9.5px] font-bold text-pink-600 bg-white/60 dark:bg-black/30 border border-pink-200/50 dark:border-pink-900/30 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                                    <span>♀</span>
                                    <span>{girlsCount} {girlsCount === 1 ? "niña" : "niñas"}</span>
                                  </span>
                                  <span className="text-[9.5px] font-bold text-blue-600 bg-white/60 dark:bg-black/30 border border-blue-200/50 dark:border-blue-900/30 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                                    <span>♂</span>
                                    <span>{boysCount} {boysCount === 1 ? "niño" : "niños"}</span>
                                  </span>
                                </div>
                                {/* Edit & Delete Buttons */}
                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingClassroom(c);
                                      setEditClassName(c.nombre);
                                      setEditClassLevel(c.nivel);
                                      setEditClassGrade(c.grado);
                                      setEditClassSection(c.seccion);
                                      setEditClassPeriodo(c.periodo);
                                    }}
                                    className="w-7 h-7 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 flex items-center justify-center text-[#1B1B1B]/50 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:scale-110"
                                    title="Editar aula"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setClassroomToDelete(c);
                                    }}
                                    className="w-7 h-7 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 flex items-center justify-center text-[#1B1B1B]/50 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:scale-110"
                                    title="Eliminar aula"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Botón de crear aula en formato tarjeta si hay espacio libre en la última fila del grid */}
                    {(classrooms.length % 4 !== 0) && (
                      <div
                        onClick={() => setIsCreateClassModalOpen(true)}
                        className="rounded-[28px] border-2 border-dashed border-rose-300/80 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/5 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[190px] group hover:-translate-y-1 active:scale-[0.97] shadow-2xs hover:shadow-xs select-none"
                      >
                        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/35 flex items-center justify-center text-rose-500 mb-3 group-hover:scale-110 transition-transform duration-300">
                          <Plus size={24} className="stroke-[2.5]" />
                        </div>
                        <span className="text-[14px] font-extrabold text-rose-500 dark:text-rose-450 tracking-tight">
                          Crear nueva aula
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botón de crear aula horizontal y ancho completo si la fila de 4 tarjetas está llena */}
                  {(classrooms.length % 4 === 0) && (
                    <div className="mt-5">
                      <div
                        onClick={() => setIsCreateClassModalOpen(true)}
                        className="rounded-[28px] border-2 border-dashed border-rose-300/80 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/5 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 transition-all duration-300 cursor-pointer flex items-center justify-center p-6 gap-3 group active:scale-[0.99] shadow-2xs hover:shadow-xs select-none"
                      >
                        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/35 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform duration-300">
                          <Plus size={20} className="stroke-[2.5]" />
                        </div>
                        <span className="text-[15px] font-extrabold text-rose-500 dark:text-rose-450 tracking-tight">
                          Crear nueva aula
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-black/5 rounded-[24px] p-6 text-center text-xs text-text-muted font-bold shadow-sm mb-6">
                  No tienes aulas creadas. Haz clic en "Crear Aula" para comenzar.
                </div>
              )}

              {/* ACTION SUB-CARDS (QUICK ACTION PANEL) */}
              {activeClassroom && (() => {
                const classroomStudents = getStudents(activeClassroom.id);
                const girlsCount = classroomStudents.filter(s => s.genero === 'F').length;
                const boysCount = classroomStudents.filter(s => s.genero === 'M').length;
                const totalStudents = classroomStudents.length;
                const girlsPct = totalStudents > 0 ? (girlsCount / totalStudents) * 100 : 50;
                const boysPct = totalStudents > 0 ? (boysCount / totalStudents) * 100 : 50;
                const conductasCount = getStudentAnecdotalRecordsCount(activeClassroom.id);

                return (
                  <div key={activeClassroom.id} className="mb-8 animate-in fade-in slide-in-from-top-8 duration-500 ease-out">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Card 1: Matrícula Escolar */}
                      <div 
                        onClick={() => navigate(`/aula-virtual/matricula/${activeClassroom.id}`)}
                        className="bg-gradient-to-br from-[#E0E7FF] to-[#EDE9FE] dark:from-indigo-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-indigo-500/10 select-none"
                      >
                        <div className="absolute -top-4 -bottom-4 -right-4 w-[60%] bg-white/30 rounded-l-[24px] transform -skew-x-[8deg] translate-x-4 pointer-events-none transition-transform duration-700 group-hover:translate-x-1"></div>
                        <div className="flex justify-between items-start relative z-10 w-full">
                          <div className="flex items-center gap-1.5">
                            <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <span className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Matrícula</span>
                          </div>
                          <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-indigo-600 dark:text-indigo-400">
                            <Users size={18} className="fill-indigo-500 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        </div>
                        <div className="relative z-10 my-4 flex flex-col items-start w-full">
                          <div className="flex items-end gap-1.5">
                            <span className="text-[36px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                              {totalStudents}
                            </span>
                            <span className="text-[14px] font-bold text-text-muted mb-1">Estudiantes</span>
                          </div>
                        </div>
                        <div className="relative z-10 mt-auto flex flex-col gap-2 pt-3 border-t border-indigo-500/10 w-full">
                          <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                            <span>Distribución</span>
                            <span className="text-text-muted font-bold">{girlsCount} F / {boysCount} M</span>
                          </div>
                          <div className="w-full bg-indigo-500/10 h-2 rounded-full overflow-hidden flex">
                            <div className="bg-pink-400 h-full" style={{ width: `${girlsPct}%` }}></div>
                            <div className="bg-blue-500 h-full" style={{ width: `${boysPct}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Anecdotario */}
                      <div 
                        onClick={() => navigate(`/aula-virtual/anecdotario/${activeClassroom.id}`)}
                        className="bg-gradient-to-br from-[#E6F4EA] to-[#F1F9F5] dark:from-emerald-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-emerald-500/10 select-none"
                      >
                        <div className="absolute -top-4 -bottom-4 -right-4 w-[60%] bg-white/30 rounded-l-[24px] transform -skew-x-[8deg] translate-x-4 pointer-events-none transition-transform duration-700 group-hover:translate-x-1"></div>
                        <div className="flex justify-between items-start relative z-10 w-full">
                          <div className="flex items-center gap-1.5">
                            <MessageCircle size={16} className="text-emerald-600 dark:text-emerald-450" />
                            <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">Registro Anecdótico</span>
                          </div>
                          <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-emerald-600 dark:text-emerald-455">
                            <MessageCircle size={18} className="fill-emerald-500 text-emerald-600 dark:text-emerald-455" />
                          </div>
                        </div>
                        <div className="relative z-10 my-4 flex flex-col items-start w-full">
                          <div className="flex items-end gap-1.5">
                            <span className="text-[36px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                              {conductasCount}
                            </span>
                            <span className="text-[14px] font-bold text-text-muted mb-1">Conductas</span>
                          </div>
                        </div>
                        <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-emerald-500/10 w-full">
                          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Convivencia Aula</span>
                          <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md border border-emerald-200/50">
                            Saludable
                          </span>
                        </div>
                      </div>

                      {/* Card 3: Incidencias */}
                      <div 
                        onClick={() => navigate(`/aula-virtual/incidencias/${activeClassroom.id}`)}
                        className="bg-gradient-to-br from-[#FCE8E6] to-[#FEF3F2] dark:from-rose-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-rose-500/10 select-none"
                      >
                        <div className="absolute -top-4 -bottom-4 -right-4 w-[60%] bg-white/30 rounded-l-[24px] transform -skew-x-[8deg] translate-x-4 pointer-events-none transition-transform duration-700 group-hover:translate-x-1"></div>
                        <div className="flex justify-between items-start relative z-10 w-full">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle size={16} className="text-rose-600 dark:text-rose-450" />
                            <span className="text-[13px] font-bold text-rose-600 dark:text-rose-455 uppercase tracking-wider">Registro de Incidencias</span>
                          </div>
                          <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-rose-600 dark:text-rose-455">
                            <AlertTriangle size={18} className="fill-rose-500 text-rose-600 dark:text-rose-455" />
                          </div>
                        </div>
                        <div className="relative z-10 my-4 flex flex-col items-start w-full">
                          <div className="flex items-end gap-1.5">
                            <span className="text-[36px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                              0
                            </span>
                            <span className="text-[14px] font-bold text-text-muted mb-1">Casos Activos</span>
                          </div>
                        </div>
                        <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-rose-500/10 w-full">
                          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Estado de Alerta</span>
                          <span className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400 bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md border border-rose-200/50">
                            Sin Reportar
                          </span>
                        </div>
                      </div>

                      {/* Card 4: Clase en Vivo */}
                      <div 
                        onClick={() => navigate(`/aula-virtual/clase-en-vivo/${activeClassroom.id}`)}
                        className="bg-gradient-to-br from-[#FFF4E0] to-[#FFE4E1] dark:from-amber-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-orange-500/10 select-none"
                      >
                        <div className="absolute -top-4 -bottom-4 -right-4 w-[60%] bg-white/30 rounded-l-[24px] transform -skew-x-[8deg] translate-x-4 pointer-events-none transition-transform duration-700 group-hover:translate-x-1"></div>
                        <div className="flex justify-between items-start relative z-10 w-full">
                          <div className="flex items-center gap-1.5">
                            <Flame size={16} className="text-orange-500 fill-orange-500" />
                            <span className="text-[13px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Clase en Vivo</span>
                          </div>
                          <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-orange-500 dark:text-orange-400">
                            <Zap size={18} className="fill-orange-500 text-orange-500 dark:text-orange-400" />
                          </div>
                        </div>
                        <div className="relative z-10 my-4 flex flex-col items-start w-full">
                          <div className="flex items-end gap-1.5">
                            <span className="text-[28px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                              Gamificación IA
                            </span>
                          </div>
                        </div>
                        <div className="relative z-10 mt-auto flex justify-between pt-3 border-t border-orange-500/10 w-full">
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <span className="text-[9.5px] font-bold text-text-muted/80">{day}</span>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-3xs ${i < 5 ? 'bg-orange-500' : 'bg-black/5 dark:bg-white/5 shadow-none'}`}>
                                {i < 5 && <Flame size={10} className="text-white fill-white" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card 5: Registro de asistencia */}
                      <div 
                        onClick={() => navigate(`/aula-virtual/asistencia/${activeClassId}`)}
                        className="bg-gradient-to-br from-[#FEF7E0] to-[#FFFBF0] dark:from-yellow-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-amber-500/10 select-none"
                      >
                        <div className="absolute -top-4 -bottom-4 -right-4 w-[60%] bg-white/30 rounded-l-[24px] transform -skew-x-[8deg] translate-x-4 pointer-events-none transition-transform duration-700 group-hover:translate-x-1"></div>
                        <div className="flex justify-between items-start relative z-10 w-full">
                          <div className="flex items-center gap-1.5">
                            <UserCheck size={16} className="text-amber-600 dark:text-amber-450" />
                            <span className="text-[13px] font-bold text-amber-600 dark:text-amber-455 uppercase tracking-wider">Registro de Asistencia</span>
                          </div>
                          <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-amber-600 dark:text-amber-455">
                            <UserCheck size={18} className="fill-amber-500 text-amber-600 dark:text-amber-455" />
                          </div>
                        </div>
                        <div className="relative z-10 my-4 flex flex-col items-start w-full">
                          <div className="flex items-end gap-1.5">
                            <span className="text-[36px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                              98.4%
                            </span>
                            <span className="text-[14px] font-bold text-text-muted mb-1">Promedio</span>
                          </div>
                        </div>
                        <div className="relative z-10 mt-auto flex flex-col gap-2 pt-3 border-t border-amber-500/10 w-full">
                          <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                            <span>Pase de lista</span>
                            <span className="text-text-muted font-bold">Hoy</span>
                          </div>
                          <div className="w-full bg-amber-500/10 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 w-[98%] h-full rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Card 6: Registro de calificaciones */}
                      <div 
                        onClick={() => navigate(`/aula-virtual/registro-calificaciones/${activeClassId}`)}
                        className="bg-gradient-to-br from-[#E8F0FE] to-[#F4F8FF] dark:from-blue-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-blue-500/10 select-none"
                      >
                        <div className="absolute -top-4 -bottom-4 -right-4 w-[60%] bg-white/30 rounded-l-[24px] transform -skew-x-[8deg] translate-x-4 pointer-events-none transition-transform duration-700 group-hover:translate-x-1"></div>
                        <div className="flex justify-between items-start relative z-10 w-full">
                          <div className="flex items-center gap-1.5">
                            <Trophy size={16} className="text-blue-600 dark:text-blue-455" />
                            <span className="text-[13px] font-bold text-blue-600 dark:text-blue-455 uppercase tracking-wider">Registro de Calificaciones</span>
                          </div>
                          <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-blue-600 dark:text-blue-455">
                            <Award size={18} className="fill-blue-500 text-blue-600 dark:text-blue-455" />
                          </div>
                        </div>
                        <div className="relative z-10 my-4 flex flex-col items-start w-full">
                          <div className="flex items-end gap-1.5">
                            <span className="text-[26px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                              Calificaciones
                            </span>
                            <span className="text-[13px] font-bold text-text-muted mb-0.5">Oficiales</span>
                          </div>
                        </div>
                        <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-blue-500/10 w-full">
                          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Períodos</span>
                          <div className="flex -space-x-1.5">
                            {['P1', 'P2', 'P3', 'P4'].map((p, i) => (
                              <div key={p} className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center shadow-3xs text-[9px] font-extrabold text-blue-600 dark:text-blue-400" title={`Período ${i+1}`}>
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card 7: Instrumentos de Evaluación */}
                      <div 
                        onClick={() => navigate(`/aula-virtual/instrumentos/${activeClassId}`)}
                        className="bg-gradient-to-br from-[#F3E8FF] to-[#FAF5FF] dark:from-purple-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-purple-500/10 select-none"
                      >
                        <div className="absolute -top-4 -bottom-4 -right-4 w-[60%] bg-white/30 rounded-l-[24px] transform -skew-x-[8deg] translate-x-4 pointer-events-none transition-transform duration-700 group-hover:translate-x-1"></div>
                        <div className="flex justify-between items-start relative z-10 w-full">
                          <div className="flex items-center gap-1.5">
                            <Award size={16} className="text-purple-600 dark:text-purple-450" />
                            <span className="text-[13px] font-bold text-purple-600 dark:text-purple-455 uppercase tracking-wider">Instrumentos de Evaluación</span>
                          </div>
                          <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-purple-600 dark:text-purple-455">
                            <Award size={18} className="fill-purple-500 text-purple-600 dark:text-purple-455" />
                          </div>
                        </div>
                        <div className="relative z-10 my-4 flex flex-col items-start w-full">
                          <div className="flex items-end gap-1.5">
                            <span className="text-[24px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                              Banco General
                            </span>
                            <span className="text-[13px] font-bold text-text-muted mb-0.5">de Instrumentos</span>
                          </div>
                        </div>
                        <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-purple-500/10 w-full">
                          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Formativa y Sumativa</span>
                          <span className="text-[11px] font-black uppercase text-purple-600 dark:text-purple-400 bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md border border-purple-200/50">
                            IA Integrada
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

      {/* Tab Contents */}
      {selectedStudentForProfile ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Back + Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedStudentForProfile(null)}
                className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Volver
              </button>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-text-main">
                  {selectedStudentForProfile.nombre} {selectedStudentForProfile.apellido || ""}
                </h1>
                {activeClassroom && (
                  <p className="text-xs text-text-muted mt-0.5 font-semibold">
                    {activeClassroom.nombre} · Período {activeClassroom.periodo}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="border border-slate-200 bg-slate-550/5 text-[11px] font-bold px-3 py-1 rounded-full text-slate-700">
                {selectedStudentForProfile.genero === "M" ? "♂ Masculino" : "♀ Femenino"}
              </span>
              <span className="text-[11px] font-black px-3 py-1 bg-brand-primary text-white rounded-full shadow-sm">
                #{selectedStudentForProfile.numero_orden}
              </span>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-[calc(var(--radius)+4px)] p-4 text-center shadow-sm">
              <CalendarCheck className="h-5 w-5 mx-auto text-emerald-600 mb-1.5" />
              <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Asistencia</div>
              <div className="font-display text-2xl font-bold text-emerald-700 mt-1">
                {profileStats.totalDays > 0 ? `${profileStats.attendancePct}%` : "—"}
              </div>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 rounded-[calc(var(--radius)+4px)] p-4 text-center shadow-sm">
              <FileText className="h-5 w-5 mx-auto text-brand-primary mb-1.5" />
              <div className="text-[10px] uppercase font-bold text-brand-primary tracking-wider">Anecdóticos</div>
              <div className="font-display text-2xl font-bold text-brand-primary mt-1">{profileStats.anecdotalCount}</div>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 rounded-[calc(var(--radius)+4px)] p-4 text-center shadow-sm">
              <ShieldAlert className="h-5 w-5 mx-auto text-amber-600 mb-1.5" />
              <div className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Incidencias</div>
              <div className="font-display text-2xl font-bold text-amber-700 mt-1">{profileStats.incidentCount}</div>
            </div>
            <div className="bg-purple-50/50 border border-purple-100 rounded-[calc(var(--radius)+4px)] p-4 text-center shadow-sm">
              <TrendingUp className="h-5 w-5 mx-auto text-purple-600 mb-1.5" />
              <div className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">Rendimiento</div>
              <div className="font-display text-2xl font-bold text-purple-700 mt-1">
                {generalAverage !== null ? `${generalAverage} Pts` : (
                  profileStats.incidentCount === 0 && profileStats.anecdotalCount > 0 ? "Bueno" : profileStats.incidentCount > 2 ? "En riesgo" : "Normal"
                )}
              </div>
              {generalAverage !== null && (
                <div className="text-[9px] font-bold text-purple-500 mt-0.5 uppercase tracking-wide">
                  {generalAverage >= 90 ? "Excelente" : generalAverage >= 80 ? "Muy Bueno" : generalAverage >= (activeClassroom?.nivel === "secundaria" ? 70 : 65) ? "Satisfactorio" : "En Riesgo"}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* LEFT: Attendance + Contact */}
            <div className="space-y-6">
              {/* Attendance Breakdown */}
              <div className="bg-white border border-slate-200/80 rounded-[calc(var(--radius)+4px)] p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-brand-primary" />
                  <h3 className="font-bold text-sm text-text-main">Desglose de Asistencia</h3>
                </div>
                {profileStats.totalDays > 0 ? (
                  <>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <div className="font-bold text-emerald-600 text-xl">{profileStats.present}</div>
                        <div className="text-[10px] text-text-muted">Presente</div>
                      </div>
                      <div>
                        <div className="font-bold text-rose-500 text-xl">{profileStats.absent}</div>
                        <div className="text-[10px] text-text-muted">Ausente</div>
                      </div>
                      <div>
                        <div className="font-bold text-amber-500 text-xl">{profileStats.tardy}</div>
                        <div className="text-[10px] text-text-muted">Tarde</div>
                      </div>
                      <div>
                        <div className="font-bold text-blue-500 text-xl">{profileStats.excuse}</div>
                        <div className="text-[10px] text-text-muted">Excusa</div>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                      {profileStats.present > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${(profileStats.present / profileStats.totalDays) * 100}%` }} />}
                      {profileStats.tardy > 0 && <div className="bg-amber-400 h-full" style={{ width: `${(profileStats.tardy / profileStats.totalDays) * 100}%` }} />}
                      {profileStats.excuse > 0 && <div className="bg-blue-400 h-full" style={{ width: `${(profileStats.excuse / profileStats.totalDays) * 100}%` }} />}
                      {profileStats.absent > 0 && <div className="bg-rose-500 h-full" style={{ width: `${(profileStats.absent / profileStats.totalDays) * 100}%` }} />}
                    </div>
                    <span className="text-[10px] font-semibold text-text-muted text-center block">
                      Total días registrados: <span className="font-bold text-text-main">{profileStats.totalDays}</span>
                    </span>
                  </>
                ) : (
                  <div className="py-6 text-center text-xs text-text-muted border rounded-xl border-dashed border-slate-200">
                    No hay registros de asistencia aún.
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="bg-white border border-slate-200/80 rounded-[calc(var(--radius)+4px)] p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800">Información del Tutor y Contacto</h3>
                <div className="space-y-3.5 text-xs">
                  {/* Tutor Principal */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 border border-slate-200">
                    <User className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider flex items-center gap-1.5 flex-wrap">
                        Tutor Principal
                        {selectedStudentForProfile.tutor_relacion && (
                          <span className="text-[8px] font-black bg-blue-100 text-blue-750 px-1.5 py-0.2 rounded uppercase border border-blue-200">
                            {selectedStudentForProfile.tutor_relacion}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-850 mt-1 truncate">{selectedStudentForProfile.tutor_nombre || "No registrado"}</div>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                      <div>
                        <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Teléfono de Contacto</div>
                        <div className="font-bold text-slate-850 mt-0.5">{formatPhone(selectedStudentForProfile.tutor_telefono) || "No registrado"}</div>
                      </div>
                    </div>
                    {selectedStudentForProfile.tutor_telefono && (
                      <a
                        href={getWhatsAppLink(selectedStudentForProfile.tutor_telefono, selectedStudentForProfile.tutor_nombre, `${selectedStudentForProfile.nombre} ${selectedStudentForProfile.apellido || ""}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs"
                        title="Enviar WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Correo */}
                  {selectedStudentForProfile.email_tutor && (
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/50 border border-slate-200">
                      <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                      <div>
                        <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Correo Electrónico</div>
                        <div className="font-bold text-slate-850 mt-0.5 truncate">{selectedStudentForProfile.email_tutor}</div>
                      </div>
                    </div>
                  )}

                  {/* Tutor Secundario (si existe) */}
                  {selectedStudentForProfile.tutor2_nombre && (
                    <>
                      <div className="border-t border-dashed border-slate-200 my-2" />
                      
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 border border-slate-200">
                        <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider flex items-center gap-1.5 flex-wrap">
                            Tutor Secundario
                            {selectedStudentForProfile.tutor2_relacion && (
                              <span className="text-[8px] font-black bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded uppercase border border-slate-300">
                                {selectedStudentForProfile.tutor2_relacion}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-slate-850 mt-1 truncate">{selectedStudentForProfile.tutor2_nombre}</div>
                        </div>
                      </div>

                      {selectedStudentForProfile.tutor2_telefono && (
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 border border-slate-200">
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                            <div>
                              <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Teléfono Secundario</div>
                              <div className="font-bold text-slate-850 mt-0.5">{formatPhone(selectedStudentForProfile.tutor2_telefono)}</div>
                            </div>
                          </div>
                          <a
                            href={getWhatsAppLink(selectedStudentForProfile.tutor2_telefono, selectedStudentForProfile.tutor2_nombre, `${selectedStudentForProfile.nombre} ${selectedStudentForProfile.apellido || ""}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs"
                            title="Enviar WhatsApp"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </>
                  )}

                  {/* Dirección */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 border border-slate-200">
                    <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Dirección de Residencia</div>
                      <div className="font-semibold text-slate-800 mt-0.5 leading-relaxed">{selectedStudentForProfile.direccion || "Sin dirección registrada"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Anecdotals + Incidences */}
            <div className="lg:col-span-2 space-y-6">
              {/* Anecdotal Records */}
              <div className="bg-white border border-slate-200/80 rounded-[calc(var(--radius)+4px)] p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-brand-primary shrink-0" />
                  <h3 className="font-bold text-sm text-text-main">Registro Anecdótico</h3>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {profileStats.anecdotalCount} registros
                  </span>
                </div>

                {(() => {
                  const studentAnecdotals = getStudentAnecdotalRecords(selectedStudentForProfile.id);
                  const latestAnecdotal = studentAnecdotals.length > 0 ? studentAnecdotals[0] : null;
                  if (latestAnecdotal) {
                    return (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[9px] text-brand-primary uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded-md">Última Observación</span>
                            <span className="font-semibold text-xs text-text-main">
                              {latestAnecdotal.fecha}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{latestAnecdotal.hecho}</p>
                          {latestAnecdotal.sugerencia_ia && (
                            <div className="mt-3 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100/60 text-[11px] text-blue-750 flex gap-2">
                              <Sparkles className="inline h-3.5 w-3.5 mr-1 text-blue-600 shrink-0 mt-0.5" />
                              <p className="font-medium">
                                <span className="font-bold">Recomendación Planix IA:</span> {latestAnecdotal.sugerencia_ia}
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setShowAllAnecdotalModal(true)}
                          className="w-full h-9 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <History className="h-4 w-4 text-slate-500" /> Ver Historial Completo ({studentAnecdotals.length})
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div className="py-8 text-center text-xs text-text-muted border rounded-xl border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                        <FileText className="h-6 w-6 text-text-muted/40" />
                        <span>No hay registros anecdóticos para este estudiante.</span>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Incidences */}
              <div className="bg-white border border-slate-200/80 rounded-[calc(var(--radius)+4px)] p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <h3 className="font-bold text-sm text-text-main">Registro de Incidencias</h3>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md ml-auto">
                    {profileStats.incidentCount} incidencias
                  </span>
                </div>
                {(() => {
                  const incidents = getIncidences(selectedStudentForProfile.id);
                  if (incidents.length > 0) {
                    return (
                      <div className="space-y-3">
                        {incidents.slice(0, 2).map((inc) => (
                          <div key={inc.id} className="p-4 rounded-lg border border-slate-200 bg-white hover:border-amber-200 transition">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-xs text-text-main">
                                {inc.fecha}
                              </span>
                              <span
                                className={`border text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  inc.gravedad === "grave" 
                                    ? "border-rose-300 text-rose-600 bg-rose-50" 
                                    : inc.gravedad === "moderada" 
                                      ? "border-amber-300 text-amber-600 bg-amber-50" 
                                      : "border-slate-300 text-slate-500 bg-slate-50"
                                }`}
                              >
                                {inc.gravedad.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{inc.descripcion}</p>
                            {inc.medidas_tomadas && (
                              <div className="mt-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100 text-[11px] text-amber-700">
                                <strong>Medidas tomadas:</strong> {inc.medidas_tomadas}
                              </div>
                            )}
                          </div>
                        ))}
                        {incidents.length > 2 && (
                          <button
                            onClick={() => setShowAllIncidencesModal(true)}
                            className="w-full h-8 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            Ver todos ({incidents.length})
                          </button>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div className="py-8 text-center text-xs text-text-muted border rounded-xl border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                        <ShieldAlert className="h-6 w-6 mx-auto text-text-muted/40 mb-2" />
                        No hay incidencias registradas para este estudiante.
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Academics Section Title */}
          <div className="flex items-center gap-2.5 pt-6 border-t border-slate-200/80">
            <GraduationCap className="h-6 w-6 text-brand-primary" />
            <div>
              <h2 className="font-display text-lg font-bold text-slate-800">Desempeño Curricular y Rúbricas</h2>
              <p className="text-[11px] text-text-muted mt-0.5">
                Calificaciones oficiales por competencia y registro histórico de evaluaciones formativas aplicadas.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* LEFT: Competency Averages (2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-[calc(var(--radius)+4px)] p-5 space-y-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-brand-primary" />
                    <h3 className="font-bold text-sm text-slate-800">Promedios por Competencia</h3>
                  </div>
                  {profileSubjectsList.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-text-muted font-medium">Asignatura:</span>
                      <div className="relative select-none">
                        <div 
                          onClick={() => setShowProfileSubjectDropdown(!showProfileSubjectDropdown)}
                          className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer hover:border-brand-primary transition-all min-w-[180px]"
                        >
                          <span className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm shrink-0">
                              {getSubjectIcon(activeProfileSubjectId, "h-4 w-4")}
                            </span>
                            <span className="truncate">
                              {profileSubjectsList.find(s => s.id === activeProfileSubjectId)?.name || "Elegir materia"}
                            </span>
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${showProfileSubjectDropdown ? 'rotate-180' : ''}`} />
                        </div>

                        {showProfileSubjectDropdown && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowProfileSubjectDropdown(false)} />
                            <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl border border-slate-300 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1.5 duration-150">
                              <div className="space-y-0.5 animate-in fade-in duration-100">
                                {profileSubjectsList.map(sub => {
                                  const isActive = sub.id === activeProfileSubjectId;
                                  return (
                                    <button
                                      key={sub.id}
                                      type="button"
                                      onClick={() => {
                                        setActiveProfileSubjectId(sub.id);
                                        setShowProfileSubjectDropdown(false);
                                      }}
                                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-bold transition-colors cursor-pointer border-none outline-none ${
                                        isActive 
                                          ? 'bg-brand-primary text-white font-extrabold' 
                                          : 'text-slate-750 hover:bg-slate-50 hover:text-slate-900'
                                      }`}
                                    >
                                      <span className="shrink-0">{getSubjectIcon(sub.id, "h-4 w-4")}</span>
                                      <span className="truncate">{sub.name}</span>
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

                {/* Subject Hero Header */}
                {(() => {
                  const subAverage = (() => {
                    const subGrades = getStudentOfficialGrades(selectedStudentForProfile.id).filter(
                      g => g.subject_id === activeProfileSubjectId
                    );
                    if (subGrades.length === 0) return null;
                    const validAverages = subGrades.map(g => {
                      if (g.competency_average !== undefined && g.competency_average !== null) {
                        return g.competency_average;
                      }
                      return calculateCompetencyAverage([
                        { p: g.p1, rp: g.rp1 },
                        { p: g.p2, rp: g.rp2 },
                        { p: g.p3, rp: g.rp3 },
                        { p: g.p4, rp: g.rp4 }
                      ]);
                    }).filter((val): val is number => val !== null);
                    if (validAverages.length === 0) return null;
                    const sum = validAverages.reduce((acc, curr) => acc + curr, 0);
                    return Math.round(sum / validAverages.length);
                  })();

                  return (
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-brand-primary text-white shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="bg-white/10 p-2.5 rounded-xl flex items-center justify-center shrink-0 w-12 h-12 shadow-inner">
                          {getSubjectIcon(activeProfileSubjectId, "h-6 w-6")}
                        </span>
                        <div>
                          <div className="text-[9px] uppercase font-black tracking-widest text-blue-200">Asignatura seleccionada</div>
                          <div className="font-display text-sm sm:text-base font-bold mt-0.5">
                            {profileSubjectsList.find(s => s.id === activeProfileSubjectId)?.name || "Sin selección"}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-6 text-center">
                        {generalAverage !== null && (
                          <div className="flex flex-col items-center">
                            <div className="text-[9px] uppercase font-black tracking-widest text-blue-200">Promedio General</div>
                            <div className="text-sm font-black mt-0.5 text-blue-100">
                              {generalAverage} pts
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col items-center">
                          <div className="text-[9px] uppercase font-black tracking-widest text-blue-200">Promedio Asignatura</div>
                          <div className="text-xl sm:text-2xl font-black mt-0.5">
                            {subAverage !== null ? `${subAverage} pts` : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Competency cards list */}
                <div className="space-y-4">
                  {(() => {
                    const isSecondary = activeClassroom?.nivel === "secundaria";
                    const comps = isSecondary ? [
                      { id: "PC1", name: "Competencia Específica 1", description: "Grupo de competencias específicas del área según el currículo del Nivel Secundario." },
                      { id: "PC2", name: "Competencia Específica 2", description: "Grupo de competencias específicas del área según el currículo del Nivel Secundario." },
                      { id: "PC3", name: "Competencia Específica 3", description: "Grupo de competencias específicas del área según el currículo del Nivel Secundario." },
                      { id: "PC4", name: "Competencia Específica 4", description: "Grupo de competencias específicas del área según el currículo del Nivel Secundario." }
                    ] : [
                      { id: "C1", name: "Comunicativa", description: "Se comunica en diferentes contextos mediante un género textual adecuado, con el propósito de expresar sus ideas." },
                      { id: "C2", name: "Pensamiento Lógico, Creativo y Crítico", description: "Emplea textos variados en la construcción de nuevos conocimientos sobre temas y problemas de su vida social." },
                      { id: "C3", name: "Ética y Ciudadana; Desarrollo Personal; Ambiental y de la Salud", description: "Usa textos orales y escritos en demostración de conocimiento sobre las relaciones socioculturales y la salud." }
                    ];
                    const passingGrade = isSecondary ? 70 : 65;

                    return comps.map(comp => {
                      const gradeRecord = profileSubjectGrades.find(
                        g => g.competency_id === comp.id
                      );

                      const computedAverage = gradeRecord 
                        ? (gradeRecord.competency_average !== undefined && gradeRecord.competency_average !== null
                            ? gradeRecord.competency_average
                            : calculateCompetencyAverage([
                                { p: gradeRecord.p1, rp: gradeRecord.rp1 },
                                { p: gradeRecord.p2, rp: gradeRecord.rp2 },
                                { p: gradeRecord.p3, rp: gradeRecord.rp3 },
                                { p: gradeRecord.p4, rp: gradeRecord.rp4 }
                              ])
                          )
                        : null;

                      return (
                        <div key={comp.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-350 transition-colors shadow-sm space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-brand-primary bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wide">{comp.id}</span>
                                <span className="font-bold text-xs text-slate-800">{comp.name}</span>
                              </div>
                              <p className="text-[10px] text-text-muted leading-relaxed">{comp.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[9px] uppercase font-bold text-slate-400">Promedio</div>
                              <div className="mt-0.5">
                                {computedAverage !== undefined && computedAverage !== null ? (
                                  <span
                                    className={`inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                      computedAverage >= passingGrade
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-rose-50 text-rose-700 border-rose-200"
                                    }`}
                                  >
                                    {computedAverage} pts
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-slate-400">—</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Period Breakdown grid */}
                          <div className="grid grid-cols-4 gap-2 text-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-200">
                            {/* P1 */}
                            <div>
                              <div className="text-[8px] uppercase font-bold text-slate-400">P1</div>
                              <div className="text-xs font-bold text-text-main mt-0.5">
                                {gradeRecord && gradeRecord.p1 !== undefined && gradeRecord.p1 !== null ? (
                                  gradeRecord.rp1 ? (
                                    <span className="flex items-center justify-center gap-1">
                                      <span className="line-through text-slate-400 text-[10px]">{gradeRecord.p1}</span>
                                      <span className="text-emerald-600 font-bold">{gradeRecord.rp1}</span>
                                    </span>
                                  ) : (
                                    <span className={gradeRecord.p1 < passingGrade ? "text-rose-500 font-bold" : ""}>{gradeRecord.p1}</span>
                                  )
                                ) : "—"}
                              </div>
                            </div>

                            {/* P2 */}
                            <div>
                              <div className="text-[8px] uppercase font-bold text-slate-400">P2</div>
                              <div className="text-xs font-bold text-text-main mt-0.5">
                                {gradeRecord && gradeRecord.p2 !== undefined && gradeRecord.p2 !== null ? (
                                  gradeRecord.rp2 ? (
                                    <span className="flex items-center justify-center gap-1">
                                      <span className="line-through text-slate-400 text-[10px]">{gradeRecord.p2}</span>
                                      <span className="text-emerald-600 font-bold">{gradeRecord.rp2}</span>
                                    </span>
                                  ) : (
                                    <span className={gradeRecord.p2 < passingGrade ? "text-rose-500 font-bold" : ""}>{gradeRecord.p2}</span>
                                  )
                                ) : "—"}
                              </div>
                            </div>

                            {/* P3 */}
                            <div>
                              <div className="text-[8px] uppercase font-bold text-slate-400">P3</div>
                              <div className="text-xs font-bold text-text-main mt-0.5">
                                {gradeRecord && gradeRecord.p3 !== undefined && gradeRecord.p3 !== null ? (
                                  gradeRecord.rp3 ? (
                                    <span className="flex items-center justify-center gap-1">
                                      <span className="line-through text-slate-400 text-[10px]">{gradeRecord.p3}</span>
                                      <span className="text-emerald-600 font-bold">{gradeRecord.rp3}</span>
                                    </span>
                                  ) : (
                                    <span className={gradeRecord.p3 < passingGrade ? "text-rose-500 font-bold" : ""}>{gradeRecord.p3}</span>
                                  )
                                ) : "—"}
                              </div>
                            </div>

                            {/* P4 */}
                            <div>
                              <div className="text-[8px] uppercase font-bold text-slate-400">P4</div>
                              <div className="text-xs font-bold text-text-main mt-0.5">
                                {gradeRecord && gradeRecord.p4 !== undefined && gradeRecord.p4 !== null ? (
                                  gradeRecord.rp4 ? (
                                    <span className="flex items-center justify-center gap-1">
                                      <span className="line-through text-slate-400 text-[10px]">{gradeRecord.p4}</span>
                                      <span className="text-emerald-600 font-bold">{gradeRecord.rp4}</span>
                                    </span>
                                  ) : (
                                    <span className={gradeRecord.p4 < passingGrade ? "text-rose-500 font-bold" : ""}>{gradeRecord.p4}</span>
                                  )
                                ) : "—"}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* RIGHT: Rubric evaluations history (1 column) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-[calc(var(--radius)+4px)] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-brand-primary" />
                    <h3 className="font-bold text-sm text-text-main">Rúbricas Aplicadas</h3>
                  </div>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {studentRubricsEvaluations.length} evaluaciones
                  </span>
                </div>

                {studentRubricsEvaluations.length > 0 ? (
                  <div className="space-y-4">
                    {studentRubricsEvaluations.map((evalRecord) => {
                      const rubric = rubricsList.find(r => r.id === evalRecord.rubric_id);
                      const isExpanded = expandedRubricId === evalRecord.id;

                      return (
                        <div
                          key={evalRecord.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-slate-800 truncate" title={evalRecord.rubricTitle}>
                                {evalRecord.rubricTitle}
                              </h4>
                              <span className="text-[9px] text-muted-foreground block mt-0.5">
                                {evalRecord.fecha}
                              </span>
                            </div>
                            <span className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/10 font-bold text-xs px-2.5 py-0.5 rounded-full shrink-0">
                              {evalRecord.nota_calculada} pts
                            </span>
                          </div>

                          {/* Qualitative Feedback */}
                          {evalRecord.retroalimentacion && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100/80 leading-relaxed">
                              <Sparkles className="inline h-3 w-3 mr-1 text-brand-primary shrink-0" />
                              <span className="font-semibold text-slate-800 text-[10px]">Retroalimentación:</span>{" "}
                              {evalRecord.retroalimentacion}
                            </p>
                          )}

                          {/* Criteria Detail toggle */}
                          <div>
                            <button
                              onClick={() => setExpandedRubricId(isExpanded ? null : evalRecord.id)}
                              className="flex items-center gap-1 text-[10px] font-bold text-brand-primary hover:underline cursor-pointer focus:outline-none"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3.5 w-3.5" /> Ocultar detalle
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3.5 w-3.5" /> Ver criterios
                                </>
                              )}
                            </button>

                            {isExpanded && rubric && (
                              <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2">
                                {rubric.criterios.map((crit, cIdx) => {
                                  const points = evalRecord.evaluaciones[crit.nombre];
                                  const maxPoints = Math.max(...crit.niveles.map(n => n.puntos));

                                  return (
                                    <div key={cIdx} className="flex items-center justify-between text-[10px] py-0.5">
                                      <span className="text-slate-600 font-medium truncate pr-4">{crit.nombre}</span>
                                      <span className="font-bold text-slate-850 shrink-0">
                                        {points !== undefined ? `${points} / ${maxPoints} pts` : `— / ${maxPoints} pts`}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-text-muted border rounded-xl border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                    <BookOpen className="h-6 w-6 text-text-muted/40 mb-2" />
                    No se han aplicado rúbricas a este estudiante todavía.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ALL ANECDOTAL RECORDS MODAL POPUP */}
      {showAllAnecdotalModal && selectedStudentForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setShowAllAnecdotalModal(false)} />
          
          {printRecordId && (
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #print-record-${printRecordId}, #print-record-${printRecordId} * {
                  visibility: visible !important;
                }
                #print-record-${printRecordId} {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  border: none !important;
                  box-shadow: none !important;
                }
              }
            `}</style>
          )}

          <div className="relative w-full max-w-2xl bg-white rounded-[calc(var(--radius)+4px)] shadow-2xl border border-black/5 flex flex-col max-h-[85vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200 text-left">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-brand-primary">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Historial Anecdótico</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {selectedStudentForProfile.nombre} {selectedStudentForProfile.apellido || ""} ·{" "}
                    <span className="font-bold text-slate-700">
                      {getStudentAnecdotalRecords(selectedStudentForProfile.id).length} registros
                    </span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAllAnecdotalModal(false)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-650 bg-white hover:bg-slate-50 shadow-sm cursor-pointer transition flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Date Filters Block */}
            <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="text-[10px]">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Desde</label>
                <input 
                  type="date"
                  value={profileStartDate}
                  onChange={(e) => setProfileStartDate(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none font-semibold text-xs text-slate-700"
                />
              </div>
              <div className="text-[10px]">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Hasta</label>
                <div className="relative flex items-center">
                  <input 
                    type="date"
                    value={profileEndDate}
                    onChange={(e) => setProfileEndDate(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none font-semibold text-xs text-slate-700"
                  />
                  {(profileStartDate || profileEndDate) && (
                    <button
                      onClick={() => { setProfileStartDate(""); setProfileEndDate(""); }}
                      className="absolute right-2.5 text-[9px] font-black text-rose-600 hover:text-rose-700 cursor-pointer uppercase bg-white px-1"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
              <div>
                <button
                  onClick={() => window.print()}
                  disabled={
                    (() => {
                      let records = getStudentAnecdotalRecords(selectedStudentForProfile.id);
                      if (profileStartDate) {
                        const start = new Date(profileStartDate + "T00:00:00");
                        records = records.filter(rec => new Date(rec.fecha) >= start);
                      }
                      if (profileEndDate) {
                        const end = new Date(profileEndDate + "T23:59:59");
                        records = records.filter(rec => new Date(rec.fecha) <= end);
                      }
                      return records.length === 0;
                    })()
                  }
                  className="w-full h-8 bg-brand-primary hover:bg-brand-hover text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" /> Imprimir Rango
                </button>
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[50vh]">
              {(() => {
                let records = getStudentAnecdotalRecords(selectedStudentForProfile.id);
                if (profileStartDate) {
                  const start = new Date(profileStartDate + "T00:00:00");
                  records = records.filter(rec => new Date(rec.fecha) >= start);
                }
                if (profileEndDate) {
                  const end = new Date(profileEndDate + "T23:59:59");
                  records = records.filter(rec => new Date(rec.fecha) <= end);
                }
                const sortedRecords = [...records].sort((a, b) => b.fecha.localeCompare(a.fecha));

                if (sortedRecords.length > 0) {
                  return sortedRecords.map((rec, index) => (
                    <div 
                      key={rec.id} 
                      id={`print-record-${rec.id}`}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition shadow-sm space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                            #{sortedRecords.length - index}
                          </span>
                          <span className="font-bold text-xs text-slate-800">
                            {(() => {
                              const formatted = new Date(rec.fecha).toLocaleDateString("es-DO", {
                                weekday: "short",
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              });
                              return formatted.charAt(0).toUpperCase() + formatted.slice(1);
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center text-[9px] font-black bg-blue-50 text-blue-750 px-2 py-0.5 rounded uppercase border border-blue-200">
                            guardado
                          </span>
                          <button
                            onClick={() => handlePrintSingle(rec.id)}
                            className="h-7 w-7 p-0 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center justify-center transition"
                            title="Imprimir solo este registro"
                          >
                            <Printer className="h-3.5 w-3.5 text-slate-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/40 p-3 rounded-lg border border-slate-100">
                        {rec.hecho}
                      </p>
                      {rec.sugerencia_ia && (
                        <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-100 text-[11px] text-blue-750 flex gap-2">
                          <Sparkles className="inline h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            <span className="font-bold">Recomendación Planix IA:</span> {rec.sugerencia_ia}
                          </p>
                        </div>
                      )}
                    </div>
                  ));
                } else {
                  return (
                    <div className="py-12 text-center text-xs text-text-muted border rounded-xl border-dashed border-black/5 flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-slate-300" />
                      <span>
                        {getStudentAnecdotalRecords(selectedStudentForProfile.id).length > 0
                          ? "Ningún registro coincide con las fechas seleccionadas."
                          : "No hay registros cargados."}
                      </span>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShowAllAnecdotalModal(false)}
                className="h-8.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer border-none flex items-center gap-1.5 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Cerrar Historial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALL INCIDENCES MODAL POPUP */}
      {showAllIncidencesModal && selectedStudentForProfile && (
        <div 
          onClick={() => setShowAllIncidencesModal(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-black/5 rounded-[28px] p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl relative cursor-default space-y-4 animate-in zoom-in-95 duration-250 scrollbar-hide text-left"
          >
            <button
              onClick={() => setShowAllIncidencesModal(false)}
              className="absolute right-5 top-5 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5" strokeWidth={3} />
            </button>

            <div>
              <h3 className="text-lg font-bold text-text-main">
                Historial de Incidencias Completo
              </h3>
              <p className="text-[12px] text-text-muted mt-0.5 font-semibold">
                Estudiante: <span className="font-bold text-text-main">{selectedStudentForProfile.nombre} {selectedStudentForProfile.apellido || ""}</span>
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {getIncidences(selectedStudentForProfile.id).length > 0 ? (
                getIncidences(selectedStudentForProfile.id)
                  .sort((a, b) => b.fecha.localeCompare(a.fecha))
                  .map((inc) => {
                    const colors = {
                      leve: "bg-green-50 border-green-200 text-green-800",
                      moderada: "bg-amber-50 border-amber-200 text-amber-800",
                      grave: "bg-red-50 border-red-200 text-red-800",
                    };
                    return (
                      <div key={inc.id} className={`border rounded-[20px] p-4 flex flex-col gap-1.5 text-left ${colors[inc.gravedad]}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-wider">{inc.gravedad}</span>
                          <span className="bg-white/80 text-[10px] font-bold px-2 py-0.5 rounded-full">{inc.fecha}</span>
                        </div>
                        <p className="text-[12.5px] font-medium leading-relaxed">{inc.descripcion}</p>
                        {inc.medidas_tomadas && (
                          <div className="bg-white/60 rounded-xl p-2.5 text-[11px] font-medium mt-1">
                            <span className="font-bold block text-[9.5px] uppercase tracking-wider opacity-75">Compromiso / Medida:</span>
                            {inc.medidas_tomadas}
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-12 text-text-muted text-xs">
                  No hay reportes de incidencias.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* DELETE CONFIRMATION CONSENT MODAL */}
      {studentToDelete && (
        <div
          onClick={() => setStudentToDelete(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl w-full max-w-[400px] overflow-hidden border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-200 relative cursor-default p-6"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FFEAF0] to-[#FFF0F5] flex items-center justify-center shadow-sm">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-[17px] font-black text-[#1B1B1B] dark:text-white tracking-tight">
                  ¿Eliminar Estudiante?
                </h3>
                <p className="text-[12px] font-bold text-[#1B1B1B]/50 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                  Esta acción eliminará de forma permanente a <span className="text-[#1B1B1B] dark:text-white font-extrabold">"{studentToDelete.nombre} {studentToDelete.apellido || ""}"</span> de esta aula. No se podrán recuperar sus conductas ni calificaciones.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  onClick={() => setStudentToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#F5F5F5] dark:bg-slate-800 text-[#1B1B1B] dark:text-slate-200 text-[12px] font-bold border border-black/5 dark:border-white/10 hover:bg-[#EBEBEB] dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    deleteStudent(studentToDelete.id);
                    if (activeClassId) loadStudents(activeClassId);
                    setStudentToDelete(null);
                    toast.success("Estudiante eliminado.");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-[12px] font-black shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREAR AULA MODAL */}
      {isCreateClassModalOpen && (
        <div 
          onClick={() => setIsCreateClassModalOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[22px] p-6 max-w-lg w-full shadow-2xl relative cursor-default"
          >
            <button
              onClick={() => setIsCreateClassModalOpen(false)}
              className="absolute right-5 top-5 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-sm animate-all"
              title="Cerrar"
            >
              <X className="w-4 h-4" strokeWidth={3} />
            </button>

            <h3 className="text-lg font-black text-slate-850 dark:text-white mb-4">Crear Nueva Aula</h3>

            <form onSubmit={handleCreateClassroomSubmit} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest">Nombre del Aula</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="ej. 4to de Primaria - Sección A"
                  className="w-full bg-[#FAFAFA] dark:bg-zinc-800 border border-black/5 dark:border-zinc-800 rounded-xl px-4 h-10 text-sm font-semibold text-text-main outline-none focus:border-black/20 dark:focus:border-white/20 focus:bg-white dark:focus:bg-zinc-800 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 relative select-none">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest">Nivel Educativo</label>
                  <div
                    onClick={() => {
                      if (allowedLevels.length > 1) {
                        setShowLevelDropdown(!showLevelDropdown);
                      }
                    }}
                    className={`w-full bg-[#FAFAFA] dark:bg-zinc-800 border border-black/5 dark:border-zinc-800 rounded-xl px-4 h-10 text-sm font-bold text-text-main flex items-center justify-between transition-colors ${
                      allowedLevels.length > 1 ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/80' : 'cursor-not-allowed opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {newClassLevel === "primaria" ? (
                        <BookOpen className="w-4 h-4 text-slate-555 shrink-0" />
                      ) : newClassLevel === "secundaria" ? (
                        <GraduationCap className="w-4 h-4 text-slate-555 shrink-0" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-slate-555 shrink-0" />
                      )}
                      <span className="capitalize">{newClassLevel}</span>
                    </div>
                    {allowedLevels.length > 1 && (
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showLevelDropdown ? 'rotate-180' : ''}`} />
                    )}
                  </div>

                  {showLevelDropdown && allowedLevels.length > 1 && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowLevelDropdown(false)} />
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 rounded-xl border border-black/5 dark:border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="space-y-1">
                          {allowedLevels.map((lvl) => (
                            <button
                              type="button"
                              onClick={() => {
                                setNewClassLevel(lvl as any);
                                setShowLevelDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl text-left text-sm font-bold transition-all ${
                                newClassLevel === lvl 
                                  ? "bg-slate-50 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white" 
                                  : "text-slate-650 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {lvl === "primaria" ? (
                                  <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                                ) : lvl === "secundaria" ? (
                                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                                ) : (
                                  <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                                <span className="capitalize">{lvl}</span>
                              </div>
                              {newClassLevel === lvl && <Check className="w-4 h-4 shrink-0 text-slate-800 dark:text-slate-200" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest">Sección</label>
                  <input
                    type="text"
                    value={newClassSection}
                    onChange={(e) => setNewClassSection(e.target.value)}
                    placeholder="ej. A"
                    className="w-full bg-[#FAFAFA] dark:bg-zinc-800 border border-black/5 dark:border-zinc-800 rounded-xl px-4 h-10 text-sm font-bold text-text-main outline-none focus:border-black/20 dark:focus:border-white/20 focus:bg-white dark:focus:bg-zinc-800 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 relative select-none">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest">Grado Curricular</label>
                  <div
                    onClick={() => {
                      if (availableGrades.length > 1) {
                        setShowGradeDropdown(!showGradeDropdown);
                      }
                    }}
                    className={`w-full bg-[#FAFAFA] dark:bg-zinc-800 border border-black/5 dark:border-zinc-800 rounded-xl px-4 h-10 text-sm font-bold text-text-main flex items-center justify-between transition-colors ${
                      availableGrades.length > 1 ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/80' : 'cursor-not-allowed opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {newClassLevel === "primaria" ? (
                        <BookOpen className="w-4 h-4 text-slate-555 shrink-0" />
                      ) : newClassLevel === "secundaria" ? (
                        <GraduationCap className="w-4 h-4 text-slate-555 shrink-0" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-slate-555 shrink-0" />
                      )}
                      <span className="truncate text-left">
                        {(() => {
                          const grade = availableGrades.find(g => g.id === newClassGrade);
                          return grade ? grade.displayName.split(" (")[0] : "Seleccionar";
                        })()}
                      </span>
                    </div>
                    {availableGrades.length > 1 && (
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
                    )}
                  </div>

                  {showGradeDropdown && availableGrades.length > 1 && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowGradeDropdown(false)} />
                      <div className="absolute left-0 right-0 top-full mt-2 max-h-56 overflow-y-auto bg-white dark:bg-zinc-900 rounded-xl border border-black/5 dark:border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-hide text-left">
                        <div className="space-y-1">
                          {availableGrades.map((g) => {
                            const isActive = g.id === newClassGrade;
                            return (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => {
                                  setNewClassGrade(g.id);
                                  setShowGradeDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl text-left text-sm font-bold transition-all ${
                                  isActive 
                                    ? "bg-slate-50 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white" 
                                    : "text-slate-655 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {newClassLevel === "primaria" ? (
                                    <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                                  ) : newClassLevel === "secundaria" ? (
                                    <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                                  ) : (
                                    <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
                                  )}
                                  <span className="truncate">{g.displayName.split(" (")[0]}</span>
                                </div>
                                {isActive && <Check className="w-4 h-4 shrink-0 text-slate-800 dark:text-slate-200" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest">Año Lectivo</label>
                  <input
                    type="text"
                    value={newClassPeriodo}
                    readOnly
                    className="w-full bg-[#EBEBEB] dark:bg-zinc-800 border border-black/5 dark:border-zinc-700 rounded-xl px-4 h-10 text-sm font-bold text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateClassModalOpen(false)}
                  className="bg-[#FAFAFA] dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-black/5 dark:border-zinc-700 rounded-full px-4 py-2 text-[13px] font-bold transition-all cursor-pointer active:scale-95 select-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#1B1B1B] dark:bg-white hover:bg-[#2B2B2B] dark:hover:bg-slate-100 text-white dark:text-black rounded-full px-4 py-2 text-[13px] font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} /> Crear Aula Virtual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Classroom Confirmation Modal */}
      {classroomToDelete && (
        <div
          onClick={() => setClassroomToDelete(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl w-full max-w-[400px] overflow-hidden border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-200 relative cursor-default p-6"
          >
            {/* Red accent icon */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FFEAF0] to-[#FFF0F5] flex items-center justify-center shadow-sm">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-[17px] font-black text-[#1B1B1B] dark:text-white tracking-tight">
                  ¿Eliminar esta aula?
                </h3>
                <p className="text-[12px] font-bold text-[#1B1B1B]/50 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                  Se eliminará <span className="text-[#1B1B1B] dark:text-white font-extrabold">"{classroomToDelete.nombre}"</span> junto con todos sus estudiantes y registros asociados. Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  onClick={() => setClassroomToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#F5F5F5] dark:bg-slate-800 text-[#1B1B1B] dark:text-slate-200 text-[12px] font-bold border border-black/5 dark:border-white/10 hover:bg-[#EBEBEB] dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    deleteClassroom(classroomToDelete.id);
                    if (activeClassId === classroomToDelete.id) {
                      setActiveClassId(null);
                    }
                    
                    // Actualizar la lista de aulas inmediatamente en el estado local
                    const data = user.rol === "admin" ? getAllClassroomsAdmin() : getClassrooms(user.id);
                    setClassrooms(data);

                    toast.success(`"${classroomToDelete.nombre}" eliminada correctamente.`);
                    setClassroomToDelete(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-[12px] font-black shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Classroom Modal */}
      {editingClassroom && (
        <div 
          onClick={() => setEditingClassroom(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-black/5 rounded-[28px] p-6 max-w-md w-full shadow-2xl relative cursor-default"
          >
            <button
              onClick={() => setEditingClassroom(null)}
              className="absolute right-5 top-5 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5" strokeWidth={3} />
            </button>

            <h3 className="text-lg font-bold text-text-main mb-4">Editar Aula</h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editClassName.trim()) return;
              saveClassroom({
                ...editingClassroom,
                nombre: editClassName.trim(),
                nivel: editClassLevel,
                grado: editClassGrade,
                seccion: editClassSection.trim() || editingClassroom.seccion,
                periodo: editClassPeriodo.trim() || editingClassroom.periodo,
              });
              const data = user.rol === "admin" ? getAllClassroomsAdmin() : getClassrooms(user.id);
              setClassrooms(data);
              toast.success("Aula actualizada correctamente.");
              setEditingClassroom(null);
            }} className="flex flex-col gap-3 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Nombre del Aula</label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  placeholder="ej. 4to de Primaria - Sección A"
                  className="w-full bg-bg-base/60 border border-black/5 rounded-xl px-3.5 py-2 text-xs font-semibold text-text-main outline-none focus:border-black/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 relative select-none">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Nivel Educativo</label>
                  <div
                    onClick={() => setShowEditLevelDropdown(!showEditLevelDropdown)}
                    className="w-full bg-bg-base/60 border border-black/5 rounded-xl px-3.5 py-2 text-xs font-bold text-text-main flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {editClassLevel === "primaria" ? (
                        <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      ) : (
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                      <span>{editClassLevel === "primaria" ? "Primaria" : "Secundaria"}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showEditLevelDropdown ? 'rotate-90' : ''}`} />
                  </div>

                  {showEditLevelDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowEditLevelDropdown(false)} />
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-black/5 shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditClassLevel("primaria");
                              setShowEditLevelDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] font-black transition-colors ${
                              editClassLevel === "primaria" ? "bg-slate-100 text-[#1B1B1B]" : "text-slate-750 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>Primaria</span>
                            </div>
                            {editClassLevel === "primaria" && <Check className="w-3 h-3 shrink-0 text-slate-800" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditClassLevel("secundaria");
                              setShowEditLevelDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] font-black transition-colors ${
                              editClassLevel === "secundaria" ? "bg-slate-100 text-[#1B1B1B]" : "text-slate-750 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>Secundaria</span>
                            </div>
                            {editClassLevel === "secundaria" && <Check className="w-3 h-3 shrink-0 text-slate-800" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sección</label>
                  <input
                    type="text"
                    value={editClassSection}
                    onChange={(e) => setEditClassSection(e.target.value)}
                    placeholder="ej. A"
                    className="w-full bg-bg-base/60 border border-black/5 rounded-xl px-3.5 py-2 text-xs font-bold text-text-main outline-none focus:border-black/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 relative select-none">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Grado Curricular</label>
                  <div
                    onClick={() => setShowEditGradeDropdown(!showEditGradeDropdown)}
                    className="w-full bg-bg-base/60 border border-black/5 rounded-xl px-3.5 py-2 text-xs font-bold text-text-main flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {editClassLevel === "primaria" ? (
                        <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      ) : (
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                      <span className="truncate text-left">
                        {(() => {
                          const grade = availableEditGrades.find(g => g.id === editClassGrade || g.name === editClassGrade);
                          return grade ? grade.displayName.split(" (")[0] : "Seleccionar";
                        })()}
                      </span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showEditGradeDropdown ? 'rotate-90' : ''}`} />
                  </div>

                  {showEditGradeDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowEditGradeDropdown(false)} />
                      <div className="absolute left-0 right-0 top-full mt-1 max-h-40 overflow-y-auto bg-white rounded-xl border border-black/5 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 scrollbar-hide text-left">
                        <div className="space-y-0.5">
                          {availableEditGrades.map((g) => {
                            const isActive = g.id === editClassGrade || g.name === editClassGrade;
                            return (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => {
                                  setEditClassGrade(g.id);
                                  setShowEditGradeDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] font-black transition-colors ${
                                  isActive ? "bg-slate-100 text-[#1B1B1B]" : "text-slate-750 hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {editClassLevel === "primaria" ? (
                                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  ) : (
                                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  )}
                                  <span className="truncate">{g.displayName.split(" (")[0]}</span>
                                </div>
                                {isActive && <Check className="w-3 h-3 shrink-0 text-slate-800" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Año Lectivo</label>
                  <input
                    type="text"
                    value={editClassPeriodo}
                    onChange={(e) => setEditClassPeriodo(e.target.value)}
                    placeholder="ej. 2025-2026"
                    className="w-full bg-bg-base/60 border border-black/5 rounded-xl px-3.5 py-2 text-xs font-bold text-text-main outline-none focus:border-black/20"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingClassroom(null)}
                  className="bg-bg-base text-text-main border border-black/5 px-4 py-2 rounded-full text-[12px] font-bold hover:bg-black/5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#1B1B1B] text-white px-5 py-2 rounded-full text-[12px] font-bold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
