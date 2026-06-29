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
  Target
} from 'lucide-react';
import { getCurrentUser } from '../lib/storage';
import DRMap from '../components/planix/DRMap';
import FAQSection from '../components/planix/FAQSection';
import TestimonialsMasonry from '../components/planix/TestimonialsMasonry';
import SocialCommunity from '../components/planix/SocialCommunity';
import Footer from '../components/planix/Footer';
import PlatformLogo from '../components/ui/PlatformLogo';

// --- Shared Components ---

const ALL_FEATURES = [
  {
    icon: Sparkles,
    title: "Planificación IA",
    description: "Diseña planes pedagógicos de alto impacto, adaptados a tus necesidades y con integración de IA en segundos."
  },
  {
    icon: FileText,
    title: "Generador de Exámenes",
    description: "Crea evaluaciones profesionales con hojas de respuestas docentes listas para imprimir."
  },
  {
    icon: PenTool,
    title: "Pizarra Inteligente",
    description: "Organiza tus ideas con mapas conceptuales y esquemas dinámicos generados por IA."
  },
  {
    icon: Users,
    title: "Planix Dinámicas",
    description: "Colección de dinámicas interactivas: selección al azar, generador de grupos, retos de 60s y juegos de ingenio."
  },
  {
    icon: Gamepad2,
    title: "Planix Juegos",
    description: "Transforma tus clases en una aventura épica con retos lúdicos y aprendizaje gamificado."
  },
  {
    icon: Heart,
    title: "Planix Bienestar",
    description: "Estrategias de gestión de aula y apoyo emocional basadas en psicología pedagógica."
  },
  {
    icon: Search,
    title: "Asistente de Investigación",
    description: "Encuentra información educativa relevante y genera resúmenes para tus preparaciones."
  },
  {
    icon: HelpCircle,
    title: "Generador de Preguntas",
    description: "Crea cuestionarios y preguntas de reflexión automáticamente a partir de cualquier texto."
  },
  {
    icon: Brain,
    title: "Planix Simplifica",
    description: "Técnica de Feynman para explicar temas complejos de forma sencilla y con analogías."
  },
  {
    icon: Smile,
    title: "Planix Inicial",
    description: "Herramientas especializadas con radar de habilidades para el Nivel Inicial."
  },
  {
    icon: Cpu,
    title: "Sintetizador de IA",
    description: "Transforma cualquier texto en resúmenes, materiales didácticos o actividades creativas."
  },
  {
    icon: Layout,
    title: "Lienzo Curricular",
    description: "La forma definitiva de planificar: Elige entre diseño libre total o clonación inteligente por IA en Canvas."
  },
  {
    icon: Rocket,
    title: "Planix STEAM",
    description: "Generador de proyectos integrales ciencia-tecnología-arte, 100% gamificados y contextualizados."
  },
  {
    icon: MessageSquare,
    title: "Planix Chat con PDF",
    description: "Conversa con tus documentos para extraer información, resumir o hacer preguntas con ayuda de la IA."
  },
  {
    icon: Award,
    title: "Generador de Diplomas",
    description: "Crea reconocimientos de 'Logro Específico' con diseño premium para incentivar el comportamiento positivo."
  },
  {
    icon: Grid,
    title: "Sopas de Letras",
    description: "Genera divertidas sopas de letras listas para imprimir a partir de cualquier tema o texto."
  },
  {
    icon: Puzzle,
    title: "Creador de Crucigramas",
    description: "Construye crucigramas educativos rápidamente a partir de un tema o texto base."
  },
  {
    icon: Map,
    title: "Recorridos Docentes",
    description: "Guiones de intervención y preguntas clave para andamiaje y profundización en el desarrollo de la clase."
  },
  {
    icon: Users,
    title: "Apoyo Adicional",
    description: "Estrategias DUA y ajustes razonables para estudiantes con necesidades específicas de apoyo."
  },
  {
    icon: Globe,
    title: "Situaciones de Aprendizaje",
    description: "Genera narrativas pedagógicas realistas y motivadoras vinculadas al contexto y competencias."
  },
  {
    icon: TrendingUp,
    title: "Evaluación Continua",
    description: "Registro fácil de evidencias y seguimiento detallado de indicadores de logro."
  },
  {
    icon: FolderOpen,
    title: "Biblioteca Personal",
    description: "Organiza, clasifica y recupera todas tus planificaciones y recursos en un solo lugar."
  },
  {
    icon: Printer,
    title: "Impresión Un-Clic",
    description: "Genera documentos con formato institucional listos para entregar a tu centro."
  }
];

const NAV_ITEMS = [
  { href: "#features", label: "Módulos" },
  { href: "#planes", label: "Planes Pro" },
  { href: "#faq", label: "Preguntas" },
];

function SectionTitle({ title, subtitle, center = true }: { title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={`mb-16 ${center ? 'text-center' : 'text-left'} relative z-10`}>
      <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-neutral-100 tracking-tighter mb-4 leading-none">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl font-bold text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed mt-4">
          {subtitle}
        </p>
      )}
    </div>
  );
}

