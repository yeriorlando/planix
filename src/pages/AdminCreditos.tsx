import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Settings, 
  Users, 
  Coins, 
  ArrowLeft, 
  Save, 
  Plus, 
  Minus,
  Sparkles,
  Search,
  Crown,
  ShieldAlert,
  GraduationCap,
  Gift,
  ClipboardList,
  MessageSquare,
  FileText,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { 
  getCreditCosts, 
  saveCreditCosts, 
  addCreditsToUser, 
  CreditCosts,
  DEFAULT_CREDIT_COSTS
} from '../lib/credits';
import { requestD1 } from '../lib/services/d1Client';
import { getCurrentUser, getUsers, saveUsuario, Usuario } from '../lib/storage';
import { toast } from 'sonner';

interface ToolMetadata {
  key: keyof CreditCosts;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  bg: string;
  iconBg: string;
}

const TOOLS_METADATA: ToolMetadata[] = [
  {
    key: 'ai_planning',
    name: 'Generación con IA (Planificaciones)',
    description: 'Créditos consumidos por cada generación automática de una planificación utilizando IA.',
    category: 'Planificación',
    icon: Sparkles,
    bg: 'bg-gradient-to-br from-[#F5E6FF] to-[#EBE0FF] dark:from-purple-950/20 dark:to-slate-900 hover:border-purple-500/10',
    iconBg: 'bg-purple-100 dark:bg-purple-950/30 text-purple-650 dark:text-purple-450'
  },
  {
    key: 'rubric_generation',
    name: 'Generar Rúbrica y Lista de Cotejo',
    description: 'Costo para crear rúbricas y listas de cotejo de evaluación de forma interactiva.',
    category: 'Evaluación',
    icon: ClipboardList,
    bg: 'bg-gradient-to-br from-[#E6F4EA] to-[#F1F9F5] dark:from-emerald-950/20 dark:to-slate-900 hover:border-emerald-500/10',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-450'
  },
  {
    key: 'planix_chat',
    name: 'Planix Chat (Por mensaje)',
    description: 'Costo por cada mensaje o consulta enviada al chat inteligente de asistencia.',
    category: 'Chat',
    icon: MessageSquare,
    bg: 'bg-gradient-to-br from-[#E0E7FF] to-[#EDE9FE] dark:from-indigo-950/20 dark:to-slate-900 hover:border-indigo-500/10',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400'
  },
  {
    key: 'grades_report',
    name: 'Reporte de Evaluación (Calificaciones)',
    description: 'Costo por acceder y generar el informe oficial de registro de calificaciones.',
    category: 'Calificaciones',
    icon: FileText,
    bg: 'bg-gradient-to-br from-[#FFF4E0] to-[#FFE4E1] dark:from-amber-950/20 dark:to-slate-900 hover:border-orange-500/10',
    iconBg: 'bg-orange-100 dark:bg-orange-950/30 text-orange-650 dark:text-orange-400'
  },
  {
    key: 'attendance_summary',
    name: 'Resumen Anual (Asistencia)',
    description: 'Costo por visualizar y exportar reportes del registro acumulado de asistencia.',
    category: 'Asistencia',
    icon: Calendar,
    bg: 'bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A]/40 dark:from-amber-950/20 dark:to-slate-900 hover:border-amber-500/10',
    iconBg: 'bg-amber-100 dark:bg-amber-950/30 text-amber-655 dark:text-amber-455'
  },
  {
    key: 'save_planning',
    name: 'Guardar Planificación',
    description: 'Créditos cobrados al guardar un borrador o versión final de la planificación en la cuenta.',
    category: 'Planificación',
    icon: Save,
    bg: 'bg-gradient-to-br from-[#F5E6FF] to-[#E0E7FF] dark:from-indigo-950/10 dark:to-slate-900 hover:border-indigo-500/10',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
  },
  {
    key: 'exam_generator',
    name: 'Generador de Exámenes',
    description: 'Créditos consumidos por cada generación automática de un examen utilizando IA.',
    category: 'Evaluación',
    icon: GraduationCap,
    bg: 'bg-gradient-to-br from-[#E6F4EA] to-[#F1F9F5] dark:from-emerald-950/20 dark:to-slate-900 hover:border-emerald-500/10',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-450'
  }
];

