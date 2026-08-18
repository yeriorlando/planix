import React, { useState, useRef } from "react";
import {
  X,
  FileSpreadsheet,
  FileText,
  UploadCloud,
  CheckCircle2,
  Users,
  Columns3,
  ArrowRight,
  Plus,
  RefreshCw,
  Search,
  AlertCircle,
  Loader2,
  Check
} from "lucide-react";
import { Student } from "../../lib/storage";
import {
  analizarArchivoExcel,
  descargarPlantillaExcel,
  ExcelAnalysisResult,
  AnalyzedStudentRow
} from "../../lib/excelEstudiantes";
import { toast } from "sonner";

interface ImportEstudiantesModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroomId: string;
  existingStudents: Student[];
  onConfirmImport: (analyzedRows: AnalyzedStudentRow[]) => Promise<void> | void;
}

export default function ImportEstudiantesModal({
  isOpen,
  onClose,
  classroomId,
  existingStudents,
  onConfirmImport,
}: ImportEstudiantesModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<ExcelAnalysisResult | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "NUEVO" | "ACTUALIZAR" | "SIN_CAMBIOS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setAnalysis(null);
    setSelectedFilter("ALL");
    setSearchQuery("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const processFile = async (file: File) => {
    // Validar extensión
    const validExts = [".xlsx", ".xls", ".csv"];
    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      toast.error("Formato no soportado. Por favor sube un archivo .xlsx, .xls o .csv");
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo supera el tamaño máximo permitido de 5MB.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analizarArchivoExcel(file, classroomId, existingStudents);
      if (result.rows.length === 0) {
        toast.error("No se encontraron estudiantes válidos en el archivo.");
        return;
      }
      setAnalysis(result);
      toast.success(`Archivo procesado: ${result.totalRows} estudiantes analizados.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Error al procesar el archivo Excel.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleConfirm = async () => {
    if (!analysis || analysis.rows.length === 0) return;
    setIsSubmitting(true);
    try {
      await onConfirmImport(analysis.rows);
      handleClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Ocurrió un error al guardar los estudiantes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrado de filas en la vista previa
  const filteredRows = analysis?.rows.filter((row) => {
    const matchesFilter =
      selectedFilter === "ALL" || row.status === selectedFilter;
    const fullName = `${row.student.nombre} ${row.student.apellido || ""}`.toLowerCase();
    const rne = (row.student.rne_matricula || "").toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      fullName.includes(searchQuery.toLowerCase()) ||
      rne.includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B1B1B]/40 backdrop-blur-sm p-3 sm:p-4 cursor-pointer animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 rounded-[28px] max-w-[480px] w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col cursor-default animate-in zoom-in-95 duration-200"
      >
        {/* MODAL HEADER - Navy Blue Branding */}
        <div className="bg-[#162c4e] text-white p-4 sm:px-5 relative flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/90 shrink-0 shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-black tracking-tight text-white leading-tight">
                Importar Estudiantes desde Excel
              </h3>
              <p className="text-[11px] text-white/75 font-medium mt-0.5">
                Carga o actualiza tus estudiantes de forma masiva en segundos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-md shrink-0 border-none"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 flex flex-col space-y-3 overflow-hidden">
          {!analysis ? (
            /* STAGE 1: Dropzone & Template Download */
            <div className="space-y-3">
              {/* Plantilla info banner */}
              <div className="bg-[#f3f7fb] dark:bg-zinc-800/60 border border-[#d8e3f0] dark:border-zinc-700/60 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-[#02327e] dark:text-blue-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[12.5px] font-black text-slate-800 dark:text-zinc-100 leading-tight">
                      ¿No tienes la plantilla actualizada?
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                      Descarga la plantilla en blanco, modifícala y vuelve a subirla.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => descargarPlantillaExcel()}
                  className="bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 px-3.5 py-1.5 rounded-full font-bold text-[11px] shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
                >
                  Descargar Plantilla
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center transition-all cursor-pointer select-none ${
                  isDragging
                    ? "border-[#02327e] bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]"
                    : "border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 bg-slate-50/40 dark:bg-zinc-900/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-3 space-y-2">
                    <Loader2 className="w-8 h-8 text-[#02327e] animate-spin" />
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Analizando archivo Excel y verificando estudiantes...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-2.5 text-slate-500 dark:text-zinc-400 shadow-2xs">
                      <UploadCloud className="w-5 h-5 text-slate-600 dark:text-zinc-300" />
                    </div>
                    <p className="text-[12.5px] font-bold text-slate-700 dark:text-zinc-200">
                      Arrastra tu archivo Excel aquí o{" "}
                      <span className="text-[#02327e] dark:text-blue-400 underline underline-offset-2">
                        examina tu equipo
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">
                      Formatos soportados: .xlsx, .xls o .csv (Máx. 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* STAGE 2: Preview & Comparison (Compact, only list scrolls) */
            <div className="space-y-3 flex flex-col">
              {/* File confirmation bar */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-2.5 px-3.5 flex items-center justify-between gap-3 shadow-2xs shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <div className="text-[12px] font-extrabold text-slate-800 dark:text-zinc-100 truncate">
                      Archivo: {analysis.fileName}
                    </div>
                    <div className="text-[10.5px] text-slate-500 dark:text-zinc-400 font-medium">
                      Revisa la vista previa antes de confirmar.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 px-3 py-1 rounded-full font-bold text-[10.5px] shadow-2xs transition cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
                >
                  Cambiar archivo
                </button>
              </div>

              {/* 2 Summary / Metric Cards */}
              <div className="grid grid-cols-2 gap-2.5 shrink-0">
                {/* Card 1: Estudiantes Detectados */}
                <div className="p-2.5 px-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200">
                    <Users className="w-3.5 h-3.5 text-[#02327e] dark:text-blue-400" />
                    <span className="text-[11.5px] font-black">
                      Estudiantes ({analysis.totalRows})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pt-0.5">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Plus className="w-3 h-3" />
                      <span>{analysis.nuevosCount} nuevos</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      <RefreshCw className="w-3 h-3" />
                      <span>{analysis.actualizarCount} a actualizar</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Columnas Detectadas */}
                <div className="p-2.5 px-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200">
                    <Columns3 className="w-3.5 h-3.5 text-[#02327e] dark:text-blue-400" />
                    <span className="text-[11.5px] font-black">Columnas ({analysis.detectedColumns.length})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 pt-0.5">
                    <Check className="w-3 h-3" />
                    <span>Sin duplicados automáticos</span>
                  </div>
                </div>
              </div>

              {/* Title & Filter Tabs with distinct background colors */}
              <div className="flex items-center justify-between gap-2 pt-0.5 shrink-0">
                <div className="text-[11.5px] font-black text-slate-800 dark:text-zinc-200">
                  Previsualización de alumnos ({analysis.totalRows}):
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSelectedFilter("ALL")}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer border ${
                      selectedFilter === "ALL"
                        ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-xs font-black"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-200/70"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFilter("NUEVO")}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer border ${
                      selectedFilter === "NUEVO"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-black"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100"
                    }`}
                  >
                    Nuevos ({analysis.nuevosCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFilter("ACTUALIZAR")}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer border ${
                      selectedFilter === "ACTUALIZAR"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs font-black"
                        : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-100"
                    }`}
                  >
                    Actualizar ({analysis.actualizarCount})
                  </button>
                </div>
              </div>

              {/* Student Rows List with custom vertical scrollbar */}
              <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
                <div className="max-h-[195px] overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80 [scrollbar-width:thin] [scrollbar-color:#162c4e_#f1f5f9] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 dark:[&::-webkit-scrollbar-track]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:bg-[#162c4e] dark:[&::-webkit-scrollbar-thumb]:bg-blue-500 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {filteredRows.length > 0 ? (
                    filteredRows.map((row, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 px-3 hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              row.student.genero === "F"
                                ? "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                            }`}
                          >
                            {row.student.genero}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-bold text-slate-800 dark:text-zinc-100 truncate">
                              {row.student.nombre} {row.student.apellido || ""}
                            </div>
                            <div className="text-[10.5px] text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1.5">
                              <span>
                                {row.student.rne_matricula
                                  ? `RNE: ${row.student.rne_matricula}`
                                  : "Sin RNE"}
                              </span>
                              {row.student.tutor_nombre && (
                                <>
                                  <span>•</span>
                                  <span>Tutor: {row.student.tutor_nombre}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {row.status === "NUEVO" && (
                            <span className="inline-flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                              <Plus className="w-2.5 h-2.5" /> Nuevo
                            </span>
                          )}
                          {row.status === "ACTUALIZAR" && (
                            <span className="inline-flex items-center gap-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md" title={row.changesSummary.join(", ")}>
                              <RefreshCw className="w-2.5 h-2.5" /> Actualizar
                            </span>
                          )}
                          {row.status === "SIN_CAMBIOS" && (
                            <span className="inline-flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                              <Check className="w-2.5 h-2.5" /> Sin cambios
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 font-medium">
                      No hay estudiantes que coincidan con el filtro seleccionado.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 sm:px-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-[34px] bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 px-4.5 rounded-full font-bold text-[11.5px] shadow-2xs transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            Cancelar
          </button>

          {analysis && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || analysis.rows.length === 0}
              className="h-[34px] bg-[#162c4e] hover:bg-[#0f1f38] text-white px-5 rounded-full font-bold text-[11.5px] shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  Confirmar e Importar
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
