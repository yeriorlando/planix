import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext, useLocation } from "react-router-dom";
import { 
  ArrowLeft, Check, Sparkles, Save, ChevronRight, MessageCircle, Users, ChevronDown, GraduationCap 
} from "lucide-react";
import { useRequireAuth } from "../../lib/useRequireAuth";
import { 
  getClassrooms, 
  getAllClassroomsAdmin, 
  getStudents, 
  getAnecdotalRecords,
  saveAnecdotalRecord,
  generateWithIA,
  uid,
  Student,
  Classroom,
  AnecdotalRecord
} from "../../lib/storage";
import { toast, Toaster } from "sonner";

export default function Anecdotario() {
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
  
  // Anecdotal Record form states
  const [selectedAnecdotalStudentId, setSelectedAnecdotalStudentId] = useState(
    location.state?.studentId || ""
  );
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [anecdotalHecho, setAnecdotalHecho] = useState("");
  const [anecdotalSugerencia, setAnecdotalSugerencia] = useState("");
  const [anecdotalList, setAnecdotalList] = useState<AnecdotalRecord[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  // Load classroom and students
  useEffect(() => {
    if (!user || !classId) return;
    const classes = getClassrooms(user.id);
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

  const loadAnecdotal = () => {
    if (classId) {
      const all = getAnecdotalRecords(classId);
      const filtered = selectedAnecdotalStudentId 
        ? all.filter(r => r.student_id === selectedAnecdotalStudentId)
        : all;
      setAnecdotalList(filtered.sort((a, b) => b.fecha.localeCompare(a.fecha)));
    }
  };

  useEffect(() => {
    loadAnecdotal();
  }, [classId, selectedAnecdotalStudentId]);

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
    if (!classId || !selectedAnecdotalStudentId) {
      toast.error("Selecciona un estudiante.");
      return;
    }
    if (!anecdotalHecho.trim()) {
      toast.error("Por favor describe el hecho observado.");
      return;
    }

    if (!user) return;

    const record: AnecdotalRecord = {
      id: uid("rec"),
      classroom_id: classId,
      student_id: selectedAnecdotalStudentId,
      docente_id: user.id,
      fecha: new Date().toISOString().split("T")[0],
      hecho: anecdotalHecho.trim(),
      sugerencia_ia: anecdotalSugerencia.trim() || undefined,
      estado: "guardado",
      creado_en: new Date().toISOString()
    };

    saveAnecdotalRecord(record);
    toast.success("Registro guardado exitosamente");
    
    // Reset form
    setAnecdotalHecho("");
    setAnecdotalSugerencia("");
    loadAnecdotal();
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
                                  navigate(`/aula-virtual/anecdotario/${c.id}`);
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
              Registro Anecdótico
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold mt-1.5">
              Registro cualitativo de hechos significativos observados en el estudiante.
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
              <h3 className="text-lg font-bold text-text-main">Nuevo Registro</h3>
              <p className="text-[12px] text-text-muted mt-0.5">Añade una observación cualitativa sobre el comportamiento de un estudiante.</p>
            </div>

            <form onSubmit={handleSaveAnecdotal} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 relative select-none">
                <label className="text-[12px] font-bold text-text-main">Estudiante</label>
                <div
                  onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                  className="w-full bg-bg-base/60 dark:bg-zinc-950 border border-black/5 dark:border-zinc-800 rounded-[16px] px-4 py-3 text-[13px] font-bold text-text-main flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="truncate">
                    {(() => {
                      const s = students.find(std => std.id === selectedAnecdotalStudentId);
                      return s ? `${s.numero_orden}. ${s.nombre} ${s.apellido || ""}` : "-- Seleccionar Estudiante --";
                    })()}
                  </span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showStudentDropdown ? 'rotate-90' : ''}`} />
                </div>

                {showStudentDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStudentDropdown(false)} />
                    <div className="absolute left-0 right-0 top-full mt-1.5 max-h-52 overflow-y-auto bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150 scrollbar-hide">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAnecdotalStudentId("");
                            setShowStudentDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                            selectedAnecdotalStudentId === "" ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                          }`}
                        >
                          <span>-- Mostrar Todo el Historial --</span>
                          {selectedAnecdotalStudentId === "" && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                        </button>
                        {students.map((s) => {
                          const isActive = s.id === selectedAnecdotalStudentId;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setSelectedAnecdotalStudentId(s.id);
                                setShowStudentDropdown(false);
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
                <label className="text-[12px] font-bold text-text-main">Hecho Observado (Borrador)</label>
                <textarea
                  rows={4}
                  value={anecdotalHecho}
                  onChange={(e) => setAnecdotalHecho(e.target.value)}
                  placeholder="Describe el hecho observado de forma breve y descriptiva..."
                  className="w-full bg-bg-base/60 dark:bg-zinc-950 border border-black/5 dark:border-zinc-800 rounded-[16px] px-4 py-3 outline-none focus:border-black/20 dark:focus:border-zinc-700 text-[13px] font-medium text-text-main placeholder-slate-400 dark:placeholder-zinc-500 resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="button"
                onClick={handleImproveAnecdotalWithAi}
                disabled={loadingAi}
                className="bg-card-purple/70 dark:bg-purple-950/40 hover:bg-card-purple dark:hover:bg-purple-900/50 text-[#1B1B1B] dark:text-purple-300 py-2.5 rounded-full text-[12px] font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={14} className={`text-purple-700 dark:text-purple-400 ${loadingAi ? "animate-spin" : ""}`} />
                {loadingAi ? "Redactando..." : "Redactar Profesional con IA"}
              </button>

              {anecdotalSugerencia && (
                <div className="flex flex-col gap-1.5 bg-card-purple/20 dark:bg-purple-950/20 border border-card-purple/40 dark:border-purple-900/40 rounded-[16px] p-4">
                  <span className="text-[10px] font-bold text-purple-950 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={10} /> Sugerencia Profesional de IA
                  </span>
                  <p className="text-[12px] text-text-main leading-relaxed font-medium">
                    {anecdotalSugerencia}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="bg-[#1B1B1B] dark:bg-white text-white dark:text-black py-3.5 rounded-full text-[13px] font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Save size={14} />
                Guardar Registro
              </button>
            </form>
          </div>

          {/* Right: History List */}
          <div className={isSidebarPinned ? '2xl:col-span-2 flex flex-col gap-4' : 'lg:col-span-2 flex flex-col gap-4'}>
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-text-main uppercase tracking-wider">Historial del Aula</h3>
              {selectedAnecdotalStudentId && (
                <button
                  onClick={() => setSelectedAnecdotalStudentId("")}
                  className="text-[11px] font-semibold text-text-muted hover:text-text-main cursor-pointer"
                >
                  Ver todos
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {anecdotalList.length > 0 ? (
                anecdotalList.map((rec) => {
                  const st = students.find(s => s.id === rec.student_id);
                  return (
                    <div key={rec.id} className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Estudiante</span>
                          <button
                            type="button"
                            onClick={() => st && navigate(`/aula-virtual/perfil/${st.id}`)}
                            className="font-bold text-[14px] text-text-main hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none p-0 block text-left"
                          >
                            {st ? `${st.nombre} ${st.apellido || ""}` : "Estudiante desconocido"}
                          </button>
                        </div>
                        <span className="bg-bg-base dark:bg-zinc-950 border border-black/5 dark:border-zinc-800 text-text-muted text-[11px] font-semibold px-3 py-1 rounded-full">
                          {rec.fecha}
                        </span>
                      </div>

                      <div className="border-t border-black/5 dark:border-zinc-800 pt-3">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Hecho</span>
                        <p className="text-[13px] text-text-main leading-relaxed">{rec.hecho}</p>
                      </div>

                      {rec.sugerencia_ia && (
                        <div className="bg-bg-panel/30 dark:bg-zinc-950/40 border border-black/5 dark:border-zinc-800 rounded-[16px] p-3 text-[12px] text-text-main leading-relaxed mt-1 flex gap-2.5 items-start">
                          <Sparkles size={14} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[9px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block mb-0.5">Versión IA Guardada</span>
                            <p className="font-medium">{rec.sugerencia_ia}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[24px] p-12 text-center text-text-muted">
                  No hay registros anecdóticos guardados.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
