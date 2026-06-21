import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext, useLocation } from "react-router-dom";
import { 
  ArrowLeft, Check, Save, ChevronRight, AlertTriangle, Info, Users, ChevronDown, GraduationCap 
} from "lucide-react";
import { useRequireAuth } from "../../lib/useRequireAuth";
import { 
  getClassrooms, 
  getAllClassroomsAdmin, 
  getStudents, 
  getIncidences,
  saveIncidence,
  uid,
  Student,
  Classroom,
  Incidence
} from "../../lib/storage";
import { toast, Toaster } from "sonner";

const GRAVITY_ICONS = {
  leve: "🟢",
  moderada: "🟡",
  grave: "🔴",
};

export default function Incidencias() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { classId } = useParams<{ classId: string }>();
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Classrooms selection
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
  const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Incidence Form States
  const [selectedIncidentStudentId, setSelectedIncidentStudentId] = useState(
    location.state?.studentId || ""
  );
  const [showIncidentStudentDropdown, setShowIncidentStudentDropdown] = useState(false);
  const [incidentGravedad, setIncidentGravedad] = useState<"leve" | "moderada" | "grave">("leve");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidentMedidas, setIncidentMedidas] = useState("");
  const [incidentList, setIncidentList] = useState<Incidence[]>([]);

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
    if (!classId || !selectedIncidentStudentId) {
      toast.error("Selecciona un estudiante.");
      return;
    }
    if (!incidentDesc.trim()) {
      toast.error("La descripción de la situación es obligatoria.");
      return;
    }

    if (!user) return;

    const record: Incidence = {
      id: uid("inc"),
      student_id: selectedIncidentStudentId,
      fecha: new Date().toISOString().split("T")[0],
      gravedad: incidentGravedad,
      descripcion: incidentDesc.trim(),
      medidas_tomadas: incidentMedidas.trim() || "",
    };

    saveIncidence(record);
    toast.success("Incidencia registrada con éxito");
    
    // Reset form
    setIncidentDesc("");
    setIncidentMedidas("");
    loadIncidences();
  };

  if (!user || !activeClassroom) return null;

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <Toaster position="top-center" richColors />

      <div className="flex flex-col gap-6 w-full text-left">
        {/* Header con Dropdown de Aulas */}
        <div className="flex flex-col gap-4 text-center relative pb-4 border-b border-slate-100 dark:border-zinc-800 print:hidden mb-8 mt-6">
          <div className="absolute top-0 left-0">
            <button 
              onClick={() => navigate(`/aula-virtual`)}
              className="bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-full px-4 py-2 font-bold text-[13px] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none text-text-main dark:text-zinc-200"
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
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full hover:bg-slate-50 dark:hover:bg-zinc-700 transition text-[13px] font-bold text-slate-800 dark:text-zinc-200 shadow-sm cursor-pointer"
                  >
                    <Users size={14} className="text-slate-700 dark:text-zinc-400" />
                    <span>{activeClassroom ? activeClassroom.nombre : "Seleccionar Aula"}</span>
                    <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${showClassroomDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showClassroomDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowClassroomDropdown(false)} />
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-xl rounded-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 mb-1 border-b border-slate-100 dark:border-zinc-800">
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
                                  navigate(`/aula-virtual/incidencias/${c.id}`);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                                  isActive
                                    ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                                    : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                }`}
                              >
                                <Users size={14} className={isActive ? "text-[#1B1B1B] dark:text-white" : "text-slate-400"} />
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
              Registro de Incidencias
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold mt-1.5">
              Registro y control de situaciones conductuales y medidas disciplinarias.
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
                    <GraduationCap className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">{activeClassroom.periodo}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Layout Grid */}
        <div className={`grid gap-8 items-start ${
          isSidebarPinned ? '2xl:grid-cols-3 grid-cols-1' : 'lg:grid-cols-3 grid-cols-1'
        }`}>
          {/* Left: Registration Form */}
          <div className={`bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm flex flex-col gap-5 ${
            isSidebarPinned ? '2xl:col-span-1' : 'lg:col-span-1'
          }`}>
            <div>
              <h3 className="text-lg font-bold text-text-main">Registrar Incidencia</h3>
              <p className="text-[12px] text-text-muted mt-0.5">Reporta situaciones conductuales leves, moderadas o graves.</p>
            </div>

            <form onSubmit={handleSaveIncidence} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 relative select-none">
                <label className="text-[12px] font-bold text-text-main">Estudiante</label>
                <div
                  onClick={() => setShowIncidentStudentDropdown(!showIncidentStudentDropdown)}
                  className="w-full bg-bg-base/60 dark:bg-zinc-950 border border-black/5 dark:border-zinc-800 rounded-[16px] px-4 py-3 text-[13px] font-bold text-text-main flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="truncate">
                    {(() => {
                      const s = students.find(std => std.id === selectedIncidentStudentId);
                      return s ? `${s.numero_orden}. ${s.nombre} ${s.apellido || ""}` : "-- Elige un Estudiante --";
                    })()}
                  </span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showIncidentStudentDropdown ? 'rotate-90' : ''}`} />
                </div>

                {showIncidentStudentDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowIncidentStudentDropdown(false)} />
                    <div className="absolute left-0 right-0 top-full mt-1.5 max-h-52 overflow-y-auto bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150 scrollbar-hide">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIncidentStudentId("");
                            setShowIncidentStudentDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                            selectedIncidentStudentId === "" ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                          }`}
                        >
                          <span>-- Elige un Estudiante --</span>
                          {selectedIncidentStudentId === "" && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                        </button>
                        {students.map((s) => {
                          const isActive = s.id === selectedIncidentStudentId;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setSelectedIncidentStudentId(s.id);
                                setShowIncidentStudentDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                                isActive ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                              }`}
                            >
                              <span className="truncate">{s.numero_orden}. {s.nombre} {s.apellido || ""}</span>
                              {isActive && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-text-main">Nivel de Gravedad</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["leve", "moderada", "grave"] as const).map((g) => {
                    const colors = {
                      leve: "bg-card-green/50 dark:bg-green-950/20 border-green-300 dark:border-green-900/50 text-green-800 dark:text-green-300",
                      moderada: "bg-card-yellow/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50 text-amber-800 dark:text-amber-300",
                      grave: "bg-card-pink/50 dark:bg-red-950/20 border-red-300 dark:border-red-900/50 text-red-800 dark:text-red-300",
                    };
                    const activeColors = {
                      leve: "bg-green-600 border-green-600 text-white shadow-sm",
                      moderada: "bg-amber-500 border-amber-500 text-white shadow-sm",
                      grave: "bg-red-500 border-red-500 text-white shadow-sm",
                    };
                    const isSelected = incidentGravedad === g;

                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setIncidentGravedad(g)}
                        className={`py-2 rounded-full text-[13px] font-bold uppercase border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected ? activeColors[g] : "bg-white dark:bg-zinc-950 border-black/5 dark:border-zinc-800 hover:border-black/15 dark:hover:border-zinc-700 text-text-muted dark:text-zinc-400"
                        }`}
                      >
                        <span>{GRAVITY_ICONS[g]}</span>
                        <span>{g}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-text-main">Descripción de la Situación</label>
                <textarea
                  rows={3}
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Describe de forma descriptiva y neutral lo sucedido..."
                  className="w-full bg-bg-base/60 dark:bg-zinc-950 border border-black/5 dark:border-zinc-800 rounded-[16px] px-4 py-3 outline-none focus:border-black/20 dark:focus:border-zinc-700 text-[13px] font-medium text-text-main placeholder-slate-400 dark:placeholder-zinc-500 resize-none"
                  required
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-text-main">Medidas Tomadas / Compromiso</label>
                <textarea
                  rows={2}
                  value={incidentMedidas}
                  onChange={(e) => setIncidentMedidas(e.target.value)}
                  placeholder="Diálogo, llamada al tutor, derivación a orientación..."
                  className="w-full bg-bg-base/60 dark:bg-zinc-950 border border-black/5 dark:border-zinc-800 rounded-[16px] px-4 py-3 outline-none focus:border-black/20 dark:focus:border-zinc-700 text-[13px] font-medium text-text-main placeholder-slate-400 dark:placeholder-zinc-500 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-[#1B1B1B] dark:bg-white text-white dark:text-black py-3.5 rounded-full text-[13px] font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Save size={14} />
                Guardar Reporte
              </button>
            </form>
          </div>

          {/* Right: History List */}
          <div className={isSidebarPinned ? '2xl:col-span-2 flex flex-col gap-4' : 'lg:col-span-2 flex flex-col gap-4'}>
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-text-main uppercase tracking-wider">Historial del Estudiante</h3>
              {(() => {
                const s = students.find(std => std.id === selectedIncidentStudentId);
                if (s) {
                  return (
                    <button
                      type="button"
                      onClick={() => navigate(`/aula-virtual/perfil/${s.id}`)}
                      className="text-xs font-bold text-brand-primary hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      Ver Perfil de {s.nombre}
                    </button>
                  );
                }
                return null;
              })()}
            </div>
            
            {selectedIncidentStudentId ? (
              <div className="flex flex-col gap-4">
                {incidentList.length > 0 ? (
                  incidentList.map((inc) => {
                    const colorMap = {
                      leve: "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900/50",
                      moderada: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-350 border-amber-200 dark:border-amber-900/50",
                      grave: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/50",
                    };

                    return (
                      <div key={inc.id} className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${colorMap[inc.gravedad]}`}>
                            {inc.gravedad}
                          </span>
                          <span className="bg-bg-base dark:bg-zinc-950 border border-black/5 dark:border-zinc-800 text-text-muted text-[11px] font-semibold px-3 py-1 rounded-full">
                            {inc.fecha}
                          </span>
                        </div>

                        <div className="border-t border-black/5 dark:border-zinc-800 pt-3">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Descripción</span>
                          <p className="text-[13px] text-text-main leading-relaxed">{inc.descripcion}</p>
                        </div>

                        {inc.medidas_tomadas && (
                          <div className="bg-bg-base dark:bg-zinc-950 border border-black/5 dark:border-zinc-800 rounded-[16px] p-3 text-[12px] text-text-main leading-relaxed flex gap-2.5 items-start mt-1">
                            <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">Medida Tomada</span>
                              <p className="font-semibold">{inc.medidas_tomadas}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[24px] p-12 text-center text-text-muted">
                    No hay incidencias reportadas para este estudiante.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[24px] p-12 text-center text-text-muted">
                Selecciona un estudiante a la izquierda para ver su historial de incidencias.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
