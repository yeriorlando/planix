import React from 'react';
import {
  BrainCircuit,
  FileText,
  Zap,
  Sparkles,
  Search,
  Pencil,
  Table,
  Gamepad2,
  Baby,
  HeartPulse,
  Lightbulb,
  Binary,
  ArrowRight,
  Printer,
  CheckCircle2,
  Cloud,
  Library,
  BadgeCheck,
  Users,
  Calculator,
  ClipboardList,
  UserCircle,
  LineChart,
  BarChart3,
  BookOpenCheck
} from 'lucide-react';
import PublicPageLayout from '../components/layout/PublicPageLayout';
import { Link } from 'react-router-dom';

// --- Sub-components ---

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  alignment?: 'center' | 'left';
}

function SectionHeader({ title, subtitle, badge, alignment = 'center' }: SectionHeaderProps) {
  return (
    <div className={`${alignment === 'center' ? 'text-center mx-auto' : 'text-left'} max-w-3xl mb-12 space-y-3`}>
      {badge && (
        <span className="inline-block bg-brand-light dark:bg-blue-950/20 text-brand-primary text-[10px] font-bold uppercase px-4 py-1.5 rounded-full tracking-widest border border-brand-primary/10 mb-2">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight font-display">
        {title}
      </h2>
      <p className="text-base text-slate-500 dark:text-neutral-400 font-medium leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}

interface MinimalFeatureCardProps {
  icon: any;
  title: string;
  description: string;
  color: string;
  emoji?: string;
}

function MinimalFeatureCard({ icon: Icon, title, description, color, emoji }: MinimalFeatureCardProps) {
  const colorClasses: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30",
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30",
  };

  return (
    <div className="group p-7 rounded-[2rem] border border-slate-100/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-brand-primary/45 dark:hover:border-brand-primary/50 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500">
      <div className={`w-11 h-11 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-5 border relative`}>
        {emoji && <span className="absolute -top-2 -right-2 text-base filter drop-shadow-xs">{emoji}</span>}
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-brand-primary transition-colors uppercase tabular-nums">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-neutral-400 font-medium leading-relaxed text-[13px]">
        {description}
      </p>
    </div>
  );
}

interface FeatureDeepDiveProps {
  icon: any;
  title: string;
  description: string;
  items: string[];
  imageSide?: 'left' | 'right';
  badge: string;
}

function FeatureDeepDive({ icon: Icon, title, description, items, imageSide = 'right', badge }: FeatureDeepDiveProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-8">
      <div className={`space-y-8 ${imageSide === 'right' ? 'order-2 lg:order-1' : 'order-2'}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-zinc-900 rounded-full text-slate-600 dark:text-neutral-300 font-bold text-xs uppercase tracking-widest border border-slate-200 dark:border-zinc-850">
          <Icon size={16} />
          {badge}
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight font-display">
          {title}
        </h2>
        <p className="text-lg text-slate-500 dark:text-neutral-400 font-medium leading-relaxed">
          {description}
        </p>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-455 flex items-center justify-center shrink-0">
                <CheckCircle2 size={14} strokeWidth={3} />
              </div>
              <span className="text-slate-700 dark:text-neutral-250 font-bold">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`relative ${imageSide === 'right' ? 'order-1 lg:order-2' : 'order-1'} group`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-brand-light dark:from-zinc-900 dark:to-brand-primary/10 rounded-[3rem] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
        <div className="bg-white dark:bg-zinc-900 border-4 border-slate-50 dark:border-zinc-850 rounded-[2.5rem] p-8 shadow-xs relative transform transition-transform group-hover:scale-[1.02]">
          {/* Minimalist Mockup Representation */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-zinc-500">
              <Icon size={24} />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-24 bg-slate-200 dark:bg-zinc-750 rounded-full"></div>
              <div className="h-2 w-16 bg-slate-100 dark:bg-zinc-800 rounded-full"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-3 bg-slate-50 dark:bg-zinc-850 rounded-full w-full"></div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-50 dark:border-zinc-800 flex justify-between items-center">
            <div className="h-2 w-20 bg-slate-100 dark:bg-zinc-800 rounded-full"></div>
            <div className="w-8 h-8 rounded-lg bg-brand-light dark:bg-blue-950/20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToolFeatureCardProps {
  icon: any;
  title: string;
  description: string;
  badge?: string;
  emoji?: string;
}

function ToolFeatureCard({ icon: Icon, title, description, badge, emoji }: ToolFeatureCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-850 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform duration-500 relative">
        {emoji && <span className="absolute -top-1 -right-1 text-xl">{emoji}</span>}
        <Icon size={28} strokeWidth={1.5} />
      </div>
      {badge && (
        <span className="inline-block bg-brand-light dark:bg-blue-950/20 text-brand-primary text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full mb-3 tracking-widest border border-brand-primary/10">
          {badge}
        </span>
      )}
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 tracking-tight uppercase">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-neutral-400 text-xs leading-relaxed font-medium mb-6">
        {description}
      </p>
      <div className="mt-auto">
        <Link
          to="/registro"
          className="flex items-center gap-2 text-brand-primary font-bold text-[10px] uppercase tracking-widest group/link"
        >
          Probar ahora <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

// --- Page Component ---

export default function CaracteristicasPage() {
  return (
    <PublicPageLayout
      title="La plataforma definitiva para el docente"
      subtitle="Planix integra gestión académica, infraestructura pedagógica e inteligencia artificial en un solo entorno profesional y minimalista."
    >
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">

        {/* 1. SECCIÓN: GESTIÓN ACADÉMICA (Minimalist Grid) */}
        <section>
          <SectionHeader
            badge="Gestión Académica"
            title="Administración Inteligente"
            subtitle="Todo el control administrativo de tus secciones en una interfaz limpia y sin distracciones."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <MinimalFeatureCard
              icon={Calculator}
              color="emerald"
              title="Cálculo de Promedios"
              description="Algoritmo preciso que gestiona promedios por periodo y finales automáticamente."
            />
            <MinimalFeatureCard
              icon={BarChart3}
              color="blue"
              emoji="📊"
              title="Registro por Competencias"
              description="Evaluación alineada al MINERD vinculada a indicadores de logro específicos."
            />
            <MinimalFeatureCard
              icon={ClipboardList}
              color="indigo"
              emoji="📝"
              title="Asistencia y Control"
              description="Registro de asistencia diario con resúmenes mensuales y anuales automáticos."
            />
            <MinimalFeatureCard
              icon={UserCircle}
              color="purple"
              emoji="🧑‍🎓"
              title="Perfil Estudiantil"
              description="Expediente digital del alumno con historial de notas, conducta y progreso."
            />
            <MinimalFeatureCard
              icon={LineChart}
              color="rose"
              title="Reportes de Progreso"
              description="Analíticas visuales minimalistas para identificar áreas de mejora grupal."
            />
            <MinimalFeatureCard
              icon={BookOpenCheck}
              color="amber"
              title="Control de Secciones"
              description="Gestión centralizada de grupos, horarios y registros pedagógicos."
            />
          </div>
        </section>

        <div className="h-px bg-slate-100 dark:bg-zinc-850 max-w-4xl mx-auto"></div>

        {/* 2. SECCIÓN: DEEP DIVES (Alternating) */}
        <section className="space-y-20">
          <FeatureDeepDive
            badge="Infraestructura"
            icon={Printer}
            title="Impresión Institucional Profesional"
            description="Olvídate de configurar márgenes o encabezados. Planix genera tus documentos con el rigor técnico que exigen los distritos educativos."
            items={[
              "Formato oficial MINERD garantizado",
              "Encabezados institucionales automáticos",
              "Descarga directa en PDF de alta calidad",
              "Ahorro de 5 horas semanales en papeleo"
            ]}
            imageSide="right"
          />

          <FeatureDeepDive
            badge="Evaluación"
            icon={CheckCircle2}
            title="Rúbricas y Listas de Cotejo"
            description="Crea instrumentos de evaluación coherentes y objetivos en segundos. Vinculados directamente a tu planificación."
            items={[
              "Rúbricas analíticas y holísticas",
              "Criterios de evaluación personalizables",
              "Carga automática de indicadores de logro",
              "Interfaz de evaluación táctil"
            ]}
            imageSide="left"
          />

          <FeatureDeepDive
            badge="Curriculum"
            icon={BadgeCheck}
            title="Alineación Curricular 2023"
            description="El primer sistema íntegramente sincronizado con la última adecuación curricular. Planifica con la seguridad de estar al día."
            items={[
              "Competencias Fundamentales y Específicas",
              "Ejes Transversales integrados",
              "Contenidos y Criterios oficiales",
              "Actualización automática ante cambios"
            ]}
            imageSide="right"
          />
        </section>

        {/* 3. SECCIÓN: HERRAMIENTAS INTELIGENTES (Preserved Design) */}
        <section className="bg-slate-50 dark:bg-zinc-900/40 -mx-6 px-6 py-20 rounded-[4rem] border border-neutral-100/50 dark:border-zinc-900">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              badge="Ecosistema IA"
              title="Herramientas IA Especializadas"
              subtitle="Micro-aplicaciones diseñadas para resolver tareas específicas de tu día a día con el poder de la IA."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ToolFeatureCard
                icon={Zap}
                emoji="⚡"
                badge="Básico"
                title="Planificación IA"
                description="Generador de planes diarios y de unidad en segundos."
              />
              <ToolFeatureCard
                icon={FileText}
                emoji="📑"
                badge="Planix Pro"
                title="Generador de Exámenes"
                description="Evaluaciones profesionales con hojas de respuestas."
              />
              <ToolFeatureCard
                icon={Pencil}
                emoji="✏️"
                badge="Planix Pro"
                title="Pizarra Inteligente"
                description="Mapas conceptuales y esquemas visuales automáticos."
              />
              <ToolFeatureCard
                icon={HeartPulse}
                emoji="❤️"
                badge="Planix Pro"
                title="Planix Bienestar"
                description="Estrategias de gestión emocional para el aula."
              />
              <ToolFeatureCard
                icon={Gamepad2}
                emoji="🎲"
                badge="Planix Pro"
                title="Juegos IA"
                description="Sopas de letras y crucigramas personalizados."
              />
              <ToolFeatureCard
                icon={Lightbulb}
                emoji="💡"
                title="Generador de Preguntas"
                description="Cuestionarios de reflexión a partir de cualquier texto."
              />
              <ToolFeatureCard
                icon={Binary}
                emoji="🧠"
                title="Planix Simplifica"
                description="Explicaciones sencillas con técnica de Feynman."
              />
              <ToolFeatureCard
                icon={Search}
                emoji="🎯"
                title="Asistente de Investigación"
                description="Búsqueda y análisis de información pedagógica."
              />
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <div className="bg-[#1B2433] dark:bg-zinc-900 rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden border border-slate-800/50">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight font-display">
              Tu vocación merece las <span className="text-brand-primary">mejores herramientas.</span>
            </h2>
            <p className="text-lg text-slate-400 dark:text-neutral-400 font-medium max-w-2xl mx-auto">
              Planix organiza tu éxito académico mientras tú te enfocas en lo que realmente importa: inspirar a tus alumnos.
            </p>
            <div className="pt-4">
              <Link
                to="/registro"
                className="px-10 py-5 bg-brand-primary hover:bg-brand-hover text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-primary/30 inline-block hover:scale-105 active:scale-95 cursor-pointer"
              >
                Comenzar Gratis Hoy
              </Link>
            </div>
          </div>
        </div>

      </div>
    </PublicPageLayout>
  );
}
