import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Calendar, ChevronRight, Info, X, Monitor, Crown, ArrowRight, 
  Gamepad2, MessageSquare, Sparkles, Clock, ClipboardList, Users, 
  GraduationCap, FileText, Download, Search, Award, HelpCircle, 
  Heart, Smile, Compass, Brain, BookOpen, UserCheck, AlertTriangle,
  User, Settings, Bell, LogOut, Trophy, Trash2, Coins, Eye
} from 'lucide-react';
import { getCurrentUser, getClassrooms, getStudents, saveUsuario, logout, Usuario } from '../lib/storage';
import { toast, Toaster } from 'sonner';
import { showSuccessToast } from '../lib/utils/toastHelper';
import ProCelebrationModal from '../components/modals/ProCelebrationModal';
import AmbassadorCelebrationModal from '../components/modals/AmbassadorCelebrationModal';
import OnboardingModal from '../components/modals/OnboardingModal';
import MedalStar from '../components/ui/MedalStar';
import { getUserCredits } from '../lib/credits';
import { requestD1 } from '../lib/services/d1Client';

// Dominican Ephemeris list
const DOMINICAN_EPHEMERIS = [
  { day: 26, month: 0, title: "Natalicio de Juan Pablo Duarte 🇩🇴", category: "PATRIA", description: "Se conmemora el nacimiento de Juan Pablo Duarte, prócer fundador de la República Dominicana y creador de la sociedad secreta La Trinitaria.", is_holiday: true },
  { day: 27, month: 1, title: "Día de la Independencia Nacional 🇩🇴", category: "PATRIA", description: "Conmemoración de la proclamación de la Independencia Dominicana en la Puerta del Conde en el año 1844.", is_holiday: true },
  { day: 9, month: 2, title: "Natalicio de Francisco del Rosario Sánchez 🇩🇴", category: "PATRIA", description: "Nacimiento de Francisco del Rosario Sánchez, héroe nacional y prócer de la Independencia Dominicana.", is_holiday: true },
  { day: 13, month: 3, title: "Día de la ADP 🇩🇴", category: "EDUCATIVA", description: "Conmemoración de la fundación de la Asociación Dominicana de Profesores, celebrando la defensa del magisterio.", is_holiday: false },
  { day: 15, month: 4, title: "Día del Agricultor Dominicano 🇩🇴", category: "CULTURAL", description: "Día para honrar la dedicación del agricultor que garantiza la producción de alimentos en el país.", is_holiday: false },
  { day: 30, month: 5, title: "Día del Maestro Dominicano 🎓", category: "EDUCATIVA", description: "Homenaje nacional a la ardua labor pedagógica y social de los maestros de la República Dominicana.", is_holiday: true },
  { day: 16, month: 7, title: "Día de la Restauración de la República 🇩🇴", category: "PATRIA", description: "Gesta patriótica que consolidó la soberanía nacional frente a la anexión a España en 1863.", is_holiday: true },
  { day: 8, month: 8, title: "Día de la Alfabetización Dominicana 📚", description: "Conmemoración nacional de los esfuerzos y programas educativos dedicados a erradicar el analfabetismo.", is_holiday: false },
  { day: 13, month: 9, title: "Día del Poeta Dominicano ✍️", category: "CULTURAL", description: "Nacimiento de Salomé Ureña de Henríquez, pionera de la educación femenina y célebre poetisa dominicana.", is_holiday: false },
  { day: 6, month: 10, title: "Día de la Constitución Dominicana 🇩🇴", category: "PATRIA", description: "Firma de la primera carta magna del pueblo dominicano en la ciudad de San Cristóbal en 1844.", is_holiday: true },
  { day: 25, month: 10, title: "Día de la No Violencia contra la Mujer 🇩🇴", category: "SOCIAL", description: "Homenaje al martirio de las Hermanas Mirabal (Patria, Minerva y María Teresa) asesinadas en 1960.", is_holiday: true },
  { day: 10, month: 11, title: "Día de los Derechos Humanos 🌍", category: "CULTURAL", description: "Celebración internacional del respeto a los derechos inalienables de cada ser humano.", is_holiday: false }
];

// Predefined dynamics categories
const DYNAMICS_BANK = {
  integracion: [
    { title: "El Timón Escolar 🤝", desc: "El docente actúa como capitán dando directrices de navegación (Estribor: moverse a la derecha, Babor: izquierda, Tempestad: agruparse de a 3). Rompe el hielo y activa la atención inmediata." },
    { title: "Verdad o Mentira Curricular 🧠", desc: "Los alumnos escriben dos declaraciones verdaderas y una falsa sobre la clase anterior. Los compañeros deben adivinar cuál es la falsa para repasar contenidos de forma divertida." }
  ],
  atencion: [
    { title: "El Ritmo Silencioso 🎯", desc: "El docente aplaude una secuencia rítmica y los estudiantes deben imitarla con precisión. Al terminar el último aplauso, el aula queda en silencio total con el foco en la pizarra." },
    { title: "Palabra Semáforo 🚦", desc: "Verde: seguir trabajando; Amarillo: levantar ambas manos sin hacer ruido; Rojo: cruzar de brazos y mirar al frente. Excelente para transiciones ordenadas." }
  ],
  pausa: [
    { title: "Estiramiento del Albatros 🦢", desc: "5 minutos de estiramientos de espalda y cuello imitando las alas de un ave marina, finalizando con 3 respiraciones profundas y controladas." },
    { title: "El Ocho Acostado ♾️", desc: "Con un dedo en el aire, los alumnos dibujan ochos acostados con la mano izquierda y luego la derecha, estimulando ambos hemisferios cerebrales y relajando la mente." }
  ]
};

// Curricular resources bank
const CURRICULAR_RESOURCES = [
  { id: "rc_1", name: "Adecuación Curricular - Nivel Primario", type: "PDF Oficial MINERD", size: "3.2 MB" },
  { id: "rc_2", name: "Adecuación Curricular - Nivel Secundario", type: "PDF Oficial MINERD", size: "4.1 MB" },
  { id: "rc_3", name: "Plantilla de Planificación Diaria por Competencias", type: "Documento Word", size: "1.2 MB" },
  { id: "rc_4", name: "Guía de Evaluación Formativa y Rúbricas", type: "PDF Pedagógico", size: "2.5 MB" }
];

