import React from "react";

interface LoaderProgressiveBarProps {
  text?: string;
  className?: string;
}

const LoaderProgressiveBar: React.FC<LoaderProgressiveBarProps> = ({ text = "Cargando", className }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-1.5 select-none ${className || ""}`}>
      {/* Loading text */}
      <div className="dark:text-white text-slate-800 text-[14pt] font-semibold ml-[10px]">
        {text}
        <span className="ml-[3px] animate-[blink_1.5s_infinite]">.</span>
        <span className="ml-[3px] animate-[blink_1.5s_infinite] [animation-delay:0.3s]">
          .
        </span>
        <span className="ml-[3px] animate-[blink_1.5s_infinite] [animation-delay:0.6s]">
          .
        </span>
      </div>

      {/* Bar background */}
      <div className="flex items-center box-border p-[5px] w-[200px] h-[30px] bg-[#212121] shadow-[inset_-2px_2px_4px_#0c0c0c] rounded-[15px]">
        {/* Loading bar */}
        <div className="relative flex justify-center flex-col w-0 h-[20px] overflow-hidden rounded-[10px]
          bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-hover)]
          animate-[loading-anim_3s_ease-out_infinite]">

          {/* White bars */}
          <div className="absolute flex items-center gap-[18px]">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="w-[10px] h-[45px] opacity-30 rotate-45
                  bg-gradient-to-tr from-white to-transparent"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes loading-anim {
          0% {
            width: 0;
          }
          85% {
            width: 100%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoaderProgressiveBar;
