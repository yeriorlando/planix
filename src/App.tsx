import React from 'react';
import { flushSync } from 'react-dom';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { requestD1 } from './lib/services/d1Client';
import Sidebar from './components/Sidebar';
import WhatsAppSupportBubble from './components/planix/WhatsAppSupportBubble';
import Dashboard from './pages/Dashboard';
import Planificaciones from './pages/Planificaciones';
import Calendar from './pages/Calendar';
import Explore from './pages/Explore';
import Recursos from './pages/Recursos';
import Comunidad from './pages/Comunidad';
import Perfil from './pages/Perfil';
import Referidos from './pages/Referidos';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminCurriculum from './pages/AdminCurriculum';
import AdminCreditos from './pages/AdminCreditos';
import AdminOnline from './pages/AdminOnline';
import Efemerides from './pages/Efemerides';
import Notifications from './pages/Notifications';
import DetallePlanificacion from './pages/DetallePlanificacion';
import DetalleClase from './pages/DetalleClase';
import Planificador from './pages/Planificador';
import PlanixChat from './pages/PlanixChat';
import { Loader2 } from 'lucide-react';

// Ported Educational Pages
import Login from './pages/Login';
import Suscripcion from './pages/Suscripcion';
import PagoSuscripcion from './pages/PagoSuscripcion';
import SuscripcionExito from './pages/SuscripcionExito';
import Registro from './pages/Registro';
import RecuperarContrasena from './pages/RecuperarContrasena';
import ActualizarContrasena from './pages/ActualizarContrasena';
import Estudiantes from './pages/Estudiantes';
import Asistencia from './pages/Asistencia';
import RegistroCalificaciones from './pages/RegistroCalificaciones';
import LandingPage from './pages/LandingPage';
import AvisoLegal from './pages/AvisoLegal';
import Caracteristicas from './pages/Caracteristicas';
import CompletarPerfil from './pages/CompletarPerfil';
import CorreoVerificado from './pages/CorreoVerificado';
import CuentaSuspendida from './pages/CuentaSuspendida';
import AuthCallback from './pages/AuthCallback';

import VistaPreviaPlanificacion from './pages/VistaPreviaPlanificacion';
import GeneradorExamenes from './pages/GeneradorExamenes';

// Modular Student Sub-Pages
import GestionMatricula from './pages/estudiantes/GestionMatricula';
import Anecdotario from './pages/estudiantes/Anecdotario';
import Incidencias from './pages/estudiantes/Incidencias';
import ClaseEnVivo from './pages/estudiantes/ClaseEnVivo';
import PerfilEstudiante from './pages/estudiantes/PerfilEstudiante';
import InstrumentosEvaluacion from './pages/estudiantes/InstrumentosEvaluacion';

// Session guard
import { useRequireAuth } from './lib/useRequireAuth';

import { toast, Toaster } from 'sonner';

