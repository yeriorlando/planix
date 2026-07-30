import React from 'react';
import { flushSync } from 'react-dom';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { requestD1 } from './lib/services/d1Client';
import { getCurrentUser } from './lib/storage';
import Mantenimiento from './pages/Mantenimiento';
import Sidebar from './components/Sidebar';
import WhatsAppSupportBubble from './components/planix/WhatsAppSupportBubble';
import Dashboard from './pages/Dashboard';
import Planificaciones from './pages/Planificaciones';
import Calendar from './pages/Calendar';
import Herramientas from './pages/Herramientas';
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
import AdminEfemerides from './pages/AdminEfemerides';
import Efemerides from './pages/Efemerides';
import Notifications from './pages/Notifications';
import DetallePlanificacion from './pages/DetallePlanificacion';
import DetalleClase from './pages/DetalleClase';
import Planificador from './pages/Planificador';
import PlanixChat from './pages/PlanixChat';
import Talleres from './pages/Talleres';
import CrearTaller from './pages/CrearTaller';
import DetalleTaller from './pages/DetalleTaller';
import ClaseTaller from './pages/ClaseTaller';
import { 
  Loader2, BookOpen, School, PenTool, Languages, Lightbulb, Target, 
  FlaskConical, Palette, Library, BookMarked, Brain, GraduationCap, 
  Atom, Scroll, Shapes, Globe, Compass, Notebook, Award, Calculator, Music 
} from 'lucide-react';

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
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
import PoliticaIA from './pages/PoliticaIA';
import SobrePlanix from './pages/SobrePlanix';
import Caracteristicas from './pages/Caracteristicas';
import CompletarPerfil from './pages/CompletarPerfil';
import CorreoVerificado from './pages/CorreoVerificado';
import CuentaSuspendida from './pages/CuentaSuspendida';
import AuthCallback from './pages/AuthCallback';
import CoordinatorDashboard from './pages/CoordinatorDashboard';

