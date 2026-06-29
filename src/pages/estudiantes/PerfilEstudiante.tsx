import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, CalendarCheck, FileText, ShieldAlert, TrendingUp, 
  User, Phone, Mail, Info, FileSpreadsheet, Sparkles, History, 
  BookOpen, ChevronDown, ChevronUp, Award, GraduationCap,
  BookText, Ruler, Globe, Leaf, Palette, Dumbbell, Heart, Languages
} from "lucide-react";
import { useRequireAuth } from "../../lib/useRequireAuth";
import { 
  getClassrooms,
  getAllClassroomsAdmin,
  getStudents, 
  getAnecdotalRecords, 
  getIncidences, 
  getStudentOfficialGrades,
  getStudentRubricEvaluations,
  getAllRubrics,
  getStudentAnecdotalRecords,
  getAttendance,
  Student,
  Classroom
} from "../../lib/storage";
import { OFFICIAL_DEFAULT_SUBJECTS } from "../../lib/data/defaultSubjects";
import { calculateCompetencyAverage } from "../../lib/utils/gradingCalculations";

const SUBJECT_ICON_MAP: Record<string, React.ReactNode> = {
  'lengua-espanola': <BookText className="h-4 w-4" />,
  'matematica': <Ruler className="h-4 w-4" />,
  'sociales': <Globe className="h-4 w-4" />,
  'naturales': <Leaf className="h-4 w-4" />,
  'educacion-artistica': <Palette className="h-4 w-4" />,
  'educacion-fisica': <Dumbbell className="h-4 w-4" />,
  'formacion-humana': <Heart className="h-4 w-4" />,
  'lengua-espanola-sec': <BookText className="h-4 w-4" />,
  'matematica-sec': <Ruler className="h-4 w-4" />,
  'sociales-sec': <Globe className="h-4 w-4" />,
  'naturales-sec': <Leaf className="h-4 w-4" />,
  'ingles': <Languages className="h-4 w-4" />,
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

export default function PerfilEstudiante() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();

  // State to store loaded student and classroom
  const [student, setStudent] = useState<Student | null>(null);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [activeProfileSubjectId, setActiveProfileSubjectId] = useState<string>("");
  const [showProfileSubjectDropdown, setShowProfileSubjectDropdown] = useState(false);
  const [showAllAnecdotalModal, setShowAllAnecdotalModal] = useState(false);
  const [showAllIncidencesModal, setShowAllIncidencesModal] = useState(false);
  const [expandedRubricId, setExpandedRubricId] = useState<string | null>(null);

  // Load student data from storage
  useEffect(() => {
    if (!studentId || !user) return;

    // Find student in all classrooms
    const classroomsList = getClassrooms(user.id);
    let foundStudent: Student | null = null;
    let foundClassroom: Classroom | null = null;

    for (const c of classroomsList) {
      const classStudents = getStudents(c.id);
      const st = classStudents.find(s => s.id === studentId);
      if (st) {
        foundStudent = st;
        foundClassroom = c;
        break;
      }
    }

    if (foundStudent && foundClassroom) {
      setStudent(foundStudent);
      setClassroom(foundClassroom);

      // Set default subject
      const levelUpper = foundClassroom.nivel.toUpperCase();
      const gradeId = `${foundClassroom.nivel}-${foundClassroom.grado}`;
      let subjects = OFFICIAL_DEFAULT_SUBJECTS.filter(s => s.level === levelUpper);
      if (user && user.rol !== "admin" && user.allowed_subjects && user.allowed_subjects[gradeId]) {
        const allowed = user.allowed_subjects[gradeId];
        subjects = subjects.filter(s => allowed.includes(s.id));
      }
      if (subjects.length > 0) {
        setActiveProfileSubjectId(subjects[0].id);
      }
    }
  }, [studentId, user]);

  const is12Primaria = useMemo(() => {
    if (!classroom) return false;
    const levelStr = `${classroom.nivel || ""} ${classroom.grado || ""} ${classroom.nombre || ""}`.toLowerCase();
    const isPrimaria = levelStr.includes("primari");
    let detectedGrade = 0;
    if (/1er|1ro|primer/i.test(levelStr)) detectedGrade = 1;
    else if (/2do|2ndo|segund/i.test(levelStr)) detectedGrade = 2;
    return isPrimaria && (detectedGrade === 1 || detectedGrade === 2);
  }, [classroom]);

  const profileStats = useMemo(() => {
    if (!student) {
      return { 
        attendancePct: 100, present: 0, absent: 0, tardy: 0, excuse: 0, 
        totalDays: 0, anecdotalCount: 0, incidentCount: 0, academicAverage: 0 
      };
    }
    
    const attendanceRecords = getAttendance(student.classroom_id);
    let present = 0, absent = 0, tardy = 0, excuse = 0, totalDays = 0;
    attendanceRecords.forEach((att) => {
      const status = att.registro[student.id];
      if (status) {
        totalDays++;
        if (status === "P") present++;
        else if (status === "A") absent++;
        else if (status === "T") tardy++;
        else if (status === "E") excuse++;
      }
    });
    const attendancePct = totalDays > 0 ? Math.round(((present + tardy) / totalDays) * 100) : 100;

    const anecdotalCount = getStudentAnecdotalRecords(student.id).length;
    const incidentCount = getIncidences(student.id).length;

    const grades = getStudentOfficialGrades(student.id);
    let sum = 0, count = 0;
    grades.forEach((g) => {
      const avg = calculateCompetencyAverage([
        { p: g.p1, rp: is12Primaria ? null : g.rp1 },
        { p: g.p2, rp: is12Primaria ? null : g.rp2 },
        { p: g.p3, rp: is12Primaria ? null : g.rp3 },
        { p: g.p4, rp: is12Primaria ? null : g.rp4 }
      ]);
      if (avg !== null) {
        sum += avg;
        count++;
      }
    });
    const academicAverage = count > 0 ? Math.round(sum / count) : 0;

    return { attendancePct, present, absent, tardy, excuse, totalDays, anecdotalCount, incidentCount, academicAverage };
  }, [student, is12Primaria]);

  const studentRubricsEvaluations = useMemo(() => {
    if (!student) return [];
    const evals = getStudentRubricEvaluations(student.id);
    const rubrics = getAllRubrics();
    return evals.map((ev) => {
      const rubric = rubrics.find((r) => r.id === ev.rubric_id);
      return {
        ...ev,
        rubricTitle: rubric ? rubric.titulo : "Rúbrica Desconocida",
        rubricDesc: rubric ? rubric.descripcion : "",
      };
    });
  }, [student]);

  const profileSubjectGrades = useMemo(() => {
    if (!student || !activeProfileSubjectId) return [];
    return getStudentOfficialGrades(student.id).filter(
      (g) => g.subject_id === activeProfileSubjectId
    );
  }, [student, activeProfileSubjectId]);

  const profileSubjectsList = useMemo(() => {
    if (!classroom) return [];
    const levelUpper = classroom.nivel.toUpperCase();
    const gradeId = `${classroom.nivel}-${classroom.grado}`;
    
    let list = OFFICIAL_DEFAULT_SUBJECTS.filter((s) => s.level === levelUpper);
    if (user && user.rol !== "admin" && user.allowed_subjects && user.allowed_subjects[gradeId]) {
      const allowed = user.allowed_subjects[gradeId];
      list = list.filter(s => allowed.includes(s.id));
    }
    return list;
  }, [classroom, user]);

  const rubricsList = useMemo(() => {
    return getAllRubrics();
  }, []);

  const subjectAverages = useMemo(() => {
    if (!student) return {};
    const averages: Record<string, number> = {};
    const studentGrades = getStudentOfficialGrades(student.id);
    profileSubjectsList.forEach(sub => {
      const subGrades = studentGrades.filter(g => g.subject_id === sub.id);
      if (subGrades.length > 0) {
        const validAverages = subGrades.map(g => {
          return calculateCompetencyAverage([
            { p: g.p1, rp: is12Primaria ? null : g.rp1 },
            { p: g.p2, rp: is12Primaria ? null : g.rp2 },
            { p: g.p3, rp: is12Primaria ? null : g.rp3 },
            { p: g.p4, rp: is12Primaria ? null : g.rp4 }
          ]);
        }).filter((val): val is number => val !== null);

        if (validAverages.length > 0) {
          const sum = validAverages.reduce((acc, curr) => acc + curr, 0);
          averages[sub.id] = Math.round(sum / validAverages.length);
        }
      }
    });
    return averages;
  }, [student, profileSubjectsList, is12Primaria]);

  const generalAverage = useMemo(() => {
    const keys = Object.keys(subjectAverages);
    if (keys.length === 0) return null;
    const sum = keys.reduce((acc, k) => acc + subjectAverages[k], 0);
    return Math.round(sum / keys.length);
  }, [subjectAverages]);

  if (!student || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <GraduationCap className="h-10 w-10 text-slate-400 animate-pulse mb-3" />
        <span className="text-sm font-semibold">Cargando perfil del estudiante...</span>
      </div>
    );
  }

  const isSecondary = classroom.nivel === "secundaria";
  const PASSING_GRADE = isSecondary ? 70 : 65;

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col gap-6 w-full text-left">
        {/* Top Header Navigation */}
        <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4 pb-4 border-b border-slate-100 w-full">
          {/* Left Button */}
          <div className="w-full md:w-auto flex justify-center md:justify-start">
            <button
              onClick={() => navigate(`/aula-virtual/matricula/${classroom.id}`)}
              className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Volver a Matrícula
            </button>
          </div>
          
          {/* Centered Title & Subtitle */}
          <div className="w-full md:w-auto flex flex-col items-center text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-text-main flex items-center justify-center gap-2">
              <User size={22} className="text-brand-primary" />
              Perfil del Estudiante
            </h1>
            <p className="text-xs text-text-muted mt-0.5 font-semibold">
              {classroom.nombre} · {classroom.periodo}
            </p>
          </div>

          {/* Right Spacer (hidden on mobile, balances grid on desktop) */}
          <div className="hidden md:flex justify-end w-full invisible">
            <div className="w-[150px]"></div>
          </div>
        </div>

        {/* Student Name Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-800">
              {student.nombre} {student.apellido || ""}
            </h2>
            <p className="text-xs text-text-muted mt-1 font-semibold">
              RNE/Matrícula: {student.rne_matricula || "No registrada"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="border border-slate-200 bg-slate-50 text-[11px] font-bold px-3 py-1 rounded-full text-slate-700">
              {student.genero === "M" ? "♂ Masculino" : "♀ Femenino"}
            </span>
            <span className="text-[11px] font-black px-3 py-1 bg-brand-primary text-white rounded-full shadow-sm">
              #{student.numero_orden}
            </span>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-[20px] p-4 text-center shadow-sm">
            <CalendarCheck className="h-5 w-5 mx-auto text-emerald-600 mb-1.5" />
            <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Asistencia</div>
            <div className="font-display text-2xl font-bold text-emerald-700 mt-1">
              {profileStats.totalDays > 0 ? `${profileStats.attendancePct}%` : "—"}
            </div>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-[20px] p-4 text-center shadow-sm">
            <FileText className="h-5 w-5 mx-auto text-brand-primary mb-1.5" />
            <div className="text-[10px] uppercase font-bold text-brand-primary tracking-wider">Anecdóticos</div>
            <div className="font-display text-2xl font-bold text-brand-primary mt-1">{profileStats.anecdotalCount}</div>
          </div>
          <div className="bg-rose-50/50 border border-rose-100 rounded-[20px] p-4 text-center shadow-sm">
            <ShieldAlert className="h-5 w-5 mx-auto text-rose-600 mb-1.5" />
            <div className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Incidencias</div>
            <div className="font-display text-2xl font-bold text-rose-700 mt-1">{profileStats.incidentCount}</div>
          </div>
          <div className="bg-purple-50/50 border border-purple-100 rounded-[20px] p-4 text-center shadow-sm">
            <TrendingUp className="h-5 w-5 mx-auto text-purple-600 mb-1.5" />
            <div className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">Rendimiento</div>
            <div className="font-display text-2xl font-bold text-purple-700 mt-1">
              {generalAverage !== null ? `${generalAverage} Pts` : (
                profileStats.incidentCount === 0 && profileStats.anecdotalCount > 0 ? "Bueno" : profileStats.incidentCount > 2 ? "En riesgo" : "Normal"
              )}
            </div>
            {generalAverage !== null && (
              <div className="text-[9px] font-bold text-purple-500 mt-0.5 uppercase tracking-wide">
                {generalAverage >= 90 ? "Excelente" : generalAverage >= 80 ? "Muy Bueno" : generalAverage >= PASSING_GRADE ? "Satisfactorio" : "En Riesgo"}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT: Attendance + Contact */}
          <div className="space-y-6">
            {/* Attendance Breakdown */}
            <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-sm space-y-4">
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
            <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800">Información del Tutor y Contacto</h3>
              <div className="space-y-3.5 text-xs">
                {/* Tutor Principal */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 border border-slate-200">
                  <User className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider flex items-center gap-1.5 flex-wrap">
                      Tutor Principal
                      {student.tutor_relacion && (
                        <span className="text-[8px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded uppercase border border-blue-250">
                          {student.tutor_relacion}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-850 mt-1 truncate">{student.tutor_nombre || "No registrado"}</div>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Teléfono de Contacto</div>
                      <div className="font-bold text-slate-850 mt-0.5">{formatPhone(student.tutor_telefono) || "No registrado"}</div>
                    </div>
                  </div>
                  {student.tutor_telefono && (
                    <a
                      href={getWhatsAppLink(student.tutor_telefono, student.tutor_nombre, `${student.nombre} ${student.apellido || ""}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs border-none"
                      title="Enviar WhatsApp"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Correo */}
                {student.email_tutor && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/50 border border-slate-200">
                    <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Correo Electrónico</div>
                      <div className="font-bold text-slate-850 mt-0.5 truncate">{student.email_tutor}</div>
                    </div>
                  </div>
                )}

                {/* Tutor Secundario (si existe) */}
                {student.tutor2_nombre && (
                  <>
                    <div className="border-t border-dashed border-slate-200 my-2" />
                    
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 border border-slate-200">
                      <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider flex items-center gap-1.5 flex-wrap">
                          Tutor Secundario
                          {student.tutor2_relacion && (
                            <span className="text-[8px] font-black bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded uppercase border border-slate-300">
                              {student.tutor2_relacion}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-slate-850 mt-1 truncate">{student.tutor2_nombre}</div>
                      </div>
                    </div>

                    {student.tutor2_telefono && (
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 border border-slate-200">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                          <div>
                            <div className="text-text-muted text-[9px] uppercase font-bold tracking-wider">Teléfono Secundario</div>
                            <div className="font-bold text-slate-850 mt-0.5">{formatPhone(student.tutor2_telefono)}</div>
                          </div>
                        </div>
                        <a
                          href={getWhatsAppLink(student.tutor2_telefono, student.tutor2_nombre, `${student.nombre} ${student.apellido || ""}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs border-none"
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
                    <div className="font-semibold text-slate-850 mt-0.5 leading-relaxed">{student.direccion || "Sin dirección registrada"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Anecdotals + Incidences */}
          <div className="lg:col-span-2 space-y-6">
            {/* Anecdotal Records */}
            <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-brand-primary shrink-0" />
                <h3 className="font-bold text-sm text-text-main">Registro Anecdótico</h3>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {profileStats.anecdotalCount} registros
                </span>
              </div>

              {(() => {
                const studentAnecdotals = getStudentAnecdotalRecords(student.id);
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
                        className="w-full h-9 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-705 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all"
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
            <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                <h3 className="font-bold text-sm text-text-main">Registro de Incidencias</h3>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md ml-auto">
                  {profileStats.incidentCount} incidencias
                </span>
              </div>
              {(() => {
                const incidents = getIncidences(student.id);
                if (incidents.length > 0) {
                  return (
                    <div className="space-y-3">
                      {incidents.slice(0, 2).map((inc) => (
                        <div key={inc.id} className="p-4 rounded-lg border border-slate-200 bg-white hover:border-amber-250 transition text-left">
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
                          className="w-full h-8 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-705 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all"
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
            <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 space-y-5 shadow-sm">
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
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-205 ${showProfileSubjectDropdown ? 'rotate-180' : ''}`} />
                      </div>

                      {showProfileSubjectDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowProfileSubjectDropdown(false)} />
                          <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl border border-black/5 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1.5 duration-150">
                            <div className="space-y-0.5">
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
                  const subGrades = getStudentOfficialGrades(student.id).filter(
                    g => g.subject_id === activeProfileSubjectId
                  );
                  if (subGrades.length === 0) return null;
                  const validAverages = subGrades.map(g => {
                    return calculateCompetencyAverage([
                      { p: g.p1, rp: is12Primaria ? null : g.rp1 },
                      { p: g.p2, rp: is12Primaria ? null : g.rp2 },
                      { p: g.p3, rp: is12Primaria ? null : g.rp3 },
                      { p: g.p4, rp: is12Primaria ? null : g.rp4 }
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

                  return comps.map(comp => {
                    const gradeRecord = profileSubjectGrades.find(
                      g => g.competency_id === comp.id
                    );

                    const computedAverage = gradeRecord 
                      ? calculateCompetencyAverage([
                          { p: gradeRecord.p1, rp: is12Primaria ? null : gradeRecord.rp1 },
                          { p: gradeRecord.p2, rp: is12Primaria ? null : gradeRecord.rp2 },
                          { p: gradeRecord.p3, rp: is12Primaria ? null : gradeRecord.rp3 },
                          { p: gradeRecord.p4, rp: is12Primaria ? null : gradeRecord.rp4 }
                        ])
                      : null;

                    return (
                      <div key={comp.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-sm space-y-3">
                        <div className="flex items-start justify-between gap-4 text-left">
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
                                    computedAverage >= PASSING_GRADE
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
                                (gradeRecord.rp1 && !is12Primaria) ? (
                                  <span className="flex items-center justify-center gap-1">
                                    <span className="line-through text-slate-400 text-[10px]">{gradeRecord.p1}</span>
                                    <span className="text-emerald-600 font-bold">{gradeRecord.rp1}</span>
                                  </span>
                                ) : (
                                  <span className={gradeRecord.p1 < PASSING_GRADE ? "text-rose-500 font-bold" : ""}>{gradeRecord.p1}</span>
                                )
                              ) : "—"}
                            </div>
                          </div>

                          {/* P2 */}
                          <div>
                            <div className="text-[8px] uppercase font-bold text-slate-400">P2</div>
                            <div className="text-xs font-bold text-text-main mt-0.5">
                              {gradeRecord && gradeRecord.p2 !== undefined && gradeRecord.p2 !== null ? (
                                (gradeRecord.rp2 && !is12Primaria) ? (
                                  <span className="flex items-center justify-center gap-1">
                                    <span className="line-through text-slate-400 text-[10px]">{gradeRecord.p2}</span>
                                    <span className="text-emerald-600 font-bold">{gradeRecord.rp2}</span>
                                  </span>
                                ) : (
                                  <span className={gradeRecord.p2 < PASSING_GRADE ? "text-rose-500 font-bold" : ""}>{gradeRecord.p2}</span>
                                )
                              ) : "—"}
                            </div>
                          </div>

                          {/* P3 */}
                          <div>
                            <div className="text-[8px] uppercase font-bold text-slate-400">P3</div>
                            <div className="text-xs font-bold text-text-main mt-0.5">
                              {gradeRecord && gradeRecord.p3 !== undefined && gradeRecord.p3 !== null ? (
                                (gradeRecord.rp3 && !is12Primaria) ? (
                                  <span className="flex items-center justify-center gap-1">
                                    <span className="line-through text-slate-400 text-[10px]">{gradeRecord.p3}</span>
                                    <span className="text-emerald-600 font-bold">{gradeRecord.rp3}</span>
                                  </span>
                                ) : (
                                  <span className={gradeRecord.p3 < PASSING_GRADE ? "text-rose-500 font-bold" : ""}>{gradeRecord.p3}</span>
                                )
                              ) : "—"}
                            </div>
                          </div>

                          {/* P4 */}
                          <div>
                            <div className="text-[8px] uppercase font-bold text-slate-400">P4</div>
                            <div className="text-xs font-bold text-text-main mt-0.5">
                              {gradeRecord && gradeRecord.p4 !== undefined && gradeRecord.p4 !== null ? (
                                (gradeRecord.rp4 && !is12Primaria) ? (
                                  <span className="flex items-center justify-center gap-1">
                                    <span className="line-through text-slate-400 text-[10px]">{gradeRecord.p4}</span>
                                    <span className="text-emerald-600 font-bold">{gradeRecord.rp4}</span>
                                  </span>
                                ) : (
                                  <span className={gradeRecord.p4 < PASSING_GRADE ? "text-rose-500 font-bold" : ""}>{gradeRecord.p4}</span>
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
            <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-sm space-y-4">
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
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow space-y-3 text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-800 truncate animate-none" title={evalRecord.rubricTitle}>
                              {evalRecord.rubricTitle}
                            </h4>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              {evalRecord.fecha}
                            </span>
                          </div>
                          <span className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15 font-bold text-xs px-2.5 py-0.5 rounded-full shrink-0">
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
                            className="flex items-center gap-1 text-[10px] font-bold text-brand-primary hover:underline cursor-pointer focus:outline-none bg-transparent border-none"
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
                            <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
                              {rubric.criterios.map((crit) => {
                                const selectedScore = evalRecord.evaluaciones[crit.nombre];
                                return (
                                  <div key={crit.nombre} className="flex justify-between items-start text-[10px] gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className="space-y-0.5">
                                      <span className="font-bold text-slate-700 block">{crit.nombre}</span>
                                      <span className="text-[9.5px] text-slate-400">Peso: {crit.peso}%</span>
                                    </div>
                                    <span className="font-extrabold text-brand-primary shrink-0">
                                      {selectedScore !== undefined ? `${selectedScore} pts` : "—"}
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
                <div className="py-8 text-center text-xs text-text-muted border rounded-xl border-dashed border-slate-200">
                  No se han aplicado rúbricas a este estudiante todavía.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ALL ANECDOTAL RECORDS MODAL */}
      {showAllAnecdotalModal && (
        <div className="fixed inset-0 bg-[#1B1B1B]/40 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-[24px] border border-black/5 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-base text-slate-805">Historial Anecdótico</h3>
                <p className="text-[11px] text-text-muted mt-0.5">{student.nombre} {student.apellido || ""}</p>
              </div>
              <button 
                onClick={() => setShowAllAnecdotalModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-500 border-none cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {getStudentAnecdotalRecords(student.id).map((record) => (
                <div key={record.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-xs transition text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-brand-primary">{record.fecha}</span>
                    <span className="text-[9.5px] font-semibold text-slate-400 capitalize">{record.estado}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{record.hecho}</p>
                  {record.sugerencia_ia && (
                    <div className="mt-3 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100/60 text-[10.5px] text-blue-750 flex gap-2">
                      <Sparkles className="inline h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <p><strong>Recomendación IA:</strong> {record.sugerencia_ia}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ALL INCIDENCES MODAL */}
      {showAllIncidencesModal && (
        <div className="fixed inset-0 bg-[#1B1B1B]/40 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-[24px] border border-black/5 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-base text-slate-805">Historial de Incidencias</h3>
                <p className="text-[11px] text-text-muted mt-0.5">{student.nombre} {student.apellido || ""}</p>
              </div>
              <button 
                onClick={() => setShowAllIncidencesModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-500 border-none cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {getIncidences(student.id).map((inc) => (
                <div key={inc.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-xs transition text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800">{inc.fecha}</span>
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
                  <p className="text-xs text-slate-600 leading-relaxed">{inc.descripcion}</p>
                  {inc.medidas_tomadas && (
                    <div className="mt-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100 text-[10.5px] text-amber-700">
                      <strong>Medidas tomadas:</strong> {inc.medidas_tomadas}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
