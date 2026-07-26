import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  Clock,
  BookOpen,
  Target,
  Lightbulb,
  Layers,
  Calendar,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Brain,
  Zap,
  Cpu,
  Scale,
  Leaf,
  HelpCircle,
  Pencil,
  Eye,
  EyeOff,
  X,
  School,
  PenTool,
  Languages,
  FlaskConical,
  Palette,
  Library,
  BookMarked,
  GraduationCap,
  Atom,
  Scroll,
  Shapes,
  Globe,
  Compass,
  Notebook,
  Plus,
  Loader2,
} from 'lucide-react';
import { DatePicker } from "../components/ui/heroui-date-picker";
import { motion, AnimatePresence } from 'framer-motion';
import SchoolAutocomplete from '../components/forms/SchoolAutocomplete';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequireAuth } from '../lib/useRequireAuth';
import {
  getTallerById,
  addSession,
  updateSession,
  getSession,
} from '../lib/stores/useTalleresStore';
import { getWorkshopTemplate, getSuggestedTopics } from '../lib/data/workshopTemplates';
import type { Workshop, WorkshopSession } from '../types/tallerTypes';
import TallerIcon from '../components/TallerIcon';
import { toast, Toaster } from 'sonner';
import confetti from 'canvas-confetti';
import { SCIENCE_CURRICULUM_DATA } from '../lib/data/scienceCurriculum';import { generateWorkshopPlanning } from '../lib/services/aiService';

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

const getFundamentalIcon = (name: string) => {
  const l = name.toLowerCase();
  if (l.includes('comunicativa')) return MessageSquare;
  if (l.includes('pensamiento') || l.includes('lógico') || l.includes('creativo') || l.includes('crítico')) return Brain;
  if (l.includes('resolución') || l.includes('problemas')) return Zap;
  if (l.includes('científica') || l.includes('tecnológica') || l.includes('tecnología')) return Cpu;
  if (l.includes('ética') || l.includes('ciudadana')) return Scale;
  if (l.includes('ambiental') || l.includes('salud')) return Leaf;
  if (l.includes('desarrollo') || l.includes('personal') || l.includes('espiritual')) return Sparkles;
  return HelpCircle;
};

