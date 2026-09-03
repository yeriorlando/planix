import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  X,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  Trash2,
  Edit2,
  Printer,
  Search,
  CheckCircle2,
  CloudRain,
  Users,
  AlertOctagon,
  Sparkles,
  Info,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  AttendanceIncident,
  saveAttendanceIncident,
  deleteAttendanceIncident,
  Classroom
} from "../../lib/storage";
import { CalendarView, parseIsoString, HeroUIStyles } from "../ui/heroui-date-picker";

interface ModalIncidenciasAsistenciaProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom | null;
  teacherId: string;
  initialDate?: string; // YYYY-MM-DD
  incidents: AttendanceIncident[];
  onRefresh: () => void;
  preopenForm?: boolean;
}

export const INCIDENT_TYPES_CONFIG: Record<
  AttendanceIncident["tipo"],
  {
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    badgeBg: string;
    badgeText: string;
    border: string;
    lightBg: string;
  }
> = {
  salida_anticipada: {
    label: "Salida Anticipada",
    icon: Clock,
    badgeBg: "bg-amber-500 text-white",
    badgeText: "text-amber-700 dark:text-amber-450",
    border: "border-amber-200 dark:border-amber-900/50",
    lightBg: "bg-amber-50/70 dark:bg-amber-950/20"
  },
  suspension_clases: {
    label: "Suspensión de Docencia",
    icon: AlertOctagon,
    badgeBg: "bg-rose-500 text-white",
    badgeText: "text-rose-700 dark:text-rose-450",
    border: "border-rose-200 dark:border-rose-900/50",
    lightBg: "bg-rose-50/70 dark:bg-rose-950/20"
  },
  huelga_gremial: {
    label: "Asamblea / Huelga ADP",
    icon: Users,
    badgeBg: "bg-purple-500 text-white",
    badgeText: "text-purple-700 dark:text-purple-450",
    border: "border-purple-200 dark:border-purple-900/50",
    lightBg: "bg-purple-50/70 dark:bg-purple-950/20"
  },
  emergencia_climatica: {
    label: "Clima / Emergencia",
    icon: CloudRain,
    badgeBg: "bg-sky-500 text-white",
    badgeText: "text-sky-700 dark:text-sky-450",
    border: "border-sky-200 dark:border-sky-900/50",
    lightBg: "bg-sky-50/70 dark:bg-sky-950/20"
  },
  actividad_institucional: {
    label: "Actividad Institucional",
    icon: Sparkles,
    badgeBg: "bg-emerald-500 text-white",
    badgeText: "text-emerald-700 dark:text-emerald-450",
    border: "border-emerald-200 dark:border-emerald-900/50",
    lightBg: "bg-emerald-50/70 dark:bg-emerald-950/20"
  },
  otro: {
    label: "Otra Eventualidad",
    icon: FileText,
    badgeBg: "bg-slate-600 text-white",
    badgeText: "text-slate-700 dark:text-slate-350",
    border: "border-slate-200 dark:border-zinc-800",
    lightBg: "bg-slate-50/70 dark:bg-zinc-900/50"
  }
};

