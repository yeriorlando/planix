import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Grid, Laptop, MonitorPlay, Briefcase, Box, User, Code, Palette, DollarSign, Megaphone } from 'lucide-react';
import CourseCard from '../components/CourseCard';

const INITIAL_COURSES = [
  { id: "generador-examenes", title: "Generador de Exámenes IA", category: "AI", categoryIcon: <MonitorPlay size={14} strokeWidth={2.5} />, rating: "5.0", color: "bg-card-purple", avatars: ['https://randomuser.me/api/portraits/women/12.jpg'], students: "Nuevo", isTool: true },
  { id: 1, title: "UI/UX Design for Beginners", category: "Design", categoryIcon: <Palette size={14} strokeWidth={2.5} />, rating: "4.9", color: "bg-card-green", avatars: ['https://randomuser.me/api/portraits/women/1.jpg', 'https://randomuser.me/api/portraits/men/2.jpg'], students: "12.5k students" },
  { id: 2, title: "Python for Data Science", category: "Programming", categoryIcon: <Code size={14} strokeWidth={2.5} />, rating: "4.8", color: "bg-card-purple", avatars: ['https://randomuser.me/api/portraits/women/4.jpg', 'https://randomuser.me/api/portraits/men/5.jpg'], students: "18.2k students" },
  { id: 3, title: "Digital Marketing 101", category: "Marketing", categoryIcon: <Megaphone size={14} strokeWidth={2.5} />, rating: "4.6", color: "bg-card-pink", avatars: ['https://randomuser.me/api/portraits/women/7.jpg', 'https://randomuser.me/api/portraits/men/8.jpg'], students: "8.4k students" },
  { id: 4, title: "Machine Learning Basics", category: "AI", categoryIcon: <MonitorPlay size={14} strokeWidth={2.5} />, rating: "4.9", color: "bg-card-yellow", avatars: ['https://randomuser.me/api/portraits/men/11.jpg', 'https://randomuser.me/api/portraits/women/15.jpg'], students: "5.2k students" },
  { id: 5, title: "Advanced React Patterns", category: "Programming", categoryIcon: <Code size={14} strokeWidth={2.5} />, rating: "4.9", color: "bg-card-purple", avatars: ['https://randomuser.me/api/portraits/men/13.jpg', 'https://randomuser.me/api/portraits/women/22.jpg'], students: "10.1k students" },
  { id: 6, title: "Interior Design 3D Tools", category: "Design", categoryIcon: <Box size={14} strokeWidth={2.5} />, rating: "4.7", color: "bg-card-green", avatars: ['https://randomuser.me/api/portraits/women/35.jpg'], students: "4.3k students" },
  { id: 7, title: "Venture Capital Basics", category: "Business", categoryIcon: <Briefcase size={14} strokeWidth={2.5} />, rating: "4.5", color: "bg-[#E8E1F5]", avatars: ['https://randomuser.me/api/portraits/men/55.jpg', 'https://randomuser.me/api/portraits/women/56.jpg'], students: "6.7k students" },
  { id: 8, title: "Personal Branding on LinkedIn", category: "Marketing", categoryIcon: <User size={14} strokeWidth={2.5} />, rating: "4.8", color: "bg-card-pink", avatars: ['https://randomuser.me/api/portraits/women/66.jpg'], students: "9.9k students" },
  { id: 9, title: "Financial Markets Training", category: "Business", categoryIcon: <DollarSign size={14} strokeWidth={2.5} />, rating: "4.9", color: "bg-card-yellow", avatars: ['https://randomuser.me/api/portraits/men/77.jpg'], students: "14.1k students" },
  { id: 10, title: "Fullstack Web3 Development", category: "Programming", categoryIcon: <Laptop size={14} strokeWidth={2.5} />, rating: "4.8", color: "bg-[#DCDDFF]", avatars: ['https://randomuser.me/api/portraits/women/81.jpg', 'https://randomuser.me/api/portraits/men/82.jpg'], students: "11.2k students" },
  { id: 11, title: "Modern Typography", category: "Design", categoryIcon: <Palette size={14} strokeWidth={2.5} />, rating: "5.0", color: "bg-card-green", avatars: ['https://randomuser.me/api/portraits/women/90.jpg'], students: "3.2k students" },
  { id: 12, title: "ChatGPT Prompt Engineering", category: "AI", categoryIcon: <MonitorPlay size={14} strokeWidth={2.5} />, rating: "4.9", color: "bg-card-yellow", avatars: ['https://randomuser.me/api/portraits/men/91.jpg', 'https://randomuser.me/api/portraits/women/92.jpg'], students: "25k students" },
];

export default function Explore() {
  const [filter, setFilter] = useState('All');
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  const filteredCourses = filter === 'All' 
    ? INITIAL_COURSES 
    : INITIAL_COURSES.filter(c => c.category === filter);

  return (
    <main className={`flex-1 flex flex-col pt-10 xl:pt-[54px] w-full min-w-0 pb-10 px-6 ${
      isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
    }`}>
      <h1 className="text-[52px] md:text-[68px] xl:text-[76px] font-semibold tracking-tight leading-[1] mb-[50px] max-w-[600px] text-[#1B1B1B]">
        Explore new skills
      </h1>

      <div className="flex flex-nowrap flex-shrink-0 items-center gap-4 md:gap-[22px] mb-[45px] overflow-x-auto py-[10px] min-h-[90px] scrollbar-hide w-auto -mx-6 px-6 md:-mx-[60px] md:px-[60px] xl:-mx-16 xl:px-16">
         <FilterPill icon={<Grid size={22} fill="currentColor" />} label="All" active={filter === 'All'} onClick={() => setFilter('All')} />
         <FilterPill icon={<Palette size={22} strokeWidth={2} />} label="Design" active={filter === 'Design'} onClick={() => setFilter('Design')} />
         <FilterPill icon={<Code size={22} strokeWidth={2} />} label="Programming" active={filter === 'Programming'} onClick={() => setFilter('Programming')} />
         <FilterPill icon={<Megaphone size={22} strokeWidth={2} />} label="Marketing" active={filter === 'Marketing'} onClick={() => setFilter('Marketing')} />
         <FilterPill icon={<MonitorPlay size={22} strokeWidth={2} />} label="AI" active={filter === 'AI'} onClick={() => setFilter('AI')} />
         <FilterPill icon={<Briefcase size={22} strokeWidth={2} />} label="Business" active={filter === 'Business'} onClick={() => setFilter('Business')} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#848484] text-[16px] font-semibold tracking-wide uppercase">
          {filter === 'All' ? 'Trending globally' : `${filter} Courses`}
        </h2>
        <span className="text-[14px] font-medium text-[#1B1B1B]/50">{filteredCourses.length} results</span>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7 lg:gap-[30px] ${
        isSidebarPinned ? 'xl:grid-cols-3 2xl:grid-cols-4' : 'xl:grid-cols-4'
      }`}>
        {filteredCourses.map((course) => (
          <CourseCard 
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
        {filteredCourses.length === 0 && (
          <div className="col-span-full py-10 text-center text-[#848484] font-medium border-2 border-dashed border-black/5 rounded-[32px]">
            No courses found in this category.
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
