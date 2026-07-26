import React, { useState } from 'react';
import { HelpCircle, MessageCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="pt-10 pb-10 px-6 bg-bg-base relative">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4">
            Preguntas <span className="text-[#02b36d]">Frecuentes</span>
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-xl mx-auto">
            Todo lo que necesitas saber sobre la planificación educativa con IA en República Dominicana.
          </p>
        </div>

        <div className="space-y-5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] p-6 hover:shadow-lg transition-all duration-300"
              >
                {/* Question Trigger */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#02327e]/10 dark:bg-[#02327e]/25">
                      <HelpCircle size={22} className="fill-[#02327e]/20 text-[#02327e]" />
                    </div>
                    <span className="text-base sm:text-lg font-bold text-zinc-850 dark:text-zinc-50 tracking-wide leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-550 dark:text-zinc-400 transition-all duration-300 ${
                      isOpen ? 'rotate-180 bg-[#02327e]/15 text-[#02327e]' : ''
                    }`}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>

                {/* Answer Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 pl-4 sm:pl-16 flex items-start gap-4">
                        <span className="flex-1 text-sm sm:text-base leading-relaxed text-zinc-650 dark:text-zinc-300 font-medium">
                          {faq.answer}
                        </span>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#02b36d]/10 dark:bg-[#02b36d]/25">
                          <MessageCircle size={20} className="fill-[#02b36d]/20 text-[#02b36d]" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-zinc-400 font-medium text-sm">
            ¿Tienes más dudas? Escríbenos directamente por WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}
