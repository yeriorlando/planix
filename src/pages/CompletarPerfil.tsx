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
  const existingRole = currentUser?.rol || 'teacher';
  const isAdmin = String(existingRole || '').toLowerCase().includes('admin');

  const [formData, setFormData] = useState({
    center: '',
    level: '' as EducationLevel | '',
    cycle: '',
    grade: '',
    subjects: [] as string[]
  });

  const [assignments, setAssignments] = useState<GradeAssignment[]>([]);
  const MAX_ALLOWED_SUBJECTS = 6;
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
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

  const totalSubjectsCount = React.useMemo(() => {
    return assignments.reduce((acc, a) => acc + a.subjectIds.length, 0);
  }, [assignments]);

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

    // Si no es admin, no está seleccionada y ya alcanzó el límite de 6, advertir sobre precio y bloquear
    if (!isAdmin && !isSelected && totalSubjectsCount >= MAX_ALLOWED_SUBJECTS) {
      toast.warning("Límite de 6 asignaturas alcanzado", {
        description: "El plan base incluye 6 asignaturas (RD$ 1,000/mes). Cada asignatura adicional: RD$ 150/mes.",
        duration: 5000,
      });
      setShowLimitModal(true);
      return;
    }

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
    if (currentAssignment && currentAssignment.subjectIds.length > 0) {
      // Limpiar este grado
      setAssignments(prev => prev.filter(a => a.gradeId !== formData.grade));
      return;
    }

    // Los administradores son los únicos con permiso para seleccionar todas las asignaturas
    if (isAdmin) {
      setAssignments(prev => [
        ...prev.filter(a => a.gradeId !== formData.grade),
        { 
          gradeId: formData.grade, 
          gradeName: currentGradeObj.displayName, 
          subjectIds: availableSubjects.map(s => s.id) 
        }
      ]);
      return;
    }

    const availableSlots = MAX_ALLOWED_SUBJECTS - totalSubjectsCount;
    if (availableSlots <= 0) {
      toast.warning("Límite de 6 asignaturas alcanzado", {
        description: "El plan base incluye 6 asignaturas (RD$ 1,000/mes). Cada asignatura adicional: RD$ 150/mes.",
        duration: 5000,
      });
      setShowLimitModal(true);
      return;
    }

    const toSelect = availableSubjects.slice(0, availableSlots).map(s => s.id);
    setAssignments(prev => [
      ...prev.filter(a => a.gradeId !== formData.grade),
      { 
        gradeId: formData.grade, 
        gradeName: currentGradeObj.displayName, 
        subjectIds: toSelect 
      }
    ]);

    if (availableSubjects.length > availableSlots) {
      toast.info(`Se agregaron ${availableSlots} asignaturas para completar tu límite de 6.`);
    }
  };

  const isFormValid = () => {
    if (existingRole === 'coordinator') {
      return !!formData.center;
    }
    return (
      formData.center &&
      (formData.level === 'PRIMARIA' || formData.level === 'SECUNDARIA') &&
      assignments.length > 0 &&
      (isAdmin || totalSubjectsCount <= MAX_ALLOWED_SUBJECTS)
    );
  };

  const handleInitiateSubmit = () => {
    if (!formData.center) {
      toast.warning("Por favor, busca y selecciona tu centro educativo.");
      return;
    }
    if (existingRole !== 'coordinator') {
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
      if (assignments.length === 0 || totalSubjectsCount === 0) {
        toast.warning("Por favor, selecciona al menos una asignatura para un grado.");
        return;
      }
      if (!isAdmin && totalSubjectsCount > MAX_ALLOWED_SUBJECTS) {
        toast.error(`Has seleccionado ${totalSubjectsCount} asignaturas. El límite máximo del plan base es de ${MAX_ALLOWED_SUBJECTS}.`);
        setShowLimitModal(true);
        return;
      }
      setShowSummaryModal(true);
      return;
    }

    handleSubmit();
  };

  const handleConfirmAndSubmit = () => {
    setShowSummaryModal(false);
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!formData.center) {
      toast.warning("Por favor, busca y selecciona tu centro educativo.");
      return;
    }
    if (existingRole !== 'coordinator') {
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
    }

    setIsLoading(true);
    console.log('>>> [1/5] Iniciando guardado de perfil...');

    // Safety timeout to reset loading state if it hangs for more than 15 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn('!!! La operation está tardando demasiado. Verificando estado...');
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
        if (existingRole === 'coordinator') return null;
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

      const subscriptionTier = currentUser?.suscripcion || 'free';
      const subscriptionStatus = currentUser?.estado_suscripcion || 'ACTIVO';

      // --- PASO 1: GUARDAR EN LA TABLA PÚBLICA DE D1 ---
      try {
        console.log('>>> [3/5] Guardando en la tabla profiles de D1...');
        await requestD1<any>("/api/profiles", "POST", {
          id: authUserId,
          school_name: formData.center,
          role: existingRole === 'admin' ? 'ADMINISTRADOR' : (existingRole === 'coordinator' ? 'COORDINADOR' : 'DOCENTE'),
          regional: regionalRaw,
          distrito: distritoRaw,
          municipio: municipioRaw,
          nivel_principal: existingRole === 'coordinator' ? null : formData.level.toLowerCase(),
          ciclo_principal: existingRole === 'coordinator' ? null : formData.cycle,
          grado_principal: existingRole === 'coordinator' ? null : formData.grade,
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
        nivel: existingRole === 'coordinator' ? null : formData.level.toLowerCase() as any,
        ciclo: existingRole === 'coordinator' ? null : formData.cycle,
        grado: existingRole === 'coordinator' ? null : formData.grade,
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

            {/* 2. NIVEL EDUCATIVO, GRADOS Y ASIGNATURAS (SOLO PARA DOCENTES) */}
            {existingRole !== 'coordinator' && (
              <>
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

                {/* Cupo de Asignaturas & Tarifas Banner */}
                {(formData.level === "PRIMARIA" || formData.level === "SECUNDARIA") && (
                  isAdmin ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">👑</span>
                        <div>
                          <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                            Modo Administrador Activo
                          </h4>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                            Tienes asignación ilimitada de asignaturas y grados.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100 px-2.5 py-1 rounded-full">
                        {totalSubjectsCount} asignaturas
                      </span>
                    </div>
                  ) : (
                    <div className="bg-[#02327e]/[0.04] dark:bg-[#02327e]/15 border border-[#02327e]/20 dark:border-[#02327e]/30 rounded-[24px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-[#02327e]/10 dark:bg-[#02327e]/25 rounded-xl text-[#02327e] dark:text-blue-300 border border-[#02327e]/15 dark:border-[#02327e]/30 mt-0.5 sm:mt-0 shrink-0">
                          <BookOpen className="w-5 h-5 text-[#02327e] dark:text-blue-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-[#02327e] dark:text-blue-300 uppercase tracking-wider">
                              Cupo de Asignaturas: {totalSubjectsCount} de {MAX_ALLOWED_SUBJECTS}
                            </h4>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              totalSubjectsCount === MAX_ALLOWED_SUBJECTS 
                                ? 'bg-[#02327e] text-white' 
                                : 'bg-[#02327e]/10 text-[#02327e] dark:bg-[#02327e]/30 dark:text-blue-200 border border-[#02327e]/20'
                            }`}>
                              {totalSubjectsCount === MAX_ALLOWED_SUBJECTS ? 'Límite alcanzado' : `${MAX_ALLOWED_SUBJECTS - totalSubjectsCount} disponibles`}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mt-0.5">
                            El plan base incluye <span className="font-bold text-[#02327e] dark:text-blue-300">6 asignaturas (RD$ 1,000/mes)</span>. Asignaturas adicionales: <span className="font-bold text-[#02327e] dark:text-blue-300">RD$ 150/mes c/u</span>.
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1.5 flex items-center gap-1.5 font-medium">
                            💡 <span>Puedes hacer clic en <strong>cada grado arriba (1ro, 2do, etc.)</strong> para distribuir o seleccionar asignaturas en diferentes cursos.</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowLimitModal(true)}
                        className="text-[11px] font-bold text-[#02327e] dark:text-blue-300 bg-white dark:bg-zinc-800 hover:bg-[#02327e]/5 dark:hover:bg-zinc-700 border border-[#02327e]/30 dark:border-[#02327e]/40 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                      >
                        Ver Tarifas
                      </button>
                    </div>
                  )
                )}

                {/* Subject Selector Workspace */}
                {formData.grade && (formData.level === "PRIMARIA" || formData.level === "SECUNDARIA") && (
                  <div className="bg-slate-50/40 dark:bg-zinc-900/40 p-4 rounded-[24px] border border-black/5 dark:border-zinc-800 space-y-3 mt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#02327e] dark:text-blue-300" />
                        <h3 className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-widest">
                          Asignaturas para {getGradeById(formData.grade)?.displayName.split(" (")[0]}
                        </h3>
                      </div>
                      {availableSubjects.length > 0 && (
                        <button
                          type="button"
                          onClick={handleToggleAll}
                          disabled={!isAdmin && currentGradeSubjects.length === 0 && totalSubjectsCount >= MAX_ALLOWED_SUBJECTS}
                          className="text-[10px] font-bold text-slate-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 bg-white dark:bg-zinc-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {currentGradeSubjects.length > 0 ? "Limpiar este grado" : (isAdmin ? "Todas" : (totalSubjectsCount >= MAX_ALLOWED_SUBJECTS ? "Límite alcanzado" : "Seleccionar hasta 6"))}
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
              </>
            )}

            {/* Main Action Button */}
            <div className="pt-4">
              <button
                onClick={handleInitiateSubmit}
                disabled={isLoading || (existingRole !== 'coordinator' && assignments.length === 0)}
                className="w-full bg-[#02327e] hover:bg-[#012560] text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest hover:scale-[1.01] transform transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
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

      {/* Modal Informativo de Límite y Precios de Asignaturas */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-black/10 dark:border-zinc-800 text-left relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#02327e]/10 dark:bg-[#02327e]/25 border border-[#02327e]/20 dark:border-[#02327e]/30 flex items-center justify-center text-[#02327e] dark:text-blue-300">
                <BookOpen size={24} />
              </div>
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0"
                title="Cerrar"
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>

            <h3 className="text-xl font-black text-[#02327e] dark:text-blue-300 tracking-tight">
              Límite de Asignaturas del Plan Base
            </h3>
            
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
              Tu cuenta incluye por defecto un cupo de hasta <span className="font-bold text-neutral-900 dark:text-white">6 asignaturas</span> oficiales (valoradas en <span className="font-bold text-[#02327e] dark:text-blue-300">RD$ 1,000 mensuales</span>).
            </p>

            <div className="bg-[#02327e]/[0.03] dark:bg-[#02327e]/15 rounded-2xl p-4 my-4 border border-[#02327e]/15 dark:border-[#02327e]/30 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">Plan Base (Hasta 6 asignaturas):</span>
                <span className="font-black text-[#02327e] dark:text-blue-300">RD$ 1,000 / mes</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">Cada Asignatura Adicional (+6):</span>
                <span className="font-black text-amber-700 dark:text-amber-400">+RD$ 150 / mes c/u</span>
              </div>
              <div className="h-px bg-[#02327e]/10 dark:bg-white/10 my-1" />
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                💡 Puedes distribuir tus 6 asignaturas libremente: en un solo grado (ej. Primaria) o repartirlas en diferentes grados (ej. 1 en cada grado para Secundaria).
              </p>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
              Para completar tu perfil, selecciona tus 6 asignaturas principales. Si necesitas impartir más asignaturas, podrás solicitar paquetes adicionales desde tu panel de suscripción.
            </p>

            <button
              type="button"
              onClick={() => setShowLimitModal(false)}
              className="w-full bg-[#02327e] hover:bg-[#012560] text-white py-3 px-5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
            >
              Entendido, elegir mis 6 asignaturas
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmación y Resumen de Asignaturas */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-black/10 dark:border-zinc-800 text-left relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#02327e]/10 dark:bg-[#02327e]/25 border border-[#02327e]/20 dark:border-[#02327e]/30 flex items-center justify-center text-[#02327e] dark:text-blue-300">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#02327e] dark:text-blue-300 tracking-tight">
                    Resumen de tu Selección
                  </h3>
                  <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
                    Nivel {formData.level === 'PRIMARIA' ? 'Primario' : formData.level === 'SECUNDARIA' ? 'Secundario' : 'Inicial'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0"
                title="Cerrar"
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>

            <div className="bg-[#02327e]/[0.04] dark:bg-[#02327e]/15 border border-[#02327e]/15 dark:border-[#02327e]/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block">
                  Total de Asignaturas
                </span>
                <span className="text-base font-black text-[#02327e] dark:text-blue-300">
                  {totalSubjectsCount} de {isAdmin ? 'Ilimitadas (Admin)' : `${MAX_ALLOWED_SUBJECTS} seleccionadas`}
                </span>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {isAdmin ? '👑 Modo Admin' : 'Plan Base RD$ 1,000/mes'}
              </span>
            </div>

            {/* Lista con scroll de los grados y asignaturas */}
            <div className="overflow-y-auto pr-1 space-y-3 flex-1 mb-4 max-h-[40vh]">
              {assignments.map((assignment) => {
                const gradeObj = getGradeById(assignment.gradeId);
                const gradeName = gradeObj ? gradeObj.displayName.split(" (")[0] : assignment.gradeName;

                return (
                  <div key={assignment.gradeId} className="bg-slate-50 dark:bg-zinc-850 border border-slate-200/80 dark:border-zinc-750 rounded-2xl p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap size={15} className="text-[#02327e] dark:text-blue-300" />
                        {gradeName}
                      </h4>
                      <span className="text-[10px] font-bold bg-[#02327e]/10 dark:bg-[#02327e]/25 text-[#02327e] dark:text-blue-300 px-2 py-0.5 rounded-full">
                        {assignment.subjectIds.length} {assignment.subjectIds.length === 1 ? 'asignatura' : 'asignaturas'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {assignment.subjectIds.map((subId) => {
                        const subObj = OFFICIAL_DEFAULT_SUBJECTS.find(s => s.id === subId);
                        const subName = subObj ? subObj.name : subId;
                        const subColor = subObj?.color || '#02327e';

                        return (
                          <span
                            key={subId}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-neutral-200 shadow-2xs"
                          >
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: subColor }}
                            />
                            {subName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 mb-5 leading-relaxed bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-xl p-3 text-slate-700 dark:text-slate-300">
              💡 <strong>Por favor revisa bien:</strong> estas serán las materias configuradas en tu cuenta para planificar. Podrás modificarlas más adelante desde tu perfil.
            </p>

            <div className="flex items-center gap-2.5 pt-1 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-neutral-300 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Modificar selección
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSubmit}
                className="flex-1 bg-[#02327e] hover:bg-[#012560] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <span>Confirmar y Finalizar</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
