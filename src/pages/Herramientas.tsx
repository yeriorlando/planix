import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Wrench, FileText, Gamepad2, Grid, Award, Users } from 'lucide-react';
import Tarjeta from '../components/Tarjeta';

const INITIAL_COURSES = [
  { 
    id: "generador-examenes", 
    title: "Generador de Exámenes", 
    category: "Evaluación", 
    categoryIcon: <FileText size={14} strokeWidth={2.5} />, 
    rating: "5.0", 
    color: "bg-card-purple", 
    avatars: ['https://randomuser.me/api/portraits/women/12.jpg'], 
    students: "Nuevo", 
    isTool: true 
  },
  { 
    id: "sopa-de-letras", 
    title: "Sopa de Letras", 
    category: "Juegos", 
    categoryIcon: <Gamepad2 size={14} strokeWidth={2.5} />, 
    rating: "5.0", 
    color: "bg-card-pink", 
    avatars: ['https://randomuser.me/api/portraits/women/48.jpg'], 
    students: "Nuevo", 
    isTool: true 
  },
  { 
    id: "crucigrama", 
    title: "Generador de Crucigramas", 
    category: "Juegos", 
    categoryIcon: <Gamepad2 size={14} strokeWidth={2.5} />, 
    rating: "5.0", 
    color: "bg-card-green", 
    avatars: ['https://randomuser.me/api/portraits/men/32.jpg'], 
    students: "Nuevo", 
    isTool: true 
  },
  { 
    id: "ruleta", 
    title: "Ruleta de Participación", 
    category: "Juegos", 
    categoryIcon: <Gamepad2 size={14} strokeWidth={2.5} />, 
    rating: "5.0", 
    color: "bg-card-yellow", 
    avatars: ['https://randomuser.me/api/portraits/women/24.jpg', 'https://randomuser.me/api/portraits/men/15.jpg'], 
    students: "Nuevo", 
    isTool: true 
  },
  { 
    id: "generador-diplomas", 
    title: "Generador de Diplomas", 
    category: "Evaluación", 
    categoryIcon: <Award size={14} strokeWidth={2.5} />, 
    rating: "5.0", 
    color: "bg-card-purple", 
    avatars: ['https://randomuser.me/api/portraits/women/12.jpg'], 
    students: "Nuevo", 
    isTool: true 
  },
  { 
    id: "generador-grupos", 
    title: "Generador de Grupos", 
    category: "Juegos", 
    categoryIcon: <Users size={14} strokeWidth={2.5} />, 
    rating: "5.0", 
    color: "bg-card-green", 
    avatars: ['https://randomuser.me/api/portraits/men/32.jpg'], 
    students: "Nuevo", 
    isTool: true 
  }
];

export default function Herramientas() {
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;
  const [filter, setFilter] = useState('Todas');

  const filteredCourses = filter === 'Todas' 
    ? INITIAL_COURSES 
    : INITIAL_COURSES.filter(c => c.category === filter);

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      {/* Title & Subtitle matching Aula Virtual styling */}
      <div className="space-y-6 pt-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2 text-left">
          <div>
            <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight leading-[1] text-text-main dark:text-white">
              Herramientas de Clase
            </h1>
            <p className="text-[14px] text-text-muted mt-2">
              Genera recursos educativos dinámicos, evaluaciones interactivas y material didáctico a tu medida.
            </p>
          </div>
        </div>
      </div>

      {/* Filter pills container */}
      <div className="flex flex-nowrap flex-shrink-0 items-center gap-4 md:gap-[22px] mt-8 mb-[45px] overflow-x-auto py-[10px] min-h-[90px] scrollbar-hide w-auto -mx-6 px-6 md:-mx-[60px] md:px-[60px] xl:-mx-16 xl:px-16">
         <FilterPill icon={<Grid size={22} />} label="Todas" active={filter === 'Todas'} onClick={() => setFilter('Todas')} />
         <FilterPill icon={<FileText size={22} strokeWidth={2} />} label="Evaluación" active={filter === 'Evaluación'} onClick={() => setFilter('Evaluación')} />
         <FilterPill icon={<Gamepad2 size={22} strokeWidth={2} />} label="Juegos" active={filter === 'Juegos'} onClick={() => setFilter('Juegos')} />
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[#848484] text-[16px] font-semibold tracking-wide uppercase flex items-center gap-2">
          <Wrench className="w-5 h-5 text-brand-primary" />
          {filter === 'Todas' ? 'Herramientas Disponibles' : `Categoría: ${filter}`}
        </h2>
        <span className="text-[14px] font-medium text-[#1B1B1B]/50">{filteredCourses.length} {filteredCourses.length === 1 ? 'herramienta' : 'herramientas'}</span>
      </div>
      
      {/* Grid of cards configured to 3 columns layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7 lg:gap-[30px]">
        {filteredCourses.map((course) => (
          <Tarjeta 
            key={course.id}
            id={course.id}
            title={course.title}
            category={course.category}
            categoryIcon={course.categoryIcon}
            rating={course.rating}
            color={course.color}
            avatars={course.avatars}
            students={course.students}
          />
        ))}
      </div>
    </main>
  );
}

function FilterPill({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-[10px] px-5 py-[14px] rounded-full text-[15px] font-medium whitespace-nowrap transition-all shadow-sm ${
        active 
          ? 'bg-[#1B1B1B] text-white shadow-md' 
          : 'bg-white text-[#848484] hover:bg-black/5 hover:text-[#1B1B1B]'
      }`}
    >
      <span className={active ? 'text-white' : 'text-[#1B1B1B]'}>{icon}</span>
      {label}
    </button>
  );
}
