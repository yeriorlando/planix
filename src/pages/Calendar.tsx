import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus, X, Trash2, ChevronDown, Check } from 'lucide-react';
import { getCurrentUser, Usuario } from '../lib/storage';
import { fetchEvents, saveEvent, deleteEvent, TeacherEvent } from '../lib/services/events';
import { toast } from 'sonner';
import { DatePicker } from '../components/ui/heroui-date-picker';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function formatDateStr(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function NewEventModal({ isOpen, onClose, onSave, teacherId, defaultDate }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: () => void; 
  teacherId: string;
  defaultDate: string; 
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('08:00');
  const [type, setType] = useState('Planificación');
  const [duration, setDuration] = useState('1h');
  const [color, setColor] = useState('bg-[#DCDDFF]');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDate(defaultDate);
      setTime('08:00');
      setType('Planificación');
      setDuration('1h');
      setColor('bg-[#DCDDFF]');
      setShowTypeDropdown(false);
      setShowDurationDropdown(false);
    }
  }, [isOpen, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Por favor, ingresa el título del evento.');
      return;
    }
    if (!date) {
      toast.error('Por favor, selecciona una fecha.');
      return;
    }

    try {
      const newEvent: TeacherEvent = {
        id: crypto.randomUUID(),
        teacher_id: teacherId,
        title: title.trim(),
        date,
        time,
        type,
        duration,
        color
      };
      await saveEvent(newEvent);
      toast.success('¡Evento programado con éxito!');
      onSave();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Error al guardar el evento. Intenta de nuevo.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B1B1B]/40 backdrop-blur-sm px-4 cursor-pointer animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-[400px] p-6 shadow-2xl relative border border-slate-100 dark:border-zinc-800 cursor-default animate-in fade-in zoom-in-95 duration-150"
      >
        <button 
          type="button"
          onClick={onClose} 
          className="absolute right-5 top-5 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-md"
          title="Cerrar"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
        
        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-4">Nuevo Evento</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
           <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">TÍTULO DEL EVENTO</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ej. Reunión de Padres / Examen Parcial" 
                className="w-full h-9 bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 text-xs font-semibold text-slate-800 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-brand-primary outline-none transition-all shadow-2xs" 
              />
           </div>
           
           <div className="flex gap-3">
              <div className="flex-1">
                 <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">FECHA</label>
                 <DatePicker 
                   value={date}
                   onChange={setDate}
                   direction="down"
                 />
              </div>
              <div className="flex-1">
                 <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">HORA</label>
                 <input 
                   type="time" 
                   value={time}
                   onChange={(e) => setTime(e.target.value)}
                   className="w-full h-9 bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 text-xs font-semibold text-slate-800 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-brand-primary outline-none transition-all shadow-2xs cursor-pointer" 
                 />
              </div>
           </div>

           <div className="flex gap-3">
              <div className="flex-1">
                 <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">TIPO DE EVENTO</label>
                 <div className="relative select-none">
                     <button 
                         type="button"
                         onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                         className="w-full h-9 px-3 bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                     >
                         <span>{type}</span>
                         <ChevronDown className={`h-3.5 w-3.5 text-slate-400 dark:text-zinc-550 transition-transform duration-200 ${showTypeDropdown ? "rotate-180" : ""}`} />
                     </button>
                     
                     {showTypeDropdown && (
                         <>
                             <div className="fixed inset-0 z-40" onClick={() => setShowTypeDropdown(false)} />
                             <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-[120] animate-in fade-in slide-in-from-top-1 duration-150 max-h-60 overflow-y-auto">
                                 <div className="space-y-0.5">
                                     {[
                                         "Reunión de Padres",
                                         "Planificación",
                                         "Examen / Evaluación",
                                         "Taller / Capacitación",
                                         "Actividad Escolar",
                                         "Otro"
                                     ].map((opt) => (
                                         <button
                                             key={opt}
                                             type="button"
                                             onClick={() => {
                                                 setType(opt);
                                                 setShowTypeDropdown(false);
                                             }}
                                             className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-xs font-medium transition-colors cursor-pointer ${
                                                 type === opt 
                                                     ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" 
                                                     : "text-slate-750 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                             }`}
                                         >
                                             <span>{opt}</span>
                                             {type === opt && <Check className="w-3 h-3 shrink-0 text-[#1B1B1B] dark:text-white" />}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                         </>
                     )}
                 </div>
              </div>
              <div className="flex-1">
                 <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">DURACIÓN</label>
                 <div className="relative select-none">
                     <button 
                         type="button"
                         onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                         className="w-full h-9 px-3 bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                     >
                         <span>{duration === '30m' ? '30 minutos' : duration === '1h' ? '1 hora' : duration === '2h' ? '2 horas' : duration}</span>
                         <ChevronDown className={`h-3.5 w-3.5 text-slate-400 dark:text-zinc-550 transition-transform duration-200 ${showDurationDropdown ? "rotate-180" : ""}`} />
                     </button>
                     
                     {showDurationDropdown && (
                         <>
                             <div className="fixed inset-0 z-40" onClick={() => setShowDurationDropdown(false)} />
                             <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-[120] animate-in fade-in slide-in-from-top-1 duration-150 max-h-60 overflow-y-auto">
                                 <div className="space-y-0.5">
                                     {[
                                         { value: '30m', label: '30 minutos' },
                                         { value: '1h', label: '1 hora' },
                                         { value: '2h', label: '2 horas' },
                                         { value: 'Todo el día', label: 'Todo el día' }
                                     ].map((opt) => (
                                         <button
                                             key={opt.value}
                                             type="button"
                                             onClick={() => {
                                                 setDuration(opt.value);
                                                 setShowDurationDropdown(false);
                                             }}
                                             className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-xs font-medium transition-colors cursor-pointer ${
                                                 duration === opt.value 
                                                     ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" 
                                                     : "text-slate-750 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                             }`}
                                         >
                                             <span>{opt.label}</span>
                                             {duration === opt.value && <Check className="w-3 h-3 shrink-0 text-[#1B1B1B] dark:text-white" />}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                         </>
                     )}
                 </div>
              </div>
           </div>

           <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">COLOR ETIQUETA</label>
              <div className="flex gap-2.5 flex-wrap">
                {[
                  { class: 'bg-[#DCDDFF]', name: 'Morado' },
                  { class: 'bg-[#FBCFE8]', name: 'Rosado' },
                  { class: 'bg-[#FEF08A]', name: 'Amarillo' },
                  { class: 'bg-[#BBF7D0]', name: 'Verde' },
                  { class: 'bg-[#BAE6FD]', name: 'Azul' },
                  { class: 'bg-[#FFEDD5]', name: 'Naranja' },
                  { class: 'bg-[#FECACA]', name: 'Rojo' },
                  { class: 'bg-[#E9D5FF]', name: 'Lavanda' }
                ].map((col) => (
                  <button
                    key={col.class}
                    type="button"
                    onClick={() => setColor(col.class)}
                    className={`w-7.5 h-7.5 rounded-full cursor-pointer transition-all ${col.class} ${color === col.class ? 'ring-3 ring-brand-primary/40 scale-110 border-2 border-white dark:border-zinc-900 shadow-sm' : 'border border-slate-200 dark:border-zinc-800 hover:scale-105'}`}
                    title={col.name}
                  />
                ))}
              </div>
           </div>
           
           <button 
             type="submit" 
             className="w-full h-10 bg-[#1B1B1B] dark:bg-white text-white dark:text-zinc-950 rounded-xl text-xs font-black mt-1 hover:scale-[1.01] hover:shadow-md transition-all cursor-pointer"
           >
              Programar Evento
           </button>
        </form>
      </div>
    </div>
  );
}

export default function Calendar() {
  const [user] = useState<Usuario | null>(() => getCurrentUser());
  const [events, setEvents] = useState<TeacherEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'Today' | 'Week' | 'Month'>('Today');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => formatDateStr(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToDeleteId, setEventToDeleteId] = useState<string | null>(null);

  const loadEvents = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await fetchEvents(user.id);
      setEvents(data);
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar los eventos del calendario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user?.id]);

  const handleDeleteEvent = (id: string) => {
    setEventToDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!eventToDeleteId) return;
    try {
      await deleteEvent(eventToDeleteId);
      toast.success('Evento eliminado correctamente.');
      loadEvents();
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar el evento.');
    } finally {
      setEventToDeleteId(null);
    }
  };

  const prevAction = () => {
    if (view === 'Month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else if (view === 'Today') {
      setCurrentDate(prev => {
        const next = new Date(prev);
        next.setDate(prev.getDate() - 1);
        setSelectedDateStr(formatDateStr(next));
        return next;
      });
    } else if (view === 'Week') {
      setCurrentDate(prev => {
        const next = new Date(prev);
        next.setDate(prev.getDate() - 7);
        setSelectedDateStr(formatDateStr(next));
        return next;
      });
    }
  };

  const nextAction = () => {
    if (view === 'Month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else if (view === 'Today') {
      setCurrentDate(prev => {
        const next = new Date(prev);
        next.setDate(prev.getDate() + 1);
        setSelectedDateStr(formatDateStr(next));
        return next;
      });
    } else if (view === 'Week') {
      setCurrentDate(prev => {
        const next = new Date(prev);
        next.setDate(prev.getDate() + 7);
        setSelectedDateStr(formatDateStr(next));
        return next;
      });
    }
  };

  const getSubHeader = () => {
    if (view === 'Today') {
      return formatSelectedDateHeader(selectedDateStr);
    }
    if (view === 'Week') {
      const current = new Date(currentDate);
      const day = current.getDay();
      const diff = current.getDate() - day;
      const sunday = new Date(current.setDate(diff));
      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);
      return `Semana: ${sunday.getDate()} ${MONTHS[sunday.getMonth()].substring(0, 3)} - ${saturday.getDate()} ${MONTHS[saturday.getMonth()].substring(0, 3)} ${saturday.getFullYear()}`;
    }
    return `${events.length} eventos en total`;
  };

  const getHeader = () => {
    if (view === 'Today') return "Agenda de Hoy";
    if (view === 'Week') return "Esta Semana";
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const eventsByDate = useMemo(() => {
    const map: Record<string, TeacherEvent[]> = {};
    events.forEach(evt => {
      if (!map[evt.date]) {
        map[evt.date] = [];
      }
      map[evt.date].push(evt);
    });
    return map;
  }, [events]);

  const activeList = useMemo(() => {
    if (view === 'Today') {
      return events.filter(evt => evt.date === selectedDateStr).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }
    if (view === 'Week') {
      const current = new Date(currentDate);
      const day = current.getDay();
      const diff = current.getDate() - day;
      const sunday = new Date(current.setDate(diff));
      
      const weekDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        weekDates.push(formatDateStr(d));
      }
      return events.filter(evt => weekDates.includes(evt.date)).sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
    }
    return [];
  }, [events, view, currentDate, selectedDateStr]);

  const dayEventsForSidebar = useMemo(() => {
    return events.filter(evt => evt.date === selectedDateStr).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [events, selectedDateStr]);

  const formatSelectedDateHeader = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const dayName = d.toLocaleDateString('es-ES', { weekday: 'long' });
      const monthName = MONTHS[d.getMonth()];
      return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${d.getDate()} de ${monthName}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <>
      {user?.id && (
        <NewEventModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={loadEvents} 
          teacherId={user.id}
          defaultDate={selectedDateStr}
        />
      )}
      <main className="flex-1 flex flex-col pt-10 xl:pt-[44px] px-6 md:px-[60px] xl:px-16 w-full min-w-0 pb-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight leading-[1] text-[#1B1B1B] dark:text-white">
              Agenda
            </h1>
            <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
              Organiza tus clases, reuniones de padres y evaluaciones académicas.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 shrink-0">
             <button 
               onClick={() => setIsModalOpen(true)} 
               className="bg-brand-primary hover:bg-brand-primary/90 text-white w-full md:w-auto px-5 py-2 rounded-full text-[14px] font-extrabold shadow-xs hover:scale-102 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
             >
               <Plus size={16} /> Nuevo Evento
             </button>
             <div className="flex bg-slate-50 dark:bg-zinc-900 rounded-full p-1 border border-slate-100/80 dark:border-zinc-800 w-full md:w-auto overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => { setView('Today'); setSelectedDateStr(formatDateStr(currentDate)); }} 
                className={`px-6 py-1.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
                  view === 'Today' 
                    ? 'bg-[#BAE6FD] text-[#0369A1] dark:bg-sky-950/40 dark:text-sky-300 shadow-2xs font-extrabold' 
                    : 'text-slate-450 dark:text-zinc-505 hover:text-[#1B1B1B] dark:hover:text-white'
                }`}
              >
                Día
              </button>
              <button 
                onClick={() => { setView('Week'); setSelectedDateStr(formatDateStr(currentDate)); }} 
                className={`px-6 py-1.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
                  view === 'Week' 
                    ? 'bg-[#FFEDD5] text-[#C2410C] dark:bg-amber-950/40 dark:text-amber-300 shadow-2xs font-extrabold' 
                    : 'text-slate-450 dark:text-zinc-505 hover:text-[#1B1B1B] dark:hover:text-white'
                }`}
              >
                Semana
              </button>
              <button 
                onClick={() => setView('Month')} 
                className={`px-6 py-1.5 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
                  view === 'Month' 
                    ? 'bg-[#FECACA] text-[#B91C1C] dark:bg-rose-955/40 dark:text-rose-300 shadow-2xs font-extrabold' 
                    : 'text-slate-450 dark:text-zinc-505 hover:text-[#1B1B1B] dark:hover:text-white'
                }`}
              >
                Mes
              </button>
            </div>
          </div>
       </div>

       <div className="flex flex-col xl:flex-row gap-8 items-start w-full">
         <div className="bg-white dark:bg-zinc-905 rounded-[40px] px-6 md:px-10 py-10 border border-slate-100 dark:border-zinc-800 min-h-[600px] flex-1 w-full overflow-hidden shadow-2xs">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
             <div className="flex items-center gap-5">
               <div className="w-[64px] h-[64px] bg-[#E8E1F5] dark:bg-zinc-800 rounded-[22px] flex items-center justify-center text-[#1B1B1B] dark:text-white shrink-0">
                 <CalendarIcon size={26} strokeWidth={2} />
               </div>
               <div className="min-w-0">
                 <h2 className="text-[26px] font-black text-[#1B1B1B] dark:text-white truncate leading-tight">
                   {getHeader()}
                 </h2>
                 <p className="text-slate-400 dark:text-zinc-550 font-bold text-[15px] truncate">
                   {getSubHeader()}
                 </p>
               </div>
             </div>
             
             <div className="flex gap-3 shrink-0">
                <button onClick={prevAction} className="w-12 h-12 rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 text-[#1B1B1B] dark:text-white transition-colors cursor-pointer">
                   <ChevronLeft size={22} />
                </button>
                <button onClick={nextAction} className="w-12 h-12 rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 text-[#1B1B1B] dark:text-white transition-colors cursor-pointer">
                   <ChevronRight size={22} />
                </button>
             </div>
           </div>

           {loading ? (
             <div className="flex items-center justify-center py-40">
               <p className="text-slate-400 dark:text-zinc-500 font-semibold animate-pulse">Cargando agenda...</p>
             </div>
           ) : view === 'Month' ? (
             <MonthGrid 
               currentDate={currentDate} 
               selectedDateStr={selectedDateStr} 
               setSelectedDateStr={setSelectedDateStr} 
               eventsByDate={eventsByDate}
             />
           ) : (
             <div className="flex flex-col gap-8">
               {activeList.length === 0 ? (
                 <div className="text-center py-20 bg-slate-50/30 dark:bg-zinc-900/10 rounded-3xl border-2 border-dashed border-slate-100 dark:border-zinc-800">
                   <p className="text-slate-400 dark:text-zinc-550 font-semibold">No hay eventos agendados para este período.</p>
                   <button 
                     onClick={() => setIsModalOpen(true)} 
                     className="mt-4 px-5 py-2.5 bg-[#1B1B1B] dark:bg-white text-white dark:text-zinc-950 font-black text-xs rounded-xl hover:scale-102 transition-transform cursor-pointer"
                   >
                     Programar Evento
                   </button>
                 </div>
               ) : (
                 activeList.map((session, i) => {
                   const eventDayName = () => {
                     try {
                       const parts = session.date.split('-');
                       const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                       const name = d.toLocaleDateString('es-ES', { weekday: 'short' });
                       return name.charAt(0).toUpperCase() + name.slice(1);
                     } catch (e) {
                       return '';
                     }
                   };
                   
                   return (
                     <div key={session.id || i} className="flex relative z-10 items-stretch group">
                       {/* Left Column Text */}
                       <div className="flex flex-col items-start md:items-end w-[80px] shrink-0 pt-0 md:pt-4">
                         {view === 'Week' && <div className="text-[14px] font-black text-slate-800 dark:text-white mb-0.5 mr-0 md:mr-4">{eventDayName()}</div>}
                         <div className="mr-0 md:mr-4 pr-2 md:pr-0">
                             <span className="text-[14px] font-black text-slate-400 dark:text-zinc-550 tracking-tight">{session.time || 'Sin hora'}</span>
                         </div>
                       </div>
                       
                       {/* Timeline Divider and Dot */}
                       <div className="flex flex-col items-center w-[40px] shrink-0 relative">
                          <div className="absolute top-0 bottom-[-32px] w-[2px] bg-slate-100 dark:bg-zinc-800 z-0"></div>
                          <div className={`w-[14px] h-[14px] rounded-full ${session.color || 'bg-brand-primary'} shadow-[0_0_0_6px_white] dark:shadow-[0_0_0_6px_#121214] relative z-10 mt-1.5 shrink-0`}></div>
                       </div>
     
                       {/* Card Content */}
                       <div className={`flex-1 w-full ${session.color || 'bg-slate-100'} rounded-[24px] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-xs transition-shadow cursor-pointer min-w-0 border border-black/5 ml-4 md:ml-0 group/card`}>
                         <div className="min-w-0 flex-1">
                           <div className="flex items-center gap-3 mb-3">
                             <span className="bg-white/80 px-3 py-1 rounded-lg text-[11px] font-black text-[#1B1B1B] shadow-2xs whitespace-nowrap">
                               {session.type || 'General'}
                             </span>
                             {session.duration && (
                               <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#1B1B1B] opacity-70 whitespace-nowrap">
                                 <Clock size={14} /> {session.duration}
                               </span>
                             )}
                           </div>
                           <h3 className="text-lg md:text-xl font-bold text-[#1B1B1B] leading-tight break-words">{session.title}</h3>
                         </div>
                         
                         <div className="flex items-center justify-end gap-4 shrink-0">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDeleteEvent(session.id);
                             }}
                             className="w-11 h-11 bg-white hover:bg-red-50 hover:text-red-500 text-slate-500 rounded-full flex items-center justify-center transition-all shadow-sm border border-black/5 cursor-pointer"
                             title="Eliminar evento"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                       </div>
                     </div>
                   );
                 })
               )}
             </div>
           )}
         </div>

         {view === 'Month' && selectedDateStr && (
            <div className="w-full xl:w-[360px] bg-slate-50/40 dark:bg-zinc-900/40 rounded-[36px] border border-slate-100 dark:border-zinc-800 flex-shrink-0 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
               <div className="bg-[#1B1B1B] dark:bg-zinc-950 p-6 pb-8 text-white relative z-10">
                  <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none skew-x-12 translate-x-10"></div>
                  <h2 className="text-2xl font-black leading-tight mb-1">{formatSelectedDateHeader(selectedDateStr)}</h2>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wider">{dayEventsForSidebar.length} Eventos Programados</p>
               </div>
               <div className="p-6 flex flex-col gap-4 bg-white dark:bg-zinc-900 rounded-t-[24px] flex-1">
                  {dayEventsForSidebar.length === 0 ? (
                    <div className="text-center py-10 flex-1 flex flex-col items-center justify-center">
                      <p className="text-slate-400 dark:text-zinc-550 text-sm font-semibold">No hay eventos para este día.</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px] scrollbar-hide pr-1">
                      {dayEventsForSidebar.map((session, i) => (
                        <div key={session.id || i} className={`p-5 rounded-[20px] ${session.color || 'bg-slate-100'} border border-black/5 shadow-2xs relative overflow-hidden group hover:shadow-xs cursor-pointer transition-all`}>
                           <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                {session.time && <span className="text-[12px] font-black text-[#1B1B1B] bg-white/70 px-2 py-0.5 rounded-md shadow-3xs">{session.time}</span>}
                                {session.duration && <span className="text-[11px] font-bold text-[#1B1B1B]/70">{session.duration}</span>}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(session.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:scale-115 transition-all p-1 cursor-pointer"
                                title="Eliminar evento"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                           <h4 className="text-[15px] font-black text-[#1B1B1B] leading-snug">{session.title}</h4>
                           <span className="inline-block mt-2 text-[11px] font-extrabold text-[#1B1B1B]/60 bg-white/40 px-2 py-0.5 rounded-md">{session.type || 'General'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="w-full py-4 mt-2 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 font-bold text-sm hover:border-brand-primary hover:text-brand-primary dark:hover:text-brand-primary transition-colors flex items-center justify-center gap-2 cursor-pointer mt-auto"
                  >
                    <Plus size={16} /> Programar Evento
                  </button>
               </div>
            </div>
         )}
        {eventToDeleteId && (
        <div 
          onClick={() => setEventToDeleteId(null)}
          className="fixed inset-0 bg-[#1B1B1B]/45 backdrop-blur-xs flex items-center justify-center p-4 z-[110] animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-150 cursor-default"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shrink-0 shadow-3xs">
              <Trash2 className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">
                ¿Eliminar este evento?
              </h3>
              <p className="text-xs font-bold text-slate-450 dark:text-zinc-500 leading-normal">
                Esta acción es definitiva y borrará de forma permanente el evento de tu agenda.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
               <button
                 type="button"
                 onClick={() => setEventToDeleteId(null)}
                 className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-300 font-extrabold text-sm rounded-xl cursor-pointer transition-colors shadow-3xs"
               >
                 Cancelar
               </button>
               <button
                 type="button"
                 onClick={confirmDelete}
                 className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-xl cursor-pointer hover:scale-102 transition-transform shadow-sm"
               >
                 Eliminar
               </button>
            </div>
          </div>
        </div>
      )}
       </div>
     </main>
    </>
  );
}

function MonthGrid({ 
  currentDate, 
  selectedDateStr, 
  setSelectedDateStr,
  eventsByDate
}: { 
  currentDate: Date; 
  selectedDateStr: string | null; 
  setSelectedDateStr: (d: string) => void;
  eventsByDate: Record<string, TeacherEvent[]>
}) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = new Date(year, month, 1).getDay();
  
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayStr = formatDateStr(new Date());

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
        {days.map(d => (
          <div key={d} className="text-center text-[11px] md:text-[13px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-2 gap-x-2 md:gap-y-4 md:gap-x-4">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-[80px] md:h-[100px] rounded-[16px] bg-transparent"></div>
        ))}
        {dates.map((dateVal) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateVal).padStart(2, '0')}`;
          const isSelected = selectedDateStr === dateStr;
          const isToday = todayStr === dateStr;
          const dayEvents = eventsByDate[dateStr] || [];
          
          return (
            <div 
              key={dateVal} 
              onClick={() => setSelectedDateStr(dateStr)}
              className={`h-[80px] md:h-[100px] rounded-[16px] md:rounded-[20px] p-2 flex flex-col items-center justify-start transition-all cursor-pointer border-2 ${
                isSelected ? 'bg-[#1B1B1B] dark:bg-zinc-100 text-white dark:text-zinc-950 border-[#1B1B1B] dark:border-zinc-100 shadow-md scale-105 z-10 relative' : 
                isToday ? 'bg-brand-primary/10 border-brand-primary/20 text-[#1B1B1B] dark:text-white hover:border-brand-primary/45' : 
                'bg-slate-50/50 dark:bg-zinc-900/30 border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-xs'
              }`}
            >
              <span className={`text-[15px] md:text-[16px] font-bold mt-1 md:mt-2 ${isSelected ? 'text-white dark:text-zinc-950 font-black' : 'text-[#1B1B1B] dark:text-zinc-150'}`}>{dateVal}</span>
              <div className="flex gap-1 md:gap-1.5 mt-auto mb-1 md:mb-2 flex-wrap justify-center px-1">
                {dayEvents.slice(0, 3).map((evt, idx) => (
                  <div key={idx} className={`w-2 h-2 rounded-full ${evt.color || 'bg-brand-primary'} shrink-0`} />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 leading-[8px]">+</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
