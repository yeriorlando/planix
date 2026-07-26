import React from 'react';
import PublicPageLayout from '../components/layout/PublicPageLayout';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function LegalNoticePage() {
  return (
    <PublicPageLayout
      title="Aviso Legal"
      subtitle="Información importante sobre el alcance y naturaleza de nuestro servicio."
    >
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="space-y-8">

          {/* Disclaimer 1: Pedagogical Tool */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={28} className="fill-amber-500/20 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">Herramienta de Asistencia, no Sustituto</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed space-y-3">
                <p>
                  <strong>Planix</strong> es una herramienta tecnológica diseñada para <strong>asistir</strong> al docente en su labor de planificación. El contenido generado por nuestros algoritmos, aunque basado en el currículo oficial, debe ser siempre revisado, validado y contextualizado por el profesional de la educación.
                </p>
                <p>
                  La plataforma no sustituye el juicio pedagógico, la experiencia ni el conocimiento del maestro sobre las necesidades específicas de sus estudiantes.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer 2: MINERD Affiliation */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Info size={28} className="fill-blue-500/20 text-blue-650 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">Independencia Institucional</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed space-y-3">
                <p>
                  <strong>Planix</strong> es una iniciativa privada independiente y <strong>no está afiliada directamente</strong> con el Ministerio de Educación de la República Dominicana (MINERD).
                </p>
                <p>
                  Hacemos referencia a documentos oficiales (Diseño Curricular, Adecuación Curricular, Programa CON BASE) exclusivamente como fuente de datos para asegurar que las herramientas sean útiles y pertinentes para el sistema educativo nacional, bajo los principios de acceso a la información pública.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer 3: Content Accuracy */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
              <ShieldAlert size={28} className="fill-rose-500/20 text-rose-600 dark:text-rose-455" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white mb-3">Exactitud de la Información</h3>
              <div className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed space-y-3">
                <p>
                  Aunque nos esforzamos por mantener nuestra base de datos actualizada con las últimas normativas y mallas curriculares, la educación es un campo en constante evolución. No garantizamos que toda la información disponible en la plataforma esté libre de errores o completamente actualizada al día de hoy.
                </p>
                <p>
                  Recomendamos siempre cotejar con las versiones oficiales vigentes publicadas por el Ministerio de Educación de la República Dominicana.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PublicPageLayout>
  );
}
