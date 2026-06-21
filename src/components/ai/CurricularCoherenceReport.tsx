import React from "react";
import { ShieldCheck, ShieldQuestion, X, BrainCircuit, AlertTriangle, Sparkles } from "lucide-react";

export interface AuditResult {
  score: number;
  is_coherent: boolean;
  analysis: string;
  issues?: string[];
  suggestions?: string[];
}

interface CurricularCoherenceReportProps {
  auditResult: AuditResult | null;
  onClose: () => void;
}

const CurricularCoherenceReport: React.FC<CurricularCoherenceReportProps> = ({
  auditResult,
  onClose,
}) => {
  if (!auditResult) return null;

  return (
    <div className="mb-6 rounded-[24px] border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-16px_rgba(16,24,40,0.08)] sm:p-6 animate-in fade-in duration-300 text-left">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-150 dark:border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-sm shrink-0 ${
            auditResult.score >= 90 ? "bg-green-600 shadow-green-500/15" :
            auditResult.score >= 70 ? "bg-amber-500 shadow-amber-500/15" :
            "bg-red-500 shadow-red-500/15"
          }`}>
            {auditResult.score}
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              Coherencia Curricular
              {auditResult.is_coherent ? (
                <ShieldCheck className="h-4.5 w-4.5 text-green-600" />
              ) : (
                <ShieldQuestion className="h-4.5 w-4.5 text-red-500" />
              )}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
              {auditResult.is_coherent ? "Alineación y calidad pedagógica válidas" : "Alineación pedagógica mejorable"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-gray-200 dark:border-zinc-700/80 text-slate-600 dark:text-zinc-300 hover:text-slate-800 dark:hover:text-white h-8 px-3.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all shadow-xs"
        >
          <X className="w-3.5 h-3.5 text-red-500 stroke-[3]" />
          Cerrar reporte
        </button>
      </div>
      
      <div className="p-4 bg-slate-50 dark:bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-2xl mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
            <BrainCircuit className="w-3.5 h-3.5" />
          </div>
          <span className="block text-[9px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">Análisis de Planix AI-</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-zinc-350 leading-relaxed font-semibold whitespace-pre-wrap">
          {auditResult.analysis}
        </p>
      </div>
      
      {auditResult.issues && auditResult.issues.length > 0 && (
        <div className="mb-4 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-red-100/70 dark:bg-red-950/30 text-red-650 dark:text-red-400 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-450">
              Fallas o Vacíos Detectados
            </span>
          </div>
          <div className="space-y-2.5">
            {auditResult.issues.map((issue, idx) => {
              const colonIndex = issue.indexOf(":");
              let formatted: React.ReactNode = issue;
              if (colonIndex !== -1) {
                const boldPart = issue.slice(0, colonIndex + 1);
                const normalPart = issue.slice(colonIndex + 1);
                formatted = (
                  <>
                    <strong className="font-extrabold text-slate-900 dark:text-white">{boldPart}</strong>
                    {normalPart}
                  </>
                );
              }
              return (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300 font-semibold">
                  <span className="text-red-500 select-none font-black text-xs shrink-0 mt-0.5 w-4">{idx + 1}.</span>
                  <p className="leading-relaxed flex-1">{formatted}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {auditResult.suggestions && auditResult.suggestions.length > 0 && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-indigo-100/70 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-450">
              Recomendaciones del Auditor
            </span>
          </div>
          <div className="space-y-2.5">
            {auditResult.suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300 font-semibold">
                <span className="text-indigo-650 dark:text-indigo-400 select-none font-black text-xs shrink-0 mt-0.5 w-4">{idx + 1}.</span>
                <p className="leading-relaxed flex-1">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurricularCoherenceReport;
