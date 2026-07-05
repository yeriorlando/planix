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
} from "../../../../../lib/services/aiService";
import { fetchPlannings } from "../../../../../lib/services/plannings";

// Import standalone premium AI modals
import BloomLevelerModal from "../../../../ai/BloomLevelerModal";
import InclusionModal from "../../../../ai/InclusionModal";
import GamifyModal from "../../../../ai/GamifyModal";
import CurricularCoherenceReport from "../../../../ai/CurricularCoherenceReport";


// Import sequences
import seqLengua1_3ro from "./Secuencias/seq-1-autobiografia-3ro.json";
import seqLengua2_3ro from "./Secuencias/seq-2-instructivo-3ro.json";
import seqLengua3_3ro from "./Secuencias/seq-3-noticia-3ro.json";
import seqLengua4_3ro from "./Secuencias/seq-4-cuento-3ro.json";
import seqLengua5_3ro from "./Secuencias/seq-5-articulo-expositivo-3ro.json";
import seqLengua6_3ro from "./Secuencias/seq-6-adivinanza-3ro.json";

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

const LENGUA_3RO_DESCRIPTIONS = [
  "Secuencia didáctica centrada en la comprensión y producción de la autobiografía personal.",
  "Exploración de instructivos, su estructura textual y seguimiento de instrucciones en actividades.",
  "Lectura y producción de noticias sencillas del entorno comunitario y escolar.",
  "Fomento de la lectura comprensiva mediante el análisis y recreación de cuentos.",
  "Lectura e indagación sobre temas de interés mediante artículos expositivos sencillos.",
  "Desarrollo de la creatividad y razonamiento lingüístico a través de las adivinanzas."
];

const LENGUA_3RO_SEQUENCES = [
  seqLengua1_3ro,
  seqLengua2_3ro,
  seqLengua3_3ro,
  seqLengua4_3ro,
  seqLengua5_3ro,
  seqLengua6_3ro
].map((seq: any, idx: number) => {
  const seqId = `seq-${idx+1}-lengua-3ro`;
  return {
    ...seq,
    id: seqId,
    title: seq.sequenceTitle || `Secuencia ${idx+1}`,
    description: LENGUA_3RO_DESCRIPTIONS[idx],
    order: seq.order !== undefined ? seq.order : idx + 1,
    durationWeeks: seq.durationWeeks !== undefined ? seq.durationWeeks : 4,
    blocks: (seq.blocks || []).map((blk: any, bIdx: number) => ({
      ...blk,
      id: blk.id || `blk-${seqId}-${bIdx+1}`,
      title: blk.title || blk.blockTitle || `Bloque ${bIdx+1}`,
      activities: (blk.activities || []).map((act: any, aIdx: number) => ({
        ...act,
        id: act.id || `act-${seqId}-${bIdx+1}-${aIdx+1}`,
        title: act.title || act.activityTitle || `Actividad ${aIdx+1}`
      }))
    }))
  };
}) as any[];

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
      "Expresa y comprende, de forma oral y escrita en contextos variados, textos funcionales y literarios, con extensión, estructura sintáctica, lexical y semántica más compleja que en grados anteriores, apoyándose en herramientas y recursos variados, demostrando dominio de la lectura y la escritura de forma autónoma.",
  },
  {
    key: "logico",
    label: "Pensamiento Lógico, Creativo y Crítico; Resolución de Problemas; Tecnológica y Científica",
    defaultDesc:
      "Expone con creatividad y de manera crítica las conclusiones sobre la solución de problemas, obtenidas en investigaciones científicas, a través de un género textual conveniente y con uso de recursos variados, respetando la diversidad de opiniones.",
  },
  {
    key: "etica",
    label: "Ética y Ciudadana; Desarrollo Personal y Espiritual; Ambiental y de la Salud",
    defaultDesc:
      "Describe problemas sociales de manera colectiva (antidemocráticos, discriminación, entre otros), a través de textos orales y escritos, a fin de solucionarlos y canalizar emociones, sentimientos, relaciones humanas, así como la preservación de la salud, el ecosistema, mediante el uso de medios y recursos diversos.",
  },
];

