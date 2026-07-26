import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Layers,
  Sparkles,
  X,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../lib/useRequireAuth';
import { saveTaller } from '../lib/stores/useTalleresStore';
import {
  getAllWorkshopTemplates,
  getWorkshopTemplate,
  getCompetenciesForLevel,
  getIndicatorsForLevel,
} from '../lib/data/workshopTemplates';
import { AVAILABLE_GRADES } from '../lib/data/educationStructure';
import { OFFICIAL_DEFAULT_SUBJECTS } from '../lib/data/defaultSubjects';
import { SCIENCE_CURRICULUM_DATA } from '../lib/data/scienceCurriculum';
import { UNIT_CURRICULUM_DATA } from '../lib/data/unitCurriculum';
import type { WorkshopType } from '../types/tallerTypes';
import TallerIcon from '../components/TallerIcon';
import { toast, Toaster } from 'sonner';
import confetti from 'canvas-confetti';

const STEPS = [
  { id: 1, title: 'Tipo de Taller', description: 'Selecciona un taller predefinido o personalizado' },
  { id: 2, title: 'Configuración', description: 'Define nivel, grado y nombre' },
  { id: 3, title: 'Currículo', description: 'Competencias e indicadores' },
  { id: 4, title: 'Resumen', description: 'Revisa y confirma' },
];

const getSubjectKeyword = (id: string): string => {
  const l = id.toLowerCase();
  if (l.includes('lengua') || l.includes('espanola')) return 'lengua';
  if (l.includes('matematica')) return 'matematica';
  if (l.includes('sociales')) return 'sociales';
  if (l.includes('naturales') || l.includes('naturaleza')) return 'naturales';
  if (l.includes('artistica')) return 'artistica';
  if (l.includes('fisica')) return 'fisica';
  if (l.includes('formacion') || l.includes('humana')) return 'formación';
  if (l.includes('ingles') || l.includes('foreign')) return 'inglés';
  return l;
};

const getCleanGradeLevel = (gradeLabel: string, level: string): string => {
  if (!gradeLabel) return '';
  const gl = gradeLabel.toLowerCase();
  const lvl = level.toUpperCase();
  if (lvl === 'SECUNDARIA') {
    if (gl.includes('1')) return '1ro Sec';
    if (gl.includes('2')) return '2do Sec';
    if (gl.includes('3')) return '3ro Sec';
    if (gl.includes('4')) return '4to Sec';
    if (gl.includes('5')) return '5to Sec';
    if (gl.includes('6')) return '6to Sec';
  }
  if (gl.includes('1')) return '1ro';
  if (gl.includes('2')) return '2do';
  if (gl.includes('3')) return '3ro';
  if (gl.includes('4')) return '4to';
  if (gl.includes('5')) return '5to';
  if (gl.includes('6')) return '6to';
  return gl;
};

const getNormalizedGradeId = (gradeLabel: string, level: string): string => {
  if (!gradeLabel || !level) return '';
  const cleanGrade = gradeLabel.toLowerCase();
  const cleanLevel = level.toUpperCase();

  if (cleanLevel === 'SECUNDARIA') {
    if (cleanGrade.includes('1')) return 'secundaria-1ro';
    if (cleanGrade.includes('2')) return 'secundaria-2do';
    if (cleanGrade.includes('3')) return 'secundaria-3ro';
    if (cleanGrade.includes('4')) return 'secundaria-4to';
    if (cleanGrade.includes('5')) return 'secundaria-5to';
    if (cleanGrade.includes('6')) return 'secundaria-6to';
  }

  if (cleanLevel === 'PRIMARIA') {
    if (cleanGrade.includes('1')) return 'primaria-1ro';
    if (cleanGrade.includes('2')) return 'primaria-2do';
    if (cleanGrade.includes('3')) return 'primaria-3ro';
    if (cleanGrade.includes('4')) return 'primaria-4to';
    if (cleanGrade.includes('5')) return 'primaria-5to';
    if (cleanGrade.includes('6')) return 'primaria-6to';
  }

  if (cleanLevel === 'INICIAL') {
    if (cleanGrade.includes('maternal')) return 'inicial-maternal';
    if (cleanGrade.includes('infantes')) return 'inicial-infantes';
    if (cleanGrade.includes('parvulos') || cleanGrade.includes('párvulos')) return 'inicial-parvulos';
    if (cleanGrade.includes('pre-kínder') || cleanGrade.includes('pre-kinder') || cleanGrade.includes('prekinder')) return 'inicial-prekinder';
    if (cleanGrade.includes('kínder') || cleanGrade.includes('kinder')) return 'inicial-kinder';
    if (cleanGrade.includes('pre-primario') || cleanGrade.includes('preprimario')) return 'inicial-preprimario';
  }

  return gradeLabel;
};

