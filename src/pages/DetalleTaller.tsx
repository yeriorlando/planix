import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Check,
  CheckCircle2,
  Square,
  CheckSquare,
  Clock,
  Pencil,
  Trash2,
  Layers,
  GraduationCap,
  Zap,
  Archive,
  BookOpen,
  Sparkles,
  ChevronRight,
  BarChart3,
  Target,
  Calendar,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequireAuth } from '../lib/useRequireAuth';
import {
  getTallerById,
  updateTaller,
  deleteSession,
  updateSession,
  getTallerProgress,
} from '../lib/stores/useTalleresStore';
import { getWorkshopTemplate, getSuggestedTopics } from '../lib/data/workshopTemplates';
import type { Workshop, WorkshopSession } from '../types/tallerTypes';
import TallerIcon from '../components/TallerIcon';
import { toast, Toaster } from 'sonner';

export default function DetalleTaller() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const { tallerId } = useParams<{ tallerId: string }>();
  const [taller, setTaller] = useState<Workshop | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<WorkshopSession | null>(null);
  const [showCompetencias, setShowCompetencias] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tallerId) return;
    setLoading(true);
    getTallerById(tallerId)
      .then(t => {
        if (t) {
          setTaller(t);
        } else {
          toast.error('Taller no encontrado');
          navigate('/talleres');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tallerId]);

  const refreshTaller = async () => {
    if (!tallerId) return;
    const t = await getTallerById(tallerId);
    setTaller(t);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!tallerId) return;
    const success = await deleteSession(tallerId, sessionId);
    if (success) {
      await refreshTaller();
      setSessionToDelete(null);
      toast.success('Clase eliminada');
    } else {
      toast.error('Error al eliminar la clase');
    }
  };

  const handleToggleComplete = async (session: WorkshopSession) => {
    if (!tallerId) return;
    const newStatus = session.estado === 'completada' ? 'pendiente' : 'completada';
    const updated = await updateSession(tallerId, session.id, { estado: newStatus });
    if (updated) {
      await refreshTaller();
      toast.success(newStatus === 'completada' ? 'Clase marcada como completada' : 'Clase marcada como pendiente');
    } else {
      toast.error('Error al actualizar el estado de la clase');
    }
  };

  const handleChangeEstado = async (estado: 'activo' | 'completado' | 'archivado') => {
    if (!tallerId) return;
    const updated = await updateTaller(tallerId, { estado });
    if (updated) {
      await refreshTaller();
      toast.success(`Taller marcado como ${estado}`);
    } else {
      toast.error('Error al actualizar el estado del taller');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!user || !taller) return null;

  const template = getWorkshopTemplate(taller.tipo_taller);
  const progress = getTallerProgress(taller);
  const suggestedTopics = getSuggestedTopics(taller.tipo_taller);

  return (
    <div className="min-h-screen bg-bg-base dark:bg-zinc-950 flex flex-col">
      <Toaster position="top-center" richColors />

      {/* Top bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 pt-10 pb-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/talleres')}
            className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/95 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer active:scale-95 select-none"
          >
            ← VOLVER A TALLERES
          </button>
          <div className="flex items-center gap-2">
            {taller.estado === 'activo' && (
              <button
                onClick={() => handleChangeEstado('completado')}
                className="h-9 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950/30 transition cursor-pointer flex items-center gap-1.5 shadow-xs border border-emerald-100 dark:border-emerald-900/30"
              >
                <CheckCircle2 size={13} /> Completar
              </button>
            )}
            {taller.estado !== 'archivado' && (
              <button
                onClick={() => handleChangeEstado('archivado')}
                className="h-9 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-650 dark:text-zinc-350 text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-800 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Archive size={13} /> Archivar
              </button>
            )}
            {taller.estado !== 'activo' && (
              <button
                onClick={() => handleChangeEstado('activo')}
                className="h-9 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-950/30 transition cursor-pointer flex items-center gap-1.5 shadow-xs border border-blue-100 dark:border-blue-900/30"
              >
                <Zap size={13} /> Reactivar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero header */}
      <div className={`bg-gradient-to-r ${template.gradiente} px-6 py-8 text-left`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shrink-0 text-white">
              <TallerIcon name={taller.icono} size={28} />
            </div>
            <div className="text-white flex-1">
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{taller.nombre}</h1>
              <p className="text-white/80 text-sm mt-1 max-w-xl">{taller.descripcion}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <GraduationCap size={10} /> {taller.nivel}
                </span>
                {taller.grado && (
                  <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider">
                    {taller.grado}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  {taller.estado === 'activo' && <><Zap size={10} /> Activo</>}
                  {taller.estado === 'completado' && <><CheckCircle2 size={10} /> Completado</>}
                  {taller.estado === 'archivado' && <><Archive size={10} /> Archivado</>}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white/90">
                Progreso del taller
              </span>
              <span className="text-sm font-extrabold text-white">
                {progress.completadas}/{progress.total} clases ({progress.porcentaje}%)
              </span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress.porcentaje}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Sessions timeline */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-[#1B1B1B] dark:text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-brand-primary dark:text-blue-400" />
                  Clases del Taller
                </h2>
                <button
                  onClick={() => navigate(`/talleres/${tallerId}/clase`)}
                  className="bg-brand-primary hover:bg-brand-hover text-white rounded-full px-4 py-2 font-bold text-[12px] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Plus size={13} /> Nueva Clase
                </button>
              </div>

              {taller.sesiones && taller.sesiones.length > 0 ? (
                <div className="space-y-3">
                  {taller.sesiones.map((session, index) => (
                    <div
                      key={session.id}
                      className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 transition-all text-left group ${
                        session.estado === 'completada'
                          ? 'border-emerald-200 dark:border-emerald-900/30'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Number / Check */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                            session.estado === 'completada'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-brand-primary text-white shadow-sm'
                          }`}
                        >
                          {session.estado === 'completada' ? <Check size={14} className="stroke-[3]" /> : session.numero_clase}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-extrabold ${session.estado === 'completada' ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                              {session.titulo || `Clase ${session.numero_clase}`}
                            </h4>
                            {session.estado === 'completada' && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold uppercase">
                                Completada
                              </span>
                            )}
                          </div>
                          {session.tema && (
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1">
                              <span className="font-bold text-slate-600 dark:text-zinc-355 text-left">Tema:</span> {session.tema}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-[10.5px] text-slate-400 dark:text-zinc-500 font-semibold">
                            {session.fecha && (
                              <span className="flex items-center gap-1">
                                <Calendar size={10} /> {session.fecha}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock size={10} /> {session.duracion_minutos} min
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleComplete(session)}
                            title={session.estado === 'completada' ? "Marcar como pendiente" : "Marcar como completada"}
                            className={`px-3 h-9 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[11px] font-bold border ${
                              session.estado === 'completada'
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm border-emerald-600'
                                : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-emerald-650 hover:border-slate-350'
                            }`}
                          >
                            {session.estado === 'completada' ? (
                              <CheckSquare size={14} className="stroke-[2.5]" />
                            ) : (
                              <Square size={14} className="stroke-[2.5]" />
                            )}
                            <span className="hidden sm:inline">
                              {session.estado === 'completada' ? 'Completada' : 'Completar'}
                            </span>
                          </button>
                          <button
                            onClick={() => navigate(`/talleres/${tallerId}/clase/${session.id}`)}
                            title="Editar clase"
                            className="px-2.5 h-8.5 rounded-lg flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 transition cursor-pointer text-[11px] font-bold"
                          >
                            <Pencil size={13} />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => setSessionToDelete(session)}
                            title="Eliminar clase"
                            className="px-2.5 h-8.5 rounded-lg flex items-center justify-center gap-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition cursor-pointer text-[11px] font-bold"
                          >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add more CTA */}
                  {taller.sesiones.length < taller.max_clases && (
                    <button
                      onClick={() => navigate(`/talleres/${tallerId}/clase`)}
                      className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-brand-primary dark:hover:border-blue-500 text-slate-400 dark:text-zinc-500 hover:text-brand-primary dark:hover:text-blue-400 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm font-bold"
                    >
                      <Plus size={16} /> Agregar clase #{taller.sesiones.length + 1}
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/30">
                  <BookOpen className="h-8 w-8 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
                  <h3 className="text-sm font-extrabold text-slate-700 dark:text-zinc-300 mb-1">
                    Sin clases aún
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 mb-4">
                    Agrega la primera clase a este taller.
                  </p>
                  <button
                    onClick={() => navigate(`/talleres/${tallerId}/clase`)}
                    className="bg-brand-primary hover:bg-brand-hover text-white rounded-full px-5 py-2 font-bold text-[12px] inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus size={13} /> Crear primera clase
                  </button>
                </div>
              )}
            </div>

            {/* Right: Info sidebar */}
            <div className="space-y-4 text-left">
              {/* Stats card */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <BarChart3 size={14} className="text-brand-primary dark:text-blue-400" />
                  Estadísticas
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 dark:bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-extrabold" style={{ color: taller.color }}>{progress.total}</p>
                    <p className="text-[9.5px] font-bold text-slate-500 dark:text-zinc-500 uppercase">Clases</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{progress.completadas}</p>
                    <p className="text-[9.5px] font-bold text-slate-500 dark:text-zinc-500 uppercase">Completadas</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{progress.total - progress.completadas}</p>
                    <p className="text-[9.5px] font-bold text-slate-500 dark:text-zinc-500 uppercase">Pendientes</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{progress.porcentaje}%</p>
                    <p className="text-[9.5px] font-bold text-slate-500 dark:text-zinc-500 uppercase">Avance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom cards: Competencias, Indicadores, Temas Sugeridos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Competencias card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col h-[280px]">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3 flex items-center gap-2 shrink-0">
                <Sparkles size={14} className="text-blue-500" />
                Competencias ({taller.competencias_especificas.length})
              </h3>
              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {taller.competencias_especificas.map((comp, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-neutral-50/50 dark:bg-zinc-800/30 rounded-lg border border-neutral-100/50 dark:border-zinc-800/50">
                    <span className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[10.5px] text-slate-600 dark:text-zinc-400 leading-relaxed">{comp}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicadores card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col h-[280px]">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3 flex items-center gap-2 shrink-0">
                <Target size={14} className="text-emerald-500" />
                Indicadores ({taller.indicadores?.length || 0})
              </h3>
              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {taller.indicadores && taller.indicadores.length > 0 ? (
                  taller.indicadores.map((ind, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-neutral-50/50 dark:bg-zinc-800/30 rounded-lg border border-neutral-100/50 dark:border-zinc-800/50">
                      <Check size={10} className="text-emerald-500 shrink-0 mt-1 stroke-[3]" />
                      <p className="text-[10.5px] text-slate-600 dark:text-zinc-400 leading-relaxed">{ind}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-8">No hay indicadores asignados</p>
                )}
              </div>
            </div>

            {/* Suggested topics */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col h-[280px]">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3 flex items-center gap-2 shrink-0">
                <Layers size={14} className="text-violet-500" />
                Temas Sugeridos ({suggestedTopics?.length || 0})
              </h3>
              <div className="overflow-y-auto flex-1 pr-1">
                {suggestedTopics && suggestedTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-1">
                    {suggestedTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-200 dark:border-zinc-700/50 text-[10px] font-semibold text-slate-600 dark:text-zinc-400 cursor-default hover:bg-neutral-100 dark:hover:bg-zinc-700/85 transition-colors"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-8">No hay temas sugeridos</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete session modal */}
      {sessionToDelete && (
        <div
          onClick={() => setSessionToDelete(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 duration-200"
          >
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Eliminar Clase?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Se eliminará la clase <span className="font-extrabold text-neutral-900 dark:text-neutral-100">#{sessionToDelete.numero_clase} - {sessionToDelete.titulo || 'Sin título'}</span>
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setSessionToDelete(null)}
                className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteSession(sessionToDelete.id)}
                className="bg-[#D31B32] hover:bg-[#B3172A] text-white border border-black/15 text-[11.5px] font-bold h-9 px-6 rounded-xl shadow-md cursor-pointer active:scale-[0.98]"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
