import DifferentiatedActivitiesSection from "../../../DifferentiatedActivitiesSection";
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
  Leaf,
  Heart,
  Car,
  Users,
  HeartPulse,
  Handshake,
  MessageSquare,
  Scale,
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
} from "../../../../../lib/services/aiService";
import { fetchPlannings } from "../../../../../lib/services/plannings";

// Import standalone premium AI modals
import BloomLevelerModal from "../../../../ai/BloomLevelerModal";
import InclusionModal from "../../../../ai/InclusionModal";
import GamifyModal from "../../../../ai/GamifyModal";
import CurricularCoherenceReport from "../../../../ai/CurricularCoherenceReport";

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
      "Ofrece explicaciones científicas y tecnológicas a partir de analizar, evaluar y crear preguntas o hipótesis de observaciones, medición, modelos y experimentación de fenómenos naturales en contexto próximo o experimentado o modelado en ciencias de la vida, físicas, de la tierra y el universo.",
  },
  {
    key: "logico",
    label: "Pensamiento Lógico, Crítico y Creativo; Resolución de Problemas; Científica y Tecnológica",
    defaultDesc:
      "Aplica organizados, sistemáticos y creativos procedimientos científicos y tecnológicos, que analiza y evalúa mientras explora o experimenta, simula o construye, haciéndose consciente de sus cuestionamientos e inferencia a partir de su observación y medición llevando a cabo de vivencias, experimentos, proyectos, exploraciones y observaciones guiadas.",
  },
  {
    key: "etica",
    label: "Ética y Ciudadana; Ambiental y de la Salud; Desarrollo Personal y Espiritual",
    defaultDesc:
      "Asume una actitud preventiva, autónoma, autoconsciente, creativa, innovadora, crítica, de apertura, investigadora, colaborativa, solidaria, perseverante, responsable y en armonía integral en sí mismo, con los demás, con su entorno y como parte de los seres vivos, tomando acciones básicas y proactivas en atención a su bienestar y uso sostenible de los recursos.",
  },
];

const EJES_TRANSVERSALES = [
  "Salud y Bienestar",
  "Desarrollo Sostenible",
  "Desarrollo Personal y Profesional",
  "Alfabetización Imprescindible",
  "Ciudadanía y Convivencia"
];

