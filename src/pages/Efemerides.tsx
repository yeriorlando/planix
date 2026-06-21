import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Filter,
  Sparkles,
  BookOpen,
  Presentation,
  Info,
  Search,
  Monitor,
  X,
  Trash2,
  AlertTriangle,
  Check,
  Printer,
  Award,
  Shield,
  Clock,
  Scale,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  getEphemerides,
  deleteEphemeris,
  Ephemeris
} from '../lib/storage';
import { toast } from 'sonner';

// Helper to determine category styling (matching Planix aesthetic)
function getCategoryColor(category: string) {
  const cat = category?.toUpperCase() || '';
  switch (cat) {
    case 'PATRIA':
      return {
        bg: 'bg-red-500/10 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-500/20',
        dot: 'bg-red-500',
        text: 'text-red-600 dark:text-red-400',
        gradient: 'from-[#FFF4F2] to-[#FFF9F8] dark:from-red-950/10 dark:to-zinc-900 border-red-500/15 dark:border-red-500/10 hover:border-red-500/30 dark:hover:border-red-500/20 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.06)] hover:shadow-[0_10px_25px_-5px_rgba(239,68,68,0.15)] dark:hover:shadow-[0_10px_25px_-5px_rgba(239,68,68,0.2)]'
      };
    case 'SALUD':
      return {
        bg: 'bg-teal-500/10 dark:bg-teal-950/20 text-teal-650 dark:text-teal-400 border-teal-500/20',
        dot: 'bg-teal-500',
        text: 'text-teal-650 dark:text-teal-400',
        gradient: 'from-[#EBFaf5] to-[#F3FDF9] dark:from-teal-950/10 dark:to-zinc-900 border-teal-500/15 dark:border-teal-500/10 hover:border-teal-500/30 dark:hover:border-teal-500/20 shadow-[0_4px_20px_-4px_rgba(20,184,166,0.06)] hover:shadow-[0_10px_25px_-5px_rgba(20,184,166,0.15)] dark:hover:shadow-[0_10px_25px_-5px_rgba(20,184,166,0.2)]'
      };
    case 'AMBIENTE':
    case 'MEDIO AMBIENTE':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        gradient: 'from-[#E8F8F0] to-[#F2FDF8] dark:from-emerald-950/10 dark:to-zinc-900 border-emerald-500/15 dark:border-emerald-500/10 hover:border-emerald-500/30 dark:hover:border-emerald-500/20 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.06)] hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.2)]'
      };
    case 'EDUCATIVA':
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 border-blue-500/20',
        dot: 'bg-blue-500',
        text: 'text-blue-650 dark:text-blue-400',
        gradient: 'from-[#F0F5FF] to-[#F7FAFF] dark:from-blue-950/10 dark:to-zinc-900 border-blue-500/15 dark:border-blue-500/10 hover:border-blue-500/30 dark:hover:border-blue-500/20 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.06)] hover:shadow-[0_10px_25px_-5px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_10px_25px_-5px_rgba(59,130,246,0.2)]'
      };
    case 'CULTURAL':
      return {
        bg: 'bg-purple-500/10 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 border-purple-500/20',
        dot: 'bg-purple-500',
        text: 'text-purple-650 dark:text-purple-400',
        gradient: 'from-[#F5F3FF] to-[#FAF9FF] dark:from-purple-950/10 dark:to-zinc-900 border-purple-500/15 dark:border-purple-500/10 hover:border-purple-500/30 dark:hover:border-purple-500/20 shadow-[0_4px_20px_-4px_rgba(168,85,247,0.06)] hover:shadow-[0_10px_25px_-5px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_10px_25px_-5px_rgba(168,85,247,0.2)]'
      };
    case 'SOCIAL':
      return {
        bg: 'bg-orange-500/10 dark:bg-orange-950/20 text-orange-650 dark:text-orange-400 border-orange-500/20',
        dot: 'bg-orange-500',
        text: 'text-orange-650 dark:text-orange-400',
        gradient: 'from-[#FFF8F0] to-[#FFFAF5] dark:from-orange-950/10 dark:to-zinc-900 border-orange-500/15 dark:border-orange-500/10 hover:border-orange-500/30 dark:hover:border-orange-500/20 shadow-[0_4px_20px_-4px_rgba(249,115,22,0.06)] hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.15)] dark:hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.2)]'
      };
    case 'HISTORIA':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-950/20 text-amber-750 dark:text-amber-400 border-amber-500/20',
        dot: 'bg-amber-500',
        text: 'text-amber-750 dark:text-amber-400',
        gradient: 'from-[#FCF5E5] to-[#FDFBF7] dark:from-amber-950/10 dark:to-zinc-900 border-amber-500/15 dark:border-amber-500/10 hover:border-amber-500/30 dark:hover:border-amber-500/20 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.06)] hover:shadow-[0_10px_25px_-5px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_10px_25px_-5px_rgba(245,158,11,0.2)]'
      };
    case 'DERECHOS HUMANOS':
      return {
        bg: 'bg-indigo-500/10 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border-indigo-500/20',
        dot: 'bg-indigo-650',
        text: 'text-indigo-650 dark:text-indigo-400',
        gradient: 'from-[#EEF2FF] to-[#F5F7FF] dark:from-indigo-950/10 dark:to-zinc-900 border-indigo-500/15 dark:border-indigo-500/10 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.06)] hover:shadow-[0_10px_25px_-5px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_10px_25px_-5px_rgba(99,102,241,0.2)]'
      };
    default:
      return {
        bg: 'bg-zinc-500/10 dark:bg-zinc-800/30 text-zinc-650 dark:text-zinc-300 border-zinc-500/20',
        dot: 'bg-zinc-500',
        text: 'text-zinc-650 dark:text-zinc-300',
        gradient: 'from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 shadow-sm hover:shadow-md'
      };
  }
}

