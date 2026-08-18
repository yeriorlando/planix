import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Calendar, ChevronRight, Info, X, Monitor, Crown, ArrowRight, 
  Gamepad2, MessageSquare, Sparkles, Clock, ClipboardList, Users, 
  GraduationCap, FileText, Download, Search, Award, HelpCircle, 
  Heart, Smile, Compass, Brain, BookOpen, UserCheck, AlertTriangle,
  User, Settings, Bell, LogOut, Trophy, Trash2, Coins, Eye
} from 'lucide-react';
import { getCurrentUser, getClassrooms, getStudents, saveUsuario, Usuario } from '../lib/storage';
import { toast, Toaster } from 'sonner';
import { performLogout } from '../lib/utils/authUtils';
import ProCelebrationModal from '../components/modals/ProCelebrationModal';
import AmbassadorCelebrationModal from '../components/modals/AmbassadorCelebrationModal';
import OnboardingModal from '../components/modals/OnboardingModal';
import MedalStar from '../components/ui/MedalStar';
import { HeaderControls } from '../components/layout/HeaderControls';
import { getUserCredits } from '../lib/credits';
import { requestD1 } from '../lib/services/d1Client';
import { fetchEvents, TeacherEvent } from '../lib/services/events';

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
  const [events, setEvents] = useState<TeacherEvent[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchEvents(user.id)
        .then(setEvents)
        .catch(err => console.error("Error fetching teacher events for dashboard:", err));
    }
  }, [user?.id]);

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
      const seeded = localStorage.getItem(`planix_notifications_seeded_${user.id}`) === 'true' || !!user.preferences?.has_seen_welcome_notification;
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

        // Save flag in database preferences
        const preferences = {
          ...(user.preferences || {}),
          has_seen_welcome_notification: true,
        };
        const updatedUser = {
          ...user,
          preferences,
        };
        saveUsuario(updatedUser);

        requestD1("/api/profiles", "POST", {
          id: user.id,
          preferences: JSON.stringify(preferences),
        }).catch(e => console.error("Error saving welcome notification preference:", e));
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
    performLogout(navigate);
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
          setUser(currentUser => {
            if (!currentUser) return null;

            const responsePref = typeof response.preferences === "string" ? (() => {
              try { return JSON.parse(response.preferences); } catch (_) { return {}; }
            })() : (response.preferences || {});

            const updatedUser: Usuario = {
              ...currentUser,
              nombre: response.full_name || response.nombre || currentUser.nombre,
              email: response.email || currentUser.email,
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
              preferences: {
                ...(currentUser.preferences || {}),
                ...responsePref
              },
            };

            const isRoleChanged = updatedUser.rol !== currentUser.rol;
            const isSubChanged = updatedUser.suscripcion !== currentUser.suscripcion;
            const isAmbassadorChanged = updatedUser.is_ambassador !== currentUser.is_ambassador;
            const arePrefChanged = JSON.stringify(updatedUser.preferences) !== JSON.stringify(currentUser.preferences);

            if (isAmbassadorChanged || isSubChanged || isRoleChanged || arePrefChanged) {
              if (currentUser.suscripcion === 'free' && updatedUser.suscripcion === 'pro') {
                console.log("[Dashboard debug] syncProfile detected free->pro promotion! Setting planix_just_promoted flag.");
                localStorage.setItem(`planix_just_promoted_${currentUser.id}`, 'true');
              }
              if (!currentUser.is_ambassador && updatedUser.is_ambassador) {
                console.log("[Dashboard debug] syncProfile detected free->ambassador promotion! Setting planix_just_made_ambassador flag.");
                localStorage.setItem(`planix_just_made_ambassador_${currentUser.id}`, 'true');
              }

              if (updatedUser.is_ambassador && !updatedUser.preferences?.has_seen_ambassador_celebration) {
                const hasSeenLocal = localStorage.getItem(`planix_ambassador_celebration_${updatedUser.id}`) === 'true';
                if (!hasSeenLocal) {
                  localStorage.removeItem(`planix_ambassador_celebration_${updatedUser.id}`);
                }
              }

              saveUsuario(updatedUser);
              setTimeout(() => {
                window.dispatchEvent(new Event("plx:user_changed"));
              }, 0);
              return updatedUser;
            }

            return currentUser;
          });
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
    console.log("[Dashboard debug] Pro Trigger Effect: user =", user);
    if (user && user.suscripcion === 'pro') {
      const hasSeenProCelebration = localStorage.getItem(`planix_pro_celebration_${user.id}`) === 'true' || !!user.preferences?.has_seen_pro_celebration;
      const justPromoted = localStorage.getItem(`planix_just_promoted_${user.id}`) === 'true';
      console.log("[Dashboard debug] Pro celebration check -> hasSeenProCelebration:", hasSeenProCelebration, "justPromoted:", justPromoted);
      
      if (!hasSeenProCelebration || justPromoted) {
        console.log("[Dashboard debug] Conditions met! Launching Pro timer...");
        const timer = setTimeout(() => {
          console.log("[Dashboard debug] Setting showProCelebration to true and removing flag");
          localStorage.removeItem(`planix_just_promoted_${user.id}`);
          setShowProCelebration(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleCloseProCelebration = async () => {
    setShowProCelebration(false);
    if (user) {
      localStorage.setItem(`planix_pro_celebration_${user.id}`, 'true');
      const updatedUser = {
        ...user,
        preferences: {
          ...(user.preferences || {}),
          has_seen_pro_celebration: true
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
        console.warn("Could not sync pro celebration preferences to D1:", err);
      }
    }
  };

  const handleCloseAmbassadorCelebration = async () => {
    setShowAmbassadorCelebration(false);
    if (user) {
      localStorage.setItem(`planix_ambassador_celebration_${user.id}`, 'true');
      const updatedUser = {
        ...user,
        preferences: {
          ...(user.preferences || {}),
          has_seen_ambassador_celebration: true
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
        console.warn("Could not sync ambassador preferences to D1:", err);
      }
    }
  };

  // Trigger Ambassador Celebration Modal
  useEffect(() => {
    console.log("[Dashboard debug] Ambassador Trigger Effect: user =", user);
    if (user && user.is_ambassador) {
      const hasSeenAmbassadorCelebration = 
        !!user.preferences?.has_seen_ambassador_celebration || 
        localStorage.getItem(`planix_ambassador_celebration_${user.id}`) === 'true';
      const justMadeAmbassador = localStorage.getItem(`planix_just_made_ambassador_${user.id}`) === 'true';
      console.log("[Dashboard debug] Ambassador celebration check -> hasSeenAmbassadorCelebration:", hasSeenAmbassadorCelebration, "justMadeAmbassador:", justMadeAmbassador);

      if (!hasSeenAmbassadorCelebration || justMadeAmbassador) {
        console.log("[Dashboard debug] Conditions met! Launching Ambassador timer...");
        const timer = setTimeout(() => {
          console.log("[Dashboard debug] Setting showAmbassadorCelebration to true and removing flag");
          localStorage.removeItem(`planix_just_made_ambassador_${user.id}`);
          localStorage.setItem(`planix_ambassador_celebration_${user.id}`, 'true');
          setShowAmbassadorCelebration(true);

          const updatedUser = {
            ...user,
            preferences: {
              ...(user.preferences || {}),
              has_seen_ambassador_celebration: true
            }
          };
          saveUsuario(updatedUser);
          setUser(updatedUser);

          requestD1("/api/profiles", "POST", {
            id: user.id,
            preferences: JSON.stringify(updatedUser.preferences)
          }).catch(err => console.warn("Could not sync ambassador preferences to D1:", err));
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Trigger Onboarding Modal
  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem(`planix_onboarding_seen_${user.id}`) === 'true' || !!user.preferences?.has_seen_onboarding;
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
      localStorage.setItem(`planix_onboarding_seen_${user.id}`, 'true');
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

  const todayStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const upcomingEventsCount = useMemo(() => {
    return events.filter(evt => evt.date >= todayStr).length;
  }, [events, todayStr]);

  // Next scheduled class from calendar events database
  const nextClassMock = useMemo(() => {
    if (events.length === 0) return null;
    
    // Parse event dates and times
    const parsedEvents = events.map(evt => {
      const dateParts = evt.date.split('-');
      const timeParts = (evt.time || '08:00').split(':');
      
      const evtDate = new Date(
        parseInt(dateParts[0]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[2]),
        parseInt(timeParts[0]),
        parseInt(timeParts[1] || '00')
      );
      
      return {
        ...evt,
        dateTime: evtDate
      };
    });
    
    // Filter to events of today or in the future
    const filtered = parsedEvents.filter(evt => evt.date >= todayStr);
    
    if (filtered.length === 0) return null;
    
    // Sort all by date, then by time
    filtered.sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
    
    // Find the first event that is in the future (today or later)
    const now = new Date();
    const nextFuture = filtered.find(evt => evt.dateTime >= now);
    
    // If we have an event in the future, use it. Otherwise, use the last event of today.
    const nextEvt = nextFuture || filtered[filtered.length - 1];
      
    // Format start_time as 12-hour format with AM/PM
    const timeParts = (nextEvt.time || '08:00').split(':');
    let hh = parseInt(timeParts[0]);
    const mm = timeParts[1] || '00';
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12;
    hh = hh ? hh : 12; // the hour '0' should be '12'
    const formattedTime = `${String(hh).padStart(2, '0')}:${mm} ${ampm}`;
    
    const monthsSpan = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const getFormattedDateStr = (dateStr: string) => {
      try {
        const parts = dateStr.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const dayName = d.toLocaleDateString('es-ES', { weekday: 'long' });
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        const monthName = monthsSpan[d.getMonth()];
        return `${capitalizedDay} ${d.getDate()} de ${monthName}`;
      } catch (e) {
        return dateStr;
      }
    };

    const getEventEmoji = (type?: string) => {
      const t = (type || '').toLowerCase();
      if (t.includes('planificaci')) return '📝';
      if (t.includes('reuni') || t.includes('padre')) return '👥';
      if (t.includes('evaluaci') || t.includes('examen')) return '✍️';
      if (t.includes('actividad') || t.includes('evento')) return '🎉';
      return '📅';
    };

    return {
      id: nextEvt.id,
      subject: nextEvt.title,
      start_time: formattedTime,
      grade: nextEvt.type || 'General',
      section: '',
      day_of_week: getFormattedDateStr(nextEvt.date),
      emoji: getEventEmoji(nextEvt.type)
    };
  }, [events, todayStr]);

  const EventIcon = Bell;

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
    <div className={`flex-1 flex flex-col gap-6 w-full min-w-0 pb-12 pt-0 px-6 transition-all duration-150 ease-out ${isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <Toaster position="top-center" richColors />

      {/* INTEGRATED CANVAS HEADER */}
      <HeaderControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeLevel={activeLevel}
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
        onOpenHelp={() => setShowOnboarding(true)}
        onOpenProCelebration={() => setShowProCelebration(true)}
      />

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
                {upcomingEventsCount} {upcomingEventsCount === 1 ? "evento programado" : "eventos programados"}
              </span>
              <span className="text-[#1B1B1B]/20 dark:text-slate-655">•</span>
              {!nextClassMock ? (
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
                  Sin eventos programados próximamente
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-450 animate-pulse"></span>
                  Próximo evento a las {nextClassMock.start_time}
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
                <div className="w-10 h-10 bg-orange-500/10 dark:bg-orange-950/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-orange-600 dark:text-orange-400">
                  <BookOpen size={18} className="fill-orange-500/20" />
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
                <div className="w-10 h-10 bg-indigo-500/10 dark:bg-indigo-950/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-indigo-655 dark:text-indigo-400">
                  <GraduationCap size={18} className="fill-indigo-500/20" />
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
                <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-emerald-600 dark:text-emerald-400">
                  <Sparkles size={18} className="fill-emerald-500/20" />
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
                <div className="w-10 h-10 bg-rose-500/10 dark:bg-rose-950/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-rose-600 dark:text-rose-400">
                  <AlertTriangle size={18} className="fill-rose-500/20" />
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
                <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-950/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-blue-600 dark:text-blue-400">
                  <Calendar size={18} className="fill-blue-500/20" />
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
            <div className="w-11 h-11 rounded-full bg-violet-500/10 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 flex items-center justify-center backdrop-blur-md shadow-2xs shrink-0">
              <GraduationCap size={20} className="fill-violet-500/20" />
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
                <span className="text-[13px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Próximo Evento</span>
              </div>
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 bg-white/70 dark:bg-black/30 px-3 py-1.5 rounded-md border border-blue-200/50 shadow-2xs">
                {nextClassMock.start_time}
              </span>
            </div>

            <div className="relative z-10 my-1 flex items-center gap-3.5 w-full">
              <div className="w-11 h-11 rounded-full bg-blue-500/10 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center backdrop-blur-md shadow-2xs shrink-0">
                <EventIcon size={20} className="fill-blue-500/20" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[18px] font-extrabold text-[#1B1B1B] dark:text-white leading-tight tracking-tight block truncate uppercase">
                  {nextClassMock.subject}
                </span>
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-0.5 block">
                  {nextClassMock.grade}
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold mt-0.5 uppercase tracking-wide">
                  {nextClassMock.day_of_week}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#EBF3FF] to-[#F3F7FF] dark:from-blue-950/20 dark:to-slate-900 rounded-[28px] p-6 border border-transparent text-center text-slate-400 dark:text-slate-505 py-6 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider">No hay eventos registrados</span>
          </div>
        )}

        {/* DailyEphemerisCard */}
        <div className="bg-gradient-to-br from-[#FFEAF0] to-[#FFF0F5] dark:from-rose-950/20 dark:to-slate-900 rounded-[28px] p-6 relative overflow-hidden flex flex-col justify-between border border-transparent hover:border-rose-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.97] min-h-[190px] shadow-sm hover:shadow-md select-none text-left">
          <div className="flex justify-between items-start relative z-10 w-full">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-400" strokeWidth={2.5} />
              <span className="text-[13px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Efemérides</span>
            </div>
            <div className="w-10 h-10 bg-rose-500/10 dark:bg-rose-950/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-rose-600 dark:text-rose-400">
              <Calendar size={18} className="fill-rose-500/20" />
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
            <div className="w-10 h-10 bg-indigo-500/10 dark:bg-indigo-950/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-indigo-655 dark:text-indigo-400">
              <Trophy size={18} className="fill-indigo-500/20" />
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
        onClose={handleCloseProCelebration}
        user={user}
      />

      <AmbassadorCelebrationModal 
        isOpen={showAmbassadorCelebration}
        onClose={handleCloseAmbassadorCelebration}
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
