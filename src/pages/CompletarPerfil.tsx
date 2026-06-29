import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, saveUsuario, setSession } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { requestD1 } from '../lib/services/d1Client';
import {
  User,
  School,
  BookOpen,
  Library,
  ArrowRight,
  Check,
  CheckCircle2,
  Calculator,
  Target,
  BookMarked,
  Notebook,
  PenTool,
  Globe,
  Atom,
  Palette,
  Microscope,
  FlaskConical,
  Languages,
  MapPin,
  AlertCircle,
  X,
  CalendarCheck,
  GraduationCap,
  Lightbulb,
  Award,
  Baby,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import PlatformLogo from '../components/ui/PlatformLogo';
import SchoolAutocomplete from '../components/forms/SchoolAutocomplete';
import { EDUCATION_STRUCTURE, getGradesByLevel, getGradeById } from '../lib/data/educationStructure';
import { EducationLevel } from '../types/education';
import { OFFICIAL_DEFAULT_SUBJECTS } from '../lib/data/defaultSubjects';
import { toast } from 'sonner';

interface GradeAssignment {
  gradeId: string;
  subjectIds: string[];
  gradeName: string;
}

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    center: '',
    level: '' as EducationLevel | '',
    cycle: '',
    grade: '',
    subjects: [] as string[]
  });

  const [assignments, setAssignments] = useState<GradeAssignment[]>([]);
  const [selectedSchoolData, setSelectedSchoolData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user session on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const userLevel = (user.nivel?.toUpperCase() as EducationLevel) || 'PRIMARIA';
      const grades = getGradesByLevel(userLevel);
      setFormData(prev => ({
        ...prev,
        center: user.colegio || '',
        level: userLevel,
        grade: user.grado || (grades.length > 0 ? grades[0].id : ''),
        cycle: user.ciclo || (grades.length > 0 ? grades[0].cycleId : '')
      }));

      // Load assignments if exists on user
      if (user.allowed_subjects && Object.keys(user.allowed_subjects).length > 0) {
        const loadedAssignments: GradeAssignment[] = [];
        Object.entries(user.allowed_subjects).forEach(([gId, sIds]) => {
          const gr = getGradeById(gId);
          loadedAssignments.push({
            gradeId: gId,
            gradeName: gr ? gr.displayName : gId,
            subjectIds: sIds as string[]
          });
        });
        setAssignments(loadedAssignments);
      }
    }
  }, []);

  // Browser fingerprint helper
  const fingerprint = React.useMemo(() => {
    return navigator.userAgent.replace(/[^a-zA-Z0-9]/g, "") + "-" + screen.width + "x" + screen.height;
  }, []);

  // Memoized helpers for education level and subjects
  const levelGrades = React.useMemo(() => {
    return formData.level ? getGradesByLevel(formData.level) : [];
  }, [formData.level]);

  const availableSubjects = React.useMemo(() => {
    const grade = getGradeById(formData.grade);
    if (!grade) return [];
    return OFFICIAL_DEFAULT_SUBJECTS.filter(s => 
      s.level === formData.level && 
      s.grades.some(g => grade.name.toLowerCase().includes(g.toLowerCase()))
    );
  }, [formData.level, formData.grade]);

  const currentGradeSubjects = React.useMemo(() => {
    const assignment = assignments.find(a => a.gradeId === formData.grade);
    return assignment ? assignment.subjectIds : [];
  }, [assignments, formData.grade]);

  const handleLevelChange = (level: EducationLevel) => {
    if (level === 'INICIAL') {
      toast.warning("El Nivel Inicial estará disponible próximamente.");
      return;
    }
    setFormData(prev => ({ ...prev, level, cycle: '', grade: '', subjects: [] }));
    const newGrades = getGradesByLevel(level);
    if (newGrades.length > 0) {
      setFormData(prev => ({ ...prev, level, grade: newGrades[0].id, cycle: newGrades[0].cycleId }));
    }
    setAssignments([]);
  };

  const toggleSubject = (subjectId: string) => {
    const activeAssignment = assignments.find(a => a.gradeId === formData.grade);
    const isSelected = activeAssignment?.subjectIds.includes(subjectId);

    setAssignments(prev => {
      const others = prev.filter(a => a.gradeId !== formData.grade);
      const currentIds = activeAssignment?.subjectIds || [];
      let newIds = isSelected ? currentIds.filter((sId: string) => sId !== subjectId) : [...currentIds, subjectId];
      if (newIds.length === 0) return others;
      
      const currentGradeObj = getGradeById(formData.grade);
      return [...others, { 
        gradeId: formData.grade, 
        gradeName: currentGradeObj ? currentGradeObj.displayName : formData.grade, 
        subjectIds: newIds 
      }];
    });
  };

  const handleToggleAll = () => {
    const currentGradeObj = getGradeById(formData.grade);
    if (!currentGradeObj) return;

    const currentAssignment = assignments.find(a => a.gradeId === formData.grade);
    const isFull = currentAssignment?.subjectIds.length === availableSubjects.length;

    setAssignments(prev => {
      const others = prev.filter(a => a.gradeId !== formData.grade);
      if (isFull) return others;
      return [...others, { 
        gradeId: formData.grade, 
        gradeName: currentGradeObj.displayName, 
        subjectIds: availableSubjects.map(s => s.id) 
      }];
    });
  };

  const isFormValid = () => {
    return (
      formData.center &&
      (formData.level === 'PRIMARIA' || formData.level === 'SECUNDARIA') &&
      assignments.length > 0
    );
  };

  const handleSubmit = async () => {
    if (!formData.center) {
      toast.warning("Por favor, busca y selecciona tu centro educativo.");
      return;
    }
    if (formData.level !== 'PRIMARIA' && formData.level !== 'SECUNDARIA') {
      toast.warning("Actualmente Planix solo está disponible para los niveles Primario y Secundario.");
      return;
    }
    if (!formData.cycle) {
      toast.warning("Por favor, selecciona un ciclo (Ciclo 1 o Ciclo 2).");
      return;
    }
    if (!formData.grade) {
      toast.warning("Por favor, selecciona un grado.");
      return;
    }
    if (assignments.length === 0) {
      toast.warning("Por favor, selecciona al menos una asignatura para un grado.");
      return;
    }

    setIsLoading(true);
    console.log('>>> [1/5] Iniciando guardado de perfil...');

    // Safety timeout to reset loading state if it hangs for more than 15 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn('!!! La operación está tardando demasiado. Verificando estado...');
      setIsLoading(false);
      toast.warning('El guardado está tardando más de lo esperado. Por favor, verifica tu conexión o intenta de nuevo.');
    }, 15000);

    try {
      // Fetch authenticated user from Supabase (if database is configured, or use current local user)
      let authUserId = currentUser?.id || 'usr_google_user';
      let authEmail = currentUser?.email || 'docente@planix.do';
      let fullNameValue = currentUser?.nombre || 'Docente Planix';
      let avatarUrlValue = currentUser?.avatar_url || '';

      try {
        const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
        if (supabaseUser) {
          authUserId = supabaseUser.id;
          authEmail = supabaseUser.email || authEmail;
          fullNameValue = supabaseUser.user_metadata?.full_name || fullNameValue;
          avatarUrlValue = supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || avatarUrlValue;
        }
      } catch (e) {
        console.log("No active Supabase session, using mock storage user instead", e);
      }

      console.log('>>> [2/5] Usuario verificado:', authUserId);

      const allowed_subjects = (() => {
        const map: Record<string, string[]> = {};
        assignments.forEach((a: GradeAssignment) => {
          map[a.gradeId] = a.subjectIds;
        });
        return map;
      })();

      // School metadata extraction
      const schoolMetadata = selectedSchoolData;
      const regionalRaw = schoolMetadata?.regional || (currentUser?.regional && currentUser.regional !== 'N/A' && currentUser.regional !== 'NA' ? currentUser.regional : 'N/A');
      const distritoRaw = schoolMetadata?.district || schoolMetadata?.distrito || (currentUser?.distrito && currentUser.distrito !== 'N/A' && currentUser.distrito !== 'NA' ? currentUser.distrito : 'N/A');
      const municipioRaw = schoolMetadata?.municipality || schoolMetadata?.municipio || (currentUser?.municipio && currentUser.municipio !== 'N/A' && currentUser.municipio !== 'NA' ? currentUser.municipio : 'N/A');

      const existingRole = currentUser?.rol || 'teacher';
      const subscriptionTier = currentUser?.suscripcion || 'free';
      const subscriptionStatus = currentUser?.estado_suscripcion || 'ACTIVO';

      // --- PASO 1: GUARDAR EN LA TABLA PÚBLICA DE D1 ---
      try {
        console.log('>>> [3/5] Guardando en la tabla profiles de D1...');
        await requestD1<any>("/api/profiles", "POST", {
          id: authUserId,
          school_name: formData.center,
          role: existingRole === 'admin' ? 'ADMINISTRADOR' : 'teacher',
          regional: regionalRaw,
          distrito: distritoRaw,
          municipio: municipioRaw,
          nivel_principal: formData.level.toLowerCase(),
          ciclo_principal: formData.cycle,
          grado_principal: formData.grade,
          allowed_subjects: allowed_subjects,
          full_name: fullNameValue,
          email: authEmail,
          subscription_tier: subscriptionTier,
          subscription_status: subscriptionStatus,
          subscription_expiry: currentUser?.suscripcion_hasta || new Date(Date.now() + 30 * 86400000).toISOString(),
          last_login: new Date().toISOString(),
          is_active: true,
          avatar_url: avatarUrlValue
        });
        console.log('>>> [v] Perfil público guardado en D1.');
      } catch (err) {
        console.warn('Upsert de D1 omitido o fallido', err);
      }

      // --- PASO 2: GUARDAR EN PERSISTENCIA LOCAL (CRÍTICO PARA LA APLICACIÓN LOCAL) ---
      const updatedUser = {
        ...currentUser,
        id: authUserId,
        nombre: fullNameValue,
        email: authEmail,
        colegio: formData.center,
        nivel: formData.level.toLowerCase() as any,
        ciclo: formData.cycle,
        grado: formData.grade,
        regional: regionalRaw,
        distrito: distritoRaw,
        municipio: municipioRaw,
        allowed_subjects: allowed_subjects,
        rol: existingRole,
        suscripcion: subscriptionTier,
        estado_suscripcion: subscriptionStatus,
        suscripcion_hasta: currentUser?.suscripcion_hasta || new Date(Date.now() + 30 * 86400000).toISOString(),
        avatar_url: avatarUrlValue
      };

      saveUsuario(updatedUser);
      setSession({ user_id: updatedUser.id, iniciado_en: new Date().toISOString() });

      // Liberamos la UI y celebramos
      clearTimeout(safetyTimeout);
      toast.success('¡Perfil completado con éxito! Bienvenido a Planix.');

      // Pequeña espera para asentar el estado
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('>>> [!] Redirigiendo al Dashboard...');
      navigate('/dashboard');

    } catch (error: any) {
      clearTimeout(safetyTimeout);
      console.error('Fallo en handleSubmit:', error);
      setIsLoading(false);
      toast.error(error.message || 'Error al guardar el perfil. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4 py-12 relative overflow-hidden">
      {/* Academic Icons Background */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <BookOpen className="absolute top-10 left-10 text-brand-primary" size={80} style={{ transform: 'rotate(-15deg)' }} />
        <Languages className="absolute bottom-1/3 right-10 text-brand-primary" size={70} style={{ transform: 'rotate(15deg)' }} />
        <BookMarked className="absolute top-40 left-1/2 text-brand-primary" size={75} style={{ transform: 'rotate(-12deg)' }} />
        <Calculator className="absolute top-20 right-20 text-brand-primary" size={90} style={{ transform: 'rotate(20deg)' }} />
        <Target className="absolute bottom-1/4 left-1/2 text-brand-primary" size={65} style={{ transform: 'rotate(-18deg)' }} />
        <Microscope className="absolute bottom-32 left-20 text-brand-primary" size={85} style={{ transform: 'rotate(10deg)' }} />
        <Atom className="absolute bottom-1/2 right-1/3 text-brand-primary" size={70} style={{ transform: 'rotate(-22deg)' }} />
        <FlaskConical className="absolute top-2/3 left-16 text-brand-primary" size={60} style={{ transform: 'rotate(22deg)' }} />
        <Globe className="absolute top-1/2 right-16 text-brand-primary" size={75} style={{ transform: 'rotate(15deg)' }} />
        <MapPin className="absolute bottom-40 right-1/4 text-brand-primary" size={60} style={{ transform: 'rotate(18deg)' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-primary-200/30 dark:shadow-none p-8 md:p-12 border border-slate-100 dark:border-zinc-800">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 font-display">Completa tu Perfil</h2>
            <p className="text-slate-500 dark:text-neutral-400 font-medium">Solo unos detalles más para personalizar tu experiencia.</p>
          </div>

          <div className="space-y-5">
            {/* 1. School */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-900 dark:text-white ml-1">Centro Educativo / Colegio</label>
              <SchoolAutocomplete
                value={formData.center}
                onChange={(value) => setFormData({ ...formData, center: value })}
                onSchoolSelect={(school) => setSelectedSchoolData(school)}
                placeholder="Buscar centro educativo..."
              />
            </div>

            {/* 2. NIVEL EDUCATIVO */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-center flex items-center gap-1.5 justify-center">
                <Library size={12} /> Nivel Educativo Principal
              </label>
              <div className="flex bg-black/[0.03] dark:bg-white/[0.03] p-1.5 rounded-full max-w-lg mx-auto w-full select-none border border-black/5 dark:border-white/5 relative">
                <button
                  type="button"
                  onClick={() => handleLevelChange("INICIAL")}
                  className="flex-1 py-3 px-5 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group border-none bg-transparent"
                >
                  {formData.level === "INICIAL" && (
                    <motion.div
                      layoutId="activeLevelPill"
                      className="absolute inset-0 bg-brand-primary rounded-full shadow-xs"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  <Baby size={16} className={`relative z-10 transition-colors duration-300 ${formData.level === "INICIAL" ? 'text-white' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                  <span className={`relative z-10 transition-colors duration-300 ${formData.level === "INICIAL" ? 'text-white' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                    Inicial
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLevelChange("PRIMARIA")}
                  className="flex-1 py-3 px-5 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group border-none bg-transparent"
                >
                  {formData.level === "PRIMARIA" && (
                    <motion.div
                      layoutId="activeLevelPill"
                      className="absolute inset-0 bg-brand-primary rounded-full shadow-xs"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  <BookOpen size={16} className={`relative z-10 transition-colors duration-300 ${formData.level === "PRIMARIA" ? 'text-white' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                  <span className={`relative z-10 transition-colors duration-300 ${formData.level === "PRIMARIA" ? 'text-white' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                    Primaria
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLevelChange("SECUNDARIA")}
                  className="flex-1 py-3 px-5 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group border-none bg-transparent"
                >
                  {formData.level === "SECUNDARIA" && (
                    <motion.div
                      layoutId="activeLevelPill"
                      className="absolute inset-0 bg-brand-primary rounded-full shadow-xs"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  <GraduationCap size={16} className={`relative z-10 transition-colors duration-300 ${formData.level === "SECUNDARIA" ? 'text-white' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                  <span className={`relative z-10 transition-colors duration-300 ${formData.level === "SECUNDARIA" ? 'text-white' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                    Secundaria
                  </span>
                </button>
              </div>
            </div>

            {/* Grado Académico */}
            {(formData.level === "PRIMARIA" || formData.level === "SECUNDARIA") && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-center">Grado Académico</label>
                <div className="grid grid-cols-6 gap-2 max-w-xl mx-auto w-full">
                  {levelGrades.map(grade => {
                    const isActive = formData.grade === grade.id;
                    const hasAssignments = assignments.some(a => a.gradeId === grade.id && a.subjectIds.length > 0);

                    return (
                      <button
                        key={grade.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            grade: grade.id,
                            cycle: grade.cycleId
                          }));
                        }}
                        className={`relative py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border min-h-[44px] w-full cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 dark:bg-brand-primary text-white border-slate-900 dark:border-brand-primary shadow-xs animate-none'
                            : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-neutral-200 border-black/5 dark:border-zinc-800 hover:border-black/20 dark:hover:border-zinc-700'
                        }`}
                      >
                        <span>{grade.name.replace(" Sec", "")}</span>
                        <span className={`text-[8px] font-bold uppercase tracking-tight ${isActive ? 'text-white/60' : 'text-slate-400 dark:text-zinc-500'}`}>Grado</span>
                        {hasAssignments && (
                          <div className={`absolute -top-1 -right-1 rounded-md p-0.5 shadow-xs shrink-0 ${
                            isActive ? 'bg-white text-slate-900 dark:text-zinc-950 border border-black/5' : 'bg-emerald-500 text-white'
                          }`}>
                            <Check size={8} strokeWidth={4.5} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subject Selector Workspace */}
            {formData.grade && (formData.level === "PRIMARIA" || formData.level === "SECUNDARIA") && (
              <div className="bg-slate-50/40 dark:bg-zinc-900/40 p-4 rounded-[24px] border border-black/5 dark:border-zinc-800 space-y-3 mt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <h3 className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-widest">
                      Asignaturas para {getGradeById(formData.grade)?.displayName.split(" (")[0]}
                    </h3>
                  </div>
                  {availableSubjects.length > 0 && (
                    <button
                      type="button"
                      onClick={handleToggleAll}
                      className="text-[10px] font-bold text-slate-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 bg-white dark:bg-zinc-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-xs transition-colors cursor-pointer"
                    >
                      {currentGradeSubjects.length === availableSubjects.length ? "Ninguna" : "Todas"}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {availableSubjects.map((subject) => {
                    const isSelected = currentGradeSubjects.includes(subject.id);
                    const themeColor = subject.color || '#1E40AF';
                    
                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => toggleSubject(subject.id)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-left transition-all relative flex items-center gap-3 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs w-full h-10 overflow-hidden cursor-pointer"
                        style={isSelected ? {
                          borderColor: themeColor,
                          backgroundColor: `${themeColor}0F`, // ~9% opacity for the active color tint
                          color: themeColor,
                          boxShadow: `0 2px 8px ${themeColor}0A`
                        } : {}}
                      >
                        <div className={`text-lg transition-all duration-300 ${isSelected ? 'scale-105' : 'filter grayscale opacity-70'}`}>
                          {subject.icon}
                        </div>
                        
                        <div 
                          className="text-[11.5px] font-bold leading-tight tracking-tight truncate pr-6 text-slate-800 dark:text-neutral-200"
                          style={isSelected ? { color: themeColor } : {}}
                        >
                          {subject.name}
                        </div>

                        {isSelected && (
                          <div 
                            className="absolute right-2.5 rounded-md p-0.5 shadow-xs animate-in zoom-in duration-200"
                            style={{ backgroundColor: themeColor }}
                          >
                            <Check size={9} className="text-white" strokeWidth={4.5} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ASSIGNMENTS SUMMARY */}
            {assignments.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="bg-brand-light/25 border border-brand-primary/10 rounded-2xl p-4">
                  <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CalendarCheck size={12} /> Resumen de Asignaciones
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {assignments.map((assignment, idx) => (
                      <div key={idx} className="bg-white dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 rounded-xl px-3 py-2 flex items-center gap-3">
                        <div>
                          <div className="text-xs font-black text-slate-800 dark:text-white">{assignment.gradeName}</div>
                          <div className="text-[10px] text-slate-500 dark:text-neutral-400">{assignment.subjectIds.length} asignaturas</div>
                        </div>
                        <button onClick={() => setAssignments(prev => prev.filter(a => a.gradeId !== assignment.gradeId))} className="text-slate-350 hover:text-rose-500 cursor-pointer transition-colors border-none bg-transparent p-0" title="Eliminar asignación">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Action Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={isLoading || assignments.length === 0}
                className="w-full bg-slate-900 dark:bg-brand-primary text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-brand-hover hover:scale-[1.02] transform transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? 'Guardando Perfil...' : (
                  <>
                    Completar Registro <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
