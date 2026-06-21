import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Circle, Search, Filter, Loader2, X, AlertCircle, Sparkles, CheckSquare, Square } from 'lucide-react';
import { fetchPlannings } from '../../lib/services/plannings';
import { LessonPlan } from '../../lib/storage';

interface DailyPlanSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlans: (plans: LessonPlan[]) => void;
  subjectId?: string; // e.g. 'sociales'
  grade?: string;     // e.g. 'primaria-1ro'
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, " ")     // replace non-alphanumeric with spaces
    .replace(/\s+/g, " ")            // collapse spaces
    .trim();
}

function checkSubjectMatch(pSubject: string, sId: string): boolean {
  if (!sId) return true;
  
  const normSubject = normalizeString(pSubject);
  const normId = normalizeString(sId);
  
  // Direct inclusion
  if (normSubject.includes(normId) || normId.includes(normSubject)) {
    return true;
  }
  
  // Specific mappings or custom keyword matchers
  // 1. Formación Humana
  if (normId.includes("formacion") || normId.includes("humana") || normId.includes("religiosa")) {
    return (
      normSubject.includes("formacion") ||
      normSubject.includes("humana") ||
      normSubject.includes("religiosa") ||
      normSubject.includes("religioso") ||
      normSubject.includes("f h i r") ||
      normSubject.includes("integral r")
    );
  }
  
  // 2. Ciencias Naturales
  if (normId.includes("naturales") || normId.includes("naturaleza") || normId.includes("natural")) {
    return (
      normSubject.includes("naturales") ||
      normSubject.includes("naturaleza") ||
      normSubject.includes("natural")
    );
  }
  
  // 3. Educación Artística
  if (normId.includes("artistica") || normId.includes("arte")) {
    return (
      normSubject.includes("artistica") ||
      normSubject.includes("arte")
    );
  }
  
  // 4. Ciencias Sociales
  if (normId.includes("sociales") || normId.includes("social")) {
    return (
      normSubject.includes("sociales") ||
      normSubject.includes("social")
    );
  }

  // 5. Lengua Española
  if (normId.includes("lengua") || normId.includes("espanola") || normId.includes("espanol")) {
    return (
      normSubject.includes("lengua") ||
      normSubject.includes("espanola") ||
      normSubject.includes("espanol")
    );
  }

  // 6. Matemática
  if (normId.includes("matematica") || normId.includes("mate")) {
    return (
      normSubject.includes("matematica") ||
      normSubject.includes("mate")
    );
  }
  
  return false;
}

function checkGradeMatch(pGrade: string, sGrade: string): boolean {
  if (!sGrade) return true;
  if (!pGrade) return false;
  
  const normP = pGrade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normS = sGrade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Direct inclusion check
  if (normP.includes(normS) || normS.includes(normP)) return true;
  
  // Extract level (primaria / secundaria)
  const isSecundaryP = normP.includes("secundaria");
  const isSecundaryS = normS.includes("secundaria");
  // If one is explicitly secundaria and the other is explicitly primaria (or not secundaria), they don't match
  if (isSecundaryP !== isSecundaryS) {
    const hasLevelP = normP.includes("primaria") || normP.includes("secundaria") || normP.includes("inicial");
    const hasLevelS = normS.includes("primaria") || normS.includes("secundaria") || normS.includes("inicial");
    if (hasLevelP && hasLevelS) {
      return false;
    }
  }

  // Map words and numbers to digits
  const getGradeNumber = (str: string): string | null => {
    if (str.includes("1") || str.includes("primer") || str.includes("1ro") || str.includes("1er") || str.includes("1era")) return "1";
    if (str.includes("2") || str.includes("segundo") || str.includes("2do") || str.includes("2da")) return "2";
    if (str.includes("3") || str.includes("tercer") || str.includes("3ro") || str.includes("3ra")) return "3";
    if (str.includes("4") || str.includes("cuarto") || str.includes("4to") || str.includes("4ta")) return "4";
    if (str.includes("5") || str.includes("quinto") || str.includes("5to") || str.includes("5ta")) return "5";
    if (str.includes("6") || str.includes("sexto") || str.includes("6to") || str.includes("6ta")) return "6";
    return null;
  };
  
  const numP = getGradeNumber(normP);
  const numS = getGradeNumber(normS);
  
  if (numP && numS) {
    return numP === numS;
  }
  
  return false;
}

