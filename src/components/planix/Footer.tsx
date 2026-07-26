import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, GraduationCap, Book, Pencil, Lightbulb, BookOpen, School, Palette, FlaskConical, Calculator, Library, Atom, Globe, Notebook, Award } from 'lucide-react';
import PlatformLogo from '../ui/PlatformLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#e0f2fe]/30 via-[#f0f9ff]/15 to-[#f9fafb] dark:from-[#08182f]/30 dark:via-[#092240]/15 dark:to-bg-base pt-10 pb-8 border-t border-zinc-200/50 dark:border-zinc-800/40 relative z-25 overflow-hidden">
      
      {/* Background decoration elements occupying the full footer */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {/* Soft blur glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[#38bdf8]/10 dark:bg-[#38bdf8]/3 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-[#34d399]/8 dark:bg-[#34d399]/2 rounded-full blur-[120px]" />
        
        {/* Floating Clouds */}
        <div className="absolute left-[5%] top-[15%] opacity-20 dark:opacity-5">
          <svg width="140" height="70" viewBox="0 0 100 50" fill="currentColor" className="text-[#7dd3fc] dark:text-[#1e3a8a]">
            <path d="M15 40 C15 32, 25 24, 38 24 C42 16, 58 16, 66 24 C78 24, 88 32, 88 40 C92 40, 96 44, 96 48 L4 48 C4 44, 8 40, 15 40 Z" />
          </svg>
        </div>
        <div className="absolute right-[8%] top-[20%] opacity-20 dark:opacity-5">
          <svg width="120" height="60" viewBox="0 0 80 40" fill="currentColor" className="text-[#7dd3fc] dark:text-[#1e3a8a]">
            <path d="M12 32 C12 25, 20 19, 30 19 C33 13, 46 13, 52 19 C62 19, 70 25, 70 32 C73 32, 76 35, 76 38 L3 38 C3 35, 6 32, 12 32 Z" />
          </svg>
        </div>
        <div className="absolute left-[8%] bottom-[20%] opacity-15 dark:opacity-5">
          <svg width="100" height="50" viewBox="0 0 80 40" fill="currentColor" className="text-[#7dd3fc] dark:text-[#1e3a8a]">
            <path d="M12 32 C12 25, 20 19, 30 19 C33 13, 46 13, 52 19 C62 19, 70 25, 70 32 C73 32, 76 35, 76 38 L3 38 C3 35, 6 32, 12 32 Z" />
          </svg>
        </div>

        {/* Paper Plane Left (flying right-up) */}
        <div className="absolute left-[6%] md:left-[12%] top-[20%] md:top-[15%] transition-transform duration-300 hover:scale-105">
          <svg width="130" height="90" viewBox="0 0 110 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#3b82f6] dark:text-blue-500 opacity-80 dark:opacity-50">
            <path d="M5 55 Q 30 60, 40 38 T 70 32" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4 4" strokeLinecap="round" />
            <g transform="translate(68, 16) rotate(15)">
              <path d="M0 10 L22 0 L16 18 L10 11 L4 13 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M10 11 L22 0 L16 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </g>
          </svg>
        </div>

        {/* Paper Plane Right (flying left-up) */}
        <div className="absolute right-[6%] md:right-[12%] top-[25%] md:top-[18%] transition-transform duration-300 hover:scale-105">
          <svg width="130" height="90" viewBox="0 0 110 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#3b82f6] dark:text-blue-500 opacity-80 dark:opacity-50">
            <path d="M105 45 Q 80 58, 70 35 T 40 30" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4 4" strokeLinecap="round" />
            <g transform="translate(28, 14) rotate(-55)">
              <path d="M0 10 L22 0 L16 18 L10 11 L4 13 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M10 11 L22 0 L16 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </g>
          </svg>
        </div>

        {/* Colorful Academic Icons Background (Inspired by /registro, low opacity, no animations) */}
        {/* Left Side */}
        <div className="absolute left-[15%] top-[8%] text-[#02327e] dark:text-[#38bdf8] opacity-25" style={{ transform: "rotate(-12deg)" }}>
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="absolute left-[24%] top-[14%] text-[#02b36d] dark:text-[#34d399] opacity-25" style={{ transform: "rotate(-8deg)" }}>
          <School className="h-5 w-5" />
        </div>
        <div className="absolute left-[28%] top-[30%] text-[#a855f7] dark:text-[#c084fc] opacity-20" style={{ transform: "rotate(15deg)" }}>
          <Palette className="h-5 w-5" />
        </div>
        <div className="absolute left-[16%] top-[45%] text-[#06b6d4] dark:text-[#22d3ee] opacity-25" style={{ transform: "rotate(10deg)" }}>
          <GraduationCap className="h-5.5 w-5.5" />
        </div>
        <div className="absolute left-[6%] top-[56%] text-[#ef4444] dark:text-[#f87171] opacity-20" style={{ transform: "rotate(-10deg)" }}>
          <FlaskConical className="h-5 w-5" />
        </div>
        <div className="absolute left-[22%] top-[68%] text-[#f59e0b] dark:text-[#fbbf24] opacity-25" style={{ transform: "rotate(12deg)" }}>
          <Book className="h-5 w-5" />
        </div>
        <div className="absolute left-[10%] top-[80%] text-[#3b82f6] dark:text-[#60a5fa] opacity-20" style={{ transform: "rotate(-15deg)" }}>
          <Library className="h-6 w-6" />
        </div>

        {/* Right Side */}
        <div className="absolute right-[18%] top-[10%] text-[#02b36d] dark:text-[#34d399] opacity-25" style={{ transform: "rotate(15deg)" }}>
          <Atom className="h-6 w-6" />
        </div>
        <div className="absolute right-[24%] top-[24%] text-[#02327e] dark:text-[#38bdf8] opacity-25" style={{ transform: "rotate(-5deg)" }}>
          <Notebook className="h-5 w-5" />
        </div>
        <div className="absolute right-[15%] top-[38%] text-[#a855f7] dark:text-[#c084fc] opacity-20" style={{ transform: "rotate(-15deg)" }}>
          <Pencil className="h-5 w-5" />
        </div>
        <div className="absolute right-[26%] top-[50%] text-[#ef4444] dark:text-[#f87171] opacity-20" style={{ transform: "rotate(12deg)" }}>
          <Award className="h-5.5 w-5.5" />
        </div>
        <div className="absolute right-[8%] top-[58%] text-[#06b6d4] dark:text-[#22d3ee] opacity-25" style={{ transform: "rotate(25deg)" }}>
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="absolute right-[20%] top-[72%] text-[#f59e0b] dark:text-[#fbbf24] opacity-25" style={{ transform: "rotate(18deg)" }}>
          <Calculator className="h-5 w-5" />
        </div>
        <div className="absolute right-[10%] top-[82%] text-[#3b82f6] dark:text-[#60a5fa] opacity-20" style={{ transform: "rotate(-20deg)" }}>
          <Globe className="h-6 w-6" />
        </div>

      </div>

      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="flex flex-col items-center">
          
          {/* Logo container */}
          <div className="relative mb-2 hover:scale-105 transition-transform duration-300 cursor-pointer">
            <PlatformLogo className="h-16 md:h-20" />
          </div>

          {/* Banner image replacement */}
          <div className="relative z-10 -mt-8 mb-6 max-w-full px-4 flex justify-center hover:scale-[1.02] transition-transform duration-300">
            <img 
              src="/Footer.webp?v=2" 
              alt="Planifica. Enseña. Inspira. La plataforma que simplifica tu trabajo y transforma tus clases" 
              className="w-full max-w-[650px] h-auto object-contain dark:brightness-110" 
            />
          </div>

          {/* Navigation links styled as pastel buttons */}
          <nav className="mb-6 flex flex-wrap justify-center gap-3 text-xs font-bold">
            <Link 
              to="/aviso-legal" 
              className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 hover:bg-blue-100/70 dark:hover:bg-blue-950/30 transition-all duration-300 shadow-2xs hover:scale-[1.03]"
            >
              Aviso Legal
            </Link>
            <Link 
              to="/terminos" 
              className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/30 transition-all duration-300 shadow-2xs hover:scale-[1.03]"
            >
              Términos y Condiciones
            </Link>
            <Link 
              to="/sobre-planix" 
              className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/30 hover:bg-purple-100/70 dark:hover:bg-purple-950/30 transition-all duration-300 shadow-2xs hover:scale-[1.03]"
            >
              Sobre Planix
            </Link>
            <Link 
              to="/privacidad" 
              className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30 hover:bg-amber-100/70 dark:hover:bg-amber-950/30 transition-all duration-300 shadow-2xs hover:scale-[1.03]"
            >
              Privacidad
            </Link>
            <Link 
              to="/politica-ia" 
              className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/30 hover:bg-rose-100/70 dark:hover:bg-rose-950/30 transition-all duration-300 shadow-2xs hover:scale-[1.03]"
            >
              Política de IA
            </Link>
          </nav>

          <div className="mb-4 flex justify-center max-w-full px-4">
            <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 sm:px-6 py-2.5 rounded-2xl sm:rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 select-none shadow-xs text-center max-w-full">
              <span>Desarrollado con</span>
              <span className="inline-block hover:scale-125 transition-transform duration-300 cursor-pointer">❤️</span>
              <span>para docentes dominicanos</span>
            </div>
          </div>

          {/* Copyright bar */}
          <div className="text-center">
            <p className="text-xs font-semibold text-zinc-500">
              © {currentYear} Planix. Todos los derechos reservados.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
