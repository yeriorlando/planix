import React from 'react';
import PublicPageLayout from '../components/layout/PublicPageLayout';
import { 
  Award, 
  Zap, 
  Smile, 
  Heart, 
  HelpCircle,
  Calendar,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function SobrePlanixPage() {
  return (
    <PublicPageLayout
      title="Sobre Planix"
      subtitle="Nuestra misión es devolverle el tiempo a los docentes para que puedan enfocarse en lo que realmente importa: enseñar."
    >
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-16">
        
        {/* Intro Section */}
        <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-all duration-300 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BookOpen size={24} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Nuestra Esencia</h2>
          </div>
          <div className="text-zinc-655 dark:text-zinc-400 text-base leading-relaxed space-y-4">
            <p>
              <strong>Planix</strong> es la primera plataforma inteligente de planificación escolar diseñada específicamente para el currículo educativo de la República Dominicana. Nacimos de una necesidad real: la carga administrativa que agobia a nuestros docentes.
            </p>
            <p>
              Entendemos que la planificación es fundamental para una educación de calidad, pero creemos que no debería consumir todo el tiempo personal del maestro. Por eso, hemos creado una herramienta que combina la normativa oficial del MINERD con tecnología de Inteligencia Artificial de vanguardia.
            </p>
          </div>
        </div>

        {/* The Story Section */}
        <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-amber-500/5 via-[#02327e]/5 to-transparent border border-zinc-200/60 dark:border-zinc-850/60 shadow-xs space-y-6">
          <div className="absolute top-6 right-6 text-zinc-300/20 dark:text-zinc-700/20 pointer-events-none">
            <Heart size={140} className="fill-current" />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-550/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Heart size={24} className="fill-rose-500/20" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Nuestra Historia: La Chispa Detrás del Proyecto</h2>
          </div>
          
          <div className="text-zinc-655 dark:text-zinc-400 text-sm md:text-base leading-relaxed space-y-4 relative z-10">
            <p>
              Todo comenzó en <strong>Noviembre del 2025</strong>. Una noche común, vi a mi novia, <strong>Reyna</strong>, quien es docente del nivel primario, rodeada de cuadernos, mallas impresas y planificaciones manuales. Estaba redactando palabra por palabra cada indicador, competencia y actividad a mano, visiblemente agotada después de una larga jornada de clases.
            </p>
            <p>
              Sorprendido por la cantidad de trabajo manual repetitivo, me acerqué y le pregunté qué hacía. Con resignación, me explicó que estaba planificando sus clases de la semana, calculando promedios por períodos de forma manual, rellenando el resumen anual de asistencia y realizando otros cálculos administrativos complejos, tareas indispensables para su labor docente pero que le tomaban horas y horas de su valioso tiempo libre.
            </p>
            <p>
              En ese instante, la idea brilló con fuerza: <em>"¿Por qué no creamos una plataforma inteligente que automatice este papeleo y te devuelva tus fines de semana?"</em>.
            </p>
            <p>
              Así comenzó un viaje de varios meses de desarrollo continuo y noches sin dormir. Con el apoyo incondicional y la constante retroalimentación pedagógica de <strong>Reyna</strong>, quien nos guió para entender exactamente las necesidades del aula dominicana, logramos dar forma a lo que hoy es <strong>Planix</strong>. Una herramienta hecha por ingenieros, pero diseñada y perfeccionada por y para docentes reales.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pt-4 border-t border-zinc-200/50 dark:border-zinc-800/40">
            <Calendar size={14} /> Desde Noviembre 2025 • Hecho con amor por la educación dominicana
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white pl-4">Nuestros Pilares Fundacionales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Precisión Curricular */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-all duration-300 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                <Award size={24} className="fill-blue-500/20" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Precisión Curricular</h3>
                <p className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed">
                  No somos una plantilla genérica. Cada competencia, indicador y contenido está extraído directamente del Diseño Curricular y el programa CON BASE.
                </p>
              </div>
            </div>

            {/* Eficiencia Real */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-all duration-300 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                <Zap size={24} className="fill-amber-500/20" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Eficiencia Real</h3>
                <p className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed">
                  Automatizamos lo repetitivo para que tu creatividad pedagógica brille. Lo que antes tomaba horas de transcripción, ahora toma minutos de personalización.
                </p>
              </div>
            </div>

            {/* Simplicidad */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-all duration-300 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                <Smile size={24} className="fill-emerald-500/20" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Simplicidad</h3>
                <p className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed">
                  La tecnología no debe ser una barrera. Diseñamos <strong>Planix</strong> para ser intuitivo, amigable y accesible para todo docente, sin importar su nivel tecnológico.
                </p>
              </div>
            </div>

            {/* Compromiso Social */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-all duration-300 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-650 dark:text-purple-400">
                <Heart size={24} className="fill-purple-500/20" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Compromiso Social</h3>
                <p className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed">
                  Creemos en el poder transformador de la educación. Apoyar al docente y dignificar su tiempo personal es apoyar activamente el futuro de nuestro país.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* How it works */}
        <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
            <HelpCircle size={28} />
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">¿Cómo funciona?</h3>
            <p className="text-zinc-655 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
              <strong>Planix</strong> utiliza algoritmos avanzados para sugerirte estrategias didácticas, recursos educativos y criterios de evaluación que se alinean perfectamente con tu grado y asignatura. Esto te permite personalizar, refinar y exportar tus planificaciones pedagógicas listas para entregar en formato digital o impreso.
            </p>
          </div>
        </div>

      </div>
    </PublicPageLayout>
  );
}