function getSubjectDisplayName(sId?: string): string {
  if (!sId) return 'la asignatura seleccionada';
  const idLower = sId.toLowerCase();
  if (idLower.includes('formacion') || idLower.includes('humana')) {
    return 'Formación Integral Humana y Religiosa';
  }
  if (idLower.includes('sociales')) {
    return 'Ciencias Sociales';
  }
  if (idLower.includes('naturales') || idLower.includes('naturaleza')) {
    return 'Ciencias de la Naturaleza';
  }
  if (idLower.includes('artistica') || idLower.includes('arte')) {
    return 'Educación Artística';
  }
  if (idLower.includes('lengua') || idLower.includes('espanol') || idLower.includes('español')) {
    return 'Lengua Española';
  }
  if (idLower.includes('matematica') || idLower.includes('mate')) {
    return 'Matemática';
  }
  return sId;
}

function getGradeDisplayName(grade?: string): string {
  if (!grade) return 'el grado seleccionado';
  const gradeLower = grade.toLowerCase();
  
  let gradeNum = '';
  if (gradeLower.includes('1') || gradeLower.includes('primer')) gradeNum = 'primer';
  else if (gradeLower.includes('2') || gradeLower.includes('segundo')) gradeNum = 'segundo';
  else if (gradeLower.includes('3') || gradeLower.includes('tercer')) gradeNum = 'tercer';
  else if (gradeLower.includes('4') || gradeLower.includes('cuarto')) gradeNum = 'cuarto';
  else if (gradeLower.includes('5') || gradeLower.includes('quinto')) gradeNum = 'quinto';
  else if (gradeLower.includes('6') || gradeLower.includes('sexto')) gradeNum = 'sexto';
  
  let level = 'primaria';
  if (gradeLower.includes('secundaria')) {
    level = 'secundaria';
  } else if (gradeLower.includes('inicial')) {
    level = 'inicial';
  }
  
  if (gradeNum) {
    return `${gradeNum} grado de ${level}`;
  }
  
  return grade;
}


