import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, saveUsuario, saveUsuariosBatch, deleteUsuario, Usuario, RolUsuario, PlanId } from '../lib/storage';
import AmbassadorBadge from '../components/ui/AmbassadorBadge';
import AmbassadorCelebrationModal from '../components/modals/AmbassadorCelebrationModal';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/card';
import { DatePicker } from '../components/ui/heroui-date-picker';
import { toast, Toaster } from 'sonner';
import { requestD1 } from '../lib/services/d1Client';
import { 
  Layout, 
  Brain, 
  Users, 
  ArrowLeft,
  ShieldAlert,
  LogOut,
  Sparkles,
  Zap,
  Activity, 
  Building,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  UserCheck,
  UserX,
  X,
  Calendar,
  Mail,
  GraduationCap,
  Award,
  BookOpen,
  FileText,
  CheckSquare,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Crown,
  Coins,
  Star,
  AlertTriangle,
  Pencil
} from 'lucide-react';
import { getAllLevels, getGradesByLevel, getCyclesByLevel, getGradesByCycle } from '../lib/data/educationStructure';
import { OFFICIAL_DEFAULT_SUBJECTS } from '../lib/data/defaultSubjects';

// Pure utility to safely parse allowed subjects JSON
const parseAllowedSubjects = (val: any): Record<string, string[]> => {
  if (!val) return {};
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch (_) {
      return {};
    }
  }
  return val;
};

// Pure utility for string normalization to avoid code duplication and memory allocation
const normalizeString = (s: string): string => {
  return s.normalize("NFD")
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '')
    .replace(/grado|ano/g, '')
    .replace(/1er/g, '1ro')
    .replace(/secundaria|sec/g, 'sec');
};

// Static cache of available subjects per grade to optimize render performance
const gradeSubjectsCache: Record<string, typeof OFFICIAL_DEFAULT_SUBJECTS> = {};

const getAvailableSubjectsForGrade = (gradeName: string, gradeId: string, levelId: string) => {
  const cacheKey = `${levelId}-${gradeId}`;
  if (gradeSubjectsCache[cacheKey]) {
    return gradeSubjectsCache[cacheKey];
  }

  const normalizedGradeName = normalizeString(gradeName);

  const subjects = OFFICIAL_DEFAULT_SUBJECTS.filter(s =>
    s.level === levelId &&
    (s.grades?.length === 0 || s.grades?.some(g => {
      const normalizedG = normalizeString(g);
      const isNumberMatch = (normalizedG.match(/\d+/) && normalizedG.match(/\d+/)?.[0] === normalizedGradeName.match(/\d+/)?.[0]);
      return normalizedG === normalizedGradeName ||
          normalizedG.includes(normalizedGradeName) ||
          normalizedGradeName.includes(normalizedG) ||
          isNumberMatch;
    }))
  );

  gradeSubjectsCache[cacheKey] = subjects;
  return subjects;
};

const getAuthMethod = (user: Usuario): 'google' | 'email' => {
  if (user.metodo_acceso === 'google') return 'google';
  if (user.metodo_acceso === 'correo') return 'email';
  
  const avatar = (user.avatar_url || '').toLowerCase();
  
  if (avatar.includes('googleusercontent.com') || avatar.includes('lh3.googleusercontent') || avatar.includes('lh3.google')) {
    return 'google';
  }
  return 'email';
};

// Stats interface for real-time counts
interface UserStats {
  classrooms: number;
  plannings: number;
  rubrics: number;
  students: number;
  attendance: number;
  grades: number;
}

interface UserCardProps {
  user: Usuario;
  onSelect: (u: Usuario) => void;
  isDuplicateFingerprint?: boolean;
}

const UserCard = React.memo(({ user, onSelect, isDuplicateFingerprint }: UserCardProps) => {
  const isPro = user.suscripcion === 'pro';
  const isSuspended = user.estado_suscripcion === 'SUSPENDIDO';
  return (
    <div
      onClick={() => onSelect(user)}
      className={`p-5 rounded-[28px] border transition-all duration-300 cursor-pointer flex flex-col justify-between text-left relative overflow-hidden group select-none ${
        isSuspended
          ? 'border-red-200 dark:border-red-950/40 bg-red-50/10 dark:bg-red-950/5 hover:shadow-md'
          : isPro
          ? 'border-amber-350 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/20 via-white to-amber-100/10 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/20 shadow-[0_4px_20px_rgba(245,158,11,0.04)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] hover:border-amber-500 dark:hover:border-amber-500'
          : 'border-black/5 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 hover:shadow-md'
      }`}
    >
      {/* Floating Premium Crown Badge */}
      {isPro && (
        <div className="absolute top-4 right-4 flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200/50 dark:border-amber-900/30 text-amber-600 dark:text-amber-400">
          <Crown size={12} className="fill-amber-500 text-amber-500" />
        </div>
      )}

      <div className="space-y-4">
        {/* Avatar y Datos Principales */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full overflow-hidden border bg-slate-50 shrink-0 relative ${
            user.is_ambassador || isPro 
              ? 'border-amber-400 dark:border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.25)]' 
              : 'border-black/5'
          }`}>
            <img 
              src={user.avatar_url || "https://randomuser.me/api/portraits/women/47.jpg"} 
              alt="Docente" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://randomuser.me/api/portraits/women/47.jpg";
              }}
            />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 truncate group-hover:text-[#0046ab] dark:group-hover:text-blue-400 transition-colors flex items-center gap-1">
                {user.nombre}
                {user.is_ambassador && <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />}
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-550 font-bold block truncate leading-none mt-0.5">
              {user.email}
            </span>
          </div>
        </div>

        {/* Detalles: Colegio y Nivel */}
        <div className="space-y-1.5 text-slate-500 dark:text-zinc-400 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Building size={12} className="text-slate-400 shrink-0" />
            <span className="truncate font-bold text-[11px]">{user.colegio || 'Centro Educativo no asignado'}</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap size={12} className="text-slate-400 shrink-0" />
            <span className="capitalize font-bold text-[11px]">Nivel: {user.nivel || 'No definido'}</span>
          </div>
        </div>

        {/* Badges de suscripción y estado */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {user.is_ambassador && (
            <AmbassadorBadge size="sm" showPlanixText={true} />
          )}
          {/* Suscripcion Tier Badge */}
          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
            isPro 
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30' 
              : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
          }`}>
            Planix {user.suscripcion === 'pro' ? 'Pro' : 'Gratuito'}
          </span>

          {/* Estado Suscripcion Badge */}
          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
            isSuspended
              ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/50 dark:border-red-900/30'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30'
          }`}>
            {isSuspended ? 'Suspendido' : 'Activo'}
          </span>

          {/* Rol user Badge */}
          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
            user.rol === 'admin'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30'
              : user.rol === 'coordinator'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30'
              : user.rol === 'director'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/50 dark:border-purple-900/30'
              : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-455 border border-slate-200/50 dark:border-zinc-700/30'
          }`}>
            {user.rol === 'admin' 
              ? 'Administrador' 
              : user.rol === 'coordinator' 
              ? 'Coordinador' 
              : user.rol === 'director' 
              ? 'Director' 
              : 'Docente'}
          </span>

          {/* Auth Provider Badge */}
          {(() => {
            const provider = getAuthMethod(user);
            if (provider === 'google') {
              return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shadow-3xs gap-1">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Google
                </span>
              );
            } else {
              return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shadow-3xs gap-1">
                  <Mail size={10} className="text-slate-400 dark:text-zinc-550 shrink-0" />
                  Email
                </span>
              );
            }
          })()}

          {/* Duplicate Fingerprint warning badge */}
          {isDuplicateFingerprint && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/35 text-rose-600 dark:text-rose-400 gap-1 animate-pulse" title="Dispositivo con múltiples cuentas vinculadas">
              <AlertTriangle size={10} className="text-rose-500 shrink-0" />
              Multicuenta
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-400 font-bold">
        <span className="flex items-center gap-1.5">
          <Calendar size={11} />
          Registrado: {new Date(user.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        <span className="text-[#0046ab] dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
          Gestionar →
        </span>
      </div>
    </div>
  );
});

