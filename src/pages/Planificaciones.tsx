import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2,
  AlertTriangle,
  Eye,
  Edit3,
  Printer,
  Calendar,
  ChevronDown,
  Check,
  Pencil,
  BookText,
  Ruler,
  Globe,
  Leaf,
  Palette,
  Dumbbell,
  Heart,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  User,
  School,
  Hash,
  Clock,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../lib/useRequireAuth';
import { getLessonPlans, deleteLessonPlan, LessonPlan } from '../lib/storage';
import { fetchPlannings, deletePlanning } from '../lib/services/plannings';
import { toast, Toaster } from 'sonner';
import LoaderProgressiveBar from '../components/ui/loader-progressive-bar';

const SUBJECT_ICON_MAP: Record<string, React.ReactNode> = {
  'lengua': <BookText className="h-4 w-4 text-blue-500" />,
  'matem': <Ruler className="h-4 w-4 text-rose-500" />,
  'sociales': <Globe className="h-4 w-4 text-amber-500" />,
  'naturales': <Leaf className="h-4 w-4 text-emerald-500" />,
  'ciencia': <Leaf className="h-4 w-4 text-emerald-500" />,
  'art': <Palette className="h-4 w-4 text-violet-500" />,
  'fisic': <Dumbbell className="h-4 w-4 text-cyan-500" />,
  'físic': <Dumbbell className="h-4 w-4 text-cyan-500" />,
  'humana': <Heart className="h-4 w-4 text-pink-500" />,
  'religi': <Heart className="h-4 w-4 text-pink-500" />,
};

const getSubjectIcon = (subjectName: string = '') => {
  const clean = subjectName.toLowerCase();
  for (const [key, icon] of Object.entries(SUBJECT_ICON_MAP)) {
    if (clean.includes(key)) return icon;
  }
  return <BookOpen className="h-4 w-4 text-slate-500" />;
};

