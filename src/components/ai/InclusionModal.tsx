import { useState, useEffect } from "react";
import { Accessibility, Check, Loader2, Info, X, ArrowLeft, Trash } from "lucide-react";
import { toast } from "sonner";
import { generateInclusion } from "../../lib/services/aiService";

const CONDITIONS = [
  { id: "DISLEXIA", label: "Dislexia / Lectoescritura", icon: "📖", desc: "Priorizar soporte visual y auditivo." },
  { id: "TDAH", label: "TDAH (Déficit de Atención)", icon: "⚡", desc: "Pasos cortos e instrucciones fragmentadas." },
  { id: "AUTISMO", label: "Autismo (TEA)", icon: "🧩", desc: "Rutinas estructuradas y apoyo visual directo." },
  { id: "DISCAPACIDAD_VISUAL", label: "Discapacidad Visual", icon: "👓", desc: "Materiales táctiles, lectura guiada y audios." },
  { id: "DISCAPACIDAD_AUDITIVA", label: "Discapacidad Auditiva", icon: "👂", desc: "Apoyo visual, lengua de señas y subtítulos." },
];

interface InclusionResult {
  adapted_activities: string;
  pedagogical_advice: string;
  resources_needed: string[];
}

interface InclusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (adaptedText: string, extraResources?: string[]) => void;
  originalActivities: string;
}

export default function InclusionModal({
  isOpen,
  onClose,
  onApply,
  originalActivities,
}: InclusionModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<string>("DISLEXIA");
  const [result, setResult] = useState<InclusionResult | null>(null);

  // Reset result when modal opens/closes with different content
  useEffect(() => {
    if (!isOpen) {
      setResult(null);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    toast.loading("Generando adaptación curricular...", { id: "ai-inclusion" });

    try {
      const response = await generateInclusion(originalActivities, selectedCondition);
      if (response && response.adapted_activities) {
        setResult(response);
        toast.success("¡Adaptación PEDI generada con éxito!", { id: "ai-inclusion" });
      } else {
        throw new Error("No se pudo obtener la respuesta adaptada.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al adaptar para inclusión", { id: "ai-inclusion" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

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
                <span className="text-indigo-500 mt-1 select-none shrink-0">•</span>
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
            <Accessibility className="w-5 h-5 text-indigo-600" />
            Adaptación Inclusiva (PEDI)
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-all shadow-md border-none active:scale-95"
          >
            <X size={14} className="stroke-[3]" />
          </button>
        </div>

        {!result ? (
          <div className="space-y-5">
            {/* Explicación compacta */}
            <div className="flex flex-col items-center text-center p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl relative overflow-hidden shrink-0">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Accessibility className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-wider">Metodología DUA</span>
              </div>
              <p className="text-slate-600 dark:text-zinc-300 text-xs mt-1 max-w-lg leading-relaxed font-semibold">
                La IA adaptará la secuencia didáctica siguiendo pautas inclusivas específicas para cada condición.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Condición de Aprendizaje del Estudiante:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CONDITIONS.map((c) => {
                  const isActive = selectedCondition === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCondition(c.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left cursor-pointer select-none ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-850 shadow-xs ring-1 ring-indigo-500/20 text-indigo-750 dark:text-indigo-305"
                          : "bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-zinc-805 text-slate-800 dark:text-zinc-300"
                      }`}
                    >
                      <div className={`p-2 rounded-xl text-xl shrink-0 select-none flex items-center justify-center w-9 h-9 ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' 
                          : 'bg-slate-50 dark:bg-zinc-800'
                      }`}>
                        {c.icon}
                      </div>
                      <div className="min-w-0">
                        <span className={`block font-black text-xs leading-tight ${
                          isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-zinc-300'
                        }`}>{c.label}</span>
                        <span className="block text-[10px] opacity-75 font-medium mt-1 leading-snug text-slate-500 dark:text-zinc-450">{c.desc}</span>
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
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-9 px-6 rounded-full shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
              >
                {isGenerating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isGenerating ? "Generando..." : "Adaptar Actividad"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-stretch overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex-1 min-h-0">
            {/* Left Column (Metadata) */}
            <div className="md:col-span-2 flex flex-col gap-4 overflow-y-auto max-h-[380px] pr-2 custom-scrollbar text-left">
              <div className="bg-amber-50/50 dark:bg-amber-955/15 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-4 flex gap-3 text-amber-850 dark:text-amber-305 shrink-0">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                <div className="text-xs italic leading-relaxed">
                  <span className="block font-black mb-1 uppercase tracking-wide text-[10px] text-amber-800 dark:text-amber-400">Consejo Pedagógico:</span>
                  {result.pedagogical_advice}
                </div>
              </div>

              {result.resources_needed && result.resources_needed.length > 0 && (
                <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl text-left shrink-0">
                  <span className="block text-[9px] font-black text-indigo-700 dark:text-indigo-400 uppercase mb-2 tracking-wider">Recursos de Apoyo Específicos:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.resources_needed.map((r, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white dark:bg-zinc-800 text-indigo-750 dark:text-indigo-305 border border-indigo-200/40 dark:border-zinc-750 rounded-lg text-[9px] font-bold shadow-xs">
                        🛠️ {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Activities) */}
            <div className="md:col-span-3 flex flex-col gap-3 overflow-hidden min-h-0">
              <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-zinc-850 pb-2 shrink-0">
                <Accessibility className="w-4.5 h-4.5 text-indigo-500" />
                <h5 className="font-black text-xs uppercase tracking-wider text-neutral-700 dark:text-zinc-350">Actividades Adaptadas:</h5>
              </div>
              <div className="flex-1 p-4 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 overflow-y-auto text-left shadow-inner custom-scrollbar min-h-0 h-[300px]">
                {renderMarkdown(result.adapted_activities)}
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
                    onApply(result.adapted_activities, result.resources_needed);
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
