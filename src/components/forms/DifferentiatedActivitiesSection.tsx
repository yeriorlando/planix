import React, { useState, useEffect } from "react";
import { Sparkles, Accessibility, Trash2, Plus, Target, Check, ChevronDown, Award, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUser, getClassrooms, getStudents } from "../../lib/storage";
import { generateDifferentiatedActivity } from "../../lib/services/aiService";

interface DifferentiatedActivitiesSectionProps {
  moment: any;
  show: boolean;
  onUpdate: (activities: any[]) => void;
}

export default function DifferentiatedActivitiesSection({
  moment,
  show,
  onUpdate,
}: DifferentiatedActivitiesSectionProps) {
  // Local state for UI search and drop-downs
  const [isGeneratingDiferenciada, setIsGeneratingDiferenciada] = useState<Record<string, boolean>>({});
  const [classroomSearch, setClassroomSearch] = useState<Record<string, string>>({});
  const [studentSearch, setStudentSearch] = useState<Record<string, string>>({});
  const [showClassroomDropdown, setShowClassroomDropdown] = useState<Record<string, boolean>>({});
  const [showStudentDropdown, setShowStudentDropdown] = useState<Record<string, boolean>>({});
  const [activeTextarea, setActiveTextarea] = useState<string | null>(null);

  // Auto-initialize first activity when showing the section if it is empty
  useEffect(() => {
    if (show && (!moment.actividadesDiferenciadas || moment.actividadesDiferenciadas.length === 0)) {
      const timer = setTimeout(() => {
        onUpdate([
          {
            id: `diff-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            nivel: "E",
            estilo: "simple",
            descripcion: "",
            aulaId: "",
            estudiantesIds: [],
            estudiantesNames: [],
          },
        ]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  const currentActivities = moment.actividadesDiferenciadas || [];

  const handleAddDiferenciada = () => {
    onUpdate([
      ...currentActivities,
      {
        id: `diff-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        nivel: "E",
        estilo: "simple",
        descripcion: "",
        aulaId: "",
        estudiantesIds: [],
        estudiantesNames: [],
      },
    ]);
  };

  const handleRemoveDiferenciada = (activityId: string) => {
    onUpdate(currentActivities.filter((ad: any) => ad.id !== activityId));
  };

  const handleUpdateDiferenciada = (activityId: string, key: string, value: any) => {
    onUpdate(
      currentActivities.map((ad: any) => {
        if (ad.id === activityId) {
          return { ...ad, [key]: value };
        }
        return ad;
      })
    );
  };

  const handleGenerateDiferenciadaIA = async (activityId: string, originalText: string, nivel: "E" | "A" | "S", estilo: "simple" | "intermedio" | "extenso") => {
    if (!originalText || !originalText.trim()) {
      toast.error("Por favor escribe primero una descripción en 'Estrategias y Actividades' del momento original.");
      return;
    }
    
    setIsGeneratingDiferenciada((prev) => ({ ...prev, [activityId]: true }));
    try {
      const response = await generateDifferentiatedActivity(originalText, nivel, estilo);
      if (response && response.adapted_activity) {
        handleUpdateDiferenciada(activityId, "descripcion", response.adapted_activity);
        toast.success("¡Actividad diferenciada generada con éxito!");
      } else {
        throw new Error("No se recibió respuesta válida del asistente de IA.");
      }
    } catch (error: any) {
      console.error("Error generating differentiated activity:", error);
      toast.error(`Error al generar actividad diferenciada: ${error.message || error}`);
    } finally {
      setIsGeneratingDiferenciada((prev) => ({ ...prev, [activityId]: false }));
    }
  };

  const currentUser = getCurrentUser();
  const classrooms = currentUser ? getClassrooms(currentUser.id) : [];

  return (
    <div className="mt-5 pt-5 border-t border-dashed border-neutral-200 dark:border-zinc-800 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 flex items-center gap-1.5 font-sans">
          <Sparkles className="w-4 h-4 text-brand-primary dark:text-blue-400" />
          Actividades Diferenciadas / Adaptaciones Curriculares
        </h4>
        <button
          type="button"
          onClick={handleAddDiferenciada}
          className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-955/20 text-brand-primary dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar Actividad
        </button>
      </div>

      {currentActivities.length === 0 ? (
        <p className="text-xs text-neutral-500 italic text-center py-4">
          No hay actividades diferenciadas para este momento.
        </p>
      ) : (
        <div className="space-y-5">
          {currentActivities.map((ad: any, adIdx: number) => {
            const stateKey = `${moment.id}-${ad.id}`;
            const isGenerating = !!isGeneratingDiferenciada[ad.id];
            const selectedClassroom = classrooms.find((c) => c.id === ad.aulaId);
            const students = ad.aulaId ? getStudents(ad.aulaId) : [];

            const queryClassroom = (classroomSearch[stateKey] || "").toLowerCase().trim();
            const filteredClassrooms = classrooms.filter(
              (c) =>
                c.nombre.toLowerCase().includes(queryClassroom) ||
                (c.grado && c.grado.toLowerCase().includes(queryClassroom))
            );

            const levelBgClasses =
              ad.nivel === "E"
                ? "bg-amber-50/20 dark:bg-amber-955/5 border-amber-200"
                : ad.nivel === "A"
                ? "bg-blue-50/20 dark:bg-blue-955/5 border-blue-200"
                : "bg-emerald-50/20 dark:bg-emerald-955/5 border-emerald-200";

            return (
              <div key={ad.id || adIdx} className={`${levelBgClasses} p-4 rounded-2xl border space-y-4`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] font-black text-brand-primary dark:text-blue-400 uppercase tracking-wider">
                    Adaptación #{adIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDiferenciada(ad.id)}
                    className="text-red-400 hover:text-red-650 text-[10px] font-bold uppercase tracking-tight transition-colors border-none bg-transparent cursor-pointer inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Quitar
                  </button>
                </div>

                {/* Selector de Nivel (Elemental, Aceptable, Satisfactorio) */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                    Nivel de Adaptación
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        k: "E",
                        label: "Elemental (E)",
                        desc: "Apoyo constante",
                        icon: <Accessibility className="w-4 h-4 text-amber-600 mr-1.5" />,
                      },
                      {
                        k: "A",
                        label: "Aceptable (A)",
                        desc: "Andamiaje guiado",
                        icon: <Target className="w-4 h-4 text-blue-600 mr-1.5" />,
                      },
                      {
                        k: "S",
                        label: "Satisfactorio (S)",
                        desc: "Autonomía / Ampliación",
                        icon: <Award className="w-4 h-4 text-emerald-600 mr-1.5" />,
                      },
                    ].map((level) => {
                      const active = ad.nivel === level.k;
                      return (
                        <button
                          type="button"
                          key={level.k}
                          onClick={() => handleUpdateDiferenciada(ad.id, "nivel", level.k)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            active
                              ? level.k === "E"
                                ? "border-amber-400 bg-amber-50/50 text-amber-900 dark:bg-amber-955/20 dark:text-amber-300 ring-2 ring-amber-500/10"
                                : level.k === "A"
                                ? "border-blue-400 bg-blue-50/50 text-blue-900 dark:bg-indigo-955/20 dark:text-blue-300 ring-2 ring-blue-500/10"
                                : "border-emerald-400 bg-emerald-50/50 text-emerald-900 dark:bg-emerald-955/20 dark:text-emerald-300 ring-2 ring-emerald-500/10"
                              : "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-850"
                          }`}
                        >
                          <span className="text-xs font-bold flex items-center justify-center">
                            {level.icon}
                            {level.label}
                          </span>
                          <span className="text-[9px] font-normal text-neutral-400 dark:text-zinc-500 mt-0.5">
                            {level.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Formato/Estilo de Generación */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                    Formato de Generación (IA)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { k: "simple", label: "Simple", desc: "Párrafo corto (40-80 palabras)" },
                      { k: "intermedio", label: "Intermedio", desc: "Párrafo detallado (80-120 palabras)" },
                      { k: "extenso", label: "Extenso (Pasos)", desc: "Con viñetas y pasos (150-250 palabras)" },
                    ].map((styleOpt) => {
                      const active = (ad.estilo || "simple") === styleOpt.k;
                      return (
                        <button
                          type="button"
                          key={styleOpt.k}
                          onClick={() => handleUpdateDiferenciada(ad.id, "estilo", styleOpt.k)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            active
                              ? "border-brand-primary bg-blue-50/50 text-brand-primary dark:bg-blue-955/20 dark:text-blue-300 ring-2 ring-blue-500/10"
                              : "border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-850"
                          }`}
                        >
                          <span className="text-xs font-bold">{styleOpt.label}</span>
                          <span className="text-[9px] font-normal text-neutral-400 dark:text-zinc-500 mt-0.5">
                            {styleOpt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Descripción de la Actividad Adaptada */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                      Descripción de la Actividad Adaptada
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        handleGenerateDiferenciadaIA(
                          ad.id,
                          moment.descripcion || moment.description || "",
                          ad.nivel,
                          ad.estilo || "simple"
                        )
                      }
                      disabled={isGenerating}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-955/25 text-brand-primary dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1.5 text-[10px] font-extrabold shadow-sm transition-all hover:-translate-y-px cursor-pointer disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                      )}
                      Generar con IA
                    </button>
                  </div>
                  <textarea
                    rows={activeTextarea === stateKey ? 8 : 3}
                    className={`${textareaCls} transition-all duration-200 ease-in-out`}
                    placeholder="Describe de forma detallada la adaptación de esta actividad…"
                    value={ad.descripcion}
                    onChange={(e) => handleUpdateDiferenciada(ad.id, "descripcion", e.target.value)}
                    onFocus={() => setActiveTextarea(stateKey)}
                    onBlur={() => setActiveTextarea(null)}
                  />
                </div>

                {/* Selector de Aula con Barra de Búsqueda */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 relative">
                    <label className="block text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                      Aplicar al Aula (Opcional)
                    </label>
                    <div
                      onClick={() =>
                        setShowClassroomDropdown((prev) => ({ ...prev, [stateKey]: !prev[stateKey] }))
                      }
                      className="w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                    >
                      <span className="truncate">
                        {selectedClassroom
                          ? `${selectedClassroom.nombre} (${selectedClassroom.grado || ""})`
                          : "Selecciona un aula..."}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>

                    {showClassroomDropdown[stateKey] && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowClassroomDropdown((prev) => ({ ...prev, [stateKey]: false }))}
                        />
                        <div className="absolute left-0 top-full mt-1.5 w-full bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800 shadow-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75 space-y-2">
                          <input
                            type="text"
                            placeholder="Buscar aula..."
                            className="w-full h-9 px-3 bg-white dark:bg-zinc-955 border border-neutral-200 dark:border-zinc-800 rounded-xl text-xs outline-none focus:border-brand-primary"
                            value={classroomSearch[stateKey] || ""}
                            onChange={(e) => setClassroomSearch((prev) => ({ ...prev, [stateKey]: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="space-y-0.5 max-h-40 overflow-y-auto">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentActivities.map((item: any) => {
                                  if (item.id === ad.id) {
                                    return {
                                      ...item,
                                      aulaId: "",
                                      estudiantesIds: [],
                                      estudiantesNames: []
                                    };
                                  }
                                  return item;
                                });
                                onUpdate(updated);
                                setShowClassroomDropdown((prev) => ({ ...prev, [stateKey]: false }));
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm font-bold hover:bg-slate-50 dark:hover:bg-zinc-800"
                            >
                              Ninguno
                            </button>
                            {filteredClassrooms.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  const updated = currentActivities.map((item: any) => {
                                    if (item.id === ad.id) {
                                      return {
                                        ...item,
                                        aulaId: c.id,
                                        estudiantesIds: [],
                                        estudiantesNames: []
                                      };
                                    }
                                    return item;
                                  });
                                  onUpdate(updated);
                                  setShowClassroomDropdown((prev) => ({ ...prev, [stateKey]: false }));
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm font-bold transition-colors ${
                                  ad.aulaId === c.id
                                    ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B]"
                                    : "text-slate-750 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                }`}
                              >
                                <span>
                                  {c.nombre} ({c.grado || ""})
                                </span>
                                {ad.aulaId === c.id && <Check className="w-3.5 h-3.5 text-[#1B1B1B]" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Selector de Estudiantes Multi-Select */}
                  <div className="space-y-1.5 relative">
                    <label className="block text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                      Estudiantes a aplicar
                    </label>
                    <div
                      onClick={() => {
                        if (!ad.aulaId) {
                          toast.info("Por favor selecciona un aula primero.");
                          return;
                        }
                        setShowStudentDropdown((prev) => ({ ...prev, [stateKey]: !prev[stateKey] }));
                      }}
                      className={`w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs ${
                        !ad.aulaId ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="truncate">
                        {ad.estudiantesNames && ad.estudiantesNames.length > 0
                          ? `${ad.estudiantesNames.length} seleccionados`
                          : "Seleccionar estudiantes..."}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>

                    {showStudentDropdown[stateKey] && ad.aulaId && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowStudentDropdown((prev) => ({ ...prev, [stateKey]: false }))}
                        />
                        <div className="absolute left-0 top-full mt-1.5 w-full bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800 shadow-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75 space-y-2">
                          <div className="flex justify-end items-center px-1">
                            <button
                              type="button"
                              onClick={() => {
                                const allChecked = ad.estudiantesIds?.length === students.length;
                                let nextIds = [];
                                let nextNames = [];
                                if (!allChecked) {
                                  nextIds = students.map((s) => s.id);
                                  nextNames = students.map((s) => `${s.nombre} ${s.apellido || ""}`.trim());
                                }
                                const updated = currentActivities.map((item: any) => {
                                  if (item.id === ad.id) {
                                    return {
                                      ...item,
                                      estudiantesIds: nextIds,
                                      estudiantesNames: nextNames
                                    };
                                  }
                                  return item;
                                });
                                onUpdate(updated);
                              }}
                              className="text-[11px] font-black text-brand-primary dark:text-blue-400 hover:underline border-none bg-transparent cursor-pointer"
                            >
                              {ad.estudiantesIds?.length === students.length
                                ? "Desmarcar todos"
                                : "Seleccionar todos"}
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Buscar estudiante..."
                            className="w-full h-9 px-3 bg-white dark:bg-zinc-955 border border-neutral-200 dark:border-zinc-800 rounded-xl text-xs outline-none focus:border-brand-primary"
                            value={studentSearch[stateKey] || ""}
                            onChange={(e) => setStudentSearch((prev) => ({ ...prev, [stateKey]: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="space-y-0.5 max-h-40 overflow-y-auto">
                            {(() => {
                              const queryEst = (studentSearch[stateKey] || "").toLowerCase().trim();
                              const filteredStudents = students.filter((student) => {
                                const fullName = `${student.nombre} ${student.apellido || ""}`
                                  .trim()
                                  .toLowerCase();
                                return fullName.includes(queryEst);
                              });

                              if (filteredStudents.length === 0) {
                                return (
                                  <p className="text-xs text-neutral-500 italic text-center py-2">
                                    No se encontraron estudiantes.
                                  </p>
                                );
                              }

                              return filteredStudents.map((student) => {
                                const fullName = `${student.nombre} ${student.apellido || ""}`.trim();
                                const isChecked = (ad.estudiantesIds || []).includes(student.id);
                                return (
                                  <button
                                    key={student.id}
                                    type="button"
                                    onClick={() => {
                                      let nextIds = [...(ad.estudiantesIds || [])];
                                      let nextNames = [...(ad.estudiantesNames || [])];
                                      if (isChecked) {
                                        nextIds = nextIds.filter((id) => id !== student.id);
                                        nextNames = nextNames.filter((n) => n !== fullName);
                                      } else {
                                        nextIds.push(student.id);
                                        nextNames.push(fullName);
                                      }
                                      
                                      const updated = currentActivities.map((item: any) => {
                                        if (item.id === ad.id) {
                                          return {
                                            ...item,
                                            estudiantesIds: nextIds,
                                            estudiantesNames: nextNames
                                          };
                                        }
                                        return item;
                                      });
                                      onUpdate(updated);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-sm font-bold transition-colors ${
                                      isChecked
                                        ? "bg-blue-50 text-brand-primary dark:bg-blue-955/20"
                                        : "text-slate-755 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {student.avatar_url ? (
                                        <img
                                          src={student.avatar_url}
                                          alt={student.nombre}
                                          className="w-6 h-6 rounded-full object-cover bg-neutral-100 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 shrink-0"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] shrink-0 font-bold">
                                          {student.nombre[0].toUpperCase()}
                                        </div>
                                      )}
                                      <span>{fullName}</span>
                                    </div>
                                    {isChecked && <Check className="w-3.5 h-3.5 text-brand-primary shrink-0" />}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Styling classes copied from parent forms
const textareaCls =
  "w-full bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none leading-relaxed disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-zinc-900 disabled:text-gray-400";