/* Componente de Selección de Hora Compacto y Elegante */
function HeroUITimeView({
  value,
  onChange,
  onClose
}: {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
}) {
  const parsed = useMemo(() => {
    if (!value || !value.includes(":")) {
      return { hour: "11", minute: "30", period: "AM" as "AM" | "PM" };
    }
    const [h, m] = value.split(":");
    const hNum = parseInt(h, 10);
    const period: "AM" | "PM" = hNum >= 12 ? "PM" : "AM";
    const hour12 = hNum % 12 === 0 ? 12 : hNum % 12;
    return { hour: String(hour12), minute: m || "00", period };
  }, [value]);

  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(parsed.period);

  const updateTime = (h: string, m: string, p: "AM" | "PM") => {
    setHour(h);
    setMinute(m);
    setPeriod(p);
    let h24 = parseInt(h, 10);
    if (p === "PM" && h24 < 12) h24 += 12;
    if (p === "AM" && h24 === 12) h24 = 0;
    onChange(`${String(h24).padStart(2, "0")}:${m}`);
  };

  const quickPresets = [
    { label: "08:00 AM", h: "8", m: "00", p: "AM" as const },
    { label: "10:00 AM", h: "10", m: "00", p: "AM" as const },
    { label: "11:30 AM", h: "11", m: "30", p: "AM" as const },
    { label: "12:00 PM", h: "12", m: "00", p: "PM" as const },
    { label: "01:30 PM", h: "1", m: "30", p: "PM" as const },
    { label: "03:30 PM", h: "3", m: "30", p: "PM" as const },
  ];

  return (
    <div className="w-[260px] p-1 space-y-2 select-none text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-zinc-150">
          <Clock className="w-3.5 h-3.5 text-[#02327e] dark:text-blue-400" />
          <span className="text-xs">Hora de Despacho</span>
        </div>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onClose();
            }}
            className="text-[10px] text-rose-500 hover:underline font-bold transition-colors cursor-pointer"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Interactive Selectors Row */}
      <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-zinc-800/70 p-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-750">
        {/* Hour Select */}
        <div className="flex-1">
          <select
            value={hour}
            onChange={(e) => updateTime(e.target.value, minute, period)}
            className="w-full h-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-1.5 text-xs font-black text-center text-neutral-800 dark:text-zinc-100 outline-none cursor-pointer focus:border-[#02327e]"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={String(h)}>
                {String(h).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        <span className="font-black text-slate-400 text-sm">:</span>

        {/* Minute Select */}
        <div className="flex-1">
          <select
            value={minute}
            onChange={(e) => updateTime(hour, e.target.value, period)}
            className="w-full h-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-1.5 text-xs font-black text-center text-neutral-800 dark:text-zinc-100 outline-none cursor-pointer focus:border-[#02327e]"
          >
            {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* AM/PM Toggle */}
        <div className="flex bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-0.5 h-8 items-center">
          <button
            type="button"
            onClick={() => updateTime(hour, minute, "AM")}
            className={`px-2 py-0.5 text-[10px] font-black rounded-md transition-all cursor-pointer ${
              period === "AM"
                ? "bg-[#02327e] text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:text-zinc-400"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => updateTime(hour, minute, "PM")}
            className={`px-2 py-0.5 text-[10px] font-black rounded-md transition-all cursor-pointer ${
              period === "PM"
                ? "bg-[#02327e] text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:text-zinc-400"
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {/* Quick Pills */}
      <div>
        <div className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
          Horarios Habituales
        </div>
        <div className="grid grid-cols-3 gap-1">
          {quickPresets.map((qp) => (
            <button
              key={qp.label}
              type="button"
              onClick={() => {
                updateTime(qp.h, qp.m, qp.p);
                onClose();
              }}
              className="py-1 px-1 bg-slate-50 dark:bg-zinc-800/60 hover:bg-[#02327e]/10 hover:text-[#02327e] dark:hover:bg-blue-950/40 dark:hover:text-blue-300 border border-slate-200/60 dark:border-zinc-800 rounded-lg text-[9.5px] font-bold text-center text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full py-1.5 bg-[#02327e] hover:bg-[#012563] text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
      >
        Listo
      </button>
    </div>
  );
}

export default function ModalIncidenciasAsistencia({
  isOpen,
  onClose,
  classroom,
  teacherId,
  initialDate,
  incidents,
  onRefresh,
  preopenForm = false
}: ModalIncidenciasAsistenciaProps) {
  const [viewMode, setViewMode] = useState<"list" | "form">(preopenForm ? "form" : "list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("all");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState<string>(initialDate || format(new Date(), "yyyy-MM-dd"));
  const [formType, setFormType] = useState<AttendanceIncident["tipo"]>("salida_anticipada");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDepartureTime, setFormDepartureTime] = useState("");
  const [formAffected, setFormAffected] = useState(true);

  // Popover controls
  const [showDatePickerPopover, setShowDatePickerPopover] = useState(false);
  const [showTimePickerPopover, setShowTimePickerPopover] = useState(false);

  // Input ref for auto-growing textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  // Auto-expand textarea on focus / typing
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      if (isTextareaFocused || formDescription.trim().length > 0) {
        el.style.height = `${Math.max(80, Math.min(200, el.scrollHeight))}px`;
      } else {
        el.style.height = "52px";
      }
    }
  }, [formDescription, isTextareaFocused, viewMode]);

  // Sync initialDate when opening
  useEffect(() => {
    if (isOpen) {
      if (preopenForm) {
        setViewMode("form");
      }
      if (initialDate) {
        setFormDate(initialDate);
      }
    }
  }, [isOpen, initialDate, preopenForm]);

  const handleOpenNew = (presetDate?: string) => {
    setEditingId(null);
    setFormDate(presetDate || initialDate || format(new Date(), "yyyy-MM-dd"));
    setFormType("salida_anticipada");
    setFormTitle("");
    setFormDescription("");
    setFormDepartureTime("");
    setFormAffected(true);
    setShowDatePickerPopover(false);
    setShowTimePickerPopover(false);
    setViewMode("form");
  };

  const handleEdit = (inc: AttendanceIncident) => {
    setEditingId(inc.id);
    setFormDate(inc.fecha);
    setFormType(inc.tipo);
    setFormTitle(inc.titulo);
    setFormDescription(inc.descripcion);
    setFormDepartureTime(inc.hora_salida || "");
    setFormAffected(inc.afecto_asistencia ?? true);
    setShowDatePickerPopover(false);
    setShowTimePickerPopover(false);
    setViewMode("form");
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`¿Eliminar la incidencia "${title}"?`)) {
      deleteAttendanceIncident(id);
      toast.success("Incidencia eliminada correctamente.");
      onRefresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Por favor escribe un título o motivo.");
      return;
    }
    if (!classroom) {
      toast.error("No hay aula seleccionada.");
      return;
    }

    const newIncident: AttendanceIncident = {
      id: editingId || `inc_${classroom.id}_${Date.now()}`,
      classroom_id: classroom.id,
      teacher_id: teacherId,
      fecha: formDate,
      tipo: formType,
      titulo: formTitle.trim(),
      descripcion: formDescription.trim(),
      hora_salida: formDepartureTime.trim() || undefined,
      afecto_asistencia: formAffected,
      creado_en: new Date().toISOString()
    };

    saveAttendanceIncident(newIncident);
    toast.success(editingId ? "Incidencia actualizada con éxito." : "Incidencia guardada con éxito.");
    onRefresh();
    setViewMode("list");
  };

  // Filtered incidents (excluding invalid legacy rows)
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        if (!inc || !inc.titulo || inc.titulo === "Incidencia de asistencia") return false;
        if (selectedTypeFilter !== "all" && inc.tipo !== selectedTypeFilter) return false;
        if (selectedMonthFilter !== "all") {
          const incMonth = inc.fecha.slice(0, 7); // YYYY-MM
          if (incMonth !== selectedMonthFilter) return false;
        }
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchesTitle = (inc.titulo || "").toLowerCase().includes(q);
          const matchesDesc = (inc.descripcion || "").toLowerCase().includes(q);
          const matchesDate = (inc.fecha || "").includes(q);
          return matchesTitle || matchesDesc || matchesDate;
        }
        return true;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [incidents, selectedTypeFilter, selectedMonthFilter, searchTerm]);

  // Unique months in list
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    filteredIncidents.forEach((i) => {
      if (i.fecha) monthsSet.add(i.fecha.slice(0, 7));
    });
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [filteredIncidents]);

  const handlePrintBitacora = () => {
    document.body.classList.add("printing-incidents");
    const oldTitle = document.title;
    document.title = `Planix - Bitácora de Incidencias - ${classroom?.nombre || ""}`;
    window.print();
    document.title = oldTitle;
    setTimeout(() => {
      document.body.classList.remove("printing-incidents");
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm cursor-pointer animate-in fade-in duration-200"
    >
      <HeroUIStyles />
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 rounded-[24px] shadow-2xl w-full max-w-[580px] flex flex-col overflow-visible border border-black/10 dark:border-zinc-800 cursor-default animate-in zoom-in-95 duration-200 relative"
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 border-b border-black/5 dark:border-zinc-800/80 flex items-center justify-between bg-gradient-to-r from-[#02327e]/10 via-[#02b36d]/5 to-transparent no-print rounded-t-[24px]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#02327e]/10 dark:bg-blue-500/20 border border-[#02327e]/20 flex items-center justify-center text-[#02327e] dark:text-blue-400 shadow-2xs">
              <AlertTriangle size={18} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#1B1B1B] dark:text-zinc-100 tracking-tight">
                  Bitácora de Incidencias del Aula
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#02327e]/10 dark:bg-blue-950/60 text-[#02327e] dark:text-blue-300 border border-[#02327e]/20 dark:border-blue-900/50">
                  {classroom?.nombre || "Asistencia"}
                </span>
              </div>
              <p className="text-[10.5px] font-semibold text-neutral-500 dark:text-zinc-400 mt-0.5">
                Registra suspensiones, salidas tempranas, huelgas y novedades que afecten la docencia.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-md shrink-0"
            title="Cerrar"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* NAVIGATION SUB-HEADER */}
        <div className="px-5 py-2.5 bg-neutral-50 dark:bg-zinc-950/60 border-b border-black/5 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5 no-print">
          <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-2xs">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#02327e] text-white shadow-xs"
                  : "text-neutral-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-200"
              }`}
            >
              Historial de Incidencias ({filteredIncidents.length})
            </button>
            <button
              onClick={() => handleOpenNew()}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "form"
                  ? "bg-[#02327e] text-white shadow-xs"
                  : "text-neutral-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-200"
              }`}
            >
              <Plus size={14} />
              {editingId ? "Editar Incidencia" : "Nueva Incidencia"}
            </button>
          </div>

          {viewMode === "list" && filteredIncidents.length > 0 && (
            <button
              onClick={handlePrintBitacora}
              className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-zinc-800 text-xs font-bold text-neutral-700 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer size={14} className="text-[#02327e] dark:text-blue-400" />
              Imprimir Bitácora
            </button>
          )}
        </div>

        {/* MODAL BODY */}
        <div className={`p-5 no-print ${viewMode === "list" ? "overflow-y-auto max-h-[60vh] space-y-3" : "overflow-visible"}`}>
          {/* ===================== VIEW 1: LIST / HISTORIAL ===================== */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {/* Search and Filters Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar por motivo, descripción o fecha..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-xs font-semibold rounded-xl bg-neutral-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#02327e] focus:ring-4 focus:ring-[#02327e]/10 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 dark:text-zinc-200 outline-none shadow-xs transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTypeFilter}
                    onChange={(e) => setSelectedTypeFilter(e.target.value)}
                    className="h-9 py-1 px-3 text-xs font-bold rounded-xl bg-neutral-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 dark:text-zinc-200 outline-none cursor-pointer shadow-xs"
                  >
                    <option value="all">Todos los tipos</option>
                    {Object.entries(INCIDENT_TYPES_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>

                  {availableMonths.length > 1 && (
                    <select
                      value={selectedMonthFilter}
                      onChange={(e) => setSelectedMonthFilter(e.target.value)}
                      className="h-9 py-1 px-3 text-xs font-bold rounded-xl bg-neutral-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 dark:text-zinc-200 outline-none cursor-pointer shadow-xs"
                    >
                      <option value="all">Todos los meses</option>
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Incidents Cards List */}
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-950/20">
                  <div className="w-10 h-10 rounded-xl bg-[#02327e]/10 dark:bg-blue-950/40 text-[#02327e] dark:text-blue-400 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                    <Info size={18} />
                  </div>
                  <h3 className="text-xs font-black text-neutral-800 dark:text-zinc-200">
                    No hay incidencias registradas
                  </h3>
                  <p className="text-[11px] font-semibold text-neutral-500 dark:text-zinc-400 max-w-sm mx-auto mt-0.5 mb-3">
                    {searchTerm || selectedTypeFilter !== "all"
                      ? "No se encontraron coincidencias con los filtros aplicados."
                      : "Registra suspensiones de clase, asambleas de la ADP o salidas anticipadas para documentar la asistencia."}
                  </p>
                  <button
                    onClick={() => handleOpenNew()}
                    className="px-5 py-2.5 rounded-xl bg-[#02327e] hover:bg-[#012563] text-white text-xs font-extrabold shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> Registrar Primera Incidencia
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredIncidents.map((inc) => {
                    const cfg = INCIDENT_TYPES_CONFIG[inc.tipo] || INCIDENT_TYPES_CONFIG.otro;
                    const IconComponent = cfg.icon;
                    const parsedDate = new Date(`${inc.fecha}T12:00:00`);
                    const formattedDate = format(parsedDate, "EEEE d 'de' MMMM, yyyy", { locale: es });

                    return (
                      <div
                        key={inc.id}
                        className={`p-3 rounded-2xl border ${cfg.border} ${cfg.lightBg} transition-all hover:shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 group`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl ${cfg.badgeBg} flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5`}
                          >
                            <IconComponent size={15} />
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white/90 dark:bg-zinc-900/90 ${cfg.badgeText} shadow-2xs`}>
                                {cfg.label}
                              </span>
                              <span className="text-[10.5px] font-bold text-neutral-500 dark:text-zinc-400 capitalize flex items-center gap-1">
                                <Calendar size={10} /> {formattedDate}
                              </span>
                              {inc.hora_salida && (
                                <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                  <Clock size={9} /> Salida: {inc.hora_salida}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-extrabold text-neutral-900 dark:text-zinc-100">
                              {inc.titulo}
                            </h4>

                            {inc.descripcion && (
                              <p className="text-[11px] font-semibold text-neutral-600 dark:text-zinc-300 leading-relaxed">
                                {inc.descripcion}
                              </p>
                            )}

                            {inc.afecto_asistencia && (
                              <span className="inline-block text-[9.5px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                                • Afectó el horario o completitud del pase de lista.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 self-end sm:self-start opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(inc)}
                            className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 hover:text-[#02327e] dark:hover:text-blue-400 border border-black/5 dark:border-zinc-700 shadow-2xs transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(inc.id, inc.titulo)}
                            className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 border border-black/5 dark:border-zinc-700 shadow-2xs transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================== VIEW 2: FORM (CREATE / EDIT) ===================== */}
          {viewMode === "form" && (
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Row 1: Fecha (DatePicker HeroUI) y Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-[10.5px] font-black text-neutral-800 dark:text-zinc-200 mb-1 uppercase tracking-wide">
                    Fecha de la Incidencia *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDatePickerPopover(!showDatePickerPopover);
                      setShowTimePickerPopover(false);
                    }}
                    className="w-full h-9 bg-neutral-50/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:border-[#02327e] focus:border-[#02327e] focus:ring-4 focus:ring-[#02327e]/10 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-neutral-400" />
                      <span>
                        {formDate ? (() => {
                          const parts = formDate.split("-");
                          if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                          return formDate;
                        })() : "DD/MM/AAAA"}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-neutral-400" />
                  </button>

                  {/* Popover CalendarView */}
                  {showDatePickerPopover && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDatePickerPopover(false)}
                      />
                      <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <CalendarView
                          selectedDate={parseIsoString(formDate)}
                          onSelect={(day, month, year) => {
                            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            setFormDate(dateStr);
                            setShowDatePickerPopover(false);
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-[10.5px] font-black text-neutral-800 dark:text-zinc-200 mb-1 uppercase tracking-wide">
                    Tipo de Eventualidad *
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as AttendanceIncident["tipo"])}
                      className="w-full h-9 bg-neutral-50/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs font-bold text-neutral-900 dark:text-neutral-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#02327e] focus:ring-4 focus:ring-[#02327e]/10 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 shadow-xs outline-none transition-all cursor-pointer appearance-none pr-8"
                    >
                      {Object.entries(INCIDENT_TYPES_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 2: Título y Hora de Salida */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10.5px] font-black text-neutral-800 dark:text-zinc-200 mb-1 uppercase tracking-wide">
                    Título / Motivo Principal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Despacho a las 11:30 AM por falta de agua"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full h-9 bg-neutral-50/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs font-bold text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#02327e] focus:ring-4 focus:ring-[#02327e]/10 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 shadow-xs outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10.5px] font-black text-neutral-800 dark:text-zinc-200 uppercase tracking-wide">
                      Hora Despacho (Opcional)
                    </label>
                    {formDepartureTime && (
                      <button
                        type="button"
                        onClick={() => setFormDepartureTime("")}
                        className="text-[9.5px] text-rose-500 hover:underline font-bold lowercase cursor-pointer"
                      >
                        limpiar
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTimePickerPopover(!showTimePickerPopover);
                      setShowDatePickerPopover(false);
                    }}
                    className="w-full h-9 bg-neutral-50/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:border-[#02327e] focus:border-[#02327e] focus:ring-4 focus:ring-[#02327e]/10 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-neutral-400" />
                      <span>
                        {formDepartureTime ? (() => {
                          const [h, m] = formDepartureTime.split(":");
                          if (!h || !m) return formDepartureTime;
                          const hourNum = parseInt(h, 10);
                          const period = hourNum >= 12 ? "PM" : "AM";
                          const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
                          return `${String(formattedHour).padStart(2, "0")}:${m} ${period}`;
                        })() : "Seleccionar hora"}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-neutral-400" />
                  </button>

                  {/* Popover TimeView (Opens upwards/center) */}
                  {showTimePickerPopover && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowTimePickerPopover(false)}
                      />
                      <div className="absolute top-full right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <HeroUITimeView
                          value={formDepartureTime}
                          onChange={(val) => setFormDepartureTime(val)}
                          onClose={() => setShowTimePickerPopover(false)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Row 3: Descripción detallada con auto-expansión dinámica */}
              <div>
                <label className="block text-[10.5px] font-black text-neutral-800 dark:text-zinc-200 mb-1 uppercase tracking-wide">
                  Detalles / Observaciones Adicionales
                </label>
                <textarea
                  ref={textareaRef}
                  placeholder="Detalla qué sucedió, acuerdos de dirección o si se asignaron tareas para el hogar..."
                  value={formDescription}
                  onFocus={() => setIsTextareaFocused(true)}
                  onBlur={() => setIsTextareaFocused(false)}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-neutral-50/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#02327e] focus:ring-4 focus:ring-[#02327e]/10 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 shadow-xs outline-none transition-[border-color,box-shadow] resize-none leading-relaxed overflow-y-auto"
                  style={{ minHeight: "52px" }}
                />
              </div>

              {/* Row 4: Checkbox afectó asistencia */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#02327e]/5 dark:bg-blue-950/25 border border-[#02327e]/15 dark:border-blue-900/40 cursor-pointer transition-all hover:bg-[#02327e]/10 dark:hover:bg-blue-950/40">
                <input
                  type="checkbox"
                  checked={formAffected}
                  onChange={(e) => setFormAffected(e.target.checked)}
                  className="rounded text-[#02327e] focus:ring-[#02327e] w-4 h-4 cursor-pointer accent-[#02327e]"
                />
                <span className="text-[11px] font-bold text-neutral-800 dark:text-zinc-200 select-none">
                  Esta eventualidad afectó o alteró el horario regular de asistencia del grupo.
                </span>
              </label>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-neutral-50 dark:hover:bg-zinc-700/60 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#02327e] hover:bg-[#012563] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 size={15} />
                  {editingId ? "Actualizar Incidencia" : "Guardar Incidencia"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* PRINTABLE OFFICIAL REPORT (Only visible when window.print() is executed) */}
        <div id="incidents-print-area" className="hidden print:block p-8 bg-white text-black font-sans">
          <div className="text-center pb-4 border-b-2 border-black mb-5">
            <h1 className="text-base font-black uppercase tracking-wider text-black">
              MINISTERIO DE EDUCACIÓN DE LA REPÚBLICA DOMINICANA (MINERD)
            </h1>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-neutral-800 mt-1">
              BITÁCORA OFICIAL DE NOVEDADES E INCIDENCIAS DE ASISTENCIA Y DOCENCIA
            </h2>
            <div className="flex justify-between items-center text-xs font-bold text-neutral-700 mt-3 px-1">
              <div><strong>Aula / Grado:</strong> {classroom?.nombre} ({classroom?.grado || ""} {classroom?.seccion || ""})</div>
              <div><strong>Nivel:</strong> {classroom?.nivel || "Primaria / Secundaria"}</div>
              <div><strong>Fecha de Emisión:</strong> {format(new Date(), "dd/MM/yyyy", { locale: es })}</div>
            </div>
          </div>

          <table className="w-full text-[11px] border-collapse border border-black mb-10">
            <thead>
              <tr className="bg-neutral-100 border-b border-black text-black">
                <th className="border border-black p-2 text-center w-8 font-black">Nº</th>
                <th className="border border-black p-2 text-center w-24 font-black">Fecha</th>
                <th className="border border-black p-2 text-left w-36 font-black">Tipo de Eventualidad</th>
                <th className="border border-black p-2 text-center w-20 font-black">Hora Despacho</th>
                <th className="border border-black p-2 text-left font-black">Motivo y Observaciones</th>
                <th className="border border-black p-2 text-center w-20 font-black">Afectó Docencia</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-black p-6 text-center text-neutral-500 font-bold">
                    No se han registrado incidencias para este periodo.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc, idx) => {
                  const cfg = INCIDENT_TYPES_CONFIG[inc.tipo] || INCIDENT_TYPES_CONFIG.otro;
                  return (
                    <tr key={inc.id} className="border-b border-black text-black">
                      <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                      <td className="border border-black p-2 text-center font-bold">
                        {format(new Date(`${inc.fecha}T12:00:00`), "dd/MM/yyyy")}
                      </td>
                      <td className="border border-black p-2 font-bold">{cfg.label}</td>
                      <td className="border border-black p-2 text-center font-semibold">{inc.hora_salida || "N/A"}</td>
                      <td className="border border-black p-2">
                        <div className="font-bold text-black">{inc.titulo}</div>
                        {inc.descripcion && <div className="text-[10px] text-neutral-700 mt-0.5">{inc.descripcion}</div>}
                      </td>
                      <td className="border border-black p-2 text-center font-bold">
                        {inc.afecto_asistencia ? "SÍ" : "NO"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 mt-16 pt-6 text-center text-xs text-black">
            <div>
              <div className="border-b border-black w-56 mx-auto mb-2"></div>
              <div className="font-extrabold uppercase">Firma del Docente Titular</div>
            </div>
            <div>
              <div className="border-b border-black w-56 mx-auto mb-2"></div>
              <div className="font-extrabold uppercase">Dirección Escolar / Sello del Centro</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
