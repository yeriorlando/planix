import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Gamepad2,
  Building2,
  Target,
  Check,
  Pencil,
  ShieldCheck,
  Eye,
  EyeOff,
  Maximize2,
  ShieldQuestion,
  Loader2,
  Zap,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  AlertTriangle,
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
  History,
  HelpCircle,
  MessageSquare,
  Scale,
  Leaf,
  Heart,
  Car,
  Users,
  HeartPulse,
  Handshake,
  Ruler,
  Dumbbell,
} from "lucide-react";
import { toast } from "sonner";
import { DatePicker } from "../../../../ui/heroui-date-picker";
import SchoolAutocomplete from "../../../SchoolAutocomplete";
import confetti from "canvas-confetti";
import { uid } from "../../../../../lib/storage";
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
  generateDailyPlan,
  synthesizeUnitPlan,
} from "../../../../../lib/services/aiService";
import { fetchPlannings } from "../../../../../lib/services/plannings";
import { requestD1 } from "../../../../../lib/services/d1Client";
import { getUnitsBySubjectAndGrade, Unit } from "../../../../../lib/data/unitCurriculum";

// Import standalone premium AI modals
import BloomLevelerModal from "../../../../ai/BloomLevelerModal";
import InclusionModal from "../../../../ai/InclusionModal";
import GamifyModal from "../../../../ai/GamifyModal";
import CurricularCoherenceReport from "../../../../ai/CurricularCoherenceReport";
import DailyPlanSelector from "../../../../modals/DailyPlanSelector";

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

const formatMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return "";
  const lines = markdown.split("\n");
  const htmlLines: string[] = [];
  let inParagraph = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inParagraph) {
        htmlLines.push("</p>");
        inParagraph = false;
      }
      continue;
    }

    if (trimmed.startsWith("###")) {
      if (inParagraph) {
        htmlLines.push("</p>");
        inParagraph = false;
      }
      const headerText = trimmed.replace(/^###\s*/, "");
      htmlLines.push(`<h3>${headerText}</h3>`);
    } else if (trimmed.startsWith("####")) {
      if (inParagraph) {
        htmlLines.push("</p>");
        inParagraph = false;
      }
      const headerText = trimmed.replace(/^####\s*/, "");
      htmlLines.push(`<h4>${headerText}</h4>`);
    } else {
      if (!inParagraph) {
        htmlLines.push("<p>");
        inParagraph = true;
      }
      const parsedLine = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      htmlLines.push(parsedLine + " ");
    }
  }

  if (inParagraph) {
    htmlLines.push("</p>");
  }

  return htmlLines.join("\n");
};

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

type CompetenciaKey = "comunicativa" | "logico" | "etica";

const COMPETENCIAS: { key: CompetenciaKey; label: string; defaultDesc: string }[] = [
  {
    key: "comunicativa",
    label: "Comunicativa",
    defaultDesc:
      "Domina sus gestos y movimientos corporales, con el fin de expresar y comunicar de forma intencional sus sentimientos, emociones y estados de ánimo, en relación con el entorno natural y social.",
  },
  {
    key: "logico",
    label: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
    defaultDesc:
      "Aplica sus habilidades motrices y capacidades físicas en actividades motrices progresivas; a los fines de alcanzar la eficacia motora en situaciones creativas de juego, apoyadas en herramientas tecnológicas de la vida cotidiana.",
  },
  {
    key: "etica",
    label: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
    defaultDesc:
      "Establece relaciones armoniosas en su grupo de juegos y de otras acciones motrices; con el objetivo de actuar con sentido de respeto a la diversidad individual, social y cultural, aportando a la inclusión y la convivencia responsable en su entorno.",
  },
];

const EJES_TRANSVERSALES = [
  "Salud y Bienestar",
  "Desarrollo Sostenible",
  "Desarrollo Personal y Profesional",
  "Alfabetización Imprescindible",
  "Ciudadanía y Convivencia"
];

const ASIGNATURAS_PRIMARIA = [
  { name: "Lengua Española", icon: BookMarked },
  { name: "Matemática", icon: Ruler },
  { name: "Educación Física", icon: Globe },
  { name: "Ciencias de la Naturaleza", icon: Leaf },
  { name: "Educación Artística", icon: Palette },
  { name: "Educación Física", icon: Dumbbell },
  { name: "Educación Física", icon: Heart },
  { name: "Lenguas Extranjeras - Inglés", icon: Languages },
  { name: "Lenguas Extranjeras - Francés", icon: Languages },
];

const FALLBACK_INDICATORS = [
  "**Domina sus gestos** y movimientos corporales, al expresar sus sentimientos en situaciones de interacción.",
  "**Valora la relación** y comunicación corporal de sus emociones durante la práctica de actividad física y juegos recreativos, en los que se realicen saltos y lanzamientos de objetos con peso moderado.",
  "**Expresa intencionalmente su** estado de ánimo y nivel de satisfacción que le producen los diferentes movimientos corporales en la realización de carreras a diferentes ritmos, entre puntos y bases.",
  "**Expresa su satisfacción** y disfrute al jugar una partida de ajedrez, aplicando las normas generales de la apertura y realizando mates elementales (dos torres y rey contra rey, dos alfiles y rey contra rey).",
  "**Aplica sus capacidades** físicas y sus habilidades motrices en las actividades motoras que realiza al participar en juegos predeportivos de golpeo (con manos, pies, bates u otros materiales), de atrapadas de aire y de rolling de diferentes móviles pelotas, aplicando técnicas básicas.",
  "**Usa herramientas tecnológicas** adecuadas a su nivel de desarrollo en el aprendizaje de técnicas para el desempeño en actividades físicas relacionadas con el entorno social.",
  "**Demuestra nivel de** desarrollo de la eficacia motora progresiva, a partir de sus condiciones físicas naturales en la ejecución de saltos con giros diversos sobre su eje vertical, con piernas cerradas y abiertas y alternando un modo y otro en el despegue y la salida.",
  "**Demuestra respeto a** los demás en relaciones armoniosas, durante las tareas motrices grupales realización de juegos de coordinación visomotora aplicada al voleibol, fútbol, béisbol y situaciones de la vida cotidiana.",
  "**Evidencia compromiso con** la diversidad individual, social and cultural en sus relaciones grupales, durante la realización de juegos de conducción del balón y de pases y tiros con las extremidades inferiores y la cabeza, aplicando técnicas básicas.",
  "**Muestra interés por** la inclusión social, aportando con su comportamiento a la igualdad de todos y a la convivencia responsable durante la participación en juegos adaptados de voleibol de cooperación y oposición para el saque, golpe bajo, voleo y ataque, aplicando técnicas básicas."
];

export interface EducacionFisicaUnidad6toProps {
  user: any;
  selectedSequence: any; // The selected unit
  selectedTheme: any; // The selected theme
  selectedSubtheme: any; // The selected subtheme
  selectedSequenceType: "CON_BASE" | "CURRICULAR";
  selectedLevel: "INICIAL" | "PRIMARIA" | "SECUNDARIA" | null;
  selectedGrade: string;
  selectedSubject: any;
  selectedPlanningType: string;
  onBack: () => void;
  onCancel?: () => void;
  onSave: (customData: any) => void;
}

