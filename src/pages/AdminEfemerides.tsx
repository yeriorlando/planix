import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/storage';
import { requestD1 } from '../lib/services/d1Client';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast, Toaster } from 'sonner';
import { Calendar, Plus, Trash2, ArrowLeft, Save, Sparkles, Check, ChevronDown, Pencil, HelpCircle, Wand2, X } from 'lucide-react';
import { generateEphemerisDescription } from '../lib/services/aiService';

interface Ephemeris {
  id: string;
  day: number;
  month: number;
  title: string;
  description: string;
  is_holiday: boolean;
  category: string;
}

const CATEGORIES = [
  'EDUCATIVA', 'PATRIA', 'SALUD', 'AMBIENTE', 'CULTURAL',
  'SOCIAL', 'HISTORIA', 'INTERNACIONAL', 'CIENCIA',
  'LITERATURA', 'DERECHOS', 'HUMANOS'
];

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const getCategoryStyles = (category: string) => {
  const cat = category?.toUpperCase();
  switch (cat) {
    case 'PATRIA':
      return 'bg-red-50 text-red-650 border border-red-200/50 dark:bg-red-950/20 dark:text-red-450 dark:border-red-900/30';
    case 'SALUD':
      return 'bg-teal-50 text-teal-650 border border-teal-200/50 dark:bg-teal-950/20 dark:text-teal-450 dark:border-teal-900/30';
    case 'AMBIENTE':
    case 'MEDIO AMBIENTE':
      return 'bg-emerald-50 text-emerald-650 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30';
    case 'EDUCATIVA':
      return 'bg-blue-50 text-blue-650 border border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-455 dark:border-blue-900/30';
    case 'CULTURAL':
      return 'bg-purple-50 text-purple-650 border border-purple-200/50 dark:bg-purple-950/20 dark:text-purple-450 dark:border-purple-900/30';
    case 'SOCIAL':
      return 'bg-orange-50 text-orange-650 border border-orange-200/50 dark:bg-orange-950/20 dark:text-orange-450 dark:border-orange-900/30';
    case 'HISTORIA':
      return 'bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30';
    case 'INTERNACIONAL':
    case 'MUNDIAL':
      return 'bg-cyan-50 text-cyan-650 border border-cyan-200/50 dark:bg-cyan-950/20 dark:text-cyan-450 dark:border-cyan-900/30';
    case 'CIENCIA':
    case 'TECNOLOGÍA':
      return 'bg-fuchsia-50 text-fuchsia-650 border border-fuchsia-200/50 dark:bg-fuchsia-950/20 dark:text-fuchsia-450 dark:border-fuchsia-900/30';
    case 'LITERATURA':
    case 'ARTE':
      return 'bg-rose-50 text-rose-655 border border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30';
    case 'DERECHOS':
    case 'HUMANOS':
      return 'bg-indigo-50 text-indigo-650 border border-indigo-200/50 dark:bg-indigo-950/20 dark:text-indigo-450 dark:border-indigo-900/30';
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-200/50 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700/30';
  }
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function AdminEfemerides() {
  const currentUserRef = useRef(getCurrentUser());
  const currentUser = currentUserRef.current;
  const navigate = useNavigate();

  // Core state
  const [ephemerides, setEphemerides] = useState<Ephemeris[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [currentMonthlyValue, setCurrentMonthlyValue] = useState('');
  const [savingValue, setSavingValue] = useState(false);

  // Form modals state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    day: 1,
    month: selectedMonth,
    title: '',
    description: '',
    is_holiday: false,
    category: 'EDUCATIVA'
  });

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ephemerisToDelete, setEphemerisToDelete] = useState<string | null>(null);

  // Custom UI Dropdown States
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showFormMonthDropdown, setShowFormMonthDropdown] = useState(false);
  const [showFormCategoryDropdown, setShowFormCategoryDropdown] = useState(false);

  // AI states & handlers
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) {
      toast.error('Por favor, ingresa el título de la efeméride.');
      return;
    }

    setGeneratingDesc(true);
    const toastId = toast.loading('Generando descripción con IA...');
    try {
      const description = await generateEphemerisDescription(
        formData.title,
        MONTH_NAMES[formData.month - 1]
      );
      setFormData(prev => ({ ...prev, description }));
      toast.success('Descripción generada exitosamente.', { id: toastId });
    } catch (err: any) {
      console.error('Error al generar descripción:', err);
      toast.error('Error al generar la descripción con IA.', { id: toastId });
    } finally {
      setGeneratingDesc(false);
    }
  };

  // Verify access
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.rol !== 'admin') {
      toast.error('Acceso denegado: Se requieren privilegios de administrador.');
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Fetch ephemerides and monthly value
  const fetchEphemerides = useCallback(async () => {
    setLoading(true);
    try {
      // Get monthly value
      const valData = await requestD1<any>(`/api/monthly-values?month=${selectedMonth}`);
      setCurrentMonthlyValue(valData?.value_name || '');

      // Get ephemerides list
      const data = await requestD1<Ephemeris[]>(`/api/ephemerides?month=${selectedMonth}`);
      if (data && Array.isArray(data)) {
        setEphemerides(data);
      } else {
        setEphemerides([]);
      }
    } catch (err) {
      console.error('Error al cargar efemérides de D1:', err);
      toast.error('Error al cargar la información de efemérides.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchEphemerides();
  }, [fetchEphemerides]);

  // Save monthly value
  const handleSaveMonthlyValue = async () => {
    if (!currentMonthlyValue.trim()) {
      toast.error('Escribe un valor para el mes primero.');
      return;
    }

    setSavingValue(true);
    try {
      await requestD1('/api/monthly-values', 'POST', {
        month: selectedMonth,
        value_name: currentMonthlyValue
      });
      toast.success(`Valor del mes de ${MONTH_NAMES[selectedMonth - 1]} guardado correctamente.`);
      fetchEphemerides();
    } catch (err) {
      console.error('Error al guardar valor del mes:', err);
      toast.error('Error al guardar el valor del mes.');
    } finally {
      setSavingValue(false);
    }
  };

  // Open creation modal
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      day: 1,
      month: selectedMonth,
      title: '',
      description: '',
      is_holiday: false,
      category: 'EDUCATIVA'
    });
    setShowForm(true);
  };

  // Open edit modal
  const handleOpenEditModal = (eph: Ephemeris) => {
    setEditingId(eph.id);
    setFormData({
      day: eph.day,
      month: eph.month,
      title: eph.title,
      description: eph.description || '',
      is_holiday: !!eph.is_holiday,
      category: eph.category || 'EDUCATIVA'
    });
    setShowForm(true);
  };

  // Save ephemeris form
  const handleSaveEphemeris = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('El título es requerido.');
      return;
    }

    try {
      const id = editingId || generateUUID();
      await requestD1('/api/ephemerides', 'POST', {
        id,
        ...formData,
        is_holiday: formData.is_holiday ? 1 : 0
      });
      
      toast.success(editingId ? 'Efeméride actualizada correctamente.' : 'Efeméride creada correctamente.');
      setShowForm(false);
      fetchEphemerides();
    } catch (err) {
      console.error('Error al guardar efeméride:', err);
      toast.error('Error al guardar la efeméride.');
    }
  };

  // Start delete
  const handleDeleteStart = (id: string) => {
    setEphemerisToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!ephemerisToDelete) return;
    try {
      await requestD1(`/api/ephemerides/${ephemerisToDelete}`, 'DELETE');
      toast.success('Efeméride eliminada correctamente.');
      fetchEphemerides();
    } catch (err) {
      console.error('Error al eliminar efeméride:', err);
      toast.error('Error al eliminar la efeméride.');
    } finally {
      setIsDeleteModalOpen(false);
      setEphemerisToDelete(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-zinc-955 text-neutral-800 dark:text-zinc-200 flex flex-col p-4 md:p-6 gap-6 relative select-none">
      <Toaster position="top-center" richColors />

      {/* Header Bar */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-zinc-900 px-6 py-5 rounded-[28px] border border-black/5 dark:border-zinc-800 shadow-xs gap-4">
        <div className="text-left flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-955/30 rounded-full flex items-center justify-center border border-blue-500/10 shadow-2xs shrink-0 text-blue-600 dark:text-blue-400">
            <Calendar size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              Gestión de Efemérides
            </h1>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 mt-0.5">
              Administración manual de efemérides y valores del mes en Planix
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-2xl bg-[#0046ab] hover:bg-[#003c94] text-white py-2.5 px-5 text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Añadir Manual</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 rounded-2xl border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-355 py-2.5 px-5 text-xs font-black shadow-3xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Volver</span>
          </Button>
        </div>
      </div>

      {/* Valor del Mes Settings Card */}
      <Card className="p-6 border border-black/5 dark:border-zinc-800 rounded-[28px] bg-white dark:bg-zinc-900 shadow-2xs space-y-4 text-left">
        <div className="flex flex-col lg:flex-row gap-6 items-end justify-between">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest pl-1 flex items-center gap-1.5">
              <Sparkles size={12} className="text-blue-500 animate-pulse" />
              Valor del Mes de {MONTH_NAMES[selectedMonth - 1]}
            </label>
            <Input
              placeholder="Ej: Compromiso y Compañerismo"
              value={currentMonthlyValue}
              onChange={(e) => setCurrentMonthlyValue(e.target.value)}
              className="h-10 bg-slate-50 dark:bg-zinc-955 border-slate-200 dark:border-zinc-800 focus-visible:ring-blue-500 font-extrabold text-sm rounded-2xl"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-4 items-end w-full lg:w-auto">
            {/* Month Dropdown Selector */}
            <div className="relative select-none w-full sm:w-48">
              <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider mb-1 pl-1">Mes:</label>
              <button
                type="button"
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 outline-none transition-all shadow-xs"
              >
                <span>{MONTH_NAMES[selectedMonth - 1]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showMonthDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showMonthDropdown && (
                <>
                  <div className="fixed inset-0 z-45" onClick={() => setShowMonthDropdown(false)} />
                  <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left rounded-lg max-h-60 overflow-y-auto">
                    <div className="space-y-0.5">
                      {MONTH_NAMES.map((name, i) => {
                        const isSelected = selectedMonth === i + 1;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedMonth(i + 1);
                              setShowMonthDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                                : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                            }`}
                          >
                            <span>{name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={handleSaveMonthlyValue}
              disabled={savingValue}
              className="h-10 px-6 bg-[#0046ab] hover:bg-[#003c94] text-white font-extrabold text-xs rounded-2xl shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Save size={14} />
              <span>{savingValue ? 'Guardando...' : 'Guardar Valor'}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Ephemerides Table List */}
      <Card className="p-6 border border-black/5 dark:border-zinc-800 rounded-[28px] bg-white dark:bg-zinc-900 shadow-2xs space-y-6 text-left flex-1 flex flex-col min-h-[350px]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
            Efemérides del Mes de:
          </span>
          <span className="text-sm font-black text-[#0046ab] dark:text-blue-400 uppercase tracking-wider bg-blue-500/10 dark:bg-blue-900/20 px-3 py-1 rounded-full">
            {MONTH_NAMES[selectedMonth - 1]}
          </span>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0046ab] mb-4"></div>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Cargando efemérides...</p>
          </div>
        ) : ephemerides.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
            <Calendar className="w-12 h-12 text-slate-350 dark:text-zinc-600 mb-3" />
            <h3 className="text-sm font-extrabold text-slate-700 dark:text-zinc-300">No hay efemérides registradas</h3>
            <p className="text-xs text-slate-450 dark:text-zinc-500 mt-1 max-w-sm">No se encontraron efemérides para este mes en la base de datos. Añade una manualmente para comenzar.</p>
            <Button
              onClick={handleOpenAddModal}
              className="mt-4 flex items-center gap-1.5 bg-[#0046ab] hover:bg-[#003c94] text-white text-xs font-extrabold px-4 py-2 rounded-xl"
            >
              <Plus size={12} />
              Añadir Efeméride
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto w-full rounded-2xl border border-slate-100 dark:border-zinc-800/80">
            <table className="w-full border-collapse text-left text-xs font-medium">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 text-slate-500 uppercase tracking-wider">
                  <th className="p-4 font-black w-20">Día</th>
                  <th className="p-4 font-black">Efeméride</th>
                  <th className="p-4 font-black w-32 text-center">Tipo</th>
                  <th className="p-4 font-black w-36 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ephemerides.map((eph) => (
                  <tr key={eph.id} className="border-b border-slate-50 dark:border-zinc-850 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-all duration-200">
                     <td className="p-4 font-extrabold text-slate-800 dark:text-zinc-200 text-sm">{eph.day}</td>
                     <td className="p-4 max-w-lg">
                      <div className="space-y-1 text-left">
                        <span className="font-extrabold text-sm text-neutral-900 dark:text-white uppercase leading-snug tracking-tight block">
                          {eph.title}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryStyles(eph.category)}`}>
                            {eph.category || 'EDUCATIVA'}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                            {eph.description}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {eph.is_holiday ? (
                        <span className="inline-block px-2.5 py-0.5 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200/30 text-[9.5px] font-black uppercase tracking-wider rounded-md">
                          FESTIVO
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-450 dark:bg-zinc-800 dark:text-zinc-500 text-[9.5px] font-black uppercase tracking-wider rounded-md">
                          Laborable
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(eph)}
                          className="h-9 w-9 rounded-xl hover:bg-blue-500/10 text-slate-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
                        >
                          <Pencil className="w-5 h-5 shrink-0" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStart(eph.id)}
                          className="h-9 w-9 rounded-xl hover:bg-red-500/10 text-red-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 shrink-0" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Manual Creation & Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6 text-left animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                {editingId ? 'Editar Efeméride' : 'Nueva Efeméride'}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition-all shadow-sm active:scale-90 hover:scale-105 border-none outline-none"
              >
                <X size={14} className="stroke-[3] text-white" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEphemeris} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider pl-0.5">Día (1-31)</label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    required
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: Number(e.target.value) })}
                    className="h-10 bg-slate-50 dark:bg-zinc-955 border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-bold focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-1 relative select-none">
                  <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider pl-0.5 block mb-1">Mes</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFormMonthDropdown(!showFormMonthDropdown);
                      setShowFormCategoryDropdown(false);
                    }}
                    className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 outline-none transition-all shadow-xs"
                  >
                    <span>{MONTH_NAMES[formData.month - 1]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showFormMonthDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showFormMonthDropdown && (
                    <>
                      <div className="fixed inset-0 z-45" onClick={() => setShowFormMonthDropdown(false)} />
                      <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left rounded-lg max-h-48 overflow-y-auto">
                        <div className="space-y-0.5">
                          {MONTH_NAMES.map((name, i) => {
                            const isSelected = formData.month === i + 1;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, month: i + 1 });
                                  setShowFormMonthDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                                  isSelected
                                    ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                                    : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                }`}
                              >
                                <span>{name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider pl-0.5">Título del Evento</label>
                  <Input
                    required
                    placeholder="Ej. Día de la Independencia"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-10 bg-slate-50 dark:bg-zinc-955 border-slate-200 dark:border-zinc-800 rounded-lg text-sm font-bold focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-1 relative select-none">
                  <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider pl-0.5 block mb-1">Categoría</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFormCategoryDropdown(!showFormCategoryDropdown);
                      setShowFormMonthDropdown(false);
                    }}
                    className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 outline-none transition-all shadow-xs"
                  >
                    <span>{formData.category}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showFormCategoryDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showFormCategoryDropdown && (
                    <>
                      <div className="fixed inset-0 z-45" onClick={() => setShowFormCategoryDropdown(false)} />
                      <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left rounded-lg max-h-48 overflow-y-auto">
                        <div className="space-y-0.5">
                          {CATEGORIES.map((cat) => {
                            const isSelected = formData.category === cat;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, category: cat });
                                  setShowFormCategoryDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                                  isSelected
                                    ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                                    : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                }`}
                              >
                                <span>{cat}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-550 pl-0.5">Descripción Pedagógica / Histórica</label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={generatingDesc || !formData.title}
                    className="text-[10px] flex items-center gap-1.5 font-bold text-white bg-purple-600 hover:bg-purple-750 active:scale-[0.98] px-3.5 py-1 rounded-xl transition-all cursor-pointer select-none shadow-xs disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{generatingDesc ? 'Generando...' : 'Generar con IA'}</span>
                  </button>
                </div>
                <textarea
                  required
                  placeholder="Detalles sobre el evento y su valor..."
                  className="w-full h-24 bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs p-3.5 text-slate-700 dark:text-zinc-300 outline-none font-medium focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 select-none py-1.5">
                <input
                  type="checkbox"
                  id="is_holiday"
                  checked={formData.is_holiday}
                  onChange={(e) => setFormData({ ...formData, is_holiday: e.target.checked })}
                  className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="is_holiday" className="text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
                  Marcar este evento como Feriado (FESTIVO) oficial en R.D.
                </label>
              </div>

              <div className="pt-3 flex gap-3 border-t border-slate-100 dark:border-zinc-800 mt-2">
                <Button
                  type="submit"
                  className="flex-1 rounded-2xl bg-[#0046ab] hover:bg-[#003c94] text-white py-2.5 text-xs font-black shadow-sm"
                >
                  <Save size={14} className="mr-1.5" />
                  <span>Guardar</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-2xl border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 py-2.5 text-xs font-black shadow-3xs"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Eliminar Efeméride</h3>
              <p className="text-xs text-slate-450 dark:text-zinc-400 font-bold leading-normal">
                ¿Estás seguro de que deseas eliminar permanentemente esta efeméride de D1? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="flex-1 rounded-2xl py-2.5 text-xs font-black"
              >
                Eliminar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEphemerisToDelete(null);
                }}
                className="flex-1 rounded-2xl border-slate-250 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 py-2.5 text-xs font-black shadow-3xs"
              >
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
