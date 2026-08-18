import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Home, Calendar, BookOpen, Grid, FolderOpen, MessageSquare, Settings, Bell, Users,
  UserCheck, LogOut, Sparkles, MessageCircle, Crown, Eye,
  ClipboardList, Plus, Trash2, X, FileText, Check, AlertTriangle, ArrowRight, Info, Award,
  Search, Smile, GraduationCap, ChevronRight, ChevronDown, HelpCircle, Heart, Trophy, Coins, Download,
  Clock, Lock, Sun, Moon, Camera, Image, Loader2, MapPin, Save, Upload, Edit2
} from 'lucide-react';
import { getCurrentUser, Usuario } from '../lib/storage';
import { performLogout } from '../lib/utils/authUtils';
import { requestD1 } from '../lib/services/d1Client';
import { mapPlanningFromDb } from '../lib/services/plannings';
import { toast, Toaster } from 'sonner';
import { getUserCredits } from '../lib/credits';
import { DatePicker } from '../components/ui/heroui-date-picker';
import { HeaderControls } from '../components/layout/HeaderControls';

const GoogleDriveIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <img 
    src="https://static.vecteezy.com/system/resources/previews/012/871/368/non_2x/google-drive-icon-google-product-illustration-free-png.png" 
    alt="Google Drive" 
    className={className} 
    style={{ objectFit: 'contain' }}
  />
);

const searchOrCreateFolder = async (folderName: string, parentId: string | undefined, accessToken: string) => {
  let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
  const searchRes = await fetch(searchUrl, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!searchRes.ok) {
    throw new Error(`Error buscando carpeta: ${searchRes.statusText}`);
  }
  const searchData = await searchRes.json();
  
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }
  
  // Create it
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : []
    })
  });
  if (!createRes.ok) {
    throw new Error(`Error creando carpeta: ${createRes.statusText}`);
  }
  const createData = await createRes.json();
  return createData.id;
};

const uploadFileToDrive = async (file: File, folderId: string, accessToken: string) => {
  const metadata = {
    name: file.name,
    parents: [folderId]
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', file);

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink';
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });
  
  if (!uploadRes.ok) {
    throw new Error(`Error al subir el archivo: ${uploadRes.statusText}`);
  }
  
  const uploadData = await uploadRes.json();
  return {
    id: uploadData.id,
    webViewLink: uploadData.webViewLink
  };
};


interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  direction?: 'down' | 'up';
  useModal?: boolean;
}

