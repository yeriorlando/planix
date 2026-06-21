import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Trash2,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useRequireAuth } from '../lib/useRequireAuth';
import { getLessonPlans, deleteLessonPlan, LessonPlan } from '../lib/storage';
import { toast, Toaster } from 'sonner';

export default function DetallePlanificacion() {
  const { id } = useParams();
  const user = useRequireAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  useEffect(() => {
    if (user && id) {
      const allPlans = getLessonPlans(user.id);
      const active = allPlans.find(p => p.id === id);
      if (active) {
        setPlan(active);
      }
    }
  }, [user, id]);

  const handleDelete = () => {
    if (plan) {
      deleteLessonPlan(plan.id);
      toast.success('Planificación eliminada');
      setTimeout(() => navigate('/planificaciones'), 1200);
    }
  };

  const handlePrint = () => {
    if (plan) {
      window.open(`/planificacion/preview?id=${plan.id}`, '_blank');
    }
  };

  if (!user) return null;

  if (!plan) {
    return (
      <main className="flex-1 flex flex-col pt-10 px-6 w-full min-h-[400px] justify-center items-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Planificación no encontrada</h2>
          <p className="text-xs text-slate-450 dark:text-zinc-500">
            La planificación solicitada no existe o no pertenece a tu perfil docente.
          </p>
          <button 
            onClick={() => navigate('/planificaciones')}
            className="bg-[#1B1B1B] dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full text-xs font-bold transition cursor-pointer"
          >
            Volver a Planificaciones
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col pt-10 xl:pt-[44px] px-6 md:px-[60px] xl:px-16 w-full min-w-0 pb-20 overflow-y-auto bg-slate-50 dark:bg-zinc-955 print:bg-white print:p-0 print:pt-0">
      <Toaster position="top-center" richColors />

      {/* Style overrides for clean MINERD printable sheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Navigation Back & Print controls */}
      <div className="flex items-center justify-between mb-8 select-none no-print">
        <button
          onClick={() => navigate('/planificaciones')}
          className="flex items-center gap-2 text-[14px] font-bold text-[#848484] hover:text-[#1B1B1B] dark:hover:text-white transition-colors cursor-pointer bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a mis Planificaciones
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 text-[13px] font-bold px-4 py-2 rounded-full shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 text-[#1B1B1B] dark:text-zinc-250"
          >
            <Printer size={14} /> Imprimir / PDF
          </button>
          
          <button
            onClick={() => setShowConfirmDeleteModal(true)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 px-4 py-2 rounded-full text-[13px] font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div 
        id="print-area" 
        className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800/80 rounded-[36px] p-8 md:p-12 shadow-sm relative text-left"
      >
        
        {/* Print Header */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-100 dark:border-zinc-800 pb-8 mb-8 gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="bg-indigo-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full leading-none">
                {plan.nivel}
              </span>
              <span className="bg-purple-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full leading-none">
                {plan.grado}
              </span>
              <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full leading-none">
                {plan.asignatura}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white leading-tight">
              {plan.titulo}
            </h1>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500">
              Planificación Docente • Creado el {new Date(plan.creado_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800 text-[11px] font-bold text-slate-500 dark:text-zinc-400 space-y-1 sm:min-w-[200px]">
            <div><span className="text-slate-400">Docente:</span> {user.nombre}</div>
            <div><span className="text-slate-400">Institución:</span> {user.colegio || 'Centro Educativo'}</div>
            <div><span className="text-slate-400">Tipo de Plan:</span> {plan.tipo === 'CON_BASE' ? 'Secuencia con Base' : 'Adecuación Curricular'}</div>
          </div>
        </div>

        {/* Core Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main contents (Left Column) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Pedagogical Intent */}
            <section className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Intención Pedagógica del Día
              </h3>
              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                {plan.intencion_pedagogica || 'No descrita.'}
              </p>
            </section>

            {/* Moments of class */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Momentos de la Clase
              </h3>

              <div className="space-y-6 pl-4 border-l-2 border-indigo-500/20">
                
                {/* Inicio */}
                <div className="relative space-y-2">
                  <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-sky-500 border-4 border-white dark:border-zinc-900 shadow-xs" />
                  <div className="flex justify-between items-center text-[10.5px] font-black uppercase text-sky-500">
                    <span>Inicio (10 - 15 Mins)</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-bold">
                    {plan.momentos.inicio}
                  </p>
                </div>

                {/* Desarrollo */}
                <div className="relative space-y-2">
                  <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-white dark:border-zinc-900 shadow-xs" />
                  <div className="flex justify-between items-center text-[10.5px] font-black uppercase text-amber-500">
                    <span>Desarrollo (30 - 45 Mins)</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-bold whitespace-pre-line">
                    {plan.momentos.desarrollo}
                  </p>
                </div>

                {/* Cierre */}
                <div className="relative space-y-2">
                  <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-zinc-900 shadow-xs" />
                  <div className="flex justify-between items-center text-[10.5px] font-black uppercase text-emerald-500">
                    <span>Cierre y Metacognición (5 - 10 Mins)</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-bold">
                    {plan.momentos.cierre}
                  </p>
                </div>

              </div>
            </section>
          </div>

          {/* Right Column (Sidebar contents) */}
          <div className="space-y-6">
            
            {/* Curricular Competencies */}
            <div className="border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 bg-slate-50/50 dark:bg-zinc-950/20 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Saberes Curriculares
              </h3>

              <div className="space-y-3">
                {plan.conceptual && (
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black text-slate-400 dark:text-zinc-500 uppercase block">Conceptual</span>
                    <p className="text-xs font-bold text-slate-750 dark:text-zinc-300">{plan.conceptual}</p>
                  </div>
                )}

                {plan.procedimental && (
                  <div className="space-y-1 border-t border-slate-100 dark:border-zinc-800 pt-3">
                    <span className="text-[9.5px] font-black text-slate-400 dark:text-zinc-500 uppercase block">Procedimental</span>
                    <p className="text-xs font-bold text-slate-750 dark:text-zinc-300 whitespace-pre-line">{plan.procedimental}</p>
                  </div>
                )}

                {plan.actitudinal && (
                  <div className="space-y-1 border-t border-slate-100 dark:border-zinc-800 pt-3">
                    <span className="text-[9.5px] font-black text-slate-400 dark:text-zinc-500 uppercase block">Actitudinal</span>
                    <p className="text-xs font-bold text-slate-750 dark:text-zinc-300">{plan.actitudinal}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resources list */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Recursos Escolares
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1 select-none">
                {plan.recursos && plan.recursos.map((res, i) => (
                  <span key={i} className="inline-flex bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-650 dark:text-zinc-350 border border-slate-200/50 dark:border-zinc-700/50">
                    {res}
                  </span>
                ))}
                {(!plan.recursos || plan.recursos.length === 0) && (
                  <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 italic">Ninguno registrado.</span>
                )}
              </div>
            </div>

            {/* Evaluation & Homework */}
            {plan.evaluacion && (
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Evaluación e Indicadores
                </h3>
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-350 bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/80 whitespace-pre-line">
                  {plan.evaluacion}
                </p>
              </div>
            )}

            {plan.tarea && (
              <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Actividades para el Hogar
                </h3>
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-350">
                  {plan.tarea}
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showConfirmDeleteModal && (
        <div 
          onClick={() => setShowConfirmDeleteModal(false)}
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
              Esta acción eliminará de forma permanente la planificación de su base de datos local. Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDeleteModal(false)}
                className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
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
