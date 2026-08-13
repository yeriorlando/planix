import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, Usuario, RolUsuario } from '../lib/storage';
import { requestD1 } from '../lib/services/d1Client';
import { Card } from '../components/ui/card';
import { toast, Toaster } from 'sonner';
import { UserAvatar } from './AdminUsuarios';
import { 
  Users, 
  ArrowLeft, 
  ChevronDown, 
  Check, 
  Activity, 
  GraduationCap, 
  Building 
} from 'lucide-react';

// Time formatter helper
const formatTimeElapsed = (dateStr: string): string => {
  if (!dateStr) return 'Conectado: Hace tiempo';
  
  const now = new Date();
  const lastLogin = new Date(dateStr);
  const diffMs = now.getTime() - lastLogin.getTime();
  
  if (isNaN(diffMs) || diffMs < 0) {
    return 'En línea ahora';
  }
  
  const diffMins = diffMs / (1000 * 60);
  if (diffMins < 2) {
    return 'En línea ahora';
  }
  
  if (diffMins < 60) {
    return `Conectado: Hace ${Math.round(diffMins)} min`;
  }
  
  const diffHours = diffMins / 60;
  if (diffHours < 24) {
    const hours = Math.round(diffHours);
    return `Conectado: Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  }
  
  const diffDays = diffHours / 24;
  const days = Math.round(diffDays);
  return `Conectado: Hace ${days} día${days > 1 ? 's' : ''}`;
};

export default function AdminOnline() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => getCurrentUser());
  const navigate = useNavigate();

  // State
  const [profiles, setProfiles] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('plx:users');
      return cached ? JSON.parse(cached) : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    const handleUserChanged = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener("plx:user_changed", handleUserChanged);
    return () => {
      window.removeEventListener("plx:user_changed", handleUserChanged);
    };
  }, []);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Dropdown controls
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [showLevelDropdown, setShowLevelDropdown] = useState<boolean>(false);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

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
  }, []);

  // Fetch online/active users from D1
  const fetchProfiles = async () => {
    try {
      // Fetch fresh profiles from DB
      const data = await requestD1<any[]>('/api/profiles');
      if (data && Array.isArray(data)) {
        setProfiles(data);
      }
    } catch (err) {
      console.error('Error fetching online user list:', err);
      // Fallback local storage
      const local = localStorage.getItem('plx:users');
      if (local) {
        try {
          setProfiles(JSON.parse(local));
        } catch (_) {}
      }
    } finally {
      setLoading(false);
    }
  };

  // Poll profiles every 60 seconds to simulate real-time updates
  useEffect(() => {
    fetchProfiles();
    const interval = setInterval(fetchProfiles, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter online users list (Online definition: last activity / login in the last 4 minutes)
  const allOnlineUsers = useMemo(() => {
    const now = new Date().getTime();
    return profiles.filter(p => {
      // Current Admin is always considered online
      if (p.id === currentUser?.id) return true;
      
      const lastLoginStr = p.last_login || p.updated_at;
      if (!lastLoginStr) return false;
      
      const lastLoginTime = new Date(lastLoginStr).getTime();
      const diffMins = (now - lastLoginTime) / (1000 * 60);
      
      // Active within last 2 minutes
      return diffMins >= -5 && diffMins <= 2;
    });
  }, [profiles, currentUser]);

  // Apply filters
  const filteredOnlineUsers = useMemo(() => {
    return allOnlineUsers.filter(u => {
      const uRole = (u.role || u.rol || 'teacher').toLowerCase();
      const uLevel = (u.nivel_principal || u.nivel || '').toLowerCase();

      const matchRole = roleFilter === 'all' || 
        (roleFilter === 'admin' && (uRole === 'admin' || uRole === 'administrador')) ||
        (roleFilter === 'coordinator' && (uRole === 'coordinator' || uRole === 'coordinador')) ||
        (roleFilter === 'director' && uRole === 'director') ||
        (roleFilter === 'teacher' && uRole === 'teacher');

      const matchLevel = levelFilter === 'all' || 
        (levelFilter === 'inicial' && uLevel.includes('inicial')) ||
        (levelFilter === 'primaria' && uLevel.includes('primaria')) ||
        (levelFilter === 'secundaria' && uLevel.includes('secundaria'));

      return matchRole && matchLevel;
    });
  }, [allOnlineUsers, roleFilter, levelFilter]);

  // Metric counts
  const totalCount = allOnlineUsers.length;

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-zinc-950 text-neutral-800 dark:text-zinc-200 flex flex-col p-4 md:p-6 gap-6 relative select-none">
      <Toaster position="top-center" richColors />

      {/* Top Header Navigation */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-zinc-900 px-6 py-5 rounded-[28px] border border-black/5 dark:border-zinc-800 shadow-xs gap-4">
        <div className="text-left flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-full flex items-center justify-center border border-emerald-500/10 shadow-2xs shrink-0 relative">
            <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              Usuarios Conectados
            </h1>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 mt-0.5">
              {totalCount} {totalCount === 1 ? 'usuario' : 'usuarios'} en línea ahora
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

      {/* Filters Control Bar */}
      <Card className="p-4 border border-black/5 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 shadow-2xs space-y-4 text-left">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Role Filter Selector */}
            <div className="relative select-none w-full sm:w-56">
              <span className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-wider block mb-1 pl-1">Filtrar por rol</span>
              <button
                type="button"
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowLevelDropdown(false);
                }}
                className="w-full flex items-center justify-between gap-2 bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 text-xs px-4 py-2.5 rounded-2xl text-slate-700 dark:text-zinc-350 outline-none font-bold cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-800/60 transition-all select-none"
              >
                <span>
                  {roleFilter === 'all' && 'Todos los roles'}
                  {roleFilter === 'teacher' && 'Docentes'}
                  {roleFilter === 'coordinator' && 'Coordinadores'}
                  {roleFilter === 'director' && 'Directores'}
                  {roleFilter === 'admin' && 'Administradores'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${showRoleDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showRoleDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)} />
                  <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                    <div className="space-y-0.5">
                      {[
                        { value: 'all', label: 'Todos los roles' },
                        { value: 'teacher', label: 'Docentes' },
                        { value: 'coordinator', label: 'Coordinadores' },
                        { value: 'director', label: 'Directores' },
                        { value: 'admin', label: 'Administradores' }
                      ].map((opt) => {
                        const isSelected = roleFilter === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setRoleFilter(opt.value);
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-colors ${
                              isSelected
                                ? "bg-[#0046ab]/10 text-[#0046ab] dark:bg-zinc-800 dark:text-white"
                                : "text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check size={14} className="shrink-0 text-[#0046ab] dark:text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Level Filter Selector */}
            <div className="relative select-none w-full sm:w-56">
              <span className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-wider block mb-1 pl-1">Filtrar por nivel</span>
              <button
                type="button"
                onClick={() => {
                  setShowLevelDropdown(!showLevelDropdown);
                  setShowRoleDropdown(false);
                }}
                className="w-full flex items-center justify-between gap-2 bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 text-xs px-4 py-2.5 rounded-2xl text-slate-700 dark:text-zinc-350 outline-none font-bold cursor-pointer hover:bg-slate-100/50 dark:hover:bg-zinc-800/60 transition-all select-none"
              >
                <span>
                  {levelFilter === 'all' && 'Todos los niveles'}
                  {levelFilter === 'inicial' && 'Inicial'}
                  {levelFilter === 'primaria' && 'Primaria'}
                  {levelFilter === 'secundaria' && 'Secundaria'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${showLevelDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showLevelDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLevelDropdown(false)} />
                  <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                    <div className="space-y-0.5">
                      {[
                        { value: 'all', label: 'Todos los niveles' },
                        { value: 'inicial', label: 'Inicial' },
                        { value: 'primaria', label: 'Primaria' },
                        { value: 'secundaria', label: 'Secundaria' }
                      ].map((opt) => {
                        const isSelected = levelFilter === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setLevelFilter(opt.value);
                              setShowLevelDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-colors ${
                              isSelected
                                ? "bg-[#0046ab]/10 text-[#0046ab] dark:bg-zinc-800 dark:text-white"
                                : "text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check size={14} className="shrink-0 text-[#0046ab] dark:text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-450 dark:text-zinc-500 font-bold select-none mt-4 md:mt-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Actualización en tiempo real (1min)</span>
          </div>
        </div>
      </Card>

      {/* Online Users List */}
      <main className="w-full flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-zinc-900 rounded-[32px] border border-black/5 dark:border-zinc-800 shadow-2xs">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0046ab] mb-4"></div>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-wider">Cargando usuarios activos...</p>
          </div>
        ) : filteredOnlineUsers.length === 0 ? (
          <div className="p-20 text-center bg-white dark:bg-zinc-900 rounded-[32px] border border-black/5 dark:border-zinc-800 shadow-2xs space-y-3">
            <Users className="w-12 h-12 text-slate-350 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-700 dark:text-zinc-300">Ningún usuario conectado coincide</h3>
            <p className="text-xs text-slate-400 dark:text-zinc-555">Prueba a modificar los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 text-left">
            {filteredOnlineUsers.map((user) => {
              const uRole = (user.role || user.rol || 'teacher').toLowerCase();
              const isPro = user.subscription_tier === 'pro' || user.suscripcion === 'pro';
              const lastLogin = user.last_login || user.updated_at;
              const uLevel = (user.nivel_principal || user.nivel || '').toLowerCase();
              const uGrado = user.grado_principal || user.grado || '';

              const getRoleLabel = () => {
                if (uRole === 'admin' || uRole === 'administrador') return 'Administrador';
                if (uRole === 'coordinator' || uRole === 'coordinador') return 'Coordinador';
                if (uRole === 'director') return 'Director';
                return 'Docente';
              };

              return (
                <div 
                  key={user.id} 
                  className="p-5 rounded-[28px] border border-black/5 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0046ab]/30 dark:hover:border-blue-500/30 shadow-2xs hover:shadow-md transition-all duration-300 relative flex flex-col justify-between min-h-[180px] group select-none"
                >
                  {/* Top layout: name, role and avatar container */}
                  <div className="flex justify-between items-start w-full gap-2">
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        {getRoleLabel()}
                      </span>
                      <h4 className="font-extrabold text-[15px] text-[#1B1B1B] dark:text-white truncate block mt-0.5 leading-tight">
                        {user.full_name || user.nombre}
                      </h4>
                    </div>

                    {/* Circular Avatar Container with clear style */}
                    <div className="w-11 h-11 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center border border-black/5 dark:border-white/5 shadow-2xs shrink-0 relative p-0.5">
                      <UserAvatar user={user} className="w-full h-full text-xs font-black" />
                      <div className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                      </div>
                    </div>
                  </div>

                  {/* Middle section: school and educational level details */}
                  <div className="my-3 space-y-1.5 text-slate-650 dark:text-zinc-350 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Building size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate font-bold text-[11px]">{user.school_name || user.colegio || 'Centro Educativo no asignado'}</span>
                    </div>
                    {(uLevel || uGrado) && (
                      <div className="flex items-center gap-1.5">
                        <GraduationCap size={12} className="text-slate-400 shrink-0" />
                        <span className="capitalize font-bold text-[11px]">{uLevel}{uGrado ? ` - ${uGrado}` : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom section: connection time elapsed and subscription badge */}
                  <div className="mt-auto flex items-center justify-between pt-2.5 border-t border-black/5 dark:border-white/5 w-full">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Activity size={11} className="text-emerald-500" />
                      {formatTimeElapsed(lastLogin)}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
                      isPro 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-250/30 dark:border-amber-900/30' 
                        : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-black/5 dark:border-white/5'
                    }`}>
                      {isPro ? 'Planix Pro' : 'Gratuito'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
