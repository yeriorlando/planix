import React, { useState } from 'react';
import { Home, Calendar, BookOpen, Grid, FolderOpen, MessageSquare, Settings, Bell, Users, UserCheck, LogOut, Sparkles, Bot, MessageCircle, Crown, Coins, Gamepad2, Eye, ClipboardList, LayoutGrid, SquarePen, GraduationCap, FileSignature, FileBarChart, BarChart, Layers, Wrench } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentUser } from '../lib/storage';
import { performLogout } from '../lib/utils/authUtils';

export default function Sidebar({ 
  className = "",
  isPinned,
  togglePin,
  onHoverChange
}: { 
  className?: string;
  isPinned: boolean;
  togglePin: () => void;
  onHoverChange?: (hovered: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);
  
  const handleSetHovered = (val: boolean) => {
    setHovered(val);
    onHoverChange?.(val);
  };
  
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const currentUser = getCurrentUser();
  const avatarUrl = currentUser?.avatar_url || "https://randomuser.me/api/portraits/women/47.jpg";

  const handleLogout = () => {
    performLogout(navigate);
  };

  const teacherSections = [
    {
      title: "PRINCIPAL",
      items: [
        { to: "/dashboard", label: "Panel principal", icon: "home" },
      ]
    },
    {
      title: "GESTIÓN",
      items: [
        { to: "/aula-virtual", label: "Aula Virtual", icon: "group" },
        { to: "/calendario", label: "Calendario", icon: "calendar_today" },
        { to: "/planificaciones", label: "Planificaciones", icon: "menu_book" },
        { to: "/talleres", label: "Mis Talleres", icon: "layers" },
        { to: "/herramientas", label: "Herramientas", icon: "grid_view" },
        { to: "/dinamicas", label: "Dinámicas", icon: "videogame_asset" },
      ]
    },
    {
      title: "COMUNIDAD Y RECURSOS",
      items: [
        { to: "/recursos", label: "Recursos", icon: "folder" },
        { to: "/comunidad", label: "Comunidad", icon: "chat_bubble_outline" },
        { to: "/chat", label: "Planix Chat", icon: "forum" },
        { to: "/efemerides", label: "Efemérides", icon: "auto_awesome" },
      ]
    }
  ];

  const coordinatorSections = [
    {
      title: "PRINCIPAL",
      items: [
        { to: "/coordinador/dashboard?tab=inicio", label: "Panel principal", icon: "grid_view" },
        { to: "/coordinador/dashboard?tab=bitacora", label: "Bitácora", icon: "edit_note" },
      ]
    },
    {
      title: "GESTIÓN",
      items: [
        { to: "/coordinador/dashboard?tab=acompanamiento", label: "Acompañamientos", icon: "visibility" },
        { to: "/coordinador/dashboard?tab=docentes", label: "Docentes", icon: "school" },
        { to: "/coordinador/dashboard?tab=planificaciones", label: "Planificaciones", icon: "assignment" },
        { to: "/coordinador/dashboard?tab=estudiantes", label: "Estudiantes", icon: "group" },
      ]
    },
    {
      title: "DOCUMENTOS",
      items: [
        { to: "/coordinador/dashboard?tab=actas", label: "Actas y reuniones", icon: "draw" },
        { to: "/coordinador/dashboard?tab=informes", label: "Informes", icon: "description" },
        { to: "/coordinador/dashboard?tab=evidencias", label: "Evidencias", icon: "folder" },
      ]
    },
    {
      title: "ANÁLISIS",
      items: [
        { to: "/coordinador/dashboard?tab=estadisticas", label: "Estadísticas", icon: "bar_chart" },
      ]
    },
    {
      title: "COMUNIDAD Y RECURSOS",
      items: [
        { to: "/recursos", label: "Recursos", icon: "folder" },
        { to: "/comunidad", label: "Comunidad", icon: "chat_bubble_outline" },
        { to: "/chat", label: "Planix Chat", icon: "forum" },
        { to: "/efemerides", label: "Efemérides", icon: "auto_awesome" },
      ]
    }
  ];

  const showExpanded = isPinned;

  return (
    <>
      {/* Desktop view with fixed wrapper */}
      <div 
        className={`print:hidden transition-all duration-150 ease-out fixed top-0 left-0 bottom-0 flex-shrink-0 hidden xl:block z-35 ${
          showExpanded ? 'w-[280px]' : 'w-[102px]'
        }`}
      >
        <aside
          onMouseEnter={() => handleSetHovered(true)}
          onMouseLeave={() => handleSetHovered(false)}
          className={`w-full h-full flex flex-col pt-2 pb-4 bg-[#f8f9fc] dark:bg-[#13131a] border-r border-[#c5c6d1]/40 dark:border-white/10 transition-all duration-150 ease-out ${
            showExpanded ? 'px-4' : 'px-3 items-center'
          } ${className}`}
        >
          
          {/* Brand Header */}
          <div className="relative mb-4 flex flex-col items-center w-full select-none shrink-0">
            {/* The Logo and Name group */}
            <div className="flex flex-col items-center gap-2 w-full mt-6">
              {showExpanded ? (
                <img 
                  src="/LOGO-SIDEBAR.webp" 
                  alt="Planix" 
                  className="w-[215px] h-auto object-contain transition-all duration-150" 
                />
              ) : (
                <div className="w-[44px] h-[44px] overflow-hidden rounded-xl shrink-0 flex items-center justify-center bg-white border border-black/5 shadow-sm">
                  <img 
                    src="/LOGO-SIDEBAR.webp" 
                    alt="Planix" 
                    className="h-[38px] max-w-none object-cover object-left" 
                    style={{ width: '128px' }} 
                  />
                </div>
              )}
            </div>

            {/* Toggle Button */}
            <button
              onClick={togglePin}
              className={`p-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ${
                showExpanded 
                  ? 'absolute top-0 right-0' 
                  : 'mt-4'
              } ${
                isPinned 
                  ? 'text-slate-800 dark:text-slate-200' 
                  : 'text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
              title={isPinned ? "Contraer barra lateral" : "Expandir barra lateral"}
            >
              {isPinned ? (
                <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="5" height="16" rx="2" fill="currentColor" />
                  <rect x="9" y="4" width="13" height="16" rx="4" fill="currentColor" />
                  <path d="M16.5 9l-3 3 3 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="20" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
                  <line x1="7" y1="4" x2="7" y2="20" stroke="currentColor" strokeWidth="2" />
                  <path d="M11.5 9l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Items wrapper with primary custom scrollbar */}
          <nav className={`w-full flex-1 overflow-y-auto sidebar-scrollbar py-1 flex flex-col gap-1.5 ${
            showExpanded 
              ? 'pr-1' 
              : 'items-center'
          }`}>
            {currentUser?.rol === "coordinator" ? (
              coordinatorSections.map((section) => (
                <div key={section.title} className="w-full flex flex-col gap-1">
                  {showExpanded && (
                    <div className="text-[12px] font-extrabold tracking-wider text-[#132c61]/70 dark:text-blue-400/70 uppercase px-4 mt-5 mb-1.5 select-none">
                      {section.title}
                    </div>
                  )}
                  {section.items.map((item) => {
                    const currentTab = new URLSearchParams(location.search).get("tab") || "inicio";
                    const itemTab = new URLSearchParams(item.to.split('?')[1] || '').get("tab");
                    
                    const isActive = item.to.includes('?tab=')
                      ? (path === item.to.split('?')[0] && currentTab === itemTab)
                      : (item.to === '/' ? path === '/' : path.startsWith(item.to));
                    return (
                      <NavLink 
                        key={item.to}
                        to={item.to}
                        onClick={(e) => {
                          if (item.to === "/efemerides") {
                            e.preventDefault();
                            toast.warning("NO DISPONIBLE");
                          }
                        }}
                        className={`group relative flex items-center gap-2 rounded-xl py-3 transition-all duration-200 outline-none select-none ${
                          showExpanded ? 'w-full' : 'w-[58px] justify-center px-0'
                        } ${
                          isActive 
                            ? 'bg-[#132c61] dark:bg-blue-600 text-white border-l-4 border-[#02b36d] scale-[0.98] font-bold shadow-md shadow-[#132c61]/25 ' + (showExpanded ? 'pl-3 pr-4' : 'px-0') 
                            : 'text-[#61646c] dark:text-slate-350 hover:bg-[#e1e2e5] dark:hover:bg-slate-800/50 hover:text-[#132c61] dark:hover:text-white font-medium ' + (showExpanded ? 'px-4' : 'px-0')
                        }`}
                      >
                        <div className="flex items-center min-w-0">
                          <span className={`material-symbols-outlined shrink-0 ${
                            isActive ? 'text-white' : 'text-[#61646c] dark:text-slate-400 group-hover:text-[#132c61] dark:group-hover:text-white'
                          }`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                            {item.icon}
                          </span>
                          <span className={`truncate transition-all duration-150 ease-out ${
                            showExpanded ? 'opacity-100 max-w-[170px] ml-3.5' : 'opacity-0 max-w-0 overflow-hidden'
                          }`}>
                            {item.label}
                          </span>
                        </div>

                        {/* Tooltip bubble when sidebar is collapsed */}
                        {!showExpanded && (
                          <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 ml-1 px-3 py-1.5 bg-[#1B1B1B] dark:bg-slate-800 text-white dark:text-slate-100 text-[10.5px] font-black tracking-wide uppercase rounded-xl shadow-xl border border-white/10 dark:border-slate-700/50 opacity-0 scale-95 translate-x-[-8px] pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-150 ease-out z-50 whitespace-nowrap select-none">
                            {item.label}
                          </div>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              ))
            ) : (
              teacherSections.map((section) => (
                <div key={section.title} className="w-full flex flex-col gap-1">
                  {showExpanded && (
                    <div className="text-[12px] font-extrabold tracking-wider text-[#132c61]/70 dark:text-blue-400/70 uppercase px-4 mt-5 mb-1.5 select-none">
                      {section.title}
                    </div>
                  )}
                  {section.items.map((item) => {
                    const currentTab = new URLSearchParams(location.search).get("tab") || "inicio";
                    const itemTab = new URLSearchParams(item.to.split('?')[1] || '').get("tab");
                    
                    const isActive = item.to.includes('?tab=')
                      ? (path === item.to.split('?')[0] && currentTab === itemTab)
                      : (item.to === '/' ? path === '/' : path.startsWith(item.to));
                    return (
                      <NavLink 
                        key={item.to}
                        to={item.to}
                        onClick={(e) => {
                          if (item.to === "/efemerides") {
                            e.preventDefault();
                            toast.warning("NO DISPONIBLE");
                          }
                        }}
                        className={`group relative flex items-center gap-2 rounded-xl py-3 transition-all duration-200 outline-none select-none ${
                          showExpanded ? 'w-full' : 'w-[58px] justify-center px-0'
                        } ${
                          isActive 
                            ? 'bg-[#132c61] dark:bg-blue-600 text-white border-l-4 border-[#02b36d] scale-[0.98] font-bold shadow-md shadow-[#132c61]/25 ' + (showExpanded ? 'pl-3 pr-4' : 'px-0') 
                            : 'text-[#61646c] dark:text-slate-350 hover:bg-[#e1e2e5] dark:hover:bg-slate-800/50 hover:text-[#132c61] dark:hover:text-white font-medium ' + (showExpanded ? 'px-4' : 'px-0')
                        }`}
                      >
                        <div className="flex items-center min-w-0">
                          <span className={`material-symbols-outlined shrink-0 ${
                            isActive ? 'text-white' : 'text-[#61646c] dark:text-slate-400 group-hover:text-[#132c61] dark:group-hover:text-white'
                          }`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                            {item.icon}
                          </span>
                          <span className={`truncate transition-all duration-150 ease-out ${
                            showExpanded ? 'opacity-100 max-w-[170px] ml-3.5' : 'opacity-0 max-w-0 overflow-hidden'
                          }`}>
                            {item.label}
                          </span>
                        </div>

                        {/* Tooltip bubble when sidebar is collapsed */}
                        {!showExpanded && (
                          <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 ml-1 px-3 py-1.5 bg-[#1B1B1B] dark:bg-slate-800 text-white dark:text-slate-100 text-[10.5px] font-black tracking-wide uppercase rounded-xl shadow-xl border border-white/10 dark:border-slate-700/50 opacity-0 scale-95 translate-x-[-8px] pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-150 ease-out z-50 whitespace-nowrap select-none">
                            {item.label}
                          </div>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              ))
            )}
          </nav>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="print:hidden xl:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[520px] bg-[#1B1B1B]/95 backdrop-blur-md rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] z-50 px-4 py-3 flex justify-between items-center border border-white/10">
         {currentUser?.rol === "coordinator" ? (
           <>
             <MobileIcon to="/coordinador/dashboard?tab=inicio" icon={<LayoutGrid size={20} />} active={path === '/coordinador/dashboard' && new URLSearchParams(location.search).get("tab") === 'inicio'} />
             <MobileIcon to="/coordinador/dashboard?tab=bitacora" icon={<SquarePen size={20} />} active={path === '/coordinador/dashboard' && new URLSearchParams(location.search).get("tab") === 'bitacora'} />
             <MobileIcon to="/coordinador/dashboard?tab=acompanamiento" icon={<Eye size={20} />} active={path === '/coordinador/dashboard' && new URLSearchParams(location.search).get("tab") === 'acompanamiento'} />
             <MobileIcon to="/coordinador/dashboard?tab=docentes" icon={<GraduationCap size={20} />} active={path === '/coordinador/dashboard' && new URLSearchParams(location.search).get("tab") === 'docentes'} />
             <MobileIcon to="/coordinador/dashboard?tab=planificaciones" icon={<ClipboardList size={20} />} active={path === '/coordinador/dashboard' && new URLSearchParams(location.search).get("tab") === 'planificaciones'} />
             <MobileIcon to="/chat" icon={<MessageCircle size={20} />} active={path === '/chat'} />
           </>
         ) : (
           <>
             <MobileIcon to="/dashboard" icon={<Home size={20} />} active={path === '/dashboard'} />
             <MobileIcon to="/aula-virtual" icon={<Users size={20} />} active={path.startsWith('/aula-virtual')} />
             <MobileIcon to="/chat" icon={<MessageCircle size={20} />} active={path === '/chat'} />
             <MobileIcon to="/calendario" icon={<Calendar size={20} />} active={path === '/calendario'} />
             <MobileIcon to="/herramientas" icon={<Grid size={20} />} active={path === '/herramientas'} />
             <MobileIcon to="/recursos" icon={<FolderOpen size={20} />} active={path === '/recursos'} />
           </>
         )}
         <MobileIcon to="/comunidad" icon={<MessageSquare size={20} />} active={path === '/comunidad'} />
          <NavLink 
            to="/perfil" 
            className={`w-[38px] h-[38px] flex-shrink-0 rounded-full overflow-hidden transition-colors relative ${
              currentUser?.suscripcion === "pro"
                ? "p-[1.5px] bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.35)]"
                : "border-[2px] border-white/20 hover:border-white"
            }`}
          >
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover aspect-square rounded-full" />
            {currentUser?.suscripcion === "pro" && (
              <div className="absolute bottom-0 right-0 bg-gradient-to-tr from-amber-400 to-amber-600 text-white p-0.5 rounded-full border border-white dark:border-slate-900 shadow-xs scale-75">
                <Crown className="h-1.5 w-1.5 fill-white text-white" />
              </div>
            )}
            {path === '/perfil' && <div className="absolute inset-0 bg-black/20 rounded-full"></div>}
          </NavLink>
      </div>
    </>
  );
}

function MobileIcon({ icon, active, to }: { icon: React.ReactNode, active?: boolean, to: string }) {
  return (
    <NavLink to={to} className="relative flex-shrink-0 flex justify-center group">
       <div className={`w-[42px] h-[42px] flex items-center justify-center rounded-full transition-all duration-300 ${active ? 'bg-white text-[#1B1B1B]' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
         {icon}
       </div>
    </NavLink>
  );
}
