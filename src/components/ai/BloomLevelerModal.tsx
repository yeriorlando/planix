import { useState, useEffect } from "react";
import { BrainCircuit, TrendingUp, Check, Loader2, Info, X, ArrowLeft, Trash } from "lucide-react";
import { toast } from "sonner";
import { generateBloom } from "../../lib/services/aiService";

interface BloomResult {
  current_level: string;
  analysis: string;
  leveled_activities: string;
  suggested_verbs: string[];
}

interface BloomLevelerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (leveledText: string) => void;
  originalActivities: string;
}

export default function BloomLevelerModal({
  isOpen,
  onClose,
  onApply,
  originalActivities,
}: BloomLevelerModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<"ELEMENTAL" | "ACEPTABLE" | "SATISFACTORIO">("ACEPTABLE");
  const [result, setResult] = useState<BloomResult | null>(null);

  // Reset result when modal opens/closes with different content
  useEffect(() => {
    if (!isOpen) {
      setResult(null);
    }
  }, [isOpen]);

  const handleLevelUp = async () => {
    setIsGenerating(true);
    toast.loading("Optimizando nivel cognitivo...", { id: "ai-bloom" });

    try {
      const response = await generateBloom(originalActivities, selectedLevel);
      if (response && response.leveled_activities) {
        setResult(response);
        toast.success("¡Optimización de Bloom completada!", { id: "ai-bloom" });
      } else {
        throw new Error("No se pudo obtener la respuesta optimizada.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al nivelar con Bloom", { id: "ai-bloom" });
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
                <span className="text-violet-500 mt-1 select-none shrink-0">•</span>
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

  const getLevelColor = (level: string) => {
    const lower = level.toLowerCase();
    if (lower.includes("crear") || lower.includes("evaluar") || lower.includes("satisfactorio")) {
      return "text-purple-605 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-955/20 dark:border-purple-900/30";
    }
    if (lower.includes("analizar") || lower.includes("aplicar") || lower.includes("aceptable")) {
      return "text-blue-605 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-955/20 dark:border-blue-900/30";
    }
    return "text-amber-605 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-955/20 dark:border-amber-900/30";
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
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-150 dark:border-zinc-800 shrink-0">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-violet-600" />
            Optimizar Nivel Cognitivo (Bloom)
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
            <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <BrainCircuit className="w-24 h-24" />
              </div>
              <BrainCircuit className="w-12 h-12 mb-3 text-violet-200 relative z-10" />
              <p className="text-violet-100 text-xs max-w-md relative z-10 leading-relaxed font-semibold">
                Nuestra IA analizará la exigencia cognitiva de tu secuencia de actividades y la elevará o adaptará según el nivel de Bloom deseado.
              </p>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Selecciona el nivel cognitivo objetivo:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: "ELEMENTAL", label: "Elemental", desc: "Conocimiento y Comprensión básica." },
                  { id: "ACEPTABLE", label: "Aceptable", desc: "Aplicación y Análisis intermedio." },
                  { id: "SATISFACTORIO", label: "Satisfactorio", desc: "Evaluación y Creación superior." },
                ].map((item) => {
                  const isActive = selectedLevel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedLevel(item.id as any)}
                      className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 cursor-pointer select-none ${
                        isActive
                          ? "bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-850 shadow-xs ring-1 ring-violet-500/20"
                          : "bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isActive 
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-500/10' 
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-550'
                      }`}>
                        <BrainCircuit className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className={`block text-xs font-black leading-tight ${
                          isActive ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-zinc-300'
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
                onClick={handleLevelUp}
                disabled={isGenerating}
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold h-9 px-6 rounded-full shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
              >
                {isGenerating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isGenerating ? "Analizando..." : "Aplicar Nivel"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-stretch overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex-1 min-h-0">
            {/* Left Column (Metadata) */}
            <div className="md:col-span-2 flex flex-col gap-4 overflow-y-auto max-h-[380px] pr-2 custom-scrollbar text-left">
              <div className={`p-4 rounded-2xl border flex flex-col shadow-xs shrink-0 ${getLevelColor(result.current_level)}`}>
                <span className="block text-[9px] font-black uppercase tracking-wider mb-1.5 opacity-70">Nivel Detectado:</span>
                <span className="text-base font-black tracking-tight">{result.current_level}</span>
              </div>
              
              <div className="p-4 bg-neutral-50 dark:bg-zinc-950/40 border border-neutral-200 dark:border-zinc-800/80 rounded-2xl flex items-start gap-3 shadow-xs shrink-0 text-left">
                <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-neutral-100 dark:border-zinc-800 shadow-xs flex-shrink-0">
                  <Info className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-550 mb-1.5">Análisis Psicopedagógico</span>
                  <p className="text-xs text-neutral-600 dark:text-zinc-350 leading-relaxed font-medium">{result.analysis}</p>
                </div>
              </div>

              {result.suggested_verbs && result.suggested_verbs.length > 0 && (
                <div className="p-4 bg-violet-50/40 dark:bg-violet-950/10 border border-violet-100 dark:border-violet-900/20 rounded-2xl text-left shrink-0">
                  <span className="block text-[9px] font-black text-violet-700 dark:text-violet-400 uppercase mb-2 tracking-wider">Verbos Sugeridos:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.suggested_verbs.map((v, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white dark:bg-zinc-800 text-violet-750 dark:text-violet-300 border border-violet-200/40 dark:border-zinc-750 rounded-lg text-[9px] font-black uppercase shadow-xs">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Activities) */}
            <div className="md:col-span-3 flex flex-col gap-3 overflow-hidden min-h-0">
              <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-zinc-850 pb-2 shrink-0">
                <TrendingUp className="w-4.5 h-4.5 text-violet-500" />
                <h5 className="font-black text-xs uppercase tracking-wider text-neutral-700 dark:text-zinc-350">Versión Optimizada:</h5>
              </div>
              <div className="flex-1 p-4 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 overflow-y-auto text-left shadow-inner custom-scrollbar min-h-0 h-[300px]">
                {renderMarkdown(result.leveled_activities)}
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
                    onApply(result.leveled_activities);
                    onClose();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold h-9 px-5 rounded-full shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Aplicar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