function Layout() {
  // Guard this route layout and all children
  const user = useRequireAuth();

  React.useEffect(() => {
    if (!user) return;
    async function syncCreditCosts() {
      try {
        const config = await requestD1<{ key: string; value: any }>('/api/site-configs/credit_costs');
        if (config && config.value) {
          localStorage.setItem('plx:credit_costs', JSON.stringify(config.value));
          window.dispatchEvent(new Event('plx:credit_costs_changed'));
        }
      } catch (err) {
        console.warn('Error syncing credit costs from D1:', err);
      }
    }
    async function syncActiveSchoolYear() {
      try {
        const config = await requestD1<{ key: string; value: any }>('/api/site-configs/active_school_year');
        if (config && config.value) {
          localStorage.setItem('plx:active_school_year', config.value);
          window.dispatchEvent(new Event('plx:active_school_year_changed'));
        }
      } catch (err) {
        console.warn('Error syncing active school year from D1:', err);
      }
    }
    syncCreditCosts();
    syncActiveSchoolYear();
  }, [user?.id]);
  
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [isSidebarPinned, setIsSidebarPinned] = React.useState(true);

  const [isSidebarHovered, setIsSidebarHovered] = React.useState(false);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (e?: React.MouseEvent) => {
    const newTheme = theme === 'light' ? 'dark' : 'light';

    // If startViewTransition is not supported, just setTheme
    if (!(document as any).startViewTransition) {
      setTheme(newTheme);
      return;
    }

    // Capture coordinates from the click event or fallback to screen center
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Set CSS custom properties on documentElement for the reveal animation
    document.documentElement.style.setProperty("--x", `${x}px`);
    document.documentElement.style.setProperty("--y", `${y}px`);
    document.documentElement.style.setProperty("--r", `${endRadius}px`);

    // Disable CSS transitions during the view transition to prevent lag/half-transitioned captures
    document.documentElement.classList.add("no-transitions");

    const transition = (document as any).startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
        // Force synchronous theme toggle on root element for view transition screenshot
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
          document.documentElement.style.colorScheme = "dark";
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.style.colorScheme = "light";
        }
      });
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove("no-transitions");
    });
  };

  const toggleSidebarPin = () => {
    const newVal = !isSidebarPinned;
    setIsSidebarPinned(newVal);
    localStorage.setItem('sidebar_pinned', JSON.stringify(newVal));
    if (newVal) {
      toast.success("Barra lateral expandida");
    } else {
      toast.info("Barra lateral contraída");
    }
  };

  const isSidebarExpanded = isSidebarPinned || isSidebarHovered;

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-slate-800 dark:text-white animate-spin" />
          <p className="text-sm font-semibold text-slate-800 dark:text-white">Cargando sesión docente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex font-sans text-text-main w-full relative selection:bg-black/10 items-start pt-4 pb-[90px] xl:pb-4 xl:py-4 px-4 xl:pr-4">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col xl:flex-row xl:items-start gap-6 xl:gap-0">
        <Sidebar className="" isPinned={isSidebarPinned} togglePin={toggleSidebarPin} onHoverChange={setIsSidebarHovered} />
        <Outlet context={{ isSidebarPinned: isSidebarExpanded, toggleSidebarPin, theme, toggleTheme }} />
      </div>
      <WhatsAppSupportBubble />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public login/register endpoints */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/actualizar-contrasena" element={<ActualizarContrasena />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Public Pages */}
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/caracteristicas" element={<Caracteristicas />} />
        <Route path="/completar-perfil" element={<CompletarPerfil />} />
        <Route path="/correo-verificado" element={<CorreoVerificado />} />
        <Route path="/cuenta-suspendida" element={<CuentaSuspendida />} />

        {/* Subscription Pages */}
        <Route path="/suscripcion" element={<Navigate to="/perfil" replace />} />
        <Route path="/suscripcion/pago" element={<Navigate to="/perfil" replace />} />
        <Route path="/suscripcion/exito" element={<SuscripcionExito />} />

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/configuracion-ia" element={<Admin />} />
        <Route path="/admin/curriculum" element={<AdminCurriculum />} />
        <Route path="/admin/creditos" element={<AdminCreditos />} />
        <Route path="/admin/online" element={<AdminOnline />} />
        <Route path="/planificacion/preview" element={<VistaPreviaPlanificacion />} />
        <Route path="/planificaciones/nueva" element={<Planificador />} />
        <Route path="/planificaciones/nuevo" element={<Planificador />} />

        {/* Guarded application routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/aula-virtual" element={<Estudiantes />} />
          <Route path="/aula-virtual/matricula/:classId" element={<GestionMatricula />} />
          <Route path="/aula-virtual/anecdotario/:classId" element={<Anecdotario />} />
          <Route path="/aula-virtual/incidencias/:classId" element={<Incidencias />} />
          <Route path="/aula-virtual/clase-en-vivo/:classId" element={<ClaseEnVivo />} />
          <Route path="/aula-virtual/perfil/:studentId" element={<PerfilEstudiante />} />
          <Route path="/aula-virtual/asistencia" element={<Asistencia />} />
          <Route path="/aula-virtual/asistencia/:classId" element={<Asistencia />} />
          <Route path="/aula-virtual/registro-calificaciones" element={<RegistroCalificaciones />} />
          <Route path="/aula-virtual/registro-calificaciones/:classId" element={<RegistroCalificaciones />} />
          <Route path="/aula-virtual/instrumentos/:classId" element={<InstrumentosEvaluacion />} />
          
          {/* Main existing system pages */}
          <Route path="/planificaciones" element={<Planificaciones />} />
          <Route path="/calendario" element={<Calendar />} />
          <Route path="/herramientas" element={<Explore />} />
          <Route path="/herramientas/generador-examenes" element={<GeneradorExamenes />} />
          <Route path="/recursos" element={<Recursos />} />
          <Route path="/comunidad" element={<Comunidad />} />
          <Route path="/chat" element={<PlanixChat />} />
          <Route path="/efemerides" element={<Efemerides />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/notificaciones" element={<Notifications />} />
          <Route path="/configuracion" element={<Navigate to="/perfil" replace />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/referidos" element={<Referidos />} />
          <Route path="/planificacion/:id" element={<DetallePlanificacion />} />
          <Route path="/planificacion/:id/clase/:lessonId" element={<DetalleClase />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
