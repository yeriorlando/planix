import React, { useState } from 'react';
import { Trash2, Plus, ChevronDown, ChevronRight, Copy, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

interface MomentData {
  descripcion: string;
  actividad_numero: string;
  letras: string;
  recursos: string;
  tiempo: string;
}

export interface SequenceActivity {
  id: string;
  title: string;
  name: string;
  inicio: MomentData[];
  desarrollo: MomentData[];
  cierre: MomentData[];
  actividades_complementarias: string;
  actividades_cuaderno: string;
  intencion_pedagogica: string;
  estrategia?: string;
  aprendizaje_significativo?: string;
}

interface AdvancedSequenceActivityEditorProps {
  activities: SequenceActivity[];
  onChange: (activities: SequenceActivity[]) => void;
}

const EmptyMoment: MomentData = {
  descripcion: '',
  actividad_numero: '',
  letras: '',
  recursos: '',
  tiempo: ''
};

const NewActivity: SequenceActivity = {
  id: '',
  title: 'Nueva Actividad',
  name: '',
  inicio: [{ ...EmptyMoment }],
  desarrollo: [{ ...EmptyMoment }],
  cierre: [{ ...EmptyMoment }],
  actividades_complementarias: '',
  actividades_cuaderno: '',
  intencion_pedagogica: '',
  estrategia: '',
  aprendizaje_significativo: ''
};

export default function AdvancedSequenceActivityEditor({ activities = [], onChange }: AdvancedSequenceActivityEditorProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [activeTabs, setActiveTabs] = useState<Record<string, 'INICIO' | 'DESARROLLO' | 'CIERRE' | 'EXTRA'>>({});

  const handleAddActivity = () => {
    const newId = `act-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const newActivity = { ...NewActivity, id: newId, title: `Actividad ${activities.length + 1}` };
    onChange([...activities, newActivity]);
    setExpandedIds([...expandedIds, newId]);
  };

  const handleRemoveActivity = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      onChange(activities.filter(a => a.id !== id));
    }
  };

  const handleUpdateActivity = (id: string, updates: Partial<SequenceActivity>) => {
    onChange(activities.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleUpdateMoment = (activityId: string, moment: 'inicio' | 'desarrollo' | 'cierre', index: number, data: Partial<MomentData>) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const moments = Array.isArray(activity[moment]) ? activity[moment] : [activity[moment] as any];
    const newMoments = moments.map((m, i) => i === index ? { ...m, ...data } : m);

    handleUpdateActivity(activityId, {
      [moment]: newMoments
    });
  };

  const handleAddMoment = (activityId: string, moment: 'inicio' | 'desarrollo' | 'cierre') => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const moments = Array.isArray(activity[moment]) ? activity[moment] : [activity[moment] as any];
    handleUpdateActivity(activityId, {
      [moment]: [...moments, { ...EmptyMoment }]
    });
  };

  const handleRemoveMoment = (activityId: string, moment: 'inicio' | 'desarrollo' | 'cierre', index: number) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const moments = Array.isArray(activity[moment]) ? activity[moment] : [activity[moment] as any];
    const newMoments = moments.filter((_, i) => i !== index);

    handleUpdateActivity(activityId, {
      [moment]: newMoments
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const duplicateActivity = (activity: SequenceActivity) => {
    const newId = `act-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const copy = { ...activity, id: newId, title: `${activity.title} (Copia)` };
    onChange([...activities, copy]);
    setExpandedIds([...expandedIds, newId]);
  };

  const moveActivity = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= activities.length) return;

    const newActivities = [...activities];
    const temp = newActivities[index];
    newActivities[index] = newActivities[newIndex];
    newActivities[newIndex] = temp;
    onChange(newActivities);
  };

  const handleAutoIncrementActivity = (activityId: string, moment: 'inicio' | 'desarrollo' | 'cierre', index: number, currentValue: string) => {
    const num = parseInt(currentValue || '0');
    if (!isNaN(num)) {
      handleUpdateMoment(activityId, moment, index, { actividad_numero: (num + 1).toString() });
    } else {
      handleUpdateMoment(activityId, moment, index, { actividad_numero: '1' });
    }
  };

  const handleAddLetter = (activityId: string, moment: 'inicio' | 'desarrollo' | 'cierre', index: number, currentValue: string) => {
    if (!currentValue) {
      handleUpdateMoment(activityId, moment, index, { letras: 'A' });
      return;
    }
    const parts = currentValue.split(',').map(p => p.trim());
    const last = parts[parts.length - 1];
    if (last && last.length === 1) {
      const lastCharCode = last.toUpperCase().charCodeAt(0);
      const nextChar = String.fromCharCode(lastCharCode + 1);
      handleUpdateMoment(activityId, moment, index, { letras: `${currentValue}, ${nextChar}` });
    } else {
      handleUpdateMoment(activityId, moment, index, { letras: `${currentValue}, A` });
    }
  };

  const getActiveTab = (activityId: string): 'INICIO' | 'DESARROLLO' | 'CIERRE' | 'EXTRA' => {
    return activeTabs[activityId] || 'INICIO';
  };

  const setActiveTab = (activityId: string, tab: 'INICIO' | 'DESARROLLO' | 'CIERRE' | 'EXTRA') => {
    setActiveTabs(prev => ({ ...prev, [activityId]: tab }));
  };

  const inputCls = "w-full mt-1.5 h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all shadow-xs";
  const textareaCls = "w-full mt-1.5 px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl font-normal text-[13px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/15 outline-none transition-all duration-200 resize-y focus:min-h-[180px] shadow-xs";

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-black/5 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            Actividades del 2do Ciclo <Sparkles className="w-4 h-4 text-indigo-500" />
          </h3>
          <p className="text-[11px] text-neutral-500 dark:text-zinc-400 mt-0.5 font-normal">Define las actividades, momentos (Inicio/Desarrollo/Cierre) y adecuaciones de la secuencia didáctica.</p>
        </div>
        <button
          onClick={handleAddActivity}
          className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white py-2.5 px-5 text-xs font-semibold shadow-sm transition-all cursor-pointer outline-hidden"
        >
          <Plus className="w-4 h-4" /> Añadir Actividad
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const isExpanded = expandedIds.includes(activity.id);
          const activeTab = getActiveTab(activity.id);

          return (
            <div key={activity.id} className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] overflow-hidden shadow-2xs">
              <div
                className="bg-slate-50/50 dark:bg-zinc-850/20 px-6 py-4 border-b border-black/5 dark:border-zinc-800 flex justify-between items-center cursor-pointer select-none"
                onClick={() => toggleExpand(activity.id)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
                  <span className="font-medium text-xs text-neutral-600 dark:text-zinc-300">
                    {index + 1}. {activity.title} {activity.name ? `— ${activity.name}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => moveActivity(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors disabled:opacity-30"
                    title="Subir"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveActivity(index, 'down')}
                    disabled={index === activities.length - 1}
                    className="p-1.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors disabled:opacity-30"
                    title="Bajar"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateActivity(activity)}
                    className="p-1.5 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                    title="Duplicar"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveActivity(activity.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">Título de la Actividad</label>
                      <input
                        type="text"
                        className={inputCls}
                        value={activity.title}
                        onChange={(e) => handleUpdateActivity(activity.id, { title: e.target.value })}
                        placeholder="Ej: Actividad 1"
                      />
                    </div>
                    <div>
                       <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">Nombre descriptivo de la Actividad</label>
                      <input
                        type="text"
                        className={inputCls}
                        value={activity.name || ''}
                        onChange={(e) => handleUpdateActivity(activity.id, { name: e.target.value })}
                        placeholder="Ej: Conociendo la carta de autopresentación"
                      />
                    </div>
                  </div>

                  <div>
                     <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">Intención Pedagógica</label>
                    <textarea
                      className={textareaCls}
                      rows={2}
                      value={activity.intencion_pedagogica || ''}
                      onChange={(e) => handleUpdateActivity(activity.id, { intencion_pedagogica: e.target.value })}
                      placeholder="¿Qué se espera lograr con esta actividad?"
                    />
                  </div>

                  {/* Tabs Switcher */}
                  <div className="flex bg-slate-50 dark:bg-zinc-950 p-1 rounded-xl border border-black/5 dark:border-zinc-800/80 max-w-lg">
                    {(['INICIO', 'DESARROLLO', 'CIERRE', 'EXTRA'] as const).map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(activity.id, tab)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer border active:scale-[0.98] ${
                          activeTab === tab
                            ? tab === 'INICIO'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/30 text-emerald-750 dark:text-emerald-300 shadow-3xs'
                              : tab === 'DESARROLLO'
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-900/30 text-blue-650 dark:text-blue-300 shadow-3xs'
                              : tab === 'CIERRE'
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/30 text-amber-750 dark:text-amber-300 shadow-3xs'
                              : 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-900/30 text-purple-650 dark:text-purple-300 shadow-3xs'
                            : 'border-transparent text-slate-550 hover:text-slate-800 dark:text-zinc-450 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-850/40'
                        }`}
                      >
                        {tab === 'EXTRA' ? 'complementarias/cuaderno' : tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents */}
                  <div className="animate-in fade-in duration-200 pt-2">
                    {activeTab === 'EXTRA' ? (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                             <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">Estrategias de Enseñanza - Aprendizaje</label>
                            <textarea
                              className={textareaCls}
                              rows={3}
                              value={activity.estrategia || ''}
                              onChange={(e) => handleUpdateActivity(activity.id, { estrategia: e.target.value })}
                              placeholder="Ej: Diálogo dirigido, dramatización..."
                            />
                          </div>
                          <div>
                             <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">Aprendizaje Significativo</label>
                            <textarea
                              className={textareaCls}
                              rows={3}
                              value={activity.aprendizaje_significativo || ''}
                              onChange={(e) => handleUpdateActivity(activity.id, { aprendizaje_significativo: e.target.value })}
                              placeholder="Conexión con la realidad de los alumnos..."
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                             <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">Actividades Complementarias (Inclusión / Diversidad)</label>
                            <textarea
                              className={textareaCls}
                              rows={4}
                              value={activity.actividades_complementarias || ''}
                              onChange={(e) => handleUpdateActivity(activity.id, { actividades_complementarias: e.target.value })}
                              placeholder="Refuerzo pedagógico o adecuaciones para estudiantes..."
                            />
                          </div>
                          <div>
                             <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">Actividad para el Cuaderno</label>
                            <textarea
                              className={textareaCls}
                              rows={4}
                              value={activity.actividades_cuaderno || ''}
                              onChange={(e) => handleUpdateActivity(activity.id, { actividades_cuaderno: e.target.value })}
                              placeholder="Actividades que se registrarán en el cuaderno..."
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Moments list: INICIO / DESARROLLO / CIERRE
                      <div className="space-y-4">
                        {(() => {
                          const currentKey = activeTab.toLowerCase() as 'inicio' | 'desarrollo' | 'cierre';
                          const moments = Array.isArray(activity[currentKey])
                            ? activity[currentKey]
                            : (activity[currentKey] ? [activity[currentKey]] : []);

                          return (
                            <>
                              {moments.map((moment: MomentData, mIndex: number) => (
                                <div key={mIndex} className="p-4 bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-205 dark:border-zinc-800 rounded-2xl relative">
                                  <div className="absolute top-2 right-2">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMoment(activity.id, currentKey, mIndex)}
                                      className="text-neutral-400 hover:text-red-650 p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                      title="Eliminar Momento"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-2">
                                    <div className="md:col-span-12">
                                      <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">
                                        Descripción del Momento {mIndex + 1}
                                      </label>
                                      <textarea
                                        className={textareaCls}
                                        rows={3}
                                        value={moment.descripcion || ''}
                                        onChange={(e) => handleUpdateMoment(activity.id, currentKey, mIndex, { descripcion: e.target.value })}
                                        placeholder="Detalla la acción docente y de los estudiantes..."
                                      />
                                    </div>

                                    <div className="md:col-span-3 relative">
                                       <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">Actividad #</label>
                                      <div className="absolute right-1.5 top-7 z-10">
                                        <button
                                          type="button"
                                          onClick={() => handleAutoIncrementActivity(activity.id, currentKey, mIndex, moment.actividad_numero || '')}
                                          className="text-[9px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 font-bold"
                                        >
                                          +
                                        </button>
                                      </div>
                                      <input
                                        type="text"
                                        className={inputCls}
                                        value={moment.actividad_numero || ''}
                                        onChange={(e) => handleUpdateMoment(activity.id, currentKey, mIndex, { actividad_numero: e.target.value })}
                                        placeholder="Ej: 1"
                                      />
                                    </div>

                                    <div className="md:col-span-3 relative">
                                       <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">Letras</label>
                                      <div className="absolute right-1.5 top-7 z-10">
                                        <button
                                          type="button"
                                          onClick={() => handleAddLetter(activity.id, currentKey, mIndex, moment.letras || '')}
                                          className="text-[9px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 font-bold"
                                        >
                                          +
                                        </button>
                                      </div>
                                      <input
                                        type="text"
                                        className={inputCls}
                                        value={moment.letras || ''}
                                        onChange={(e) => handleUpdateMoment(activity.id, currentKey, mIndex, { letras: e.target.value })}
                                        placeholder="Ej: A, B"
                                      />
                                    </div>

                                    <div className="md:col-span-2">
                                       <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">Tiempo (min)</label>
                                      <input
                                        type="text"
                                        className={inputCls}
                                        value={moment.tiempo || ''}
                                        onChange={(e) => handleUpdateMoment(activity.id, currentKey, mIndex, { tiempo: e.target.value })}
                                        placeholder="Min."
                                      />
                                    </div>

                                    <div className="md:col-span-4">
                                       <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">Recursos</label>
                                      <input
                                        type="text"
                                        className={inputCls}
                                        value={moment.recursos || ''}
                                        onChange={(e) => handleUpdateMoment(activity.id, currentKey, mIndex, { recursos: e.target.value })}
                                        placeholder="Ej: Pizarra, marcadores..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => handleAddMoment(activity.id, currentKey)}
                                className="w-full py-2.5 rounded-xl border border-dashed border-neutral-300 dark:border-zinc-800 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" /> Añadir otro paso/momento
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {activities.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-dashed border-neutral-300 dark:border-zinc-800 rounded-3xl p-6">
            <p className="text-xs text-neutral-500 dark:text-zinc-400 font-semibold mb-3">No hay actividades definidas en esta secuencia.</p>
            <button
              onClick={handleAddActivity}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white py-2 px-5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Comenzar a añadir actividades
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
