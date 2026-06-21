import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, CheckCircle2, Zap, X, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModalCreditosProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits?: number;
  currentCredits?: number;
  actionName?: string; // e.g. "guardar esta planificación", "registrar asistencia", "guardar calificaciones"
}

export default function ModalCreditos({
  isOpen,
  onClose,
  requiredCredits = 15,
  currentCredits = 0,
  actionName = "guardar esta planificación"
}: ModalCreditosProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glass */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal card */}
        <motion.div
          initial={{ scale: 0.92, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 15, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
          className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-2xl text-center z-10 animate-in zoom-in-95 duration-200"
        >
          {/* Decorative Top Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-600 rounded-full blur-xs" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white transition-all cursor-pointer bg-rose-500 hover:bg-rose-600 p-1.5 rounded-full shadow-xs active:scale-95"
          >
            <X size={14} strokeWidth={3} />
          </button>

          {/* Icon Badge */}
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-purple-600 p-[2px] shadow-md">
            <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1">
            ¡Límite de Planix Coins Alcanzado!
          </h2>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-4 px-2">
            Para {actionName} requieres <span className="text-indigo-650 dark:text-indigo-400 font-extrabold">{requiredCredits} PC</span>. 
            Te quedan <span className="text-rose-500 font-extrabold">{currentCredits} PC</span>.
          </p>

          {/* Value Proposition Grid */}
          <div className="bg-slate-50/70 dark:bg-zinc-950/40 rounded-xl py-3 px-3.5 border border-slate-100 dark:border-zinc-800/80 text-left mb-4 space-y-2.5">
            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-0.5">
              Desbloquea Planix PRO
            </span>
            {[
              'Planificaciones curriculares y de unidad ilimitadas.',
              'Asistente de IA (Bloom, Gamificación, Inclusión) sin límites.',
              'Instrumentos de evaluación y rúbricas ilimitadas.',
              'Exportación directa a Word/PDF sin marcas de agua.',
              'Soporte prioritario 24/7 y acceso a nuevos lanzamientos.'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-350 leading-tight">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/perfil');
              }}
              className="w-full h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs rounded-lg shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
            >
              <Zap size={14} className="fill-white" />
              Actualizar a Planix PRO
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full h-9 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-755 dark:text-zinc-300 font-black text-[11px] rounded-lg transition-all cursor-pointer border-none"
            >
              Volver al editor
            </button>
          </div>

          {/* Footer badge */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-slate-455 dark:text-zinc-500 font-bold">
            <ShieldCheck size={11} className="text-emerald-500" />
            Compra 100% segura • Garantía Planix
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
