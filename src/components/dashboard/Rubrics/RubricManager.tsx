import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Scale, Plus, Calculator, Trash2, CheckCircle, Target, Award, 
  Printer, SlidersHorizontal, Layout, Info, X, BarChart3, CheckSquare, 
  AlertTriangle, ChevronRight, Save, Sparkles, Check, BookOpen, Pencil,
  ArrowLeft
} from "lucide-react";
import { 
  getRubrics, 
  saveRubric, 
  deleteRubric, 
  getStudentEvaluations, 
  saveStudentEvaluation, 
  uid,
  Classroom,
  Student,
  Rubric,
  StudentEvaluation
} from "../../../lib/storage";
import { toast } from "sonner";
import PrintableView from "./PrintableView";
import { generateRubric } from "../../../lib/services/aiService";
import { consumeCredits, getCreditInfo } from "../../../lib/credits";
import ModalCreditos from "../../ai/ModalCreditos";
const getLevelStyles = (name: string) => {
  const upper = name.toUpperCase();
  if (upper.includes("ELEMENTAL") || upper.includes("RECEPTIVO") || upper.includes("PROCESO")) {
    return {
      bg: "bg-rose-50/75 dark:bg-rose-950/15",
      border: "border-rose-200/60 dark:border-rose-900/30",
      text: "text-rose-800 dark:text-rose-300 font-bold",
      badgeBg: "bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
    };
  }
  if (upper.includes("ACEPTABLE") || upper.includes("RESOLUTIVO")) {
    return {
      bg: "bg-amber-50/75 dark:bg-amber-950/15",
      border: "border-amber-200/60 dark:border-amber-900/30",
      text: "text-amber-800 dark:text-amber-300 font-bold",
      badgeBg: "bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
    };
  }
  if (upper.includes("AUTÓNOMO")) {
    return {
      bg: "bg-blue-50/75 dark:bg-blue-950/15",
      border: "border-blue-200/60 dark:border-blue-900/30",
      text: "text-blue-800 dark:text-blue-300 font-bold",
      badgeBg: "bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
    };
  }
  if (upper.includes("ESTRATÉGICO") || upper.includes("SATISFACTORIO") || upper.includes("EXCELENTE") || upper.includes("LOGRADO")) {
    return {
      bg: "bg-emerald-50/75 dark:bg-emerald-950/15",
      border: "border-emerald-200/60 dark:border-emerald-900/30",
      text: "text-emerald-800 dark:text-emerald-300 font-bold",
      badgeBg: "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
    };
  }
  return {
    bg: "bg-slate-50/50 dark:bg-slate-900/30",
    border: "border-slate-200/50 dark:border-slate-800",
    text: "text-slate-700 dark:text-slate-300 font-bold",
    badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
  };
};

interface RubricManagerProps {
  user: any;
  activeClassroom: Classroom;
  students: Student[];
}

