import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Gamepad2, Sparkles, Star, ArrowRight, CloudRain, Trophy, GraduationCap, Calculator, Globe, Gavel, Compass, Lock, Fingerprint, Clock, Anchor } from 'lucide-react';
import { getCurrentUser } from '../lib/storage';
import { logActivity } from '../lib/activityLog';

const DINAMICAS_LIST = [
  {
    id: "bajo-la-lluvia",
    title: "Bajo la Lluvia",
    description: "Genera palabras con IA sobre cualquier tema escolar. Descubre la palabra letra por letra antes de que el personaje se empape por completo.",
    category: "Juegos",
    rating: "5.0",
    color: "bg-card-pink",
    tag: "Nuevo",
    isReady: true,
  },
  {
    id: "jeopardy",
    title: "Jeopardy Planix",
    description: "Trivia grupal en cuadrícula por categorías y puntajes. Divide tu aula en grupos y compite por responder preguntas con IA.",
    category: "Grupal",
    rating: "5.0",
    color: "bg-[#E0F2FE] dark:bg-[#075985]/20",
    tag: "Nuevo",
    isReady: true,
  },
  {
    id: "mentira",
    title: "Dos Verdades y una Mentira",
    description: "Reto grupal con IA. Descubre cuál de las 3 afirmaciones sobre tu clase es el dato falso.",
    category: "Juegos",
    rating: "5.0",
    color: "bg-[#FDF2F8] dark:bg-[#9D174D]/10",
    tag: "Nuevo",
    isReady: true,
  },
  {
    id: "rimando-ando",
    title: "Rimando Ando",
    description: "Reto grupal de rimas competitivas por tiempo. Escribe palabras que rimen con la palabra de origen y gana puntos.",
    category: "Grupal",
    rating: "5.0",
    color: "bg-[#F5F3FF] dark:bg-[#6D28D9]/10",
    tag: "Nuevo",
    isReady: true,
  },
  {
    id: "profesor",
    title: "Profesor por un Minuto",
    description: "Un estudiante asume el rol del maestro para explicar un concepto o tema de clase en 60 segundos.",
    category: "Grupal",
    rating: "5.0",
    color: "bg-[#EEF2F6] dark:bg-[#1E293B]/20",
    tag: "Nuevo",
    isReady: true,
  },
  {
    id: "reto-matematico",
    title: "Reto Matemático",
    description: "Juegos interactivos de matemáticas (Tira y afloja, Escalada y Carrera de sacos) para competir en vivo en parejas respondiendo operaciones básicas.",
    category: "Juegos",
    rating: "5.0",
    color: "bg-[#E6F4EA] dark:bg-[#10B981]/10",
    tag: "Nuevo",
    isReady: true,
  },
  {
    id: "mapa-dominicano",
    title: "Mapa Dominicano",
    description: "Coloca a prueba a tus alumnos proyectando el mapa. Al girar la tómbola saldrá una provincia de manera aleatoria y el niño deberá señalar correctamente cuál es en el mapa.",
    category: "Juegos",
    rating: "5.0",
    color: "bg-[#E0F2FE] dark:bg-[#075985]/20",
    tag: "Nuevo",
    isReady: true,
  },
  {
    id: "subasta-conocimiento",
    title: "Subasta de Conocimiento",
    description: "Juego grupal competitivo por equipos. Puja con monedas por la oportunidad de responder y duplicar tu apuesta en temas curriculares.",
    category: "Grupal",
    rating: "5.0",
    color: "bg-[#FFFBEB] dark:bg-[#78350F]/10",
    tag: "Nuevo",
    isReady: true,
  },
  {
    id: "detective-mapa",
    title: "El Detective del Mapa",
    description: "Deduce la provincia oculta resolviendo pistas geográficas y de relieve sobre la República Dominicana de forma interactiva.",
    category: "Juegos",
    rating: "5.0",
    color: "bg-[#ECFDF5] dark:bg-[#064E3B]/10",
    tag: "Nuevo",
    isReady: true,
  },
  {
    id: "impostor",
    title: "El Impostor",
    description: "Juego de deducción y debate social. Descubre qué grupo tiene la palabra clave diferente sin revelar la tuya propia.",
    category: "Grupal",
    rating: "5.0",
    color: "bg-[#F5F3FF] dark:bg-[#6D28D9]/10",
    tag: "Nuevo",
    isReady: true,
  },
  {
    id: "bomba-tiempo",
    title: "La Bomba de Tiempo",
    description: "Responde rápido las preguntas de opción múltiple antes de que el temporizador explote en la mano de tu equipo.",
    category: "Juegos",
    rating: "5.0",
    color: "bg-[#FDF2F8] dark:bg-[#9D174D]/10",
    tag: "Nuevo",
    isReady: true,
  },
  {
    id: "batalla-naval",
    title: "Batalla Naval del Saber",
    description: "Elige coordenadas en el radar, descubre las fragatas ocultas y responde trivias para hundir la flota enemiga.",
    category: "Juegos",
    rating: "5.0",
    color: "bg-[#E6F4EA] dark:bg-[#10B981]/10",
    tag: "Nuevo",
    isReady: true,
  },
  {
    id: "proximamente",
    title: "Trivia en Aula (Próximamente)",
    description: "Cuestionarios competitivos de opción múltiple generados por IA para proyectar y resolver en grupo.",
    category: "Grupal",
    rating: "Pronto",
    color: "bg-card-purple",
    tag: "Próximamente",
    isReady: false,
  }
];