import VistaPreviaPlanificacion from './pages/VistaPreviaPlanificacion';
import VistaPreviaCoordinador from './pages/VistaPreviaCoordinador';
import GeneradorExamenes from './pages/GeneradorExamenes';
import SopaDeLetras from './pages/SopaDeLetras';
import Crucigrama from './pages/Crucigrama';
import Dinamicas from './pages/Dinamicas';
import BajoLaLluvia from './pages/BajoLaLluvia';
import Ruleta from './pages/Ruleta';
import Jeopardy from './pages/Jeopardy';
import Mentira from './pages/Mentira';
import RimandoAndo from './pages/RimandoAndo';
import Profesor from './pages/Profesor';
import RetoMatematico from './pages/RetoMatematico';
import MapaDominicano from './pages/MapaDominicano';
import SubastaConocimiento from './pages/SubastaConocimiento';
import DetectiveMapa from './pages/DetectiveMapa';
import Impostor from './pages/Impostor';
import BombaTiempo from './pages/BombaTiempo';
import BatallaNaval from './pages/BatallaNaval';
import GeneradorDiplomas from './pages/GeneradorDiplomas';
import GeneradorGrupos from './pages/GeneradorGrupos';
import RecorridosDocentes from './pages/RecorridosDocentes';
import ApoyoAdicional from './pages/ApoyoAdicional';
import SituacionesAprendizaje from './pages/SituacionesAprendizaje';

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

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

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
    <div className="min-h-screen w-full bg-bg-base flex font-sans text-text-main relative selection:bg-black/10 items-stretch print:p-0 print:bg-white overflow-x-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-card-pink/10 dark:bg-card-pink/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-card-green/10 dark:bg-card-green/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Academic Icons Background */}
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.02] pointer-events-none z-0">
        {/* Left Side */}
        <BookOpen className="absolute top-8 left-6 text-neutral-900 dark:text-white" size={75} style={{ transform: "rotate(-12deg)" }} />
        <School className="absolute top-12 left-[22%] text-neutral-900 dark:text-white" size={65} style={{ transform: "rotate(-8deg)" }} />
        <PenTool className="absolute top-[30%] left-[28%] text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(15deg)" }} />
        <Languages className="absolute top-[26%] left-16 text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(15deg)" }} />
        <Lightbulb className="absolute top-[48%] left-6 text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(25deg)" }} />
        <Target className="absolute top-[56%] left-[24%] text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(-10deg)" }} />
        <FlaskConical className="absolute bottom-[24%] left-24 text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(-20deg)" }} />
        <Palette className="absolute bottom-32 left-[14%] text-neutral-900 dark:text-white" size={70} style={{ transform: "rotate(-15deg)" }} />
        <Library className="absolute bottom-10 left-8 text-neutral-900 dark:text-white" size={80} style={{ transform: "rotate(10deg)" }} />
        <BookMarked className="absolute bottom-[5%] left-[26%] text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(12deg)" }} />

        {/* Center Bottom */}
        <Brain className="absolute bottom-[6%] left-[48%] text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(-5deg)" }} />

        {/* Right Side */}
        <GraduationCap className="absolute top-8 right-6 text-neutral-900 dark:text-white" size={85} style={{ transform: "rotate(15deg)" }} />
        <Atom className="absolute top-12 right-[22%] text-neutral-900 dark:text-white" size={75} style={{ transform: "rotate(-5deg)" }} />
        <Scroll className="absolute top-[30%] right-[28%] text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(-15deg)" }} />
        <Shapes className="absolute top-[26%] right-16 text-neutral-900 dark:text-white" size={65} style={{ transform: "rotate(-10deg)" }} />
        <Globe className="absolute top-[48%] right-6 text-neutral-900 dark:text-white" size={70} style={{ transform: "rotate(-15deg)" }} />
        <Compass className="absolute top-[56%] right-[24%] text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(12deg)" }} />
        <Notebook className="absolute bottom-[24%] right-24 text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(18deg)" }} />
        <Award className="absolute bottom-32 right-[14%] text-neutral-900 dark:text-white" size={75} style={{ transform: "rotate(-20deg)" }} />
        <Calculator className="absolute bottom-10 right-8 text-neutral-900 dark:text-white" size={70} style={{ transform: "rotate(12deg)" }} />
        <Music className="absolute bottom-[5%] right-[26%] text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(-8deg)" }} />
      </div>

      <div className="w-full flex flex-col xl:flex-row print:block relative z-10">
        <Sidebar className="" isPinned={isSidebarPinned} togglePin={toggleSidebarPin} onHoverChange={setIsSidebarHovered} />
        <main className={`flex-1 min-w-0 p-4 xl:p-8 bg-bg-base relative transition-all duration-150 ease-out ${
          isSidebarExpanded ? 'xl:ml-[230px]' : 'xl:ml-[102px]'
        }`}>
          <Outlet context={{ isSidebarPinned: isSidebarExpanded, toggleSidebarPin, theme, toggleTheme }} />
        </main>
      </div>
      <WhatsAppSupportBubble />
    </div>
  );
}

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [active, setActive] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const location = useLocation();

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const bypassParam = searchParams.get('bypass');
    if (bypassParam && bypassParam.toLowerCase() === 'planixadmin') {
      localStorage.setItem('plx:maintenance_bypass', 'true');
    }

    const checkMaintenance = async () => {
      const isMaintPage = location.pathname === '/mantenimiento';
      const hasBypass = localStorage.getItem('plx:maintenance_bypass') === 'true';
      const currentUser = getCurrentUser();
      const isAdmin = currentUser?.rol === 'admin';

      if (isMaintPage || hasBypass || isAdmin) {
        setLoading(false);
        return;
      }

      try {
        const config = await requestD1<{ key: string; value: { active: boolean } }>('/api/site-configs/maintenance_mode');
        if (config && config.value && config.value.active) {
          setActive(true);
        } else {
          setActive(false);
        }
      } catch (err) {
        console.warn('Error checking maintenance mode:', err);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
  }, [location.pathname, location.search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-slate-800 dark:text-white animate-spin" />
          <p className="text-sm font-semibold text-slate-800 dark:text-white">Conectando con el servidor...</p>
        </div>
      </div>
    );
  }

  if (active && location.pathname !== '/mantenimiento') {
    return <Navigate to="/mantenimiento" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-center" richColors />
      <MaintenanceGuard>
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
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/politica-ia" element={<PoliticaIA />} />
        <Route path="/sobre-planix" element={<SobrePlanix />} />
        <Route path="/caracteristicas" element={<Caracteristicas />} />
        <Route path="/completar-perfil" element={<CompletarPerfil />} />
        <Route path="/correo-verificado" element={<CorreoVerificado />} />
        <Route path="/cuenta-suspendida" element={<CuentaSuspendida />} />

        {/* Subscription Pages */}
        <Route path="/suscripcion" element={<Navigate to="/perfil" replace />} />
        <Route path="/suscripcion/pago" element={<Navigate to="/perfil" replace />} />
        <Route path="/suscripcion/exito" element={<SuscripcionExito />} />
        <Route path="/mantenimiento" element={<Mantenimiento />} />

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        <Route path="/admin/configuracion-ia" element={<Admin />} />
        <Route path="/admin/curriculum" element={<AdminCurriculum />} />
        <Route path="/admin/creditos" element={<AdminCreditos />} />
        <Route path="/admin/online" element={<AdminOnline />} />
        <Route path="/admin/efemerides" element={<AdminEfemerides />} />
        <Route path="/planificacion/preview" element={<VistaPreviaPlanificacion />} />
        <Route path="/coordinador/planificacion/preview" element={<VistaPreviaCoordinador />} />
        <Route path="/planificaciones/nueva" element={<Planificador />} />
        <Route path="/planificaciones/nuevo" element={<Planificador />} />

        {/* Módulo de Talleres — Vista de pantalla completa */}
        <Route path="/talleres/nuevo" element={<CrearTaller />} />
        <Route path="/talleres/:tallerId" element={<DetalleTaller />} />
        <Route path="/talleres/:tallerId/clase" element={<ClaseTaller />} />
        <Route path="/talleres/:tallerId/clase/:claseId" element={<ClaseTaller />} />

        {/* Guarded application routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coordinador/dashboard" element={<CoordinatorDashboard />} />
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
          <Route path="/herramientas" element={<Herramientas />} />
          <Route path="/herramientas/generador-examenes" element={<GeneradorExamenes />} />
          <Route path="/herramientas/sopa-de-letras" element={<SopaDeLetras />} />
          <Route path="/herramientas/crucigrama" element={<Crucigrama />} />
          <Route path="/herramientas/ruleta" element={<Ruleta />} />
          <Route path="/herramientas/generador-diplomas" element={<GeneradorDiplomas />} />
          <Route path="/herramientas/generador-grupos" element={<GeneradorGrupos />} />
          <Route path="/herramientas/recorridos-docentes" element={<RecorridosDocentes />} />
          <Route path="/herramientas/apoyo-adicional" element={<ApoyoAdicional />} />
          <Route path="/herramientas/situaciones-aprendizaje" element={<SituacionesAprendizaje />} />
          <Route path="/dinamicas" element={<Dinamicas />} />
          <Route path="/dinamicas/bajo-la-lluvia" element={<BajoLaLluvia />} />
          <Route path="/dinamicas/jeopardy" element={<Jeopardy />} />
          <Route path="/dinamicas/mentira" element={<Mentira />} />
          <Route path="/dinamicas/rimando-ando" element={<RimandoAndo />} />
          <Route path="/dinamicas/profesor" element={<Profesor />} />
          <Route path="/dinamicas/reto-matematico" element={<RetoMatematico />} />
          <Route path="/dinamicas/mapa-dominicano" element={<MapaDominicano />} />
          <Route path="/dinamicas/subasta-conocimiento" element={<SubastaConocimiento />} />
          <Route path="/dinamicas/detective-mapa" element={<DetectiveMapa />} />
          <Route path="/dinamicas/impostor" element={<Impostor />} />
          <Route path="/dinamicas/bomba-tiempo" element={<BombaTiempo />} />
          <Route path="/dinamicas/batalla-naval" element={<BatallaNaval />} />
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
          
          {/* Módulo de Talleres */}
          <Route path="/talleres" element={<Talleres />} />
        </Route>
      </Routes>
      </MaintenanceGuard>
    </BrowserRouter>
  );
}