export interface CienciasNaturalesDiaria6toProps {
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

const DRAFT_KEY = "plx:naturales6to_draft";

const FALLBACK_INDICATORS = [
  "**Expresa soluciones adecuadas** donde intervienen la presión y el empuje en fluidos y la transferencia de energía, y analiza algunos experimentos por medio de registros en tablas y gráficas.",
  "**Presenta modelos en** los que muestra la estructura molecular de la materia.",
  "**Utiliza resortes, termómetros,** reglas, y dispositivos para medir la presión en la realización de sus experimentos.",
  "**Aplica los principios** de Pascal y Arquímedes en máquinas, presentando sus modelos e ideas creativamente en colaboración con las demás personas.",
  "**Infiere, siendo creativo** en sus ideas, cómo sería el efecto de la fuerza gravitacional sobre la Tierra, si esta estuviera localizada más cerca o lejana al Sol, argumentando sobre el impacto que tendría en la vida y en la apariencia del planeta.",
  "**Propone modelos sobre** el efecto de la energía solar en la Tierra y los seres vivos en trabajo colaborativo.",
  "**Analiza y evalúa** propiedades y características básicas en los seres vivos; diferentes tipos de células, sus características y niveles de organización, esquematizando las fases de la división celular y las diferencias existentes entre ellas; los sistemas: digestivo, circulatorio, respiratorio y excretor; el proceso de nutrición como fuente de energía para los seres vivos, relacionando el metabolismo y la homeostasis; las consecuencias del embarazo en la adolescencia; los cambios biológicos en su cuerpo y su comportamiento, ocurridos durante el periodo de la pubertad y la adolescencia; en ecosistemas sostenibles.",
  "**Analiza y evalúa** propiedades que caracterizan fenómenos naturales; diferencia entre calor y temperatura, al mismo tiempo que resuelve problemas con cambios de escalas de temperatura; Movimiento y fenómenos relacionado con nuestro Planeta Tierra y el sistema solar; el origen del Universo, el concepto del Big Bang, y la formación del Sistema Solar reconociendo que este pertenece a la Vía Láctea; diferentes constelaciones y su localización en el espacio; Energía, relación de la radiación solar entre nuestro Sol y la Tierra.",
  "**Usa diferentes vías** de comunicación haciendo uso del lenguaje científico y tecnológico apropiadamente para explicar o dar soluciones de forma abierta y creativa a su manera de percibir las propiedades y características de la materia tanto inerte como viva, fenómenos naturales asociado con la interacción de nuestro universo y la tierra, energía y radicación, estructuras y mecanismo de máquinas y sensores, respetando las ideas y diferencias con los demás.",
  "**Diseña con acompañamiento** y ejecuta experimentos e indagación en colaboración; observando, describiendo, registrando y utilizando herramientas o equipos y siguiendo características y propiedades observables de células, tejidos y órganos en seres vivos; Energía y radicación solar; estados de la materia: la solidificación (fusión), evaporación (ebullición), licuefacción (condensación), sublimación (cristalización) con el cambio en la temperatura.",
  "**Planifica, construye y** evalúa modelos, estructuras y funciones de los sistemas: digestivo, circulatorio, respiratorio y excretor; diferentes tipos de células; diferentes unidades medidas de temperatura de uso cotidiano, y modela una escala comparativa; efecto de la fuerza gravitacional sobre los planetas y la tierra; sistema solar; máquinas y mecanismo de acoplamiento, sensores de temperaturas, presión y fuerza; objetos o juguetes, herramientas; nuestro planeta tierra y tecnología de la comunicación de forma adecuada.",
  "**Comunica sus ideas** e hipótesis de las observaciones y experimentos, usando y cuidando los sentidos e instrumentos para percibir, recolectar, obtener y organizar datos e información en tablas y graficas elementales; mostrando y argumentado los resultados de su trabajo de forma objetiva, sistemática y creativa en proyecto individual y colectivo de problemáticas de investigación o innovación escolar y comunitaria en salud, nuestro sistema solar y la tierra, fenómenos naturales geológicos y astronómicos, Medioambiente y sostenibilidad.",
  "**Analiza, lleva a** cabo y evalúa medidas de prevención de algunas enfermedades infectocontagiosas recurrentes en el país producidas en la comunidad a fin de mantener la salud individual y colectiva.",
  "**Implementa y evalúa** colaborativamente medidas sobre el uso sostenible de los recursos como el agua, zona costera, recursos escolares, el cuidado del Medioambiente, efectos de la crisis medioambiental producidos por el impacto de la acción de los individuos sobre los ecosistemas; los diferentes problemas ambientales vinculados a calentamiento global, cambio climático, desforestación y pérdida de biodiversidad que afectan el desarrollo sostenible en la región y el país; así como de seguridad ante fenómenos naturales.",
  "**Analiza y aplica** actitudes y valores proactivos en su desarrollo personal que incentiva como la imaginación, la curiosidad, la colaboración, la perseverancia, la innovación, la objetividad, la responsabilidad, la solidaridad, la creatividad, la adaptabilidad, la observación, interés por profesiones y quehacer científico y tecnológico, aportes de las ciencias experimentales y las tecnologías en nuestra sociedad, y autogestionar sus emociones, preguntas y aprendizaje."
];

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

export default function CienciasNaturalesDiaria6to({
  user,
  selectedSequence,
  selectedTheme,
  selectedSubtheme,
  selectedGrade,
  onBack,
  onCancel,
  onSave,
}: CienciasNaturalesDiaria6toProps) {
  // Draft restoration flag
  const restoringDraftRef = React.useRef(false);
  const draft = React.useMemo(() => loadDraft(selectedSequence?.id), [selectedSequence]);

  // General info states (pre-populated by selected unit/theme/subtheme or draft)
  const unidad = selectedSequence?.name || "";
  const tema = selectedTheme?.name || "";
  const subtema = selectedSubtheme?.name || "";

  // Curricular content states
  const [conceptual, setConceptual] = useState(draft?.conceptual ?? (selectedSubtheme?.conceptual ?? ""));
  const [procedural, setProcedural] = useState(draft?.procedural ?? (selectedSubtheme?.procedural ?? ""));
  const [attitudinal, setAttitudinal] = useState(draft?.attitudinal ?? (selectedSubtheme?.attitudinal ?? ""));

  // New Ciencias de la Naturaleza fields: Teaching-learning strategies, achievement indicators, transversal axes
  const [estrategia, setEstrategia] = useState(draft?.estrategia ?? "");
  const [indicadoresLogro, setIndicadoresLogro] = useState<string[]>(draft?.indicadoresLogro ?? []);
  const [ejesTransversales, setEjesTransversales] = useState<string[]>(draft?.ejesTransversales ?? []);
  const [showIndicatorsDropdown, setShowIndicatorsDropdown] = useState(false);

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

  // Momentos array
  const [momentos, setMomentos] = useState<any[]>(draft?.momentos ?? []);
  const [showDiferenciadas, setShowDiferenciadas] = useState<Record<string, boolean>>({});


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
          estrategia, indicadoresLogro, ejesTransversales,
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
    estrategia, indicadoresLogro, ejesTransversales,
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
    const previewData = {
      docente,
      centro_educativo: centroEducativo,
      planningType: "DIARIA",
      grado: "6to. (Primaria)",
      seccion,
      fecha,
      area: "Ciencias de la Naturaleza",
      asignatura: "Ciencias de la Naturaleza",
      secuencia: selectedSequence?.name || "",
      titulo: `${selectedTheme?.name || ""} - ${selectedSubtheme?.name || ""}`,
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
      momentos,
      recursos_adicionales: metacognicion,
      metacognicion,
      metacognicion_tiempo: metacognicionTiempo,
      evaluacion,
      evaluacion_tiempo: evaluacionTiempo,
      tarea_hogar: tareaHogar,
      actividad_complementaria: actividadComplementaria,
      saberes_previos: useSaberesPrevios ? saberesPrevios : "",
      retroalimentacion: useRetroalimentacion ? retroalimentacion : "",
      conceptual,
      procedural,
      attitudinal,
      estrategia,
      indicador_logro: indicadoresLogro.join('\n'),
      ejes_transversales: ejesTransversales.join('\n'),
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
        asignatura: "Ciencias de la Naturaleza",
        unidad: selectedSequence?.name || "",
        tema: selectedTheme?.name || "",
        subtema: selectedSubtheme?.name || "",
        docente,
        centro_educativo: centroEducativo,
        intencion_pedagogica: intencionPedagogica,
        indicadores_disponibles: indicatorsOptions
      });