const LandingCard: React.FC<{ icon?: React.ReactNode; title: string; description: string; colorClass?: string }> = ({ icon, title, description, colorClass = 'bg-white dark:bg-zinc-900' }) => {
  return (
    <div className={`
      relative p-8 rounded-[2rem] border-2 border-neutral-900 dark:border-zinc-700 shadow-[4px_4px_0px_0px_#1B1B1B] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)]
      transition-all duration-200 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1B1B1B] h-full flex flex-col items-start gap-4 group overflow-hidden z-10
      ${colorClass}
    `}>
      {icon && (
        <div className="mb-2 p-3 bg-neutral-900/5 dark:bg-white/10 rounded-2xl border border-neutral-900/10 dark:border-white/10 transition-transform group-hover:scale-110 duration-300 flex items-center justify-center">
          {icon}
        </div>
      )}

      <h3 className="text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>

      <p className="text-sm font-bold leading-relaxed text-neutral-700 dark:text-neutral-300">
        {description}
      </p>
    </div>
  );
}

// --- Custom Mockups & Sections ---

function DashboardMockup() {
  const [activeTab, setActiveTab] = useState<'plan' | 'exam' | 'assist'>('plan');
  
  return (
    <div className="w-full bg-[#1B1B1B] dark:bg-zinc-950 rounded-[2rem] border-2 border-neutral-900 dark:border-zinc-700 shadow-[6px_6px_0px_0px_#1B1B1B] overflow-hidden text-left font-sans select-none">
      {/* Top Window bar */}
      <div className="bg-[#262626] dark:bg-zinc-900 px-6 py-4 flex items-center justify-between border-b-2 border-neutral-900">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-neutral-900" />
          <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 border border-neutral-900" />
          <div className="w-3.5 h-3.5 rounded-full bg-green-500 border border-neutral-900" />
        </div>
        <div className="text-xs text-neutral-400 font-bold bg-[#1B1B1B] px-6 py-1 rounded-full border border-neutral-800">
          app.planix.do
        </div>
        <div className="w-16" />
      </div>

      {/* Main Mockup Area */}
      <div className="flex min-h-[360px]">
        {/* Mockup Sidebar */}
        <div className="w-[80px] sm:w-[160px] bg-[#1F1F1F] dark:bg-zinc-900 p-4 flex flex-col gap-2 border-r-2 border-neutral-900">
          <div className="h-6 w-20 bg-white/10 rounded-md mb-6 hidden sm:block" />
          <div className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer border ${activeTab === 'plan' ? 'bg-[#58A0E9] text-black border-neutral-900 shadow-[2px_2px_0px_0px_#000]' : 'text-neutral-400 border-transparent hover:bg-white/5'}`} onClick={() => setActiveTab('plan')}>
            <BookOpen size={14} />
            <span className="hidden sm:inline">Planificación</span>
          </div>
          <div className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer border ${activeTab === 'exam' ? 'bg-[#58A0E9] text-black border-neutral-900 shadow-[2px_2px_0px_0px_#000]' : 'text-neutral-400 border-transparent hover:bg-white/5'}`} onClick={() => setActiveTab('exam')}>
            <Award size={14} />
            <span className="hidden sm:inline">Exámenes</span>
          </div>
          <div className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer border ${activeTab === 'assist' ? 'bg-[#58A0E9] text-black border-neutral-900 shadow-[2px_2px_0px_0px_#000]' : 'text-neutral-400 border-transparent hover:bg-white/5'}`} onClick={() => setActiveTab('assist')}>
            <MessageSquare size={14} />
            <span className="hidden sm:inline">Comunidad</span>
          </div>
        </div>

        {/* Mockup Content Panel */}
        <div className="flex-1 p-6 bg-[#1B1B1B] text-neutral-200 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'plan' && (
              <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black bg-[#FACDD1] text-neutral-900 px-3 py-1 rounded-full border border-neutral-900 uppercase tracking-wider">Generador Inteligente</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">MINERD 2026</span>
                </div>
                <h4 className="text-base font-extrabold text-white">Planificación de Unidad - Lengua Española</h4>
                <div className="p-4 bg-[#282828] rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400">Tema: La Receta (4to Primaria)</span>
                    <span className="text-[#B2F0D1] font-bold">Alineado ✓</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed italic">
                    "Generar actividades DUA enfocadas en la elaboración de platos típicos dominicanos, evaluando competencias específicas de comprensión oral y producción escrita."
                  </p>
                </div>
                <button className="w-full py-3 bg-[#58A0E9] hover:bg-[#4890D9] text-neutral-900 text-xs font-black rounded-xl border-2 border-neutral-900 flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
                  <Sparkles size={12} className="fill-neutral-900/20" /> Generar Plan con IA
                </button>
              </motion.div>
            )}

            {activeTab === 'exam' && (
              <motion.div key="exam" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black bg-[#DCDDFF] text-neutral-900 px-3 py-1 rounded-full border border-neutral-900 uppercase tracking-wider">Evaluaciones</span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded-full font-bold border border-purple-500/20">Listo para Imprimir</span>
                </div>
                <h4 className="text-base font-extrabold text-white">Generar Examen con IA</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#282828] rounded-xl border border-white/5 text-center text-xs">
                    <span className="block font-bold">10 Preguntas</span>
                    <span className="text-[9px] text-neutral-400">Opción Múltiple</span>
                  </div>
                  <div className="p-3 bg-[#282828] rounded-xl border border-white/5 text-center text-xs">
                    <span className="block font-bold">Hoja de Respuestas</span>
                    <span className="text-[9px] text-neutral-400">Para el docente</span>
                  </div>
                </div>
                <div className="p-3 bg-[#282828] rounded-xl border border-white/5 text-[11px] text-neutral-400 space-y-1">
                  <div className="flex gap-1.5"><span className="text-[#58A0E9] font-bold">1.</span> ¿Cuál es la función principal de un título en una receta?</div>
                  <div className="flex gap-1.5"><span className="text-[#58A0E9] font-bold">2.</span> Identifica los verbos en modo imperativo en el texto...</div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assist' && (
              <motion.div key="assist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <span className="text-[10px] font-black bg-[#FBE6C2] text-neutral-900 px-3 py-1 rounded-full border border-neutral-900 uppercase tracking-wider">Comunidad Docente</span>
                <div className="p-4 bg-[#282828] rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#58A0E9] flex items-center justify-center text-[10px] font-black text-black border border-neutral-900">MP</div>
                    <div>
                      <h5 className="text-xs font-bold text-white leading-none">Mtra. María Pérez</h5>
                      <span className="text-[9px] text-neutral-400">Distrito 15-02</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    ¿Alguien tiene recursos DUA para trabajar fracciones en 5to grado? ¡Los compartidos por el MINERD están un poco pesados!
                  </p>
                  <div className="flex items-center gap-4 text-[10px] text-neutral-400 pt-1">
                    <span className="flex items-center gap-1 hover:text-white cursor-pointer"><ThumbsUp size={10} /> 14</span>
                    <span className="flex items-center gap-1 hover:text-white cursor-pointer"><MessageSquare size={10} /> 5 comentarios</span>
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

  const handleQuickRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      navigate(`/registro?email=${encodeURIComponent(emailInput.trim())}`);
    } else {
      navigate('/registro');
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF8FC] dark:bg-zinc-950 font-sans text-neutral-900 dark:text-neutral-100 overflow-x-hidden selection:bg-[#58A0E9] selection:text-neutral-900 relative">
      
      {/* Sticky Header */}
      <div className="max-w-7xl mx-auto px-4 pt-6 sticky top-0 z-50">
        <header className="flex items-center justify-between bg-white dark:bg-zinc-900 border-2 border-neutral-900 dark:border-zinc-700 rounded-full px-6 py-2.5 shadow-[4px_4px_0px_0px_#1B1B1B] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3">
            <PlatformLogo className="h-16 md:h-20" />
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:underline transition-colors decoration-brand-primary decoration-2"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-neutral-150 hover:underline">
                Iniciar Sesión
              </button>
            </Link>
            <Link to="/registro">
              <button className="px-5 py-2.5 bg-[#58A0E9] hover:bg-[#4890D9] text-neutral-900 font-black text-xs uppercase tracking-wider border-2 border-neutral-900 rounded-full shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
                Comenzar Gratis
              </button>
            </Link>
            <button onClick={() => setMobileOpen(true)} className="rounded-full border-2 border-neutral-900 p-2 hover:bg-neutral-100 dark:hover:bg-zinc-800 lg:hidden cursor-pointer dark:bg-zinc-900 text-neutral-900 dark:text-neutral-100">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          
          <div className="absolute inset-y-0 right-0 w-full sm:max-w-md bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto border-l-2 border-neutral-900">
            <div>
              <div className="flex justify-between items-center pb-6 border-b-2 border-neutral-900/10">
                <PlatformLogo className="h-14 md:h-18" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border-2 border-neutral-900 p-2.5 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-150 shadow-[2px_2px_0px_0px_#000] transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8">
                <div className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">
                  Navegación
                </div>
                <nav className="space-y-3">
                  {NAV_ITEMS.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between p-4 rounded-2xl border-2 border-neutral-900 bg-white dark:bg-zinc-950 font-black text-sm uppercase hover:bg-neutral-50 dark:hover:bg-zinc-800/40 shadow-[3px_3px_0px_0px_#1B1B1B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_#1B1B1B] transition-all"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            <div className="space-y-3 border-t-2 border-neutral-900/10 pt-6 mt-6">
              <Link to="/registro" onClick={() => setMobileOpen(false)} className="block w-full">
                <button className="w-full bg-[#58A0E9] hover:bg-[#4890D9] text-neutral-900 border-2 border-neutral-900 py-3.5 rounded-2xl shadow-[3px_3px_0px_0px_#000] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all">
                  <Sparkles className="h-4 w-4" /> Registrarse Gratis
                </button>
              </Link>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full">
                <button className="w-full border-2 border-neutral-900 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-neutral-900 dark:text-neutral-100 bg-white dark:bg-zinc-950 hover:bg-neutral-50 shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-1.5 transition-all">
                  <Lock className="h-4 w-4" /> Iniciar Sesión
                </button>
              </Link>
              <p className="text-[10px] text-center text-neutral-500 font-bold mt-2">
                Sin tarjeta de crédito • Comienza gratis hoy
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 px-6 z-10">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e908_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e908_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#38bdf805_1px,transparent_1px),linear-gradient(to_bottom,#38bdf805_1px,transparent_1px)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#0ea5e90e_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        
        {/* Glowing Background Radial */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#58A0E9]/10 dark:bg-sky-900/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-6 flex flex-col items-start text-left gap-6 z-20">
              
              {/* DR Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B2F0D1] rounded-full text-neutral-900 border-2 border-neutral-900 font-black text-[10px] uppercase tracking-wider shadow-[3px_3px_0px_0px_#1B1B1B]">
                <MapPin className="w-3.5 h-3.5 text-neutral-900" />
                República Dominicana
              </div>

              {/* Headline */}
              <div className="w-full">
                <h1 className="text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4.75rem] font-black text-neutral-900 dark:text-white tracking-tighter leading-[0.98] font-display flex flex-col items-start">
                  <span>Tu enseñanza,</span>
                  <span className="relative flex justify-start text-left text-brand-primary h-[54px] sm:h-[68px] lg:h-[82px] w-full">
                    {titles.map((title, index) => (
                      <motion.span
                        key={index}
                        className="absolute font-black underline decoration-brand-primary decoration-4 lg:decoration-6"
                        initial={{ opacity: 0, y: "-100%" }}
                        transition={{ type: "spring", stiffness: 50 }}
                        animate={
                          titleNumber === index
                            ? {
                                y: 0,
                                opacity: 1,
                              }
                            : {
                                y: titleNumber > index ? -150 : 150,
                                opacity: 0,
                              }
                        }
                      >
                        {title}.
                      </motion.span>
                    ))}
                  </span>
                </h1>
              </div>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 font-bold leading-relaxed max-w-xl">
                El ecosistema integral que acompaña al docente dominicano: desde planeación inteligente con IA hasta recursos creativos y gestión dinámica de tu aula.
              </p>

              {/* Quick signup email form */}
              <form onSubmit={handleQuickRegister} className="w-full max-w-lg mt-2">
                <div className="flex flex-col sm:flex-row items-stretch bg-white dark:bg-zinc-900 border-2 border-neutral-900 dark:border-zinc-700 rounded-[2rem] sm:rounded-full p-1.5 shadow-[4px_4px_0px_0px_#1B1B1B] focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-[2px_2px_0px_0px_#1B1B1B] transition-all">
                  <div className="flex items-center flex-1 px-4 py-3 sm:py-0">
                    <Mail className="text-neutral-400 mr-2 h-5 w-5 shrink-0" />
                    <input
                      type="email"
                      placeholder="Dirección de Correo Electrónico"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="bg-transparent border-0 outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 font-bold text-sm w-full focus:ring-0"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#58A0E9] hover:bg-[#4890D9] text-neutral-900 font-black px-6 py-3.5 rounded-full border-2 border-neutral-900 flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer text-xs uppercase tracking-wider shrink-0"
                  >
                    Registrarse Gratis <ArrowRight size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </form>

              {/* Highlights/Trust Indicators */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1.5 text-xs text-neutral-500 font-bold">
                <span className="flex items-center gap-1">✓ No requiere tarjeta</span>
                <span className="flex items-center gap-1">✓ Adecuación Curricular MINERD</span>
                <span className="flex items-center gap-1">✓ DUA Integrado</span>
              </div>

            </div>

            {/* Right Column: Unique Interactive Dashboard & Floating widgets */}
            <div className="lg:col-span-6 relative w-full flex items-center justify-center pt-8 lg:pt-0">
              
              {/* Floating Widgets positioned relative to this container */}
              <motion.div 
                className="hidden xl:block absolute left-[-40px] top-[10px] z-20 max-w-[200px] bg-[#FACDD1] border-2 border-neutral-900 p-3.5 rounded-2xl shadow-[3px_3px_0px_0px_#1B1B1B] text-left -rotate-3 select-none"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-neutral-900/50">Plan Diario</span>
                  <span className="text-[9px] bg-white border border-neutral-900 px-1.5 py-0.5 rounded-full font-black text-neutral-900 ml-auto">MINERD</span>
                </div>
                <h4 className="text-xs font-black text-neutral-900 leading-tight">Lengua Española</h4>
                <p className="text-[10px] font-bold text-neutral-800 mt-1">1er Grado Primaria ✓</p>
              </motion.div>

              <motion.div 
                className="hidden xl:block absolute right-[-20px] top-[30px] z-20 max-w-[230px] bg-[#B2F0D1] border-2 border-neutral-900 p-3.5 rounded-2xl shadow-[3px_3px_0px_0px_#1B1B1B] text-left rotate-3 select-none"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-neutral-900">Examen por IA</span>
                </div>
                <h4 className="text-xs font-black text-neutral-900 leading-tight">Sociales 4to de Primaria</h4>
                <span className="text-[9px] font-bold text-neutral-850 bg-white/80 border border-neutral-900/20 px-2.5 py-0.5 rounded-full mt-1.5 inline-flex items-center gap-1">
                  <Printer size={10} /> 10 Preguntas listas
                </span>
              </motion.div>

              <motion.div 
                className="hidden xl:block absolute left-[-60px] bottom-[30px] z-20 max-w-[200px] bg-[#FBE6C2] border-2 border-neutral-900 p-3.5 rounded-2xl shadow-[3px_3px_0px_0px_#1B1B1B] text-left rotate-2 select-none"
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              >
                <div className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-1">Estrategias DUA</div>
                <p className="text-xs font-black text-neutral-900 leading-normal">
                  "Ajustes razonables para apoyo."
                </p>
              </motion.div>

              <motion.div 
                className="hidden xl:block absolute right-[-40px] bottom-[-20px] z-20 max-w-[200px] bg-[#DCDDFF] border-2 border-neutral-900 p-3.5 rounded-2xl shadow-[3px_3px_0px_0px_#1B1B1B] text-left -rotate-2 select-none"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Award size={12} className="text-neutral-900" />
                  <span className="text-[9px] font-black text-neutral-900/60 uppercase tracking-wider">Adecuación 2026</span>
                </div>
                <h5 className="text-xs font-black text-neutral-900">Competencias</h5>
                <p className="text-[10px] font-bold text-neutral-750">Vinculadas al Indicador ✓</p>
              </motion.div>

              {/* Main mockup card wrapper */}
              <div className="w-full max-w-[540px] relative z-10">
                <DashboardMockup />
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-6 bg-white dark:bg-zinc-950 border-t-2 border-neutral-900 relative z-10">
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            title="Planifica en tres sencillos pasos"
            subtitle="Diseñado especialmente para el flujo de trabajo de los maestros en escuelas dominicanas."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-12">
            <div className="bg-[#DCDDFF] border-2 border-neutral-900 p-8 rounded-[2rem] shadow-[4px_4px_0px_0px_#1B1B1B] flex flex-col justify-between min-h-[200px]">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-900 bg-white text-neutral-900 mb-6 shadow-[2px_2px_0px_0px_#000] font-black text-sm">
                  1
                </div>
                <h3 className="text-xl font-black text-neutral-900 mb-2">Selecciona Asignatura</h3>
                <p className="text-sm font-bold text-neutral-900/80 leading-relaxed">
                  Indica tu nivel (Primario/Secundario) y asignatura del currículo dominicano oficial.
                </p>
              </div>
            </div>

            <div className="bg-[#EFF6FF] border-2 border-neutral-900 p-8 rounded-[2rem] shadow-[4px_4px_0px_0px_#1B1B1B] flex flex-col justify-between min-h-[200px]">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-900 bg-white text-neutral-900 mb-6 shadow-[2px_2px_0px_0px_#000] font-black text-sm">
                  2
                </div>
                <h3 className="text-xl font-black text-neutral-900 mb-2">Genera con IA</h3>
                <p className="text-sm font-bold text-neutral-900/80 leading-relaxed">
                  Nuestra IA alineada a la Adecuación Curricular de República Dominicana sugiere planes y secuencias al instante.
                </p>
              </div>
            </div>

            <div className="bg-[#58A0E9] border-2 border-neutral-900 p-8 rounded-[2rem] shadow-[4px_4px_0px_0px_#1B1B1B] flex flex-col justify-between min-h-[200px]">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-900 bg-white text-neutral-900 mb-6 shadow-[2px_2px_0px_0px_#000] font-black text-sm">
                  3
                </div>
                <h3 className="text-xl font-black text-neutral-900 mb-2">Listo para Imprimir</h3>
                <p className="text-sm font-bold text-neutral-900/90 leading-relaxed mb-4">
                  Obtén tu documento con formato institucional en un solo clic, listo para entregar a tu centro.
                </p>
              </div>
              <Link to="/registro">
                <button className="bg-white hover:bg-neutral-50 text-neutral-900 font-black px-5 py-2.5 rounded-full border-2 border-neutral-900 text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
                  Comenzar Ya
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive DR Map Section */}
      <DRMap />

      {/* Problem Section */}
      <section className="py-24 px-6 bg-white dark:bg-zinc-950 border-t-2 border-neutral-900 relative z-10">
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            title="Sabemos lo que enfrentas cada día"
            subtitle="Entre clases, evaluaciones y requisitos administrativos del MINERD, el tiempo nunca parece alcanzar."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <Clock className="w-8 h-8 text-neutral-900" />,
                title: "Falta de Tiempo",
                description: "La planificación educativa consume horas de tu fin de semana que podrías dedicar a descansar.",
                colorClass: "bg-[#FACDD1] text-neutral-900"
              },
              {
                icon: <Files className="w-8 h-8 text-neutral-900" />,
                title: "Papeleo del MINERD",
                description: "Excesivos formatos curriculares y requisitos burocráticos que consumen tu energía creativa.",
                colorClass: "bg-[#FBE6C2] text-neutral-900"
              },
              {
                icon: <ShieldAlert className="w-8 h-8 text-neutral-900" />,
                title: "Alineación Curricular",
                description: "Dudas constantes sobre si estás cumpliendo exactamente con las últimas adecuaciones vigentes.",
                colorClass: "bg-[#DCDDFF] text-neutral-900"
              },
              {
                icon: <FolderX className="w-8 h-8 text-neutral-900" />,
                title: "Desorganización",
                description: "Documentos de planificación dispersos en cuadernos, archivos de Word y carpetas difíciles de buscar.",
                colorClass: "bg-[#B2F0D1] text-neutral-900"
              },
              {
                icon: <Frown className="w-8 h-8 text-neutral-900" />,
                title: "Estrés y Agotamiento",
                description: "La presión por cumplir con toda la carga burocrática reduce tu motivación para la enseñanza.",
                colorClass: "bg-[#EFF6FF] text-neutral-900"
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-neutral-900" />,
                title: "Seguimiento Manual",
                description: "Llevar el control de indicadores de logro estudiante por estudiante en registros físicos es lento.",
                colorClass: "bg-[#FACDD1] text-neutral-900"
              }
            ].map((pain, index) => (
              <LandingCard key={index} icon={pain.icon} title={pain.title} description={pain.description} colorClass={pain.colorClass} />
            ))}
          </div>
        </div>
      </section>

      {/* Middle Explanatory Hero */}
      <section className="py-24 px-6 bg-[#FAFAFA] dark:bg-zinc-900/10 border-t-2 border-neutral-900 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Visual Plan Canvas Mockup */}
            <div className="lg:col-span-6 relative">
              {/* Background accent decorations */}
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-[#DCDDFF] rounded-full blur-[100px] opacity-40 dark:opacity-20 pointer-events-none" />
              <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-[#FACDD1] rounded-full blur-[100px] opacity-40 dark:opacity-20 pointer-events-none" />
              
              <div className="relative bg-white dark:bg-zinc-900 border-2 border-neutral-900 dark:border-zinc-700 p-6 sm:p-8 rounded-[2rem] shadow-[6px_6px_0px_0px_#1B1B1B] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.08)] select-none">
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-4 border-b-2 border-neutral-900/10 mb-6">
                  <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                    <Layout className="w-5 h-5" />
                    <span className="font-black text-xs uppercase tracking-wider">
                      Lienzo Curricular
                    </span>
                  </div>
                  <span className="text-[10px] font-black bg-[#B2F0D1] text-neutral-900 px-3 py-1 rounded-full border border-neutral-900 uppercase">
                    Alineado 100%
                  </span>
                </div>

                {/* Plan Metadata Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-[10px] font-black bg-[#DCDDFF] text-neutral-900 px-2.5 py-1 rounded-full border border-neutral-900">
                    Primaria
                  </span>
                  <span className="text-[10px] font-black bg-[#FBE6C2] text-neutral-900 px-2.5 py-1 rounded-full border border-neutral-900">
                    4to Grado
                  </span>
                  <span className="text-[10px] font-black bg-[#FACDD1] text-neutral-900 px-2.5 py-1 rounded-full border border-neutral-900">
                    Lengua Española
                  </span>
                </div>

                {/* Mock Content Blocks */}
                <div className="space-y-4">
                  {/* Competencia Específica */}
                  <div className="p-4 bg-neutral-50 dark:bg-zinc-950 border-2 border-neutral-900/10 dark:border-zinc-800 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1.5 text-neutral-900 dark:text-neutral-100">
                      <Target className="w-4 h-4 text-[#FACDD1] fill-[#FACDD1]/20" />
                      <h5 className="text-xs font-black">Competencia Específica</h5>
                    </div>
                    <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 leading-normal">
                      Comprensión oral: Comprende la información de recetas sencillas que escucha para la preparación de platos dominicanos.
                    </p>
                  </div>

                  {/* Indicador de Logro */}
                  <div className="p-4 bg-neutral-50 dark:bg-zinc-950 border-2 border-neutral-900/10 dark:border-zinc-800 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1.5 text-neutral-900 dark:text-neutral-100">
                      <CheckCircle2 className="w-4 h-4 text-[#B2F0D1]" />
                      <h5 className="text-xs font-black">Indicador de Logro</h5>
                    </div>
                    <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 leading-normal">
                      Distingue la estructura y función de la receta (título, ingredientes y preparación) como una guía estructurada.
                    </p>
                  </div>

                  {/* Secuencia Didáctica */}
                  <div className="p-4 bg-neutral-50 dark:bg-zinc-950 border-2 border-neutral-900/10 dark:border-zinc-800 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2 text-neutral-900 dark:text-neutral-100">
                      <Bot className="w-4 h-4 text-[#DCDDFF]" />
                      <h5 className="text-xs font-black">Actividades DUA Sugeridas</h5>
                    </div>
                    <div className="space-y-1.5 text-[10px] font-bold text-neutral-600 dark:text-neutral-450">
                      <div className="flex gap-1.5"><span className="text-emerald-500 font-black">1.</span> Glosario visual de utensilios.</div>
                      <div className="flex gap-1.5"><span className="text-emerald-500 font-black">2.</span> Simulación interactiva de cocina en grupos.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Copy & Actions */}
            <div className="lg:col-span-6 text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#58A0E9]/10 rounded-full text-neutral-900 dark:text-neutral-100 border-2 border-neutral-900 dark:border-zinc-700 font-black text-[10px] uppercase tracking-wider">
                <span>Ecosistema Inteligente</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">
                Tu aliado número uno en planificación.
              </h2>

              <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 font-bold leading-relaxed">
                <span className="bg-[#FACDD1] border border-neutral-900 text-neutral-900 px-2 py-0.5 rounded-md">PLANIX</span> es la plataforma integral diseñada para acompañar a los <span className="underline decoration-brand-primary decoration-2">docentes dominicanos</span> en la organización y alineación curricular oficial.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { title: "Alineación Curricular Oficial", desc: "Competencias e indicadores integrados directamente de la adecuación del MINERD." },
                  { title: "Metodología Inclusiva DUA", desc: "Ajustes razonables y estrategias diversificadas para atender a cada estudiante." },
                  { title: "Impresión en un clic", desc: "Exporta tus borradores con el formato oficial listo para presentar a tu centro." }
                ].map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-[#B2F0D1]">
                      <Check size={12} strokeWidth={3} className="text-neutral-900" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-neutral-900 dark:text-neutral-100">{item.title}</h4>
                      <p className="text-xs font-bold text-neutral-500 dark:text-neutral-450 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link to="/registro" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#58A0E9] hover:bg-[#4890D9] text-neutral-900 border-2 border-neutral-900 rounded-full font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#1B1B1B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#1B1B1B] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer">
                  Planificar Gratis
                </Link>
                <div className="inline-flex items-center px-6 py-4 bg-white dark:bg-zinc-900 rounded-full border-2 border-neutral-900 dark:border-zinc-700 max-w-sm text-xs font-black uppercase text-neutral-700 dark:text-neutral-300">
                  Tecnología de Punta
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-white dark:bg-zinc-950 border-t-2 border-neutral-900 relative z-10">
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            title="¿Qué ganas con PLANIX?"
            subtitle="Diseñada para transformar tu experiencia docente y devolverte el control de tu tiempo."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8 text-neutral-900" />,
                title: "Ahorra Tiempo Real",
                description: "Reduce el trabajo administrativo drásticamente. Planifica en minutos lo que antes tomaba días.",
                colorClass: "bg-[#B2F0D1] text-neutral-900"
              },
              {
                icon: <FolderOpen className="w-8 h-8 text-neutral-900 dark:text-neutral-100" />,
                title: "Todo en un solo Lugar",
                description: "Tus recursos, planificaciones, exámenes y expedientes seguros y accesibles en la nube.",
                colorClass: "bg-white dark:bg-zinc-900 text-neutral-900"
              },
              {
                icon: <CheckCircle2 className="w-8 h-8 text-neutral-900 dark:text-neutral-100" />,
                title: "Alineación Curricular",
                description: "Confianza total al estar 100% alineado a los estándares curriculares vigentes del MINERD.",
                colorClass: "bg-white dark:bg-zinc-900 text-neutral-900"
              },
              {
                icon: <Heart className="w-8 h-8 text-neutral-900 dark:text-neutral-100" />,
                title: "Paz y Tranquilidad",
                description: "Estructuras pedagógicas completas que te dan seguridad ante cualquier supervisión escolar.",
                colorClass: "bg-white dark:bg-zinc-900 text-neutral-900"
              },
              {
                icon: <Target className="w-8 h-8 text-neutral-900 dark:text-neutral-100" />,
                title: "Calidad Didáctica",
                description: "Mejora el aprendizaje en el aula con actividades creativas, lúdicas y adaptadas (DUA).",
                colorClass: "bg-white dark:bg-zinc-900 text-neutral-900"
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-neutral-900 dark:text-neutral-100" />,
                title: "Potencialización Docente",
                description: "Utiliza la inteligencia artificial como un asistente pedagógico de primer nivel.",
                colorClass: "bg-white dark:bg-zinc-900 text-neutral-900"
              }
            ].map((benefit, index) => (
              <LandingCard key={index} icon={benefit.icon} title={benefit.title} description={benefit.description} colorClass={benefit.colorClass} />
            ))}
          </div>
        </div>
      </section>

      {/* Features List Section */}
      <section id="features" className="py-24 px-6 bg-[#EEF8FC] dark:bg-zinc-900/10 border-t-2 border-neutral-900 relative overflow-hidden z-10">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#DCDDFF] rounded-full text-neutral-900 border-2 border-neutral-900 font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
              <Sparkles size={12} className="text-neutral-900" />
              Recursos de primer nivel
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter">
              Herramientas diseñadas <span className="underline decoration-[#58A0E9] decoration-4">para ti</span>
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 font-bold max-w-2xl mx-auto mt-4">
              Todo lo que necesitas para transformar tu práctica docente en un ecosistema inteligente y sencillo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showAllFeatures ? ALL_FEATURES : ALL_FEATURES.slice(0, 6)).map((feature, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border-2 border-neutral-900 dark:border-zinc-700 shadow-[4px_4px_0px_0px_#1B1B1B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1B1B1B] transition-all duration-200 flex flex-col items-start gap-4"
              >
                <div className="w-16 h-16 bg-neutral-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-neutral-900/10 dark:border-zinc-700">
                  <feature.icon className="w-8 h-8 text-neutral-900 dark:text-neutral-100" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300 font-bold text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {!showAllFeatures && (
            <div className="mt-16 text-center">
              <button
                onClick={() => setShowAllFeatures(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-neutral-50 border-2 border-neutral-900 text-neutral-900 rounded-2xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#1B1B1B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#1B1B1B] transition-all cursor-pointer"
              >
                Ver todas las herramientas
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Section (Neobrutalist cards) */}
      <section id="planes" className="py-24 px-6 bg-white dark:bg-zinc-950 border-t-2 border-neutral-900 relative z-10">
        <div className="max-w-5xl mx-auto">
          <SectionTitle
            title="Planes simples para cada docente"
            subtitle="Elige el nivel de acompañamiento que necesitas. Cancela o cambia cuando quieras."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan Card */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-neutral-900 dark:border-zinc-700 p-8 rounded-[2.5rem] shadow-[6px_6px_0px_0px_#1B1B1B] flex flex-col justify-between h-full">
              <div>
                <span className="inline-block bg-[#DCDDFF] border-2 border-neutral-900 text-neutral-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  Acceso Básico
                </span>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">Plan Básico</h3>
                <p className="text-sm font-bold text-neutral-505 mb-6">Prueba la plataforma sin compromisos</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-neutral-900 dark:text-white">RD$ 0</span>
                  <span className="text-sm font-bold text-neutral-500">/ gratis siempre</span>
                </div>

                <div className="h-px bg-neutral-900/10 my-6"></div>

                <ul className="space-y-4 font-bold text-sm text-neutral-700 dark:text-neutral-300">
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-900 bg-[#B2F0D1]">
                      <Check size={12} strokeWidth={3} className="text-neutral-900" />
                    </div>
                    <span>Hasta 3 planificaciones mensuales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-900 bg-[#B2F0D1]">
                      <Check size={12} strokeWidth={3} className="text-neutral-900" />
                    </div>
                    <span>Alineación curricular oficial básica</span>
                  </li>
                  <li className="flex items-center gap-2 text-neutral-400">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100">
                      <X size={12} className="text-neutral-305" />
                    </div>
                    <span>Generador de Exámenes con IA</span>
                  </li>
                  <li className="flex items-center gap-2 text-neutral-400">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100">
                      <X size={12} className="text-neutral-305" />
                    </div>
                    <span>Descargas PDF institucionales ilimitadas</span>
                  </li>
                </ul>
              </div>

              <Link to="/registro" className="mt-8 block">
                <button className="w-full bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-neutral-900 py-3.5 rounded-full font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
                  Comenzar Gratis
                </button>
              </Link>
            </div>

            {/* Pro Plan Card */}
            <div className="bg-[#FBE6C2] border-2 border-neutral-900 p-8 rounded-[2.5rem] shadow-[6px_6px_0px_0px_#1B1B1B] flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FACDD1] border-b-2 border-l-2 border-neutral-900 px-6 py-2 text-[10px] font-black uppercase tracking-wider rounded-bl-3xl">
                Favorito
              </div>

              <div>
                <span className="inline-block bg-[#B2F0D1] border-2 border-neutral-900 text-neutral-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  Acceso Total
                </span>
                <h3 className="text-2xl font-black text-neutral-900 mb-2">Plan Pro</h3>
                <p className="text-sm font-bold text-neutral-700/80 mb-6">Planificaciones e IA sin límites</p>
                <div className="flex items-baseline gap-1 mb-8 text-neutral-900">
                  <span className="text-4xl font-black">RD$ 490</span>
                  <span className="text-sm font-bold">/ mes</span>
                </div>

                <div className="h-px bg-neutral-900/10 my-6"></div>

                <ul className="space-y-4 font-bold text-sm text-neutral-900">
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-900 bg-white">
                      <Check size={12} strokeWidth={3} className="text-neutral-900" />
                    </div>
                    <span>Planificaciones IA ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-900 bg-white">
                      <Check size={12} strokeWidth={3} className="text-neutral-900" />
                    </div>
                    <span>Alineación curricular avanzada MINERD</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-900 bg-white">
                      <Check size={12} strokeWidth={3} className="text-neutral-900" />
                    </div>
                    <span>Generador de Exámenes ilimitado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-900 bg-white">
                      <Check size={12} strokeWidth={3} className="text-neutral-900" />
                    </div>
                    <span>Descargas instantáneas en PDF y Word</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-900 bg-white">
                      <Check size={12} strokeWidth={3} className="text-neutral-900" />
                    </div>
                    <span>Soporte prioritario 24/7 vía WhatsApp</span>
                  </li>
                </ul>
              </div>

              <Link to="/registro" className="mt-8 block">
                <button className="w-full bg-neutral-900 hover:bg-neutral-850 text-white border-2 border-neutral-900 py-3.5 rounded-full font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
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

      {/* Social Community Panel */}
      <SocialCommunity />

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white dark:bg-zinc-950 overflow-hidden relative border-t-2 border-neutral-900 z-10">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">
            Transforma tu planificación hoy mismo.
          </h2>
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 font-bold max-w-2xl mx-auto leading-relaxed">
            Únete a miles de docentes de la República Dominicana que ya están ahorrando tiempo administrativo con la IA de Planix.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={user ? "/dashboard" : "/registro"}
              className="w-full sm:w-auto px-10 py-5 bg-[#58A0E9] hover:bg-[#4890D9] text-neutral-900 border-2 border-neutral-900 rounded-full font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#1B1B1B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1B1B1B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-center"
            >
              Comenzar Gratis
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-zinc-900 text-neutral-900 dark:text-neutral-100 border-2 border-neutral-900 rounded-full font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#1B1B1B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1B1B1B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-center"
            >
              Iniciar Sesión
            </Link>
          </div>

          <p className="text-sm text-neutral-500 font-bold italic pt-2">
            Sin tarjeta de crédito. Resultados inmediatos en segundos.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
