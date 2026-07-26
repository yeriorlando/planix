import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  BookOpen, School, PenTool, Languages, Lightbulb, Target, FlaskConical, 
  Palette, Library, BookMarked, Brain, GraduationCap, Atom, Scroll, 
  Shapes, Globe, Compass, Notebook, Award, Calculator, Music,
  ArrowRight, Sparkles
} from 'lucide-react';

export default function Mantenimiento() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const bypassParam = searchParams.get('bypass');
    if (bypassParam && bypassParam.toLowerCase() === 'planixadmin') {
      localStorage.setItem('plx:maintenance_bypass', 'true');
      toast.success('Acceso de administrador concedido (Bypass) 🔑');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen w-full bg-bg-base flex items-center justify-center p-4 text-text-main font-sans select-none relative overflow-hidden">
      {/* Decorative organic shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-card-yellow/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0046ab]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Academic Icons Background */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none">
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

      {/* Main Card */}
      <div className="w-full max-w-[440px] bg-white dark:bg-zinc-900 rounded-[28px] py-7 px-8 text-center flex flex-col items-center gap-5 shadow-sm border border-black/5 dark:border-zinc-800 relative z-10 animate-fade-in">
        
        {/* Brand Logo - Much Larger */}
        <div className="w-full h-20 flex items-center justify-center mx-auto mb-1">
          <img
            src="/Logo-login-y-landing.webp"
            alt="Planix"
            className="h-20 w-auto object-contain dark:brightness-125 select-none pointer-events-none"
          />
        </div>

        {/* Beautiful vector illustration */}
        <div className="w-full max-w-[280px] mx-auto flex items-center justify-center">
          <img
            src="/Mantenimiento.webp"
            alt="Mantenimiento de Servidores"
            className="w-full h-auto object-contain select-none pointer-events-none"
          />
        </div>

        {/* Text area */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black tracking-tight text-[#0046ab] dark:text-blue-400">
            Plataforma en Mantenimiento
          </h1>
          <p className="text-[12.5px] font-medium text-slate-500 dark:text-zinc-550 max-w-[340px] mx-auto leading-relaxed">
            Estamos realizando mejoras programadas en nuestra infraestructura para brindarte una experiencia más rápida y fluida.
          </p>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="px-4 py-2 text-xs font-black bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-[#0046ab] dark:text-blue-400 rounded-full transition-all cursor-pointer select-none active:scale-[0.98] outline-hidden"
        >
          {showInfo ? 'Ocultar detalles' : 'Más información'}
        </button>

        {showInfo && (
          <>
            <div className="w-full border-t border-black/5 dark:border-zinc-800/80 my-0.5" />
            
            {/* Evolucion image */}
            <div className="w-full flex items-center justify-center my-1.5 animate-fade-in">
              <img
                src="/evolucion.webp"
                alt="Evolución Planix"
                className="w-full max-w-[340px] h-auto object-contain select-none pointer-events-none"
              />
            </div>
          </>
        )}

        <p className="text-[9.5px] font-medium text-slate-400 dark:text-zinc-500 leading-normal">
          Agradecemos tu paciencia. Estaremos de vuelta muy pronto.
        </p>
      </div>

      {/* Floating brand text */}
      <span className="absolute bottom-6 font-display text-[10px] font-bold tracking-widest text-[#0046ab]/15 uppercase select-none pointer-events-none">
        Planix
      </span>
    </div>
  );
}