export default function DailyPlanSelector({ isOpen, onClose, onSelectPlans, subjectId, grade }: DailyPlanSelectorProps) {
  const [plannings, setPlannings] = useState<LessonPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load plannings when modal opens
  useEffect(() => {
    if (isOpen) {
      let userId = '';
      const savedUser = localStorage.getItem('plx:user');
      if (savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          if (userObj && userObj.id) userId = userObj.id;
        } catch (_) {}
      }

      if (userId) {
        setIsLoading(true);
        setError(null);
        fetchPlannings(userId)
          .then((data) => {
            setPlannings(data);
          })
          .catch((err) => {
            console.error('Error fetching plannings:', err);
            setError('No se pudieron cargar las planificaciones.');
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // Fallback to local storage if no user logged in
        try {
          const localPlansRaw = localStorage.getItem('plx:lesson_plans');
          if (localPlansRaw) {
            setPlannings(JSON.parse(localPlansRaw));
          }
        } catch (_) {}
      }
    }
  }, [isOpen]);

  // Filter plans appropriate for synthesis
  const filteredPlans = useMemo(() => {
    return plannings.filter(p => {
      // Must be Daily plan
      const isDaily = p.customFields?.planningType === 'DIARIA' || 
                      (!p.customFields?.duracion_estimada && !p.customFields?.planningType && p.titulo?.toLowerCase().indexOf('unidad') === -1);

      // Match subject if provided
      const matchesSubject = checkSubjectMatch(p.asignatura || '', subjectId || '');

      // Match grade if provided
      const matchesGrade = checkGradeMatch(p.grado || '', grade || '');

      // Search term
      const pSeccion = p.customFields?.seccion || 'A';
      const pFecha = p.customFields?.fecha || p.creado_en || '';
      const matchesSearch = searchTerm === '' ||
        pSeccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pFecha.includes(searchTerm) ||
        p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.conceptual || '').toLowerCase().includes(searchTerm.toLowerCase());

      return isDaily && matchesSubject && matchesGrade && matchesSearch;
    }).sort((a, b) => new Date(b.creado_en || 0).getTime() - new Date(a.creado_en || 0).getTime()); // Newest first
  }, [plannings, subjectId, grade, searchTerm]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleConfirm = () => {
    const selected = plannings.filter(p => selectedIds.has(p.id));
    onSelectPlans(selected);
    onClose();
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredPlans.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPlans.map(p => p.id)));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-150 dark:border-zinc-800 shrink-0">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Seleccionar Planificaciones Diarias
            </h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-650 text-white flex items-center justify-center cursor-pointer transition-all shadow-md border-none active:scale-95 outline-hidden"
            >
              <X size={14} className="stroke-[3]" />
            </button>
          </div>

          {/* Search & Bulk Select Actions */}
          <div className="mb-4 flex gap-3 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por tema, fecha o sección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 h-10 text-xs border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-neutral-900 dark:text-neutral-100 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-hidden transition-all shadow-xs"
              />
            </div>
            {filteredPlans.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className={`px-4 h-10 text-xs font-bold border rounded-xl transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                  selectedIds.size === filteredPlans.length
                    ? 'bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-955/20 dark:hover:bg-rose-900/30 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-350'
                    : 'bg-indigo-50/45 hover:bg-indigo-100/50 dark:bg-indigo-955/15 border-indigo-200/50 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-350'
                }`}
              >
                {selectedIds.size === filteredPlans.length ? (
                  <>
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    Deseleccionar todas
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    Seleccionar todas
                  </>
                )}
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 rounded-xl text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Table/List Area */}
          <div className="flex-1 overflow-y-auto border rounded-2xl border-neutral-100 dark:border-zinc-800/80 bg-neutral-50/30 dark:bg-zinc-950/20 min-h-[200px] relative">
            {isLoading ? (
              <div className="absolute inset-0 bg-white/85 dark:bg-zinc-900/85 flex flex-col items-center justify-center z-20 p-8 text-center">
                <Loader2 className="w-10 h-10 text-indigo-650 animate-spin mb-4" />
                <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-250">Sincronizando con D1...</h4>
                <p className="text-[11px] text-neutral-500 mt-1 max-w-[200px]">Cargando tus planificaciones guardadas de primer grado.</p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-neutral-500 p-8 text-center">
                <Filter className="w-10 h-10 mb-3 text-neutral-300 dark:text-zinc-700" />
                <p className="font-bold text-sm text-neutral-800 dark:text-zinc-250">No hay planificaciones diarias</p>
                <p className="text-[11px] text-neutral-400 dark:text-zinc-500 mt-1 max-w-sm">
                  No se encontraron planificaciones registradas del tipo Diaria para {getSubjectDisplayName(subjectId)} y {getGradeDisplayName(grade)}.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100/80 dark:bg-zinc-850/80 sticky top-0 z-10 border-b border-neutral-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-bold text-neutral-500 dark:text-zinc-400 w-10 text-center"></th>
                    <th className="px-4 py-3 font-bold text-neutral-500 dark:text-zinc-400 w-28">Fecha</th>
                    <th className="px-4 py-3 font-bold text-neutral-500 dark:text-zinc-400">Tema / Intención</th>
                    <th className="px-4 py-3 font-bold text-neutral-500 dark:text-zinc-400 w-24 text-center">Sección</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-150/60 dark:divide-zinc-800/60">
                  {filteredPlans.map((plan) => {
                    const isSelected = selectedIds.has(plan.id);
                    const dateVal = plan.customFields?.fecha || plan.creado_en?.split('T')[0] || 'N/A';
                    return (
                      <tr
                        key={plan.id}
                        onClick={() => toggleSelection(plan.id)}
                        className={`
                          cursor-pointer transition-all duration-150 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10
                          ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/15' : 'bg-white dark:bg-zinc-900'}
                        `}
                      >
                        <td className="px-4 py-3 text-center">
                          {isSelected ? (
                            <CheckCircle2 className="w-4.5 h-4.5 text-indigo-600 mx-auto" />
                          ) : (
                            <Circle className="w-4.5 h-4.5 text-neutral-300 dark:text-zinc-700 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-zinc-400 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {dateVal}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">
                            {plan.titulo || plan.customFields?.secuencia || 'Sin tema'}
                          </div>
                          <div className="text-neutral-500 dark:text-zinc-450 text-[10.5px] line-clamp-1 mt-0.5 font-medium">
                            {plan.intencion_pedagogica || 'Sin intención definida'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-zinc-400 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-350 border border-neutral-200/40 dark:border-zinc-700/40">
                            {plan.customFields?.seccion || 'A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-150 dark:border-zinc-800 shrink-0">
            <span className="text-xs font-bold text-neutral-500 dark:text-zinc-450">
              {selectedIds.size} planificaciones seleccionadas
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-955/20 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-350 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={selectedIds.size === 0}
                className="px-6 py-2 bg-indigo-50/70 hover:bg-indigo-100/70 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-px flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sintetizar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
