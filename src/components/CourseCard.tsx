import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText } from 'lucide-react';

interface CourseCardProps {
  key?: React.Key;
  id?: number | string;
  color: string;
  category: string;
  categoryIcon: React.ReactNode;
  rating: string;
  title: string;
  students: string;
  avatars: string[];
  badge?: React.ReactNode;
}

export default function CourseCard({ id, color, category, categoryIcon, rating, title, students, avatars, badge }: CourseCardProps) {
  const navigate = useNavigate();
  const borderColorMap: Record<string, string> = {
    'bg-card-pink': 'border-[#FACDD1]',
    'bg-card-yellow': 'border-[#FBE6C2]',
    'bg-card-purple': 'border-[#DCDDFF]',
    'bg-card-green': 'border-[#B2F0D1]',
  };
  const borderColor = borderColorMap[color] || 'border-white';

  return (
    <motion.div 
      onClick={() => {
        if (id === 'generador-examenes') {
          navigate('/herramientas/generador-examenes');
        } else {
          navigate(`/planificacion/${id || 1}`);
        }
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", bounce: 0.2 }}
      className={`${color} rounded-[32px] p-6 lg:p-[30px] flex flex-col justify-between cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] min-h-[250px] relative overflow-hidden group`}
    >
      <div className="flex justify-between items-start mb-6 align-top">
        <div className="flex items-center gap-[10px] bg-white/60 px-4 py-[7px] rounded-[14px] text-[13px] font-semibold text-[#1B1B1B]">
          <span>{categoryIcon}</span> {category}
        </div>
        <div className="flex flex-col gap-2 items-end">
           <div className="flex items-center gap-[6px] bg-white px-[12px] py-[6px] rounded-[12px] text-[13px] font-bold shadow-sm text-[#1B1B1B]">
             <span className="text-amber-400 text-[14px] leading-none mb-[2px]">★</span> {rating}
           </div>
           {badge && (
             <div className="mt-1">{badge}</div>
           )}
        </div>
      </div>
      
      {id === 'generador-examenes' && (
        <div className="absolute right-[-10px] bottom-4 opacity-[0.08] pointer-events-none group-hover:scale-110 group-hover:opacity-[0.12] transition-all duration-500">
          <FileText size={160} className="text-[#1B1B1B]" />
        </div>
      )}
      
      <div className="mt-auto relative z-10 w-full pt-4">
        <h3 className="text-[25px] leading-[1.2] tracking-[0.2px] font-semibold text-[#1B1B1B] mb-8 pr-4 flex items-start gap-2">
          {id === 'generador-examenes' && <Sparkles className="w-6 h-6 text-purple-600 mt-1 shrink-0 animate-pulse" />}
          <span>{title}</span>
        </h3>
        <div className="flex justify-between items-end w-full">
          <span className="text-[13px] font-medium text-[#1B1B1B] opacity-[0.65]">{students} students</span>
          <div className="flex -space-x-[12px]">
             {avatars.map((avatar, i) => (
               <img key={i} src={avatar} className={`w-[36px] h-[36px] rounded-full border-[2.5px] ${borderColor} object-cover`} alt="student avatar" />
             ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
