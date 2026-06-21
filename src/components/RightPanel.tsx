import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell, Settings, ChevronRight, Clock, Award, GraduationCap,
  Users, Calendar as CalendarIcon, UserCheck, AlertTriangle, ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, getClassrooms, getStudents } from '../lib/storage';

// Ephemeris bank mapped by month (0-indexed)
const DOMINICAN_EPHEMERIS = [
  { day: 26, month: 0, title: "Natalicio de Juan Pablo Duarte 🇩🇴", desc: "Se conmemora el nacimiento del Padre de la Patria, líder del movimiento independentista La Trinitaria." },
  { day: 27, month: 1, title: "Día de la Independencia Nacional 🇩🇴", desc: "¡Día de Fiesta Patria! Se conmemora la proclamación de la República Dominicana en la Puerta del Conde en 1844." },
  { day: 9, month: 2, title: "Natalicio de Francisco del Rosario Sánchez 🇩🇴", desc: "Conmemoración del nacimiento del prócer y defensor de la patria dominicana." },
  { day: 13, month: 3, title: "Día de la ADP 🇩🇴", desc: "Día de la Asociación Dominicana de Profesores, celebrando la labor sindical docente." },
  { day: 15, month: 4, title: "Día del Agricultor Dominicano 🇩🇴", desc: "Reconocimiento a quienes labran la tierra y garantizan la soberanía alimentaria." },
  { day: 30, month: 5, title: "Día del Maestro Dominicano 🎓", desc: "¡Felicidades Docente! Se rinde homenaje a todos los maestros y formadores de la patria." },
  { day: 16, month: 7, title: "Día de la Restauración de la República 🇩🇴", desc: "Aniversario del Grito de Capotillo de 1863, gesta heroica por restaurar la soberanía." },
  { day: 8, month: 8, title: "Día de la Alfabetización Dominicana 📚", desc: "Reconocimiento a los programas nacionales para erradicar el analfabetismo." },
  { day: 13, month: 9, title: "Día del Poeta Dominicano ✍️", desc: "Homenaje al natalicio de Salomé Ureña de Henríquez, insigne educadora y escritora." },
  { day: 6, month: 10, title: "Día de la Constitución Dominicana 🇩🇴", desc: "Se conmemora la firma de la primera Constitución en la ciudad de San Cristóbal en 1844." },
  { day: 25, month: 10, title: "Día de la No Violencia contra la Mujer 🇩🇴", desc: "Homenaje a las Hermanas Mirabal, heroínas de la lucha contra la tiranía trujillista." },
  { day: 10, month: 11, title: "Día de los Derechos Humanos 🌍", desc: "Promoción y defensa de la dignidad intrínseca de todas las personas." }
];

