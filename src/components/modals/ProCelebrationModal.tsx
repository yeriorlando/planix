import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Zap, CheckCircle2, Crown } from 'lucide-react';
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
            className="relative w-[340px] h-[340px] xs:w-[380px] xs:h-[380px] sm:w-[450px] sm:h-[450px] flex flex-col items-center justify-center p-6 xs:p-8 sm:p-10 bg-white dark:bg-zinc-900 rounded-full shadow-[0_0_60px_rgba(99,102,241,0.2)] dark:shadow-[0_0_60px_rgba(0,0,0,0.5)] border-8 border-indigo-50 dark:border-zinc-800 text-center overflow-hidden"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />

            {/* Close Button - Red circular background with white X, positioned inside the circle boundary */}
            <button
              onClick={onClose}
              className="absolute top-[52px] right-[52px] xs:top-[58px] xs:right-[58px] sm:top-[72px] sm:right-[72px] w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-650 active:scale-95 text-white shadow-md transition-all cursor-pointer border-none outline-none z-50"
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2.5} />
            </button>

            <div className="relative z-10 flex flex-col items-center gap-2 xs:gap-3 sm:gap-3.5">
              {/* Avatar Stage */}
              <div className="relative mb-0.5">
                <motion.div
                  animate={{
                    y: [0, -6, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  {/* Outer glowing ring */}
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 rounded-full blur-xs opacity-75 animate-pulse" />
                  
                  {/* Photo container */}
                  <div className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 bg-slate-50 shadow-md">
                    <img 
                      src={user?.avatar_url || "https://randomuser.me/api/portraits/women/47.jpg"} 
                      alt={user?.nombre || "Docente"} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://randomuser.me/api/portraits/women/47.jpg";
                      }}
                    />
                  </div>
                  
                  {/* Floating Crown Badge */}
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 text-white p-0.5 sm:p-1 rounded-full border-2 border-white dark:border-zinc-900 shadow-md">
                    <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
                  </div>
                </motion.div>
              </div>

              {/* Text Content */}
              <div className="space-y-1 sm:space-y-1.5">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest inline-block mb-0.5 border border-indigo-100/50 dark:border-indigo-900/30"
                >
                  ¡Nivel Premium Desbloqueado!
                </motion.div>
                
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs xs:text-sm sm:text-xl md:text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight px-4"
                >
                  ¡YA ERES USUARIO <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">PLANIX PRO</span>!
                </motion.h2>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2 px-4 xs:px-6 sm:px-8"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-655 dark:text-zinc-350 font-extrabold text-[9.5px] xs:text-[10px] sm:text-[11px]">
                    <Zap size={11} className="text-amber-500 fill-amber-500 shrink-0 sm:w-3.5 sm:h-3.5" />
                    <span>Acceso ilimitado a todas las herramientas</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-655 dark:text-zinc-350 font-extrabold text-[9.5px] xs:text-[10px] sm:text-[11px]">
                    <CheckCircle2 size={11} className="text-emerald-500 shrink-0 sm:w-3.5 sm:h-3.5" />
                    <span>Funciones de Inteligencia Artificial al 100%</span>
                  </div>
                  <p className="text-slate-450 dark:text-zinc-400 font-medium text-[8.5px] xs:text-[9px] sm:text-[10px] mt-1 sm:mt-1.5 leading-normal max-w-[200px] xs:max-w-[240px] sm:max-w-[260px]">
                    Disfruta de la mejor experiencia pedagógica de la República Dominicana sin restricciones.
                  </p>
                </motion.div>
              </div>

              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="px-6 py-1.5 xs:px-7 xs:py-2 sm:px-8 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full font-black shadow-md shadow-indigo-200/50 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all text-[8.5px] xs:text-[9px] sm:text-[10px] uppercase tracking-widest mt-1 sm:mt-2 cursor-pointer border-none outline-none select-none"
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
