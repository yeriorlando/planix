import React from 'react';
import { Sparkles } from 'lucide-react';
import MedalStar from './MedalStar';

interface AmbassadorBadgeProps {
  className?: string;
  showText?: boolean;
  showPlanixText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AmbassadorBadge({
  className = "",
  showText = true,
  showPlanixText = true,
  size = 'md'
}: AmbassadorBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[7px] gap-1',
    md: 'px-2.5 py-1 text-[10px] gap-1.5',
    lg: 'px-4 py-1.5 text-[12px] gap-2'
  };

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 18
  };

  return (
    <div
      title="Embajador Planix"
      className={`
        relative flex items-center justify-center font-black uppercase tracking-widest
        bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600
        text-white rounded-full shadow-md
        transition-all cursor-help border border-white/30
        w-fit
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {/* Línea de brillo interna */}
      <div className="absolute inset-0 border-t border-white/20 rounded-full" />

      <MedalStar size={iconSizes[size]} className="text-white drop-shadow-sm flex-shrink-0" />

      {showText && (
        <span className="relative z-10 drop-shadow-sm whitespace-nowrap">
          Embajador {showPlanixText && <span>Planix</span>}
        </span>
      )}

      <Sparkles
        size={iconSizes[size] - 1}
        className="absolute -top-1 -right-1 text-white"
      />
    </div>
  );
}
