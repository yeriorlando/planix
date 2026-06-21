import React from 'react';
import PublicPageLayout from '../components/layout/PublicPageLayout';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function LegalNoticePage() {
  return (
    <PublicPageLayout
      title="Aviso Legal"
      subtitle="Información importante sobre el alcance y naturaleza de nuestro servicio."
    >
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-12">

          {/* Disclaimer 1: Pedagogical Tool */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-100 dark:border-zinc-850 shadow-xs flex flex-col sm:flex-row gap-6 items-start transition-all">
            <div className="shrink-0 text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/30">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Herramienta de Asistencia, no Sustituto</h3>
              <div className="text-slate-600 dark:text-neutral-300 text-sm leading-relaxed space-y-3">
                <p>
                  Planix es una herramienta tecnológica diseñada para <strong>asistir</strong> al docente en su labor de planificación. El contenido generado por nuestros algoritmos, aunque basado en el currículo oficial, debe ser siempre revisado, validado y contextualizado por el profesional de la educación.
                </p>
                <p>
                  La plataforma no sustituye el juicio pedagógico, la experiencia ni el conocimiento del maestro sobre las necesidades específicas de sus estudiantes.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer 2: MINERD Affiliation */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-100 dark:border-zinc-850 shadow-xs flex flex-col sm:flex-row gap-6 items-start transition-all">
            <div className="shrink-0 text-blue-500 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
              <Info size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Independencia Institucional</h3>
              <div className="text-slate-600 dark:text-neutral-300 text-sm leading-relaxed space-y-3">
                <p>
                  Planix es una iniciativa privada independiente y <strong>no está afiliada directamente</strong> con el Ministerio de Educación de la República Dominicana (MINERD).
                </p>
                <p>
                  Hacemos referencia a documentos oficiales (Diseño Curricular, Adecuación Curricular, Programa CON BASE) exclusivamente como fuente de datos para asegurar que las herramientas sean útiles y pertinentes para el sistema educativo nacional, bajo los principios de acceso a la información pública.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer 3: Content Accuracy */}
          <div className="bg-slate-50 dark:bg-zinc-900/30 p-8 rounded-3xl border border-slate-150 dark:border-zinc-850/80 flex flex-col sm:flex-row gap-6 items-start transition-all">
            <div className="shrink-0 text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100/50 dark:border-rose-900/30">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Exactitud de la Información</h3>
              <div className="text-slate-600 dark:text-neutral-300 text-sm leading-relaxed space-y-3">
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
