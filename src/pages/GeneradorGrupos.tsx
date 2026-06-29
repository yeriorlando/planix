import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { 
  ArrowLeft, Users, User, Shuffle, Copy, Printer, Check, X, 
  Plus, Trash2, Edit2, Search, RefreshCw, Sparkles, ChevronDown, HelpCircle, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getCurrentUser, getClassrooms, getStudents, Classroom, Student } from '../lib/storage';
import { getUserCredits } from '../lib/credits';
import confetti from 'canvas-confetti';

// Temas de Nombres para los Grupos
const THEMES = {
  educacion: [
    'Científicos', 'Escritores', 'Matemáticos', 'Historiadores', 'Poetas', 
    'Astrónomos', 'Investigadores', 'Biólogos', 'Químicos', 'Físicos', 
    'Filósofos', 'Inventores', 'Exploradores', 'Arqueólogos', 'Geógrafos'
  ],
  naturaleza: [
    'Leones', 'Águilas', 'Delfines', 'Tigres', 'Lobos', 'Halcones', 
    'Panteras', 'Jaguares', 'Orcas', 'Búhos', 'Osos', 'Zorros', 
    'Guepardos', 'Tiburones', 'Condores'
  ],
  espacio: [
    'Galaxias', 'Cometas', 'Nebulosas', 'Meteoros', 'Planetas', 
    'Constelaciones', 'Estrellas', 'Cosmos', 'Quásares', 'Supernovas', 
    'Andrómeda', 'Orión', 'Apolo', 'Voyager', 'Sputnik'
  ],
  gemas: [
    'Rubíes', 'Esmeraldas', 'Zafiros', 'Diamantes', 'Amatistas', 
    'Topacios', 'Turquesas', 'Ópalos', 'Jade', 'Ámbar', 
    'Cuarzos', 'Perlas', 'Granates', 'Obsidianas', 'Turmalinas'
  ]
};

interface Group {
  id: string;
  name: string;
  students: Student[];
}