export default function AdminCreditos() {
  const navigate = useNavigate();
  const currentUserRef = useRef(getCurrentUser());
  const currentUser = currentUserRef.current;

  // Guard: Admin role required
  useEffect(() => {
    if (!currentUser || currentUser.rol !== 'admin') {
      toast.error('Acceso denegado. Se requieren permisos de administrador.');
      navigate('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // States
  const [costs, setCosts] = useState<CreditCosts>(getCreditCosts());
  const [users, setUsers] = useState<Usuario[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(50);
  const [referrerCredits, setReferrerCredits] = useState<number>(50);
  const [referredCredits, setReferredCredits] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<'costs' | 'users' | 'referrals'>('costs');

  // Load users list
  const refreshUsersList = () => {
    setUsers(getUsers());
  };

  useEffect(() => {
    refreshUsersList();
    const handleCostsChanged = () => {
      setCosts(getCreditCosts());
    };
    window.addEventListener('plx:credit_costs_changed', handleCostsChanged);

    const loadReferralSettings = async () => {
      try {
        const config = await requestD1<{ key: string; value: any }>('/api/site-configs/referral_settings');
        if (config && config.value) {
          const val = typeof config.value === 'string' ? JSON.parse(config.value) : config.value;
          setReferrerCredits(val.referrer_credits ?? 50);
          setReferredCredits(val.referred_credits ?? 30);
        }
      } catch (err) {
        console.error('Error fetching referral settings from D1:', err);
      }
    };
    loadReferralSettings();

    return () => {
      window.removeEventListener('plx:credit_costs_changed', handleCostsChanged);
    };
  }, []);

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate circulating credits and free users
  const totalFreeUsers = users.filter(u => u.suscripcion !== 'pro').length;
  const totalCirculatingCredits = users.reduce((acc, u) => {
    if (u.suscripcion === 'pro') return acc;
    return acc + ((u as any).creditos ?? 100);
  }, 0);

  const handleUpdateCostValue = (key: keyof CreditCosts, value: number) => {
    setCosts(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRestoreDefaults = () => {
    setCosts(DEFAULT_CREDIT_COSTS);
    toast.success('Valores por defecto restablecidos en el formulario. Recuerda guardar para aplicar.');
  };

  const handleSaveCosts = async (e: React.FormEvent) => {
    e.preventDefault();
    saveCreditCosts(costs);
    try {
      await requestD1('/api/site-configs', 'POST', {
        key: 'credit_costs',
        value: costs
      });
      toast.success('Costos de créditos actualizados con éxito.');
    } catch (err: any) {
      console.error('Error saving credit costs to D1:', err);
      toast.error('Guardado localmente, pero falló la sincronización con la base de datos.');
    }
  };

  const handleSaveReferralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestD1('/api/site-configs', 'POST', {
        key: 'referral_settings',
        value: {
          referrer_credits: referrerCredits,
          referred_credits: referredCredits
        }
      });
      toast.success('Configuración de créditos por referidos actualizada.');
    } catch (err: any) {
      console.error('Error saving referral settings to D1:', err);
      toast.error('Error al guardar la configuración de referidos en la base de datos.');
    }
  };

  const handleAdjustCredits = (userId: string, amount: number) => {
    const success = addCreditsToUser(userId, amount);
    if (success) {
      toast.success(`${amount > 0 ? 'Añadidos' : 'Restados'} ${Math.abs(amount)} créditos con éxito.`);
      refreshUsersList();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, creditos: ((prev as any).creditos ?? 100) + amount } : null);
      }
    } else {
      toast.error('Ocurrió un error al ajustar los créditos.');
    }
  };

  if (!currentUser || currentUser.rol !== 'admin') {
    return null;
  }

  // Sub-tabs rendering helpers
  const renderCostsTab = () => {
    const filteredTools = TOOLS_METADATA.filter(tool => 
      tool.name.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(toolSearchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/5 dark:border-white/5">
          <div className="text-left">
            <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Settings size={20} className="text-[#0046ab] dark:text-blue-400" />
              Costo de Herramientas
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">
              Define el valor en créditos cobrado a los docentes por cada uso de las herramientas.
            </p>
          </div>

          {/* Search Input for tools */}
          <div className="relative w-full sm:max-w-xs shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar herramienta..."
              value={toolSearchQuery}
              onChange={e => setToolSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-850 border border-black/5 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#0046ab] transition-colors placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Tools Grid - 3 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-450 dark:text-slate-550 font-bold text-xs">
              No se encontraron herramientas con ese nombre.
            </div>
          ) : (
            filteredTools.map(tool => {
              const ToolIcon = tool.icon;
              const currentVal = costs[tool.key] ?? 0;
              return (
                <div 
                  key={tool.key} 
                  className={`rounded-[28px] p-5 relative overflow-hidden group border border-transparent shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 min-h-[190px] flex flex-col justify-between select-none text-left ${tool.bg}`}
                >
                  {/* Top Row */}
                  <div className="flex justify-between items-start relative z-10 w-full">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                      <ToolIcon size={14} className="opacity-80 text-inherit" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-inherit">
                        {tool.category}
                      </span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-3xs ${tool.iconBg}`}>
                      <ToolIcon size={14} />
                    </div>
                  </div>

                  {/* Middle Row */}
                  <div className="relative z-10 my-3 flex flex-col items-start w-full text-left">
                    <span className="text-[13px] font-extrabold text-[#1B1B1B] dark:text-white leading-tight tracking-tight">
                      {tool.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500/90 dark:text-zinc-400 mt-1 leading-snug">
                      {tool.description}
                    </span>
                  </div>

                  {/* Bottom Row */}
                  <div className="relative z-10 mt-auto pt-3 border-t border-black/5 dark:border-white/5 w-full">
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl px-3 py-1.5 w-full justify-between shadow-3xs">
                      <button
                        type="button"
                        onClick={() => handleUpdateCostValue(tool.key, Math.max(0, currentVal - 1))}
                        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 rounded-lg cursor-pointer transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={currentVal}
                        onChange={e => handleUpdateCostValue(tool.key, Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-14 text-center font-black text-xs bg-transparent outline-none focus:ring-0 border-0 p-0"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateCostValue(tool.key, currentVal + 1)}
                        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 text-slate-505 rounded-lg cursor-pointer transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                      <Coins size={12} className="text-amber-500 shrink-0" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-black/5 dark:border-white/5 mt-6 justify-end">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <RotateCcw size={14} />
            Restaurar Por Defecto
          </button>
          <button
            type="button"
            onClick={handleSaveCosts}
            className="px-6 py-2.5 rounded-xl bg-[#0046ab] hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-xs uppercase tracking-wider"
          >
            <Save size={14} />
            Guardar Costos
          </button>
        </div>
      </div>
    );
  };

  const renderUsersTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/5 dark:border-white/5">
          <div className="text-left">
            <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Users size={20} className="text-[#0046ab] dark:text-blue-400" />
              Saldos de Usuarios
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">
              Busca docentes registrados en la base de datos local y modifica sus créditos.
            </p>
          </div>

          {/* Search Input for users */}
          <div className="relative w-full sm:max-w-xs shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar docente por nombre o email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-850 border border-black/5 dark:border-white/10 rounded-xl focus:outline-none focus:border-[#0046ab] transition-colors placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Users list and panel grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User selection list */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="col-span-full text-center py-10 text-slate-400 font-bold text-xs">
                  No se encontraron docentes con esos criterios.
                </div>
              ) : (
                filteredUsers.map(user => {
                  const isUserPro = user.suscripcion === 'pro';
                  const userCredits = isUserPro ? 'Ilimitado' : ((user as any).creditos ?? 100);
                  const isSelected = selectedUser?.id === user.id;
                  
                  return (
                    <div 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                        isSelected 
                          ? 'border-[#0046ab] bg-blue-50/25 dark:bg-blue-950/15 shadow-3xs' 
                          : 'border-black/5 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-850/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-slate-100 relative shrink-0">
                          <img 
                            src={user.avatar_url || "https://randomuser.me/api/portraits/women/47.jpg"} 
                            alt={user.nombre} 
                            className="w-full h-full object-cover rounded-full" 
                          />
                          {isUserPro && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-white p-0.5 rounded-full border border-white dark:border-slate-900 shadow-3xs">
                              <Crown size={8} className="fill-white text-white" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex flex-col">
                          <span className="text-xs font-black text-slate-850 dark:text-slate-200 truncate leading-tight">
                            {user.nombre}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-none mt-0.5 font-bold">
                            {user.email}
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-wider mt-1 w-fit px-1.5 py-0.5 rounded ${
                            isUserPro 
                              ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-450 border border-amber-500/10' 
                              : 'bg-slate-150 dark:bg-slate-850 text-slate-650 dark:text-slate-450 border border-black/5 dark:border-white/5'
                          }`}>
                            {isUserPro ? 'PRO' : 'Gratuito'}
                          </span>
                        </div>
                      </div>

                      {/* Balance */}
                      <div className="text-right shrink-0 flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          <Coins size={12} className={isUserPro ? 'text-amber-500' : 'text-amber-600'} />
                          <span className="text-xs font-black text-slate-850 dark:text-white">
                            {userCredits}
                          </span>
                        </div>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold">créditos</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* User adjustment panel */}
          <div className="lg:col-span-5 flex flex-col h-full justify-start">
            {selectedUser ? (
              <div className="bg-slate-50/40 dark:bg-slate-800/20 border border-black/5 dark:border-white/5 rounded-2xl p-5 space-y-4 text-left animate-in fade-in slide-in-from-bottom-2 duration-200 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-black text-[#0046ab] dark:text-blue-400 uppercase tracking-widest bg-[#0046ab]/5 dark:bg-blue-950/30 px-2 py-0.5 rounded border border-blue-500/10">
                      Ajuste de Créditos
                    </span>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white mt-3 leading-snug">
                      Modificando saldo de {selectedUser.nombre}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 truncate mt-0.5">
                      {selectedUser.email}
                    </p>
                  </div>

                  <div className="border border-black/5 dark:border-white/5 py-3 px-4 rounded-2xl flex items-center justify-between bg-white dark:bg-slate-900 shadow-3xs">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Saldo actual:</span>
                    <div className="flex items-center gap-1.5 font-black text-slate-850 dark:text-white text-sm">
                      <Coins size={14} className="text-amber-500" />
                      <span>{selectedUser.suscripcion === 'pro' ? 'Ilimitado' : ((selectedUser as any).creditos ?? 100)}</span>
                    </div>
                  </div>

                  {selectedUser.suscripcion === 'pro' ? (
                    <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-500/10 rounded-2xl text-[10.5px] font-bold leading-normal">
                      <Crown size={16} className="shrink-0 text-amber-500 mt-0.5" />
                      <span>Los usuarios con suscripción PRO tienen acceso ilimitado a todas las herramientas. No es necesario modificar sus créditos.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-wider block">
                          Cantidad a ajustar
                        </label>
                        <div className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-2xl px-3 py-2 w-full shadow-3xs">
                          <button 
                            type="button"
                            onClick={() => setCreditAmount(prev => Math.max(5, prev - 5))}
                            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            value={creditAmount}
                            onChange={e => setCreditAmount(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-20 text-center font-black text-sm bg-transparent outline-none focus:ring-0 border-0 p-0"
                          />
                          <button 
                            type="button"
                            onClick={() => setCreditAmount(prev => prev + 5)}
                            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => handleAdjustCredits(selectedUser.id, creditAmount)}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider transition-colors active:scale-[0.98] shadow-3xs"
                        >
                          <Plus size={12} />
                          Añadir
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustCredits(selectedUser.id, -creditAmount)}
                          className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider transition-colors active:scale-[0.98] shadow-3xs"
                        >
                          <Minus size={12} />
                          Restar
                        </button>
                      </div>
                      
                      {/* Quick selectors */}
                      <div className="pt-2">
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Ajustes Rápidos</span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[10, 50, 100, 500].map(amount => (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => setCreditAmount(amount)}
                              className={`py-1.5 rounded-lg text-[10.5px] font-black border transition-all cursor-pointer ${
                                creditAmount === amount
                                  ? 'bg-[#0046ab]/10 border-[#0046ab] text-[#0046ab] dark:bg-blue-950/30 dark:border-blue-500 dark:text-blue-400'
                                  : 'border-black/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400 bg-white dark:bg-slate-900'
                              }`}
                            >
                              {amount}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-black/10 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[300px]">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center text-slate-400 shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-750 dark:text-slate-350">Ningún docente seleccionado</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] leading-normal font-bold">
                    Selecciona un docente del listado de la izquierda para ver su saldo y realizar ajustes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderReferralsTab = () => {
    return (
      <div className="space-y-6">
        <div className="text-left pb-5 border-b border-black/5 dark:border-white/5">
          <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Gift size={20} className="text-[#0046ab] dark:text-blue-400" />
            Créditos de Referidos
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">
            Configura la cantidad de créditos de recompensa asignados a los usuarios en el sistema de invitación.
          </p>
        </div>

        <form onSubmit={handleSaveReferralSettings} className="space-y-6 mt-6 max-w-xl text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Referrer card */}
            <div className="rounded-[28px] p-5 relative overflow-hidden group border border-transparent shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 min-h-[190px] flex flex-col justify-between select-none text-left bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A]/40 dark:from-amber-950/20 dark:to-slate-900 hover:border-amber-500/10">
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-350">
                  <Gift size={14} className="opacity-80 text-inherit" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-inherit">
                    Referidos
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-3xs bg-amber-100 dark:bg-amber-950/30 text-amber-655 dark:text-amber-455">
                  <Gift size={14} />
                </div>
              </div>
              <div className="relative z-10 my-3 flex flex-col items-start w-full text-left">
                <span className="text-[13px] font-extrabold text-[#1B1B1B] dark:text-white leading-tight tracking-tight">
                  Recompensa para el Referente
                </span>
                <span className="text-[10px] font-bold text-slate-500/90 dark:text-zinc-400 mt-1 leading-snug">
                  Créditos que recibe el usuario dueño del código al invitar exitosamente a otra persona.
                </span>
              </div>
              <div className="relative z-10 mt-auto pt-3 border-t border-black/5 dark:border-white/5 w-full">
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl px-3 py-1.5 w-full justify-between shadow-3xs">
                  <button
                    type="button"
                    onClick={() => setReferrerCredits(prev => Math.max(0, prev - 5))}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 rounded-lg cursor-pointer transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={referrerCredits}
                    onChange={e => setReferrerCredits(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-14 text-center font-black text-xs bg-transparent outline-none focus:ring-0 border-0 p-0"
                  />
                  <button
                    type="button"
                    onClick={() => setReferrerCredits(prev => prev + 5)}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/5 text-slate-505 rounded-lg cursor-pointer transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                  <Coins size={12} className="text-amber-500 shrink-0" />
                </div>
              </div>
            </div>

            {/* Referee card */}
            <div className="rounded-[28px] p-5 relative overflow-hidden group border border-transparent shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 min-h-[190px] flex flex-col justify-between select-none text-left bg-gradient-to-br from-[#E0E7FF] to-[#EDE9FE] dark:from-indigo-950/20 dark:to-slate-900 hover:border-indigo-500/10">
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-350">
                  <Gift size={14} className="opacity-80 text-inherit" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-inherit">
                    Referidos
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-3xs bg-indigo-100 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400">
                  <Gift size={14} />
                </div>
              </div>
              <div className="relative z-10 my-3 flex flex-col items-start w-full text-left">
                <span className="text-[13px] font-extrabold text-[#1B1B1B] dark:text-white leading-tight tracking-tight">
                  Recompensa para el Referido
                </span>
                <span className="text-[10px] font-bold text-slate-500/90 dark:text-zinc-400 mt-1 leading-snug">
                  Créditos que recibe el nuevo usuario al registrarse utilizando un código de referido.
                </span>
              </div>
              <div className="relative z-10 mt-auto pt-3 border-t border-black/5 dark:border-white/5 w-full">
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl px-3 py-1.5 w-full justify-between shadow-3xs">
                  <button
                    type="button"
                    onClick={() => setReferredCredits(prev => Math.max(0, prev - 5))}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 rounded-lg cursor-pointer transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={referredCredits}
                    onChange={e => setReferredCredits(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-14 text-center font-black text-xs bg-transparent outline-none focus:ring-0 border-0 p-0"
                  />
                  <button
                    type="button"
                    onClick={() => setReferredCredits(prev => prev + 5)}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/5 text-slate-505 rounded-lg cursor-pointer transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                  <Coins size={12} className="text-indigo-650 shrink-0" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0046ab] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs active:scale-[0.98] select-none uppercase tracking-wider"
          >
            <Save size={14} />
            Guardar Configuración
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-zinc-950 flex flex-col p-4 md:p-6 gap-6 relative select-none text-left font-sans">
      {/* Top Header Navigation */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-zinc-900 px-6 py-5 rounded-[28px] border border-black/5 dark:border-zinc-800 shadow-xs gap-4 text-left">
        <div className="text-left flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0046ab]/10 text-[#0046ab] dark:bg-blue-950/30 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
            <Coins size={18} className="fill-blue-500/20" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
              Gestión de Créditos y Costos
              <span className="text-[10px] font-black uppercase bg-[#0046ab]/10 text-[#0046ab] dark:bg-blue-950/30 dark:text-blue-400 border border-[#0046ab]/10 px-2.5 py-0.5 rounded-full tracking-wider">
                Finanzas
              </span>
            </h1>
            <p className="text-xs font-bold text-slate-450 dark:text-slate-550 mt-0.5">
              Configura los costos de las herramientas para usuarios gratuitos y administra sus balances de créditos.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 rounded-2xl bg-[#0046ab] hover:bg-[#003c94] active:scale-[0.99] text-white py-2.5 px-5 text-xs font-black shadow-sm hover:shadow-md transition-all cursor-pointer outline-hidden"
        >
          <ArrowLeft size={14} className="text-white" />
          Volver al Panel de Administración
        </button>
      </div>

      {/* Container */}
      <div className="max-w-7xl mx-auto space-y-6 w-full">
        
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 p-5 rounded-[24px] shadow-xs flex items-center justify-between select-none text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-455 dark:text-zinc-550 uppercase tracking-widest block">Docentes Gratuitos</span>
              <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">{totalFreeUsers}</h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">Con planes gratuitos activos</p>
            </div>
            <div className="w-10 h-10 bg-indigo-550/10 text-[#0046ab] dark:bg-indigo-950/30 dark:text-indigo-400 rounded-full flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 p-5 rounded-[24px] shadow-xs flex items-center justify-between select-none text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-455 dark:text-zinc-550 uppercase tracking-widest block">Créditos en Circulación</span>
              <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">{totalCirculatingCredits}</h3>
              <p className="text-[10px] font-bold text-slate-455 dark:text-slate-500 mt-1">Saldo total acumulado en monederos</p>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 text-amber-600 dark:bg-amber-950/30 dark:text-amber-500 rounded-full flex items-center justify-center shrink-0">
              <Coins size={18} className="text-amber-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 p-5 rounded-[24px] shadow-xs flex items-center justify-between select-none text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-455 dark:text-zinc-550 uppercase tracking-widest block">Herramientas</span>
              <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">{TOOLS_METADATA.length}</h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 mt-1">Acciones monetizadas con costo</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-450 rounded-full flex items-center justify-center shrink-0">
              <Settings size={18} />
            </div>
          </div>
        </div>

        {/* Sub-dashboard Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-4 shadow-xs space-y-1 text-left">
            <div className="px-3 py-1.5">
              <p className="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Navegación</p>
            </div>
            
            <button
              onClick={() => setActiveTab('costs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'costs'
                  ? 'bg-[#0046ab] text-white shadow-3xs'
                  : 'text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50'
              }`}
            >
              <Settings size={16} />
              <span>Costo de Herramientas</span>
              <span className={`ml-auto text-[9.5px] px-2 py-0.5 rounded-full font-black ${
                activeTab === 'costs'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-850 text-slate-500'
              }`}>
                {TOOLS_METADATA.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#0046ab] text-white shadow-3xs'
                  : 'text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50'
              }`}
            >
              <Users size={16} />
              <span>Saldos de Usuarios</span>
              <span className={`ml-auto text-[9.5px] px-2 py-0.5 rounded-full font-black ${
                activeTab === 'users'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-850 text-slate-500'
              }`}>
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('referrals')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'referrals'
                  ? 'bg-[#0046ab] text-white shadow-3xs'
                  : 'text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50'
              }`}
            >
              <Gift size={16} />
              <span>Créditos de Referidos</span>
            </button>
          </div>

          {/* Main Panel Content */}
          <div className="flex-1 w-full bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-xs min-h-[500px]">
            {activeTab === 'costs' && renderCostsTab()}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'referrals' && renderReferralsTab()}
          </div>
        </div>

      </div>
    </div>
  );
}
