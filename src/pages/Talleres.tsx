import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  ChevronDown,
  Check,
  GraduationCap,
  Clock,
  CheckCircle2,
  Archive,
  Zap,
  Search,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../lib/useRequireAuth';
import { getTalleres, deleteTaller, getTallerProgress } from '../lib/stores/useTalleresStore';
import { getWorkshopTemplate } from '../lib/data/workshopTemplates';
import type { Workshop, WorkshopType } from '../types/tallerTypes';
import TallerIcon from '../components/TallerIcon';
import { toast, Toaster } from 'sonner';

const NIVEL_BADGES: Record<string, { label: string; color: string }> = {
  inicial: { label: 'Inicial', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400' },
  primaria: { label: 'Primaria', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400' },
  secundaria: { label: 'Secundaria', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/20 dark:text-cyan-400' },
};

const ESTADO_BADGES: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  activo: { label: 'Activo', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400', icon: <Zap size={10} className="stroke-[3]" /> },
  completado: { label: 'Completado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400', icon: <CheckCircle2 size={10} className="stroke-[3]" /> },
  archivado: { label: 'Archivado', color: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300', icon: <Archive size={10} className="stroke-[3]" /> },
};

export default function Talleres() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const [talleres, setTalleres] = useState<Workshop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [nivelFilter, setNivelFilter] = useState('Todos');
  const [tipoFilter, setTipoFilter] = useState('Todos');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [showNivelDropdown, setShowNivelDropdown] = useState(false);
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);
  const [tallerToDelete, setTallerToDelete] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getTalleres(user.id)
      .then(data => {
        setTalleres(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    const success = await deleteTaller(id);
    if (success) {
      setTalleres(prev => prev.filter(t => t.id !== id));
      setTallerToDelete(null);
      toast.success('Taller eliminado correctamente');
    } else {
      toast.error('Error al eliminar taller');
    }
  };

  const closeAllDropdowns = () => {
    setShowNivelDropdown(false);
    setShowTipoDropdown(false);
    setShowEstadoDropdown(false);
  };

  const filteredTalleres = talleres.filter(t => {
    const matchesSearch = searchQuery === '' ||
      t.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNivel = nivelFilter === 'Todos' || t.nivel === nivelFilter.toLowerCase();
    const matchesTipo = tipoFilter === 'Todos' || t.tipo_taller === tipoFilter;
    const matchesEstado = estadoFilter === 'Todos' || t.estado === estadoFilter;
    return matchesSearch && matchesNivel && matchesTipo && matchesEstado;
  });

  if (!user) return null;

  return (
    <main className="flex-1 flex flex-col pt-10 xl:pt-[44px] px-6 md:px-[60px] xl:px-16 w-full min-w-0 pb-16">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight leading-[1] text-[#1B1B1B] dark:text-white">
            Mis Talleres
          </h1>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
            Planifica y gestiona talleres educativos con clases vinculadas
          </p>
        </div>
        <button
          onClick={() => navigate('/talleres/nuevo')}
          className="bg-brand-primary hover:bg-brand-hover text-white border border-transparent rounded-full px-4 py-2 font-bold text-[13px] shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none shrink-0"
        >
          <Plus size={14} /> Crear Taller
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-[20px] p-6 shadow-sm mb-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-1">
            <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar talleres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Nivel Filter */}
          <div className="space-y-1 relative select-none">
            <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider">Nivel</label>
            <div
              onClick={() => {
                closeAllDropdowns();
                setShowNivelDropdown(!showNivelDropdown);
              }}
              className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 outline-none transition-all shadow-xs"
            >
              <span className="truncate">{nivelFilter === 'Todos' ? 'Todos los niveles' : nivelFilter}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showNivelDropdown ? 'rotate-180' : ''}`} />
            </div>
            {showNivelDropdown && (
              <>
                <div className="fixed inset-0 z-[45]" onClick={() => setShowNivelDropdown(false)} />
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-50 text-left rounded-lg">
                  <div className="space-y-0.5">
                    {[
                      { value: 'Todos', label: 'Todos los niveles', icon: '' },
                      { value: 'inicial', label: 'Inicial', icon: 'Palette', color: 'text-orange-500' },
                      { value: 'primaria', label: 'Primaria', icon: 'Book', color: 'text-purple-500' },
                      { value: 'secundaria', label: 'Secundaria', icon: 'GraduationCap', color: 'text-cyan-500' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setNivelFilter(opt.value); setShowNivelDropdown(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${nivelFilter === opt.value ? 'bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold' : 'text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`}
                      >
                        <span className="flex items-center gap-2">
                          {opt.icon && <TallerIcon name={opt.icon} size={14} className={opt.color} />}
                          <span>{opt.label}</span>
                        </span>
                        {nivelFilter === opt.value && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tipo Filter */}
          <div className="space-y-1 relative select-none">
            <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">Tipo de taller</label>
            <div
              onClick={() => {
                closeAllDropdowns();
                setShowTipoDropdown(!showTipoDropdown);
              }}
              className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 outline-none transition-all shadow-xs"
            >
              <span className="truncate">
                {tipoFilter === 'Todos' ? 'Todos los tipos' : getWorkshopTemplate(tipoFilter as WorkshopType).nombre}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showTipoDropdown ? 'rotate-180' : ''}`} />
            </div>
            {showTipoDropdown && (
              <>
                <div className="fixed inset-0 z-[45]" onClick={() => setShowTipoDropdown(false)} />
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-50 text-left rounded-lg">
                  <div className="space-y-0.5 max-h-60 overflow-y-auto">
                    {[
                      { value: 'Todos', label: 'Todos los tipos', icon: '' },
                      { value: 'LECTURA_DIVERTIDA', label: 'Lectura Divertida', icon: 'BookOpen', color: 'text-blue-500' },
                      { value: 'MATEMATICA_FASCINA', label: 'La Matemática me Fascina', icon: 'Calculator', color: 'text-red-500' },
                      { value: 'CATEDRA_CIUDADANA', label: 'Cátedra Ciudadana', icon: 'Landmark', color: 'text-orange-500' },
                      { value: 'EDUCACION_AMBIENTAL', label: 'Educación Ambiental', icon: 'Sprout', color: 'text-green-500' },
                      { value: 'PERSONALIZADO', label: 'Personalizado', icon: 'Sparkles', color: 'text-violet-500' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setTipoFilter(opt.value); setShowTipoDropdown(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${tipoFilter === opt.value ? 'bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold' : 'text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`}
                      >
                        <span className="flex items-center gap-2">
                          {opt.icon && <TallerIcon name={opt.icon} size={14} className={opt.color} />}
                          <span>{opt.label}</span>
                        </span>
                        {tipoFilter === opt.value && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Estado Filter */}
          <div className="space-y-1 relative select-none">
            <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider">Estado</label>
            <div
              onClick={() => {
                closeAllDropdowns();
                setShowEstadoDropdown(!showEstadoDropdown);
              }}
              className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 outline-none transition-all shadow-xs"
            >
              <span className="truncate">{estadoFilter === 'Todos' ? 'Todos los estados' : ESTADO_BADGES[estadoFilter]?.label || estadoFilter}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showEstadoDropdown ? 'rotate-180' : ''}`} />
            </div>
            {showEstadoDropdown && (
              <>
                <div className="fixed inset-0 z-[45]" onClick={() => setShowEstadoDropdown(false)} />
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-50 text-left rounded-lg">
                  <div className="space-y-0.5">
                    {[
                      { value: 'Todos', label: 'Todos los estados', icon: '' },
                      { value: 'activo', label: 'Activo', icon: 'Zap', color: 'text-emerald-500' },
                      { value: 'completado', label: 'Completado', icon: 'CheckCircle2', color: 'text-blue-500' },
                      { value: 'archivado', label: 'Archivado', icon: 'Archive', color: 'text-slate-500' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setEstadoFilter(opt.value); setShowEstadoDropdown(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${estadoFilter === opt.value ? 'bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold' : 'text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`}
                      >
                        <span className="flex items-center gap-2">
                          {opt.icon && <TallerIcon name={opt.icon} size={14} className={opt.color} />}
                          <span>{opt.label}</span>
                        </span>
                        {estadoFilter === opt.value && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-left mb-4 px-1 select-none flex items-center justify-between">
        <p className="text-xs font-black text-slate-700 dark:text-zinc-350">
          {loading ? 'Cargando talleres...' : `Mostrando ${filteredTalleres.length} de ${talleres.length} talleres`}
        </p>
      </div>

      {/* Loading state / Talleres Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : filteredTalleres.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTalleres.map(taller => {
            const template = getWorkshopTemplate(taller.tipo_taller);
            const progress = getTallerProgress(taller);
            const nivelBadge = NIVEL_BADGES[taller.nivel] || NIVEL_BADGES.primaria;
            const estadoBadge = ESTADO_BADGES[taller.estado] || ESTADO_BADGES.activo;

            return (
              <div
                key={taller.id}
                onClick={() => navigate(`/talleres/${taller.id}`)}
                className="cursor-pointer bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:border-slate-355 dark:hover:border-zinc-700 transition-all hover:shadow-md group text-left"
              >
                {/* Color header bar */}
                <div
                  className={`h-2 w-full bg-gradient-to-r ${template.gradiente}`}
                />

                <div className="p-5">
                  {/* Top row: icon + name */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: taller.color + '18', color: taller.color }}
                    >
                      <TallerIcon name={taller.icono} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-white leading-tight truncate group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">
                        {taller.nombre}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                        {taller.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${estadoBadge.color}`}>
                      {estadoBadge.icon}
                      {estadoBadge.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${nivelBadge.color}`}>
                      <GraduationCap size={9} className="stroke-[3]" />
                      {nivelBadge.label}
                    </span>
                    {taller.grado && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {taller.grado}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10.5px] font-bold text-slate-600 dark:text-zinc-455">
                        {progress.completadas} / {progress.total} clases
                      </span>
                      <span className="text-[10.5px] font-extrabold" style={{ color: taller.color }}>
                        {progress.porcentaje}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${progress.porcentaje}%`,
                          backgroundColor: taller.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Competencias chips */}
                  {taller.competencias_especificas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {taller.competencias_especificas.slice(0, 2).map((comp, i) => (
                        <span
                          key={i}
                          className="inline-flex px-2 py-0.5 rounded-md text-[9.5px] font-semibold bg-neutral-50 dark:bg-zinc-800/80 border border-neutral-200 dark:border-zinc-700/80 text-slate-600 dark:text-zinc-400 line-clamp-1 max-w-[200px] truncate"
                        >
                          {comp.length > 50 ? comp.substring(0, 50) + '...' : comp}
                        </span>
                      ))}
                      {taller.competencias_especificas.length > 2 && (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[9.5px] font-bold text-slate-500 dark:text-zinc-550">
                          +{taller.competencias_especificas.length - 2} más
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer: date + actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                    <span className="flex items-center gap-1 text-[10.5px] font-semibold text-slate-505 dark:text-zinc-505">
                      <Clock size={11} />
                      {new Date(taller.creado_en).toLocaleDateString('es-DO')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/talleres/${taller.id}`); }}
                        title="Ver taller"
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setTallerToDelete(taller); }}
                        title="Eliminar taller"
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[32px] bg-white dark:bg-zinc-900/30">
          <div className="w-16 h-16 bg-brand-light dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TallerIcon name="Sparkles" size={28} className="text-brand-primary dark:text-blue-400" />
          </div>
          <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-1.5">
            No tienes talleres creados
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5 max-w-sm mx-auto">
            Crea tu primer taller educativo con clases planificadas vinculadas al currículo dominicano.
          </p>
          <button
            onClick={() => navigate('/talleres/nuevo')}
            className="bg-brand-primary hover:bg-brand-hover text-white rounded-full px-5 py-2.5 font-bold text-[13px] shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Plus size={14} /> Crear mi primer taller
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {tallerToDelete && (
        <div
          onClick={() => setTallerToDelete(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 max-w-sm w-full shadow-2xl relative cursor-default text-center animate-in zoom-in-95 duration-200"
          >
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">¿Eliminar Taller?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Esta acción eliminará el taller <span className="font-extrabold text-neutral-900 dark:text-neutral-100">{tallerToDelete.nombre}</span> y todas sus {tallerToDelete.sesiones?.length || 0} clases. ¿Desea continuar?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTallerToDelete(null)}
                className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-xl text-[11.5px] font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(tallerToDelete.id)}
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
