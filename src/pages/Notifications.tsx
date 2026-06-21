import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Gift, CheckCheck, Trash2, ChevronDown } from 'lucide-react';
import { getCurrentUser } from '../lib/storage';
import { toast } from 'sonner';

interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const renderBodyWithLinks = (body: string, isExpanded: boolean, isRead: boolean) => {
  if (!body) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = body.split(urlRegex);
  
  return (
    <p className={`text-[13px] leading-relaxed max-w-[620px] ${isExpanded ? 'mb-3.5' : 'truncate mb-0'} ${!isRead ? 'text-slate-650 dark:text-slate-350 font-medium' : 'text-slate-450 dark:text-slate-500'}`}>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[#5D5FEF] dark:text-indigo-400 hover:underline break-all font-semibold"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </p>
  );
};

export default function Notifications() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const stored = localStorage.getItem(`planix_notifications_${currentUser.id}`);
      if (stored) {
        try { return JSON.parse(stored); } catch { /* fallthrough */ }
      }
    }
    return [];
  });

  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Keep in sync with localStorage updates
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const stored = localStorage.getItem(`planix_notifications_${currentUser.id}`);
        if (stored) {
          try { setNotifications(JSON.parse(stored)); } catch { /* fallthrough */ }
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Also set interval to check local changes
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Save updates back to localStorage
  const saveNotifications = (newNotifs: AppNotification[]) => {
    setNotifications(newNotifs);
    const currentUser = getCurrentUser();
    if (currentUser) {
      localStorage.setItem(`planix_notifications_${currentUser.id}`, JSON.stringify(newNotifs));
    }
    // Dispatch event to update components on same page
    window.dispatchEvent(new Event('storage'));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
    toast.success('Notificación eliminada');
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
    toast.success('Notificaciones limpiadas');
  };

  // Helper to render icons and custom styles
  const getNotificationConfig = (id: string) => {
    if (id === 'welcome') {
      return {
        color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30',
        icon: <Sparkles size={20} className="text-amber-500" />,
        actionLabel: 'Comenzar ahora',
        actionPath: '/dashboard'
      };
    }
    if (id === 'sub_warning') {
      return {
        color: 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30',
        icon: <AlertCircle size={20} className="text-red-500" />,
        actionLabel: 'Renovar Plan',
        actionPath: '/perfil'
      };
    }
    if (id === 'course_done') {
      return {
        color: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30',
        icon: <CheckCircle2 size={20} className="text-emerald-500" />,
        actionLabel: 'Ver Certificado',
        actionPath: '/perfil'
      };
    }
    // Default / new_template
    return {
      color: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30',
      icon: <Bell size={20} className="text-indigo-500" />,
      actionLabel: 'Explorar Recursos',
      actionPath: '/recursos'
    };
  };

  // Group notifications
  const groups: { [key: string]: AppNotification[] } = {
    'Hoy': [],
    'Ayer': [],
    'Anteriores': []
  };

  notifications.forEach(notif => {
    const time = notif.time.toLowerCase();
    if (time === 'ahora' || time.includes('hora')) {
      groups['Hoy'].push(notif);
    } else if (time.includes('ayer')) {
      groups['Ayer'].push(notif);
    } else {
      groups['Anteriores'].push(notif);
    }
  });

  return (
    <main className="flex-1 flex flex-col pt-6 xl:pt-10 px-6 md:px-[60px] xl:px-16 w-full min-w-0 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] md:text-[42px] font-semibold tracking-tight leading-[1] text-[#1B1B1B] dark:text-white">
            Notificaciones
          </h1>
          <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
            Centro de novedades y avisos
          </p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex items-center gap-3">
            <button 
              onClick={markAllAsRead}
              className="text-[13px] font-bold text-slate-600 dark:text-neutral-300 hover:text-[#1B1B1B] dark:hover:text-white transition-colors border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm bg-white dark:bg-slate-900 cursor-pointer"
            >
              <CheckCheck size={14} />
              Marcar todo como leído
            </button>

            <button 
              onClick={clearAllNotifications}
              className="text-[13px] font-bold text-red-500 hover:text-red-600 transition-colors border border-red-100 dark:border-red-950/35 hover:border-red-200 px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm bg-red-50/50 dark:bg-red-950/20 cursor-pointer"
            >
              <Trash2 size={14} />
              Limpiar
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-[32px] text-center shadow-xs max-w-[900px]">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 border border-black/5 dark:border-white/5">
            <Bell size={28} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-[18px] font-bold text-slate-800 dark:text-slate-205 mb-1">No tienes notificaciones</h3>
          <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium max-w-xs">
            Te avisaremos aquí cuando tengas novedades, actualizaciones de tu cuenta o recursos disponibles.
          </p>
        </div>
      ) : (
        <div className="max-w-[900px] relative">
          {/* Vertical Timeline line */}
          <div className="absolute left-[39px] top-4 bottom-0 w-[2px] bg-black/5 dark:bg-white/5 z-0"></div>

          <div className="flex flex-col gap-10 relative z-10">
            {Object.keys(groups).map((groupName) => {
              const items = groups[groupName];
              if (items.length === 0) return null;

              return (
                <div key={groupName} className="flex flex-col gap-6">
                  <div className="flex items-center gap-6">
                    <div className="bg-[#1B1B1B] dark:bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm z-10 ml-5 relative">
                      {groupName}
                      <div className="absolute top-1/2 left-[-20px] w-[20px] h-[2px] bg-black/5 dark:bg-white/5 -translate-y-1/2 -z-10"></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 ml-[78px]">
                    {items.map((notif) => {
                      const config = getNotificationConfig(notif.id);
                      const isExpanded = expandedIds.includes(notif.id);
                      return (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            markAsRead(notif.id);
                            toggleExpand(notif.id);
                          }}
                          className={`relative p-5 md:p-6 rounded-[24px] flex flex-col md:flex-row items-start gap-4 md:gap-6 border transition-all cursor-pointer group ${
                            !notif.read 
                              ? 'bg-white dark:bg-slate-900 border-transparent shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                              : 'bg-white/45 dark:bg-slate-900/40 border-black/5 dark:border-white/5 shadow-xs hover:bg-white dark:hover:bg-slate-900 hover:border-black/10 dark:hover:border-white/10'
                          }`}
                        >
                          {/* Connected timeline connector */}
                          <div className="absolute top-8 -left-[39px] w-[39px] h-[2px] bg-black/5 dark:bg-white/5 pointer-events-none"></div>
                          <div className={`absolute top-8 -left-[43px] w-2.5 h-2.5 rounded-full transform -translate-y-1/2 transition-all duration-300 ${!notif.read ? 'bg-[#1B1B1B] dark:bg-indigo-500 scale-125 shadow-[0_0_0_4px_rgba(99,102,241,0.15)]' : 'bg-slate-350 dark:bg-slate-700'}`}></div>

                          <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 shadow-2xs border border-black/5 dark:border-white/5 ${config.color} mt-0.5`}>
                            {config.icon}
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-center min-w-0 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2 relative w-full pr-1">
                              <h3 className={`text-[17px] font-bold truncate ${!notif.read ? 'text-[#1B1B1B] dark:text-white' : 'text-slate-700 dark:text-neutral-350'}`}>
                                {notif.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 md:mt-0 shrink-0">
                                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-neutral-500">
                                  <Clock size={12} /> {notif.time}
                                </span>
                                <button
                                  onClick={(e) => deleteNotification(notif.id, e)}
                                  className="p-1 text-slate-450 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                                  title="Eliminar notificación"
                                >
                                  <Trash2 size={14} />
                                </button>
                                <ChevronDown 
                                  size={16} 
                                  className={`text-slate-450 dark:text-slate-500 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
                                />
                              </div>
                            </div>
                                                      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-[22px] opacity-80'}`}>
                              {renderBodyWithLinks(notif.body, isExpanded, notif.read)}
                            </div>
                            
                            {isExpanded && (
                              <div className="flex flex-wrap items-center gap-3.5 mt-3.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                {config.actionLabel && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation(); // Avoid triggering card click
                                      markAsRead(notif.id);
                                      navigate(config.actionPath);
                                    }}
                                    className={`flex items-center gap-1 text-[12px] font-black w-max transition-colors cursor-pointer ${
                                      !notif.read ? 'text-[#1B1B1B] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-650 hover:text-[#1B1B1B] dark:hover:text-indigo-400'
                                    }`}
                                  >
                                    {config.actionLabel} <ArrowRight size={13} className="ml-1" />
                                  </button>
                                )}
                                
                                {notif.id === 'welcome' && (
                                  <a
                                    href="https://chat.whatsapp.com/CTxnZvEz6Qr2I2piuSNSDO"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[11px] md:text-[12px] font-bold text-white dark:text-white hover:text-white dark:hover:text-white transition-all px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 cursor-pointer border border-transparent"
                                  >
                                    <svg className="w-4 h-4 text-white fill-white shrink-0" viewBox="0 0 24 24">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    <span>Unirse a WhatsApp</span>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          {!notif.read && (
                            <div className="hidden md:block w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0 mt-3.5"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
