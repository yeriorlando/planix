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
  FileText,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../lib/useRequireAuth';
import { getLessonPlans, deleteLessonPlan, LessonPlan } from '../lib/storage';
import { fetchPlannings, deletePlanning } from '../lib/services/plannings';
import { toast, Toaster } from 'sonner';
import LoaderProgressiveBar from '../components/ui/loader-progressive-bar';
import { DatePicker } from '../components/ui/heroui-date-picker';

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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

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
  const uniqueSubjects = Array.from(new Set(plans.map(p => p.asignatura).filter(Boolean))) as string[];

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

  // Reset to page 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, subjectFilter, statusFilter, dateDesde, dateHasta, curriculumFilter, schoolFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPlans = filteredPlans.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleExportAllPlans = () => {
    if (plans.length === 0) {
      toast.info('No tienes planificaciones creadas para descargar.');
      return;
    }

    toast.success(`Generando PDF de ${plans.length} planificaciones con formato PrintLayout...`);

    // Remove existing iframe if any
    const existingFrame = document.getElementById('plx-batch-print-iframe');
    if (existingFrame) existingFrame.remove();

    // Create invisible iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'plx-batch-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      toast.error('Error al preparar el módulo de impresión.');
      return;
    }

    const plansHtml = plans.map((plan, index) => {
      const rawContent = (plan as any).content || {};
      const fd = rawContent.formData || plan.customFields || {};

      const teacher = fd.docente || (plan as any).docente || user?.nombre || 'Docente';
      const school = fd.centro_educativo || plan.customFields?.centro_educativo || user?.colegio || 'Centro Educativo';
      const gradeFormatted = formatGrado(plan.grado || fd.grado, plan.nivel || fd.nivel);
      const seccion = fd.seccion || plan.customFields?.seccion || 'A';
      const subject = plan.asignatura || fd.area || fd.asignatura || 'Asignatura';
      
      const secuenciaOrTitulo = fd.secuencia || plan.customFields?.secuencia || plan.titulo || 'Planificación';
      const fecha = fd.fecha || plan.customFields?.fecha || (plan.creado_en ? new Date(plan.creado_en).toLocaleDateString('es-DO') : '---');

      const pType = fd.planningType || plan.tipo || (plan.tipo === 'CON_BASE' ? 'DIARIA' : 'UNIDAD');
      const isUnit = pType === 'UNIDAD';
      const formTitle = `${subject.toUpperCase()} - PLANIFICACIÓN ${isUnit ? 'UNIDAD' : (plan.tipo === 'CON_BASE' ? 'CON BASE' : 'CURRICULAR')}`;

      // Competencias Fundamentales
      let compFund: string[] = [];
      if (Array.isArray(fd.competencias)) compFund = fd.competencias;
      else if (Array.isArray(plan.customFields?.competencias)) compFund = plan.customFields.competencias;
      else {
        compFund = [plan.conceptual, plan.procedimental, plan.actitudinal].filter(Boolean) as string[];
      }
      const compFundHtml = compFund.length > 0 
        ? compFund.map(c => `<div>• ${c}</div>`).join('') 
        : '<div>• Competencia Comunicativa</div><div>• Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica</div><div>• Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud</div>';

      // Competencias Específicas
      let compEsp: string[] = [];
      if (Array.isArray(fd.competencias_especificas)) compEsp = fd.competencias_especificas;
      else if (Array.isArray(plan.customFields?.competencias_especificas)) compEsp = plan.customFields.competencias_especificas;
      const compEspHtml = compEsp.length > 0 
        ? compEsp.map(c => `<div>• ${c}</div>`).join('') 
        : (plan.conceptual ? `<div>• ${plan.conceptual}</div>` : '<div>• Selecciona las competencias y edita la descripción específica del grado.</div>');

      // Intencion Pedagogica
      const intencion = plan.intencion_pedagogica || fd.intencion_pedagogica || plan.customFields?.intencion_pedagogica || 'Promover experiencias significativas que favorezcan el desarrollo de competencias en los estudiantes.';

      // Estrategia
      const estrategia = fd.estrategia || plan.customFields?.estrategia || '';

      // Momentos
      const mArray = fd.momentos || plan.customFields?.momentos || [];
      let inicioDesc = plan.momentos?.inicio || '---';
      let inicioTiempo = '15 minutos';
      let inicioRec = plan.recursos?.join(', ') || 'Recursos diversos.';

      let desarrolloDesc = plan.momentos?.desarrollo || '---';
      let desarrolloTiempo = '45 minutos';
      let desarrolloRec = plan.recursos?.join(', ') || 'Recursos diversos.';

      let cierreDesc = plan.momentos?.cierre || '---';
      let cierreTiempo = '10 minutos';
      let cierreRec = plan.recursos?.join(', ') || 'Recursos diversos.';

      const formatTime = (t: string) => {
        if (!t) return '---';
        const cleaned = t.toString().trim();
        if (/^\d+$/.test(cleaned)) return `${cleaned} minutos`;
        return cleaned;
      };

      if (Array.isArray(mArray) && mArray.length >= 3) {
        inicioDesc = mArray[0].descripcion || mArray[0].description || inicioDesc;
        inicioTiempo = formatTime(mArray[0].tiempo || inicioTiempo);
        inicioRec = mArray[0].recursos || inicioRec;

        desarrolloDesc = mArray[1].descripcion || mArray[1].description || desarrolloDesc;
        desarrolloTiempo = formatTime(mArray[1].tiempo || desarrolloTiempo);
        desarrolloRec = mArray[1].recursos || desarrolloRec;

        cierreDesc = mArray[2].descripcion || mArray[2].description || cierreDesc;
        cierreTiempo = formatTime(mArray[2].tiempo || cierreTiempo);
        cierreRec = mArray[2].recursos || cierreRec;
      } else {
        inicioTiempo = formatTime(inicioTiempo);
        desarrolloTiempo = formatTime(desarrolloTiempo);
        cierreTiempo = formatTime(cierreTiempo);
      }

      // Metacognicion, Evaluacion, Tarea
      const metacognicion = fd.metacognicion || plan.customFields?.metacognicion || 'Reflexión guiada sobre lo aprendido durante el desarrollo de la lección.';
      const evaluacion = plan.evaluacion || fd.evaluacion || plan.customFields?.evaluacion || 'Evaluación formativa a través de observación continua y participación activa.';
      const tarea = plan.tarea || fd.tarea_hogar || plan.customFields?.tarea_hogar || 'Repasar los conceptos tratados en clase.';

      return `
        <div class="plan-card-wrapper ${index > 0 ? 'page-break' : ''}">
          <div class="pl-header-title">${formTitle}</div>

          <div class="pl-grid-4">
            <div class="pl-cell">
              <span class="pl-label">CENTRO EDUCATIVO:</span>
              <div class="pl-val">${school}</div>
            </div>
            <div class="pl-cell">
              <span class="pl-label">DOCENTE:</span>
              <div class="pl-val">${teacher}</div>
            </div>
            <div class="pl-cell">
              <span class="pl-label">GRADO:</span>
              <div class="pl-val">${gradeFormatted}</div>
            </div>
            <div class="pl-cell pl-cell-last">
              <span class="pl-label">SECCIÓN:</span>
              <div class="pl-val">${seccion}</div>
            </div>
          </div>

          <div class="pl-grid-3">
            <div class="pl-cell">
              <span class="pl-label">ÁREA:</span>
              <div class="pl-val">${subject}</div>
            </div>
            <div class="pl-cell">
              <span class="pl-label">${isUnit ? 'UNIDAD:' : 'SECUENCIA:'}</span>
              <div class="pl-val">${secuenciaOrTitulo}</div>
            </div>
            <div class="pl-cell pl-cell-last">
              <span class="pl-label">FECHA:</span>
              <div class="pl-val">${fecha}</div>
            </div>
          </div>

          <div class="pl-section">
            <div class="pl-section-header">COMPETENCIAS FUNDAMENTALES:</div>
            <div class="pl-section-body">${compFundHtml}</div>
          </div>

          <div class="pl-section">
            <div class="pl-section-header">COMPETENCIAS ESPECÍFICAS:</div>
            <div class="pl-section-body">${compEspHtml}</div>
          </div>

          <div class="pl-section">
            <div class="pl-section-header">INTENCIÓN PEDAGÓGICA DEL DÍA:</div>
            <div class="pl-section-body">${intencion}</div>
          </div>

          ${estrategia ? `
          <div class="pl-section">
            <div class="pl-section-header">ESTRATEGIAS DE ENSEÑANZA Y APRENDIZAJE:</div>
            <div class="pl-section-body">${estrategia}</div>
          </div>` : ''}

          <table class="pl-momentos-table">
            <thead>
              <tr>
                <th style="width: 15%;">MOMENTOS</th>
                <th style="width: 55%;">ACTIVIDADES</th>
                <th style="width: 15%;">TIEMPO</th>
                <th style="width: 15%;">RECURSOS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="pl-moment-cell">INICIO</td>
                <td>${inicioDesc}</td>
                <td class="pl-time-cell">${inicioTiempo}</td>
                <td>${inicioRec}</td>
              </tr>
              <tr>
                <td class="pl-moment-cell">DESARROLLO</td>
                <td>${desarrolloDesc}</td>
                <td class="pl-time-cell">${desarrolloTiempo}</td>
                <td>${desarrolloRec}</td>
              </tr>
              <tr>
                <td class="pl-moment-cell">CIERRE</td>
                <td>${cierreDesc}</td>
                <td class="pl-time-cell">${cierreTiempo}</td>
                <td>${cierreRec}</td>
              </tr>
            </tbody>
          </table>

          <div class="pl-grid-3-bottom">
            <div class="pl-cell">
              <span class="pl-section-header-sm">METACOGNICIÓN (15 MIN):</span>
              <div class="pl-section-body-sm">${metacognicion}</div>
            </div>
            <div class="pl-cell">
              <span class="pl-section-header-sm">EVALUACIÓN FORMATIVA (15 MIN):</span>
              <div class="pl-section-body-sm">${evaluacion}</div>
            </div>
            <div class="pl-cell pl-cell-last">
              <span class="pl-section-header-sm">TAREA PARA EL HOGAR:</span>
              <div class="pl-section-body-sm">${tarea}</div>
            </div>
          </div>

          <div class="pl-footer">
            GENERADO POR PLANIX - PLATAFORMA DE GESTIÓN DOCENTE
          </div>
        </div>
      `;
    }).join('');

    const exportFileName = `Planix - ${user?.nombre || 'Docente'} - Planificaciones ${new Date().getFullYear()}`;
    const originalDocTitle = document.title;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${exportFileName}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          * { box-sizing: border-box; }
          html, body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            color: #1e293b;
            font-size: 11px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @media print {
            @page {
              size: landscape;
              margin: 8mm;
            }
            body {
              background-color: #fff !important;
              padding: 0 !important;
            }
            .plan-card-wrapper {
              box-shadow: none !important;
              margin-bottom: 0 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
          .page-break {
            page-break-before: always;
          }
          .plan-card-wrapper {
            background: #ffffff;
            border: 1px solid #52525b;
            margin-bottom: 24px;
            width: 100%;
            max-width: 297mm;
            margin-left: auto;
            margin-right: auto;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .pl-header-title {
            text-align: center;
            font-weight: 800;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px;
            border-bottom: 1px solid #52525b;
            background-color: #f8fafc;
            color: #0f172a;
          }
          .pl-grid-4 {
            display: grid;
            grid-template-columns: 3fr 3fr 2fr 2fr;
            border-bottom: 1px solid #52525b;
          }
          .pl-grid-3 {
            display: grid;
            grid-template-columns: 3fr 4fr 3fr;
            border-bottom: 1px solid #52525b;
          }
          .pl-cell {
            padding: 8px 10px;
            border-right: 1px solid #52525b;
          }
          .pl-cell-last {
            border-right: none;
          }
          .pl-label {
            display: block;
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 2px;
          }
          .pl-val {
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
          }
          .pl-section {
            padding: 10px;
            border-bottom: 1px solid #52525b;
          }
          .pl-section-header {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #0f172a;
            margin-bottom: 4px;
          }
          .pl-section-body {
            font-size: 11px;
            line-height: 1.5;
            color: #334155;
          }
          .pl-momentos-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 1px solid #52525b;
          }
          .pl-momentos-table th {
            border: 1px solid #52525b;
            padding: 8px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            text-align: center;
            background-color: #f8fafc;
            color: #0f172a;
          }
          .pl-momentos-table td {
            border: 1px solid #52525b;
            padding: 10px;
            font-size: 10.5px;
            vertical-align: top;
            line-height: 1.5;
            color: #334155;
          }
          .pl-moment-cell {
            font-weight: 800;
            text-align: center;
            vertical-align: middle !important;
            text-transform: uppercase;
            background-color: #f8fafc;
            color: #0f172a;
          }
          .pl-time-cell {
            font-weight: 700;
            text-align: center;
            vertical-align: middle !important;
            color: #0f172a;
          }
          .pl-grid-3-bottom {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            border-bottom: 1px solid #52525b;
          }
          .pl-section-header-sm {
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
            color: #0f172a;
            display: block;
            margin-bottom: 4px;
          }
          .pl-section-body-sm {
            font-size: 10.5px;
            line-height: 1.4;
            color: #334155;
          }
          .pl-footer {
            text-align: center;
            padding: 8px;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
            background-color: #f8fafc;
          }
        </style>
      </head>
      <body>
        ${plansHtml}
      </body>
      </html>
    `);
    doc.close();

    document.title = exportFileName;

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.title = originalDocTitle;
      }, 3000);
    }, 400);
  };

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
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportAllPlans}
            className="bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-full px-4 py-2 font-bold text-[13px] shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none"
            title="Descargar todas tus planificaciones en PDF"
          >
            <Download size={14} className="text-slate-600 dark:text-zinc-400" /> Descargar Todo (PDF)
          </button>
          <button
            onClick={() => navigate('/planificaciones/nueva')}
            className="bg-brand-primary hover:bg-brand-hover text-white border border-transparent rounded-full px-4 py-2 font-bold text-[13px] shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none shrink-0"
          >
            <Pencil size={14} /> Crear Planificación
          </button>
        </div>
      </div>

      {/* Information Banner about 3-month retention */}
      <div className="mb-6 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4 flex items-start gap-3 shadow-2xs text-left">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
            Política de Almacenamiento
          </h4>
          <p className="text-[12.5px] font-medium text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
            Las planificaciones creadas permanecen guardadas en la plataforma durante <strong>3 meses</strong>. Te recomendamos descargar o guardar copia en PDF de tus planificaciones importantes.
          </p>
        </div>
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
              className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
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
              className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
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
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-50 text-left rounded-lg">
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
              className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
            >
              <span className="truncate">{getStatusLabel(statusFilter)}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
            </div>
            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-45" onClick={() => setShowStatusDropdown(false)} />
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-50 text-left rounded-lg">
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
            <DatePicker 
              value={dateDesde}
              onChange={setDateDesde}
              direction="down"
            />
          </div>
          {/* Hasta */}
          <div className="space-y-1">
            <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">Hasta</label>
            <DatePicker 
              value={dateHasta}
              onChange={setDateHasta}
              direction="down"
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
              className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
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
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-50 text-left rounded-lg">
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
              className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
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
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-50 text-left rounded-lg">
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
          {loading ? (
            'Cargando planificaciones...'
          ) : filteredPlans.length === 0 ? (
            'Mostrando 0 de 0 planificaciones'
          ) : (
            `Mostrando ${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, filteredPlans.length)} de ${filteredPlans.length} planificaciones${plans.length !== filteredPlans.length ? ` (de ${plans.length} en total)` : ''}`
          )}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <LoaderProgressiveBar text="Cargando tus planificaciones" />
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedPlans.map(plan => {
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

                {/* Editar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/planificaciones/nueva?edit=${plan.id}`);
                  }}
                  title="Editar Planificación"
                  className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 transition cursor-pointer border-none shadow-xs"
                >
                  <Pencil className="h-4 w-4" />
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

      {/* Pagination Bar */}
      {!loading && filteredPlans.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800 select-none">
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
            Página <strong className="text-slate-800 dark:text-white font-extrabold">{currentPage}</strong> de <strong className="text-slate-800 dark:text-white font-extrabold">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs font-bold shadow-xs hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft size={15} /> Anterior
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  return Math.abs(page - currentPage) <= 1;
                })
                .map((page, idx, array) => {
                  const prevPage = array[idx - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <span className="px-1 text-slate-400 text-xs font-bold">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`min-w-[34px] h-9 px-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                          currentPage === page
                            ? 'bg-brand-primary text-white font-black shadow-xs'
                            : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs font-bold shadow-xs hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Siguiente <ChevronRight size={15} />
            </button>
          </div>
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
