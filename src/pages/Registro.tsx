import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X, Sparkles, GraduationCap, Mail, Lock, AlertCircle, BookOpen, Library, Award, Lightbulb, Target, BookMarked, Notebook, PenTool, Calculator, Globe, Atom, Compass, Palette, FlaskConical, Music, Shapes, School, Languages, Brain, Scroll, Baby } from "lucide-react";
import { registrarDocente, setSession } from "../lib/storage";
import { EDUCATION_STRUCTURE, getGradesByLevel, getGradeById } from "../lib/data/educationStructure";
import { OFFICIAL_DEFAULT_SUBJECTS } from "../lib/data/defaultSubjects";
import { toast, Toaster } from "sonner";
import SchoolAutocomplete from "../components/forms/SchoolAutocomplete";
import { supabase } from "../lib/supabase";
import { signUp } from "../lib/services/auth";

interface GradeAssignment {
  gradeId: string;
  gradeName: string;
  subjectIds: string[];
}


export default function Registro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Selección de Rol, 1: Perfil, 2: Aula, 3: Acceso, 4: Success
  const [selectedRole, setSelectedRole] = useState<"teacher" | "coordinator">("teacher");

  // Capture ref from URL and store in sessionStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      sessionStorage.setItem("plx:referred_by_code", refCode);
    }
  }, []);

  // Form states
  const [nombre, setNombre] = useState("");
  const [colegio, setColegio] = useState("");
  const [regional, setRegional] = useState("");
  const [distrito, setDistrito] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<"INICIAL" | "PRIMARIA" | "SECUNDARIA">("PRIMARIA");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("primaria-1ro");
  const [assignments, setAssignments] = useState<GradeAssignment[]>([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // Memoized lists
  const levelGrades = useMemo(() => {
    return getGradesByLevel(selectedLevel);
  }, [selectedLevel]);

  const availableSubjects = useMemo(() => {
    const grade = getGradeById(selectedGradeId);
    if (!grade) return [];
    return OFFICIAL_DEFAULT_SUBJECTS.filter(s => 
      s.level === selectedLevel && 
      s.grades.includes(grade.name)
    );
  }, [selectedLevel, selectedGradeId]);

  const currentGradeSubjects = useMemo(() => {
    const assignment = assignments.find(a => a.gradeId === selectedGradeId);
    return assignment ? assignment.subjectIds : [];
  }, [assignments, selectedGradeId]);

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, text: "", color: "", textColor: "", checks: { length: false, lowercase: false, uppercase: false, number: false, special: false } };
    
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    const passedCount = Object.values(checks).filter(Boolean).length;
    
    let text = "Muy débil";
    let color = "bg-red-500";
    let textColor = "text-red-500";
    
    if (passedCount >= 5) {
      text = "Excelente";
      color = "bg-emerald-500";
      textColor = "text-emerald-500";
    } else if (passedCount >= 4) {
      text = "Fuerte";
      color = "bg-[#1E40AF]";
      textColor = "text-[#1E40AF]";
    } else if (passedCount >= 3) {
      text = "Medio";
      color = "bg-amber-500";
      textColor = "text-amber-500";
    } else if (passedCount >= 2) {
      text = "Débil";
      color = "bg-orange-500";
      textColor = "text-orange-500";
    }
    
    return { score: passedCount, text, color, textColor, checks };
  }, [password]);

  const handleLevelChange = (level: "INICIAL" | "PRIMARIA" | "SECUNDARIA") => {
    if (level === "INICIAL") {
      toast.warning("El Nivel Inicial estará disponible próximamente.");
      return;
    }
    setSelectedLevel(level);
    const newGrades = getGradesByLevel(level);
    if (newGrades.length > 0) {
      setSelectedGradeId(newGrades[0].id);
    }
    setAssignments([]);
  };

  const toggleSubject = (subjectId: string) => {
    setAssignments(prev => {
      const existing = prev.find(a => a.gradeId === selectedGradeId);
      if (existing) {
        const subjectIds = existing.subjectIds.includes(subjectId)
          ? existing.subjectIds.filter(id => id !== subjectId)
          : [...existing.subjectIds, subjectId];
        
        if (subjectIds.length === 0) {
          return prev.filter(a => a.gradeId !== selectedGradeId);
        }
        return prev.map(a => a.gradeId === selectedGradeId ? { ...a, subjectIds } : a);
      } else {
        const grade = getGradeById(selectedGradeId);
        return [...prev, {
          gradeId: selectedGradeId,
          gradeName: grade ? grade.displayName : selectedGradeId,
          subjectIds: [subjectId]
        }];
      }
    });
  };

  const handleToggleAll = () => {
    const isAllSelected = currentGradeSubjects.length === availableSubjects.length;
    setAssignments(prev => {
      const others = prev.filter(a => a.gradeId !== selectedGradeId);
      if (isAllSelected) {
        return others;
      } else {
        const grade = getGradeById(selectedGradeId);
        return [...others, {
          gradeId: selectedGradeId,
          gradeName: grade ? grade.displayName : selectedGradeId,
          subjectIds: availableSubjects.map(s => s.id)
        }];
      }
    });
  };

  const removeAssignment = (gradeId: string) => {
    setAssignments(prev => prev.filter(a => a.gradeId !== gradeId));
  };



  const validateStep = (): boolean => {
    setError("");
    if (step === 1) {
      if (!nombre.trim()) {
        setError("Por favor ingresa tu nombre completo.");
        return false;
      }
      if (!colegio.trim()) {
        setError("Por favor ingresa tu centro educativo.");
        return false;
      }
    }
    if (step === 2) {
      if (assignments.length === 0) {
        setError("Debes seleccionar al menos una materia para continuar.");
        return false;
      }
    }
    if (step === 3) {
      if (!email.includes("@")) {
        setError("Ingresa un correo electrónico válido.");
        return false;
      }
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return false;
      }
      if (!termsAccepted) {
        setError("Debes aceptar los términos y condiciones.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (step === 1 && selectedRole === "coordinator") {
        setStep(3); // skip step 2 (subjects)
      } else {
        setStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    setError("");
    if (step === 3 && selectedRole === "coordinator") {
      setStep(1); // skip step 2
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setError("");

    const allowed_subjects: Record<string, string[]> = {};
    assignments.forEach((a) => {
      allowed_subjects[a.gradeId] = a.subjectIds;
    });

    const mainNivel = selectedLevel.toLowerCase() as "inicial" | "primaria" | "secundaria";
    const gradeObj = getGradeById(selectedGradeId);
    const mainCiclo = gradeObj?.cycleId?.includes("ciclo1") ? "ciclo1" : "ciclo2";

    try {
      // Retrieve referral code if any
      const referredByCode = sessionStorage.getItem("plx:referred_by_code") || undefined;

      // Call D1 signUp helper
      const { user, profile } = await signUp(
        nombre,
        email,
        selectedRole, // Use selectedRole!
        "free", // Register with free tier
        colegio,
        password,
        selectedRole === "coordinator" ? undefined : mainNivel,
        selectedRole === "coordinator" ? undefined : mainCiclo,
        selectedRole === "coordinator" ? undefined : selectedGradeId,
        selectedRole === "coordinator" ? {} : allowed_subjects,
        regional,
        distrito,
        municipio,
        referredByCode
      );

      // Clean up referral code from session storage after success
      if (referredByCode) {
        sessionStorage.removeItem("plx:referred_by_code");
      }

      // Set local session
      setSession({ user_id: profile.id, iniciado_en: new Date().toISOString() });

      setLoading(false);
      toast.success("¡Tu cuenta ha sido creada con éxito!");
      setStep(4);
    } catch (err: any) {
      setLoading(false);
      let errMsg = err.message || "";
      let userFriendlyError = "Ocurrió un error inesperado durante el registro.";

      if (errMsg.includes("User already exists") || errMsg.includes("already registered") || errMsg.includes("email_exists") || errMsg.includes("Use another email")) {
        userFriendlyError = "El usuario ya existe. Utiliza otro correo electrónico.";
      } else if (errMsg.includes("Password should contain at least one character of each")) {
        userFriendlyError = "La contraseña debe contener al menos un carácter de cada tipo: letras minúsculas (a-z), letras mayúsculas (A-Z), números (0-9) y caracteres especiales (como !@#$%^&*).";
      } else if (errMsg.includes("Password is too short") || errMsg.includes("should be at least")) {
        userFriendlyError = "La contraseña debe tener al menos 6 caracteres.";
      } else if (errMsg.includes("Invalid email") || errMsg.includes("invalid email")) {
        userFriendlyError = "Ingresa un correo electrónico válido.";
      } else if (errMsg) {
        userFriendlyError = errMsg;
      }
      
      setError(userFriendlyError);
    }
  };

  async function handleGoogleRegister() {
    setLoading(true);
    try {
      sessionStorage.setItem("plx:pending_role", selectedRole);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Error al registrarse con Google.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 w-full text-text-main font-sans select-none relative overflow-hidden">
      <Toaster position="top-center" richColors />

      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-card-pink/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-card-green/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Academic Icons Background */}
      <div className="absolute inset-0 opacity-[0.045] pointer-events-none">
        {/* Left Side */}
        <BookOpen className="absolute top-8 left-6 text-neutral-900" size={75} style={{ transform: "rotate(-12deg)" }} />
        <School className="absolute top-12 left-[22%] text-neutral-900" size={65} style={{ transform: "rotate(-8deg)" }} />
        <PenTool className="absolute top-[30%] left-[28%] text-neutral-900" size={55} style={{ transform: "rotate(15deg)" }} />
        <Languages className="absolute top-[26%] left-16 text-neutral-900" size={55} style={{ transform: "rotate(15deg)" }} />
        <Lightbulb className="absolute top-[48%] left-6 text-neutral-900" size={55} style={{ transform: "rotate(25deg)" }} />
        <Target className="absolute top-[56%] left-[24%] text-neutral-900" size={60} style={{ transform: "rotate(-10deg)" }} />
        <FlaskConical className="absolute bottom-[24%] left-24 text-neutral-900" size={60} style={{ transform: "rotate(-20deg)" }} />
        <Palette className="absolute bottom-32 left-[14%] text-neutral-900" size={70} style={{ transform: "rotate(-15deg)" }} />
        <Library className="absolute bottom-10 left-8 text-neutral-900" size={80} style={{ transform: "rotate(10deg)" }} />
        <BookMarked className="absolute bottom-[5%] left-[26%] text-neutral-900" size={60} style={{ transform: "rotate(12deg)" }} />

        {/* Center Bottom */}
        <Brain className="absolute bottom-[6%] left-[48%] text-neutral-900" size={60} style={{ transform: "rotate(-5deg)" }} />

        {/* Right Side */}
        <GraduationCap className="absolute top-8 right-6 text-neutral-900" size={85} style={{ transform: "rotate(15deg)" }} />
        <Atom className="absolute top-12 right-[22%] text-neutral-900" size={75} style={{ transform: "rotate(-5deg)" }} />
        <Scroll className="absolute top-[30%] right-[28%] text-neutral-900" size={55} style={{ transform: "rotate(-15deg)" }} />
        <Shapes className="absolute top-[26%] right-16 text-neutral-900" size={65} style={{ transform: "rotate(-10deg)" }} />
        <Globe className="absolute top-[48%] right-6 text-neutral-900" size={70} style={{ transform: "rotate(-15deg)" }} />
        <Compass className="absolute top-[56%] right-[24%] text-neutral-900" size={55} style={{ transform: "rotate(12deg)" }} />
        <Notebook className="absolute bottom-[24%] right-24 text-neutral-900" size={60} style={{ transform: "rotate(18deg)" }} />
        <Award className="absolute bottom-32 right-[14%] text-neutral-900" size={75} style={{ transform: "rotate(-20deg)" }} />
        <Calculator className="absolute bottom-10 right-8 text-neutral-900" size={70} style={{ transform: "rotate(12deg)" }} />
        <Music className="absolute bottom-[5%] right-[26%] text-neutral-900" size={55} style={{ transform: "rotate(-8deg)" }} />
      </div>

      <div className="w-full max-w-[850px] bg-bg-panel/40 border border-black/5 rounded-[40px] p-8 md:p-12 shadow-sm backdrop-blur-md relative z-10">
        
        {/* Step Indicator */}
        {step > 0 && step < 4 && (
          <div className="flex justify-between items-center bg-white border border-black/5 rounded-full px-5 py-2.5 shadow-sm max-w-md mx-auto w-full mb-8">
            <span className="text-[12px] font-bold text-text-muted">
              Paso {step === 3 && selectedRole === "coordinator" ? 2 : step} de {selectedRole === "coordinator" ? 2 : 3}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full ${step === 1 ? 'bg-[#1B1B1B] text-white shadow-sm' : 'bg-bg-base text-text-muted'}`}>
                1. Perfil
              </span>
              {selectedRole !== "coordinator" && (
                <>
                  <span className="text-[10px] text-text-muted">/</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full ${step === 2 ? 'bg-[#1B1B1B] text-white shadow-sm' : 'bg-bg-base text-text-muted'}`}>
                    2. Materias
                  </span>
                </>
              )}
              <span className="text-[10px] text-text-muted">/</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full ${step === 3 ? 'bg-[#1B1B1B] text-white shadow-sm' : 'bg-bg-base text-text-muted'}`}>
                {selectedRole === "coordinator" ? "2. Acceso" : "3. Acceso"}
              </span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >

        {/* Step 0: Role Selection */}
        {step === 0 && (
          <div className="flex flex-col gap-6 max-w-xl mx-auto bg-white rounded-[32px] p-8 border border-black/5 shadow-sm select-none text-left">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold tracking-tight text-[#1B1B1B]">Regístrate en Planix</h2>
              <p className="text-[13.5px] text-text-muted mt-1">Selecciona cómo deseas utilizar la plataforma para comenzar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Docente */}
              <div 
                onClick={() => {
                  setSelectedRole("teacher");
                  setStep(1);
                }}
                className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] select-none"
              >
                <img 
                  src="/Registro/Docente.webp" 
                  alt="Soy Docente" 
                  className="w-full h-auto object-contain" 
                />
              </div>

              {/* Card 2: Coordinador */}
              <div 
                onClick={() => {
                  setSelectedRole("coordinator");
                  setStep(1);
                }}
                className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] select-none"
              >
                <img 
                  src="/Registro/Coordinador.webp" 
                  alt="Soy Coordinador Pedagógico" 
                  className="w-full h-auto object-contain" 
                />
              </div>
            </div>

            <div className="flex justify-center mt-2 pt-4 border-t border-black/5">
              <Link to="/login" className="text-[13px] text-text-muted hover:underline font-semibold">
                ¿Ya tienes cuenta? Iniciar Sesión
              </Link>
            </div>
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="flex flex-col gap-6 max-w-lg mx-auto bg-white rounded-[32px] p-8 border border-black/5 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-main">
                {selectedRole === "coordinator" ? "Registro Coordinador" : "Registro Docente"}
              </h2>
              <p className="text-[13px] text-text-muted mt-1">
                {selectedRole === "coordinator" ? "Dinos quién eres y dónde gestionas." : "Dinos quién eres y dónde enseñas."}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-text-main">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Lic. Alejandro Pérez"
                  className="w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-text-main">Centro Educativo / Colegio</label>
                <SchoolAutocomplete
                  value={colegio}
                  onChange={(val) => {
                    setColegio(val);
                    setRegional("");
                    setDistrito("");
                    setMunicipio("");
                  }}
                  onSchoolSelect={(school) => {
                    setRegional(school.regional || "");
                    setDistrito(school.district || "");
                    setMunicipio(school.municipality || "");
                  }}
                  placeholder="Buscar centro educativo..."
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-card-pink/40 border border-card-pink/60 rounded-[16px] p-4 text-[13px] font-semibold text-text-main">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="h-10 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[#1B1B1B] px-4 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} /> Cambiar Rol
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="h-10 bg-[#1B1B1B] hover:bg-[#2A2A2A] text-white px-6 rounded-xl text-sm font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Siguiente <ArrowRight size={14} />
              </button>
            </div>

            {/* Social register divider */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-neutral-455 font-bold tracking-wider text-[11px]">O</span>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleRegister}
              className="w-full h-10 border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-neutral-50 dark:hover:bg-zinc-900 active:scale-[0.99] text-slate-700 dark:text-neutral-200 transition-all flex items-center justify-center gap-2.5 rounded-xl font-medium text-sm shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Regístrate con Google
            </button>
          </div>
        )}

        {/* Step 2: Classroom & Subjects */}
        {step === 2 && (
          <div className="flex flex-col gap-6 bg-white rounded-[32px] p-8 border border-black/5 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-main">Tu Entorno de Clases</h2>
              <p className="text-[13.5px] text-text-muted mt-1 font-semibold">Configura tu grado y materias oficiales en un par de clics.</p>
            </div>

            <div className="flex flex-col gap-5">
              {/* Nivel Educativo Principal Switcher */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">Nivel Educativo Principal</label>
                <div className="flex bg-black/[0.03] dark:bg-white/[0.03] p-1.5 rounded-full max-w-lg mx-auto w-full select-none border border-black/5 dark:border-white/5 relative">
                  <button
                    type="button"
                    onClick={() => handleLevelChange("INICIAL")}
                    className="flex-1 py-3 px-5 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
                  >
                    {selectedLevel === "INICIAL" && (
                      <motion.div
                        layoutId="activeLevelPill"
                        className="absolute inset-0 bg-brand-primary rounded-full shadow-xs"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <Baby size={16} className={`relative z-10 transition-colors duration-300 ${selectedLevel === "INICIAL" ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`} />
                    <span className={`relative z-10 transition-colors duration-300 ${selectedLevel === "INICIAL" ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`}>
                      Inicial
                    </span>
                  </button>

                  <div className={`w-px h-5 self-center shrink-0 transition-colors duration-200 ${
                    (selectedLevel === "INICIAL" || selectedLevel === "PRIMARIA")
                      ? "bg-transparent"
                      : "bg-black/10 dark:bg-white/10"
                  }`} />

                  <button
                    type="button"
                    onClick={() => handleLevelChange("PRIMARIA")}
                    className="flex-1 py-3 px-5 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
                  >
                    {selectedLevel === "PRIMARIA" && (
                      <motion.div
                        layoutId="activeLevelPill"
                        className="absolute inset-0 bg-brand-primary rounded-full shadow-xs"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <BookOpen size={16} className={`relative z-10 transition-colors duration-300 ${selectedLevel === "PRIMARIA" ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`} />
                    <span className={`relative z-10 transition-colors duration-300 ${selectedLevel === "PRIMARIA" ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`}>
                      Primaria
                    </span>
                  </button>

                  <div className={`w-px h-5 self-center shrink-0 transition-colors duration-200 ${
                    (selectedLevel === "PRIMARIA" || selectedLevel === "SECUNDARIA")
                      ? "bg-transparent"
                      : "bg-black/10 dark:bg-white/10"
                  }`} />

                  <button
                    type="button"
                    onClick={() => handleLevelChange("SECUNDARIA")}
                    className="flex-1 py-3 px-5 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
                  >
                    {selectedLevel === "SECUNDARIA" && (
                      <motion.div
                        layoutId="activeLevelPill"
                        className="absolute inset-0 bg-brand-primary rounded-full shadow-xs"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <GraduationCap size={16} className={`relative z-10 transition-colors duration-300 ${selectedLevel === "SECUNDARIA" ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`} />
                    <span className={`relative z-10 transition-colors duration-300 ${selectedLevel === "SECUNDARIA" ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`}>
                      Secundaria
                    </span>
                  </button>
                </div>
              </div>

              {/* Grado Académico */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">Grado Académico</label>
                <div className="grid grid-cols-6 gap-2 max-w-xl mx-auto w-full">
                  {levelGrades.map(grade => {
                    const isActive = selectedGradeId === grade.id;
                    const hasAssignments = assignments.some(a => a.gradeId === grade.id && a.subjectIds.length > 0);

                    return (
                      <button
                        key={grade.id}
                        type="button"
                        onClick={() => setSelectedGradeId(grade.id)}
                        className={`relative py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border min-h-[44px] w-full cursor-pointer ${
                          isActive
                            ? 'bg-[#1B1B1B] text-white border-[#1B1B1B] shadow-xs'
                            : 'bg-white text-text-main border-black/5 hover:border-black/20'
                        }`}
                      >
                        <span>{grade.name.replace(" Sec", "")}</span>
                        <span className={`text-[8px] font-bold uppercase tracking-tight ${isActive ? 'text-white/60' : 'text-text-muted'}`}>Grado</span>
                        {hasAssignments && (
                          <div className={`absolute -top-1 -right-1 rounded-md p-0.5 shadow-xs shrink-0 ${
                            isActive ? 'bg-white text-[#1B1B1B] border border-black/5' : 'bg-emerald-500 text-white'
                          }`}>
                            <Check size={8} strokeWidth={4.5} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Selector Workspace */}
              <div className="bg-bg-base/40 p-4 rounded-[24px] border border-black/5 space-y-3 mt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <h3 className="text-[11px] font-bold text-text-main uppercase tracking-widest">
                      Asignaturas para {getGradeById(selectedGradeId)?.displayName.split(" (")[0]}
                    </h3>
                  </div>
                  {availableSubjects.length > 0 && (
                    <button
                      type="button"
                      onClick={handleToggleAll}
                      className="text-[10px] font-bold text-[#1B1B1B] hover:bg-black/5 bg-white px-3 py-1 rounded-lg border border-black/5 shadow-xs transition-colors cursor-pointer"
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
                        className="p-2.5 rounded-xl border border-black/5 bg-white text-left transition-all relative flex items-center gap-3 hover:border-black/15 shadow-xs w-full h-10 overflow-hidden cursor-pointer"
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
                          className="text-[11.5px] font-bold leading-tight tracking-tight truncate pr-6"
                          style={isSelected ? { color: themeColor } : { color: 'var(--text-main)' }}
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

              {/* Resumen de Asignaciones */}
              {assignments.length > 0 && (
                <div className="bg-bg-base/85 border border-black/5 rounded-[24px] p-3.5 space-y-2">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                    Resumen de Asignaciones ({assignments.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {assignments.map((assignment) => (
                      <div 
                        key={assignment.gradeId} 
                        className="bg-white border border-black/5 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-xs text-xs font-semibold text-text-main"
                      >
                        <span>{assignment.gradeName.split(" (")[0]}: {assignment.subjectIds.length} mat</span>
                        <button
                          type="button"
                          onClick={() => removeAssignment(assignment.gradeId)}
                          className="text-text-muted hover:text-red-500 transition-colors ml-1 p-0.5 rounded-full hover:bg-black/5 cursor-pointer flex items-center justify-center"
                          title="Eliminar asignación"
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}


            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-card-pink/40 border border-card-pink/60 rounded-[16px] p-4 text-[13px] font-semibold text-text-main">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-black/5">
              <button
                type="button"
                onClick={prevStep}
                className="h-10 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[#1B1B1B] px-6 rounded-xl text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={14} /> Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="h-10 bg-[#1B1B1B] hover:bg-[#2A2A2A] text-white px-6 rounded-xl text-sm font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Siguiente <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Access */}
        {step === 3 && (
          <div className="flex flex-col gap-6 max-w-lg mx-auto bg-white rounded-[32px] p-8 border border-black/5 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-main">Seguridad de tu Cuenta</h2>
              <p className="text-[13px] text-text-muted mt-1">Define tus credenciales de acceso.</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-text-main">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="docente@escuela.do"
                    className="w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-text-main">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              {password && (
                <div className="flex flex-col gap-1.5 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-text-muted">Fuerza de la contraseña:</span>
                    <span className={passwordStrength.textColor}>{passwordStrength.text}</span>
                  </div>
                  
                  {/* Strength bars */}
                  <div className="grid grid-cols-5 gap-1 h-1 w-full bg-neutral-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div
                        key={index}
                        className={`h-full transition-all duration-300 ${
                          index <= passwordStrength.score ? passwordStrength.color : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements checklist */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-[10px] text-text-muted font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${passwordStrength.checks.length ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                      <span>Mínimo 6 caracteres</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${passwordStrength.checks.lowercase ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                      <span>Minúscula (a-z)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${passwordStrength.checks.uppercase ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                      <span>Mayúscula (A-Z)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${passwordStrength.checks.number ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                      <span>Número (0-9)</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${passwordStrength.checks.special ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                      <span>Carácter especial (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 mt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 accent-[#1B1B1B] h-4 w-4"
                />
                <label htmlFor="terms" className="text-[12px] text-text-muted leading-relaxed cursor-pointer select-none">
                  Acepto los Términos y Condiciones y confirmo que los datos proporcionados son correctos.
                </label>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-card-pink/40 border border-card-pink/60 rounded-[16px] p-4 text-[13px] font-semibold text-text-main">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={prevStep}
                className="h-10 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[#1B1B1B] px-6 rounded-xl text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={14} /> Atrás
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="h-10 bg-[#1B1B1B] hover:bg-[#2A2A2A] text-white px-8 rounded-xl text-sm font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Creando cuenta..." : (
                  <>
                    Crear Cuenta <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>

            {/* Social register divider */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-neutral-455 font-bold tracking-wider text-[11px]">O regístrate con</span>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleRegister}
              className="w-full h-10 border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-neutral-50 dark:hover:bg-zinc-900 active:scale-[0.99] text-slate-700 dark:text-neutral-200 transition-all flex items-center justify-center gap-2.5 rounded-xl font-medium text-sm shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Regístrate con Google
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="flex flex-col gap-6 max-w-md mx-auto bg-white rounded-[32px] p-10 border border-black/5 shadow-sm text-center items-center">
            <div className="w-[72px] h-[72px] bg-green-50 rounded-full flex items-center justify-center border border-green-150 text-green-500 mb-2">
              <Check size={36} strokeWidth={3} />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-main">¡Registro Completado!</h2>
              <p className="text-[14px] text-text-muted mt-2">
                {selectedRole === "coordinator"
                  ? "Tu cuenta de coordinación pedagógica ha sido creada con éxito. Ya puedes acceder a las herramientas de supervisión."
                  : "Tu cuenta docente ha sido creada con éxito. Ya puedes acceder a todas las herramientas educativas."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(selectedRole === "coordinator" ? "/coordinador/dashboard" : "/dashboard")}
              className="w-full bg-[#1B1B1B] text-white py-4 rounded-full text-[14px] font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer mt-4"
            >
              Comenzar ahora
            </button>
          </div>
        )}

          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