export default function Planificaciones() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [dateDesde, setDateDesde] = useState('');
  const [dateHasta, setDateHasta] = useState('');
  const [curriculumFilter, setCurriculumFilter] = useState('Todos');
  const [schoolFilter, setSchoolFilter] = useState('Todas');
  const [planToDelete, setPlanToDelete] = useState<LessonPlan | null>(null);

  // Dropdown open/close states
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCurriculumDropdown, setShowCurriculumDropdown] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

  const getStatusLabel = (status: string) => {
    if (status === 'Todos') return 'Todos los estados';
    if (status === 'Borrador') return 'Borradores';
    if (status === 'En Redacción') return 'En Redacción';
    if (status === 'Finalizado') return 'Finalizados';
    return status;
  };

  const [loading, setLoading] = useState(true);

  const userId = user?.id;

  useEffect(() => {
    async function loadPlans() {
      if (!userId) return;
      setLoading(true);

      // 1. Always load local plans first (instant display)
      const localPlans = getLessonPlans(userId);
      setPlans(localPlans);

      // 2. Try fetching from D1 in background
      try {
        const dbPlans = await fetchPlannings(userId);

        if (dbPlans.length > 0) {
          // D1 has data — merge with local (D1 wins on conflicts)
          const dbIds = new Set(dbPlans.map(p => p.id));
          const localOnly = localPlans.filter(p => !dbIds.has(p.id));

          // Push any local-only plans up to D1
          for (const lp of localOnly) {
            try {
              const saved = await (await import('../lib/services/plannings')).savePlanning(lp);
              lp.id = saved.id; // Update ID to generated UUID
            } catch (e) {
              console.warn("Could not push local plan to D1:", lp.id, e);
            }
          }

          const merged = [...dbPlans, ...localOnly];
          setPlans(merged);
          localStorage.setItem("plx:lesson_plans", JSON.stringify(merged));
        } else if (localPlans.length > 0) {
          // D1 is empty but we have local data → push UP to D1
          console.log(`[Planificaciones] D1 vacío, subiendo ${localPlans.length} planificaciones locales...`);
          const uploadedPlans: LessonPlan[] = [];
          for (const lp of localPlans) {
            try {
              const saved = await (await import('../lib/services/plannings')).savePlanning(lp);
              uploadedPlans.push(saved);
            } catch (e) {
              console.warn("Could not push local plan to D1:", lp.id, e);
              uploadedPlans.push(lp);
            }
          }
          setPlans(uploadedPlans);
          localStorage.setItem("plx:lesson_plans", JSON.stringify(uploadedPlans));
        }
        // If both are empty, plans stays []
      } catch (err) {
        console.error("Error loading plans from D1, showing local data:", err);
        // Keep the local plans already set above
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, [userId]);

  const handleDeletePlan = async (id: string) => {
    try {
      await deletePlanning(id);
      deleteLessonPlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      setPlanToDelete(null);
      toast.success('Planificación eliminada correctamente de Supabase');
    } catch (err) {
      console.error("Error deleting plan from Supabase:", err);
      deleteLessonPlan(id);
      if (user) {
        setPlans(getLessonPlans(user.id));
      }
      setPlanToDelete(null);
      toast.success('Planificación eliminada de la caché local');
    }
  };

  const getCompletionPercentage = (p: LessonPlan) => {
    let score = 0;
    let total = 7;
    if (p.intencion_pedagogica) score++;
    if (p.conceptual) score++;
    if (p.procedimental) score++;
    if (p.actitudinal) score++;
    if (p.momentos?.inicio) score++;
    if (p.momentos?.desarrollo) score++;
    if (p.momentos?.cierre) score++;
    return Math.round((score / total) * 100);
  };

  const formatGrado = (grado: string, nivel: string) => {
    if (!grado) return 'Primaria';
    
    let clean = grado.toLowerCase()
      .replace('primaria-', '')
      .replace('secundaria-', '')
      .replace('inicial-', '')
      .replace('-grado', '')
      .trim();

    if (clean === '1' || clean === '1ro' || clean === 'primero') clean = '1ro.';
    else if (clean === '2' || clean === '2do' || clean === 'segundo') clean = '2do.';
    else if (clean === '3' || clean === '3ro' || clean === '3er' || clean === 'tercero') clean = '3ro.';
    else if (clean === '4' || clean === '4to' || clean === 'cuarto') clean = '4to.';
    else if (clean === '5' || clean === '5to' || clean === 'quinto') clean = '5to.';
    else if (clean === '6' || clean === '6to' || clean === 'sexto') clean = '6to.';
    else {
      const match = clean.match(/^(\d+)(st|nd|rd|th|ro|do|er|to|ero|ra)$/);
      if (match) {
        let suffix = match[2];
        if (suffix === 'er' || suffix === 'ero') suffix = 'ro';
        clean = `${match[1]}${suffix}.`;
      } else {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      }
    }

    const n = (nivel || 'primaria').toLowerCase();
    const nivelStr = n === 'primaria' ? 'Primaria' : n === 'secundaria' ? 'Secundaria' : 'Inicial';

    return `${clean} (${nivelStr})`;
  };

  // Get unique subjects
  const uniqueSubjects = Array.from(new Set(plans.map(p => p.asignatura).filter(Boolean)));

  // Get unique schools
  const uniqueSchools = Array.from(
    new Set(
      plans.map(p => p.customFields?.centro_educativo || user?.colegio || 'Centro Educativo').filter(Boolean)
    )
  );

  const filteredPlans = plans.filter(p => {
    const progress = getCompletionPercentage(p);
    let status = 'Borrador';
    if (progress >= 90) status = 'Finalizado';
    else if (progress > 0) status = 'En Redacción';

    const pSeccion = p.customFields?.seccion || 'A';
    const matchesSearch = searchQuery === '' || 
      p.asignatura?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.conceptual || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.customFields?.secuencia && typeof p.customFields.secuencia === 'string' && p.customFields.secuencia.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pSeccion.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = subjectFilter === 'Todas' || p.asignatura === subjectFilter;
    const matchesStatus = statusFilter === 'Todos' || status === statusFilter;

    const createdDate = p.creado_en ? new Date(p.creado_en) : new Date();
    const matchesDesde = !dateDesde || createdDate >= new Date(dateDesde);
    const matchesHasta = !dateHasta || createdDate <= new Date(dateHasta + 'T23:59:59');

    const pPlanningType = p.customFields?.planningType || (p.tipo === 'CON_BASE' ? 'DIARIA' : 'UNIDAD');
    const matchesCurriculum = curriculumFilter === 'Todos' || 
      (curriculumFilter === 'CON_BASE' && p.tipo === 'CON_BASE') ||
      (curriculumFilter === 'CURRICULAR' && p.tipo === 'CURRICULAR') ||
      (curriculumFilter === 'DIARIA' && pPlanningType === 'DIARIA') ||
      (curriculumFilter === 'UNIDAD' && pPlanningType === 'UNIDAD');

    const pSchool = p.customFields?.centro_educativo || user?.colegio || 'Centro Educativo';
    const matchesSchool = schoolFilter === 'Todas' || pSchool === schoolFilter;

    return matchesSearch && matchesSubject && matchesStatus && matchesDesde && matchesHasta && matchesCurriculum && matchesSchool;
  });

  if (!user) return null;

  return (
    <main className="flex-1 flex flex-col pt-10 xl:pt-[44px] px-6 md:px-[60px] xl:px-16 w-full min-w-0 pb-16">
      <Toaster position="top-center" richColors />

      {/* Header with Title and Button on Right */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight leading-[1] text-[#1B1B1B] dark:text-white">
            Mis Planificaciones
          </h1>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
            Gestiona y organiza tu histórico de lecciones
          </p>
        </div>
        <button
          onClick={() => navigate('/planificaciones/nueva')}
          className="bg-brand-primary hover:bg-brand-hover text-white border border-transparent rounded-full px-4 py-2 font-bold text-[13px] shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none shrink-0"
        >
          <Pencil size={14} /> Crear Planificación
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-[20px] p-6 shadow-sm mb-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">Buscar</label>
            <input 
              type="text"
              placeholder="Buscar por asignatura, secuencia o sección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
            />
          </div>
          {/* Asignatura */}
          <div className="space-y-1 relative select-none">
            <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">Asignatura</label>
            <div
              onClick={() => {
                setShowSubjectDropdown(!showSubjectDropdown);
                setShowStatusDropdown(false);
                setShowCurriculumDropdown(false);
                setShowSchoolDropdown(false);
              }}
              className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
            >
              <span className="truncate flex items-center gap-1.5">
                {subjectFilter !== 'Todas' && getSubjectIcon(subjectFilter)}
                {subjectFilter === 'Todas' ? 'Todas las asignaturas' : subjectFilter}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showSubjectDropdown ? 'rotate-180' : ''}`} />
            </div>
            {showSubjectDropdown && (
              <>
                <div className="fixed inset-0 z-45" onClick={() => setShowSubjectDropdown(false)} />
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left rounded-lg">
                  <div className="space-y-0.5 max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSubjectFilter("Todas");
                        setShowSubjectDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                        subjectFilter === "Todas"
                          ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                          : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <span>Todas las asignaturas</span>
                      {subjectFilter === "Todas" && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                    </button>
                    {uniqueSubjects.map(sub => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          setSubjectFilter(sub);
                          setShowSubjectDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                          subjectFilter === sub
                            ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                            : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {getSubjectIcon(sub)}
                          <span>{sub}</span>
                        </span>
                        {subjectFilter === sub && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Estado */}
          <div className="space-y-1 relative select-none">
            <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">Estado</label>
            <div
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowSubjectDropdown(false);
                setShowCurriculumDropdown(false);
                setShowSchoolDropdown(false);
              }}
              className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-205 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
            >
              <span className="truncate">{getStatusLabel(statusFilter)}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
            </div>
            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-45" onClick={() => setShowStatusDropdown(false)} />
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left rounded-lg">
                  <div className="space-y-0.5">
                    {[
                      { value: 'Todos', label: 'Todos los estados' },
                      { value: 'Borrador', label: 'Borradores' },
                      { value: 'En Redacción', label: 'En Redacción' },
                      { value: 'Finalizado', label: 'Finalizados' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                          statusFilter === opt.value
                            ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                            : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {statusFilter === opt.value && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Desde */}
          <div className="space-y-1">
            <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">Desde</label>
            <input 
              type="date"
              value={dateDesde}
              onChange={(e) => setDateDesde(e.target.value)}
              className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-205 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
            />
          </div>
          {/* Hasta */}
          <div className="space-y-1">
            <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">Hasta</label>
            <input 
              type="date"
              value={dateHasta}
              onChange={(e) => setDateHasta(e.target.value)}
              className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-205 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
            />
          </div>
          {/* Tipo de Currículo */}
          <div className="space-y-1 relative select-none">
            <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">Tipo de Currículo</label>
            <div
              onClick={() => {
                setShowCurriculumDropdown(!showCurriculumDropdown);
                setShowSubjectDropdown(false);
                setShowStatusDropdown(false);
                setShowSchoolDropdown(false);
              }}
              className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-205 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
            >
              <span className="truncate">
                {curriculumFilter === 'Todos' && 'Todos'}
                {curriculumFilter === 'CON_BASE' && 'Con Base'}
                {curriculumFilter === 'CURRICULAR' && 'Adecuación Curricular'}
                {curriculumFilter === 'DIARIA' && 'Diaria'}
                {curriculumFilter === 'UNIDAD' && 'Unidad'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showCurriculumDropdown ? 'rotate-180' : ''}`} />
            </div>
            {showCurriculumDropdown && (
              <>
                <div className="fixed inset-0 z-45" onClick={() => setShowCurriculumDropdown(false)} />
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left rounded-lg">
                  <div className="space-y-0.5">
                    {[
                      { value: 'Todos', label: 'Todos' },
                      { value: 'CON_BASE', label: 'Con Base' },
                      { value: 'CURRICULAR', label: 'Adecuación Curricular' },
                      { value: 'DIARIA', label: 'Diaria' },
                      { value: 'UNIDAD', label: 'Unidad' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setCurriculumFilter(opt.value);
                          setShowCurriculumDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                          curriculumFilter === opt.value
                            ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                            : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {curriculumFilter === opt.value && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Centro Educativo */}
          <div className="space-y-1 relative select-none">
            <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">Centro Educativo</label>
            <div
              onClick={() => {
                setShowSchoolDropdown(!showSchoolDropdown);
                setShowSubjectDropdown(false);
                setShowStatusDropdown(false);
                setShowCurriculumDropdown(false);
              }}
              className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-205 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
            >
              <span className="truncate flex items-center gap-1.5">
                <School className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
                {schoolFilter === 'Todas' ? 'Todas las escuelas' : schoolFilter}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showSchoolDropdown ? 'rotate-180' : ''}`} />
            </div>
            {showSchoolDropdown && (
              <>
                <div className="fixed inset-0 z-45" onClick={() => setShowSchoolDropdown(false)} />
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left rounded-lg">
                  <div className="space-y-0.5 max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSchoolFilter("Todas");
                        setShowSchoolDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                        schoolFilter === "Todas"
                          ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                          : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                      }`}
                      >
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-slate-500 dark:text-zinc-405 shrink-0" />
                        <span>Todas las escuelas</span>
                      </div>
                      {schoolFilter === "Todas" && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                    </button>
                    {uniqueSchools.map(sch => (
                      <button
                        key={sch}
                        type="button"
                        onClick={() => {
                          setSchoolFilter(sch);
                          setShowSchoolDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                          schoolFilter === sch
                            ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                            : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4 text-slate-500 dark:text-zinc-405 shrink-0" />
                          <span>{sch}</span>
                        </div>
                        {schoolFilter === sch && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results summary label */}
      <div className="text-left mb-4 px-1 select-none">
        <p className="text-xs font-black text-slate-700 dark:text-zinc-350">
          {loading ? 'Cargando planificaciones...' : `Mostrando ${filteredPlans.length} de ${plans.length} planificaciones`}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <LoaderProgressiveBar text="Cargando tus planificaciones" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlans.map(plan => {
          const progress = getCompletionPercentage(plan);
          let statusText = 'Borrador';
          let statusColor = 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';
          if (progress >= 90) {
            statusText = 'Finalizado';
            statusColor = 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white';
          } else if (progress > 0) {
            statusText = 'En Redacción';
            statusColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400';
          }

          const isSecundaria = (plan.nivel || '').toLowerCase() === 'secundaria';
          const isInicial = (plan.nivel || '').toLowerCase() === 'inicial';
          const gradeBadgeColor = isSecundaria 
            ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/20 dark:text-cyan-400'
            : isInicial
            ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/20 dark:text-orange-400'
            : 'bg-purple-100 text-purple-850 dark:bg-purple-950/20 dark:text-purple-400';

          const formattedGrade = formatGrado(plan.grado, plan.nivel);
          const pSeccion = plan.customFields?.seccion || 'A';
          const pFecha = plan.customFields?.fecha || new Date(plan.creado_en).toLocaleDateString('es-DO');

          // Determine the sequence name to display
          let sequenceName = plan.titulo;
          if (plan.customFields?.secuencia && typeof plan.customFields.secuencia === 'string') {
            sequenceName = plan.customFields.secuencia;
          } else if (plan.conceptual && plan.conceptual.length < 100 && (plan.titulo || '').toLowerCase().includes('actividad')) {
            sequenceName = plan.conceptual;
          } else if (plan.secuencia_id) {
            const sequenceMap: Record<string, string> = {
              'seq-1-lengua-1ro': 'Tarjeta de identidad',
              'seq-2-lengua-1ro': 'El letrero',
              'seq-1769203335283': 'El letrero',
              'seq-3-lengua-1ro': 'La lista de compras',
              'seq-1769203357400': 'La lista de compras',
              'seq-4-lengua-1ro': 'El mensaje corto',
              'seq-1769203375800': 'El mensaje corto',
              'seq-5-lengua-1ro': 'La noticia',
              'seq-1769203394200': 'La noticia',
              'seq-6-lengua-1ro': 'El cuento',
              'seq-1769203415600': 'El cuento',
              'seq-leng-1': 'La conversación y el diálogo cotidiano',
              'seq-leng-2': 'El letrero y la identificación',
              'seq-leng-3': 'La receta y su estructura',
              'seq-mat-1': 'Numeración y valor posicional (hasta 999)',
              'seq-mat-2': 'Suma y resta de números naturales',
              'seq-mat-3': 'Figuras y cuerpos geométricos',
              'seq-nat-1': 'El cuerpo humano y sus sistemas',
              'seq-nat-2': 'Estados de la materia',
            };
            if (sequenceMap[plan.secuencia_id]) {
              sequenceName = sequenceMap[plan.secuencia_id];
            }
          }

          const pPlanningType = plan.customFields?.planningType || (plan.tipo === 'CON_BASE' ? 'DIARIA' : 'UNIDAD');
          const displayPlanningType = pPlanningType === 'UNIDAD' ? 'Unidad' : 'Diaria';

          return (
            <div 
              key={plan.id}
              onClick={() => navigate(`/planificacion/preview?id=${plan.id}&from=planificaciones`)}
              className="cursor-pointer bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:border-slate-350 dark:hover:border-zinc-700 transition-all text-left flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                {/* Header Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[15px] font-black text-slate-800 dark:text-white mr-2">
                    {getSubjectIcon((plan as any).asignatura_id || plan.asignatura)}
                    {plan.asignatura}
                  </span>
                  
                  {/* Status Badge */}
                  {statusText !== 'En Redacción' && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColor}`}>
                      {statusText === 'Finalizado' ? (
                        <CheckCircle2 size={10} className="stroke-[3]" />
                      ) : (
                        <BookOpen size={10} className="stroke-[3]" />
                      )}
                      {statusText}
                    </span>
                  )}

                  {/* Grade Badge */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${gradeBadgeColor}`}>
                    <GraduationCap size={10} className="stroke-[3]" />
                    {formattedGrade}
                  </span>

                  {/* School Badge */}
                  {user.colegio && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
                      <School size={10} className="stroke-[3]" />
                      {user.colegio}
                    </span>
                  )}
                </div>

                {/* Middle Row */}
                {sequenceName && (
                  <div className="mt-1">
                    <div className="inline-flex bg-neutral-50 dark:bg-zinc-800/80 border border-neutral-200 dark:border-zinc-700/80 px-3 py-1 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200">
                      <span className="text-slate-900 dark:text-white mr-1.5 font-bold">Secuencia:</span> {sequenceName}
                    </div>
                  </div>
                )}

                {/* Bottom Row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 pt-1">
                  <span className="flex items-center gap-1">
                    <FileText size={12} className="text-slate-800 dark:text-zinc-300 shrink-0" />
                    <span><strong className="font-bold text-slate-900 dark:text-white mr-1">Tipo:</strong> {displayPlanningType}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash size={12} className="text-slate-800 dark:text-zinc-300 shrink-0" />
                    <span><strong className="font-bold text-slate-900 dark:text-white mr-1">Sección:</strong> {pSeccion}</span>
                  </span>
                  <span className="flex items-center gap-1 select-text">
                    <Calendar size={12} className="text-slate-800 dark:text-zinc-300 shrink-0" /> 
                    <span><strong className="font-bold text-slate-900 dark:text-white mr-1">Fecha:</strong> {pFecha}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-800 dark:text-zinc-300 shrink-0" />
                    <span><strong className="font-bold text-slate-900 dark:text-white mr-1">Creado:</strong> {new Date(plan.creado_en).toLocaleDateString('es-DO')}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons on Right */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {/* Ver */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/planificacion/preview?id=${plan.id}&from=planificaciones`);
                  }}
                  title="Ver detalles"
                  className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 transition cursor-pointer border-none shadow-xs"
                >
                  <Eye className="h-4 w-4" />
                </button>

                {/* Imprimir */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/planificacion/preview?id=${plan.id}`, '_blank');
                  }}
                  title="Imprimir / PDF"
                  className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 transition cursor-pointer border-none shadow-xs"
                >
                  <Printer className="h-4 w-4" />
                </button>

                {/* Eliminar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlanToDelete(plan);
                  }}
                  title="Eliminar"
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition cursor-pointer border-none shadow-xs"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredPlans.length === 0 && (
          <div className="py-16 text-center text-slate-450 dark:text-zinc-500 font-bold border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[32px] bg-white dark:bg-zinc-900/30">
            No se encontraron planificaciones escolares creadas. ¡Empieza creando una nueva!
          </div>
        )}
        </div>
      )}

      {/* DELETE CONFIRMATION PLAN MODAL */}
      {planToDelete && (
        <div 
          onClick={() => setPlanToDelete(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center animate-in zoom-in-95 duration-200"
          >
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 rotate-45 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Eliminar Planificación?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Esta acción eliminará de forma permanente la planificación <span className="font-extrabold text-neutral-900 dark:text-neutral-100">{planToDelete.titulo}</span> de su historial local. ¿Desea continuar?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeletePlan(planToDelete.id)}
                className="bg-[#D31B32] hover:bg-[#B3172A] text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
