import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  ChevronRight,
  Calculator,
  Globe,
  Palette,
  Microscope,
  Music,
  Dna,
  School,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  MessageSquare,
  Calendar,
  Award,
  CheckCircle2,
  Lock,
  Menu,
  X,
  Check,
  Mail,
  FileText,
  PenTool,
  Users,
  Gamepad2,
  Heart,
  Search,
  HelpCircle,
  Brain,
  Smile,
  Cpu,
  Layout,
  Rocket,
  Grid,
  Puzzle,
  Map,
  FolderOpen,
  Printer,
  Clock,
  Files,
  ShieldAlert,
  FolderX,
  Frown,
  TrendingUp,
  Zap,
  Bot,
  MapPin,
  Activity,
  Target,
  Star,
  Play
} from 'lucide-react';
import { getCurrentUser } from '../lib/storage';
import DRMap from '../components/planix/DRMap';
import FAQSection from '../components/planix/FAQSection';
import TestimonialsMasonry from '../components/planix/TestimonialsMasonry';
import SocialCommunity from '../components/planix/SocialCommunity';
import Footer from '../components/planix/Footer';
import PlatformLogo from '../components/ui/PlatformLogo';

// --- Brand Colors ---
const BRAND = {
  primary: '#02327e',
  secondary: '#02b36d',
  primaryLight: '#02327e15',
  secondaryLight: '#02b36d15',
};

// --- Features Data ---
const ALL_FEATURES = [
  {
    icon: Sparkles,
    title: "Planificación IA",
    description: "Diseña planes pedagógicos de alto impacto, adaptados a tus necesidades y con integración de IA en segundos.",
    gradient: "from-blue-500/10 to-indigo-500/10"
  },
  {
    icon: FileText,
    title: "Generador de Exámenes",
    description: "Crea evaluaciones profesionales con hojas de respuestas docentes listas para imprimir.",
    gradient: "from-purple-500/10 to-violet-500/10"
  },
  {
    icon: PenTool,
    title: "Pizarra Inteligente",
    description: "Organiza tus ideas con mapas conceptuales y esquemas dinámicos generados por IA.",
    gradient: "from-cyan-500/10 to-blue-500/10"
  },
  {
    icon: Users,
    title: "Planix Dinámicas",
    description: "Colección de dinámicas interactivas: selección al azar, generador de grupos, retos de 60s y juegos de ingenio.",
    gradient: "from-emerald-500/10 to-teal-500/10"
  },
  {
    icon: Gamepad2,
    title: "Planix Juegos",
    description: "Transforma tus clases en una aventura épica con retos lúdicos y aprendizaje gamificado.",
    gradient: "from-orange-500/10 to-amber-500/10"
  },
  {
    icon: Heart,
    title: "Planix Bienestar",
    description: "Estrategias de gestión de aula y apoyo emocional basadas en psicología pedagógica.",
    gradient: "from-pink-500/10 to-rose-500/10"
  },
  {
    icon: Search,
    title: "Asistente de Investigación",
    description: "Encuentra información educativa relevante y genera resúmenes para tus preparaciones.",
    gradient: "from-sky-500/10 to-blue-500/10"
  },
  {
    icon: HelpCircle,
    title: "Generador de Preguntas",
    description: "Crea cuestionarios y preguntas de reflexión automáticamente a partir de cualquier texto.",
    gradient: "from-violet-500/10 to-purple-500/10"
  },
  {
    icon: Brain,
    title: "Planix Simplifica",
    description: "Técnica de Feynman para explicar temas complejos de forma sencilla y con analogías.",
    gradient: "from-fuchsia-500/10 to-pink-500/10"
  },
  {
    icon: Smile,
    title: "Planix Inicial",
    description: "Herramientas especializadas con radar de habilidades para el Nivel Inicial.",
    gradient: "from-yellow-500/10 to-orange-500/10"
  },
  {
    icon: Cpu,
    title: "Sintetizador de IA",
    description: "Transforma cualquier texto en resúmenes, materiales didácticos o actividades creativas.",
    gradient: "from-teal-500/10 to-cyan-500/10"
  },
  {
    icon: Layout,
    title: "Lienzo Curricular",
    description: "La forma definitiva de planificar: Elige entre diseño libre total o clonación inteligente por IA en Canvas.",
    gradient: "from-indigo-500/10 to-blue-500/10"
  },
  {
    icon: Rocket,
    title: "Planix STEAM",
    description: "Generador de proyectos integrales ciencia-tecnología-arte, 100% gamificados y contextualizados.",
    gradient: "from-red-500/10 to-orange-500/10"
  },
  {
    icon: MessageSquare,
    title: "Planix Chat con PDF",
    description: "Conversa con tus documentos para extraer información, resumir o hacer preguntas con ayuda de la IA.",
    gradient: "from-blue-500/10 to-sky-500/10"
  },
  {
    icon: Award,
    title: "Generador de Diplomas",
    description: "Crea reconocimientos de 'Logro Específico' con diseño premium para incentivar el comportamiento positivo.",
    gradient: "from-amber-500/10 to-yellow-500/10"
  },
  {
    icon: Grid,
    title: "Sopas de Letras",
    description: "Genera divertidas sopas de letras listas para imprimir a partir de cualquier tema o texto.",
    gradient: "from-lime-500/10 to-green-500/10"
  },
  {
    icon: Puzzle,
    title: "Creador de Crucigramas",
    description: "Construye crucigramas educativos rápidamente a partir de un tema o texto base.",
    gradient: "from-emerald-500/10 to-lime-500/10"
  },
  {
    icon: Map,
    title: "Recorridos Docentes",
    description: "Guiones de intervención y preguntas clave para andamiaje y profundización en el desarrollo de la clase.",
    gradient: "from-slate-500/10 to-zinc-500/10"
  },
  {
    icon: Users,
    title: "Apoyo Adicional",
    description: "Estrategias DUA y ajustes razonables para estudiantes con necesidades específicas de apoyo.",
    gradient: "from-rose-500/10 to-pink-500/10"
  },
  {
    icon: Globe,
    title: "Situaciones de Aprendizaje",
    description: "Genera narrativas pedagógicas realistas y motivadoras vinculadas al contexto y competencias.",
    gradient: "from-cyan-500/10 to-teal-500/10"
  },
  {
    icon: TrendingUp,
    title: "Evaluación Continua",
    description: "Registro fácil de evidencias y seguimiento detallado de indicadores de logro.",
    gradient: "from-green-500/10 to-emerald-500/10"
  },
  {
    icon: Printer,
    title: "Impresión Un-Clic",
    description: "Genera documentos con formato institucional listos para entregar a tu centro.",
    gradient: "from-stone-500/10 to-zinc-500/10"
  }
];