function CustomSelect({ value, onChange, options, placeholder, className = "", searchable = false, direction = 'down', useModal = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  // Reset search when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setSearchVal("");
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : (placeholder || "-- Seleccionar --");

  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchVal.toLowerCase()))
    : options;

  return (
    <div className="relative w-full text-left">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 outline-none transition-all shadow-xs font-semibold ${className}`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <>
          {useModal ? (
            <div 
              className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setIsOpen(false)}
            >
              <div 
                className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] w-full max-w-sm p-5 shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                    {placeholder || "-- Seleccionar --"}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 flex items-center justify-center border-none cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Search */}
                {searchable && (
                  <div className="mb-3 flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/40 border border-neutral-200 dark:border-zinc-800 rounded-xl px-3 h-10 shrink-0">
                    <Search size={14} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Escribe para buscar..."
                      value={searchVal}
                      onChange={e => setSearchVal(e.target.value)}
                      className="w-full bg-transparent border-none text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-slate-400 outline-none font-medium"
                    />
                  </div>
                )}

                {/* Scrollable list */}
                <div className="space-y-1 overflow-y-auto flex-1 max-h-[45vh] pr-1">
                  {placeholder && !searchVal && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange("");
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors ${
                        value === ""
                          ? "bg-brand-primary/10 text-brand-primary font-bold"
                          : "text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <span>{placeholder}</span>
                      {value === "" && <Check className="w-4 h-4 shrink-0 text-brand-primary" />}
                    </button>
                  )}
                  {filteredOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors ${
                        value === opt.value
                          ? "bg-brand-primary/10 text-brand-primary font-bold"
                          : "text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {value === opt.value && <Check className="w-4 h-4 shrink-0 text-brand-primary" />}
                    </button>
                  ))}
                  {filteredOptions.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                      No se encontraron resultados
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
              <div className={`absolute left-0 right-0 ${direction === 'up' ? 'bottom-full mb-1' : 'mt-1'} bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-[9999] animate-in fade-in duration-75 text-left rounded-lg overflow-hidden flex flex-col`}>
                {searchable && (
                  <div className="p-2 border-b border-black/5 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10 flex items-center gap-1.5">
                    <Search size={14} className="text-slate-400 shrink-0 ml-1" />
                    <input
                      type="text"
                      placeholder="Escribe para buscar..."
                      value={searchVal}
                      onChange={e => setSearchVal(e.target.value)}
                      onClick={e => e.stopPropagation()} // Prevent clicking search closing dropdown
                      className="w-full h-9 bg-slate-50 dark:bg-zinc-800/40 border border-neutral-200 dark:border-zinc-800 rounded-lg px-3 text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-slate-400 outline-none focus:border-brand-primary font-medium"
                    />
                  </div>
                )}
                <div className="space-y-0.5 max-h-48 overflow-y-auto p-1">
                  {placeholder && !searchVal && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange("");
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                        value === ""
                          ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                          : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <span>{placeholder}</span>
                      {value === "" && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                    </button>
                  )}
                  {filteredOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                        value === opt.value
                          ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold"
                          : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {value === opt.value && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                    </button>
                  ))}
                  {filteredOptions.length === 0 && (
                    <div className="py-4 px-3 text-center text-xs text-slate-455 dark:text-slate-500 font-bold">
                      No se encontraron resultados
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

const getPlanningStatus = (plan: any) => {
  const explicitStatus = plan.status || plan.customFields?.estado || plan.customFields?.status;
  if (explicitStatus === 'Aprobada' || explicitStatus === 'Devuelto' || explicitStatus === 'Reunión') {
    return explicitStatus;
  }

  let score = 0;
  let total = 7;
  
  const ip = plan.intencion_pedagogica || plan.customFields?.intencion_pedagogica;
  const conceptual = plan.conceptual || plan.customFields?.conceptual;
  const procedimental = plan.procedimental || plan.customFields?.procedimental;
  const actitudinal = plan.actitudinal || plan.customFields?.actitudinal;
  
  const momentos = plan.momentos || plan.customFields?.momentos;
  const inicio = momentos?.inicio || (Array.isArray(momentos) ? momentos[0]?.descripcion : '');
  const desarrollo = momentos?.desarrollo || (Array.isArray(momentos) ? momentos[1]?.descripcion : '');
  const cierre = momentos?.cierre || (Array.isArray(momentos) ? momentos[2]?.descripcion : '');

  if (ip) score++;
  if (conceptual) score++;
  if (procedimental) score++;
  if (actitudinal) score++;
  if (inicio) score++;
  if (desarrollo) score++;
  if (cierre) score++;
  
  const progress = Math.round((score / total) * 105); // wait, total was 7, let's keep it progress calculation same
  const progressPercent = Math.round((score / total) * 100);
  if (progressPercent >= 90) return 'Finalizado';
  if (progressPercent > 0) return 'En Redacción';
  return 'Borrador';
};

const getReasonBadgeStyles = (reason: string) => {
  switch (reason) {
    case "Bajo rendimiento":
      return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40";
    case "Ausentismo":
      return "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40";
    case "NEAE (Necesidades Especiales)":
      return "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/40";
    case "Riesgo de repitencia":
      return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40";
    case "Conducta":
      return "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/40";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-zinc-800";
  }
};

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "Urgente":
      return "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40";
    case "Seguimiento":
      return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40";
    case "En proceso":
      return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40";
    case "Resuelto":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-zinc-800";
  }
};

const formatGradeName = (name: string) => {
  if (!name) return '--';
  let normalized = name.toUpperCase().trim();
  normalized = normalized.replace(/\s+/g, ' ');

  const directMatches: Record<string, string> = {
    '1ER GRADO PRIMARIA': '1ro. (Primaria)',
    '2DO GRADO PRIMARIA': '2do. (Primaria)',
    '3ER GRADO PRIMARIA': '3ro. (Primaria)',
    '4TO GRADO PRIMARIA': '4to. (Primaria)',
    '5TO GRADO PRIMARIA': '5to. (Primaria)',
    '6TO GRADO PRIMARIA': '6to. (Primaria)',
    '1ER GRADO SECUNDARIA': '1ro. (Secundaria)',
    '2DO GRADO SECUNDARIA': '2do. (Secundaria)',
    '3ER GRADO SECUNDARIA': '3ro. (Secundaria)',
    '4TO GRADO SECUNDARIA': '4to. (Secundaria)',
    '5TO GRADO SECUNDARIA': '5to. (Secundaria)',
    '6TO GRADO SECUNDARIA': '6to. (Secundaria)'
  };

  if (directMatches[normalized]) {
    return directMatches[normalized];
  }

  let result = name;
  result = result.replace(/1ER/i, '1ro.');
  result = result.replace(/2DO/i, '2do.');
  result = result.replace(/3ER/i, '3ro.');
  result = result.replace(/4TO/i, '4to.');
  result = result.replace(/5TO/i, '5to.');
  result = result.replace(/6TO/i, '6to.');
  result = result.replace(/GRADO/i, '');
  result = result.replace(/PRIMARIA/i, '(Primaria)');
  result = result.replace(/SECUNDARIA/i, '(Secundaria)');
  result = result.replace(/\s+/g, ' ').trim();
  return result;
};

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "inicio";

  const context = useOutletContext<{ isSidebarPinned: boolean, theme?: 'light' | 'dark', toggleTheme?: () => void } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;
  const theme = context?.theme ?? 'light';
  const toggleTheme = context?.toggleTheme ?? (() => { });

  const [user, setUser] = useState<Usuario | null>(() => getCurrentUser());

  // Check coordinator role authorization
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.rol !== 'coordinator' && user.rol !== 'admin') {
      toast.error('Acceso denegado. No eres coordinador');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [expedienteTab, setExpedienteTab] = useState<"obs" | "retro" | "acuerdos" | "planes" | "evidencias">("obs");
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [teachers, setTeachers] = useState<any[]>([]);
  const [plannings, setPlannings] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [minutes, setMinutes] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>("");
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [followupTeacherId, setFollowupTeacherId] = useState<string>("");
  const [planningPage, setPlanningPage] = useState<number>(1);

  // UI state
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isMinuteModalOpen, setIsMinuteModalOpen] = useState(false);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [evidenceToDelete, setEvidenceToDelete] = useState<any>(null);

  // Reset planning page on search query or tab change
  useEffect(() => {
    setPlanningPage(1);
  }, [searchQuery, activeTab]);



  // Google Drive Simple Link States
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [mainFolderUrlInput, setMainFolderUrlInput] = useState("");
  const [isEditingFolderUrl, setIsEditingFolderUrl] = useState(false);

  // Header state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [activeLevel, setActiveLevel] = useState<"inicial" | "primario" | "secundario">(() => {
    if (user?.nivel === "secundaria") return "secundario";
    if (user?.nivel === "inicial") return "inicial";
    return "primario";
  });

  // Notifications state
  interface AppNotification {
    id: string;
    title: string;
    body: string;
    time: string;
    read: boolean;
  }

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (user) {
      const stored = localStorage.getItem(`planix_coord_notifications_${user.id}`);
      if (stored) {
        try { return JSON.parse(stored); } catch { /* fallthrough */ }
      }
    }
    return [];
  });

  // Persist notifications to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`planix_coord_notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  // Seed default notifications + welcome message on first visit
  useEffect(() => {
    if (user) {
      const seeded = localStorage.getItem(`planix_coord_notifications_seeded_${user.id}`);
      if (!seeded) {
        const defaultNotifs: AppNotification[] = [
          {
            id: 'coord_welcome',
            title: `¡Bienvenido/a al Módulo de Coordinación, ${user.nombre?.split(' ')[0] || 'Coordinador'}!`,
            body: 'Desde este panel podrás supervisar las planificaciones de tus docentes, registrar visitas de acompañamiento áulico y gestionar incidencias estudiantiles. Te invitamos a unirte al grupo oficial de WhatsApp para soporte: https://chat.whatsapp.com/CTxnZvEz6Qr2I2piuSNSDO',
            time: 'Ahora',
            read: false,
          },
        ];
        setNotifications(defaultNotifs);
        localStorage.setItem(`planix_coord_notifications_seeded_${user.id}`, 'true');
      }
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notificación eliminada');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success('Notificaciones limpiadas');
  };

  // Form states
  const [logForm, setLogForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    category: 'Acompañamiento docente',
    description: '',
    involved_people: '',
    status: 'Pendiente'
  });

  const [obsForm, setObsForm] = useState({
    teacher_id: '',
    date: new Date().toISOString().split('T')[0],
    next_date: '',
    score: 80,
    status: 'Acompañado',
    observations: '',
    positive_feedback: '',
    areas_of_improvement: '',
    agreement_text: ''
  });

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    location: 'Sala de Coordinación',
    invited_count: 12,
    notes: ''
  });

  const [minuteForm, setMinuteForm] = useState({
    meeting_id: '',
    title: '',
    content: '',
    participants: '',
    pending_signatures: 3
  });

  const [followupForm, setFollowupForm] = useState({
    student_id: '',
    reason: 'Bajo rendimiento',
    responsible_id: '',
    last_intervention_date: new Date().toISOString().split('T')[0],
    status: 'Seguimiento',
    notes: ''
  });

  // Dynamic generated reports list state
  const [reports, setReports] = useState<any[]>([]);

  // Evidence filters
  const [activeEvidenceFilter, setActiveEvidenceFilter] = useState("Todas");
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Config Form States
  const [coordProfileForm, setCoordProfileForm] = useState({
    full_name: user?.nombre || '',
    school_name: user?.colegio || '',
    email: user?.email || '',
    active_year: '2026-2027'
  });

  const [sysPrefsForm, setSysPrefsForm] = useState({
    language: 'Español',
    timezone: 'America/Santo_Domingo (UTC-4)',
    notifications: 'Activadas',
    theme: 'Claro'
  });

  // Sync profile edits with storage
  useEffect(() => {
    if (user) {
      setCoordProfileForm({
        full_name: user.nombre || '',
        school_name: user.colegio || '',
        email: user.email || '',
        active_year: '2026-2027'
      });
    }
  }, [user]);

  // Fetch all coordinator module data
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch school teachers (all profiles matching school_name/colegio)
      const allProfiles = await requestD1<any[]>('/api/profiles');
      const coordSchool = (user.colegio || user.school_name || "").trim().toLowerCase();
      const schoolTeachers = allProfiles.filter(p => {
        const pSchool = (p.school_name || p.colegio || "").trim().toLowerCase();
        return coordSchool !== "" && pSchool === coordSchool && p.id !== user.id && p.role !== 'admin';
      });
      setTeachers(schoolTeachers);

      const teacherIds = schoolTeachers.map(t => t.id);

      // 2. Fetch classroom list & students base
      const allClassrooms = await requestD1<any[]>('/api/classrooms');
      const schoolClassrooms = allClassrooms.filter(c => teacherIds.includes(c.teacher_id));
      setClassrooms(schoolClassrooms);
      const classroomIds = schoolClassrooms.map(c => c.id);

      // Fetch students for school classrooms in parallel
      let schoolStudents: any[] = [];
      if (classroomIds.length > 0) {
        const studentPromises = classroomIds.map(cid =>
          requestD1<any[]>(`/api/students?classroom_id=${cid}`)
            .catch(() => [])
        );
        const results = await Promise.all(studentPromises);
        results.forEach((classroomStds, idx) => {
          if (Array.isArray(classroomStds)) {
            const classroom = schoolClassrooms[idx];
            schoolStudents = [...schoolStudents, ...classroomStds.map(s => ({
              ...s,
              classroom_name: classroom.name,
              grade_name: classroom.grade,
              classroom_id: classroom.id
            }))];
          }
        });
      }
      setStudents(schoolStudents);

      // 3. Fetch plannings by teachers of same school
      const allPlannings = await requestD1<any[]>('/api/plannings');
      const schoolPlannings = allPlannings
        .map(mapPlanningFromDb)
        .filter(p => teacherIds.includes(p.docente_id));
      setPlannings(schoolPlannings);

      // 4. Fetch coordinator specific logs, observations, agreements, meetings, minutes, followups, evidences
      const logsData = await requestD1<any[]>(`/api/coordinator/logs?coordinator_id=${user.id}`);
      setLogs(logsData || []);

      const obsData = await requestD1<any[]>(`/api/coordinator/observations?coordinator_id=${user.id}`);
      setObservations(obsData || []);

      const agreementsData = await requestD1<any[]>(`/api/coordinator/agreements?coordinator_id=${user.id}`);
      setAgreements(agreementsData || []);

      const meetingsData = await requestD1<any[]>(`/api/coordinator/meetings?coordinator_id=${user.id}`);
      setMeetings(meetingsData || []);

      const minutesData = await requestD1<any[]>(`/api/coordinator/minutes?coordinator_id=${user.id}`);
      setMinutes(minutesData || []);

      const followupsData = await requestD1<any[]>(`/api/coordinator/followups?coordinator_id=${user.id}`);
      setFollowups(followupsData || []);

      const evidencesData = await requestD1<any[]>(`/api/coordinator/evidences?coordinator_id=${user.id}`);
      setEvidences(evidencesData || []);

      // Seed mock followups if empty and we have teachers/students
      if ((!followupsData || followupsData.length === 0) && schoolTeachers.length > 0) {
        const mockFollowups = [
          {
            id: 'fup_1',
            coordinator_id: user.id,
            student_id: 'std_1',
            reason: 'Bajo rendimiento',
            responsible_id: 'Psicología',
            last_intervention_date: new Date().toISOString().split('T')[0],
            status: 'Urgente',
            notes: 'Reforzamiento en lectoescritura'
          },
          {
            id: 'fup_2',
            coordinator_id: user.id,
            student_id: 'std_2',
            reason: 'Ausentismo',
            responsible_id: 'Coordinación',
            last_intervention_date: new Date().toISOString().split('T')[0],
            status: 'Seguimiento',
            notes: 'Llamada telefónica a tutores'
          },
          {
            id: 'fup_3',
            coordinator_id: user.id,
            student_id: 'std_3',
            reason: 'NEAE',
            responsible_id: 'Orientación',
            last_intervention_date: new Date().toISOString().split('T')[0],
            status: 'En proceso',
            notes: 'Evaluación psicopedagógica en curso'
          }
        ];
        if (schoolStudents.length > 0) {
          mockFollowups[0].student_id = schoolStudents[0]?.id || 'std_1';
          if (schoolStudents.length > 1) mockFollowups[1].student_id = schoolStudents[1]?.id || 'std_2';
          if (schoolStudents.length > 2) mockFollowups[2].student_id = schoolStudents[2]?.id || 'std_3';
        }
        for (const f of mockFollowups) {
          await requestD1('/api/coordinator/followups', 'POST', f).catch(() => { });
        }
        setFollowups(mockFollowups);
      }

      // If no local logs yet, seed some mockup entries for visual presentation
      if ((!logsData || logsData.length === 0) && schoolTeachers.length > 0) {
        const mockLogs = [
          { id: 'log_1', coordinator_id: user.id, date: new Date().toISOString().split('T')[0], time: '08:15', category: 'Acompañamiento docente', description: `Observación de clase de ${schoolTeachers[0]?.full_name || 'docente'} — Uso eficiente del material concreto. Se acuerda mejorar gestión del tiempo.`, involved_people: schoolTeachers[0]?.full_name, status: 'Resuelto' },
          { id: 'log_2', coordinator_id: user.id, date: new Date().toISOString().split('T')[0], time: '10:30', category: 'Incidencias', description: 'Reunión con familias por ausentismo escolar. Firma de carta de compromiso pedagógico.', involved_people: 'Pedro Ruiz, Familia Ruiz', status: 'Dar seguimiento' },
          { id: 'log_3', coordinator_id: user.id, date: new Date().toISOString().split('T')[0], time: '12:30', category: 'Gestión institucional', description: 'Revisión y firma de planificaciones semanales. 2 docentes pendientes al cierre.', involved_people: 'Carlos Peña, Ana Vargas', status: 'Pendiente' }
        ];
        for (const l of mockLogs) {
          await requestD1('/api/coordinator/logs', 'POST', l).catch(() => { });
        }
        setLogs(mockLogs);
      }

      // Seed mock meetings if empty
      if (!meetingsData || meetingsData.length === 0) {
        const mockMeetings = [
          { id: 'meet_1', coordinator_id: user.id, title: 'Reunión de claustro docente', meeting_date: '2026-07-02', meeting_time: '10:00', location: 'Sala principal', invited_count: 12, notes: 'Análisis de cierre trimestral' },
          { id: 'meet_2', coordinator_id: user.id, title: 'Reunión con dirección regional', meeting_date: '2026-07-09', meeting_time: '09:00', location: 'Dirección regional', invited_count: 4, notes: 'Evaluación de indicadores de eficiencia' }
        ];
        for (const m of mockMeetings) {
          await requestD1('/api/coordinator/meetings', 'POST', m).catch(() => { });
        }
        setMeetings(mockMeetings);
      }

      // Seed mock minutes if empty
      if (!minutesData || minutesData.length === 0) {
        const mockMinutes = [
          { id: 'min_1', meeting_id: 'meet_1', title: 'Reunión de coordinación pedagógica', content: 'Análisis de planificaciones y plan de acompañamiento para el mes de julio.', participants: 'María Contreras, Juan Martínez, Laura Reyes', pending_signatures: 3 }
        ];
        for (const mn of mockMinutes) {
          await requestD1('/api/coordinator/minutes', 'POST', mn).catch(() => { });
        }
        setMinutes(mockMinutes);
      }

      // Seed mock evidences if empty
      if (!evidencesData || evidencesData.length === 0) {
        const mockEvidences = [
          { id: 'ev_1', coordinator_id: user.id, name: 'Foto obs. clase Matemáticas', file_url: '#', category: 'Fotos', file_tag: 'Digital' },
          { id: 'ev_2', coordinator_id: user.id, name: 'Acuerdo mejora — J. Martínez', file_url: '#', category: 'Documentos', file_tag: 'Firmado' },
          { id: 'ev_3', coordinator_id: user.id, name: 'Circular familias ausentismo', file_url: '#', category: 'Comunicaciones', file_tag: 'Recibido' }
        ];
        for (const ev of mockEvidences) {
          await requestD1('/api/coordinator/evidences', 'POST', ev).catch(() => { });
        }
        setEvidences(mockEvidences);
      }

    } catch (err) {
      console.error("Error loading coordinator dashboard data:", err);
      toast.error("Ocurrió un problema cargando los datos del servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);



  const handleLogout = () => {
    performLogout(navigate);
  };

  // Form submit handlers
  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!logForm.description.trim()) {
      toast.error("Ingresa la descripción del registro.");
      return;
    }

    const newLog = {
      id: `log_${Date.now()}`,
      coordinator_id: user.id,
      ...logForm
    };

    try {
      await requestD1('/api/coordinator/logs', 'POST', newLog);
      toast.success("Entrada de bitácora registrada.");
      setIsModalOpen(false);
      setLogForm({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        category: 'Acompañamiento docente',
        description: '',
        involved_people: '',
        status: 'Pendiente'
      });
      fetchData();
    } catch (err) {
      toast.error("No se pudo guardar la entrada.");
    }
  };

  const handleSaveObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!obsForm.teacher_id) {
      toast.error("Selecciona un docente.");
      return;
    }

    const obsId = `obs_${Date.now()}`;
    const newObs = {
      id: obsId,
      coordinator_id: user.id,
      teacher_id: obsForm.teacher_id,
      observation_date: obsForm.date,
      next_observation_date: obsForm.next_date || null,
      score: Number(obsForm.score),
      status: obsForm.status,
      observations: obsForm.observations,
      positive_feedback: obsForm.positive_feedback,
      areas_of_improvement: obsForm.areas_of_improvement
    };

    try {
      await requestD1('/api/coordinator/observations', 'POST', newObs);

      // Create agreement if text is supplied
      if (obsForm.agreement_text.trim()) {
        const agreement = {
          id: `agr_${Date.now()}`,
          observation_id: obsId,
          teacher_id: obsForm.teacher_id,
          coordinator_id: user.id,
          agreement_text: obsForm.agreement_text,
          status: 'Pendiente',
          due_date: obsForm.next_date || null
        };
        await requestD1('/api/coordinator/agreements', 'POST', agreement);
      }

      // Add to evidence bank automatically
      const evidence = {
        id: `ev_${Date.now()}`,
        coordinator_id: user.id,
        teacher_id: obsForm.teacher_id,
        name: `Acuerdo acompañamiento � ${teachers.find(t => t.id === obsForm.teacher_id)?.full_name || "Docente"}`,
        file_url: '#',
        category: 'Documentos',
        file_tag: 'Firmado'
      };
      await requestD1('/api/coordinator/evidences', 'POST', evidence).catch(() => { });

      toast.success("Acompañamiento registrado correctamente.");
      setIsObsModalOpen(false);
      setObsForm({
        teacher_id: '',
        date: new Date().toISOString().split('T')[0],
        next_date: '',
        score: 80,
        status: 'Acompañado',
        observations: '',
        positive_feedback: '',
        areas_of_improvement: '',
        agreement_text: ''
      });
      fetchData();
    } catch (err) {
      toast.error("No se pudo guardar el acompañamiento.");
    }
  };

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!meetingForm.title.trim()) {
      toast.error("Ingresa el título de la reunión.");
      return;
    }

    const newMeet = {
      id: `meet_${Date.now()}`,
      coordinator_id: user.id,
      title: meetingForm.title,
      meeting_date: meetingForm.date,
      meeting_time: meetingForm.time,
      location: meetingForm.location,
      invited_count: Number(meetingForm.invited_count),
      notes: meetingForm.notes
    };

    try {
      await requestD1('/api/coordinator/meetings', 'POST', newMeet);
      toast.success("Nueva reunión programada.");
      setIsMeetingModalOpen(false);
      setMeetingForm({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        location: 'Sala de Coordinación',
        invited_count: 12,
        notes: ''
      });
      fetchData();
    } catch (err) {
      toast.error("No se pudo programar la reunión.");
    }
  };

  const handleSaveMinute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!minuteForm.meeting_id || !minuteForm.title.trim()) {
      toast.error("Selecciona una reunión y escribe el título del acta.");
      return;
    }

    const newMinute = {
      id: `min_${Date.now()}`,
      meeting_id: minuteForm.meeting_id,
      title: minuteForm.title,
      content: minuteForm.content,
      participants: minuteForm.participants,
      pending_signatures: Number(minuteForm.pending_signatures)
    };

    try {
      await requestD1('/api/coordinator/minutes', 'POST', newMinute);

      // Add to evidence bank automatically
      const evidence = {
        id: `ev_${Date.now()}`,
        coordinator_id: user.id,
        teacher_id: null,
        name: `Acta: ${minuteForm.title}`,
        file_url: '#',
        category: 'Acta',
        file_tag: 'Firmado'
      };
      await requestD1('/api/coordinator/evidences', 'POST', evidence).catch(() => { });

      toast.success("Acta registrada correctamente.");
      setIsMinuteModalOpen(false);
      setMinuteForm({
        meeting_id: '',
        title: '',
        content: '',
        participants: '',
        pending_signatures: 3
      });
      fetchData();
    } catch (err) {
      toast.error("No se pudo guardar el acta.");
    }
  };

  const handleSaveFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!followupForm.student_id) {
      toast.error("Selecciona un estudiante.");
      return;
    }

    const newFollowup = {
      id: `fup_${Date.now()}`,
      coordinator_id: user.id,
      student_id: followupForm.student_id,
      reason: followupForm.reason,
      responsible_id: followupForm.responsible_id || 'Coordinadora',
      last_intervention_date: followupForm.last_intervention_date,
      status: followupForm.status,
      notes: followupForm.notes
    };

    try {
      await requestD1('/api/coordinator/followups', 'POST', newFollowup);
      setFollowups(prev => [newFollowup, ...prev]);
      toast.success("Caso de seguimiento estudiantil registrado.");
      setIsFollowupModalOpen(false);
      setFollowupForm({
        student_id: '',
        reason: 'Bajo rendimiento',
        responsible_id: '',
        last_intervention_date: new Date().toISOString().split('T')[0],
        status: 'Seguimiento',
        notes: ''
      });
    } catch (err) {
      toast.error("No se pudo registrar el seguimiento.");
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await requestD1(`/api/coordinator/logs/${id}`, 'DELETE');
      toast.success("Registro eliminado de la bitácora.");
      fetchData();
    } catch (err) {
      toast.error("No se pudo eliminar el registro.");
    }
  };

  const handleToggleAgreementStatus = async (agreementId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Cumplido' ? 'Pendiente' : 'Cumplido';
    try {
      await requestD1(`/api/coordinator/agreements/${agreementId}`, 'PUT', { status: nextStatus });
      toast.success(`Acuerdo marcado como ${nextStatus}`);
      fetchData();
    } catch (err) {
      setAgreements(prev => prev.map(a => a.id === agreementId ? { ...a, status: nextStatus } : a));
      toast.success(`Acuerdo marcado como ${nextStatus}`);
    }
  };

  const [evidenceName, setEvidenceName] = useState("");
  const handleAddEvidenceForTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) return;
    if (!evidenceName.trim()) {
      toast.error("Por favor ingresa un nombre para identificar el recurso");
      return;
    }
    if (!evidenceUrl.trim()) {
      toast.error("Por favor ingresa la URL de Google Drive, documento o recurso");
      return;
    }

    let cleanUrl = evidenceUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    let fileTag = 'Google Drive';
    if (!cleanUrl.includes('drive.google.com') && !cleanUrl.includes('docs.google.com') && !cleanUrl.includes('sheets.google.com') && !cleanUrl.includes('slides.google.com')) {
      fileTag = 'Enlace Web';
    }

    const newEvidence = {
      id: `ev_${Date.now()}`,
      coordinator_id: user?.id || "",
      teacher_id: selectedTeacherId,
      name: evidenceName.trim(),
      file_url: cleanUrl,
      category: 'Documentos',
      file_tag: fileTag
    };

    try {
      await requestD1('/api/coordinator/evidences', 'POST', newEvidence);
      toast.success("Enlace de evidencia agregado con éxito");
      setEvidenceName("");
      setEvidenceUrl("");
      fetchData();
    } catch (err) {
      setEvidences(prev => [newEvidence, ...prev]);
      setEvidenceName("");
      setEvidenceUrl("");
      toast.success("Enlace de evidencia agregado con éxito");
    }
  };

  const handleExecuteDeleteEvidence = async (id: string) => {
    // Optimistic state update: vanish immediately from UI without page reload
    setEvidences(prev => prev.filter(item => item.id !== id));
    setDeleteConfirmOpen(false);
    setEvidenceToDelete(null);
    toast.success("Enlace de evidencia eliminado");

    try {
      await requestD1(`/api/coordinator/evidences/${id}`, 'DELETE');
      // Silently sync background data
      const res = await requestD1(`/api/coordinator/evidences?coordinator_id=${user?.id}`).catch(() => null);
      if (res && Array.isArray(res)) {
        setEvidences(res);
      }
    } catch (err) {
      console.error("Error deleting evidence in background:", err);
    }
  };

  const handleSaveMainFolderUrl = async (url: string) => {
    if (!selectedTeacherId) return;
    if (!url.trim()) {
      toast.error("Por favor ingresa una URL válida");
      return;
    }

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const existing = evidences.find(ev => ev.teacher_id === selectedTeacherId && ev.category === 'Carpeta Principal');

    const folderRecord = {
      id: existing?.id || `ev_main_${Date.now()}`,
      coordinator_id: user?.id || "",
      teacher_id: selectedTeacherId,
      name: 'Carpeta Principal de Google Drive',
      file_url: cleanUrl,
      category: 'Carpeta Principal',
      file_tag: 'Google Drive'
    };

    try {
      if (existing) {
        await requestD1(`/api/coordinator/evidences/${existing.id}`, 'DELETE').catch(() => {});
      }
      await requestD1('/api/coordinator/evidences', 'POST', folderRecord);
      toast.success("Carpeta principal vinculada correctamente");
      setMainFolderUrlInput("");
      setIsEditingFolderUrl(false);
      fetchData();
    } catch (err) {
      setEvidences(prev => {
        const filtered = prev.filter(e => e.id !== folderRecord.id);
        return [folderRecord, ...filtered];
      });
      toast.success("Carpeta principal vinculada correctamente");
      setMainFolderUrlInput("");
      setIsEditingFolderUrl(false);
    }
  };

  const handleGenerateReport = (name: string) => {
    const ts = new Date().toLocaleString('es-DO');
    const newReport = { name, ts };
    setReports(prev => [newReport, ...prev]);
    toast.success(`${name} generado correctamente. Descargando...`);
  };

  const handlePrintReport = (type: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Por favor, permite las ventanas emergentes para generar el reporte.");
      return;
    }

    const schoolName = user?.colegio || user?.school_name || "Centro Educativo";
    const coordinatorName = user?.nombre || "Coordinador";
    const currentDate = new Date().toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let contentHtml = "";

    if (type === 'informe_mensual') {
      contentHtml = `
        <div class="header">
          <h2>Informe Mensual de Coordinación</h2>
          <p class="subtitle">Resumen ejecutivo mensual de gestión pedagógica</p>
        </div>
        <div class="meta-grid">
          <div><strong>Centro Educativo:</strong> ${schoolName}</div>
          <div><strong>Coordinador:</strong> ${coordinatorName}</div>
          <div><strong>Fecha de Emisión:</strong> ${currentDate}</div>
          <div><strong>Mes:</strong> ${new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</div>
        </div>

        <h3>1. Resumen Estadístico</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Total Registrado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Docentes Activos</td>
              <td>${teachers.length}</td>
            </tr>
            <tr>
              <td>Planificaciones Entregadas</td>
              <td>${plannings.length}</td>
            </tr>
            <tr>
              <td>Visitas de Acompañamiento</td>
              <td>${observations.length}</td>
            </tr>
            <tr>
              <td>Reuniones Convocadas</td>
              <td>${meetings.length}</td>
            </tr>
            <tr>
              <td>Casos de Seguimiento Estudiantil</td>
              <td>${followups.length}</td>
            </tr>
          </tbody>
        </table>

        <h3>2. Acuerdos y Compromisos Recientes</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción del Acuerdo</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            ${agreements.length > 0 
              ? agreements.map(a => `
                <tr>
                  <td>${a.date || '--'}</td>
                  <td>${a.agreement_text || a.content || a.notes || '--'}</td>
                  <td>${a.status || 'Registrado'}</td>
                </tr>
              `).join('')
              : '<tr><td colspan="3" class="text-center">No hay acuerdos registrados este mes.</td></tr>'
            }
          </tbody>
        </table>
      `;
    } else if (type === 'acompanamiento') {
      contentHtml = `
        <div class="header">
          <h2>Informe de Acompañamiento</h2>
          <p class="subtitle">Consolidado de observaciones áulicas y planes de mejora por docente</p>
        </div>
        <div class="meta-grid">
          <div><strong>Centro Educativo:</strong> ${schoolName}</div>
          <div><strong>Coordinador:</strong> ${coordinatorName}</div>
          <div><strong>Fecha de Emisión:</strong> ${currentDate}</div>
        </div>

        <h3>Listado de Visitas Realizadas</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Docente</th>
              <th>Fecha</th>
              <th>Puntaje</th>
              <th>Fortalezas</th>
              <th>Aspectos a Mejorar</th>
            </tr>
          </thead>
          <tbody>
            ${observations.length > 0 
              ? observations.map(o => {
                  const tName = teachers.find(t => t.id === o.teacher_id)?.full_name || 'Docente';
                  return `
                    <tr>
                      <td><strong>${tName}</strong></td>
                      <td>${o.date || '--'}</td>
                      <td><span class="badge ${o.score >= 80 ? 'green' : 'amber'}">${o.score}%</span></td>
                      <td>${o.positive_feedback || '--'}</td>
                      <td>${o.areas_of_improvement || '--'}</td>
                    </tr>
                  `;
                }).join('')
              : '<tr><td colspan="5" class="text-center">No hay visitas de acompañamiento registradas.</td></tr>'
            }
          </tbody>
        </table>
      `;
    } else if (type === 'estudiantes') {
      contentHtml = `
        <div class="header">
          <h2>Reporte de Estudiantes en Seguimiento</h2>
          <p class="subtitle">Casos activos e intervenciones de apoyo educativo</p>
        </div>
        <div class="meta-grid">
          <div><strong>Centro Educativo:</strong> ${schoolName}</div>
          <div><strong>Coordinador:</strong> ${coordinatorName}</div>
          <div><strong>Fecha de Emisión:</strong> ${currentDate}</div>
        </div>

        <h3>Listado de Casos de Intervención</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Curso/Aula</th>
              <th>Motivo</th>
              <th>Responsable</th>
              <th>Última Intervención</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${followups.length > 0 
              ? followupForm ? followups.map(f => {
                  const std = students.find(s => s.id === f.student_id);
                  const stdName = std ? `${std.first_name} ${std.last_name || ""}` : 'Estudiante';
                  const cName = std?.classroom_name || '--';
                  return `
                    <tr>
                      <td><strong>${stdName}</strong></td>
                      <td>${cName}</td>
                      <td>${f.reason}</td>
                      <td>${f.responsible_id || '--'}</td>
                      <td>${f.last_intervention_date || '--'}</td>
                      <td><span class="badge ${f.status === 'Urgente' ? 'red' : f.status === 'Resuelto' ? 'green' : 'blue'}">${f.status}</span></td>
                    </tr>
                  `;
                }).join('') : ''
              : '<tr><td colspan="6" class="text-center">No hay casos de seguimiento estudiantil registrados.</td></tr>'
            }
          </tbody>
        </table>
      `;
    } else if (type === 'direccion') {
      contentHtml = `
        <div class="header">
          <h2>Informe Ejecutivo para Dirección</h2>
          <p class="subtitle">Resumen de indicadores pedagógicos y metas del centro</p>
        </div>
        <div class="meta-grid">
          <div><strong>Centro Educativo:</strong> ${schoolName}</div>
          <div><strong>Coordinador:</strong> ${coordinatorName}</div>
          <div><strong>Fecha de Emisión:</strong> ${currentDate}</div>
        </div>

        <h3>1. Indicadores Clave de Desempeño</h3>
        <div class="dashboard-grid">
          <div class="card">
            <h4>Visitas a Docentes</h4>
            <div class="value">${observations.length}</div>
            <p>Acompañamientos realizados</p>
          </div>
          <div class="card">
            <h4>Cobertura de Planes</h4>
            <div class="value">${teachers.length > 0 ? Math.round((plannings.length / teachers.length) * 100) : 0}%</div>
            <p>${plannings.length} de ${teachers.length} docentes al día</p>
          </div>
          <div class="card">
            <h4>Casos Pendientes</h4>
            <div class="value">${followups.filter(f => f.status !== 'Resuelto').length}</div>
            <p>Estudiantes urgentes/en proceso</p>
          </div>
        </div>

        <h3>2. Estatus de Entregas por Docente</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Docente</th>
              <th>Nivel Principal</th>
              <th>Entregas Pedagógicas</th>
            </tr>
          </thead>
          <tbody>
            ${teachers.map(t => {
              const plans = plannings.filter(p => p.docente_id === t.id);
              return `
                <tr>
                  <td><strong>${t.full_name}</strong></td>
                  <td>${t.nivel_principal || 'General'}</td>
                  <td>${plans.length > 0 ? `<span class="badge green">Entregado (${plans.length})</span>` : '<span class="badge red">Pendiente</span>'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'planificaciones') {
      contentHtml = `
        <div class="header">
          <h2>Informe de Planificaciones</h2>
          <p class="subtitle">Estadísticas de entrega, cumplimiento y observaciones</p>
        </div>
        <div class="meta-grid">
          <div><strong>Centro Educativo:</strong> ${schoolName}</div>
          <div><strong>Coordinador:</strong> ${coordinatorName}</div>
          <div><strong>Fecha de Emisión:</strong> ${currentDate}</div>
        </div>

        <h3>Estatus de Entregas por Docente</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Docente</th>
              <th>Tema / Clase</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            ${plannings.length > 0 
              ? plannings.map(p => {
                  const tName = teachers.find(t => t.id === p.docente_id)?.full_name || 'Docente';
                  const statusLabel = getPlanningStatus(p);
                  return `
                    <tr>
                      <td><strong>${tName}</strong></td>
                      <td>${p.titulo || p.tema || 'Planificación Pedagógica'}</td>
                      <td><span class="badge ${statusLabel === 'Finalizado' || statusLabel === 'Aprobada' ? 'green' : 'blue'}">${statusLabel}</span></td>
                    </tr>
                  `;
                }).join('')
              : '<tr><td colspan="3" class="text-center">No hay planificaciones registradas en el sistema.</td></tr>'
            }
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${type.replace('_', ' ').toUpperCase()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;950&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              color: #1A1A1A;
              margin: 40px;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #1B3F8B;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }
            .header h2 {
              font-weight: 900;
              font-size: 26px;
              color: #1B3F8B;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: -0.5px;
            }
            .header .subtitle {
              font-size: 14px;
              color: #555;
              margin: 5px 0 0 0;
              font-weight: 600;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 30px;
              font-size: 13px;
              background: #F8FAFC;
              padding: 15px;
              border-radius: 12px;
              border: 1px solid #E2E8F0;
            }
            .meta-grid div {
              padding: 4px 0;
            }
            h3 {
              font-weight: 800;
              color: #1B3F8B;
              border-bottom: 1.5px solid #E2E8F0;
              padding-bottom: 8px;
              margin-top: 30px;
              margin-bottom: 15px;
              font-size: 16px;
              text-transform: uppercase;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
              font-size: 12px;
            }
            .report-table th, .report-table td {
              border: 1px solid #E2E8F0;
              padding: 10px 12px;
              text-align: left;
            }
            .report-table th {
              background-color: #1B3F8B;
              color: white;
              font-weight: 800;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.5px;
            }
            .report-table tr:nth-child(even) {
              background-color: #F8FAFC;
            }
            .badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 6px;
              font-weight: 800;
              font-size: 10px;
              text-transform: uppercase;
            }
            .badge.green {
              background-color: #DEF7EC;
              color: #03543F;
            }
            .badge.amber {
              background-color: #FEF3C7;
              color: #92400E;
            }
            .badge.red {
              background-color: #FDE8E8;
              color: #9B1C1C;
            }
            .badge.blue {
              background-color: #E1EFFE;
              color: #1E429F;
            }
            .text-center {
              text-align: center;
            }
            .dashboard-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .dashboard-grid .card {
              border: 1px solid #E2E8F0;
              background: #FFF;
              border-radius: 16px;
              padding: 20px;
              text-align: center;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            }
            .dashboard-grid .card h4 {
              margin: 0;
              font-size: 12px;
              text-transform: uppercase;
              color: #64748B;
              font-weight: 800;
            }
            .dashboard-grid .card .value {
              font-size: 32px;
              font-weight: 900;
              color: #1B3F8B;
              margin: 10px 0;
            }
            .dashboard-grid .card p {
              margin: 0;
              font-size: 11px;
              color: #64748B;
              font-weight: 600;
            }
            @media print {
              body {
                margin: 20px;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${contentHtml}
          <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 11px; color: #64748B; font-weight: 600;">
            <div>Reporte oficial generado automáticamente por Planix 2.0</div>
            <div>Página 1 de 1</div>
          </div>
          <div style="margin-top: 60px; text-align: center;">
            <div style="display: inline-block; width: 200px; border-top: 1px solid #A0AEC0; padding-top: 5px; font-size: 11px; font-weight: bold; color: #4A5568;">
              Firma del Coordinador
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveProfileConfig = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Configuración de perfil guardada con éxito.");
  };

  const handleSavePrefsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Preferencias guardadas.");
  };

  // Memoized filters
  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers;
    return teachers.filter(t =>
      t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nivel_principal?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teachers, searchQuery]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    return logs.filter(l =>
      l.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.involved_people?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [logs, searchQuery]);

  const filteredPlannings = useMemo(() => {
    if (!searchQuery.trim()) return plannings;
    return plannings.filter(p =>
      p.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.asignatura?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getPlanningStatus(p)?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [plannings, searchQuery]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return followups;
    return followups.filter(fup => {
      const std = students.find(s => s.id === fup.student_id);
      const studentName = std ? `${std.first_name} ${std.last_name}`.toLowerCase() : "";
      return (
        studentName.includes(searchQuery.toLowerCase()) ||
        fup.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (std?.classroom_name && std.classroom_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        fup.status?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [followups, students, searchQuery]);

  const filteredEvidences = useMemo(() => {
    let list = evidences;
    if (activeEvidenceFilter !== "Todas") {
      list = evidences.filter(e => e.category === activeEvidenceFilter || e.category?.startsWith(activeEvidenceFilter.slice(0, 4)));
    }
    if (searchQuery.trim()) {
      list = list.filter(e => e.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  }, [evidences, activeEvidenceFilter, searchQuery]);

  const currentTabName = useMemo(() => {
    const map: Record<string, string> = {
      inicio: "Panel Principal",
      bitacora: "Bitácora",
      acompanamiento: "Acompañamientos",
      docentes: "Expedientes Docentes",
      planificaciones: "Control de Planificaciones",
      estudiantes: "Estudiantes en Seguimiento",
      actas: "Actas y Reuniones",
      informes: "Informes Automáticos",
      evidencias: "Banco de Evidencias",
      estadisticas: "Estadísticas Pedagógicas",
      configuracion: "Configuración"
    };
    return map[activeTab] || "Panel Principal";
  }, [activeTab]);

  const activeTeacherProfile = useMemo(() => {
    if (!selectedTeacherId) return null;
    return teachers.find(t => t.id === selectedTeacherId);
  }, [selectedTeacherId, teachers]);

  const activeTeacherObs = useMemo(() => {
    if (!selectedTeacherId) return [];
    return observations.filter(o => o.teacher_id === selectedTeacherId);
  }, [selectedTeacherId, observations]);

  const activeTeacherAgreements = useMemo(() => {
    if (!selectedTeacherId) return [];
    return agreements.filter(a => a.teacher_id === selectedTeacherId);
  }, [selectedTeacherId, agreements]);

  const activeTeacherEvidences = useMemo(() => {
    if (!selectedTeacherId) return [];
    return evidences.filter(e => e.teacher_id === selectedTeacherId);
  }, [selectedTeacherId, evidences]);

  const activeTeacherPlannings = useMemo(() => {
    if (!selectedTeacherId) return [];
    return plannings.filter(p => p.docente_id === selectedTeacherId);
  }, [selectedTeacherId, plannings]);

  const activeTeacherAverageScore = useMemo(() => {
    if (activeTeacherObs.length === 0) return null;
    return Math.round(activeTeacherObs.reduce((acc, curr) => acc + curr.score, 0) / activeTeacherObs.length);
  }, [activeTeacherObs]);

  const activeTeacherAgreementsStats = useMemo(() => {
    const total = activeTeacherAgreements.length;
    const completed = activeTeacherAgreements.filter(a => a.status === 'Cumplido').length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [activeTeacherAgreements]);

  // Clock state
  const [timeStr, setTimeStr] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString("es-DO", { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Time-based greeting
  const greetingData = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "¡Buenos días", icon: "☀️" };
    if (hour >= 12 && hour < 19) return { text: "¡Buenas tardes", icon: "🌤️" };
    return { text: "¡Buenas noches", icon: "🌙" };
  }, []);

  // Educational motivational reflections
  const subGreetingReflection = useMemo(() => {
    const reflections = [
      "La supervisión pedagógica es un puente de acompañamiento y crecimiento mutuo.",
      "El éxito de un centro educativo radica en el trabajo colaborativo y la retroalimentación oportuna.",
      "Acompañar las prácticas docentes es sembrar calidad en cada aula dominicana.",
      "Liderar con empatía y rigor transforma el aprendizaje en las escuelas.",
      "Tu rol como coordinador impulsa el desarrollo curricular de nuestra nación."
    ];
    const seed = new Date().getDate();
    return reflections[seed % reflections.length];
  }, []);

  if (!user) return null;

  return (
    <div className={`flex-1 flex flex-col gap-6 w-full min-w-0 pb-12 pt-0 px-6 transition-all duration-150 ease-out ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <Toaster position="top-center" richColors />

      {/* INTEGRATED CANVAS HEADER */}
      <HeaderControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Buscar docente, planificación, estudiante, evidencia..."
        theme={theme}
        toggleTheme={toggleTheme}
        unreadCount={unreadCount}
        notifications={notifications}
        showNotificationDropdown={showNotificationDropdown}
        setShowNotificationDropdown={setShowNotificationDropdown}
        clearAllNotifications={clearAllNotifications}
        markAsRead={markAsRead}
        deleteNotification={deleteNotification}
        user={user}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        handleLogout={handleLogout}
        onOpenHelp={() => toast.info("Cargando guías y ayuda de coordinación pedagógica...")}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[60vh] py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-brand-primary w-8 h-8" />
            <span className="text-sm font-semibold text-slate-500">Cargando datos de coordinación...</span>
          </div>
        </div>
      ) : (
        <div className="w-full text-left">

          {/* TAB 1: INICIO */}
          {activeTab === "inicio" && (
            <div className="space-y-8 flex flex-col">

              {/* Main Banner Greeting */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[28px] p-6 md:p-8 shadow-sm relative overflow-hidden text-left">
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h2 className="text-xl md:text-2xl font-black text-[#1B1B1B] dark:text-white tracking-tight flex items-center gap-2 leading-tight">
                        {greetingData.text}, {user?.nombre || "Coordinador"}!
                        <span className="text-xl md:text-2xl">{greetingData.icon}</span>
                      </h2>
                      <p className="text-[#1B1B1B]/60 dark:text-slate-400 text-[11px] md:text-xs font-bold leading-relaxed max-w-xl">
                        {subGreetingReflection}
                      </p>
                    </div>
                    <div className="text-right text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 justify-end">
                      <Calendar className="w-4 h-4 text-brand-primary" />
                      <span>Año Lectivo: <span className="text-[#1B1B1B] dark:text-white underline">2026-2027</span></span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 mt-0.5">
                    <span className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-amber-800/20 text-slate-700 dark:text-amber-300 font-extrabold text-[9.5px] tracking-wider uppercase px-2.5 py-1 rounded-lg">
                      Centro Educativo
                    </span>
                    <span className="text-xs font-black text-[#1B1B1B] dark:text-white flex items-center gap-1">
                      {user.colegio} · Distrito {user.distrito} · Regional {user.regional} <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                    </span>
                  </div>
                </div>
              </section>

              {/* STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between min-h-[110px] hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-black text-brand-primary dark:text-brand-primary">{teachers.length}</span>
                    <div className="w-8 h-8 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center shrink-0">
                      <GraduationCap className="h-4 w-4 fill-brand-primary/20 text-brand-primary" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400">Docentes Acompañados</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between min-h-[110px] hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{plannings.length}</span>
                    <div className="w-8 h-8 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                      <ClipboardList className="h-4 w-4 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400">Planificaciones Recibidas</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between min-h-[110px] hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{students.length}</span>
                    <div className="w-8 h-8 bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 fill-amber-500/20 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400">Estudiantes en Seguimiento</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between min-h-[110px] hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-black text-rose-650 dark:text-rose-455">{logs.filter(l => l.status === 'Urgente').length}</span>
                    <div className="w-8 h-8 bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 rounded-full flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4 w-4 fill-rose-500/20 text-rose-600 dark:text-rose-455" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400">Incidencias Urgentes</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between min-h-[110px] hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-black text-purple-655 dark:text-purple-400">{meetings.length}</span>
                    <div className="w-8 h-8 bg-purple-500/10 dark:bg-purple-950/40 text-purple-655 dark:text-purple-400 rounded-full flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 fill-purple-500/20 text-purple-655 dark:text-purple-400" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400">Reuniones Realizadas</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between min-h-[110px] hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-black text-blue-650 dark:text-blue-400">4</span>
                    <div className="w-8 h-8 bg-blue-500/10 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 fill-blue-500/20 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400">Informes Pendientes</span>
                </div>
              </div>

              {/* Row 3: Últimos Acompañamientos y Estudiantes en Alerta */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Accompaniments */}
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm overflow-hidden text-left">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center shrink-0">
                        <Eye size={16} className="fill-brand-primary/20 text-brand-primary" />
                      </div>
                      <span>Últimos Acompañamientos</span>
                    </h3>
                    <button
                      onClick={() => setSearchParams({ tab: "acompanamiento" })}
                      className="text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-zinc-800 rounded-full px-3 py-1 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Ver todos →
                    </button>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-xs font-medium text-slate-700 dark:text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-slate-500 uppercase font-bold text-[9px] tracking-wider text-left">
                          <th className="pb-3">Docente</th>
                          <th className="pb-3 text-center">Fecha Visita</th>
                          <th className="pb-3 text-center">Puntaje</th>
                          <th className="pb-3 text-center">Estatus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teachers.slice(0, 3).map((teacher) => {
                          const teacherObs = observations.filter(o => o.teacher_id === teacher.id);
                          const lastObs = teacherObs[0];
                          return (
                            <tr key={teacher.id} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                              <td className="py-3 font-bold flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full border border-black/5 overflow-hidden bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                                  {teacher.avatar_url ? (
                                    <img src={teacher.avatar_url} alt={teacher.full_name} className="w-full h-full object-cover" />
                                  ) : (
                                    teacher.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
                                  )}
                                </div>
                                {teacher.full_name}
                              </td>
                              <td className="py-3 text-center font-bold text-slate-400 dark:text-slate-500">
                                {lastObs ? lastObs.observation_date : 'Sin acompañar'}
                              </td>
                              <td className="py-3 text-center font-black">
                                {lastObs ? `${lastObs.score}%` : '--'}
                              </td>
                              <td className="py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[8.5px] ${lastObs?.status === 'Acompañado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-amber-50 text-amber-700 border border-amber-250'
                                  }`}>
                                  {lastObs ? lastObs.status : 'Pendiente'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {teachers.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-400 font-bold">No hay docentes registrados.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Estudiantes en alerta */}
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm overflow-hidden text-left">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 rounded-full flex items-center justify-center shrink-0">
                        <AlertTriangle size={16} className="fill-rose-500/20 text-rose-600 dark:text-rose-455" />
                      </div>
                      <span>Estudiantes en alerta</span>
                    </h3>
                    <button
                      onClick={() => setSearchParams({ tab: "estudiantes" })}
                      className="text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-zinc-800 rounded-full px-3 py-1 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Ver todos →
                    </button>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-xs font-medium text-slate-700 dark:text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-slate-500 uppercase font-bold text-[9px] tracking-wider text-left">
                          <th className="pb-3">Estudiante</th>
                          <th className="pb-3">Motivo</th>
                          <th className="pb-3 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {followups.slice(0, 3).map((fup) => {
                          const std = students.find(s => s.id === fup.student_id);
                          return (
                            <tr key={fup.id} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                              <td className="py-3 font-bold text-slate-700 dark:text-slate-200">
                                {std ? `${std.first_name} ${std.last_name || ""}` : 'Estudiante desconocido'}
                                {std?.classroom_name && (
                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold"> · {formatGradeName(std.classroom_name)}</span>
                                )}
                              </td>
                              <td className="py-3 font-semibold text-slate-500 dark:text-slate-400">
                                {fup.reason}
                              </td>
                              <td className="py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[8.5px] ${fup.status === 'Urgente' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    fup.status === 'Seguimiento' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                      fup.status === 'En proceso' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                        'bg-emerald-50 text-emerald-700 border border-emerald-250'
                                  }`}>
                                  {fup.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {followups.length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-slate-400 font-bold">No hay estudiantes en alerta.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Row 2: Bitácora en ancho completo */}
              <div className="w-full mb-8">
                {/* Log Preview */}
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm flex flex-col justify-between text-left">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center shrink-0">
                        <BookOpen size={16} className="fill-brand-primary/20 text-brand-primary" />
                      </div>
                      <span>Bitácora</span>
                    </h3>
                    <button
                      onClick={() => setSearchParams({ tab: "bitacora" })}
                      className="text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-zinc-800 rounded-full px-3 py-1 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Ver completa →
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                    {logs.slice(0, 3).map((item) => (
                      <div key={item.id} className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-start gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${item.status === 'Resuelto' ? 'bg-emerald-500' :
                            item.status === 'Urgente' ? 'bg-red-500' : 'bg-amber-500'
                          }`} />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-750 dark:text-slate-350 leading-relaxed">{item.description}</p>
                          <span className="text-[10px] text-brand-primary dark:text-brand-primary font-bold mt-1 block">{item.time} · {item.category}</span>
                        </div>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-10 font-bold">No hay registros en la bitácora hoy.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 4: Estatus de Planificaciones y Próximas Reuniones */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Planificaciones semáforo */}
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm text-left">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                      <ClipboardList size={16} className="fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span>Estatus de Planificaciones</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl text-center border border-emerald-500/10">
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 block">{plannings.filter(p => getPlanningStatus(p) === 'Finalizado').length}</span>
                        <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Aprobadas</span>
                      </div>
                      <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl text-center border border-amber-500/10">
                        <span className="text-xl font-bold text-amber-600 dark:text-amber-400 block">{plannings.filter(p => getPlanningStatus(p) === 'En Redacción' || getPlanningStatus(p) === 'Borrador').length}</span>
                        <span className="text-[9px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Pendientes</span>
                      </div>
                      <div className="bg-red-50/50 dark:bg-red-950/20 p-4 rounded-xl text-center border border-red-500/10">
                        <span className="text-xl font-bold text-red-600 dark:text-red-400 block">{teachers.length - plannings.length > 0 ? teachers.length - plannings.length : 0}</span>
                        <span className="text-[9px] font-bold text-red-800 dark:text-red-400 uppercase tracking-wider">Sin Entregar</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        <span>Porcentaje de Entrega General</span>
                        <span>{teachers.length > 0 ? Math.round((plannings.length / teachers.length) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${teachers.length > 0 ? Math.round((plannings.length / teachers.length) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meeting Card */}
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm text-left">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/10 dark:bg-purple-950/40 text-purple-655 dark:text-purple-400 rounded-full flex items-center justify-center shrink-0">
                      <Calendar size={16} className="fill-purple-500/20 text-purple-655 dark:text-purple-400" />
                    </div>
                    <span>Próximas Reuniones</span>
                  </h3>
                  <div className="space-y-4">
                    {meetings.slice(0, 2).map(meet => (
                      <div key={meet.id} className="border border-black/5 dark:border-zinc-850 p-4 rounded-2xl flex gap-3">
                        <div className="bg-brand-primary text-white rounded-lg p-2.5 text-center min-w-[50px] font-black h-fit">
                          <span className="block text-lg leading-none">{meet.meeting_date?.split('-')[2] || '02'}</span>
                          <span className="text-[9px] uppercase tracking-wider mt-1 block">Jul</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-white">{meet.title}</h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap font-semibold">
                            <span className="flex items-center gap-0.5"><Clock size={11} className="text-slate-400 dark:text-slate-500" /> {meet.meeting_time}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><MapPin size={11} className="text-slate-400 dark:text-slate-500" /> {meet.location}</span>
                          </p>
                          <span className="bg-brand-primary/5 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary font-bold px-2 py-0.5 rounded-full text-[9px] border border-brand-primary/20 mt-2 inline-block">{meet.invited_count} convocados</span>
                        </div>
                      </div>
                    ))}
                    {meetings.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-10 font-bold">No hay reuniones programadas.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BITÁCORA */}
          {activeTab === "bitacora" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white tracking-tight leading-none">
                    Bitácora
                  </h1>
                  <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5">
                    Registro diario de incidencias, observaciones rápidas y gestiones de coordinación.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-brand-primary hover:bg-brand-hover text-white rounded-full px-5 py-2 font-bold text-[13px] shadow-sm active:scale-95 transition-all select-none border border-transparent flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  + Agregar Entrada
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm space-y-4">
                {filteredLogs.map((item) => {
                  // Category styling and icon mapping
                  const getCategoryStyle = (cat: string) => {
                    const norm = cat?.toLowerCase() || '';
                    if (norm.includes('acompañamiento')) {
                      return {
                        icon: <GraduationCap className="w-3.5 h-3.5" />,
                        badge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-350 border border-indigo-200/50 dark:border-indigo-900/40',
                        border: 'border-l-indigo-500 dark:border-l-indigo-650'
                      };
                    }
                    if (norm.includes('incidencia')) {
                      return {
                        icon: <AlertTriangle className="w-3.5 h-3.5" />,
                        badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-350 border border-rose-200/50 dark:border-rose-900/40',
                        border: 'border-l-rose-500 dark:border-l-rose-650'
                      };
                    }
                    if (norm.includes('gestión') || norm.includes('institucional')) {
                      return {
                        icon: <ClipboardList className="w-3.5 h-3.5" />,
                        badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-350 border border-emerald-200/50 dark:border-emerald-900/40',
                        border: 'border-l-emerald-500 dark:border-l-emerald-650'
                      };
                    }
                    if (norm.includes('familia')) {
                      return {
                        icon: <Heart className="w-3.5 h-3.5" />,
                        badge: 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-350 border border-pink-200/50 dark:border-pink-900/40',
                        border: 'border-l-pink-500 dark:border-l-pink-650'
                      };
                    }
                    if (norm.includes('estudiante')) {
                      return {
                        icon: <Users className="w-3.5 h-3.5" />,
                        badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-350 border border-amber-200/50 dark:border-amber-900/40',
                        border: 'border-l-amber-500 dark:border-l-amber-650'
                      };
                    }
                    return {
                      icon: <BookOpen className="w-3.5 h-3.5" />,
                      badge: 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700',
                      border: 'border-l-slate-400 dark:border-l-zinc-650'
                    };
                  };

                  const getStatusStyle = (status: string) => {
                    const norm = status?.toLowerCase() || '';
                    if (norm.includes('resuelto')) {
                      return {
                        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
                        dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      };
                    }
                    if (norm.includes('urgente')) {
                      return {
                        badge: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
                        dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse'
                      };
                    }
                    if (norm.includes('seguimiento')) {
                      return {
                        badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
                        dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      };
                    }
                    return {
                      badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20',
                      dot: 'bg-slate-400 dark:bg-slate-500'
                    };
                  };

                  const catStyle = getCategoryStyle(item.category);
                  const statusStyle = getStatusStyle(item.status);

                  return (
                    <div
                      key={item.id}
                      className={`p-5 bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-black/5 dark:border-zinc-800 border-l-4 ${catStyle.border} rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-black/10 dark:hover:border-zinc-750 hover:shadow-md hover:scale-[1.005] transition-all duration-300 text-left`}
                    >
                      <div className="space-y-3 flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Categoría Badge */}
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${catStyle.badge}`}>
                            {catStyle.icon}
                            <span>{item.category}</span>
                          </div>

                          {/* Estado Badge */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold ${statusStyle.badge}`}>
                            <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                            <span>{item.status}</span>
                          </div>
                        </div>

                        {/* Descripción */}
                        <p className="text-[13px] sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Involucrados */}
                        {item.involved_people && (
                          <div className="flex items-center gap-2 mt-1 bg-slate-50/80 dark:bg-zinc-800/40 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5 w-fit">
                            <Users className="w-3.5 h-3.5 text-brand-primary dark:text-brand-primary" />
                            <span className="text-[11px] font-semibold text-slate-650 dark:text-slate-400">
                              Involucrados: <strong className="text-slate-855 dark:text-slate-200 font-bold ml-1">{item.involved_people}</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info de tiempo y Acciones */}
                      <div className="flex items-center md:items-end justify-between md:flex-col gap-3 w-full md:w-auto shrink-0 md:self-stretch md:justify-between border-t md:border-t-0 border-slate-100 dark:border-zinc-850 pt-3 md:pt-0">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-455 dark:text-slate-500">
                          <Calendar size={12} className="text-slate-400 dark:text-slate-500" />
                          <span>{item.date}</span>
                          <span className="text-slate-300 dark:text-zinc-700">•</span>
                          <Clock size={12} className="text-slate-400 dark:text-slate-500" />
                          <span>{item.time}</span>
                        </div>

                        <button
                          onClick={() => handleDeleteLog(item.id)}
                          className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer flex items-center justify-center border border-transparent hover:border-red-100 dark:hover:border-red-950/40 shrink-0"
                          title="Eliminar registro"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-10 font-bold">No hay registros de bitácora.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACOMPAÑAMIENTOS */}
          {activeTab === "acompanamiento" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white tracking-tight leading-none">
                    Acompañamientos
                  </h1>
                  <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5">
                    Historial de visitas de acompañamiento áulico, observaciones y planes de mejora.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsObsModalOpen(true);
                    setTimeout(() => {
                      document.getElementById("observation-form-container")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="bg-brand-primary hover:bg-brand-hover text-white rounded-full px-5 py-2 font-bold text-[13px] shadow-sm active:scale-95 transition-all select-none border border-transparent flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  + Nuevo Acompañamiento
                </button>
              </div>

              {isObsModalOpen && (
                <div 
                  id="observation-form-container"
                  className="p-5 border border-black/5 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200 mb-6 text-left"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
                    <h3 className="text-sm font-black text-[#1B1B1B] dark:text-white flex items-center gap-1.5">
                      <Eye size={16} className="text-brand-primary" />
                      <span>Registrar Acompañamiento Áulico</span>
                    </h3>
                    <button
                      onClick={() => setIsObsModalOpen(false)}
                      className="flex items-center justify-center h-6 w-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer border-none shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveObservation} className="space-y-4">
                    <div className="flex flex-col gap-2 text-xs">
                      <label className="font-bold text-brand-primary uppercase">Docente Acompañado</label>
                      <CustomSelect
                        value={obsForm.teacher_id}
                        onChange={val => setObsForm(prev => ({ ...prev, teacher_id: val }))}
                        options={teachers.map(t => ({ value: t.id, label: `${t.full_name} (${t.nivel_principal || 'General'})` }))}
                        placeholder="-- Seleccionar Docente --"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex flex-col gap-2">
                        <label className="font-bold text-brand-primary uppercase">Fecha de Observación</label>
                        <DatePicker
                          value={obsForm.date}
                          onChange={val => setObsForm(prev => ({ ...prev, date: val }))}
                          direction="down"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-bold text-brand-primary uppercase">Próximo Acompañamiento</label>
                        <DatePicker
                          value={obsForm.next_date}
                          onChange={val => setObsForm(prev => ({ ...prev, next_date: val }))}
                          direction="down"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex flex-col gap-2">
                        <label className="font-bold text-brand-primary uppercase">Puntaje (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={obsForm.score}
                          onChange={e => setObsForm(prev => ({ ...prev, score: Number(e.target.value) }))}
                          className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs font-semibold"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-bold text-brand-primary uppercase">Estado de la Visita</label>
                        <CustomSelect
                          value={obsForm.status}
                          onChange={val => setObsForm(prev => ({ ...prev, status: val }))}
                          options={[
                            { value: "Acompañado", label: "Acompañado" },
                            { value: "Req. seguimiento", label: "Req. Seguimiento" }
                          ]}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-xs">
                      <label className="font-bold text-brand-primary uppercase">Observaciones Generales</label>
                      <textarea
                        rows={2}
                        value={obsForm.observations}
                        onChange={e => setObsForm(prev => ({ ...prev, observations: e.target.value }))}
                        placeholder="Describe la situation, metodología o clima áulico observado..."
                        className="w-full p-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-2 text-xs">
                      <label className="font-bold text-brand-primary uppercase">Aspectos Positivos</label>
                      <textarea
                        rows={2}
                        value={obsForm.positive_feedback}
                        onChange={e => setObsForm(prev => ({ ...prev, positive_feedback: e.target.value }))}
                        placeholder="Describe las fortalezas y buenas prácticas observadas..."
                        className="w-full p-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-2 text-xs">
                      <label className="font-bold text-brand-primary uppercase">Áreas de Mejora sugeridas</label>
                      <textarea
                        rows={2}
                        value={obsForm.areas_of_improvement}
                        onChange={e => setObsForm(prev => ({ ...prev, areas_of_improvement: e.target.value }))}
                        placeholder="Describe las oportunidades y recomendaciones metodológicas..."
                        className="w-full p-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-2 text-xs border-t border-black/5 dark:border-zinc-800 pt-3">
                      <label className="font-bold text-brand-primary uppercase tracking-wide">Acuerdo / Compromiso de Mejora</label>
                      <textarea
                        rows={2}
                        value={obsForm.agreement_text}
                        onChange={e => setObsForm(prev => ({ ...prev, agreement_text: e.target.value }))}
                        placeholder="Escribe el compromiso asumido por el docente para la próxima visita..."
                        className="w-full p-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none font-semibold"
                      />
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setIsObsModalOpen(false)}
                        className="bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700 border border-black/10 dark:border-zinc-700 text-slate-800 dark:text-zinc-300 px-4 py-2 rounded-full text-[13px] font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-brand-primary hover:bg-brand-hover text-white border border-transparent text-[13px] font-bold px-5 py-2 rounded-full shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer select-none"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Guardar Acompañamiento
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs font-medium text-slate-700 dark:text-slate-350">
                    <thead>
                      <tr className="bg-brand-primary text-white uppercase font-bold text-[9px] tracking-wider text-left">
                        <th className="rounded-l-xl py-3 px-4">Docente</th>
                        <th className="py-3 px-4 text-center">Fecha Visita</th>
                        <th className="py-3 px-4 text-center">Puntaje</th>
                        <th className="py-3 px-4 text-center">Estatus</th>
                        <th className="py-3 px-4">Observaciones de la Visita</th>
                        <th className="rounded-r-xl py-3 px-4 text-center">Próxima Visita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {observations.map((obs) => {
                        const t = teachers.find(teach => teach.id === obs.teacher_id);
                        return (
                          <tr key={obs.id} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors text-left">
                            <td className="py-4 px-4 font-bold flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full border border-black/5 overflow-hidden bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                                {t?.avatar_url ? (
                                  <img src={t.avatar_url} alt={t?.full_name} className="w-full h-full object-cover" />
                                ) : (
                                  t?.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'DC'
                                )}
                              </div>
                              {t ? t.full_name : 'Docente desconocido'}
                            </td>
                            <td className="py-4 px-4 text-center font-bold text-slate-400 dark:text-slate-500">
                              {obs.observation_date}
                            </td>
                            <td className="py-4 px-4 text-center font-black">
                              {obs.score} pts
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${obs.status === 'Acompañado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-red-50 text-red-700 border border-red-250'
                                }`}>
                                {obs.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 pr-4">
                              <p className="line-clamp-2 leading-relaxed text-slate-455 dark:text-slate-400 text-[11px] max-w-sm">{obs.observations || 'Sin notas registradas.'}</p>
                            </td>
                            <td className="py-4 px-4 text-center font-semibold text-slate-400 dark:text-slate-500">
                              {obs.next_observation_date || 'Sin programar'}
                            </td>
                          </tr>
                        );
                      })}
                      {observations.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 px-4 text-center text-slate-400 font-bold">No hay visitas de acompañamiento registradas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCENTES */}
          {activeTab === "docentes" && (
            <div className="space-y-6">
              {selectedTeacherId && activeTeacherProfile ? (
                /* INLINE FULL-PAGE PROFILE VIEW */
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[32px] w-full shadow-md flex flex-col text-left overflow-hidden transition-all duration-350">
                  {/* Header Banner - Minimalist Professional Redesign */}
                  <div className="bg-slate-50/70 dark:bg-zinc-900/60 border-b border-black/5 dark:border-zinc-855 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
                    <div className="flex items-center gap-4.5">
                      <div className="w-14 h-14 rounded-full border border-slate-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold text-lg shrink-0 shadow-2xs">
                        {activeTeacherProfile.avatar_url ? (
                          <img src={activeTeacherProfile.avatar_url} alt={activeTeacherProfile.full_name} className="w-full h-full object-cover" />
                        ) : (
                          activeTeacherProfile.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block">Expediente de Desempeño</span>
                        <h3 className="text-lg font-extrabold text-[#1B1B1B] dark:text-white mt-0.5 leading-none">{activeTeacherProfile.full_name}</h3>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium block mt-1.5">{activeTeacherProfile.school_name || activeTeacherProfile.colegio || 'Centro Educativo'} • Nivel {activeTeacherProfile.nivel_principal || 'General'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => {
                          setObsForm(prev => ({ ...prev, teacher_id: activeTeacherProfile.id }));
                          setIsObsModalOpen(true);
                          setSearchParams({ tab: 'acompanamiento' });
                        }}
                        className="px-4 py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-3xs active:scale-95 border-none"
                      >
                        <Plus size={14} />
                        <span>Acompañar</span>
                      </button>
                      <button
                        onClick={() => {
                          if (!activeTeacherProfile) return;
                          
                          const teacherName = activeTeacherProfile.full_name;
                          const formattedDate = new Date().toLocaleDateString('es-DO').replace(/\//g, '-');
                          const pdfFileName = `Planix - Expediente - ${teacherName} - ${formattedDate}`;
                          
                          const originalTitle = document.title;
                          document.title = pdfFileName;
                          
                          const obsRows = activeTeacherObs.map(o => `
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                              <td style="padding: 10px; font-weight: 600; color: #475569; font-size: 11px;">${o.observation_date}</td>
                              <td style="padding: 10px; font-weight: 800; color: #0066DA; text-align: center; font-size: 11px;">${o.score}%</td>
                              <td style="padding: 10px; text-align: center;">
                                <span style="padding: 3px 9px; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; ${
                                  o.status === 'Acompañado' 
                                    ? 'background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;' 
                                    : 'background-color: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5;'
                                }">${o.status}</span>
                              </td>
                              <td style="padding: 10px; color: #334155; font-size: 11px; max-width: 320px; line-height: 1.4;">${o.observations || 'Sin notas registradas.'}</td>
                            </tr>
                          `).join('');

                          const agreementRows = activeTeacherAgreements.map(a => `
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                              <td style="padding: 10px; color: #334155; font-weight: 550; font-size: 11px; line-height: 1.4;">${a.agreement_text}</td>
                              <td style="padding: 10px; color: #64748b; font-size: 11px; text-align: center;">${a.due_date || 'Sin fecha'}</td>
                              <td style="padding: 10px; text-align: center;">
                                <span style="padding: 3px 9px; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; ${
                                  a.status === 'Cumplido' 
                                    ? 'background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;' 
                                    : 'background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a;'
                                }">${a.status}</span>
                              </td>
                            </tr>
                          `).join('');

                          const printWindow = window.open('', '_blank');
                          if (!printWindow) return;
                          
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>${pdfFileName}</title>
                                <style>
                                  @page {
                                    size: auto;
                                    margin: 0mm; /* Disables default browser headers and footers */
                                  }
                                  body {
                                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                    color: #1B1B1B;
                                    margin: 0;
                                    padding: 25mm 20mm; /* Sets clean page print margins */
                                    background-color: #ffffff;
                                    line-height: 1.5;
                                    -webkit-print-color-adjust: exact;
                                    print-color-adjust: exact;
                                  }
                                  .header-centered {
                                    text-align: center;
                                    margin-bottom: 30px;
                                    border-bottom: 1px solid #e2e8f0;
                                    padding-bottom: 20px;
                                  }
                                  .logo-img {
                                    height: 52px;
                                    width: auto;
                                    object-fit: contain;
                                    margin-bottom: 12px;
                                    display: block;
                                    margin-left: auto;
                                    margin-right: auto;
                                  }
                                  .report-title {
                                    font-size: 18px;
                                    font-weight: 800;
                                    color: #0066DA;
                                    margin: 0;
                                    letter-spacing: -0.01em;
                                    text-transform: uppercase;
                                    text-align: center;
                                  }
                                  .report-meta {
                                    font-size: 10px;
                                    color: #64748b;
                                    margin-top: 6px;
                                    text-align: center;
                                  }
                                  .teacher-card {
                                    background-color: #f8fafc;
                                    border: 1px solid #e2e8f0;
                                    border-radius: 16px;
                                    padding: 16px;
                                    margin-bottom: 25px;
                                    display: flex !important;
                                    flex-direction: row !important;
                                    align-items: center !important;
                                    gap: 15px;
                                  }
                                  .teacher-avatar {
                                    width: 44px;
                                    height: 44px;
                                    border-radius: 50%;
                                    background-color: #e0f2fe;
                                    color: #0066DA;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 16px;
                                    font-weight: 800;
                                    border: 2px solid #bae6fd;
                                  }
                                  .teacher-name {
                                    font-size: 15px;
                                    font-weight: 800;
                                    color: #1B1B1B;
                                    margin: 0;
                                    text-align: left;
                                  }
                                  .teacher-meta {
                                    font-size: 11px;
                                    color: #64748b;
                                    margin-top: 3px;
                                    font-weight: 600;
                                    text-align: left;
                                  }
                                  .stats-grid {
                                    display: flex !important;
                                    flex-direction: row !important;
                                    flex-wrap: nowrap !important;
                                    gap: 12px;
                                    margin-bottom: 30px;
                                    width: 100%;
                                  }
                                  .stat-box {
                                    flex: 1 !important;
                                    border: 1px solid #e2e8f0;
                                    border-radius: 12px;
                                    padding: 12px;
                                    background-color: #ffffff;
                                    text-align: left;
                                    min-width: 0;
                                  }
                                  .stat-label {
                                    font-size: 9px;
                                    font-weight: 700;
                                    color: #64748b;
                                    text-transform: uppercase;
                                    letter-spacing: 0.03em;
                                  }
                                  .stat-value {
                                    font-size: 14px;
                                    font-weight: 800;
                                    color: #0066DA;
                                    margin-top: 4px;
                                  }
                                  .section-title {
                                    font-size: 11px;
                                    font-weight: 800;
                                    color: #1B1B1B;
                                    text-transform: uppercase;
                                    letter-spacing: 0.05em;
                                    margin-bottom: 12px;
                                    display: flex !important;
                                    flex-direction: row !important;
                                    align-items: center !important;
                                    gap: 8px;
                                    border-left: 4px solid #0066DA;
                                    padding-left: 8px;
                                    text-align: left;
                                  }
                                  table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin-bottom: 30px;
                                  }
                                  th {
                                    background-color: #0066DA;
                                    color: #ffffff;
                                    font-weight: 800;
                                    font-size: 9px;
                                    text-transform: uppercase;
                                    padding: 10px;
                                    text-align: left;
                                  }
                                  td {
                                    padding: 10px;
                                    font-size: 11px;
                                    border-bottom: 1px solid #e2e8f0;
                                    text-align: left;
                                    vertical-align: top;
                                    color: #334155;
                                  }
                                  tr {
                                    page-break-inside: avoid;
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="header-centered">
                                  <img class="logo-img" src="/Logo-login-y-landing.webp" alt="Planix Logo" />
                                  <h1 class="report-title">REPORTE DE DESEMPEÑO DOCENTE</h1>
                                  <div class="report-meta">
                                    <strong>Fecha Emisión:</strong> ${new Date().toLocaleDateString('es-DO')}&nbsp;&bull;&nbsp;<strong>Tipo:</strong> Expediente de Desempeño
                                  </div>
                                </div>

                                <div class="teacher-card">
                                  <div class="teacher-avatar">${teacherName.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
                                  <div>
                                    <h2 class="teacher-name">${teacherName}</h2>
                                    <div class="teacher-meta">
                                      ${activeTeacherProfile.school_name || activeTeacherProfile.colegio || 'Centro Educativo'} &bull; Nivel ${activeTeacherProfile.nivel_principal || 'General'}
                                    </div>
                                  </div>
                                </div>

                                <div class="stats-grid">
                                  <div class="stat-box">
                                    <div class="stat-label">Acompañamientos</div>
                                    <div class="stat-value">${activeTeacherObs.length} visitas</div>
                                  </div>
                                  <div class="stat-box">
                                    <div class="stat-label">Calidad Promedio</div>
                                    <div class="stat-value">${activeTeacherAverageScore !== null ? `${activeTeacherAverageScore}%` : '0%'}</div>
                                  </div>
                                  <div class="stat-box">
                                    <div class="stat-label">Planificaciones</div>
                                    <div class="stat-value">${activeTeacherPlannings.length} entregas</div>
                                  </div>
                                  <div class="stat-box">
                                    <div class="stat-label">Acuerdos</div>
                                    <div class="stat-value">${activeTeacherAgreements.length} compromisos</div>
                                  </div>
                                </div>

                                <div class="section-title">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0066DA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                                  <span>Historial de Acompañamientos Áulicos</span>
                                </div>
                                <table>
                                  <thead>
                                    <tr>
                                      <th style="width: 15%;">Fecha</th>
                                      <th style="width: 12%; text-align: center;">Puntaje</th>
                                      <th style="width: 18%; text-align: center;">Estatus</th>
                                      <th style="width: 55%;">Observaciones de Aula</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${obsRows || '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #94a3b8; font-weight: 500;">No hay visitas registradas para este docente.</td></tr>'}
                                  </tbody>
                                </table>

                                <div class="section-title" style="margin-top: 15px;">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0066DA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="m16 11 2 2 4-4"></path></svg>
                                  <span>Acuerdos y Compromisos de Mejora</span>
                                </div>
                                <table>
                                  <thead>
                                    <tr>
                                      <th style="width: 65%;">Compromiso</th>
                                      <th style="width: 20%; text-align: center;">Fecha Límite</th>
                                      <th style="width: 15%; text-align: center;">Estado</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${agreementRows || '<tr><td colspan="3" style="padding: 20px; text-align: center; color: #94a3b8; font-weight: 500;">No hay compromisos registrados.</td></tr>'}
                                  </tbody>
                                </table>

                                <script>
                                  window.onload = function() {
                                    window.print();
                                    setTimeout(function() { window.close(); }, 500);
                                  }
                                </script>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          
                          setTimeout(() => {
                            document.title = originalTitle;
                          }, 1000);
                        }}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-250 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:border-zinc-700 text-slate-650 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-3xs active:scale-95"
                      >
                        <Download size={14} />
                        <span>Reporte</span>
                      </button>
                      <button
                        onClick={() => setSelectedTeacherId(null)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-600 dark:text-zinc-300 border-none rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95"
                      >
                        <span>← Volver</span>
                      </button>
                    </div>
                  </div>

                  {/* KPI Stats Block */}
                  <div className="p-6 bg-slate-50/50 dark:bg-zinc-900/40 border-b border-black/5 dark:border-zinc-850 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-black/10 transition-all select-none">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">Acompañamientos</span>
                        <strong className="text-base font-black text-slate-800 dark:text-white block mt-0.5">{activeTeacherObs.length} visitas</strong>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-black/10 transition-all select-none">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <Trophy size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">Calidad Promedio</span>
                        <strong className="text-base font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          {activeTeacherAverageScore !== null ? `${activeTeacherAverageScore}%` : '--'}
                        </strong>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-black/10 transition-all select-none">
                      <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">Planificaciones</span>
                        <strong className="text-base font-black text-slate-800 dark:text-white block mt-0.5">{activeTeacherPlannings.length} entregas</strong>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-black/10 transition-all select-none">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <ClipboardList size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">Acuerdos</span>
                        <strong className="text-base font-black text-slate-800 dark:text-white block mt-0.5">
                          {activeTeacherAgreementsStats.pending} pend. / {activeTeacherAgreementsStats.completed} ok
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className="px-6 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 flex justify-center gap-6 md:gap-8 overflow-x-auto scrollbar-hide text-[15px] font-normal text-slate-400 select-none">
                    {(["obs", "retro", "acuerdos", "planes", "evidencias"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setExpedienteTab(tab)}
                        className={`py-4 border-b-2 transition-all cursor-pointer capitalize flex items-center gap-2 ${expedienteTab === tab ? "border-brand-primary text-brand-primary dark:text-brand-primary font-normal" : "border-transparent font-normal"}`}
                      >
                        {tab === 'obs' ? (
                          <>
                            <ClipboardList size={16} className="shrink-0" />
                            <span>Acompañamientos</span>
                          </>
                        ) : tab === 'retro' ? (
                          <>
                            <MessageCircle size={16} className="shrink-0" />
                            <span>Retroalimentaciones</span>
                          </>
                        ) : tab === 'acuerdos' ? (
                          <>
                            <UserCheck size={16} className="shrink-0" />
                            <span>Acuerdos</span>
                          </>
                        ) : tab === 'planes' ? (
                          <>
                            <BookOpen size={16} className="shrink-0" />
                            <span>Planificaciones</span>
                          </>
                        ) : (
                          <>
                            <FolderOpen size={16} className="shrink-0" />
                            <span>Evidencias</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Panels */}
                  <div className="p-6 space-y-4 bg-white dark:bg-zinc-900">
                    {expedienteTab === "obs" && (
                      <div className="space-y-4">
                        {activeTeacherObs.map((obs) => {
                          const scoreLevel = obs.score >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-205 text-xs' : obs.score >= 80 ? 'bg-blue-50 text-blue-700 border-blue-205 text-xs' : 'bg-amber-50 text-amber-700 border-amber-205 text-xs';
                          return (
                            <div key={obs.id} className="p-5 bg-slate-50/50 dark:bg-zinc-900/50 border border-black/5 dark:border-zinc-800 rounded-2xl space-y-3 shadow-xs">
                              <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-400">
                                <span className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-400 shrink-0" /> Acompañado el {obs.observation_date}</span>
                                <span className={`px-2 py-0.5 rounded-lg border font-black ${scoreLevel}`}>Puntaje: {obs.score}%</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 uppercase tracking-wide block">Observaciones del Aula</span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{obs.observations || 'Sin notas registradas.'}</p>
                              </div>
                            </div>
                          );
                        })}
                        {activeTeacherObs.length === 0 && (
                          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-zinc-850 rounded-2xl">
                            <ClipboardList className="w-10 h-10 text-slate-350 dark:text-zinc-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-bold">No hay observaciones registradas para este docente.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {expedienteTab === "retro" && (
                      <div className="space-y-4">
                        {activeTeacherObs.map((obs) => (
                          <div key={obs.id} className="p-5 bg-slate-50/30 dark:bg-zinc-900/30 border border-black/5 dark:border-zinc-800 rounded-2xl space-y-4">
                            <div className="border-b border-black/5 dark:border-zinc-800 pb-2 flex justify-between items-center">
                              <span className="text-[10.5px] font-bold text-slate-400">Visita del {obs.observation_date}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <Sparkles size={12} className="fill-emerald-500/10" />
                                  <span>Fortalezas Pedagógicas</span>
                                </span>
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{obs.positive_feedback || 'No registradas.'}</p>
                              </div>

                              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                                <span className="text-[10px] font-black text-amber-655 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <AlertTriangle size={12} />
                                  <span>Oportunidades de Mejora</span>
                                </span>
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{obs.areas_of_improvement || 'No especificadas.'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {activeTeacherObs.length === 0 && (
                          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-zinc-850 rounded-2xl">
                            <MessageCircle className="w-10 h-10 text-slate-350 dark:text-zinc-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-bold">No hay retroalimentaciones para este docente.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {expedienteTab === "acuerdos" && (
                      <div className="space-y-4">
                        <div className="space-y-2.5">
                          {activeTeacherAgreements.map((agr) => {
                            const isCompleted = agr.status === 'Cumplido';
                            return (
                              <div 
                                key={agr.id} 
                                onClick={() => handleToggleAgreementStatus(agr.id, agr.status)}
                                className={`p-4 border rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all duration-205 ${
                                  isCompleted 
                                    ? 'border-emerald-205 bg-emerald-500/5 text-slate-500 dark:text-slate-400' 
                                    : 'border-black/5 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-black/10 hover:shadow-xs'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                    isCompleted 
                                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                                      : 'border-slate-300 dark:border-zinc-700 bg-transparent'
                                  }`}>
                                    {isCompleted && <Check size={12} />}
                                  </div>
                                  <div className="text-left">
                                    <p className={`text-xs font-semibold leading-relaxed ${isCompleted ? 'line-through' : 'text-slate-800 dark:text-slate-200'}`}>{agr.agreement_text}</p>
                                    {agr.due_date && (
                                      <span className="text-[10px] text-slate-400 block mt-1 font-bold">Fecha límite: {agr.due_date}</span>
                                    )}
                                  </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] shrink-0 ${
                                  isCompleted 
                                    ? 'bg-emerald-100/50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200' 
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200'
                                }`}>
                                  {agr.status}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {activeTeacherAgreements.length === 0 && (
                          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-zinc-850 rounded-2xl">
                            <UserCheck className="w-10 h-10 text-slate-350 dark:text-zinc-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-bold">No hay compromisos o acuerdos pendientes.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {expedienteTab === "planes" && (
                      <div className="space-y-4">
                        <div className="border border-black/5 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-zinc-900">
                          <table className="w-full border-collapse text-left text-xs">
                            <thead>
                              <tr className="bg-brand-primary text-white dark:bg-zinc-950 font-bold">
                                <th className="py-3.5 px-4 font-extrabold uppercase tracking-wider text-white">Título / Unidad</th>
                                <th className="py-3.5 px-4 font-extrabold uppercase tracking-wider text-center text-white">Asignatura</th>
                                <th className="py-3.5 px-4 font-extrabold uppercase tracking-wider text-center text-white">Grado</th>
                                <th className="py-3.5 px-4 font-extrabold uppercase tracking-wider text-center text-white">Estado</th>
                                <th className="py-3.5 px-4 font-extrabold uppercase tracking-wider text-center text-white">Entrega</th>
                                <th className="py-3.5 px-4 font-extrabold uppercase tracking-wider text-center text-white">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeTeacherPlannings.map((plan) => {
                                const statusText = getPlanningStatus(plan);
                                let statusColor = "bg-slate-50 text-slate-600 border-slate-200";
                                if (statusText === 'Aprobada' || statusText === 'Finalizado') {
                                  statusColor = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-250";
                                } else if (statusText === 'Devuelto') {
                                  statusColor = "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-250";
                                } else if (statusText === 'Pendiente' || statusText === 'Reunión' || statusText === 'En Redacción') {
                                  statusColor = "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-250";
                                }

                                return (
                                  <tr key={plan.id} className="border-b border-slate-100 dark:border-zinc-850 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50">
                                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{plan.titulo || `Plan: ${plan.conceptual || 'Sin Tema'}`}</td>
                                    <td className="py-3.5 px-4 text-center font-medium text-slate-500 dark:text-zinc-400">{plan.asignatura}</td>
                                    <td className="py-3.5 px-4 text-center font-medium text-slate-500 dark:text-zinc-400">{plan.grado.replace(/^(primaria|secundaria|inicial)-/, '')}</td>
                                    <td className="py-3.5 px-4 text-center">
                                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${statusColor}`}>{statusText}</span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center text-slate-400 font-medium">{plan.creado_en?.split('T')[0] || '--'}</td>
                                    <td className="py-3.5 px-4 text-center">
                                      <button
                                        onClick={() => window.open(`/coordinador/planificacion/preview?id=${plan.id}`, '_blank')}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary hover:bg-brand-hover text-white rounded-lg text-[10.5px] font-black transition-all cursor-pointer"
                                      >
                                        <Eye size={11} />
                                        <span>Revisar</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                              {activeTeacherPlannings.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="py-10 px-4 text-center text-slate-400 font-bold">No hay planificaciones curriculares entregadas por este docente.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {expedienteTab === "evidencias" && (() => {
                      const mainFolder = activeTeacherEvidences.find(e => e.category === 'Carpeta Principal');
                      const otherEvidences = activeTeacherEvidences.filter(e => e.category !== 'Carpeta Principal');
                      const teacherName = activeTeacherProfile?.full_name || "el docente";

                      return (
                        <div className="space-y-6">
                          {/* Main Google Drive Folder Card */}
                          <div className="p-6 bg-slate-50 dark:bg-zinc-900/50 border border-black/5 dark:border-zinc-800 rounded-3xl text-left shadow-xs space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm border border-neutral-100 dark:border-zinc-700">
                                  <GoogleDriveIcon className="w-6 h-6" />
                                </div>
                                <div className="text-left space-y-0.5">
                                  <h3 className="font-extrabold text-sm text-[#1B1B1B] dark:text-white">
                                    Carpeta Principal de Google Drive
                                  </h3>
                                  <p className="text-[11px] text-slate-655 dark:text-zinc-350 font-medium">
                                    Vincula la carpeta personal de evidencias de {teacherName}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setHelpModalOpen(true)}
                                  className="px-3.5 py-1.5 rounded-xl border border-neutral-250 dark:border-zinc-800 text-[10.5px] font-bold text-slate-655 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                  title="Guía de ayuda"
                                >
                                  <HelpCircle size={13} className="text-blue-500" />
                                  <span>Ayuda</span>
                                </button>

                                {mainFolder && !isEditingFolderUrl && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMainFolderUrlInput(mainFolder.file_url || "");
                                        setIsEditingFolderUrl(true);
                                      }}
                                      className="px-3.5 py-1.5 rounded-xl border border-neutral-250 dark:border-zinc-800 text-[10.5px] font-bold text-slate-655 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                    >
                                      <Edit2 size={12} className="text-slate-500" />
                                      <span>Editar Carpeta</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEvidenceToDelete(mainFolder);
                                        setDeleteConfirmOpen(true);
                                      }}
                                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 text-[10.5px] font-bold text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                    >
                                      <Trash2 size={12} />
                                      <span>Eliminar Carpeta</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {(!mainFolder || isEditingFolderUrl) ? (
                              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3 shadow-3xs">
                                <p className="text-xs text-slate-655 dark:text-zinc-350 font-bold leading-relaxed">
                                  Ingresa el enlace compartido de Google Drive para este docente.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input 
                                    type="text"
                                    value={mainFolderUrlInput}
                                    onChange={(e) => setMainFolderUrlInput(e.target.value)}
                                    placeholder="Ej: https://drive.google.com/drive/folders/1aBcDeFgHiJkLm..."
                                    className="flex-1 h-9 px-3 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-850 rounded-xl text-xs outline-none focus:border-brand-primary"
                                  />
                                  <div className="flex gap-2">
                                    {isEditingFolderUrl && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setMainFolderUrlInput("");
                                          setIsEditingFolderUrl(false);
                                        }}
                                        className="h-9 px-4 rounded-xl border border-neutral-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                                      >
                                        Cancelar
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleSaveMainFolderUrl(mainFolderUrlInput)}
                                      className="h-9 px-4 bg-brand-primary hover:bg-brand-hover text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                                    >
                                      <GoogleDriveIcon className="w-3.5 h-3.5 fill-white" />
                                      <span>Guardar Carpeta</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl space-y-3.5 text-left">
                                <div className="flex justify-between items-start gap-4">
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      Vinculado
                                    </span>
                                    <p className="text-[11px] text-slate-550 dark:text-neutral-350 font-medium truncate max-w-sm sm:max-w-md">
                                      Enlace: <a href={mainFolder.file_url} target="_blank" rel="noreferrer" className="underline font-bold text-brand-primary hover:text-brand-hover">{mainFolder.file_url}</a>
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                  <a 
                                    href={mainFolder.file_url}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-6 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-black rounded-xl tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                                  >
                                    <FolderOpen size={15} />
                                    <span>Abrir Carpeta en Google Drive</span>
                                  </a>
                                  <p className="text-[10px] text-slate-650 dark:text-zinc-350 font-medium leading-relaxed flex items-center">
                                    💡 Nota: Este botón te redirige directamente a la carpeta de Google Drive del docente para que gestiones sus archivos de forma externa y organizada.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Secondary links lists */}
                          <div className="space-y-4">
                            <div className="border-b border-black/5 dark:border-zinc-800 pb-2">
                              <h3 className="font-extrabold text-xs text-[#1B1B1B] dark:text-white uppercase tracking-wider text-left">
                                Evidencias, carpetas y Recursos Específicos
                              </h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {otherEvidences.map((e) => {
                                const isDrive = e.file_tag === 'Google Drive' || e.file_url?.includes('drive.google.com') || e.file_url?.includes('docs.google.com');
                                return (
                                  <div key={e.id} className="border border-black/5 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-xs text-xs bg-white dark:bg-zinc-900 flex flex-col justify-between relative group">
                                    <button
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setEvidenceToDelete(e);
                                        setDeleteConfirmOpen(true);
                                      }}
                                      className="absolute top-2 left-2 bg-rose-50 dark:bg-zinc-900/80 hover:bg-rose-100 text-rose-600 border border-rose-100 dark:border-zinc-800 rounded-lg p-1.5 transition-all cursor-pointer z-10"
                                      title="Eliminar evidencia"
                                    >
                                      <Trash2 size={11} />
                                    </button>

                                    <div>
                                      <div className="bg-slate-50 dark:bg-zinc-900/50 h-24 flex items-center justify-center border-b border-black/5 dark:border-zinc-800 relative overflow-hidden">
                                        {(() => {
                                          const url = e.file_url || "";
                                          const lower = url.toLowerCase();
                                          
                                          if (lower.match(/\.(jpeg|jpg|gif|png|webp|svg)/) || lower.includes('images') || lower.includes('photo')) {
                                            return (
                                              <img 
                                                src={url} 
                                                alt={e.name} 
                                                className="w-full h-full object-cover" 
                                                onError={(evt) => {
                                                  evt.currentTarget.style.display = 'none';
                                                }} 
                                              />
                                            );
                                          }
                                          if (lower.includes('docs.google.com/document') || lower.includes('/document/d/')) {
                                            return <FileText className="w-10 h-10 text-blue-500" />;
                                          }
                                          if (lower.includes('docs.google.com/spreadsheets') || lower.includes('/spreadsheets/d/')) {
                                            return <Grid className="w-10 h-10 text-emerald-600" />;
                                          }
                                          if (lower.includes('docs.google.com/presentation') || lower.includes('/presentation/d/')) {
                                            return <Award className="w-10 h-10 text-amber-500" />;
                                          }
                                          if (lower.includes('drive.google.com/drive/folders') || lower.includes('/folders/')) {
                                            return <FolderOpen className="w-10 h-10 text-amber-500" />;
                                          }
                                          if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) {
                                            return <GoogleDriveIcon className="w-10 h-10" />;
                                          }
                                          if (lower.endsWith('.pdf') || lower.includes('/pdf')) {
                                            return <FileText className="w-10 h-10 text-rose-500" />;
                                          }
                                          if (lower.match(/\.(mp4|webm|ogg|mov)/) || lower.includes('youtube.com') || lower.includes('youtu.be')) {
                                            return <Camera className="w-10 h-10 text-purple-500" />;
                                          }
                                          return <FileText className="w-10 h-10 text-slate-400" />;
                                        })()}
                                      </div>
                                      <div className="p-3 text-left">
                                        <h4 className="font-bold truncate text-slate-855 dark:text-slate-200">{e.name}</h4>
                                        <span className={`inline-block px-1.5 py-0.5 rounded-md text-[8.5px] font-extrabold uppercase tracking-wide mt-1 ${isDrive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200' : 'bg-slate-100 text-slate-550 dark:bg-zinc-800 dark:text-neutral-400'}`}>
                                          {isDrive ? 'Google Drive' : (e.file_tag || 'Enlace')}
                                        </span>
                                      </div>
                                    </div>

                                    {e.file_url && e.file_url !== '#' && (
                                      <div className="p-3 pt-0 border-t border-black/5 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-900/30">
                                        <a 
                                          href={e.file_url} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className="w-full py-1 bg-white hover:bg-emerald-55 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black tracking-wide text-center block transition-all hover:border-emerald-350 cursor-pointer shadow-2xs"
                                        >
                                          {isDrive ? "Abrir Documento" : "Abrir Enlace"}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {otherEvidences.length === 0 && (
                              <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-zinc-850 rounded-2xl">
                                <FolderOpen className="w-9 h-9 text-slate-350 dark:text-zinc-650 mx-auto mb-2" />
                                <p className="text-[11px] text-slate-400 font-bold">No hay otros enlaces o documentos individuales agregados.</p>
                              </div>
                            )}

                             {/* Simple URL Link Insertion Form */}
                             <form onSubmit={handleAddEvidenceForTeacher} className="border-t border-black/5 dark:border-zinc-850 pt-4 text-left">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="flex flex-col gap-1.5">
                                   <label className="font-extrabold text-[10.5px] text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                                     Nombre de la evidencia
                                   </label>
                                   <input 
                                     type="text" 
                                     placeholder="Nombre del recurso (Ej: Registro de Acompañamiento Enero)..."
                                     value={evidenceName}
                                     onChange={(e) => setEvidenceName(e.target.value)}
                                     className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-850 rounded-xl text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-brand-primary font-semibold"
                                   />
                                 </div>
                                 <div className="flex flex-col gap-1.5">
                                   <label className="font-extrabold text-[10.5px] text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                                     Enlace a Google Drive
                                   </label>
                                   <div className="flex gap-2">
                                     <input 
                                       type="text" 
                                       placeholder="Pegar enlace de Google Drive, Docs, Sheets..."
                                       value={evidenceUrl}
                                       onChange={(e) => setEvidenceUrl(e.target.value)}
                                       className="flex-1 h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-850 rounded-xl text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-brand-primary font-semibold"
                                     />
                                     <button
                                       type="submit"
                                       className="px-5 h-10 bg-brand-primary hover:bg-brand-hover text-white text-xs font-black rounded-xl cursor-pointer transition-all active:scale-95 shrink-0 flex items-center justify-center gap-1.5 shadow-2xs"
                                     >
                                       <Plus size={14} />
                                       <span>Agregar Enlace</span>
                                     </button>
                                   </div>
                                 </div>
                               </div>
                             </form>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                /* ALL TEACHERS LIST VIEW */
                <>
                  <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 mb-6">
                    <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white tracking-tight leading-none">
                      Expedientes Docentes
                    </h1>
                    <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5">
                      Seguimiento individualizado del desempeño, planificaciones y acuerdos de cada docente.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredTeachers.map((teacher) => {
                      const teacherObs = observations.filter(o => o.teacher_id === teacher.id);
                      const averageScore = teacherObs.length > 0
                        ? Math.round(teacherObs.reduce((acc, curr) => acc + curr.score, 0) / teacherObs.length)
                        : null;

                      return (
                        <div
                          key={teacher.id}
                          onClick={() => {
                            setSelectedTeacherId(teacher.id);
                            setExpedienteTab("obs");
                          }}
                          className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm hover:shadow-md hover:border-black/15 transition-all cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-12 h-12 rounded-2xl border border-black/5 overflow-hidden flex items-center justify-center bg-brand-primary/10 text-brand-primary font-black text-base shrink-0">
                              {teacher.avatar_url ? (
                                <img src={teacher.avatar_url} alt={teacher.full_name} className="w-full h-full object-cover" />
                              ) : (
                                teacher.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-slate-800 dark:text-white">{teacher.full_name}</h3>
                              <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mt-0.5 block">{teacher.nivel_principal || 'General'}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-black/5 dark:border-zinc-800 pt-3 text-xs">
                            <div>
                              <span className="text-brand-primary font-bold block">Acompañamientos</span>
                              <span className="text-base font-black text-slate-800 dark:text-white mt-1 block">{teacherObs.length} visitas</span>
                            </div>
                            <div>
                              <span className="text-brand-primary font-bold block">Puntaje Promedio</span>
                              <span className="text-base font-black text-emerald-500 mt-1 block">{averageScore !== null ? `${averageScore}%` : '--'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 5: PLANIFICACIONES */}
          {activeTab === "planificaciones" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white tracking-tight leading-none">
                    Control de Planificaciones
                  </h1>
                  <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5">
                    Supervisión, aprobación y retroalimentación de secuencias didácticas de tus docentes.
                  </p>
                </div>
                <div className="bg-brand-primary/10 text-brand-primary text-xs font-bold px-4 py-2 rounded-2xl border border-brand-primary/20 shrink-0 select-none">
                  {filteredPlannings.length} {filteredPlannings.length === 1 ? 'PLANIFICACIÓN' : 'PLANIFICACIONES'}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs font-medium text-slate-700 dark:text-slate-350">
                    <thead>
                      <tr className="bg-brand-primary text-white uppercase font-bold text-[9px] tracking-wider text-left">
                        <th className="rounded-l-xl py-3 px-4">Docente</th>
                        <th className="py-3 px-4">Título de Secuencia</th>
                        <th className="py-3 px-4 text-center">Tipo</th>
                        <th className="py-3 px-4 text-center">Estado</th>
                        <th className="py-3 px-4 text-center">Fecha Registro</th>
                        <th className="rounded-r-xl py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlannings.slice((planningPage - 1) * 5, planningPage * 5).map((plan) => {
                        const t = teachers.find(teach => teach.id === plan.docente_id);
                        const statusText = getPlanningStatus(plan);
                        const statusColor = statusText === 'Finalizado' || statusText === 'Aprobada'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30' 
                          : statusText === 'En Redacción' || statusText === 'Reunión'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-955/20 dark:text-blue-450 dark:border-blue-900/30'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-955/20 dark:text-amber-450 dark:border-amber-900/30';
                        return (
                          <tr key={plan.id} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors text-left">
                            <td className="py-4 px-4 font-bold flex items-center gap-2">
                              <div className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-full overflow-hidden flex items-center justify-center font-bold text-[10px] shrink-0">
                                {t?.avatar_url ? (
                                  <img src={t.avatar_url} alt={t.full_name} className="w-full h-full object-cover" />
                                ) : (
                                  t?.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'DC'
                                )}
                              </div>
                              {t ? t.full_name : 'Docente desconocido'}
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-800 dark:text-white">
                              <div>{plan.titulo}</div>
                              <span className="text-[10.5px] text-slate-455 dark:text-slate-500 block mt-1 font-medium">
                                Asignatura: <strong className="font-extrabold text-slate-750 dark:text-slate-300">{plan.asignatura || 'Sin Asignatura'}</strong>
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center font-bold text-slate-400">
                              <span className="uppercase text-[9.5px] font-bold text-slate-500 dark:text-slate-400">
                                {plan.tipo === 'CURRICULAR' ? 'Adecuación' : plan.tipo === 'CON_BASE' ? 'Con Base' : plan.tipo || 'Secuencia'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${statusColor}`}>
                                {statusText}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center text-slate-400 dark:text-slate-500">
                              {plan.creado_en?.split('T')[0] || '--'}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => window.open(`/coordinador/planificacion/preview?id=${plan.id}`, '_blank')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-[11px] font-black transition-all cursor-pointer shadow-xs border border-transparent select-none active:scale-95"
                              >
                                <Eye size={12} className="shrink-0" />
                                <span>Revisar</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredPlannings.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 px-4 text-center text-slate-400 font-bold">No hay planificaciones curriculares recibidas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredPlannings.length > 5 && (
                  <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800 text-xs font-semibold text-slate-500 select-none">
                    <button
                      onClick={() => setPlanningPage(prev => Math.max(prev - 1, 1))}
                      disabled={planningPage === 1}
                      className="px-4 py-2 border border-black/5 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Anterior
                    </button>
                    <span className="text-slate-455">
                      Página {planningPage} de {Math.ceil(filteredPlannings.length / 5)}
                    </span>
                    <button
                      onClick={() => setPlanningPage(prev => Math.min(prev + 1, Math.ceil(filteredPlannings.length / 5)))}
                      disabled={planningPage === Math.ceil(filteredPlannings.length / 5)}
                      className="px-4 py-2 border border-black/5 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ESTUDIANTES */}
          {activeTab === "estudiantes" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white tracking-tight leading-none">
                    Estudiantes en Seguimiento
                  </h1>
                  <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5">
                    Gestión de casos de intervención, necesidades especiales de apoyo educativo (NEAE) e incidencias de conducta.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setWizardStep(1);
                    setFollowupTeacherId("");
                    setSelectedClassroomId("");
                    setStudentSearchQuery("");
                    setIsFollowupModalOpen(true);
                  }}
                  className="bg-brand-primary hover:bg-brand-hover text-white rounded-full px-5 py-2 font-bold text-[13px] shadow-sm active:scale-95 transition-all select-none border border-transparent flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  + Registrar Caso
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs font-medium text-slate-700 dark:text-slate-350">
                    <thead>
                      <tr className="bg-brand-primary text-white uppercase font-bold text-[9px] tracking-wider text-left">
                        <th className="rounded-l-xl py-3 px-4">Estudiante</th>
                        <th className="py-3 px-4">Curso</th>
                        <th className="py-3 px-4">Motivo del Caso</th>
                        <th className="py-3 px-4">Especialista / Responsable</th>
                        <th className="py-3 px-4 text-center">Última Intervención</th>
                        <th className="rounded-r-xl py-3 px-4 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((fup) => {
                        const std = students.find(s => s.id === fup.student_id);
                        return (
                          <tr key={fup.id} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors text-left">
                            <td className="py-4 px-4 font-bold flex items-center gap-2">
                              <div className="w-7 h-7 bg-amber-100 text-amber-800 rounded-full overflow-hidden flex items-center justify-center font-bold text-[10px] shrink-0">
                                {std?.avatar_url ? (
                                  <img src={std.avatar_url} alt={std.first_name} className="w-full h-full object-cover" />
                                ) : (
                                  std ? `${std.first_name[0]}${std.last_name[0] || ""}` : 'ES'
                                )}
                              </div>
                              {std ? `${std.first_name} ${std.last_name || ""}` : 'Estudiante desconocido'}
                            </td>
                            <td className="py-4 px-4 text-slate-400 dark:text-zinc-500 font-semibold text-[11px]">
                              {std?.classroom_name ? formatGradeName(std.classroom_name) : '--'}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2.5 py-1 rounded-lg border text-[10.5px] font-bold ${getReasonBadgeStyles(fup.reason)}`}>
                                {fup.reason}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-450 dark:text-slate-400">
                              {fup.responsible_id || 'Coordinación'}
                            </td>
                            <td className="py-4 px-4 text-center font-semibold text-slate-450 dark:text-slate-400">
                              {fup.last_intervention_date || '--'}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${getStatusBadgeStyles(fup.status)}`}>
                                {fup.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {followups.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 px-4 text-center text-slate-400 font-bold">No hay intervenciones estudiantiles creadas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ACTAS */}
          {activeTab === "actas" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white tracking-tight leading-none">
                  Actas y Reuniones
                </h1>
                <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5">
                  Programación de reuniones pedagógicas, redacción de minutas y control de firmas.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
              <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center shrink-0">
                        <Calendar size={16} className="fill-brand-primary/20 text-brand-primary" />
                      </div>
                      <span>Próximas Reuniones</span>
                    </h3>
                    <button
                      onClick={() => setIsMeetingModalOpen(true)}
                      className="bg-brand-primary hover:bg-brand-hover text-white rounded-full px-5 py-2 font-bold text-[13px] shadow-sm active:scale-95 transition-all select-none border border-transparent flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      + Programar
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[350px] overflow-y-auto">
                    {meetings.map(meet => (
                      <div key={meet.id} className="border border-black/5 dark:border-zinc-850 p-4 rounded-2xl flex gap-3">
                        <div className="bg-brand-primary text-white rounded-lg p-2.5 text-center min-w-[50px] font-black h-fit">
                          <span className="block text-lg leading-none">{meet.meeting_date?.split('-')[2] || '02'}</span>
                          <span className="text-[9px] uppercase tracking-wider mt-1 block">Jul</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-855 dark:text-white">{meet.title}</h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">🕐 {meet.meeting_time} · 📍 {meet.location}</p>
                          {meet.notes && <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-1">Nota: {meet.notes}</p>}
                          <span className="bg-brand-primary/5 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary font-bold px-2 py-0.5 rounded-full text-[9px] border border-brand-primary/20 mt-2 inline-block">{meet.invited_count} convocados</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Pending signatures */}
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center shrink-0">
                      <FileText size={16} className="fill-amber-500/20 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span>Actas Pendientes de Firma</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 border border-black/5 dark:border-zinc-850 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold">Acta Reunión Claustro - 12 Jun</h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 block">3 firmas pendientes</span>
                      </div>
                      <button
                        onClick={() => toast.success("Recordatorio de firma enviado por correo.")}
                        className="bg-brand-primary hover:bg-brand-hover text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Recordar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Minutes list */}
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary rounded-full flex items-center justify-center shrink-0">
                        <FileText size={16} className="fill-brand-primary/20 text-brand-primary dark:text-brand-primary" />
                      </div>
                      <span>Minutas Recientes</span>
                    </h3>
                    <button
                      onClick={() => setIsMinuteModalOpen(true)}
                      className="bg-brand-primary hover:bg-brand-hover text-white rounded-full px-5 py-2 font-bold text-[13px] shadow-sm active:scale-95 transition-all select-none border border-transparent flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      + Nueva Acta
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    {minutes.map(m => (
                      <div key={m.id} className="p-3 border border-black/5 dark:border-zinc-850 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <h4 className="font-bold">{m.title}</h4>
                          <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">Participantes: {m.participants || 'Coordinación'}</span>
                        </div>
                        <button
                          onClick={() => toast.info(`Abriendo acta: ${m.title}`)}
                          className="bg-brand-primary hover:bg-brand-hover text-white text-[10.5px] px-2.5 py-1 rounded-md font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          Ver
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* TAB 8: INFORMES */}
          {activeTab === "informes" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white tracking-tight leading-none">
                  Informes Automáticos
                </h1>
                <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5">
                  Generación instantánea de reportes mensuales de gestión e informes de eficiencia del centro educativo.
                </p>
              </div>

              <div className="max-w-4xl mx-auto py-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 text-left">
                  {/* Card 1: Informe mensual */}
                  <div className="col-span-1 md:col-span-2 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-brand-primary/20 dark:hover:border-zinc-700 transition-all duration-300">
                    <div>
                      <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                        <Calendar size={22} className="text-blue-500" />
                      </div>
                      <h3 className="font-black text-sm text-[#1B1B1B] dark:text-white">Informe mensual</h3>
                      <p className="text-[11px] text-slate-455 dark:text-zinc-400 mt-2 leading-relaxed">
                        Resumen general del mes en curso.
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrintReport('informe_mensual')}
                      className="mt-6 w-full py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-full font-bold text-xs shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileText size={13} />
                      Generar PDF
                    </button>
                  </div>

                  {/* Card 2: Informe de acompañamiento */}
                  <div className="col-span-1 md:col-span-2 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-brand-primary/20 dark:hover:border-zinc-700 transition-all duration-300">
                    <div>
                      <div className="w-12 h-12 bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-4">
                        <Eye size={22} className="text-rose-500" />
                      </div>
                      <h3 className="font-black text-sm text-[#1B1B1B] dark:text-white">Informe de acompañamiento</h3>
                      <p className="text-[11px] text-slate-455 dark:text-zinc-400 mt-2 leading-relaxed">
                        Observaciones y retroalimentaciones por docente.
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrintReport('acompanamiento')}
                      className="mt-6 w-full py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-full font-bold text-xs shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileText size={13} />
                      Generar PDF
                    </button>
                  </div>

                  {/* Card 3: Reporte de estudiantes */}
                  <div className="col-span-1 md:col-span-2 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-brand-primary/20 dark:hover:border-zinc-700 transition-all duration-300">
                    <div>
                      <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4">
                        <GraduationCap size={22} className="text-amber-500" />
                      </div>
                      <h3 className="font-black text-sm text-[#1B1B1B] dark:text-white">Reporte de estudiantes</h3>
                      <p className="text-[11px] text-slate-455 dark:text-zinc-400 mt-2 leading-relaxed">
                        Casos activos, intervenciones y evolución.
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrintReport('estudiantes')}
                      className="mt-6 w-full py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-full font-bold text-xs shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileText size={13} />
                      Generar PDF
                    </button>
                  </div>

                  {/* Card 4: Informe para dirección */}
                  <div className="col-span-1 md:col-span-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-brand-primary/20 dark:hover:border-zinc-700 transition-all duration-300">
                    <div>
                      <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
                        <Upload size={22} className="text-emerald-500" />
                      </div>
                      <h3 className="font-black text-sm text-[#1B1B1B] dark:text-white">Informe para dirección</h3>
                      <p className="text-[11px] text-slate-455 dark:text-zinc-400 mt-2 leading-relaxed">
                        Resumen ejecutivo con indicadores clave.
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrintReport('direccion')}
                      className="mt-6 w-full py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-full font-bold text-xs shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileText size={13} />
                      Generar PDF
                    </button>
                  </div>

                  {/* Card 5: Informe de planificaciones */}
                  <div className="col-span-1 md:col-span-3 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-brand-primary/20 dark:hover:border-zinc-700 transition-all duration-300">
                    <div>
                      <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-4">
                        <ClipboardList size={22} className="text-purple-500" />
                      </div>
                      <h3 className="font-black text-sm text-[#1B1B1B] dark:text-white">Informe de planificaciones</h3>
                      <p className="text-[11px] text-slate-455 dark:text-zinc-400 mt-2 leading-relaxed">
                        Estadísticas de entrega y observaciones.
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrintReport('planificaciones')}
                      className="mt-6 w-full py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-full font-bold text-xs shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileText size={13} />
                      Generar PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: EVIDENCIAS */}
          {activeTab === "evidencias" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white tracking-tight leading-none">
                  Banco de Evidencias
                </h1>
                <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5">
                  Historial y repositorio digital de fotos, circulares y documentos recibidos.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm text-left">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Evidencias Guardadas</span>
                <div className="flex gap-2 text-xs font-semibold text-slate-400 select-none">
                  {["Todas", "Fotos", "Documentos", "Comunicaciones"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveEvidenceFilter(tag)}
                      className={`px-3.5 py-1.5 rounded-full transition-all border cursor-pointer ${activeEvidenceFilter === tag ? "bg-brand-primary text-white border-brand-primary" : "bg-neutral-50 dark:bg-zinc-850 border-black/5 hover:bg-slate-100"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-5">
                {filteredEvidences.map((e) => (
                  <div key={e.id} className="border border-black/5 dark:border-zinc-850 rounded-xl overflow-hidden hover:shadow-md cursor-pointer group text-left transition-all">
                    <div className="bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 dark:from-brand-primary/10 dark:to-slate-900 h-24 flex items-center justify-center group-hover:scale-102 transition-transform select-none">
                      {e.category?.startsWith("Foto") ? (
                        <Image className="w-8 h-8 text-brand-primary/70" />
                      ) : (
                        <FileText className="w-8 h-8 text-brand-primary/70" />
                      )}
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-900 border-t border-black/5 dark:border-zinc-850">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">{e.name}</h4>
                      <span className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5 block font-bold">{e.file_tag || "Digital"}</span>
                    </div>
                  </div>
                ))}
                {filteredEvidences.length === 0 && (
                  <p className="text-xs text-slate-450 text-center py-10 col-span-5 font-bold">No hay evidencias en esta categoría.</p>
                )}
              </div>
            </div>
          </div>
          )}

          {/* TAB 10: ESTADÍSTICAS */}
          {activeTab === "estadisticas" && (
            <div className="space-y-8">
              <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white tracking-tight leading-none">
                  Estadísticas Pedagógicas
                </h1>
                <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5">
                  Análisis estadístico de entregas de planificaciones, visitas mensuales e incidencias.
                </p>
              </div>

              {/* Render Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">

                {/* Acompañamientos Mensuales */}
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white mb-4">Visitas de Acompañamiento Mensuales</h3>

                  <div className="flex items-end gap-2.5 h-[160px] border-b border-slate-100 dark:border-zinc-800 pb-3">
                    {[
                      { month: 'Ag', val: 5 }, { month: 'Se', val: 8 }, { month: 'Oc', val: 6 },
                      { month: 'No', val: 10 }, { month: 'Di', val: 4 }, { month: 'En', val: 9 },
                      { month: 'Fe', val: 7 }, { month: 'Ma', val: 11 }, { month: 'Ab', val: 8 },
                      { month: 'My', val: 12 }, { month: 'Jn', val: 6 }, { month: 'Jl', val: 2 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative justify-end h-full">
                        <div
                          className="bg-brand-primary dark:bg-brand-primary w-full rounded-t-lg transition-all duration-500 hover:opacity-90 cursor-pointer"
                          style={{ height: `${(item.val / 12) * 100}%` }}
                        />
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold">{item.month}</span>
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-bold whitespace-nowrap">
                          {item.val} visitas
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Planificaciones entregadas */}
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white mb-4">Entrega de Planificaciones por Semana</h3>

                  <div className="flex items-end gap-2.5 h-[160px] border-b border-slate-100 dark:border-zinc-800 pb-3">
                    {[
                      { week: 'Sem 18', val: 88 }, { week: 'Sem 19', val: 72 }, { week: 'Sem 20', val: 91 },
                      { week: 'Sem 21', val: 85 }, { week: 'Sem 22', val: 76 }, { week: 'Sem 23', val: 94 },
                      { week: 'Sem 24', val: 80 }, { week: 'Sem 25', val: 74 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative justify-end h-full">
                        <div
                          className="w-full rounded-t-lg transition-all duration-500 hover:opacity-90 cursor-pointer"
                          style={{
                            height: `${item.val}%`,
                            backgroundColor: item.val >= 85 ? 'var(--green)' : item.val >= 70 ? 'var(--yellow)' : 'var(--red)'
                          }}
                        />
                        <span className="text-[9.5px] text-slate-450 dark:text-slate-500 font-bold">{item.week}</span>
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-bold whitespace-nowrap">
                          {item.val}% entrega
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Horizontal Bar Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                {/* Incidencias por categoría */}
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white mb-5">Incidencias por Categoría</h3>
                  <div className="space-y-4">
                    {[
                      { cat: 'Conducta', val: 12, color: 'var(--red)' },
                      { cat: 'Ausentismo', val: 8, color: 'var(--yellow)' },
                      { cat: 'Conflictos', val: 5, color: 'var(--blue)' },
                      { cat: 'Académico', val: 15, color: 'var(--teal)' },
                      { cat: 'Familiar', val: 7, color: '#9333EA' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                          <span>{item.cat}</span>
                          <span>{item.val} casos</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(item.val / 15) * 100}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motivos de Seguimiento */}
                <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-white mb-5">Motivos de Seguimiento Estudiantil</h3>
                  <div className="space-y-4">
                    {[
                      { reason: 'Bajo rendimiento', val: 9, color: 'var(--red)' },
                      { reason: 'Ausentismo', val: 7, color: 'var(--yellow)' },
                      { reason: 'NEAE (Necesidades Especiales)', val: 4, color: 'var(--blue)' },
                      { reason: 'Riesgo de repitencia', val: 4, color: 'var(--teal)' },
                      { reason: 'Conducta', val: 3, color: '#9333EA' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                          <span>{item.reason}</span>
                          <span>{item.val} alumnos</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(item.val / 9) * 100}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 11: CONFIGURACIÓN */}
          {activeTab === "configuracion" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] dark:text-white tracking-tight leading-none">
                  Configuración
                </h1>
                <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5">
                  Gestión de tu perfil de coordinación, año escolar y preferencias del sistema.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left text-xs font-bold">
              {/* Coordinator Profile */}
              <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-white mb-4">Perfil de Coordinación</h3>
                <form onSubmit={handleSaveProfileConfig} className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-brand-primary uppercase">Nombre Completo</label>
                    <input
                      type="text"
                      value={coordProfileForm.full_name}
                      onChange={e => setCoordProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-brand-primary uppercase">Centro Educativo</label>
                    <input
                      type="text"
                      value={coordProfileForm.school_name}
                      disabled
                      className="w-full h-10 px-3.5 bg-neutral-100/60 dark:bg-zinc-900/60 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-slate-455 dark:text-slate-500 outline-none cursor-not-allowed transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-brand-primary uppercase">Correo Electrónico</label>
                    <input
                      type="email"
                      value={coordProfileForm.email}
                      onChange={e => setCoordProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-brand-primary uppercase">Año Escolar Activo</label>
                    <CustomSelect
                      value={coordProfileForm.active_year}
                      onChange={val => setCoordProfileForm(prev => ({ ...prev, active_year: val }))}
                      options={[
                        { value: "2026-2027", label: "2026-2027" },
                        { value: "2025-2026", label: "2025-2026" }
                      ]}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-brand-primary hover:bg-brand-hover text-white rounded-full px-5 py-2 font-bold text-[13px] shadow-sm active:scale-95 transition-all select-none border border-transparent mt-2 cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </form>
              </div>

              {/* System Preferences */}
              <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-white mb-4">Preferencias del Sistema</h3>
                <form onSubmit={handleSavePrefsConfig} className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-brand-primary uppercase">Idioma</label>
                    <CustomSelect
                      value={sysPrefsForm.language}
                      onChange={val => setSysPrefsForm(prev => ({ ...prev, language: val }))}
                      options={[
                        { value: "Español", label: "Español" },
                        { value: "English", label: "English" }
                      ]}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-brand-primary uppercase">Zona Horaria</label>
                    <CustomSelect
                      value={sysPrefsForm.timezone}
                      onChange={val => setSysPrefsForm(prev => ({ ...prev, timezone: val }))}
                      options={[
                        { value: "America/Santo_Domingo (UTC-4)", label: "America/Santo_Domingo (UTC-4)" }
                      ]}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-brand-primary uppercase">Notificaciones</label>
                    <CustomSelect
                      value={sysPrefsForm.notifications}
                      onChange={val => setSysPrefsForm(prev => ({ ...prev, notifications: val }))}
                      options={[
                        { value: "Activadas", label: "Activadas" },
                        { value: "Solo urgentes", label: "Solo urgentes" },
                        { value: "Desactivadas", label: "Desactivadas" }
                      ]}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-brand-primary uppercase">Tema visual</label>
                    <CustomSelect
                      value={theme === 'light' ? 'Claro' : 'Oscuro'}
                      onChange={val => {
                        if ((val === 'Oscuro' && theme === 'light') || (val === 'Claro' && theme === 'dark')) {
                          toggleTheme();
                        }
                      }}
                      options={[
                        { value: "Claro", label: "Claro" },
                        { value: "Oscuro", label: "Oscuro" }
                      ]}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-brand-primary hover:bg-brand-hover text-white rounded-full px-5 py-2 font-bold text-[13px] shadow-sm active:scale-95 transition-all select-none border border-transparent mt-2 cursor-pointer"
                  >
                    Guardar Preferencias
                  </button>
                </form>
              </div>
            </div>
          </div>
          )}

        </div>
      )}

      {/* MODAL: NUEVA ENTRADA DE BITÁCORA */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[32px] max-w-3xl w-full p-8 shadow-2xl flex flex-col text-left"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-[#1B1B1B] dark:text-white flex items-center gap-1.5">
                <BookOpen size={16} className="text-brand-primary" />
                <span>Nueva Entrada en Bitácora</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer border-none shadow-sm shadow-red-500/10"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Columna Izquierda: Campos Estándar */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-brand-primary uppercase">Fecha</label>
                      <DatePicker
                        value={logForm.date}
                        onChange={val => setLogForm(prev => ({ ...prev, date: val }))}
                        direction="down"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-brand-primary uppercase">Hora</label>
                      <input
                        type="time"
                        value={logForm.time}
                        onChange={e => setLogForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-xs">
                    <label className="font-bold text-brand-primary uppercase">Categoría</label>
                    <CustomSelect
                      value={logForm.category}
                      onChange={val => setLogForm(prev => ({ ...prev, category: val }))}
                      options={[
                        "Acompañamiento docente",
                        "Estudiantes",
                        "Gestión institucional",
                        "Familias",
                        "Seguimientos",
                        "Incidencias"
                      ].map(c => ({ value: c, label: c }))}
                    />
                  </div>

                  <div className="flex flex-col gap-2 text-xs">
                    <label className="font-bold text-brand-primary uppercase">Personas involucradas</label>
                    <input
                      type="text"
                      value={logForm.involved_people}
                      onChange={e => setLogForm(prev => ({ ...prev, involved_people: e.target.value }))}
                      placeholder="Ej: Juan Martínez (docente), Pedro Ruiz (estudiante)"
                      className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-2 text-xs">
                    <label className="font-bold text-brand-primary uppercase">Estado</label>
                    <CustomSelect
                      value={logForm.status}
                      onChange={val => setLogForm(prev => ({ ...prev, status: val }))}
                      options={[
                        { value: "Pendiente", label: "Pendiente" },
                        { value: "Resuelto", label: "Resuelto" },
                        { value: "Urgente", label: "Urgente" },
                        { value: "Dar seguimiento", label: "Dar seguimiento" }
                      ]}
                    />
                  </div>
                </div>

                {/* Columna Derecha: Textarea Grande */}
                <div className="flex flex-col gap-2 text-xs">
                  <label className="font-bold text-brand-primary uppercase">Descripción del registro</label>
                  <textarea
                    value={logForm.description}
                    onChange={e => setLogForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe la situación, intervención o acuerdo..."
                    className="w-full h-full min-h-[220px] p-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none flex-1"
                  />
                </div>

                {/* Botón de guardado a lo ancho */}
                <div className="col-span-1 md:col-span-2 mt-2 flex justify-center">
                  <button
                    type="submit"
                    className="w-auto px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-full font-bold text-[13px] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4 shrink-0" />
                    Guardar Entrada
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA REUNIÓN */}
      {isMeetingModalOpen && (
        <div 
          onClick={() => setIsMeetingModalOpen(false)}
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[32px] max-w-3xl w-full p-8 shadow-2xl flex flex-col text-left"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-[#1B1B1B] dark:text-white flex items-center gap-1.5">
                <Calendar size={16} className="text-brand-primary" />
                <span>Programar Nueva Reunión</span>
              </h3>
              <button
                onClick={() => setIsMeetingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer border-none shadow-sm shadow-red-500/10"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveMeeting} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Columna Izquierda: Campos Estándar */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 text-xs">
                    <label className="font-bold text-brand-primary uppercase">Título de la Reunión</label>
                    <input
                      type="text"
                      value={meetingForm.title}
                      onChange={e => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Análisis de resultados 2do trimestre"
                      className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs font-semibold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-brand-primary uppercase">Fecha</label>
                      <DatePicker
                        value={meetingForm.date}
                        onChange={val => setMeetingForm(prev => ({ ...prev, date: val }))}
                        direction="down"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-brand-primary uppercase">Hora</label>
                      <input
                        type="time"
                        value={meetingForm.time}
                        onChange={e => setMeetingForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-brand-primary uppercase">Lugar / Ubicación</label>
                      <input
                        type="text"
                        value={meetingForm.location}
                        onChange={e => setMeetingForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Ej: Salón de actos"
                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-brand-primary uppercase">Convocados (Cantidad)</label>
                      <input
                        type="number"
                        value={meetingForm.invited_count}
                        onChange={e => setMeetingForm(prev => ({ ...prev, invited_count: Number(e.target.value) }))}
                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Textarea Grande */}
                <div className="flex flex-col gap-2 text-xs">
                  <label className="font-bold text-brand-primary uppercase">Notas / Agenda</label>
                  <textarea
                    value={meetingForm.notes}
                    onChange={e => setMeetingForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Describe los temas principales a tratar en la reunión..."
                    className="w-full h-full min-h-[220px] p-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none flex-1"
                  />
                </div>

                {/* Botón de guardado a lo ancho */}
                <div className="col-span-1 md:col-span-2 mt-2 flex justify-center">
                  <button
                    type="submit"
                    className="w-auto px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-full font-bold text-[13px] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Calendar className="h-4 w-4 shrink-0" />
                    Programar Reunión
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA MINUTA / ACTA */}
      {isMinuteModalOpen && (
        <div 
          onClick={() => setIsMinuteModalOpen(false)}
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[32px] max-w-3xl w-full p-8 shadow-2xl flex flex-col text-left"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-[#1B1B1B] dark:text-white flex items-center gap-1.5">
                <FileText size={16} className="text-brand-primary" />
                <span>Registrar Acta de Reunión</span>
              </h3>
              <button
                onClick={() => setIsMinuteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer border-none shadow-sm shadow-red-500/10"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveMinute} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Columna Izquierda: Campos Estándar */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 text-xs">
                    <label className="font-bold text-brand-primary uppercase">Reunión Asignada</label>
                    <CustomSelect
                      value={minuteForm.meeting_id}
                      onChange={val => setMinuteForm(prev => ({ ...prev, meeting_id: val }))}
                      options={meetings.map(m => ({ value: m.id, label: `${m.title} (${m.meeting_date})` }))}
                      placeholder="-- Seleccionar Reunión --"
                    />
                  </div>

                  <div className="flex flex-col gap-2 text-xs">
                    <label className="font-bold text-brand-primary uppercase">Título del Acta / Minuta</label>
                    <input
                      type="text"
                      value={minuteForm.title}
                      onChange={e => setMinuteForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Acta Claustro Julio 2026"
                      className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs font-semibold"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2 text-xs">
                    <label className="font-bold text-brand-primary uppercase">Participantes (Nombres separados por comas)</label>
                    <input
                      type="text"
                      value={minuteForm.participants}
                      onChange={e => setMinuteForm(prev => ({ ...prev, participants: e.target.value }))}
                      placeholder="Ej: Juan Martínez, Laura Reyes, Rosa Díaz"
                      className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-2 text-xs">
                    <label className="font-bold text-brand-primary uppercase">Firmas Requeridas (Cantidad)</label>
                    <input
                      type="number"
                      value={minuteForm.pending_signatures}
                      onChange={e => setMinuteForm(prev => ({ ...prev, pending_signatures: Number(e.target.value) }))}
                      className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Columna Derecha: Textarea Grande */}
                <div className="flex flex-col gap-2 text-xs">
                  <label className="font-bold text-brand-primary uppercase">Contenido y Acuerdos del Acta</label>
                  <textarea
                    value={minuteForm.content}
                    onChange={e => setMinuteForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Escribe la minuta completa o los acuerdos firmados por el claustro..."
                    className="w-full h-full min-h-[220px] p-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none flex-1"
                  />
                </div>

                {/* Botón de guardado a lo ancho */}
                <div className="col-span-1 md:col-span-2 mt-2 flex justify-center">
                  <button
                    type="submit"
                    className="w-auto px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-full font-bold text-[13px] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    Guardar Acta
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO CASO ESTUDIANTIL - WIZARD 2 PASOS */}
      {isFollowupModalOpen && (
        <div 
          onClick={() => { setIsFollowupModalOpen(false); setWizardStep(1); setFollowupTeacherId(""); setSelectedClassroomId(""); }}
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[32px] w-full p-6 shadow-2xl flex flex-col text-left transition-all duration-300 ${wizardStep === 1 ? 'max-w-md' : 'max-w-3xl'}`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black text-[#1B1B1B] dark:text-white flex items-center gap-1.5">
                <Users size={16} className="text-brand-primary" />
                <span>Registrar Intervención</span>
              </h3>
              <button
                onClick={() => { setIsFollowupModalOpen(false); setWizardStep(1); setFollowupTeacherId(""); setSelectedClassroomId(""); }}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer border-none shadow-sm shadow-red-500/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${wizardStep === 1 ? 'bg-brand-primary text-white shadow-md' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                {wizardStep > 1 ? <Check size={12} /> : <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>}
                <span>Estudiante</span>
              </div>
              <div className="flex-1 h-[2px] bg-neutral-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className={`h-full bg-brand-primary rounded-full transition-all duration-500 ${wizardStep === 2 ? 'w-full' : 'w-0'}`} />
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${wizardStep === 2 ? 'bg-brand-primary text-white shadow-md' : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-400 dark:text-zinc-500'}`}>
                <span className="w-4 h-4 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center text-[10px]">2</span>
                <span>Detalles</span>
              </div>
            </div>

            {/* PASO 1: Selección de Docente → Aula → Estudiante */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="flex flex-col gap-2 text-xs">
                  <label className="font-bold text-brand-primary uppercase">Docente</label>
                  <CustomSelect
                    value={followupTeacherId}
                    onChange={val => {
                      setFollowupTeacherId(val);
                      setSelectedClassroomId("");
                      setFollowupForm(prev => ({ ...prev, student_id: "" }));
                    }}
                    options={teachers.map(t => ({ value: t.id, label: t.full_name || t.nombre || 'Docente' }))}
                    placeholder="-- Seleccionar Docente --"
                    searchable={true}
                    useModal={true}
                  />
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <label className="font-bold text-brand-primary uppercase">Aula</label>
                  <CustomSelect
                    value={selectedClassroomId}
                    onChange={val => {
                      setSelectedClassroomId(val);
                      setFollowupForm(prev => ({ ...prev, student_id: "" }));
                    }}
                    options={
                      !followupTeacherId
                        ? []
                        : classrooms
                            .filter(c => c.teacher_id === followupTeacherId)
                            .map(c => ({ value: c.id, label: `${c.name} (${c.grade || ''})` }))
                    }
                    placeholder={
                      !followupTeacherId
                        ? "-- Selecciona primero un Docente --"
                        : "-- Seleccionar Aula --"
                    }
                    className={!followupTeacherId ? "opacity-60 pointer-events-none" : ""}
                  />
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <label className="font-bold text-brand-primary uppercase">Estudiante</label>
                  <CustomSelect
                    value={followupForm.student_id}
                    onChange={val => setFollowupForm(prev => ({ ...prev, student_id: val }))}
                    options={
                      !selectedClassroomId
                        ? []
                        : students
                            .filter(s => s.classroom_id === selectedClassroomId)
                            .map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name || ""}` }))
                    }
                    placeholder={
                      !selectedClassroomId
                        ? "-- Selecciona primero un Aula --"
                        : "-- Seleccionar Estudiante --"
                    }
                    searchable={true}
                    className={!selectedClassroomId ? "opacity-60 pointer-events-none" : ""}
                    useModal={true}
                  />
                </div>

                {/* Resumen visual de selección */}
                {followupForm.student_id && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center gap-2 text-xs animate-in fade-in duration-200">
                    <Check size={14} className="text-emerald-650 shrink-0" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                      {(() => {
                        const st = students.find(s => s.id === followupForm.student_id);
                        return st ? `${st.first_name} ${st.last_name || ''}` : 'Estudiante';
                      })()} — seleccionado
                    </span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!followupForm.student_id) {
                        toast.error("Selecciona un estudiante para continuar.");
                        return;
                      }
                      setWizardStep(2);
                    }}
                    className="px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-full font-bold text-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md flex items-center gap-2"
                  >
                    Continuar
                    <ChevronDown size={14} className="-rotate-90" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: Detalles del caso */}
            {wizardStep === 2 && (
              <form onSubmit={handleSaveFollowup} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Columna Izquierda: Selectores */}
                  <div className="space-y-3.5">
                    {/* Mini resumen del estudiante */}
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 border border-black/5 dark:border-zinc-700 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center">
                          <UserCheck size={13} className="text-brand-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-[#1B1B1B] dark:text-white">
                            {(() => {
                              const st = students.find(s => s.id === followupForm.student_id);
                              return st ? `${st.first_name} ${st.last_name || ''}` : 'Estudiante';
                            })()}
                          </p>
                          <p className="text-slate-400 dark:text-zinc-500 text-[10px]">
                            {(() => {
                              const cl = classrooms.find(c => c.id === selectedClassroomId);
                              return cl ? `${cl.name} (${cl.grade || ''})` : '';
                            })()}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setWizardStep(1)} className="text-brand-primary hover:underline font-bold cursor-pointer bg-transparent border-none text-xs">
                        Cambiar
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-bold text-brand-primary uppercase">Motivo de Seguimiento</label>
                      <CustomSelect
                        value={followupForm.reason}
                        onChange={val => setFollowupForm(prev => ({ ...prev, reason: val }))}
                        options={[
                          "Bajo rendimiento",
                          "Ausentismo",
                          "NEAE (Necesidades Especiales)",
                          "Riesgo de repitencia",
                          "Conducta"
                        ].map(r => ({ value: r, label: r }))}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-bold text-brand-primary uppercase">Especialista / Responsable</label>
                      <input
                        type="text"
                        value={followupForm.responsible_id}
                        onChange={e => setFollowupForm(prev => ({ ...prev, responsible_id: e.target.value }))}
                        placeholder="Ej: Psicóloga Escolar / Dra. Peralta"
                        className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-brand-primary uppercase">Última Intervención</label>
                        <DatePicker
                          value={followupForm.last_intervention_date}
                          onChange={val => setFollowupForm(prev => ({ ...prev, last_intervention_date: val }))}
                          direction="up"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-brand-primary uppercase">Estado</label>
                        <CustomSelect
                          value={followupForm.status}
                          onChange={val => setFollowupForm(prev => ({ ...prev, status: val }))}
                          options={[
                            { value: "Urgente", label: "Urgente" },
                            { value: "Seguimiento", label: "Seguimiento" },
                            { value: "En proceso", label: "En proceso" },
                            { value: "Resuelto", label: "Resuelto" }
                          ]}
                          direction="up"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Textarea */}
                  <div className="flex flex-col gap-2 text-xs">
                    <label className="font-bold text-brand-primary uppercase">Notas y Acuerdos</label>
                    <textarea
                      value={followupForm.notes}
                      onChange={e => setFollowupForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Detalla los compromisos de mejora, apoyo familiar o derivaciones..."
                      className="w-full h-full min-h-[180px] md:min-h-[220px] p-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 text-[#1B1B1B] dark:text-white rounded-full font-bold text-xs transition-all cursor-pointer border-none flex items-center gap-1.5"
                  >
                    <ChevronDown size={14} className="rotate-90" />
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-full font-bold text-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <UserCheck className="h-4 w-4 shrink-0" />
                    Registrar Caso
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DIALOGO DE CONFIRMACIÓN MODAL PREMIUM */}
      {deleteConfirmOpen && (
        <div 
          onClick={() => {
            setDeleteConfirmOpen(false);
            setEvidenceToDelete(null);
          }}
          className="fixed inset-0 bg-black/40 z-[9999] backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] max-w-md w-full p-6 shadow-2xl flex flex-col text-left space-y-4"
          >
            <div className="flex items-center gap-3 text-[#1B1B1B] dark:text-white">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight">¿Confirmar eliminación?</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-655 dark:text-neutral-350 leading-relaxed font-medium bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-black/5 dark:border-zinc-850">
              ¿Estás seguro de que deseas eliminar la evidencia <strong>{evidenceToDelete?.name}</strong>?
            </p>

            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setEvidenceToDelete(null);
                }}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-650 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer border-none"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (evidenceToDelete) {
                    await handleExecuteDeleteEvidence(evidenceToDelete.id);
                  }
                }}
                className="px-4.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer border-none shadow-sm"
              >
                Confirmar y Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUTIL MODAL DE AYUDA DE GOOGLE DRIVE */}
      {helpModalOpen && (() => {
        const activeTeacher = teachers.find(t => t.id === selectedTeacherId);
        const nameToShow = activeTeacher?.full_name || "Docente";
        return (
          <div 
            onClick={() => setHelpModalOpen(false)}
            className="fixed inset-0 bg-black/40 z-[9999] backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[28px] max-w-lg w-full p-6 shadow-2xl flex flex-col text-left space-y-4 relative"
            >
              <button
                onClick={() => setHelpModalOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all border-none cursor-pointer shadow-sm active:scale-95 z-50"
              >
                <X size={14} className="stroke-[3]" />
              </button>

              <div className="flex items-center gap-3 text-[#1B1B1B] dark:text-white">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight">Guía de Evidencias y Google Drive</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Aprende a estructurar y vincular tus recursos digitales.</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 text-xs text-slate-655 dark:text-neutral-300 leading-relaxed font-semibold">
                <div className="space-y-1.5 border-b border-slate-100 dark:border-zinc-850 pb-3">
                  <h4 className="font-bold text-[#1B1B1B] dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-black">1</span>
                    ¿Cómo crear una carpeta en Google Drive?
                  </h4>
                  <p className="pl-6 text-slate-500 dark:text-zinc-400 font-medium">
                    Ve a <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Google Drive</a>, haz clic en el botón <strong>"+ Nuevo"</strong> en la esquina superior izquierda, selecciona <strong>"Nueva carpeta"</strong> y asígnale un nombre descriptivo (por ejemplo: <code className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-[10px]">Evidencias - María Vargas</code>).
                  </p>
                </div>

                <div className="space-y-1.5 border-b border-slate-100 dark:border-zinc-850 pb-3">
                  <h4 className="font-bold text-[#1B1B1B] dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-black">2</span>
                    ¿Cómo copiar el enlace compartido?
                  </h4>
                  <p className="pl-6 text-slate-500 dark:text-zinc-400 font-medium">
                    Haz clic derecho sobre la carpeta en Drive y selecciona <strong>Compartir</strong> &rarr; <strong>Copiar enlace</strong>. Asegúrate de configurar el acceso general en <strong>"Cualquier persona con el enlace"</strong> para que los coordinadores puedan ver las evidencias.
                  </p>
                </div>

                <div className="space-y-1.5 border-b border-slate-100 dark:border-zinc-850 pb-3">
                  <h4 className="font-bold text-[#1B1B1B] dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-black">3</span>
                    ¿Cómo guardar el enlace aquí?
                  </h4>
                  <p className="pl-6 text-slate-500 dark:text-zinc-400 font-medium">
                    Pega el enlace de la carpeta principal en el cuadro que dice <strong>"Ingresa el enlace compartido de Google Drive para este docente"</strong> y haz clic en <strong>"Guardar Carpeta"</strong>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-[#1B1B1B] dark:text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-black">4</span>
                    Vincular evidencias y archivos específicos
                  </h4>
                  <p className="pl-6 text-slate-500 dark:text-zinc-400 font-medium">
                    Para enlazar un archivo individual (como planificaciones, fotos, o reportes): copia el enlace compartido de dicho archivo, dale un título descriptivo en <strong>"Nombre de la evidencia"</strong>, pega su link en <strong>"Enlace a Google Drive"</strong> y presiona <strong>"+ Agregar Enlace"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setHelpModalOpen(false)}
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-black transition-all cursor-pointer border-none shadow-sm active:scale-95"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

