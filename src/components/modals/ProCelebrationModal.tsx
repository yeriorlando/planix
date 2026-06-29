import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Zap, CheckCircle2, Crown, User } from 'lucide-react';
import { Usuario } from '../../lib/storage';

interface ProCelebrationModalProps {
  user: Usuario | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProCelebrationModal({ user, isOpen, onClose }: ProCelebrationModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Trigger purple/indigo/gold confetti
      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          colors: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#ffffff'],
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Content - Responsive Circular Style */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-[310px] h-[310px] xs:w-[340px] xs:h-[340px] sm:w-[390px] sm:h-[390px] flex flex-col items-center justify-center p-5 bg-white dark:bg-zinc-900 rounded-full shadow-[0_0_50px_rgba(99,102,241,0.18)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border-8 border-indigo-50 dark:border-zinc-800 text-center overflow-hidden"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />

            {/* Close Button - Red circular background with white X, positioned inside the circle boundary */}
            <button
              onClick={onClose}
              className="absolute top-[48px] right-[48px] xs:top-[54px] xs:right-[54px] sm:top-[64px] sm:right-[64px] w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-650 active:scale-95 text-white shadow-md transition-all cursor-pointer border-none outline-none z-50"
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2.5} />
            </button>

            <div className="relative z-10 flex flex-col items-center gap-1.5 xs:gap-2 sm:gap-2.5">
              {/* Avatar Stage - Replicating the exact design from the image */}
              <div className="relative mb-0.5">
                <div className="relative">
                  {/* Photo container with clean gold ring, no shadow glow */}
                  <div className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-[3px] border-[#e2a400] bg-slate-50 shadow-sm">
                    <img 
                      src={user?.avatar_url || "https://randomuser.me/api/portraits/women/47.jpg"} 
                      alt={user?.nombre || "Docente"} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://randomuser.me/api/portraits/women/47.jpg";
                      }}
                    />
                  </div>
                  
                  {/* Floating User Badge (Bottom-Left) */}
                  <div className="absolute -bottom-1 -left-1 w-5.5 h-5.5 sm:w-7 sm:h-7 bg-[#0046ab] text-white rounded-full border-2 border-white dark:border-zinc-900 shadow-sm flex items-center justify-center">
                    <User className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* Floating Crown Badge (Bottom-Right) */}
                  <div className="absolute -bottom-1 -right-1 w-5.5 h-5.5 sm:w-7 sm:h-7 bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 text-white rounded-full border-2 border-white dark:border-zinc-900 shadow-sm flex items-center justify-center">
                    <Crown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white text-white" />
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-0.5 w-full max-w-[240px] sm:max-w-[290px] overflow-hidden">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[7.5px] sm:text-[8px] font-black uppercase tracking-widest inline-block mb-0.5 border border-indigo-100/50 dark:border-indigo-900/30"
                >
                  ¡Nivel Premium Desbloqueado!
                </motion.div>
                
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-[10px] xs:text-[11px] sm:text-[13px] md:text-[15px] font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight px-4 whitespace-nowrap"
                >
                  ¡YA ERES USUARIO <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">PLANIX PRO</span>!
                </motion.h2>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-1 mt-1 px-4"
                >
                  <div className="flex items-center gap-1.5 text-slate-655 dark:text-zinc-350 font-extrabold text-[8.5px] xs:text-[9px] sm:text-[9.5px]">
                    <Zap size={10} className="text-amber-500 fill-amber-500 shrink-0" />
                    <span>Acceso ilimitado a todas las herramientas</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-655 dark:text-zinc-350 font-extrabold text-[8.5px] xs:text-[9px] sm:text-[9.5px]">
                    <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                    <span>Funciones de Inteligencia Artificial al 100%</span>
                  </div>
                  <p className="text-slate-450 dark:text-zinc-400 font-medium text-[8px] xs:text-[8.5px] sm:text-[9px] mt-1 leading-normal max-w-[170px] xs:max-w-[200px] sm:max-w-[220px]">
                    Disfruta de la mejor experiencia pedagógica de la República Dominicana sin restricciones.
                  </p>
                </motion.div>
              </div>

              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="px-5 py-1.5 xs:px-6 xs:py-1.5 sm:px-7 sm:py-2 bg-[#0046ab] hover:bg-[#003d96] text-white rounded-full font-black shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all text-[8px] xs:text-[8.5px] sm:text-[9px] uppercase tracking-widest mt-1 cursor-pointer border-none outline-none select-none"
              >
                ¡Comenzar ahora!
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
