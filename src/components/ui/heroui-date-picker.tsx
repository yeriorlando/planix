"use client";

import * as React from "react";
import { Calendar, ChevronDown } from "lucide-react";

export type DateValue = {
  month: string;
  day: string;
  year: string;
  era?: string;
  display?: string;
  iso?: string;
};

type DatePickerProps = {
  label?: React.ReactNode;
  value?: string;
  defaultValue?: string | null;
  description?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  minWidth?: string;
  customIndicator?: React.ReactNode;
  showTime?: boolean;
  international?: boolean;
  onChange?: (value: string) => void;
  direction?: "up" | "down";
  align?: "left" | "right";
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEK_DAYS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

export function parseIsoString(iso: string | null | undefined): DateValue | null {
  if (!iso) return null;
  const parts = iso.split("-");
  if (parts.length !== 3) return null;
  const year = parts[0];
  const month = String(parseInt(parts[1], 10));
  const day = String(parseInt(parts[2], 10));
  return { year, month, day, iso };
}

function toIsoString(val: DateValue | null): string {
  if (!val) return "";
  const y = val.year;
  const m = val.month.padStart(2, "0");
  const d = val.day.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Format date as DIA / MES / AÑO (Day / Month / Year)
function formatValue(value: DateValue | null | undefined, showTime?: boolean, international?: boolean) {
  if (!value) return ["dd", "/", "mm", "/", "yyyy"];
  if (value.display) return value.display.split("|");
  return [value.day, "/", value.month, "/", value.year];
}

export function DatePicker({
  label = "Fecha",
  value,
  defaultValue = null,
  description,
  disabled = false,
  invalid = false,
  required = false,
  minWidth = "w-full",
  customIndicator,
  showTime = false,
  international = false,
  onChange,
  direction = "up",
  align = "left",
}: DatePickerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const parsedValue = React.useMemo(() => parseIsoString(value), [value]);
  const parsedDefaultValue = React.useMemo(() => parseIsoString(defaultValue), [defaultValue]);

  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = React.useState<DateValue | null>(parsedDefaultValue);
  const [open, setOpen] = React.useState(false);
  const [focusedSegment, setFocusedSegment] = React.useState<string | null>(null);
  
  const currentValue = isControlled ? parsedValue : innerValue;
  const segments = formatValue(currentValue, showTime, international);

  const setDate = React.useCallback(
    (next: DateValue | null) => {
      if (!isControlled) setInnerValue(next);
      if (next) {
        onChange?.(toIsoString(next));
      }
    },
    [isControlled, onChange],
  );

  const handleTrigger = () => {
    if (!disabled) setOpen((next) => !next);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((next) => !next);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const base = currentValue || { month: "6", day: "1", year: "2026", iso: "2026-06-01" };
      const delta = event.key === "ArrowUp" ? 1 : -1;

      const isMonthFocused = focusedSegment === "2";
      const isYearFocused = focusedSegment === "4";
      const isDayFocused = focusedSegment === "0" || focusedSegment === null;

      let day = Number(base.day || 1);
      let month = Number(base.month || 6);
      let year = Number(base.year || 2026);

      if (isDayFocused) {
        day = Math.max(1, Math.min(31, day + delta));
      } else if (isMonthFocused) {
        month = Math.max(1, Math.min(12, month + delta));
      } else if (isYearFocused) {
        year = year + delta;
      }

      setDate({
        month: String(month),
        day: String(day),
        year: String(year),
        iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      });
    }
  };

  const selectDay = (day: number, month: number, year: number) => {
    const next = {
      month: String(month),
      day: String(day),
      year: String(year),
      iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    };
    setDate(next);
    setOpen(false);
  };

  // Close calendar popover on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div 
      ref={containerRef}
      data-slot="date-picker" 
      className={`date-picker ${minWidth}`} 
      data-rac="" 
      data-disabled={disabled || undefined} 
      data-invalid={invalid || undefined} 
      data-open={open || undefined}
    >
      <HeroUIStyles />
      <span className="label" data-slot="label" style={{ display: 'none' }}>{label}{required ? <span className="required-mark" aria-hidden="true"> *</span> : null}</span>
      <div
        data-react-aria-pressable="true"
        role="group"
        aria-invalid={invalid || undefined}
        aria-disabled={disabled || undefined}
        className="date-input-group date-input-group--full-width date-input-group--primary w-full flex items-center justify-between"
        data-slot="date-input-group"
        data-rac=""
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (!disabled) setOpen(true);
        }}
        style={{ cursor: 'pointer' }}
      >
        <div role="presentation" data-react-aria-pressable="true" className="date-input-group__input flex-1" data-slot="date-input-group-input" data-rac="">
          {segments.map((segment, index) => {
            const isLiteral = ["/", ", ", " ", " AM GMT+4"].includes(segment);
            return (
              <span
                key={`${segment}-${index}`}
                data-slot="date-input-group-segment"
                role={isLiteral ? undefined : "spinbutton"}
                aria-label={isLiteral ? undefined : index === 0 ? "día, " : index === 2 ? "mes, " : "año, "}
                aria-disabled={disabled || undefined}
                data-placeholder={!currentValue && !isLiteral ? "true" : undefined}
                contentEditable={!disabled && !isLiteral}
                suppressContentEditableWarning
                tabIndex={disabled || isLiteral ? undefined : 0}
                className="date-input-group__segment font-bold text-gray-800 dark:text-zinc-200 text-sm"
                data-focused={focusedSegment === `${index}` || undefined}
                data-rac=""
                onFocus={() => setFocusedSegment(`${index}`)}
                onBlur={() => setFocusedSegment(null)}
              >
                {segment}
              </span>
            );
          })}
        </div>
        <input type="text" hidden name="date" value={value || ""} readOnly />
        <div className="date-input-group__suffix" data-slot="date-input-group-suffix">
          <button
            data-slot="date-picker-trigger"
            className="date-picker__trigger"
            data-rac=""
            type="button"
            aria-label="Calendario"
            aria-haspopup="dialog"
            aria-expanded={open}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleTrigger();
            }}
          >
            <span aria-hidden="true" className="date-picker__trigger-indicator" data-slot="date-picker-trigger-indicator">
              {customIndicator || <Calendar className="h-4 w-4 text-gray-400 dark:text-zinc-500" />}
            </span>
          </button>
        </div>
      </div>
      {description ? <span className="description" data-slot="description" slot="description">{description}</span> : null}
      {open ? (
        <div data-slot="date-picker-popover" className={`date-picker__popover date-picker__popover--${direction} date-picker__popover--align-${align}`} role="dialog" aria-label={`${label}`}>
          <CalendarView 
            selectedDate={currentValue} 
            onSelect={selectDay} 
          />
        </div>
      ) : null}
    </div>
  );
}

