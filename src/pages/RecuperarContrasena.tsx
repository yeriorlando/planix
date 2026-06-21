import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, BookOpen, GraduationCap, Library, Award, Lightbulb, Target, BookMarked, Notebook, PenTool, Calculator, Globe, Atom, Compass, Palette, FlaskConical, Music, Shapes, School, Languages, Brain, Scroll } from "lucide-react";
import { toast, Toaster } from "sonner";
import { getUsers } from "../lib/storage";
import { requestD1 } from "../lib/services/d1Client";
import { supabase } from "../lib/supabase";

export default function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    return val.includes("@") && val.includes(".");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Por favor ingrese un correo electrónico válido");
      return;
    }

    setIsLoading(true);

    try {
      const profiles = await requestD1<any[]>("/api/profiles", "GET");
      const exists = profiles?.some((u) => u.email?.toLowerCase() === email.toLowerCase());

      if (!exists && email.toLowerCase() !== "docente@planix.do") {
        throw new Error("El correo electrónico no está registrado en el sistema");
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/actualizar-contrasena`,
      });

      if (resetError) {
        throw new Error(resetError.message || "Error al enviar el correo de recuperación");
      }

      setIsSuccess(true);
      toast.success("Correo de recuperación enviado");
    } catch (err: any) {
      setError(err.message || "Error al enviar el correo de recuperación");
    } finally {
      setIsLoading(false);
    }
  };

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
            <img 
              src="/logo planix.webp" 
              alt="Planix" 
              className="h-24 w-auto object-contain dark:brightness-125 select-none pointer-events-none"
            />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text-main mb-1">Recuperar Contraseña</h2>
            <p className="text-[13px] text-text-muted">
              Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-text-main">¡Correo enviado!</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
                  <br />Revisa tu bandeja de entrada (y spam).
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full bg-[#1B1B1B] text-white font-bold py-3 rounded-xl hover:bg-[#2A2A2A] transition-colors text-sm shadow-xs cursor-pointer"
              >
                Volver a Iniciar Sesión
                <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="bg-card-pink/40 border border-card-pink/60 text-text-main p-4 rounded-[16px] text-[13px] font-semibold flex items-start gap-3">
                  <AlertCircle className="shrink-0 mt-0.5 text-red-500" size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-text-main">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
                  <input
                    type="email"
                    className="w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#1B1B1B] dark:bg-neutral-100 hover:bg-[#2A2A2A] dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-sm font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Enviando..." : (
                  <>
                    Enviar enlace de recuperación <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          {!isSuccess && (
            <div className="mt-2 text-center">
              <Link to="/login" className="text-sm text-text-muted hover:text-text-main font-semibold transition-colors flex items-center justify-center gap-1.5">
                <ArrowLeft size={14} /> Volver a Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
