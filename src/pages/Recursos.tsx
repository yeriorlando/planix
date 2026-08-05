import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';
import { logActivity } from '../lib/activityLog';
import { getCurrentUser } from '../lib/storage';
import { 
  Grid, 
  Wrench, 
  FileText, 
  Gamepad2, 
  BookOpen, 
  HeartHandshake, 
  ExternalLink,
  Search,
  Atom,
  Puzzle,
  Archive,
  Library,
  Users
} from 'lucide-react';

type ResourceCategory = 'Todos' | 'Herramientas de Aula' | 'Fichas y Cuadernillos' | 'Juegos Educativos' | 'Material Didáctico' | 'Inclusión y NEE';

interface EducationalResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  icon: React.ComponentType<any>;
  colorClass: string;
  bgPattern: string;
}

const RESOURCES: EducationalResource[] = [
  {
    id: 'ixl',
    title: 'IXL Aprendizaje',
    description: 'Plataforma líder para la práctica interactiva y personalizada de matemáticas y lenguaje, con explicaciones paso a paso y seguimiento en tiempo real.',
    url: 'https://la.ixl.com/',
    category: 'Material Didáctico',
    icon: BookOpen,
    colorClass: 'from-green-500 to-teal-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/notebook.png")]'
  },
  {
    id: 'paperme',
    title: 'PaperMe',
    description: 'Herramienta gratuita para generar e imprimir papeles personalizados (rayado, cuadriculado, puntos).',
    url: 'https://paperme.pixzens.com/es',
    category: 'Herramientas de Aula',
    icon: Wrench,
    colorClass: 'from-blue-500 to-cyan-400',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]'
  },
  {
    id: 'zperiod',
    title: 'Zperiod',
    description: 'Tabla periódica interactiva con modelos de átomos en 3D, iones y herramientas de química.',
    url: 'https://zperiod.app/',
    category: 'Herramientas de Aula',
    icon: Atom,
    colorClass: 'from-indigo-500 to-purple-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")]'
  },
  {
    id: 'kiddoworksheets',
    title: 'Kiddo Worksheets',
    description: 'Hojas de trabajo y actividades descargables para el desarrollo de niños.',
    url: 'https://www.kiddoworksheets.com/',
    category: 'Fichas y Cuadernillos',
    icon: FileText,
    colorClass: 'from-green-400 to-emerald-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/notebook.png")]'
  },
  {
    id: 'fichasparaimprimir',
    title: 'Fichas para Imprimir',
    description: 'Colección enorme de recursos y fichas imprimibles en español para nivel inicial y primaria.',
    url: 'https://fichasparaimprimir.com/',
    category: 'Fichas y Cuadernillos',
    icon: BookOpen,
    colorClass: 'from-orange-400 to-amber-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/lined-paper.png")]'
  },
  {
    id: 'superteacher',
    title: 'Super Teacher Worksheets',
    description: 'Amplia variedad de hojas de trabajo, juegos imprimibles y actividades variadas.',
    url: 'https://www.superteacherworksheets.com/',
    category: 'Fichas y Cuadernillos',
    icon: FileText,
    colorClass: 'from-red-400 to-rose-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/stardust.png")]'
  },
  {
    id: 'shapeyourfuture',
    title: 'Shape Your Future OK',
    description: 'Materiales y hojas de trabajo enfocados en salud, nutrición y bienestar físico para estudiantes.',
    url: 'https://shapeyourfutureok.com/teachers/worksheets/',
    category: 'Fichas y Cuadernillos',
    icon: HeartHandshake,
    colorClass: 'from-teal-400 to-emerald-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/always-grey.png")]'
  },
  {
    id: 'toytheater',
    title: 'Toy Theater',
    description: 'Juegos educativos interactivos de matemáticas, lectura, arte y rompecabezas.',
    url: 'https://toytheater.com/',
    category: 'Juegos Educativos',
    icon: Gamepad2,
    colorClass: 'from-yellow-400 to-orange-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]'
  },
  {
    id: 'arbolabc',
    title: 'Árbol ABC',
    description: 'Juegos interactivos infantiles y actividades educativas divertidas para los más pequeños.',
    url: 'https://arbolabc.com/',
    category: 'Juegos Educativos',
    icon: Puzzle,
    colorClass: 'from-lime-400 to-green-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/stardust.png")]'
  },
  {
    id: 'materialmaestros',
    title: 'Material para Maestros',
    description: 'Sitio dedicado a compartir planeaciones, materiales didácticos y formatos para el aula.',
    url: 'https://materialparamaestros.com/',
    category: 'Material Didáctico',
    icon: Archive,
    colorClass: 'from-blue-600 to-indigo-600',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/connected.png")]'
  },
  {
    id: 'proferecursos',
    title: 'Profe Recursos',
    description: 'Fichas gratuitas, flashcards y pósters educativos de alta calidad visual.',
    url: 'https://www.proferecursos.com/',
    category: 'Material Didáctico',
    icon: Library,
    colorClass: 'from-fuchsia-500 to-pink-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/tiny-grid.png")]'
  },
  {
    id: 'imageneseducativas',
    title: 'Imágenes Educativas',
    description: 'Miles de recursos, fichas y cuadernillos de trabajo organizados por temáticas.',
    url: 'https://www.imageneseducativas.com/',
    category: 'Material Didáctico',
    icon: BookOpen,
    colorClass: 'from-sky-400 to-blue-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/shattered.png")]'
  },
  {
    id: 'teachstarter',
    title: 'Teach Starter',
    description: 'Colección premium de recursos, actividades y decoraciones para la clase (en inglés).',
    url: 'https://www.teachstarter.com/us/',
    category: 'Material Didáctico',
    icon: Archive,
    colorClass: 'from-emerald-500 to-teal-600',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/always-grey.png")]'
  },
  {
    id: 'paramaestros',
    title: 'Para Maestros',
    description: 'Comunidad con material de apoyo docente, herramientas y evaluaciones.',
    url: 'https://paramaestros.com/',
    category: 'Material Didáctico',
    icon: Users,
    colorClass: 'from-orange-500 to-red-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]'
  },
  {
    id: 'soyvisual',
    title: 'Soy Visual',
    description: 'Sistema de comunicación aumentativa con láminas y fotografías para necesidades especiales.',
    url: 'https://www.soyvisual.org/',
    category: 'Inclusión y NEE',
    icon: HeartHandshake,
    colorClass: 'from-violet-500 to-purple-600',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/stardust.png")]'
  },
  {
    id: 'orientacionandujar',
    title: 'Orientación Andújar',
    description: 'Banco de recursos masivo para atención a la diversidad, estimulación cognitiva y tutoría.',
    url: 'https://www.orientacionandujar.es/',
    category: 'Inclusión y NEE',
    icon: Library,
    colorClass: 'from-amber-500 to-orange-600',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/tiny-grid.png")]'
  },
  {
    id: 'todoinclusion',
    title: 'Todo Inclusión',
    description: 'Material específico y recursos prácticos para el trabajo en aulas inclusivas y educación especial.',
    url: 'https://todoinclusion.com/Pagina-principal/',
    category: 'Inclusión y NEE',
    icon: Users,
    colorClass: 'from-rose-400 to-pink-600',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/connected.png")]'
  },
  {
    id: 'pizarrasolidaria',
    title: 'Pizarra Solidaria',
    description: 'Juegos interactivos para lectura, escritura y matemáticas básicas. Muy usable con niños pequeños.',
    url: 'https://pizarrasolidaria.com/',
    category: 'Juegos Educativos',
    icon: Gamepad2,
    colorClass: 'from-purple-500 to-fuchsia-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")]'
  },
  {
    id: 'recursosdidacticos',
    title: 'Recursos Didácticos',
    description: 'Banco enorme de fichas (sobre todo secundaria): matemáticas, ciencias, lenguaje. Descargas directas.',
    url: 'https://recursosdidacticos.org/',
    category: 'Fichas y Cuadernillos',
    icon: FileText,
    colorClass: 'from-blue-400 to-indigo-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/notebook.png")]'
  },
  {
    id: 'masqueunlapiz',
    title: 'Más Que Un Lápiz',
    description: 'Repositorio vivo de herramientas, ideas TIC y materiales compartidos por docentes.',
    url: 'https://www.masqueunlapiz.com/',
    category: 'Material Didáctico',
    icon: Library,
    colorClass: 'from-orange-400 to-amber-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]'
  },
  {
    id: 'educaplay',
    title: 'Educaplay',
    description: 'Crea sopas de letras, quizzes y mapas interactivos. Generación rápida de actividades.',
    url: 'https://es.educaplay.com/',
    category: 'Herramientas de Aula',
    icon: Puzzle,
    colorClass: 'from-emerald-400 to-teal-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/connected.png")]'
  },
  {
    id: 'wordwall',
    title: 'Wordwall',
    description: 'Generador de actividades imprimibles y digitales (ruletas, juegos, cuestionarios).',
    url: 'https://wordwall.net/es',
    category: 'Herramientas de Aula',
    icon: Wrench,
    colorClass: 'from-cyan-500 to-blue-600',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/tiny-grid.png")]'
  },
  {
    id: 'h5p',
    title: 'H5P',
    description: 'Crear contenido interactivo (videos con preguntas, presentaciones, juegos) integrable en web o LMS.',
    url: 'https://h5p.org/',
    category: 'Herramientas de Aula',
    icon: Atom,
    colorClass: 'from-violet-500 to-purple-600',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/shattered.png")]'
  },
  {
    id: 'exelearning',
    title: 'eXeLearning',
    description: 'Software libre para crear unidades didácticas completas exportables (SCORM, web).',
    url: 'https://exelearning.net/',
    category: 'Herramientas de Aula',
    icon: BookOpen,
    colorClass: 'from-green-500 to-emerald-600',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/stardust.png")]'
  },
  {
    id: 'kahoot',
    title: 'Kahoot!',
    description: 'Clásico para quizzes en vivo, competitivo y funciona bien en clase.',
    url: 'https://kahoot.com/',
    category: 'Juegos Educativos',
    icon: Gamepad2,
    colorClass: 'from-purple-600 to-indigo-700',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]'
  },
  {
    id: 'quizizz',
    title: 'Quizizz',
    description: 'Plataforma flexible para quizzes en modo tarea, sincrónico o asincrónico.',
    url: 'https://quizizz.com/?lng=es',
    category: 'Juegos Educativos',
    icon: FileText,
    colorClass: 'from-indigo-400 to-purple-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")]'
  },
  {
    id: 'cerebriti',
    title: 'Cerebriti',
    description: 'Juegos educativos creados por la comunidad (y puedes crear los tuyos).',
    url: 'https://www.cerebriti.com/',
    category: 'Juegos Educativos',
    icon: Gamepad2,
    colorClass: 'from-amber-400 to-orange-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/tiny-grid.png")]'
  },
  {
    id: 'canva',
    title: 'Canva para Educación',
    description: 'Diseñar materiales educativos (presentaciones, fichas, infografías). Gratis para docentes.',
    url: 'https://www.canva.com/education/',
    category: 'Herramientas de Aula',
    icon: Wrench,
    colorClass: 'from-cyan-400 to-blue-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/connected.png")]'
  },
  {
    id: 'googleforms',
    title: 'Google Forms',
    description: 'Formularios y evaluaciones automáticas.',
    url: 'https://docs.google.com/forms/',
    category: 'Herramientas de Aula',
    icon: FileText,
    colorClass: 'from-purple-400 to-fuchsia-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/notebook.png")]'
  },
  {
    id: 'jitsi',
    title: 'Jitsi Meet',
    description: 'Videollamadas sin registro, sin límite práctico para clases virtuales.',
    url: 'https://jitsi.org/jitsi-meet/',
    category: 'Herramientas de Aula',
    icon: Users,
    colorClass: 'from-blue-500 to-indigo-600',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/always-grey.png")]'
  },
  {
    id: 'mindomo',
    title: 'Mindomo',
    description: 'Mapas mentales online, funciona bien para planificación o estudiantes.',
    url: 'https://www.mindomo.com/es/',
    category: 'Herramientas de Aula',
    icon: Atom,
    colorClass: 'from-rose-400 to-pink-500',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/stardust.png")]'
  },
  {
    id: 'khanacademy',
    title: 'Khan Academy',
    description: 'Cursos completos (mate, ciencia, economía). Gratis y bien organizado.',
    url: 'https://es.khanacademy.org/',
    category: 'Material Didáctico',
    icon: BookOpen,
    colorClass: 'from-emerald-500 to-green-600',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/tiny-grid.png")]'
  },
  {
    id: 'aulaplaneta',
    title: 'aulaPlaneta',
    description: 'Recursos, artículos y materiales didácticos actualizados.',
    url: 'https://www.aulaplaneta.com/',
    category: 'Material Didáctico',
    icon: Library,
    colorClass: 'from-blue-600 to-cyan-700',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/shattered.png")]'
  },
  {
    id: 'discapacidad360',
    title: 'Discapacidad 360',
    description: 'Compilación de herramientas adaptadas para educación inclusiva (materiales, actividades, guías).',
    url: 'https://www.discapacidad360.com/recursos-y-herramientas/',
    category: 'Inclusión y NEE',
    icon: HeartHandshake,
    colorClass: 'from-amber-500 to-orange-600',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/connected.png")]'
  },
  {
    id: 'procomun',
    title: 'Procomún',
    description: 'Recursos educativos abiertos (REA), muchos adaptables a distintos contextos educativos.',
    url: 'https://www.procomun.educalab.es/',
    category: 'Inclusión y NEE',
    icon: Archive,
    colorClass: 'from-teal-500 to-emerald-600',
    bgPattern: 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]'
  }
];

