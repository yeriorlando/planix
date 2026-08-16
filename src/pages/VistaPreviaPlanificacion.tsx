import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Printer, ArrowLeft, RefreshCw, Layers, Download, FileText,
  BookText, Ruler, Globe, Leaf, Palette, Dumbbell, Heart, Type
} from 'lucide-react';
import { getLessonPlans, getCurrentUser } from '../lib/storage';
import PrintLayout from '../components/print/PrintLayout';
import { supabase } from '../lib/supabase';
import { mapPlanningFromDb } from '../lib/services/plannings';

export default function VistaPreviaPlanificacion() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('id');
  const tempMode = searchParams.get('temp') === 'true';

  const [formData, setFormData] = useState<any>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [textScale, setTextScale] = useState<'small' | 'normal' | 'large' | 'xlarge'>('normal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();

    if (tempMode) {
      // Cargar datos temporales desde localStorage o sessionStorage (priorizamos localStorage para sincronización instantánea multi-pestaña)
      try {
        const tempStr = localStorage.getItem('plx:temp_planning_preview') || sessionStorage.getItem('plx:temp_planning_preview');
        if (tempStr) {
          const parsed = JSON.parse(tempStr);
          // Si el docente no está en los datos temporales, agregamos el del usuario actual
          if (!parsed.docente && user) {
            parsed.docente = user.nombre;
          }
          if (!parsed.centro_educativo && user) {
            parsed.centro_educativo = user.colegio || 'Centro Educativo';
          }
          setFormData(parsed);
        } else {
          setError('No se encontraron datos de vista previa temporal.');
        }
      } catch (err) {
        setError('Error al procesar los datos de vista previa temporal.');
      }
      setLoading(false);
    } else if (planId) {
      // Cargar planificación guardada — primero intenta Supabase, luego localStorage
      if (!user) {
        setError('Usuario no autenticado.');
        setLoading(false);
        return;
      }

      const loadPlan = async () => {
        try {
          const { data, error: dbError } = await supabase
            .from("plannings")
            .select("*")
            .eq("id", planId)
            .single();
            
          if (dbError) throw dbError;
          if (data) {
            const raw = typeof data.content === 'string' ? JSON.parse(data.content) : (data.content || {});
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

            console.log('[VistaPreviaPlanificacion] Cargado desde Supabase. Formato:', raw.formData ? 'Planix2.0' : 'Planix1', '| momentos:', Array.isArray(mappedData.momentos) ? mappedData.momentos.length : 'N/A');
            setFormData(mappedData);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("No se pudo cargar desde Supabase, intentando local storage:", err);
        }

        const plans = getLessonPlans(user.id);
        const plan = plans.find(p => p.id === planId);

        if (plan) {
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
      setError('Faltan parámetros id o temp para cargar la planificación.');
      setLoading(false);
    }
  }, [planId, tempMode]);

  const handlePrint = () => {
    if (!formData) return;
    const grade = formData.grado ? ` - ${formData.grado}` : '';
    const displaySubject = formData.area || formData.asignatura || 'Asignatura';
    const displaySequence = formData.secuencia || formData.titulo || formData.sequenceTitle || 'Planificación';
    const dateStr = formData.fecha ? new Date(formData.fecha).toLocaleDateString('es-DO').replace(/\//g, '-') : new Date().toLocaleDateString('es-DO').replace(/\//g, '-');
    const filename = `Planix - ${displaySubject}${grade} - ${displaySequence} - ${dateStr}`;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-neutral-600 animate-spin" />
          <span className="text-sm font-semibold text-neutral-600">Preparando plantilla de impresión...</span>
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
            onClick={() => navigate('/planificaciones')}
            className="w-full bg-neutral-900 hover:bg-neutral-850 text-white py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Volver a Planificaciones
          </button>
        </div>
      </div>
    );
  }

  // Format block ID if it's a raw string like blk-seq-1-lengua-1ro-2
  const formatBlockTitle = (block: string): string => {
    if (typeof block === 'string' && block.startsWith('blk-seq-')) {
      const parts = block.split('-');
      const last = parts[parts.length - 1];
      return `Bloque ${last}`;
    }
    return block;
  };

  // Obtenemos los campos de visualización externa
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
      {/* Barra de Herramientas de Vista Previa (Fija al desplazar, desaparece al imprimir) */}
      <div className="sticky top-0 z-40 w-full bg-white dark:bg-zinc-900 border-b border-neutral-200 dark:border-zinc-800 shadow-sm no-print">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col items-center justify-center text-center gap-3">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white leading-tight text-center">
              Vista Previa de Planificación
            </h1>
            <p className="text-sm font-normal text-neutral-500 dark:text-zinc-400 flex items-center justify-center gap-2 mt-1 text-center">
              {getSubjectIcon(subjectName)}
              <span>{subjectName} - {sequenceTitle}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Volver a la Planificación */}
            <button
              onClick={() => {
                const fromSource = searchParams.get('from');
                if (fromSource === 'planificaciones') {
                  navigate('/planificaciones');
                } else {
                  window.close();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/30 transition cursor-pointer shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {searchParams.get('from') === 'planificaciones' ? 'Volver a Planificaciones' : 'Volver a la planificación'}
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

            {/* Control de Tamaño de Texto */}
            <div className="flex items-center bg-neutral-100 dark:bg-zinc-800 rounded-xl p-1 border border-neutral-200 dark:border-zinc-700 shadow-sm">
              <span className="text-[11px] font-bold text-neutral-600 dark:text-zinc-300 px-2 flex items-center gap-1">
                <Type className="h-3.5 w-3.5 text-neutral-500 dark:text-zinc-400" /> Fuente:
              </span>
              <button
                type="button"
                onClick={() => setTextScale('small')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  textScale === 'small'
                    ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-zinc-400 dark:hover:text-white'
                }`}
                title="Texto compacto (-10%)"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setTextScale('normal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  textScale === 'normal'
                    ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-zinc-400 dark:hover:text-white'
                }`}
                title="Texto normal (100%)"
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setTextScale('large')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  textScale === 'large'
                    ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-zinc-400 dark:hover:text-white'
                }`}
                title="Texto aumentado (+15%)"
              >
                A+ (+15%)
              </button>
              <button
                type="button"
                onClick={() => setTextScale('xlarge')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  textScale === 'xlarge'
                    ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:text-zinc-400 dark:hover:text-white'
                }`}
                title="Texto muy grande (+30%)"
              >
                A++ (+30%)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* Instrucciones de Impresión (Desaparece al imprimir) */}
        <div className="no-print max-w-4xl mx-auto px-4 mb-6">
          <div className="bg-[#E3F2FD] dark:bg-blue-955/20 border border-[#90CAF9] dark:border-blue-900/40 rounded-lg p-5 shadow-sm">
            <h3 className="text-base font-bold text-[#0D47A1] dark:text-blue-300 mb-2 flex items-center gap-2 font-sans">
              💡 Instrucciones de Impresión
            </h3>
            <ul className="text-sm text-[#1565C0] dark:text-blue-400 space-y-1 list-disc list-inside font-medium font-sans">
              <li>Haz clic en &quot;Imprimir&quot; para abrir el diálogo de impresión</li>
              <li>Selecciona tu impresora o &quot;Guardar como PDF&quot;</li>
              <li>Asegúrate de que el tamaño de página sea <strong>{orientation === 'portrait' ? 'Vertical (A4)' : 'Horizontal (A4)'}</strong></li>
              <li>Los botones y elementos de navegación no aparecerán en la impresión</li>
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
            textScale={textScale}
            planningType={
              formData.planningType || 
              (formData.momentos && (Array.isArray(formData.momentos) ? formData.momentos.length > 0 : Object.keys(formData.momentos).length > 0) ? 'DIARIA' : 'UNIDAD')
            }
          />
        </div>
      </div>
    </div>
  </div>
  );
}
