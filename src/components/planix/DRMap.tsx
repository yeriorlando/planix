import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MapPin, School, Sparkles } from 'lucide-react';
import { DR_PROVINCE_PATHS } from './DRMapPaths';

interface ProvinceData {
  id: string;
  name: string;
  teachers: number;
  schools: number;
  color: string;
}

const PROVINCES_DATA: Record<string, ProvinceData> = {
  "Santo Domingo": { id: "SD", name: "Santo Domingo", teachers: 94, schools: 12, color: "#1E40AF" },
  "Distrito Nacional": { id: "DN", name: "Distrito Nacional", teachers: 88, schools: 11, color: "#3B82F6" },
  "Santiago": { id: "ST", name: "Santiago", teachers: 82, schools: 9, color: "#8B5CF6" },
  "San Cristóbal": { id: "SC", name: "San Cristóbal", teachers: 76, schools: 8, color: "#A855F7" },
  "La Vega": { id: "VE", name: "La Vega", teachers: 68, schools: 7, color: "#D946EF" },
  "La Romana": { id: "LR", name: "La Romana", teachers: 65, schools: 8, color: "#C026D3" },
  "Duarte": { id: "DU", name: "Duarte", teachers: 62, schools: 6, color: "#EC4899" },
  "Puerto Plata": { id: "PP", name: "Puerto Plata", teachers: 58, schools: 5, color: "#F43F5E" },
  "San Juan": { id: "SJ", name: "San Juan", teachers: 54, schools: 5, color: "#FB7185" },
  "La Altagracia": { id: "LA", name: "La Altagracia", teachers: 51, schools: 4, color: "#F87171" },
  "Espaillat": { id: "ES", name: "Espaillat", teachers: 48, schools: 4, color: "#FBBF24" },
  "San Pedro de Macorís": { id: "PM", name: "San Pedro de Macorís", teachers: 45, schools: 3, color: "#F59E0B" },
  "Azua": { id: "AZ", name: "Azua", teachers: 42, schools: 3, color: "#D97706" },
  "Peravia": { id: "PV", name: "Peravia", teachers: 38, schools: 2, color: "#B45309" },
  "Monseñor Nouel": { id: "MN", name: "Monseñor Nouel", teachers: 35, schools: 2, color: "#10B981" },
  "Valverde": { id: "VA", name: "Valverde", teachers: 32, schools: 2, color: "#059669" },
  "Barahona": { id: "BH", name: "Barahona", teachers: 30, schools: 2, color: "#047857" },
  "Monte Plata": { id: "MP", name: "Monte Plata", teachers: 28, schools: 2, color: "#065F46" },
  "Sánchez Ramírez": { id: "SR", name: "Sánchez Ramírez", teachers: 26, schools: 2, color: "#06B6D4" },
  "María Trinidad Sánchez": { id: "MT", name: "María Trinidad Sánchez", teachers: 24, schools: 1, color: "#0891B2" },
  "Hermanas Mirabal": { id: "HM", name: "Hermanas Mirabal", teachers: 22, schools: 1, color: "#0E7490" },
  "Bahoruco": { id: "BA", name: "Bahoruco", teachers: 20, schools: 1, color: "#3B82F6" },
  "Samaná": { id: "SA", name: "Samaná", teachers: 18, schools: 1, color: "#2563EB" },
  "El Seibo": { id: "ESB", name: "El Seibo", teachers: 16, schools: 1, color: "#1D4ED8" },
  "Hato Mayor": { id: "HMA", name: "Hato Mayor", teachers: 14, schools: 1, color: "#1E40AF" },
  "Monte Cristi": { id: "MC", name: "Monte Cristi", teachers: 12, schools: 1, color: "#818CF8" },
  "Elías Piña": { id: "EP", name: "Elías Piña", teachers: 10, schools: 1, color: "#6366F1" },
  "San José de Ocoa": { id: "JO", name: "San José de Ocoa", teachers: 8, schools: 1, color: "#4F46E5" },
  "Santiago Rodríguez": { id: "SRO", name: "Santiago Rodríguez", teachers: 6, schools: 1, color: "#4338CA" },
  "Independencia": { id: "IN", name: "Independencia", teachers: 5, schools: 1, color: "#312E81" },
  "Dajabón": { id: "DA", name: "Dajabón", teachers: 4, schools: 1, color: "#1E1B4B" },
  "Pedernales": { id: "PE", name: "Pedernales", teachers: 3, schools: 1, color: "#111827" }
};

const PROVINCES_WITH_MARKERS = [
  "Azua", "Bahoruco", "Barahona", "Sánchez Ramírez", "La Altagracia",
  "La Vega", "Valverde", "Monte Cristi", "Monte Plata",
  "María Trinidad Sánchez", "Puerto Plata", "San Cristóbal",
  "Duarte", "San Juan", "San Pedro de Macorís", "Santiago"
];