export default function Recursos() {
  const [filter, setFilter] = useState<ResourceCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  useEffect(() => {
    const user = getCurrentUser();
    const userName = user?.nombre || user?.email || 'Docente';
    void logActivity({
      kind: 'tool',
      userName,
      title: 'Directorio de Recursos',
      detail: 'Accedió a Recursos Educativos',
    });
  }, []);

  const filteredResources = RESOURCES.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filter === 'Todos' || res.category === filter;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <div className="text-center mb-8 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B1B1B] dark:text-white tracking-tight mb-2">
          Directorio de Recursos
        </h1>
        <p className="text-[15px] md:text-[17px] font-medium text-slate-400 dark:text-zinc-450 tracking-tight max-w-[650px] leading-relaxed">
          Explora nuestra colección curada de plataformas educativas y material didáctico externo.
        </p>
      </div>

      {/* Centered Search Bar */}
      <div className="flex items-center w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[20px] shadow-sm mb-8 px-4 py-3 gap-2.5 focus-within:ring-4 focus-within:ring-brand-primary/10 focus-within:dark:ring-white/5 focus-within:border-brand-primary focus-within:dark:border-zinc-700 transition-all">
        <Search className="w-5 h-5 text-slate-400 dark:text-zinc-550 shrink-0" />
        <input 
          type="text" 
          placeholder="Buscar recursos, herramientas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm font-bold text-slate-800 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 placeholder-slate-400 dark:placeholder-zinc-500"
        />
      </div>

      <div className={`flex flex-nowrap flex-shrink-0 items-center justify-start lg:justify-center gap-3 mb-[35px] overflow-x-auto py-2 scrollbar-hide w-auto -mx-6 px-6 ${
        isSidebarPinned 
          ? 'md:-mx-6 md:px-6 xl:-mx-8 xl:px-8' 
          : 'md:-mx-[60px] md:px-[60px] xl:-mx-16 xl:px-16'
      }`}>
        <FilterPill icon={<Grid size={16} fill="currentColor" />} label="Todos" active={filter === 'Todos'} onClick={() => setFilter('Todos')} />
        <FilterPill icon={<Wrench size={16} strokeWidth={2} />} label="Herramientas de Aula" active={filter === 'Herramientas de Aula'} onClick={() => setFilter('Herramientas de Aula')} />
        <FilterPill icon={<FileText size={16} strokeWidth={2} />} label="Fichas y Cuadernillos" active={filter === 'Fichas y Cuadernillos'} onClick={() => setFilter('Fichas y Cuadernillos')} />
        <FilterPill icon={<Gamepad2 size={16} strokeWidth={2} />} label="Juegos Educativos" active={filter === 'Juegos Educativos'} onClick={() => setFilter('Juegos Educativos')} />
        <FilterPill icon={<BookOpen size={16} strokeWidth={2} />} label="Material Didáctico" active={filter === 'Material Didáctico'} onClick={() => setFilter('Material Didáctico')} />
        <FilterPill icon={<HeartHandshake size={16} strokeWidth={2} />} label="Inclusión y NEE" active={filter === 'Inclusión y NEE'} onClick={() => setFilter('Inclusión y NEE')} />
      </div>

      {/* Results Subheader */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#848484] dark:text-zinc-500 text-[15px] font-bold tracking-wide uppercase">
          {filter === 'Todos' ? 'Colección completa' : filter}
        </h2>
        <span className="text-[13px] font-semibold text-[#1B1B1B]/50 dark:text-white/50">{filteredResources.length} resultados</span>
      </div>

      {/* 4-Column Grid for Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredResources.map((res) => (
          <ResourceCard key={res.id} resource={res} />
        ))}
        {filteredResources.length === 0 && (
          <div className="col-span-full py-16 text-center text-[#848484] dark:text-zinc-500 font-medium border-2 border-dashed border-black/5 dark:border-zinc-800 rounded-[32px] bg-white dark:bg-zinc-900">
            No se encontraron recursos que coincidan con tu búsqueda.
          </div>
        )}
      </div>
    </main>
  );
}

function FilterPill({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer border ${
        active 
          ? 'bg-[#1B1B1B] dark:bg-white text-white dark:text-black border-black/15 dark:border-white/10 shadow-md' 
          : 'bg-white dark:bg-zinc-900 text-[#848484] dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-zinc-800 hover:text-[#1B1B1B] dark:hover:text-white border-slate-200 dark:border-zinc-800'
      }`}
    >
      <span className={active ? 'text-white dark:text-black' : 'text-[#1B1B1B] dark:text-zinc-400'}>{icon}</span>
      {label}
    </button>
  );
}

function ResourceCard({ resource }: { key?: string; resource: EducationalResource }) {
  const Icon = resource.icon;
  const [imgError, setImgError] = useState(false);

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).origin;
      return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${domain}&size=128`;
    } catch {
      return '';
    }
  };

  return (
    <motion.a 
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", bounce: 0.2 }}
      className="group flex flex-col bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-200 dark:hover:border-zinc-750 transition-all duration-300 relative min-h-[240px]"
    >
      {/* Top Banner (Gradient + Pattern overlay) */}
      <div className="h-24 w-full relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${resource.colorClass} overflow-hidden`}>
          <div className={`absolute inset-0 opacity-20 ${resource.bgPattern}`}></div>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
        </div>

        {/* Large Overlapping Logo */}
        <div className="absolute -bottom-6 left-6 z-10">
          <div className="w-[62px] h-[62px] bg-white dark:bg-zinc-950 rounded-2xl shadow-md flex items-center justify-center border border-slate-100 dark:border-zinc-800 transition-transform duration-300 group-hover:scale-105 overflow-hidden p-2">
            {!imgError ? (
              <img 
                src={getFaviconUrl(resource.url)} 
                alt={resource.title}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <Icon className="w-7 h-7 text-slate-700 dark:text-zinc-400" strokeWidth={2} />
            )}
          </div>
        </div>

        {/* External Link hover indicator */}
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0 shadow-sm">
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 pt-8 flex flex-col">
        {/* Category Badge */}
        <div className="mb-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
            {resource.category}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1.5 group-hover:text-[#1e88e5] dark:group-hover:text-blue-400 transition-colors line-clamp-1 leading-snug">
          {resource.title}
        </h3>
        
        {/* Description */}
        <p className="text-[12px] text-slate-550 dark:text-zinc-400 font-medium leading-relaxed mb-1 line-clamp-3">
          {resource.description}
        </p>
      </div>
    </motion.a>
  );
}
