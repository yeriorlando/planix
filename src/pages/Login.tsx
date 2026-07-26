import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, GraduationCap, AlertCircle, Sparkles, BookOpen, Library, Award, Lightbulb, Target, BookMarked, Notebook, PenTool, Calculator, Globe, Atom, Compass, Palette, FlaskConical, Music, Shapes, School, Languages, Brain, Scroll, Eye, EyeOff, MessageSquare, X, Home } from "lucide-react";
import { seedDemoIfEmpty, getCurrentUser, getUsers, saveUsuario, setSession } from "../lib/storage";
import { toast, Toaster } from "sonner";
import { showSuccessToast } from "../lib/utils/toastHelper";
import { supabase } from "../lib/supabase";
import { signIn } from "../lib/services/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);

  useEffect(() => {
    // Seed demo database if empty
    seedDemoIfEmpty();
    const curr = getCurrentUser();
    if (curr) {
      if (curr.estado_suscripcion === "SUSPENDIDO") {
        setShowSuspendedModal(true);
      } else {
        navigate(curr.rol === "coordinator" ? "/coordinador/dashboard" : "/dashboard");
      }
      return;
    }

    // Check if user was redirected because of suspension
    const params = new URLSearchParams(window.location.search);
    if (params.get("suspended") === "true") {
      setShowSuspendedModal(true);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Por favor, ingresa tu correo");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { session, profile } = await signIn(email, password);

      if (!profile) {
        setLoading(false);
        setError("Error al iniciar sesión: No se pudo obtener el perfil de D1.");
        return;
      }

      if (profile.estado_suscripcion === "SUSPENDIDO") {
        setLoading(false);
        setShowSuspendedModal(true);
        return;
      }

      setSession({ user_id: session.user.id, iniciado_en: new Date().toISOString() });

      setLoading(false);
      showSuccessToast(`👋 ¡Bienvenido ${profile.nombre}!`);
      navigate(profile.rol === "coordinator" ? "/coordinador/dashboard" : "/dashboard");
    } catch (err: any) {
      setLoading(false);
      setError(err.message === "Invalid login credentials" ? "Credenciales incorrectas." : err.message || "Ocurrió un error inesperado.");
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar sesión con Google.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 w-full text-text-main font-sans select-none relative overflow-hidden">

      {/* Decorative organic shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-card-yellow/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-card-purple/20 rounded-full blur-[120px] pointer-events-none"></div>

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

      <div className="w-full max-w-[1000px] bg-bg-panel/40 border border-black/5 rounded-[40px] p-8 md:p-12 shadow-sm grid md:grid-cols-2 gap-12 items-center backdrop-blur-md relative z-10">

        {/* Visual Brand Side */}
        <div className="flex flex-col justify-center h-full gap-6">
          <div>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-black/5 text-[13px] font-semibold text-text-main">
                <div className="w-5 h-3.5 rounded-[2px] border border-zinc-200/50 shadow-2xs overflow-hidden shrink-0 select-none">
                  <svg className="w-full h-full" viewBox="0 0 90 60" fill="none">
                    <rect x="0" y="0" width="45" height="30" fill="#002f6c" />
                    <rect x="45" y="0" width="45" height="30" fill="#ce1126" />
                    <rect x="0" y="30" width="45" height="30" fill="#ce1126" />
                    <rect x="45" y="30" width="45" height="30" fill="#002f6c" />
                    <rect x="39" y="0" width="12" height="60" fill="#ffffff" />
                    <rect x="0" y="24" width="90" height="12" fill="#ffffff" />
                    <rect x="42" y="27" width="6" height="6" fill="#002f6c" rx="1" />
                    <circle cx="45" cy="30" r="1.5" fill="#02b36d" />
                  </svg>
                </div>
                <span>Plataforma 100% dominicana</span>
              </div>

              <Link to="/">
                <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100/70 text-blue-600 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30 rounded-xl text-xs font-bold transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center gap-2 shadow-xs cursor-pointer">
                  <Home size={14} /> Página de Inicio
                </button>
              </Link>
            </div>

            {/* Footer.webp image replacement instead of the old description texts */}
            <div className="relative mb-6 max-w-full flex justify-start">
              <img 
                src="/Footer.webp?v=2" 
                alt="Planifica. Enseña. Inspira. La plataforma que simplifica tu trabajo y transforma tus clases" 
                className="w-full max-w-[530px] h-auto object-contain dark:brightness-110" 
              />
            </div>

            <div className="w-full max-w-[420px] mt-4">
              <img
                src="/login.webp?v=3"
                alt="Ilustración de planificación escolar"
                className="w-full h-auto object-contain select-none pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="bg-white rounded-[32px] p-6 md:p-7 shadow-sm border border-black/5 flex flex-col gap-4">
          <div className="w-56 h-20 flex items-center justify-center mx-auto">
            <img
              src="/Logo-login-y-landing.webp"
              alt="Planix"
              className="h-20 w-auto object-contain dark:brightness-125 select-none pointer-events-none"
            />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text-main">Iniciar Sesión</h2>
            <p className="text-[13px] text-text-muted mt-0.5">Ingresa tus credenciales docentes para continuar.</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-bold text-text-main">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-405 h-4 w-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg pl-10 pr-3.5 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-bold text-text-main">Contraseña</label>
                <Link to="/recuperar-contrasena" className="text-[12px] text-text-muted hover:underline">¿Olvidaste tu contraseña?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-405 h-4 w-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg pl-10 pr-10 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#1B1B1B] dark:hover:text-neutral-100 transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-card-pink/40 border border-card-pink/60 rounded-[16px] p-4 text-[13px] font-semibold text-text-main">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#1B1B1B] dark:bg-neutral-100 hover:bg-[#2A2A2A] dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-sm font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? "Iniciando sesión..." : (
                <>
                  Ingresar al Portal
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-neutral-450 font-bold tracking-wider text-[11px]">O</span>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
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
            Inicia sesión con Google
          </button>

          <div className="text-center text-[13px] text-text-muted">
            ¿Aún no tienes cuenta?{" "}
            <Link to="/registro" className="font-semibold text-text-main hover:underline">
              Regístrate gratis
            </Link>
          </div>
        </div>

      </div>

      {/* Suspended Account Premium Modal */}
      {showSuspendedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl max-w-[360px] w-full border border-black/5 dark:border-zinc-800 p-6 text-center relative overflow-hidden transition-all transform duration-300">
            {/* Soft decorative background glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Red circular close button with white X icon */}
            <button
              onClick={() => setShowSuspendedModal(false)}
              className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1.5 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 outline-none border-none hover:scale-105"
            >
              <X size={12} strokeWidth={3} />
            </button>

            {/* Status Icon Indicator */}
            <div className="w-10 h-10 bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 shrink-0">
              <AlertCircle className="h-5 w-5 fill-amber-500/20 text-amber-600 dark:text-amber-400" />
            </div>

            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
              Acceso Suspendido
            </h3>

            <p className="text-slate-600 dark:text-neutral-350 text-xs leading-relaxed font-medium mb-5">
              Tu acceso a la plataforma ha sido pausado temporalmente. Esto puede deberse a un ajuste administrativo o a una verificación de suscripción pendiente.
            </p>

            <div className="flex flex-col gap-2.5">
              <a
                href="https://wa.me/18299416546"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2.5 font-bold text-xs tracking-wider shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer outline-none border-none text-center"
              >
                <MessageSquare size={14} />
                Contactar Soporte
              </a>

              <button
                onClick={() => setShowSuspendedModal(false)}
                className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-neutral-200 rounded-xl py-2.5 font-bold text-xs tracking-wider transition-all flex items-center justify-center cursor-pointer border border-transparent dark:border-zinc-700 outline-none"
              >
                Entendido
              </button>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-slate-400 dark:text-zinc-500 font-bold leading-normal">
              Si crees que esto es un error, por favor ponte en contacto con nosotros inmediatamente.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