const NAV_ITEMS = [
  { href: "#features", label: "Módulos" },
  { href: "#planes", label: "Planes" },
  { href: "#faq", label: "Preguntas" },
];

// --- Dashboard Mockup ---
function DashboardMockup() {
  const [activeTab, setActiveTab] = useState<'plan' | 'exam' | 'assist'>('plan');

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl shadow-[#02327e]/10 dark:shadow-black/30 overflow-hidden text-left font-sans select-none">
      {/* Top Window bar */}
      <div className="bg-zinc-50 dark:bg-zinc-950 px-5 py-3.5 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold bg-zinc-100 dark:bg-zinc-800 px-4 py-1 rounded-md">
          app.planix.do
        </div>
        <div className="w-14" />
      </div>

      {/* Main Mockup Area */}
      <div className="flex min-h-[340px]">
        {/* Sidebar */}
        <div className="w-[70px] sm:w-[150px] bg-zinc-50/80 dark:bg-zinc-950/50 p-3 flex flex-col gap-1.5 border-r border-zinc-100 dark:border-zinc-800">
          <div className="h-5 w-16 bg-zinc-200/50 dark:bg-zinc-800 rounded mb-4 hidden sm:block" />
          <button
            className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${activeTab === 'plan' ? 'bg-[#02327e] text-white shadow-md shadow-[#02327e]/20' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            onClick={() => setActiveTab('plan')}
          >
            <BookOpen size={14} />
            <span className="hidden sm:inline">Planificación</span>
          </button>
          <button
            className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${activeTab === 'exam' ? 'bg-[#02327e] text-white shadow-md shadow-[#02327e]/20' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            onClick={() => setActiveTab('exam')}
          >
            <Award size={14} />
            <span className="hidden sm:inline">Exámenes</span>
          </button>
          <button
            className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${activeTab === 'assist' ? 'bg-[#02327e] text-white shadow-md shadow-[#02327e]/20' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            onClick={() => setActiveTab('assist')}
          >
            <MessageSquare size={14} />
            <span className="hidden sm:inline">Comunidad</span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 p-5 bg-white dark:bg-zinc-900 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'plan' && (
              <motion.div key="plan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-[#02327e]/10 text-[#02327e] dark:text-blue-300 px-3 py-1 rounded-full uppercase tracking-wider">Generador Inteligente</span>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/50 dark:border-emerald-800/30">MINERD 2026</span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Planificación de Unidad — Lengua Española</h4>
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Tema: La Receta (4to Primaria)</span>
                    <span className="text-[#02b36d] font-semibold">Alineado ✓</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                    "Generar actividades DUA enfocadas en la elaboración de platos típicos dominicanos, evaluando competencias específicas de comprensión oral y producción escrita."
                  </p>
                </div>
                <button className="w-full py-2.5 bg-gradient-to-r from-[#02327e] to-[#02327e]/90 hover:from-[#02327e]/95 hover:to-[#02327e] text-white text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#02327e]/20 transition-all cursor-pointer active:scale-[0.98]">
                  <Sparkles size={12} /> Generar Plan con IA
                </button>
              </motion.div>
            )}

            {activeTab === 'exam' && (
              <motion.div key="exam" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full uppercase tracking-wider">Evaluaciones</span>
                  <span className="text-[10px] bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full font-semibold border border-purple-200/50 dark:border-purple-800/30">Listo para Imprimir</span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Generar Examen con IA</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center text-xs">
                    <span className="block font-semibold text-zinc-800 dark:text-zinc-200">10 Preguntas</span>
                    <span className="text-[9px] text-zinc-400">Opción Múltiple</span>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center text-xs">
                    <span className="block font-semibold text-zinc-800 dark:text-zinc-200">Hoja de Respuestas</span>
                    <span className="text-[9px] text-zinc-400">Para el docente</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
                  <div className="flex gap-1.5"><span className="text-[#02327e] dark:text-blue-400 font-bold">1.</span> ¿Cuál es la función principal de un título en una receta?</div>
                  <div className="flex gap-1.5"><span className="text-[#02327e] dark:text-blue-400 font-bold">2.</span> Identifica los verbos en modo imperativo en el texto...</div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assist' && (
              <motion.div key="assist" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full uppercase tracking-wider">Comunidad Docente</span>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#02327e] to-[#02b36d] flex items-center justify-center text-[10px] font-bold text-white">MP</div>
                    <div>
                      <h5 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-none">Mtra. María Pérez</h5>
                      <span className="text-[9px] text-zinc-400">Distrito 15-02</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    ¿Alguien tiene recursos DUA para trabajar fracciones en 5to grado? ¡Los compartidos por el MINERD están un poco pesados!
                  </p>
                  <div className="flex items-center gap-4 text-[10px] text-zinc-400 pt-1">
                    <span className="flex items-center gap-1 hover:text-[#02327e] cursor-pointer transition-colors"><ThumbsUp size={10} /> 14</span>
                    <span className="flex items-center gap-1 hover:text-[#02327e] cursor-pointer transition-colors"><MessageSquare size={10} /> 5 comentarios</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Main Landing Page ---
export default function LandingPage() {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const user = getCurrentUser();
  const navigate = useNavigate();

  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["potenciada", "inteligente", "dinámica", "organizada", "eficiente"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuickRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      navigate(`/registro?email=${encodeURIComponent(emailInput.trim())}`);
    } else {
      navigate('/registro');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 overflow-x-hidden relative">

      {/* ══════════════════════════════════════════════════════════════════
          STICKY NAVBAR — Glassmorphism
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <header className={`flex items-center justify-between rounded-2xl px-5 py-2 transition-all duration-300 ${
            scrolled
              ? 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-lg shadow-zinc-900/5 dark:shadow-black/20 border border-zinc-200/60 dark:border-zinc-800/60'
              : 'bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/30 dark:border-zinc-800/30'
          }`}>
            <div className="flex items-center gap-3">
              <PlatformLogo className="h-14 md:h-16" />
            </div>

            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="hover:text-[#02327e] dark:hover:text-blue-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#02327e] after:transition-all after:duration-300"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <Link to="/login">
                <button className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-[#02327e] dark:hover:text-blue-400 transition-colors cursor-pointer">
                  Iniciar Sesión
                </button>
              </Link>
              <Link to="/registro">
                <button className="px-5 py-2.5 bg-gradient-to-r from-[#02327e] to-[#02327e]/90 hover:from-[#02327e]/95 hover:to-[#02327e] text-white font-semibold text-sm rounded-xl shadow-md shadow-[#02327e]/20 hover:shadow-lg hover:shadow-[#02327e]/25 active:scale-[0.97] transition-all cursor-pointer">
                  Comenzar Gratis
                </button>
              </Link>
              <button onClick={() => setMobileOpen(true)} className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 lg:hidden cursor-pointer transition-colors">
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </header>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE MENU
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-full sm:max-w-md bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center pb-6 border-b border-zinc-100 dark:border-zinc-800">
                  <PlatformLogo className="h-14" />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-2.5 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-8">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Navegación</div>
                  <nav className="space-y-2">
                    {NAV_ITEMS.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 font-semibold text-sm hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 transition-all"
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-6 mt-6">
                <Link to="/registro" onClick={() => setMobileOpen(false)} className="block w-full">
                  <button className="w-full bg-gradient-to-r from-[#02327e] to-[#02327e]/90 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#02327e]/20 transition-all cursor-pointer">
                    <Sparkles className="h-4 w-4" /> Registrarse Gratis
                  </button>
                </Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full">
                  <button className="w-full border border-zinc-200 dark:border-zinc-700 py-3.5 rounded-xl font-semibold text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                    <Lock className="h-4 w-4" /> Iniciar Sesión
                  </button>
                </Link>
                <p className="text-[11px] text-center text-zinc-400 font-medium mt-2">
                  Sin tarjeta de crédito • Comienza gratis hoy
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28 px-6">
        {/* Gradient Background Blobs */}
        <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-[#02327e]/8 dark:bg-[#02327e]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-[#02b36d]/8 dark:bg-[#02b36d]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Column */}
            <div className="lg:col-span-6 flex flex-col items-start text-left gap-5 z-20">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#02b36d]/10 dark:bg-[#02b36d]/15 rounded-full text-[#02b36d] font-semibold text-xs tracking-wide border border-[#02b36d]/20">
                <MapPin className="w-3.5 h-3.5" />
                República Dominicana
              </div>

              {/* Headline */}
              <div className="w-full">
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4.25rem] font-extrabold tracking-tight leading-[1.08]">
                  <span className="text-zinc-900 dark:text-white">Tu enseñanza,</span>
                  <br />
                  <span className="relative flex justify-start text-left h-[50px] sm:h-[60px] lg:h-[70px] w-full">
                    {titles.map((title, index) => (
                      <motion.span
                        key={index}
                        className="absolute bg-gradient-to-r from-[#02327e] to-[#02b36d] bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: "-100%" }}
                        transition={{ type: "spring", stiffness: 50 }}
                        animate={
                          titleNumber === index
                            ? { y: 0, opacity: 1 }
                            : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                        }
                      >
                        {title}.
                      </motion.span>
                    ))}
                  </span>
                </h1>
              </div>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                El ecosistema integral que acompaña al docente dominicano: desde planeación inteligente con IA hasta recursos creativos y gestión dinámica de tu aula.
              </p>

              {/* Email Signup Form */}
              <form onSubmit={handleQuickRegister} className="w-full max-w-lg mt-1">
                <div className="flex flex-col sm:flex-row items-stretch bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl sm:rounded-full p-1.5 shadow-sm focus-within:shadow-md focus-within:border-[#02327e]/30 transition-all">
                  <div className="flex items-center flex-1 px-4 py-3 sm:py-0">
                    <Mail className="text-zinc-400 mr-2.5 h-4.5 w-4.5 shrink-0" />
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 font-medium text-sm w-full focus:ring-0"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#02327e] to-[#02327e]/90 hover:from-[#02327e]/95 hover:to-[#02327e] text-white font-semibold px-6 py-3 rounded-xl sm:rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#02327e]/15 active:scale-[0.97] cursor-pointer text-sm shrink-0"
                  >
                    Registrarse Gratis <ArrowRight size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </form>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-zinc-500 font-medium">
                <span className="flex items-center gap-1.5"><Check size={14} className="text-[#02b36d]" /> No requiere tarjeta</span>
                <span className="flex items-center gap-1.5"><Check size={14} className="text-[#02b36d]" /> Adecuación Curricular MINERD</span>
                <span className="flex items-center gap-1.5"><Check size={14} className="text-[#02b36d]" /> DUA Integrado</span>
              </div>
            </div>

            {/* Right Column: Dashboard Mockup */}
            <div className="lg:col-span-6 relative w-full flex items-center justify-center pt-8 lg:pt-0">

              {/* Floating Cards */}
              <motion.div
                className="hidden xl:block absolute left-[-30px] top-[15px] z-20 max-w-[190px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3.5 rounded-xl shadow-lg shadow-zinc-900/5 dark:shadow-black/20 text-left -rotate-3 select-none"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Plan Diario</span>
                  <span className="text-[9px] bg-[#02327e]/10 text-[#02327e] dark:text-blue-300 px-1.5 py-0.5 rounded-md font-semibold ml-auto">MINERD</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">Lengua Española</h4>
                <p className="text-[10px] font-medium text-zinc-500 mt-1">1er Grado Primaria ✓</p>
              </motion.div>

              <motion.div
                className="hidden xl:block absolute right-[-15px] top-[30px] z-20 max-w-[210px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3.5 rounded-xl shadow-lg shadow-zinc-900/5 dark:shadow-black/20 text-left rotate-3 select-none"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-[#02b36d] animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Examen por IA</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">Sociales 4to de Primaria</h4>
                <span className="text-[9px] font-medium text-zinc-500 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-2 py-0.5 rounded-md mt-1.5 inline-flex items-center gap-1">
                  <Printer size={10} /> 10 Preguntas listas
                </span>
              </motion.div>

              <motion.div
                className="hidden xl:block absolute left-[-50px] bottom-[30px] z-20 max-w-[185px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3.5 rounded-xl shadow-lg shadow-zinc-900/5 dark:shadow-black/20 text-left rotate-2 select-none"
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              >
                <div className="text-[9px] font-bold text-[#02b36d] uppercase tracking-widest mb-1">Estrategias DUA</div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-normal">
                  "Ajustes razonables para apoyo."
                </p>
              </motion.div>

              <motion.div
                className="hidden xl:block absolute right-[-30px] bottom-[-15px] z-20 max-w-[185px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3.5 rounded-xl shadow-lg shadow-zinc-900/5 dark:shadow-black/20 text-left -rotate-2 select-none"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Award size={12} className="text-[#02327e]" />
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Adecuación 2026</span>
                </div>
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Competencias</h5>
                <p className="text-[10px] font-medium text-zinc-500">Vinculadas al Indicador ✓</p>
              </motion.div>

              {/* Main Mockup */}
              <div className="w-full max-w-[540px] relative z-10">
                <DashboardMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          STEPS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-zinc-50/80 dark:bg-zinc-900/30 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              Planifica en tres sencillos pasos
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto">
              Diseñado especialmente para el flujo de trabajo de los maestros en escuelas dominicanas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { num: "1", title: "Selecciona Asignatura", desc: "Indica tu nivel (Primario/Secundario) y asignatura del currículo dominicano oficial.", gradient: "from-[#02327e]/5 to-[#02327e]/10", iconColor: "text-[#02327e]" },
              { num: "2", title: "Genera con IA", desc: "Nuestra IA alineada a la Adecuación Curricular de República Dominicana sugiere planes y secuencias al instante.", gradient: "from-purple-500/5 to-indigo-500/10", iconColor: "text-purple-600" },
              { num: "3", title: "Listo para Imprimir", desc: "Obtén tu documento con formato institucional en un solo clic, listo para entregar a tu centro.", gradient: "from-[#02b36d]/5 to-[#02b36d]/10", iconColor: "text-[#02b36d]" },
            ].map((step) => (
              <div key={step.num} className={`bg-gradient-to-br ${step.gradient} p-8 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/10 transition-all duration-300 flex flex-col justify-between min-h-[200px]`}>
                <div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 ${step.iconColor} mb-5 shadow-sm font-extrabold text-sm border border-zinc-200/50 dark:border-zinc-800`}>
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
                {step.num === "3" && (
                  <Link to="/registro" className="mt-5 inline-block">
                    <button className="bg-[#02b36d] hover:bg-[#029a5e] text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-[#02b36d]/20 active:scale-[0.97] transition-all cursor-pointer">
                      Comenzar Ya
                    </button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          INTERACTIVE DR MAP
      ═══════════════════════════════════════════════════════════════════ */}
      <DRMap />

      {/* ══════════════════════════════════════════════════════════════════
          PROBLEMS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white dark:bg-zinc-950 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              Sabemos lo que enfrentas cada día
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-3xl mx-auto">
              Entre clases, evaluaciones y requisitos administrativos del MINERD, el tiempo nunca parece alcanzar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Clock, title: "Falta de Tiempo", description: "La planificación educativa consume horas de tu fin de semana que podrías dedicar a descansar.", color: "from-red-500/10 to-rose-500/5", iconBg: "bg-red-50 dark:bg-red-950/30 text-red-500" },
              { icon: Files, title: "Papeleo del MINERD", description: "Excesivos formatos curriculares y requisitos burocráticos que consumen tu energía creativa.", color: "from-amber-500/10 to-orange-500/5", iconBg: "bg-amber-50 dark:bg-amber-950/30 text-amber-500" },
              { icon: ShieldAlert, title: "Alineación Curricular", description: "Dudas constantes sobre si estás cumpliendo exactamente con las últimas adecuaciones vigentes.", color: "from-violet-500/10 to-purple-500/5", iconBg: "bg-violet-50 dark:bg-violet-950/30 text-violet-500" },
              { icon: FolderX, title: "Desorganización", description: "Documentos de planificación dispersos en cuadernos, archivos de Word y carpetas difíciles de buscar.", color: "from-emerald-500/10 to-green-500/5", iconBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500" },
              { icon: Frown, title: "Estrés y Agotamiento", description: "La presión por cumplir con toda la carga burocrática reduce tu motivación para la enseñanza.", color: "from-blue-500/10 to-sky-500/5", iconBg: "bg-blue-50 dark:bg-blue-950/30 text-blue-500" },
              { icon: TrendingUp, title: "Seguimiento Manual", description: "Llevar el control de indicadores de logro estudiante por estudiante en registros físicos es lento.", color: "from-pink-500/10 to-rose-500/5", iconBg: "bg-pink-50 dark:bg-pink-950/30 text-pink-500" }
            ].map((pain, index) => (
              <div key={index} className={`bg-gradient-to-br ${pain.color} p-7 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start gap-4`}>
                <div className={`p-3 rounded-xl ${pain.iconBg}`}>
                  <pain.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{pain.title}</h3>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">{pain.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          ECOSYSTEM / VALUE PROP SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-zinc-50/80 dark:bg-zinc-900/20 relative">
        {/* Background decorations */}
        <div className="absolute top-20 left-[5%] w-[350px] h-[350px] bg-[#02327e]/5 dark:bg-[#02327e]/3 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 right-[5%] w-[350px] h-[350px] bg-[#02b36d]/5 dark:bg-[#02b36d]/3 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: Mockup */}
            <div className="lg:col-span-6 relative">
              <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xl shadow-zinc-900/5 dark:shadow-black/20 select-none">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
                  <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                    <Layout className="w-5 h-5 text-[#02327e]" />
                    <span className="font-bold text-xs uppercase tracking-wider">Lienzo Curricular</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-[#02b36d]/10 text-[#02b36d] px-3 py-1 rounded-full border border-[#02b36d]/20">
                    Alineado 100%
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="text-[10px] font-semibold bg-[#02327e]/10 text-[#02327e] dark:text-blue-300 px-2.5 py-1 rounded-md">Primaria</span>
                  <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-md">4to Grado</span>
                  <span className="text-[10px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-md">Lengua Española</span>
                </div>
                <div className="space-y-3.5">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Target className="w-4 h-4 text-rose-400" />
                      <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Competencia Específica</h5>
                    </div>
                    <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-normal">
                      Comprensión oral: Comprende la información de recetas sencillas que escucha para la preparación de platos dominicanos.
                    </p>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#02b36d]" />
                      <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Indicador de Logro</h5>
                    </div>
                    <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-normal">
                      Distingue la estructura y función de la receta (título, ingredientes y preparación) como una guía estructurada.
                    </p>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-[#02327e]" />
                      <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Actividades DUA Sugeridas</h5>
                    </div>
                    <div className="space-y-1.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                      <div className="flex gap-1.5"><span className="text-[#02b36d] font-bold">1.</span> Glosario visual de utensilios.</div>
                      <div className="flex gap-1.5"><span className="text-[#02b36d] font-bold">2.</span> Simulación interactiva de cocina en grupos.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Copy */}
            <div className="lg:col-span-6 text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#02327e]/10 dark:bg-[#02327e]/15 rounded-full text-[#02327e] dark:text-blue-300 font-semibold text-xs tracking-wide border border-[#02327e]/15">
                Ecosistema Inteligente
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
                Tu aliado número uno en planificación.
              </h2>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <span className="bg-gradient-to-r from-[#02327e] to-[#02b36d] bg-clip-text text-transparent font-bold">PLANIX</span> es la plataforma integral diseñada para acompañar a los docentes dominicanos en la organización y alineación curricular oficial.
              </p>
              <div className="space-y-4 pt-2">
                {[
                  { title: "Alineación Curricular Oficial", desc: "Competencias e indicadores integrados directamente de la adecuación del MINERD." },
                  { title: "Metodología Inclusiva DUA", desc: "Ajustes razonables y estrategias diversificadas para atender a cada estudiante." },
                  { title: "Impresión en un clic", desc: "Exporta tus borradores con el formato oficial listo para presentar a tu centro." }
                ].map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#02b36d]/15 text-[#02b36d]">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link to="/registro" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#02327e] to-[#02327e]/90 text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#02327e]/20 hover:shadow-xl hover:shadow-[#02327e]/25 active:scale-[0.97] transition-all cursor-pointer">
                  Planificar Gratis <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          BENEFITS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white dark:bg-zinc-950 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              ¿Qué ganas con <span className="bg-gradient-to-r from-[#02327e] to-[#02b36d] bg-clip-text text-transparent">PLANIX</span>?
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-3xl mx-auto">
              Diseñada para transformar tu experiencia docente y devolverte el control de tu tiempo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: "Ahorra Tiempo Real", description: "Reduce el trabajo administrativo drásticamente. Planifica en minutos lo que antes tomaba días.", iconBg: "bg-amber-50 dark:bg-amber-950/30 text-amber-500" },
              { icon: FolderOpen, title: "Todo en un solo Lugar", description: "Tus recursos, planificaciones, exámenes y expedientes seguros y accesibles en la nube.", iconBg: "bg-blue-50 dark:bg-blue-950/30 text-blue-500" },
              { icon: CheckCircle2, title: "Alineación Curricular", description: "Confianza total al estar 100% alineado a los estándares curriculares vigentes del MINERD.", iconBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500" },
              { icon: Heart, title: "Paz y Tranquilidad", description: "Estructuras pedagógicas completas que te dan seguridad ante cualquier supervisión escolar.", iconBg: "bg-rose-50 dark:bg-rose-950/30 text-rose-500" },
              { icon: Target, title: "Calidad Didáctica", description: "Mejora el aprendizaje en el aula con actividades creativas, lúdicas y adaptadas (DUA).", iconBg: "bg-violet-50 dark:bg-violet-950/30 text-violet-500" },
              { icon: TrendingUp, title: "Potencialización Docente", description: "Utiliza la inteligencia artificial como un asistente pedagógico de primer nivel.", iconBg: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500" }
            ].map((benefit, index) => (
              <div key={index} className="bg-white dark:bg-zinc-900 p-7 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start gap-4">
                <div className={`p-3 rounded-xl ${benefit.iconBg}`}>
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{benefit.title}</h3>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FEATURES / TOOLS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-6 bg-zinc-50/80 dark:bg-zinc-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#02327e]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#02b36d]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#02327e]/10 dark:bg-[#02327e]/15 rounded-full text-[#02327e] dark:text-blue-300 font-semibold text-xs border border-[#02327e]/15">
              <Sparkles size={12} /> Recursos de primer nivel
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Herramientas diseñadas <span className="bg-gradient-to-r from-[#02327e] to-[#02b36d] bg-clip-text text-transparent">para ti</span>
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto mt-4">
              Todo lo que necesitas para transformar tu práctica docente en un ecosistema inteligente y sencillo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(showAllFeatures ? ALL_FEATURES : ALL_FEATURES.slice(0, 6)).map((feature, index) => (
              <div
                key={index}
                className={`group bg-white dark:bg-zinc-900 p-7 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start gap-4`}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-zinc-200/30 dark:border-zinc-800/30`}>
                  <feature.icon className="w-7 h-7 text-zinc-700 dark:text-zinc-300" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 font-medium text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {!showAllFeatures && (
            <div className="mt-14 text-center">
              <button
                onClick={() => setShowAllFeatures(true)}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                Ver todas las herramientas
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          PRICING SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="planes" className="py-24 px-6 bg-white dark:bg-zinc-950 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              Planes simples para cada docente
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto">
              Elige el nivel de acompañamiento que necesitas. Cancela o cambia cuando quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
              <div>
                <span className="inline-block bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md mb-4">
                  Acceso Básico
                </span>
                <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">Plan Básico</h3>
                <p className="text-sm font-medium text-zinc-500 mb-6">Prueba la plataforma sin compromisos</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">RD$ 0</span>
                  <span className="text-sm font-medium text-zinc-500">/ gratis siempre</span>
                </div>
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-5" />
                <ul className="space-y-3.5 font-medium text-sm text-zinc-700 dark:text-zinc-300">
                  {[
                    { text: "Hasta 3 planificaciones mensuales", included: true },
                    { text: "Alineación curricular oficial básica", included: true },
                    { text: "Generador de Exámenes con IA", included: false },
                    { text: "Descargas PDF institucionales ilimitadas", included: false }
                  ].map((item, i) => (
                    <li key={i} className={`flex items-center gap-2.5 ${!item.included ? 'text-zinc-400 dark:text-zinc-600' : ''}`}>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${item.included ? 'bg-[#02b36d]/15 text-[#02b36d]' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600'}`}>
                        {item.included ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                      </div>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/registro" className="mt-8 block">
                <button className="w-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer">
                  Comenzar Gratis
                </button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-gradient-to-br from-[#02327e]/[0.03] to-[#02b36d]/[0.03] border-2 border-[#02327e]/30 dark:border-[#02327e]/50 p-8 rounded-2xl shadow-lg shadow-[#02327e]/5 dark:shadow-[#02327e]/10 flex flex-col justify-between h-full">
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-[#02327e] to-[#02b36d] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                ⭐ Favorito
              </div>
              <div>
                <span className="inline-block bg-[#02b36d]/15 text-[#02b36d] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md mb-4">
                  Acceso Total
                </span>
                <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">Plan Pro</h3>
                <p className="text-sm font-medium text-zinc-500 mb-6">Planificaciones e IA sin límites</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">RD$ 490</span>
                  <span className="text-sm font-medium text-zinc-500">/ mes</span>
                </div>
                <div className="h-px bg-zinc-200/50 dark:bg-zinc-800 my-5" />
                <ul className="space-y-3.5 font-medium text-sm text-zinc-700 dark:text-zinc-300">
                  {[
                    "Planificaciones IA ilimitadas",
                    "Alineación curricular avanzada MINERD",
                    "Generador de Exámenes ilimitado",
                    "Descargas instantáneas en PDF y Word",
                    "Soporte prioritario 24/7 vía WhatsApp"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#02b36d]/15 text-[#02b36d]">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/registro" className="mt-8 block">
                <button className="w-full bg-gradient-to-r from-[#02327e] to-[#02327e]/90 hover:from-[#02327e]/95 hover:to-[#02327e] text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-[#02327e]/20 active:scale-[0.98] transition-all cursor-pointer">
                  Obtener Plan Pro
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Testimonials */}
      <TestimonialsMasonry />

      {/* Social Community */}
      <SocialCommunity />

      {/* ══════════════════════════════════════════════════════════════════
          FINAL CTA SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/30 dark:to-zinc-950 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#02327e]/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-7">
          <h2 className="text-3xl md:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
            Transforma tu planificación<br />
            <span className="bg-gradient-to-r from-[#02327e] to-[#02b36d] bg-clip-text text-transparent">hoy mismo.</span>
          </h2>
          <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Únete a miles de docentes de la República Dominicana que ya están ahorrando tiempo administrativo con la IA de Planix.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              to={user ? "/dashboard" : "/registro"}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#02327e] to-[#02327e]/90 text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#02327e]/20 hover:shadow-xl hover:shadow-[#02327e]/25 active:scale-[0.97] transition-all text-center"
            >
              Comenzar Gratis
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all text-center"
            >
              Iniciar Sesión
            </Link>
          </div>

          <p className="text-sm text-zinc-400 font-medium pt-2">
            Sin tarjeta de crédito. Resultados inmediatos en segundos.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