// Helper to find the center of a path for the marker
function getPathCenter(d: string) {
  const coords = (d.match(/[\d.]+\s+[\d.]+/g) || []) as string[];
  if (coords.length === 0) return { x: 0, y: 0 };

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  coords.forEach(point => {
    const [x, y] = point.split(/\s+/).map(Number);
    if (!isNaN(x) && !isNaN(y)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  });

  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

const ProvinceCard = ({ province, position }: { province: ProvinceData; position: { x: number; y: number } }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="fixed z-[100] pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-neutral-200 dark:border-zinc-800 shadow-2xl rounded-[2rem] p-5 min-w-[260px] overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl animate-pulse" />

          <div className="flex items-center gap-3 mb-4 relative">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg rotate-3"
              style={{ backgroundColor: province.color }}
            >
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-main tracking-tight leading-none mb-0.5">
                {province.name}
              </h3>
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                Impacto Activo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 relative">
            <div className="bg-neutral-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-neutral-200/50 dark:border-zinc-850">
              <div className="flex items-center gap-1.5 mb-1">
                <Users size={14} className="text-brand-primary" />
                <span className="text-[9px] font-black uppercase tracking-wider text-text-muted">Maestros</span>
              </div>
              <div className="text-xl font-black text-text-main tracking-tighter">
                {province.teachers.toLocaleString()}
              </div>
            </div>
            <div className="bg-neutral-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-neutral-200/50 dark:border-zinc-850">
              <div className="flex items-center gap-1.5 mb-1">
                <School size={14} className="text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-wider text-text-muted">Escuelas</span>
              </div>
              <div className="text-xl font-black text-text-main tracking-tighter">
                {province.schools.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function DRMap() {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totals = useMemo(() => {
    return Object.values(PROVINCES_DATA).reduce((acc, current) => ({
      teachers: acc.teachers + current.teachers,
      schools: acc.schools + current.schools,
      count: acc.count + 1
    }), { teachers: 0, schools: 0, count: 0 });
  }, []);

  const provinceMarkers = useMemo(() => {
    return PROVINCES_WITH_MARKERS.map(name => {
      const d = DR_PROVINCE_PATHS[name];
      if (!d) return null;
      return { name, center: getPathCenter(d) };
    }).filter(m => m !== null);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <section className="py-24 px-6 bg-white dark:bg-zinc-950 overflow-hidden relative z-10 border-b border-black/5 dark:border-white/5" ref={sectionRef}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-16">

          {/* LEFT COLUMN: THE MAP */}
          <div className="lg:col-span-7 relative" onMouseMove={handleMouseMove}>
            {/* Map Container with Ocean Background */}
            <div className="relative aspect-[1.47/1] bg-[#e3f2fd]/20 dark:bg-zinc-900/10 rounded-[3rem] p-4 md:p-8 border-2 border-neutral-100 dark:border-zinc-800 shadow-2xs group overflow-hidden">
              {/* World Map Texture / Ocean Waves decor */}
              <div className="absolute inset-0 opacity-10 dark:opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#1e88e5 1px, transparent 1px)`,
                  backgroundSize: '30px 30px'
                }}
              />

              {/* Decorative background orbs (Ocean depths) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-blue-400/5 dark:bg-blue-500/[0.02] rounded-full blur-[120px] -z-0" />

              {/* SVG Map */}
              <svg
                viewBox="0 0 10000 6536"
                className="w-full h-full relative z-10"
              >
                {Object.entries(DR_PROVINCE_PATHS).map(([name, d]) => (
                  <motion.path
                    key={name}
                    d={d}
                    fill={hoveredProvince === name ? (PROVINCES_DATA[name]?.color || '#1E40AF') : '#ffffff'}
                    stroke={hoveredProvince === name ? 'white' : '#cbd5e1'}
                    strokeWidth={hoveredProvince === name ? 60 : 25}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: Math.random() * 0.3,
                      type: "spring",
                      stiffness: 120
                    }}
                    onMouseEnter={() => setHoveredProvince(name)}
                    onMouseLeave={() => setHoveredProvince(null)}
                    className="cursor-pointer origin-center transition-colors duration-200 dark:fill-zinc-800 dark:stroke-zinc-700"
                    style={{
                      filter: hoveredProvince === name ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' : 'none',
                      strokeLinejoin: 'round'
                    }}
                  />
                ))}

                {/* Markers Layer */}
                {provinceMarkers.map((marker, i) => (
                  <motion.g
                    key={`marker-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.05, type: "spring" }}
                  >
                    <circle
                      cx={marker!.center.x}
                      cy={marker!.center.y}
                      r="160"
                      fill="#1E40AF"
                      fillOpacity="0.15"
                      className="animate-pulse"
                    />
                    <circle
                      cx={marker!.center.x}
                      cy={marker!.center.y}
                      r="100"
                      fill="#1E40AF"
                    />
                    <circle
                      cx={marker!.center.x}
                      cy={marker!.center.y}
                      r="50"
                      fill="white"
                    />
                    {/* Stylized Pin Shape */}
                    <path
                      d={`M ${marker!.center.x} ${marker!.center.y} l -60 -120 a 70 70 0 1 1 120 0 z`}
                      fill="#1E40AF"
                      transform={`translate(0, -40) scale(1.4)`}
                      style={{ transformOrigin: `${marker!.center.x}px ${marker!.center.y}px` }}
                    />
                  </motion.g>
                ))}
              </svg>

              {/* Tooltip Card following mouse */}
              <AnimatePresence>
                {hoveredProvince && PROVINCES_DATA[hoveredProvince] && (
                  <ProvinceCard
                    province={PROVINCES_DATA[hoveredProvince]}
                    position={mousePos}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT COLUMN: TEXT CONTENT (Centered with Map) */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-center min-h-[400px]">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-light dark:bg-blue-950/30 rounded-full text-brand-primary font-bold text-[10px] uppercase tracking-widest border border-brand-primary/10"
              >
                <Sparkles size={12} className="text-brand-primary" />
                Presencia Nacional
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-black text-text-main tracking-tighter leading-none mb-4 font-display"
              >
                Innovación que llega<br />
                <span className="text-brand-primary">
                  a cada rincón
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-text-muted font-medium leading-relaxed max-w-lg"
              >
                <strong>Planix</strong> es la solución integral que empodera a miles de docentes a lo largo de todo el territorio nacional, modernizando la labor educativa con un clic.
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
