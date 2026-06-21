import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { 
  Users, Plus, ArrowLeft, X, Check, Search, Phone, 
  FileUp, FileDown, Edit3, Trash2, Save, ChevronRight,
  MoreVertical, Eye, FileText, ChevronDown, GraduationCap
} from "lucide-react";
import { useRequireAuth } from "../../lib/useRequireAuth";
import { 
  getClassrooms, 
  getAllClassroomsAdmin, 
  getStudents, 
  saveStudent, 
  deleteStudent,
  uid,
  Student,
  Classroom
} from "../../lib/storage";
import * as XLSX from "xlsx";
import confetti from "canvas-confetti";
import { toast, Toaster } from "sonner";

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

export default function GestionMatricula() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Classrooms selection
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Modals / Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showTutor1RelDropdown, setShowTutor1RelDropdown] = useState(false);
  const [showTutor2RelDropdown, setShowTutor2RelDropdown] = useState(false);
  const [activeDropdownStudentId, setActiveDropdownStudentId] = useState<string | null>(null);

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

  // Load classroom and students
  useEffect(() => {
    if (!user || !classId) return;
    const classes = user.rol === "admin" ? getAllClassroomsAdmin() : getClassrooms(user.id);
    setClassrooms(classes);
    const current = classes.find(c => c.id === classId) || null;
    setActiveClassroom(current);
    
    if (current) {
      loadStudents(current.id);
    }
  }, [user, classId]);

  const loadStudents = (cId: string) => {
    const list = getStudents(cId);
    setStudents(list.sort((a, b) => a.numero_orden - b.numero_orden));
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    return students.filter(s => 
      s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.apellido && s.apellido.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.rne_matricula && s.rne_matricula.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [students, searchQuery]);

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
    if (!classId) return;

    if (!studNombre.trim()) {
      toast.error("El nombre del estudiante es obligatorio.");
      return;
    }

    const sData: Student = {
      id: editingStudent ? editingStudent.id : uid("std"),
      classroom_id: classId,
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
    loadStudents(classId);
    setShowAddModal(false);
    setEditingStudent(null);
    toast.success(editingStudent ? "Estudiante actualizado" : "Estudiante registrado");
    
    if (!editingStudent) {
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
    }
  };

  // Excel Import / Export
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !classId) return;

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
            classroom_id: classId,
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

        loadStudents(classId);
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
    Xxlsx: XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");
    
    const fileName = activeClassroom 
      ? `Estudiantes_${activeClassroom.nombre.replace(/\s+/g, "_")}.xlsx` 
      : "listado_estudiantes.xlsx";

    XLSX.writeFile(workbook, fileName);
    toast.success("Excel descargado correctamente.");
  };

  if (!user || !activeClassroom) return null;

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <Toaster position="top-center" richColors />

      <div className="flex flex-col gap-6 w-full">
        {/* Header con Dropdown de Aulas */}
        <div className="flex flex-col gap-4 text-center relative pb-4 border-b border-slate-100 dark:border-zinc-800 print:hidden mb-8 mt-6">
          <div className="absolute top-0 left-0">
            <button 
              onClick={() => navigate(`/aula-virtual`)}
              className="bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 font-bold text-[13px] text-text-main shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Volver a Aulas
            </button>
          </div>
          <div className="absolute top-0 right-0">
            {classrooms.length > 0 && (
              <div className="flex flex-col items-center gap-1 select-none">
                <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Aula o Grupo Activo
                </span>
                <div className="inline-block relative">
                  <button
                    onClick={() => setShowClassroomDropdown(!showClassroomDropdown)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full hover:bg-slate-50 dark:hover:bg-zinc-800 transition text-[13px] font-bold text-slate-800 dark:text-zinc-200 shadow-sm cursor-pointer"
                  >
                    <Users size={14} className="text-slate-700 dark:text-zinc-400" />
                    <span>{activeClassroom ? activeClassroom.nombre : "Seleccionar Aula"}</span>
                    <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${showClassroomDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showClassroomDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowClassroomDropdown(false)} />
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 py-1.5 mb-1 border-b border-slate-100 dark:border-zinc-800">
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
                                  navigate(`/aula-virtual/matricula/${c.id}`);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                  isActive
                                    ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white"
                                    : "text-slate-750 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                }`}
                              >
                                <Users size={14} className={isActive ? "text-slate-850 dark:text-zinc-200" : "text-slate-400"} />
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
            <h1 className="text-2xl md:text-3xl font-black text-text-main tracking-wider leading-none">
              Matrícula Escolar
            </h1>
            <p className="text-xs text-text-muted font-bold mt-1.5">
              Gestión de inscripción, datos generales y contactos de tutores de los alumnos.
            </p>
            
            {/* Centered Active Classroom Info Pill */}
            {activeClassroom && (
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-sm px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-primary" />
                    <span className="text-xs font-bold text-brand-primary">{activeClassroom.nombre}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800" />
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{activeSchoolYear}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar estudiante por nombre o RNE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 rounded-lg pl-11 pr-5 outline-none focus:border-[#1B1B1B] dark:focus:border-white/20 focus:ring-1 focus:ring-[#1B1B1B]/10 text-sm font-medium text-text-main transition-colors shadow-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <button
              onClick={openAddModal}
              className="bg-[#1B1B1B] dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-zinc-100 border border-black/15 dark:border-white/10 text-[13px] font-bold px-5 py-2 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95"
            >
              <Plus size={14} />
              Agregar Estudiante
            </button>

            <label className="bg-white dark:bg-zinc-900 hover:bg-black/5 dark:hover:bg-zinc-800 border border-black/10 dark:border-zinc-800 text-text-main px-4 py-2 rounded-full text-[13px] font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none">
              <FileUp size={14} />
              Importar Excel
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="hidden"
              />
            </label>

            <button
              onClick={handleExportExcel}
              disabled={students.length === 0}
              className="bg-white dark:bg-zinc-900 hover:bg-black/5 dark:hover:bg-zinc-800 border border-black/10 dark:border-zinc-800 text-text-main px-4 py-2 rounded-full text-[13px] font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 active:scale-95 select-none"
            >
              <FileDown size={14} />
              Exportar
            </button>
          </div>
        </div>

        {/* INLINE ADD/EDIT STUDENT FORM */}
        {showAddModal && (
          <div 
            id="student-form-container"
            className="p-5 border border-black/5 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                {editingStudent ? `Editar Estudiante: ${studNombre}` : "Inscribir Alumno Nuevo"}
              </h4>
              <button 
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingStudent(null);
                }}
                className="flex items-center justify-center h-6 w-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer border-none shadow-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nombre</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan"
                    value={studNombre}
                    onChange={(e) => setStudNombre(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Apellido</label>
                  <input
                    type="text"
                    placeholder="Ej: Pérez"
                    value={studApellido}
                    onChange={(e) => setStudApellido(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">No. de Orden</label>
                  <input
                    type="number"
                    placeholder="Ej: 1"
                    value={studOrden}
                    onChange={(e) => setStudOrden(Number(e.target.value))}
                    className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                    required
                  />
                </div>
                <div className="space-y-1 relative select-none">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Género</label>
                  <div
                    onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                    className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                  >
                    <span>{studGenero === "M" ? "Masculino" : "Femenino"}</span>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showGenderDropdown ? 'rotate-90' : ''}`} />
                  </div>
                  {showGenderDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowGenderDropdown(false)} />
                      <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setStudGenero("M");
                              setShowGenderDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                              studGenero === "M" ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                            }`}
                          >
                            <span>Masculino</span>
                            {studGenero === "M" && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStudGenero("F");
                              setShowGenderDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                              studGenero === "F" ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                            }`}
                          >
                            <span>Femenino</span>
                            {studGenero === "F" && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">RNE / Matrícula</label>
                  <input
                    type="text"
                    placeholder="Ej: ABC-12345"
                    value={studRne}
                    onChange={(e) => setStudRne(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Dirección</label>
                  <input
                    type="text"
                    placeholder="Ej: Calle Duarte #12, Centro"
                    value={studDireccion}
                    onChange={(e) => setStudDireccion(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contactos de Tutor(es)</span>
                  {!showTutor2 && (
                    <button
                      type="button"
                      onClick={() => setShowTutor2(true)}
                      className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-text-main h-7 px-3 rounded-2xl text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer active:scale-95 select-none"
                    >
                      <Plus className="h-3.5 w-3.5" /> Añadir otro tutor
                    </button>
                  )}
                </div>

                {/* Tutor 1 Card */}
                <div className="p-4 border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 rounded-2xl relative shadow-sm space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1 relative select-none">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Relación</label>
                      <div
                        onClick={() => setShowTutor1RelDropdown(!showTutor1RelDropdown)}
                        className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                      >
                        <span>{studTutorRelacion === "Tutor" ? "Tutor(a)" : studTutorRelacion === "Otro" ? "Otro Familiar" : studTutorRelacion}</span>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showTutor1RelDropdown ? 'rotate-90' : ''}`} />
                      </div>
                      {showTutor1RelDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowTutor1RelDropdown(false)} />
                          <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                            <div className="space-y-0.5">
                              {["Madre", "Padre", "Tutor", "Abuelo/a", "Otro"].map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    setStudTutorRelacion(opt);
                                    setShowTutor1RelDropdown(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                                    studTutorRelacion === opt ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                  }`}
                                >
                                  <span>{opt === "Tutor" ? "Tutor(a)" : opt === "Otro" ? "Otro Familiar" : opt}</span>
                                  {studTutorRelacion === opt && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nombre Completo</label>
                      <input
                        type="text"
                        placeholder="Ej: Juan Pérez"
                        value={studTutor}
                        onChange={(e) => setStudTutor(e.target.value)}
                        className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Teléfono</label>
                      <input
                        type="text"
                        placeholder="Ej: 809-555-0123"
                        value={studTutorPhone}
                        onChange={(e) => setStudTutorPhone(e.target.value)}
                        className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="Ej: tutor@correo.com"
                        value={studTutorEmail}
                        onChange={(e) => setStudTutorEmail(e.target.value)}
                        className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Tutor 2 Card */}
                {showTutor2 && (
                  <div className="p-4 border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 rounded-2xl relative shadow-sm space-y-3.5 animate-in slide-in-from-top-1 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTutor2(false);
                        setStudTutor2Nombre("");
                        setStudTutor2Telefono("");
                      }}
                      className="absolute top-3.5 right-3.5 flex items-center justify-center h-6 w-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-colors border-none cursor-pointer shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="space-y-1 relative select-none">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Relación</label>
                        <div
                          onClick={() => setShowTutor2RelDropdown(!showTutor2RelDropdown)}
                          className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                        >
                          <span>{studTutor2Relacion === "Tutor" ? "Tutor(a)" : studTutor2Relacion === "Otro" ? "Otro Familiar" : studTutor2Relacion}</span>
                          <ChevronRight className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showTutor2RelDropdown ? 'rotate-90' : ''}`} />
                        </div>
                        {showTutor2RelDropdown && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowTutor2RelDropdown(false)} />
                            <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                              <div className="space-y-0.5">
                                {["Madre", "Padre", "Tutor", "Abuelo/a", "Otro"].map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      setStudTutor2Relacion(opt);
                                      setShowTutor2RelDropdown(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                                      studTutor2Relacion === opt ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                    }`}
                                  >
                                    <span>{opt === "Tutor" ? "Tutor(a)" : opt === "Otro" ? "Otro Familiar" : opt}</span>
                                    {studTutor2Relacion === opt && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nombre Completo</label>
                        <input
                          type="text"
                          placeholder="Ej: María Rodríguez"
                          value={studTutor2Nombre}
                          onChange={(e) => setStudTutor2Nombre(e.target.value)}
                          className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Teléfono</label>
                      <input
                        type="text"
                        placeholder="Ej: 809-555-0456"
                        value={studTutor2Telefono}
                        onChange={(e) => setStudTutor2Telefono(e.target.value)}
                        className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStudent(null);
                  }}
                  className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-text-main dark:text-zinc-300 px-4 py-2 rounded-full text-[13px] font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#1B1B1B] dark:bg-white text-white dark:text-black hover:bg-neutral-850 dark:hover:bg-zinc-100 border border-black/15 dark:border-white/10 text-[13px] font-bold px-5 py-2 rounded-full shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <Save className="h-3.5 w-3.5" />
                  {editingStudent ? "Guardar Cambios" : "Guardar Estudiante"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 pb-4 border-b border-black/5 dark:border-zinc-800 text-left">
            <h3 className="font-extrabold text-[15px] text-text-main leading-tight">
              Matrícula Escolar ({filteredStudents.length})
            </h3>
            <p className="text-[11.5px] text-text-muted mt-1 leading-relaxed">
              Listado de alumnos inscritos en esta sección.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 dark:border-zinc-800 bg-bg-base/30 dark:bg-zinc-950/20 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="py-4 px-6 text-center w-36 whitespace-nowrap">N° Orden</th>
                  <th className="py-4 px-6 text-left">Estudiante</th>
                  <th className="py-4 px-6 text-center w-24">Género</th>
                  <th className="py-4 px-6 text-center w-40 whitespace-nowrap">RNE / Matrícula</th>
                  <th className="py-4 px-6 text-left">Tutor / Contacto</th>
                  <th className="py-4 px-6 text-center w-36">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-zinc-800 text-[13px]">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((st, idx) => (
                    <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white text-[11px] font-black shadow-sm font-mono shadow-brand-primary/10">
                          {st.numero_orden}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-left">
                        <button
                          onClick={() => navigate(`/aula-virtual/perfil/${st.id}`)}
                          className="text-left font-bold text-text-main hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer block bg-transparent border-none p-0"
                        >
                          {st.nombre} {st.apellido || ""}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black shadow-sm border ${
                          st.genero === "F"
                            ? "bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900/50"
                            : "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
                        }`}>
                          {st.genero}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-text-muted whitespace-nowrap">{st.rne_matricula || "No asignado"}</td>
                      <td className="py-4 px-6 text-left">
                        {st.tutor_nombre ? (
                          <div className="space-y-1">
                            <div className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 flex-wrap">
                              <span>{st.tutor_nombre}</span> 
                              {st.tutor_relacion && (
                                <span className="text-[8.5px] font-black uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded-md leading-none">
                                  {st.tutor_relacion === "Tutor" ? "Tutor(a)" : st.tutor_relacion === "Otro" ? "Otro Familiar" : st.tutor_relacion}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-text-muted flex items-center gap-1.5">
                              <Phone size={10} className="shrink-0" /> 
                              <span>{formatPhone(st.tutor_telefono) || "Sin teléfono"}</span>
                              {st.tutor_telefono && (
                                <a
                                  href={getWhatsAppLink(st.tutor_telefono, st.tutor_nombre, `${st.nombre} ${st.apellido || ""}`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                                  title="Enviar mensaje de WhatsApp"
                                >
                                  <WhatsAppIcon className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-muted italic text-[11.5px]">No registrado</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center relative">
                        <div className="flex justify-center items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownStudentId(
                                activeDropdownStudentId === st.id ? null : st.id
                              );
                            }}
                            className="h-7 w-7 p-0 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-center cursor-pointer shrink-0 shadow-sm transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>

                        {activeDropdownStudentId === st.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActiveDropdownStudentId(null)}
                            />
                            <div className={`absolute right-10 w-44 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-xl shadow-lg py-1.5 z-20 animate-in fade-in duration-100 text-left ${
                              idx >= filteredStudents.length - 2 && filteredStudents.length >= 3
                                ? "bottom-7 mb-1 slide-in-from-bottom-1"
                                : "top-7 mt-1 slide-in-from-top-1"
                            }`}>
                              <button
                                onClick={() => {
                                  setActiveDropdownStudentId(null);
                                  navigate(`/aula-virtual/perfil/${st.id}`);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition border-none bg-transparent cursor-pointer text-left"
                              >
                                <Eye className="h-4 w-4 text-slate-400" />
                                Ver Perfil
                              </button>

                              <button
                                onClick={() => {
                                  setActiveDropdownStudentId(null);
                                  navigate(`/aula-virtual/anecdotario/${activeClassroom.id}`, { state: { studentId: st.id } });
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition border-none bg-transparent cursor-pointer text-left"
                              >
                                <FileText className="h-4 w-4 text-slate-400" />
                                Anecdotario
                              </button>

                              <button
                                onClick={() => {
                                  setActiveDropdownStudentId(null);
                                  openEditModal(st);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition border-none bg-transparent cursor-pointer text-left"
                              >
                                <Edit3 className="h-4 w-4 text-slate-400" />
                                Editar Alumno
                              </button>

                              <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1" />

                              <button
                                onClick={() => {
                                  setActiveDropdownStudentId(null);
                                  setStudentToDelete(st);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-[11.5px] font-bold text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition border-none bg-transparent cursor-pointer text-left"
                              >
                                <Trash2 className="h-4 w-4 text-rose-500" />
                                Eliminar Alumno
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-muted font-bold">
                      No se encontraron estudiantes para la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {studentToDelete && (
        <div 
          onClick={() => setStudentToDelete(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center animate-in zoom-in-95 duration-200"
          >
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 rotate-45 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Eliminar Estudiante?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Esta acción eliminará de forma permanente a <span className="font-extrabold text-neutral-900 dark:text-neutral-100">{studentToDelete.nombre} {studentToDelete.apellido || ""}</span> de esta aula. No se podrán recuperar sus conductas ni calificaciones.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStudent(studentToDelete.id);
                  if (classId) loadStudents(classId);
                  setStudentToDelete(null);
                  toast.success("Estudiante eliminado.");
                }}
                className="bg-[#D31B32] hover:bg-[#B3172A] text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