export default function RubricManager({ user, activeClassroom, students }: RubricManagerProps) {
  // Navigation tab state ("lista", "crear", "aplicar")
  const [activeTab, setActiveTab] = useState<"lista" | "crear" | "aplicar">("lista");

  // Rubrics storage state
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [activeRubricId, setActiveRubricId] = useState<string | null>(null);

  // Modals state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteCriteriaIndex, setDeleteCriteriaIndex] = useState<number | null>(null);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isIndicatorsModalOpen, setIsIndicatorsModalOpen] = useState(false);
  const [isCompetenciesModalOpen, setIsCompetenciesModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [showCreditsExhausted, setShowCreditsExhausted] = useState(false);
  const [creditsExhaustedInfo, setCreditsExhaustedInfo] = useState({ required: 20, current: 0 });

  // Indicators and Competencies tags for printing/evaluating
  const [indicators, setIndicators] = useState<string[]>([""]);
  const [competencies, setCompetencies] = useState<string[]>([""]);

  // Custom scores state
  const [customScores, setCustomScores] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("planix_custom_rubric_scores");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      satisfactorio: 10,
      aceptable: 8,
      elemental: 5,
      estrategico: 10,
      autonomo: 8,
      resolutivo: 6,
      receptivo: 4,
      logrado: 1,
      noLogrado: 0
    };
  });

  const [tempScores, setTempScores] = useState<Record<string, number>>({
    elemental: 5,
    aceptable: 8,
    satisfactorio: 10,
    receptivo: 4,
    resolutivo: 6,
    autonomo: 8,
    estrategico: 10,
    logrado: 1,
    noLogrado: 0
  });

  useEffect(() => {
    if (isScoreModalOpen) {
      setTempScores(customScores);
    }
  }, [isScoreModalOpen, customScores]);

  // Load rubric templates
  useEffect(() => {
    if (user?.id) {
      setRubrics(getRubrics(user.id));
    }
  }, [user]);

  // Sync indicators and competencies when changing rubrics
  useEffect(() => {
    if (activeRubricId) {
      const savedInd = localStorage.getItem(`planix_rubric_ind_${activeRubricId}`);
      const savedComp = localStorage.getItem(`planix_rubric_comp_${activeRubricId}`);
      setIndicators(savedInd ? JSON.parse(savedInd) : [""]);
      setCompetencies(savedComp ? JSON.parse(savedComp) : [""]);
    }
  }, [activeRubricId]);

  // Save indicators and competencies
  useEffect(() => {
    if (activeRubricId) {
      localStorage.setItem(`planix_rubric_ind_${activeRubricId}`, JSON.stringify(indicators));
    }
  }, [indicators, activeRubricId]);

  useEffect(() => {
    if (activeRubricId) {
      localStorage.setItem(`planix_rubric_comp_${activeRubricId}`, JSON.stringify(competencies));
    }
  }, [competencies, activeRubricId]);

  // Offline AI generation helper
  function generateRubricAI(prompt: string, numCriteria: number, level: "primaria" | "secundaria") {
    const isSecundaria = level === "secundaria";
    const criteriaList = [];
    const text = prompt.toLowerCase();
    
    let aspects = [
      "Comprensión del Tema", "Organización y Estructura", "Aplicación Práctica", 
      "Uso de Vocabulario", "Resolución y Creatividad", "Claridad y Fluidez", 
      "Trabajo Colaborativo", "Presentación Visual"
    ];
    
    if (text.includes("mayúscula") || text.includes("escribe") || text.includes("ortograf") || text.includes("letras")) {
      aspects = ["Uso de Mayúsculas", "Ortografía y Acentuación", "Coherencia y Estructura", "Puntuación de Párrafos", "Legibilidad y Trazo", "Vocabulario Empleado"];
    } else if (text.includes("matemátic") || text.includes("númer") || text.includes("cálcul") || text.includes("problem")) {
      aspects = ["Identificación de Datos", "Selección de Operación", "Precisión de Cálculos", "Explicación del Proceso", "Planteamiento lógico", "Uso de Representaciones"];
    } else if (text.includes("exposición") || text.includes("oral") || text.includes("habla") || text.includes("expres")) {
      aspects = ["Fluidez Verbal", "Dominio del Tema", "Uso de Recursos Visuales", "Postura y Lenguaje Corporal", "Contacto Visual", "Tono y Modulación de Voz"];
    } else if (text.includes("lectura") || text.includes("lee") || text.includes("comprensión")) {
      aspects = ["Velocidad Lectora", "Entonación y Ritmo", "Identificación de Ideas", "Vocabulario de Contexto", "Análisis Crítico", "Comprensión Inferencial"];
    }

    for (let i = 0; i < numCriteria; i++) {
      const aspect = aspects[i % aspects.length];
      let niveles = [];
      if (isSecundaria) {
        niveles = [
          {
            nombre: "Estratégico (E)",
            puntos: customScores.estrategico ?? 10,
            description: `Demuestra un dominio sobresaliente en ${aspect.toLowerCase()}, innovando en la aplicación y adaptándose a cualquier contexto.`
          },
          {
            nombre: "Autónomo (A)",
            puntos: customScores.autonomo ?? 8,
            description: `Realiza de forma independiente todas las actividades requeridas para ${aspect.toLowerCase()} sin necesidad de apoyo constante.`
          },
          {
            nombre: "Resolutivo (RE)",
            puntos: customScores.resolutivo ?? 6,
            description: `Logra resolver y aplicar ${aspect.toLowerCase()} de manera básica, aunque requiere asistencia ante situaciones de mayor complejidad.`
          },
          {
            nombre: "Receptivo (R)",
            puntos: customScores.receptivo ?? 4,
            description: `Muestra comprensión mínima de ${aspect.toLowerCase()} y requiere andamiaje y tutoría continua para completar las tareas.`
          }
        ];
      } else {
        niveles = [
          {
            nombre: "Satisfactorio (S)",
            puntos: customScores.satisfactorio ?? 10,
            description: `Consigue realizar y explicar con total claridad, orden y autonomía todo lo relacionado a ${aspect.toLowerCase()}.`
          },
          {
            nombre: "Aceptable (A)",
            puntos: customScores.aceptable ?? 8,
            description: `Logra cumplir satisfactoriamente con la mayor parte de ${aspect.toLowerCase()}, con pequeños detalles técnicos por pulir.`
          },
          {
            nombre: "Elemental (E)",
            puntos: customScores.elemental ?? 5,
            description: `Presenta dificultades básicas en ${aspect.toLowerCase()}, logrando completar únicamente con apoyo o ejemplos guiados.`
          }
        ];
      }

      criteriaList.push({
        nombre: aspect,
        peso: 0,
        niveles
      });
    }

    return {
      title: prompt.length > 35 ? prompt.substring(0, 35) + "..." : prompt,
      description: `Evaluación formativa diseñada por IA sobre: ${prompt}`,
      criterios: criteriaList
    };
  }

  // Rubric creator states
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [rubricType, setRubricType] = useState<"RUBRIC" | "CHECKLIST">("RUBRIC");

  // Default criteria values
  const [newCriteria, setNewCriteria] = useState<any[]>([
    {
      nombre: "Criterio 1: Dominio del tema",
      peso: 50,
      niveles: [
        { nombre: "Satisfactorio (S)", puntos: 10, description: "" },
        { nombre: "Aceptable (A)", puntos: 8, description: "" },
        { nombre: "Elemental (E)", puntos: 5, description: "" },
      ],
    },
    {
      nombre: "Criterio 2: Exposición y Recursos",
      peso: 50,
      niveles: [
        { nombre: "Satisfactorio (S)", puntos: 10, description: "" },
        { nombre: "Aceptable (A)", puntos: 8, description: "" },
        { nombre: "Elemental (E)", puntos: 5, description: "" },
      ],
    },
  ]);

  // Sync default levels to educational level
  useEffect(() => {
    const currentLevel = activeClassroom?.nivel || user?.nivel || "primaria";
    const isSecundario = currentLevel === "secundaria";
    const isPrimario = currentLevel === "primaria";

    if (!newTitle.trim()) {
      let defaultNiveles = [
        { nombre: "Excelente", puntos: 10, description: "" },
        { nombre: "Satisfactorio", puntos: 8, description: "" },
        { nombre: "En Proceso", puntos: 5, description: "" },
      ];

      if (isSecundario) {
        defaultNiveles = [
          { nombre: "Estratégico (E)", puntos: 10, description: "" },
          { nombre: "Autónomo (A)", puntos: 8, description: "" },
          { nombre: "Resolutivo (RE)", puntos: 6, description: "" },
          { nombre: "Receptivo (R)", puntos: 4, description: "" },
        ];
      } else if (isPrimario) {
        defaultNiveles = [
          { nombre: "Satisfactorio (S)", puntos: 10, description: "" },
          { nombre: "Aceptable (A)", puntos: 8, description: "" },
          { nombre: "Elemental (E)", puntos: 5, description: "" },
        ];
      }

      setNewCriteria([
        {
          nombre: rubricType === "CHECKLIST" ? "Indicador 1" : "Criterio 1: Dominio del tema",
          peso: 50,
          niveles: rubricType === "CHECKLIST" ? [
            { nombre: "Logrado", puntos: 1, description: "" },
            { nombre: "No Logrado", puntos: 0, description: "" },
          ] : defaultNiveles,
        },
        {
          nombre: rubricType === "CHECKLIST" ? "Indicador 2" : "Criterio 2: Exposición y Recursos",
          peso: 50,
          niveles: rubricType === "CHECKLIST" ? [
            { nombre: "Logrado", puntos: 1, description: "" },
            { nombre: "No Logrado", puntos: 0, description: "" },
          ] : defaultNiveles,
        },
      ]);
    }
  }, [activeClassroom, rubricType]);

  const handleSwitchType = (type: "RUBRIC" | "CHECKLIST") => {
    setRubricType(type);
    const isSecundario = activeClassroom?.nivel === "secundaria";
    const isPrimario = activeClassroom?.nivel === "primaria";

    if (type === "CHECKLIST") {
      setNewCriteria(newCriteria.map((c, idx) => ({
        nombre: c.nombre.includes("Criterio") ? c.nombre.replace("Criterio", "Indicador") : `Indicador ${idx + 1}`,
        peso: c.peso,
        descripcion: c.descripcion || "",
        niveles: [
          { nombre: "Logrado", puntos: 1, description: "" },
          { fontName: "", nombre: "No Logrado", puntos: 0, description: "" },
        ],
      })));
    } else {
      let defaultNiveles = [
        { nombre: "Excelente", puntos: 10, description: "" },
        { nombre: "Satisfactorio", puntos: 8, description: "" },
        { nombre: "En Proceso", puntos: 5, description: "" },
      ];

      if (isSecundario) {
        defaultNiveles = [
          { nombre: "Estratégico (E)", puntos: 10, description: "" },
          { nombre: "Autónomo (A)", puntos: 8, description: "" },
          { nombre: "Resolutivo (RE)", puntos: 6, description: "" },
          { nombre: "Receptivo (R)", puntos: 4, description: "" },
        ];
      } else if (isPrimario) {
        defaultNiveles = [
          { nombre: "Satisfactorio (S)", puntos: 10, description: "" },
          { nombre: "Aceptable (A)", puntos: 8, description: "" },
          { nombre: "Elemental (E)", puntos: 5, description: "" },
        ];
      }

      setNewCriteria(newCriteria.map((c, idx) => ({
        nombre: c.nombre.includes("Indicador") ? c.nombre.replace("Indicador", "Criterio") : `Criterio ${idx + 1}`,
        peso: c.peso,
        niveles: defaultNiveles,
      })));
    }
  };

  // Evaluator state
  const [editingRubricId, setEditingRubricId] = useState<string | null>(null);
  const [evalStudentId, setEvalStudentId] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [evalSelections, setEvalSelections] = useState<Record<string, number>>({});
  const [evalFeedback, setEvalFeedback] = useState("");

  // AI Modal generator properties
  const [aiTopic, setAiTopic] = useState("");
  const [aiNumCriteria, setAiNumCriteria] = useState(3);
  const [aiIsGenerating, setAiIsGenerating] = useState(false);
  const [aiGeneratedRubricPreview, setAiGeneratedRubricPreview] = useState<any | null>(null);

  // Text Editor Modal state
  const [editingTextInfo, setEditingTextInfo] = useState<{
    critIdx: number;
    lvlIdx: number;
    title: string;
    value: string;
  } | null>(null);

  const openTextEditorModal = (critIdx: number, lvlIdx: number, lvlName: string, initialText: string) => {
    setEditingTextInfo({
      critIdx,
      lvlIdx,
      title: `Editar Nivel: ${lvlName}`,
      value: initialText
    });
  };

  const handleSaveModalText = (newValue: string) => {
    if (!editingTextInfo) return;
    const { critIdx, lvlIdx } = editingTextInfo;
    const updatedNiveles = [...newCriteria[critIdx].niveles];
    updatedNiveles[lvlIdx].description = newValue;
    handleCriteriaChange(critIdx, "niveles", updatedNiveles);
    setEditingTextInfo(null);
  };

  const handleSaveAIPublishedRubric = () => {
    if (!aiGeneratedRubricPreview) return;

    const n = aiGeneratedRubricPreview.criterios.length;
    const equalWeight = Math.round(100 / n);
    const criteriaWithWeights = aiGeneratedRubricPreview.criterios.map((c: any, i: number) => ({
      ...c,
      peso: i === n - 1 ? 100 - (equalWeight * (n - 1)) : equalWeight
    }));

    const rubric: Rubric = {
      id: uid("rub"),
      docente_id: user?.id || "",
      titulo: aiGeneratedRubricPreview.title,
      descripcion: aiGeneratedRubricPreview.description,
      criterios: criteriaWithWeights,
      tipo: rubricType,
      creado_en: new Date().toISOString(),
    };

    saveRubric(rubric);
    setRubrics(getRubrics(user?.id || ""));
    setActiveRubricId(rubric.id);
    setActiveTab("lista");
    toast.success("¡Rúbrica generada y guardada con éxito!");

    setAiGeneratedRubricPreview(null);
    setIsAIGeneratorOpen(false);
    setAiTopic("");
  };

  const activeRubric = useMemo(() => {
    return rubrics.find((r) => r.id === activeRubricId) || null;
  }, [rubrics, activeRubricId]);

  // Adapt Rubric Criteria & Levels to student level
  const adaptedCriterios = useMemo(() => {
    if (!activeRubric) return [];
    const isSecundario = activeClassroom?.nivel === "secundaria";
    const isPrimario = activeClassroom?.nivel === "primaria";

    const getDescriptionForLevel = (rawNiveles: any[], levelName: string) => {
      if (!rawNiveles || !Array.isArray(rawNiveles)) return "";
      const search = levelName.toLowerCase();
      
      let found = rawNiveles.find((lvl: any) => {
        const name = (lvl.nombre || lvl.label || "").toLowerCase();
        return name.includes(search) || search.includes(name);
      });
      
      if (!found) {
        if (search.includes("elemental") || search.includes("receptivo")) {
          found = rawNiveles.find((lvl: any) => {
            const n = (lvl.nombre || lvl.label || "").toLowerCase();
            return n.includes("elemental") || n.includes("receptivo") || n.includes("proceso") || n.includes("bajo") || n.includes("inicio") || n.includes("receptivo (r)");
          });
        } else if (search.includes("aceptable") || search.includes("resolutivo")) {
          found = rawNiveles.find((lvl: any) => {
            const n = (lvl.nombre || lvl.label || "").toLowerCase();
            return n.includes("aceptable") || n.includes("resolutivo") || n.includes("medio") || n.includes("resolutivo (re)");
          });
        } else if (search.includes("satisfactorio") || search.includes("estrategico") || search.includes("estratégico") || search.includes("autónomo") || search.includes("autonomo")) {
          found = rawNiveles.find((lvl: any) => {
            const n = (lvl.nombre || lvl.label || "").toLowerCase();
            return n.includes("satisfactorio") || n.includes("estrategico") || n.includes("estratégico") || n.includes("autónomo") || n.includes("autonomo") || n.includes("excelente") || n.includes("alto");
          });
        }
      }

      if (found) return found.description || found.descripcion || "";
      
      if (search.includes("elemental") || search.includes("receptivo")) {
        const idx = rawNiveles.length - 1;
        return rawNiveles[idx]?.description || rawNiveles[idx]?.descripcion || "";
      }
      if (search.includes("aceptable") || search.includes("resolutivo")) {
        const idx = rawNiveles.length === 4 ? 2 : 1;
        return rawNiveles[idx]?.description || rawNiveles[idx]?.descripcion || "";
      }
      if (search.includes("autónomo") || search.includes("autonomo")) {
        return rawNiveles[1]?.description || rawNiveles[1]?.descripcion || "";
      }
      if (search.includes("satisfactorio") || search.includes("estratégico") || search.includes("estrategico")) {
        return rawNiveles[0]?.description || rawNiveles[0]?.descripcion || "";
      }
      return "";
    };

    return activeRubric.criterios.map((c) => {
      const isSec = isSecundario;
      const isPrim = isPrimario;
      
      let niveles = c.niveles;
      
      if (activeRubric.tipo === "CHECKLIST") {
        niveles = [
          {
            nombre: "Logrado",
            puntos: customScores.logrado ?? 1,
            description: c.niveles.find((l: any) => l.nombre.toLowerCase().includes("logrado") && !l.nombre.toLowerCase().includes("no"))?.description || ""
          },
          {
            nombre: "No Logrado",
            puntos: customScores.noLogrado ?? 0,
            description: c.niveles.find((l: any) => l.nombre.toLowerCase().includes("no logrado"))?.description || ""
          }
        ];
      } else {
        if (isSec) {
          niveles = [
            {
              nombre: "Estratégico (E)",
              puntos: customScores.estrategico ?? 10,
              description: getDescriptionForLevel(c.niveles, "estrategico")
            },
            {
              nombre: "Autónomo (A)",
              puntos: customScores.autonomo ?? 8,
              description: getDescriptionForLevel(c.niveles, "autonomo")
            },
            {
              nombre: "Resolutivo (RE)",
              puntos: customScores.resolutivo ?? 6,
              description: getDescriptionForLevel(c.niveles, "resolutivo")
            },
            {
              nombre: "Receptivo (R)",
              puntos: customScores.receptivo ?? 4,
              description: getDescriptionForLevel(c.niveles, "receptivo")
            }
          ];
        } else if (isPrim) {
          niveles = [
            {
              nombre: "Satisfactorio (S)",
              puntos: customScores.satisfactorio ?? 10,
              description: getDescriptionForLevel(c.niveles, "satisfactorio")
            },
            {
              nombre: "Aceptable (A)",
              puntos: customScores.aceptable ?? 8,
              description: getDescriptionForLevel(c.niveles, "aceptable")
            },
            {
              nombre: "Elemental (E)",
              puntos: customScores.elemental ?? 5,
              description: getDescriptionForLevel(c.niveles, "elemental")
            }
          ];
        }
      }

      return {
        ...c,
        niveles: niveles.map((l: any) => ({
          ...l,
          description: l.description || l.descripcion || ""
        }))
      };
    });
  }, [activeRubric, activeClassroom, customScores]);

  // Load existing evaluation for active student if it exists
  useEffect(() => {
    if (!evalStudentId || !activeRubricId) {
      setEvalSelections({});
      setEvalFeedback("");
      return;
    }
    const evs = getStudentEvaluations(activeRubricId);
    const existing = evs.find((e) => e.student_id === evalStudentId);
    if (existing) {
      setEvalSelections(existing.evaluaciones || {});
      setEvalFeedback(existing.retroalimentacion || "");
    } else {
      setEvalSelections({});
      setEvalFeedback("");
    }
  }, [evalStudentId, activeRubricId]);

  // Calculate score instantly
  const calculatedGrade = useMemo(() => {
    if (!activeRubric) return 0;
    let totalScore = 0;
    let sumWeights = 0;
    const totalC = adaptedCriterios.length;

    adaptedCriterios.forEach((c) => {
      const selectedPoints = evalSelections[c.nombre] ?? 0;
      const peso = c.peso || (totalC > 0 ? 100 / totalC : 0);
      const maxLevelPoints = Math.max(...c.niveles.map((l: any) => l.puntos));
      const normalized = maxLevelPoints > 0 ? (selectedPoints / maxLevelPoints) * peso : 0;
      totalScore += normalized;
      sumWeights += peso;
    });

    return +totalScore.toFixed(1);
  }, [activeRubric, adaptedCriterios, evalSelections]);

  // Calculate direct points score and qualitative competency level
  const evaluationSummary = useMemo(() => {
    if (!activeRubric) return { score: 0, maxScore: 0, percentage: 0, level: "-" };

    const isChecklist = activeRubric.tipo === "CHECKLIST";
    const isSecundario = activeClassroom?.nivel === "secundaria";

    let totalScore = 0;
    let maxScore = 0;
    const hasSelections = Object.keys(evalSelections).length > 0;

    adaptedCriterios.forEach((c) => {
      const selectedPoints = evalSelections[c.nombre];
      if (selectedPoints !== undefined) {
        totalScore += selectedPoints;
      }
      const maxLvl = Math.max(...c.niveles.map((l: any) => l.puntos));
      maxScore += maxLvl;
    });

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    let levelLabel = "-";
    if (hasSelections) {
      if (isChecklist) {
        if (percentage >= 100) levelLabel = isSecundario ? "Estratégico" : "Satisfactorio";
        else if (percentage >= 70) levelLabel = isSecundario ? "Autónomo" : "Aceptable";
        else levelLabel = isSecundario ? "Resolutivo" : "Elemental";
      } else {
        if (isSecundario) {
          if (percentage >= 90) levelLabel = "Estratégico";
          else if (percentage >= 75) levelLabel = "Autónomo";
          else if (percentage >= 60) levelLabel = "Resolutivo";
          else levelLabel = "Receptivo";
        } else {
          if (percentage >= 90) levelLabel = "Satisfactorio";
          else if (percentage >= 65) levelLabel = "Aceptable";
          else levelLabel = "Elemental";
        }
      }
    }

    return {
      score: totalScore,
      maxScore,
      percentage,
      level: levelLabel
    };
  }, [activeRubric, adaptedCriterios, evalSelections, activeClassroom]);

  const studentEvaluations = useMemo(() => {
    return activeRubricId ? getStudentEvaluations(activeRubricId) : [];
  }, [activeRubricId, evalStudentId]);


  const handleAddCriteria = () => {
    const currentLevel = activeClassroom?.nivel || user?.nivel || "primaria";
    const isSecundario = currentLevel === "secundaria";
    const isPrimario = currentLevel === "primaria";

    if (rubricType === "CHECKLIST") {
      setNewCriteria([
        ...newCriteria,
        {
          nombre: `Indicador ${newCriteria.length + 1}`,
          peso: 0,
          descripcion: "",
          niveles: [
            { nombre: "Logrado", puntos: 1, description: "" },
            { nombre: "No Logrado", puntos: 0, description: "" },
          ],
        },
      ]);
    } else {
      let defaultNiveles = [
        { nombre: "Excelente", puntos: 10, description: "" },
        { nombre: "Satisfactorio", puntos: 8, description: "" },
        { nombre: "En Proceso", puntos: 5, description: "" },
      ];

      if (isSecundario) {
        defaultNiveles = [
          { nombre: "Estratégico (E)", puntos: 10, description: "" },
          { nombre: "Autónomo (A)", puntos: 8, description: "" },
          { nombre: "Resolutivo (RE)", puntos: 6, description: "" },
          { nombre: "Receptivo (R)", puntos: 4, description: "" },
        ];
      } else if (isPrimario) {
        defaultNiveles = [
          { nombre: "Satisfactorio (S)", puntos: 10, description: "" },
          { nombre: "Aceptable (A)", puntos: 8, description: "" },
          { nombre: "Elemental (E)", puntos: 5, description: "" },
        ];
      }

      setNewCriteria([
        ...newCriteria,
        {
          nombre: `Criterio ${newCriteria.length + 1}`,
          peso: 0,
          niveles: defaultNiveles,
        },
      ]);
    }
  };

  const handleRemoveCriteria = (idx: number) => {
    setNewCriteria(newCriteria.filter((_, i) => i !== idx));
  };

  const handleCriteriaChange = (idx: number, key: string, value: any) => {
    const updated = [...newCriteria];
    updated[idx][key] = value;
    setNewCriteria(updated);
  };

  const handleSaveRubric = () => {
    if (!newTitle.trim()) {
      toast.error("El título de la rúbrica es obligatorio.");
      return;
    }
    if (newCriteria.length === 0) {
      toast.error("Debes añadir al menos un criterio de evaluación.");
      return;
    }

    const n = newCriteria.length;
    const equalWeight = Math.round(100 / n);
    const criteriaWithWeights = newCriteria.map((c, i) => ({
      ...c,
      peso: i === n - 1 ? 100 - (equalWeight * (n - 1)) : equalWeight
    }));

    const rubric: Rubric = {
      id: editingRubricId || uid("rub"),
      docente_id: user?.id || "",
      titulo: newTitle,
      descripcion: newDesc,
      criterios: criteriaWithWeights,
      tipo: rubricType,
      creado_en: rubrics.find(r => r.id === editingRubricId)?.creado_en || new Date().toISOString(),
    };

    saveRubric(rubric);
    setRubrics(getRubrics(user?.id || ""));
    setActiveRubricId(rubric.id);
    setActiveTab("lista");
    toast.success(editingRubricId ? "¡Rúbrica de evaluación actualizada con éxito!" : "¡Rúbrica de evaluación guardada con éxito!");

    setNewTitle("");
    setNewDesc("");
    setRubricType("RUBRIC");
    setEditingRubricId(null);
  };

  const handleSaveEvaluation = () => {
    if (!activeRubricId || !evalStudentId) {
      toast.error("Selecciona un alumno.");
      return;
    }
    const allEvaluated = adaptedCriterios.every((c) => evalSelections[c.nombre] !== undefined);
    if (!allEvaluated) {
      toast.warning("Recomendado: Evalúa todos los criterios de la rúbrica.");
    }

    const evaluation: StudentEvaluation = {
      id: uid("evl"),
      rubric_id: activeRubricId,
      student_id: evalStudentId,
      evaluaciones: evalSelections,
      nota_calculada: calculatedGrade,
      retroalimentacion: evalFeedback,
      fecha: new Date().toISOString().split("T")[0],
      resultado: evaluationSummary.level,
      puntaje_obtenido: evaluationSummary.score,
    };

    saveStudentEvaluation(evaluation);
    setEvalStudentId("");
    setEvalSelections({});
    setEvalFeedback("");
    toast.success("¡Calificación calculada y guardada en el historial!");
  };

  const handleDeleteRubricClick = (id: string) => {
    deleteRubric(id);
    setRubrics(getRubrics(user?.id || ""));
    if (activeRubricId === id) {
      setActiveRubricId(null);
    }
    setDeleteConfirmId(null);
    toast.success("¡Plantilla de evaluación eliminada correctamente!");
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tabs control bar */}
      <div className="flex bg-black/[0.03] dark:bg-white/[0.03] p-1.5 rounded-full w-fit gap-2 shadow-xs border border-black/5 dark:border-white/5 select-none no-print">
        <button
          type="button"
          onClick={() => setActiveTab("lista")}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-[13.5px] font-bold transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          {activeTab === "lista" && (
            <motion.div
              layoutId="activeRubricTabPill"
              className="absolute inset-0 bg-purple-650 rounded-full shadow-xs"
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            />
          )}
          <Scale className={`h-3.5 w-3.5 relative z-10 transition-colors duration-300 ${activeTab === "lista" ? "text-white" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"}`} />
          <span className={`relative z-10 transition-colors duration-300 ${activeTab === "lista" ? "text-white" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"}`}>
            Mis Rúbricas
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (editingRubricId) {
              setEditingRubricId(null);
              setNewTitle("");
              setNewDesc("");
              setNewCriteria([]);
            }
            setActiveTab("crear");
          }}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-[13.5px] font-bold transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          {activeTab === "crear" && (
            <motion.div
              layoutId="activeRubricTabPill"
              className="absolute inset-0 bg-purple-650 rounded-full shadow-xs"
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            />
          )}
          <Plus className={`h-3.5 w-3.5 relative z-10 transition-colors duration-300 ${activeTab === "crear" ? "text-white" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"}`} />
          <span className={`relative z-10 transition-colors duration-300 ${activeTab === "crear" ? "text-white" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"}`}>
            Diseñar Rúbrica
          </span>
        </button>

        {activeRubric && (
          <button
            type="button"
            onClick={() => setActiveTab("aplicar")}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-[13.5px] font-bold transition-all duration-300 cursor-pointer relative overflow-hidden group"
          >
            {activeTab === "aplicar" && (
              <motion.div
                layoutId="activeRubricTabPill"
                className="absolute inset-0 bg-purple-650 rounded-full shadow-xs"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
            <Calculator className={`h-3.5 w-3.5 relative z-10 transition-colors duration-300 ${activeTab === "aplicar" ? "text-white" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"}`} />
            <span className={`relative z-10 transition-colors duration-300 ${activeTab === "aplicar" ? "text-white" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"}`}>
              Evaluar: {activeRubric.titulo.substring(0, 15)}...
            </span>
          </button>
        )}
      </div>

      {/* TAB: LIST */}
      {activeTab === "lista" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rubrics.map((r) => (
            <div 
              key={r.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200 animate-in fade-in"
            >
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                      {r.criterios.length} {r.tipo === "CHECKLIST" ? "Indicadores" : "Criterios"}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      r.tipo === "CHECKLIST"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                    }`}>
                      {r.tipo === "CHECKLIST" ? "Lista de Cotejo" : "Rúbrica Analítica"}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingRubricId(r.id);
                        setNewTitle(r.titulo);
                        setNewDesc(r.descripcion);
                        setRubricType(r.tipo || "RUBRIC");
                        setNewCriteria(r.criterios);
                        setActiveTab("crear");
                      }}
                      className="h-7 w-7 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center transition-colors"
                      title="Editar Rúbrica"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(r.id)}
                      className="h-7 w-7 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer flex items-center justify-center transition-colors"
                      title="Eliminar Rúbrica"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-[15px] text-slate-800 dark:text-white truncate">{r.titulo}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{r.descripcion}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-450 font-bold">
                  {new Date(r.creado_en).toLocaleDateString("es-DO")}
                </span>
                <button
                  onClick={() => {
                    setActiveRubricId(r.id);
                    setActiveTab("aplicar");
                  }}
                  className="bg-purple-650 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <Calculator size={13} /> Evaluar
                </button>
              </div>
            </div>
          ))}

          {rubrics.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-xl p-8 text-center col-span-full shadow-2xs">
              <Award className="mx-auto h-10 w-10 text-slate-350" />
              <div className="mt-2 font-bold text-slate-800 dark:text-slate-200">Aún no tienes rúbricas diseñadas</div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-sm mx-auto">
                Crea un instrumento analítico para evaluar exposiciones, proyectos, cuadernos o maquetas.
              </p>
              <button 
                onClick={() => setActiveTab("crear")} 
                className="mt-4 bg-purple-655 hover:bg-purple-700 text-white text-xs font-black px-4 py-2 rounded-lg transition"
              >
                Crear Rúbrica
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB: CREATE/DESIGN */}
      {activeTab === "crear" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                {editingRubricId ? "Editar Matriz de Evaluación" : "Diseñar Matriz de Evaluación"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-semibold">Establece criterios pedagógicos y automatiza la matriz cualitativa.</p>
            </div>
            
            {/* Checklist vs Rubric Selector */}
            <div className="flex border border-black/5 dark:border-white/5 rounded-full p-1.5 bg-black/[0.03] dark:bg-white/[0.03] gap-2 w-full md:w-fit select-none shadow-xs">
              <button
                type="button"
                onClick={() => handleSwitchType("RUBRIC")}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-full text-[13.5px] font-bold transition-all duration-300 cursor-pointer relative overflow-hidden group flex items-center justify-center"
              >
                {rubricType === "RUBRIC" && (
                  <motion.div
                    layoutId="activeRubricTypeTabPill"
                    className="absolute inset-0 bg-purple-650 rounded-full shadow-xs"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <BarChart3 className={`h-3.5 w-3.5 mr-1.5 relative z-10 transition-colors duration-300 ${rubricType === "RUBRIC" ? "text-white" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"}`} />
                <span className={`relative z-10 transition-colors duration-300 ${rubricType === "RUBRIC" ? "text-white" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"}`}>
                  Rúbrica Analítica
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchType("CHECKLIST")}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-full text-[13.5px] font-bold transition-all duration-300 cursor-pointer relative overflow-hidden group flex items-center justify-center"
              >
                {rubricType === "CHECKLIST" && (
                  <motion.div
                    layoutId="activeRubricTypeTabPill"
                    className="absolute inset-0 bg-purple-650 rounded-full shadow-xs"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <CheckSquare className={`h-3.5 w-3.5 mr-1.5 relative z-10 transition-colors duration-300 ${rubricType === "CHECKLIST" ? "text-white" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"}`} />
                <span className={`relative z-10 transition-colors duration-300 ${rubricType === "CHECKLIST" ? "text-white" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"}`}>
                  Lista de Cotejo
                </span>
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 pl-1">
                {rubricType === "CHECKLIST" ? "Título de la Lista de Cotejo" : "Título de la Rúbrica"}
              </label>
              <input
                type="text"
                placeholder={rubricType === "CHECKLIST" ? "Ej: Verificación de Cuadernos" : "Ej: Evaluación de Exposición Oral"}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-3.5 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/10 outline-none transition-all shadow-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 pl-1">Descripción / Objetivos</label>
              <input
                type="text"
                placeholder="Instrucciones u objetivo de la evaluación..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full h-10 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg px-3.5 text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/10 outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Criterios layout */}
          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {rubricType === "CHECKLIST" ? "Indicadores a Verificar" : "Criterios de Evaluación"}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAIGeneratorOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2 font-bold shadow-sm text-[13px] h-10 px-5 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none"
                  type="button"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Generar con IA
                </button>
                <button 
                  onClick={handleAddCriteria} 
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-zinc-800 gap-2 text-[13px] font-bold h-10 px-5 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> {rubricType === "CHECKLIST" ? "Añadir Indicador" : "Añadir Criterio"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {newCriteria.map((crit, idx) => (
                <div key={idx} className="p-4 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/30 dark:bg-slate-950/20 relative">
                  <button
                    type="button"
                    onClick={() => setDeleteCriteriaIndex(idx)}
                    className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-600 p-1 rounded-md transition duration-150 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="w-full pr-8">
                    <label className="text-xs font-bold text-slate-500">
                      {rubricType === "CHECKLIST" ? "Nombre del Indicador" : "Nombre del Criterio"}
                    </label>
                    <input
                      type="text"
                      value={crit.nombre}
                      onChange={(e) => handleCriteriaChange(idx, "nombre", e.target.value)}
                      className="w-full h-10 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500 mt-1 shadow-xs"
                    />
                  </div>

                  {rubricType === "CHECKLIST" ? (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Descripción del Indicador (¿Qué observar?)</label>
                      <textarea
                        placeholder="Ej: El estudiante presenta la carpeta limpia, ordenada y completa con las actividades realizadas..."
                        value={crit.descripcion || ""}
                        onChange={(e) => handleCriteriaChange(idx, "descripcion", e.target.value)}
                        rows={2}
                        className="w-full min-h-[80px] p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none mt-1 leading-relaxed shadow-xs"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">Descripciones de Niveles Cualitativos</label>
                      <div className={`grid gap-3 grid-cols-1 ${
                        crit.niveles.length === 3 
                          ? "md:grid-cols-3 lg:grid-cols-3" 
                          : "md:grid-cols-2 lg:grid-cols-4"
                      }`}>
                        {crit.niveles.map((lvl: any, lIdx: number) => {
                          const styles = getLevelStyles(lvl.nombre);
                          return (
                            <div key={lIdx} className={`${styles.bg} ${styles.border} p-3 border rounded-lg space-y-1.5 transition duration-150 shadow-3xs`}>
                              <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-1 select-none">
                                <span className={`font-black text-[9px] ${styles.text} uppercase`}>{lvl.nombre}</span>
                                <span className={`text-[9px] font-black ${styles.badgeBg} px-1.5 py-0.5 rounded`}>{lvl.puntos} Ptos</span>
                              </div>
                              <textarea
                                placeholder="Ej: Describe con total fluidez y dominio..."
                                value={lvl.description || ""}
                                readOnly
                                onClick={() => openTextEditorModal(idx, lIdx, lvl.nombre, lvl.description || "")}
                                ref={(el) => {
                                  if (el) {
                                    el.style.height = 'auto';
                                    el.style.height = `${el.scrollHeight}px`;
                                  }
                                }}
                                className="text-[10px] w-full p-0 border-none focus:ring-0 outline-none resize-none font-semibold text-slate-700 dark:text-slate-200 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 leading-normal cursor-pointer rounded-xs p-1 transition"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSaveRubric}
                className="bg-purple-650 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition"
              >
                <CheckCircle className="h-4 w-4" /> {editingRubricId ? "Actualizar Rúbrica" : "Guardar Rúbrica"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: APPLY / EVALUATE */}
      {activeTab === "aplicar" && activeRubric && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Evaluator Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-xl lg:col-span-2 shadow-sm space-y-5 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-white">Aplicar Evaluación</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Instrumento: <span className="text-purple-600 font-extrabold">{activeRubric.titulo}</span></p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsIndicatorsModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white font-bold text-[10px] h-8 px-3.5 rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Target className="h-3.5 w-3.5 text-emerald-400" /> Indicadores
                </button>

                <button
                  type="button"
                  onClick={() => setIsCompetenciesModalOpen(true)}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] h-8 px-3.5 rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Award className="h-3.5 w-3.5 text-amber-300" /> Competencias
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800 font-bold text-[10px] h-8 px-3.5 rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-blue-500" /> Imprimir
                </button>

                <button
                  type="button"
                  onClick={() => setIsScoreModalOpen(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] h-8 px-3.5 rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Ajustes
                </button>
              </div>
            </div>

            {/* Student selector */}
            <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 text-left relative select-none">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 pl-1">Estudiante a Calificar</label>
                <div
                  onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                  className="mt-1 w-full h-10 px-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 focus:border-[#1B1B1B] outline-none transition-all shadow-xs"
                >
                  <span className="truncate">
                    {(() => {
                      const s = students.find(std => std.id === evalStudentId);
                      return s ? `${s.numero_orden}. ${s.nombre} ${s.apellido || ""}` : "-- Elige estudiante --";
                    })()}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showStudentDropdown ? 'rotate-90' : ''}`} />
                </div>

                {showStudentDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStudentDropdown(false)} />
                    <div className="absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto bg-white dark:bg-zinc-900 rounded-lg border border-black/5 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 scrollbar-hide">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEvalStudentId("");
                            setShowStudentDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                            evalStudentId === "" ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" : "text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <span>-- Elige estudiante --</span>
                          {evalStudentId === "" && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                        </button>
                        {students.map((st) => {
                          const isActive = st.id === evalStudentId;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => {
                                setEvalStudentId(st.id);
                                setShowStudentDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                                isActive ? "bg-slate-100 dark:bg-zinc-800 text-[#1B1B1B] dark:text-white font-semibold" : "text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                              }`}
                            >
                              <span className="truncate">{st.numero_orden}. {st.nombre} {st.apellido || ""}</span>
                              {isActive && <Check className="w-3.5 h-3.5 shrink-0 text-[#1B1B1B] dark:text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Criteria Rows */}
            <div className="space-y-6 text-left">
              {adaptedCriterios.map((c) => {
                const selected = evalSelections[c.nombre];
                return (
                  <div key={c.nombre} className="space-y-2.5 border-b border-dashed border-slate-100 dark:border-slate-800 pb-5">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-tight">{c.nombre}</span>
                    </div>

                    {activeRubric.tipo === "CHECKLIST" && c.descripcion && (
                      <div className="text-xs text-slate-650 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-1.5 font-medium leading-relaxed">
                        <Target className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                        <span><strong>Indicador:</strong> {c.descripcion}</span>
                      </div>
                    )}

                    <div className={`grid gap-2.5 ${
                      activeRubric.tipo === "CHECKLIST" 
                        ? "grid-cols-2" 
                        : c.niveles.length === 4 
                          ? "grid-cols-2 sm:grid-cols-4" 
                          : "grid-cols-3"
                    }`}>
                      {c.niveles.map((lvl) => {
                        const isChecklist = activeRubric.tipo === "CHECKLIST";
                        const isSelected = selected === lvl.puntos;
                        const lvlStyles = getLevelStyles(lvl.nombre);
                        
                        let buttonStyles = "";
                        let textScoreColor = "text-purple-650";

                        if (isChecklist) {
                          if (isSelected) {
                            buttonStyles = lvl.puntos > 0
                              ? "border-2 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-extrabold"
                              : "border-2 border-rose-500 bg-rose-50/80 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 font-extrabold";
                            textScoreColor = lvl.puntos > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
                          } else {
                            buttonStyles = "border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-foreground bg-white dark:bg-slate-900 dark:text-zinc-200";
                          }
                        } else {
                          const upper = lvl.nombre.toUpperCase();
                          let selectedRing = "border-2 border-emerald-500 dark:border-emerald-400";
                          let selectedText = "text-emerald-800 dark:text-emerald-300 font-black";
                          if (upper.includes("ELEMENTAL") || upper.includes("RECEPTIVO") || upper.includes("PROCESO")) {
                            selectedRing = "border-2 border-rose-500 dark:border-rose-400";
                            selectedText = "text-rose-800 dark:text-rose-300 font-black";
                          } else if (upper.includes("ACEPTABLE") || upper.includes("RESOLUTIVO")) {
                            selectedRing = "border-2 border-amber-500 dark:border-amber-400";
                            selectedText = "text-amber-800 dark:text-amber-300 font-black";
                          } else if (upper.includes("AUTÓNOMO")) {
                            selectedRing = "border-2 border-blue-500 dark:border-blue-400";
                            selectedText = "text-blue-800 dark:text-blue-300 font-black";
                          }

                          const hasSelection = selected !== undefined && selected !== null;

                          if (isSelected) {
                            buttonStyles = `${lvlStyles.bg} ${lvlStyles.text} ${selectedRing} scale-[1.02] shadow-2xs font-extrabold z-10`;
                            textScoreColor = selectedText;
                          } else {
                            const opacityClass = hasSelection ? "opacity-60 hover:opacity-100" : "opacity-100";
                            buttonStyles = `${lvlStyles.bg} ${lvlStyles.border} text-slate-700 dark:text-slate-250 ${opacityClass} hover:scale-[1.01] hover:shadow-3xs transition duration-150`;
                            textScoreColor = "text-slate-500 dark:text-slate-400";
                          }
                        }

                        return (
                          <button
                            key={lvl.nombre}
                            onClick={() => setEvalSelections((prev) => ({ ...prev, [c.nombre]: lvl.puntos }))}
                            className={`p-3 rounded-lg border text-left transition flex flex-col justify-between min-h-[120px] cursor-pointer ${buttonStyles}`}
                          >
                            <div className="space-y-1">
                              <span className="text-[9.5px] font-black uppercase tracking-wider block">{lvl.nombre}</span>
                              {lvl.description && (
                                <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-normal font-medium mt-1">
                                  {lvl.description}
                                </p>
                              )}
                            </div>
                            <span className={`text-[8.5px] font-black mt-3 uppercase tracking-widest ${isSelected ? textScoreColor : "text-slate-400"}`}>
                              {lvl.puntos} PTS
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-600 pl-1">Retroalimentación Cualitativa (Opcional)</label>
              <textarea
                placeholder="Ej: Excelente esfuerzo, continuar practicando la fluidez lectora..."
                value={evalFeedback}
                onChange={(e) => setEvalFeedback(e.target.value)}
                rows={3}
                className="w-full min-h-[80px] p-3 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/10 outline-none transition-all resize-none leading-relaxed shadow-xs"
              />
            </div>

            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                {/* PUNTAJE */}
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest mb-1">Puntaje</p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-500">
                    {evaluationSummary.score} <span className="text-xs font-bold text-slate-400">/ {evaluationSummary.maxScore} PTS</span>
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-850" />
                {/* RESULTADO (NIVEL DE LOGRO) */}
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest mb-1">Resultado</p>
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-black ring-1 ring-inset ${
                    evaluationSummary.level === "Satisfactorio" || evaluationSummary.level === "Estratégico"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/20 dark:text-emerald-300 dark:ring-emerald-500/25"
                      : evaluationSummary.level === "Aceptable" || evaluationSummary.level === "Autónomo"
                        ? "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/20 dark:text-amber-300 dark:ring-amber-500/25"
                        : evaluationSummary.level === "Elemental" || evaluationSummary.level === "Resolutivo" || evaluationSummary.level === "Receptivo"
                          ? "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/20 dark:text-rose-300 dark:ring-rose-500/25"
                          : "bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}>
                    {evaluationSummary.level}
                  </span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleSaveEvaluation} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 px-5 rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer w-full sm:w-auto justify-center"
              >
                <CheckCircle className="h-4 w-4" /> Asentar Calificación
              </button>
            </div>
          </div>

          {/* Sidebar Details & History */}
          <div className="space-y-6">
            {/* Ponderation Display */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4 text-left">
              <div>
                <h3 className="font-bold text-[15px] text-slate-800 dark:text-white">Ponderación Final</h3>
                <p className="text-[11px] text-slate-450 mt-0.5">Nota acumulada sobre base 100.</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-purple-650 text-white shadow-sm">
                <div>
                  <div className="text-[9px] text-purple-100 font-extrabold uppercase tracking-widest">Calificación</div>
                  <div className="font-black text-2xl mt-1">{calculatedGrade} / 100</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-purple-100 font-extrabold uppercase tracking-widest">Resultado</div>
                  <div className="font-black text-[10.5px] mt-1 bg-white/20 px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">{evaluationSummary.level}</div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal font-bold">
                * El sistema normaliza las puntuaciones seleccionadas sobre el peso de cada criterio de manera proporcional.
              </p>
            </div>

            {/* Saved evaluations for active rubric */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-3 text-left">
              <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-450">Historial de Calificaciones</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {studentEvaluations.map((ev) => {
                  const st = students.find((x) => x.id === ev.student_id);
                  return (
                    <div key={ev.id} className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 text-xs flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{st ? `${st.nombre} ${st.apellido || ""}` : "Estudiante"}</div>
                        <div className="text-[9.5px] text-slate-450 mt-0.5">{ev.fecha}</div>
                      </div>
                      <span className="bg-emerald-105 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-none font-black px-2 py-0.5 rounded-md text-[10px]">
                        {ev.nota_calculada} pts
                      </span>
                    </div>
                  );
                })}
                {studentEvaluations.length === 0 && (
                  <div className="text-center py-6 text-[11px] text-slate-450">Aún no hay calificaciones para este instrumento.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {deleteConfirmId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div 
            className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-2xl relative overflow-hidden mx-4 animate-in zoom-in-95 duration-250 text-center space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-3xs border border-rose-200/50">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-base">¿Eliminar Instrumento?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                ¿Estás seguro de que deseas eliminar la plantilla <span className="font-extrabold text-slate-800 dark:text-zinc-100">"{rubrics.find((r) => r.id === deleteConfirmId)?.titulo}"</span>? Esta acción es irreversible.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 h-9 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleDeleteRubricClick(deleteConfirmId)}
                className="flex-1 h-9 rounded-lg text-xs font-black bg-rose-600 hover:bg-rose-700 text-white border-none shadow-sm cursor-pointer flex items-center justify-center gap-1"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE CRITERIA CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {deleteCriteriaIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setDeleteCriteriaIndex(null)}
        >
          <div 
            className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-2xl relative overflow-hidden mx-4 animate-in zoom-in-95 duration-250 text-center space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-3xs border border-rose-200/50">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-base">
                {rubricType === "CHECKLIST" ? "¿Eliminar Indicador?" : "¿Eliminar Criterio?"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-bold animate-in fade-in">
                ¿Estás seguro de que deseas eliminar este {rubricType === "CHECKLIST" ? "indicador" : "criterio"} de evaluación?
                {newCriteria[deleteCriteriaIndex]?.nombre ? (
                  <>
                    <br />
                    <span className="font-extrabold text-slate-800 dark:text-zinc-100">
                      "{newCriteria[deleteCriteriaIndex].nombre}"
                    </span>
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                type="button"
                onClick={() => setDeleteCriteriaIndex(null)}
                className="flex-1 h-9 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={() => {
                  handleRemoveCriteria(deleteCriteriaIndex);
                  setDeleteCriteriaIndex(null);
                  toast.success(rubricType === "CHECKLIST" ? "¡Indicador eliminado!" : "¡Criterio eliminado!");
                }}
                className="flex-1 h-9 rounded-lg text-xs font-black bg-rose-600 hover:bg-rose-700 text-white border-none shadow-sm cursor-pointer flex items-center justify-center gap-1"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {isAIGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" onClick={() => { setIsAIGeneratorOpen(false); setAiGeneratedRubricPreview(null); }}>
          <div 
            className={`w-full ${aiIsGenerating ? 'max-w-[380px]' : aiGeneratedRubricPreview ? 'max-w-4xl' : 'max-w-xl'} p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200 mx-4 text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col`} 
            onClick={(e) => e.stopPropagation()}
          >
            {aiIsGenerating ? (
              <div className="flex flex-col items-center justify-center p-8 pt-10 pb-7 text-center relative animate-in fade-in duration-300">
                <button
                  type="button"
                  onClick={() => { setAiIsGenerating(false); setIsAIGeneratorOpen(false); setAiGeneratedRubricPreview(null); }}
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
                    Diseñando rúbrica
                  </h4>
                  <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                    Redactando los criterios de evaluación. Esto puede tomar unos segundos.
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
            ) : !aiGeneratedRubricPreview ? (
              <div className="flex flex-col gap-4 pb-2">
                <div className="p-6 pb-2 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-500/10 dark:bg-purple-950/40 rounded-full flex items-center justify-center shrink-0">
                      <Sparkles className="h-4.5 w-4.5 fill-purple-500/20 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-white">
                      Generador de rúbricas IA
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Crea matrices de evaluación adaptadas a tu nivel educativo en segundos.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setIsAIGeneratorOpen(false); setAiGeneratedRubricPreview(null); }}
                    className="h-6 w-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                    title="Cerrar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mx-6 bg-purple-500/5 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-500/10 flex gap-3 text-left">
                  <Info className="w-4.5 h-4.5 text-purple-655 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-655 dark:text-slate-355 leading-relaxed font-semibold">
                    Inserta el indicador de logro o competencia. La IA generará criterios detallados y niveles específicos: {activeClassroom.nivel === "secundaria" ? 'Receptivo, Resolutivo, Autónomo y Estratégico' : 'Satisfactorio, Aceptable y Elemental'}.
                  </p>
                </div>

                <div className="space-y-2 text-left mx-6">
                  <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 pl-1">Escribe el indicador o competencia</label>
                  <textarea
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-zinc-800 text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500/10 focus:outline-none p-3.5 bg-neutral-50 dark:bg-zinc-900/50 resize-none transition-all placeholder:text-neutral-400 min-h-[90px] text-[#1B1B1B] dark:text-neutral-100 leading-relaxed shadow-xs"
                    placeholder="Ej: Reconoce y utiliza las letras mayúsculas al inicio de un texto..."
                  />
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left mx-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-500/10 dark:bg-purple-950/40 rounded-full flex items-center justify-center shrink-0">
                      <Layout className="w-4 h-4 fill-purple-500/20 text-purple-655 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-355 tracking-tight">Criterios a generar</p>
                      <p className="text-[10px] text-slate-400 font-bold">¿Cuántos criterios deseas evaluar?</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/40 dark:border-slate-800">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setAiNumCriteria(n)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${aiNumCriteria === n
                          ? 'bg-purple-650 text-white shadow-sm font-black'
                          : 'text-slate-500 dark:text-slate-450 hover:bg-white dark:hover:bg-slate-800 hover:text-purple-655'
                          }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsAIGeneratorOpen(false); setAiGeneratedRubricPreview(null); }}
                    className="flex-1 h-9 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      if (!aiTopic.trim()) {
                        toast.error("El indicador o tema es obligatorio.");
                        return;
                      }
                      const canProceed = consumeCredits("rubric_generation");
                      if (!canProceed) {
                        const info = getCreditInfo("rubric_generation");
                        setCreditsExhaustedInfo({ required: info.cost, current: info.currentCredits });
                        setShowCreditsExhausted(true);
                        return;
                      }
                      setAiIsGenerating(true);
                      try {
                        const currentLevel = activeClassroom?.nivel || user.nivel || "primaria";
                        const educationLevel = currentLevel === "secundaria" ? "secundaria" : "primaria";
                        
                        const response = await generateRubric({
                          criteria: aiTopic,
                          numCriteria: aiNumCriteria,
                          type: rubricType,
                          educationLevel: educationLevel
                        });

                        if (response && response.dimensions) {
                          const criteriaList = response.dimensions.map((d: any) => {
                            let niveles = [];
                            if (rubricType === "CHECKLIST") {
                              niveles = [
                                { nombre: "Logrado", puntos: 1, description: d.levels?.logrado || d.levels?.Logrado || "" },
                                { nombre: "No Logrado", puntos: 0, description: d.levels?.no_logrado || d.levels?.No_logrado || d.levels?.["no logrado"] || "" }
                              ];
                            } else if (educationLevel === "secundaria") {
                              niveles = [
                                { nombre: "Estratégico (E)", puntos: customScores.estrategico ?? 10, description: d.levels?.estrategico || d.levels?.Estratégico || "" },
                                { nombre: "Autónomo (A)", puntos: customScores.autonomo ?? 8, description: d.levels?.autonomo || d.levels?.Autónomo || "" },
                                { nombre: "Resolutivo (RE)", puntos: customScores.resolutivo ?? 6, description: d.levels?.resolutivo || d.levels?.Resolutivo || d.levels?.["resolutivo (re)"] || d.levels?.resolutivo_re || "" },
                                { nombre: "Receptivo (R)", puntos: customScores.receptivo ?? 4, description: d.levels?.receptivo || d.levels?.Receptivo || "" }
                              ];
                            } else {
                              niveles = [
                                { nombre: "Satisfactorio (S)", puntos: customScores.satisfactorio ?? 10, description: d.levels?.satisfactorio || d.levels?.Satisfactorio || "" },
                                { nombre: "Aceptable (A)", puntos: customScores.aceptable ?? 8, description: d.levels?.aceptable || d.levels?.Aceptable || "" },
                                { nombre: "Elemental (E)", puntos: customScores.elemental ?? 5, description: d.levels?.elemental || d.levels?.Elemental || "" }
                              ];
                            }
                            return {
                              nombre: d.aspect,
                              peso: 0,
                              niveles
                            };
                          });

                          setAiGeneratedRubricPreview({
                            title: response.title || aiTopic,
                            description: response.description || `Evaluación diseñada por IA sobre: ${aiTopic}`,
                            indicator: response.indicator || aiTopic,
                            criterios: criteriaList
                          });
                          toast.success("¡Rúbrica de evaluación generada con éxito!");
                        } else {
                          toast.error("El formato de respuesta de la IA no es válido.");
                        }
                      } catch (e: any) {
                        console.error("Error al generar la rúbrica con IA:", e);
                        toast.error("Ocurrió un error al generar con IA. Inténtalo de nuevo.");
                      } finally {
                        setAiIsGenerating(false);
                      }
                    }}
                    disabled={aiIsGenerating || !aiTopic.trim()}
                    className="flex-1 h-9 rounded-lg text-xs font-black bg-purple-650 hover:bg-purple-700 text-white border-none shadow-sm cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {aiIsGenerating ? (
                      <>Generando...</>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" /> Generar rúbrica
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col max-h-[80vh]">
                <div className="p-5 pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-500/10 dark:bg-purple-950/40 rounded-full flex items-center justify-center shrink-0">
                      <Sparkles className="h-4.5 w-4.5 fill-purple-500/20 text-purple-650 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-800 dark:text-white">
                        Diseñador de Rúbricas Inteligente
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Previsualiza y edita el instrumento antes de guardarlo en tu cuenta.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setIsAIGeneratorOpen(false); setAiGeneratedRubricPreview(null); }}
                    className="h-6 w-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                    title="Cerrar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 text-left">
                  <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-xs">
                    <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 border-b border-slate-200 dark:border-zinc-800 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500/10 dark:bg-amber-950/40 rounded-full flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4 fill-amber-500/20 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">{aiGeneratedRubricPreview.title}</h4>
                          <p className="text-[11px] text-slate-500 font-bold italic mt-0.5">{aiGeneratedRubricPreview.indicator}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto text-left">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        {rubricType === 'CHECKLIST' ? (
                          <>
                            <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 uppercase font-black text-[9px] text-slate-500 tracking-wider">
                              <tr>
                                <th className="p-2.5 border-r border-slate-200 dark:border-zinc-800 w-2/3 text-center">Indicador de Verificación</th>
                                <th className="p-2.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10 text-center">Criterio de Éxito</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                              {aiGeneratedRubricPreview.criterios.map((dim: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/20 transition-colors">
                                  <td className="p-2.5 font-bold bg-slate-50/30 dark:bg-zinc-900/10 border-r border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-350 text-xs align-middle text-center">{dim.nombre}</td>
                                  <td className="p-2.5 text-slate-650 dark:text-slate-400 leading-relaxed text-xs align-top">
                                    <div className="flex items-center gap-2 font-medium">
                                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                      {dim.niveles?.[0]?.description || 'Presencia del indicador'}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </>
                        ) : (
                          <>
                            <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 uppercase font-black text-[9px] text-slate-500 tracking-wider">
                              <tr>
                                <th className="p-2.5 border-r border-slate-200 dark:border-zinc-800 w-1/4 text-center">Aspecto</th>
                                {activeClassroom.nivel === 'secundaria' ? (
                                  <>
                                    <th className="p-2.5 border-r border-slate-200 dark:border-zinc-800 text-rose-700 dark:text-rose-400 bg-rose-50/20 dark:bg-rose-950/10 text-center">Receptivo (R)</th>
                                    <th className="p-2.5 border-r border-slate-200 dark:border-zinc-800 text-orange-700 dark:text-orange-400 bg-orange-50/20 dark:bg-orange-950/10 text-center">Resolutivo (RE)</th>
                                    <th className="p-2.5 border-r border-slate-200 dark:border-zinc-800 text-amber-700 dark:text-amber-400 bg-amber-50/20 dark:bg-amber-950/10 text-center">Autónomo (A)</th>
                                    <th className="p-2.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10 text-center">Estratégico (E)</th>
                                  </>
                                ) : (
                                  <>
                                    <th className="p-2.5 border-r border-slate-200 dark:border-zinc-800 text-rose-700 dark:text-rose-400 bg-rose-50/20 dark:bg-rose-950/10 text-center">Elemental (E)</th>
                                    <th className="p-2.5 border-r border-slate-200 dark:border-zinc-800 text-amber-700 dark:text-amber-400 bg-amber-50/20 dark:bg-amber-950/10 text-center">Aceptable (A)</th>
                                    <th className="p-2.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10 text-center">Satisfactorio (S)</th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                              {aiGeneratedRubricPreview.criterios.map((dim: any, idx: number) => {
                                const isSecundaria = activeClassroom.nivel === 'secundaria';
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/20 transition-colors">
                                    <td className="p-2.5 font-bold bg-slate-50/30 dark:bg-zinc-900/10 border-r border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-350 text-xs align-middle text-center">{dim.nombre}</td>
                                    {isSecundaria ? (
                                      <>
                                        <td className="p-2.5 border-r border-slate-200 dark:border-zinc-800 text-slate-650 dark:text-slate-400 font-medium leading-relaxed text-xs align-top">{dim.niveles?.[3]?.description || ""}</td>
                                        <td className="p-2.5 border-r border-slate-200 dark:border-zinc-800 text-slate-650 dark:text-slate-400 font-medium leading-relaxed text-xs align-top">{dim.niveles?.[2]?.description || ""}</td>
                                        <td className="p-2.5 border-r border-slate-200 dark:border-zinc-800 text-slate-650 dark:text-slate-400 font-medium leading-relaxed text-xs align-top">{dim.niveles?.[1]?.description || ""}</td>
                                        <td className="p-2.5 text-slate-650 dark:text-slate-400 font-medium leading-relaxed text-xs align-top">{dim.niveles?.[0]?.description || ""}</td>
                                      </>
                                    ) : (
                                      <>
                                        <td className="p-2.5 border-r border-slate-200 dark:border-zinc-800 text-slate-655 dark:text-slate-400 font-medium leading-relaxed text-xs align-top">{dim.niveles?.[2]?.description || ""}</td>
                                        <td className="p-2.5 border-r border-slate-200 dark:border-zinc-800 text-slate-655 dark:text-slate-400 font-medium leading-relaxed text-xs align-top">{dim.niveles?.[1]?.description || ""}</td>
                                        <td className="p-2.5 text-slate-655 dark:text-slate-400 font-medium leading-relaxed text-xs align-top">{dim.niveles?.[0]?.description || ""}</td>
                                      </>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </>
                        )}
                      </table>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAiGeneratedRubricPreview(null)}
                    className="h-9 px-4 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300 active:scale-95 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Volver atrás
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAIPublishedRubric}
                    className="h-9 px-5 rounded-lg text-xs font-black bg-purple-650 hover:bg-purple-700 text-white border-none shadow-sm cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    <Save className="h-3.5 w-3.5" /> Guardar Rúbrica
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: INDICATORS (ACHIEVEMENT INDICATORS) */}
      {/* ------------------------------------------------------------- */}
      {isIndicatorsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" onClick={() => setIsIndicatorsModalOpen(false)}>
          <div className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl relative space-y-4 cursor-default animate-in zoom-in-95 duration-200 mx-4 text-slate-900 dark:text-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Indicadores de Logro</h3>
              </div>
              <button onClick={() => setIsIndicatorsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-450 leading-relaxed text-left font-bold">
              Asocia los indicadores de logro curriculares que se evalúan con esta rúbrica.
            </p>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 text-left">
              {indicators.map((ind, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    value={ind}
                    onChange={(e) => {
                      const updated = [...indicators];
                      updated[idx] = e.target.value;
                      setIndicators(updated);
                    }}
                    placeholder="Ej: Escribe cuentos cortos utilizando adverbios y adjetivos..."
                    className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-xs"
                  />
                  <button
                    onClick={() => {
                      setIndicators(indicators.filter((_, i) => i !== idx));
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button 
                onClick={() => setIndicators([...indicators, ""])}
                className="flex-1 h-9 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300"
              >
                <Plus className="h-4 w-4" /> Añadir Otro
              </button>
              <button 
                onClick={() => setIsIndicatorsModalOpen(false)}
                className="flex-1 h-9 rounded-lg text-xs font-black bg-purple-650 hover:bg-purple-700 text-white border-none shadow-sm cursor-pointer flex items-center justify-center gap-1"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: COMPETENCIES (SPECIFIC COMPETENCIES) */}
      {/* ------------------------------------------------------------- */}
      {isCompetenciesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" onClick={() => setIsCompetenciesModalOpen(false)}>
          <div className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl relative space-y-4 cursor-default animate-in zoom-in-95 duration-200 mx-4 text-slate-900 dark:text-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Competencias Específicas</h3>
              </div>
              <button onClick={() => setIsCompetenciesModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-450 leading-relaxed text-left font-bold">
              Asocia las competencias específicas del currículo que se evalúan con esta rúbrica.
            </p>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 text-left">
              {competencies.map((comp, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    value={comp}
                    onChange={(e) => {
                      const updated = [...competencies];
                      updated[idx] = e.target.value;
                      setCompetencies(updated);
                    }}
                    placeholder="Ej: Produce textos de diversos géneros con coherencia y claridad..."
                    className="w-full h-10 px-3.5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-lg text-sm text-[#1B1B1B] dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-xs"
                  />
                  <button
                    onClick={() => {
                      setCompetencies(competencies.filter((_, i) => i !== idx));
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button 
                onClick={() => setCompetencies([...competencies, ""])}
                className="flex-1 h-9 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300"
              >
                <Plus className="h-4 w-4" /> Añadir Otra
              </button>
              <button 
                onClick={() => setIsCompetenciesModalOpen(false)}
                className="flex-1 h-9 rounded-lg text-xs font-black bg-purple-650 hover:bg-purple-700 text-white border-none shadow-sm cursor-pointer flex items-center justify-center gap-1"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {isScoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" onClick={() => setIsScoreModalOpen(false)}>
          <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl relative space-y-4 cursor-default animate-in zoom-in-95 duration-200 mx-4 text-slate-900 dark:text-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-rose-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Puntuación de los Niveles</h3>
              </div>
              <button onClick={() => setIsScoreModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-450 leading-relaxed text-left font-bold">
              Define el valor numérico en puntos de los niveles cualitativos del Ministerio de Educación o del instrumento de evaluación.
            </p>

            <div className="space-y-3 pt-1 text-left">
              {activeRubric?.tipo === "CHECKLIST" ? (
                <>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-black text-emerald-800 dark:text-emerald-300 text-xs">Logrado</div>
                      <div className="text-[9.5px] text-emerald-600 dark:text-emerald-450 font-bold">Criterio verificado y cumplido</div>
                    </div>
                    <input
                      type="number"
                      value={tempScores.logrado ?? 1}
                      onChange={(e) => setTempScores({ ...tempScores, logrado: Number(e.target.value) })}
                      className="w-16 h-8 text-xs font-black text-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-black text-rose-800 dark:text-rose-300 text-xs">No Logrado</div>
                      <div className="text-[9.5px] text-rose-600 dark:text-rose-455 font-bold">Criterio no verificado</div>
                    </div>
                    <input
                      type="number"
                      value={tempScores.noLogrado ?? 0}
                      onChange={(e) => setTempScores({ ...tempScores, noLogrado: Number(e.target.value) })}
                      className="w-16 h-8 text-xs font-black text-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </>
              ) : activeClassroom.nivel === "secundaria" ? (
                <>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-black text-emerald-800 dark:text-emerald-300 text-xs">Estratégico (E)</div>
                      <div className="text-[9.5px] text-emerald-600 dark:text-emerald-450 font-bold">Desempeño máximo</div>
                    </div>
                    <input
                      type="number"
                      value={tempScores.estrategico}
                      onChange={(e) => setTempScores({ ...tempScores, estrategico: Number(e.target.value) })}
                      className="w-16 h-8 text-xs font-black text-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-black text-blue-800 dark:text-blue-300 text-xs">Autónomo (A)</div>
                      <div className="text-[9.5px] text-blue-600 dark:text-blue-455 font-bold">Desempeño independiente</div>
                    </div>
                    <input
                      type="number"
                      value={tempScores.autonomo}
                      onChange={(e) => setTempScores({ ...tempScores, autonomo: Number(e.target.value) })}
                      className="w-16 h-8 text-xs font-black text-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-black text-amber-800 dark:text-amber-300 text-xs">Resolutivo (RE)</div>
                      <div className="text-[9.5px] text-amber-600 dark:text-amber-455 font-bold">Desempeño básico</div>
                    </div>
                    <input
                      type="number"
                      value={tempScores.resolutivo}
                      onChange={(e) => setTempScores({ ...tempScores, resolutivo: Number(e.target.value) })}
                      className="w-16 h-8 text-xs font-black text-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-black text-rose-800 dark:text-rose-300 text-xs">Receptivo (R)</div>
                      <div className="text-[9.5px] text-rose-600 dark:text-rose-455 font-bold">Desempeño inicial</div>
                    </div>
                    <input
                      type="number"
                      value={tempScores.receptivo}
                      onChange={(e) => setTempScores({ ...tempScores, receptivo: Number(e.target.value) })}
                      className="w-16 h-8 text-xs font-black text-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-black text-emerald-800 dark:text-emerald-300 text-xs">Satisfactorio (S)</div>
                      <div className="text-[9.5px] text-emerald-600 dark:text-emerald-450 font-bold">Desempeño máximo</div>
                    </div>
                    <input
                      type="number"
                      value={tempScores.satisfactorio}
                      onChange={(e) => setTempScores({ ...tempScores, satisfactorio: Number(e.target.value) })}
                      className="w-16 h-8 text-xs font-black text-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-black text-amber-800 dark:text-amber-300 text-xs">Aceptable (A)</div>
                      <div className="text-[9.5px] text-amber-600 dark:text-amber-455 font-bold">Desempeño básico</div>
                    </div>
                    <input
                      type="number"
                      value={tempScores.aceptable}
                      onChange={(e) => setTempScores({ ...tempScores, aceptable: Number(e.target.value) })}
                      className="w-16 h-8 text-xs font-black text-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-black text-rose-800 dark:text-rose-300 text-xs">Elemental (E)</div>
                      <div className="text-[9.5px] text-rose-600 dark:text-rose-455 font-bold">Desempeño inicial</div>
                    </div>
                    <input
                      type="number"
                      value={tempScores.elemental}
                      onChange={(e) => setTempScores({ ...tempScores, elemental: Number(e.target.value) })}
                      className="w-16 h-8 text-xs font-black text-center bg-white dark:bg-slate-950 rounded-lg border border-slate-200 focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsScoreModalOpen(false)}
                className="flex-1 h-9 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setCustomScores(tempScores);
                  localStorage.setItem("planix_custom_rubric_scores", JSON.stringify(tempScores));
                  toast.success("¡Puntuación de niveles guardada correctamente!");
                  setIsScoreModalOpen(false);
                }}
                className="flex-1 h-9 rounded-lg text-xs font-black bg-purple-650 hover:bg-purple-700 text-white border-none shadow-sm cursor-pointer flex items-center justify-center gap-1"
              >
                <Save className="h-3.5 w-3.5" /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT LAYOUT AREA */}
      {activeRubric && (
        <PrintableView
          rubric={{
            ...activeRubric,
            criterios: adaptedCriterios
          }}
          classroomName={activeClassroom.nombre}
          studentName={(() => {
            const s = students.find(std => std.id === evalStudentId);
            return s ? `${s.nombre} ${s.apellido || ""}` : "";
          })()}
          evaluation={evalSelections}
          indicators={indicators}
          competencies={competencies}
        />
      )}
      
      {/* ------------------------------------------------------------- */}
      {/* MODAL: TEXT EDITOR FOR CRITERIA DESCRIPTION */}
      {/* ------------------------------------------------------------- */}
      {editingTextInfo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setEditingTextInfo(null)}
        >
          <div 
            className="w-full max-w-xl p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200 mx-4 text-slate-900 dark:text-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="px-5 py-3 border-b border-slate-105 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">
                  {editingTextInfo.title}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                  Editor de descripciones cualitativas
                </p>
              </div>
              <button 
                onClick={() => setEditingTextInfo(null)}
                className="h-6 w-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                title="Cerrar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="p-4">
              <textarea
                value={editingTextInfo.value}
                onChange={(e) => setEditingTextInfo({ ...editingTextInfo, value: e.target.value })}
                className="w-full h-40 p-3 border border-slate-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-xs leading-relaxed bg-slate-50/50 dark:bg-zinc-950/20 text-slate-800 dark:text-zinc-100 placeholder:text-neutral-400 resize-none outline-none font-medium"
                placeholder="Escribe la descripción cualitativa del nivel..."
                autoFocus
              />
            </div>

            {/* Pie de página */}
            <div className="px-5 pb-5 pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingTextInfo(null)}
                className="h-9 px-4 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveModalText(editingTextInfo.value)}
                className="h-9 px-5 rounded-lg text-xs font-black bg-purple-650 hover:bg-purple-700 text-white border-none shadow-sm cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Save className="h-3.5 w-3.5" /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

      <ModalCreditos
        isOpen={showCreditsExhausted}
        onClose={() => setShowCreditsExhausted(false)}
        requiredCredits={creditsExhaustedInfo.required}
        currentCredits={creditsExhaustedInfo.current}
        actionName="generar esta rúbrica con IA"
      />
    </>
  );
}
