import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Sparkles, User } from 'lucide-react';
import { Usuario } from '../../lib/storage';
import AmbassadorBadge from '../ui/AmbassadorBadge';
import MedalStar from '../ui/MedalStar';

interface AmbassadorCelebrationModalProps {
  user: Usuario | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AmbassadorCelebrationModal({ user, isOpen, onClose }: AmbassadorCelebrationModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Disparar confeti por 5 segundos
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'],
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'],
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Fondo desenfocado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Contenido Modal Circular */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="relative w-[310px] h-[310px] xs:w-[340px] xs:h-[340px] sm:w-[390px] sm:h-[390px] flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-full shadow-[0_0_50px_rgba(245,158,11,0.22)] border-8 border-amber-100 dark:border-zinc-800 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-amber-50/50 pointer-events-none" />

            {/* Botón de Cerrar */}
            <button
              onClick={onClose}
              className="absolute top-[48px] right-[48px] xs:top-[54px] xs:right-[54px] sm:top-[64px] sm:right-[64px] w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-md transition-all cursor-pointer border-none outline-none z-50"
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2.5} />
            </button>

            <div className="relative z-10 flex flex-col items-center gap-3 xs:gap-3.5">
              <div className="relative mb-0.5">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  {/* Photo container with clean gold ring */}
                  <div className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-[3px] border-amber-500 bg-slate-50 shadow-md">
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
                  
                  {/* Floating Star Badge (Bottom-Right) */}
                  <div className="absolute -bottom-1 -right-1 w-5.5 h-5.5 sm:w-7 sm:h-7 bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 text-white rounded-full border-2 border-white dark:border-zinc-900 shadow-sm flex items-center justify-center">
                    <MedalStar size={14} className="text-white" />
                  </div>
                </motion.div>

                <div className="absolute -top-2 -right-2 bg-amber-400 p-1 rounded-full shadow-lg border border-white text-white">
                  <Sparkles size={13} fill="currentColor" />
                </div>
              </div>

              <div className="space-y-0.5">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl xs:text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tighter"
                >
                  ¡FELICIDADES!
                </motion.h2>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <p className="text-slate-500 dark:text-zinc-455 font-semibold text-[11px] sm:text-xs">Has sido nombrado</p>
                  <AmbassadorBadge size="md" showPlanixText={true} />
                  <p className="text-slate-600 dark:text-zinc-300 font-bold text-[10px] sm:text-[11px] tracking-tight px-4 mt-1">
                    ¡Esperamos grandes cosas de ti!
                  </p>
                </motion.div>
              </div>

              {/* Enlace para WhatsApp (Grupo de Embajadores) */}
              <motion.a
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                href="https://chat.whatsapp.com/CTxnZvEz6Qr2I2piuSNSDO"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="px-4.5 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full font-bold shadow-lg hover:-translate-y-0.5 transition-all text-[11px] flex items-center gap-2 mt-1 decoration-none"
              >
                Unirme al grupo de Embajadores
              </motion.a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
