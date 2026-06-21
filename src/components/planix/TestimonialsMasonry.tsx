import React from 'react';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  handle: string;
  role: string;
  color: string;
  tags: string[];
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Muy práctico, la verdad. Una aplicación indispensable que me ha ahorrado horas de planeación.",
    author: "Altagracia Pérez",
    handle: "@alta_perez",
    role: "Docente de Primaria",
    color: "bg-[#FACDD1]",
    tags: ["#planixia", "#primariard"]
  },
  {
    id: 2,
    quote: "La aplicación es excelente. Ayuda muchísimo con el papeleo de la planificación diaria del MINERD.",
    author: "José Luis Marte",
    handle: "@joseluis_m",
    role: "Director de Centro",
    color: "bg-[#B2F0D1]",
    tags: ["#educacion", "#minerd"]
  },
  {
    id: 3,
    quote: "Poder ver las competencias e indicadores alineados al instante es una maravilla. 10/10.",
    author: "Edwin Ortiz",
    handle: "@edwin_ortiz",
    role: "Docente Secundaria",
    color: "bg-[#FBE6C2]",
    tags: ["#secundariard", "#eficiente"]
  },
  {
    id: 4,
    quote: "Mi experiencia ha sido muy satisfactoria. Me ayudó a diseñar actividades DUA sumamente creativas.",
    author: "Greys M. Tejada",
    handle: "@greys_tejada",
    role: "Maestra de Grado",
    color: "bg-[#DCDDFF]",
    tags: ["#dua", "#docentesrd"]
  },
  {
    id: 5,
    quote: "Una interfaz limpia y muy amigable. Excelente para optimizar el tiempo entre secuencias didácticas.",
    author: "Paola Mercedes",
    handle: "@paola_m",
    role: "Educadora de Inicial",
    color: "bg-[#FACDD1]",
    tags: ["#inicial", "#planix"]
  },
  {
    id: 6,
    quote: "Alineamiento total y velocidad de respuesta. Ahorro tiempo real cada fin de semana.",
    author: "Eliseo Alvarez",
    handle: "@eliseo_alv",
    role: "Coordinador Pedagógico",
    color: "bg-[#B2F0D1]",
    tags: ["#pedagogiard", "#planixpro"]
  }
];

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  // Extract initials
  const initials = testimonial.author
    .split(' ')
    .map(name => name[0])
    .join('')
    .substring(0, 2);

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-neutral-900 dark:border-zinc-700 p-6 rounded-[2rem] shadow-[4px_4px_0px_0px_#1B1B1B] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#1B1B1B] transition-all flex flex-col justify-between">
      <div>
        {/* User Info Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full border-2 border-neutral-900 flex items-center justify-center font-black text-xs text-neutral-900 ${testimonial.color}`}>
            {initials}
          </div>
          <div>
            <h4 className="font-black text-sm text-neutral-900 dark:text-neutral-100 leading-none">
              {testimonial.author}
            </h4>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-450 font-semibold mt-0.5 block">
              {testimonial.handle} • {testimonial.role}
            </span>
          </div>
        </div>

        {/* Quote */}
        <p className="text-neutral-800 dark:text-neutral-200 font-bold text-sm leading-relaxed mb-4">
          &quot;{testimonial.quote}&quot;
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-2">
        {testimonial.tags.map((tag, idx) => (
          <span key={idx} className="text-[10px] font-black text-neutral-550 dark:text-neutral-400 bg-neutral-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-neutral-900/10">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsMasonry() {
  return (
    <section className="py-24 px-6 bg-[#EEF8FC] dark:bg-zinc-950 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter mb-4 font-display">
            Lo que dicen <span className="underline decoration-brand-primary decoration-4">nuestros docentes</span>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium max-w-lg mx-auto leading-tight">
            Descubre la experiencia de los docentes dominicanos que ya están transformando su tiempo administrativo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
