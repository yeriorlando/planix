import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { 
  ArrowLeft, Users, ChevronDown, GraduationCap, Scale, Lock, 
  SlidersHorizontal, Eye, Briefcase, ChevronRight
} from "lucide-react";
import { useRequireAuth } from "../../lib/useRequireAuth";
import { 
  getRubrics, 
  getClassrooms, 
  getAllClassroomsAdmin, 
  getStudents, 
  Classroom,
  Student,
  Rubric
} from "../../lib/storage";
import { Toaster } from "sonner";
import RubricManager from "../../components/dashboard/Rubrics/RubricManager";

export default function InstrumentosEvaluacion() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Selected sub-instrument ("rubrica", "escala", etc. null = menu)
  const [activeInstrument, setActiveInstrument] = useState<string | null>(null);

  // Classroom States
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
  const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
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

  // Rubrics count for the menu dashboard
  const [rubricsCount, setRubricsCount] = useState(0);

  // Load classrooms & students
  useEffect(() => {
    if (!user || !classId) return;
    const classes = user.rol === "admin" ? getAllClassroomsAdmin() : getClassrooms(user.id);
    setClassrooms(classes);
    const current = classes.find(c => c.id === classId) || null;
    setActiveClassroom(current);
    
    if (current) {
      const list = getStudents(current.id);
      setStudents(list.sort((a, b) => a.numero_orden - b.numero_orden));
    }
  }, [user, classId]);

  // Load Rubrics count to display on the menu cards
  useEffect(() => {
    if (user?.id) {
      const list = getRubrics(user.id);
      setRubricsCount(list.length);
    }
  }, [user, activeInstrument]);

  // Handle classroom change from page dropdown
  const handleClassroomChange = (targetId: string) => {
    setShowClassroomDropdown(false);
    navigate(`/aula-virtual/instrumentos/${targetId}`);
  };

  if (!user || !activeClassroom) return null;

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <Toaster position="top-center" richColors />

      {/* Main Container */}
      <div className="flex flex-col gap-6 w-full text-left">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 text-center relative pb-4 border-b border-slate-100 dark:border-zinc-800 print:hidden mb-8 mt-6">
          <div className="absolute top-0 left-0">
            <button 
              onClick={() => {
                if (activeInstrument) {
                  setActiveInstrument(null);
                } else {
                  navigate(`/aula-virtual`);
                }
              }}
              className="bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-full px-4 py-2 font-bold text-[13px] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> {activeInstrument ? "Volver a Instrumentos" : "Volver a Aulas"}
            </button>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-wider leading-none">
              {activeInstrument === "rubrica" ? "Rúbricas de Evaluación" : "Instrumentos de Evaluación"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold mt-1.5">
              {activeInstrument === "rubrica" 
                ? "Diseño de matrices y cálculo automatizado de notas oficiales." 
                : "Herramientas de evaluación formativa y sumativa para el currículo dominicano."
              }
            </p>
            
            {activeClassroom && (
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                {/* Classroom Badge */}
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-sm px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-purple-650 dark:text-purple-400">{activeClassroom.nombre}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800" />
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">{activeSchoolYear}</span>
                  </div>
                </div>

                {/* Active Classroom Selector Dropdown (Placed next to badge) */}
                {classrooms.length > 0 && (
                  <div className="inline-block relative select-none">
                    <button
                      onClick={() => setShowClassroomDropdown(!showClassroomDropdown)}
                      className="bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-xl px-4 py-2 font-bold text-[13px] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Users size={14} className="text-slate-700 dark:text-zinc-300" />
                      <span>{activeClassroom.nombre}</span>
                      <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${showClassroomDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showClassroomDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setShowClassroomDropdown(false)} 
                        />
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800 mb-1">
                            Cambiar de Aula/Curso
                          </div>
                          <div className="max-h-[200px] overflow-y-auto px-1.5 py-0.5 space-y-0.5">
                            {classrooms.map((c) => {
                              const isActive = c.id === activeClassroom.id;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => handleClassroomChange(c.id)}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                    isActive
                                      ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-zinc-100"
                                      : "text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800"
                                  }`}
                                >
                                  <Users size={14} className={isActive ? "text-slate-800 dark:text-zinc-200" : "text-slate-400 dark:text-zinc-500"} />
                                  <span>{c.nombre}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INSTRUMENT MENU LIST VIEW */}
        {/* ------------------------------------------------------------- */}
        {!activeInstrument && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">            {/* Card 1: Rubrics (Active) */}
            <div 
              onClick={() => setActiveInstrument("rubrica")}
              className="bg-gradient-to-br from-[#E0E7FF] to-[#EDE9FE] dark:from-indigo-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[200px] flex flex-col justify-between border border-transparent hover:border-indigo-500/10 select-none"
            >
              <div className="absolute -top-4 -bottom-4 -right-4 w-[60%] bg-white/30 rounded-l-[24px] transform -skew-x-[8deg] translate-x-4 pointer-events-none transition-transform duration-700 group-hover:translate-x-1"></div>
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-1.5">
                  <Scale size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[13px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Rúbrica y Lista de Cotejo</span>
                </div>
                <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-indigo-600 dark:text-indigo-400">
                  <Scale size={18} className="fill-indigo-500 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="relative z-10 my-4 flex items-center gap-4 w-full">
                <div className="flex flex-col items-start leading-none shrink-0">
                  <span className="text-[36px] font-extrabold text-[#1B1B1B] dark:text-white tracking-tight">
                    {rubricsCount}
                  </span>
                  <span className="text-[12px] font-bold text-text-muted mt-1">Rúbricas</span>
                </div>
                <div className="text-[11.5px] text-slate-550 dark:text-zinc-400 font-semibold leading-snug">
                  Matriz cuali-cuantitativa para evaluar competencias de forma objetiva con Inteligencia Artificial.
                </div>
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-indigo-500/10 w-full">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Matrices e instrumentos</span>
                <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-white/70 dark:bg-black/30 px-2.5 py-0.5 rounded-md border border-indigo-200/50 flex items-center gap-0.5">
                  Acceder <ChevronRight size={12} />
                </span>
              </div>
            </div>

            {/* Card 2: Escala de Estimacion (Locked) */}
            <div className="bg-gradient-to-br from-[#FEF7E0] to-[#FFFBF0] dark:from-yellow-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group shadow-sm min-h-[200px] flex flex-col justify-between border border-transparent select-none opacity-80">
              <div className="absolute -top-4 -bottom-4 -right-4 w-[60%] bg-white/30 rounded-l-[24px] transform -skew-x-[8deg] translate-x-4 pointer-events-none transition-transform duration-700"></div>
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal size={16} className="text-amber-600 dark:text-amber-450" />
                  <span className="text-[13px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Escala de Estimación</span>
                  <Lock size={12} className="text-amber-500/60 dark:text-amber-400/60 ml-0.5" />
                </div>
                <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-amber-600 dark:text-amber-450">
                  <SlidersHorizontal size={18} className="text-amber-600 dark:text-amber-450" />
                </div>
              </div>
              <div className="relative z-10 my-4 flex items-center gap-4 w-full">
                <div className="flex items-end gap-1.5 shrink-0">
                  <span className="text-[26px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                    Cualitativa
                  </span>
                </div>
                <div className="text-[11.5px] text-slate-550 dark:text-zinc-400 font-semibold leading-snug">
                  Define una escala numérica o descriptiva para valorar los niveles de logro de competencias.
                </div>
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-amber-500/10 w-full">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Disponible próximamente</span>
              </div>
            </div>

            {/* Card 3: Observación Diaria (Locked) */}
            <div className="bg-gradient-to-br from-[#E6F4EA] to-[#F1F9F5] dark:from-emerald-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group shadow-sm min-h-[200px] flex flex-col justify-between border border-transparent select-none opacity-80">
              <div className="absolute -top-4 -bottom-4 -right-4 w-[60%] bg-white/30 rounded-l-[24px] transform -skew-x-[8deg] translate-x-4 pointer-events-none transition-transform duration-700"></div>
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-1.5">
                  <Eye size={16} className="text-emerald-600 dark:text-emerald-455" />
                  <span className="text-[13px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Registro de Observación</span>
                  <Lock size={12} className="text-emerald-500/60 dark:text-emerald-450/60 ml-0.5" />
                </div>
                <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-emerald-600 dark:text-emerald-455">
                  <Eye size={18} className="text-emerald-600 dark:text-emerald-455" />
                </div>
              </div>
              <div className="relative z-10 my-4 flex items-center gap-4 w-full">
                <div className="flex items-end gap-1.5 shrink-0">
                  <span className="text-[26px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                    Bitácora
                  </span>
                </div>
                <div className="text-[11.5px] text-slate-550 dark:text-zinc-400 font-semibold leading-snug">
                  Bitácora diaria estructurada para recopilar de forma sistemática datos del comportamiento.
                </div>
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-emerald-500/10 w-full">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Disponible próximamente</span>
              </div>
            </div>

            {/* Card 4: Portafolio de Evidencias (Locked) */}
            <div className="bg-gradient-to-br from-[#FCE8E6] to-[#FEF3F2] dark:from-rose-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group shadow-sm min-h-[200px] flex flex-col justify-between border border-transparent select-none opacity-80">
              <div className="absolute -top-4 -bottom-4 -right-4 w-[60%] bg-white/30 rounded-l-[24px] transform -skew-x-[8deg] translate-x-4 pointer-events-none transition-transform duration-700"></div>
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-1.5">
                  <Briefcase size={16} className="text-rose-600 dark:text-rose-455" />
                  <span className="text-[13px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">Portafolio de Evidencias</span>
                  <Lock size={12} className="text-rose-500/60 dark:text-rose-450/60 ml-0.5" />
                </div>
                <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-rose-600 dark:text-rose-455">
                  <Briefcase size={18} className="text-rose-600 dark:text-rose-455" />
                </div>
              </div>
              <div className="relative z-10 my-4 flex items-center gap-4 w-full">
                <div className="flex items-end gap-1.5 shrink-0">
                  <span className="text-[26px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                    Evidencias
                  </span>
                </div>
                <div className="text-[11.5px] text-slate-550 dark:text-zinc-400 font-semibold leading-snug">
                  Colección sistemática de trabajos y evidencias de aprendizaje para evaluar el progreso.
                </div>
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-rose-500/10 w-full">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Disponible próximamente</span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ACTIVE MODULE: RUBRICS */}
        {/* ------------------------------------------------------------- */}
        {activeInstrument === "rubrica" && (
          <RubricManager 
            user={user}
            activeClassroom={activeClassroom}
            students={students}
          />
        )}

      </div>
    </main>
  );
}