export default function Dinamicas() {
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;
  const navigate = useNavigate();

  const handleSelectDinamica = (dinamica: typeof DINAMICAS_LIST[0]) => {
    if (!dinamica.isReady) return;
    const user = getCurrentUser();
    void logActivity({
      kind: 'tool',
      userName: user?.nombre || user?.email || 'Usuario',
      title: `Dinámica: ${dinamica.title}`,
      detail: `Accedió a la dinámica de clase ${dinamica.title}`
    });
    navigate(`/dinamicas/${dinamica.id}`);
  };

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      {/* Title & Subtitle matching Aula Virtual styling */}
      <div className="space-y-6 pt-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2 text-left">
          <div>
            <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight leading-[1] text-text-main dark:text-white">
              Dinámicas de Clase
            </h1>
            <p className="text-[14px] text-text-muted mt-2">
              Juegos interactivos y dinámicas de grupo generadas con Inteligencia Artificial, diseñadas para proyectar en el aula y fomentar la participación.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 mt-10">
        <h2 className="text-[#848484] text-[16px] font-semibold tracking-wide uppercase flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-brand-primary" />
          Actividades Disponibles
        </h2>
        <span className="text-[14px] font-medium text-[#1B1B1B]/50">{DINAMICAS_LIST.length} dinámicas</span>
      </div>

      {/* Grid of cards configured to 3 columns layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-[30px]">
        {DINAMICAS_LIST.map((dinamica) => (
          <div
            key={dinamica.id}
            onClick={() => handleSelectDinamica(dinamica)}
            className={`group relative overflow-hidden rounded-[32px] p-8 border border-black/5 dark:border-white/5 transition-all duration-300 shadow-2xs hover:shadow-lg flex flex-col h-full ${dinamica.color} ${
              dinamica.isReady ? 'cursor-pointer hover:-translate-y-1' : 'opacity-70 cursor-not-allowed'
            }`}
          >
            {/* Background design for Bajo la Lluvia */}
            {dinamica.id === 'bajo-la-lluvia' && (
              <div className="absolute -right-6 -bottom-6 w-36 h-36 text-pink-700/8 dark:text-pink-400/8 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                  <path d="M16 14v6" />
                  <path d="M8 14v6" />
                  <path d="M12 16v6" />
                </svg>
              </div>
            )}

            {/* Background design for Jeopardy */}
            {dinamica.id === 'jeopardy' && (
              <div className="absolute -right-6 -bottom-6 w-36 h-36 text-sky-700/8 dark:text-sky-400/8 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M21 12H3" />
                  <path d="M12 3v18" />
                </svg>
              </div>
            )}
 
            {/* Background design for Mentira */}
            {dinamica.id === 'mentira' && (
              <div className="absolute -right-6 -bottom-6 w-36 h-36 text-pink-700/8 dark:text-pink-400/8 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            )}

            {/* Background design for Rimando Ando */}
            {dinamica.id === 'rimando-ando' && (
              <div className="absolute -right-6 -bottom-6 w-36 h-36 text-purple-700/8 dark:text-purple-400/8 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M12 7l1 2.5L15.5 10l-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
                </svg>
              </div>
            )}

            {/* Background design for Profesor */}
            {dinamica.id === 'profesor' && (
              <div className="absolute -right-6 -bottom-6 w-36 h-36 text-indigo-600/10 dark:text-indigo-400/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <GraduationCap className="w-full h-full" strokeWidth={1.5} />
              </div>
            )}

            {/* Background design for Reto Matemático */}
            {dinamica.id === 'reto-matematico' && (
              <div className="absolute -right-6 -bottom-6 w-36 h-36 text-emerald-700/8 dark:text-emerald-400/8 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <Calculator className="w-full h-full" strokeWidth={1.5} />
              </div>
            )}

            {/* Background design for Mapa Dominicano */}
            {dinamica.id === 'mapa-dominicano' && (
              <div className="absolute -right-6 -bottom-6 w-36 h-36 text-sky-700/8 dark:text-sky-400/8 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <Globe className="w-full h-full" strokeWidth={1.5} />
              </div>
            )}

            {/* Background design for Subasta de Conocimiento */}
            {dinamica.id === 'subasta-conocimiento' && (
              <div className="absolute -right-6 -bottom-6 w-36 h-36 text-amber-600/10 dark:text-amber-500/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <Gavel className="w-full h-full" strokeWidth={1.5} />
              </div>
            )}

             {/* Background design for El Detective del Mapa */}
            {dinamica.id === 'detective-mapa' && (
              <div className="absolute -right-6 -bottom-6 w-36 h-36 text-emerald-600/10 dark:text-emerald-500/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <Compass className="w-full h-full" strokeWidth={1.5} />
              </div>
            )}
            {/* Background design for El Impostor */}
            {dinamica.id === 'impostor' && (
              <div className="absolute -right-6 -bottom-6 w-36 h-36 text-purple-650/10 dark:text-purple-400/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <Fingerprint className="w-full h-full" strokeWidth={1.5} />
              </div>
            )}

            {/* Background design for La Bomba de Tiempo */}
            {dinamica.id === 'bomba-tiempo' && (
              <div className="absolute -right-6 -bottom-6 w-36 h-36 text-pink-600/10 dark:text-pink-400/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <Clock className="w-full h-full" strokeWidth={1.5} />
              </div>
            )}

            {/* Background design for Batalla Naval */}
            {dinamica.id === 'batalla-naval' && (
              <div className="absolute -right-6 -bottom-6 w-36 h-36 text-emerald-600/10 dark:text-emerald-500/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <Anchor className="w-full h-full" strokeWidth={1.5} />
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-black uppercase tracking-wider bg-white/60 dark:bg-black/20 text-[#1B1B1B] dark:text-white px-3 py-1 rounded-full shadow-2xs">
                {dinamica.tag}
              </span>
              <div className="flex items-center gap-1 text-[13px] font-bold text-[#1B1B1B]">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{dinamica.rating}</span>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl leading-[1.2] tracking-[0.2px] font-semibold text-[#1B1B1B] mb-4 flex items-center gap-2.5">
                {dinamica.title}
                {dinamica.id === 'bajo-la-lluvia' ? (
                  <CloudRain className="w-6 h-6 text-blue-600" />
                ) : dinamica.id === 'jeopardy' ? (
                  <Trophy className="w-6 h-6 text-sky-600" />
                ) : dinamica.id === 'mentira' ? (
                  <Sparkles className="w-6 h-6 text-pink-500" />
                ) : dinamica.id === 'rimando-ando' ? (
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                ) : dinamica.id === 'profesor' ? (
                  <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                ) : dinamica.id === 'reto-matematico' ? (
                  <Calculator className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : dinamica.id === 'mapa-dominicano' ? (
                  <Globe className="w-6 h-6 text-sky-600 dark:text-sky-500" />
                ) : dinamica.id === 'subasta-conocimiento' ? (
                  <Gavel className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                ) : dinamica.id === 'detective-mapa' ? (
                  <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                ) : dinamica.id === 'impostor' ? (
                  <Fingerprint className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                ) : dinamica.id === 'bomba-tiempo' ? (
                  <Clock className="w-6 h-6 text-pink-600" />
                ) : dinamica.id === 'batalla-naval' ? (
                  <Anchor className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                ) : dinamica.isReady ? (
                  <Sparkles className="w-5 h-5 text-purple-600" />
                ) : null}
              </h3>
              <p className="text-[#1B1B1B]/70 font-medium text-sm md:text-base leading-relaxed mb-6">
                {dinamica.description}
              </p>
            </div>

            <div className="mt-auto flex justify-between items-center w-full pt-4 border-t border-black/5">
              <span className="text-[12px] font-bold text-[#1B1B1B]/40 uppercase tracking-widest">{dinamica.category}</span>
              {dinamica.isReady ? (
                <div className="flex items-center gap-2 text-sm font-bold text-[#1B1B1B] group-hover:text-brand-primary transition-colors">
                  <span>Jugar Ahora</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              ) : (
                <span className="text-sm font-bold text-[#1B1B1B]/40">Próximamente</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
