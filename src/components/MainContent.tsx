import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserCheck, MessageSquare, AlertTriangle, FileText, 
  Download, Sparkles, BookOpen, Compass, ChevronRight, HelpCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, getClassrooms, getStudents } from '../lib/storage';
import { toast, Toaster } from 'sonner';

// Sample Dominican classroom dynamics to simulate AI generator
const DYNAMICS_BANK = {
  integracion: [
    { title: "El Timón Escolar", desc: "El facilitador da órdenes de navegación (Estribor: todos a la derecha, Babor: izquierda, Tempestad: agruparse de a 3). Fomenta cohesión rápida y rompe el hielo." },
    { title: "Verdad o Mito Curricular", desc: "Los alumnos escriben dos hechos reales de la asignatura y uno ficticio. Los compañeros adivinan cuál es el falso, fomentando el repaso lúdico." },
  ],
  atencion: [
    { title: "El Silencio de la Clave", desc: "El docente aplaude un ritmo específico y los estudiantes deben repetirlo y quedar en absoluto silencio al terminar. Excelente para recuperar el foco." },
    { title: "Palabras Semáforo", desc: "Decir verde es continuar copiando, amarillo es levantar una mano, rojo es detener toda actividad y mirar a la pizarra. Agudiza la escucha activa." },
  ],
  pausa: [
    { title: "Estiramiento del Albatros", desc: "5 minutos de estiramientos de brazos emulando el vuelo de un ave, seguidos de 3 respiraciones profundas. Reduce la fatiga postural." },
    { title: "El Escribano Cruzado", desc: "Dibujar ochos acostados (infinitos) en el aire con la mano izquierda y luego la derecha, estimulando la conexión de ambos hemisferios." },
  ]
};

// Curriculum files compliant with MINERD framework
const CURRICULAR_RESOURCES = [
  { id: "rc_1", name: "Adecuación Curricular - Nivel Primario", type: "PDF Oficial MINERD", size: "3.2 MB" },
  { id: "rc_2", name: "Adecuación Curricular - Nivel Secundario", type: "PDF Oficial MINERD", size: "4.1 MB" },
  { id: "rc_3", name: "Plantilla de Planificación Diaria por Competencias", type: "Documento Word", size: "1.2 MB" },
  { id: "rc_4", name: "Guía de Evaluación Formativa y Rúbricas", type: "PDF Pedagógico", size: "2.5 MB" },
];

