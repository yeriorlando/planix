import { useState, useEffect } from "react";
import { Gamepad2, Rocket, Trophy, Target, Loader2, Check, X, ArrowLeft, Trash } from "lucide-react";
import { toast } from "sonner";
import { generateGamify } from "../../lib/services/aiService";

interface GamifyResult {
  game_title: string;
  narrative: string;
  gamified_activities: string;
  mechanics: string[];
  rewards: string;
}

interface GamifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (gamifiedText: string) => void;
  originalContent: { intention: string; activities: string };
}

export default function GamifyModal({
  isOpen,
  onClose,
  onApply,
  originalContent,
}: GamifyModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GamifyResult | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<"PUNTAJE" | "NARRATIVA" | "AVENTURA">("PUNTAJE");

  // Reset result when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setResult(null);
    }
  }, [isOpen]);

  const handleGamify = async () => {
    setIsGenerating(true);
    toast.loading("Gamificando actividades de aprendizaje...", { id: "ai-gamify" });

    try {
      const response = await generateGamify(originalContent.intention, originalContent.activities);
      if (response && response.gamified_activities) {
        setResult(response);
        toast.success("¡Clase gamificada exitosamente!", { id: "ai-gamify" });
      } else {
        throw new Error("No se pudo obtener la respuesta gamificada.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al gamificar clase", { id: "ai-gamify" });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return (
      <div className="space-y-2.5 text-slate-700 dark:text-zinc-300 font-medium">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("###")) {
            const title = trimmed.replace(/^###\s*/, "");
            return (
              <h5 key={idx} className="font-black text-slate-800 dark:text-white mt-4 mb-2 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-1 flex items-center gap-1.5">
                {title}
              </h5>
            );
          }
          if (trimmed.startsWith("##")) {
            const title = trimmed.replace(/^##\s*/, "");
            return (
              <h4 key={idx} className="font-black text-slate-900 dark:text-white mt-5 mb-2.5 text-sm uppercase tracking-wider">
                {title}
              </h4>
            );
          }
          if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            const content = trimmed.replace(/^[-*]\s*/, "");
            return (
              <div key={idx} className="flex items-start gap-2 text-xs pl-2">
                <span className="text-pink-500 mt-1 select-none shrink-0">•</span>
                <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
              </div>
            );
          }
          if (trimmed === "") {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[24px] p-5 md:p-6 w-full shadow-2xl relative cursor-default text-left flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-all ${
          result ? "max-w-5xl h-[560px]" : "max-w-3xl"
        }`}
      >
        {/* Header persistente */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-150 dark:border-zinc-800 shrink-0">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-pink-600" />
            Gamificación de Secuencia
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-all shadow-md border-none active:scale-95"
          >
            <X size={14} className="stroke-[3]" />
          </button>
        </div>

        {!result ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-2xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Gamepad2 className="w-24 h-24" />
              </div>
              <Gamepad2 className="w-12 h-12 mb-3 text-pink-200 relative z-10" />
              <p className="text-pink-100 text-xs max-w-md relative z-10 leading-relaxed font-semibold">
                Nuestra IA convertirá tu secuencia en una misión o desafío de juego con mecánicas y narrativas de alta motivación.
              </p>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Estrategia de Gamificación:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: "MISION", label: "Misión Secreta", desc: "Resolver un misterio o reto.", icon: Rocket },
                  { id: "PUNTOS", label: "Puntos & Tablas", desc: "Acumular XP e insignias.", icon: Trophy },
                  { id: "RETOS", label: "Reto del Tiempo", desc: "Desafío contra reloj.", icon: Target },
                ].map((item) => {
                  const isActive = selectedStrategy === item.id;
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedStrategy(item.id as any)}
                      className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer select-none ${
                        isActive
                          ? "bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-850 shadow-xs ring-1 ring-pink-500/20 text-pink-750 dark:text-pink-300"
                          : "bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isActive 
                          ? 'bg-pink-600 text-white shadow-md shadow-pink-500/10' 
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-550'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className={`block font-black text-xs leading-tight ${
                          isActive ? 'text-pink-700 dark:text-pink-300' : 'text-slate-700 dark:text-zinc-300'
                        }`}>{item.label}</span>
                        <span className="block text-[10px] opacity-75 font-medium mt-1 leading-snug text-slate-500 dark:text-zinc-450">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-150 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="bg-white dark:bg-zinc-805 hover:bg-black/5 border border-gray-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-6 rounded-full text-xs font-bold cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGamify}
                disabled={isGenerating}
                className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold h-9 px-6 rounded-full shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
              >
                {isGenerating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isGenerating ? "Diseñando..." : "¡Gamificar Clase!"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-stretch overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex-1 min-h-0">
            {/* Left Column (Metadata) */}
            <div className="md:col-span-2 flex flex-col gap-4 overflow-y-auto max-h-[380px] pr-2 custom-scrollbar text-left">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl p-4 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                  <Trophy className="w-16 h-16 text-indigo-500" />
                </div>
                <div className="relative z-10 text-left">
                  <span className="inline-block px-2.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-md mb-2 uppercase tracking-wider">
                    Misión Activa
                  </span>
                  <h4 className="text-sm font-black text-indigo-950 dark:text-white mb-1">{result.game_title}</h4>
                  <p className="text-[11px] italic text-indigo-800 dark:text-indigo-305 leading-relaxed font-semibold">
                    &quot;{result.narrative}&quot;
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-955/15 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 text-left shrink-0">
                <span className="block text-[9px] font-black text-emerald-700 dark:text-emerald-450 uppercase mb-2 tracking-wider">Mecánicas de Juego:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.mechanics?.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-350 border border-slate-150 dark:border-zinc-750 rounded-lg text-[9px] font-bold shadow-xs">
                      👾 {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50/50 dark:bg-amber-955/15 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20 text-left shrink-0">
                <span className="block text-[9px] font-black text-amber-700 dark:text-amber-450 uppercase mb-1.5 tracking-wider">Recompensa Propuesta:</span>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-305 leading-relaxed">✨ {result.rewards}</span>
              </div>
            </div>

            {/* Right Column (Activities) */}
            <div className="md:col-span-3 flex flex-col gap-3 overflow-hidden min-h-0">
              <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-zinc-850 pb-2 shrink-0">
                <Gamepad2 className="w-4.5 h-4.5 text-pink-500" />
                <h5 className="font-black text-xs uppercase tracking-wider text-neutral-700 dark:text-zinc-350">Actividades de la Misión:</h5>
              </div>
              <div className="flex-1 p-4 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 overflow-y-auto text-left shadow-inner custom-scrollbar min-h-0 h-[300px]">
                {renderMarkdown(result.gamified_activities)}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="col-span-1 md:col-span-5 flex justify-between gap-3 pt-3 border-t border-gray-150 dark:border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="bg-white dark:bg-zinc-805 hover:bg-black/5 border border-gray-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 h-9 px-5 rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver Atrás
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-white dark:bg-zinc-805 hover:bg-red-50 dark:hover:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 h-9 px-5 rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Trash className="w-3.5 h-3.5" />
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onApply(result.gamified_activities);
                    onClose();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold h-9 px-5 rounded-full shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Aplicar Misión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
