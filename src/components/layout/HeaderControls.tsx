import React from 'react';
import { 
  Search, 
  HelpCircle, 
  Bell, 
  ChevronDown, 
  User, 
  UserCheck, 
  LogOut, 
  Sparkles, 
  Users, 
  BookOpen, 
  Sun, 
  Moon, 
  Crown, 
  Trash2, 
  Eye, 
  X, 
  Smile, 
  GraduationCap,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserCredits } from '../../lib/credits';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface HeaderControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchPlaceholder?: string;
  activeLevel?: string;
  theme?: 'light' | 'dark';
  toggleTheme?: (e?: React.MouseEvent) => void;
  unreadCount?: number;
  notifications?: NotificationItem[];
  showNotificationDropdown?: boolean;
  setShowNotificationDropdown?: (show: boolean) => void;
  clearAllNotifications?: () => void;
  markAsRead?: (id: string) => void;
  deleteNotification?: (id: string, e: React.MouseEvent) => void;
  user: any;
  showProfileDropdown: boolean;
  setShowProfileDropdown: (show: boolean) => void;
  handleLogout: () => void;
  onOpenHelp?: () => void;
  onOpenProCelebration?: () => void;
}

export function HeaderControls({
  searchQuery,
  setSearchQuery,
  searchPlaceholder = "Buscar herramientas, recursos, alumnos...",
  activeLevel,
  theme = 'light',
  toggleTheme,
  unreadCount = 0,
  notifications = [],
  showNotificationDropdown = false,
  setShowNotificationDropdown,
  clearAllNotifications,
  markAsRead,
  deleteNotification,
  user,
  showProfileDropdown,
  setShowProfileDropdown,
  handleLogout,
  onOpenHelp,
  onOpenProCelebration
}: HeaderControlsProps) {
  const navigate = useNavigate();

  const roleText = user?.is_ambassador
    ? "EMBAJADOR"
    : user?.rol === "admin" || user?.rol === "administrador"
      ? "ADMINISTRADOR"
      : user?.rol === "coordinator"
        ? "COORDINADOR"
        : user?.suscripcion === "pro"
          ? "PLANIX PRO"
          : "DOCENTE";

  return (
    <header className="relative w-full z-45 flex items-center justify-between gap-3.5 sm:gap-5 -mt-2 pb-5 select-none">
      {/* Search bar styled like Dashboard project */}
      <div className="relative flex-1 max-w-xs md:max-w-lg group">
        <Search className="w-[18px] h-[18px] text-[#A0A0A8] dark:text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-1.5 hover:border-slate-200 dark:hover:border-white/20 transition-colors bg-white dark:bg-slate-900 border border-transparent dark:border-white/10 rounded-full text-[14px] font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-0 placeholder:text-[#A0A0A8] shadow-sm h-[40px]"
        />
      </div>

      {/* Level Selector (if activeLevel provided) & Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {activeLevel && (
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest">Nivel:</span>
            <div className="px-4 py-2 rounded-full border border-black/5 dark:border-white/10 bg-white dark:bg-slate-900 text-sm font-black text-slate-800 dark:text-slate-200 shadow-xs flex items-center gap-2">
              {activeLevel === "inicial" ? (
                <>
                  <Smile size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Inicial</span>
                </>
              ) : activeLevel === "secundario" ? (
                <>
                  <GraduationCap size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Secundario</span>
                </>
              ) : (
                <>
                  <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Primario</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Circular Action Buttons (Help, Notifications, Theme Toggle) */}
        <div className="flex items-center gap-2.5">
          {/* Help Button */}
          <button
            onClick={() => {
              if (onOpenHelp) {
                onOpenHelp();
              } else {
                navigate("/herramientas");
              }
            }}
            className="w-[44px] h-[44px] rounded-full border border-transparent dark:border-white/10 bg-white dark:bg-slate-900 flex items-center justify-center text-[#A0A0A8] hover:text-slate-800 dark:hover:text-white transition-colors shadow-sm cursor-pointer"
            title="Ayuda y Guías"
          >
            <HelpCircle className="w-[20px] h-[20px]" />
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown?.(!showNotificationDropdown)}
              className="w-[44px] h-[44px] rounded-full border border-transparent dark:border-white/10 bg-white dark:bg-slate-900 flex items-center justify-center text-[#A0A0A8] hover:text-slate-800 dark:hover:text-white transition-colors shadow-sm cursor-pointer relative"
              title="Notificaciones"
            >
              <Bell className="w-[20px] h-[20px]" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {showNotificationDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotificationDropdown?.(false)} />
                <div className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Notificaciones</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-0.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Limpiar todas"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded-full normal-case tracking-normal">{unreadCount} {unreadCount === 1 ? 'Nueva' : 'Nuevas'}</span>
                    )}
                  </h3>

                  {notifications.length === 0 ? (
                    <div className="text-center py-6">
                      <Bell size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">No hay notificaciones</p>
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-hide">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markAsRead?.(notif.id);
                            setShowNotificationDropdown?.(false);
                            navigate(`/notificaciones?expanded=${notif.id}`);
                          }}
                          className={`flex gap-2.5 p-2 rounded-xl transition-colors cursor-pointer relative group/notif ${notif.read ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-indigo-950/30'}`}
                        >
                          {!notif.read && (
                            <span className="absolute top-4 left-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          )}
                          <div className="flex-1 min-w-0 pl-2 pr-6">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-xs font-black truncate ${notif.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white'}`}>{notif.title}</span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 font-medium leading-relaxed">
                              {notif.body}
                            </p>
                          </div>
                          {deleteNotification && (
                            <button
                              onClick={(e) => deleteNotification(notif.id, e)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/notif:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all z-10"
                              title="Eliminar notificación"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="h-px bg-slate-100 dark:bg-white/5 my-2.5" />

                  <button
                    onClick={() => {
                      setShowNotificationDropdown?.(false);
                      navigate("/notificaciones");
                    }}
                    className="w-full py-2 bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-950/30 text-xs font-black text-blue-600 dark:text-blue-400 rounded-xl transition-all border border-blue-100/40 dark:border-blue-900/30 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Eye size={13} className="text-blue-500 dark:text-blue-400" />
                    <span>Ver todas las notificaciones</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle Button */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="w-[44px] h-[44px] rounded-full border border-transparent dark:border-white/10 bg-white dark:bg-slate-900 flex items-center justify-center text-[#A0A0A8] hover:text-slate-800 dark:hover:text-white transition-colors shadow-sm cursor-pointer"
              title={theme === 'light' ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
            >
              {theme === 'light' ? (
                <Moon className="w-[20px] h-[20px] text-indigo-500 fill-indigo-500/20" />
              ) : (
                <Sun className="w-[20px] h-[20px] text-amber-500 fill-amber-500/20" />
              )}
            </button>
          )}
        </div>

        {/* Pro / Credits Badge */}
        <div className="hidden md:flex items-center select-none ml-1">
          {user?.suscripcion === "pro" || user?.rol === "admin" ? (
            <div
              onClick={() => onOpenProCelebration?.()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/12 dark:from-amber-500/20 dark:to-amber-600/20 border border-amber-500/25 dark:border-amber-500/40 rounded-full shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all select-none"
              title="Planix Pro"
            >
              <Crown className="h-4 w-4 text-amber-600 dark:text-amber-450 fill-amber-500/20 stroke-[2.5]" />
              <span className="text-sm font-black text-amber-850 dark:text-amber-400 tracking-tight">
                Planix Pro
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <img
                src="/creditos.webp"
                alt="Créditos"
                className="w-8 h-8 object-contain shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-sm font-black text-slate-800 dark:text-zinc-200">
                {getUserCredits(user)} PC
              </span>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-7 bg-[#E5E5E5] dark:bg-slate-800 mx-1.5 hidden sm:block" />

        {/* User Profile Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-transparent dark:border-white/10 shadow-sm transition-all group hover:shadow-md cursor-pointer select-none"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 relative ${
              user?.is_ambassador || user?.suscripcion === "pro"
                ? "p-[1.5px] bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.35)]"
                : "border border-black/5 dark:border-white/10 bg-[#FAFAFA] dark:bg-slate-800"
            }`}>
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#FAFAFA] dark:bg-slate-800">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.nombre || "Usuario"}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-[#A0A0A8]" />
                )}
              </div>

              {/* Badge Icon on bottom-right of avatar circle */}
              {user?.is_ambassador ? (
                <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-white p-0.5 rounded-full border border-white dark:border-slate-900 shadow-xs flex items-center justify-center z-10" title="Embajador Planix">
                  <Star className="h-2.5 w-2.5 fill-white text-white" />
                </div>
              ) : user?.suscripcion === "pro" ? (
                <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-tr from-amber-400 to-amber-600 text-white p-0.5 rounded-full border border-white dark:border-slate-900 shadow-xs flex items-center justify-center z-10" title="Planix Pro">
                  <Crown className="h-2.5 w-2.5 fill-white text-white" />
                </div>
              ) : null}
            </div>

            <div className="flex flex-col text-left leading-tight pl-0.5">
              <span className="text-[14px] font-bold text-slate-800 dark:text-white truncate max-w-[130px] sm:max-w-[180px]">
                {user?.nombre || "Usuario"}
              </span>
              <span className={`text-[10px] font-extrabold tracking-wider uppercase ${
                user?.is_ambassador
                  ? "text-amber-600 dark:text-amber-400"
                  : user?.rol === "admin" || user?.rol === "administrador"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : user?.rol === "coordinator"
                      ? "text-purple-600 dark:text-purple-400"
                      : user?.suscripcion === "pro"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-400 dark:text-slate-500"
              }`}>
                {roleText}
              </span>
            </div>

            <ChevronDown className={`w-4.5 h-4.5 text-[#A0A0A8] ml-0.5 group-hover:text-slate-800 dark:group-hover:text-white transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* User Dropdown Menu Card */}
          {showProfileDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 p-2 z-50 text-xs font-medium space-y-1 animate-in fade-in zoom-in-95 text-left">
                {/* Profile Header */}
                <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {user?.nombre || "Usuario"}
                  </p>
                  <p className="text-slate-400 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1.5 mt-0.5">
                    {user?.is_ambassador && <Star size={11} className="text-amber-500 fill-amber-500 shrink-0" />}
                    {user?.suscripcion === "pro" && !user?.is_ambassador && <Crown size={11} className="text-amber-500 fill-amber-500 shrink-0" />}
                    <span>{roleText}</span>
                  </p>
                </div>

                {/* Menu items */}
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate("/perfil");
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#F5F6F8] dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>Mi Perfil</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    if (onOpenHelp) {
                      onOpenHelp();
                    } else {
                      navigate("/herramientas");
                    }
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#F5F6F8] dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>Guías y Recursos</span>
                </button>

                <a
                  href="https://chat.whatsapp.com/CTxnZvEz6Qr2I2piuSNSDO"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowProfileDropdown(false)}
                  className="w-full text-left px-3 py-2 hover:bg-[#F5F6F8] dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>Planix Comunidad</span>
                </a>

                {user?.rol === 'admin' && (
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate("/admin/dashboard");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#F5F6F8] dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-semibold transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>Panel Admin</span>
                  </button>
                )}

                {/* Logout Red Button */}
                <div className="border-t border-slate-100 dark:border-white/10 pt-1">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