// Predefined tools list from Planix 2.0
const PEDAGOGICAL_TOOLS = [
  { title: "Planix Juegos", desc: "Transforma tus clases en una aventura épica con retos lúdicos, dinámicas interactivas y aprendizaje gamificado.", emoji: "🎮", gradient: "bg-gradient-to-br from-indigo-500 via-blue-600 to-emerald-500", pro: true },
  { title: "Planix Investigador", desc: "Búsqueda inteligente y análisis pedagógico para potenciar tus contenidos de clase.", emoji: "🔍", gradient: "bg-gradient-to-br from-emerald-400 to-teal-500", pro: true },
  { title: "Planix Chat con PDF", desc: "Sube tus documentos oficiales y conversa con ellos para extraer competencias e indicadores.", emoji: "💬", gradient: "bg-gradient-to-br from-indigo-400 to-blue-600", pro: true },
  { title: "Planix Bienestar", desc: "Soporte emocional, técnicas DUA y estrategias personalizadas para el manejo del aula.", emoji: "❤️", gradient: "bg-gradient-to-br from-teal-400 to-emerald-500", pro: true },
  { title: "Generador de Exámenes", desc: "Construye evaluaciones profesionales alineadas al currículo dominicano.", emoji: "📑", gradient: "bg-gradient-to-br from-blue-400 to-cyan-500", pro: true },
  { title: "Sopas de Letras", desc: "Genera sopas de letras personalizadas listas para imprimir.", emoji: "🔎", gradient: "bg-gradient-to-br from-emerald-400 to-teal-500", pro: true }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const context = useOutletContext<{ isSidebarPinned: boolean, theme?: 'light' | 'dark', toggleTheme?: () => void } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;
  const theme = context?.theme ?? 'light';
  const toggleTheme = context?.toggleTheme ?? (() => {});
  const [user, setUser] = useState<Usuario | null>(() => getCurrentUser());

  useEffect(() => {
    if (user && user.rol === "coordinator") {
      navigate("/coordinador/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleUserChanged = () => {
      setUser(getCurrentUser());
    };
    if (typeof window !== "undefined") {
      window.addEventListener("plx:user_changed", handleUserChanged);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("plx:user_changed", handleUserChanged);
      }
    };
  }, []);

  const [activeSchoolYear, setActiveSchoolYear] = useState(() => localStorage.getItem('plx:active_school_year') || '2025-2026');

  useEffect(() => {
    const handleYearChanged = () => {
      setActiveSchoolYear(localStorage.getItem('plx:active_school_year') || '2025-2026');
    };
    if (typeof window !== "undefined") {
      window.addEventListener("plx:active_school_year_changed", handleYearChanged);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("plx:active_school_year_changed", handleYearChanged);
      }
    };
  }, []);

  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [timeStr, setTimeStr] = useState("");
  const [dbEphemerides, setDbEphemerides] = useState<any[]>([]);
  const [customMonthlyValue, setCustomMonthlyValue] = useState<string>("");

  // Planix states
  const [selectedDynamicCat, setSelectedDynamicCat] = useState<"integracion" | "atencion" | "pausa">("integracion");
  const [generatedDynamic, setGeneratedDynamic] = useState<any>(DYNAMICS_BANK.integracion[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewingEph, setViewingEph] = useState<any | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPremiumTool, setSelectedPremiumTool] = useState<any | null>(null);
  const [showProCelebration, setShowProCelebration] = useState(false);
  const [showAmbassadorCelebration, setShowAmbassadorCelebration] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Header state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [activeLevel, setActiveLevel] = useState<"inicial" | "primario" | "secundario">(() => {
    if (user?.nivel === "secundaria") return "secundario";
    if (user?.nivel === "inicial") return "inicial";
    return "primario";
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications state
  interface AppNotification {
    id: string;
    title: string;
    body: string;
    time: string;
    read: boolean;
  }

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const stored = localStorage.getItem(`planix_notifications_${currentUser.id}`);
      if (stored) {
        try { return JSON.parse(stored); } catch { /* fallthrough */ }
      }
    }
    return [];
  });

  // Persist notifications to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`planix_notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  // Seed default notifications + welcome message on first visit
  useEffect(() => {
    if (user) {
      const seeded = localStorage.getItem(`planix_notifications_seeded_${user.id}`);
      if (!seeded) {
        const defaultNotifs: AppNotification[] = [
          {
            id: 'welcome',
            title: `¡Bienvenido/a a Planix, ${user.nombre?.split(' ')[0] || 'Docente'}! 🎉`,
            body: 'Tu cuenta ha sido creada exitosamente. Explora tus herramientas pedagógicas y comienza a planificar. Te invitamos a unirte a nuestro grupo oficial de WhatsApp para soporte y comunidad: https://chat.whatsapp.com/CTxnZvEz6Qr2I2piuSNSDO',
            time: 'Ahora',
            read: false,
          },
        ];
        setNotifications(defaultNotifs);
        localStorage.setItem(`planix_notifications_seeded_${user.id}`, 'true');
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

  const handleLogout = () => {
    logout();
    showSuccessToast("👋 Sesión cerrada. ¡Hasta pronto!");
    navigate("/login");
  };

  // Tick clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString("es-DO", { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch active classrooms & student lists
  useEffect(() => {
    if (user) {
      const cls = getClassrooms(user.id);
      setClassrooms(cls);
      
      let allStds: any[] = [];
      cls.forEach(c => {
        allStds = [...allStds, ...getStudents(c.id)];
      });
      setStudentsList(allStds);
    }
  }, [user]);

  // Fetch latest profile from server on mount to sync roles/subscription/ambassador status
  useEffect(() => {
    async function syncProfile() {
      if (!user?.id) return;
      try {
        const response = await requestD1<any>(`/api/profiles/${user.id}`);
        if (response) {
          const updatedUser: Usuario = {
            ...user,
            nombre: response.full_name || response.nombre || user.nombre,
            email: response.email || user.email,
            rol: (() => {
              const r = (response.role || response.rol || 'teacher').toLowerCase();
              if (r === 'admin' || r === 'administrador') return 'admin';
              if (r === 'coordinator' || r === 'coordinador') return 'coordinator';
              if (r === 'director') return 'director';
              return 'teacher';
            })() as any,
            suscripcion: ((response.subscription_tier || response.suscripcion || 'free').toLowerCase()) as any,
            estado_suscripcion: (() => {
              const status = (response.subscription_status || response.estado_suscripcion || 'ACTIVO').toUpperCase();
              if (status === 'ACTIVE' || status === 'ACTIVO') return 'ACTIVO';
              if (status === 'SUSPENDIDO' || status === 'SUSPENDED') return 'SUSPENDIDO';
              if (status === 'EXPIRADO' || status === 'EXPIRED') return 'EXPIRADO';
              return 'ACTIVO';
            })() as any,
            suscripcion_hasta: response.subscription_expiry || response.suscripcion_hasta,
            is_ambassador: response.is_ambassador === 1 || response.is_ambassador === true,
            preferences: typeof response.preferences === "string" ? (() => {
              try { return JSON.parse(response.preferences); } catch (_) { return {}; }
            })() : (response.preferences || {}),
          };
          
          if (updatedUser.is_ambassador && !updatedUser.preferences?.has_seen_ambassador_celebration) {
            localStorage.removeItem(`planix_ambassador_celebration_${updatedUser.id}`);
          }

          if (
            updatedUser.is_ambassador !== user.is_ambassador ||
            updatedUser.suscripcion !== user.suscripcion ||
            updatedUser.rol !== user.rol ||
            JSON.stringify(updatedUser.preferences) !== JSON.stringify(user.preferences)
          ) {
            saveUsuario(updatedUser);
            setUser(updatedUser);
            window.dispatchEvent(new Event("plx:user_changed"));
          }
        }
      } catch (err) {
        console.error("Error syncing profile on dashboard mount:", err);
      }
    }
    syncProfile();
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const currentMonth = new Date().getMonth() + 1;
        const data = await requestD1<any[]>(`/api/ephemerides?month=${currentMonth}`);
        if (data && Array.isArray(data) && data.length > 0) {
          setDbEphemerides(data);
        }
      } catch (err) {
        console.error("Error loading dashboard ephemerides:", err);
      }

      try {
        const currentMonth = new Date().getMonth() + 1;
        const valData = await requestD1<any>(`/api/monthly-values?month=${currentMonth}`);
        if (valData && valData.value_name) {
          setCustomMonthlyValue(valData.value_name);
        }
      } catch (err) {
        console.error("Error loading dashboard monthly value:", err);
      }
    }
    loadDashboardData();
  }, []);

  // Trigger Pro Celebration Modal
  useEffect(() => {
    if (user && user.suscripcion === 'pro') {
      const hasSeenProCelebration = localStorage.getItem(`planix_pro_celebration_${user.id}`);
      const justPromoted = localStorage.getItem(`planix_just_promoted_${user.id}`);
      
      if (!hasSeenProCelebration || justPromoted === 'true') {
        localStorage.setItem(`planix_pro_celebration_${user.id}`, 'true');
        localStorage.removeItem(`planix_just_promoted_${user.id}`);
        const timer = setTimeout(() => {
          setShowProCelebration(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Trigger Ambassador Celebration Modal
  useEffect(() => {
    if (user && user.is_ambassador) {
      const hasSeenAmbassadorCelebration = !!user.preferences?.has_seen_ambassador_celebration;
      
      if (!hasSeenAmbassadorCelebration) {
        const timer = setTimeout(() => {
          setShowAmbassadorCelebration(true);
          
          const updatedUser = {
            ...user,
            preferences: {
              ...(user.preferences || {}),
              has_seen_ambassador_celebration: true
            }
          };
          saveUsuario(updatedUser);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Trigger Onboarding Modal
  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = !!user.preferences?.has_seen_onboarding;
      if (!hasSeenOnboarding) {
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleCloseOnboarding = async () => {
    setShowOnboarding(false);
    if (user) {
      const updatedUser = {
        ...user,
        preferences: {
          ...(user.preferences || {}),
          has_seen_onboarding: true
        }
      };
      saveUsuario(updatedUser);
      setUser(updatedUser);
      
      try {
        await requestD1("/api/profiles", "POST", {
          id: user.id,
          preferences: JSON.stringify(updatedUser.preferences)
        });
      } catch (err) {
        console.warn("Could not sync onboarding preferences to server:", err);
      }
    }
  };

  // Valor del Mes based on current month
  const monthlyValue = useMemo(() => {
    const values = [
      "Amabilidad 🤝", "Patriotismo 🇩🇴", "Respeto 🎯", "Responsabilidad 📚",
      "Solidaridad ❤️", "Honestidad 🤝", "Paz 🕊️", "Perseverancia 🌟",
      "Amistad 💫", "Justicia ⚖️", "Tolerancia 🌎", "Amor 💖"
    ];
    return values[new Date().getMonth()];
  }, []);

  // Time-based greeting
  const greetingData = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "¡Buenos días", icon: "☀️" };
    if (hour >= 12 && hour < 19) return { text: "¡Buenas tardes", icon: "🌤️" };
    return { text: "¡Buenas noches", icon: "🌙" };
  }, []);

  // Motivational educational reflections (similar to Planix 2.0 list)
  const subGreetingReflection = useMemo(() => {
    const reflections = [
      "La educación es el arma más poderosa para cambiar el mundo.",
      "Enseñar es dejar una huella en la vida de una persona.",
      "Un gran maestro toma la mano, abre la mente y toca el corazón.",
      "La enseñanza es la profesión que crea a todas las demás.",
      "Tus estudiantes tienen suerte de tenerte como guía.",
      "Hoy es un gran día para inspirar a mentes brillantes.",
      "Cada lección que das siembra una semilla de futuro.",
      "La paciencia y el amor son las mejores herramientas del docente.",
      "Estás formando a los líderes y ciudadanos del mañana."
    ];
    const seed = new Date().getDate();
    return reflections[seed % reflections.length];
  }, []);

  // Dominican Ephemeris for today or upcoming
  const todayEphemeris = useMemo(() => {
    const today = new Date();
    const currentMonth1 = today.getMonth() + 1;
    const currentMonth0 = today.getMonth();
    const date = today.getDate();

    // 1. Try to find in database ephemerides first
    if (dbEphemerides.length > 0) {
      // Find exact today
      const exact = dbEphemerides.find(e => Number(e.month) === currentMonth1 && Number(e.day) === date);
      if (exact) {
        return {
          day: exact.day,
          month: exact.month - 1, // convert to 0-indexed for display matching other calculations
          title: exact.title,
          category: exact.category || "EDUCATIVA",
          description: exact.description,
          is_holiday: exact.is_holiday === 1 || exact.is_holiday === true
        };
      }
      
      // Find next upcoming in current month
      const upcoming = [...dbEphemerides]
        .filter(e => Number(e.month) === currentMonth1)
        .sort((a, b) => Number(a.day) - Number(b.day));
      
      const next = upcoming.find(e => Number(e.day) >= date);
      if (next) {
        return {
          day: next.day,
          month: next.month - 1,
          title: next.title,
          category: next.category || "EDUCATIVA",
          description: next.description,
          is_holiday: next.is_holiday === 1 || next.is_holiday === true
        };
      }
      
      // Fallback to first of the month
      if (upcoming.length > 0) {
        const first = upcoming[0];
        return {
          day: first.day,
          month: first.month - 1,
          title: first.title,
          category: first.category || "EDUCATIVA",
          description: first.description,
          is_holiday: first.is_holiday === 1 || first.is_holiday === true
        };
      }
    }

    // 2. Fall back to static DOMINICAN_EPHEMERIS if database is empty or loading
    const exact = DOMINICAN_EPHEMERIS.find(e => e.month === currentMonth0 && e.day === date);
    if (exact) return exact;

    const monthEvents = DOMINICAN_EPHEMERIS.filter(e => e.month === currentMonth0);
    if (monthEvents.length > 0) {
      const sorted = [...monthEvents].sort((a, b) => a.day - b.day);
      const next = sorted.find(e => e.day >= date);
      if (next) return next;
      return sorted[0];
    }
    
    return {
      day: today.getDate(),
      month: today.getMonth(),
      title: "Planificación Docente Activa 📚",
      category: "PEDAGÓGICA",
      description: "Revisa tus secuencias didácticas y prepara las competencias fundamentales del día.",
      is_holiday: false
    };
  }, [dbEphemerides]);

  // Next scheduled class mockup
  const nextClassMock = useMemo(() => {
    if (classrooms.length === 0) return null;
    const subjectsList = ["Lengua Española", "Matemáticas", "Ciencias de la Naturaleza", "Ciencias Sociales"];
    const firstClass = classrooms[0];
    return {
      subject: firstClass.nivel === "secundaria" ? "Ciencias Sociales" : "Lengua Española",
      start_time: "08:00 AM",
      end_time: "08:45 AM",
      grade: firstClass.nombre,
      section: firstClass.seccion,
      day_of_week: "Todos los días"
    };
  }, [classrooms]);

  // Handle dynamic generation
  const handleGenerateDynamic = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const list = DYNAMICS_BANK[selectedDynamicCat];
      const randomIndex = Math.floor(Math.random() * list.length);
      setGeneratedDynamic(list[randomIndex]);
      setIsGenerating(false);
      toast.success("¡Nueva dinámica generada con éxito!");
    }, 600);
  };

  // Handle download Curricular resources
  const handleDownloadResource = (name: string) => {
    toast.success(`Descargando: ${name}...`);
  };

  const openPremiumOverlay = (tool: any) => {
    setSelectedPremiumTool(tool);
    setShowPremiumModal(true);
  };

  return (
    <div className={`flex-1 flex flex-col gap-6 w-full min-w-0 pb-12 overflow-x-hidden pt-0 px-6 transition-all duration-150 ease-out ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <Toaster position="top-center" richColors />

      {/* INTEGRATED CANVAS HEADER */}
      <header className="relative w-full z-45 flex items-center justify-between gap-4 -mt-2.5 pb-5 select-none">
        <div className="relative flex-1 max-w-xs md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar herramientas, recursos, alumnos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full pl-11 pr-4 py-2.5 text-xs md:text-sm font-semibold text-slate-750 dark:text-slate-200 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl focus:outline-none focus:border-black/15 dark:focus:border-white/20 transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>

        {/* Level Toggle & Quick Actions */}
        <div className="flex items-center gap-3.5 md:gap-4.5">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest">Nivel:</span>
            <div
              className="px-4 py-2 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-zinc-900 text-xs md:text-sm font-black text-slate-800 dark:text-slate-200 shadow-xs flex items-center gap-1.5"
            >
              {activeLevel === "inicial" ? (
                <>
                  <Smile size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Inicial</span>
                </>
              ) : activeLevel === "secundario" ? (
                <>
                  <GraduationCap size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Secundario</span>
                </>
              ) : (
                <>
                  <BookOpen size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Primario</span>
                </>
              )}
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer overflow-hidden group"
            title={theme === 'light' ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
          >
            {theme === 'light' ? (
              <div className="relative transform transition-transform duration-300 group-hover:scale-110 rotate-0">
                <svg className="w-5 h-5 text-indigo-500 fill-indigo-500/20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
            ) : (
              <div className="relative transform transition-transform duration-300 group-hover:scale-110 rotate-90">
                <svg className="w-5 h-5 text-amber-500 fill-amber-500/20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </div>
            )}
          </button>

          {/* Interactive Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="relative w-10 h-10 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              title="Notificaciones"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
                </span>
              )}
            </button>

            {showNotificationDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotificationDropdown(false)} />
                <div className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-black/5 dark:border-white/10 shadow-lg p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Notificaciones</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-0.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Limpiar todas"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded-full normal-case tracking-normal">{unreadCount} {unreadCount === 1 ? 'Nueva' : 'Nuevas'}</span>
                    )}
                  </h3>

                  {notifications.length === 0 ? (
                    <div className="text-center py-6">
                      <Bell size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">No hay notificaciones</p>
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-hide">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id);
                            setShowNotificationDropdown(false);
                            navigate(`/notificaciones?expanded=${notif.id}`);
                          }}
                          className={`flex gap-2.5 p-2 rounded-xl transition-colors cursor-pointer relative group/notif ${
                            notif.read ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                          }`}
                        >
                          {!notif.read && (
                            <span className="absolute top-4 left-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                          )}
                          <div className="flex-1 min-w-0 pl-2 pr-6">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-xs font-black truncate ${notif.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white'}`}>{notif.title}</span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 font-medium leading-relaxed">
                              {notif.body}
                            </p>
                          </div>
                          <button
                            onClick={(e) => deleteNotification(notif.id, e)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/notif:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all z-10"
                            title="Eliminar notificación"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="h-px bg-slate-100 dark:bg-white/5 my-2.5" />

                  <button
                    onClick={() => {
                      setShowNotificationDropdown(false);
                      navigate("/notificaciones");
                    }}
                    className="w-full py-2.5 bg-indigo-50/60 dark:bg-indigo-950/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/30 text-xs font-black text-indigo-600 dark:text-indigo-400 rounded-xl transition-all border border-indigo-100/40 dark:border-indigo-900/30 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Eye size={13} className="text-indigo-500 dark:text-indigo-400" />
                    <span>Ver todas las notificaciones</span>
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Credits indicator */}
          <div className="flex items-center select-none mr-2">
            {user?.suscripcion === "pro" || user?.rol === "admin" ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/12 dark:from-amber-500/20 dark:to-amber-600/20 border border-amber-500/25 dark:border-amber-500/40 rounded-full shadow-[0_2px_12px_rgba(245,158,11,0.08)]">
                <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-450 fill-amber-500/20 stroke-[2.5]" />
                <span className="text-xs md:text-[13px] font-black text-amber-850 dark:text-amber-400 tracking-tight">
                  Planix Pro
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <img 
                  src="/creditos.webp" 
                  alt="Créditos" 
                  className="w-8 h-8 object-contain shrink-0" 
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-xs md:text-sm font-black text-slate-800 dark:text-zinc-200">
                  {getUserCredits(user)} PC
                </span>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-zinc-700" />

          {/* Profile Menu Pill */}
          <div className="relative">
            <div
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 p-1.5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-full border border-black/5 dark:border-white/10 shadow-xs cursor-pointer select-none transition-colors pr-4"
            >
              <div className={`w-10 h-10 rounded-full flex-shrink-0 bg-slate-100 relative ${
                user?.is_ambassador
                  ? "p-[1.5px] bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.35)]"
                  : user?.suscripcion === "pro"
                  ? "p-[1.5px] bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.35)]"
                  : "border border-black/5"
              }`}>
                <img 
                  src={user?.avatar_url || "https://randomuser.me/api/portraits/women/47.jpg"} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full" 
                />
                {user?.is_ambassador ? (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-tr from-amber-400 to-amber-600 text-white p-0.5 rounded-full border border-white dark:border-slate-900 shadow-xs scale-85 flex items-center justify-center">
                    <MedalStar size={8} className="text-white" />
                  </div>
                ) : user?.suscripcion === "pro" ? (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-tr from-amber-400 to-amber-600 text-white p-0.5 rounded-full border border-white dark:border-slate-900 shadow-xs scale-85">
                    <Crown className="h-2 w-2 fill-white text-white" />
                  </div>
                ) : null}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs md:text-[13px] font-black text-slate-800 dark:text-zinc-100 leading-tight flex items-center gap-1">
                  {user?.nombre || "Docente"}
                  {user?.is_ambassador && <MedalStar size={10} className="text-amber-500 shrink-0" />}
                </span>
                <span className="text-[9px] font-black text-indigo-650 uppercase tracking-widest leading-none mt-0.5">
                  {user?.is_ambassador
                    ? "Embajador"
                    : user?.rol === "admin" 
                    ? "Administrador" 
                    : user?.rol === "coordinator" 
                    ? "Coordinador" 
                    : user?.rol === "director" 
                    ? "Director" 
                    : "Docente"}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showProfileDropdown ? 'rotate-90' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                <div className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/10 shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate("/perfil");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <User size={14} className="text-slate-400" />
                    <span>Mi Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      toast.info("Guías de usuario cargando...");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <BookOpen size={14} className="text-slate-400" />
                    <span>Guías y Ayuda</span>
                  </button>

                  <a
                    href="https://chat.whatsapp.com/CTxnZvEz6Qr2I2piuSNSDO"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Users size={14} className="text-slate-400" />
                    <span>Planix Comunidad</span>
                  </a>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      toast.info("No hay novedades en este momento.");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <FileText size={14} className="text-slate-400" />
                    <span>Blog y Novedades</span>
                  </button>
                  
                  {user?.rol === 'admin' && (
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate("/admin/dashboard");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold text-[#0046ab] dark:text-blue-400 hover:bg-[#0046ab]/5 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <UserCheck size={14} className="text-[#0046ab] dark:text-blue-400" />
                      <span>Panel Admin</span>
                    </button>
                  )}

                  <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1" />

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid Columns wrapper */}
      <div className={`w-full flex flex-col gap-8 mt-2 ${
        isSidebarPinned ? 'xl:flex-row' : 'lg:flex-row'
      }`}>

        {/* Columna Principal (Izquierda - Col-span-8) */}
        <div className="flex-1 space-y-8 flex flex-col min-w-0">
        
        {/* Dashboard Welcome Banner */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[28px] p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-black text-[#1B1B1B] dark:text-white tracking-tight flex items-center gap-2 leading-tight">
                  {greetingData.text}, {user?.nombre.split(" ")[0] || "Docente"}!
                  <span className="text-xl md:text-2xl">{greetingData.icon}</span>
                </h2>
                <p className="text-[#1B1B1B]/60 dark:text-slate-400 text-[11px] md:text-xs font-bold leading-relaxed max-w-xl">
                  {subGreetingReflection}
                </p>
              </div>
            </div>

            {/* Valor del Mes Row */}
            <div className="flex items-center gap-2.5 mt-0.5">
              <span className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-amber-800/20 text-slate-700 dark:text-amber-300 font-extrabold text-[9.5px] tracking-wider uppercase px-2.5 py-1 rounded-lg">
                Valor del Mes
              </span>
              <span className="text-xs font-black text-[#1B1B1B] dark:text-white flex items-center gap-1">
                {customMonthlyValue || monthlyValue} <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500/10" />
              </span>
            </div>

            {/* Scheduled Classes Status Pill */}
            <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 px-4 py-2.5 rounded-2xl inline-flex items-center gap-2 text-[11px] font-bold text-[#1B1B1B]/70 dark:text-slate-400 w-fit">
              <span>Tienes</span>
              <span className="text-blue-600 dark:text-blue-400 underline font-black">
                {classrooms.length} {classrooms.length === 1 ? "clase programada" : "clases programadas"}
              </span>
              <span className="text-[#1B1B1B]/20 dark:text-slate-650">•</span>
              {classrooms.length === 0 ? (
                <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-450 animate-pulse"></span>
                  No hay clases hoy
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-450 animate-pulse"></span>
                  Próxima clase a las {nextClassMock?.start_time}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions Card */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Action 1: Crear Planificacion */}
            <div 
              onClick={() => {
                toast.info("Iniciando planificador curricular...");
                navigate("/planificaciones/nueva");
              }}
              className="bg-gradient-to-br from-[#FFF4E0] to-[#FFE4E1] dark:from-amber-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-orange-500/10 select-none text-left"
            >
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={16} className="text-orange-600 dark:text-orange-400" />
                  <span className="text-[13px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Planificación</span>
                </div>
                <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-orange-600 dark:text-orange-400">
                  <BookOpen size={18} className="fill-orange-500 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="relative z-10 my-4 flex flex-col items-start w-full">
                <div className="flex items-end gap-1.5">
                  <span className="text-[22px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                    Crear Planificación
                  </span>
                </div>
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-orange-500/10 w-full">
                <span className="text-[11px] font-bold text-[#1B1B1B]/60 dark:text-slate-400 uppercase tracking-wider">Planificador</span>
                <span className="text-[11px] font-black uppercase text-orange-600 dark:text-orange-400 bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md border border-orange-200/50">
                  CURRICULAR
                </span>
              </div>
            </div>

            {/* Action 2: Aula Virtual */}
            <div 
              onClick={() => navigate("/aula-virtual")}
              className="bg-gradient-to-br from-[#E0E7FF] to-[#EDE9FE] dark:from-indigo-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-indigo-500/10 select-none text-left"
            >
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-1.5">
                  <GraduationCap size={16} className="text-indigo-650 dark:text-indigo-400" />
                  <span className="text-[13px] font-bold text-indigo-655 dark:text-indigo-400 uppercase tracking-wider">Aula Virtual</span>
                </div>
                <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-indigo-655 dark:text-indigo-400">
                  <GraduationCap size={18} className="fill-indigo-500 text-indigo-655 dark:text-indigo-400" />
                </div>
              </div>
              <div className="relative z-10 my-4 flex flex-col items-start w-full">
                <div className="flex items-end gap-1.5">
                  <span className="text-[22px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                    Aula Virtual
                  </span>
                </div>
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-indigo-500/10 w-full">
                <span className="text-[11px] font-bold text-[#1B1B1B]/60 dark:text-slate-400 uppercase tracking-wider">Acceso</span>
                <span className="text-[11px] font-black uppercase text-indigo-655 dark:text-indigo-400 bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md border border-indigo-200/50">
                  ESTUDIANTES
                </span>
              </div>
            </div>

            {/* Action 3: Dinamicas */}
            <div 
              onClick={() => navigate("/dinamicas")}
              className="bg-gradient-to-br from-[#E6F4EA] to-[#F1F9F5] dark:from-emerald-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-emerald-500/10 select-none text-left"
            >
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Dinámicas</span>
                </div>
                <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-emerald-600 dark:text-emerald-400">
                  <Sparkles size={18} className="fill-emerald-500 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="relative z-10 my-4 flex flex-col items-start w-full">
                <div className="flex items-end gap-1.5">
                  <span className="text-[22px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                    Para el Aula
                  </span>
                </div>
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-emerald-500/10 w-full">
                <span className="text-[11px] font-bold text-[#1B1B1B]/60 dark:text-slate-400 uppercase tracking-wider">Recursos</span>
                <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md border border-emerald-200/50">
                  PEDAGÓGICOS
                </span>
              </div>
            </div>

            {/* Action 4: Incidencias */}
            <div 
              onClick={() => navigate("/aula-virtual")}
              className="bg-gradient-to-br from-[#FCE8E6] to-[#FEF3F2] dark:from-rose-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-rose-500/10 select-none text-left"
            >
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
                  <span className="text-[13px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Reportes</span>
                </div>
                <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-rose-600 dark:text-rose-400">
                  <AlertTriangle size={18} className="fill-rose-500 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <div className="relative z-10 my-4 flex flex-col items-start w-full">
                <div className="flex items-end gap-1.5">
                  <span className="text-[22px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                    Incidencias
                  </span>
                </div>
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-rose-500/10 w-full">
                <span className="text-[11px] font-bold text-[#1B1B1B]/60 dark:text-slate-400 uppercase tracking-wider">Conducta</span>
                <span className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400 bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md border border-rose-200/50">
                  REGISTRO
                </span>
              </div>
            </div>

            {/* Action 5: Horario */}
            <div 
              onClick={() => navigate("/configuracion")}
              className="bg-gradient-to-br from-[#E8F0FE] to-[#F4F8FF] dark:from-blue-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-blue-500/10 select-none text-left"
            >
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-[13px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Horario</span>
                </div>
                <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-blue-600 dark:text-blue-400">
                  <Calendar size={18} className="fill-blue-500 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="relative z-10 my-4 flex flex-col items-start w-full">
                <div className="flex items-end gap-1.5">
                  <span className="text-[22px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                    De Clases
                  </span>
                </div>
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-blue-500/10 w-full">
                <span className="text-[11px] font-bold text-[#1B1B1B]/60 dark:text-slate-400 uppercase tracking-wider">Docente</span>
                <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md border border-blue-200/50">
                  CALENDARIO
                </span>
              </div>
            </div>

            {/* Action 6: Whatsapp */}
            <a 
              href="https://chat.whatsapp.com/CTxnZvEz6Qr2I2piuSNSDO" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-[#E8F5E9] to-[#F1F8F6] dark:from-green-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] flex flex-col justify-between border border-transparent hover:border-green-500/10 select-none text-left"
            >
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Comunidad</span>
                </div>
                <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-[#25D366]">
                  <svg className="w-5 h-5 fill-[#25D366]" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
              </div>
              <div className="relative z-10 my-4 flex flex-col items-start w-full">
                <div className="flex items-end gap-1.5">
                  <span className="text-[22px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight">
                    Grupo WhatsApp
                  </span>
                </div>
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-green-500/10 w-full">
                <span className="text-[11px] font-bold text-[#1B1B1B]/60 dark:text-slate-400 uppercase tracking-wider">Docentes</span>
                <span className="text-[11px] font-black uppercase text-[#25D366] bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md border border-green-200/50">
                  UNIRSE
                </span>
              </div>
            </a>
          </div>
        </section>

        {/* Curricular resources bank */}
        <section className="space-y-4">
          <h3 className="text-slate-800 dark:text-slate-200 font-black text-lg tracking-tight uppercase">Documentos MINERD Oficiales</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {CURRICULAR_RESOURCES.map((res) => (
              <div 
                key={res.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[1.5rem] p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-350">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[13px] text-slate-800 dark:text-slate-100 line-clamp-1">{res.name}</h4>
                    <div className="flex gap-2 items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">
                      <span>{res.type}</span>
                      <span>•</span>
                      <span>{res.size}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDownloadResource(res.name)}
                  className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/5 rounded-full text-slate-600 dark:text-slate-350 transition-colors cursor-pointer"
                >
                  <Download size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Columna Lateral (Derecha - Sidebar - Col-span-4) */}
      <div className="w-full xl:w-[300px] xl:shrink-0 grid grid-cols-1 sm:grid-cols-2 xl:flex xl:flex-col gap-5">
        
        {/* Año Lectivo Card */}
        <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] dark:from-violet-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden flex flex-col justify-between border border-transparent hover:border-violet-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] shadow-sm hover:shadow-md select-none text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100/30 dark:bg-violet-900/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center relative z-10 w-full mb-3.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
              <span className="text-[13px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Año Lectivo</span>
            </div>
            <span className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-400 bg-white/70 dark:bg-black/30 px-3 py-1.5 rounded-md border border-violet-200/50 shadow-2xs">
              Activo
            </span>
          </div>

          <div className="relative z-10 my-1 flex items-center gap-3.5 w-full">
            <div className="w-11 h-11 bg-white/60 dark:bg-black/40 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-2xs text-xl shrink-0">
              🎓
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[20px] font-extrabold text-[#1B1B1B] dark:text-white leading-none tracking-tight block uppercase">
                {activeSchoolYear}
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold mt-1.5 uppercase tracking-wide">
                Año Escolar Establecido
              </p>
            </div>
          </div>
        </div>

        {/* NextClassCard */}
        {nextClassMock ? (
          <div className="bg-gradient-to-br from-[#EBF3FF] to-[#F3F7FF] dark:from-blue-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden flex flex-col justify-between border border-transparent hover:border-blue-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] shadow-sm hover:shadow-md select-none text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center relative z-10 w-full mb-3.5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                <span className="text-[13px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Próxima Clase</span>
              </div>
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 bg-white/70 dark:bg-black/30 px-3 py-1.5 rounded-md border border-blue-200/50 shadow-2xs">
                {nextClassMock.start_time}
              </span>
            </div>

            <div className="relative z-10 my-1 flex items-center gap-3.5 w-full">
              <div className="w-11 h-11 bg-white/60 dark:bg-black/40 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-2xs text-xl shrink-0">
                📖
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[18px] font-extrabold text-[#1B1B1B] dark:text-white leading-tight tracking-tight block truncate uppercase">
                  {nextClassMock.subject}
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-wide">
                  {nextClassMock.grade}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#EBF3FF] to-[#F3F7FF] dark:from-blue-950/20 dark:to-slate-900 rounded-[28px] p-6 border border-transparent text-center text-slate-400 dark:text-slate-500 py-6 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider">No hay clases registradas</span>
          </div>
        )}

        {/* DailyEphemerisCard */}
        <div className="bg-gradient-to-br from-[#FFEAF0] to-[#FFF0F5] dark:from-rose-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden flex flex-col justify-between border border-transparent hover:border-rose-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] shadow-sm hover:shadow-md select-none text-left">
          <div className="flex justify-between items-start relative z-10 w-full">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-400" strokeWidth={2.5} />
              <span className="text-[13px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Efemérides</span>
            </div>
            <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-rose-600 dark:text-rose-400">
              <Calendar size={18} className="fill-rose-500 text-rose-600 dark:text-rose-450" />
            </div>
          </div>
          <div className="relative z-10 my-4 flex flex-col items-start w-full">
            <span className="text-[18px] font-extrabold text-[#1B1B1B] dark:text-white leading-tight tracking-tight mb-1">
              {todayEphemeris.title}
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold leading-normal line-clamp-2">
              {todayEphemeris.description}
            </p>
          </div>
          <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-rose-500/10 w-full">
            <button 
              onClick={() => setViewingEph(todayEphemeris)}
              className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors bg-white/70 dark:bg-black/30 px-3 py-1.5 rounded-md border border-rose-200/50 cursor-pointer shadow-2xs hover:shadow-xs"
            >
              Ficha Completa
            </button>
            {todayEphemeris.is_holiday && (
              <span className="text-[11px] font-black uppercase text-red-655 dark:text-red-400 bg-red-100/60 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-200/50">
                Festivo
              </span>
            )}
          </div>
        </div>

        {/* Workspace Metrics Card */}
        <div className="bg-gradient-to-br from-[#E0E7FF] to-[#EDE9FE] dark:from-indigo-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden flex flex-col justify-between border border-transparent hover:border-indigo-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] shadow-sm hover:shadow-md select-none text-left">
          <div className="flex justify-between items-start relative z-10 w-full">
            <div className="flex items-center gap-1.5">
              <Trophy size={16} className="text-indigo-650 dark:text-indigo-400" />
              <span className="text-[13px] font-bold text-indigo-655 dark:text-indigo-400 uppercase tracking-wider">Resumen Escolar</span>
            </div>
            <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-indigo-655 dark:text-indigo-400">
              <Trophy size={18} className="fill-indigo-500 text-indigo-655 dark:text-indigo-400" />
            </div>
          </div>
          
          <div className="relative z-10 my-4 grid grid-cols-2 gap-3 w-full">
            <div className="flex flex-col bg-white/50 dark:bg-black/30 rounded-xl p-3 border border-indigo-200/50 dark:border-indigo-900/40">
              <span className="text-[22px] font-black text-indigo-950 dark:text-indigo-200 leading-none">{classrooms.length}</span>
              <span className="text-[9px] font-bold text-[#1B1B1B]/60 dark:text-slate-400 uppercase tracking-wider mt-1">Secciones</span>
            </div>
            <div className="flex flex-col bg-white/50 dark:bg-black/30 rounded-xl p-3 border border-indigo-200/50 dark:border-indigo-900/40">
              <span className="text-[22px] font-black text-indigo-950 dark:text-indigo-200 leading-none">{studentsList.length}</span>
              <span className="text-[9px] font-bold text-[#1B1B1B]/60 dark:text-slate-400 uppercase tracking-wider mt-1">Alumnos</span>
            </div>
          </div>

          <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-indigo-500/10 w-full">
            <span className="text-[11px] font-bold text-[#1B1B1B]/60 dark:text-slate-400 uppercase tracking-wider">Matrícula</span>
            <span className="text-[11px] font-black uppercase text-indigo-655 dark:text-indigo-400 bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md border border-indigo-200/50">
              PLANIX 2.0
            </span>
          </div>
        </div>

        {/* CommunityPromoCard / WhatsApp group banner */}
        <div className="bg-gradient-to-br from-[#E6F4EA] to-[#F1F9F5] dark:from-emerald-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden flex flex-col justify-between border border-transparent hover:border-emerald-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] shadow-sm hover:shadow-md select-none text-left">
          <div className="flex justify-between items-start relative z-10 w-full">
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Comunidad</span>
            </div>
            <div className="w-10 h-10 bg-white/50 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-[#25D366]">
              <svg className="w-5 h-5 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
          </div>
          <div className="relative z-10 my-4 flex flex-col items-start w-full">
            <p className="text-[#1B1B1B]/75 dark:text-slate-200 text-[11px] font-bold leading-normal">
              Únete a la red nacional de docentes dominicanos. Comparte dudas, planificaciones y recursos oficiales.
            </p>
          </div>
          <div className="relative z-10 mt-auto flex items-center justify-between pt-3 border-t border-emerald-500/10 w-full">
            <a
              href="https://chat.whatsapp.com/CTxnZvEz6Qr2I2piuSNSDO"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors bg-white/70 dark:bg-black/30 px-3 py-1.5 rounded-md border border-emerald-200/50 cursor-pointer shadow-2xs hover:shadow-xs text-center w-full block"
            >
              Unirse al Grupo
            </a>
          </div>
        </div>

      </div>

      {/* Ephemeris Ficha Modal */}
      {viewingEph && (
        <div 
          onClick={() => setViewingEph(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-[420px] overflow-hidden border border-slate-200/80 dark:border-white/10 animate-in zoom-in-95 duration-200 relative cursor-default"
          >
            
            {/* Soft decorative blur */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-100/10 dark:bg-emerald-900/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="p-6 relative">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5 mb-5">
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-md">
                    Efeméride Nacional Dominicana 🇩🇴
                  </span>
                  <h2 className="text-base font-black text-slate-800 dark:text-slate-100 mt-1">Ficha Informativa</h2>
                </div>
                <button
                  onClick={() => setViewingEph(null)}
                  className="w-7 h-7 bg-red-500 hover:bg-red-650 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-sm shrink-0"
                  title="Cerrar"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
              </div>

              {/* Main Content Info */}
              <div className="space-y-5">
                {/* Title & Date */}
                <div className="flex items-start gap-3.5 bg-slate-50/55 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  {/* Date Badge */}
                  <div className="text-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 px-3 py-2 rounded-xl shadow-sm shrink-0 min-w-[60px]">
                    <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{viewingEph.day}</div>
                    <div className="text-[8.5px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                      {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][viewingEph.month]}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[7.5px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/20 mb-1.5">
                      {viewingEph.category || "EDUCATIVA"}
                    </span>
                    <h3 className="text-[13px] md:text-[14px] font-black text-slate-800 dark:text-slate-100 leading-tight uppercase break-words">
                      {viewingEph.title}
                    </h3>
                  </div>
                </div>

                {/* Context Section */}
                <div className="space-y-1.5">
                  <h4 className="text-[9.5px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} /> Contexto Histórico
                  </h4>
                  <p className="text-slate-550 dark:text-slate-400 text-[11.5px] md:text-xs leading-relaxed font-semibold">
                    {viewingEph.description}
                  </p>
                </div>

                {/* Close Button */}
                <div className="pt-1.5">
                  <button
                    onClick={() => setViewingEph(null)}
                    className="bg-[#1B1B1B] hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700/80 text-white rounded-xl w-full py-3 font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:shadow-md border border-black/5 dark:border-white/5"
                  >
                    Cerrar Ficha
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium tool mockup overlay */}
      {showPremiumModal && selectedPremiumTool && (
        <div 
          onClick={() => setShowPremiumModal(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-[380px] overflow-hidden border border-slate-200/80 dark:border-white/10 animate-in zoom-in-95 duration-200 relative cursor-default"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 relative text-white">
              <button
                onClick={() => setShowPremiumModal(false)}
                className="absolute top-4 right-4 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                title="Cerrar"
              >
                <X className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
              <div className="flex flex-col items-center text-center">
                <Crown className="w-9 h-9 mb-2 text-white fill-white animate-bounce" />
                <h2 className="text-lg font-black uppercase tracking-tight">Desbloquear {selectedPremiumTool.title}</h2>
                <p className="text-amber-100 text-[11px] font-semibold mt-0.5">Membresía Docente Pro Requerida</p>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-2.5 text-center">
                <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed font-semibold">
                  Para utilizar la herramienta avanzada <strong className="text-slate-850 dark:text-slate-205">{selectedPremiumTool.title}</strong> y planificar con Inteligencia Artificial ilimitada, necesitas activar tu cuenta Pro.
                </p>
                <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200/50 dark:border-amber-900/30 uppercase tracking-wide">
                  ⭐ Accede a todas las herramientas sin límites por solo $15 USD al mes
                </p>
              </div>

              <div className="pt-1.5 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowPremiumModal(false);
                    navigate("/configuracion");
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-450 hover:to-orange-450 text-white rounded-xl w-full py-3.5 font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md"
                >
                  Adquirir Plan Pro
                </button>
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-white/5 text-slate-650 dark:text-slate-300 rounded-xl w-full py-3.5 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  Regresar al Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProCelebrationModal 
        isOpen={showProCelebration}
        onClose={() => setShowProCelebration(false)}
        user={user}
      />

      <AmbassadorCelebrationModal 
        isOpen={showAmbassadorCelebration}
        onClose={() => setShowAmbassadorCelebration(false)}
        user={user}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        user={user}
      />

      </div>
    </div>
  );
}
