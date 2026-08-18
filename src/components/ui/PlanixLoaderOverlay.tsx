import React from "react";

interface PlanixLoaderOverlayProps {
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const PlanixLoaderOverlay: React.FC<PlanixLoaderOverlayProps> = ({
  text = "Cargando...",
  fullScreen = true,
  className = "",
}) => {
  return (
    <div
      className={`${
        fullScreen
          ? "fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-bg-base/95 dark:bg-[#0B0B0E]/95 backdrop-blur-md"
          : "w-full py-12 flex flex-col items-center justify-center"
      } select-none transition-all duration-300 animate-in fade-in ${className}`}
      style={{ animationDuration: "250ms" }}
    >
      {/* Contenedor del Loader */}
      <div className="w-[340px] sm:w-[420px] max-w-[88vw] flex flex-col items-center justify-center">
        <img
          src="/planix-loader.svg"
          alt="Planix Loader"
          className="w-full h-auto object-contain pointer-events-none"
        />

        {text && (
          <p className="mt-1 sm:mt-1.5 text-[21px] sm:text-[25px] font-black text-[#02327e] dark:text-[#3B82F6] tracking-tight text-center select-none">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlanixLoaderOverlay;