const getTemplateForSubject = (subjectId: string): WorkshopType => {
  const l = subjectId.toLowerCase();
  if (l.includes('lengua') || l.includes('espanola')) return 'LECTURA_DIVERTIDA';
  if (l.includes('matematica')) return 'MATEMATICA_FASCINA';
  if (l.includes('sociales') || l.includes('catedra')) return 'CATEDRA_CIUDADANA';
  if (l.includes('naturales') || l.includes('naturaleza') || l.includes('ambiental')) return 'EDUCACION_AMBIENTAL';
  return 'PERSONALIZADO';
};

export default function CrearTaller() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [crearOtro, setCrearOtro] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [tipoTaller, setTipoTaller] = useState<WorkshopType | ''>('');
  const [nivel, setNivel] = useState<'inicial' | 'primaria' | 'secundaria' | ''>('');
  const [grado, setGrado] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [competencias, setCompetencias] = useState<string[]>([]);
  const [indicadores, setIndicadores] = useState<string[]>([]);
  const [customCompetencia, setCustomCompetencia] = useState('');
  const [customIndicador, setCustomIndicador] = useState('');
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);

  // New subject and curriculum states
  const [asignaturaId, setAsignaturaId] = useState<string>('');
  const [showAsignaturaDropdown, setShowAsignaturaDropdown] = useState(false);
  const [availableFundamentales, setAvailableFundamentales] = useState<{ name: string; description: string }[]>([]);
  const [selectedFundamentales, setSelectedFundamentales] = useState<string[]>([]);

  const templates = getAllWorkshopTemplates();
  const selectedTemplate = tipoTaller ? getWorkshopTemplate(tipoTaller) : null;

  const filteredGrades = AVAILABLE_GRADES.filter(g => {
    if (!nivel) return true;
    return g.level === nivel.toUpperCase();
  });

  const gradeId = grado && nivel ? getNormalizedGradeId(grado, nivel) : '';
  const subjectOptions = OFFICIAL_DEFAULT_SUBJECTS.filter(s => {
    if (!nivel) return false;
    if (s.level !== nivel.toUpperCase()) return false;
    
    if (user && user.rol !== 'admin' && user.allowed_subjects && Object.keys(user.allowed_subjects).length > 0) {
      if (gradeId) {
        const allowed = user.allowed_subjects[gradeId] || [];
        return allowed.includes(s.id);
      } else {
        const allAllowedForLevel = Object.entries(user.allowed_subjects)
          .filter(([gId]) => gId.startsWith(nivel.toLowerCase()))
          .flatMap(([_, sIds]) => sIds);
        return allAllowedForLevel.includes(s.id);
      }
    }
    return true;
  });



  const loadCurriculumData = (subjectId: string, gradeLabel: string, level: string) => {
    if (!subjectId || !level) return;

    const subjectKeyword = getSubjectKeyword(subjectId);
    const cleanGrade = getCleanGradeLevel(gradeLabel, level);

    let match = SCIENCE_CURRICULUM_DATA.find(item => {
      const nameMatch = item.subject_name.toLowerCase().includes(subjectKeyword);
      const gradeMatch = cleanGrade ? item.grade_level.toLowerCase().replace('1er', '1ro').replace('3er', '3ro') === cleanGrade.toLowerCase().replace('1er', '1ro').replace('3er', '3ro') : true;
      return nameMatch && gradeMatch;
    });

    if (!match) {
      match = SCIENCE_CURRICULUM_DATA.find(item => {
        return item.subject_name.toLowerCase().includes(subjectKeyword);
      });
    }

    if (match) {
      const fundamentals = (match.competencies || [])
        .filter((c: any) => c.type === 'FUNDAMENTAL' || c.fundamental)
        .map((c: any) => ({
          name: c.name || c.fundamental || '',
          description: c.description || c.specific || ''
        }));
      setAvailableFundamentales(fundamentals);
      setSelectedFundamentales(fundamentals.map(f => f.name));

      let specificList: string[] = [];
      const hasSpecificField = match.competencies.some((c: any) => c.specific);
      if (hasSpecificField) {
        specificList = match.competencies.map((c: any) => c.specific || '').filter(Boolean);
      } else {
        specificList = match.competencies.map((c: any) => c.description || '').filter(Boolean);
      }

      let indicatorsList: string[] = [];
      if (match.indicators && match.indicators.length > 0) {
        indicatorsList = match.indicators;
      } else {
        const unitBuckets = UNIT_CURRICULUM_DATA.filter(u => u.subjectId === subjectId);
        const allUnitIndicators = unitBuckets
          .flatMap(b => b.units)
          .filter(u => u.grade_levels?.includes(cleanGrade))
          .flatMap(u => u.achievementIndicators || []);
        
        if (allUnitIndicators.length > 0) {
          indicatorsList = allUnitIndicators;
        } else {
          const matchedTmplType = getTemplateForSubject(subjectId);
          const tmpl = getWorkshopTemplate(tipoTaller || matchedTmplType);
          indicatorsList = tmpl.indicadores_por_nivel[level] || [];
        }
      }

      setCompetencias(specificList);
      setIndicadores(indicatorsList);

      if (tipoTaller === '' || tipoTaller === 'PERSONALIZADO') {
        const matchedTmplType = getTemplateForSubject(subjectId);
        setTipoTaller(matchedTmplType);
        const tmpl = getWorkshopTemplate(matchedTmplType);
        setNombre(tmpl.nombre);
        setDescripcion(tmpl.descripcion);
      }
    } else {
      const matchedTmplType = getTemplateForSubject(subjectId);
      const tmpl = getWorkshopTemplate(tipoTaller || matchedTmplType);
      setCompetencias(tmpl.competencias_por_nivel[level] || []);
      setIndicadores(tmpl.indicadores_por_nivel[level] || []);
      setAvailableFundamentales([]);
      setSelectedFundamentales([]);
      if (tipoTaller === '' || tipoTaller === 'PERSONALIZADO') {
        setTipoTaller(matchedTmplType);
        setNombre(tmpl.nombre);
        setDescripcion(tmpl.descripcion);
      }
    }
  };

  // Auto-fill from template
  const selectTemplate = (tipo: WorkshopType) => {
    setTipoTaller(tipo);
    const tmpl = getWorkshopTemplate(tipo);
    if (tipo !== 'PERSONALIZADO') {
      setNombre(tmpl.nombre);
      setDescripcion(tmpl.descripcion);
    } else {
      setNombre('');
      setDescripcion('');
    }
  };

  // Load competencies and indicators when level changes
  const handleNivelChange = (newNivel: 'inicial' | 'primaria' | 'secundaria') => {
    setNivel(newNivel);
    setGrado('');
    setAsignaturaId('');
    setAvailableFundamentales([]);
    setSelectedFundamentales([]);
    setCompetencias([]);
    setIndicadores([]);
  };

  const addCustomCompetencia = () => {
    if (customCompetencia.trim()) {
      setCompetencias(prev => [...prev, customCompetencia.trim()]);
      setCustomCompetencia('');
    }
  };

  const addCustomIndicador = () => {
    if (customIndicador.trim()) {
      setIndicadores(prev => [...prev, customIndicador.trim()]);
      setCustomIndicador('');
    }
  };

  const removeCompetencia = (index: number) => {
    setCompetencias(prev => prev.filter((_, i) => i !== index));
  };

  const removeIndicador = (index: number) => {
    setIndicadores(prev => prev.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!tipoTaller;
      case 2: return !!nivel && !!nombre.trim() && !!asignaturaId;
      case 3: return competencias.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user || !tipoTaller || !nivel || submitting) return;

    setSubmitting(true);
    const tmpl = getWorkshopTemplate(tipoTaller);
    const finalCompetencias = [
      ...selectedFundamentales.map(f => `Competencia Fundamental: ${f}`),
      ...competencias
    ];
    try {
      const taller = await saveTaller({
        docente_id: user.id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        tipo_taller: tipoTaller,
        nivel,
        grado,
        competencias_especificas: finalCompetencias,
        indicadores,
        color: tmpl.color,
        icono: tmpl.icono,
        gradiente: tmpl.gradiente,
        max_clases: 20,
        estado: 'activo',
      });

      // Celebration
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success(`¡Taller "${nombre}" creado exitosamente!`);

      if (crearOtro) {
        // Reset form
        setStep(1);
        setTipoTaller('');
        setNivel('');
        setGrado('');
        setAsignaturaId('');
        setAvailableFundamentales([]);
        setSelectedFundamentales([]);
        setNombre('');
        setDescripcion('');
        setCompetencias([]);
        setIndicadores([]);
      } else {
        setTimeout(() => navigate(`/talleres/${taller.id}`), 600);
      }
    } catch (err) {
      toast.error('Error al guardar el taller en la base de datos');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-base dark:bg-zinc-955 flex flex-col text-left">
      <Toaster position="top-center" richColors />

      {/* Top bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 pt-10 pb-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/talleres')}
            className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/95 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer active:scale-95 select-none"
          >
            ← VOLVER A TALLERES
          </button>
          <h1 className="text-lg font-extrabold text-[#1B1B1B] dark:text-white flex items-center gap-2">
            <Layers size={20} className="text-brand-primary dark:text-blue-400" />
            Crear Nuevo Taller
          </h1>
          <div className="w-[120px]" /> {/* spacer */}
        </div>
      </div>

      {/* Progress steps */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step > s.id
                        ? 'bg-emerald-500 text-white'
                        : step === s.id
                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
                    }`}
                  >
                    {step > s.id ? <Check size={14} className="stroke-[3]" /> : s.id}
                  </div>
                  <div className="hidden md:block">
                    <p className={`text-xs font-bold ${step >= s.id ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-650">{s.description}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded transition-all duration-355 ${step > s.id ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-zinc-800'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">

          {/* STEP 1: Tipo de Taller */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-extrabold text-[#1B1B1B] dark:text-white mb-2">
                ¿Qué tipo de taller deseas crear?
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8">
                Selecciona un taller predefinido con competencias del currículo o crea uno personalizado.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(tmpl => (
                  <button
                    key={tmpl.tipo}
                    type="button"
                    onClick={() => selectTemplate(tmpl.tipo)}
                    className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-205 cursor-pointer group hover:shadow-lg ${
                      tipoTaller === tmpl.tipo
                        ? 'border-brand-primary bg-brand-light dark:bg-zinc-850 shadow-md'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {tipoTaller === tmpl.tipo && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                    )}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-sm"
                      style={{ backgroundColor: tmpl.color + '18', color: tmpl.color }}
                    >
                      <TallerIcon name={tmpl.icono} size={24} />
                    </div>
                    <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-white mb-1 group-hover:text-brand-primary dark:group-hover:text-blue-400 transition-colors">
                      {tmpl.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {tmpl.descripcion}
                    </p>
                    {tmpl.tipo !== 'PERSONALIZADO' && (
                      <div className="mt-3 flex items-center gap-1">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-505 uppercase tracking-wider">
                          {tmpl.temas_sugeridos.length} temas sugeridos
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Configuración */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto">
              <h2 className="text-2xl font-extrabold text-[#1B1B1B] dark:text-white mb-2 text-center">
                Configuración del Taller
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8 text-center">
                Define el nivel educativo, grado y nombre de tu taller.
              </p>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5">
                {/* Nivel */}
                <div className="space-y-2">
                  <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">
                    Nivel Educativo *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'inicial' as const, label: 'Inicial', icon: 'Palette', color: '#FF6B9D' },
                      { value: 'primaria' as const, label: 'Primaria', icon: 'Book', color: '#3B82F6' },
                      { value: 'secundaria' as const, label: 'Secundaria', icon: 'GraduationCap', color: '#8B5CF6' },
                    ].map(n => (
                      <button
                        key={n.value}
                        type="button"
                        onClick={() => handleNivelChange(n.value)}
                        className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          nivel === n.value
                            ? 'border-brand-primary bg-brand-light dark:bg-zinc-800'
                            : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <span className="block mb-2 flex justify-center" style={{ color: n.color }}>
                          <TallerIcon name={n.icon} size={28} />
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{n.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grado */}
                {nivel && (
                  <div className="space-y-2 relative select-none">
                    <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">
                      Grado (opcional)
                    </label>
                    <div
                      onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                      className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 outline-none transition-all shadow-xs"
                    >
                      <span className="truncate">{grado || 'Seleccionar grado'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showGradeDropdown ? 'rotate-180' : ''}`} />
                    </div>
                    {showGradeDropdown && (
                      <>
                        <div className="fixed inset-0 z-[45]" onClick={() => setShowGradeDropdown(false)} />
                        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-50 text-left rounded-lg max-h-60 overflow-y-auto">
                          {filteredGrades.map(g => (
                            <button
                              key={g.value}
                              type="button"
                              onClick={() => {
                                setGrado(g.label);
                                setShowGradeDropdown(false);
                                setAsignaturaId('');
                                setAvailableFundamentales([]);
                                setSelectedFundamentales([]);
                                setCompetencias([]);
                                setIndicadores([]);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                                grado === g.label
                                  ? 'bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold'
                                  : 'text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                              }`}
                            >
                              <span>{g.label}</span>
                              {grado === g.label && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Asignatura */}
                {nivel && (
                  <div className="space-y-2 relative select-none">
                    <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-350 uppercase tracking-wider">
                      Asignatura *
                    </label>
                    <div
                      onClick={() => setShowAsignaturaDropdown(!showAsignaturaDropdown)}
                      className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 outline-none transition-all shadow-xs"
                    >
                      <span className="truncate">
                        {subjectOptions.find(s => s.id === asignaturaId)?.name || 'Seleccionar asignatura'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showAsignaturaDropdown ? 'rotate-180' : ''}`} />
                    </div>
                    {showAsignaturaDropdown && (
                      <>
                        <div className="fixed inset-0 z-[45]" onClick={() => setShowAsignaturaDropdown(false)} />
                        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-50 text-left rounded-lg max-h-60 overflow-y-auto">
                          {subjectOptions.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setAsignaturaId(s.id);
                                setShowAsignaturaDropdown(false);
                                loadCurriculumData(s.id, grado, nivel);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                                asignaturaId === s.id
                                  ? 'bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold'
                                  : 'text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span>{s.icon || '📚'}</span>
                                <span>{s.name}</span>
                              </div>
                              {asignaturaId === s.id && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Nombre */}
                <div className="space-y-2">
                  <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider">
                    Nombre del Taller *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Lectura Divertida, Taller de Arte..."
                    className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe brevemente el objetivo de este taller..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Currículo */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-extrabold text-[#1B1B1B] dark:text-white mb-2 text-center">
                Competencias e Indicadores
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8 text-center">
                {tipoTaller !== 'PERSONALIZADO'
                  ? 'Se han cargado competencias e indicadores sugeridos. Puedes editarlos o agregar nuevos.'
                  : 'Agrega las competencias e indicadores del currículo para este taller.'}
              </p>

              {/* Competencias Fundamentales */}
              {availableFundamentales.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 mb-6 max-w-5xl mx-auto text-left">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center">
                      <Layers size={12} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Competencias Fundamentales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {availableFundamentales.map((comp) => {
                      const isSelected = selectedFundamentales.includes(comp.name);
                      return (
                        <button
                          key={comp.name}
                          type="button"
                          onClick={() => {
                            setSelectedFundamentales(prev => 
                              prev.includes(comp.name)
                                ? prev.filter(n => n !== comp.name)
                                : [...prev, comp.name]
                            );
                          }}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-full ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/15 shadow-sm'
                              : 'border-slate-200 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs font-black text-slate-850 dark:text-white truncate">
                              {comp.name}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-zinc-700'
                            }`}>
                              {isSelected && <Check size={10} className="stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mt-1">
                            {comp.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {/* Competencias */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                      <Sparkles size={12} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    Competencias Específicas
                  </h3>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto mb-3 pr-1">
                    {competencias.map((comp, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-200 dark:border-zinc-700/50 rounded-lg group">
                        <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed flex-1">{comp}</p>
                        <button
                          onClick={() => removeCompetencia(i)}
                          className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customCompetencia}
                      onChange={(e) => setCustomCompetencia(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomCompetencia()}
                      placeholder="Agregar competencia..."
                      className="flex-1 h-9 px-3 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all"
                    />
                    <button
                      onClick={addCustomCompetencia}
                      disabled={!customCompetencia.trim()}
                      className="h-9 px-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-950/30 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Indicadores */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                      <Check size={12} className="text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                    </div>
                    Indicadores de Logro
                  </h3>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto mb-3 pr-1">
                    {indicadores.map((ind, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-200 dark:border-zinc-700/50 rounded-lg group">
                        <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed flex-1">{ind}</p>
                        <button
                          onClick={() => removeIndicador(i)}
                          className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customIndicador}
                      onChange={(e) => setCustomIndicador(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomIndicador()}
                      placeholder="Agregar indicador..."
                      className="flex-1 h-9 px-3 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all"
                    />
                    <button
                      onClick={addCustomIndicador}
                      disabled={!customIndicador.trim()}
                      className="h-9 px-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950/30 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Resumen */}
          {step === 4 && selectedTemplate && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto">
              <h2 className="text-2xl font-extrabold text-[#1B1B1B] dark:text-white mb-2 text-center">
                Resumen del Taller
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8 text-center">
                Revisa la información antes de crear tu taller.
              </p>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-left">
                {/* Header gradient */}
                <div className={`h-3 w-full bg-gradient-to-r ${selectedTemplate.gradiente}`} />

                <div className="p-6 space-y-5">
                  {/* Title area */}
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: selectedTemplate.color + '18', color: selectedTemplate.color }}
                    >
                      <TallerIcon name={selectedTemplate.icono} size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">{nombre}</h3>
                      <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{descripcion || 'Sin descripción'}</p>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 dark:bg-zinc-800/50 rounded-xl p-3">
                      <p className="text-[9.5px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-1">Nivel</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{nivel}</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-zinc-800/50 rounded-xl p-3">
                      <p className="text-[9.5px] font-black text-slate-500 dark:text-zinc-550 uppercase tracking-wider mb-1">Grado</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{grado || 'No especificado'}</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-zinc-800/50 rounded-xl p-3">
                      <p className="text-[9.5px] font-black text-slate-500 dark:text-zinc-555 uppercase tracking-wider mb-1">Competencias</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{competencias.length}</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-zinc-800/50 rounded-xl p-3">
                      <p className="text-[9.5px] font-black text-slate-500 dark:text-zinc-550 uppercase tracking-wider mb-1">Indicadores</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{indicadores.length}</p>
                    </div>
                  </div>

                  {/* Crear otro checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer select-none p-3 bg-blue-50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                    <input
                      type="checkbox"
                      checked={crearOtro}
                      onChange={(e) => setCrearOtro(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-zinc-600 text-brand-primary focus:ring-brand-primary cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Crear otro taller después de este
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 px-6 py-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/talleres')}
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft size={14} />
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </button>

          <div className="text-xs font-bold text-slate-400 dark:text-zinc-500">
            Paso {step} de {STEPS.length}
          </div>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Check size={14} className="stroke-[3]" />
              {submitting ? 'Creando...' : 'Crear Taller'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
