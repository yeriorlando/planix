import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    Printer, 
    Award, 
    User, 
    Palette, 
    CheckCircle2,
    Sparkles,
    Calendar,
    Star,
    Check,
    ChevronDown,
    GraduationCap,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUser, getClassrooms, getStudents, Classroom, Student } from '../lib/storage';
import { DatePicker } from '../components/ui/heroui-date-picker';
import { logActivity } from '../lib/activityLog';

// Categorías de logros predefinidos
const ACHIEVEMENT_CATEGORIES = [
    { id: 'custom', label: 'Logro Personalizado...', icon: '✨' },
    { id: 'orador', label: 'Mejor Orador del Debate', icon: '🗣️' },
    { id: 'cuaderno', label: 'Excelencia en el Cuaderno', icon: '📝' },
    { id: 'solidario', label: 'Compañero más Solidario', icon: '🤝' },
    { id: 'liderazgo', label: 'Liderazgo Positivo', icon: '👑' },
    { id: 'esfuerzo', label: 'Esfuerzo y Superación', icon: '💪' },
    { id: 'creatividad', label: 'Creatividad Destacada', icon: '🎨' },
    { id: 'participacion', label: 'Participación Activa', icon: '🙋‍♂️' },
];

const DIPLOMA_THEMES = [
    { 
        id: 'planix', 
        name: 'Planix', 
        primary: '#04337e', 
        secondary: '#01b36d', 
        accent: '#01b36d', 
        accentDark: '#04337e', 
        bg: '#ffffff'
    },
    { 
        id: 'imperial', 
        name: 'Imperial', 
        primary: '#1e3a8a', // blue-900 
        secondary: '#1e1b4b', // blue-950
        accent: '#c5a059', // gold
        accentDark: '#8b6d31', 
        bg: '#ffffff'
    },
    { 
        id: 'esmeralda', 
        name: 'Esmeralda', 
        primary: '#064e3b', // emerald-900
        secondary: '#064e3b', 
        accent: '#94a3b8', // silver/slate
        accentDark: '#475569', 
        bg: '#ffffff'
    },
    { 
        id: 'rubi', 
        name: 'Rubí', 
        primary: '#7f1d1d', // red-900
        secondary: '#450a0a', 
        accent: '#c5a059', // gold
        accentDark: '#7c2d12', 
        bg: '#ffffff'
    },
    { 
        id: 'onix', 
        name: 'Ónix', 
        primary: '#0f172a', // slate-900
        secondary: '#020617', 
        accent: '#b45309', // bronze/amber-700
        accentDark: '#451a03', 
        bg: '#ffffff'
    }
];

const NEW_DIPLOMA_THEMES = [
    { 
        id: 'amatista', 
        name: 'Amatista', 
        primary: '#581c87', 
        secondary: '#3b0764', 
        accent: '#d8b4fe', 
        accentDark: '#7e22ce', 
        bg: '#ffffff'
    },
    { 
        id: 'ambar', 
        name: 'Ámbar', 
        primary: '#78350f', 
        secondary: '#451a03', 
        accent: '#fde047', 
        accentDark: '#b45309', 
        bg: '#ffffff'
    },
    { 
        id: 'zafiro', 
        name: 'Zafiro', 
        primary: '#312e81', 
        secondary: '#1e1b4b', 
        accent: '#c7d2fe', 
        accentDark: '#4338ca', 
        bg: '#ffffff'
    },
    { 
        id: 'menta', 
        name: 'Menta', 
        primary: '#14b8a6', 
        secondary: '#0f766e', 
        accent: '#ccfbf1', 
        accentDark: '#115e59', 
        bg: '#ffffff'
    },
    { 
        id: 'turquesa', 
        name: 'Turquesa', 
        primary: '#06b6d4', 
        secondary: '#0e7490', 
        accent: '#ecfeff', 
        accentDark: '#164e63', 
        bg: '#ffffff'
    }
];

// Función para oscurecer u aclarar colores de manera profesional en JS
function adjustColorBrightness(hex: string, percent: number) {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.max(0, Math.min(255, Math.round(R * (1 + percent))));
    G = Math.max(0, Math.min(255, Math.round(G * (1 + percent))));
    B = Math.max(0, Math.min(255, Math.round(B * (1 + percent))));

    const rHex = R.toString(16).padStart(2, '0');
    const gHex = G.toString(16).padStart(2, '0');
    const bHex = B.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
}

