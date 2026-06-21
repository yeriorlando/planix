import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Maximize2, Volume2, ChevronLeft, CheckCircle2, ChevronRight, FileText, Download, MessageSquare, MoreHorizontal, Subtitles, Settings } from 'lucide-react';

export default function DetalleClase() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Transcript');

  return (
    <main className="flex-1 flex flex-col pt-10 xl:pt-8 px-6 md:px-[60px] xl:px-10 w-full min-w-0 pb-10 h-[calc(100vh-2rem)] overflow-hidden">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <Link to={`/planificacion/${id || '1'}`} className="inline-flex items-center gap-2 text-[14px] font-bold text-[#848484] hover:text-[#1B1B1B] transition-colors bg-white border border-black/5 px-4 py-2 rounded-full shadow-sm">
             <ChevronLeft size={16} /> Vista General de la Planificación
          </Link>
          <div className="flex items-center gap-3">
             <button className="bg-white border border-black/5 p-2.5 rounded-full shadow-sm text-[#848484] hover:text-[#1B1B1B] transition-colors">
                <MessageSquare size={18} />
             </button>
             <button className="bg-white border border-black/5 p-2.5 rounded-full shadow-sm text-[#848484] hover:text-[#1B1B1B] transition-colors">
                <MoreHorizontal size={18} />
             </button>
          </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 h-full min-h-0 overflow-hidden relative">
         
         {/* Main Content Area */}
         <div className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-hide pb-20">
            {/* Cinematic Video Player */}
            <div className="w-full aspect-[16/9] bg-black rounded-[32px] md:rounded-[40px] relative overflow-hidden group shadow-xl mb-10 shrink-0">
               <img src="https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" alt="lesson thumbnail" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90"></div>
               
               {/* Center Play Button */}
               <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white hover:scale-110 hover:bg-white/30 transition-all z-10 shadow-2xl">
                  <Play size={32} fill="currentColor" className="ml-2" />
               </button>

               {/* Video Controls */}
               <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end">
                  <div className="w-full h-1.5 bg-white/30 rounded-full mb-6 relative cursor-pointer hover:h-2.5 transition-all group/progress">
                     <div className="w-[35%] h-full bg-[#B2F0D1] rounded-full relative shadow-[0_0_10px_rgba(178,240,209,0.5)]">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition-transform"></div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between text-white">
                     <div className="flex items-center gap-6">
                        <button className="hover:text-[#B2F0D1] transition-colors"><Play size={24} fill="currentColor" /></button>
                        <button className="hover:text-[#B2F0D1] transition-colors"><Volume2 size={22} /></button>
                        <span className="text-[14px] font-semibold tracking-wide">04:12 <span className="opacity-50">/ 12:45</span></span>
                     </div>
                     <div className="flex items-center gap-6">
                        <button className="hover:text-[#B2F0D1] transition-colors"><Subtitles size={22} /></button>
                        <button className="hover:text-[#B2F0D1] transition-colors"><Settings size={22} /></button>
                        <button className="hover:text-[#B2F0D1] transition-colors"><Maximize2 size={22} /></button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="max-w-[800px]">
               <div className="flex items-center gap-3 mb-4">
                  <span className="bg-[#1B1B1B] text-white px-3 py-1 rounded-[10px] text-[12px] font-bold tracking-wide uppercase">Clase 2</span>
                  <span className="bg-[#E8E1F5] text-[#1B1B1B] px-3 py-1 rounded-[10px] text-[12px] font-bold tracking-wide uppercase">Módulo 1</span>
               </div>
               <h1 className="text-[36px] md:text-[44px] font-semibold tracking-tight leading-[1.1] mb-6 text-[#1B1B1B]">
                 Introducción a Framer Motion y Layout
               </h1>
               <p className="text-[#848484] font-medium text-[16px] md:text-[18px] leading-[1.6] mb-10">
                  En esta lección, cubriremos los conceptos fundamentales de las animaciones declarativas usando Framer Motion. Aprenderás sobre el componente de movimiento, cómo implementar propiedades de stagger básicas y la importancia de las animaciones de diseño en interfaces web modernas.
               </p>

               {/* Content Tabs */}
               <div className="flex items-center gap-2 bg-white border border-black/5 p-1.5 rounded-full inline-flex mb-8 shadow-sm">
                  {['Transcripción', 'Notas', 'Recursos'].map(tab => (
                    <button
                       key={tab}
                       onClick={() => setActiveTab(tab === 'Transcripción' ? 'Transcript' : tab === 'Recursos' ? 'Resources' : tab)}
                       className={`px-6 py-2.5 rounded-full text-[15px] font-bold transition-all ${
                         (activeTab === 'Transcript' && tab === 'Transcripción') || (activeTab === 'Resources' && tab === 'Recursos') || activeTab === tab ? 'bg-[#1B1B1B] text-white shadow-md' : 'text-[#848484] hover:text-[#1B1B1B] hover:bg-transparent'
                       }`}
                    >
                       {tab}
                    </button>
                  ))}
               </div>

               <div className="bg-white border border-black/5 rounded-[32px] p-8 md:p-10 shadow-sm">
                  {activeTab === 'Transcript' && (
                     <div className="space-y-8">
                        <div className="flex gap-6 group">
                           <button className="text-[14px] font-bold text-[#848484] group-hover:text-[#1B1B1B] bg-bg-base px-3 py-1.5 rounded-lg h-8 transition-colors shrink-0">00:00</button>
                           <p className="flex-1 text-[#848484] font-medium text-[16px] leading-[1.8] group-hover:text-[#1B1B1B] transition-colors">
                              Bienvenido de nuevo. En este módulo nos sumergiremos directamente en una de las bibliotecas de animación más potentes disponibles para React hoy en día: Framer Motion. Veremos cómo simplifica radicalmente la creación de transiciones de interfaz complejas.
                           </p>
                        </div>
                        <div className="flex gap-6 group">
                           <button className="text-[14px] font-bold text-[#848484] group-hover:text-[#1B1B1B] bg-bg-base px-3 py-1.5 rounded-lg h-8 transition-colors shrink-0">00:45</button>
                           <p className="flex-1 text-[#848484] font-medium text-[16px] leading-[1.8] group-hover:text-[#1B1B1B] transition-colors">
                              Comienza importando el componente de movimiento. Puedes pensar en un componente de movimiento exactamente como un elemento HTML estándar, pero con superpoderes. Definimos nuestro estado inicial, nuestro estado objetivo y dejamos que la biblioteca maneje la interpolación automáticamente bajo el capó mediante física de resortes.
                           </p>
                        </div>
                        <div className="flex gap-6 group">
                           <button className="text-[14px] font-bold text-white bg-[#1B1B1B] px-3 py-1.5 rounded-lg h-8 shadow-sm shrink-0">02:15</button>
                           <p className="flex-1 text-[#1B1B1B] font-semibold text-[16px] leading-[1.8] bg-[#E8E1F5]/50 p-4 rounded-[20px] -mt-2">
                              Ahora, adjuntemos una propiedad de salida. Esto es crucial cuando los componentes se eliminan del DOM de React y nos permite animarlos suavemente en lugar de que desaparezcan abruptamente, lo cual es una experiencia común e incómoda en SPAs.
                           </p>
                        </div>
                     </div>
                  )}

                  {activeTab === 'Resources' && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border border-black/5 bg-[#fafafa] rounded-[24px] p-5 flex items-center justify-between hover:bg-white hover:shadow-md hover:border-black/10 cursor-pointer transition-all group">
                           <div className="flex flex-col gap-3">
                              <div className="w-12 h-12 bg-[#DCDDFF] rounded-[14px] flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                 <FileText size={20} className="fill-indigo-100" />
                              </div>
                              <div>
                                 <h4 className="text-[16px] font-bold text-[#1B1B1B]">Codigo_Inicial.zip</h4>
                                 <span className="text-[13px] font-medium text-[#848484]">ZIP • 2.4 MB</span>
                              </div>
                           </div>
                           <button className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#1B1B1B] shadow-sm"><Download size={18} /></button>
                        </div>
                        <div className="border border-black/5 bg-[#fafafa] rounded-[24px] p-5 flex items-center justify-between hover:bg-white hover:shadow-md hover:border-black/10 cursor-pointer transition-all group">
                           <div className="flex flex-col gap-3">
                              <div className="w-12 h-12 bg-card-yellow rounded-[14px] flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                 <FileText size={20} className="fill-amber-100" />
                              </div>
                              <div>
                                 <h4 className="text-[16px] font-bold text-[#1B1B1B]">Guia_Animaciones.pdf</h4>
                                 <span className="text-[13px] font-medium text-[#848484]">PDF • 1.1 MB</span>
                              </div>
                           </div>
                           <button className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#1B1B1B] shadow-sm"><Download size={18} /></button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Floating Right Sidebar Curriculum */}
         <div className="w-full xl:w-[400px] flex-shrink-0 bg-[#f8f8f8] border border-black/5 rounded-[32px] p-2 flex flex-col h-full overflow-hidden hidden xl:flex relative">
            <div className="p-6 bg-white rounded-[24px] shadow-sm mb-2 border border-black/[0.02]">
               <h3 className="text-[20px] font-bold text-[#1B1B1B] mb-1">A continuación</h3>
               <p className="text-[14px] font-medium text-[#848484] mb-4">Módulo 1 • 2 de 12 clases</p>
               <div className="w-full bg-bg-base h-2 rounded-full overflow-hidden">
                  <div className="bg-[#1B1B1B] w-[20%] h-full rounded-full relative">
                     <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-white/30 to-transparent"></div>
                  </div>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide p-2 flex flex-col gap-2">
               {[
                 { title: "Bienvenido al Curso", time: "05:00", type: 'video', status: 'completed' },
                 { title: "Introducción a Framer Motion", time: "12:45", type: 'video', status: 'playing' },
                 { title: "Stagger Children y Variants", time: "18:20", type: 'video', status: 'locked' },
                 { title: "Gestos y Estados de Hover", time: "14:10", type: 'video', status: 'locked' },
                 { title: "Conceptos Básicos de Animate Presence", time: "09:30", type: 'reading', status: 'locked' },
                 { title: "Construyendo un Menú Lateral", time: "22:15", type: 'exercise', status: 'locked' },
                 { title: "Resumen del Curso y Desafío", time: "05:50", type: 'exercise', status: 'locked' },
               ].map((lesson, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer transition-all border border-transparent ${
                       lesson.status === 'playing' ? 'bg-[#1B1B1B] text-white shadow-xl shadow-black/10 scale-[1.02]' : 
                       lesson.status === 'completed' ? 'hover:bg-white bg-white/50 border-black/5' : 'hover:bg-white opacity-60 hover:opacity-100'
                    }`}
                  >
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${lesson.status === 'playing' ? 'bg-white/20' : lesson.status === 'completed' ? 'bg-[#B2F0D1] text-green-700' : 'bg-black/5 text-[#1B1B1B]'}`}>
                        {lesson.status === 'playing' ? (
                           <div className="w-4 h-4 flex items-end justify-center gap-0.5">
                              <div className="w-[3px] h-[60%] bg-white rounded-full animate-[bounce_1s_infinite]"></div>
                              <div className="w-[3px] h-[100%] bg-white rounded-full animate-[bounce_1s_infinite_100ms]"></div>
                              <div className="w-[3px] h-[40%] bg-white rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                           </div>
                        ) : lesson.status === 'completed' ? (
                           <CheckCircle2 size={20} strokeWidth={2.5} />
                        ) : (
                           <Play size={16} fill="currentColor" className="ml-0.5 opacity-50" />
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className={`text-[15px] font-bold mb-0.5 truncate ${lesson.status === 'playing' ? 'text-white' : 'text-[#1B1B1B]'}`}>
                           {i + 1}. {lesson.title}
                        </h4>
                        <span className={`text-[12px] font-medium uppercase tracking-wide ${lesson.status === 'playing' ? 'text-white/60' : 'text-[#848484]'}`}>
                           {lesson.type === 'video' ? 'video' : lesson.type === 'reading' ? 'lectura' : 'ejercicio'} • {lesson.time}
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

      </div>
    </main>
  );
}
