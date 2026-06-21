import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "¿Planix está alineado al currículo del MINERD de la República Dominicana?",
    answer: "Sí, absolutamente. Planix ha sido diseñado específicamente bajo el marco de la Adecuación Curricular vigente del Ministerio de Educación de la República Dominicana (MINERD). Incluimos las competencias fundamentales, específicas, indicadores de logro y contenidos actualizados para todos los niveles."
  },
  {
    question: "¿Cómo ayuda la IA a los docentes dominicanos a ahorrar tiempo?",
    answer: "La inteligencia artificial de Planix permite generar borradores completos de planificaciones diarias, semanales y de unidad en segundos. En lugar de escribir todo desde cero, el docente dominicano simplemente revisa, ajusta y personaliza el contenido generado, ahorrando hasta un 80% del tiempo administrativo."
  },
  {
    question: "¿Puedo generar exámenes y recursos educativos para el nivel primario y secundario en Dominicana?",
    answer: "Correcto. Planix cuenta con herramientas para crear exámenes profesionales, cuestionarios, mapas conceptuales y actividades complementarias tanto para el Primer y Segundo Ciclo de Primaria como para todo el Nivel Secundario en la República Dominicana."
  },
  {
    question: "¿Qué es el programa CON BASE y cómo lo integra Planix?",
    answer: "El programa CON BASE es una iniciativa del MINERD para fortalecer los aprendizajes en los primeros grados. Planix integra las guías y secuencias didácticas de este programa, permitiendo a los profesores de los primeros grados de primaria planificar en total sintonía con estas orientaciones oficiales."
  },
  {
    question: "¿Es difícil usar Planix si no soy experto en tecnología?",
    answer: "Para nada. Planix ha sido creado pensando en la facilidad de uso. Si sabes usar WhatsApp o Facebook, podrás usar Planix. Nuestra interfaz es intuitiva y está en español, diseñada para que cualquier docente dominicano pueda empezar a planificar hoy mismo sin complicaciones."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6 bg-[#EEF8FC] dark:bg-zinc-950 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter mb-4 font-display">
            Preguntas <span className="underline decoration-brand-primary decoration-4">Frecuentes</span>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">
            Todo lo que necesitas saber sobre la planificación educativa con IA en República Dominicana.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-white dark:bg-zinc-900 border-2 border-neutral-900 dark:border-zinc-700 transition-all duration-200 overflow-hidden
                  ${isOpen ? 'rounded-[2rem] shadow-[4px_4px_0px_0px_#1B1B1B] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]' : 'rounded-full shadow-[3px_3px_0px_0px_#1B1B1B] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#1B1B1B]'}
                `}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-8 py-5 text-left flex justify-between items-center gap-4 transition-colors cursor-pointer"
                >
                  <span className="text-base md:text-lg font-black text-neutral-900 dark:text-neutral-100 leading-tight">
                    {faq.question}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-900 bg-brand-light dark:bg-zinc-800 text-neutral-900 dark:text-neutral-150 transition-colors">
                    {isOpen ? (
                      <ChevronUp size={16} strokeWidth={2.5} />
                    ) : (
                      <ChevronDown size={16} strokeWidth={2.5} />
                    )}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-8 pb-6 text-neutral-700 dark:text-neutral-300 font-semibold leading-relaxed border-t border-neutral-100 dark:border-zinc-800 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-neutral-500 dark:text-neutral-500 font-bold">
            ¿Tienes más dudas? Escríbenos directamente por WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}