export function CalendarView({ 
  selectedDate, 
  onSelect 
}: { 
  selectedDate: DateValue | null; 
  onSelect: (day: number, month: number, year: number) => void;
}) {
  const today = new Date();
  const currentYear = selectedDate ? parseInt(selectedDate.year, 10) : today.getFullYear();
  const currentMonth = selectedDate ? parseInt(selectedDate.month, 10) : today.getMonth() + 1;

  const [viewMonth, setViewMonth] = React.useState(currentMonth);
  const [viewYear, setViewYear] = React.useState(currentYear);
  const [yearMode, setYearMode] = React.useState(false);

  // Calculate days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Calculate start day index (0 = Sunday, etc)
  const getStartDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const startDay = getStartDayOfMonth(viewMonth, viewYear);

  // Prev month filler days
  const prevMonth = viewMonth === 1 ? 12 : viewMonth - 1;
  const prevYear = viewMonth === 1 ? viewYear - 1 : viewYear;
  const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);

  const prevMonthDays = Array.from(
    { length: startDay }, 
    (_, i) => daysInPrevMonth - startDay + 1 + i
  );

  const currentMonthDays = Array.from(
    { length: daysInMonth }, 
    (_, i) => i + 1
  );

  const totalGridCells = 42; // 6 rows of 7 days
  const nextMonthDaysCount = totalGridCells - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => i + 1);

  const allCells = [
    ...prevMonthDays.map(d => ({ day: d, outside: true, month: prevMonth, year: prevYear })),
    ...currentMonthDays.map(d => ({ day: d, outside: false, month: viewMonth, year: viewYear })),
    ...nextMonthDays.map(d => ({ day: d, outside: true, month: viewMonth === 12 ? 1 : viewMonth + 1, year: viewMonth === 12 ? viewYear + 1 : viewYear }))
  ];

  const handlePrevMonth = () => {
    setViewMonth(prev => {
      if (prev === 1) {
        setViewYear(y => y - 1);
        return 12;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setViewMonth(prev => {
      if (prev === 12) {
        setViewYear(y => y + 1);
        return 1;
      }
      return prev + 1;
    });
  };

  return (
    <div role="application" data-slot="calendar" className="calendar">
      <header data-slot="calendar-header" className="calendar__header flex items-center justify-between">
        <button 
          type="button" 
          data-slot="calendar-year-picker-trigger" 
          className="calendar-year-picker__trigger flex items-center gap-1 hover:bg-neutral-100 dark:hover:bg-zinc-800" 
          onClick={() => setYearMode((next) => !next)}
        >
          <span data-slot="calendar-year-picker-trigger-heading" className="calendar-year-picker__trigger-heading font-bold text-gray-800 dark:text-zinc-150">
            {MONTH_NAMES[viewMonth - 1]} {viewYear}
          </span>
          <span data-slot="calendar-year-picker-trigger-indicator" className="calendar-year-picker__trigger-indicator">
            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
          </span>
        </button>
        <div className="flex gap-1">
          <button 
            type="button" 
            data-slot="calendar-nav-button" 
            className="calendar__nav-button w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-zinc-800 text-lg cursor-pointer text-gray-600 dark:text-zinc-400" 
            aria-label="Mes anterior"
            onClick={handlePrevMonth}
          >
            ‹
          </button>
          <button 
            type="button" 
            data-slot="calendar-nav-button" 
            className="calendar__nav-button w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-zinc-800 text-lg cursor-pointer text-gray-600 dark:text-zinc-400" 
            aria-label="Mes siguiente"
            onClick={handleNextMonth}
          >
            ›
          </button>
        </div>
      </header>

      {!yearMode ? (
        <table role="grid" data-slot="calendar-grid" className="calendar__grid">
          <thead data-slot="calendar-grid-header" className="calendar__grid-header">
            <tr>
              {WEEK_DAYS.map((day) => (
                <th key={day} data-slot="calendar-header-cell" className="calendar__header-cell text-xs font-bold text-slate-400 pb-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody data-slot="calendar-grid-body" className="calendar__grid-body">
            {Array.from({ length: 6 }).map((_, row) => (
              <tr key={row}>
                {allCells.slice(row * 7, row * 7 + 7).map((cell, index) => {
                  const isSelected = selectedDate && 
                    !cell.outside && 
                    parseInt(selectedDate.day, 10) === cell.day && 
                    parseInt(selectedDate.month, 10) === cell.month && 
                    parseInt(selectedDate.year, 10) === cell.year;

                  return (
                    <td key={`${row}-${index}`} className="text-center">
                      <button
                        type="button"
                        className="calendar__cell w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold cursor-pointer text-gray-700 dark:text-zinc-300"
                        data-outside-month={cell.outside || undefined}
                        data-selected={isSelected || undefined}
                        onClick={() => onSelect(cell.day, cell.month, cell.year)}
                      >
                        {cell.day}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div role="listbox" data-slot="calendar-year-picker-grid" className="calendar-year-picker__year-grid">
          {Array.from({ length: 25 }, (_, index) => viewYear - 12 + index).map((year) => {
            const isSelected = year === viewYear;
            return (
              <button 
                key={year} 
                type="button" 
                data-slot="calendar-year-picker-year-cell" 
                className="calendar-year-picker__year-cell text-xs font-bold py-1.5 rounded-lg cursor-pointer text-gray-700 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-800" 
                data-selected={isSelected || undefined}
                onClick={() => {
                  setViewYear(year);
                  setYearMode(false);
                }}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function HeroUIStyles() {
  return (
    <style>{`
      .date-picker,.date-picker *{box-sizing:border-box}
      .date-picker{position:relative;display:inline-flex;flex-direction:column;gap:.25rem;color:hsl(var(--foreground,240 10% 3.9%));font-family:Inter,ui-sans-serif,system-ui,sans-serif;overflow:visible}
      .date-picker[data-open=true]{z-index:80}
      .date-picker.w-64{width:16rem}.date-picker.min-w-72{min-width:18rem;width:fit-content}.date-picker[data-disabled=true]{opacity:.6}
      .label{font-size:.875rem;line-height:1.25rem;font-weight:500;}
      .required-mark{color:#ef4444}
      .description{font-size:.875rem;line-height:1.25rem;color:hsl(var(--muted-foreground,240 3.8% 46.1%))}
      
      /* Date Input Group styled precisely as inputCls */
      .date-input-group{
        display:inline-flex;
        align-items:center;
        height:2.5rem; /* h-10 */
        width: 100%;
        overflow:hidden;
        border-radius:12px !important; /* rounded-lg matching the other inputs */
        border:1px solid #e2e8f0; /* border-neutral-200 */
        background:#fafafa; /* bg-neutral-50 */
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-xs */
        outline:none;
        transition:border-color .16s ease,box-shadow .16s ease,background-color .16s ease;
      }
      .date-input-group:hover{
        border-color:#1b1b1b;
      }
      .date-input-group:focus-within{
        border-color:#1b1b1b;
        box-shadow:0 0 0 1px rgba(27, 27, 27, 0.1);
      }
      .date-input-group[aria-invalid=true]{border-color:hsl(var(--destructive,0 84% 60%));box-shadow:0 0 0 2px hsl(var(--destructive,0 84% 60%) / .18)}
      .date-input-group[aria-disabled=true]{pointer-events:none;background:hsl(var(--muted,240 3.7% 15.9%));color:hsl(var(--muted-foreground,240 5% 64.9%))}
      
      /* Identical padding to px-3.5 py-2 */
      .date-input-group__input{
        display:flex;
        flex:1;
        align-items:center;
        gap:1px;
        min-width:0;
        padding:0.5rem 0.875rem; /* px-3.5 py-2 */
        border:0;
        background:transparent;
        font-size:.875rem;
        line-height:1.25rem;
        unicode-bidi:isolate;
      }
      .date-input-group__segment{
        display:inline-block;
        outline:none;
        border-radius:.375rem;
        padding:0 .125rem;
        color:inherit;
        text-align:end;
        text-wrap:nowrap;
        caret-color:transparent;
      }
      .date-input-group__segment[data-placeholder=true]{color:#9ca3af}
      .date-input-group__segment:focus,.date-input-group__segment[data-focused=true]{background:rgba(27, 27, 27, 0.08);color:inherit}
      
      .date-input-group__suffix{
        pointer-events:none;
        display:flex;
        align-items:center;
        flex-shrink:0;
        margin-right:0.875rem; /* matching right padding */
        color:#9ca3af;
      }
      .date-picker__trigger{pointer-events:auto;display:inline-flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem;padding:.25rem;border:0;border-radius:.75rem;background:transparent;color:#9ca3af;cursor:pointer;transition:box-shadow .15s ease,background-color .16s ease,color .16s ease,transform .12s ease}
      .date-picker__trigger:hover{background:rgba(0,0,0,0.05);color:#1b1b1b}
      .date-picker__trigger:active{transform:scale(.96)}
      
      .date-picker__popover{
        position:absolute;
        z-index:100;
        width:var(--trigger-width,16.5rem);
        max-width:var(--trigger-width,16.5rem);
        overflow-x:hidden;
        overflow-y:auto;
        overscroll-behavior:contain;
        border-radius:min(32px,1.25rem);
        border:1px solid #e5e7eb;
        background:#ffffff !important;
        box-shadow:0 16px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
        padding:.85rem;
      }
      .date-picker__popover--align-left{
        left:0;
        right:auto;
      }
      .date-picker__popover--align-right{
        right:0;
        left:auto;
      }
      .date-picker__popover--up{
        bottom:calc(100% + .5rem);
        transform-origin:bottom;
        animation:datePickerPopoverUp .16s ease-out;
      }
      .date-picker__popover--down{
        top:calc(100% + .5rem);
        transform-origin:top;
        animation:datePickerPopoverDown .16s ease-out;
      }
      
      .calendar{display:flex;flex-direction:column;gap:.5rem;min-width:0}
      .calendar__header{display:flex;align-items:center;gap:.25rem;height:2rem}
      .calendar-year-picker__trigger{display:flex;align-items:center;gap:.375rem;height:2rem;padding:0 .5rem;border:0;border-radius:.5rem;background:transparent;color:inherit;font-weight:550;cursor:pointer}
      .calendar-year-picker__trigger:hover,.calendar__nav-button:hover{background:rgba(0,0,0,0.05)}
      .calendar-year-picker__trigger-heading{font-size:.875rem}
      .calendar-year-picker__trigger-indicator{display:inline-flex;color:#6b7280}
      .calendar__nav-button{display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;border:0;border-radius:.5rem;background:transparent;color:inherit;font-size:1.125rem;cursor:pointer}
      
      .calendar__grid{width:100%;border-collapse:separate;border-spacing:0 .125rem;table-layout:fixed}
      .calendar__grid th,.calendar__grid td{padding:0;text-align:center;vertical-align:middle}
      .calendar__header-cell{height:2rem;text-align:center;font-size:.75rem;font-weight:550;color:#9ca3af}
      .calendar__cell{display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;border:0;border-radius:999px;background:transparent;color:inherit;font-size:.875rem;cursor:pointer;transition:background-color .14s ease,color .14s ease,transform .12s ease}
      .calendar__cell:hover{background:rgba(0,0,0,0.05)}
      .calendar__cell:focus-visible{outline:2px solid #1b1b1b;outline-offset:1px}
      .calendar__cell:active{transform:scale(.95)}
      .calendar__cell[data-outside-month=true]{color:#d1d5db}
      .calendar__cell[data-selected=true]{background:#1b1b1b !important;color:white !important;font-weight:600}
      
      .calendar-year-picker__year-grid{max-height:9rem;overflow:auto;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.25rem;border-top:1px solid #e5e7eb;padding-top:.5rem}
      .calendar-year-picker__year-cell{height:2rem;border:0;border-radius:.5rem;background:transparent;color:inherit;font-size:.8125rem;cursor:pointer}
      .calendar-year-picker__year-cell[data-selected=true]{background:#1b1b1b !important;color:white !important}
      
      @keyframes datePickerPopoverUp{from{opacity:0;transform:translateY(4px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes datePickerPopoverDown{from{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
      
      /* Dark mode overrides */
      .dark .date-input-group{
        border-color:#27272a;
        background:rgba(24, 24, 27, 0.5); /* bg-zinc-900/50 */
      }
      .dark .date-input-group:hover{
        border-color:#f4f4f5;
      }
      .dark .date-input-group:focus-within{
        border-color:#f4f4f5;
        box-shadow:0 0 0 1px rgba(244, 244, 245, 0.1);
      }
      .dark .date-picker__popover{
        border-color:#27272a;
        background:#18181b !important;
        box-shadow:0 18px 44px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.32);
      }
      .dark .calendar-year-picker__trigger:hover,
      .dark .calendar__nav-button:hover,
      .dark .calendar__cell:hover {
        background:rgba(255,255,255,0.06);
      }
      .dark .calendar-year-picker__year-grid {
        border-top-color:#27272a;
      }
      .dark .calendar__cell[data-outside-month=true]{color:#4b5563}
      .dark .calendar__cell[data-selected=true]{background:#f4f4f5 !important;color:#18181b !important}
      .dark .calendar-year-picker__year-cell[data-selected=true]{background:#f4f4f5 !important;color:#18181b !important}
    `}</style>
  );
}