export default function GeneradorDiplomas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    
    // User Session
    const user = getCurrentUser();

    // Mode Selector: 'aula' | 'personalizada'
    const [inputMode, setInputMode] = useState<'aula' | 'personalizada'>('aula');
    
    // Classrooms & Students state
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');

    // Dropdown visibility states
    const [showClassDropdown, setShowClassDropdown] = useState(false);
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);

    // Form State
    const [studentName, setStudentName] = useState('');
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(ACHIEVEMENT_CATEGORIES[0].id);
    const [selectedThemeId, setSelectedThemeId] = useState(DIPLOMA_THEMES[0].id);
    const [showMoreColors, setShowMoreColors] = useState(false);
    const [customColor, setCustomColor] = useState('#2563eb');
    const [customAchievement, setCustomAchievement] = useState('');
    const [teacherName, setTeacherName] = useState('');
    const [institutionName, setInstitutionName] = useState('CENTRO EDUCATIVO');
    const [dateIso, setDateIso] = useState(() => new Date().toISOString().split('T')[0]);
    const formattedDate = useMemo(() => {
        if (!dateIso) return '';
        const dateObj = new Date(dateIso + "T12:00:00");
        return dateObj.toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });
    }, [dateIso]);

    const filteredStudents = useMemo(() => {
        if (!studentSearchQuery.trim()) return students;
        const q = studentSearchQuery.toLowerCase();
        return students.filter(s => {
            const fullName = `${s.nombre} ${s.apellido || ''}`.toLowerCase();
            return fullName.includes(q);
        });
    }, [students, studentSearchQuery]);

    // Load classrooms on mount
    useEffect(() => {
        if (user) {
            const list = getClassrooms(user.id);
            setClassrooms(list);
            if (list.length > 0) {
                setSelectedClassId(list[0].id);
            } else {
                setInputMode('personalizada'); // Fallback si no tiene clases
            }
        } else {
            setInputMode('personalizada');
        }
    }, [user?.id]);

    // Load students when classroom changes
    useEffect(() => {
        if (selectedClassId) {
            const list = getStudents(selectedClassId);
            const sortedList = list.sort((a, b) => a.numero_orden - b.numero_orden);
            setStudents(sortedList);
            if (sortedList.length > 0) {
                setSelectedStudentId(sortedList[0].id);
                setStudentName(`${sortedList[0].nombre} ${sortedList[0].apellido || ''}`.trim());
            } else {
                setSelectedStudentId('');
                setStudentName('');
            }
        } else {
            setStudents([]);
            setSelectedStudentId('');
            setStudentName('');
        }
    }, [selectedClassId]);

    // Lógica de escalado automático para que el canvas de 1000px quepa en pantallas pequeñas
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                const newScale = Math.min(1, (containerWidth - 64) / 1000);
                setScale(newScale);
            }
        };

        const observer = new ResizeObserver(() => {
            window.requestAnimationFrame(updateScale);
        });
        
        if (containerRef.current) observer.observe(containerRef.current);
        
        updateScale();
        return () => observer.disconnect();
    }, []);

    const getAchievementLabel = () => {
        if (selectedCategory === 'custom') return customAchievement || 'LOGRO ESPECÍFICO';
        return ACHIEVEMENT_CATEGORIES.find(c => c.id === selectedCategory)?.label || '';
    };

    const handlePrint = () => {
        if (!studentName) {
            toast.error('Por favor, ingresa o selecciona el nombre del estudiante.');
            return;
        }
        void logActivity({
            kind: 'tool',
            userName: user?.nombre || user?.email || 'Usuario',
            title: 'Generador de Diplomas',
            detail: `Generó diploma para ${studentName}`
        });
        window.print();
    };

    // Computación de paleta seleccionada
    const allThemes = [...DIPLOMA_THEMES, ...NEW_DIPLOMA_THEMES];
    let selectedTheme = allThemes.find(t => t.id === selectedThemeId);
    if (selectedThemeId === 'custom-color') {
        selectedTheme = {
            id: 'custom-color',
            name: 'Personalizado',
            primary: customColor,
            secondary: adjustColorBrightness(customColor, -0.3),
            accent: adjustColorBrightness(customColor, 0.4),
            accentDark: adjustColorBrightness(customColor, -0.2),
            bg: '#ffffff'
        };
    }
    if (!selectedTheme) {
        selectedTheme = DIPLOMA_THEMES[0];
    }

    return (
        <div className="min-h-screen pb-20 w-full flex-1">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Playfair+Display:ital,wght@0,900;1,900&family=Montserrat:wght@400;700;900&family=Alex+Brush&family=Allura&family=Herr+Von+Muellerhoff&display=swap');

                @media print {
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background: white !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    #root {
                        padding: 0 !important;
                    }
                    .print-full {
                        position: fixed !important;
                        inset: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        z-index: 99999 !important;
                        background: white !important;
                        display: block !important;
                    }
                }
            `}</style>

            {/* Ocultar UI en impresión */}
            <header className="print:hidden flex items-center justify-between px-6 py-4 max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs mb-6 mt-4">
                <Link 
                    to="/herramientas" 
                    className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-4 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Volver a Herramientas
                </Link>
                
                <div className="flex flex-col items-center justify-center text-center">
                    <h1 className="text-xl md:text-2xl font-[900] text-neutral-900 dark:text-white tracking-tighter">Generador de Diplomas</h1>
                    <p className="text-[9px] md:text-[10px] text-neutral-400 font-extrabold uppercase tracking-[0.2em] leading-none mt-1">Reconocimiento & Logro</p>
                </div>
                
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-600/90 px-4 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider border-none cursor-pointer"
                >
                    <Printer className="w-3.5 h-3.5" /> Imprimir Diploma
                </button>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 no-print">
                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
                    
                    {/* Panel de Configuración Lateral */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-850 shadow-xs overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20">
                                <h2 className="font-black text-slate-800 dark:text-white flex items-center gap-2 text-md">
                                    <Palette className="h-5 w-5 text-blue-500" />
                                    PERSONALIZACIÓN
                                </h2>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                {/* Selector de Modo: Seleccionar Aula vs Personalizado */}
                                <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-zinc-950 rounded-2xl border border-slate-200/40 dark:border-zinc-800/80 mb-4 select-none">
                                    <button
                                        type="button"
                                        onClick={() => setInputMode('aula')}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border-none ${
                                            inputMode === 'aula'
                                            ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                                            : 'bg-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                                        }`}
                                    >
                                        <GraduationCap size={14} />
                                        <span>Seleccionar aula</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInputMode('personalizada')}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border-none ${
                                            inputMode === 'personalizada'
                                            ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                                            : 'bg-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                                        }`}
                                    >
                                        <User size={14} />
                                        <span>Personalizado</span>
                                    </button>
                                </div>

                                {/* Inputs basados en el modo seleccionado */}
                                {inputMode === 'aula' ? (
                                    <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                                        {/* Dropdown de Aulas */}
                                        <div className="space-y-1 relative select-none">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">Aula o Grupo</label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowClassDropdown(!showClassDropdown);
                                                    setShowStudentDropdown(false);
                                                }}
                                                className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                                            >
                                                <span className="truncate">
                                                    {classrooms.find(c => c.id === selectedClassId)
                                                        ? `${classrooms.find(c => c.id === selectedClassId)?.nombre} - Sec. ${classrooms.find(c => c.id === selectedClassId)?.seccion}`
                                                        : "No tienes aulas creadas"}
                                                </span>
                                                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showClassDropdown ? 'rotate-180' : ''}`} />
                                            </button>
                                            {showClassDropdown && classrooms.length > 0 && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setShowClassDropdown(false)} />
                                                    <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1.5 z-50 max-h-60 overflow-y-auto text-left">
                                                        <div className="space-y-0.5">
                                                            {classrooms.map((c) => (
                                                                <button
                                                                    key={c.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedClassId(c.id);
                                                                        setShowClassDropdown(false);
                                                                    }}
                                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs font-bold transition-colors cursor-pointer border-none bg-transparent ${
                                                                        c.id === selectedClassId ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white" : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                                                    }`}
                                                                >
                                                                    <span className="truncate">{c.nombre} - Sec. {c.seccion}</span>
                                                                    {c.id === selectedClassId && <Check size={14} className="text-[#1B1B1B] dark:text-white" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Dropdown de Estudiantes */}
                                        <div className="space-y-1 relative select-none">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">Seleccionar Estudiante</label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowStudentDropdown(!showStudentDropdown);
                                                    setShowClassDropdown(false);
                                                }}
                                                className="w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                                            >
                                                <span className="truncate">
                                                    {students.find(s => s.id === selectedStudentId)
                                                        ? `${students.find(s => s.id === selectedStudentId)?.nombre} ${students.find(s => s.id === selectedStudentId)?.apellido || ''}`.trim()
                                                        : students.length > 0 ? "Selecciona un estudiante..." : "No hay estudiantes en esta aula"}
                                                </span>
                                                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showStudentDropdown ? 'rotate-180' : ''}`} />
                                            </button>
                                            {showStudentDropdown && students.length > 0 && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => { setShowStudentDropdown(false); setStudentSearchQuery(''); }} />
                                                    <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1.5 z-50 max-h-60 overflow-y-auto text-left">
                                                        {students.length > 5 && (
                                                            <div className="p-1 border-b border-slate-100 dark:border-zinc-850 mb-1 sticky top-0 bg-white dark:bg-zinc-900 z-10">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Buscar estudiante..."
                                                                    value={studentSearchQuery}
                                                                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                                                                    className="w-full h-8 px-2.5 bg-neutral-50 dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-md text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="space-y-0.5">
                                                            {filteredStudents.map((s) => {
                                                                const name = `${s.nombre} ${s.apellido || ''}`.trim();
                                                                return (
                                                                    <button
                                                                        key={s.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedStudentId(s.id);
                                                                            setStudentName(name);
                                                                            setShowStudentDropdown(false);
                                                                            setStudentSearchQuery('');
                                                                        }}
                                                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs font-bold transition-colors cursor-pointer border-none bg-transparent ${
                                                                            s.id === selectedStudentId ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white" : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                                                        }`}
                                                                    >
                                                                        <span className="truncate">{name}</span>
                                                                        {s.id === selectedStudentId && <Check size={14} className="text-[#1B1B1B] dark:text-white" />}
                                                                    </button>
                                                                );
                                                            })}
                                                            {filteredStudents.length === 0 && (
                                                                <div className="py-2 px-3 text-xs text-slate-400 dark:text-zinc-500 text-center">
                                                                    No se encontraron estudiantes
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Modo Personalizado: Añadir nombre como antes, pero con el estilo de input de matrícula */
                                    <div className="space-y-1 animate-in fade-in duration-200">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                                            Nombre del Estudiante
                                        </label>
                                        <input 
                                            type="text"
                                            placeholder="Ej: Juan Pérez..." 
                                            value={studentName} 
                                            onChange={(e) => setStudentName(e.target.value)}
                                            className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                                        />
                                    </div>
                                )}

                                {/* Datos Institucionales (Estilo inputs de matrícula) */}
                                <div className="grid grid-cols-1 gap-4 py-4 border-y border-slate-100 dark:border-zinc-800">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">Tu Nombre (Firma)</label>
                                        <input 
                                            type="text"
                                            placeholder="Nombre completo" 
                                            value={teacherName} 
                                            onChange={(e) => setTeacherName(e.target.value)}
                                            className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">Centro Educativo</label>
                                        <input 
                                            type="text"
                                            placeholder="Nombre de la escuela" 
                                            value={institutionName} 
                                            onChange={(e) => setInstitutionName(e.target.value)}
                                            className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                                        />
                                    </div>
                                </div>

                                {/* Selector de Colores / Temas */}
                                <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                                        <Palette className="h-3 w-3" /> Colores del Diploma
                                    </label>
                                    <div className="flex flex-wrap gap-4 items-center">
                                        {DIPLOMA_THEMES.map((th) => (
                                            <button
                                                key={th.id}
                                                type="button"
                                                onClick={() => setSelectedThemeId(th.id)}
                                                className="group relative flex flex-col items-center gap-1.5 transition-all outline-none border-none bg-transparent cursor-pointer"
                                                title={th.name}
                                            >
                                                <div 
                                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                                                        selectedThemeId === th.id 
                                                        ? 'scale-110 shadow-lg ring-2 ring-blue-100 ring-offset-2' 
                                                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                                                    }`}
                                                    style={{ 
                                                        backgroundColor: th.primary, 
                                                        borderColor: th.accent 
                                                    }}
                                                >
                                                    {selectedThemeId === th.id && <CheckCircle2 className="h-4 w-4 text-white" />}
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-tighter ${selectedThemeId === th.id ? 'text-blue-600' : 'text-slate-400'}`}>
                                                    {th.name}
                                                </span>
                                            </button>
                                        ))}

                                        {/* "+" Button to show more colors */}
                                        {!showMoreColors && (
                                            <button
                                                type="button"
                                                onClick={() => setShowMoreColors(true)}
                                                className="w-10 h-10 rounded-full border-2 border-dashed border-slate-350 dark:border-zinc-700 flex items-center justify-center hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 font-black text-xl cursor-pointer bg-transparent transition-all"
                                                title="Mostrar más colores"
                                            >
                                                +
                                            </button>
                                        )}

                                        {/* 5 New Colors shown conditionally */}
                                        {showMoreColors && NEW_DIPLOMA_THEMES.map((th) => (
                                            <button
                                                key={th.id}
                                                type="button"
                                                onClick={() => setSelectedThemeId(th.id)}
                                                className="group relative flex flex-col items-center gap-1.5 transition-all outline-none border-none bg-transparent cursor-pointer"
                                                title={th.name}
                                            >
                                                <div 
                                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                                                        selectedThemeId === th.id 
                                                        ? 'scale-110 shadow-lg ring-2 ring-blue-100 ring-offset-2' 
                                                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                                                    }`}
                                                    style={{ 
                                                        backgroundColor: th.primary, 
                                                        borderColor: th.accent 
                                                    }}
                                                >
                                                    {selectedThemeId === th.id && <CheckCircle2 className="h-4 w-4 text-white" />}
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-tighter ${selectedThemeId === th.id ? 'text-blue-600' : 'text-slate-400'}`}>
                                                    {th.name}
                                                </span>
                                            </button>
                                        ))}

                                        {/* Professional Color Picker */}
                                        {showMoreColors && (
                                            <button
                                                type="button"
                                                className="group relative flex flex-col items-center gap-1.5 transition-all outline-none border-none bg-transparent"
                                                title="Color personalizado"
                                            >
                                                <div 
                                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all relative overflow-hidden ${
                                                        selectedThemeId === 'custom-color' 
                                                        ? 'scale-110 shadow-lg ring-2 ring-blue-100 ring-offset-2' 
                                                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                                                    }`}
                                                    style={{ 
                                                        background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
                                                        borderColor: selectedThemeId === 'custom-color' ? '#3b82f6' : '#cbd5e1'
                                                    }}
                                                >
                                                    <input 
                                                        type="color"
                                                        value={customColor}
                                                        onChange={(e) => {
                                                            const colorVal = e.target.value;
                                                            setCustomColor(colorVal);
                                                            localStorage.setItem('plx:diploma_custom_color', colorVal);
                                                            setSelectedThemeId('custom-color');
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                    />
                                                    {selectedThemeId === 'custom-color' && <CheckCircle2 className="h-4 w-4 text-white drop-shadow-md" />}
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-tighter ${selectedThemeId === 'custom-color' ? 'text-blue-600' : 'text-slate-400'}`}>
                                                    Color
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Previsualización en Vivo */}
                    <div ref={containerRef} className="flex flex-col items-center flex-grow w-full overflow-hidden">
                        <div className="w-full flex items-center justify-between px-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center font-semibold rounded-full px-2.5 py-1 text-[11px] bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
                                    PREVISUALIZACIÓN EN VIVO
                                </span>
                            </div>
                            <div className="flex items-center gap-2 select-none">
                                <span className="text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Fecha:</span>
                                <div className="w-48">
                                    <DatePicker
                                        value={dateIso}
                                        onChange={setDateIso}
                                        direction="down"
                                        align="right"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contenedor del Canvas con Escala */}
                        <div className="w-full bg-slate-100 dark:bg-zinc-950/50 p-4 sm:p-8 rounded-[2rem] border-4 border-white dark:border-zinc-800 flex items-start justify-center overflow-hidden relative shadow-inner">
                           <div className="w-full flex justify-center items-start pt-4" style={{ height: `${Math.floor(707 * scale) + 24}px` }}>
                                <div 
                                    className="origin-top transition-transform duration-300 ease-out"
                                    style={{ 
                                        width: '1000px',
                                        transform: `scale(${scale})`
                                    }}
                                >
                                    <div className="preview-wrap w-full">
                                        <DiplomaView 
                                            studentName={studentName}
                                            achievement={getAchievementLabel()}
                                            teacherName={teacherName}
                                            institutionName={institutionName}
                                            date={formattedDate}
                                            themeId={selectedThemeId}
                                            customColor={customColor}
                                        />
                                    </div>
                                </div>
                           </div>
                        </div>

                        {/* Selección de Categoría (Colocada debajo del diploma) */}
                        <div className="w-full bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-200 dark:border-zinc-800/80 p-6 shadow-sm mt-6 text-left">
                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                                <Award className="h-4 w-4 text-blue-500" />
                                CATEGORÍA DE LOGRO
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {ACHIEVEMENT_CATEGORIES.map((cat) => (
                                    <React.Fragment key={cat.id}>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`flex items-center gap-3 h-10 px-3.5 rounded-lg border text-sm text-left transition-all cursor-pointer ${
                                                    selectedCategory === cat.id 
                                                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50 text-blue-700 dark:text-blue-400' 
                                                    : 'bg-neutral-50 border-neutral-200 dark:bg-zinc-900/50 dark:border-zinc-800 hover:border-slate-200 text-slate-600 dark:text-zinc-400'
                                                }`}
                                            >
                                                <span className="text-xl">{cat.icon}</span>
                                                <span className="text-sm font-bold">
                                                    {cat.label}
                                                </span>
                                                {selectedCategory === cat.id && <CheckCircle2 className="h-4 w-4 text-blue-500 ml-auto" />}
                                            </button>

                                            {/* Textarea para logro personalizado */}
                                            {cat.id === 'custom' && selectedCategory === 'custom' && (
                                                <div className="space-y-2 py-1">
                                                    <textarea
                                                        placeholder="Escribe el reconocimiento aquí..."
                                                        value={customAchievement}
                                                        onChange={(e) => setCustomAchievement(e.target.value)}
                                                        className="w-full p-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs h-24 resize-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* SECCIÓN SOLO IMPRESIÓN (Oculta en web, visible al imprimir) */}
            <div className="hidden print:block print-full">
                <DiplomaView 
                    studentName={studentName}
                    achievement={getAchievementLabel()}
                    teacherName={teacherName}
                    institutionName={institutionName}
                    date={formattedDate}
                    themeId={selectedThemeId}
                    customColor={customColor}
                />
            </div>
        </div>
    );
}

/**
 * Componente del Diploma Individual
 */
function DiplomaView({ 
    studentName, 
    achievement, 
    teacherName, 
    institutionName,
    date,
    themeId = 'imperial',
    customColor = '#2563eb'
}: { 
    studentName: string, 
    achievement: string, 
    teacherName: string,
    institutionName: string,
    date: string,
    themeId?: string,
    customColor?: string
}) {
    const theme = [...DIPLOMA_THEMES, ...NEW_DIPLOMA_THEMES].find(t => t.id === themeId);
    let activeTheme = theme;
    if (themeId === 'custom-color') {
        const activeColor = customColor || localStorage.getItem('plx:diploma_custom_color') || '#2563eb';
        activeTheme = {
            id: 'custom-color',
            name: 'Personalizado',
            primary: activeColor,
            secondary: adjustColorBrightness(activeColor, -0.3),
            accent: adjustColorBrightness(activeColor, 0.4),
            accentDark: adjustColorBrightness(activeColor, -0.2),
            bg: '#ffffff'
        };
    }
    if (!activeTheme) {
        activeTheme = DIPLOMA_THEMES[0];
    }

    return (
        <div className="aspect-[297/210] w-[1000px] shadow-2xl relative overflow-hidden group print:shadow-none print:max-w-none print:w-full print:h-screen print:aspect-auto"
             style={{ backgroundColor: activeTheme.bg }}>
            {/* Fondo con textura */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
            
            {/* Bordes Ornamentales */}
            <div className="absolute inset-4 sm:inset-8 border-[1px] border-slate-350 pointer-events-none"></div>
            <div className="absolute inset-6 sm:inset-10 border-[12px] border-double pointer-events-none"
                 style={{ borderColor: activeTheme.primary }}>
                {/* Acentos de Esquinas */}
                <div className="absolute -top-3 -left-3 w-12 h-12 border-t-[6px] border-l-[6px] pointer-events-none" style={{ borderColor: activeTheme.accent }}></div>
                <div className="absolute -top-3 -right-3 w-12 h-12 border-t-[6px] border-r-[6px] pointer-events-none" style={{ borderColor: activeTheme.accent }}></div>
                <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b-[6px] border-l-[6px] pointer-events-none" style={{ borderColor: activeTheme.accent }}></div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-[6px] border-r-[6px] pointer-events-none" style={{ borderColor: activeTheme.accent }}></div>
            </div>

            {/* Contenido */}
            <div className="relative h-full flex flex-col items-center justify-between p-16 sm:p-24 text-center z-10">
                
                {/* Decoración del Header */}
                <div className="w-full flex items-center justify-center gap-6 mb-2">
                    <div className="h-[2px] flex-1 max-w-[100px]" style={{ backgroundColor: activeTheme.accent }}></div>
                    <div style={{ color: activeTheme.accent }}><Sparkles className="h-6 w-6" /></div>
                    <div className="h-[2px] flex-1 max-w-[100px]" style={{ backgroundColor: activeTheme.accent }}></div>
                </div>

                {/* Cabecera Institucional */}
                <div className="flex-1 flex flex-col justify-center">
                    <h5 className="text-[14px] font-black tracking-[0.3em] uppercase opacity-80 mb-2" style={{ color: activeTheme.primary }}>
                        {institutionName || 'CENTRO EDUCATIVO'}
                    </h5>
                    <h2 className="text-[48px] font-black uppercase tracking-tight leading-none" style={{ fontFamily: "'Playfair Display', serif", color: activeTheme.secondary }}>
                        Certificado de Mérito
                    </h2>
                    <div className="mt-4 text-slate-500 font-medium italic text-[18px]">
                        Este documento reconoce formalmente a:
                    </div>
                </div>

                {/* Nombre del Estudiante */}
                <div className="flex-[1.5] w-full flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-[85%] pb-2 border-b-[2px] border-dashed border-slate-300 flex justify-center items-center overflow-hidden">
                        <div className="text-[64px] leading-[1.1] text-center px-4" 
                             style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, wordBreak: 'keep-all', color: activeTheme.primary }}>
                            {studentName || 'Nombre del Estudiante'}
                        </div>
                    </div>
                </div>

                {/* Texto del Logro */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="text-slate-500 font-medium italic text-[18px] mb-4">Por su desempeño excepcional como:</div>
                    <div className="text-[28px] font-black uppercase tracking-wide leading-tight px-8" style={{ color: activeTheme.accentDark }}>
                        &quot;{achievement || 'CATEGORÍA DE LOGRO'}&quot;
                    </div>
                </div>

                {/* Pie de Página */}
                <div className="w-full mt-12 flex items-end justify-between px-10">
                    {/* Fecha */}
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="border-b border-slate-350 min-w-[200px] flex justify-center pb-0 overflow-visible">
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-2 uppercase tracking-widest translate-y-[2px] inline-flex pb-0.5">
                                <Calendar className="h-3 w-3" /> {date}
                            </span>
                        </div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Fecha de Entrega</div>
                    </div>

                    {/* Sello de Excelencia / Logo Planix */}
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
                        <img 
                            src="/logo planix.webp" 
                            alt="Logo Planix" 
                            className="h-24 w-auto object-contain" 
                        />
                    </div>

                    {/* Firma */}
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="border-b border-slate-350 min-w-[200px] flex justify-center pb-0 overflow-visible">
                            <span className="text-[24px] font-normal leading-none translate-y-[2px] inline-block"
                                  style={{ fontFamily: "'Alex Brush', cursive", color: '#0038a8' }}>
                               {teacherName || ''}
                            </span>
                        </div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Firma del Docente</div>
                    </div>
                </div>

                {/* Marca de agua */}
                <div className="absolute bottom-6 right-10 text-[8px] font-black text-slate-355 uppercase tracking-[0.3em] flex items-center gap-2 opacity-30">
                    PLANIX <div className="h-1 w-1 bg-slate-300 rounded-full"></div> RECONOCIMIENTO OFICIAL
                </div>
            </div>

            {/* Acentos de Fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] pointer-events-none rotate-12 -translate-y-8 translate-x-8">
                <Star className="w-full h-full" style={{ color: activeTheme.primary }} />
            </div>
            <div className="absolute bottom-0 left-0 w-48 h-48 opacity-[0.03] pointer-events-none rotate-45 translate-y-12 -translate-x-12">
                <Award className="w-full h-full" style={{ color: activeTheme.primary }} />
            </div>
        </div>
    );
}