export default function ClaseTaller() {
  const user = useRequireAuth();
  const navigate = useNavigate();
  const { tallerId, claseId } = useParams<{ tallerId: string; claseId?: string }>();
  const isEditing = !!claseId;

  const [taller, setTaller] = useState<Workshop | null>(null);
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [competenciaEspecifica, setCompetenciaEspecifica] = useState('');
  const [indicadoresLogro, setIndicadoresLogro] = useState<string[]>([]);
  const [conceptual, setConceptual] = useState('');
  const [procedimental, setProcedimental] = useState('');
  const [actitudinal, setActitudinal] = useState('');
  const [inicio, setInicio] = useState('');
  const [desarrollo, setDesarrollo] = useState('');
  const [cierre, setCierre] = useState('');
  const [recursos, setRecursos] = useState('');
  const [evaluacion, setEvaluacion] = useState('');
  const [duracion, setDuracion] = useState(45);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [metacognicion, setMetacognicion] = useState('');
  const [metacognicionTiempo, setMetacognicionTiempo] = useState(15);
  const [evaluacionTiempo, setEvaluacionTiempo] = useState(15);
  const [showCompDropdown, setShowCompDropdown] = useState(false);
  const [selectedFundamentales, setSelectedFundamentales] = useState<string[]>([]);
  const [specificDescriptions, setSpecificDescriptions] = useState<Record<string, string>>({});
  const [editingComp, setEditingComp] = useState<string | null>(null);
  const [hideSpecificCompetencies, setHideSpecificCompetencies] = useState(false);
  const [showIndicatorsDropdown, setShowIndicatorsDropdown] = useState(false);

  // Moments-specific state variables (time, inputs, lists)
  const [inicioTiempo, setInicioTiempo] = useState(10);
  const [inicioRecursoInput, setInicioRecursoInput] = useState('');
  const [inicioRecursos, setInicioRecursos] = useState<string[]>([]);

  const [desarrolloTiempo, setDesarrolloTiempo] = useState(25);
  const [desarrolloRecursoInput, setDesarrolloRecursoInput] = useState('');
  const [desarrolloRecursos, setDesarrolloRecursos] = useState<string[]>([]);

  const [cierreTiempo, setCierreTiempo] = useState(10);
  const [cierreRecursoInput, setCierreRecursoInput] = useState('');
  const [cierreRecursos, setCierreRecursos] = useState<string[]>([]);

  // Additional general info states
  const [centroEducativo, setCentroEducativo] = useState(user?.colegio || user?.school_name || 'Sin Centro Educativo');
  const [seccion, setSeccion] = useState('');
  const [unidad, setUnidad] = useState('');
  const [subtema, setSubtema] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [editingObjetivo, setEditingObjetivo] = useState(false);
  const [editingInicio, setEditingInicio] = useState(false);
  const [editingDesarrollo, setEditingDesarrollo] = useState(false);
  const [editingCierre, setEditingCierre] = useState(false);
  const [editingEvaluacion, setEditingEvaluacion] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    if (user && (centroEducativo === 'Sin Centro Educativo' || !centroEducativo)) {
      setCentroEducativo(user.colegio || user.school_name || 'Sin Centro Educativo');
    }
  }, [user, centroEducativo]);

  useEffect(() => {
    if (!tallerId) return;
    setLoading(true);
    getTallerById(tallerId).then(t => {
      if (!t) {
        toast.error('Taller no encontrado');
        navigate('/talleres');
        return;
      }
      setTaller(t);
      setUnidad(t.nombre);

      // If editing, load session data
      if (claseId) {
        getSession(tallerId, claseId).then(session => {
          if (session) {
            setTitulo(session.titulo);
            setTema(session.tema);
            setObjetivo(session.objetivo);
            setCompetenciaEspecifica(session.competencia_especifica);
            setIndicadoresLogro(session.indicadores_logro);
            setConceptual(session.contenidos.conceptual);
            setProcedimental(session.contenidos.procedimental);
            setActitudinal(session.contenidos.actitudinal);
            
            const loadedFundamentales = session.contenidos.competencias_fundamentales || [];
            setSelectedFundamentales(loadedFundamentales);

            if (session.contenidos) {
              const cont = session.contenidos as any;
              if (cont.centro_educativo) setCentroEducativo(cont.centro_educativo);
              if (cont.seccion) setSeccion(cont.seccion);
              if (cont.unidad) setUnidad(cont.unidad);
              if (cont.subtema) setSubtema(cont.subtema);
              
              if (cont.metacognicion) setMetacognicion(cont.metacognicion);
              if (cont.metacognicion_tiempo !== undefined) setMetacognicionTiempo(Number(cont.metacognicion_tiempo));
              if (cont.evaluacion_tiempo !== undefined) setEvaluacionTiempo(Number(cont.evaluacion_tiempo));
            }

            // Parse specific descriptions map
            let descs: Record<string, string> = {};
            if (session.competencia_especifica) {
              try {
                if (session.competencia_especifica.startsWith('{')) {
                  descs = JSON.parse(session.competencia_especifica);
                } else {
                  const first = loadedFundamentales[0];
                  if (first) {
                    descs[first] = session.competencia_especifica;
                  }
                }
              } catch (e) {
                const first = loadedFundamentales[0];
                if (first) {
                  descs[first] = session.competencia_especifica;
                }
              }
            }
            setSpecificDescriptions(descs);

            if (session.momentos) {
              const mom = session.momentos as any;
              setInicio(mom.inicio || '');
              setDesarrollo(mom.desarrollo || '');
              setCierre(mom.cierre || '');
              
              setInicioTiempo(mom.inicio_tiempo ?? 10);
              setDesarrolloTiempo(mom.desarrollo_tiempo ?? 25);
              setCierreTiempo(mom.cierre_tiempo ?? 10);
              
              setInicioRecursos(mom.inicio_recursos || []);
              setDesarrolloRecursos(mom.desarrollo_recursos || []);
              setCierreRecursos(mom.cierre_recursos || []);
            } else {
              setInicio(session.momentos?.inicio || '');
              setDesarrollo(session.momentos?.desarrollo || '');
              setCierre(session.momentos?.cierre || '');
            }
            setRecursos(session.recursos.join(', '));
            setEvaluacion(session.evaluacion);
            setDuracion(session.duracion_minutos);
            setFecha(session.fecha);
          }
        }).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [tallerId, claseId]);

  // Derived state for curriculum fallbacks
  const availableCompetencias = useMemo(() => {
    if (!taller) return [];
    if (taller.competencias_especificas && taller.competencias_especificas.length > 0) {
      return taller.competencias_especificas.filter(c => !c.startsWith('Competencia Fundamental:'));
    }
    // Fallback to official curriculum
    const cleanGrade = getCleanGradeLevel(taller.grado || '', taller.nivel || '');
    const subjectKeyword = getSubjectKeyword(taller.tipo_taller || '');
    const match = SCIENCE_CURRICULUM_DATA.find((item: any) => {
      const gradeMatch = cleanGrade ? item.grade_level.toLowerCase().replace('1er', '1ro').replace('3er', '3ro') === cleanGrade.toLowerCase().replace('1er', '1ro').replace('3er', '3ro') : true;
      return gradeMatch && item.subject_name.toLowerCase().includes(subjectKeyword);
    });
    if (match) {
      const hasSpecificField = match.competencies.some((c: any) => c.specific);
      if (hasSpecificField) {
        return match.competencies.map((c: any) => c.specific || '').filter(Boolean);
      } else {
        return match.competencies.map((c: any) => c.description || '').filter(Boolean);
      }
    }
    return [];
  }, [taller]);

  const availableFundamentales = useMemo(() => {
    if (!taller) return [];
    
    // Extract from taller.competencias_especificas if they are prefixed
    const savedFundamentales = taller.competencias_especificas
      ?.filter(c => c.startsWith('Competencia Fundamental:'))
      .map(c => c.replace('Competencia Fundamental:', '').trim()) || [];
      
    if (savedFundamentales.length > 0) {
      return savedFundamentales.map(name => {
        const cleanGrade = getCleanGradeLevel(taller.grado || '', taller.nivel || '');
        const subjectKeyword = getSubjectKeyword(taller.tipo_taller || '');
        const match = SCIENCE_CURRICULUM_DATA.find((item: any) => {
          const gradeMatch = cleanGrade ? item.grade_level.toLowerCase().replace('1er', '1ro').replace('3er', '3ro') === cleanGrade.toLowerCase().replace('1er', '1ro').replace('3er', '3ro') : true;
          return gradeMatch && item.subject_name.toLowerCase().includes(subjectKeyword);
        });
        const found = match?.competencies?.find((c: any) => (c.name === name || c.fundamental === name)) as any;
        return {
          name,
          description: found?.description || found?.specific || ''
        };
      });
    }

    // Fallback: load from curriculum
    const cleanGrade = getCleanGradeLevel(taller.grado || '', taller.nivel || '');
    const subjectKeyword = getSubjectKeyword(taller.tipo_taller || '');
    const match = SCIENCE_CURRICULUM_DATA.find((item: any) => {
      const gradeMatch = cleanGrade ? item.grade_level.toLowerCase().replace('1er', '1ro').replace('3er', '3ro') === cleanGrade.toLowerCase().replace('1er', '1ro').replace('3er', '3ro') : true;
      return gradeMatch && item.subject_name.toLowerCase().includes(subjectKeyword);
    });
    if (match) {
      return (match.competencies || [])
        .filter((c: any) => c.type === 'FUNDAMENTAL' || c.fundamental)
        .map((c: any) => ({
          name: c.name || c.fundamental || '',
          description: c.description || c.specific || ''
        }));
    }
    return [];
  }, [taller]);

  const availableIndicators = useMemo(() => {
    if (!taller) return [];
    if (taller.indicadores && taller.indicadores.length > 0) {
      return taller.indicadores;
    }
    // Fallback to template or official curriculum
    const cleanGrade = getCleanGradeLevel(taller.grado || '', taller.nivel || '');
    const subjectKeyword = getSubjectKeyword(taller.tipo_taller || '');
    const match = SCIENCE_CURRICULUM_DATA.find((item: any) => {
      const cleanGradeLabel = cleanGrade.toLowerCase().replace('1er', '1ro').replace('3er', '3ro');
      const itemGradeLabel = item.grade_level.toLowerCase().replace('1er', '1ro').replace('3er', '3ro');
      return itemGradeLabel === cleanGradeLabel && item.subject_name.toLowerCase().includes(subjectKeyword);
    });
    if (match && match.indicators && match.indicators.length > 0) {
      return match.indicators;
    }
    const tmpl = getWorkshopTemplate(taller.tipo_taller);
    return tmpl.indicadores_por_nivel[taller.nivel] || [];
  }, [taller]);

  const handleToggleFundamental = (name: string) => {
    setSelectedFundamentales(prev => {
      const exists = prev.includes(name);
      if (exists) {
        return prev.filter(n => n !== name);
      } else {
        if (!specificDescriptions[name]) {
          const found = availableFundamentales.find(f => f.name === name);
          setSpecificDescriptions(prevDescs => ({
            ...prevDescs,
            [name]: found?.description || ''
          }));
        }
        return [...prev, name];
      }
    });
  };

  const handleUpdateDescription = (name: string, value: string) => {
    setSpecificDescriptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlanWithAI = async () => {
    if (!tema.trim()) {
      toast.warning('Por favor, ingresa el Tema del taller antes de generar con IA.');
      return;
    }

    setGeneratingAI(true);
    setLoadingTextIndex(0);

    const interval = setInterval(() => {
      setLoadingTextIndex(prev => prev + 1);
    }, 2500);

    try {
      const g = taller?.grado || '';
      const n = taller?.nivel || '';
      const displayGrade = g ? `${g} (${n})` : n;
      const displayTallerNombre = taller?.nombre || '';

       const hasPredefinedCompetencies = availableFundamentales && availableFundamentales.length > 0;
      const response = await generateWorkshopPlanning({
        tema: tema.trim(),
        grado: displayGrade,
        tallerNombre: displayTallerNombre,
        hasPredefinedCompetencies
      });

      if (response) {
        if (response.titulo) setTitulo(response.titulo);
        if (response.objetivo) setObjetivo(response.objetivo);
        if (response.conceptual) setConceptual(response.conceptual);
        if (response.procedimental) setProcedimental(response.procedimental);
        if (response.actitudinal) setActitudinal(response.actitudinal);
        
        if (response.inicio) setInicio(response.inicio);
        if (response.inicio_recursos) setInicioRecursos(response.inicio_recursos);
        
        if (response.desarrollo) setDesarrollo(response.desarrollo);
        if (response.desarrollo_recursos) setDesarrolloRecursos(response.desarrollo_recursos);
        
        if (response.cierre) setCierre(response.cierre);
        if (response.cierre_recursos) setCierreRecursos(response.cierre_recursos);
        
        if (response.evaluacion) setEvaluacion(response.evaluacion);
        if (response.duracion_minutos) setDuracion(response.duracion_minutos);

        // Competencias fundamentales and specific descriptions
        if (!hasPredefinedCompetencies && Array.isArray(response.competencias_fundamentales)) {
          setSelectedFundamentales(response.competencias_fundamentales);
          if (response.descripciones_especificas) {
            setSpecificDescriptions(prev => ({
              ...prev,
              ...response.descripciones_especificas
            }));
          }
        }

        toast.success('¡Planificación del taller generada con IA exitosamente!');
      }
    } catch (err: any) {
      console.error('Error generating with AI:', err);
      toast.error('Ocurrió un error al generar la planificación con IA.');
    } finally {
      clearInterval(interval);
      setGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    if (!tallerId || !taller || submitting) return;

    // Validation
    if (!seccion.trim()) {
      toast.error('La sección es obligatoria');
      return;
    }
    if (!titulo.trim()) {
      toast.error('El título de la clase es obligatorio');
      return;
    }
    if (!duracion || duracion <= 0) {
      toast.error('La duración es obligatoria y debe ser mayor a 0');
      return;
    }
    if (!fecha) {
      toast.error('La fecha es obligatoria');
      return;
    }
    if (!objetivo.trim()) {
      toast.error('El objetivo pedagógico es obligatorio');
      return;
    }
    if (selectedFundamentales.length === 0) {
      toast.error('Debe seleccionar al menos una Competencia Fundamental');
      return;
    }
    if (indicadoresLogro.length === 0) {
      toast.error('Debe seleccionar al menos un Indicador de Logro');
      return;
    }
    if (!conceptual.trim()) {
      toast.error('Los contenidos Conceptuales son obligatorios');
      return;
    }
    if (!procedimental.trim()) {
      toast.error('Los contenidos Procedimentales son obligatorios');
      return;
    }
    if (!actitudinal.trim()) {
      toast.error('Los contenidos Actitudinales son obligatorios');
      return;
    }
    if (!inicio.trim()) {
      toast.error('La descripción del Inicio es obligatoria');
      return;
    }
    if (!desarrollo.trim()) {
      toast.error('La descripción del Desarrollo es obligatoria');
      return;
    }
    if (!cierre.trim()) {
      toast.error('La descripción del Cierre es obligatoria');
      return;
    }
    if (!evaluacion.trim()) {
      toast.error('La evaluación es obligatoria');
      return;
    }

    setSubmitting(true);

    // Filter specific descriptions to keep only selected ones
    const filteredDescs: Record<string, string> = {};
    selectedFundamentales.forEach(name => {
      filteredDescs[name] = specificDescriptions[name] || '';
    });

    const sessionData = {
      titulo: titulo.trim(),
      tema: tema.trim(),
      objetivo: objetivo.trim(),
      competencia_especifica: JSON.stringify(filteredDescs),
      indicadores_logro: indicadoresLogro,
      contenidos: {
        conceptual: conceptual.trim(),
        procedimental: procedimental.trim(),
        actitudinal: actitudinal.trim(),
        competencias_fundamentales: selectedFundamentales,
        centro_educativo: centroEducativo,
        seccion: seccion,
        unidad: unidad,
        subtema: subtema,
        metacognicion: metacognicion.trim(),
        metacognicion_tiempo: metacognicionTiempo,
        evaluacion_tiempo: evaluacionTiempo,
      },
      momentos: {
        inicio: inicio.trim(),
        desarrollo: desarrollo.trim(),
        cierre: cierre.trim(),
        inicio_tiempo: inicioTiempo,
        desarrollo_tiempo: desarrolloTiempo,
        cierre_tiempo: cierreTiempo,
        inicio_recursos: inicioRecursos,
        desarrollo_recursos: desarrolloRecursos,
        cierre_recursos: cierreRecursos,
      },
      recursos: Array.from(new Set([
        ...inicioRecursos,
        ...desarrolloRecursos,
        ...cierreRecursos,
      ])),
      evaluacion: evaluacion.trim(),
      duracion_minutos: duracion,
      fecha: fecha,
      estado: 'pendiente' as const,
    };

    try {
      if (isEditing && claseId) {
        await updateSession(tallerId, claseId, sessionData);
        toast.success('Clase actualizada exitosamente');
      } else {
        await addSession(tallerId, sessionData);
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
        toast.success('¡Clase agregada al taller!');
      }

      setTimeout(() => navigate(`/talleres/${tallerId}`), 400);
    } catch (err) {
      toast.error('Error al guardar la clase en la base de datos');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = () => {
    try {
      console.log("[handlePreview] Starting preview data generation...");
      if (!taller) {
        toast.error("El taller no ha cargado correctamente.");
        return;
      }
      const previewData = {
        docente: user?.nombre || user?.full_name || 'Docente',
        centro_educativo: centroEducativo || 'Sin Centro Educativo',
        planningType: "TALLER",
        isTaller: true,
        grado: taller
          ? (() => {
              const g = taller.grado || '';
              const n = (taller.nivel || '').replace('inicial', 'Inicial').replace('primaria', 'Primaria').replace('secundaria', 'Secundaria');
              if (n && g.toLowerCase().includes(n.toLowerCase())) return g;
              return n ? `${g} (${n})` : g;
            })()
          : '',
        seccion: seccion || 'A',
        fecha: fecha || new Date().toISOString().split('T')[0],
        tema: (tema || '').trim(),
        area: taller.nombre || 'Taller',
        asignatura: taller.nombre || 'Taller',
        secuencia: `Clase ${classNumber}`,
        titulo: (titulo || '').trim(),
        objetivo_pedagogico: (objetivo || '').trim(),
        competencias: Array.isArray(selectedFundamentales) ? selectedFundamentales : [],
        competencias_especificas: Object.entries(specificDescriptions || {})
          .filter(([k]) => (selectedFundamentales || []).includes(k))
          .map(([k, v]) => `${k}: ${v}`),
        indicador_logro: Array.isArray(indicadoresLogro) ? indicadoresLogro.join('\n') : (typeof indicadoresLogro === 'string' ? indicadoresLogro : ''),
        conceptual: conceptual || '',
        procedimental: procedimental || '',
        actitudinal: actitudinal || '',
        momentos: [
          { moment: 'Inicio', descripcion: (inicio || '').trim(), tiempo: `${inicioTiempo || 10} minutos`, recursos: Array.isArray(inicioRecursos) ? (inicioRecursos.join(', ') || '---') : '---' },
          { moment: 'Desarrollo', descripcion: (desarrollo || '').trim(), tiempo: `${desarrolloTiempo || 25} minutos`, recursos: Array.isArray(desarrolloRecursos) ? (desarrolloRecursos.join(', ') || '---') : '---' },
          { moment: 'Cierre', descripcion: (cierre || '').trim(), tiempo: `${cierreTiempo || 10} minutos`, recursos: Array.isArray(cierreRecursos) ? (cierreRecursos.join(', ') || '---') : '---' },
        ],
        recursos: Array.from(new Set([
          ...(Array.isArray(inicioRecursos) ? inicioRecursos : []),
          ...(Array.isArray(desarrolloRecursos) ? desarrolloRecursos : []),
          ...(Array.isArray(cierreRecursos) ? cierreRecursos : []),
        ])),
        recursos_adicionales: (metacognicion || '').trim(),
        metacognicion: (metacognicion || '').trim(),
        metacognicion_tiempo: metacognicionTiempo || 15,
        evaluacion: (evaluacion || '').trim(),
        evaluacion_tiempo: evaluacionTiempo || 15,
        duracion_minutos: duracion || 45,
      };
      
      console.log("[handlePreview] previewData generated:", previewData);
      sessionStorage.setItem("plx:temp_planning_preview", JSON.stringify(previewData));
      localStorage.setItem("plx:temp_planning_preview", JSON.stringify(previewData));
      
      const newWin = window.open("/planificacion/preview?temp=true", "_blank");
      if (!newWin) {
        console.warn("[handlePreview] window.open returned null. Popup blocker likely active.");
        toast.error("El navegador bloqueó la ventana emergente de vista previa. Por favor, permite ventanas emergentes para este sitio.");
      }
    } catch (err: any) {
      console.error("[handlePreview] Critical error in handlePreview:", err);
      toast.error(`Error al abrir la vista previa: ${err?.message || err}`);
    }
  };

  const toggleIndicador = (ind: string) => {
    setIndicadoresLogro(prev =>
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    );
  };

  useEffect(() => {
    const textTimer = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % 4);
    }, 450);

    const loadTimer = setTimeout(() => {
      setIsLoadingPage(false);
    }, 1700);

    return () => {
      clearInterval(textTimer);
      clearTimeout(loadTimer);
    };
  }, []);

  if (loading || isLoadingPage) {
    const loadingTexts = [
      "Cargando Formulario...",
      "Estructurando competencias específicas y fundamentales...",
      "Preparando el entorno del taller...",
      "Inicializando planificador de clases de taller..."
    ];
    return (
      <div className="fixed inset-0 z-50 bg-bg-base text-[#1B1B1B] dark:text-zinc-150 flex flex-col items-center justify-center select-none text-center p-6">
        <div className="flex flex-col items-center justify-center max-w-xl w-full mx-auto animate-in fade-in duration-300">
          <div className="w-16 h-16 relative flex items-center justify-center mb-5">
            {/* Spinning outer circle */}
            <div className="absolute inset-0 rounded-full border-[3.5px] border-slate-200 dark:border-zinc-800 border-t-amber-500 dark:border-t-amber-500 animate-spin" />
            {/* Inner badge with Globe icon */}
            <div className="w-11 h-11 rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
            </div>
          </div>

          <h3 className="text-base font-black text-slate-805 dark:text-white tracking-tight animate-pulse">
            Preparando Entorno
          </h3>

          <div className="h-10 flex items-center justify-center mt-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingTextIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-semibold text-slate-500 dark:text-zinc-400 max-w-md text-center px-4 leading-relaxed"
              >
                {loadingTexts[loadingTextIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="w-56 h-1 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-5 relative">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-650 to-purple-650 rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  // generatingAI is rendered at the bottom of the main JSX to keep the form visible in the background

  if (!user || !taller) return null;

  const template = getWorkshopTemplate(taller.tipo_taller);
  const suggestedTopics = getSuggestedTopics(taller.tipo_taller);
  const classNumber = isEditing
    ? taller.sesiones?.find(s => s.id === claseId)?.numero_clase || 0
    : (taller.sesiones?.length || 0) + 1;

  // Navigate between sessions
  const currentIndex = isEditing ? (taller.sesiones?.findIndex(s => s.id === claseId) ?? -1) : -1;
  const prevSession = currentIndex > 0 ? taller.sesiones[currentIndex - 1] : null;
  const nextSession = currentIndex >= 0 && currentIndex < (taller.sesiones?.length ?? 0) - 1 ? taller.sesiones[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-bg-base dark:bg-zinc-950 flex flex-col relative overflow-hidden font-sans pb-10">
      {/* Academic Icons Background from /registro */}
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.018] pointer-events-none select-none z-0">
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
      </div>

      <Toaster position="top-center" richColors />

      {/* Form */}
      <div className="flex-1 px-6 pt-16 pb-8 relative z-10">
        <div className="max-w-5xl mx-auto text-left animate-in fade-in duration-500">
          {/* Centered Hero Header exactly like daily forms */}
          <div className="mb-8 relative border-b border-slate-150 dark:border-zinc-800 pb-6 text-center">
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center justify-center">
              <h1 className="font-display text-5xl tracking-tight text-[#1B1B1B] dark:text-white font-black">
                {taller.nombre}
              </h1>
              <p className="mt-2 text-sm font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                {isEditing ? 'Editar Clase de Taller' : 'Nueva Clase de Taller'}
              </p>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider mt-3 shadow-2xs ${getPastelBadgeColor(classNumber)}`}>
                Clase #{classNumber}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic info */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
              <div className="mb-4 flex items-start gap-4 text-left border-b border-slate-100 dark:border-zinc-850 pb-3">
                <span className="mt-0.5 font-sans text-2xl font-black text-brand-primary">01</span>
                <div className="text-left font-sans">
                  <h3 className="text-sm font-semibold tracking-tight text-[#1B1B1B] dark:text-white">Información General</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Datos básicos del taller, título y tema de la clase.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Centro Educativo */}
                <div id="school-field-container" className="w-full school-autocomplete-no-icon">
                  <Field
                    label="Centro educativo"
                    action={
                      <button
                        type="button"
                        onClick={() => {
                          const buttons = document.getElementById('school-field-container')?.querySelectorAll('button');
                          const targetBtn = Array.from(buttons || []).find(b => !b.className.includes('text-blue-650'));
                          if (targetBtn) (targetBtn as HTMLButtonElement).click();
                        }}
                        className="text-xs text-blue-650 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold hover:underline cursor-pointer font-sans"
                      >
                        Cambiar
                      </button>
                    }
                  >
                    <SchoolAutocomplete
                      value={centroEducativo}
                      onChange={setCentroEducativo}
                      placeholder="Buscar centro educativo..."
                    />
                  </Field>
                  <style dangerouslySetInnerHTML={{__html: `
                    .school-autocomplete-no-icon button svg {
                      display: none !important;
                    }
                  `}} />
                </div>

                {/* Nombre del Docente */}
                <Field label="Nombre del docente" required>
                  <input className={inputCls} value={user?.nombre || user?.full_name || 'Yeri Orlando'} readOnly />
                </Field>

                {/* Grado */}
                <Field label="Grado" required>
                  <input 
                    className={inputCls} 
                    value={
                      taller 
                        ? (() => {
                            const g = taller.grado || '';
                            const n = (taller.nivel || '').replace('inicial', 'Inicial').replace('primaria', 'Primaria').replace('secundaria', 'Secundaria');
                            if (n && g.toLowerCase().includes(n.toLowerCase())) return g;
                            return n ? `${g} (${n})` : g;
                          })()
                        : ''
                    } 
                    readOnly 
                  />
                </Field>

                {/* Sección */}
                <Field label="Sección" required>
                  <input
                    className={`${inputCls} font-bold uppercase`}
                    placeholder="Ej: A"
                    value={seccion}
                    onChange={(e) => setSeccion(e.target.value)}
                    required
                  />
                </Field>

                {/* Tema */}
                <div className="relative">
                  <Field label="Tema">
                    <input
                      type="text"
                      value={tema}
                      onChange={(e) => setTema(e.target.value)}
                      onFocus={() => suggestedTopics.length > 0 && setShowTopicSuggestions(true)}
                      placeholder="Ej: La materia..."
                      className={inputCls}
                    />
                  </Field>
                  {showTopicSuggestions && suggestedTopics.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-[45]" onClick={() => setShowTopicSuggestions(false)} />
                      <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 rounded-lg max-h-48 overflow-y-auto">
                        <p className="px-3 py-1.5 text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Sugerencias</p>
                        {suggestedTopics
                          .filter(t => !tema || t.toLowerCase().includes(tema.toLowerCase()))
                          .slice(0, 10)
                          .map((topic, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => { setTema(topic); setShowTopicSuggestions(false); }}
                              className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-slate-700 dark:text-zinc-455 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition cursor-pointer"
                            >
                              {topic}
                            </button>
                          ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Título de la clase */}
                <Field label="Título de la clase" required>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder={`Ej: Clase ${classNumber} - Tema...`}
                    className={inputCls}
                    required
                  />
                </Field>

                {/* Duración (minutos) */}
                <Field label="Duración (minutos)" required>
                  <input
                    type="number"
                    value={duracion}
                    onChange={(e) => setDuracion(Number(e.target.value))}
                    min={15}
                    max={120}
                    className={inputCls}
                    required
                  />
                </Field>

                <Field label="Fecha" required>
                  <DatePicker value={fecha} onChange={setFecha} />
                </Field>
              </div>

              {/* Botón Planificar taller con IA Centrado */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col items-center justify-center w-full">
                <button
                  type="button"
                  onClick={handlePlanWithAI}
                  disabled={generatingAI}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1e40af] hover:bg-[#1b3a9e] text-white text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95 border-none select-none hover:-translate-y-px"
                >
                  <Sparkles size={13} />
                  <span>Planificar taller con IA</span>
                </button>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 mt-2 font-sans">
                  Genera automáticamente el objetivo pedagógico, contenidos, momentos de clase y evaluación basados en tu Tema.
                </p>
              </div>
            </div>

            {/* Competencia y indicadores */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
              <div className="mb-4 flex items-start gap-4 text-left border-b border-slate-100 dark:border-zinc-855 pb-3">
                <span className="mt-0.5 font-sans text-2xl font-black text-brand-primary">02</span>
                <div className="text-left font-sans">
                  <h3 className="text-sm font-semibold tracking-tight text-[#1B1B1B] dark:text-white">Componentes Curriculares</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Objetivo pedagógico, estrategias e indicadores de la sesión.</p>
                </div>
              </div>

              {/* Objetivo Pedagógico */}
              <div className="mb-6 p-5 bg-slate-50/50 dark:bg-zinc-955/10 border border-slate-200/60 dark:border-zinc-800 rounded-2xl">
                <Field label="Objetivo pedagógico">
                  {editingObjetivo ? (
                    <EditableMarkdownDiv
                      value={objetivo}
                      onChange={setObjetivo}
                      placeholder="Que los estudiantes registren los aprendizajes esperados de la secuencia..."
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                      onBlur={() => setEditingObjetivo(false)}
                    />
                  ) : (
                    <div
                      onClick={() => setEditingObjetivo(true)}
                      className="cursor-text border-l-2 border-brand-primary/30 pl-3 text-sm leading-relaxed text-gray-500 dark:text-zinc-405 min-h-[40px] bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-neutral-200/50 dark:border-zinc-800/50 hover:bg-neutral-50 dark:hover:bg-zinc-850/30 transition-all select-none block"
                      title="Haz clic para editar"
                    >
                      {renderMarkdownInline(objetivo || "Que los estudiantes registren los aprendizajes esperados de la secuencia...")}
                    </div>
                  )}
                </Field>
              </div>

              {/* Competencias Fundamentales */}
              {availableFundamentales && availableFundamentales.length > 0 && (
                <div className="space-y-1.5 mb-5 text-left">
                  <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider">
                    Competencias Fundamentales (selecciona las que aplican)
                  </label>
                  <div className="space-y-2">
                    {availableFundamentales.map((comp, i) => {
                      const isSelected = selectedFundamentales.includes(comp.name);
                      const IconComponent = getFundamentalIcon(comp.name);
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => handleToggleFundamental(comp.name)}
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-brand-primary/20 bg-brand-light/20 dark:border-brand-primary/30 dark:bg-brand-primary/10 text-brand-primary dark:text-blue-400'
                              : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                              isSelected
                                ? 'border-[#1e40af] bg-[#1e40af] text-white shadow-xs'
                                : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3.5} />}
                          </span>
                          <span className={`shrink-0 transition-colors ${isSelected ? "text-brand-primary" : "text-neutral-400 dark:text-zinc-500"}`}>
                            <IconComponent size={16} />
                          </span>
                          <span className={`text-sm ${isSelected ? "font-semibold text-[#1B1B1B] dark:text-white" : "text-neutral-700 dark:text-zinc-300"}`}>
                            {comp.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Competencias Específicas del Grado (Desplegadas al seleccionar fundamentales) */}
              {selectedFundamentales.length > 0 && (
                <div className="mt-6 mb-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 p-5 text-left">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e40af]/10 text-[#1e40af] dark:bg-blue-550/15 dark:text-blue-400 shrink-0">
                        <Target className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-white">Competencias Específicas del Grado</h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-500">Descripciones detalladas de las competencias seleccionadas.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setHideSpecificCompetencies(!hideSpecificCompetencies)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-xs transition-all hover:-translate-y-px cursor-pointer ${
                        hideSpecificCompetencies
                          ? "bg-indigo-50 dark:bg-indigo-955/20 text-indigo-700 dark:text-indigo-450 border-indigo-200 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                          : "bg-rose-50 dark:bg-rose-955/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                      }`}
                      title={hideSpecificCompetencies ? "Mostrar competencias específicas" : "Ocultar competencias específicas"}
                    >
                      {hideSpecificCompetencies ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span>{hideSpecificCompetencies ? "Mostrar Específicas" : "Ocultar Específicas"}</span>
                    </button>
                  </div>

                  {!hideSpecificCompetencies ? (
                    <div className="space-y-3 animate-in fade-in duration-205">
                      {selectedFundamentales.map((name) => {
                        const editing = editingComp === name;
                        const currentDesc = specificDescriptions[name] || '';
                        return (
                          <div key={name} className="rounded-xl border border-[#1e40af]/15 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#1e40af]" />
                                <h4 className="text-sm font-semibold text-[#1e40af] dark:text-blue-400">{name}</h4>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingComp(editing ? null : name)}
                                className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1e40af] dark:text-blue-400 shadow-xs transition-all hover:-translate-y-px cursor-pointer"
                              >
                                {editing ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                                {editing ? "Listo" : "Editar texto"}
                              </button>
                            </div>
                            {editing ? (
                              <textarea
                                autoFocus
                                rows={4}
                                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-zinc-955 border border-neutral-200 dark:border-zinc-800 rounded-lg text-slate-700 dark:text-zinc-355 placeholder:text-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                                value={currentDesc}
                                onChange={(e) => handleUpdateDescription(name, e.target.value)}
                                onBlur={() => setEditingComp(null)}
                              />
                            ) : (
                              <p
                                onClick={() => setEditingComp(name)}
                                className="cursor-text border-l-2 border-[#1e40af]/30 dark:border-[#1e40af]/50 pl-3 text-sm leading-relaxed text-gray-500 dark:text-zinc-400"
                              >
                                {currentDesc || <span className="text-slate-400 italic">Sin descripción. Haz clic en "Editar texto" para agregar una.</span>}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        Las Competencias Específicas del Grado están ocultas. No se mostrarán en la impresión.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Indicadores de logro dropdown */}
              {availableIndicators && availableIndicators.length > 0 && (
                <div className="space-y-1.5 mt-5 text-left font-sans">
                  <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider">
                    INDICADORES DE LOGRO
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIndicatorsDropdown(!showIndicatorsDropdown)}
                      className="w-full flex items-center justify-between bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 hover:bg-neutral-100/30 dark:hover:bg-zinc-800/30 transition-all text-left cursor-pointer"
                    >
                      <span className="pr-2 text-left truncate text-xs">
                        {indicadoresLogro.length > 0
                          ? `${indicadoresLogro.length} indicador${indicadoresLogro.length > 1 ? "es" : ""} seleccionado${indicadoresLogro.length > 1 ? "s" : ""}`
                          : <span className="text-neutral-400">Seleccione indicadores...</span>
                        }
                      </span>
                      <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 mt-0.5 transition-transform ${showIndicatorsDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showIndicatorsDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowIndicatorsDropdown(false)} />
                        <div className="absolute left-0 right-0 mt-1.5 p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                          {availableIndicators.map((ind, idx) => {
                            const checked = indicadoresLogro.includes(ind);
                            return (
                              <div
                                key={idx}
                                onClick={() => toggleIndicador(ind)}
                                className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-left select-none ${
                                  checked ? "bg-brand-light/10 dark:bg-brand-primary/5" : "hover:bg-neutral-50 dark:hover:bg-zinc-800/50"
                                }`}
                              >
                                <span
                                  className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-all mt-0.5 ${
                                    checked
                                      ? "border-brand-primary bg-brand-primary text-white"
                                      : "border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                  }`}
                                >
                                  {checked && <Check className="h-3 w-3 text-white" strokeWidth={3.5} />}
                                </span>
                                <span className={`text-xs ${checked ? "font-semibold text-[#1B1B1B] dark:text-white" : "text-neutral-755 dark:text-zinc-300 font-medium leading-relaxed"}`}>
                                  {renderMarkdownInline(ind)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Selected indicators as removable chips */}
                  {indicadoresLogro.length > 0 && (() => {
                    const chipColors = [
                      "bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-955/30 dark:border-indigo-800/40 dark:text-indigo-200",
                      "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-955/30 dark:border-emerald-800/40 dark:text-emerald-200",
                      "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-955/30 dark:border-amber-800/40 dark:text-amber-200",
                      "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-955/30 dark:border-rose-800/40 dark:text-rose-200",
                      "bg-teal-50 border-teal-200 text-teal-955/30 dark:border-teal-800/40 dark:text-teal-200",
                      "bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-955/30 dark:border-violet-800/40 dark:text-violet-200",
                      "bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-955/30 dark:border-sky-800/40 dark:text-sky-200",
                      "bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-955/30 dark:border-orange-800/40 dark:text-orange-200",
                      "bg-cyan-50 border-cyan-200 text-cyan-900 dark:bg-cyan-955/30 dark:border-cyan-800/40 dark:text-cyan-200",
                    ];
                    return (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {indicadoresLogro.map((ind, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all group ${chipColors[idx % chipColors.length]}`}
                          >
                            <span className="flex-1 truncate font-medium leading-relaxed">
                              {renderMarkdownInline(ind)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIndicadoresLogro(indicadoresLogro.filter((x) => x !== ind))}
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-current opacity-40 hover:opacity-100 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-955/30 dark:hover:text-red-400 transition-all cursor-pointer"
                              title="Eliminar indicador"
                            >
                              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Contenidos Curriculares */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
              <div className="mb-4 flex items-start gap-4 text-left border-b border-slate-100 dark:border-zinc-850 pb-3">
                <span className="mt-0.5 font-sans text-2xl font-black text-brand-primary">03</span>
                <div className="text-left font-sans">
                  <h3 className="text-sm font-semibold tracking-tight text-[#1B1B1B] dark:text-white">Contenidos Curriculares</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Contenidos conceptuales, procedimentales y actitudinales de la clase.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider">CONCEPTUALES (UNIDADES)</label>
                  <AutoGrowingTextarea
                    value={conceptual}
                    onChange={(e) => setConceptual(e.target.value)}
                    placeholder="Lista de conceptos (uno por línea)..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs resize-none"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider">PROCEDIMENTALES (ACTIVIDADES)</label>
                  <AutoGrowingTextarea
                    value={procedimental}
                    onChange={(e) => setProcedimental(e.target.value)}
                    placeholder="Lista de procedimientos (uno por línea)..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs resize-none"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider">ACTITUDINALES / EVALUACIÓN</label>
                  <AutoGrowingTextarea
                    value={actitudinal}
                    onChange={(e) => setActitudinal(e.target.value)}
                    placeholder="Lista de actitudes y valores (uno por línea)..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Secuencia Didáctica (Momentos) */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-6">
              <div className="mb-4 flex items-start gap-4 text-left border-b border-slate-100 dark:border-zinc-850 pb-3">
                <span className="mt-0.5 font-sans text-2xl font-black text-brand-primary">04</span>
                <div className="text-left font-sans">
                  <h3 className="text-sm font-semibold tracking-tight text-[#1B1B1B] dark:text-white">Secuencia Didáctica (Momentos)</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Actividades planificadas de inicio, desarrollo y cierre de la clase.</p>
                </div>
              </div>

              {/* INICIO card */}
              <div className="bg-green-50/50 dark:bg-green-955/10 rounded-3xl p-6 border border-green-150 dark:border-green-900/30 shadow-xs text-left">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-green-100 dark:border-green-900/20">
                  <span className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-widest bg-green-100 dark:bg-green-955 px-3 py-1 rounded-full border border-green-200/50 dark:border-green-900/35">
                    Inicio
                  </span>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-2xs relative text-left">
                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    <div className="w-full md:w-28 shrink-0">
                      <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                        MOMENTO
                      </label>
                      <div className="h-10 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center font-display text-sm font-black text-slate-805 dark:text-white">
                        #1
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 w-full text-left">
                      <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                        ACTIVIDADES
                      </label>
                      {editingInicio ? (
                        <EditableMarkdownDiv
                          value={inicio}
                          onChange={setInicio}
                          placeholder="Actividad de apertura, motivación, exploración de saberes previos..."
                          className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                          onBlur={() => setEditingInicio(false)}
                        />
                      ) : (
                        <div
                          onClick={() => setEditingInicio(true)}
                          className="cursor-text border-l-2 border-brand-primary/30 pl-3 text-xs leading-relaxed text-gray-500 dark:text-zinc-400 min-h-[60px] bg-neutral-50 dark:bg-zinc-900/30 px-3.5 py-2.5 rounded-lg border border-neutral-200/50 dark:border-zinc-800/50 hover:bg-neutral-100/50 dark:hover:bg-zinc-800/30 transition-all select-none block"
                          title="Haz clic para editar"
                        >
                          {renderMarkdownInline(inicio || "Actividad de apertura, motivación, exploración de saberes previos...")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tiempo y Recursos del Momento */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-start w-full">
                    {/* Tiempo */}
                    <div className="w-full sm:w-36">
                      <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider mb-1">
                        Tiempo (minutos)
                      </label>
                      <input
                        type="number"
                        value={inicioTiempo}
                        onChange={(e) => setInicioTiempo(Number(e.target.value))}
                        className={inputCls}
                        placeholder="10"
                        min={1}
                      />
                    </div>
                    
                    {/* Recursos */}
                    <div className="flex-1 w-full">
                      <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider mb-1">
                        Recursos del Momento
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inicioRecursoInput}
                          onChange={(e) => setInicioRecursoInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (inicioRecursoInput.trim()) {
                                setInicioRecursos([...inicioRecursos, inicioRecursoInput.trim()]);
                                setInicioRecursoInput('');
                              }
                            }
                          }}
                          placeholder="Escribe un recurso y pulsa Enter o +"
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (inicioRecursoInput.trim()) {
                              setInicioRecursos([...inicioRecursos, inicioRecursoInput.trim()]);
                              setInicioRecursoInput('');
                            }
                          }}
                          className="h-10 px-4 shrink-0 bg-[#1e40af] hover:bg-[#1b3a9e] text-white flex items-center gap-1.5 rounded-lg shadow-sm transition active:scale-95 cursor-pointer text-xs font-bold"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                          <span>Añadir</span>
                        </button>
                      </div>
                      
                      {/* Listado de recursos */}
                      {inicioRecursos.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {inicioRecursos.map((rec, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${pastelColors[idx % pastelColors.length]}`}
                            >
                              {rec}
                              <button
                                type="button"
                                onClick={() => setInicioRecursos(inicioRecursos.filter((_, i) => i !== idx))}
                                className="text-current opacity-60 hover:opacity-100 hover:text-red-500 transition cursor-pointer border-none bg-transparent"
                              >
                                <X size={10} strokeWidth={3} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* DESARROLLO card */}
              <div className="bg-amber-50/50 dark:bg-amber-955/10 rounded-3xl p-6 border border-amber-155 dark:border-amber-900/30 shadow-xs text-left">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-amber-100 dark:border-amber-900/20">
                  <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-100 dark:bg-amber-955 px-3 py-1 rounded-full border border-amber-200/50 dark:border-amber-900/35">
                    Desarrollo
                  </span>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-2xs relative text-left">
                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    <div className="w-full md:w-28 shrink-0">
                      <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                        MOMENTO
                      </label>
                      <div className="h-10 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center font-display text-sm font-black text-slate-805 dark:text-white">
                        #1
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 w-full text-left">
                      <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                        ACTIVIDADES
                      </label>
                      {editingDesarrollo ? (
                        <EditableMarkdownDiv
                          value={desarrollo}
                          onChange={setDesarrollo}
                          placeholder="Actividades principales, explicación, práctica guiada..."
                          className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                          onBlur={() => setEditingDesarrollo(false)}
                        />
                      ) : (
                        <div
                          onClick={() => setEditingDesarrollo(true)}
                          className="cursor-text border-l-2 border-brand-primary/30 pl-3 text-xs leading-relaxed text-gray-500 dark:text-zinc-400 min-h-[80px] bg-neutral-50 dark:bg-zinc-900/30 px-3.5 py-2.5 rounded-lg border border-neutral-200/50 dark:border-zinc-800/50 hover:bg-neutral-100/50 dark:hover:bg-zinc-800/30 transition-all select-none block"
                          title="Haz clic para editar"
                        >
                          {renderMarkdownInline(desarrollo || "Actividades principales, explicación, práctica guiada...")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tiempo y Recursos del Momento */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-start w-full">
                    {/* Tiempo */}
                    <div className="w-full sm:w-36">
                      <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider mb-1">
                        Tiempo (minutos)
                      </label>
                      <input
                        type="number"
                        value={desarrolloTiempo}
                        onChange={(e) => setDesarrolloTiempo(Number(e.target.value))}
                        className={inputCls}
                        placeholder="25"
                        min={1}
                      />
                    </div>
                    
                    {/* Recursos */}
                    <div className="flex-1 w-full">
                      <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider mb-1">
                        Recursos del Momento
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={desarrolloRecursoInput}
                          onChange={(e) => setDesarrolloRecursoInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (desarrolloRecursoInput.trim()) {
                                setDesarrolloRecursos([...desarrolloRecursos, desarrolloRecursoInput.trim()]);
                                setDesarrolloRecursoInput('');
                              }
                            }
                          }}
                          placeholder="Escribe un recurso y pulsa Enter o +"
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (desarrolloRecursoInput.trim()) {
                              setDesarrolloRecursos([...desarrolloRecursos, desarrolloRecursoInput.trim()]);
                              setDesarrolloRecursoInput('');
                            }
                          }}
                          className="h-10 px-4 shrink-0 bg-[#1e40af] hover:bg-[#1b3a9e] text-white flex items-center gap-1.5 rounded-lg shadow-sm transition active:scale-95 cursor-pointer text-xs font-bold"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                          <span>Añadir</span>
                        </button>
                      </div>
                      
                      {/* Listado de recursos */}
                      {desarrolloRecursos.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {desarrolloRecursos.map((rec, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${pastelColors[idx % pastelColors.length]}`}
                            >
                              {rec}
                              <button
                                type="button"
                                onClick={() => setDesarrolloRecursos(desarrolloRecursos.filter((_, i) => i !== idx))}
                                className="text-current opacity-60 hover:opacity-100 hover:text-red-500 transition cursor-pointer border-none bg-transparent"
                              >
                                <X size={10} strokeWidth={3} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CIERRE card */}
              <div className="bg-blue-50/50 dark:bg-blue-955/10 rounded-3xl p-6 border border-blue-150 dark:border-blue-900/30 shadow-xs text-left">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-blue-100 dark:border-blue-900/20">
                  <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest bg-blue-100 dark:bg-blue-955 px-3 py-1 rounded-full border border-blue-200/50 dark:border-blue-900/35">
                    Cierre, Retroalimentación y Metacognición
                  </span>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-2xs relative text-left">
                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    <div className="w-full md:w-28 shrink-0">
                      <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                        MOMENTO
                      </label>
                      <div className="h-10 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center font-display text-sm font-black text-slate-805 dark:text-white">
                        #1
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 w-full text-left">
                      <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                        ACTIVIDADES
                      </label>
                      {editingCierre ? (
                        <EditableMarkdownDiv
                          value={cierre}
                          onChange={setCierre}
                          placeholder="Síntesis de lo aprendido, preguntas de metacognición (¿qué aprendimos hoy?, ¿cómo lo aprendimos?), y retroalimentación final..."
                          className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                          onBlur={() => setEditingCierre(false)}
                        />
                      ) : (
                        <div
                          onClick={() => setEditingCierre(true)}
                          className="cursor-text border-l-2 border-brand-primary/30 pl-3 text-xs leading-relaxed text-gray-500 dark:text-zinc-400 min-h-[60px] bg-neutral-50 dark:bg-zinc-900/30 px-3.5 py-2.5 rounded-lg border border-neutral-200/50 dark:border-zinc-800/50 hover:bg-neutral-100/50 dark:hover:bg-zinc-800/30 transition-all select-none block"
                          title="Haz clic para editar"
                        >
                          {renderMarkdownInline(cierre || "Síntesis de lo aprendido, preguntas de metacognición (¿qué aprendimos hoy?, ¿cómo lo aprendimos?), y retroalimentación final...")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tiempo y Recursos del Momento */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-start w-full">
                    {/* Tiempo */}
                    <div className="w-full sm:w-36">
                      <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider mb-1">
                        Tiempo (minutos)
                      </label>
                      <input
                        type="number"
                        value={cierreTiempo}
                        onChange={(e) => setCierreTiempo(Number(e.target.value))}
                        className={inputCls}
                        placeholder="10"
                        min={1}
                      />
                    </div>
                    
                    {/* Recursos */}
                    <div className="flex-1 w-full">
                      <label className="block text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider mb-1">
                        Recursos del Momento
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cierreRecursoInput}
                          onChange={(e) => setCierreRecursoInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (cierreRecursoInput.trim()) {
                                setCierreRecursos([...cierreRecursos, cierreRecursoInput.trim()]);
                                setCierreRecursoInput('');
                              }
                            }
                          }}
                          placeholder="Escribe un recurso y pulsa Enter o +"
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (cierreRecursoInput.trim()) {
                              setCierreRecursos([...cierreRecursos, cierreRecursoInput.trim()]);
                              setCierreRecursoInput('');
                            }
                          }}
                          className="h-10 px-4 shrink-0 bg-[#1e40af] hover:bg-[#1b3a9e] text-white flex items-center gap-1.5 rounded-lg shadow-sm transition active:scale-95 cursor-pointer text-xs font-bold"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                          <span>Añadir</span>
                        </button>
                      </div>
                      
                      {/* Listado de recursos */}
                      {cierreRecursos.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {cierreRecursos.map((rec, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${pastelColors[idx % pastelColors.length]}`}
                            >
                              {rec}
                              <button
                                type="button"
                                onClick={() => setCierreRecursos(cierreRecursos.filter((_, i) => i !== idx))}
                                className="text-current opacity-60 hover:opacity-100 hover:text-red-500 transition cursor-pointer border-none bg-transparent"
                              >
                                <X size={10} strokeWidth={3} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cierre y Evaluación */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 mt-4">
                <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 dark:border-zinc-855 pb-3">
                  <div className="flex items-start gap-4 text-left">
                    <span className="mt-0.5 font-sans text-2xl font-black text-brand-primary">05</span>
                    <div className="text-left font-sans">
                      <h3 className="text-sm font-semibold tracking-tight text-[#1B1B1B] dark:text-white">Cierre y Evaluación</h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400 font-medium">Reflexión final y criterios de evaluación del aprendizaje.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  {/* Evaluacion */}
                  <div className="space-y-1.5 text-left">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[10.5px] font-black text-slate-700 dark:text-zinc-355 uppercase tracking-wider">
                        Evaluación
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">TIEMPO:</span>
                        <input
                          type="number"
                          value={evaluacionTiempo}
                          onChange={(e) => setEvaluacionTiempo(Number(e.target.value))}
                          className="w-12 h-6 text-center text-xs font-bold bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-md focus:outline-none"
                          min={1}
                        />
                        <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">MIN</span>
                      </div>
                    </div>
                    {editingEvaluacion ? (
                      <EditableMarkdownDiv
                        value={evaluacion}
                        onChange={setEvaluacion}
                        placeholder="Criterios e indicadores de evaluación, instrumentos, evidencias..."
                        className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-xs text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                        onBlur={() => setEditingEvaluacion(false)}
                      />
                    ) : (
                      <div
                        onClick={() => setEditingEvaluacion(true)}
                        className="cursor-text border-l-2 border-brand-primary/30 pl-3 text-xs leading-relaxed text-gray-500 dark:text-zinc-400 min-h-[60px] bg-neutral-50 dark:bg-zinc-900/30 px-3.5 py-2.5 rounded-lg border border-neutral-200/50 dark:border-zinc-800/50 hover:bg-neutral-100/50 dark:hover:bg-zinc-800/30 transition-all select-none block"
                        title="Haz clic para editar"
                      >
                        {renderMarkdownInline(evaluacion || "Criterios e indicadores de evaluación, instrumentos, evidencias...")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/talleres/${tallerId}`)}
                  className="flex items-center gap-2 text-xs font-black text-white bg-[#1e40af] hover:bg-[#1b3a9e] px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer active:scale-95 select-none"
                >
                  ← Volver al taller
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/talleres/${tallerId}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-55 hover:bg-rose-100 dark:bg-rose-955/20 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-350 border border-rose-200 dark:border-rose-900/30 px-5.5 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px cursor-pointer shadow-xs hover:shadow-sm"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1e40af] hover:bg-[#1b3a9e] text-white px-5.5 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px cursor-pointer shadow-md border-none"
                >
                  <Eye className="h-4 w-4" /> Vista previa
                </button>
                
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting}
                  className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px cursor-pointer border-none shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Guardando clase taller...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Guardar clase taller
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* SYNTHESIZING OVERLAY LOADER */}
      {generatingAI && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200 cursor-pointer" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => setGeneratingAI(false)}
        >
          <div 
            className="w-full max-w-[380px] p-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[32px] shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200 mx-4 text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center justify-center p-8 pt-10 pb-7 text-center relative animate-in fade-in duration-300">
              <button
                type="button"
                onClick={() => setGeneratingAI(false)}
                className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1.5 shadow-md transition-all duration-200 cursor-pointer border-none"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              
              <div className="w-32 h-32 flex items-center justify-center relative overflow-hidden select-none pointer-events-none mb-2">
                {/* @ts-ignore */}
                <lottie-player
                  src="/animacion.json"
                  background="transparent"
                  speed="1.2"
                  style={{ width: "130px", height: "130px" }}
                  loop
                  autoplay
                />
              </div>
              
              <div className="space-y-1.5">
                <h4 className="text-xl font-bold text-slate-905 dark:text-zinc-100 tracking-tight">
                  Diseñando Taller
                </h4>
                <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                  Redactando la propuesta curricular. Esto puede tomar unos segundos.
                </p>
              </div>

              <div className="w-full max-w-[260px] h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-5 relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                  initial={{ left: "-100%", width: "50%" }}
                  animate={{ left: "150%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.6,
                    ease: "easeInOut"
                  }}
                  style={{ position: "absolute", top: 0 }}
                />
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-500 dark:text-zinc-400">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500/20 border-t-indigo-600 animate-spin" />
                <span className="font-semibold tracking-wide">Generando...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const renderMarkdownInline = (text: string) => {
  if (!text) return "";
  let cleaned = text.replace(/\*(?!\*)(.*?)\*\*/g, '**$1**');
  cleaned = cleaned.replace(/\*\*(.*?)\*(?!\*)/g, '**$1**');
  
  const segments = cleaned.split("**");
  return segments.map((seg, i) => {
    if (i % 2 === 1) {
      const cleanSeg = seg.replace(/\*/g, '');
      return <strong key={i} className="font-extrabold text-[#1B1B1B] dark:text-white">{cleanSeg}</strong>;
    }
    const cleanSeg = seg.replace(/\*/g, '');
    return cleanSeg;
  });
};

interface EditableMarkdownDivProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  onBlur?: () => void;
}

function EditableMarkdownDiv({
  value,
  onChange,
  placeholder,
  className,
  onBlur
}: EditableMarkdownDivProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const toHTML = (text: string) => {
    if (!text) return "";
    let cleaned = text.replace(/\*(?!\*)(.*?)\*\*/g, '**$1**');
    cleaned = cleaned.replace(/\*\*(.*?)\*(?!\*)/g, '**$1**');
    const segments = cleaned.split("**");
    return segments.map((seg, i) => {
      if (i % 2 === 1) {
        const cleanSeg = seg.replace(/\*/g, '');
        return `<strong>${cleanSeg}</strong>`;
      }
      const cleanSeg = seg.replace(/\*/g, '');
      return cleanSeg;
    }).join('');
  };

  const toMarkdown = (html: string) => {
    let text = html;
    text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    text = text.replace(/<div[^>]*>/gi, '\n').replace(/<\/div>/gi, '');
    text = text.replace(/<p[^>]*>/gi, '\n').replace(/<\/p>/gi, '');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const cleaned = doc.documentElement.textContent || doc.body.textContent || text;
    // Remove extra trailing newlines if browser inserted any
    return cleaned.trim();
  };

  React.useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = toHTML(value);
      ref.current.focus();
      try {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(ref.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch (e) {}
    }
  }, []);

  const handleBlur = () => {
    if (ref.current) {
      const html = ref.current.innerHTML;
      const md = toMarkdown(html);
      onChange(md);
    }
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`${className} cursor-text outline-none focus:ring-1 focus:ring-[#1B1B1B]/10 focus:border-[#1B1B1B] dark:focus:border-neutral-205 overflow-y-auto min-h-[60px] max-h-[300px] select-text`}
      style={{ whiteSpace: 'pre-wrap' }}
    />
  );
}

const pastelColors = [
  "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-955/20 dark:text-rose-300 dark:border-rose-900/30",
  "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-955/20 dark:text-sky-300 dark:border-sky-900/30",
  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-955/20 dark:text-emerald-300 dark:border-emerald-900/30",
  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/20 dark:text-amber-300 dark:border-amber-900/30",
  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-955/20 dark:text-purple-300 dark:border-purple-900/30",
  "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-955/20 dark:text-indigo-300 dark:border-indigo-900/30",
  "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-955/20 dark:text-orange-300 dark:border-orange-900/30",
  "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-955/20 dark:text-teal-300 dark:border-teal-900/30",
];

const getPastelBadgeColor = (classNum: number | string) => {
  const num = typeof classNum === 'number' ? classNum : parseInt(classNum) || 1;
  const colors = [
    "bg-rose-100 text-rose-700 dark:bg-rose-955/35 dark:text-rose-300 border-rose-200/50 dark:border-rose-900/30",
    "bg-sky-100 text-sky-700 dark:bg-sky-955/35 dark:text-sky-300 border-sky-200/50 dark:border-sky-900/30",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-955/35 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/30",
    "bg-amber-100 text-amber-700 dark:bg-amber-955/35 dark:text-amber-300 border-amber-200/50 dark:border-amber-900/30",
    "bg-purple-100 text-purple-700 dark:bg-purple-955/35 dark:text-purple-300 border-purple-200/50 dark:border-purple-900/30",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-955/35 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-900/30",
    "bg-orange-100 text-orange-700 dark:bg-orange-955/35 dark:text-orange-300 border-orange-200/50 dark:border-orange-900/30",
    "bg-teal-100 text-teal-700 dark:bg-teal-955/35 dark:text-teal-300 border-teal-200/50 dark:border-teal-900/30",
  ];
  return colors[num % colors.length];
};

const inputCls =
  "w-full h-10 bg-neutral-55 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-zinc-900 disabled:text-gray-400";

function Field({
  label,
  required,
  action,
  children,
}: {
  label: string;
  required?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="block text-left w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-355 font-sans">
          {label}
          {required && <span className="ml-1 text-red-500 dark:text-red-400">*</span>}
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}

interface AutoGrowingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

const AutoGrowingTextarea = React.forwardRef<HTMLTextAreaElement, AutoGrowingTextareaProps>(
  ({ value, className, ...props }, ref) => {
    const localRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
      const el = localRef.current;
      if (el) {
        if (isFocused) {
          el.style.height = "auto";
          el.style.height = `${Math.max(150, el.scrollHeight)}px`;
        } else {
          el.style.height = props.rows ? `${Number(props.rows) * 14 + 16}px` : "60px";
        }
      }
    }, [value, isFocused, props.rows]);

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (isFocused) {
        const el = e.currentTarget;
        el.style.height = "auto";
        el.style.height = `${Math.max(150, el.scrollHeight)}px`;
      }
      if (props.onInput) {
        props.onInput(e as any);
      }
    };

    return (
      <textarea
        ref={(el) => {
          localRef.current = el;
          if (typeof ref === "function") {
            ref(el);
          } else if (ref) {
            (ref as any).current = el;
          }
        }}
        value={value}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        onInput={handleInput}
        className={`${className} transition-all duration-200 resize-none overflow-y-auto`}
        {...props}
      />
    );
  }
);
AutoGrowingTextarea.displayName = "AutoGrowingTextarea";
