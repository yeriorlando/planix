import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Printer, ArrowLeft, RefreshCw, Layers, Download, FileText,
  BookText, Ruler, Globe, Leaf, Palette, Dumbbell, Heart,
  Check, RotateCcw, Calendar, Send, Sparkles
} from 'lucide-react';
import { getLessonPlans, getCurrentUser } from '../lib/storage';
import PrintLayout from '../components/print/PrintLayout';
import { supabase } from '../lib/supabase';
import { mapPlanningFromDb } from '../lib/services/plannings';
import { requestD1 } from '../lib/services/d1Client';
import { toast, Toaster } from 'sonner';
import { generateCoordinatorChecklist, generateCoordinatorFeedback } from '../lib/services/aiService';

export default function VistaPreviaCoordinador() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('id');

  const [formData, setFormData] = useState<any>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [docenteId, setDocenteId] = useState<string>('');
  const [decision, setDecision] = useState<'Aprobar' | 'Devolver' | 'Reunión' | null>(null);
  const [checklist, setChecklist] = useState([
    { id: '1', label: 'Objetivos alineados al currículo dominicano', checked: false },
    { id: '2', label: 'Estrategias diferenciadas presentes', checked: false },
    { id: '3', label: 'Evaluación coherente con los objetivos', checked: false },
    { id: '4', label: 'Recursos disponibles en la institución', checked: false },
    { id: '5', label: 'Tiempos por actividad explícitos', checked: false },
    { id: '6', label: 'Contenidos e Indicadores articulados', checked: false },
    { id: '7', label: 'Competencias Específicas bien seleccionadas', checked: false },
    { id: '8', label: 'Secuencia metodológica clara (Inicio, Desarrollo, Cierre)', checked: false },
    { id: '9', label: 'Inclusión de atención a la diversidad', checked: false },
    { id: '10', label: 'Evidencias de aprendizaje definidas', checked: false }
  ]);
  const [comment, setComment] = useState('');
  const [sendingReview, setSendingReview] = useState(false);

  const [generatingChecklist, setGeneratingChecklist] = useState(false);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  const handleGenerateChecklistWithAI = async () => {
    setGeneratingChecklist(true);
    try {
      const aiCriterias = await generateCoordinatorChecklist(formData);
      if (aiCriterias && aiCriterias.length > 0) {
        setChecklist(aiCriterias.map((c, i) => ({ id: String(i + 1), label: c, checked: false })));
        toast.success('Checklist personalizado generado con IA.');
      } else {
        toast.error('No se obtuvieron criterios de la IA.');
      }
    } catch (err) {
      toast.error('No se pudo generar el checklist con IA.');
    } finally {
      setGeneratingChecklist(false);
    }
  };

  const handleGenerateFeedbackWithAI = async () => {
    if (!decision) {
      toast.error('Por favor, selecciona una decisión antes de generar la retroalimentación.');
      return;
    }
    setGeneratingFeedback(true);
    try {
      const aiFeedback = await generateCoordinatorFeedback(formData, checklist, decision);
      if (aiFeedback) {
        setComment(aiFeedback);
        toast.success('Retroalimentación sugerida con IA.');
      } else {
        toast.error('No se obtuvo retroalimentación de la IA.');
      }
    } catch (err) {
      toast.error('No se pudo sugerir la retroalimentación con IA.');
    } finally {
      setGeneratingFeedback(false);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();

    if (planId) {
      if (!user) {
        setError('Usuario no autenticado.');
        setLoading(false);
        return;
      }

      const loadPlan = async () => {
        try {
          // 1. Intentar cargar desde D1 (Cloudflare worker local o mock Supabase)
          const dbResults = await requestD1<any[]>(`/api/plannings?id=${planId}`);
          const data = dbResults && dbResults[0];
          
          if (data) {
            setDocenteId(data.user_id || '');
            const raw = typeof data.content === 'string' ? JSON.parse(data.content) : (data.content || {});
            
            if (raw.status === 'Aprobada') setDecision('Aprobar');
            else if (raw.status === 'Devuelto') setDecision('Devolver');
            else if (raw.status === 'Reunión') setDecision('Reunión');

            if (raw.reviewChecklist && Array.isArray(raw.reviewChecklist)) {
              setChecklist(raw.reviewChecklist);
            }
            if (raw.reviewComment) {
              setComment(raw.reviewComment);
            }

            let mappedData: any;

            if (raw.formData && typeof raw.formData === 'object') {
              // ====== PLANIX 2.0 FORMAT (content.formData) ======
              const fd = raw.formData;
              mappedData = {
                docente: fd.docente || raw.teacher || user.nombre,
                centro_educativo: fd.centro_educativo || user.colegio || 'Centro Educativo',
                grado: fd.grado || '',
                asignatura: fd.area || raw.subject || '',
                area: fd.area || raw.subject || '',
                seccion: fd.seccion || raw.section || 'A',
                fecha: fd.fecha || raw.date || new Date(data.created_at).toLocaleDateString('es-DO'),
                planningType: fd.planningType || raw.tipo || undefined,
                intencion_pedagogica: fd.intencion_pedagogica || '',
                competencias: fd.competencias || [],
                competencias_especificas: fd.competencias_especificas || [],
                bloque: fd.bloque || 'Bloque 1',
                actividad_titulo: fd.actividad_titulo || raw.sequence || data.title || '',
                momentos: fd.momentos || [],
                recursos_adicionales: fd.recursos_adicionales || '',
                metacognicion: fd.metacognicion || '',
                evaluacion: fd.evaluacion || '',
                tarea_hogar: fd.tarea_casa || fd.tarea_hogar || '',
                actividad_complementaria: fd.actividad_complementaria || '',
                secuencia: raw.sequence || fd.secuencia || '',
                indicador_logro: fd.indicador_logro || '',
                estrategia: fd.estrategia || '',
                ejes_transversales: fd.ejes_transversales || '',
                tema: fd.tema || '',
                subtema: fd.subtema || '',
                unidad: fd.unidad || '',
                recursos: fd.recursos || [],
                ...fd,
              };
            } else {
              // ====== PLANIX1 FORMAT (content = LessonPlan) ======
              const cf = raw.customFields || {};
              mappedData = {
                docente: user.nombre,
                centro_educativo: cf.centro_educativo || user.colegio || 'Centro Educativo',
                grado: raw.grado || '',
                asignatura: raw.asignatura || '',
                area: raw.asignatura || '',
                seccion: cf.seccion || 'A',
                fecha: cf.fecha || new Date(raw.creado_en || data.created_at).toLocaleDateString('es-DO'),
                planningType: raw.tipo || cf.planningType || undefined,
                intencion_pedagogica: raw.intencion_pedagogica || cf.intencion_pedagogica || '',
                competencias: cf.competencias || [raw.conceptual, raw.procedimental, raw.actitudinal].filter(Boolean),
                competencias_especificas: cf.competencias_especificas || [],
                bloque: cf.bloque || 'Bloque 1',
                actividad_titulo: raw.titulo || data.title || '',
                momentos: cf.momentos || [
                  { moment: 'Inicio', descripcion: raw.momentos?.inicio || '', tiempo: '15 minutos', recursos: (raw.recursos || []).join(', ') || 'Recursos diversos' },
                  { moment: 'Desarrollo', descripcion: raw.momentos?.desarrollo || '', tiempo: '45 minutos', recursos: (raw.recursos || []).join(', ') || 'Recursos diversos' },
                  { moment: 'Cierre', descripcion: raw.momentos?.cierre || '', tiempo: '10 minutos', recursos: (raw.recursos || []).join(', ') || 'Recursos diversos' },
                ],
                recursos_adicionales: cf.recursos_adicionales || cf.metacognicion || '',
                metacognicion: cf.metacognicion || '',
                evaluacion: raw.evaluacion || cf.evaluacion || '',
                tarea_hogar: raw.tarea || cf.tarea_hogar || '',
                actividad_complementaria: cf.actividad_complementaria || '',
                secuencia: cf.secuencia || [],
                ...cf,
              };
            }

            console.log('[VistaPreviaCoordinador] Cargado desde D1. Formato:', raw.formData ? 'Planix2.0' : 'Planix1', '| momentos:', Array.isArray(mappedData.momentos) ? mappedData.momentos.length : 'N/A');
            setFormData(mappedData);
            setLoading(false);
            return;
          }
        } catch (d1Err) {
          console.warn("No se pudo cargar desde D1, intentando Supabase:", d1Err);
        }

        // 2. Try Supabase fallback
        try {
          const { data, error: dbError } = await supabase
            .from("plannings")
            .select("*")
            .eq("id", planId)
            .single();
            
          if (dbError) throw dbError;
          if (data) {
            setDocenteId(data.user_id || '');
            const raw = typeof data.content === 'string' ? JSON.parse(data.content) : (data.content || {});
            
            if (raw.status === 'Aprobada') setDecision('Aprobar');
            else if (raw.status === 'Devuelto') setDecision('Devolver');
            else if (raw.status === 'Reunión') setDecision('Reunión');

            if (raw.reviewChecklist && Array.isArray(raw.reviewChecklist)) {
              setChecklist(raw.reviewChecklist);
            }
            if (raw.reviewComment) {
              setComment(raw.reviewComment);
            }

            let mappedData: any;

            if (raw.formData && typeof raw.formData === 'object') {
              const fd = raw.formData;
              mappedData = {
                docente: fd.docente || raw.teacher || user.nombre,
                centro_educativo: fd.centro_educativo || user.colegio || 'Centro Educativo',
                grado: fd.grado || '',
                asignatura: fd.area || raw.subject || '',
                area: fd.area || raw.subject || '',
                seccion: fd.seccion || raw.section || 'A',
                fecha: fd.fecha || raw.date || new Date(data.created_at).toLocaleDateString('es-DO'),
                planningType: fd.planningType || raw.tipo || undefined,
                intencion_pedagogica: fd.intencion_pedagogica || '',
                competencias: fd.competencias || [],
                competencias_especificas: fd.competencias_especificas || [],
                bloque: fd.bloque || 'Bloque 1',
                actividad_titulo: fd.actividad_titulo || raw.sequence || data.title || '',
                momentos: fd.momentos || [],
                recursos_adicionales: fd.recursos_adicionales || '',
                metacognicion: fd.metacognicion || '',
                evaluacion: fd.evaluacion || '',
                tarea_hogar: fd.tarea_casa || fd.tarea_hogar || '',
                actividad_complementaria: fd.actividad_complementaria || '',
                secuencia: raw.sequence || fd.secuencia || '',
                indicador_logro: fd.indicador_logro || '',
                estrategia: fd.estrategia || '',
                ejes_transversales: fd.ejes_transversales || '',
                tema: fd.tema || '',
                subtema: fd.subtema || '',
                unidad: fd.unidad || '',
                recursos: fd.recursos || [],
                ...fd,
              };
            } else {
              const cf = raw.customFields || {};
              mappedData = {
                docente: user.nombre,
                centro_educativo: cf.centro_educativo || user.colegio || 'Centro Educativo',
                grado: raw.grado || '',
                asignatura: raw.asignatura || '',
                area: raw.asignatura || '',
                seccion: cf.seccion || 'A',
                fecha: cf.fecha || new Date(raw.creado_en || data.created_at).toLocaleDateString('es-DO'),
                planningType: raw.tipo || cf.planningType || undefined,
                intencion_pedagogica: raw.intencion_pedagogica || cf.intencion_pedagogica || '',
                competencias: cf.competencias || [raw.conceptual, raw.procedimental, raw.actitudinal].filter(Boolean),
                competencias_especificas: cf.competencias_especificas || [],
                bloque: cf.bloque || 'Bloque 1',
                actividad_titulo: raw.titulo || data.title || '',
                momentos: cf.momentos || [
                  { moment: 'Inicio', descripcion: raw.momentos?.inicio || '', tiempo: '15 minutos', recursos: (raw.recursos || []).join(', ') || 'Recursos diversos' },
                  { moment: 'Desarrollo', descripcion: raw.momentos?.desarrollo || '', tiempo: '45 minutos', recursos: (raw.recursos || []).join(', ') || 'Recursos diversos' },
                  { moment: 'Cierre', descripcion: raw.momentos?.cierre || '', tiempo: '10 minutos', recursos: (raw.recursos || []).join(', ') || 'Recursos diversos' },
                ],
                recursos_adicionales: cf.recursos_adicionales || cf.metacognicion || '',
                metacognicion: cf.metacognicion || '',
                evaluacion: raw.evaluacion || cf.evaluacion || '',
                tarea_hogar: raw.tarea || cf.tarea_hogar || '',
                actividad_complementaria: cf.actividad_complementaria || '',
                secuencia: cf.secuencia || [],
                ...cf,
              };
            }

            console.log('[VistaPreviaCoordinador] Cargado desde Supabase. Formato:', raw.formData ? 'Planix2.0' : 'Planix1', '| momentos:', Array.isArray(mappedData.momentos) ? mappedData.momentos.length : 'N/A');
            setFormData(mappedData);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("No se pudo cargar desde Supabase, intentando local storage:", err);
        }

        // 3. Fallback to teacher local storage of plans (in case coordinator is viewing their own plans)
        const plans = getLessonPlans(user.id);
        const plan = plans.find(p => p.id === planId);

        if (plan) {
          setDocenteId(plan.docente_id || '');
          const mappedData = {
            docente: user.nombre,
            centro_educativo: plan.customFields?.centro_educativo || user.colegio || 'Centro Educativo',
            grado: plan.grado,
            asignatura: plan.asignatura,
            area: plan.asignatura,
            seccion: plan.customFields?.seccion || 'A',
            fecha: plan.customFields?.fecha || new Date(plan.creado_en).toLocaleDateString('es-DO'),
            planningType: plan.tipo || plan.customFields?.planningType || undefined,
            intencion_pedagogica: plan.intencion_pedagogica,
            competencias: plan.customFields?.competencias || [plan.conceptual, plan.procedimental, plan.actitudinal].filter(Boolean),
            competencias_especificas: plan.customFields?.competencias_especificas || [],
            bloque: plan.customFields?.bloque || 'Bloque 1',
            actividad_titulo: plan.titulo,
            momentos: plan.customFields?.momentos || [
              { moment: 'Inicio', descripcion: plan.momentos.inicio, tiempo: '15 minutos', recursos: plan.recursos?.join(', ') || 'Recursos diversos' },
              { moment: 'Desarrollo', descripcion: plan.momentos.desarrollo, tiempo: '45 minutos', recursos: plan.recursos?.join(', ') || 'Recursos diversos' },
              { moment: 'Cierre', descripcion: plan.momentos.cierre, tiempo: '10 minutos', recursos: plan.recursos?.join(', ') || 'Recursos diversos' },
            ],
            recursos_adicionales: plan.customFields?.recursos_adicionales || plan.customFields?.metacognicion || '',
            metacognicion: plan.customFields?.metacognicion || '',
            evaluacion: plan.evaluacion || plan.customFields?.evaluacion || '',
            tarea_hogar: plan.tarea || plan.customFields?.tarea_hogar || '',
            actividad_complementaria: plan.customFields?.actividad_complementaria || '',
            secuencia: plan.customFields?.secuencia || [],
            ...plan.customFields
          };
          setFormData(mappedData);
        } else {
          setError('Planificación no encontrada.');
        }
        setLoading(false);
      };

      loadPlan();
    } else {
      setError('Falta el parámetro ID para cargar la planificación.');
      setLoading(false);
    }
  }, [planId]);

  const handlePrint = () => {
    if (!formData) return;
    const grade = formData.grado ? ` - ${formData.grado}` : '';
    const displaySubject = formData.area || formData.asignatura || 'Asignatura';
    const displaySequence = formData.secuencia || formData.titulo || formData.sequenceTitle || 'Planificación';
    const dateStr = formData.fecha ? new Date(formData.fecha).toLocaleDateString('es-DO').replace(/\//g, '-') : new Date().toLocaleDateString('es-DO').replace(/\//g, '-');
    const filename = `Planix Coordinador - ${displaySubject}${grade} - ${displaySequence} - ${dateStr}`;

    const originalTitle = document.title;
    document.title = filename;

    setTimeout(() => {
      window.print();
    }, 100);

    setTimeout(() => {
      document.title = originalTitle;
    }, 3000);
  };

  const handleDownload = handlePrint;

  const handleSendReview = async () => {
    if (!decision) {
      toast.error('Por favor, selecciona una decisión para la planificación.');
      return;
    }
    setSendingReview(true);
    try {
      let dbRow: any = null;
      try {
        const dbResults = await requestD1<any[]>(`/api/plannings?id=${planId}`);
        dbRow = dbResults && dbResults[0];
      } catch (e) {
        console.warn("Failed to load row from D1 during review submit:", e);
      }

      if (!dbRow) {
        const { data, error: sbErr } = await supabase
          .from("plannings")
          .select("*")
          .eq("id", planId)
          .single();
        if (!sbErr && data) {
          dbRow = data;
        }
      }

      if (!dbRow) {
        toast.error('No se pudo encontrar la planificación en la base de datos.');
        setSendingReview(false);
        return;
      }

      const rawContent = typeof dbRow.content === 'string' ? JSON.parse(dbRow.content) : (dbRow.content || {});
      const newStatus = decision === 'Aprobar' ? 'Aprobada' : decision === 'Devolver' ? 'Devuelto' : 'Reunión';
      
      rawContent.status = newStatus;
      rawContent.reviewChecklist = checklist;
      rawContent.reviewComment = comment;
      rawContent.reviewedAt = new Date().toISOString();

      if (rawContent.formData) {
        rawContent.formData.status = newStatus;
        if (!rawContent.formData.customFields) rawContent.formData.customFields = {};
        rawContent.formData.customFields.estado = newStatus;
      }

      const dbPayload = {
        ...dbRow,
        status: newStatus,
        content: rawContent,
        updated_at: new Date().toISOString()
      };

      await requestD1("/api/plannings", "POST", dbPayload);

      const teacherId = dbRow.user_id || docenteId;
      if (teacherId) {
        const notifsKey = `planix_notifications_${teacherId}`;
        const existingNotifs = JSON.parse(localStorage.getItem(notifsKey) || '[]');
        
        const decisionText = decision === 'Aprobar' ? 'aprobó' : decision === 'Devolver' ? 'devolvió' : 'solicitó una reunión para';
        const decisionIcon = decision === 'Aprobar' ? '✅' : decision === 'Devolver' ? '🔄' : '📅';
        const notifId = `rev-${Date.now()}`;
        
        const checklistSummary = checklist.map(item => `${item.checked ? '✅' : '❌'} ${item.label}`).join('\n');
        
        const newNotif = {
          id: notifId,
          title: `Revisión: Planificación ${newStatus} ${decisionIcon}`,
          body: `El coordinador ha revisado tu secuencia didáctica "${sequenceTitle}".\n\n` +
                `Decisión: **${newStatus}**\n\n` +
                `**Criterios de Evaluación:**\n${checklistSummary}\n\n` +
                `**Retroalimentación:** ${comment || 'Sin comentarios adicionales.'}`,
          time: 'Ahora',
          read: false
        };

        localStorage.setItem(notifsKey, JSON.stringify([newNotif, ...existingNotifs]));
        window.dispatchEvent(new Event('storage'));
      }

      toast.success('Revisión enviada y notificada al docente exitosamente.');
      
      setTimeout(() => {
        navigate('/coordinador/dashboard?tab=planificaciones');
      }, 1500);

    } catch (err: any) {
      console.error('Error submitting review:', err);
      toast.error('Ocurrió un error al enviar la revisión: ' + (err.message || err));
    } finally {
      setSendingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-neutral-600 animate-spin" />
          <span className="text-sm font-semibold text-neutral-600">Preparando vista previa para el coordinador...</span>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center font-sans p-4">
        <div className="bg-white rounded-2xl border border-neutral-300 p-8 max-w-md w-full shadow-sm text-center">
          <Layers className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-neutral-900 mb-2">Error de Vista Previa</h2>
          <p className="text-xs text-neutral-500 mb-6">{error || 'No se pudieron recuperar los datos de la planificación.'}</p>
          <button
            onClick={() => navigate('/coordinador/dashboard?tab=planificaciones')}
            className="w-full bg-neutral-900 hover:bg-neutral-850 text-white py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Volver a Planificaciones
          </button>
        </div>
      </div>
    );
  }

  const formatBlockTitle = (block: string): string => {
    if (typeof block === 'string' && block.startsWith('blk-seq-')) {
      const parts = block.split('-');
      const last = parts[parts.length - 1];
      return `Bloque ${last}`;
    }
    return block;
  };

  const subjectName = formData.area || formData.asignatura || 'Lengua Española';
  const sequenceTitle = formData.secuencia || formData.titulo || formData.sequenceTitle || 'Tarjeta de identidad';
  const isConBase = !formData.grado?.toLowerCase().includes('secundaria') && 
                     (formData.grado?.toLowerCase().includes('1') || formData.grado?.toLowerCase().includes('2') || formData.grado?.toLowerCase().includes('3') ||
                      formData.grado?.toLowerCase().includes('primero') || formData.grado?.toLowerCase().includes('segundo') || formData.grado?.toLowerCase().includes('tercero')) &&
                     /lengua|matem[aá]tica/i.test(subjectName);

  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('lengua')) return <BookText className="h-5 w-5 text-[#1B1B1B] dark:text-white" />;
    if (s.includes('matem')) return <Ruler className="h-5 w-5 text-[#1B1B1B] dark:text-white" />;
    if (s.includes('sociales')) return <Globe className="h-5 w-5 text-[#1B1B1B] dark:text-white" />;
    if (s.includes('naturaleza') || s.includes('naturales')) return <Leaf className="h-5 w-5 text-[#1B1B1B] dark:text-white" />;
    if (s.includes('artística') || s.includes('artistica')) return <Palette className="h-5 w-5 text-[#1B1B1B] dark:text-white" />;
    if (s.includes('física') || s.includes('fisica')) return <Dumbbell className="h-5 w-5 text-[#1B1B1B] dark:text-white" />;
    if (s.includes('formación') || s.includes('formacion') || s.includes('integral')) return <Heart className="h-5 w-5 text-[#1B1B1B] dark:text-white" />;
    return <FileText className="h-5 w-5 text-[#1B1B1B] dark:text-white" />;
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-zinc-955 relative">
      <Toaster position="top-center" richColors />
      {/* Barra de Herramientas de Vista Previa (Fija al desplazar, desaparece al imprimir) */}
      <div className="sticky top-0 z-40 w-full bg-white dark:bg-zinc-900 border-b border-neutral-200 dark:border-zinc-800 shadow-sm no-print">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white leading-tight">Revisión del Coordinador</h1>
              <p className="text-sm font-normal text-neutral-500 dark:text-zinc-400 flex items-center gap-2 mt-1">
                {getSubjectIcon(subjectName)}
                <span>{subjectName} - {sequenceTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Volver a la Bandeja del Coordinador */}
            <button
              onClick={() => {
                navigate('/coordinador/dashboard?tab=planificaciones');
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/30 transition cursor-pointer shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver a Bandeja
            </button>

            {/* Alternar Orientación */}
            <button
              onClick={() => setOrientation(orientation === 'landscape' ? 'portrait' : 'landscape')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-955/20 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30 transition cursor-pointer shadow-sm hover:shadow-md"
            >
              <FileText className="h-3.5 w-3.5" /> {orientation === 'landscape' ? 'Horizontal' : 'Vertical'}
            </button>

            {/* Descargar PDF */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md transition cursor-pointer border-none"
            >
              <Download className="h-3.5 w-3.5 text-white" /> Descargar PDF
            </button>

            {/* Botón de Impresión */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-sm hover:shadow-md border-none"
            >
              <Printer className="h-3.5 w-3.5" /> Imprimir
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* Instrucciones de Impresión (Desaparece al imprimir) */}
        <div className="no-print max-w-4xl mx-auto px-4 mb-6">
          <div className="bg-[#E3F2FD] dark:bg-blue-955/20 border border-[#90CAF9] dark:border-blue-900/40 rounded-lg p-5 shadow-sm">
            <h3 className="text-base font-bold text-[#0D47A1] dark:text-blue-300 mb-2 flex items-center gap-2 font-sans">
              💡 Panel de Revisión de Secuencias Didácticas
            </h3>
            <ul className="text-sm text-[#1565C0] dark:text-blue-400 space-y-1 list-disc list-inside font-medium font-sans">
              <li>Estás previsualizando la secuencia en calidad de <strong>Coordinador Pedagógico</strong>.</li>
              <li>Asegúrate de que la orientación coincida con el diseño original (<strong>{orientation === 'landscape' ? 'Horizontal (A4)' : 'Vertical (A4)'}</strong>).</li>
              <li>Completa el panel de revisión al final de la planificación para registrar tu decisión.</li>
            </ul>
          </div>
        </div>

        {/* Contenedor del documento imprimible */}
        <div className="w-full flex justify-center bg-transparent mb-6">
          <div className={`bg-white p-0 md:p-6 shadow-sm border border-neutral-250 rounded-md print:shadow-none print:border-none print:p-0 w-full ${orientation === 'landscape' ? 'max-w-[297mm]' : 'max-w-[215mm]'}`}>
            <PrintLayout
              formData={formData}
              formType={isConBase ? 'CON_BASE' : 'CURRICULAR'}
              subjectName={subjectName}
              sequenceTitle={sequenceTitle}
              blockTitle={formatBlockTitle(formData.bloque || 'Bloque 1')}
              orientation={orientation}
              planningType={
                formData.planningType || 
                (formData.momentos && (Array.isArray(formData.momentos) ? formData.momentos.length > 0 : Object.keys(formData.momentos).length > 0) ? 'DIARIA' : 'UNIDAD')
              }
            />
          </div>
        </div>

        {/* Panel de Revisión y Retroalimentación (no-print) */}
        <div className="no-print max-w-4xl mx-auto px-4 mt-8 pb-16">
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-md">
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white mb-6 flex items-center gap-2 font-sans">
              <span>📝 Retroalimentación y Decisión de Planificación</span>
            </h2>
            
            {/* Botones de decisión */}
            <div className="mb-6">
              <label className="block text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Decisión del Coordinador
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('Aprobar')}
                  className={`flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    decision === 'Aprobar'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 border-emerald-250 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-955/20 dark:border-emerald-900/30 dark:text-emerald-300'
                  }`}
                >
                  <Check className={`h-3.5 w-3.5 ${decision === 'Aprobar' ? 'text-white' : 'text-emerald-600 dark:text-emerald-450'}`} />
                  Aprobar
                </button>
                
                <button
                  type="button"
                  onClick={() => setDecision('Devolver')}
                  className={`flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    decision === 'Devolver'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'bg-amber-50 border-amber-250 text-amber-700 hover:bg-amber-100 dark:bg-amber-955/20 dark:border-amber-900/30 dark:text-amber-300'
                  }`}
                >
                  <RotateCcw className={`h-3.5 w-3.5 ${decision === 'Devolver' ? 'text-white' : 'text-amber-600 dark:text-amber-450'}`} />
                  Devolver
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('Reunión')}
                  className={`flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    decision === 'Reunión'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-blue-50 border-blue-250 text-blue-700 hover:bg-blue-100 dark:bg-blue-955/20 dark:border-blue-900/30 dark:text-blue-300'
                  }`}
                >
                  <Calendar className={`h-3.5 w-3.5 ${decision === 'Reunión' ? 'text-white' : 'text-blue-600 dark:text-blue-450'}`} />
                  Reunión
                </button>
              </div>
            </div>

            {/* Checklist de revisión */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <label className="block text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Checklist de Revisión Curricular (Currículo Dominicano)
                </label>
                <button
                  type="button"
                  disabled={generatingChecklist}
                  onClick={handleGenerateChecklistWithAI}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-955/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/30 transition cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <Sparkles className={`h-3 w-3 ${generatingChecklist ? 'animate-spin text-indigo-750' : 'text-indigo-650'}`} />
                  {generatingChecklist ? 'Generando Criterios...' : 'Generar Criterios con IA'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50 dark:bg-zinc-950/20 p-5 rounded-2xl border border-neutral-100 dark:border-zinc-900/50">
                {checklist.map((item, idx) => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {
                        const updated = [...checklist];
                        updated[idx].checked = !updated[idx].checked;
                        setChecklist(updated);
                      }}
                      className="mt-0.5 rounded border-neutral-350 dark:border-zinc-700 text-indigo-655 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Comentario escrito */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <label className="block text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  Retroalimentación / Notas de mejora para el Docente
                </label>
                <button
                  type="button"
                  disabled={generatingFeedback}
                  onClick={handleGenerateFeedbackWithAI}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-955/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/30 transition cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <Sparkles className={`h-3 w-3 ${generatingFeedback ? 'animate-spin text-indigo-750' : 'text-indigo-650'}`} />
                  {generatingFeedback ? 'Generando...' : 'Sugerir con IA'}
                </button>
              </div>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe retroalimentación constructiva..."
                className="w-full p-4 rounded-2xl border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-955/20 text-sm text-[#1B1B1B] dark:text-neutral-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-xs"
              />
            </div>

            {/* Botón de enviar */}
            <div className="flex justify-end border-t border-neutral-150 dark:border-zinc-850 pt-6">
              <button
                type="button"
                disabled={sendingReview}
                onClick={handleSendReview}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
              >
                {sendingReview ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                    Enviando revisión...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 text-white" />
                    Enviar revisión
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
