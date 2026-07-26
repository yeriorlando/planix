import React from 'react';
import PublicPageLayout from '../components/layout/PublicPageLayout';
import { 
  Sparkles, 
  Eye, 
  ShieldAlert, 
  Lock, 
  Cpu, 
  Coins, 
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

export default function PoliticaIAPage() {
  return (
    <PublicPageLayout
      title="Política de Uso de Inteligencia Artificial"
      subtitle="Entendiendo cómo la IA potencia tu planificación en Planix."
    >
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        
        {/* Intro Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-zinc-655 dark:text-zinc-400 text-base md:text-lg leading-relaxed">
            La Inteligencia Artificial es el motor que permite a <strong>Planix</strong> ahorrarte horas de trabajo. Aquí te explicamos con total transparencia qué hace, qué no hace y cómo debes interactuar con ella.
          </p>
        </div>

        <div className="space-y-12">
          
          {/* Main Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Generación Asistida */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-6 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-6 right-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <Cpu size={120} />
              </div>
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Sparkles size={28} className="fill-blue-500/20 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">Generación Asistida</h3>
                <p className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                  Nuestra IA actúa como un "copiloto". Tú defines el destino (tema, grado, intención) y la IA sugiere la ruta (actividades, recursos).
                </p>
                <div className="border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2">Lo que hace:</h4>
                  <ul className="text-zinc-500 dark:text-zinc-400 text-xs space-y-1">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-emerald-500" /> Redacta borradores iniciales
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-emerald-500" /> Sugiere ideas creativas y lúdicas
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-emerald-500" /> Estructura secuencias lógicas y actividades
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Supervisión Humana */}
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-6 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-6 right-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <Eye size={120} />
              </div>
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Eye size={28} className="fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">Supervisión Humana</h3>
                <p className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                  La IA puede cometer errores o tener "alucinaciones" (inventar datos). Es obligatorio que revises el contenido generado.
                </p>
                <div className="border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2">Lo que no hace:</h4>
                  <ul className="text-zinc-500 dark:text-zinc-400 text-xs space-y-1">
                    <li className="flex items-center gap-1.5">
                      <X size={12} className="text-red-500" /> No reemplaza tu criterio pedagógico
                    </li>
                    <li className="flex items-center gap-1.5">
                      <X size={12} className="text-red-500" /> No conoce a tus alumnos como tú
                    </li>
                    <li className="flex items-center gap-1.5">
                      <X size={12} className="text-red-500" /> No valida si los recursos físicos existen en tu escuela
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Límites del Contenido Generado */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <ShieldAlert size={28} className="fill-amber-500/20 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-4">Límites del Contenido Generado</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed space-y-4">
                <p>
                  <strong>Creatividad vs. Exactitud:</strong> La IA es excelente para proponer actividades creativas, pero a veces puede sugerir recursos que no tienes disponibles en tu aula. Tú debes filtrar esto.
                </p>
                <p>
                  <strong>Sesgos:</strong> Aunque filtramos el contenido, los modelos de IA pueden reflejar sesgos culturales generales. Revisa que las actividades sean culturalmente apropiadas para tu contexto.
                </p>
                <p>
                  <strong>Alineación Curricular:</strong> El sistema de <strong>Planix</strong> realiza un mapeo cruzado entre la Inteligencia Artificial y la adecuación curricular oficial del MINERD. No obstante, al ser un proceso probabilístico, el docente debe comprobar la coherencia de las competencias fundamentales y específicas seleccionadas.
                </p>
              </div>
            </div>
          </div>

          {/* Sistema de Créditos de IA */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
              <Coins size={28} className="fill-purple-500/20 text-purple-650 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-4">Sistema de Créditos de IA</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed space-y-3">
                <p>
                  Cada interacción inteligente de generación de contenido (secuencias didácticas completas, exámenes, rúbricas de evaluación o chat avanzado) consume créditos de IA debido al alto coste de cómputo de los modelos de lenguaje:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Plan Gratuito:</strong> Incluye una asignación fija de créditos para probar la plataforma inicialmente.</li>
                  <li><strong>Planes Premium:</strong> Otorgan una cantidad mensual renovable de créditos para planificaciones recurrentes de todo el año escolar.</li>
                  <li><strong>Transparencia:</strong> Puedes consultar en tiempo real el saldo de tus créditos y el coste de cada tipo de planificación en la sección de tu Perfil.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Privacidad en Prompts */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white pl-4">Privacidad en Prompts</h3>
            
            {/* Gold Rule Card */}
            <div className="bg-[#f0f5ff] dark:bg-[#0f1f40] p-6 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row gap-4 items-start max-w-full overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                <AlertCircle size={22} />
              </div>
              <div className="flex-1">
                <h4 className="text-blue-900 dark:text-blue-200 font-bold text-sm uppercase tracking-wider mb-2">Regla de Oro:</h4>
                <p className="text-blue-750 dark:text-blue-300 text-sm leading-relaxed">
                  Nunca introduzcas nombres reales de estudiantes, datos médicos o información sensible en los campos de texto libre que puedan ser procesados por la IA. Usa términos genéricos como "Estudiante A" o "el grupo".
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PublicPageLayout>
  );
}
