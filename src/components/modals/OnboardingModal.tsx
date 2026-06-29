import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Brain, GraduationCap, Calendar, Check, Sparkles } from 'lucide-react';
import { Usuario } from '../../lib/storage';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Usuario | null;
}

export default function OnboardingModal({ isOpen, onClose, user }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      category: "AULA VIRTUAL",
      title: "¡Te damos la bienvenida a Planix!",
      subtitle: "Tu aliado en la educación",
      description: "Hemos diseñado la plataforma definitiva para simplificar tu labor docente, alineada al 100% con el currículo del MINERD.",
      colorClass: "text-[#4F46E5] dark:text-indigo-400",
      bgClass: "bg-[#F0F2FF] dark:bg-indigo-955/20 border-slate-100 dark:border-indigo-900/30",
      image: "/onboarding/saludo.webp",
      icon: <GraduationCap size={16} strokeWidth={2.5} className="text-[#4F46E5] dark:text-indigo-400" />,
      bullets: [
        "Planificación Curricular según directrices del MINERD",
        "Herramientas impulsadas por Inteligencia Artificial",
        "Gestión completa de aula, calificaciones y asistencia"
      ]
    },
    {
      category: "PLANIFICACIÓN",
      title: "Planificación Curricular Inteligente",
      subtitle: "Secuencias didácticas en minutos",
      description: "Planix asocia automáticamente indicadores, competencias y contenidos oficiales de tu grado y asignatura.",
      colorClass: "text-[#E53E3E] dark:text-rose-455",
      bgClass: "bg-[#FFF5F5] dark:bg-rose-955/10 border-slate-100 dark:border-rose-900/30",
      image: "/onboarding/paso 2.webp",
      icon: <Brain size={16} strokeWidth={2.5} className="text-[#E53E3E] dark:text-rose-455" />,
      bullets: [
        "Competencias Específicas e Indicadores de Logro mapeados",
        "Generador de Secuencias Didácticas con Inteligencia Artificial",
        "Exportación a PDF lista para entregar al coordinador"
      ]
    },
    {
      category: "DINÁMICAS",
      title: "Gestión de Aula y Dinámicas",
      subtitle: "Toma el control de tu aula virtual",
      description: "Registra la asistencia de tus alumnos de forma interactiva y gamifica tus clases con dinámicas integradas.",
      colorClass: "text-[#16A34A] dark:text-emerald-400",
      bgClass: "bg-[#F2FAF5] dark:bg-emerald-950/20 border-slate-100 dark:border-emerald-900/30",
      image: "/onboarding/paso 3.webp",
      icon: <Sparkles size={16} strokeWidth={2.5} className="text-[#16A34A] dark:text-emerald-400" />,
      bullets: [
        "Control de Asistencia y Calificaciones automatizado",
        "Juegos educativos integrados (Jeopardy, Ruleta)",
        "Estadísticas de rendimiento en tiempo real"
      ]
    },
    {
      category: "AÑO LECTIVO",
      title: "¡Todo Listo para Empezar!",
      subtitle: "De docente a docente, con amor",
      description: "Planix te acompaña este año escolar. La tecnología se encarga de la burocracia para que tú enseñes.",
      colorClass: "text-[#D97706] dark:text-amber-400",
      bgClass: "bg-[#FFFBEB] dark:bg-amber-955/20 border-slate-100 dark:border-amber-900/35",
      image: "/onboarding/listo.webp",
      icon: <Calendar size={16} strokeWidth={2.5} className="text-[#D97706] dark:text-amber-400" />,
      bullets: [
        "Año escolar activo establecido correctamente",
        "Soporte docente 24/7 y comunidad de colegas",
        "Acceso directo a tus asignaturas asignadas"
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
          {/* Backdrop desenfocado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container con diseño dinámico Split View COMPACTO */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-[650px] bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-150 dark:border-zinc-800 shadow-2xl flex flex-col sm:flex-row text-left overflow-hidden font-sans transition-all duration-500"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-amber-500/5 pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all cursor-pointer border-none outline-none z-50 shadow-sm"
            >
              <X size={14} strokeWidth={2.5} className="text-white" />
            </button>

            {/* Left Pane: Mascot Character (38% width) */}
            <div className="w-full sm:w-[38%] relative min-h-[220px] sm:min-h-0 overflow-hidden">
              <img 
                src={steps[currentStep].image} 
                alt="Mascota Planix" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Right Pane: Content (62% width) */}
            <div className="w-full sm:w-[62%] p-5 xs:p-6 sm:p-7 flex flex-col justify-between min-h-[310px] sm:min-h-[330px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ x: 12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -12, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-3"
                >
                  {/* Tarjeta Header Estilo Dashboard */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white dark:bg-zinc-855 shadow-xs flex items-center justify-center border border-slate-100/50 dark:border-zinc-800 shrink-0">
                      {steps[currentStep].icon}
                    </div>
                    <span className={`text-[11px] font-extrabold tracking-widest uppercase ${steps[currentStep].colorClass}`}>
                      {steps[currentStep].category}
                    </span>
                  </div>

                  {/* Headings */}
                  <div className="space-y-0.5 pt-0.5">
                    <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
                      {steps[currentStep].title}
                    </h2>
                    <h3 className="text-[9px] font-black text-slate-550 dark:text-zinc-400 tracking-wider uppercase">
                      {steps[currentStep].subtitle}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] sm:text-xs text-slate-550 dark:text-zinc-400 font-normal leading-relaxed pr-2">
                    {steps[currentStep].description.split('Planix').map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && <strong className="font-bold">Planix</strong>}
                      </React.Fragment>
                    ))}
                  </p>

                  {/* Bullet features list */}
                  <ul className="space-y-1.5 pt-1.5">
                    {steps[currentStep].bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                        <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center shrink-0">
                          <Check size={10} className="text-white" strokeWidth={3} />
                        </div>
                        <span className="truncate pr-1">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-zinc-800 mt-4 shrink-0">
                {/* Steps indicator dots */}
                <div className="flex items-center gap-1.5">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentStep
                          ? 'w-4 bg-[#0046ab] dark:bg-blue-600'
                          : 'w-1.5 bg-slate-300 dark:bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-1.5">
                  {currentStep > 0 && (
                    <button
                      onClick={handleBack}
                      className="h-8 px-3 rounded-full border border-slate-250 dark:border-zinc-800 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all font-black text-[11px] cursor-pointer outline-none bg-white dark:bg-zinc-800/30 flex items-center gap-1 shadow-3xs"
                    >
                      <ChevronLeft size={12} strokeWidth={2.5} />
                      Atrás
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="h-8 px-4 bg-[#0046ab] hover:bg-[#003d96] text-white rounded-full font-black text-[11px] transition-all shadow-xs active:scale-95 cursor-pointer border-none outline-none flex items-center gap-1"
                  >
                    {currentStep === steps.length - 1 ? '¡Comenzar ahora!' : 'Siguiente'}
                    {currentStep < steps.length - 1 && <ChevronRight size={12} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