export default function GeneradorGrupos() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  // Estados de datos
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  
  // Roster / Asistencia
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Configuración de Agrupación
  const [groupMode, setGroupMode] = useState<'num_groups' | 'students_per_group'>('num_groups');
  const [targetValue, setTargetValue] = useState<number>(4);
  const [criterion, setCriterion] = useState<'aleatorio' | 'genero'>('aleatorio');
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof THEMES>('educacion');

  // Reglas de Exclusión (Parejas a evitar)
  const [conflictPairs, setConflictPairs] = useState<Array<[string, string]>>([]);
  const [studentA, setStudentA] = useState<string>('');
  const [studentB, setStudentB] = useState<string>('');

  // Estados de control de dropdowns personalizados
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showCriterionDropdown, setShowCriterionDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showStudentADropdown, setShowStudentADropdown] = useState(false);
  const [showStudentBDropdown, setShowStudentBDropdown] = useState(false);

  // Refs para detectar clics fuera de los dropdowns
  const classDropdownRef = useRef<HTMLDivElement>(null);
  const criterionDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const studentADropdownRef = useRef<HTMLDivElement>(null);
  const studentBDropdownRef = useRef<HTMLDivElement>(null);

  // Manejador de clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (classDropdownRef.current && !classDropdownRef.current.contains(event.target as Node)) {
        setShowClassDropdown(false);
      }
      if (criterionDropdownRef.current && !criterionDropdownRef.current.contains(event.target as Node)) {
        setShowCriterionDropdown(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setShowThemeDropdown(false);
      }
      if (studentADropdownRef.current && !studentADropdownRef.current.contains(event.target as Node)) {
        setShowStudentADropdown(false);
      }
      if (studentBDropdownRef.current && !studentBDropdownRef.current.contains(event.target as Node)) {
        setShowStudentBDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Grupos generados
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationSteps, setGenerationSteps] = useState<string>('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string>('');
  const [showMoveMenuForStudentId, setShowMoveMenuForStudentId] = useState<string | null>(null);

  // Carga de datos iniciales
  useEffect(() => {
    if (user?.id) {
      const list = getClassrooms(user.id);
      setClassrooms(list);
      // No seleccionamos ningún aula por defecto, dejamos vacío
      setSelectedClassId('');
    }
  }, [user?.id]);

  // Carga de estudiantes al cambiar el aula
  useEffect(() => {
    if (selectedClassId) {
      const list = getStudents(selectedClassId);
      setStudents(list);
      // Todos marcados como presentes por defecto
      setPresentIds(new Set(list.map(s => s.id)));
      // Resetear reglas de exclusión y grupos
      setConflictPairs([]);
      setGroups([]);
      setStudentA('');
      setStudentB('');
    } else {
      setStudents([]);
      setPresentIds(new Set());
      setConflictPairs([]);
      setGroups([]);
      setStudentA('');
      setStudentB('');
    }
  }, [selectedClassId]);

  // Filtrar estudiantes por búsqueda
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const fullName = `${s.nombre} ${s.apellido || ''}`.toLowerCase();
      return fullName.includes(studentSearch.toLowerCase());
    });
  }, [students, studentSearch]);

  // Añadir pareja a evitar
  const handleAddConflictPair = () => {
    if (!studentA || !studentB) {
      toast.warning('Por favor selecciona ambos estudiantes.');
      return;
    }
    if (studentA === studentB) {
      toast.error('No puedes seleccionar al mismo estudiante.');
      return;
    }
    // Comprobar si ya existe
    const exists = conflictPairs.some(
      pair => (pair[0] === studentA && pair[1] === studentB) || (pair[0] === studentB && pair[1] === studentA)
    );
    if (exists) {
      toast.warning('Esta pareja ya está en la lista de exclusión.');
      return;
    }
    if (conflictPairs.length >= 4) {
      toast.warning('Límite de 4 parejas de exclusión alcanzado para garantizar resolubilidad.');
      return;
    }

    setConflictPairs([...conflictPairs, [studentA, studentB]]);
    setStudentA('');
    setStudentB('');
    toast.success('Pareja agregada a la lista de exclusión.');
  };

  // Quitar pareja a evitar
  const handleRemoveConflictPair = (index: number) => {
    setConflictPairs(conflictPairs.filter((_, idx) => idx !== index));
    toast.info('Pareja eliminada de exclusión.');
  };

  // Alternar asistencia individual
  const toggleAttendance = (id: string) => {
    const next = new Set(presentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setPresentIds(next);
  };


  // Algoritmo de barajado (Fisher-Yates)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Algoritmo principal de generación de grupos
  const handleGenerateGroups = () => {
    const activeStudents = students.filter(s => presentIds.has(s.id));
    if (activeStudents.length === 0) {
      toast.error('No hay estudiantes presentes para agrupar.');
      return;
    }

    if (targetValue <= 0) {
      toast.error('La cantidad debe ser mayor que cero.');
      return;
    }

    setIsGenerating(true);
    setGenerationSteps('Barajando estudiantes...');

    setTimeout(() => {
      // 1. Determinar número de grupos
      let numGroups = 1;
      if (groupMode === 'num_groups') {
        numGroups = Math.min(targetValue, activeStudents.length);
      } else {
        numGroups = Math.max(1, Math.ceil(activeStudents.length / targetValue));
      }

      setGenerationSteps('Aplicando criterios de distribución...');

      // 2. Barajar y distribuir
      let distributedStudents: Student[] = [];
      if (criterion === 'genero') {
        // Equilibrar por género
        const boys = shuffleArray<Student>(activeStudents.filter(s => s.genero !== 'F'));
        const girls = shuffleArray<Student>(activeStudents.filter(s => s.genero === 'F'));
        
        // Intercalar
        const maxLen = Math.max(boys.length, girls.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < boys.length) distributedStudents.push(boys[i]);
          if (i < girls.length) distributedStudents.push(girls[i]);
        }
      } else {
        // Puro aleatorio
        distributedStudents = shuffleArray<Student>(activeStudents);
      }

      // Inicializar los contenedores de grupos
      const tempGroups: Group[] = Array.from({ length: numGroups }, (_, idx) => ({
        id: `group_${idx}`,
        name: `${THEMES[selectedTheme][idx % THEMES[selectedTheme].length]}${idx >= THEMES[selectedTheme].length ? ' ' + Math.ceil((idx + 1) / THEMES[selectedTheme].length) : ''}`,
        students: []
      }));

      // Distribuir estudiantes en los grupos equitativamente (round-robin)
      distributedStudents.forEach((student, index) => {
        const groupIdx = index % numGroups;
        tempGroups[groupIdx].students.push(student);
      });

      // 3. Resolver reglas de exclusión (evitar parejas en el mismo grupo)
      if (conflictPairs.length > 0) {
        setGenerationSteps('Verificando parejas de exclusión...');
        
        let swapsPerformed = 0;
        let conflictExists = true;
        let maxIterations = 20; // Evitar bucles infinitos

        while (conflictExists && maxIterations > 0) {
          conflictExists = false;
          maxIterations--;

          for (let pair of conflictPairs) {
            const [idA, idB] = pair;
            
            // Buscar si algún grupo contiene a ambos estudiantes
            const offendingGroup = tempGroups.find(g => 
              g.students.some(s => s.id === idA) && g.students.some(s => s.id === idB)
            );

            if (offendingGroup) {
              conflictExists = true;
              
              // Intentar mover a uno de ellos a otro grupo
              const studentToSwap = offendingGroup.students.find(s => s.id === idB)!;
              
              // Buscar un estudiante de reemplazo en otro grupo
              let swapSuccess = false;
              for (let targetGroup of tempGroups) {
                if (targetGroup.id === offendingGroup.id) continue;

                // Buscar un estudiante en targetGroup que:
                // 1. Al moverlo a offendingGroup no genere un nuevo conflicto con idA.
                // 2. Al mover studentToSwap a targetGroup no genere un nuevo conflicto en targetGroup.
                const candidate = targetGroup.students.find(cand => {
                  // Comprobar si candidate tiene conflictos en offendingGroup (sin studentToSwap, con idA)
                  const hasConflictInOffending = conflictPairs.some(p => {
                    const isOther = p[0] === cand.id ? p[1] : p[1] === cand.id ? p[0] : null;
                    return isOther && offendingGroup.students.some((s: Student) => s.id === isOther && s.id !== studentToSwap.id);
                  });

                  // Comprobar si studentToSwap tiene conflictos en targetGroup (sin candidate)
                  const hasConflictInTarget = conflictPairs.some(p => {
                    const isOther = p[0] === studentToSwap.id ? p[1] : p[1] === studentToSwap.id ? p[0] : null;
                    return isOther && targetGroup.students.some((s: Student) => s.id === isOther && s.id !== cand.id);
                  });

                  return !hasConflictInOffending && !hasConflictInTarget;
                });

                if (candidate) {
                  // Realizar el intercambio
                  offendingGroup.students = offendingGroup.students.map(s => s.id === studentToSwap.id ? candidate : s);
                  targetGroup.students = targetGroup.students.map(s => s.id === candidate.id ? studentToSwap : s);
                  swapsPerformed++;
                  swapSuccess = true;
                  break;
                }
              }

              // Si no pudimos realizar un intercambio óptimo sin conflictos, hacemos un swap forzado para deshacer el conflicto actual
              if (!swapSuccess) {
                for (let targetGroup of tempGroups) {
                  if (targetGroup.id === offendingGroup.id) continue;
                  if (targetGroup.students.length > 0) {
                    const candidate = targetGroup.students[0];
                    offendingGroup.students = offendingGroup.students.map(s => s.id === studentToSwap.id ? candidate : s);
                    targetGroup.students = targetGroup.students.map(s => s.id === candidate.id ? studentToSwap : s);
                    swapsPerformed++;
                    break;
                  }
                }
              }
            }
          }
        }
      }

      setGroups(tempGroups);
      setIsGenerating(false);
      
      // Lanzar confeti de éxito
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      toast.success('Grupos generados exitosamente.');
    }, 850);
  };

  // Reubicación manual de un estudiante
  const handleMoveStudent = (studentId: string, sourceGroupId: string, targetGroupId: string) => {
    if (sourceGroupId === targetGroupId) return;

    let studentToMove: Student | null = null;
    const updatedGroups = groups.map(group => {
      if (group.id === sourceGroupId) {
        studentToMove = group.students.find(s => s.id === studentId) || null;
        return {
          ...group,
          students: group.students.filter(s => s.id !== studentId)
        };
      }
      return group;
    });

    if (studentToMove) {
      const finalGroups = updatedGroups.map(group => {
        if (group.id === targetGroupId) {
          return {
            ...group,
            students: [...group.students, studentToMove!]
          };
        }
        return group;
      });
      setGroups(finalGroups);
      toast.success('Estudiante reubicado.');
    }
    setShowMoveMenuForStudentId(null);
  };

  // Editar nombre del grupo
  const handleStartRenameGroup = (id: string, currentName: string) => {
    setEditingGroupId(id);
    setEditingGroupName(currentName);
  };

  const handleSaveGroupName = (id: string) => {
    if (!editingGroupName.trim()) {
      toast.warning('El nombre del grupo no puede estar vacío.');
      return;
    }
    setGroups(groups.map(g => g.id === id ? { ...g, name: editingGroupName.trim() } : g));
    setEditingGroupId(null);
  };

  // Copiar distribución al portapapeles
  const handleCopyGroups = () => {
    if (groups.length === 0) {
      toast.warning('No hay grupos generados para copiar.');
      return;
    }

    const classInfo = classrooms.find(c => c.id === selectedClassId);
    let text = `🎒 *Distribución de Grupos — ${classInfo?.nombre || 'Clase'}*\n`;
    text += `📅 Fecha: ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n`;

    groups.forEach((g, idx) => {
      text += `👥 *${g.name}* (${g.students.length} alumnos):\n`;
      if (g.students.length === 0) {
        text += `  _(Sin estudiantes)_\n`;
      } else {
        g.students.forEach((s, sIdx) => {
          text += `  ${sIdx + 1}. ${s.nombre} ${s.apellido || ''} (${s.genero})\n`;
        });
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text)
      .then(() => toast.success('Grupos copiados al portapapeles.'))
      .catch(() => toast.error('No se pudo copiar al portapapeles.'));
  };

  // Imprimir layout
  const handlePrint = () => {
    if (groups.length === 0) {
      toast.warning('No hay grupos generados para imprimir.');
      return;
    }
    window.print();
  };

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    } print:p-0 print:m-0`}>
      
      <header className="print:hidden flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs mb-6 mt-1">
        <Link to="/herramientas" className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-4 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a Herramientas
        </Link>
      </header>

      {/* Título Principal (HTML Rediseñado, Compacto y Estático) */}
      <div className="print:hidden mb-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-600/10 dark:from-emerald-500/15 dark:to-teal-600/15 border border-emerald-500/15 dark:border-emerald-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full">
        {/* Decoración de fondo */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Contenedor de Icono */}
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center shrink-0 border border-emerald-500/30 dark:border-emerald-500/40 relative">
          <Users className="w-5 h-5 md:w-6 h-6 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
        </div>

        {/* Textos */}
        <div className="text-center md:text-left flex-1 relative z-10">
          <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
            Generador de Grupos
          </h1>
          <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
            Organiza tu aula en grupos de trabajo de forma automatizada y balanceada en pocos segundos. Personaliza las reglas de género, habilidades y exclusión para lograr el equilibrio perfecto.
          </p>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Panel Izquierdo: Configuración (print:hidden) */}
        <section className="lg:col-span-5 space-y-6 print:hidden">
          <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-[18px] font-semibold text-text-main dark:text-white mb-5 flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-brand-primary" />
              Configuración de Grupos
            </h2>
            
            <div className="space-y-4">
              {/* Seleccionar Aula (Dropdown personalizado) */}
              <div ref={classDropdownRef} className="space-y-1 relative select-none">
                <label className="block text-[13px] font-medium text-text-muted dark:text-slate-400 mb-1.5">
                  Seleccionar Aula
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowClassDropdown(!showClassDropdown);
                    setShowCriterionDropdown(false);
                    setShowThemeDropdown(false);
                    setShowStudentADropdown(false);
                    setShowStudentBDropdown(false);
                  }}
                  className="w-full h-10 px-3.5 bg-[#f4f4f5]/60 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                >
                  <span className="truncate flex items-center gap-1.5">
                    {classrooms.find(c => c.id === selectedClassId) ? (
                      <>
                        <span>🏫</span>
                        <span className="truncate">
                          {classrooms.find(c => c.id === selectedClassId)?.nombre} - Sec. {classrooms.find(c => c.id === selectedClassId)?.seccion}
                        </span>
                      </>
                    ) : (
                      "Seleccionar Aula..."
                    )}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showClassDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showClassDropdown && classrooms.length > 0 && (
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
                            c.id === selectedClassId ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white" : "text-slate-755 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                          }`}
                        >
                          <span className="truncate flex items-center gap-1.5">
                            <span>🏫</span>
                            <span className="truncate">{c.nombre} - Sec. {c.seccion}</span>
                          </span>
                          {c.id === selectedClassId && <Check size={14} className="text-[#1B1B1B] dark:text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modo de Agrupamiento */}
              <div>
                <label className="block text-[13px] font-medium text-text-muted dark:text-slate-400 mb-2">
                  Método de División
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGroupMode('num_groups')}
                    className={`flex items-center justify-center gap-2 px-4 h-10 rounded-full font-bold text-[13px] transition-all cursor-pointer whitespace-nowrap active:scale-95 select-none border shadow-sm ${
                      groupMode === 'num_groups'
                        ? 'bg-[#04337e] text-white border-transparent shadow-md'
                        : 'bg-white text-text-muted hover:bg-black/5 border-black/10 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    Por cantidad de grupos
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupMode('students_per_group')}
                    className={`flex items-center justify-center gap-2 px-4 h-10 rounded-full font-bold text-[13px] transition-all cursor-pointer whitespace-nowrap active:scale-95 select-none border shadow-sm ${
                      groupMode === 'students_per_group'
                        ? 'bg-[#04337e] text-white border-transparent shadow-md'
                        : 'bg-white text-text-muted hover:bg-black/5 border-black/10 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <User className="w-4 h-4 shrink-0" />
                    Por alumnos por grupo
                  </button>
                </div>
              </div>

              {/* Valor de configuración */}
              <div>
                <label className="block text-[13px] font-medium text-text-muted dark:text-slate-400 mb-1.5">
                  {groupMode === 'num_groups' ? 'Cantidad de grupos a crear' : 'Cantidad de alumnos por grupo'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={students.length || 50}
                  value={targetValue}
                  onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-[14px] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Criterio (Dropdown personalizado) */}
              <div ref={criterionDropdownRef} className="space-y-1 relative select-none">
                <label className="block text-[13px] font-medium text-text-muted dark:text-slate-400 mb-1.5">
                  Criterio de Agrupación
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCriterionDropdown(!showCriterionDropdown);
                    setShowClassDropdown(false);
                    setShowThemeDropdown(false);
                    setShowStudentADropdown(false);
                    setShowStudentBDropdown(false);
                  }}
                  className="w-full h-10 px-3.5 bg-[#f4f4f5]/60 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                >
                  <span className="truncate">
                    {criterion === 'aleatorio' ? 'Aleatorio (Al azar)' : 'Equilibrar géneros (Equitativo M/F)'}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showCriterionDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showCriterionDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1.5 z-50 text-left">
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCriterion('aleatorio');
                          setShowCriterionDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs font-bold transition-colors cursor-pointer border-none bg-transparent ${
                          criterion === 'aleatorio' ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white" : "text-slate-750 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <span>Aleatorio (Al azar)</span>
                        {criterion === 'aleatorio' && <Check size={14} className="text-[#1B1B1B] dark:text-white" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCriterion('genero');
                          setShowCriterionDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs font-bold transition-colors cursor-pointer border-none bg-transparent ${
                          criterion === 'genero' ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white" : "text-slate-750 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <span>Equilibrar géneros (Equitativo M/F)</span>
                        {criterion === 'genero' && <Check size={14} className="text-[#1B1B1B] dark:text-white" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Temas de Nombres (Dropdown personalizado) */}
              <div ref={themeDropdownRef} className="space-y-1 relative select-none">
                <label className="block text-[13px] font-medium text-text-muted dark:text-slate-400 mb-1.5">
                  Temática de Nombres
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowThemeDropdown(!showThemeDropdown);
                    setShowClassDropdown(false);
                    setShowCriterionDropdown(false);
                    setShowStudentADropdown(false);
                    setShowStudentBDropdown(false);
                  }}
                  className="w-full h-10 px-3.5 bg-[#f4f4f5]/60 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                >
                  <span className="truncate">
                    {selectedTheme === 'educacion' ? 'Académicos (Científicos, Escritores...)' :
                     selectedTheme === 'naturaleza' ? 'Animales salvajes (Leones, Delfines...)' :
                     selectedTheme === 'espacio' ? 'El Espacio (Galaxias, Cometas...)' :
                     'Gemas hermosas (Rubíes, Esmeraldas...)'}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showThemeDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showThemeDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1.5 z-50 text-left">
                    <div className="space-y-0.5">
                      {[
                        { id: 'educacion', label: 'Académicos (Científicos, Escritores...)' },
                        { id: 'naturaleza', label: 'Animales salvajes (Leones, Delfines...)' },
                        { id: 'espacio', label: 'El Espacio (Galaxias, Cometas...)' },
                        { id: 'gemas', label: 'Gemas hermosas (Rubíes, Esmeraldas...)' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedTheme(t.id as any);
                            setShowThemeDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs font-bold transition-colors cursor-pointer border-none bg-transparent ${
                            selectedTheme === t.id ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white" : "text-slate-755 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                          }`}
                        >
                          <span>{t.label}</span>
                          {selectedTheme === t.id && <Check size={14} className="text-[#1B1B1B] dark:text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Exclusión de Parejas */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[16px] font-semibold text-text-main dark:text-white mb-2 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-brand-primary" />
              Evitar Coincidencias (Parejas)
            </h3>
            <p className="text-[12px] text-text-muted mb-4">
              Selecciona parejas de estudiantes que el algoritmo <strong className="font-bold text-red-600 dark:text-red-400">NO</strong> debe colocar en el mismo grupo.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {/* Estudiante A (Dropdown personalizado) */}
                <div ref={studentADropdownRef} className="relative select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStudentADropdown(!showStudentADropdown);
                      setShowStudentBDropdown(false);
                      setShowClassDropdown(false);
                      setShowCriterionDropdown(false);
                      setShowThemeDropdown(false);
                    }}
                    className="w-full h-10 px-3 bg-[#f4f4f5]/60 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                  >
                    <span className="truncate">
                      {students.find(s => s.id === studentA)
                        ? `${students.find(s => s.id === studentA)?.nombre} ${students.find(s => s.id === studentA)?.apellido || ''}`.trim()
                        : "Estudiante A"}
                    </span>
                    <ChevronDown size={12} className="text-slate-400" />
                  </button>
                  {showStudentADropdown && (
                    <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1.5 z-50 max-h-48 overflow-y-auto text-left">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setStudentA('');
                            setShowStudentADropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs font-bold text-slate-455 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                        >
                          Ninguno
                        </button>
                        {students
                          .filter(s => s.id !== studentB)
                          .map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setStudentA(s.id);
                                setShowStudentADropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs font-bold transition-colors cursor-pointer border-none bg-transparent ${
                                studentA === s.id ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white" : "text-slate-755 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                              }`}
                            >
                              <span className="truncate">{s.nombre} {s.apellido}</span>
                              {studentA === s.id && <Check size={12} className="text-[#1B1B1B] dark:text-white" />}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Estudiante B (Dropdown personalizado) */}
                <div ref={studentBDropdownRef} className="relative select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStudentBDropdown(!showStudentBDropdown);
                      setShowStudentADropdown(false);
                      setShowClassDropdown(false);
                      setShowCriterionDropdown(false);
                      setShowThemeDropdown(false);
                    }}
                    className="w-full h-10 px-3 bg-[#f4f4f5]/60 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-brand-primary outline-none transition-all shadow-xs"
                  >
                    <span className="truncate">
                      {students.find(s => s.id === studentB)
                        ? `${students.find(s => s.id === studentB)?.nombre} ${students.find(s => s.id === studentB)?.apellido || ''}`.trim()
                        : "Estudiante B"}
                    </span>
                    <ChevronDown size={12} className="text-slate-400" />
                  </button>
                  {showStudentBDropdown && (
                    <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1.5 z-50 max-h-48 overflow-y-auto text-left">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setStudentB('');
                            setShowStudentBDropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs font-bold text-slate-455 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                        >
                          Ninguno
                        </button>
                        {students
                          .filter(s => s.id !== studentA)
                          .map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setStudentB(s.id);
                                setShowStudentBDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs font-bold transition-colors cursor-pointer border-none bg-transparent ${
                                studentB === s.id ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white" : "text-slate-755 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                              }`}
                            >
                              <span className="truncate">{s.nombre} {s.apellido}</span>
                              {studentB === s.id && <Check size={12} className="text-[#1B1B1B] dark:text-white" />}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddConflictPair}
                className="w-full h-10 rounded-full bg-indigo-50 border border-indigo-200/50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 text-[13px] font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 select-none"
              >
                <Plus size={16} />
                Agregar a exclusión
              </button>

              {/* Lista de parejas excluidas */}
              {conflictPairs.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-neutral-100 dark:border-zinc-800">
                  <span className="text-[12px] font-semibold text-text-muted dark:text-slate-400">Parejas a evitar:</span>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {conflictPairs.map((pair, idx) => {
                      const nameA = students.find(s => s.id === pair[0]);
                      const nameB = students.find(s => s.id === pair[1]);
                      return (
                        <div key={idx} className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-zinc-800/40 rounded-lg border border-neutral-100 dark:border-zinc-800">
                          <span className="text-[12px] text-text-main dark:text-white font-medium truncate max-w-[200px]">
                            {nameA?.nombre} ❌ {nameB?.nombre}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveConflictPair(idx)}
                            className="p-1 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Panel Derecho: Lista de Estudiantes (Asistencia) o Grupos Generados */}
        <section className="lg:col-span-7">
          
          {/* Si no hay aula seleccionada, mostramos un mensaje indicándolo */}
          {!selectedClassId ? (
            <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-3xl p-8 shadow-sm text-center py-16">
              <div className="w-16 h-16 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#04337e]" />
              </div>
              <h3 className="text-[18px] font-bold text-text-main dark:text-white mb-2">
                Selecciona un Aula
              </h3>
              <p className="text-text-muted text-sm max-w-sm mx-auto">
                Por favor, elige una de tus aulas en el panel de configuración de la izquierda para ver la lista de estudiantes y comenzar a generar grupos.
              </p>
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-[18px] font-semibold text-text-main dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#04337e]" />
                    Lista de Estudiantes ({students.length})
                  </h2>
                  <p className="text-[12px] text-text-muted">
                    Desmarca a los estudiantes que estén ausentes hoy antes de generar los grupos.
                  </p>
                </div>
              </div>

              {/* Buscador de estudiantes si hay más de 5 */}
              {students.length > 5 && (
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar estudiante por nombre..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-[13px] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              )}

              {/* Lista scrollable de estudiantes */}
              {filteredStudents.length === 0 ? (
                <div className="py-12 text-center text-text-muted">
                  No se encontraron estudiantes.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
                  {filteredStudents.map((s) => {
                    const isPresent = presentIds.has(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleAttendance(s.id)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                          isPresent 
                            ? 'border-brand-primary/20 bg-brand-primary/5 dark:bg-brand-primary/5 dark:border-brand-primary/30' 
                            : 'border-neutral-100 dark:border-zinc-800 opacity-60 hover:opacity-80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isPresent}
                          readOnly
                          className="w-4 h-4 text-brand-primary border-neutral-300 rounded focus:ring-brand-primary cursor-pointer pointer-events-none"
                        />
                        <div className="relative">
                          <img
                            src={s.avatar_url || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${s.nombre}`}
                            alt={s.nombre}
                            className="w-8 h-8 rounded-full border border-neutral-200 dark:border-zinc-700 bg-white"
                          />
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
                            s.genero === 'F' ? 'bg-pink-500' : 'bg-blue-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-text-main dark:text-white truncate">
                            #{s.numero_orden} {s.nombre} {s.apellido}
                          </div>
                          <div className="text-[11px] text-text-muted">
                            Género: <span className="font-bold">{s.genero === 'F' ? 'Femenino' : 'Masculino'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Botón principal de generar */}
              <div className="mt-8 border-t border-neutral-100 dark:border-zinc-800 pt-6">
                <button
                  type="button"
                  onClick={handleGenerateGroups}
                  disabled={isGenerating || presentIds.size === 0}
                  className="w-full h-11 bg-[#04337e] hover:bg-[#032a68] text-white rounded-full font-bold text-[13px] tracking-wide transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 select-none"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {generationSteps}
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generar Grupos ({presentIds.size} Alumnos)
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            
            // Si los grupos ya están generados, mostramos la distribución
            <div className="space-y-6">
              
              {/* Acciones de grupos */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGroups([])}
                    className="h-10 px-4 rounded-full bg-rose-50 border border-rose-200/50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 text-[13px] font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 select-none"
                  >
                    <RefreshCw size={14} />
                    Reiniciar
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyGroups}
                    className="h-10 px-4 rounded-full bg-blue-50 border border-blue-200/50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 text-[13px] font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 select-none"
                  >
                    <Copy size={14} />
                    Copiar texto
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="h-10 px-4 rounded-full bg-[#01b36d] hover:bg-[#01965c] text-white text-[13px] font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 select-none border border-transparent"
                  >
                    <Printer size={14} />
                    Imprimir / PDF
                  </button>
                </div>
              </div>

              {/* Titulo para impresión (oculto en pantalla) */}
              <div className="hidden print:block text-center mb-6">
                <h1 className="text-2xl font-bold text-black">
                  Distribución de Grupos
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Aula: {classrooms.find(c => c.id === selectedClassId)?.nombre} | Fecha: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Contenedor Grid de Grupos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                {groups.map((group) => {
                  const boysCount = group.students.filter(s => s.genero !== 'F').length;
                  const girlsCount = group.students.filter(s => s.genero === 'F').length;

                  return (
                    <div
                      key={group.id}
                      className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm print:border-gray-300 print:shadow-none break-inside-avoid"
                    >
                      {/* Cabecera del Grupo */}
                      <div className="flex items-center justify-between mb-4 border-b border-neutral-50 dark:border-zinc-800/60 pb-3">
                        {editingGroupId === group.id ? (
                          <div className="flex items-center gap-1.5 flex-1 select-none">
                            <input
                              type="text"
                              value={editingGroupName}
                              onChange={(e) => setEditingGroupName(e.target.value)}
                              className="h-8 px-2 bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-lg text-[13px] font-bold text-text-main dark:text-white flex-1 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveGroupName(group.id)}
                              className="w-8 h-8 flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-950/30 dark:hover:bg-green-900/50 dark:text-green-400 rounded-full transition-all active:scale-90 shrink-0 cursor-pointer"
                            >
                              <Check size={14} className="shrink-0" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingGroupId(null)}
                              className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-full transition-all active:scale-90 shrink-0 cursor-pointer"
                            >
                              <X size={14} className="shrink-0" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <h4 className="text-[16px] font-bold text-text-main dark:text-white flex items-center gap-1.5">
                              {group.name}
                              <button
                                onClick={() => handleStartRenameGroup(group.id, group.name)}
                                className="p-1 text-text-muted hover:text-text-main hover:bg-neutral-50 dark:hover:bg-zinc-800 rounded-md transition-all print:hidden"
                              >
                                <Edit2 size={12} />
                              </button>
                            </h4>
                            <span className="text-[11px] font-semibold text-text-muted bg-neutral-50 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                              {group.students.length} alumnos
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Lista de Estudiantes en el Grupo */}
                      <ul className="space-y-2">
                        {group.students.length === 0 ? (
                          <li className="text-[12px] text-text-muted italic py-3 text-center">
                            Sin estudiantes
                          </li>
                        ) : (
                          group.students.map((student) => (
                            <li
                              key={student.id}
                              className="flex items-center justify-between px-3 py-2 bg-neutral-50/50 dark:bg-zinc-800/30 rounded-xl border border-neutral-100/40 dark:border-zinc-800/40 relative"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={student.avatar_url || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${student.nombre}`}
                                  alt={student.nombre}
                                  className="w-6.5 h-6.5 rounded-full bg-white border border-neutral-100 dark:border-zinc-700"
                                />
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  student.genero === 'F' ? 'bg-pink-500' : 'bg-blue-500'
                                }`} />
                                <span className="text-[13px] font-semibold text-text-main dark:text-white truncate">
                                  {student.nombre} {student.apellido}
                                </span>
                              </div>

                              {/* Selector para mover alumno (print:hidden) */}
                              <div className="relative print:hidden">
                                <button
                                  type="button"
                                  onClick={() => setShowMoveMenuForStudentId(showMoveMenuForStudentId === student.id ? null : student.id)}
                                  className="p-1 text-text-muted hover:text-text-main hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded transition-all"
                                >
                                  <ChevronDown size={14} />
                                </button>

                                {showMoveMenuForStudentId === student.id && (
                                  <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-zinc-900 border border-[#e5e7eb] dark:border-zinc-800 rounded-lg shadow-lg py-1.5 z-30 max-h-[160px] overflow-y-auto">
                                    <span className="block px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">Mover a:</span>
                                    {groups
                                      .filter(g => g.id !== group.id)
                                      .map(g => (
                                        <button
                                          key={g.id}
                                          type="button"
                                          onClick={() => handleMoveStudent(student.id, group.id, g.id)}
                                          className="w-full text-left px-3 py-2 text-[12.5px] font-semibold hover:bg-neutral-50 dark:hover:bg-zinc-800 text-text-main dark:text-white transition-colors flex items-center gap-2 cursor-pointer"
                                        >
                                          <Users className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                          <span className="truncate">{g.name}</span>
                                        </button>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </li>
                          ))
                        )}
                      </ul>

                      {/* Estadísticas de género del Grupo */}
                      <div className="mt-3.5 pt-2.5 border-t border-neutral-50 dark:border-zinc-800/40 flex justify-between text-[10px] text-text-muted font-medium select-none">
                        <span>Varones: {boysCount}</span>
                        <span>Hembras: {girlsCount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