export default function MainContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState(0);

  // Dynamics generator states
  const [selectedCategory, setSelectedCategory] = useState<"integracion" | "atencion" | "pausa">("integracion");
  const [generatedDynamic, setGeneratedDynamic] = useState<any>(DYNAMICS_BANK.integracion[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const handleUserChanged = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener("plx:user_changed", handleUserChanged);
    return () => window.removeEventListener("plx:user_changed", handleUserChanged);
  }, []);

  useEffect(() => {
    if (user) {
      const cls = getClassrooms(user.id);
      setClassrooms(cls);
      
      let count = 0;
      cls.forEach(c => {
        count += getStudents(c.id).length;
      });
      setStudentCount(count);
    }
  }, [user]);

  const handleGenerateDynamic = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const list = DYNAMICS_BANK[selectedCategory];
      const randomIndex = Math.floor(Math.random() * list.length);
      setGeneratedDynamic(list[randomIndex]);
      setIsGenerating(false);
      toast.success("¡Nueva dinámica generada con éxito!");
    }, 800);
  };

  const handleDownloadResource = (resourceName: string) => {
    toast.success(`Descargando: ${resourceName}...`);
  };

  // Motivational quote based on day
  const dailyQuote = useMemo(() => {
    const quotes = [
      "“La educación es el vestido de gala para asistir a la fiesta de la vida.” — Miguel de Unamuno",
      "“El arte supremo del maestro consiste en despertar el goce de la expresión creativa y del conocimiento.” — Albert Einstein",
      "“Enseñar es aprender dos veces.” — Joseph Joubert",
      "“El objetivo de la educación es preparar a los jóvenes para educarse a sí mismos durante toda la vida.” — Robert M. Hutchins"
    ];
    const index = new Date().getDate() % quotes.length;
    return quotes[index];
  }, []);

  return (
    <main className="flex-1 flex flex-col pt-10 xl:pt-[54px] px-6 md:px-[60px] xl:px-16 w-full min-w-0 pb-12 overflow-x-hidden">
      <Toaster position="top-center" richColors />

      {/* Greeting Title */}
      <div className="mb-[40px]">
        <h1 className="text-[42px] md:text-[56px] xl:text-[64px] font-semibold tracking-tight leading-[1.1] text-[#1B1B1B]">
          ¡Hola, Prof. {user?.nombre.split(" ")[0]}!
        </h1>
        <p className="text-[14px] text-text-muted mt-2.5 max-w-[500px]">
          Te deseamos un excelente día de labor docente. Aquí tienes el control general de tu aula.
        </p>
      </div>

      {/* Welcome Message Card */}
      <div className="bg-[#E7E2DF] rounded-[36px] p-8 md:p-10 mb-10 border border-black/5 relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none opacity-40"></div>
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider text-text-main shadow-sm mb-6">
              🏫 {user?.colegio || "Centro Educativo Público"}
            </div>
            <h2 className="text-[#1B1B1B] text-[26px] md:text-[32px] font-semibold leading-[1.2] mb-4 max-w-[480px]">
              Planificación Docente Alineada a las Competencias MINERD
            </h2>
            <p className="text-[#1B1B1B]/70 text-[14px] leading-relaxed mb-6 max-w-[520px]">
              {dailyQuote}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div className="bg-white/80 border border-black/5 rounded-[16px] px-5 py-3 shadow-sm flex flex-col">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Aulas</span>
              <span className="text-[18px] font-black text-text-main mt-0.5">{classrooms.length} Activas</span>
            </div>
            <div className="bg-white/80 border border-black/5 rounded-[16px] px-5 py-3 shadow-sm flex flex-col">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Estudiantes</span>
              <span className="text-[18px] font-black text-text-main mt-0.5">{studentCount} Registrados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Shortcuts */}
      <h3 className="text-[#848484] text-[12px] font-bold pb-4 tracking-wider uppercase">Accesos Rápidos</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <button 
          onClick={() => {
            const savedClassId = localStorage.getItem('activeClassId');
            const targetId = (savedClassId && classrooms.some(c => c.id === savedClassId))
              ? savedClassId
              : (classrooms[0]?.id || '');
            navigate(`/aula-virtual/asistencia/${targetId}`);
          }}
          className="bg-white hover:bg-bg-panel border border-black/5 rounded-[28px] p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-card-green/45 flex items-center justify-center text-[#1B1B1B] group-hover:scale-110 transition-transform">
            <UserCheck size={20} />
          </div>
          <span className="text-[13px] font-bold text-text-main">Pase de Lista</span>
        </button>

        <button 
          onClick={() => navigate("/aula-virtual")}
          className="bg-white hover:bg-bg-panel border border-black/5 rounded-[28px] p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-card-purple/45 flex items-center justify-center text-[#1B1B1B] group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
          <span className="text-[13px] font-bold text-text-main">Nómina Alumnos</span>
        </button>

        <button 
          onClick={() => navigate("/aula-virtual")}
          className="bg-white hover:bg-bg-panel border border-black/5 rounded-[28px] p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-card-pink/45 flex items-center justify-center text-[#1B1B1B] group-hover:scale-110 transition-transform">
            <MessageSquare size={20} />
          </div>
          <span className="text-[13px] font-bold text-text-main">Anecdotario</span>
        </button>

        <button 
          onClick={() => navigate("/configuracion")}
          className="bg-white hover:bg-bg-panel border border-black/5 rounded-[28px] p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-card-yellow/45 flex items-center justify-center text-[#1B1B1B] group-hover:scale-110 transition-transform">
            <BookOpen size={20} />
          </div>
          <span className="text-[13px] font-bold text-text-main">Gestión Aulas</span>
        </button>
      </div>

      {/* Classroom Dynamics Generator */}
      <h3 className="text-[#848484] text-[12px] font-bold pb-4 tracking-wider uppercase">Dinámicas de Aula IA</h3>
      <div className="bg-white border border-black/5 rounded-[36px] p-8 shadow-sm mb-10 grid md:grid-cols-3 gap-8 items-start">
        
        {/* Settings Column */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div>
            <h4 className="font-bold text-[15px] text-text-main">Creador de Dinámicas</h4>
            <p className="text-[11px] text-text-muted mt-0.5">Establece foco o pausas activas con tus alumnos.</p>
          </div>

          <div className="flex flex-col gap-2">
            {(["integracion", "atencion", "pausa"] as const).map((cat) => {
              const labels = {
                integracion: "🤝 Integración / Grupal",
                atencion: "🎯 Foco y Atención",
                pausa: "🏃 Pausa Activa / Físico"
              };
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-4 py-3 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[#1B1B1B] border-[#1B1B1B] text-white" 
                      : "bg-white border-black/5 text-text-muted hover:border-black/15"
                  }`}
                >
                  {labels[cat]}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleGenerateDynamic}
            disabled={isGenerating}
            className="w-full bg-[#1B1B1B] hover:bg-black text-white py-3 rounded-full text-[12px] font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
          >
            <Sparkles size={14} className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Generando..." : "Generar Dinámica"}
          </button>
        </div>

        {/* Output Column */}
        <div className="md:col-span-2 bg-bg-base/30 border border-black/5 rounded-[28px] p-6 min-h-[180px] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} /> Sugerencia Pedagógica
            </span>
            <h4 className="font-bold text-[16px] text-text-main mt-2">{generatedDynamic.title}</h4>
            <p className="text-[13px] text-text-muted leading-relaxed mt-2.5 font-medium">
              {generatedDynamic.desc}
            </p>
          </div>
          <div className="border-t border-black/5 mt-4 pt-3 flex justify-between items-center text-[10px] text-text-muted font-bold">
            <span>⏱️ Duración: 5 - 10 min</span>
            <span>💡 Sin materiales complejos</span>
          </div>
        </div>
      </div>

      {/* Curricular resources bank */}
      <h3 className="text-[#848484] text-[12px] font-bold pb-4 tracking-wider uppercase">Recursos Curriculares MINERD</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {CURRICULAR_RESOURCES.map((res) => (
          <div 
            key={res.id} 
            className="bg-white border border-black/5 rounded-[24px] p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-bg-base rounded-[16px] border border-black/5 text-[#1B1B1B]">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-bold text-[14px] text-text-main line-clamp-1">{res.name}</h4>
                <div className="flex gap-2 items-center text-[11px] text-text-muted font-bold mt-1">
                  <span>{res.type}</span>
                  <span>•</span>
                  <span>{res.size}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleDownloadResource(res.name)}
              className="p-2.5 bg-bg-base hover:bg-black/5 border border-black/5 rounded-full text-text-main transition-colors cursor-pointer"
              title="Descargar recurso"
            >
              <Download size={14} />
            </button>
          </div>
        ))}
      </div>

    </main>
  );
}
