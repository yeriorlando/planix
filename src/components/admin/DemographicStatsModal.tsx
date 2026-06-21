import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestD1 } from '../../lib/services/d1Client';
import { MapPin, School, ChevronDown, ChevronUp, Loader2, Globe, X, CheckCircle2 } from 'lucide-react';

interface DemographicStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StatsData {
  provincias: string[];
  centros: string[];
}

export default function DemographicStatsModal({ isOpen, onClose }: DemographicStatsModalProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({ provincias: [], centros: [] });
  const [showProvincias, setShowProvincias] = useState(false);
  const [showCentros, setShowCentros] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDemographics();
    }
  }, [isOpen]);

  const fetchDemographics = async () => {
    setLoading(true);
    try {
      const data = await requestD1<any[]>('/api/profiles');

      const provinces = new Set<string>();
      const schools = new Set<string>();

      data?.forEach(profile => {
        // Extract province
        let provinceName = profile.provincia;

        // Fallback to regional if province is empty
        if (!provinceName || provinceName.trim() === '') {
          provinceName = profile.regional;
        }

        if (provinceName) {
          let cleaned = provinceName.trim().toUpperCase();

          // Clean "01 - BARAHONA" -> "BARAHONA"
          if (/^\d+\s*-\s*/.test(cleaned)) {
            cleaned = cleaned.replace(/^\d+\s*-\s*/, '');
          } else if (/^\d+\s+/.test(cleaned)) {
            // Case "04 San Cristóbal"
            cleaned = cleaned.replace(/^\d+\s+/, '');
          }

          // Ignore generic values
          const ignored = ['NA', 'N/A', 'N08', 'REGIONAL', 'REGIONALES'];
          if (cleaned && !ignored.includes(cleaned) && cleaned.length > 2) {
            provinces.add(cleaned);
          }
        }

        const schoolIdentifier = profile.school_name || profile.codigo_centro || profile.colegio;
        if (schoolIdentifier && schoolIdentifier.trim().length > 2 && schoolIdentifier.toUpperCase() !== 'N/A') {
          schools.add(schoolIdentifier.trim().toUpperCase());
        }
      });

      setStats({
        provincias: Array.from(provinces).sort(),
        centros: Array.from(schools).sort()
      });
    } catch (error) {
      console.error('Error fetching demographics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-left"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-150 dark:border-zinc-800 shrink-0">
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Globe className="w-5.5 h-5.5 text-[#0046ab] dark:text-blue-400" />
              Análisis Demográfico de Usuarios
            </h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-650 text-white flex items-center justify-center cursor-pointer transition-all shadow-md border-none active:scale-95 outline-hidden z-50"
            >
              <X size={14} className="stroke-[3]" />
            </button>
          </div>

          {/* Body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 shrink-0 w-full">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-zinc-400 text-sm font-bold">Cargando datos demográficos...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                {/* Provinces Card */}
                <div className="bg-gradient-to-br from-[#E0E7FF] to-[#EDE9FE] dark:from-indigo-950/20 dark:to-slate-900/60 p-5 rounded-[24px] border border-indigo-550/10 dark:border-indigo-500/5 shadow-3xs flex flex-col justify-between min-h-[170px]">
                  <div>
                    <div className="flex justify-between items-start mb-2.5 w-full">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700/60 dark:text-zinc-400">Provincias</span>
                      <div className="w-9 h-9 bg-white/60 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-indigo-650 dark:text-indigo-400">
                        <Globe size={16} className="fill-indigo-500/20 text-indigo-650 dark:text-indigo-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-black text-indigo-750 dark:text-indigo-400 tracking-tight leading-none">{stats.provincias.length}</p>
                    <p className="text-[10px] text-indigo-600/80 dark:text-indigo-455/80 font-bold mt-1.5 uppercase tracking-wide">Regiones con presencia</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProvincias(!showProvincias);
                      setShowCentros(false);
                    }}
                    className="mt-4 w-full h-9 bg-white dark:bg-zinc-850 hover:bg-neutral-50 dark:hover:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 text-indigo-700 dark:text-indigo-400 font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-3xs cursor-pointer active:scale-[0.98]"
                  >
                    {showProvincias ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {showProvincias ? 'Ocultar Listado' : 'Ver Listado'}
                  </button>
                </div>

                {/* Centers Card */}
                <div className="bg-gradient-to-br from-[#E6F4EA] to-[#F1F9F5] dark:from-emerald-950/20 dark:to-slate-900/60 p-5 rounded-[24px] border border-emerald-550/10 dark:border-emerald-500/5 shadow-3xs flex flex-col justify-between min-h-[170px]">
                  <div>
                    <div className="flex justify-between items-start mb-2.5 w-full">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700/60 dark:text-zinc-400">Centros Educativos</span>
                      <div className="w-9 h-9 bg-white/60 dark:bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xs text-emerald-600 dark:text-emerald-400">
                        <School size={16} className="fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-3xl font-black text-emerald-700 dark:text-emerald-450 tracking-tight leading-none">{stats.centros.length}</p>
                    <p className="text-[10px] text-emerald-650/80 dark:text-emerald-450/80 font-bold mt-1.5 uppercase tracking-wide">Instituciones registradas</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCentros(!showCentros);
                      setShowProvincias(false);
                    }}
                    className="mt-4 w-full h-9 bg-white dark:bg-zinc-850 hover:bg-neutral-50 dark:hover:bg-zinc-800 border border-emerald-200 dark:border-zinc-700 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-3xs cursor-pointer active:scale-[0.98]"
                  >
                    {showCentros ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {showCentros ? 'Ocultar Listado' : 'Ver Listado'}
                  </button>
                </div>
              </div>

              {/* Provinces List */}
              <AnimatePresence>
                {showProvincias && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-150 dark:border-zinc-800 overflow-hidden"
                  >
                    <div className="bg-slate-50 dark:bg-zinc-900 px-4 py-3 border-b border-slate-150 dark:border-zinc-800 flex justify-between items-center">
                      <h5 className="font-bold text-slate-700 dark:text-zinc-300 text-xs flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" /> Listado de Provincias
                      </h5>
                      <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-600 border border-blue-550/10 px-2 py-0.5 rounded-md">
                        {stats.provincias.length}
                      </span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar">
                      {stats.provincias.map((prov, i) => (
                        <div key={i} className="px-3 py-2 bg-slate-50/50 dark:bg-zinc-900/40 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 border border-slate-100 dark:border-zinc-800 hover:border-blue-300 hover:bg-white dark:hover:bg-zinc-900 transition-all">
                          {prov}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Schools List */}
              <AnimatePresence>
                {showCentros && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-150 dark:border-zinc-800 overflow-hidden"
                  >
                    <div className="bg-slate-50 dark:bg-zinc-900 px-4 py-3 border-b border-slate-150 dark:border-zinc-800 flex justify-between items-center">
                      <h5 className="font-bold text-slate-700 dark:text-zinc-300 text-xs flex items-center gap-2">
                        <School className="w-4 h-4 text-emerald-500" /> Centros Registrados
                      </h5>
                      <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-550/10 px-2 py-0.5 rounded-md">
                        {stats.centros.length}
                      </span>
                    </div>
                    <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {stats.centros.map((centro, i) => (
                        <div key={i} className="px-3 py-2 bg-slate-50/50 dark:bg-zinc-900/40 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 border border-slate-100 dark:border-zinc-800 hover:border-emerald-300 hover:bg-white dark:hover:bg-zinc-900 transition-all flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                          <span className="truncate">{centro}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Close Button in body */}
              <div className="pt-2 flex justify-end shrink-0">
                <button
                  onClick={onClose}
                  className="px-5 h-9 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white dark:from-indigo-950/40 dark:to-slate-900/60 dark:hover:bg-indigo-900 border border-transparent dark:border-indigo-500/10 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center gap-2 active:scale-95 outline-hidden"
                >
                  <CheckCircle2 size={14} className="text-white" />
                  Cerrar Análisis
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