function getCategoryIcon(category: string, className = "w-4 h-4") {
  const cat = category?.toUpperCase() || '';
  switch (cat) {
    case 'PATRIA':
      return <Shield className={className} fill="currentColor" fillOpacity={0.15} />;
    case 'EDUCATIVA':
      return <BookOpen className={className} fill="currentColor" fillOpacity={0.15} />;
    case 'CULTURAL':
      return <Award className={className} fill="currentColor" fillOpacity={0.15} />;
    case 'HISTORIA':
      return <Clock className={className} fill="currentColor" fillOpacity={0.15} />;
    case 'DERECHOS HUMANOS':
      return <Scale className={className} fill="currentColor" fillOpacity={0.15} />;
    default:
      return <Calendar className={className} fill="currentColor" fillOpacity={0.15} />;
  }
}

// Monthly values dictionary (Dominican curriculum suggestions)
const MONTHLY_VALUES: Record<number, string> = {
  1: "Identidad Nacional y Respeto",
  2: "Patriotismo, Libertad y Convivencia",
  3: "Solidaridad, Honestidad y Valor de la Verdad",
  4: "Esfuerzo, Superación y Cuidado del Entorno",
  5: "Dignidad del Trabajo y Colaboración",
  6: "Gratitud, Aprecio Docente y Civismo",
  7: "Paz, Recreación Familiar y Convivencia",
  8: "Restauración, Soberanía y Sentido de Pertenencia",
  9: "Responsabilidad, Compromiso Curricular y Respeto",
  10: "Diversidad Cultural, Diálogo y Tolerancia",
  11: "Democracia, Institucionalidad y No Violencia",
  12: "Unidad, Generosidad y Esperanza Social"
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface AISuggestion {
  title: string;
  description: string;
}

export default function Efemerides() {
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  const [ephemerides, setEphemerides] = useState<Ephemeris[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  // Modals and suggestions state
  const [viewingFicha, setViewingFicha] = useState<Ephemeris | null>(null);
  const [suggesting, setSuggesting] = useState<'activities' | 'resources' | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<{
    eph: Ephemeris,
    type: 'activities' | 'resources',
    data: AISuggestion[]
  } | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [ephToDelete, setEphToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadEphemerides();
  }, []);

  function loadEphemerides() {
    const list = getEphemerides();
    setEphemerides(list);
  }

  // Filter Logic
  const filteredEphemerides = ephemerides.filter((e) => {
    // Parse date
    const month = parseInt(e.fecha.split('-')[0]) || 1;
    const matchesMonth = month === selectedMonth;
    const matchesCategory = activeCategory === 'Todos' || e.category === activeCategory;
    const matchesSearch = e.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.descripcion.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesMonth && matchesCategory && matchesSearch;
  });

  const categories = ['Todos', ...Array.from(new Set(ephemerides.map(e => e.category || 'Educativa')))];

  // Delete ephemeris handler
  function handleDeleteConfirm() {
    if (ephToDelete) {
      deleteEphemeris(ephToDelete);
      loadEphemerides();
      setEphToDelete(null);
      toast.success("Efeméride eliminada correctamente.");
    }
  }

  // Simulate AI Suggestions based on Dominican curriculum
  function handleGetAISuggestions(eph: Ephemeris, type: 'activities' | 'resources') {
    setSuggesting(type);

    setTimeout(() => {
      let data: AISuggestion[] = [];
      if (type === 'activities') {
        data = [
          {
            title: `Análisis reflexivo grupal: ${eph.titulo}`,
            description: `Organizar una mesa redonda para discutir el impacto histórico del evento. Los estudiantes deberán formular preguntas críticas sobre cómo repercute este acontecimiento en la sociedad dominicana moderna, promoviendo el **pensamiento lógico y reflexivo**.`
          },
          {
            title: "Dramatización o juego de roles pedagógico",
            description: "Propiciar que los alumnos representen un diálogo histórico simulado entre los personajes clave de este acontecimiento. Utilizar vestuarios sencillos y motivar la expresión oral fluida y la empatía histórica."
          },
          {
            title: "Creación de murales creativos colectivos",
            description: "Dividir el aula en grupos de trabajo para ilustrar las ideas principales del suceso. Cada grupo aportará un dibujo u organizador visual que conecte el valor histórico con el **valor del mes del currículo MINERD**."
          }
        ];
      } else {
        data = [
          {
            title: "Guía de lectura interactiva y cuestionario didáctico",
            description: "Documento en formato PDF con preguntas abiertas y de selección múltiple estructuradas según las competencias específicas del currículo dominicano para fomentar la comprensión lectora."
          },
          {
            title: "Presentación multimedia y línea de tiempo digital",
            description: "Diapositivas y recursos interactivos prediseñados listos para proyectar en pantalla digital, que detallan cronológicamente las causas, desarrollo y consecuencias de la efeméride."
          },
          {
            title: "Ficha didáctica de colorear y completar (Primaria)",
            description: "Actividad imprimible diseñada para estudiantes más jóvenes, que combina una ilustración temática del acontecimiento con oraciones incompletas para afianzar conceptos clave."
          }
        ];
      }

      setActiveSuggestions({ eph, type, data });
      setSelectedIndices([0, 1, 2]); // Pre-select all
      setSuggesting(null);
    }, 1200);
  }

  // Custom Suggestion Print Handler
  const handlePrintSuggestions = () => {
    if (!activeSuggestions) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const selectedItems = activeSuggestions.data.filter((_, i) => selectedIndices.includes(i));
    const title = activeSuggestions.type === 'activities' ? '🎭 Sugerencias de Actividades' : '📚 Recursos Didácticos';
    const accentColor = activeSuggestions.type === 'activities' ? '#7c3aed' : '#059669';

    const html = `
      <html>
        <head>
          <title>Planix Pro - ${activeSuggestions.type === 'activities' ? 'Actividades' : 'Recursos'} para ${activeSuggestions.eph.titulo}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1B1B1B; line-height: 1.6; background-color: #ffffff; }
            .header { border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #1B1B1B; font-size: 24px; font-weight: 800; }
            .header p { margin: 5px 0 0; color: #6b7280; font-size: 14px; font-weight: 500; }
            .item { margin-bottom: 30px; page-break-inside: avoid; border-bottom: 1px solid #f3f4f6; padding-bottom: 20px; }
            .item-header { display: flex; align-items: center; margin-bottom: 10px; }
            .item-number { font-weight: 900; color: ${accentColor}; margin-right: 12px; font-size: 1.3em; }
            .item-title { font-size: 18px; font-weight: 800; color: #1B1B1B; text-transform: uppercase; }
            .item-desc { color: #4b5563; font-size: 14px; font-weight: 500; }
            .item-desc strong { color: #1B1B1B; font-weight: 700; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>Efeméride: <strong>${activeSuggestions.eph.titulo}</strong> (${activeSuggestions.eph.fecha})</p>
          </div>
          ${selectedItems.map((item, i) => `
            <div class="item">
              <div class="item-header">
                <span class="item-number">${i + 1}</span>
                <span class="item-title">${item.title}</span>
              </div>
              <div class="item-desc">
                ${item.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
              </div>
            </div>
          `).join('')}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrevMonth = () => {
    setSelectedMonth(prev => (prev === 1 ? 12 : prev - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => (prev === 12 ? 1 : prev + 1));
  };

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    } min-h-screen relative transition-all duration-150`}>
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Centered Header Section (Matching /recursos) */}
      <div className="text-center mb-8 flex flex-col items-center relative z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B1B1B] dark:text-white tracking-tight mb-2">
          Efemérides Nacionales
        </h1>
        <p className="text-[15px] md:text-[17px] font-medium text-slate-400 tracking-tight max-w-[650px] leading-relaxed">
          Calendario cívico dominicano y sugerencias pedagógicas automatizadas con Inteligencia Artificial.
        </p>
      </div>

      {/* Monthly Value Banner */}
      <div className="mb-6 max-w-2xl w-full mx-auto bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-zinc-900/40 dark:to-zinc-850/20 rounded-[24px] border border-blue-500/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-blue-600 shadow-xs border border-blue-500/10 shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">Valor curricular del mes</span>
            <h3 className="text-sm font-black text-neutral-800 dark:text-neutral-100 leading-tight mt-0.5">
              {MONTHLY_VALUES[selectedMonth]}
            </h3>
          </div>
        </div>
        <div className="px-3 py-1 bg-white dark:bg-zinc-800 border border-blue-500/10 rounded-full text-[10px] font-extrabold text-blue-700 dark:text-blue-400 shrink-0">
          Mes de {MONTH_NAMES[selectedMonth - 1]}
        </div>
      </div>

      {/* Left/Right Month Switcher (Arrow Navigation) */}
      <div className="flex items-center justify-center gap-6 mb-8 relative z-10 select-none">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2.5 bg-white dark:bg-zinc-900 hover:bg-neutral-50 dark:hover:bg-zinc-850 rounded-full border border-black/5 dark:border-white/10 transition-all text-neutral-600 dark:text-neutral-300 shadow-2xs active:scale-95 cursor-pointer"
          title="Mes Anterior"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>

        <div className="text-center min-w-[150px]">
          <span className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest leading-none block mb-0.5">Calendario Cívico</span>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">
            {MONTH_NAMES[selectedMonth - 1]}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2.5 bg-white dark:bg-zinc-900 hover:bg-neutral-50 dark:hover:bg-zinc-850 rounded-full border border-black/5 dark:border-white/10 transition-all text-neutral-600 dark:text-neutral-300 shadow-2xs active:scale-95 cursor-pointer"
          title="Siguiente Mes"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Centered Search Bar */}
      <div className="flex items-center w-full max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] shadow-sm mb-6 px-4 py-3 gap-2.5 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar efeméride por título o historia..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm font-bold text-slate-800 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 placeholder-slate-400 placeholder:font-semibold"
        />
      </div>

      {/* Centered Category Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === cat
                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-650 dark:text-zinc-350 border-slate-200 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-850'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of cards */}
      {filteredEphemerides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 rounded-[28px] border border-black/5 px-6">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-300 dark:text-zinc-600">
            <Calendar size={32} />
          </div>
          <h3 className="text-lg font-black text-neutral-800 dark:text-neutral-100">No se encontraron efemérides</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1.5 font-semibold">
            No hay fechas registradas que coincidan con los filtros seleccionados para este mes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredEphemerides.map((eph) => {
            const colors = getCategoryColor(eph.category || 'Educativa');
            const monthVal = parseInt(eph.fecha.split('-')[0]) || 1;
            const dayVal = parseInt(eph.fecha.split('-')[1]) || 1;
            return (
              <motion.div
                key={eph.id}
                layout
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`bg-gradient-to-br ${colors.gradient} rounded-[28px] p-6 relative overflow-hidden group cursor-pointer border transition-all duration-300 min-h-[220px] flex flex-col justify-between select-none text-left`}
                onClick={() => setViewingFicha(eph)}
              >
                {/* Ribbon decoration for Holidays */}
                {eph.is_holiday && (
                  <div className="absolute top-0 right-0 px-3.5 py-1.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-sm z-10">
                    Festivo
                  </div>
                )}

                {/* Card Header (Dashboard Action Pill Style) */}
                <div className="flex justify-between items-start relative z-10 w-full">
                  <div className="flex items-center gap-1.5">
                    <span className={`${colors.text}`}>{getCategoryIcon(eph.category || 'Educativa', 'w-4.5 h-4.5')}</span>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${colors.text}`}>
                      {eph.category || 'Educativa'}
                    </span>
                  </div>

                  <div className="w-11 h-11 bg-white/70 dark:bg-black/40 rounded-full flex flex-col items-center justify-center backdrop-blur-md shadow-2xs font-sans shrink-0 border border-black/5 dark:border-white/5">
                    <span className="text-[15px] font-black text-neutral-900 dark:text-white leading-none">{dayVal}</span>
                    <span className="text-[8px] font-black text-neutral-400 dark:text-zinc-500 uppercase tracking-widest leading-none mt-0.5">
                      {MONTH_NAMES[monthVal - 1].slice(0, 3)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="relative z-10 my-4 flex flex-col items-start w-full flex-1">
                  <h3 className="text-[17px] font-extrabold text-[#1B1B1B] dark:text-white leading-snug tracking-tight group-hover:text-blue-600 transition-colors uppercase line-clamp-2 min-h-[46px]">
                    {eph.titulo}
                  </h3>
                  <p className="text-[#1B1B1B]/60 dark:text-slate-400 font-semibold text-xs leading-relaxed line-clamp-2 mt-1.5">
                    {eph.descripcion}
                  </p>
                </div>

                {/* Action Row Divider (Dashboard Action style) */}
                <div className="relative z-10 mt-auto flex flex-col w-full">
                  <div className="h-px bg-black/5 dark:bg-white/10 mb-3 w-full" />
                  <div className="flex items-center justify-between gap-3 w-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetAISuggestions(eph, 'resources');
                      }}
                      disabled={!!suggesting}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/60 text-emerald-700 dark:text-emerald-350 font-black text-[10px] uppercase tracking-wider transition-all border border-emerald-200/60 dark:border-emerald-900/30 cursor-pointer shadow-3xs select-none active:scale-[0.98]"
                    >
                      <Monitor size={12.5} className="text-emerald-600 dark:text-emerald-450 fill-emerald-500/10" />
                      <span>Recursos</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetAISuggestions(eph, 'activities');
                      }}
                      disabled={!!suggesting}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100/80 dark:hover:bg-purple-950/60 text-purple-700 dark:text-purple-350 font-black text-[10px] uppercase tracking-wider transition-all border border-purple-200/60 dark:border-purple-900/30 cursor-pointer shadow-3xs select-none active:scale-[0.98]"
                    >
                      <BookOpen size={12.5} className="text-purple-600 dark:text-purple-450 fill-purple-500/10" />
                      <span>Actividades</span>
                    </button>

                    {/* Trash Icon for custom created ephemerides */}
                    {eph.id.startsWith('efem_') && eph.id !== 'efem_1' && eph.id !== 'efem_2' && eph.id !== 'efem_3' && eph.id !== 'efem_6' && eph.id !== 'efem_7' && eph.id !== 'efem_8' && eph.id !== 'efem_10' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEphToDelete(eph.id);
                        }}
                        className="p-2 text-zinc-400 hover:text-red-650 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar Efeméride"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* AI Loading State Overlay */}
      {suggesting && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-8 rounded-[28px] text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 animate-pulse">
                <Sparkles className="w-8 h-8 text-blue-600 animate-spin duration-3000" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">Planix AI pensando...</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold mt-1">
                Generando {suggesting === 'activities' ? 'Actividades' : 'Recursos'} sugeridos bajo la adecuación curricular dominicana actual.
              </p>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 animate-[loading_1.5s_ease-in-out_infinite] rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* SUGGESTIONS MODAL */}
      <AnimatePresence>
        {activeSuggestions && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-[28px] border border-neutral-200 dark:border-zinc-850 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className={`p-6 text-white relative shrink-0 ${
                activeSuggestions.type === 'activities' ? 'bg-gradient-to-r from-purple-600 to-indigo-700' : 'bg-gradient-to-r from-emerald-600 to-teal-700'
              }`}>
                <button
                  onClick={() => setActiveSuggestions(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                    {activeSuggestions.type === 'activities' ? <Presentation className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </span>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Sugerencias Pedagógicas Planix AI</span>
                    <h2 className="text-xl font-black text-white leading-tight uppercase">{activeSuggestions.eph.titulo}</h2>
                  </div>
                </div>
              </div>

              {/* List of Suggestions */}
              <div className="p-6 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/20 flex-1 space-y-4">
                <p className="text-[11px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wide">
                  Selecciona los elementos que quieras imprimir para tu planeación curricular:
                </p>

                {activeSuggestions.data.map((item, idx) => {
                  const isSelected = selectedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedIndices(prev =>
                          prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                        );
                      }}
                      className={`p-5 bg-white dark:bg-zinc-900 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-start gap-4 ${
                        isSelected
                          ? activeSuggestions.type === 'activities' ? 'border-purple-500 ring-2 ring-purple-100 dark:ring-purple-950/20' : 'border-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-950/20'
                          : 'border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        isSelected
                          ? activeSuggestions.type === 'activities' ? 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-400 dark:text-zinc-500'
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-extrabold text-neutral-850 dark:text-white text-base leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-neutral-550 dark:text-neutral-400 text-xs leading-relaxed mt-2 font-medium">
                          {item.description}
                        </p>
                      </div>

                      <div className={`shrink-0 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          activeSuggestions.type === 'activities' ? 'bg-purple-600' : 'bg-emerald-600'
                        }`}>
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  {selectedIndices.length} seleccionadas para imprimir
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveSuggestions(null)}
                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-zinc-800 cursor-pointer select-none"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handlePrintSuggestions}
                    disabled={selectedIndices.length === 0}
                    className={`px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer select-none shadow-sm disabled:opacity-50 ${
                      activeSuggestions.type === 'activities' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <Printer size={14} />
                    <span>Imprimir Selección</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REDESIGNED PREMIUM FICHA INFORMATIVA MODAL */}
      <AnimatePresence>
        {viewingFicha && (() => {
          const colors = getCategoryColor(viewingFicha.category || 'Educativa');
          const monthVal = parseInt(viewingFicha.fecha.split('-')[0]) || 1;
          const dayVal = parseInt(viewingFicha.fecha.split('-')[1]) || 1;
          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-[28px] border border-neutral-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative"
              >
                {/* Header Close button */}
                <button
                  onClick={() => setViewingFicha(null)}
                  className="absolute top-4 right-4 p-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-neutral-500 dark:text-neutral-350 transition-colors cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Centered Premium Title / Icon Area */}
                <div className="flex flex-col items-center pt-8 pb-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-2xs ${colors.bg}`}>
                    {getCategoryIcon(viewingFicha.category || 'Educativa', 'w-6 h-6')}
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${colors.bg}`}>
                    {viewingFicha.category || 'Educativa'}
                  </span>
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase text-center mt-4 px-6 tracking-tight leading-snug">
                    {viewingFicha.titulo}
                  </h2>
                </div>

                {/* Subtitle / Date */}
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2">
                  <Calendar size={14} className="text-blue-500" />
                  <span>Acontece el {dayVal} de {MONTH_NAMES[monthVal - 1]}</span>
                  {viewingFicha.is_holiday && (
                    <span className="ml-1.5 px-2 py-0.5 bg-red-100 dark:bg-red-950/30 text-red-650 dark:text-red-400 text-[8px] font-black uppercase tracking-widest rounded border border-red-200/50">
                      Festivo
                    </span>
                  )}
                </div>

                {/* Ficha Description Area */}
                <div className="px-6 py-4">
                  <div className="relative p-5 bg-zinc-50 dark:bg-zinc-950/30 rounded-2xl border border-black/5 dark:border-white/5 leading-relaxed text-xs font-semibold text-neutral-600 dark:text-neutral-405 max-h-[200px] overflow-y-auto">
                    <div className="absolute -top-3 left-4 px-2 py-0.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[8px] font-black uppercase tracking-widest rounded shadow-2xs">
                      Contexto Cívico
                    </div>
                    <p className="mt-1">
                      {viewingFicha.descripcion}
                    </p>
                  </div>
                </div>

                {/* Action buttons footer */}
                <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const eph = viewingFicha;
                      setViewingFicha(null);
                      handleGetAISuggestions(eph, 'resources');
                    }}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm select-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Monitor size={14} />
                    <span>Sugerir Recursos</span>
                  </button>
                  <button
                    onClick={() => {
                      const eph = viewingFicha;
                      setViewingFicha(null);
                      handleGetAISuggestions(eph, 'activities');
                    }}
                    className="flex-1 py-2.5 px-4 bg-purple-650 hover:bg-purple-750 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm select-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <BookOpen size={14} />
                    <span>Sugerir Actividades</span>
                  </button>
                  <button
                    onClick={() => setViewingFicha(null)}
                    className="py-2.5 px-4 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer select-none"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {ephToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 space-y-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-[28px] shadow-2xl"
            >
              <div className="flex items-start gap-3 border-b border-neutral-100 dark:border-zinc-850 pb-3">
                <div className="p-2 bg-red-100 dark:bg-red-950/30 text-red-650 rounded-xl shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-red-600">
                    ¿Eliminar efeméride?
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold mt-0.5">
                    Esta acción es irreversible y eliminará esta fecha del calendario escolar.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => setEphToDelete(null)}
                  className="px-4 py-2 border border-neutral-200 dark:border-zinc-700 text-xs font-bold text-neutral-600 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer select-none"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm select-none"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
