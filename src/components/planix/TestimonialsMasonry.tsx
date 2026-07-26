import React from 'react';
import { TestimonialsColumn } from '../ui/testimonials-columns-1';

const firstColumn = [
  {
    text: "Muy práctico, la verdad. Una aplicación indispensable que me ha ahorrado horas de planeación.",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    name: "Altagracia Pérez",
    role: "Docente de Primaria",
  },
  {
    text: "La aplicación es excelente. Ayuda muchísimo con el papeleo de la planificación diaria del MINERD.",
    image: "https://randomuser.me/api/portraits/men/33.jpg",
    name: "José Luis Marte",
    role: "Director de Centro",
  },
  {
    text: "Poder ver las competencias e indicadores alineados al instante es una maravilla. 10/10.",
    image: "https://randomuser.me/api/portraits/men/44.jpg",
    name: "Edwin Ortiz",
    role: "Docente Secundaria",
  }
];

const secondColumn = [
  {
    text: "Mi experiencia ha sido muy satisfactoria. Me ayudó a diseñar actividades DUA sumamente creativas.",
    image: "https://randomuser.me/api/portraits/women/24.jpg",
    name: "Greys M. Tejada",
    role: "Maestra de Grado",
  },
  {
    text: "Una interfaz limpia y muy amigable. Excelente para optimizar el tiempo entre secuencias didácticas.",
    image: "https://randomuser.me/api/portraits/women/47.jpg",
    name: "Paola Mercedes",
    role: "Educadora de Inicial",
  },
  {
    text: "Alineamiento total y velocidad de respuesta. Ahorro tiempo real cada fin de semana.",
    image: "https://randomuser.me/api/portraits/men/51.jpg",
    name: "Eliseo Alvarez",
    role: "Coordinador Pedagógico",
  }
];

const thirdColumn = [
  {
    text: "Me encanta el generador de secuencias didácticas con IA. La adecuación curricular del MINERD se aplica al pie de la letra.",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    name: "Maritza Solano",
    role: "Docente de Matemáticas",
  },
  {
    text: "Planix ha transformado mi forma de enseñar. Las sugerencias de experimentos DUA y dinámicas grupales son de gran ayuda.",
    image: "https://randomuser.me/api/portraits/men/62.jpg",
    name: "Juan Carlos Abreu",
    role: "Docente de Ciencias",
  },
  {
    text: "Una herramienta fantástica. Organizar mis temas curriculares y reportes ahora es un proceso rápido y sin estrés.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Yajaira Castro",
    role: "Docente de Lengua Española",
  }
];

export default function TestimonialsMasonry() {
  return (
    <section className="pt-10 pb-10 px-6 bg-bg-base relative overflow-hidden">
      <div className="absolute top-20 right-[10%] w-[300px] h-[300px] bg-[#02327e]/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-20 left-[10%] w-[300px] h-[300px] bg-[#02b36d]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Lo que dicen <span className="text-[#02b36d]">nuestros usuarios</span>
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-lg mx-auto leading-tight">
            Descubre la experiencia de los docentes que ya están transformando su tiempo.
          </p>
        </div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[640px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
}