export default function RightPanel({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const handleUserChanged = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener("plx:user_changed", handleUserChanged);
    return () => {
      window.removeEventListener("plx:user_changed", handleUserChanged);
    };
  }, []);

  // Clock ticks
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString("es-DO", { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch count statistics
  useEffect(() => {
    if (user) {
      const cls = getClassrooms(user.id);
      setClassrooms(cls);

      let allStds: any[] = [];
      cls.forEach(c => {
        allStds = [...allStds, ...getStudents(c.id)];
      });
      setStudentsList(allStds);
    }
  }, [user]);

  // Determine current Dominican Ephemeris based on today's date
  const todayEphemeris = useMemo(() => {
    const today = new Date();
    const month = today.getMonth();
    const date = today.getDate();

    // Check exact date match
    const exact = DOMINICAN_EPHEMERIS.find(e => e.month === month && e.day === date);
    if (exact) return exact;

    // Or find the next upcoming event in this month
    const monthEvents = DOMINICAN_EPHEMERIS.filter(e => e.month === month);
    if (monthEvents.length > 0) {
      const sorted = [...monthEvents].sort((a, b) => a.day - b.day);
      const next = sorted.find(e => e.day >= date);
      if (next) return next;
      return sorted[0];
    }

    // Otherwise return default
    return {
      day: today.getDate(),
      month: today.getMonth(),
      title: "Planificación Docente Activa 📚",
      desc: "Revisa tus secuencias didácticas y prepara las competencias fundamentales del día."
    };
  }, []);

  // Mock activity feed logs
  const activityLogs = useMemo(() => {
    return [
      { id: 1, action: "Pase de lista diario registrado", time: "Hace 15 min", type: "check" },
      { id: 2, action: "Registro anecdótico redactado con IA", time: "Hace 1 hora", type: "ai" },
      { id: 3, action: "Aula 4to de Primaria creada", time: "Hace 2 horas", type: "class" },
    ];
  }, []);

  return (
    <aside className={`flex flex-col bg-bg-panel xl:rounded-[36px] p-[30px] lg:p-[40px] relative overflow-y-auto scrollbar-hide xl:sticky xl:top-4 xl:h-[calc(100vh-32px)] ${className}`}>

      {/* Top Header Row with Time & Notifications */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 font-mono text-[13px] font-bold text-text-main">
          <Clock size={15} />
          <span>{timeStr || "08:00 AM"}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/notificaciones")}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-black/5 border border-black/5 shadow-sm transition-colors cursor-pointer"
          >
            <Bell size={18} strokeWidth={1.8} className="text-[#1B1B1B]" />
          </button>
          <button
            onClick={() => navigate("/configuracion")}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-black/5 border border-black/5 shadow-sm transition-colors cursor-pointer"
          >
            <Settings size={18} strokeWidth={1.8} className="text-[#1B1B1B]" />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-[3px] border-bg-base shadow-sm relative shrink-0 mb-4">
          <img src={user?.avatar_url || "https://randomuser.me/api/portraits/women/47.jpg"} className="w-full h-full object-cover" />
          <div className="absolute inset-0 rounded-full border border-black/5 pointer-events-none"></div>
        </div>
        <h2 className="text-[20px] font-bold text-[#1B1B1B]">{user?.nombre}</h2>
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted mt-1.5">
          {user?.rol === "admin" 
            ? "Administrador" 
            : user?.rol === "coordinator" 
            ? "Coordinador" 
            : user?.rol === "director" 
            ? "Director" 
            : "Docente"}
        </span>
      </div>

      {/* Dominican Ephemeris Widget */}
      <div className="bg-white rounded-[28px] p-6 mb-8 border border-black/5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider bg-card-pink text-pink-900 px-3 py-1 rounded-full">
            Efemérides Patrias
          </span>
          <CalendarIcon size={16} className="text-text-muted" />
        </div>
        <h4 className="font-bold text-[14px] text-text-main leading-tight mb-2">
          {todayEphemeris.title}
        </h4>
        <p className="text-[12px] text-text-muted leading-relaxed font-medium">
          {todayEphemeris.desc}
        </p>
      </div>

      {/* Teacher Workspace Status */}
      <div className="bg-white rounded-[28px] p-6 mb-8 border border-black/5 shadow-sm">
        <h3 className="font-bold text-[#1B1B1B] text-[13px] uppercase tracking-wider mb-4">Métricas del Aula</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col bg-bg-base/30 rounded-xl p-3 border border-black/5">
            <GraduationCap size={18} className="text-purple-700" />
            <span className="text-[22px] font-black text-text-main mt-2">{classrooms.length}</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Secciones</span>
          </div>

          <div className="flex flex-col bg-bg-base/30 rounded-xl p-3 border border-black/5">
            <Users size={18} className="text-emerald-700" />
            <span className="text-[22px] font-black text-text-main mt-2">{studentsList.length}</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Estudiantes</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div>
        <h3 className="font-bold text-[#1B1B1B] text-[13px] uppercase tracking-wider mb-4">Historial de Eventos</h3>
        <div className="flex flex-col gap-3.5">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3.5">
              <div className="w-2.5 h-2.5 rounded-full bg-black/60 shrink-0 mt-1.5" />
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-text-main leading-relaxed">{log.action}</span>
                <span className="text-[10px] text-text-muted font-medium mt-0.5">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