export interface LenguaEspañolaProps {
  user: any;
  selectedSequence: any;
  selectedSequenceType: "CON_BASE" | "CURRICULAR";
  selectedLevel: "INICIAL" | "PRIMARIA" | "SECUNDARIA" | null;
  selectedGrade: string;
  selectedSubject: any;
  selectedPlanningType: string;
  lengSequenceIdx: number;
  lengBlockIdx: number;
  lengActivityIdx: number;
  onBack: () => void;
  onCancel?: () => void;
  onSave: (customData: any) => void;
}

const DRAFT_KEY = "plx:lengua3ro_draft";

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

export default function LenguaEspañola({
  user,
  selectedSequenceType,
  lengSequenceIdx: initialSeqIdx,
  lengBlockIdx: initialBlkIdx,
  lengActivityIdx: initialActIdx,
  onBack,
  onCancel,
  onSave,
}: LenguaEspañolaProps) {
  // Draft restoration flag — prevents activity-sync useEffect from overwriting restored data
  const restoringDraftRef = React.useRef(false);
  const draft = React.useMemo(() => loadDraft(initialSeqIdx), [initialSeqIdx]);

  // Local active index states to allow changing sequence / block / activity right on the form
  const [seqIdx, setSeqIdx] = useState<number>(draft?.seqIdx ?? (initialSeqIdx >= 0 ? initialSeqIdx : 0));
  const [blkIdx, setBlkIdx] = useState<number>(draft?.blkIdx ?? (initialBlkIdx >= 0 ? initialBlkIdx : 0));
  const [actIdx, setActIdx] = useState<number>(draft?.actIdx ?? (initialActIdx >= 0 ? initialActIdx : -1));

  // Dropdown states matching /aula-virtual/matricula/ style
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);

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
    const original = LENGUA_3RO_SEQUENCES[idx] || LENGUA_3RO_SEQUENCES[0];
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
  const [tareaHogar, setTareaHogar] = useState(draft?.tareaHogar ?? ((activeActivityData as any)?.homework || ""));
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
          seqIdx, blkIdx, actIdx,
          centroEducativo, seccion, fecha,
          intencionPedagogica, competenciasFundamentales, hideSpecificCompetencies,
          compDescs, momentos,
          metacognicion, metacognicionTiempo,
          evaluacion, evaluacionTiempo,
          tareaHogar, actividadComplementaria,
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
    intencionPedagogica, competenciasFundamentales, hideSpecificCompetencies,
    compDescs, momentos,
    metacognicion, metacognicionTiempo,
    evaluacion, evaluacionTiempo,
    tareaHogar, actividadComplementaria,
    saberesPrevios, useSaberesPrevios,
    retroalimentacion, useRetroalimentacion,
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

  // Sync with selected sequence/block/activity change
  useEffect(() => {
    // Skip on first render if we just restored a draft
    if (restoringDraftRef.current) {
      restoringDraftRef.current = false;
      return;
    }

    if (actIdx >= 0 && activeActivityData) {
      setIntencionPedagogica((activeActivityData as any).pedagogicalIntention || "");
      setTareaHogar((activeActivityData as any).homework || "");
      setCompetenciasFundamentales([]);

      // Map JSON moments to our local moments schema
      const mapped = ((activeActivityData as any).moments || []).map((m: any, index: number) => {
        const titleStr = m.titulo || m.title || `Momento ${index + 1}`;
        return {
          id: `mom-${Date.now()}-${index}`,
          moment: titleStr,
          titulo: titleStr,
          descripcion: m.description || m.descripcion || "",
          tiempo: index === 0 ? "15" : index === 1 ? "45" : "15",
          recursos: (activeActivityData as any).resources || "Papelógrafo, Letras móviles",
          hideDescription: false,
        };
      });
      setMomentos(mapped);
      toast.success("Contenido oficial cargado al instante.", { id: "loaded-content" });
    } else if (actIdx < 0) {
      // Clear fields when no activity selected
      setIntencionPedagogica("");
      setTareaHogar("");
      setCompetenciasFundamentales([]);
      setMomentos([]);
      setMetacognicion("");
      setEvaluacion("");
      setSaberesPrevios("");
      setRetroalimentacion("");
    }
  }, [seqIdx, blkIdx, actIdx]);

  // Restore scroll position to avoid jumpy layouts when selecting block / activity
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
      grado: "3ro. (Primaria)",
      seccion,
      fecha,
      area: "Lengua Española",
      asignatura: "Lengua Española",
      secuencia: activeSequenceData?.title || "Autobiografía",
      titulo: activeSequenceData?.title || "Autobiografía",
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
        grado: "3ro. (Primaria)",
        asignatura: "Lengua Española",
        secuencia: activeSequenceData?.title || "Autobiografía",
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
        grado: "3ro. (Primaria)",
        asignatura: "Lengua Española",
        secuencia: activeSequenceData?.title || "Autobiografía",
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
      toast.success("Actividades complementarias creadas para \"Con Base\"", { id: "ai-comp" });
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
        grado: "3ro. (Primaria)",
        secuencia: activeSequenceData?.title || "Autobiografía",
        area: "Lengua Española",
        asignatura: "Lengua Española",
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
      // Fetch user plannings
      const plannings = await fetchPlannings(user.id);
      
      // Filter by Lengua Española and Tercer Grado, sorting by creado_en descending
      const languagePlans = plannings
        .filter(p => {
          const normAsig = (p.asignatura || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
          const normTit = (p.titulo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
          const isLanguage = normAsig.includes("lengua") || normAsig.includes("espanola") || normTit.includes("lengua") || normTit.includes("espanola");
          
          const normPlanGrado = (p.grado || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
          const isSameGrade = normPlanGrado.includes("3") || normPlanGrado.includes("tercer") || normPlanGrado.includes("terc");
          
          const currentTitle = (activeActivityData as any)?.title || (activeActivityData as any)?.activityTitle || "Actividad #1";
          const isCurrentPlan = (p.titulo === currentTitle && p.customFields?.fecha === fecha) || 
                               (p.customFields?.actividad_id === ((activeActivityData as any)?.id || "act-1") && p.customFields?.fecha === fecha);
                               
          return isLanguage && isSameGrade && !isCurrentPlan;
        })
        .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());

      if (languagePlans.length === 0) {
        toast.error("No se encontró ninguna planificación anterior de Lengua Española de 3er de Primaria para esta cuenta.", { id: "ai-retro" });
        return;
      }

      const latestPlan = languagePlans[0];
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

  // Heavy-lifting AI modal generation and application logic has been delegated to standalone modals.

  // Coherence Audit Handler
  const handleRunAudit = async () => {
    setIsAuditing(true);
    toast.loading("Auditando coherencia curricular con IA...", { id: "ai-audit" });
    try {
      const planData = {
        centro_educativo: centroEducativo,
        docente: docente,
        grado: "3ro. (Primaria)",
        seccion: seccion,
        area: "Lengua Española",
        secuencia: activeSequenceData?.title || "Autobiografía",
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
    // Validate required fields
    if (!seccion.trim()) {
      toast.error("La sección es obligatoria.");
      return;
    }

    const payload = {
      centro_educativo: centroEducativo,
      docente: docente,
      grado: "3ro. (Primaria)",
      seccion: seccion,
      area: "Lengua Española",
      fecha: fecha,
      secuencia: activeSequenceData?.title || "Secuencia 1",
      bloque: (activeBlockData as any)?.title || (activeBlockData as any)?.blockTitle || "Bloque 1",
      actividad_id: (activeActivityData as any)?.id || "act-1",
      actividad_titulo: (activeActivityData as any)?.title || (activeActivityData as any)?.activityTitle || "Actividad #1",
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
        <Award className="absolute bottom-32 right-[14%] text-neutral-900 dark:text-white" size={75} style={{ transform: "rotate(-20deg)" }} />
        <Calculator className="absolute bottom-10 right-8 text-neutral-900 dark:text-white" size={70} style={{ transform: "rotate(12deg)" }} />
        <Music className="absolute bottom-[5%] right-[26%] text-neutral-900 dark:text-white" size={55} style={{ transform: "rotate(-8deg)" }} />
      </div>

      <div className="mx-auto max-w-5xl px-2 pb-8 pt-14 md:pt-20 text-left relative z-10">
        {/* Hero Header */}
        <div className="mb-8 relative border-b border-slate-100 dark:border-zinc-800 pb-5 text-center">
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="font-display text-5xl tracking-tight text-[#1B1B1B] dark:text-white font-black">
              Lengua Española
            </h1>
            <p className="mt-2 text-sm font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
              Planificación diaria
            </p>
          </div>
          <button
            type="button"
            className="sm:absolute sm:top-1 sm:right-0 mt-4 sm:mt-0 inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-4 py-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-px cursor-pointer shrink-0"
            onClick={() => window.open("https://drive.google.com/file/d/1UfHv6w-hcGy_fCwPHkHL_3XyjWlvXI2X/view", "_blank")}
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
              <input className={inputCls} value="3ro. (Primaria)" readOnly />
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
              <input className={inputCls} value="Lengua Española" readOnly />
            </Field>
            <Field label="Secuencia">
              <input className={`${inputCls} truncate`} value={activeSequenceData?.title || ""} readOnly />
            </Field>
            <Field label="Fecha" required>
              <DatePicker value={fecha} onChange={setFecha} />
            </Field>
          </div>
        </Section>

        {/* 02. Bloque y actividad */}
        <Section
          number="02"
          title="Bloque y Actividad de la Guía Didáctica"
          description="Vincula la clase con un bloque y actividad de la guía didáctica."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Selecciona el Bloque" required>
              <div className="relative select-none">
                <div
                  onClick={() => setShowBlockDropdown(!showBlockDropdown)}
                  className="w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                >
                  <span className="truncate pr-2">
                    {(activeSequenceData?.blocks || [])[blkIdx]?.title || "Seleccionar Bloque"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${showBlockDropdown ? 'rotate-180' : ''}`} />
                </div>
                {showBlockDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowBlockDropdown(false)} />
                    <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-75">
                      <div className="space-y-0.5 max-h-60 overflow-y-auto">
                        {(activeSequenceData?.blocks || []).map((blk: any, i: number) => {
                          const isSelected = i === blkIdx;
                          return (
                            <button
                              key={blk.id}
                              type="button"
                              onClick={() => {
                                lastScrollYRef.current = window.scrollY;
                                setBlkIdx(i);
                                setActIdx(-1);
                                setShowBlockDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors ${
                                isSelected
                                  ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white"
                                  : "text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                              }`}
                            >
                              <span className="truncate pr-2">{blk.title}</span>
                              {isSelected && <Check className="w-4 h-4 shrink-0 text-[#1B1B1B] dark:text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Field>
            <Field label="Selecciona la Actividad" required>
              <div className="relative select-none">
                <div
                  onClick={() => setShowActivityDropdown(!showActivityDropdown)}
                  className="w-full h-11 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                >
                  <span className="truncate pr-2">
                    {actIdx >= 0
                      ? (activeBlockData?.activities || [])[actIdx]?.title
                      : "Elige una actividad de la guía"}
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
                          <span className="truncate pr-2">Elige una actividad de la guía</span>
                          {actIdx === -1 && <Check className="w-4 h-4 shrink-0 text-[#1B1B1B] dark:text-white" />}
                        </button>
                        {(activeBlockData?.activities || []).map((act: any, i: number) => {
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
            </Field>
          </div>

          <div className="mt-5 rounded-2xl border border-brand-primary/20 dark:border-zinc-800 bg-brand-light/30 dark:bg-zinc-900/40 p-5">
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

        {/* 03. Competencias Fundamentales */}
        <Section
          number="03"
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

        {/* 05. Cierre y evaluación */}
        <Section
          number="05"
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

        {/* 06. Tarea para el Hogar */}
        <Section
          number="06"
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

        {/* 07. Actividades Complementarias */}
        <Section
          number="07"
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
