import DifferentiatedActivitiesSection from "../../../DifferentiatedActivitiesSection";
import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Accessibility,
  BookOpen,
  Save,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronDown,
  CalendarDays,
  BrainCircuit,
  MessageSquare,
  Scale,
  Gamepad2,
  Check,
  Pencil,
  Eye,
  EyeOff,
  Maximize2,
  ShieldQuestion,
  Loader2,
  School,
  Languages,
  FlaskConical,
  Palette,
  Library,
  BookMarked,
  Brain,
  Atom,
  Scroll,
  Shapes,
  Globe,
  Compass,
  Notebook,
  Award,
  Calculator,
  Music,
  PenTool,
  GraduationCap,
  Lightbulb,
  Target,
  Volume2,
  Mic,
  History,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { DatePicker } from "../../../../ui/heroui-date-picker";
import SchoolAutocomplete from "../../../SchoolAutocomplete";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

// Import AI service functions
import {
  generateBloom,
  generateInclusion,
  generateGamify,
  generateAudit,
  generateEvaluationAndMeta,
  generateComplementaryActivities,
  generateSaberesPrevios,
  generateRetroalimentacion,
} from "../../../../../lib/services/aiService";
import { fetchPlannings } from "../../../../../lib/services/plannings";

// Import standalone premium AI modals
import BloomLevelerModal from "../../../../ai/BloomLevelerModal";
import InclusionModal from "../../../../ai/InclusionModal";
import GamifyModal from "../../../../ai/GamifyModal";
import CurricularCoherenceReport from "../../../../ai/CurricularCoherenceReport";

// Import compiled 2nd cycle sequences for Matemática 4to
import compiled2ndCycleSequences from "../../../../../lib/data/sequences/primaria/compiled_2nd_cycle_sequences.json";

const markdownToHtml = (text: string): string => {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map(p => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("");
    
  return html;
};

const htmlToMarkdown = (html: string): string => {
  if (!html) return "";
  let text = html;
  text = text.replace(/<p[^>]*>/gi, "").replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<div>/gi, "\n").replace(/<\/div>/gi, "");
  text = text.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, "**$2**");
  text = text.replace(/<[^>]+>/g, "");
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
    
  return text.trim();
};

const MATEMATICA_5TO_SEQUENCES = Object.values(compiled2ndCycleSequences as Record<string, any>)
  .filter((s: any) => s.subject_id === 'matematica-5to')
  .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  .map((seq: any, idx: number) => {
    const activities = (seq.activities || []).map((act: any, aIdx: number) => ({
      ...act,
      id: act.id || `act-${seq.id}-${aIdx+1}`,
      title: act.title || act.activityTitle || `Actividad ${aIdx+1}`
    }));
    return {
      ...seq,
      id: seq.id,
      title: seq.title || `Secuencia ${idx+1}`,
      description: seq.description || `Secuencia didáctica de Matemática 5to grado.`,
      order: seq.order !== undefined ? seq.order : idx + 1,
      durationWeeks: seq.durationWeeks !== undefined ? seq.durationWeeks : 4,
      activities,
      blocks: [
        {
          id: `blk-${seq.id}-1`,
          title: "Bloque Único",
          activities
        }
      ]
    };
  }) as any[];

const splitMomentsText = (text: string): { inicio?: string; desarrollo?: string; cierre?: string } => {
  const result: { inicio?: string; desarrollo?: string; cierre?: string } = {};
  if (!text) return result;

  const regex = /(?:^|\n)(?:###|\*\*|Momento\s*\d+\s*:?)\s*(Inicio|Desarrollo|Cierre|Moment\s*1|Moment\s*2|Moment\s*3)\b/gi;
  const matches: { index: number; type: "inicio" | "desarrollo" | "cierre"; length: number }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const typeStr = match[1].toLowerCase();
    let type: "inicio" | "desarrollo" | "cierre" = "inicio";
    if (typeStr.includes("desarrollo") || typeStr.includes("2")) type = "desarrollo";
    else if (typeStr.includes("cierre") || typeStr.includes("3")) type = "cierre";
    
    matches.push({
      index: match.index,
      type,
      length: match[0].length
    });
  }
  
  matches.sort((a, b) => a.index - b.index);
  
  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const startPos = current.index + current.length;
      const endPos = next ? next.index : text.length;
      const content = text.slice(startPos, endPos).trim();
      
      const cleanContent = content.replace(/^[:\s*-]+/, "").trim();
      if (cleanContent) {
        result[current.type] = cleanContent;
      }
    }
  }
  
  return result;
};

type CompetenciaKey = "razonamiento" | "comunicativa" | "etica";

const COMPETENCIAS: { key: CompetenciaKey; label: string; defaultDesc: string }[] = [
  {
    key: "razonamiento",
    label: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
    defaultDesc:
      "Interpreta y resuelve problemas matemáticos relativos a situaciones del entorno, a partir de la aplicación de estrategias de razonamiento lógico, utilizando recursos y herramientas tecnológicas para comunicar los resultados de sus investigaciones.",
  },
  {
    key: "comunicativa",
    label: "Comunicativa",
    defaultDesc:
      "Utiliza el lenguaje matemático (números, símbolos, tablas, gráficos) para comunicar ideas y resultados de forma oral y escrita, con claridad y precisión, en situaciones de la vida cotidiana.",
  },
  {
    key: "etica",
    label: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
    defaultDesc:
      "Aplica el pensamiento matemático para analizar situaciones del entorno social, ambiental y de salud, tomando decisiones responsables y éticas basadas en datos y evidencias cuantitativas.",
  },
];

const COMPETENCY_GROUPS = [
  {
    id: "razonamiento",
    label: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
    specifics: [
      {
        name: "Razonamiento y Argumentación",
        description: "Interpreta y resuelve problemas matemáticos relativos a situaciones del entorno, a partir de la aplicación de estrategias de razonamiento lógico."
      }
    ]
  },
  {
    id: "comunicativa",
    label: "Comunicativa",
    specifics: [
      {
        name: "Comunicación y Representación",
        description: "Utiliza el lenguaje matemático (números, símbolos, tablas, gráficos) para comunicar ideas y resultados de forma oral y escrita."
      }
    ]
  },
  {
    id: "etica",
    label: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
    specifics: [
      {
        name: "Ética y Ciudadana",
        description: "Aplica el pensamiento matemático para analizar situaciones del entorno social, ambiental y de salud."
      }
    ]
  }
];

const SEQUENCE_COMPETENCIES: Record<string, string[]> = {
  "Números Naturales como mínimo hasta el 999,999": [
    "Razonamiento y argumentación: Comprende el significado de los números naturales hasta el 999,999, su valor de posición, y las relaciones de orden en situaciones del entorno.",
    "Comunicación: Lee, escribe, representa y compara números naturales hasta el 999,999 en forma usual, desarrollada y ordinal.",
    "Resolución de problemas: Resuelve problemas cotidianos utilizando la comprensión de los números naturales y su valor posicional."
  ],
  "Adición y sustracción de números naturales": [
    "Resolución de problemas: Resuelve problemas de la vida diaria utilizando operaciones de adición y sustracción con números naturales.",
    "Razonamiento y argumentación: Selecciona y aplica estrategias de cálculo mental, estimación y algoritmos escritos para sumar y restar.",
    "Comunicación: Explica y socializa los procedimientos utilizados para resolver problemas que involucren sumas y restas."
  ],
  "Multiplicación y división de números naturales": [
    "Resolución de problemas: Resuelve problemas cotidianos que involucren multiplicación y división con números naturales.",
    "Razonamiento y argumentación: Utiliza propiedades de la multiplicación y estrategias de cálculo mental o escrito para multiplicar y dividir.",
    "Comunicación: Expresa con claridad los pasos seguidos al resolver operaciones de multiplicación y división en contextos reales."
  ],
  "Números fraccionarios y decimales": [
    "Razonamiento y argumentación: Identifica y representa números fraccionarios (propias, impropias, equivalentes) y números decimales hasta las centésimas.",
    "Comunicación: Lee, escribe y asocia expresiones fraccionarias y decimales en problemas de reparto y medición.",
    "Resolución de problemas: Resuelve problemas que requieran el uso de fracciones y decimales en el contexto del hogar y la comunidad."
  ],
  "Geometría (A)": [
    "Modelado geométrico: Identifica, describe y clasifica líneas, ángulos y figuras bidimensionales (triángulos y cuadriláteros) en objetos del entorno.",
    "Razonamiento espacial: Construye representaciones de figuras geométricas planas utilizando instrumento de geometría.",
    "Resolución de problemas: Resuelve problemas prácticos determinando el perímetro de polígonos regulares y no regulares."
  ],
  "Geometría B": [
    "Modelado geométrico: Identifica y describe cuerpos geométricos tridimensionales (prismas, pirámides, cilindros, conos, esferas) y sus elementos.",
    "Razonamiento espacial: Construye y despliega plantillas para formar cuerpos geométricos tridimensionales.",
    "Resolución de problemas: Resuelve situaciones problemáticas relacionadas con la identificación y clasificación de cuerpos geométricos del entorno."
  ],
  "Medición": [
    "Medición y estimación: Utiliza instrumentos de medida para determinar longitud, capacidad, masa, tiempo y temperatura en actividades escolares y domésticas.",
    "Razonamiento y argumentación: Realiza conversiones sencillas entre unidades del mismo sistema métrico decimal.",
    "Resolución de problemas: Resuelve problemas prácticos de medición en situaciones cotidianas de compra, cocina, construcción o deporte."
  ],
  "Estadística": [
    "Organización y análisis de datos: Recolecta, organiza y clasifica datos estadísticos del entorno utilizando tablas de frecuencia.",
    "Comunicación: Construye y lee información presentada en gráficos de barras simples, pictogramas y gráficos de línea.",
    "Resolución de problemas: Resuelve problemas a partir de la interpretación de la moda y de los datos representados en gráficos."
  ]
};

const FALLBACK_INDICATORS = [
  "**Identifica y representa** números naturales hasta el 999,999 y su valor de posición en situaciones del entorno.",
  "**Resuelve problemas de** adición, sustracción, multiplicación y división con números naturales utilizando algoritmos y cálculo mental.",
  "**Identifica, lee, escribe** y representa fracciones y números decimales en la resolución de problemas de la vida cotidiana.",
  "**Clasifica y construye** figuras geométricas bidimensionales y cuerpos geométricos tridimensionales según sus características y propiedades.",
  "**Estima, mide y** realiza conversiones básicas de unidades de longitud, masa, capacidad, tiempo y temperatura.",
  "**Recolecta, organiza e** interpreta datos estadísticos presentados en tablas de frecuencia y gráficos de barras.",
  "**Muestra interés y** perseverancia al resolver problemas matemáticos de manera individual y en equipos de trabajo."
];