      if (plan) {
        setIntencionPedagogica(plan.intencion_pedagogica || "");
        if (!estrategia.trim()) setEstrategia(plan.estrategia || "");

        // Map indicators
        if (plan.indicador_logro) {
          const parsedLogros = plan.indicador_logro
            .split('\n')
            .map((x: string) => x.replace(/^[\s•\-\*]*\d*[\.\-\)]?\s*/, '').trim())
            .filter((x: string) => x.length > 0);
          setIndicadoresLogro(parsedLogros);
        }
        
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
        
        if (!metacognicion.trim()) setMetacognicion(plan.metacognicion || "");
        if (!evaluacion.trim()) setEvaluacion(plan.evaluacion || "");
        if (!tareaHogar.trim()) setTareaHogar(plan.tarea_casa || "");
        
        toast.success("¡Planificación de Ciencias de la Naturaleza generada!");
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
        asignatura: "Ciencias de la Naturaleza",
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
        asignatura: "Ciencias de la Naturaleza",
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
        area: "Ciencias de la Naturaleza",
        asignatura: "Ciencias de la Naturaleza",
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
      
      const natPlans = plannings
        .filter(p => {
          const normAsig = (p.asignatura || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
          const normTit = (p.titulo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
          const isNaturales = normAsig.includes("naturales") || normAsig.includes("naturaleza") || normAsig.includes("ciencia") || normTit.includes("naturales") || normTit.includes("naturaleza");
          
          const normPlanGrado = (p.grado || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
          const normActiveGrado = selectedGrade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
          const isSameGrade = (normActiveGrado.includes("6") || normActiveGrado.includes("sexto")) 
            ? (normPlanGrado.includes("6") || normPlanGrado.includes("sexto")) 
            : (normActiveGrado.includes("1") || normActiveGrado.includes("primer"))
            ? (normPlanGrado.includes("1") || normPlanGrado.includes("primer")) 
            : (normActiveGrado.includes("2") || normActiveGrado.includes("segund"))
            ? (normPlanGrado.includes("2") || normPlanGrado.includes("segund"))
            : (normActiveGrado.includes("3") || normActiveGrado.includes("tercer"))
            ? (normPlanGrado.includes("3") || normPlanGrado.includes("tercer"))
            : false;
            
          const currentTitle = `${selectedTheme?.name || "Clase"} - ${selectedSubtheme?.name || ""}`;
          const isCurrentPlan = p.titulo === currentTitle && p.customFields?.fecha === fecha;
            
          return isNaturales && isSameGrade && !isCurrentPlan;
        })
        .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());

      if (natPlans.length === 0) {
        toast.error("No se encontró ninguna planificación anterior de Ciencias de la Naturaleza para esta cuenta.", { id: "ai-retro" });
        return;
      }

      const latestPlan = natPlans[0];
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
        area: "Ciencias de la Naturaleza",
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

  const handleSaveForm = () => {
    if (!seccion.trim()) {
      toast.error("La sección es obligatoria.");
      return;
    }

    const payload = {
      centro_educativo: centroEducativo,
      docente: docente,
      planningType: "DIARIA",
      grado: "6to. (Primaria)",
      seccion: seccion,
      area: "Ciencias de la Naturaleza",
      fecha: fecha,
      titulo: `${selectedTheme?.name || "Clase"} - ${selectedSubtheme?.name || ""}`,
      secuencia: selectedSequence?.name || "",
      intencion_pedagogica: intencionPedagogica,
      competencias: competenciasFundamentales,
      competencias_especificas: Object.keys(compDescs)
        .filter((k) => isChecked(k as CompetenciaKey))
        .map((k) => compDescs[k as CompetenciaKey]),
      hideSpecificCompetencies: hideSpecificCompetencies,
      momentos: momentos,
      evaluacion: evaluacion,
      evaluacion_tiempo: evaluacionTiempo,
      metacognicion: metacognicion,
      metacognicion_tiempo: metacognicionTiempo,
      tarea_hogar: tareaHogar,
      actividad_complementaria: actividadComplementaria,
      saberes_previos: useSaberesPrevios ? saberesPrevios : "",
      retroalimentacion: useRetroalimentacion ? retroalimentacion : "",
      conceptual: conceptual,
      procedural: procedural,
      attitudinal: attitudinal,
      estrategia: estrategia,
      indicador_logro: indicadoresLogro.join('\n'),
      ejes_transversales: ejesTransversales.join('\n'),
    };

    clearDraft();
    onSave(payload);
  };

  const indicatorsOptions = FALLBACK_INDICATORS;

  const handleToggleIndicator = (ind: string) => {
    if (indicadoresLogro.includes(ind)) {
      setIndicadoresLogro(indicadoresLogro.filter((x) => x !== ind));
    } else {
      setIndicadoresLogro([...indicadoresLogro, ind]);
    }
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
              Ciencias de la Naturaleza
            </h1>
            <p className="mt-2 text-sm font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
              Planificación diaria
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
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Área">
              <input className={inputCls} value="Ciencias de la Naturaleza" readOnly />
            </Field>
            <Field label="Unidad">
              <input className={`${inputCls} truncate`} value={unidad} readOnly />
            </Field>
            <Field label="Fecha" required>
              <DatePicker value={fecha} onChange={setFecha} />
            </Field>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 items-end">
            <Field label="Tema">
              <input className={`${inputCls} truncate`} value={tema} readOnly />
            </Field>
            <Field label="Subtema">
              <input className={`${inputCls} truncate`} value={subtema} readOnly />
            </Field>
            <div>
              <button
                type="button"
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="w-full h-10 px-5 bg-[#5D5FEF] hover:bg-[#4B4DDF] text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-md hover:shadow-lg disabled:bg-zinc-400 disabled:opacity-50 select-none whitespace-nowrap"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Zap className="w-4 h-4 text-white" />
                )}
                <span>Generar Contenido</span>
              </button>
            </div>
          </div>
        </Section>

        {/* 02. Componentes Curriculares */}
        <Section
          number="02"
          title="Componentes Curriculares"
          description="Intención pedagógica, estrategias e indicadores de la sesión."
        >
          
          <div className="rounded-2xl border border-brand-primary/20 dark:border-zinc-800 bg-brand-light/30 dark:bg-zinc-900/40 p-5">
            <div className="mb-2">
              <label className="text-xs font-bold uppercase tracking-wide text-neutral-800 dark:text-zinc-200 font-sans">Intención pedagógica</label>
            </div>
            <textarea
              rows={3}
              className={textareaCls}
              placeholder="Que los estudiantes registren los aprendizajes esperados de la secuencia…"
              value={intencionPedagogica}
              onChange={(e) => setIntencionPedagogica(e.target.value)}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            <Field label="Estrategias de enseñanza – aprendizaje">
              <textarea
                rows={3}
                className={textareaCls}
                placeholder="Descripción de las estrategias y técnicas a utilizar en la clase..."
                value={estrategia}
                onChange={(e) => setEstrategia(e.target.value)}
              />
            </Field>
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
                      {indicatorsOptions.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic p-2 text-center">No hay indicadores predefinidos para esta unidad.</p>
                      ) : (
                        indicatorsOptions.map((ind, idx) => {
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
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
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
            </Field>
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

          {/* Saberes previos conditional card */}
          {useSaberesPrevios && (
            <div className="mt-4 rounded-2xl border border-blue-200 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-950/10 p-5 transition-all">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-800 dark:text-zinc-200 font-sans">Saberes previos</label>
                <button
                  type="button"
                  onClick={handleGenerateSaberesPrevios}
                  disabled={isGeneratingSaberesPrevios}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 px-4 py-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer disabled:opacity-50 whitespace-nowrap"
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
                {saberesEditor && (
                  <EditorContent
                    editor={saberesEditor}
                    className="w-full prose prose-sm prose-blue dark:prose-invert max-w-none focus:outline-hidden bg-transparent"
                  />
                )}
              </div>
            </div>
          )}

          {/* Retroalimentación conditional card */}
          {useRetroalimentacion && (
            <div className="mt-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 p-5 transition-all">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-800 dark:text-zinc-200 font-sans">Retroalimentación</label>
                <button
                  type="button"
                  onClick={handleGenerateRetroalimentacion}
                  disabled={isGeneratingRetroalimentacion}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 px-4 py-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer disabled:opacity-50 whitespace-nowrap"
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
                    className="w-full prose prose-sm prose-blue dark:prose-invert max-w-none focus:outline-hidden bg-transparent"
                  />
                )}
              </div>
            </div>
          )}
        </Section>

        {/* 03. Ejes Transversales */}
        <Section
          number="03"
          title="Ejes Transversales"
          description="Selecciona los ejes transversales vinculados a la clase de hoy."
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
        </Section>

        {/* 04. Competencias Fundamentales */}
        <Section
          number="04"
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
                
                {/* Ocultar/Mostrar Competencias Específicas */}
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

        {/* 04. Secuencia didáctica */}
        <div className="mb-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-16px_rgba(16,24,40,0.08)] sm:p-8">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-white flex items-center gap-2 font-sans">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Secuencia Didáctica (Momentos)
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveGamifyMomentId(null);
                  setShowGamifyModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer whitespace-nowrap"
              >
                <Gamepad2 className="h-4 w-4" />
                Gamificar Clase
              </button>
              <button
                type="button"
                onClick={handleAddMomento}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Agregar Momento
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {momentos.map((m, i) => (
              <div
                key={m.id}
                className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(16,24,40,0.12)]"
              >
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 flex-wrap gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">
                      MOMENTO {i + 1}
                    </span>
                    <div className="flex items-center gap-1.5 p-1 bg-neutral-50 dark:bg-zinc-950 rounded-lg border border-neutral-100 dark:border-zinc-850">
                      {i === 0 && (
                        <Pill icon={<CalendarDays className="h-3 w-3" />} tone="amber">
                          Efeméride
                        </Pill>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveBloomMomentId(m.id);
                          setShowBloomModal(true);
                        }}
                        className="inline-flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                      >
                        <Pill icon={<BrainCircuit className="h-3 w-3" />} tone="primary">
                          Bloom
                        </Pill>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveInclusionMomentId(m.id);
                          setShowInclusionModal(true);
                        }}
                        className="inline-flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                      >
                        <Pill icon={<Accessibility className="h-3 w-3" />} tone="indigo">
                          PEDI
                        </Pill>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveGamifyMomentId(m.id);
                          setShowGamifyModal(true);
                        }}
                        className="inline-flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                      >
                        <Pill icon={<Gamepad2 className="h-3 w-3" />} tone="amber">
                          Gamificar
                        </Pill>
                      </button>
                      <button
                      type="button"
                      onClick={() => {
                        const shown = !!showDiferenciadas[m.id];
                        setShowDiferenciadas(prev => ({ ...prev, [m.id]: !shown }));
                      }}
                      className="inline-flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                    >
                      <Pill icon={<Sparkles className="h-3 w-3 text-brand-primary dark:text-blue-400" />} tone="primary">
                        Actividad diferenciada
                      </Pill>
                    </button>
                      
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMomento(m.id)}
                    className="text-red-400 hover:text-red-650 text-[10px] font-bold uppercase tracking-tight transition-colors border-none bg-transparent cursor-pointer inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    ELIMINAR
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 font-sans">
                      Título del Momento
                    </label>
                    <input
                      className={inputCls}
                      placeholder={`Ej: Momento ${i + 1}. Título de la actividad`}
                      value={m.moment}
                      onChange={(e) => updateMomento(m.id, "moment", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] gap-4">
                    {/* Column 1: Estrategias y Actividades */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 font-sans">
                          Estrategias y Actividades
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateMomento(m.id, "hideDescription", !m.hideDescription)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary dark:text-blue-400 hover:underline border-none bg-transparent cursor-pointer"
                          >
                            {m.hideDescription ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            {m.hideDescription ? "Mostrar" : "Ocultar"}
                          </button>
                          {!m.hideDescription && (
                            <button
                              type="button"
                              onClick={() => setExpandedField({ momentId: m.id, fieldKey: "descripcion" })}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary dark:text-blue-400 hover:underline border-none bg-transparent cursor-pointer"
                            >
                              <Maximize2 className="h-3 w-3" />
                              Ampliar Campo
                            </button>
                          )}
                        </div>
                      </div>
                      {m.hideDescription ? (
                        <div className="flex h-10 items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-xs text-gray-400">
                          Detalles ocultos en impresión
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={inputCls}
                          placeholder={i === 0 ? "Inicio…" : i === 1 ? "Desarrollo…" : "Cierre…"}
                          value={m.descripcion}
                          onChange={(e) => updateMomento(m.id, "descripcion", e.target.value)}
                        />
                      )}
                    </div>

                    {/* Column 2: Tiempo (minutos) */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 font-sans">
                        Tiempo (minutos)
                      </label>
                      <input
                        className={inputCls}
                        placeholder="Ej: 15"
                        value={m.tiempo}
                        onChange={(e) => updateMomento(m.id, "tiempo", e.target.value)}
                      />
                    </div>

                    {/* Column 3: Recursos */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 font-sans">
                          Recursos
                        </span>
                        <button
                          type="button"
                          onClick={() => setExpandedField({ momentId: m.id, fieldKey: "recursos" })}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary dark:text-blue-400 hover:underline border-none bg-transparent cursor-pointer"
                        >
                          <Maximize2 className="h-3 w-3" />
                          Ampliar Campo
                        </button>
                      </div>
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="Ej: Papelógrafo, marcadores"
                        value={m.recursos}
                        onChange={(e) => updateMomento(m.id, "recursos", e.target.value)}
                      />
                    </div>
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

        {/* 06. Cierre y evaluación */}
        <Section
          number="06"
          title="Cierre, Retroalimentación y Metacognicion"
          description="Reflexión final y criterios de evaluación del aprendizaje."
          action={
            <button
              type="button"
              onClick={handleGenerateEvaluationAndMeta}
              disabled={isGeneratingEvaluation}
              className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 px-4 py-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {isGeneratingEvaluation ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              ) : (
                <Sparkles className="h-4 w-4 text-purple-500" />
              )}
              Generar con IA
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col">
              <Field
                label="Metacognición"
                action={
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-tight">Tiempo:</span>
                    <input
                      type="number"
                      className="w-14 h-7 text-center rounded-lg border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 text-xs font-bold text-[#1B1B1B] dark:text-neutral-100 outline-none focus:ring-1 focus:ring-brand-primary"
                      placeholder="15"
                      value={metacognicionTiempo}
                      onChange={(e) => setMetacognicionTiempo(e.target.value)}
                    />
                    <span className="text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-tight">min</span>
                  </div>
                }
              >
                <AutoGrowingTextarea
                  rows={2}
                  className={textareaCls}
                  placeholder="¿Qué aprendimos hoy? ¿Cómo lo aprendimos? ¿Qué fue fácil o difícil?"
                  value={metacognicion}
                  onChange={(e) => setMetacognicion(e.target.value)}
                />
              </Field>
            </div>
            <div className="flex flex-col">
              <Field
                label="Evaluación"
                action={
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-tight">Tiempo:</span>
                    <input
                      type="number"
                      className="w-14 h-7 text-center rounded-lg border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 text-xs font-bold text-[#1B1B1B] dark:text-neutral-100 outline-none focus:ring-1 focus:ring-brand-primary"
                      placeholder="15"
                      value={evaluacionTiempo}
                      onChange={(e) => setEvaluacionTiempo(e.target.value)}
                    />
                    <span className="text-[11px] font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-tight">min</span>
                  </div>
                }
              >
                <AutoGrowingTextarea
                  rows={2}
                  className={textareaCls}
                  placeholder="Criterios e indicadores de evaluación, instrumentos, evidencias…"
                  value={evaluacion}
                  onChange={(e) => setEvaluacion(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* 07. Tarea para el Hogar */}
        <Section
          number="07"
          title="Tarea para el Hogar"
          description="Actividades para realizar fuera del aula escolar."
        >
          <div className="space-y-2 text-left">
            <AutoGrowingTextarea
              rows={2}
              className={textareaCls}
              placeholder="Describe la tarea que los estudiantes deben realizar en casa…"
              value={tareaHogar}
              onChange={(e) => setTareaHogar(e.target.value)}
            />
            <p className="text-xs text-neutral-500 dark:text-zinc-400 font-semibold text-left">
              Esta tarea se extrae automáticamente de la guía didáctica. Puedes personalizarla.
            </p>
          </div>
        </Section>

        {/* 08. Actividades Complementarias */}
        <Section
          number="08"
          title="Actividades Complementarias"
          description="Actividades adicionales o diferenciadas para enriquecer o profundizar el aprendizaje."
          action={
            <button
              type="button"
              onClick={handleGenerateComplementary}
              disabled={isGeneratingComplementary}
              className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 px-4 py-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {isGeneratingComplementary ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              ) : (
                <Sparkles className="h-4 w-4 text-purple-500" />
              )}
              Generar con IA
            </button>
          }
        >
          <div className="space-y-2">
            {/* Unified Editor Border Container */}
            <div className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/50 focus-within:border-[#1B1B1B] dark:focus-within:border-neutral-205 focus-within:ring-1 focus-within:ring-[#1B1B1B]/10 transition-all">
              {/* Rich Text Toolbar */}
              <div className="flex items-center gap-1 p-2 bg-neutral-50/50 dark:bg-zinc-900/20 border-b border-gray-200 dark:border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => complementaryEditor?.chain().focus().toggleBold().run()}
                  className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-200/50 dark:hover:bg-zinc-800 border-none ${
                    complementaryEditor?.isActive("bold")
                      ? "bg-brand-light text-brand-primary dark:bg-brand-light/20 dark:text-blue-400"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <BoldIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => complementaryEditor?.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-200/50 dark:hover:bg-zinc-800 border-none ${
                    complementaryEditor?.isActive("italic")
                      ? "bg-brand-light text-brand-primary dark:bg-brand-light/20 dark:text-blue-400"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <ItalicIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800 mx-1" />
                <button
                  type="button"
                  onClick={() => complementaryEditor?.chain().focus().toggleBulletList().run()}
                  className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-200/50 dark:hover:bg-zinc-800 border-none ${
                    complementaryEditor?.isActive("bulletList")
                      ? "bg-brand-light text-brand-primary dark:bg-brand-light/20 dark:text-blue-400"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => complementaryEditor?.chain().focus().toggleOrderedList().run()}
                  className={`p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-200/50 dark:hover:bg-zinc-800 border-none ${
                    complementaryEditor?.isActive("orderedList")
                      ? "bg-brand-light text-brand-primary dark:bg-brand-light/20 dark:text-blue-400"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <ListOrderedIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Editor Content Area */}
              <div className="w-full">
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                    .ProseMirror { 
                      min-height: 120px; 
                      outline: none; 
                      font-size: 13px;
                      line-height: 1.6;
                      padding: 1rem;
                      transition: min-height 0.2s ease-in-out;
                    }
                    .ProseMirror-focused {
                      min-height: 320px;
                    }
                    .ProseMirror p { margin-bottom: 0.75rem; }
                    .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                    .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
                    .ProseMirror strong { font-weight: 700; }
                    .ProseMirror h3 { font-size: 15px; font-weight: 800; margin-top: 1rem; margin-bottom: 0.5rem; color: #1e88e5; }
                    .ProseMirror h4 { font-size: 13px; font-weight: 700; margin-top: 0.75rem; margin-bottom: 0.4rem; }
                  `,
                  }}
                />
                {complementaryEditor && (
                  <EditorContent
                    editor={complementaryEditor}
                    className="w-full prose prose-sm prose-blue dark:prose-invert max-w-none focus:outline-none bg-transparent"
                  />
                )}
              </div>
            </div>
            
            <p className="text-xs text-neutral-500 dark:text-zinc-400 italic flex items-center gap-1 justify-center font-semibold">
              <Pencil className="w-3 h-3" /> Escribe directamente en el campo. Se expandirá automáticamente al hacer clic.
            </p>
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

const renderIndicatorsList = (list: string[]) => {
  if (list.length === 0) return "Seleccione indicadores...";
  return list.map((ind, i) => (
    <React.Fragment key={i}>
      {renderMarkdownInline(ind)}
      {i < list.length - 1 && ", "}
    </React.Fragment>
  ));
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