export default function AdminUsuarios() {
  const currentUserRef = useRef(getCurrentUser());
  const currentUser = currentUserRef.current;
  const navigate = useNavigate();

  // State variables
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Filters
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('last_login');

  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tierFilter, statusFilter, levelFilter, sortBy]);

  // Dropdown open/close states
  const [showTierDropdown, setShowTierDropdown] = useState<boolean>(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);
  const [showLevelDropdown, setShowLevelDropdown] = useState<boolean>(false);
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);

  // Selected User Modal State
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [selectedUserStats, setSelectedUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Edit user detail fields
  const [editNombre, setEditNombre] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editColegio, setEditColegio] = useState<string>('');
  const [editRol, setEditRol] = useState<RolUsuario>('teacher');
  const [editNivel, setEditNivel] = useState<string>('');
  const [editCiclo, setEditCiclo] = useState<string>('');
  const [editGrado, setEditGrado] = useState<string>('');
  const [editRegional, setEditRegional] = useState<string>('');
  const [editIsAmbassador, setEditIsAmbassador] = useState<boolean>(false);
  const [editDistrito, setEditDistrito] = useState<string>('');
  const [editYearEscolarActivo, setEditYearEscolarActivo] = useState<string>('');
  const [editSuscripcionHasta, setEditSuscripcionHasta] = useState<string>('');

  // Subject limiting states
  const [editAllowedSubjects, setEditAllowedSubjects] = useState<Record<string, string[]> | null>(null);
  const [limitSubjects, setLimitSubjects] = useState<boolean>(false);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);

  // Validate admin access
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.rol !== 'admin') {
      toast.error('Acceso denegado: Se requieren privilegios de administrador.');
      navigate('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch users from D1 on load with stale-while-revalidate caching
  const loadUsers = async () => {
    const cached = getCurrentUsersList();
    if (cached && cached.length > 0) {
      setUsers(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const d1Profiles = await requestD1<any[]>('/api/profiles');
      if (d1Profiles && Array.isArray(d1Profiles)) {
        const mappedUsers: Usuario[] = d1Profiles.map((p) => ({
          id: p.id,
          nombre: p.full_name || p.nombre || '',
          email: p.email || '',
          rol: (() => {
            const r = (p.role || p.rol || 'teacher').toLowerCase();
            if (r === 'admin' || r === 'administrador') return 'admin';
            if (r === 'coordinator' || r === 'coordinador') return 'coordinator';
            if (r === 'director') return 'director';
            return 'teacher';
          })() as RolUsuario,
          suscripcion: ((p.subscription_tier || p.suscripcion || 'free').toLowerCase()) as PlanId,
          estado_suscripcion: (() => {
            const status = (p.subscription_status || p.estado_suscripcion || 'ACTIVO').toUpperCase();
            if (status === 'ACTIVE' || status === 'ACTIVO') return 'ACTIVO';
            if (status === 'SUSPENDIDO' || status === 'SUSPENDED') return 'SUSPENDIDO';
            if (status === 'EXPIRADO' || status === 'EXPIRED') return 'EXPIRADO';
            return 'ACTIVO';
          })() as 'ACTIVO' | 'EXPIRADO' | 'SUSPENDIDO',
          suscripcion_hasta: p.subscription_expiry || p.suscripcion_hasta || new Date(Date.now() + 30 * 86400000).toISOString(),
          colegio: p.school_name || p.colegio || '',
          nivel: (() => {
            const nv = (p.nivel_principal || p.nivel || '').toLowerCase();
            if (nv.includes('inicial')) return 'inicial';
            if (nv.includes('primaria')) return 'primaria';
            if (nv.includes('secundaria')) return 'secundaria';
            return undefined;
          })(),
          ciclo: p.ciclo_principal || p.ciclo || '',
          grado: p.grado_principal || p.grado || '',
          year_escolar_activo: p.year_escolar_activo || '',
          allowed_subjects: parseAllowedSubjects(p.allowed_subjects),
          creado_en: p.created_at || p.creado_en || new Date().toISOString(),
          avatar_url: p.avatar_url || '',
          last_login: p.last_login || '',
          updated_at: p.updated_at || '',
          regional: p.regional || '',
          distrito: p.distrito || '',
          fingerprint: p.fingerprint || '',
          metodo_acceso: p.metodo_acceso || p.auth_provider || undefined,
          referred_by: p.referred_by || undefined,
          referral_code: p.referral_code || undefined,
          is_ambassador: p.is_ambassador === 1 || p.is_ambassador === true,
          preferences: typeof p.preferences === "string" ? (() => {
            try { return JSON.parse(p.preferences); } catch (_) { return {}; }
          })() : (p.preferences || {}),
        }));

        setUsers(mappedUsers);

        // Sync local storage with latest profiles to ensure consistency
        saveUsuariosBatch(mappedUsers);
      } else if (!cached || cached.length === 0) {
        // Fallback to local storage if no cache exists
        setUsers(getCurrentUsersList());
      }
    } catch (error) {
      console.error('Error fetching profiles from D1:', error);
      if (!cached || cached.length === 0) {
        toast.warning('Cargando datos locales (error al conectar con base de datos remota)');
        setUsers(getCurrentUsersList());
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUsersList = (): Usuario[] => {
    const local = localStorage.getItem('plx:users');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (_) {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    if (currentUser && currentUser.rol === 'admin') {
      loadUsers();
    }
  }, []);

  // Fetch real-time statistics when a user card is selected
  const fetchUserStats = React.useCallback(async (userId: string) => {
    setStatsLoading(true);
    setSelectedUserStats(null);
    try {
      const stats = await requestD1<UserStats>(`/api/profiles/${userId}/stats`);
      if (stats) {
        setSelectedUserStats(stats);
      } else {
        setSelectedUserStats({ classrooms: 0, plannings: 0, rubrics: 0, students: 0, attendance: 0, grades: 0 });
      }
    } catch (err) {
      console.error('Failed to load stats for user:', err);
      // fallback dummy stats if error
      setSelectedUserStats({ classrooms: 0, plannings: 0, rubrics: 0, students: 0, attendance: 0, grades: 0 });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Selection handler
  const handleSelectUser = React.useCallback((user: Usuario) => {
    setSelectedUser(user);
    setEditNombre(user.nombre);
    setEditEmail(user.email);
    setEditColegio(user.colegio || '');
    setEditRol(user.rol);
    setEditNivel(user.nivel || '');
    setEditCiclo(user.ciclo || '');
    setEditGrado(user.grado || '');
    setEditRegional(user.regional || '');
    setEditDistrito(user.distrito || '');
    setEditYearEscolarActivo(user.year_escolar_activo || '');
    setEditAllowedSubjects(parseAllowedSubjects(user.allowed_subjects));
    setEditIsAmbassador(!!user.is_ambassador);
    const parsedAllowed = parseAllowedSubjects(user.allowed_subjects);
    setLimitSubjects(!!user.allowed_subjects && Object.keys(parsedAllowed).length > 0);
    setEditSuscripcionHasta(user.suscripcion_hasta || new Date(Date.now() + 30 * 86400000).toISOString());
    setExpandedLevel(null);
    setExpandedGrade(null);
    setIsDeleting(false);
    fetchUserStats(user.id);
    setIsViewModalOpen(true);
  }, [fetchUserStats]);

  const handleLogout = () => {
    supabase.auth.signOut();
    localStorage.removeItem('plx:user');
    localStorage.removeItem('plx:session');
    toast.success("👋 Sesión cerrada correctamente.");
    navigate("/login");
  };

  // Helper to set subscription duration from presets (days)
  const handleSetProDuration = (days: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    targetDate.setHours(23, 59, 59, 999);
    setEditSuscripcionHasta(targetDate.toISOString());
  };

  // Helper to set custom expiration date from date picker input
  const handleSetCustomExpiryDate = (dateStr: string) => {
    if (!dateStr) return;
    const targetDate = new Date(dateStr + 'T23:59:59');
    setEditSuscripcionHasta(targetDate.toISOString());
  };

  // 1. Toggle Suscripción: Habilitar / Deshabilitar Pro
  const handleTogglePro = async (user: Usuario) => {
    const newTier: PlanId = user.suscripcion === 'pro' ? 'free' : 'pro';
    const updatedUser: Usuario = {
      ...user,
      suscripcion: newTier,
      // If upgraded, ensure status is ACTIVE
      estado_suscripcion: newTier === 'pro' ? 'ACTIVO' : user.estado_suscripcion,
      suscripcion_hasta: newTier === 'pro' 
        ? editSuscripcionHasta // Use the user-selected date
        : user.suscripcion_hasta
    };

    await saveAndSyncUser(updatedUser, `Docente ${newTier === 'pro' ? 'ascendido a Planix PRO ★' : 'cambiado a Plan Gratuito'}`);
  };

  // 2. Suspender / Activar cuenta de usuario
  const handleToggleSuspension = async (user: Usuario) => {
    const newStatus = user.estado_suscripcion === 'SUSPENDIDO' ? 'ACTIVO' : 'SUSPENDIDO';
    const updatedUser: Usuario = {
      ...user,
      estado_suscripcion: newStatus as any
    };

    await saveAndSyncUser(updatedUser, `Cuenta de docente ${newStatus === 'SUSPENDIDO' ? 'SUSPENDIDA temporalmente' : 'ACTIVADA de nuevo'}`);
  };
  // Save changes from details modal (name, school, role, level, allowed_subjects)
  const handleUpdateDetails = async () => {
    if (!selectedUser) return;
    if (!editNombre.trim()) {
      toast.error('El nombre no puede estar vacío.');
      return;
    }
    if (!editEmail.trim()) {
      toast.error('El correo electrónico no puede estar vacío.');
      return;
    }

    const updatedPreferences = {
      ...(selectedUser.preferences || {}),
    };
    if (editIsAmbassador && !selectedUser.is_ambassador) {
      updatedPreferences.has_seen_ambassador_celebration = false;
    }

    const updatedUser: Usuario = {
      ...selectedUser,
      nombre: editNombre.trim(),
      email: editEmail.trim(),
      colegio: editColegio.trim() || undefined,
      rol: editRol,
      nivel: (editNivel as any) || undefined,
      ciclo: editCiclo || undefined,
      grado: editGrado || undefined,
      regional: editRegional.trim() || undefined,
      distrito: editDistrito.trim() || undefined,
      year_escolar_activo: editYearEscolarActivo.trim() || undefined,
      allowed_subjects: editAllowedSubjects || {},
      suscripcion_hasta: editSuscripcionHasta,
      is_ambassador: editIsAmbassador,
      preferences: updatedPreferences
    };

    await saveAndSyncUser(updatedUser, 'Detalles del usuario actualizados correctamente.');
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const toggleLimitSubjects = (checked: boolean) => {
    setLimitSubjects(checked);
    if (!checked) {
      setEditAllowedSubjects(null);
    } else {
      if (!editAllowedSubjects) {
        setEditAllowedSubjects({});
      }
    }
  };

  const handleSubjectToggle = (gradeId: string, subjectId: string) => {
    const currentAllowed = editAllowedSubjects || {};
    const gradeSubjects = currentAllowed[gradeId] || [];

    const subject = OFFICIAL_DEFAULT_SUBJECTS.find(s => s.id === subjectId);
    if (!subject) return;

    const normSubName = normalizeString(subject.name);
    const normSubId = normalizeString(subject.id);

    const isMatching = (id: string) => {
        if (id === subjectId) return true;
        const normAllowed = normalizeString(id);
        return normAllowed === normSubName ||
            normAllowed === normSubId ||
            normSubName.includes(normAllowed) ||
            normAllowed.includes(normSubName);
    };

    const existingMatch = gradeSubjects.some(isMatching);

    let newGradeSubjects;
    if (existingMatch) {
        newGradeSubjects = gradeSubjects.filter(id => !isMatching(id));
    } else {
        newGradeSubjects = [...gradeSubjects, subjectId];
    }

    const newAllowed = {
        ...currentAllowed,
        [gradeId]: newGradeSubjects
    };

    if (newGradeSubjects.length === 0) {
        const { [gradeId]: _, ...rest } = newAllowed;
        setEditAllowedSubjects(rest);
    } else {
        setEditAllowedSubjects(newAllowed);
    }
  };

  // Sync to database and local storage helper
  const saveAndSyncUser = async (updatedUser: Usuario, successMessage: string) => {
    try {
      // Map to database schema
      const d1Profile = {
        id: updatedUser.id,
        full_name: updatedUser.nombre,
        email: updatedUser.email,
        role: updatedUser.rol,
        subscription_tier: updatedUser.suscripcion,
        subscription_status: updatedUser.estado_suscripcion,
        subscription_expiry: updatedUser.suscripcion_hasta,
        school_name: updatedUser.colegio || null,
        nivel_principal: updatedUser.nivel || null,
        ciclo_principal: updatedUser.ciclo || null,
        grado_principal: updatedUser.grado || null,
        allowed_subjects: updatedUser.allowed_subjects,
        is_active: updatedUser.estado_suscripcion === 'ACTIVO' ? 1 : 0,
        avatar_url: updatedUser.avatar_url || null,
        referred_by: updatedUser.referred_by || null,
        referral_code: updatedUser.referral_code || null,
        year_escolar_activo: updatedUser.year_escolar_activo || null,
        regional: updatedUser.regional || null,
        distrito: updatedUser.distrito || null,
        is_ambassador: updatedUser.is_ambassador ? 1 : 0,
        preferences: updatedUser.preferences ? JSON.stringify(updatedUser.preferences) : null
      };

      // API call to cloud database
      await requestD1('/api/profiles', 'POST', d1Profile);
      
      // Update local state lists
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (selectedUser && selectedUser.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }

      // Sync local storage
      saveUsuario(updatedUser);
      toast.success(successMessage);
    } catch (error) {
      console.error('Error syncing profile updates:', error);
      toast.error('Error al guardar en base de datos. Se actualizó localmente.');
      
      // Update local state list as fallback
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (selectedUser && selectedUser.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }
      saveUsuario(updatedUser);
    }
  };

  // 3. Eliminar cuenta de usuario
  const handleDeleteUserAccount = async (userId: string) => {
    try {
      // API call to delete from D1 (deletes cascade plannings, classrooms, students, rubrics, evaluations, etc.)
      await requestD1(`/api/profiles/${userId}`, 'DELETE');

      // Update state lists
      setUsers(prev => prev.filter(u => u.id !== userId));
      deleteUsuario(userId);

      toast.success('Cuenta eliminada permanentemente del sistema.');
      setSelectedUser(null);
      setIsDeleting(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error de red al intentar eliminar la cuenta de usuario.');
    }
  };

  // Stats indicators calculations
  const totalUsersCount = users.length;

  // Detect duplicate fingerprints
  const fingerprintCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach(u => {
      if (u.fingerprint) {
        counts[u.fingerprint] = (counts[u.fingerprint] || 0) + 1;
      }
    });
    return counts;
  }, [users]);

  const proUsersCount = React.useMemo(() => users.filter(u => u.suscripcion === 'pro').length, [users]);
  const suspendedUsersCount = React.useMemo(() => users.filter(u => u.estado_suscripcion === 'SUSPENDIDO').length, [users]);
  const proRatio = React.useMemo(() => totalUsersCount > 0 ? ((proUsersCount / totalUsersCount) * 100).toFixed(1) : '0', [totalUsersCount, proUsersCount]);
  const onlineCount = React.useMemo(() => {
    const now = new Date().getTime();
    return users.filter(u => {
      if (u.id === currentUser?.id) return true;
      const lastLoginStr = u.last_login || u.updated_at;
      if (!lastLoginStr) return false;
      const lastLoginTime = new Date(lastLoginStr).getTime();
      const diffMins = (now - lastLoginTime) / (1000 * 60);
      return diffMins >= 0 && diffMins <= 4;
    }).length;
  }, [users, currentUser]);

  // Filters logic
  const filteredUsers = React.useMemo(() => {
    const filtered = users.filter((u) => {
      // Search query
      const matchSearch = 
        u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.colegio && u.colegio.toLowerCase().includes(searchQuery.toLowerCase()));

      // Subscription tier filter
      const matchTier = 
        tierFilter === 'all' || 
        (u.suscripcion && u.suscripcion.toLowerCase() === tierFilter.toLowerCase());

      // Status filter
      const matchStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'activo' && u.estado_suscripcion === 'ACTIVO') ||
        (statusFilter === 'suspendido' && u.estado_suscripcion === 'SUSPENDIDO') ||
        (statusFilter === 'expirado' && u.estado_suscripcion === 'EXPIRADO');

      // Nivel filter
      const matchLevel = 
        levelFilter === 'all' || 
        (u.nivel && u.nivel.toLowerCase() === levelFilter.toLowerCase());

      return matchSearch && matchTier && matchStatus && matchLevel;
    });

    // Sort logic
    return [...filtered].sort((a, b) => {
      if (sortBy === 'last_login') {
        const timeA = new Date(a.last_login || a.updated_at || a.creado_en || 0).getTime();
        const timeB = new Date(b.last_login || b.updated_at || b.creado_en || 0).getTime();
        return timeB - timeA; // latest first
      }
      if (sortBy === 'most_active') {
        const timeA = new Date(a.last_login || a.updated_at || 0).getTime();
        const timeB = new Date(b.last_login || b.updated_at || 0).getTime();
        return timeB - timeA; // latest activity first
      }
      if (sortBy === 'newest') {
        const timeA = new Date(a.creado_en || 0).getTime();
        const timeB = new Date(b.creado_en || 0).getTime();
        return timeB - timeA; // newest first
      }
      if (sortBy === 'oldest') {
        const timeA = new Date(a.creado_en || 0).getTime();
        const timeB = new Date(b.creado_en || 0).getTime();
        return timeA - timeB; // oldest first
      }
      return 0;
    });
  }, [users, searchQuery, tierFilter, statusFilter, levelFilter, sortBy]);

  const levels = React.useMemo(() => getAllLevels(), []);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const paginatedUsers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-zinc-950 text-neutral-800 dark:text-zinc-200 flex flex-col p-4 md:p-6 gap-6 relative select-none">
      <Toaster position="top-center" richColors />

      {/* Top Header Navigation */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-zinc-900 px-6 py-5 rounded-[28px] border border-black/5 dark:border-zinc-800 shadow-xs gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-[#0046ab] dark:text-blue-400 shrink-0">
            <Users size={18} className="fill-blue-500/20 text-[#0046ab] dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
              Gestión de Usuarios
              <span className="text-[10px] font-black uppercase bg-[#0046ab]/10 text-[#0046ab] dark:bg-blue-950/30 dark:text-blue-400 border border-[#0046ab]/10 px-2.5 py-0.5 rounded-full tracking-wider">
                Docentes
              </span>
            </h1>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">
              Supervisa, edita planes y administra el acceso de los docentes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/admin/online')}
            className="flex items-center gap-2 rounded-full border border-emerald-550/20 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-455 py-2 px-4.5 text-xs font-bold transition-all shadow-3xs cursor-pointer select-none"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{onlineCount} docentes online</span>
          </button>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 rounded-2xl bg-[#0046ab] hover:bg-[#003c94] active:scale-[0.99] text-white py-2.5 px-5 text-xs font-black shadow-sm hover:shadow-md transition-all cursor-pointer outline-hidden"
          >
            <ArrowLeft size={14} className="text-white" />
            Volver al Panel de Administración
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="w-full py-2">
        <div className="max-w-7xl mx-auto space-y-8 text-left">
          
          {/* Header Title */}
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1B1B1B] dark:text-white leading-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 mt-1">
              Supervisa, edita planes y administra el acceso de los docentes de la plataforma Planix.
            </p>
          </div>

          {/* Tarjetas de Métricas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              {
                title: 'Docentes Registrados',
                value: totalUsersCount,
                subtitle: 'Total de perfiles',
                icon: <Users size={18} className="fill-indigo-500/20 text-indigo-650 dark:text-indigo-400" />,
                cardBg: 'bg-gradient-to-br from-[#E0E7FF] to-[#EDE9FE] dark:from-indigo-950/20 dark:to-slate-900/60',
                border: 'border border-indigo-550/10 dark:border-indigo-500/5 shadow-3xs'
              },
              {
                title: 'Usuarios Planix Pro',
                value: proUsersCount,
                subtitle: `${proRatio}% conversión`,
                icon: <Crown size={18} className="fill-amber-500/20 text-amber-600 dark:text-amber-450" />,
                cardBg: 'bg-gradient-to-br from-[#FFF4E0] to-[#FFE4E1] dark:from-amber-950/20 dark:to-slate-900/60',
                border: 'border border-amber-550/10 dark:border-amber-500/5 shadow-3xs'
              },
              {
                title: 'Docentes Suspendidos',
                value: suspendedUsersCount,
                subtitle: 'Acceso bloqueado',
                icon: <UserX size={18} className="fill-rose-500/20 text-rose-600 dark:text-rose-455" />,
                cardBg: 'bg-gradient-to-br from-[#FFF5F5] to-[#FFE3E3] dark:from-rose-950/20 dark:to-slate-900/60',
                border: 'border border-rose-550/10 dark:border-rose-500/5 shadow-3xs'
              },
              {
                title: 'Tasa de Actividad',
                value: '100%',
                subtitle: 'Sincronizados D1',
                icon: <Activity size={18} className="fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />,
                cardBg: 'bg-gradient-to-br from-[#E6F4EA] to-[#F1F9F5] dark:from-emerald-950/20 dark:to-slate-900/60',
                border: 'border border-emerald-550/10 dark:border-emerald-500/5 shadow-3xs'
              }
            ].map((metric, i) => (
              <Card
                key={i}
                className={`p-6 rounded-[28px] flex items-start justify-between select-none text-left transition-all duration-300 hover:-translate-y-0.5 ${metric.cardBg} ${metric.border}`}
              >
                <div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block">{metric.title}</span>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1.5 leading-none">{metric.value}</h3>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-550 mt-2.5 block font-bold">{metric.subtitle}</span>
                </div>
                <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs shrink-0">
                  {metric.icon}
                </div>
              </Card>
            ))}
          </div>

          {/* Barra de Controles: Búsqueda y Filtros */}
          <Card className="p-4 border border-black/5 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 shadow-2xs">
            <div className="flex flex-row flex-wrap items-center gap-3 w-full">
              
              {/* Barra de Búsqueda */}
              <div className="relative flex-1 min-w-[280px] max-w-sm">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar docente por nombre, email o colegio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-11 pr-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-zinc-200 placeholder:text-slate-400 focus:border-[#0046ab] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#0046ab]/20 outline-none transition-all shadow-xs font-semibold"
                />
              </div>

              {/* Badge Filtros */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-955 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 shrink-0">
                <Filter size={12} />
                <span>Filtros:</span>
              </div>

              {/* Plan Tier Filter */}
              <div className="relative select-none">
                <button
                  type="button"
                  onClick={() => {
                    setShowTierDropdown(!showTierDropdown);
                    setShowStatusDropdown(false);
                    setShowLevelDropdown(false);
                    setShowSortDropdown(false);
                  }}
                  className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs px-4 py-2.5 rounded-2xl text-slate-700 dark:text-zinc-350 outline-none font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all shadow-3xs select-none min-w-[140px]"
                >
                  <span>
                    {tierFilter === 'all' && 'Suscripción: Todos'}
                    {tierFilter === 'free' && 'Solo Gratuito'}
                    {tierFilter === 'pro' && 'Solo Pro'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${showTierDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showTierDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowTierDropdown(false)} />
                    <div className="absolute left-0 sm:right-0 top-full mt-1.5 w-full sm:w-52 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                      <div className="space-y-0.5">
                        {[
                          { value: 'all', label: 'Suscripción: Todos' },
                          { value: 'free', label: 'Solo Gratuito' },
                          { value: 'pro', label: 'Solo Pro' }
                        ].map((opt) => {
                          const isSelected = tierFilter === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                  setTierFilter(opt.value);
                                  setShowTierDropdown(false);
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

              {/* Status Filter */}
              <div className="relative select-none">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowTierDropdown(false);
                    setShowLevelDropdown(false);
                    setShowSortDropdown(false);
                  }}
                  className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs px-4 py-2.5 rounded-2xl text-slate-700 dark:text-zinc-350 outline-none font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all shadow-3xs select-none min-w-[140px]"
                >
                  <span>
                    {statusFilter === 'all' && 'Estado: Todos'}
                    {statusFilter === 'activo' && 'Solo Activos'}
                    {statusFilter === 'suspendido' && 'Solo Suspendidos'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showStatusDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)} />
                    <div className="absolute left-0 sm:right-0 top-full mt-1.5 w-full sm:w-52 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                      <div className="space-y-0.5">
                        {[
                          { value: 'all', label: 'Estado: Todos' },
                          { value: 'activo', label: 'Solo Activos' },
                          { value: 'suspendido', label: 'Solo Suspendidos' }
                        ].map((opt) => {
                          const isSelected = statusFilter === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setStatusFilter(opt.value);
                                setShowStatusDropdown(false);
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

              {/* Level Filter */}
              <div className="relative select-none">
                <button
                  type="button"
                  onClick={() => {
                    setShowLevelDropdown(!showLevelDropdown);
                    setShowTierDropdown(false);
                    setShowStatusDropdown(false);
                    setShowSortDropdown(false);
                  }}
                  className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs px-4 py-2.5 rounded-2xl text-slate-700 dark:text-zinc-350 outline-none font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all shadow-3xs select-none min-w-[140px]"
                >
                  <span>
                    {levelFilter === 'all' && 'Nivel: Todos'}
                    {levelFilter === 'inicial' && 'Inicial'}
                    {levelFilter === 'primaria' && 'Primaria'}
                    {levelFilter === 'secundaria' && 'Secundaria'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${showLevelDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showLevelDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLevelDropdown(false)} />
                    <div className="absolute left-0 sm:right-0 top-full mt-1.5 w-full sm:w-52 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                      <div className="space-y-0.5">
                        {[
                          { value: 'all', label: 'Nivel: Todos' },
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

              {/* Sort By Dropdown */}
              <div className="relative select-none">
                <button
                  type="button"
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowTierDropdown(false);
                    setShowStatusDropdown(false);
                    setShowLevelDropdown(false);
                  }}
                  className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs px-4 py-2.5 rounded-2xl text-slate-700 dark:text-zinc-350 outline-none font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all shadow-3xs select-none min-w-[185px]"
                >
                  <span>
                    Ordenar por: {sortBy === 'last_login' && 'Última Conexión'}
                    {sortBy === 'most_active' && 'Más Activos (Sesiones)'}
                    {sortBy === 'newest' && 'Nuevos Usuarios'}
                    {sortBy === 'oldest' && 'Usuarios más antiguos'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                    <div className="absolute left-0 sm:right-0 top-full mt-1.5 w-full sm:w-56 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                      <div className="space-y-0.5">
                        {[
                          { value: 'last_login', label: 'Última Conexión' },
                          { value: 'most_active', label: 'Más Activos (Sesiones)' },
                          { value: 'newest', label: 'Nuevos Usuarios' },
                          { value: 'oldest', label: 'Usuarios más antiguos' }
                        ].map((opt) => {
                          const isSelected = sortBy === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setSortBy(opt.value);
                                setShowSortDropdown(false);
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
          </Card>

          {/* Listado de Docentes (Clickable Cards Grid) */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-zinc-900 rounded-[32px] border border-black/5 dark:border-zinc-800 shadow-2xs">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0046ab] mb-4"></div>
              <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Cargando docentes del sistema...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-20 text-center bg-white dark:bg-zinc-900 rounded-[32px] border border-black/5 dark:border-zinc-800 shadow-2xs space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-700 dark:text-zinc-300">No se encontraron docentes</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-555">Prueba a modificar los filtros o el término de búsqueda.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedUsers.map((user) => (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    onSelect={handleSelectUser} 
                    isDuplicateFingerprint={!!user.fingerprint && fingerprintCounts[user.fingerprint] > 1}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 select-none">
                  {/* Previous Page Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === 1
                        ? 'bg-slate-50/50 border-slate-200 text-slate-300 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-700 cursor-not-allowed'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/80 shadow-3xs hover:scale-105 active:scale-95'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`ell-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold">
                          ...
                        </span>
                      );
                    }

                    const isCurrent = page === currentPage;
                    return (
                      <button
                        key={`page-${page}`}
                        type="button"
                        onClick={() => setCurrentPage(Number(page))}
                        className={`w-10 h-10 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                          isCurrent
                            ? 'bg-[#0046ab] text-white border border-[#0046ab] shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/80 shadow-3xs hover:scale-105 active:scale-95'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next Page Button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === totalPages
                        ? 'bg-slate-50/50 border-slate-200 text-slate-300 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-700 cursor-not-allowed'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/80 shadow-3xs hover:scale-105 active:scale-95'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      {isViewModalOpen && selectedUser && (
        <div 
          onClick={() => {
            setIsViewModalOpen(false);
            setSelectedUser(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[600px] bg-white dark:bg-zinc-900 rounded-[28px] border border-black/5 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col text-left max-h-[90vh]"
          >
            {/* Cabecera del Modal */}
            <div className="px-5 py-4 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-850 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight">Detalles del Usuario</h3>

              {/* Botón cerrar */}
              <button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedUser(null);
                }}
                className="w-8 h-8 rounded-full bg-[#EA4335] hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-xs select-none cursor-pointer outline-none border-none shrink-0"
                title="Cerrar"
              >
                <X size={15} strokeWidth={3} />
              </button>
            </div>

            {/* Cuerpo del Modal (Scrollable) */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 font-sans">
              
              {/* Perfil del Usuario */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-zinc-850">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.nombre || 'Profile'}
                    className="h-14 w-14 rounded-full object-cover shadow-[0_4px_12px_rgba(59,130,246,0.25)] border-2 border-white dark:border-zinc-800"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://randomuser.me/api/portraits/women/47.jpg";
                    }}
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#0046ab] to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-[0_4px_12px_rgba(59,130,246,0.25)] border-2 border-white dark:border-zinc-800">
                    {selectedUser.nombre?.charAt(0) || '?'}
                  </div>
                )}
                <div className="flex-1 text-left">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">{selectedUser.nombre}</h3>
                  <p className="text-slate-455 dark:text-zinc-500 text-xs mt-0.5">{selectedUser.email}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      selectedUser.rol === 'admin'
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30'
                        : selectedUser.rol === 'coordinator'
                        ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-955/40 dark:text-amber-400 dark:border-amber-900/30'
                        : selectedUser.rol === 'director'
                        ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-955/40 dark:text-purple-400 dark:border-purple-900/30'
                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-850 dark:text-zinc-300 dark:border-zinc-705/30'
                    }`}>
                      {selectedUser.rol === 'admin' 
                        ? 'Administrador' 
                        : selectedUser.rol === 'coordinator' 
                        ? 'Coordinador' 
                        : selectedUser.rol === 'director' 
                        ? 'Director' 
                        : 'DOCENTE'}
                    </span>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border-none ${
                      selectedUser.estado_suscripcion === 'SUSPENDIDO'
                        ? 'bg-[#EA4335] text-white dark:bg-rose-600 dark:text-white'
                        : 'bg-[#059669] text-white dark:bg-emerald-600 dark:text-white'
                    }`}>
                      {selectedUser.estado_suscripcion === 'SUSPENDIDO' ? 'Suspendida' : 'Activa'}
                    </span>

                    {(() => {
                      const provider = getAuthMethod(selectedUser);
                      if (provider === 'google') {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-350 shadow-3xs gap-1">
                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                            </svg>
                            Google
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-355 shadow-3xs gap-1">
                            <Mail size={10} className="text-slate-400 dark:text-zinc-550 shrink-0" />
                            Email
                          </span>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>

              {/* Suscripción y Nivel de Acceso */}
              <div className="pt-4.5 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 mb-3 pl-0.5">
                  <Crown size={12} className="text-slate-400 shrink-0" />
                  <h4 className="text-[10px] font-black text-slate-700 dark:text-zinc-400 uppercase tracking-widest">
                    Suscripción y Nivel de Acceso
                  </h4>
                </div>
                
                <div className="p-4 rounded-2xl border border-slate-150 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-955/20 space-y-4">
                  {/* Info del plan actual */}
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Crown size={14} className={selectedUser.suscripcion === 'pro' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'} />
                      <span className="font-bold">
                        {selectedUser.suscripcion === 'pro' 
                          ? 'Plan Premium (Planix Pro)' 
                          : 'Plan de Acceso Gratuito (Planix Gratuito)'}
                      </span>
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold mt-1 leading-normal">
                      {selectedUser.suscripcion === 'pro'
                        ? 'El docente cuenta con acceso ilimitado a todas las herramientas de planificación, rúbricas, asistencia, exámenes con IA y almacenamiento en la nube.'
                        : 'El docente se encuentra en el plan de inicio limitado. Cuenta con las herramientas base del aula y hasta 2 aulas virtuales activas.'}
                    </p>
                  </div>

                  {/* Establecer duración */}
                  <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-zinc-800">
                    <div className="flex justify-between items-center">
                      <span className="text-[9.5px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                        Establecer Duración para Planix Pro
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        selectedUser.suscripcion === 'pro' 
                          ? 'bg-amber-105 text-amber-700 dark:bg-amber-955/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30' 
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30'
                      }`}>
                        {selectedUser.suscripcion === 'pro' 
                          ? `Vence: ${selectedUser.suscripcion_hasta ? new Date(selectedUser.suscripcion_hasta).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Sin fecha'}`
                          : 'Plan Gratuito: Sin vencimiento'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {/* Presets */}
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '7D', days: 7 },
                          { label: '15D', days: 15 },
                          { label: '30D', days: 30 },
                          { label: '90D', days: 90 },
                          { label: '1A', days: 365 }
                        ].map((preset) => {
                          const targetDate = new Date();
                          targetDate.setDate(targetDate.getDate() + preset.days);
                          const isSameDay = editSuscripcionHasta && 
                            new Date(editSuscripcionHasta).toDateString() === targetDate.toDateString();

                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => handleSetProDuration(preset.days)}
                              className={`h-7 px-3 rounded-lg text-[10px] font-black transition-all border outline-none select-none cursor-pointer ${
                                isSameDay
                                  ? 'bg-[#0046ab] border-[#0046ab] text-white dark:bg-blue-600 dark:border-blue-600'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/80'
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Date Input */}
                      <div className="relative flex-1 max-w-[160px]">
                        <input
                          type="date"
                          value={editSuscripcionHasta ? new Date(editSuscripcionHasta).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleSetCustomExpiryDate(e.target.value)}
                          className="w-full h-8 px-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer focus:border-[#0046ab]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Acciones de la Suscripción */}
                  <div className="flex gap-2 pt-3 border-t border-slate-200/60 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleTogglePro(selectedUser)}
                      className={`flex-1 h-9 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer outline-none border ${
                        selectedUser.suscripcion === 'pro'
                          ? 'bg-[#FFF5F5] border-[#FEE2E2] text-[#E53E3E] hover:bg-[#FED7D7] dark:bg-rose-955/10 dark:border-rose-800/30 dark:text-rose-455 dark:hover:bg-rose-900/20'
                          : 'bg-[#0046ab] border-[#0046ab] text-white hover:bg-[#003d96] dark:bg-blue-600 dark:border-blue-600 dark:hover:bg-blue-700 shadow-xs'
                      }`}
                    >
                      <Zap size={13} className="shrink-0" />
                      <span className="font-bold">
                        {selectedUser.suscripcion === 'pro' ? 'Quitar Planix Pro' : 'Habilitar Planix Pro'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSuspension(selectedUser)}
                      className={`flex-1 h-9 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer outline-none border ${
                        selectedUser.estado_suscripcion === 'SUSPENDIDO'
                          ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669] hover:bg-[#D1FAE5] dark:bg-emerald-955/10 dark:border-emerald-800/30 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                          : 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706] hover:bg-[#FEF3C7] dark:bg-amber-955/10 dark:border-amber-800/30 dark:text-amber-500 dark:hover:bg-amber-900/20'
                      }`}
                    >
                      <UserX size={13} className="shrink-0" />
                      <span className="font-bold">
                        {selectedUser.estado_suscripcion === 'SUSPENDIDO' ? 'Activar Cuenta' : 'Suspender Acceso'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Estadísticas de Uso */}
              <div>
                <h4 className="text-[10px] font-black text-slate-750 dark:text-zinc-400 uppercase tracking-widest mb-3 pl-0.5">Estadísticas de Uso</h4>
                {statsLoading ? (
                  <div className="flex items-center justify-center p-6 bg-slate-50/50 dark:bg-zinc-955/20 border border-slate-100/50 dark:border-zinc-855 rounded-2xl">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0046ab] mr-2"></div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargando estadísticas...</span>
                  </div>
                ) : selectedUserStats ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { 
                        label: 'ESTUDIANTES', 
                        val: selectedUserStats.students, 
                        icon: <Users size={11} className="shrink-0" />,
                        bg: 'bg-white dark:bg-zinc-900', 
                        border: 'border border-slate-200 dark:border-zinc-800', 
                        labelText: 'text-slate-400 dark:text-zinc-550', 
                        valText: 'text-slate-800 dark:text-zinc-100' 
                      },
                      { 
                        label: 'GRUPOS', 
                        val: selectedUserStats.classrooms, 
                        icon: <Building size={11} className="shrink-0" />,
                        bg: 'bg-white dark:bg-zinc-900', 
                        border: 'border border-slate-200 dark:border-zinc-800', 
                        labelText: 'text-slate-400 dark:text-zinc-550', 
                        valText: 'text-slate-800 dark:text-zinc-100' 
                      },
                      { 
                        label: 'PLANIFICACIONES', 
                        val: selectedUserStats.plannings, 
                        icon: <FileText size={11} className="shrink-0" />,
                        bg: 'bg-[#F5F3FF] dark:bg-indigo-950/20', 
                        border: 'border border-[#DDD6FE] dark:border-indigo-900/30', 
                        labelText: 'text-[#6D28D9] dark:text-purple-400', 
                        valText: 'text-[#6D28D9] dark:text-purple-400' 
                      },
                      { 
                        label: 'RÚBRICAS', 
                        val: selectedUserStats.rubrics, 
                        icon: <Award size={11} className="shrink-0" />,
                        bg: 'bg-[#FFFBEB] dark:bg-amber-955/20', 
                        border: 'border border-[#FDE68A] dark:border-amber-900/35', 
                        labelText: 'text-[#D97706] dark:text-amber-400', 
                        valText: 'text-[#D97706] dark:text-amber-400' 
                      },
                      { 
                        label: 'ASISTENCIA', 
                        val: selectedUserStats.attendance, 
                        icon: <CheckSquare size={11} className="shrink-0" />,
                        bg: 'bg-[#EFF6FF] dark:bg-blue-950/20', 
                        border: 'border border-[#BFDBFE] dark:border-blue-900/30', 
                        labelText: 'text-[#1D4ED8] dark:text-blue-400', 
                        valText: 'text-slate-800 dark:text-zinc-100' 
                      },
                      { 
                        label: 'CALIFICACIONES', 
                        val: selectedUserStats.grades, 
                        icon: <FileSpreadsheet size={11} className="shrink-0" />,
                        bg: 'bg-[#F0FDF4] dark:bg-emerald-950/20', 
                        border: 'border border-[#DCFCE7] dark:border-emerald-900/30', 
                        labelText: 'text-[#16A34A] dark:text-emerald-400', 
                        valText: 'text-[#16A34A] dark:text-emerald-400' 
                      }
                    ].map((stat, idx) => (
                      <div key={idx} className={`px-2.5 py-1.5 rounded-lg text-center flex flex-col items-center justify-center select-none ${stat.bg} ${stat.border} shadow-3xs`}>
                        <span className={`flex items-center justify-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider ${stat.labelText}`}>
                          {stat.icon}
                          {stat.label}
                        </span>
                        <span className={`text-[21px] mt-0.5 block font-extrabold leading-none ${stat.valText}`}>{stat.val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50/50 dark:bg-rose-955/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-center text-xs text-rose-650 dark:text-rose-455 font-bold">
                    No se pudieron cargar las estadísticas.
                  </div>
                )}
              </div>

              {/* Información Académica */}
              <div className="pt-4.5 border-t border-slate-100 dark:border-zinc-800">
                <h4 className="text-[10px] font-black text-slate-700 dark:text-zinc-400 uppercase tracking-widest mb-3 pl-0.5">Información Académica</h4>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-5">
                  <div>
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">Centro Educativo</p>
                    <p className="font-extrabold text-[12px] text-slate-800 dark:text-zinc-150 uppercase leading-relaxed">{selectedUser.colegio || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">Nivel Principal</p>
                    <p className="font-extrabold text-[12px] text-slate-805 dark:text-zinc-150 uppercase leading-relaxed">{selectedUser.nivel || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">Regional / Distrito</p>
                    <p className="font-extrabold text-[12px] text-slate-855 dark:text-zinc-150 uppercase leading-relaxed">
                      {selectedUser.regional || '-'} / {selectedUser.distrito || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">Fecha de Registro</p>
                    <p className="font-extrabold text-[12px] text-slate-805 dark:text-zinc-150 leading-relaxed">
                      {selectedUser.creado_en ? new Date(selectedUser.creado_en).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      }) : '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">ID del Usuario</p>
                    <code className="bg-slate-50 dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg text-[9.5px] font-mono break-all block mt-1 text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-850">
                      {selectedUser.id}
                    </code>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">Identificador de Dispositivo (Fingerprint)</p>
                    {selectedUser.fingerprint ? (
                      <>
                        <code className="bg-slate-50 dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg text-[9.5px] font-mono break-all block mt-1 text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-850">
                          {selectedUser.fingerprint}
                        </code>
                        {fingerprintCounts[selectedUser.fingerprint] > 1 && (
                          <div className="mt-2 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-455 px-3 py-2 rounded-xl text-[11px] font-bold animate-pulse">
                            <AlertTriangle size={13} className="text-rose-500 shrink-0" />
                            <span>Detección Multicuenta ({fingerprintCounts[selectedUser.fingerprint]} cuentas vinculadas)</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-zinc-500 italic mt-0.5 font-bold">Huella digital no registrada (Usuario antiguo o sin login reciente)</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sistema de Referidos */}
              {(() => {
                const referrer = selectedUser.referred_by 
                  ? users.find(u => u.id === selectedUser.referred_by) 
                  : null;
                const userReferrals = users.filter(u => u.referred_by === selectedUser.id);

                return (
                  <div className="pt-4.5 border-t border-slate-100 dark:border-zinc-800">
                    <h4 className="text-[10px] font-black text-slate-700 dark:text-zinc-400 uppercase tracking-widest mb-3 pl-0.5">Sistema de Referidos</h4>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-5 text-left">
                      <div>
                        <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">Código de Referido</p>
                        <code className="bg-slate-50 dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold block mt-1 text-indigo-650 dark:text-indigo-400 border border-slate-100 dark:border-zinc-850">
                          {selectedUser.referral_code || 'No asignado'}
                        </code>
                      </div>
                      <div>
                        <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">Invitado por</p>
                        {referrer ? (
                          <div className="mt-1 font-extrabold text-[12px] text-slate-800 dark:text-zinc-150 leading-tight">
                            {referrer.nombre}
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-semibold mt-0.5">
                              {referrer.email}
                            </span>
                          </div>
                        ) : selectedUser.referred_by ? (
                          <p className="mt-1 font-bold text-[11px] text-slate-550 dark:text-zinc-455 italic">
                            ID: {selectedUser.referred_by}
                          </p>
                        ) : (
                          <p className="mt-1 font-bold text-[11px] text-slate-500 dark:text-zinc-450 italic">
                            Registro directo (Sin referente)
                          </p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                          Colegas Invitados ({userReferrals.length})
                        </p>
                        {userReferrals.length > 0 ? (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {userReferrals.map(refUser => (
                              <div 
                                key={refUser.id} 
                                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/60 dark:bg-zinc-955/30 border border-slate-150 dark:border-zinc-850 text-xs font-bold text-left"
                              >
                                <span className="text-slate-800 dark:text-zinc-200 truncate pr-2">
                                  {refUser.nombre}
                                </span>
                                <span className="text-[10px] text-slate-455 dark:text-zinc-500 font-mono select-all">
                                  {refUser.email}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 dark:text-zinc-500 italic mt-0.5 font-bold">
                            Este docente aún no ha invitado a otros colegas.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer de Acciones del Modal */}
            <div className="px-5 py-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-850 flex justify-between items-center gap-3 shrink-0">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleSuspension(selectedUser)}
                  className={`h-8.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer border ${
                    selectedUser.estado_suscripcion === 'SUSPENDIDO'
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669] hover:bg-[#D1FAE5] dark:bg-emerald-955/10 dark:border-emerald-800/30 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                      : 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706] hover:bg-[#FEF3C7] dark:bg-amber-955/10 dark:border-amber-800/30 dark:text-amber-500 dark:hover:bg-amber-900/20'
                  }`}
                >
                  <UserX size={13} />
                  {selectedUser.estado_suscripcion === 'SUSPENDIDO' ? 'Activar Cuenta' : 'Suspender'}
                </button>
                {selectedUser.email !== 'admin@planix.do' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setIsEditModalOpen(true);
                      setIsDeleting(true);
                    }}
                    className="h-8.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer bg-[#FFF5F5] border border-[#FEE2E2] text-[#E53E3E] hover:bg-[#FED7D7] dark:bg-rose-955/10 dark:border-rose-800/30 dark:text-rose-455 dark:hover:bg-rose-900/20"
                  >
                    <Trash2 size={13} />
                    Eliminar
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="h-8.5 px-4.5 bg-slate-50 border border-slate-200 text-slate-655 hover:bg-slate-100 dark:bg-zinc-800/30 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/60 rounded-full font-bold text-xs select-none cursor-pointer outline-none transition-all"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="h-8.5 px-4.5 bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5] hover:bg-[#E0E7FF] dark:bg-indigo-950/20 dark:border-indigo-800/30 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-full font-black text-xs select-none cursor-pointer outline-none transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Pencil size={12} className="text-[#4F46E5] dark:text-indigo-400 shrink-0" />
                  EDITAR DETALLES
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDICION DE DETALLES DEL USUARIO */}
      {isEditModalOpen && selectedUser && (
        <div 
          onClick={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[600px] bg-white dark:bg-zinc-900 rounded-[28px] border border-black/5 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col text-left max-h-[90vh]"
          >
            {/* Cabecera del Modal */}
            <div className="px-5 py-3.5 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-850 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white tracking-tight">Editar Usuario</h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                }}
                className="w-8 h-8 rounded-full bg-[#EA4335] hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-xs select-none cursor-pointer outline-none border-none shrink-0"
                title="Cerrar"
              >
                <X size={15} strokeWidth={3} />
              </button>
            </div>

            {/* Cuerpo del Modal (Scrollable) */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 font-sans">
              
              {/* Sección 1: Información Personal */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-805 pb-1.5">
                  Información Personal
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Nombre */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      placeholder="Nombre del docente"
                      className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-[#0046ab]/20 focus:border-[#0046ab] outline-none font-bold text-slate-800 dark:text-zinc-200"
                    />
                  </div>

                  {/* Correo Electrónico */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-[#0046ab]/20 focus:border-[#0046ab] outline-none font-bold text-slate-800 dark:text-zinc-200"
                    />
                  </div>

                  {/* Rol de Sistema */}
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      Rol
                    </label>
                    <select
                      value={editRol}
                      onChange={(e) => setEditRol(e.target.value as RolUsuario)}
                      className="w-full h-9 px-2 bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none font-bold cursor-pointer text-slate-800 dark:text-zinc-200"
                    >
                      <option value="teacher">Docente</option>
                      <option value="admin">Administrador</option>
                      <option value="coordinator">Coordinador</option>
                      <option value="director">Director</option>
                    </select>
                  </div>

                  {/* Embajador Checkbox */}
                  <div className="space-y-1 col-span-2 flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="editIsAmbassador"
                      checked={editIsAmbassador}
                      onChange={(e) => setEditIsAmbassador(e.target.checked)}
                      className="w-4 h-4 text-[#0046ab] focus:ring-[#0046ab]/20 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="editIsAmbassador" className="text-[10px] font-extrabold text-slate-600 dark:text-zinc-300 uppercase tracking-wide cursor-pointer flex items-center gap-1 select-none">
                      ¿Es Embajador Planix?
                      <Star size={10} className="text-amber-500 fill-amber-500" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Sección 2: Información Institucional */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-805 pb-1.5">
                  Información Institucional
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Centro Educativo */}
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      Centro Educativo
                    </label>
                    <input
                      type="text"
                      value={editColegio}
                      onChange={(e) => setEditColegio(e.target.value)}
                      placeholder="Nombre de la escuela o colegio"
                      className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-[#0046ab]/20 focus:border-[#0046ab] outline-none font-bold text-slate-800 dark:text-zinc-200"
                    />
                  </div>

                  {/* Regional */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      Regional
                    </label>
                    <input
                      type="text"
                      value={editRegional}
                      onChange={(e) => setEditRegional(e.target.value)}
                      placeholder="Ej: 15 - SANTO DOMINGO"
                      className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-[#0046ab]/20 focus:border-[#0046ab] outline-none font-bold text-slate-800 dark:text-zinc-200"
                    />
                  </div>

                  {/* Distrito */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      Distrito
                    </label>
                    <input
                      type="text"
                      value={editDistrito}
                      onChange={(e) => setEditDistrito(e.target.value)}
                      placeholder="Ej: 1502"
                      className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-[#0046ab]/20 focus:border-[#0046ab] outline-none font-bold text-slate-800 dark:text-zinc-200"
                    />
                  </div>

                  {/* Año Escolar Activo */}
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      Año Escolar Activo
                    </label>
                    <input
                      type="text"
                      value={editYearEscolarActivo}
                      onChange={(e) => setEditYearEscolarActivo(e.target.value)}
                      placeholder="Ej: 2025-2026"
                      className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-[#0046ab]/20 focus:border-[#0046ab] outline-none font-bold text-slate-800 dark:text-zinc-200"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Información Pedagógica (Cascada) */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-805 pb-1.5">
                  Información Pedagógica
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {/* Nivel Principal */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      Nivel Principal
                    </label>
                    <select
                      value={editNivel}
                      onChange={(e) => {
                        setEditNivel(e.target.value);
                        setEditCiclo('');
                        setEditGrado('');
                      }}
                      className="w-full h-9 px-2 bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none font-bold cursor-pointer text-slate-800 dark:text-zinc-200"
                    >
                      <option value="">No definido</option>
                      <option value="inicial">Nivel Inicial</option>
                      <option value="primaria">Nivel Primario</option>
                      <option value="secundaria">Nivel Secundario</option>
                    </select>
                  </div>

                  {/* Ciclo Principal */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      Ciclo Principal
                    </label>
                    <select
                      value={editCiclo}
                      onChange={(e) => {
                        setEditCiclo(e.target.value);
                        setEditGrado('');
                      }}
                      disabled={!editNivel}
                      className="w-full h-9 px-2 bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none font-bold cursor-pointer text-slate-800 dark:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">No definido</option>
                      {editNivel && getCyclesByLevel(editNivel.toUpperCase() as any).map(cycle => (
                        <option key={cycle.id} value={cycle.id}>
                          {cycle.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Grado Principal */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      Grado Principal
                    </label>
                    <select
                      value={editGrado}
                      onChange={(e) => setEditGrado(e.target.value)}
                      disabled={!editCiclo}
                      className="w-full h-9 px-2 bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none font-bold cursor-pointer text-slate-800 dark:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">No definido</option>
                      {editCiclo && getGradesByCycle(editCiclo).map(grade => (
                        <option key={grade.id} value={grade.id}>
                          {grade.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección 4: Asignaturas y Grados Permitidos (Filtro) */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    Limitar Asignaturas por Grado
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={limitSubjects} 
                      onChange={(e) => toggleLimitSubjects(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-700 peer-checked:bg-[#0046ab] transition-colors"></div>
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-zinc-550 font-bold leading-normal">
                  Activa esta opción para restringir qué grados y materias ve este docente en el wizard de planificación. Si está desactivado, el wizard mostrará solo su Grado Principal, o todos si no tiene uno.
                </p>

                {limitSubjects && editAllowedSubjects && (
                  <div className="space-y-2 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-zinc-950/45 max-h-80 overflow-y-auto">
                    {levels.map(level => {
                      const isLevelExpanded = expandedLevel === level.id;
                      const levelGrades = getGradesByLevel(level.id);
                      
                      return (
                        <div key={level.id} className="border border-slate-150 dark:border-zinc-850 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setExpandedLevel(isLevelExpanded ? null : level.id)}
                            className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/50 border-none outline-none select-none text-left"
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{level.icon}</span>
                              <span>{level.name}</span>
                            </span>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isLevelExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {isLevelExpanded && (
                            <div className="p-2 border-t border-slate-100 dark:border-zinc-850 space-y-1.5 bg-slate-50/30 dark:bg-zinc-955/20">
                              {levelGrades.map(grade => {
                                const isGradeExpanded = expandedGrade === grade.id;
                                const allowedInGrade = editAllowedSubjects[grade.id] || [];
                                const availableSubjects = getAvailableSubjectsForGrade(grade.displayName, grade.id, level.id);

                                return (
                                  <div key={grade.id} className="border border-slate-100 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedGrade(isGradeExpanded ? null : grade.id)}
                                      className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold text-slate-650 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/40 border-none outline-none text-left"
                                    >
                                      <span className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${allowedInGrade.length > 0 ? 'bg-[#0046ab]' : 'bg-slate-300'}`} />
                                        <span>{grade.displayName}</span>
                                      </span>
                                      <div className="flex items-center gap-1.5 text-slate-400">
                                        {allowedInGrade.length > 0 && (
                                          <span className="text-[9px] font-black uppercase tracking-wider bg-[#0046ab]/10 text-[#0046ab] px-1.5 py-0.5 rounded-md">
                                            {allowedInGrade.length} asignaturas
                                          </span>
                                        )}
                                        <ChevronDown size={12} className={`transition-transform ${isGradeExpanded ? 'rotate-180' : ''}`} />
                                      </div>
                                    </button>

                                    {isGradeExpanded && (
                                      <div className="p-3 border-t border-slate-100 dark:border-zinc-850 bg-slate-50/30 dark:bg-zinc-955/10 grid grid-cols-2 gap-2">
                                        {availableSubjects.map(sub => {
                                          const isAllowed = allowedInGrade.includes(sub.id);
                                          return (
                                            <button
                                              key={sub.id}
                                              type="button"
                                              onClick={() => handleSubjectToggle(grade.id, sub.id)}
                                              className={`flex items-center gap-2 p-2 rounded-lg text-[10px] font-bold border transition-all text-left ${
                                                isAllowed
                                                  ? 'bg-[#0046ab]/5 border-[#0046ab] text-[#0046ab] dark:bg-blue-950/20 dark:border-blue-500 dark:text-blue-400'
                                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
                                              }`}
                                            >
                                              <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border transition-all shrink-0 ${
                                                isAllowed 
                                                  ? 'bg-[#0046ab] border-[#0046ab] text-white dark:bg-blue-500 dark:border-blue-500' 
                                                  : 'border-slate-300 dark:border-zinc-700'
                                              }`}>
                                                {isAllowed && <Check size={10} strokeWidth={4} />}
                                              </span>
                                              <span className="truncate">{sub.name}</span>
                                            </button>
                                          );
                                        })}
                                        {availableSubjects.length === 0 && (
                                          <p className="text-[10px] text-slate-400 dark:text-zinc-500 italic col-span-2 text-center py-1">
                                            No hay asignaturas oficiales en este grado para este nivel.
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Footer de Acciones del Modal */}
            <div className="px-5 py-3.5 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-850 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsViewModalOpen(true);
                }}
                className="h-8.5 px-4 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-zinc-800/30 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/60 rounded-full font-bold text-xs select-none cursor-pointer outline-none transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={12} className="shrink-0" />
                Volver Atrás
              </button>
              <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                }}
                className="h-8.5 px-4.5 bg-slate-50 border border-slate-200 text-slate-655 hover:bg-slate-100 dark:bg-zinc-800/30 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/60 rounded-full font-bold text-xs select-none cursor-pointer outline-none transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUpdateDetails}
                className="h-8.5 px-4.5 bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5] hover:bg-[#E0E7FF] dark:bg-indigo-950/20 dark:border-indigo-800/30 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-full font-black text-xs select-none cursor-pointer outline-none transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Check size={12} className="text-[#4F46E5] dark:text-indigo-400 shrink-0" />
                ACTUALIZAR USUARIO
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