export interface Matematica5toProps {
  user: any;
  selectedSequence: any;
  selectedSequenceType: "CON_BASE" | "CURRICULAR";
  selectedLevel: "INICIAL" | "PRIMARIA" | "SECUNDARIA" | null;
  selectedGrade: string;
  selectedSubject: any;
  selectedPlanningType: string;
  matSequenceIdx: number;
  matBlockIdx: number;
  matActivityIdx: number;
  onBack: () => void;
  onCancel?: () => void;
  onSave: (customData: any) => void;
}

const DRAFT_KEY = "plx:matematica5to_draft";

function loadDraft(expectedSeqIdx: number): any | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.seqIdx === expectedSeqIdx) {
        return parsed;
      }
    }
  } catch (_) {}
  return null;
}

function clearDraft() {
  try { sessionStorage.removeItem(DRAFT_KEY); } catch (_) {}
}

export default function Matematica5to({
  user,
  selectedSequence,
  selectedSequenceType,
  selectedGrade,
  selectedSubject,
  matSequenceIdx: initialSeqIdx,
  matBlockIdx: initialBlkIdx,
  matActivityIdx: initialActIdx,
  onBack,
  onCancel,
  onSave,
}: Matematica5toProps) {
  const restoringDraftRef = React.useRef(false);
  const draft = React.useMemo(() => loadDraft(initialSeqIdx), [initialSeqIdx]);

  // Local active index states
  const [seqIdx, setSeqIdx] = useState<number>(draft?.seqIdx ?? (initialSeqIdx >= 0 ? initialSeqIdx : 0));
  const [blkIdx, setBlkIdx] = useState<number>(draft?.blkIdx ?? (initialBlkIdx >= 0 ? initialBlkIdx : 0));
  const [actIdx, setActIdx] = useState<number>(draft?.actIdx ?? (initialActIdx >= 0 ? initialActIdx : -1));

  // Dropdown states
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [showIndicatorsDropdown, setShowIndicatorsDropdown] = useState(false);

  const [dbSequences, setDbSequences] = useState<Record<string, any>>({});

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || 
      (typeof window !== "undefined" && window.location.hostname !== "localhost" 
        ? "https://planix-api.yeriorlando00.workers.dev" 
        : "http://localhost:8787");
    fetch(`${apiBase}/api/custom-sequences`)
      .then(res => res.json())
      .then((data: any) => {
        if (Array.isArray(data)) {
          const map: Record<string, any> = {};
          data.forEach(item => {
            map[item.id] = item.content;
          });
          setDbSequences(map);
        }
      })
      .catch(err => console.error("Error fetching custom sequences from D1:", err));
  }, []);

  const getSequenceData = (idx: number) => {
    const original = MATEMATICA_5TO_SEQUENCES[idx] || MATEMATICA_5TO_SEQUENCES[0];
    if (original && dbSequences[original.id]) {
      const dbSeq = dbSequences[original.id];
      return {
        ...original,
        ...dbSeq,
        order: dbSeq.order !== undefined && dbSeq.order !== null && dbSeq.order !== '' ? dbSeq.order : original?.order,
        durationWeeks: dbSeq.durationWeeks !== undefined && dbSeq.durationWeeks !== null && dbSeq.durationWeeks !== '' ? dbSeq.durationWeeks : original?.durationWeeks,
        description: dbSeq.description !== undefined && dbSeq.description !== null && dbSeq.description !== '' ? dbSeq.description : original?.description,
        blocks: dbSeq.blocks || original?.blocks || []
      };
    }
    return original;
  };

  const activeSequenceData = getSequenceData(seqIdx);
  const activeBlockData = activeSequenceData?.blocks?.[blkIdx] || activeSequenceData?.blocks?.[0];
  const activeActivityData = actIdx >= 0 ? (activeBlockData?.activities?.[actIdx] || null) : null;

  // Core Form states
  const lastScrollYRef = React.useRef<number | null>(null);
  const [docente] = useState(user?.nombre || user?.full_name || "");
  const [centroEducativo, setCentroEducativo] = useState(draft?.centroEducativo ?? (user?.colegio || user?.school_name || "Sin Centro Educativo"));
  const [seccion, setSeccion] = useState(draft?.seccion ?? "A");
  const [fecha, setFecha] = useState(draft?.fecha ?? new Date().toISOString().split("T")[0]);

  const [intencionPedagogica, setIntencionPedagogica] = useState(draft?.intencionPedagogica ?? ((activeActivityData as any)?.pedagogicalIntention || ""));
  const [competenciasFundamentales, setCompetenciasFundamentales] = useState<string[]>(draft?.competenciasFundamentales ?? []);
  const [competenciasEspecificas, setCompetenciasEspecificas] = useState<string[]>(draft?.competenciasEspecificas ?? []);
  const [hideSpecificCompetencies, setHideSpecificCompetencies] = useState<boolean>(draft?.hideSpecificCompetencies ?? false);

  const [compDescs, setCompDescs] = useState<Record<CompetenciaKey, string>>(draft?.compDescs ?? {
    razonamiento: COMPETENCIAS[0].defaultDesc,
    comunicativa: COMPETENCIAS[1].defaultDesc,
    etica: COMPETENCIAS[2].defaultDesc,
  });
  const [seqCompDescs, setSeqCompDescs] = useState<Record<string, string>>(draft?.seqCompDescs ?? {});
  const [editingSeqComp, setEditingSeqComp] = useState<string | null>(null);

  const [momentos, setMomentos] = useState<any[]>(draft?.momentos ?? []);
  const [showDiferenciadas, setShowDiferenciadas] = useState<Record<string, boolean>>({});


  // Additional text fields
  const [metacognicion, setMetacognicion] = useState(draft?.metacognicion ?? "");
  const [metacognicionTiempo, setMetacognicionTiempo] = useState(draft?.metacognicionTiempo ?? "15");
  const [evaluacion, setEvaluacion] = useState(draft?.evaluacion ?? "");
  const [evaluacionTiempo, setEvaluacionTiempo] = useState(draft?.evaluacionTiempo ?? "15");
  const [tareaHogar, setTareaHogar] = useState(draft?.tareaHogar ?? ((activeActivityData as any)?.homework || ""));
  const [actividadComplementaria, setActividadComplementaria] = useState(draft?.actividadComplementaria ?? "");
  const [actividadCuaderno, setActividadCuaderno] = useState(draft?.actividadCuaderno ?? "");
  const [estrategia, setEstrategia] = useState(draft?.estrategia ?? "");
  const [aprendizajeSignificativo, setAprendizajeSignificativo] = useState(draft?.aprendizajeSignificativo ?? "");

  // Indicators
  const [indicadoresLogro, setIndicadoresLogro] = useState<string[]>(draft?.indicadoresLogro ?? []);

  // Saberes Previos & Retroalimentación states
  const [saberesPrevios, setSaberesPrevios] = useState(draft?.saberesPrevios ?? "");
  const [useSaberesPrevios, setUseSaberesPrevios] = useState(draft?.useSaberesPrevios ?? false);
  const [isGeneratingSaberesPrevios, setIsGeneratingSaberesPrevios] = useState(false);

  const [retroalimentacion, setRetroalimentacion] = useState(draft?.retroalimentacion ?? "");
  const [useRetroalimentacion, setUseRetroalimentacion] = useState(draft?.useRetroalimentacion ?? false);
  const [isGeneratingRetroalimentacion, setIsGeneratingRetroalimentacion] = useState(false);

  // Mark draft as restoring so the activity-sync effect skips on first render
  React.useEffect(() => {
    if (draft) {
      restoringDraftRef.current = true;
    }
  }, []);

  // Auto-save draft to sessionStorage on any form state change (debounced)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const draftData = {
          seqIdx, blkIdx, actIdx,
          centroEducativo, seccion, fecha,
          intencionPedagogica, competenciasFundamentales, competenciasEspecificas, hideSpecificCompetencies,
          compDescs, seqCompDescs, momentos,
          metacognicion, metacognicionTiempo,
          evaluacion, evaluacionTiempo,
          tareaHogar, actividadComplementaria, actividadCuaderno,
          estrategia, aprendizajeSignificativo,
          indicadoresLogro,
          saberesPrevios, useSaberesPrevios,
          retroalimentacion, useRetroalimentacion,
          _ts: Date.now(),
        };
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      } catch (_) {}
    }, 800);
    return () => clearTimeout(timer);
  }, [
    seqIdx, blkIdx, actIdx,
    centroEducativo, seccion, fecha,
    intencionPedagogica, competenciasFundamentales, competenciasEspecificas, hideSpecificCompetencies,
    compDescs, seqCompDescs, momentos,
    metacognicion, metacognicionTiempo,
    evaluacion, evaluacionTiempo,
    tareaHogar, actividadComplementaria, actividadCuaderno,
    estrategia, aprendizajeSignificativo,
    indicadoresLogro,
    saberesPrevios, useSaberesPrevios,
    retroalimentacion, useRetroalimentacion,
  ]);

  // AI & Modal states
  const [isGeneratingEvaluation, setIsGeneratingEvaluation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Bloom Leveler Modal
  const [showBloomModal, setShowBloomModal] = useState(false);
  const [activeBloomMomentId, setActiveBloomMomentId] = useState<string | null>(null);

  // Gamify Modal
  const [showGamifyModal, setShowGamifyModal] = useState(false);
  const [activeGamifyMomentId, setActiveGamifyMomentId] = useState<string | null>(null);

  // Inclusion Modal
  const [showInclusionModal, setShowInclusionModal] = useState(false);
  const [activeInclusionMomentId, setActiveInclusionMomentId] = useState<string | null>(null);

  // Audit State
  const [auditResult, setAuditResult] = useState<{
    score: number;
    is_coherent: boolean;
    analysis: string;
    issues: string[];
    suggestions: string[];
  } | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const [expandedField, setExpandedField] = useState<{ momentId: string; fieldKey: "descripcion" | "recursos" } | null>(null);

  // Setup Tiptap Editor for Saberes Previos
  const saberesEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Preguntas disparadoras o dinámicas para indagar los conocimientos previos...",
      }),
    ],
    content: markdownToHtml(saberesPrevios),
    onUpdate: ({ editor }) => {
      setSaberesPrevios(htmlToMarkdown(editor.getHTML()));
    },
  });

  // Sync Saberes Previos editor content when state changes externally
  useEffect(() => {
    if (saberesEditor) {
      const isHtmlEmpty = (html: string) => !html || html === "<p></p>" || html === "<p><br></p>";
      const target = markdownToHtml(saberesPrevios);
      const current = saberesEditor.getHTML();
      if (isHtmlEmpty(target) && isHtmlEmpty(current)) return;
      if (target !== current) {
        saberesEditor.commands.setContent(target);
      }
    }
  }, [saberesPrevios, saberesEditor]);

  // Setup Tiptap Editor for Retroalimentación
  const retroEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Preguntas o actividades de retroalimentación basadas en la clase anterior...",
      }),
    ],
    content: markdownToHtml(retroalimentacion),
    onUpdate: ({ editor }) => {
      setRetroalimentacion(htmlToMarkdown(editor.getHTML()));
    },
  });

  // Sync Retroalimentación editor content when state changes externally
  useEffect(() => {
    if (retroEditor) {
      const isHtmlEmpty = (html: string) => !html || html === "<p></p>" || html === "<p><br></p>";
      const target = markdownToHtml(retroalimentacion);
      const current = retroEditor.getHTML();
      if (isHtmlEmpty(target) && isHtmlEmpty(current)) return;
      if (target !== current) {
        retroEditor.commands.setContent(target);
      }
    }
  }, [retroalimentacion, retroEditor]);

  // Sync with selected sequence/block/activity change
  useEffect(() => {
    // Skip on first render if we just restored a draft
    if (restoringDraftRef.current) {
      restoringDraftRef.current = false;
      return;
    }

    if (actIdx >= 0 && activeActivityData) {
      setIntencionPedagogica((activeActivityData as any).intencion_pedagogica || "");
      setTareaHogar((activeActivityData as any).homework || "");
      setEstrategia((activeActivityData as any).estrategia || "");
      setAprendizajeSignificativo((activeActivityData as any).aprendizaje_significativo || "");
      setActividadCuaderno((activeActivityData as any).actividades_cuaderno || "");
      setActividadComplementaria((activeActivityData as any).actividades_complementarias || "");
      setCompetenciasFundamentales([]);
      setCompetenciasEspecificas([]);
      setIndicadoresLogro([]);

      // Populate default descriptions for sequence competencies
      const title = activeSequenceData.title || "";
      const normalizedUnidad = title.trim().toLowerCase();
      const mappingKey = Object.keys(SEQUENCE_COMPETENCIES).find(
        key => key.trim().toLowerCase() === normalizedUnidad
      );
      const competencies = mappingKey ? SEQUENCE_COMPETENCIES[mappingKey] : [];
      
      const defaultDescs: Record<string, string> = {};
      competencies.forEach((comp) => {
        const colonIndex = comp.indexOf(":");
        const titlePart = colonIndex !== -1 ? comp.substring(0, colonIndex).trim() : comp.trim();
        const descPart = colonIndex !== -1 ? comp.substring(colonIndex + 1).trim() : "";
        defaultDescs[titlePart] = descPart;
      });
      setSeqCompDescs(defaultDescs);

      const newMomentos: any[] = [];
      const addMoments = (source: any, type: string) => {
        if (!source) return;
        const momentsList = Array.isArray(source) ? source : [source];
        momentsList.forEach((m, index) => {
          newMomentos.push({
            id: `mom-${Date.now()}-${type}-${index}-${Math.random()}`,
            moment: type,
            titulo: m.titulo || m.title || type,
            descripcion: m.descripcion || m.description || "",
            tiempo: m.tiempo || (type === "Desarrollo" ? "45" : "15"),
            recursos: m.recursos || m.resources || "",
            orden_actividad: m.actividad_numero || m.orden_actividad || "",
            numero_actividad: m.letras || m.numero_actividad || "",
            hideDescription: false,
          });
        });
      };

      addMoments((activeActivityData as any).inicio, "Inicio");
      addMoments((activeActivityData as any).desarrollo, "Desarrollo");
      addMoments((activeActivityData as any).cierre, "Cierre y evaluación");

      setMomentos(newMomentos);
      toast.success("Contenido oficial cargado al instante.", { id: "loaded-content" });
    } else if (actIdx < 0) {
      setIntencionPedagogica("");
      setTareaHogar("");
      setEstrategia("");
      setAprendizajeSignificativo("");
      setActividadCuaderno("");
      setActividadComplementaria("");
      setCompetenciasFundamentales([]);
      setCompetenciasEspecificas([]);
      setSeqCompDescs({});
      setMomentos([]);
      setMetacognicion("");
      setEvaluacion("");
      setSaberesPrevios("");
      setRetroalimentacion("");
      setIndicadoresLogro([]);
    }
  }, [seqIdx, blkIdx, actIdx]);

  // Restore scroll position to avoid jumpy layouts
  useEffect(() => {
    if (lastScrollYRef.current !== null) {
      const scrollPos = lastScrollYRef.current;
      lastScrollYRef.current = null;
      const timer = setTimeout(() => {
        window.scrollTo({
          top: scrollPos,
          behavior: 'instant' as any
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [actIdx, blkIdx]);

  const toggleComp = (k: CompetenciaKey) => {
    const labelMap: Record<CompetenciaKey, string> = {
      comunicativa: "Competencia Comunicativa",
      razonamiento: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
      etica: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
    };
    const targetLabel = labelMap[k];
    if (competenciasFundamentales.includes(targetLabel)) {
      setCompetenciasFundamentales(competenciasFundamentales.filter((x) => x !== targetLabel));
    } else {
      setCompetenciasFundamentales([...competenciasFundamentales, targetLabel]);
    }
  };

  const isChecked = (k: CompetenciaKey) => {
    const labelMap: Record<CompetenciaKey, string> = {
      comunicativa: "Competencia Comunicativa",
      razonamiento: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
      etica: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
    };
    return competenciasFundamentales.includes(labelMap[k]);
  };

  // Handle moments actions
  const handleAddMomento = (section: string) => {
    setMomentos([
      ...momentos,
      {
        id: `mom-custom-${Date.now()}`,
        moment: section,
        titulo: section,
        descripcion: "",
        tiempo: section === "Desarrollo" ? "45" : "15",
        recursos: "Cuaderno, Lápiz",
        orden_actividad: "",
        numero_actividad: "",
        hideDescription: false,
      },
    ]);
  };

  const handleFetchEphemeris = () => {
    try {
      if (!fecha) {
        toast.error("Selecciona una fecha primero para consultar su efeméride.");
        return;
      }
      const dateParts = fecha.split("-");
      if (dateParts.length !== 3) {
        toast.error("Fecha inválida.");
        return;
      }
      const month = parseInt(dateParts[1]) - 1; // 0-indexed in JS Date
      const day = parseInt(dateParts[2]);

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

      const match = DOMINICAN_EPHEMERIS.find(e => e.month === month && e.day === day);
      if (match) {
        const ephemerisText = `Efeméride del día: ${match.title} - ${match.desc}`;
        setMomentos(prev => {
          const updated = [...prev];
          const inicioIdx = updated.findIndex(m => m.moment === 'Inicio');
          if (inicioIdx !== -1) {
            const existingDesc = updated[inicioIdx].descripcion || "";
            if (!existingDesc.includes(match.title)) {
              updated[inicioIdx].descripcion = existingDesc 
                ? `${ephemerisText}\n\n${existingDesc}` 
                : ephemerisText;
            }
          } else {
            updated.push({
              id: `mom-custom-${Date.now()}`,
              moment: 'Inicio',
              titulo: 'Inicio',
              descripcion: ephemerisText,
              tiempo: '15',
              recursos: 'Cuaderno, Lápiz',
              orden_actividad: '',
              numero_actividad: '',
              hideDescription: false
            });
          }
          return updated;
        });
        toast.success(`Efeméride aplicada: ${match.title}`);
      } else {
        toast.info("No hay efemérides patrias registradas para este día.");
      }
    } catch (err) {
      console.error("Error fetching ephemeris:", err);
      toast.error("Ocurrió un error al consultar la efeméride.");
    }
  };

  const handleRemoveMomento = (id: string) => {
    setMomentos(momentos.filter((m) => m.id !== id));
  };

  const updateMomento = (id: string, k: string, v: any) => {
    setMomentos((arr) =>
      arr.map((m) =>
        m.id === id
          ? {
              ...m,
              [k]: v,
            }
          : m
      )
    );
  };

  const handleAutoIncrementActivity = (id: string, currentVal: string) => {
    const currentNum = parseInt(currentVal);
    let newVal = "1";
    if (!isNaN(currentNum)) {
      newVal = (currentNum + 1).toString();
    }
    updateMomento(id, "orden_actividad", newVal);
  };

  const handleAddLetter = (id: string, currentVal: string) => {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    let nextLetter = "A";
    if (currentVal && currentVal.length > 0) {
      const foundLetters = currentVal.match(/[A-J]/g);
      if (foundLetters && foundLetters.length > 0) {
        const lastLetter = foundLetters[foundLetters.length - 1];
        const lastIndex = letters.indexOf(lastLetter);
        if (lastIndex !== -1 && lastIndex < letters.length - 1) {
          nextLetter = letters[lastIndex + 1];
        } else if (lastIndex === letters.length - 1) {
          return;
        }
      }
    }
    const newVal = currentVal ? `${currentVal}, ${nextLetter}` : nextLetter;
    updateMomento(id, "numero_actividad", newVal);
  };

  const handleToggleIndicator = (ind: string) => {
    if (indicadoresLogro.includes(ind)) {
      setIndicadoresLogro(indicadoresLogro.filter((x) => x !== ind));
    } else {
      setIndicadoresLogro([...indicadoresLogro, ind]);
    }
  };

  const handlePreview = () => {
    const previewData = {
      docente,
      centro_educativo: centroEducativo,
      planningType: "DIARIA",
      grado: "5to. (Primaria)",
      seccion,
      fecha,
      area: "Matemática",
      asignatura: "Matemática",
      secuencia: activeSequenceData?.title || "Secuencia 1",
      titulo: activeSequenceData?.title || "Secuencia 1",
      intencion_pedagogica: intencionPedagogica,
      competencias: competenciasFundamentales,
      competencias_especificas: competenciasEspecificas.map((comp) => {
        const colonIndex = comp.indexOf(":");
        const titlePart = colonIndex !== -1 ? comp.substring(0, colonIndex).trim() : comp.trim();
        const editedDesc = seqCompDescs[titlePart];
        return editedDesc ? `${titlePart}: ${editedDesc}` : comp;
      }),
      hideSpecificCompetencies: hideSpecificCompetencies,
      bloque: (activeBlockData as any)?.blockTitle || (activeBlockData as any)?.title || "Bloque 1",
      actividad_titulo: (activeActivityData as any)?.activityTitle || (activeActivityData as any)?.title || "Actividad #1",
      momentos,
      recursos_adicionales: metacognicion,
      metacognicion,
      metacognicion_tiempo: metacognicionTiempo,
      evaluacion,
      evaluacion_tiempo: evaluacionTiempo,
      tarea_hogar: tareaHogar,
      actividad_complementaria: actividadComplementaria,
      actividad_cuaderno: actividadCuaderno,
      estrategia: estrategia,
      aprendizaje_significativo: aprendizajeSignificativo,
      indicadores_logro: indicadoresLogro.join("\n"),
      saberes_previos: useSaberesPrevios ? saberesPrevios : "",
      retroalimentacion: useRetroalimentacion ? retroalimentacion : "",
    };
    sessionStorage.setItem("plx:temp_planning_preview", JSON.stringify(previewData));
    localStorage.setItem("plx:temp_planning_preview", JSON.stringify(previewData));
    window.open("/planificacion/preview?temp=true", "_blank");
  };

  // --- AI ACTIONS ---
  const handleGenerateEvaluationAndMeta = async () => {
    setIsGeneratingEvaluation(true);
    toast.loading("Generando Metacognición y Evaluación...", { id: "ai-gen" });

    try {
      const planData = {
        grado: "5to. (Primaria)",
        asignatura: "Matemática",
        secuencia: activeSequenceData?.title || "Secuencia 1",
        intencion_pedagogica: intencionPedagogica,
        momentos: momentos,
      };

      const result = await generateEvaluationAndMeta(planData);
      setMetacognicion(result.metacognicion || "");
      setEvaluacion(result.evaluacion || "");
      toast.success("¡Metacognición y Evaluación diseñadas por IA!", { id: "ai-gen" });
    } catch (err) {
      console.error(err);
      toast.error("Error al generar la evaluación/metacognición", { id: "ai-gen" });
    } finally {
      setIsGeneratingEvaluation(false);
    }
  };

  const cleanAIPedagogicalText = (rawText: string): string => {
    if (!rawText) return "";
    const items = rawText
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    const cleanedItems = items.map((item) => {
      const isHeader = item.startsWith("#");
      let cleaned = item.replace(/^#+\s*/, "").trim();
      cleaned = cleaned.replace(/^[*•\-+]\s*/, "").trim();
      cleaned = cleaned.replace(/\*\*/g, "").trim();

      if (isHeader) {
        cleaned = `**${cleaned}**`;
      } else {
        const firstColonIndex = cleaned.indexOf(":");
        if (firstColonIndex !== -1) {
          const header = cleaned.substring(0, firstColonIndex + 1);
          let rest = cleaned.substring(firstColonIndex + 1);
          rest = rest.replace(/(¿[^?]+\?)/g, "**$1**");
          cleaned = `**${header.trim()}**${rest}`;
        } else {
          cleaned = cleaned.replace(/(¿[^?]+\?)/g, "**$1**");
        }
      }

      return cleaned;
    });

    return cleanedItems.join("\n\n");
  };

  const handleGenerateSaberesPrevios = async () => {
    setIsGeneratingSaberesPrevios(true);
    toast.loading("Generando Saberes Previos con IA...", { id: "ai-saberes" });

    try {
      const planData = {
        grado: "5to. (Primaria)",
        secuencia: activeSequenceData?.title || "Secuencia 1",
        area: "Matemática",
        asignatura: "Matemática",
        bloque: activeBlockData?.title || "Bloque 1",
        actividad: activeActivityData?.title || "Actividad 1",
        intencion_pedagogica: intencionPedagogica,
        momentosText: momentos.map((m: any, i: number) => `Momento ${i + 1} (${m.moment || 'Actividad'}): ${m.descripcion || m.description}`).join('\n'),
      };

      const result = await generateSaberesPrevios(planData);
      setSaberesPrevios(cleanAIPedagogicalText(result.saberes_previos || ""));
      toast.success("¡Saberes previos sugeridos por IA!", { id: "ai-saberes" });
    } catch (err) {
      console.error(err);
      toast.error("Error al generar saberes previos con IA", { id: "ai-saberes" });
    } finally {
      setIsGeneratingSaberesPrevios(false);
    }
  };

  const handleGenerateRetroalimentacion = async () => {
    if (!user?.id) {
      toast.error("Inicia sesión para usar retroalimentación basada en la última planificación.");
      return;
    }

    setIsGeneratingRetroalimentacion(true);
    toast.loading("Buscando última planificación en D1...", { id: "ai-retro" });

    try {
      const plannings = await fetchPlannings(user.id);
      
      const languagePlans = plannings
        .filter(p => {
          const subjectStr = p.asignatura || p.customFields?.asignatura || p.customFields?.area || p.customFields?.subject || (p as any).area || "";
          const normAsig = subjectStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
          
          const titleStr = p.titulo || p.customFields?.actividad_titulo || p.customFields?.titulo || "";
          const normTit = titleStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
          
          const isMath = normAsig.includes("matem") || normTit.includes("matem");
          
          const gradeStr = p.grado || p.customFields?.grado || p.customFields?.grado_id || "";
          const normPlanGrado = gradeStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
          const isSameGrade = normPlanGrado.includes("5") || normPlanGrado.includes("quint");
          
          const currentTitle = (activeActivityData as any)?.title || (activeActivityData as any)?.activityTitle || "Actividad #1";
          const isCurrentPlan = (p.titulo === currentTitle && p.customFields?.fecha === fecha) || 
                               (p.customFields?.actividad_id === ((activeActivityData as any)?.id || "act-1") && p.customFields?.fecha === fecha);
                               
          return isMath && isSameGrade && !isCurrentPlan;
        })
        .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());

      let latestPlan = languagePlans[0];
      if (!latestPlan) {
        latestPlan = {
          id: "temp-plan-id",
          docente_id: user.id,
          titulo: (activeActivityData as any)?.title || (activeActivityData as any)?.activityTitle || activeSequenceData?.title || "Matemática 5to Grado",
          tipo: selectedSequenceType,
          nivel: "primaria",
          grado: selectedGrade || "5to. (Primaria)",
          asignatura: "Matemática",
          secuencia_id: selectedSequence?.id || "",
          bloque_id: "",
          actividad_id: (activeActivityData as any)?.id || "",
          intencion_pedagogica: intencionPedagogica || "Desarrollar competencias lógico-matemáticas en Matemática",
          recursos: [],
          momentos: { 
            inicio: momentos[0]?.descripcion || "", 
            desarrollo: momentos[1]?.descripcion || "", 
            cierre: momentos[2]?.descripcion || "" 
          },
          tarea: tareaHogar || "",
          conceptual: "",
          procedimental: "",
          actitudinal: "",
          evaluacion: evaluacion || "",
          creado_en: new Date().toISOString()
        } as any;
        toast.loading("Generando retroalimentación general (primera planificación)...", { id: "ai-retro" });
      } else {
        toast.loading(`Generando retroalimentación basada en: "${latestPlan.titulo || 'Planificación anterior'}"`, { id: "ai-retro" });
      }

      const result = await generateRetroalimentacion(latestPlan);
      setRetroalimentacion(cleanAIPedagogicalText(result.retroalimentacion || ""));
      toast.success("¡Retroalimentación sugerida por IA basada en la última clase!", { id: "ai-retro" });
    } catch (err) {
      console.error(err);
      toast.error("Error al generar retroalimentación con IA", { id: "ai-retro" });
    } finally {
      setIsGeneratingRetroalimentacion(false);
    }
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    toast.loading("Auditando coherencia curricular con IA...", { id: "ai-audit" });
    try {
      const planData = {
        centro_educativo: centroEducativo,
        docente: docente,
        grado: "5to. (Primaria)",
        seccion: seccion,
        area: "Matemática",
        secuencia: activeSequenceData?.title || "Secuencia 1",
        intencion_pedagogica: intencionPedagogica,
        competencias: competenciasFundamentales,
        competencias_especificas: competenciasEspecificas.map((comp) => {
          const colonIndex = comp.indexOf(":");
          const titlePart = colonIndex !== -1 ? comp.substring(0, colonIndex).trim() : comp.trim();
          const editedDesc = seqCompDescs[titlePart];
          return editedDesc ? `${titlePart}: ${editedDesc}` : comp;
        }),
        momentos: momentos,
        evaluacion: evaluacion,
        recursos: momentos.map(m => m.recursos).join(", ")
      };
      
      const response = await generateAudit(planData);
      setAuditResult(response);
      toast.success("¡Auditoría curricular completada!", { id: "ai-audit" });
    } catch (error) {
      console.error(error);
      toast.error("Error al auditar la planificación", { id: "ai-audit" });
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSaveForm = () => {
    if (!seccion.trim()) {
      toast.error("La sección es obligatoria.");
      return;
    }

    const payload = {
      centro_educativo: centroEducativo,
      docente: docente,
      planningType: "DIARIA",
      grado: "5to. (Primaria)",
      seccion: seccion,
      area: "Matemática",
      fecha: fecha,
      titulo: (activeActivityData as any)?.title || (activeActivityData as any)?.activityTitle || "Actividad #1",
      asignatura: "Matemática",
      secuencia: activeSequenceData?.title || "Secuencia 1",
      bloque: (activeBlockData as any)?.title || (activeBlockData as any)?.blockTitle || "Bloque 1",
      actividad_id: (activeActivityData as any)?.id || "act-1",
      actividad_titulo: (activeActivityData as any)?.title || (activeActivityData as any)?.activityTitle || "Actividad #1",
      intencion_pedagogica: intencionPedagogica,
      competencias: competenciasFundamentales,
      competencias_especificas: competenciasEspecificas.map((comp) => {
        const colonIndex = comp.indexOf(":");
        const titlePart = colonIndex !== -1 ? comp.substring(0, colonIndex).trim() : comp.trim();
        const editedDesc = seqCompDescs[titlePart];
        return editedDesc ? `${titlePart}: ${editedDesc}` : comp;
      }),
      hideSpecificCompetencies: hideSpecificCompetencies,
      momentos: momentos,
      evaluacion: evaluacion,
      evaluacion_tiempo: evaluacionTiempo,
      metacognicion: metacognicion,
      metacognicion_tiempo: metacognicionTiempo,
      tarea_hogar: tareaHogar,
      actividad_complementaria: actividadComplementaria,
      actividad_cuaderno: actividadCuaderno,
      estrategia: estrategia,
      aprendizaje_significativo: aprendizajeSignificativo,
      indicador_logro: indicadoresLogro.join("\n"),
      saberes_previos: useSaberesPrevios ? saberesPrevios : "",
      retroalimentacion: useRetroalimentacion ? retroalimentacion : "",
    };

    clearDraft();
    onSave(payload);
  };

  const renderMarkdownInline = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div className="w-full bg-transparent text-[#1B1B1B] dark:text-zinc-100 font-sans relative overflow-hidden">
      {/* Academic Icons Background */}
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.018] pointer-events-none select-none z-0">
        <BookOpen className="absolute top-8 left-6 text-neutral-900 dark:text-white" size={75} style={{ transform: "rotate(-12deg)" }} />
        <School className="absolute top-12 left-[22%] text-neutral-900 dark:text-white" size={65} style={{ transform: "rotate(-8deg)" }} />
        <PenTool className="absolute top-[30%] left-[28%] text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(15deg)" }} />
        <Languages className="absolute top-[26%] left-16 text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(15deg)" }} />
        <Lightbulb className="absolute top-[48%] left-6 text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(25deg)" }} />
        <Brain className="absolute bottom-[6%] left-[48%] text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(-5deg)" }} />
        <GraduationCap className="absolute top-8 right-6 text-neutral-900 dark:text-white" size={85} style={{ transform: "rotate(15deg)" }} />
        <Atom className="absolute top-12 right-[22%] text-neutral-900 dark:text-white" size={75} style={{ transform: "rotate(-5deg)" }} />
        <Scroll className="absolute top-[30%] right-[28%] text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(-15deg)" }} />
        <Shapes className="absolute top-[26%] right-16 text-neutral-900 dark:text-white" size={65} style={{ transform: "rotate(-10deg)" }} />
        <Globe className="absolute top-[48%] right-6 text-neutral-900 dark:text-white" size={70} style={{ transform: "rotate(-15deg)" }} />
        <Compass className="absolute top-[56%] right-[24%] text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(12deg)" }} />
        <Notebook className="absolute bottom-[24%] right-24 text-neutral-900 dark:text-white" size={60} style={{ transform: "rotate(18deg)" }} />
      </div>

      <div className="mx-auto max-w-5xl px-2 pb-8 pt-14 md:pt-20 text-left relative z-10">
        {/* Hero Header */}
        <div className="mb-8 relative border-b border-slate-100 dark:border-zinc-800 pb-5 text-center">
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="font-display text-5xl tracking-tight text-[#1B1B1B] dark:text-white font-black">
              Matemática
            </h1>
            <p className="mt-2 text-sm font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
              Planificación diaria (5to Grado)
            </p>
          </div>
          <button
            type="button"
            className="sm:absolute sm:top-1 sm:right-0 mt-4 sm:mt-0 inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-4 py-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer shrink-0"
            onClick={() => window.open("https://drive.google.com/file/d/1cYwQHg3wIbMBuTYWMvvmNl5LHEwRH6VE/view?usp=sharing", "_blank")}
          >
            <BookOpen className="h-4 w-4" />
            Consultar guía
          </button>
        </div>

        {/* 01. Información General */}
        <Section
          number="01"
          title="Información general"
          description="Datos básicos del docente, área y fecha de la clase."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div id="school-field-container" className="w-full school-autocomplete-no-icon">
              <Field
                label="Centro educativo"
                action={
                  <button
                    type="button"
                    onClick={() => {
                      const buttons = document.getElementById('school-field-container')?.querySelectorAll('button');
                      const targetBtn = Array.from(buttons || []).find(b => !b.className.includes('text-blue-600'));
                      if (targetBtn) (targetBtn as HTMLButtonElement).click();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold hover:underline cursor-pointer font-sans"
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
            <Field label="Nombre del docente" required>
              <input className={inputCls} value={docente} readOnly />
            </Field>
            <Field label="Grado" required>
              <input className={inputCls} value="5to. (Primaria)" readOnly />
            </Field>
            <Field label="Sección" required>
              <input
                className={`${inputCls} font-bold uppercase`}
                placeholder="Ej: A"
                value={seccion}
                onChange={(e) => setSeccion(e.target.value)}
                required
              />
            </Field>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Área">
              <input className={inputCls} value="Matemática" readOnly />
            </Field>
            <Field label="Secuencia">
              <input className={`${inputCls} truncate`} value={activeSequenceData?.title || ""} readOnly />
            </Field>
            <Field label="Fecha" required>
              <DatePicker value={fecha} onChange={setFecha} />
            </Field>
          </div>
        </Section>

        {/* 02. Selección de Actividad */}
        <Section
          number="02"
          title="Bloque y Actividad de la Guía Didáctica"
          description="Vincula la clase con una actividad de la guía didáctica oficial."
        >
          <div className="mb-8 rounded-3xl border border-[#D5DCFB] dark:border-indigo-900/30 bg-[#F5F7FF]/60 dark:bg-indigo-950/5 p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-16px_rgba(16,24,40,0.08)] sm:p-8">
            <h3 className="text-lg font-bold text-[#2A3B8F] dark:text-indigo-400 mb-6 flex items-center gap-2 font-sans">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              Selección de Actividad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Seleccionar Actividad de la Secuencia" required>
              <div className="relative select-none">
                <div
                  onClick={() => setShowActivityDropdown(!showActivityDropdown)}
                  className="w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-805 focus:border-[#2A3B8F] outline-none transition-all shadow-xs"
                >
                  <span className="truncate pr-2">
                    {actIdx >= 0
                      ? (activeSequenceData?.activities || [])[actIdx]?.title
                      : "Seleccione una actividad..."}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${showActivityDropdown ? 'rotate-180' : ''}`} />
                </div>
                {showActivityDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowActivityDropdown(false)} />
                    <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                      <div className="space-y-0.5 max-h-60 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            lastScrollYRef.current = window.scrollY;
                            setActIdx(-1);
                            setShowActivityDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors ${
                            actIdx === -1
                              ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white"
                              : "text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                          }`}
                        >
                          <span className="truncate pr-2">Seleccione una actividad...</span>
                          {actIdx === -1 && <Check className="w-4 h-4 shrink-0 text-[#1B1B1B] dark:text-white" />}
                        </button>
                        {(activeSequenceData?.activities || []).map((act: any, i: number) => {
                          const isSelected = i === actIdx;
                          return (
                            <button
                              key={act.id}
                              type="button"
                              onClick={() => {
                                lastScrollYRef.current = window.scrollY;
                                setActIdx(i);
                                setShowActivityDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors ${
                                isSelected
                                  ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white"
                                  : "text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                              }`}
                            >
                              <span className="truncate pr-2">{act.title}</span>
                              {isSelected && <Check className="w-4 h-4 shrink-0 text-[#1B1B1B] dark:text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-2 font-semibold text-left">
                Al seleccionar una actividad, se completarán automáticamente los momentos e indicadores.
              </p>
            </Field>

            <Field label="Nombre de la Actividad">
              <div className="relative">
                <input
                  type="text"
                  value={activeActivityData?.name || ""}
                  readOnly
                  className={`${inputCls} bg-white dark:bg-zinc-900 border-[#D5DCFB] dark:border-indigo-900/30 text-indigo-900 dark:text-indigo-300 font-bold pr-10`}
                  placeholder="Nombre descriptivo de la actividad..."
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </Field>
          </div>
        </div>

          {/* Estrategias y Aprendizaje Significativo */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mt-5 text-left">
            <Field label="Estrategias de enseñanza - aprendizaje">
              <AutoGrowingTextarea
                rows={3}
                className={textareaCls}
                placeholder="Descripción de las estrategias y técnicas a utilizar..."
                value={estrategia}
                onChange={(e) => setEstrategia(e.target.value)}
              />
            </Field>
            <Field label="Aprendizaje significativo">
              <AutoGrowingTextarea
                rows={3}
                className={textareaCls}
                placeholder="Relación de los contenidos con situaciones reales..."
                value={aprendizajeSignificativo}
                onChange={(e) => setAprendizajeSignificativo(e.target.value)}
              />
            </Field>
          </div>

          {/* Intención pedagógica block */}
          <div className="mt-5 rounded-2xl border border-brand-primary/20 dark:border-zinc-800 bg-brand-light/30 dark:bg-zinc-900/40 p-5 text-left">
            <div className="mb-2">
              <label className="text-xs font-bold uppercase tracking-wide text-neutral-800 dark:text-zinc-200 font-sans">
                Intención pedagógica del día *
              </label>
            </div>
            <AutoGrowingTextarea
              rows={3}
              className={textareaCls}
              placeholder="¿Qué se espera que los estudiantes aprendan hoy?"
              value={intencionPedagogica}
              onChange={(e) => setIntencionPedagogica(e.target.value)}
              required
            />
          </div>

          {/* Opciones adicionales: Saberes previos y Retroalimentación */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setUseSaberesPrevios(!useSaberesPrevios)}
              className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-px select-none ${
                useSaberesPrevios
                  ? "bg-blue-50/75 border-blue-400 text-blue-700 dark:bg-blue-500/10 dark:border-blue-400/40 dark:text-blue-300 ring-2 ring-blue-500/15"
                  : "bg-slate-50/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-100/70 dark:hover:bg-zinc-800/50"
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 ${
                useSaberesPrevios
                  ? "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400 text-white"
                  : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              }`}>
                {useSaberesPrevios && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <HelpCircle className={`h-4 w-4 shrink-0 transition-colors ${useSaberesPrevios ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-zinc-500"}`} />
              <span>Saberes previos</span>
            </button>

            <button
              type="button"
              onClick={() => setUseRetroalimentacion(!useRetroalimentacion)}
              className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-px select-none ${
                useRetroalimentacion
                  ? "bg-emerald-50/75 border-emerald-400 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-400/40 dark:text-emerald-300 ring-2 ring-emerald-500/15"
                  : "bg-slate-50/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-100/70 dark:hover:bg-zinc-800/50"
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 ${
                useRetroalimentacion
                  ? "border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400 text-white"
                  : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              }`}>
                {useRetroalimentacion && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <History className={`h-4 w-4 shrink-0 transition-colors ${useRetroalimentacion ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-500"}`} />
              <span>Retroalimentación</span>
            </button>
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
              .ProseMirror { 
                min-height: 80px; 
                outline: none; 
                font-size: 13px;
                line-height: 1.6;
                padding: 1rem;
              }
              .ProseMirror strong { font-weight: 700; }
            `,
            }}
          />

          {/* Saberes previos conditional card */}
          {useSaberesPrevios && (
            <div className="mt-4 rounded-2xl border border-blue-200 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-950/10 p-5 transition-all text-left">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-800 dark:text-zinc-200 font-sans">Saberes previos</label>
                <button
                  type="button"
                  onClick={handleGenerateSaberesPrevios}
                  disabled={isGeneratingSaberesPrevios}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-955/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 px-4 py-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  {isGeneratingSaberesPrevios ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  )}
                  Generar con IA
                </button>
              </div>
              <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/20">
                {saberesEditor && (
                  <EditorContent
                    editor={saberesEditor}
                    className="w-full prose prose-sm prose-blue dark:prose-invert max-w-none focus:outline-none bg-transparent"
                  />
                )}
              </div>
            </div>
          )}

          {/* Retroalimentación conditional card */}
          {useRetroalimentacion && (
            <div className="mt-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 p-5 transition-all text-left">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-800 dark:text-zinc-200 font-sans">Retroalimentación</label>
                <button
                  type="button"
                  onClick={handleGenerateRetroalimentacion}
                  disabled={isGeneratingRetroalimentacion}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-955/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 px-4 py-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  {isGeneratingRetroalimentacion ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  )}
                  Generar con IA
                </button>
              </div>
              <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/20">
                {retroEditor && (
                  <EditorContent
                    editor={retroEditor}
                    className="w-full prose prose-sm prose-blue dark:prose-invert max-w-none focus:outline-none bg-transparent"
                  />
                )}
              </div>
            </div>
          )}

          {/* Indicadores de logro multi-select dropdown */}
          <div className="mt-5 text-left">
            <Field label="Indicadores de logro">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIndicatorsDropdown(!showIndicatorsDropdown)}
                  className="w-full flex items-center justify-between bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 hover:bg-neutral-100/30 dark:hover:bg-zinc-800/30 transition-all text-left cursor-pointer outline-none focus:ring-1 focus:ring-brand-primary"
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
                      {FALLBACK_INDICATORS.map((ind, idx) => {
                        const checked = indicadoresLogro.includes(ind);
                        return (
                          <div
                            key={idx}
                            onClick={() => handleToggleIndicator(ind)}
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
                            <span className={`text-xs ${checked ? "font-semibold text-[#1B1B1B] dark:text-white" : "text-neutral-750 dark:text-zinc-300 font-medium leading-relaxed"}`}>
                              {renderMarkdownInline(ind)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Selected indicators chips */}
              {indicadoresLogro.length > 0 && (() => {
                const chipColors = [
                  "bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-800/40 dark:text-indigo-200",
                  "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-200",
                  "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-955/20 dark:border-amber-900/30 dark:text-amber-200",
                  "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800/40 dark:text-rose-200",
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
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-current opacity-40 hover:opacity-100 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all cursor-pointer border-none bg-transparent"
                          title="Eliminar indicador"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Field>
          </div>
        </Section>

        {/* 03. Competencias Fundamentales y Específicas */}
        <Section
          number="03"
          title="Competencias Fundamentales y Específicas"
          description="Selecciona las competencias fundamentales y las competencias específicas de la secuencia."
        >
          {/* Fundamental Competencies */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-800 dark:text-zinc-200 font-sans mb-3 text-left">
              Competencias Fundamentales
            </h4>
            <div className="space-y-2 text-left">
              {(() => {
                const compIcons: Record<CompetenciaKey, React.ReactNode> = {
                  comunicativa: <MessageSquare className="h-4 w-4" />,
                  razonamiento: <Brain className="h-4.5 w-4.5" />,
                  etica: <Scale className="h-4 w-4" />,
                };
                return COMPETENCIAS.map((c) => {
                  const checked = isChecked(c.key);
                  return (
                    <button
                      type="button"
                      key={c.key}
                      onClick={() => toggleComp(c.key)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all cursor-pointer ${
                        checked
                          ? "border-brand-primary/20 bg-brand-light/20 dark:border-brand-primary/30 dark:bg-brand-primary/10"
                          : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all ${
                          checked ? "border-brand-primary bg-brand-primary" : "border-gray-205 dark:border-zinc-750 bg-white dark:bg-zinc-955"
                        }`}
                      >
                        {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                      </span>
                      <span className={`shrink-0 transition-colors ${checked ? "text-brand-primary" : "text-neutral-400 dark:text-zinc-500"}`}>
                        {compIcons[c.key]}
                      </span>
                      <span className={`text-sm ${checked ? "font-semibold text-[#1B1B1B] dark:text-white" : "text-neutral-700 dark:text-zinc-300"}`}>
                        {c.label}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          {/* Sequence-Specific Competencies Selection Checklist */}
          {activeSequenceData?.title && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
              <div className="flex items-center gap-3 mb-4 border-t border-neutral-100 dark:border-zinc-805 pt-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light dark:bg-brand-primary/10 text-brand-primary dark:text-blue-400">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-850 dark:text-zinc-200 text-sm">Competencias Específicas de la Secuencia</h4>
                  <p className="text-xs text-neutral-500 dark:text-zinc-400">Selecciona las competencias específicas que se trabajarán hoy.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(() => {
                  const title = activeSequenceData.title || "";
                  const normalizedUnidad = title.trim().toLowerCase();
                  const mappingKey = Object.keys(SEQUENCE_COMPETENCIES).find(
                    key => key.trim().toLowerCase() === normalizedUnidad
                  );
                  const competencies = mappingKey ? SEQUENCE_COMPETENCIES[mappingKey] : [];

                  if (competencies.length === 0) {
                    return (
                      <div className="col-span-full p-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-amber-700 dark:text-amber-400 text-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span>⚠️</span> No hay competencias específicas definidas para esta secuencia.
                        </div>
                      </div>
                    );
                  }

                  const getSpecCompIcon = (titleStr: string) => {
                    const t = titleStr.toLowerCase();
                    if (t.includes("comprensión oral") || t.includes("comprension oral")) return <Volume2 className="h-4 w-4" />;
                    if (t.includes("producción oral") || t.includes("produccion oral")) return <Mic className="h-4 w-4" />;
                    if (t.includes("comprensión escrita") || t.includes("comprension escrita")) return <BookOpen className="h-4 w-4" />;
                    if (t.includes("producción escrita") || t.includes("produccion escrita")) return <PenTool className="h-4 w-4" />;
                    return <Target className="h-4 w-4" />;
                  };

                  return competencies.map((comp, idx) => {
                    const isSelected = competenciasEspecificas.includes(comp);
                    const colonIndex = comp.indexOf(":");
                    const titlePart = colonIndex !== -1 ? comp.substring(0, colonIndex).trim() : comp.trim();

                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          let newSpecs = [...competenciasEspecificas];
                          if (isSelected) {
                            newSpecs = newSpecs.filter((s) => s !== comp);
                          } else {
                            newSpecs.push(comp);
                          }
                          setCompetenciasEspecificas(newSpecs);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-brand-primary/20 bg-brand-light/20 dark:border-brand-primary/30 dark:bg-brand-primary/10"
                            : "border-gray-200 dark:border-zinc-805 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all ${
                            isSelected ? "border-brand-primary bg-brand-primary" : "border-gray-205 dark:border-zinc-750 bg-white dark:bg-zinc-955"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                        </span>
                        <span className={`shrink-0 transition-colors ${isSelected ? "text-brand-primary" : "text-neutral-400 dark:text-zinc-500"}`}>
                          {getSpecCompIcon(titlePart)}
                        </span>
                        <span className={`text-sm ${isSelected ? "font-semibold text-[#1B1B1B] dark:text-white" : "text-neutral-700 dark:text-zinc-300"}`}>
                          {titlePart}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Sequence-Specific Competencies Editable Details Card */}
          {competenciasEspecificas.length > 0 && (
            <div className="mt-6 rounded-2xl border border-gray-205 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light dark:bg-brand-primary/10 text-brand-primary dark:text-blue-400">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-white text-left">Competencias Específicas de la Secuencia</h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-500 text-left">Descripciones detalladas de las competencias seleccionadas que se trabajarán hoy.</p>
                  </div>
                </div>
                
                {/* Ocultar/Mostrar Competencias Específicas */}
                <button
                  type="button"
                  onClick={() => setHideSpecificCompetencies(!hideSpecificCompetencies)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer ${
                    hideSpecificCompetencies
                      ? "bg-indigo-50 dark:bg-indigo-955/20 text-indigo-700 dark:text-indigo-450 border-indigo-200 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                      : "bg-rose-50 dark:bg-rose-955/20 text-rose-700 dark:text-rose-455 border-rose-200 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                  }`}
                  title={hideSpecificCompetencies ? "Mostrar competencias específicas" : "Ocultar competencias específicas"}
                >
                  {hideSpecificCompetencies ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span>{hideSpecificCompetencies ? "Mostrar Específicas" : "Ocultar Específicas"}</span>
                </button>
              </div>

              {!hideSpecificCompetencies ? (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {competenciasEspecificas.map((comp) => {
                    const colonIndex = comp.indexOf(":");
                    const titlePart = colonIndex !== -1 ? comp.substring(0, colonIndex).trim() : comp.trim();
                    const editing = editingSeqComp === titlePart;
                    const descValue = seqCompDescs[titlePart] !== undefined ? seqCompDescs[titlePart] : (colonIndex !== -1 ? comp.substring(colonIndex + 1).trim() : "");

                    return (
                      <div key={titlePart} className="rounded-xl border border-brand-primary/15 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-left">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                            <h4 className="text-sm font-semibold text-brand-primary dark:text-blue-400">{titlePart}</h4>
                          </div>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setEditingSeqComp(editing ? null : titlePart);
                            }}
                            className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 shadow-sm transition-all hover:-translate-y-px cursor-pointer"
                          >
                            {editing ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                            {editing ? "Listo" : "Editar texto"}
                          </button>
                        </div>
                        {editing ? (
                          <textarea
                            autoFocus
                            rows={4}
                            className={textareaCls}
                            value={descValue}
                            onChange={(e) => setSeqCompDescs((d) => ({ ...d, [titlePart]: e.target.value }))}
                            onBlur={() => setEditingSeqComp(null)}
                          />
                        ) : (
                          <p
                            onClick={() => setEditingSeqComp(titlePart)}
                            className="cursor-text border-l-2 border-brand-primary/30 dark:border-brand-primary/50 pl-3 text-sm leading-relaxed text-gray-500 dark:text-zinc-400"
                          >
                            {descValue}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Las Competencias Específicas de la Secuencia están ocultas. No se mostrarán en la impresión.
                  </p>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* 04. Secuencia didáctica */}
        <div className="mb-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-16px_rgba(16,24,40,0.08)] sm:p-8">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-white flex items-center gap-2 font-sans">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Secuencia Didáctica (Momentos)
            </h3>
            <button
              type="button"
              onClick={() => {
                setActiveGamifyMomentId(null);
                setShowGamifyModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-955/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer whitespace-nowrap"
            >
              <Gamepad2 className="h-4 w-4" />
              Gamificar Clase
            </button>
          </div>

          <div className="space-y-8">
            {/* INICIO card */}
            <div className="bg-green-50/50 dark:bg-green-955/10 rounded-3xl p-6 border border-green-150 dark:border-green-900/30 shadow-xs">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-green-100 dark:border-green-900/20">
                <span className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-widest bg-green-100 dark:bg-green-955 px-3 py-1 rounded-full border border-green-200/50 dark:border-green-900/35">
                  Inicio
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFetchEphemeris}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs transition-all hover:-translate-y-px cursor-pointer"
                  >
                    <CalendarDays className="h-3.5 w-3.5 text-amber-500" />
                    Efeméride
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const firstInicio = momentos.find(m => m.moment === 'Inicio');
                      setActiveBloomMomentId(firstInicio?.id || null);
                      setShowBloomModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-955/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs transition-all hover:-translate-y-px cursor-pointer"
                  >
                    <BrainCircuit className="h-3.5 w-3.5 text-purple-500" />
                    Bloom
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const firstInicio = momentos.find(m => m.moment === 'Inicio');
                      setActiveInclusionMomentId(firstInicio?.id || null);
                      setShowInclusionModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-955/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs transition-all hover:-translate-y-px cursor-pointer"
                  >
                    <Accessibility className="h-3.5 w-3.5 text-indigo-500" />
                    PEDI
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMomento('Inicio')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs transition-all hover:-translate-y-px cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-emerald-500" />
                    AGREGAR MOMENTO
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {momentos.filter(m => m.moment === 'Inicio').map((m, idx) => (
                  <div key={m.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-2xs relative mb-4 text-left">
                    {/* Row 1: MOMENTO and ACTIVIDADES */}
                    <div className="flex flex-col md:flex-row gap-5 mb-5 items-start">
                      {/* Column 1: MOMENTO */}
                      <div className="w-full md:w-28 shrink-0">
                        <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                          MOMENTO
                        </label>
                        <div className="h-10 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl flex items-center justify-center font-display text-sm font-black text-slate-805 dark:text-white">
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Column 2: ACTIVIDADES */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-sans">
                            ACTIVIDADES
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setExpandedField({ momentId: m.id, fieldKey: "descripcion" })}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline border-none bg-transparent cursor-pointer"
                            >
                              <Maximize2 className="h-3.5 w-3.5" />
                              Ampliar
                            </button>
                            <button
                            type="button"
                            onClick={() => {
                              const shown = !!showDiferenciadas[m.id];
                              setShowDiferenciadas(prev => ({ ...prev, [m.id]: !shown }));
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline border-none bg-transparent cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                            Actividad diferenciada
                          </button>
                            
                            <button
                              type="button"
                              onClick={() => handleRemoveMomento(m.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-650 hover:underline border-none bg-transparent cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                        <AutoGrowingTextarea
                          rows={3}
                          className={textareaCls}
                          placeholder="Descripción de las actividades..."
                          value={m.descripcion}
                          onChange={(e) => updateMomento(m.id, "descripcion", e.target.value)}
                          minHeight={80}
                          focusedMinHeight={140}
                        />
                      </div>
                    </div>

                    {/* Row 2: TIEMPO (MIN), ACTIVIDAD #, LETRAS, RECURSOS */}
                    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.5fr_1.5fr_3fr] gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                          TIEMPO (MIN)
                        </label>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Ej: 15"
                          value={m.tiempo}
                          onChange={(e) => updateMomento(m.id, "tiempo", e.target.value)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-sans">
                            ACTIVIDAD #
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAutoIncrementActivity(m.id, m.orden_actividad || "")}
                            className="w-4 h-4 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 cursor-pointer font-bold transition-all text-xs"
                          >
                            +
                          </button>
                        </div>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Ej: 1"
                          value={m.orden_actividad || ""}
                          onChange={(e) => updateMomento(m.id, "orden_actividad", e.target.value)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-sans">
                            LETRAS
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddLetter(m.id, m.numero_actividad || "")}
                            className="w-4 h-4 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 cursor-pointer font-bold transition-all text-xs"
                          >
                            +
                          </button>
                        </div>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Ej: A"
                          value={m.numero_actividad || ""}
                          onChange={(e) => updateMomento(m.id, "numero_actividad", e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                          RECURSOS
                        </span>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Materiales y recursos didácticos..."
                          value={m.recursos}
                          onChange={(e) => updateMomento(m.id, "recursos", e.target.value)}
                        />
                      </div>
                    </div>
                 <DifferentiatedActivitiesSection
                   moment={m}
                   show={!!showDiferenciadas[m.id]}
                   onUpdate={(activities) => updateMomento(m.id, "actividadesDiferenciadas", activities)}
                 />
</div>))}
              </div>
            </div>

            {/* DESARROLLO card */}
            <div className="bg-amber-50/50 dark:bg-amber-955/10 rounded-3xl p-6 border border-amber-155 dark:border-amber-900/30 shadow-xs">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-amber-100 dark:border-amber-900/20">
                <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-100 dark:bg-amber-955 px-3 py-1 rounded-full border border-amber-200/50 dark:border-amber-900/35">
                  Desarrollo
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const firstDesarrollo = momentos.find(m => m.moment === 'Desarrollo');
                      setActiveBloomMomentId(firstDesarrollo?.id || null);
                      setShowBloomModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-955/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs transition-all hover:-translate-y-px cursor-pointer"
                  >
                    <BrainCircuit className="h-3.5 w-3.5 text-purple-500" />
                    Bloom
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const firstDesarrollo = momentos.find(m => m.moment === 'Desarrollo');
                      setActiveInclusionMomentId(firstDesarrollo?.id || null);
                      setShowInclusionModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-955/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs transition-all hover:-translate-y-px cursor-pointer"
                  >
                    <Accessibility className="h-3.5 w-3.5 text-indigo-500" />
                    PEDI
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMomento('Desarrollo')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs transition-all hover:-translate-y-px cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-amber-500" />
                    AGREGAR MOMENTO
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {momentos.filter(m => m.moment === 'Desarrollo').map((m, idx) => (
                  <div key={m.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-2xs relative mb-4 text-left">
                    {/* Row 1: MOMENTO and ACTIVIDADES */}
                    <div className="flex flex-col md:flex-row gap-5 mb-5 items-start">
                      {/* Column 1: MOMENTO */}
                      <div className="w-full md:w-28 shrink-0">
                        <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                          MOMENTO
                        </label>
                        <div className="h-10 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl flex items-center justify-center font-display text-sm font-black text-slate-805 dark:text-white">
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Column 2: ACTIVIDADES */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-sans">
                            ACTIVIDADES
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setExpandedField({ momentId: m.id, fieldKey: "descripcion" })}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline border-none bg-transparent cursor-pointer"
                            >
                              <Maximize2 className="h-3.5 w-3.5" />
                              Ampliar
                            </button>
                            <button
                            type="button"
                            onClick={() => {
                              const shown = !!showDiferenciadas[m.id];
                              setShowDiferenciadas(prev => ({ ...prev, [m.id]: !shown }));
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline border-none bg-transparent cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                            Actividad diferenciada
                          </button>
                            
                            <button
                              type="button"
                              onClick={() => handleRemoveMomento(m.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-650 hover:underline border-none bg-transparent cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                        <AutoGrowingTextarea
                          rows={3}
                          className={textareaCls}
                          placeholder="Descripción de las actividades..."
                          value={m.descripcion}
                          onChange={(e) => updateMomento(m.id, "descripcion", e.target.value)}
                          minHeight={80}
                          focusedMinHeight={140}
                        />
                      </div>
                    </div>

                    {/* Row 2: TIEMPO (MIN), ACTIVIDAD #, LETRAS, RECURSOS */}
                    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.5fr_1.5fr_3fr] gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                          TIEMPO (MIN)
                        </label>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Ej: 45"
                          value={m.tiempo}
                          onChange={(e) => updateMomento(m.id, "tiempo", e.target.value)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-sans">
                            ACTIVIDAD #
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAutoIncrementActivity(m.id, m.orden_actividad || "")}
                            className="w-4 h-4 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 cursor-pointer font-bold transition-all text-xs"
                          >
                            +
                          </button>
                        </div>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Ej: 2"
                          value={m.orden_actividad || ""}
                          onChange={(e) => updateMomento(m.id, "orden_actividad", e.target.value)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-sans">
                            LETRAS
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddLetter(m.id, m.numero_actividad || "")}
                            className="w-4 h-4 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 cursor-pointer font-bold transition-all text-xs"
                          >
                            +
                          </button>
                        </div>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Ej: A"
                          value={m.numero_actividad || ""}
                          onChange={(e) => updateMomento(m.id, "numero_actividad", e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                          RECURSOS
                        </span>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Materiales y recursos didácticos..."
                          value={m.recursos}
                          onChange={(e) => updateMomento(m.id, "recursos", e.target.value)}
                        />
                      </div>
                    </div>
                 <DifferentiatedActivitiesSection
                   moment={m}
                   show={!!showDiferenciadas[m.id]}
                   onUpdate={(activities) => updateMomento(m.id, "actividadesDiferenciadas", activities)}
                 />
</div>))}
              </div>
            </div>

            {/* CIERRE Y EVALUACION card */}
            <div className="bg-blue-50/50 dark:bg-blue-955/10 rounded-3xl p-6 border border-blue-150 dark:border-blue-900/30 shadow-xs">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-blue-100 dark:border-blue-900/20">
                <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest bg-blue-100 dark:bg-blue-955 px-3 py-1 rounded-full border border-blue-200/50 dark:border-blue-900/35">
                  Cierre y evaluación
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const firstCierre = momentos.find(m => m.moment === 'Cierre y evaluación');
                      setActiveBloomMomentId(firstCierre?.id || null);
                      setShowBloomModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-955/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs transition-all hover:-translate-y-px cursor-pointer"
                  >
                    <BrainCircuit className="h-3.5 w-3.5 text-purple-500" />
                    Bloom
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const firstCierre = momentos.find(m => m.moment === 'Cierre y evaluación');
                      setActiveInclusionMomentId(firstCierre?.id || null);
                      setShowInclusionModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-955/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs transition-all hover:-translate-y-px cursor-pointer"
                  >
                    <Accessibility className="h-3.5 w-3.5 text-indigo-500" />
                    PEDI
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMomento('Cierre y evaluación')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-455 border border-blue-200/50 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs transition-all hover:-translate-y-px cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-blue-500" />
                    AGREGAR MOMENTO
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {momentos.filter(m => m.moment === 'Cierre y evaluación').map((m, idx) => (
                  <div key={m.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-2xs relative mb-4 text-left">
                    {/* Row 1: MOMENTO and ACTIVIDADES */}
                    <div className="flex flex-col md:flex-row gap-5 mb-5 items-start">
                      {/* Column 1: MOMENTO */}
                      <div className="w-full md:w-28 shrink-0">
                        <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                          MOMENTO
                        </label>
                        <div className="h-10 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl flex items-center justify-center font-display text-sm font-black text-slate-805 dark:text-white">
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Column 2: ACTIVIDADES */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-sans">
                            ACTIVIDADES
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setExpandedField({ momentId: m.id, fieldKey: "descripcion" })}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline border-none bg-transparent cursor-pointer"
                            >
                              <Maximize2 className="h-3.5 w-3.5" />
                              Ampliar
                            </button>
                            <button
                            type="button"
                            onClick={() => {
                              const shown = !!showDiferenciadas[m.id];
                              setShowDiferenciadas(prev => ({ ...prev, [m.id]: !shown }));
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline border-none bg-transparent cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                            Actividad diferenciada
                          </button>
                            
                            <button
                              type="button"
                              onClick={() => handleRemoveMomento(m.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-650 hover:underline border-none bg-transparent cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                        <AutoGrowingTextarea
                          rows={3}
                          className={textareaCls}
                          placeholder="Descripción de las actividades..."
                          value={m.descripcion}
                          onChange={(e) => updateMomento(m.id, "descripcion", e.target.value)}
                          minHeight={80}
                          focusedMinHeight={140}
                        />
                      </div>
                    </div>

                    {/* Row 2: TIEMPO (MIN), ACTIVIDAD #, LETRAS, RECURSOS */}
                    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.5fr_1.5fr_3fr] gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                          TIEMPO (MIN)
                        </label>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Ej: 15"
                          value={m.tiempo}
                          onChange={(e) => updateMomento(m.id, "tiempo", e.target.value)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-sans">
                            ACTIVIDAD #
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAutoIncrementActivity(m.id, m.orden_actividad || "")}
                            className="w-4 h-4 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 cursor-pointer font-bold transition-all text-xs"
                          >
                            +
                          </button>
                        </div>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Ej: 3"
                          value={m.orden_actividad || ""}
                          onChange={(e) => updateMomento(m.id, "orden_actividad", e.target.value)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-sans">
                            LETRAS
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddLetter(m.id, m.numero_actividad || "")}
                            className="w-4 h-4 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 cursor-pointer font-bold transition-all text-xs"
                          >
                            +
                          </button>
                        </div>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Ej: A"
                          value={m.numero_actividad || ""}
                          onChange={(e) => updateMomento(m.id, "numero_actividad", e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
                          RECURSOS
                        </span>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Materiales y recursos didácticos..."
                          value={m.recursos}
                          onChange={(e) => updateMomento(m.id, "recursos", e.target.value)}
                        />
                      </div>
                    </div>
                 <DifferentiatedActivitiesSection
                   moment={m}
                   show={!!showDiferenciadas[m.id]}
                   onUpdate={(activities) => updateMomento(m.id, "actividadesDiferenciadas", activities)}
                 />
</div>))}
              </div>
            </div>
          </div>
        </div>

        {/* 04. Actividades de Cierre y Diversidad */}
        <Section
          number="04"
          title="Actividades de Cierre y Diversidad"
          description="Actividades adicionales o diferenciadas para atender la diversidad y tareas de refuerzo."
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-left">
            <Field label="Actividades complementarias para atender a la diversidad">
              <AutoGrowingTextarea
                rows={4}
                className={textareaCls}
                placeholder="Describa las actividades para atender a la diversidad..."
                value={actividadComplementaria}
                onChange={(e) => setActividadComplementaria(e.target.value)}
              />
            </Field>
            <Field label="Actividad para el cuaderno">
              <AutoGrowingTextarea
                rows={4}
                className={textareaCls}
                placeholder="Actividad asignada para el cuaderno..."
                value={actividadCuaderno}
                onChange={(e) => setActividadCuaderno(e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* AUDIT STATUS DISPLAY */}
        <CurricularCoherenceReport 
          auditResult={auditResult} 
          onClose={() => setAuditResult(null)} 
        />

        {/* Action bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-5.5 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px border-none cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isAuditing ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <ShieldQuestion className="h-4 w-4 text-white" />
              )}
              Verificar coherencia
            </button>
            <button
              type="button"
              onClick={onCancel || onBack}
              className="inline-flex items-center gap-2 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-355 border border-rose-200 dark:border-rose-900/30 px-5.5 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px cursor-pointer shadow-xs hover:shadow-sm"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-955/20 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-355 border border-amber-200 dark:border-amber-900/30 px-5.5 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px cursor-pointer shadow-xs hover:shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="inline-flex items-center gap-2 rounded-full bg-[#1e40af] hover:bg-[#1b3a9e] text-white px-5.5 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px cursor-pointer shadow-md border-none"
            >
              <Eye className="h-4 w-4" /> Vista previa
            </button>
            <button
              type="button"
              onClick={handleSaveForm}
              className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px cursor-pointer border-none shadow-md"
            >
              <Save className="h-4 w-4" /> Guardar planificación
            </button>
          </div>
        </div>
      </div>

      {/* Standalone Premium AI Modals */}
      <BloomLevelerModal
        isOpen={showBloomModal}
        onClose={() => setShowBloomModal(false)}
        onApply={(leveledText) => {
          const split = splitMomentsText(leveledText);
          if ((split.inicio || split.desarrollo || split.cierre) && momentos.length >= 3) {
            if (split.inicio) updateMomento(momentos[0].id, "descripcion", split.inicio);
            if (split.desarrollo) updateMomento(momentos[1].id, "descripcion", split.desarrollo);
            if (split.cierre) updateMomento(momentos[2].id, "descripcion", split.cierre);
            toast.success("Se actualizaron los Momentos (Inicio, Desarrollo y Cierre) con la nivelación cognitiva.");
          } else {
            if (activeBloomMomentId) {
              updateMomento(activeBloomMomentId, "descripcion", leveledText);
            } else {
              setIntencionPedagogica(leveledText);
            }
          }
        }}
        originalActivities={
          activeBloomMomentId
            ? momentos.find((m) => m.id === activeBloomMomentId)?.descripcion || ""
            : intencionPedagogica
        }
      />

      <InclusionModal
        isOpen={showInclusionModal}
        onClose={() => setShowInclusionModal(false)}
        onApply={(adaptedText, resources) => {
          const split = splitMomentsText(adaptedText);
          if ((split.inicio || split.desarrollo || split.cierre) && momentos.length >= 3) {
            if (split.inicio) updateMomento(momentos[0].id, "descripcion", split.inicio);
            if (split.desarrollo) updateMomento(momentos[1].id, "descripcion", split.desarrollo);
            if (split.cierre) updateMomento(momentos[2].id, "descripcion", split.cierre);
            toast.success("Se adaptaron los Momentos (Inicio, Desarrollo y Cierre) para la condición seleccionada.");
          } else {
            if (activeInclusionMomentId) {
              updateMomento(activeInclusionMomentId, "descripcion", adaptedText);
            }
          }
          if (resources && resources.length > 0) {
            if (activeInclusionMomentId) {
              const moment = momentos.find((m) => m.id === activeInclusionMomentId);
              const currentRec = moment?.recursos || "";
              const extraRec = resources.join(", ");
              const newRec = currentRec ? `${currentRec}, ${extraRec}` : extraRec;
              updateMomento(activeInclusionMomentId, "recursos", newRec);
            } else if (momentos.length > 0) {
              const currentRec = momentos[0].recursos || "";
              const extraRec = resources.join(", ");
              const newRec = currentRec ? `${currentRec}, ${extraRec}` : extraRec;
              updateMomento(momentos[0].id, "recursos", newRec);
            }
          }
        }}
        originalActivities={
          activeInclusionMomentId
            ? momentos.find((m) => m.id === activeInclusionMomentId)?.descripcion || ""
            : ""
        }
      />

      <GamifyModal
        isOpen={showGamifyModal}
        onClose={() => setShowGamifyModal(false)}
        onApply={(gamifiedText) => {
          const split = splitMomentsText(gamifiedText);
          if ((split.inicio || split.desarrollo || split.cierre) && momentos.length >= 3) {
            if (split.inicio) updateMomento(momentos[0].id, "descripcion", split.inicio);
            if (split.desarrollo) updateMomento(momentos[1].id, "descripcion", split.desarrollo);
            if (split.cierre) updateMomento(momentos[2].id, "descripcion", split.cierre);
            toast.success("Se gamificaron los Momentos (Inicio, Desarrollo y Cierre) con la misión activa.");
          } else {
            if (activeGamifyMomentId) {
              updateMomento(activeGamifyMomentId, "descripcion", gamifiedText);
            } else {
              let newIntention = `${intencionPedagogica}\n\n🎮 **Misión Gamificada**`;
              setIntencionPedagogica(newIntention);
              if (momentos.length > 0) {
                updateMomento(momentos[0].id, "descripcion", gamifiedText);
              }
            }
          }
        }}
        originalContent={{
          intention: intencionPedagogica,
          activities: activeGamifyMomentId
            ? momentos.find((m) => m.id === activeGamifyMomentId)?.descripcion || ""
            : momentos.map((m, idx) => `Momento ${idx + 1}: ${m.moment} - ${m.descripcion}`).join("\n"),
        }}
      />

      {/* FIELD EXPANSION MODAL */}
      {expandedField && (
        <div
          onClick={() => setExpandedField(null)}
          className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-zinc-800 rounded-[32px] p-6 md:p-8 max-w-2xl w-full shadow-2xl relative cursor-default text-left flex flex-col h-[60vh] animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-4 border-b border-gray-150 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-slate-805 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-brand-primary" />
                Ampliar Campo: {expandedField.fieldKey === "descripcion" ? "Estrategias y Actividades" : "Recursos"}
              </h3>
              <button
                onClick={() => setExpandedField(null)}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-650 text-white cursor-pointer transition-all hover:scale-105 active:scale-95 border-none p-0 shadow-sm"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            <textarea
              className="flex-1 w-full p-4 rounded-2xl border border-gray-200 dark:border-zinc-805 bg-white dark:bg-zinc-955 text-[#1B1B1B] dark:text-zinc-100 placeholder:text-gray-400 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/15 resize-none leading-relaxed text-sm font-medium"
              value={
                momentos.find((m) => m.id === expandedField.momentId)?.[
                  expandedField.fieldKey === "descripcion" ? "descripcion" : "recursos"
                ] || ""
              }
              onChange={(e) => {
                updateMomento(
                  expandedField.momentId,
                  expandedField.fieldKey === "descripcion" ? "descripcion" : "recursos",
                  e.target.value
                );
              }}
              placeholder="Escribe el contenido detallado aquí..."
            />

            <div className="flex justify-end gap-3 border-t border-gray-105 dark:border-zinc-800 pt-4 mt-4 shrink-0">
              <button
                type="button"
                onClick={() => setExpandedField(null)}
                className="bg-brand-primary hover:bg-brand-hover text-white font-bold h-9 px-6 rounded-full shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all text-xs border-none"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Helpers ---------- */

const inputCls =
  "w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-zinc-900 disabled:text-gray-400";

const textareaCls =
  "w-full bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none leading-relaxed disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-zinc-900 disabled:text-gray-400";

interface AutoGrowingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  minHeight?: number;
  focusedMinHeight?: number;
}

const AutoGrowingTextarea = React.forwardRef<HTMLTextAreaElement, AutoGrowingTextareaProps>(
  ({ value, className, minHeight = 130, focusedMinHeight = 200, ...props }, ref) => {
    const localRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
      const el = localRef.current;
      if (el) {
        if (isFocused) {
          el.style.height = "auto";
          el.style.height = `${Math.max(focusedMinHeight, el.scrollHeight)}px`;
        } else {
          el.style.height = `${minHeight}px`;
        }
      }
    }, [value, isFocused, minHeight, focusedMinHeight]);

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (isFocused) {
        const el = e.currentTarget;
        el.style.height = "auto";
        el.style.height = `${Math.max(focusedMinHeight, el.scrollHeight)}px`;
      }
      if (props.onInput) {
        props.onInput(e as any);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      if (props.onFocus) {
        props.onFocus(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      if (props.onBlur) {
        props.onBlur(e);
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
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`${className} transition-all duration-200 resize-none overflow-y-auto`}
        {...props}
      />
    );
  }
);
AutoGrowingTextarea.displayName = "AutoGrowingTextarea";

function Section({
  number,
  title,
  description,
  action,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-16px_rgba(16,24,40,0.08)] sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4 text-left">
          <span className="mt-0.5 font-sans text-2xl font-black text-brand-primary">{number}</span>
          <div className="text-left font-sans">
            <h2 className="text-lg font-semibold tracking-tight text-[#1B1B1B] dark:text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

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
        <span className="text-xs font-bold uppercase tracking-wide text-neutral-800 dark:text-zinc-200 font-sans">
          {label}
          {required && <span className="ml-1 text-red-500 dark:text-red-450">*</span>}
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}

function Pill({
  icon,
  tone,
  children,
}: {
  icon: React.ReactNode;
  tone: "amber" | "primary" | "indigo";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/30",
    primary:
      "bg-blue-50 text-brand-primary border-blue-100 dark:bg-indigo-950/20 dark:text-blue-450 dark:border-indigo-900/30",
    indigo:
      "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-955/20 dark:text-indigo-400 dark:border-indigo-900/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${tones[tone]}`}>
      {icon}
      {children}
    </span>
  );
}