const DRAFT_KEY = "plx:educacionfisica6to_unidad_draft";

function loadDraft(expectedUnitId: string): any | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.unitId === expectedUnitId) {
        return parsed;
      }
    }
  } catch (_) {}
  return null;
}

function clearDraft() {
  try { sessionStorage.removeItem(DRAFT_KEY); } catch (_) {}
}

export default function EducacionFisicaUnidad6to({
  user,
  selectedSequence,
  selectedTheme,
  selectedSubtheme,
  selectedGrade,
  selectedSubject,
  onBack,
  onCancel,
  onSave,
}: EducacionFisicaUnidad6toProps) {
  // Draft restoration flag
  const restoringDraftRef = React.useRef(false);
  const draft = React.useMemo(() => loadDraft(selectedSequence?.id), [selectedSequence]);

  // General info states (pre-populated by selected unit/theme/subtheme or draft)
  const unidad = selectedSequence?.name || "";
  const tema = selectedTheme?.name || "";
  const subtema = selectedSubtheme?.name || "";

  // Duración estimada state
  const [duracion, setDuracion] = useState(draft?.duracion ?? "1 semana");

  // Daily plan selector and synthesis states
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Curricular content states
  const [conceptual, setConceptual] = useState(draft?.conceptual ?? (selectedSubtheme?.conceptual ?? ""));
  const [procedural, setProcedural] = useState(draft?.procedural ?? (selectedSubtheme?.procedural ?? ""));
  const [attitudinal, setAttitudinal] = useState(draft?.attitudinal ?? (selectedSubtheme?.attitudinal ?? ""));

  // Core Form states
  const [docente] = useState(user?.nombre || user?.full_name || "");
  const [centroEducativo, setCentroEducativo] = useState(draft?.centroEducativo ?? (user?.colegio || user?.school_name || "Sin Centro Educativo"));
  const [seccion, setSeccion] = useState(draft?.seccion ?? "A");
  const [fecha, setFecha] = useState(draft?.fecha ?? new Date().toISOString().split("T")[0]);

  const [intencionPedagogica, setIntencionPedagogica] = useState(draft?.intencionPedagogica ?? (selectedSubtheme?.intent ?? ""));
  const [competenciasFundamentales, setCompetenciasFundamentales] = useState<string[]>(draft?.competenciasFundamentales ?? []);
  const [hideSpecificCompetencies, setHideSpecificCompetencies] = useState<boolean>(draft?.hideSpecificCompetencies ?? false);

  const [compDescs, setCompDescs] = useState<Record<CompetenciaKey, string>>(draft?.compDescs ?? {
    comunicativa: COMPETENCIAS[0].defaultDesc,
    logico: COMPETENCIAS[1].defaultDesc,
    etica: COMPETENCIAS[2].defaultDesc,
  });
  const [editingComp, setEditingComp] = useState<CompetenciaKey | null>(null);

  // Ejes Transversales & Áreas Articuladas
  const [ejesTransversales, setEjesTransversales] = useState<string[]>(draft?.ejesTransversales ?? []);
  const [areasArticuladas, setAreasArticuladas] = useState<string[]>(() => {
    if (Array.isArray(draft?.areasArticuladas)) {
      return draft.areasArticuladas;
    }
    if (typeof draft?.areasArticuladas === 'string' && draft.areasArticuladas) {
      return draft.areasArticuladas.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  });
  const [showAreasDropdown, setShowAreasDropdown] = useState(false);

  // Componentes Curriculares
  const [estrategia, setEstrategia] = useState(draft?.estrategia ?? "");
  const [indicadoresLogro, setIndicadoresLogro] = useState<string[]>(draft?.indicadoresLogro ?? []);
  const [showIndicatorsDropdown, setShowIndicatorsDropdown] = useState(false);

  // Actividades (mapped to momentos for DB compatibility)
  const [actividadesEnsenanza, setActividadesEnsenanza] = useState(draft?.actividadesEnsenanza ?? (draft?.momentos?.[0]?.descripcion ?? ""));
  const [actividadesAprendizaje, setActividadesAprendizaje] = useState(draft?.actividadesAprendizaje ?? (draft?.momentos?.[1]?.descripcion ?? ""));
  const [actividadesEvaluacion, setActividadesEvaluacion] = useState(draft?.actividadesEvaluacion ?? (draft?.momentos?.[2]?.descripcion ?? ""));

  // Evaluación y Recursos
  const [tecnicas, setTecnicas] = useState(draft?.tecnicas ?? "");
  const [instrumentos, setInstrumentos] = useState(draft?.instrumentos ?? "");
  const [recursos, setRecursos] = useState(draft?.recursos ?? "");

  // Momentos array (maintained for DB compatibility)
  const [momentos, setMomentos] = useState<any[]>(draft?.momentos ?? []);

  // Additional text fields
  const [metacognicion, setMetacognicion] = useState(draft?.metacognicion ?? "");
  const [metacognicionTiempo, setMetacognicionTiempo] = useState(draft?.metacognicionTiempo ?? "15");
  const [evaluacion, setEvaluacion] = useState(draft?.evaluacion ?? "");
  const [evaluacionTiempo, setEvaluacionTiempo] = useState(draft?.evaluacionTiempo ?? "15");
  const [tareaHogar, setTareaHogar] = useState(draft?.tareaHogar ?? "");
  const [actividadComplementaria, setActividadComplementaria] = useState(draft?.actividadComplementaria ?? "");

  // New Saberes Previos & Retroalimentación states
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
          unitId: selectedSequence?.id,
          centroEducativo, seccion, fecha,
          intencionPedagogica, competenciasFundamentales, hideSpecificCompetencies,
          compDescs, momentos,
          metacognicion, metacognicionTiempo,
          evaluacion, evaluacionTiempo,
          tareaHogar, actividadComplementaria,
          saberesPrevios, useSaberesPrevios,
          retroalimentacion, useRetroalimentacion,
          conceptual, procedural, attitudinal,
          duracion,
          ejesTransversales, areasArticuladas,
          estrategia, indicadoresLogro,
          actividadesEnsenanza, actividadesAprendizaje, actividadesEvaluacion,
          tecnicas, instrumentos, recursos,
          _ts: Date.now(),
        };
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      } catch (_) {}
    }, 800);
    return () => clearTimeout(timer);
  }, [
    centroEducativo, seccion, fecha,
    intencionPedagogica, competenciasFundamentales, hideSpecificCompetencies,
    compDescs, momentos,
    metacognicion, metacognicionTiempo,
    evaluacion, evaluacionTiempo,
    tareaHogar, actividadComplementaria,
    saberesPrevios, useSaberesPrevios,
    retroalimentacion, useRetroalimentacion,
    conceptual, procedural, attitudinal,
    duracion,
    ejesTransversales, areasArticuladas,
    estrategia, indicadoresLogro,
    actividadesEnsenanza, actividadesAprendizaje, actividadesEvaluacion,
    tecnicas, instrumentos, recursos,
  ]);

  // AI & Modal states
  const [isGeneratingEvaluation, setIsGeneratingEvaluation] = useState(false);
  const [isGeneratingComplementary, setIsGeneratingComplementary] = useState(false);

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




  // Field Expansion Modal State
  const [expandedField, setExpandedField] = useState<{ momentId: string; fieldKey: "descripcion" | "recursos" } | null>(null);

  // Setup Tiptap Editor for Complementary Activities
  const complementaryEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Describe las actividades de refuerzo o de ampliación aquí...",
      }),
    ],
    content: actividadComplementaria,
    onUpdate: ({ editor }) => {
      setActividadComplementaria(editor.getHTML());
    },
  });

  // Sync editor content when state changes externally (e.g. from IA autofill)
  useEffect(() => {
    if (complementaryEditor) {
      const isHtmlEmpty = (html: string) => !html || html === "<p></p>" || html === "<p><br></p>";
      const target = actividadComplementaria;
      const current = complementaryEditor.getHTML();
      if (isHtmlEmpty(target) && isHtmlEmpty(current)) return;
      if (target !== current) {
        complementaryEditor.commands.setContent(target);
      }
    }
  }, [actividadComplementaria, complementaryEditor]);

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

  // Sync Saberes Previos editor content when state changes externally (e.g. from IA autofill)
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

  // Sync Retroalimentación editor content when state changes externally (e.g. from IA autofill)
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

  // Restoring draft check (skipping initial effects if needed)
  React.useEffect(() => {
    if (restoringDraftRef.current) {
      restoringDraftRef.current = false;
    }
  }, []);

  const toggleComp = (k: CompetenciaKey) => {
    const labelMap: Record<CompetenciaKey, string> = {
      comunicativa: "Competencia Comunicativa",
      logico: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
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
      logico: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
      etica: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
    };
    return competenciasFundamentales.includes(labelMap[k]);
  };

  // Handle moments actions
  const handleAddMomento = () => {
    const nextIdx = momentos.length + 1;
    setMomentos([
      ...momentos,
      {
        id: `mom-custom-${Date.now()}`,
        moment: `Momento ${nextIdx}`,
        titulo: `Momento ${nextIdx}`,
        descripcion: "",
        tiempo: "15",
        recursos: "Cuaderno, Lápiz",
        hideDescription: false,
      },
    ]);
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
              ...(k === "moment" || k === "titulo" ? { moment: v, titulo: v } : {}),
            }
          : m
      )
    );
  };

  const handlePreview = () => {
    const builtMomentos = [
      { id: 'mom-ens', moment: 'Enseñanza', titulo: 'Actividades de Enseñanza', descripcion: actividadesEnsenanza, tiempo: '15', recursos: recursos, hideDescription: false },
      { id: 'mom-apr', moment: 'Aprendizaje', titulo: 'Actividades de Aprendizaje', descripcion: actividadesAprendizaje, tiempo: '25', recursos: recursos, hideDescription: false },
      { id: 'mom-eva', moment: 'Evaluación', titulo: 'Actividades de Evaluación', descripcion: actividadesEvaluacion, tiempo: '10', recursos: recursos, hideDescription: false },
    ];

    const previewData = {
      docente,
      centro_educativo: centroEducativo,
      grado: "6to. (Primaria)",
      seccion,
      fecha,
      area: "Educación Física",
      asignatura: "Educación Física",
      secuencia: selectedSequence?.name || "",
      titulo: `Unidad: ${selectedSequence?.name || "Educación Física"}`,
      intencion_pedagogica: intencionPedagogica,
      competencias: competenciasFundamentales,
      competencias_especificas: Object.entries(compDescs)
        .filter(([k]) => isChecked(k as CompetenciaKey))
        .map(([k, v]) => {
          const labelMap: Record<CompetenciaKey, string> = {
            comunicativa: "Comunicativa",
            logico: "Pensamiento Lógico",
            etica: "Ética y Ciudadana",
          };
          return `${labelMap[k as CompetenciaKey] || k}: ${v}`;
        }),
      hideSpecificCompetencies: hideSpecificCompetencies,
      momentos: builtMomentos,
      recursos_adicionales: metacognicion,
      metacognicion,
      evaluacion,
      tarea_hogar: tareaHogar,
      actividad_complementaria: actividadComplementaria,
      saberes_previos: useSaberesPrevios ? saberesPrevios : "",
      retroalimentacion: useRetroalimentacion ? retroalimentacion : "",
      conceptual,
      procedural,
      attitudinal,
      planningType: "UNIDAD",
      duracion_estimada: duracion,
      duracion,
      ejes_transversales: ejesTransversales.join('\n'),
      areas_articuladas: areasArticuladas.join(', '),
      estrategia: estrategia,
      indicadores_logro: indicadoresLogro,
      actividades_ensenanza: actividadesEnsenanza,
      actividades_aprendizaje: actividadesAprendizaje,
      actividades_evaluacion: actividadesEvaluacion,
      tecnicas,
      instrumentos,
      recursos,
    };
    sessionStorage.setItem("plx:temp_planning_preview", JSON.stringify(previewData));
    localStorage.setItem("plx:temp_planning_preview", JSON.stringify(previewData));
    window.open("/planificacion/preview?temp=true", "_blank");
  };

  // --- AI ACTIONS ---
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateContent = async () => {
    setIsGenerating(true);

    try {
      const plan = await generateDailyPlan({
        grado: "6to. (Primaria)",
        asignatura: "Educación Física",
        unidad: selectedSequence?.name || "",
        tema: selectedTheme?.name || "",
        subtema: selectedSubtheme?.name || "",
        docente,
        centro_educativo: centroEducativo
      });

      if (plan) {
        setIntencionPedagogica(plan.intencion_pedagogica || "");
        
        // Map moments
        if (Array.isArray(plan.momentos)) {
          const mapped = plan.momentos.map((m: any, index: number) => {
            const titleStr = m.titulo || m.title || (index === 0 ? "Inicio" : index === 1 ? "Desarrollo" : "Cierre");
            const cleanTime = m.tiempo ? m.tiempo.replace(/\s*min\s*/i, '').trim() : (index === 0 ? "15" : index === 1 ? "25" : "10");
            return {
              id: `mom-${Date.now()}-${index}`,
              moment: m.moment || titleStr,
              titulo: titleStr,
              descripcion: m.descripcion || "",
              tiempo: cleanTime,
              recursos: m.recursos || "Cuaderno, lápiz",
              hideDescription: false,
            };
          });
          setMomentos(mapped);
        }
        
        setMetacognicion(plan.metacognicion || "");
        setEvaluacion(plan.evaluacion || "");
        setTareaHogar(plan.tarea_casa || "");
        
        toast.success("¡Planificación de Educación Física generada!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al generar la planificación con IA");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateEvaluationAndMeta = async () => {
    setIsGeneratingEvaluation(true);
    toast.loading("Generando Metacognición y Evaluación...", { id: "ai-gen" });

    try {
      const planData = {
        grado: "6to. (Primaria)",
        asignatura: "Educación Física",
        secuencia: selectedSequence?.name || "",
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

  const handleGenerateComplementary = async () => {
    setIsGeneratingComplementary(true);
    toast.loading("Generando actividades complementarias...", { id: "ai-comp" });

    try {
      const planData = {
        grado: "6to. (Primaria)",
        asignatura: "Educación Física",
        secuencia: selectedSequence?.name || "",
        intencion_pedagogica: intencionPedagogica,
        momentos: momentos,
      };

      const result = await generateComplementaryActivities(planData);
      
      const htmlFormatted = `<p><strong>Actividad de Refuerzo (Grupo de Apoyo)</strong><br />
<strong>Título: ${result.refuerzo?.titulo || "Refuerzo Lúdico"}</strong></p>
<p>${result.refuerzo?.descripcion || "Actividad de apoyo para afianzar los conceptos del día."}</p>
<p>&nbsp;</p>
<p><strong>Actividad de Ampliación (Grupo Avanzado)</strong><br />
<strong>Título: ${result.ampliacion?.titulo || "Reto de Ampliación"}</strong></p>
<p>${result.ampliacion?.descripcion || "Actividad avanzada de investigación o creación autónoma."}</p>`;

      setActividadComplementaria(htmlFormatted);
      toast.success("Actividades complementarias creadas", { id: "ai-comp" });
    } catch (err) {
      console.error(err);
      toast.error("Error al generar las actividades complementarias", { id: "ai-comp" });
    } finally {
      setIsGeneratingComplementary(false);
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
      // Remove starting markdown headers like #, ##, ### etc.
      let cleaned = item.replace(/^#+\s*/, "").trim();
      // Remove starting markdown bullets like * or - or •
      cleaned = cleaned.replace(/^[*•\-+]\s*/, "").trim();
      // Remove all ** occurrences
      cleaned = cleaned.replace(/\*\*/g, "").trim();

      if (isHeader) {
        // Bold the entire header line
        cleaned = `**${cleaned}**`;
      } else {
        // Find the first colon to bold the header
        const firstColonIndex = cleaned.indexOf(":");
        if (firstColonIndex !== -1) {
          const header = cleaned.substring(0, firstColonIndex + 1);
          let rest = cleaned.substring(firstColonIndex + 1);

          // Bold all questions in the rest part (matching ¿ up to ?)
          rest = rest.replace(/(¿[^?]+\?)/g, "**$1**");

          cleaned = `**${header.trim()}**${rest}`;
        } else {
          // If there's no colon, just bold any questions in the whole item
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
        grado: "6to. (Primaria)",
        secuencia: selectedSequence?.name || "",
        area: "Educación Física",
        asignatura: "Educación Física",
        intencion_pedagogica: intencionPedagogica,
        unidad,
        tema,
        subtema,
        isCurricular: true,
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
      
      const socPlans = plannings
        .filter(p => 
          (p.asignatura?.toLowerCase().includes("educacion-fisica") || p.titulo?.toLowerCase().includes("educacion-fisica") || p.asignatura?.toLowerCase().includes("educacion fisica") || p.titulo?.toLowerCase().includes("educacion fisica")) &&
          (p.grado?.toLowerCase().includes("6") || p.grado?.toLowerCase().includes("sext"))
        )
        .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());

      if (socPlans.length === 0) {
        toast.error("No se encontró ninguna planificación anterior de Educación Física de 6to. (Primaria) para esta cuenta.", { id: "ai-retro" });
        return;
      }

      const latestPlan = socPlans[0];
      toast.loading(`Generando retroalimentación basada en: "${latestPlan.titulo || 'Planificación anterior'}"`, { id: "ai-retro" });

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
        grado: "6to. (Primaria)",
        seccion: seccion,
        area: "Educación Física",
        secuencia: selectedSequence?.name || "",
        intencion_pedagogica: intencionPedagogica,
        competencias: competenciasFundamentales,
        competencias_especificas: Object.keys(compDescs)
          .filter((k) => isChecked(k as CompetenciaKey))
          .map((k) => compDescs[k as CompetenciaKey]),
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

  const handleSynthesize = async (selectedPlans: any[]) => {
    setIsSynthesizing(true);
    toast.loading("Sintetizando planificaciones diarias con IA...", { id: "ai-synth" });

    try {
      // 1. Curricular context
      const curContext = {
        tema: unidad,
        competencias: competenciasFundamentales.join(", "),
        competencias_especificas: Object.keys(compDescs)
          .filter((k) => isChecked(k as CompetenciaKey))
          .map((k) => compDescs[k as CompetenciaKey])
          .join("\n"),
        centro_educativo: centroEducativo,
        seccion: seccion
      };

      // 2. Synthesize using our client-side service
      const data = await synthesizeUnitPlan(
        selectedPlans,
        "Educación Física",
        "6to. (Primaria)",
        curContext
      );

      // Helper to extract nested ContentBlock or flat string array contents from unit
      const extractUnitContents = (unit: any) => {
        const conceptuals: string[] = [];
        const procedurals: string[] = [];
        const attitudinals: string[] = [];

        if (Array.isArray(unit.conceptual_content)) {
          unit.conceptual_content.forEach((block: any) => {
            if (block && typeof block === 'object') {
              if (block.conceptual) {
                const val = block.conceptual.trim();
                if (!conceptuals.includes(val)) conceptuals.push(val);
              }
              if (block.procedural) {
                const val = block.procedural.trim();
                if (!procedurals.includes(val)) procedurals.push(val);
              }
              if (block.attitudinal) {
                const val = block.attitudinal.trim();
                if (!attitudinals.includes(val)) attitudinals.push(val);
              }
            } else if (typeof block === 'string') {
              const val = block.trim();
              if (!conceptuals.includes(val)) conceptuals.push(val);
            }
          });
        } else if (typeof unit.conceptual_content === 'string') {
          const val = unit.conceptual_content.trim();
          if (!conceptuals.includes(val)) conceptuals.push(val);
        }

        if (Array.isArray(unit.procedural_content)) {
          unit.procedural_content.forEach((item: any) => {
            if (typeof item === 'string') {
              const val = item.trim();
              if (!procedurals.includes(val)) procedurals.push(val);
            }
          });
        } else if (typeof unit.procedural_content === 'string') {
          const val = unit.procedural_content.trim();
          if (!procedurals.includes(val)) procedurals.push(val);
        }

        if (Array.isArray(unit.attitudinal_content)) {
          unit.attitudinal_content.forEach((item: any) => {
            if (typeof item === 'string') {
              const val = item.trim();
              if (!attitudinals.includes(val)) attitudinals.push(val);
            }
          });
        } else if (typeof unit.attitudinal_content === 'string') {
          const val = unit.attitudinal_content.trim();
          if (!attitudinals.includes(val)) attitudinals.push(val);
        }

        return {
          conceptual: conceptuals.filter(Boolean),
          procedural: procedurals.filter(Boolean),
          attitudinal: attitudinals.filter(Boolean)
        };
      };

      // 3. Fetch custom units from D1 SQLite and merge with static units
      const customUnitsRaw = await requestD1<any[]>('/api/custom-units').catch(() => []);
      const staticUnits = getUnitsBySubjectAndGrade('educacion-fisica', '6to');
      const filteredCustom = customUnitsRaw
        .filter(cu => cu.subject_id === 'educacion-fisica' && cu.grade_id === '6to')
        .map(cu => cu.content);

      const map = new Map<string, Unit>();
      staticUnits.forEach(u => map.set(u.id, u));
      filteredCustom.forEach(u => {
        if (u.isDeleted) {
          map.delete(u.id);
        } else {
          map.set(u.id, u);
        }
      });
      const globalUnits = Array.from(map.values());

      const contentBlocks: { title: string, conceptual: string[], procedural: string[], attitudinal: string[] }[] = [];
      const seenUnitIds = new Set<string>();

      selectedPlans.forEach(plan => {
        const pData = plan.customFields || plan.formData || {};
        const unitId = plan.sequence_id || plan.secuencia_id || pData.sequence_id || pData.secuencia_id || plan.unit_id || pData.unit_id;
        
        if (unitId && !seenUnitIds.has(unitId)) {
          const unit = globalUnits.find(u => u.id === unitId);
          if (unit) {
            seenUnitIds.add(unitId);
            const extracted = extractUnitContents(unit);
            
            if (extracted.conceptual.length > 0 || extracted.procedural.length > 0 || extracted.attitudinal.length > 0) {
              contentBlocks.push({
                title: unit.name,
                conceptual: extracted.conceptual,
                procedural: extracted.procedural,
                attitudinal: extracted.attitudinal
              });
            }
          }
        }
      });

      // Format strings for the curricular fields
      const formatBlockField = (blocks: any[], field: 'conceptual' | 'procedural' | 'attitudinal') => {
        return blocks.map((block, idx) => {
          const blockTitle = `**UNIDAD: ${block.title.toUpperCase()}**`;
          const content = block[field].join('\n');
          return `${idx > 0 ? '\n\n' : ''}${blockTitle}\n${content}`;
        }).join('');
      };

      let finalConceptual = formatBlockField(contentBlocks, 'conceptual');
      let finalProcedural = formatBlockField(contentBlocks, 'procedural');
      let finalAttitudinal = formatBlockField(contentBlocks, 'attitudinal');

      // Fallback to daily plans' own properties if no matching unit blocks are found from D1/static database
      if (!finalConceptual) {
        const uniqueConceptuals = new Set<string>();
        selectedPlans.forEach((plan) => {
          const pData = plan.customFields || plan.formData || {};
          const val = plan.conceptual || pData.conceptual;
          if (val) uniqueConceptuals.add(typeof val === 'string' ? val.trim() : JSON.stringify(val));
        });
        if (uniqueConceptuals.size > 0) finalConceptual = Array.from(uniqueConceptuals).join("\n\n");
      }

      if (!finalProcedural) {
        const uniqueProcedurals = new Set<string>();
        selectedPlans.forEach((plan) => {
          const pData = plan.customFields || plan.formData || {};
          const val = plan.procedural || pData.procedural || plan.procedimental || pData.procedimental;
          if (val) uniqueProcedurals.add(typeof val === 'string' ? val.trim() : JSON.stringify(val));
        });
        if (uniqueProcedurals.size > 0) finalProcedural = Array.from(uniqueProcedurals).join("\n\n");
      }

      if (!finalAttitudinal) {
        const uniqueAttitudinals = new Set<string>();
        selectedPlans.forEach((plan) => {
          const pData = plan.customFields || plan.formData || {};
          const val = plan.attitudinal || pData.attitudinal || plan.actitudinal || pData.actitudinal;
          if (val) uniqueAttitudinals.add(typeof val === 'string' ? val.trim() : JSON.stringify(val));
        });
        if (uniqueAttitudinals.size > 0) finalAttitudinal = Array.from(uniqueAttitudinals).join("\n\n");
      }

      if (finalConceptual) setConceptual(finalConceptual);
      if (finalProcedural) setProcedural(finalProcedural);
      if (finalAttitudinal) setAttitudinal(finalAttitudinal);

      // EXTRACT OTHER DATA (RESOURCES, INSTRUMENTS, ETC)
      const manualResources = new Set<string>();
      const manualTechniques = new Set<string>();
      const manualInstruments = new Set<string>();

      selectedPlans.forEach(plan => {
        const pData = plan.formData || plan.customFields || {};

        const addFn = (source: any, targetSet: Set<string>) => {
          if (!source) return;
          const processAndAdd = (str: string) => {
            const items = str.split(/[\n,;]+/)
              .map(s => s.trim())
              .filter(s => s.length > 2 && !s.startsWith('¿') && !s.includes('?'));
            items.forEach(i => targetSet.add(i));
          };

          if (Array.isArray(source)) {
            source.forEach(s => s && processAndAdd(s));
          } else if (typeof source === 'string') {
            processAndAdd(source);
          }
        };

        // Aggregate Resources
        if (pData.recursos) addFn(pData.recursos, manualResources);
        if (pData.recursos_adicionales) addFn(pData.recursos_adicionales, manualResources);
        if (plan.recursos) addFn(plan.recursos, manualResources);

        // Extract from moments
        if (Array.isArray(pData.momentos)) {
          pData.momentos.forEach((m: any) => {
            if (m.recursos) addFn(m.recursos, manualResources);
          });
        }

        // Aggregate Techniques & Instruments
        if (pData.evaluacion) addFn(pData.evaluacion, manualInstruments);
        if (plan.evaluacion) addFn(plan.evaluacion, manualInstruments);
        if (pData.instrumentos) addFn(pData.instrumentos, manualInstruments);
        if (pData.tecnicas) addFn(pData.tecnicas, manualTechniques);
      });

      const finalResources = Array.from(manualResources).join('\n');
      const finalInstruments = Array.from(manualInstruments).join('\n');
      const finalTechniques = Array.from(manualTechniques).join('\n');

      setRecursos(finalResources || data.recursos || "");
      setTecnicas(finalTechniques || data.tecnicas || "");
      setInstrumentos(finalInstruments || data.evaluacion || "");
      setEvaluacion(finalInstruments || data.evaluacion || "");

      // 4. Set synthesized fields
      setIntencionPedagogica(data.situacion_aprendizaje || data.intencion_pedagogica || "");

      // 5. Populate Moments (Inicio, Desarrollo, Cierre)
      const parsedMoments = [
        {
          id: `mom-synth-inicio-${Date.now()}`,
          moment: "Inicio de la Unidad",
          titulo: "Inicio y Situación de Aprendizaje",
          descripcion: `Estrategias:\n${data.estrategia || "Estrategia de indagación y socialización"}\n\nSituación de aprendizaje:\n${data.situacion_aprendizaje || ""}`,
          tiempo: "15",
          recursos: "Pizarra, láminas didácticas",
          hideDescription: false
        },
        {
          id: `mom-synth-desarrollo-${Date.now()}`,
          moment: "Desarrollo de la Unidad",
          titulo: "Actividades de Enseñanza y Aprendizaje",
          descripcion: `Actividades de Enseñanza:\n${data.actividades_ensenanza || ""}\n\nActividades de Aprendizaje:\n${data.actividades_aprendizaje || ""}`,
          tiempo: "45",
          recursos: finalResources || data.recursos || "Cuaderno, lápiz",
          hideDescription: false
        },
        {
          id: `mom-synth-cierre-${Date.now()}`,
          moment: "Cierre de la Unidad",
          titulo: "Evaluación y Cierre de la Unidad",
          descripcion: `Actividades de Evaluación:\n${data.actividades_evaluacion || ""}\n\nTécnicas de Evaluación:\n${finalTechniques || data.tecnicas || ""}`,
          tiempo: "15",
          recursos: "Instrumento de evaluación",
          hideDescription: false
        }
      ];

      setMomentos(parsedMoments);

      // Also populate the individual activity/evaluation textareas
      if (data.actividades_ensenanza) setActividadesEnsenanza(data.actividades_ensenanza);
      if (data.actividades_aprendizaje) setActividadesAprendizaje(data.actividades_aprendizaje);
      if (data.actividades_evaluacion) setActividadesEvaluacion(data.actividades_evaluacion);
      if (data.estrategia) setEstrategia(data.estrategia);

      toast.success("¡Síntesis de unidad completada con éxito!", { id: "ai-synth" });
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
      toast.error("Error al sintetizar las planificaciones diarias", { id: "ai-synth" });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSaveForm = () => {
    if (!seccion.trim()) {
      toast.error("La sección es obligatoria.");
      return;
    }

    // Build momentos from individual activity fields for DB compatibility
    const builtMomentos = [
      { id: 'mom-ens', moment: 'Enseñanza', titulo: 'Actividades de Enseñanza', descripcion: actividadesEnsenanza, tiempo: '15', recursos: recursos, hideDescription: false },
      { id: 'mom-apr', moment: 'Aprendizaje', titulo: 'Actividades de Aprendizaje', descripcion: actividadesAprendizaje, tiempo: '25', recursos: recursos, hideDescription: false },
      { id: 'mom-eva', moment: 'Evaluación', titulo: 'Actividades de Evaluación', descripcion: actividadesEvaluacion, tiempo: '10', recursos: recursos, hideDescription: false },
    ];

    const payload = {
      centro_educativo: centroEducativo,
      docente: docente,
      grado: "6to. (Primaria)",
      seccion: seccion,
      area: "Educación Física",
      fecha: fecha,
      titulo: `Unidad: ${selectedSequence?.name || "Educación Física"}`,
      secuencia: selectedSequence?.name || "",
      duracion_estimada: duracion,
      duracion: duracion,
      planningType: "UNIDAD",
      intencion_pedagogica: intencionPedagogica,
      competencias: competenciasFundamentales,
      competencias_especificas: Object.keys(compDescs)
        .filter((k) => isChecked(k as CompetenciaKey))
        .map((k) => compDescs[k as CompetenciaKey]),
      hideSpecificCompetencies: hideSpecificCompetencies,
      momentos: builtMomentos,
      evaluacion: evaluacion,
      metacognicion: metacognicion,
      metacognicion_tiempo: metacognicionTiempo,
      tarea_hogar: tareaHogar,
      actividad_complementaria: actividadComplementaria,
      saberes_previos: useSaberesPrevios ? saberesPrevios : "",
      retroalimentacion: useRetroalimentacion ? retroalimentacion : "",
      conceptual: conceptual,
      procedural: procedural,
      attitudinal: attitudinal,
      ejes_transversales: ejesTransversales.join('\n'),
      areas_articuladas: areasArticuladas.join(', '),
      estrategia: estrategia,
      indicadores_logro: indicadoresLogro,
      actividades_ensenanza: actividadesEnsenanza,
      actividades_aprendizaje: actividadesAprendizaje,
      actividades_evaluacion: actividadesEvaluacion,
      tecnicas: tecnicas,
      instrumentos: instrumentos,
      recursos: recursos,
    };

    clearDraft();
    onSave(payload);
  };

  return (
    <div className="w-full bg-transparent text-[#1B1B1B] dark:text-zinc-100 font-sans relative overflow-hidden">
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
      <div className="mx-auto max-w-5xl px-2 pb-8 pt-14 md:pt-20 text-left relative z-10">
        {/* Hero Header */}
        <div className="mb-8 relative border-b border-slate-100 dark:border-zinc-800 pb-5 text-center">
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="font-display text-5xl tracking-tight text-[#1B1B1B] dark:text-white font-black">
              Educación Física
            </h1>
            <p className="mt-2 text-sm font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
              Planificación de Unidad
            </p>
          </div>
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
              <input className={inputCls} value="6to. (Primaria)" readOnly />
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
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Área">
              <input className={inputCls} value="Educación Física" readOnly />
            </Field>
            <Field label="Unidad">
              <input className={`${inputCls} truncate`} value={unidad} readOnly />
            </Field>
            <Field label="Duración" required>
              <select
                className={inputCls}
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
              >
                <option value="1 semana">1 semana</option>
                <option value="2 semanas">2 semanas</option>
                <option value="3 semanas">3 semanas</option>
                <option value="4 semanas">4 semanas</option>
                <option value="5 semanas">5 semanas</option>
                <option value="6 semanas">6 semanas</option>
              </select>
            </Field>
            <Field label="Fecha" required>
              <DatePicker value={fecha} onChange={setFecha} />
            </Field>
          </div>
        </Section>

        {/* Tarjeta Premium de Importación */}
        <div className="bg-[#5D5FEF]/5 dark:bg-[#5D5FEF]/10 border border-[#5D5FEF]/20 dark:border-[#5D5FEF]/30 rounded-[20px] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden my-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-100/80 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/30 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5.5 h-5.5 text-amber-500" />
            </div>
            <div className="font-sans">
              <h3 className="text-base font-bold text-slate-800 dark:text-white leading-snug">
                Prepara tu planificación de Unidad usando las Diarias
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 max-w-xl leading-relaxed">
                Puedes importar múltiples planificaciones diarias para crear la de Unidad. La Inteligencia Artificial sintetizará los momentos, competencias y saberes de forma inteligente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSelectorOpen(true)}
            disabled={isSynthesizing}
            className="h-10 px-6 bg-[#5D5FEF] hover:bg-[#4B4DDF] text-white rounded-full text-xs font-bold shadow-xs cursor-pointer border-none flex items-center gap-2 transition-all duration-150 hover:-translate-y-px active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSynthesizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sintetizando...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Importar Diarias
              </>
            )}
          </button>
        </div>

        {/* 02. Competencias Fundamentales */}
        <Section
          number="02"
          title="Competencias Fundamentales"
          description="Selecciona las competencias y edita la descripción específica del grado."
        >
          {(() => {
            const compIcons: Record<CompetenciaKey, React.ReactNode> = {
              comunicativa: <MessageSquare className="h-4 w-4" />,
              logico: <BrainCircuit className="h-4 w-4" />,
              etica: <Scale className="h-4 w-4" />,
            };
            return (
              <div className="space-y-2">
                {COMPETENCIAS.map((c) => {
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
                          checked ? "border-brand-primary bg-brand-primary" : "border-gray-205 dark:border-zinc-750 bg-white dark:bg-zinc-950"
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
                })}
              </div>
            );
          })()}

          {COMPETENCIAS.some((c) => isChecked(c.key)) && (
            <div className="mt-6 rounded-2xl border border-gray-205 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light dark:bg-brand-primary/10 text-brand-primary dark:text-blue-400">
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
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer ${
                    hideSpecificCompetencies
                      ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                      : "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-200 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                  }`}
                  title={hideSpecificCompetencies ? "Mostrar competencias específicas" : "Ocultar competencias específicas"}
                >
                  {hideSpecificCompetencies ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span>{hideSpecificCompetencies ? "Mostrar Específicas" : "Ocultar Específicas"}</span>
                </button>
              </div>

              {!hideSpecificCompetencies ? (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {COMPETENCIAS.filter((c) => isChecked(c.key)).map((c) => {
                    const editing = editingComp === c.key;
                    return (
                      <div key={c.key} className="rounded-xl border border-brand-primary/15 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                            <h4 className="text-sm font-semibold text-brand-primary dark:text-blue-400">{c.label}</h4>
                          </div>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setEditingComp(editing ? null : c.key);
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
                            value={compDescs[c.key]}
                            onChange={(e) => setCompDescs((d) => ({ ...d, [c.key]: e.target.value }))}
                            onBlur={() => setEditingComp(null)}
                          />
                        ) : (
                          <p
                            onClick={() => setEditingComp(c.key)}
                            className="cursor-text border-l-2 border-brand-primary/30 dark:border-brand-primary/50 pl-3 text-sm leading-relaxed text-gray-500 dark:text-zinc-400"
                          >
                            {compDescs[c.key]}
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
        </Section>

        {/* 03. Ejes Transversales & Áreas Articuladas */}
        <Section
          number="03"
          title="Ejes Transversales"
          description="Selecciona los ejes transversales vinculados a esta unidad."
        >
          {(() => {
            const ejeIcons: Record<string, React.ReactNode> = {
              "Salud y Bienestar": <HeartPulse className="h-4 w-4" />,
              "Desarrollo Sostenible": <Leaf className="h-4 w-4" />,
              "Desarrollo Personal y Profesional": <GraduationCap className="h-4 w-4" />,
              "Alfabetización Imprescindible": <BookOpen className="h-4 w-4" />,
              "Ciudadanía y Convivencia": <Handshake className="h-4 w-4" />,
            };
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EJES_TRANSVERSALES.map((eje) => {
                  const checked = ejesTransversales.includes(eje);
                  return (
                    <button
                      type="button"
                      key={eje}
                      onClick={() => {
                        if (checked) {
                          setEjesTransversales(ejesTransversales.filter((x) => x !== eje));
                        } else {
                          setEjesTransversales([...ejesTransversales, eje]);
                        }
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all cursor-pointer ${
                        checked
                          ? "border-brand-primary/20 bg-brand-light/20 dark:border-brand-primary/30 dark:bg-brand-primary/10"
                          : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all ${
                          checked ? "border-brand-primary bg-brand-primary" : "border-gray-205 dark:border-zinc-750 bg-white dark:bg-zinc-950"
                        }`}
                      >
                        {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                      </span>
                      <span className={`shrink-0 transition-colors ${checked ? "text-brand-primary" : "text-neutral-400 dark:text-zinc-500"}`}>
                        {ejeIcons[eje]}
                      </span>
                      <span className={`text-sm ${checked ? "font-semibold text-[#1B1B1B] dark:text-white" : "text-neutral-700 dark:text-zinc-300"}`}>
                        {eje}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })()}

          {/* Áreas Articuladas */}
          <div className="mt-5">
            <Field label="Áreas Articuladas">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAreasDropdown(!showAreasDropdown)}
                  className="w-full flex items-center justify-between bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 hover:bg-neutral-100/30 dark:hover:bg-zinc-800/30 transition-all text-left cursor-pointer"
                >
                  <span className="pr-2 text-left truncate text-xs">
                    {areasArticuladas.length > 0
                      ? `${areasArticuladas.length} asignatura${areasArticuladas.length > 1 ? "s" : ""} seleccionada${areasArticuladas.length > 1 ? "s" : ""}`
                      : <span className="text-neutral-400">Seleccione áreas articuladas...</span>
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 mt-0.5 transition-transform ${showAreasDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showAreasDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAreasDropdown(false)} />
                    <div className="absolute left-0 right-0 mt-1.5 p-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      {ASIGNATURAS_PRIMARIA.map((subject) => {
                        const checked = areasArticuladas.includes(subject.name);
                        const IconComponent = subject.icon;
                        return (
                          <div
                            key={subject.name}
                            onClick={() => {
                              if (checked) {
                                setAreasArticuladas(areasArticuladas.filter(a => a !== subject.name));
                              } else {
                                setAreasArticuladas([...areasArticuladas, subject.name]);
                              }
                            }}
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
                            <IconComponent className={`w-4 h-4 shrink-0 mt-0.5 ${checked ? "text-brand-primary" : "text-neutral-450 dark:text-zinc-405"}`} />
                            <span className={`text-xs ${checked ? "font-semibold text-[#1B1B1B] dark:text-white" : "text-neutral-750 dark:text-zinc-300 font-medium leading-relaxed"}`}>
                              {subject.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </Field>

            {/* Selected areas as removable chips */}
            {areasArticuladas.length > 0 && (() => {
              const chipColors = [
                "bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-800/40 dark:text-indigo-200",
                "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-200",
                "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-200",
                "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800/40 dark:text-rose-200",
                "bg-teal-50 border-teal-200 text-teal-900 dark:bg-teal-950/30 dark:border-teal-800/40 dark:text-teal-200",
                "bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-950/30 dark:border-violet-800/40 dark:text-violet-200",
                "bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/30 dark:border-sky-800/40 dark:text-sky-200",
                "bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950/30 dark:border-orange-800/40 dark:text-orange-200",
                "bg-cyan-50 border-cyan-200 text-cyan-900 dark:bg-cyan-950/30 dark:border-cyan-800/40 dark:text-cyan-200",
              ];
              return (
                <div className="mt-3 flex flex-wrap gap-2">
                  {areasArticuladas.map((name, idx) => {
                    const subject = ASIGNATURAS_PRIMARIA.find(s => s.name === name);
                    const IconComponent = subject?.icon || BookMarked;
                    return (
                      <div
                        key={name}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-all group ${chipColors[idx % chipColors.length]}`}
                      >
                        <IconComponent className="w-3.5 h-3.5 shrink-0" />
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => setAreasArticuladas(areasArticuladas.filter((x) => x !== name))}
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-current opacity-40 hover:opacity-100 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all cursor-pointer"
                          title="Eliminar área"
                        >
                          <X className="h-3 w-3" strokeWidth={2} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </Section>

        {/* 04. Componentes Curriculares */}
        <Section
          number="04"
          title="Componentes Curriculares"
          description="Situación de aprendizaje, estrategias e indicadores de logro."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Situación de aprendizaje" required>
              <AutoGrowingTextarea
                rows={3}
                className={textareaCls}
                placeholder="Explica una situación de la vida diaria que ayude a comprender y aprender este contenido."
                value={intencionPedagogica}
                onChange={(e) => setIntencionPedagogica(e.target.value)}
              />
            </Field>
            <Field label="Estrategias de Enseñanza">
              <AutoGrowingTextarea
                rows={3}
                className={textareaCls}
                placeholder="Descripción de las estrategias y técnicas a utilizar en la clase..."
                value={estrategia}
                onChange={(e) => setEstrategia(e.target.value)}
              />
            </Field>
          </div>

          {/* Indicadores de logro multi-select dropdown */}
          <div className="mt-5">
            <Field label="Indicadores de logro">
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
                      {FALLBACK_INDICATORS.map((indicator, idx) => {
                        const checked = indicadoresLogro.includes(indicator);
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (checked) {
                                setIndicadoresLogro(indicadoresLogro.filter(i => i !== indicator));
                              } else {
                                setIndicadoresLogro([...indicadoresLogro, indicator]);
                              }
                            }}
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
                              {renderMarkdownInline(indicator)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </Field>

            {/* Selected indicators as removable chips */}
            {indicadoresLogro.length > 0 && (() => {
              const chipColors = [
                "bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-800/40 dark:text-indigo-200",
                "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-200",
                "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-200",
                "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800/40 dark:text-rose-200",
                "bg-teal-50 border-teal-200 text-teal-900 dark:bg-teal-950/30 dark:border-teal-800/40 dark:text-teal-200",
                "bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-950/30 dark:border-violet-800/40 dark:text-violet-200",
                "bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/30 dark:border-sky-800/40 dark:text-sky-200",
                "bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950/30 dark:border-orange-800/40 dark:text-orange-200",
                "bg-cyan-50 border-cyan-200 text-cyan-900 dark:bg-cyan-950/30 dark:border-cyan-800/40 dark:text-cyan-200",
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
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-current opacity-40 hover:opacity-100 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all cursor-pointer"
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
        </Section>

        {/* 05. Contenidos Curriculares */}
        <Section
          number="05"
          title="Contenidos Curriculares"
          description="Contenidos conceptuales, procedimentales y actitudinales de la unidad."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Conceptuales (Unidades)">
              <AutoGrowingTextarea
                rows={4}
                className={textareaCls}
                placeholder="Lista de conceptos (uno por línea)..."
                value={conceptual}
                onChange={(e) => setConceptual(e.target.value)}
              />
            </Field>
            <Field label="Procedimentales (Actividades)">
              <AutoGrowingTextarea
                rows={4}
                className={textareaCls}
                placeholder="Lista de procedimientos (uno por línea)..."
                value={procedural}
                onChange={(e) => setProcedural(e.target.value)}
              />
            </Field>
            <Field label="Actitudinales / Evaluación">
              <AutoGrowingTextarea
                rows={4}
                className={textareaCls}
                placeholder="Lista de actitudes y valores (uno por línea)..."
                value={attitudinal}
                onChange={(e) => setAttitudinal(e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* 06. Actividades */}
        <Section
          number="06"
          title="Actividades"
          description="Actividades de enseñanza, aprendizaje y evaluación de la unidad."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="De enseñanza">
              <AutoGrowingTextarea
                rows={4}
                className={textareaCls}
                placeholder="Actividades que realiza el docente..."
                value={actividadesEnsenanza}
                onChange={(e) => setActividadesEnsenanza(e.target.value)}
              />
            </Field>
            <Field label="De aprendizaje">
              <AutoGrowingTextarea
                rows={4}
                className={textareaCls}
                placeholder="Actividades que realizan los estudiantes..."
                value={actividadesAprendizaje}
                onChange={(e) => setActividadesAprendizaje(e.target.value)}
              />
            </Field>
            <Field label="De evaluación">
              <AutoGrowingTextarea
                rows={4}
                className={textareaCls}
                placeholder="Actividades para evaluar aprendizajes..."
                value={actividadesEvaluacion}
                onChange={(e) => setActividadesEvaluacion(e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* 07. Evaluación y Recursos */}
        <Section
          number="07"
          title="Evaluación y Recursos"
          description="Técnicas, instrumentos de evaluación y recursos didácticos."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Técnicas">
              <AutoGrowingTextarea
                rows={4}
                className={textareaCls}
                placeholder="Descripción de las técnicas de evaluación..."
                value={tecnicas}
                onChange={(e) => setTecnicas(e.target.value)}
              />
            </Field>
            <Field label="Instrumentos">
              <AutoGrowingTextarea
                rows={4}
                className={textareaCls}
                placeholder="Lista de instrumentos de evaluación (rúbricas, listas de cotejo...)"
                value={instrumentos}
                onChange={(e) => {
                  setInstrumentos(e.target.value);
                  setEvaluacion(e.target.value);
                }}
              />
            </Field>
            <Field label="Recursos">
              <AutoGrowingTextarea
                rows={4}
                className={textareaCls}
                placeholder="Lista de recursos didácticos y tecnológicos..."
                value={recursos}
                onChange={(e) => setRecursos(e.target.value)}
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
              className="inline-flex items-center gap-2 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-350 border border-rose-200 dark:border-rose-900/30 px-5.5 py-2.5 text-[13px] font-extrabold transition-all hover:-translate-y-px cursor-pointer shadow-xs hover:shadow-sm"
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
              className="flex-1 w-full p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-955 text-[#1B1B1B] dark:text-zinc-100 placeholder:text-gray-400 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/15 resize-none leading-relaxed text-sm font-medium"
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
      {/* LOADING OVERLAY LOADER */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" onClick={() => setIsGenerating(false)}>
          <div 
            className="w-full max-w-[380px] p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200 mx-4 text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center justify-center p-8 pt-10 pb-7 text-center relative animate-in fade-in duration-300">
              <button
                type="button"
                onClick={() => setIsGenerating(false)}
                className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1.5 shadow-md transition-all duration-200 cursor-pointer"
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
                  Diseñando planificación
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

      <DailyPlanSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelectPlans={handleSynthesize}
        subjectId={selectedSubject?.id || "educacion-fisica"}
        grade={selectedGrade}
      />

      {/* SYNTHESIZING OVERLAY LOADER */}
      {isSynthesizing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" onClick={() => setIsSynthesizing(false)}>
          <div 
            className="w-full max-w-[380px] p-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200 mx-4 text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center justify-center p-8 pt-10 pb-7 text-center relative animate-in fade-in duration-300">
              <button
                type="button"
                onClick={() => setIsSynthesizing(false)}
                className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1.5 shadow-md transition-all duration-200 cursor-pointer"
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
                  Diseñando Unidad
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

/* ---------- Helpers ---------- */

const renderMarkdownInline = (text: string) => {
  if (!text) return "";
  const segments = text.split("**");
  return segments.map((seg, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-bold text-[#1B1B1B] dark:text-white">{seg}</strong>;
    }
    return seg;
  });
};

const inputCls =
  "w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-zinc-900 disabled:text-gray-400";

const textareaCls =
  "w-full bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-[#1B1B1B] dark:focus:border-neutral-205 focus:ring-1 focus:ring-[#1B1B1B]/10 outline-none transition-all shadow-xs resize-none leading-relaxed disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-zinc-900 disabled:text-gray-400";

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
          el.style.height = `${Math.max(200, el.scrollHeight)}px`;
        } else {
          el.style.height = "130px";
        }
      }
    }, [value, isFocused]);

    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (isFocused) {
        const el = e.currentTarget;
        el.style.height = "auto";
        el.style.height = `${Math.max(200, el.scrollHeight)}px`;
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
          {required && <span className="ml-1 text-red-500 dark:text-red-400">*</span>}
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
      "bg-blue-50 text-brand-primary border-blue-100 dark:bg-indigo-950/20 dark:text-blue-400 dark:border-indigo-900/30",
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
