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
  Play,
  Shield,
  ShieldCheck,
  ClipboardCheck,
  Cloud,
  GraduationCap,
  Sliders,
  Laptop,
  BarChart3,
  LogIn
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
  { href: "#que-es", label: "¿Qué es?" },
  { href: "#features", label: "Herramientas" },
  { href: "#registro-digital", label: "Registro Digital" },
  { href: "#mapa", label: "Mapa Curricular" },
  { href: "#comunidad", label: "Comunidad" },
];



const getFeatureIconClass = (gradient: string) => {
  if (gradient.includes("blue") || gradient.includes("indigo")) return "fill-blue-500/10 text-blue-600 dark:text-blue-400";
  if (gradient.includes("purple") || gradient.includes("violet")) return "fill-purple-500/10 text-purple-600 dark:text-purple-400";
  if (gradient.includes("cyan") || gradient.includes("sky")) return "fill-cyan-500/10 text-cyan-600 dark:text-cyan-400";
  if (gradient.includes("emerald") || gradient.includes("teal") || gradient.includes("green") || gradient.includes("lime")) return "fill-emerald-500/10 text-[#02b36d] dark:text-emerald-450";
  if (gradient.includes("orange") || gradient.includes("amber") || gradient.includes("yellow")) return "fill-amber-500/10 text-amber-600 dark:text-amber-400";
  if (gradient.includes("pink") || gradient.includes("rose") || gradient.includes("red")) return "fill-rose-500/10 text-rose-600 dark:text-rose-400";
  return "fill-zinc-500/10 text-zinc-600 dark:text-zinc-400";
};

