import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, BookOpen, GraduationCap, Library, Award, Lightbulb, Target, BookMarked, Notebook, PenTool, Calculator, Globe, Atom, Compass, Palette, FlaskConical, Music, Shapes, School, Languages, Brain, Scroll } from "lucide-react";
import { toast, Toaster } from "sonner";
import { getUsers, saveUsuario, getCurrentUser } from "../lib/storage";
import { supabase } from "../lib/supabase";

export default function ActualizarContrasena() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw new Error(updateError.message || "Error al actualizar la contraseña");
      }

      try {
        const allUsers = getUsers();
        const currentUser = getCurrentUser();
        const user = currentUser
          ? allUsers.find(u => u.id === currentUser.id)
          : allUsers.find(u => u.email === "docente@planix.do");

        if (user) {
          user.password = password;
          saveUsuario(user);
        }
      } catch (mockErr) {
        console.warn("Mock DB password update ignored:", mockErr);
      }

      setIsSuccess(true);
      toast.success("Contraseña actualizada correctamente");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Error al actualizar la contraseña");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 w-full text-text-main font-sans select-none relative overflow-hidden">
        <Toaster position="top-center" richColors />
        
        {/* Background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-card-yellow/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-card-purple/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-[32px] border border-black/5 p-8 md:p-12 shadow-sm text-center">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-text-main tracking-tight mb-2">¡Contraseña Actualizada!</h2>
            <p className="text-text-muted font-medium text-sm mb-6 leading-relaxed">
              Tu contraseña ha sido cambiada correctamente.
              <br />Redirigiendo al inicio de sesión...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 w-full text-text-main font-sans select-none relative overflow-hidden">
      <Toaster position="top-center" richColors />

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

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-black/5 flex flex-col gap-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-black/5 text-[13px] font-semibold text-text-main">
              <GraduationCap className="h-4.5 w-4.5 text-[#1B1B1B]" />
              <span className="font-extrabold">Planix 2.0</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text-main mb-1">Nueva Contraseña</h2>
            <p className="text-[13px] text-text-muted">
              Ingresa tu nueva contraseña para recuperar el acceso.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-card-pink/40 border border-card-pink/60 text-text-main p-4 rounded-[16px] text-[13px] font-semibold flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5 text-red-500" size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-text-main">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg pl-10 pr-10 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#1B1B1B] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-text-main">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[#1B1B1B] dark:bg-neutral-100 hover:bg-[#2A2A2A] dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-sm font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Actualizando..." : (
                <>
                  Actualizar Contraseña <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