// --- Main Landing Page ---
export default function LandingPage() {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const user = getCurrentUser();
  const navigate = useNavigate();



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
    <div className="min-h-screen bg-bg-base font-sans text-zinc-900 dark:text-zinc-100 relative">

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
            <Link to="/" className="flex items-center gap-3 shrink-0 cursor-pointer">
              <PlatformLogo className="h-16 md:h-16" />
            </Link>

            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-zinc-650 dark:text-zinc-300">
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
              <div className="hidden lg:flex items-center gap-2.5">
                <Link to="/login">
                  <button className="px-4 py-2 bg-[#02b36d] hover:bg-[#029a5e] text-white font-semibold text-sm rounded-xl transition-all cursor-pointer active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-none">
                    <LogIn size={14} /> Iniciar Sesión
                  </button>
                </Link>
                <Link to="/registro">
                  <button className="px-4 py-2 bg-[#02327e] hover:bg-[#012563] text-white font-semibold text-sm rounded-xl transition-all cursor-pointer active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-none">
                    Comenzar Gratis <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
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
                  <Link to="/" onClick={() => setMobileOpen(false)} className="cursor-pointer">
                    <PlatformLogo className="h-14" />
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full bg-red-500 hover:bg-red-605 p-2 text-white transition cursor-pointer flex items-center justify-center shadow-md shadow-red-500/10 border-0"
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
      <section className="relative overflow-hidden pt-28 pb-4 lg:pt-36 lg:pb-4 px-6 bg-bg-base">
        {/* Soft Decorative background circle */}
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column */}
            <div className="lg:col-span-6 flex flex-col items-start text-left gap-6 z-20">

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3rem] xl:text-[3.6rem] font-extrabold tracking-tight leading-[1.12] text-zinc-900 dark:text-white">
                La plataforma integral <br />
                que potencia la labor <br />
                <span className="text-[#02b36d]">docente</span> cada día.
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl font-medium">
                Planifica, organiza, evalúa y dinamiza tus clases desde un solo lugar, de forma fácil y eficiente.
              </p>

              {/* Mobile CTA Buttons */}
              <div className="flex flex-row gap-3 w-full mt-2 lg:hidden">
                <Link to="/registro" className="flex-1">
                  <button className="w-full py-3.5 px-4 bg-[#02327e] hover:bg-[#012563] text-white font-bold text-sm rounded-xl transition-all cursor-pointer active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-md shadow-[#02327e]/10">
                    Comenzar Gratis <ArrowRight size={14} />
                  </button>
                </Link>
                <Link to="/login" className="flex-1">
                  <button className="w-full py-3.5 px-4 bg-[#02b36d] hover:bg-[#029a5e] text-white font-bold text-sm rounded-xl transition-all cursor-pointer active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-none">
                    <LogIn size={14} /> Iniciar Sesión
                  </button>
                </Link>
              </div>

              {/* 4 circular characteristic badges */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full pt-2">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Brain size={28} className="fill-indigo-500/20" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-extrabold text-zinc-800 dark:text-zinc-200 leading-tight mt-1">
                    Planificaciones<br />Inteligentes
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <School size={28} className="fill-emerald-500/20" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-extrabold text-zinc-800 dark:text-zinc-200 leading-tight mt-1">
                    Aula Virtual<br />Completa
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-650 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Smile size={28} className="fill-amber-500/20" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-extrabold text-zinc-800 dark:text-zinc-200 leading-tight mt-1">
                    Dinámicas<br />para el Aula
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-650 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileText size={28} className="fill-purple-500/20" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-extrabold text-zinc-800 dark:text-zinc-200 leading-tight mt-1">
                    Todo en un<br />solo lugar
                  </span>
                </div>
              </div>

              {/* Security badge (Clean inline style) */}
              <div className="inline-flex items-center gap-3 mt-6 text-zinc-700 dark:text-zinc-300">
                <div className="w-9 h-9 bg-blue-500/10 text-blue-650 dark:text-blue-450 rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="fill-blue-500/20" />
                </div>
                <span className="text-xs sm:text-sm font-bold">
                  Seguro, confiable y pensado para docentes como tú.
                </span>
              </div>
            </div>

            {/* Right Column: Laptop Mockup */}
            <div className="lg:col-span-6 relative w-full flex items-center justify-center pt-8 lg:pt-0">
              {/* ── Rich decorative elements around the laptop ── */}

              {/* Large soft gradient glow behind */}
              <div className="absolute w-[90%] h-[90%] rounded-full bg-gradient-to-tr from-[#02327e]/8 via-purple-400/5 to-[#02b36d]/8 blur-3xl pointer-events-none -z-10" />

              {/* Dotted grid pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:18px_18px] opacity-50 pointer-events-none -z-10 rounded-3xl" />

              {/* Top-right: decorative ring */}
              <div className="absolute -top-6 -right-4 w-16 h-16 rounded-full border-2 border-dashed border-[#02327e]/20 pointer-events-none z-0" />
              <div className="absolute -top-3 -right-1 w-10 h-10 rounded-full border border-[#02b36d]/15 pointer-events-none z-0" />

              {/* Top-left: small colored circles cluster */}
              <div className="absolute top-4 -left-6 w-3 h-3 rounded-full bg-[#02327e]/25 pointer-events-none z-0" />
              <div className="absolute top-10 -left-3 w-2 h-2 rounded-full bg-[#02b36d]/30 pointer-events-none z-0" />
              <div className="absolute top-1 -left-2 w-1.5 h-1.5 rounded-full bg-amber-400/40 pointer-events-none z-0" />

              {/* Top-right: scattered micro dots */}
              <div className="absolute top-8 -right-8 w-2.5 h-2.5 rounded-full bg-purple-400/25 pointer-events-none z-0" />
              <div className="absolute top-16 -right-5 w-1.5 h-1.5 rounded-full bg-[#02327e]/20 pointer-events-none z-0" />

              {/* Left side: decorative plus/cross marks */}
              <svg className="absolute top-[30%] -left-10 w-5 h-5 text-[#02327e]/20 pointer-events-none z-0" viewBox="0 0 20 20" fill="none">
                <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <svg className="absolute top-[55%] -left-6 w-3.5 h-3.5 text-[#02b36d]/20 pointer-events-none z-0" viewBox="0 0 20 20" fill="none">
                <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>

              {/* Right side: decorative diamond and square */}
              <div className="absolute top-[40%] -right-7 w-3 h-3 rotate-45 border border-[#02327e]/20 pointer-events-none z-0" />
              <div className="absolute top-[60%] -right-4 w-2 h-2 rounded-sm bg-amber-400/20 pointer-events-none z-0" />

              {/* Bottom-left: arc and dots */}
              <svg className="absolute bottom-6 -left-8 w-14 h-14 text-[#02327e]/15 pointer-events-none z-0" viewBox="0 0 56 56" fill="none">
                <path d="M 8,48 Q 8,8 48,8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,4" strokeLinecap="round" />
              </svg>
              <div className="absolute bottom-4 -left-3 w-2 h-2 rounded-full bg-rose-400/25 pointer-events-none z-0" />
              <div className="absolute bottom-10 -left-5 w-1.5 h-1.5 rounded-full bg-[#02b36d]/30 pointer-events-none z-0" />

              {/* Bottom-right: zigzag line + circles */}
              <svg className="absolute -bottom-4 -right-6 w-16 h-10 text-[#02b36d]/15 pointer-events-none z-0" viewBox="0 0 64 40" fill="none">
                <polyline points="4,36 16,8 28,28 40,4 52,24 60,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="absolute -bottom-2 -right-2 w-3 h-3 rounded-full border border-purple-400/25 pointer-events-none z-0" />
              <div className="absolute -bottom-6 right-6 w-2 h-2 rounded-full bg-[#02327e]/20 pointer-events-none z-0" />

              {/* Bottom center: decorative horizontal dashed line */}
              <svg className="absolute -bottom-8 left-[15%] w-[70%] h-3 text-zinc-300/40 dark:text-zinc-700/40 pointer-events-none z-0" viewBox="0 0 300 12" fill="none">
                <line x1="0" y1="6" x2="300" y2="6" stroke="currentColor" strokeWidth="1" strokeDasharray="6,6" />
              </svg>

              {/* Top center: small triangle */}
              <svg className="absolute -top-4 left-[40%] w-4 h-4 text-amber-400/25 pointer-events-none z-0" viewBox="0 0 16 16" fill="currentColor">
                <polygon points="8,2 14,14 2,14" />
              </svg>

              {/* Mid-left: small ring */}
              <div className="absolute top-[75%] -left-8 w-5 h-5 rounded-full border border-dashed border-rose-300/25 pointer-events-none z-0" />

              {/* Main Image Container */}
              <div className="w-full relative z-10 scale-[1.15] origin-center">
                <img 
                  src="/laptop.webp" 
                  alt="Planix Dashboard en Laptop" 
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    // Fallback to local rendering if image is missing
                    e.currentTarget.style.display = 'none';
                    const fallbackEl = document.getElementById('laptop-fallback');
                    if (fallbackEl) fallbackEl.style.display = 'block';
                  }}
                />
                
                {/* Fallback mockup in case they haven't uploaded the laptop.webp image yet */}
                <div id="laptop-fallback" className="hidden w-full max-w-[540px] mx-auto bg-zinc-800 p-2.5 rounded-3xl border border-zinc-700 shadow-2xl relative">
                  <div className="bg-white rounded-2xl overflow-hidden aspect-[1.6/1]">
                    <div className="bg-zinc-100 px-4 py-2 flex items-center gap-1.5 border-b border-zinc-200">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <div className="text-[10px] text-zinc-400 font-semibold bg-zinc-200 px-3 py-0.5 rounded-md ml-4">app.planix.do</div>
                    </div>
                    <div className="p-4 bg-[#f8fafc] h-full flex flex-col justify-center items-center text-center">
                      <PlatformLogo className="h-10 mb-2" />
                      <h4 className="text-sm font-bold text-zinc-700">El archivo de la laptop se cargará aquí</h4>
                      <p className="text-[10px] text-zinc-400 max-w-[300px]">Guarda tu imagen como <code>public/laptop.webp</code> para ver el diseño final.</p>
                    </div>
                  </div>
                  <div className="h-4 bg-zinc-700 w-1/4 mx-auto rounded-b-xl" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          WHAT IS PLANIX SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="que-es" className="pt-2 pb-6 px-6 bg-bg-base relative z-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden shadow-xl shadow-zinc-100/50 dark:shadow-none">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

            {/* Title */}
            <div className="text-center md:text-left mb-10 relative z-10">
              <h2 className="text-4xl md:text-6xl font-extrabold text-[#02327e] tracking-tight">
                ¿Qué es Planix?
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column: Text */}
              <div className="lg:col-span-7 space-y-8">
                {/* Main Paragraph with left border */}
                <div className="border-l-4 border-[#02b36d] pl-6 py-2">
                  <p className="text-2xl sm:text-3xl md:text-[32px] font-extrabold text-zinc-900 dark:text-white leading-[1.25] tracking-tight">
                    Es una plataforma diseñada para{' '}
                    <span className="text-[#02b36d]">acompañar a los docentes dominicanos</span>{' '}
                    en la organización y gestión escolar<span className="text-[#02b36d]">.</span>
                  </p>
                </div>

                {/* Subtext */}
                <p className="text-sm sm:text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">
                  Herramientas prácticas, intuitivas y alineadas al currículo dominicano para{' '}
                  <span className="text-[#02b36d]">facilitarte tu labor docente cada día.</span>
                </p>
              </div>

              {/* Right Column: Character */}
              <div className="lg:col-span-5 relative flex justify-center items-center pt-6 lg:pt-0">
                {/* Decorative floating vector elements around character */}
                <div className="absolute w-[95%] h-[95%] rounded-full bg-gradient-to-tr from-[#02327e]/5 to-[#02b36d]/5 blur-2xl pointer-events-none -z-10" />

                {/* Top-right: decorative dashed ring */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full border-2 border-dashed border-[#02327e]/15 pointer-events-none z-0" />
                
                {/* Top-left: small colored circles cluster */}
                <div className="absolute top-2 -left-4 w-2.5 h-2.5 rounded-full bg-[#02327e]/20 pointer-events-none z-0" />
                <div className="absolute top-7 -left-1 w-2 h-2 rounded-full bg-[#02b36d]/25 pointer-events-none z-0" />
                
                {/* Right side: decorative diamond and square */}
                <div className="absolute top-[40%] -right-5 w-2.5 h-2.5 rotate-45 border border-[#02327e]/20 pointer-events-none z-0" />
                <div className="absolute top-[65%] -right-2 w-1.5 h-1.5 rounded-sm bg-amber-400/20 pointer-events-none z-0" />

                {/* Left side: decorative plus/cross marks */}
                <svg className="absolute top-[35%] -left-8 w-4 h-4 text-[#02327e]/20 pointer-events-none z-0" viewBox="0 0 20 20" fill="none">
                  <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <svg className="absolute top-[60%] -left-4 w-3 h-3 text-[#02b36d]/20 pointer-events-none z-0" viewBox="0 0 20 20" fill="none">
                  <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>

                {/* Bottom-left: dashed arc */}
                <svg className="absolute -bottom-2 -left-6 w-10 h-10 text-[#02327e]/15 pointer-events-none z-0" viewBox="0 0 56 56" fill="none">
                  <path d="M 8,48 Q 8,8 48,8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,4" strokeLinecap="round" />
                </svg>

                {/* Bottom-right: zigzag line */}
                <svg className="absolute -bottom-4 -right-4 w-12 h-8 text-[#02b36d]/15 pointer-events-none z-0" viewBox="0 0 64 40" fill="none">
                  <polyline points="4,36 16,8 28,28 40,4 52,24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                {/* Character Image wrapper */}
                <div className="relative w-64 h-64 md:w-72 md:h-72 flex justify-center items-center z-10">
                  <img
                    src="/landing/Pensando.webp"
                    alt="Planix Personaje"
                    className="w-full h-full object-contain filter drop-shadow-xl hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.opacity = '0';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM BENEFITS BANNER
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="pt-4 pb-12 md:pt-4 md:pb-14 bg-bg-base relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 items-center">
            
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105">
                <Sparkles size={28} className="fill-indigo-500/20" />
              </div>
              <div className="text-left">
                <p className="text-sm md:text-base lg:text-[17px] font-black text-zinc-800 dark:text-white leading-tight">IA Pedagógica</p>
                <p className="text-[11px] md:text-xs lg:text-[13px] font-bold text-zinc-500 dark:text-zinc-400 leading-tight mt-1">Genera al instante</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105">
                <ShieldCheck size={28} className="fill-emerald-500/20" />
              </div>
              <div className="text-left">
                <p className="text-sm md:text-base lg:text-[17px] font-black text-zinc-800 dark:text-white leading-tight">100% Seguro</p>
                <p className="text-[11px] md:text-xs lg:text-[13px] font-bold text-zinc-500 dark:text-zinc-400 leading-tight mt-1">Datos protegidos</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105">
                <Zap size={28} className="fill-amber-500/20" />
              </div>
              <div className="text-left">
                <p className="text-sm md:text-base lg:text-[17px] font-black text-zinc-800 dark:text-white leading-tight">Ahorra Tiempo</p>
                <p className="text-[11px] md:text-xs lg:text-[13px] font-bold text-zinc-500 dark:text-zinc-400 leading-tight mt-1">Planifica en minutos</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start col-span-2 md:col-span-1">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105">
                <Heart size={28} className="fill-rose-500/20" />
              </div>
              <div className="text-left">
                <p className="text-sm md:text-base lg:text-[17px] font-black text-zinc-800 dark:text-white leading-tight">Para tus Estudiantes</p>
                <p className="text-[11px] md:text-xs lg:text-[13px] font-bold text-zinc-500 dark:text-zinc-400 leading-tight mt-1">Enfócate en lo que importa</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          AUTOMATED EDUCATION PLANNING SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-bg-base relative border-t border-black/5 dark:border-white/5 z-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 relative">
            <h2 className="text-3xl md:text-5xl font-black text-[#02327e] dark:text-white tracking-tight mb-4 font-display">
              Planificación Docente <span className="text-[#02b36d] relative inline-block">
                Automatizada
              </span>
            </h2>
            
            <p className="text-sm sm:text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-4xl mx-auto leading-relaxed">
              Permite a los docentes generar su planificación diaria y de unidad de forma rápida, vinculando automáticamente las <span className="text-[#02327e] dark:text-white font-bold">competencias fundamentales</span>, <span className="text-[#02327e] dark:text-white font-bold">específicas</span>, <span className="text-[#02327e] dark:text-white font-bold">indicadores de logro</span> y <span className="text-[#02327e] dark:text-white font-bold">contenidos</span> del currículo dominicano vigente.
            </p>
          </div>

          {/* Flow pillars */}
          <div className="relative">
            {/* Connecting dotted lines in desktop layout */}
            <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-[#02327e]/15 z-0" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
              
              {/* Pillar 1: Planifica */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 rounded-full bg-bg-base flex items-center justify-center relative group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 rounded-full bg-[#02b36d]/10 dark:bg-[#02b36d]/20" />
                  <Calendar size={36} className="fill-[#02b36d]/20 text-[#02b36d] dark:text-emerald-400 relative z-10" />
                </div>
                <span className="bg-[#02b36d] text-white px-5 py-1.5 rounded-full text-xs font-black select-none inline-block mt-5 tracking-wider uppercase shadow-xs">
                  Planifica
                </span>
                <p className="text-xs sm:text-[13px] font-bold text-zinc-550 dark:text-zinc-450 mt-3 leading-relaxed max-w-[200px]">
                  Crea tu planificación diaria o de unidad en minutos.
                </p>
              </div>

              {/* Pillar 2: Vincula */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 rounded-full bg-bg-base flex items-center justify-center relative group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 rounded-full bg-[#02327e]/10 dark:bg-blue-500/20" />
                  <BookOpen size={36} className="fill-[#02327e]/20 text-[#02327e] dark:text-blue-400 relative z-10" />
                </div>
                <span className="bg-[#02327e] text-white px-5 py-1.5 rounded-full text-xs font-black select-none inline-block mt-5 tracking-wider uppercase shadow-xs">
                  Vincula
                </span>
                <p className="text-xs sm:text-[13px] font-bold text-zinc-550 dark:text-zinc-450 mt-3 leading-relaxed max-w-[200px]">
                  Se vinculan automáticamente los elementos del currículo dominicano vigente.
                </p>
              </div>

              {/* Pillar 3: Automatiza */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 rounded-full bg-bg-base flex items-center justify-center relative group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 rounded-full bg-amber-500/10 dark:bg-amber-500/20" />
                  <ClipboardCheck size={36} className="fill-amber-500/20 text-amber-600 dark:text-amber-400 relative z-10" />
                </div>
                <span className="bg-amber-600 dark:bg-amber-500 text-white px-5 py-1.5 rounded-full text-xs font-black select-none inline-block mt-5 tracking-wider uppercase shadow-xs">
                  Automatiza
                </span>
                <p className="text-xs sm:text-[13px] font-bold text-zinc-550 dark:text-zinc-450 mt-3 leading-relaxed max-w-[200px]">
                  Ahorra tiempo y reduce la carga administrativa.
                </p>
              </div>

              {/* Pillar 4: Enfócate */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 rounded-full bg-bg-base flex items-center justify-center relative group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 rounded-full bg-purple-500/10 dark:bg-purple-500/20" />
                  <Target size={36} className="fill-purple-500/20 text-purple-650 dark:text-purple-400 relative z-10" />
                </div>
                <span className="bg-purple-650 dark:bg-purple-600 text-white px-5 py-1.5 rounded-full text-xs font-black select-none inline-block mt-5 tracking-wider uppercase shadow-xs">
                  Enfócate
                </span>
                <p className="text-xs sm:text-[13px] font-bold text-zinc-550 dark:text-zinc-450 mt-3 leading-relaxed max-w-[200px]">
                  Más tiempo para enseñar, guiar y transformar el aprendizaje.
                </p>
              </div>

            </div>
          </div>

          {/* Bottom Verification Banner */}
          <div className="flex justify-center mt-12">
            <div className="inline-flex items-center gap-3.5 px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-sm select-none max-w-xl text-left">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-[#02327e] dark:text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="fill-blue-500/20 text-[#02327e] dark:text-blue-400" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                Todo alineado con el <span className="text-[#02b36d] font-extrabold">currículo dominicano</span> para una educación de calidad.
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          STEPS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="pasos" className="py-20 px-6 bg-bg-base relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              Planifica en 4 <span className="text-[#02b36d]">simples</span> <span className="text-[#02b36d]">pasos</span>
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto">
              Organiza tus clases de forma rápida, eficiente e inteligente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              {
                num: "1",
                title: "Selecciona Nivel y Grado",
                desc: "Indica tu nivel educativo y el grado correspondiente en la plataforma.",
                gradient: "from-[#02327e]/5 to-[#02327e]/10",
                iconBg: "bg-[#02327e]/10 dark:bg-[#02327e]/25",
                icon: <GraduationCap size={22} className="fill-[#02327e]/20 text-[#02327e]" />,
                bgIcon: <GraduationCap size={120} className="text-[#02327e]/20 dark:text-[#02327e]/30" />
              },
              {
                num: "2",
                title: "Escoge una Asignatura",
                desc: "Selecciona la asignatura del currículo dominicano oficial correspondiente.",
                gradient: "from-[#02b36d]/5 to-[#02b36d]/10",
                iconBg: "bg-[#02b36d]/10 dark:bg-[#02b36d]/25",
                icon: <BookOpen size={22} className="fill-[#02b36d]/20 text-[#02b36d]" />,
                bgIcon: <BookOpen size={120} className="text-[#02b36d]/20 dark:text-[#02b36d]/30" />
              },
              {
                num: "3",
                title: "Secuencia o Tema",
                desc: "Elige la secuencia didáctica o el tema específico que vas a trabajar.",
                gradient: "from-amber-500/5 to-amber-500/10",
                iconBg: "bg-amber-500/10 dark:bg-amber-500/25",
                icon: <Sliders size={22} className="fill-amber-500/20 text-amber-600" />,
                bgIcon: <Sliders size={120} className="text-amber-500/20 dark:text-amber-500/30" />
              },
              {
                num: "4",
                title: "Genera con Planix AI",
                desc: "Rellena todos los campos con Planix AI, y listo tu planificación lista en 1 minuto.",
                gradient: "from-purple-500/5 to-indigo-500/10",
                iconBg: "bg-purple-500/10 dark:bg-purple-500/25",
                icon: <Sparkles size={22} className="fill-purple-500/20 text-purple-600" />,
                bgIcon: <Sparkles size={120} className="text-purple-500/20 dark:text-purple-500/30" />
              },
            ].map((step) => (
              <div key={step.num} className={`bg-gradient-to-br ${step.gradient} p-7 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/10 transition-all duration-300 flex flex-col justify-between min-h-[230px] relative overflow-hidden group`}>
                {/* Background Large Soft Blurred Icon */}
                <div className="absolute -right-8 -bottom-8 opacity-75 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 pointer-events-none filter blur-[1px] flex items-center justify-center">
                  {step.bgIcon}
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Header with large number on left/one side, and sharp icon on the right */}
                    <div className="flex items-baseline justify-between mb-5">
                      <span className="text-5xl font-black text-zinc-300 dark:text-zinc-800 group-hover:text-zinc-400 dark:group-hover:text-zinc-700 transition-colors duration-300 select-none">
                        0{step.num}
                      </span>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ${step.iconBg}`}>
                        {step.icon}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-2 leading-tight group-hover:text-[#02327e] dark:group-hover:text-blue-400 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 leading-relaxed max-w-[90%]">
                      {step.desc}
                    </p>
                  </div>

                  {step.num === "4" && (
                    <div className="mt-5">
                      <Link to="/registro" className="inline-block">
                        <button className="bg-[#02b36d] hover:bg-[#029a5e] text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-[#02b36d]/20 active:scale-[0.97] transition-all cursor-pointer">
                          Comenzar Ya
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          GESTIÓN DE CALIFICACIONES Y REGISTRO DIGITAL
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="registro-digital" className="py-14 px-6 bg-bg-base relative overflow-hidden border-t border-zinc-200/30 dark:border-zinc-800/30">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[350px] h-[350px] bg-[#02b36d]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[350px] h-[350px] bg-[#02327e]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="flex flex-col items-center justify-center text-center relative max-w-4xl mx-auto mb-14">

            <h2 className="text-3xl md:text-5xl font-extrabold text-[#02327e] dark:text-white tracking-tight leading-tight mb-6">
              Gestión de <span className="text-[#02b36d]">Calificaciones</span> y Registro Digital
            </h2>

            <div className="flex items-center justify-center gap-1.5 mb-6">
              <div className="w-1.5 h-1.5 bg-[#02b36d] rounded-full" />
              <div className="w-20 h-[2px] bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="w-1.5 h-1.5 bg-[#02327e] rounded-full" />
            </div>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed max-w-3xl">
              Facilita el <span className="text-[#02b36d] font-bold">cálculo automático</span> de los <span className="text-[#02b36d] font-bold">períodos de evaluación</span> y el <span className="text-[#02327e] dark:text-blue-400 font-bold">control de la asistencia</span> en total conformidad con las normativas de evaluación vigentes del <span className="text-[#02327e] dark:text-blue-400 font-bold">MINERD</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-14">
            
            <div className="group bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#02b36d]/10 text-[#02b36d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300">
                <Calculator size={26} className="fill-[#02b36d]/20" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#02b36d] mb-2">Cálculo Automático</h3>
                <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-450 leading-relaxed">
                  Obtén promedios y calificaciones por período de forma precisa y al instante.
                </p>
              </div>
            </div>

            <div className="group bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#02327e]/10 text-[#02327e] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300">
                <Calendar size={26} className="fill-[#02327e]/20" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#02327e] dark:text-white mb-2">Períodos de Evaluación</h3>
                <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-450 leading-relaxed">
                  Configura y calcula automáticamente los períodos según las normativas del MINERD.
                </p>
              </div>
            </div>

            <div className="group bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#02b36d]/10 text-[#02b36d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300">
                <ClipboardCheck size={26} className="fill-[#02b36d]/20" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#02b36d] mb-2">Control de Asistencia</h3>
                <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-450 leading-relaxed">
                  Registra y monitorea la asistencia diaria de los estudiantes de manera sencilla y confiable.
                </p>
              </div>
            </div>

            <div className="group bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#02327e]/10 text-[#02327e] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300">
                <ShieldCheck size={26} className="fill-[#02327e]/20" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#02327e] dark:text-white mb-2">Cumplimiento Normativo</h3>
                <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-450 leading-relaxed">
                  Total conformidad con las normativas de evaluación vigentes del MINERD.
                </p>
              </div>
            </div>

          </div>

          <div className="max-w-2xl mx-auto border border-zinc-200/60 dark:border-zinc-800/60 rounded-full px-6 py-3 flex items-center gap-3.5 bg-white/60 dark:bg-zinc-900/60 justify-center shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#02b36d]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="w-7 h-7 rounded-full bg-[#02327e]/10 dark:bg-[#02327e]/20 text-[#02327e] dark:text-blue-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} className="fill-[#02327e]/10" />
            </div>
            <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700" />
            <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">
              Más control, menos trabajo manual, <span className="text-[#02b36d] italic font-extrabold">mejores resultados. ✨</span>
            </p>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          INTERACTIVE DR MAP
      ═══════════════════════════════════════════════════════════════════ */}
      <div id="mapa">
        <DRMap />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PROBLEMS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="pt-8 pb-8 px-6 bg-bg-base relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              Sabemos lo que enfrentas <span className="text-[#02b36d]">cada día</span>
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-3xl mx-auto">
              Mientras tú luchas con el papeleo, tus ideas para el aula quedan en espera. Estos son los obstáculos que Planix elimina por ti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { 
                title: "Falta de Tiempo", 
                description: "La planificación educativa consume horas de tu fin de semana que podrías dedicar a descansar.", 
                color: "from-red-500/5 to-rose-500/10", 
                iconBg: "bg-red-500/10 dark:bg-red-950/45", 
                icon: <Clock size={22} className="fill-red-500/20 text-red-600" />,
                bgIcon: <Clock size={120} className="text-red-500/20 dark:text-red-500/30" />
              },
              { 
                title: "Papeleo del MINERD", 
                description: "Excesivos formatos curriculares y requisitos burocráticos que consumen tu energía creativa.", 
                color: "from-amber-500/5 to-orange-500/10", 
                iconBg: "bg-amber-500/10 dark:bg-amber-950/45", 
                icon: <Files size={22} className="fill-amber-500/20 text-amber-600" />,
                bgIcon: <Files size={120} className="text-amber-500/20 dark:text-amber-500/30" />
              },
              { 
                title: "Alineación Curricular", 
                description: "Dudas constantes sobre si estás cumpliendo exactamente con las últimas adecuaciones vigentes.", 
                color: "from-violet-500/5 to-purple-500/10", 
                iconBg: "bg-violet-500/10 dark:bg-violet-950/45", 
                icon: <ShieldAlert size={22} className="fill-violet-500/20 text-violet-650" />,
                bgIcon: <ShieldAlert size={120} className="text-violet-500/20 dark:text-violet-500/30" />
              },
              { 
                title: "Desorganización", 
                description: "Documentos de planificación dispersos en cuadernos, archivos de Word y carpetas difíciles de buscar.", 
                color: "from-emerald-500/5 to-green-500/10", 
                iconBg: "bg-emerald-500/10 dark:bg-emerald-950/45", 
                icon: <FolderX size={22} className="fill-emerald-500/20 text-emerald-600" />,
                bgIcon: <FolderX size={120} className="text-emerald-500/20 dark:text-emerald-500/30" />
              },
              { 
                title: "Estrés y Agotamiento", 
                description: "La presión por cumplir con toda la carga burocrática reduce tu motivación para la enseñanza.", 
                color: "from-blue-500/5 to-sky-500/10", 
                iconBg: "bg-blue-500/10 dark:bg-blue-950/45", 
                icon: <Frown size={22} className="fill-blue-500/20 text-blue-600" />,
                bgIcon: <Frown size={120} className="text-blue-500/20 dark:text-blue-500/30" />
              },
              { 
                title: "Seguimiento Manual", 
                description: "Llevar el control de indicadores de logro estudiante por estudiante en registros físicos es lento.", 
                color: "from-pink-500/5 to-rose-500/10", 
                iconBg: "bg-pink-500/10 dark:bg-pink-950/45", 
                icon: <TrendingUp size={22} className="fill-pink-500/20 text-pink-600" />,
                bgIcon: <TrendingUp size={120} className="text-pink-500/20 dark:text-pink-500/30" />
              }
            ].map((pain, index) => (
              <div key={index} className={`bg-gradient-to-br ${pain.color} p-7 rounded-3xl border border-zinc-200/40 dark:border-zinc-800/40 hover:shadow-xl hover:shadow-zinc-900/5 dark:hover:shadow-black/15 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between min-h-[220px] relative overflow-hidden group`}>
                
                {/* Background Large Soft Blurred Icon */}
                <div className="absolute -right-8 -bottom-8 opacity-75 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 pointer-events-none filter blur-[1px] flex items-center justify-center">
                  {pain.bgIcon}
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    {/* Header with circular translucent icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ${pain.iconBg}`}>
                        {pain.icon}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-850 dark:text-white mb-2 leading-tight group-hover:text-[#02327e] dark:group-hover:text-blue-400 transition-colors duration-300">
                      {pain.title}
                    </h3>
                    <p className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 leading-relaxed">
                      {pain.description}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MINERD CURRICULUM ALIGNMENT SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-4 px-6 bg-bg-base relative z-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden shadow-xl shadow-zinc-100/50 dark:shadow-none">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-35 pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Heading and Highlight */}
              <div className="md:col-span-7 space-y-4 text-left">
                {/* Flag & Status Badge Row */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded border border-zinc-200 shadow-sm overflow-hidden shrink-0 select-none">
                    <svg className="w-full h-full" viewBox="0 0 90 60" fill="none">
                      <rect x="0" y="0" width="45" height="30" fill="#002f6c" />
                      <rect x="45" y="0" width="45" height="30" fill="#ce1126" />
                      <rect x="0" y="30" width="45" height="30" fill="#ce1126" />
                      <rect x="45" y="30" width="45" height="30" fill="#002f6c" />
                      <rect x="39" y="0" width="12" height="60" fill="#ffffff" />
                      <rect x="0" y="24" width="90" height="12" fill="#ffffff" />
                      <rect x="42" y="27" width="6" height="6" fill="#002f6c" rx="1" />
                      <circle cx="45" cy="30" r="1.5" fill="#02b36d" />
                    </svg>
                  </div>
                  <span className="text-xs font-black text-[#02327e] tracking-wider uppercase">
                    República Dominicana
                  </span>
                </div>

                <div className="text-xl md:text-2xl font-medium text-[#02327e] tracking-tight leading-relaxed">
                  <span className="font-black text-[#02327e]">Planix</span> ha sido diseñada de forma específica bajo el marco de la{' '}
                  <span className="inline-block relative pb-2 select-none">
                    <span className="text-[#02b36d] font-bold">Adecuación Curricular</span>
                    {/* Underline de lado a lado */}
                    <span className="absolute left-0 right-0 bottom-0 text-[#02b36d] h-1 pointer-events-none">
                      <svg className="w-full h-full" viewBox="0 0 256 12" fill="none" preserveAspectRatio="none">
                        <path d="M4 8 Q128 1 252 8" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                      </svg>
                    </span>
                  </span>{' '}
                  vigente del{' '}
                  <span className="font-black text-[#02327e]">
                    Ministerio de Educación (MINERD)
                  </span>{' '}
                  de la República Dominicana.
                </div>
              </div>

              {/* Right Column: Remainder Text & Confirmation Badge */}
              <div className="md:col-span-5 flex flex-col justify-center items-start text-left border-t md:border-t-0 md:border-l border-zinc-200/65 dark:border-zinc-800/65 pt-6 md:pt-0 md:pl-8 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-[#02b36d] uppercase tracking-wider">
                    Planificación Inteligente
                  </h4>
                  <p className="text-sm md:text-base font-bold text-zinc-550 dark:text-zinc-400 leading-relaxed">
                    Optimiza tu tiempo de organización de clases y cumple al 100% con los estándares de diseño curricular vigentes.
                  </p>
                </div>

                {/* Bottom confirmation badge */}
                <div className="inline-flex items-start gap-2.5 px-5 py-3 bg-[#02327e] text-white rounded-2xl font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-[#02327e]/15 select-none w-full">
                  <CheckCircle2 size={18} className="text-[#02b36d] shrink-0 mt-0.5" />
                  <span>
                    Todo lo que necesitas, en una sola plataforma,{' '}
                    <span className="text-[#02b36d] font-extrabold">hecha para ti.</span>
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════════
          BENEFITS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="pt-8 pb-24 px-6 bg-bg-base relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
              ¿Qué ganas con <span className="text-[#02b36d]">Planix</span>?
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-3xl mx-auto">
              Diseñada para transformar tu experiencia docente y devolverte el control de tu tiempo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: "Ahorra Tiempo Real", description: "Reduce el trabajo administrativo drásticamente. Planifica en minutos lo que antes tomaba días.", iconBg: "bg-amber-500/10 dark:bg-amber-500/25", iconClass: "fill-amber-500/20 text-amber-500" },
              { icon: FolderOpen, title: "Todo en un solo Lugar", description: "Tus recursos, planificaciones, exámenes y expedientes seguros y accesibles en la nube.", iconBg: "bg-blue-500/10 dark:bg-blue-500/25", iconClass: "fill-blue-500/20 text-blue-500" },
              { icon: CheckCircle2, title: "Alineación Curricular", description: "Confianza total al estar 100% alineado a los estándares curriculares vigentes del MINERD.", iconBg: "bg-emerald-500/10 dark:bg-emerald-500/25", iconClass: "fill-emerald-500/20 text-emerald-500" },
              { icon: Heart, title: "Paz y Tranquilidad", description: "Estructuras pedagógicas completas que te dan seguridad ante cualquier supervisión escolar.", iconBg: "bg-rose-500/10 dark:bg-rose-500/25", iconClass: "fill-rose-500/20 text-rose-500" },
              { icon: Target, title: "Calidad Didáctica", description: "Mejora el aprendizaje en el aula con actividades creativas, lúdicas y adaptadas (DUA).", iconBg: "bg-violet-500/10 dark:bg-violet-500/25", iconClass: "fill-violet-500/20 text-violet-500" },
              { icon: TrendingUp, title: "Potencialización Docente", description: "Utiliza la inteligencia artificial como un asistente pedagógico de primer nivel.", iconBg: "bg-cyan-500/10 dark:bg-cyan-500/25", iconClass: "fill-cyan-500/20 text-cyan-500" }
            ].map((benefit, index) => (
              <div key={index} className="group bg-white dark:bg-zinc-900 p-7 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start gap-4">
                <div className="w-14 h-14 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 relative">
                  <benefit.icon size={26} className={benefit.iconClass} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{benefit.title}</h3>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          BENEFITS SECTION WITH COLUMNS (Para el Docente, Para el Centro, Para los Estudiantes)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-bg-base relative border-t border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 relative">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#02327e] dark:text-white tracking-tight mb-4 flex items-center justify-center gap-2 font-display">
              <span className="text-[#02b36d] opacity-40 font-light">\ \</span> Beneficios <span className="text-[#02b36d] opacity-40 font-light">/ /</span>
            </h2>
            <div className="w-24 h-1 bg-[#02b36d] mx-auto rounded-full mt-2" />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6">
            
            {/* Column 1: Para el Docente */}
            <div className="relative group bg-blue-50/20 dark:bg-blue-950/10 border border-blue-200/80 dark:border-blue-900/40 p-8 pt-12 rounded-3xl transition-all duration-300 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-800/80 flex flex-col items-center text-center">
              {/* Circular Border Icon */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-[#02327e] flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Laptop size={28} className="text-[#02327e]" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-6">
                Para el <span className="text-[#02327e] font-black block text-2xl mt-1">Docente</span>
              </h3>
              
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 w-full">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-[#02327e] flex items-center justify-center shrink-0">
                    <Clock size={20} className="fill-blue-500/20" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-650 dark:text-zinc-300 text-left leading-relaxed">
                    Ahorro de más de <strong className="text-[#02327e] dark:text-blue-400 font-extrabold text-base">5 horas</strong> semanales de trabajo administrativo y reducción de estrés.
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: Para el Centro / Coordinador */}
            <div className="relative group bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-200/80 dark:border-emerald-900/40 p-8 pt-12 rounded-3xl transition-all duration-300 shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-800/80 flex flex-col items-center text-center">
              {/* Circular Border Icon */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-[#02b36d] flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <School size={28} className="text-[#02b36d]" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-6">
                Para el <span className="text-[#02b36d] font-black block text-2xl mt-1">Centro / Coordinador</span>
              </h3>
              
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 w-full">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-[#02b36d] flex items-center justify-center shrink-0">
                    <ClipboardCheck size={20} className="fill-emerald-500/20" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-650 dark:text-zinc-300 text-left leading-relaxed">
                    <strong>Estandarización</strong> de formatos oficiales.
                  </p>
                </div>
                
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 w-full">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-[#02b36d] flex items-center justify-center shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-650 dark:text-zinc-300 text-left leading-relaxed">
                    <strong>Supervisión</strong> en tiempo real del progreso de planificación.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 w-full">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-[#02b36d] flex items-center justify-center shrink-0">
                    <BarChart3 size={20} />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-650 dark:text-zinc-300 text-left leading-relaxed">
                    <strong>Métricas unificadas</strong> para la toma de decisiones.
                  </p>
                </div>
              </div>
            </div>

            {/* Column 3: Para los Estudiantes */}
            <div className="relative group bg-amber-50/20 dark:bg-amber-950/10 border border-amber-200/80 dark:border-amber-900/40 p-8 pt-12 rounded-3xl transition-all duration-300 shadow-lg shadow-amber-500/5 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-300 dark:hover:border-amber-800/80 flex flex-col items-center text-center">
              {/* Circular Border Icon */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-amber-500 flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Users size={28} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-6">
                Para los <span className="text-amber-600 dark:text-amber-550 font-black block text-2xl mt-1">Estudiantes</span>
              </h3>
              
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 w-full">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Star size={20} className="fill-amber-550/20" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-650 dark:text-zinc-300 text-left leading-relaxed">
                    Clases más <strong>dinámicas</strong> e interactivas.
                  </p>
                </div>
                
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 w-full">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Puzzle size={20} className="fill-amber-550/20" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-650 dark:text-zinc-300 text-left leading-relaxed">
                    Experiencias más <strong>lúdicas</strong> y motivadoras.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 w-full">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Target size={20} className="fill-amber-550/20" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-650 dark:text-zinc-300 text-left leading-relaxed">
                    Actividades <strong>adaptadas</strong> a su <strong>ritmo</strong> de aprendizaje.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Banner */}
          <div className="mt-16 max-w-4xl mx-auto border border-blue-200/60 dark:border-blue-900/50 rounded-2xl p-5 bg-blue-50/10 dark:bg-blue-950/5 flex items-center gap-4 justify-center shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#02327e]/15 text-[#02327e] dark:text-blue-300 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} className="fill-[#02327e]/20" />
            </div>
            <p className="text-xs sm:text-sm md:text-base font-bold text-zinc-700 dark:text-zinc-300 text-center leading-relaxed">
              Planix impulsa una educación <span className="text-[#02b36d] font-extrabold">más eficiente, organizada</span> y centrada en el aprendizaje.
            </p>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FEATURES / TOOLS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="pt-24 pb-10 px-6 bg-bg-base relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#02327e]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#02b36d]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Herramientas diseñadas <span className="text-[#02b36d]">para ti</span>
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto mt-4">
              Todo lo que necesitas para transformar tu práctica docente en un ecosistema inteligente y sencillo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(showAllFeatures ? ALL_FEATURES : ALL_FEATURES.slice(0, 6)).map((feature, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-zinc-900 p-7 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start gap-4"
              >
                <div className="w-14 h-14 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 relative">
                  <feature.icon size={26} className={getFeatureIconClass(feature.gradient)} />
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



      {/* FAQ Section */}
      <FAQSection />

      {/* Testimonials */}
      <TestimonialsMasonry />

      {/* Social Community */}
      <div id="comunidad">
        <SocialCommunity />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          FINAL CTA SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-bg-base overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#02327e]/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-7">
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
            Transforma tu planificación <span className="text-[#02b36d] font-extrabold">hoy mismo.</span>
          </h2>
          <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Únete a miles de docentes de la República Dominicana que ya están ahorrando tiempo administrativo con la IA de Planix.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              to={user ? "/dashboard" : "/registro"}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#02327e] hover:bg-[#012563] text-white rounded-xl font-semibold text-sm transition-all text-center flex items-center justify-center gap-2 active:scale-[0.97] shadow-none"
            >
              Comenzar Gratis <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-2.5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-center flex items-center justify-center gap-2 active:scale-[0.97] shadow-none"
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
